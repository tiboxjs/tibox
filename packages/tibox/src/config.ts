import fs from 'node:fs'
import path from 'node:path'
import fsp from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { createRequire } from 'node:module'
import { build } from 'esbuild'
// import dotenv from 'dotenv'
// import { expand } from 'dotenv-expand'
import { loadJsonFile } from 'load-json-file'
import * as _ from 'lodash-es'
import git from 'git-rev-sync'
import type { Alias, AliasOptions } from '../types/alias'
import type { ResolvedBuildOptions } from './build';
import { resolveBuildOptions } from './build'
import {
  isFilePathESM,
  isNodeBuiltin,
  isNodeLikeBuiltin,
  // createDebugger,
  // isExternalUrl,
  isObject,
  nodeLikeBuiltins,
  // lookupFile,
  normalizePath,
} from './utils'
import type { DevOptions } from './dev'
import  { type UploadOptions, resolveUploadOptions } from './upload';
import { parseDestFolderName, parseProjectName } from './libs/tools'
import {
  // type EnvironmentResolveOptions,
  // type InternalResolveOptions,
  // type ResolveOptions,
  tryNodeResolve,
} from './plugins/resolve'
import  { type LogLevel, createLogger } from './logger';
import { findNearestNodeModules } from './packages'
import { loadEnv } from './env'
const promisifiedRealpath = promisify(fs.realpath)

// import { CLIENT_DIR, DEFAULT_ASSETS_RE } from './constants'
export interface ConfigEnv {
  command: 'build' | 'dev' | 'upload'
  product: string
  mode: string
}

/**
 * spa: include SPA fallback middleware and configure sirv with `single: true` in preview
 *
 * mpa: only include non-SPA HTML middlewares
 *
 * custom: don't include HTML middlewares
 */
export type AppType = 'spa' | 'mpa' | 'custom'

export type UserConfigFnObject = (env: ConfigEnv) => UserConfig
export type UserConfigFnPromise = (env: ConfigEnv) => Promise<UserConfig>
export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>

export type UserConfigExport =
  | UserConfig
  | Promise<UserConfig>
  | UserConfigFnObject
  | UserConfigFnPromise
  | UserConfigFn

/**
 * Type helper to make it easier to use vite.config.ts
 * accepts a direct {@link UserConfig} object, or a function that returns it.
 * The function receives a {@link ConfigEnv} object.
 */
export function defineConfig(config: UserConfig): UserConfig
export function defineConfig(config: Promise<UserConfig>): Promise<UserConfig>
export function defineConfig(config: UserConfigFnObject): UserConfigFnObject
export function defineConfig(config: UserConfigFnPromise): UserConfigFnPromise
export function defineConfig(config: UserConfigFn): UserConfigFn
export function defineConfig(config: UserConfigExport): UserConfigExport
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}

/**
 * 插件
 */
export interface TiBoxPlugin {
  name: string
  transform: (code: string) => string | Promise<string>
}

export interface UserConfig {
  /**
   * Project root directory. Can be an absolute path, or a path relative from
   * the location of the config file itself.
   * @default process.cwd()
   */
  root?: string
  project?: string
  product?: string
  mode?: string
  // sourceDir?: string;
  // destDir?: string;
  appid?: string
  projectName?: (project: string, product: string, mode: string) => string
  ext?: Record<string, any>
  /**
   * Server specific options, e.g. host, port, https...
   */
  dev?: DevOptions

  /**
   * Build specific options
   */
  build?: any

  /**
   * upload specific options
   */
  upload?: UploadOptions

  /**
   * Environment files directory. Can be an absolute path, or a path relative from
   * the location of the config file itself.
   * @default root
   */
  envDir?: string

  /**
   * Log level.
   * Default: 'info'
   */
  logLevel?: LogLevel

  plugins?: TiBoxPlugin[]

  /// 环境变量的前缀，默认是"TIBOX_"
  envPrefix?: string | string[]
}

export interface InlineConfig extends UserConfig {
  configFile?: string | false
  envFile?: false
}

export type handleDistResult = {
  fileContent: Uint8Array | null
  dist: string
}

export type gulpHandletype = {
  regExp: RegExp
  fn: (srcPath: string, distRootPath: string, opts?: Record<string, unknown>) => handleDistResult[] | handleDistResult
}

/**
 * 解析完成后的配置
 */
export type ResolvedConfig = Readonly<
  Omit<UserConfig, 'plugins' | 'alias' | 'dedupe' | 'assetsInclude' | 'optimizeDeps'> & {
    configFile: string | undefined
    // configFileDependencies: string[];
    inlineConfig: InlineConfig
    root: string
    // base: string;
    // publicDir: string
    command: 'build' | 'dev' | 'upload'
    dependencies: Record<string, string>
    isDependencies: (name: string) => boolean
    project: string
    product: string
    appid: string
    version: string
    commitId: string
    /**
     * 最终的项目名称
     */
    determinedProjectName: string
    /**
     * 最终的dispatch目录
     */
    determinedDestDir: string
    /**
     * development、staging、production或其他的
     */
    mode: string
    isProduction: boolean
    env: Record<string, any>
    // resolve: ResolveOptions & {
    //   alias: Alias[]
    // }
    plugins: readonly TiBoxPlugin[]
    // dev: ResolvedDevOptions;
    build: ResolvedBuildOptions
    replacer?: (key: string) => string
    // assetsInclude: (file: string) => boolean
    // logger: Logger
    // createResolver: (options?: Partial<InternalResolveOptions>) => ResolveFn
    // optimizeDeps: Omit<DepOptimizationOptions, 'keepNames'>
  }
>

type PackageJson = {
  version: string
  dependencies: Record<string, string>
}

/**
 * 解析用户项目中 tibox.config.[m]js 文件
 * @param inlineConfig 命令行中传递的配置
 * @param command 子命令
 * @param defaultProduct 默认 Product
 * @param defaultMode 默认 Mode
 * @returns 
 */
export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'dev' | 'upload',
  defaultProduct = 'default',
  defaultMode = 'development'
): Promise<ResolvedConfig> {
  let config = inlineConfig
  // let configFileDependencies: string[] = [];
  const product = inlineConfig.product || defaultProduct
  let mode = inlineConfig.mode || defaultMode

  // some dependencies e.g. @vue/compiler-* relies on NODE_ENV for getting
  // production-specific behavior, so set it here even though we haven't
  // resolve the final mode yet
  if (mode === 'production') {
    process.env.NODE_ENV = 'production'
  }

  const configEnv: ConfigEnv = {
    product,
    mode,
    command,
  }

  let { configFile } = config
  if (configFile !== false) {
    try {
      const loadResult = await loadConfigFromFile(
        configEnv,
        configFile,
        config.root
        // config.logLevel
      )
      if (loadResult) {
        config = mergeConfig(loadResult.config, config)
        configFile = loadResult.path
        // configFileDependencies = loadResult.dependencies;
      }
    } catch (error: any) {
      if (/Cannot find module/.test(error.message)) {
        throw new Error("Config file can't be found!")
      }
    }
  }

  // user config may provide an alternative mode
  mode = config.mode || mode

  // resolve root
  const resolvedRoot = normalizePath(config.root ? path.resolve(config.root) : process.cwd())

  // load .env files
  const envDir = config.envDir ? normalizePath(path.resolve(resolvedRoot, config.envDir)) : resolvedRoot
  const userEnv = inlineConfig.envFile !== false && loadEnv(product, mode, envDir)

  // Note it is possible for user to have a custom mode, e.g. `staging` where
  // production-like behavior is expected. This is indicated by NODE_ENV=production
  // loaded from `.staging.env` and set by us as VITE_USER_NODE_ENV
  const isProduction = (process.env.VITE_USER_NODE_ENV || mode) === 'production'
  if (isProduction) {
    // in case default mode was not production and is overwritten
    process.env.NODE_ENV = 'production'
  }

  const resolvedBuildOptions = resolveBuildOptions(config.build)

  const finalParseProjectName: UserConfig['projectName'] = config.projectName || parseProjectName

  // 格式通常为 agility-default-development
  const determinedProjectName = finalParseProjectName(
    config.project || 'project',
    config.product || defaultProduct,
    config.mode || defaultMode
  )

  // 格式通常为 dist-agility-default-development
  const determinedDestDir: string = parseDestFolderName(
    config.project || 'project',
    config.product || defaultProduct,
    config.mode || defaultMode
  )

  const packageJson = (await loadJsonFile('./package.json')) as PackageJson

  const resolvedUploadOptions = resolveUploadOptions(config.upload)

  const resolved: ResolvedConfig = {
    ...config,
    configFile: configFile ? normalizePath(configFile) : undefined,
    // configFileDependencies,
    inlineConfig,
    root: resolvedRoot,
    // base: BASE_URL,
    // resolve: resolveOptions,
    // publicDir: resolvedPublicDir,
    // cacheDir,
    command,
    /**
     * 小程序项目中的依赖
     */
    dependencies: packageJson.dependencies,
    isDependencies: name => {
      return (
        /^weui-miniprogram/.test(name) ||
        _.some(packageJson.dependencies, (_: any, key: string) => key === name.replace(/\\/, '/'))
      )
    },
    project: config.project || 'project',
    product: config.product || 'default',
    mode,
    version: packageJson.version,
    commitId: (() => {
      try {
        return git.short()
      } catch (_: any) {
        // git 没有初始化，用户可能没有创建 git 仓库，属于正常现象
        return '-'
      }
    })(),
    appid: config.appid || '',
    determinedProjectName,
    determinedDestDir,
    isProduction,
    // plugins: userPlugins,
    // server: resolveServerOptions(resolvedRoot, config.server),
    build: resolvedBuildOptions,
    upload: resolvedUploadOptions,
    env: {
      ...userEnv,
      // BASE_URL,
      MODE: mode,
      DEV: !isProduction,
      PROD: isProduction,
    },
    plugins: config.plugins || [],
    // assetsInclude(file: string) {
    //   return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file);
    // },
    // logger,
    // createResolver,
    // optimizeDeps: {
    //   ...config.optimizeDeps,
    //   esbuildOptions: {
    //     keepNames: config.optimizeDeps?.keepNames,
    //     ...config.optimizeDeps?.esbuildOptions,
    //   },
    // },
    replacer: key => {
      // TODO: 暂时先放这，不知道应该放哪
      const replaceStr: Record<string, string> = {
        PRODUCT_NAME: config.product || 'default',
        IS_RELEASE: (mode === 'production').toString(),
        VERSION: packageJson.version,
      }
      console.log(`replacer: ${key}: ${replaceStr[key]}`)
      return replaceStr[key]
    },
  }

  // (resolved.plugins as Plugin[]) = await resolvePlugins(
  //   resolved,
  //   prePlugins,
  //   normalPlugins,
  //   postPlugins
  // );

  // // call configResolved hooks
  // await Promise.all(userPlugins.map((p) => p.configResolved?.(resolved)));

  // if (process.env.DEBUG) {
  //   debug(`using resolved config: %O`, {
  //     ...resolved,
  //     plugins: resolved.plugins.map((p) => p.name),
  //   });
  // }

  // const logDeprecationWarning = (
  //   deprecatedOption: string,
  //   hint: string,
  //   error?: Error
  // ) => {
  //   logger.warn(
  //     colors.yellow.bold(
  //       `(!) "${deprecatedOption}" option is deprecated. ${hint}${
  //         error ? `\n${error.stack}` : ""
  //       }`
  //     )
  //   );
  // };

  // if (config.build?.base) {
  //   logDeprecationWarning(
  //     "build.base",
  //     '"base" is now a root-level config option.'
  //   );
  //   config.base = config.build.base;
  // }
  // Object.defineProperty(resolvedBuildOptions, "base", {
  //   enumerable: false,
  //   get() {
  //     logDeprecationWarning(
  //       "build.base",
  //       '"base" is now a root-level config option.',
  //       new Error()
  //     );
  //     return resolved.base;
  //   },
  // });

  // if (config.alias) {
  //   logDeprecationWarning("alias", 'Use "resolve.alias" instead.');
  // }
  // Object.defineProperty(resolved, "alias", {
  //   enumerable: false,
  //   get() {
  //     logDeprecationWarning(
  //       "alias",
  //       'Use "resolve.alias" instead.',
  //       new Error()
  //     );
  //     return resolved.resolve.alias;
  //   },
  // });

  // if (config.dedupe) {
  //   logDeprecationWarning("dedupe", 'Use "resolve.dedupe" instead.');
  // }
  // Object.defineProperty(resolved, "dedupe", {
  //   enumerable: false,
  //   get() {
  //     logDeprecationWarning(
  //       "dedupe",
  //       'Use "resolve.dedupe" instead.',
  //       new Error()
  //     );
  //     return resolved.resolve.dedupe;
  //   },
  // });

  // if (config.optimizeDeps?.keepNames) {
  //   logDeprecationWarning(
  //     "optimizeDeps.keepNames",
  //     'Use "optimizeDeps.esbuildOptions.keepNames" instead.'
  //   );
  // }
  // Object.defineProperty(resolved.optimizeDeps, "keepNames", {
  //   enumerable: false,
  //   get() {
  //     logDeprecationWarning(
  //       "optimizeDeps.keepNames",
  //       'Use "optimizeDeps.esbuildOptions.keepNames" instead.',
  //       new Error()
  //     );
  //     return resolved.optimizeDeps.esbuildOptions?.keepNames;
  //   },
  // });

  return resolved
}

function mergeConfigRecursively(a: Record<string, any>, b: Record<string, any>, rootPath: string) {
  const merged: Record<string, any> = { ...a }
  for (const key in b) {
    const value = b[key]
    if (value == null) {
      continue
    }

    const existing = merged[key]
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value]
      continue
    }
    if (isObject(existing) && isObject(value)) {
      merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key)
      continue
    }

    // fields that require special handling
    if (existing != null) {
      if (key === 'alias' && (rootPath === 'resolve' || rootPath === '')) {
        merged[key] = mergeAlias(existing, value)
        continue
      } else if (key === 'assetsInclude' && rootPath === '') {
        merged[key] = [].concat(existing, value)
        continue
      }
    }

    merged[key] = value
  }
  return merged
}

export function mergeConfig(a: Record<string, any>, b: Record<string, any>, isRoot = true): Record<string, any> {
  return mergeConfigRecursively(a, b, isRoot ? '' : '.')
}

function mergeAlias(a: AliasOptions = [], b: AliasOptions = []): Alias[] {
  return [...normalizeAlias(a), ...normalizeAlias(b)]
}

function normalizeAlias(o: AliasOptions): Alias[] {
  return Array.isArray(o)
    ? o.map(normalizeSingleAlias)
    : Object.keys(o).map(find =>
        normalizeSingleAlias({
          find,
          replacement: (o as any)[find],
        })
      )
}

// https://github.com/vitejs/vite/issues/1363
// work around https://github.com/rollup/plugins/issues/759
function normalizeSingleAlias({ find, replacement }: Alias): Alias {
  if (typeof find === 'string' && find.endsWith('/') && replacement.endsWith('/')) {
    find = find.slice(0, find.length - 1)
    replacement = replacement.slice(0, replacement.length - 1)
  }
  return { find, replacement }
}

// export function sortUserPlugins(
//   plugins: (Plugin | Plugin[])[] | undefined
// ): [Plugin[], Plugin[], Plugin[]] {
//   const prePlugins: Plugin[] = [];
//   const postPlugins: Plugin[] = [];
//   const normalPlugins: Plugin[] = [];

//   if (plugins) {
//     plugins.flat().forEach((p) => {
//       if (p.enforce === "pre") prePlugins.push(p);
//       else if (p.enforce === "post") postPlugins.push(p);
//       else normalPlugins.push(p);
//     });
//   }

//   return [prePlugins, normalPlugins, postPlugins];
// }

/**
 * 从 tibox.config.[m]js 文件加载配置内容
 * @param configFile 配置文件文件名
 * @param configRoot 配置文件所在路径
 * @returns 
 */
export async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  // logLevel?: LogLevel,
  // customLogger?: Logger,
  // configLoader: 'bundle' | 'runner' | 'native' = 'bundle'
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null> {
  // const start = Date.now();

  let resolvedPath: string | undefined
  // const dependencies: string[] = []

  if (configFile) {
    // explicit config path is always resolved from cwd
    resolvedPath = path.resolve(configFile)
  } else {
    // implicit config file loaded from inline root (if present)
    // otherwise from cwd
    const jsconfigFile = path.resolve(configRoot, 'tibox.config.js')
    if (fs.existsSync(jsconfigFile)) {
      resolvedPath = jsconfigFile
    }
  }

  if (!resolvedPath) {
    createLogger().warn(`"no config file found."`)
    // debug("no config file found.");
    return null
  }

  // try {
  // const resolver =
  //   configLoader === 'bundle'
  //     ? bundleAndLoadConfigFile
  //     : configLoader === 'runner'
  //       ? runnerImportConfigFile
  //       : nativeImportConfigFile

  const resolver = bundleAndLoadConfigFile

  const { configExport, dependencies } = await resolver(resolvedPath)
  // debug?.(`config file loaded in ${getTime()}`)

  const config = await (typeof configExport === 'function'
    ? configExport(configEnv)
    : configExport)
    
  if (!isObject(config)) {
    throw new Error(`config must export or return an object.`)
  }

  return {
    path: normalizePath(resolvedPath),
    config,
    dependencies,
  }
  // } catch (e) {
  //   const logger = createLogger(logLevel /* , { customLogger } */)
  //   // checkBadCharactersInPath('The config path', resolvedPath, logger)
  //   // logger.error(colors.red(`failed to load config from ${resolvedPath}`), {
  //   //   error: e,
  //   // })
  //   throw e
  // }
}

/**
 * 配置文件打捆并加载
 * @param resolvedPath 
 * @returns 
 */
async function bundleAndLoadConfigFile(resolvedPath: string) {
  const isESM =
    typeof process.versions.deno === 'string' || isFilePathESM(resolvedPath)

  const bundled = await bundleConfigFile(resolvedPath, isESM )
  const userConfig = await loadConfigFromBundledFile(
    resolvedPath,
    bundled.code,
    isESM,
  )
  return {
    configExport: userConfig,
    dependencies: bundled.dependencies,
  }
}

/**
 * 打捆配置文件，将其依赖一起解析
 * @param fileName
 * @param mjs
 * @returns
 */

async function bundleConfigFile(
  fileName: string,
  isESM: boolean,
): Promise<{ code: string; dependencies: string[] }> {
  // const isModuleSyncConditionEnabled = (await import('#module-sync-enabled'))
  //   .default

  const dirnameVarName = '__vite_injected_original_dirname'
  const filenameVarName = '__vite_injected_original_filename'
  const importMetaUrlVarName = '__vite_injected_original_import_meta_url'
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    write: false,
    target: [`node${process.versions.node}`],
    platform: 'node',
    bundle: true,
    format: isESM ? 'esm' : 'cjs',
    mainFields: ['main'],
    sourcemap: 'inline',
    // the last slash is needed to make the path correct
    sourceRoot: path.dirname(fileName) + path.sep,
    metafile: true,
    define: {
      __dirname: dirnameVarName,
      __filename: filenameVarName,
      'import.meta.url': importMetaUrlVarName,
      'import.meta.dirname': dirnameVarName,
      'import.meta.filename': filenameVarName,
    },
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          const packageCache = new Map()
          const resolveByViteResolver = (
            id: string,
            importer: string,
            isRequire: boolean,
          ) => {
            return tryNodeResolve(id, importer, {
              root: path.dirname(fileName),
              isBuild: true,
              isProduction: true,
              preferRelative: false,
              tryIndex: true,
              mainFields: [],
              conditions: [
                'node',
                // ...(isModuleSyncConditionEnabled ? ['module-sync'] : []),
              ],
              externalConditions: [],
              external: [],
              noExternal: [],
              dedupe: [],
              // extensions: configDefaults.resolve.extensions,
              extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
              preserveSymlinks: false,
              packageCache,
              isRequire,
              builtins: nodeLikeBuiltins,
            })?.id
          }

          // externalize bare imports
          build.onResolve(
            { filter: /^[^.#].*/ },
            async ({ path: id, importer, kind }) => {
              if (
                kind === 'entry-point' ||
                path.isAbsolute(id) ||
                isNodeBuiltin(id)
              ) {
                return
              }

              // With the `isNodeBuiltin` check above, this check captures if the builtin is a
              // non-node built-in, which esbuild doesn't know how to handle. In that case, we
              // externalize it so the non-node runtime handles it instead.
              if (isNodeLikeBuiltin(id)) {
                return { external: true }
              }

              const isImport = isESM || kind === 'dynamic-import'
              let idFsPath: string | undefined
              try {
                idFsPath = resolveByViteResolver(id, importer, !isImport)
              } catch (e) {
                if (!isImport) {
                  let canResolveWithImport = false
                  try {
                    canResolveWithImport = !!resolveByViteResolver(
                      id,
                      importer,
                      false,
                    )
                  } catch {}
                  if (canResolveWithImport) {
                    throw new Error(
                      `Failed to resolve ${JSON.stringify(
                        id,
                      )}. This package is ESM only but it was tried to load by \`require\`. See https://vite.dev/guide/troubleshooting.html#this-package-is-esm-only for more details.`,
                    )
                  }
                }
                throw e
              }
              if (idFsPath && isImport) {
                idFsPath = pathToFileURL(idFsPath).href
              }
              return {
                path: idFsPath,
                external: true,
              }
            },
          )
        },
      },
      {
        name: 'inject-file-scope-variables',
        setup(build) {
          build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args) => {
            const contents = await fsp.readFile(args.path, 'utf-8')
            const injectValues =
              `const ${dirnameVarName} = ${JSON.stringify(
                path.dirname(args.path),
              )};` +
              `const ${filenameVarName} = ${JSON.stringify(args.path)};` +
              `const ${importMetaUrlVarName} = ${JSON.stringify(
                pathToFileURL(args.path).href,
              )};`

            return {
              loader: args.path.endsWith('ts') ? 'ts' : 'js',
              contents: injectValues + contents,
            }
          })
        },
      },
    ],
  })
  const { text } = result.outputFiles[0]
  return {
    code: text,
    dependencies: Object.keys(result.metafile.inputs),
  }
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

async function loadConfigFromBundledFile(fileName: string, bundledCode: string, isESM: boolean,): Promise<UserConfigExport> {
  if (isESM) {
    // Storing the bundled file in node_modules/ is avoided for Deno
    // because Deno only supports Node.js style modules under node_modules/
    // and configs with `npm:` import statements will fail when executed.
    let nodeModulesDir =
      typeof process.versions.deno === 'string'
        ? undefined
        : findNearestNodeModules(path.dirname(fileName))
    if (nodeModulesDir) {
      try {
        await fsp.mkdir(path.resolve(nodeModulesDir, '.tibox-temp/'), {
          recursive: true,
        })
      } catch (e) {
        if (e.code === 'EACCES') {
          // If there is no access permission, a temporary configuration file is created by default.
          nodeModulesDir = undefined
        } else {
          throw e
        }
      }
    }
    const hash = `timestamp-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const tempFileName = nodeModulesDir
      ? path.resolve(
          nodeModulesDir,
          `.tibox-temp/${path.basename(fileName)}.${hash}.mjs`,
        )
      : `${fileName}.${hash}.mjs`
    await fsp.writeFile(tempFileName, bundledCode)
    try {
      return (await import(pathToFileURL(tempFileName).href)).default
    } finally {
      fs.unlink(tempFileName, () => {}) // Ignore errors
    }
  } else {
    const _require = createRequire(fileName)
    const extension = path.extname(fileName)
    // We don't use fsp.realpath() here because it has the same behaviour as
    // fs.realpath.native. On some Windows systems, it returns uppercase volume
    // letters (e.g. "C:\") while the Node.js loader uses lowercase volume letters.
    // See https://github.com/vitejs/vite/issues/12923
    const realFileName = await promisifiedRealpath(fileName)
    const loaderExt = extension in _require.extensions ? extension : '.js'
    const defaultLoader = _require.extensions[loaderExt]!
    _require.extensions[loaderExt] = (module: NodeModule, filename: string) => {
      if (filename === realFileName) {
        ;(module as NodeModuleWithCompile)._compile(bundledCode, filename)
      } else {
        defaultLoader(module, filename)
      }
    }
    // clear cache in case of server restart
    delete _require.cache[_require.resolve(fileName)]
    const raw = _require(fileName)
    createLogger().info(`raw: ${JSON.stringify(raw)}, fileName: ${fileName}`)
    _require.extensions[loaderExt] = defaultLoader
    return raw.__esModule ? raw.default : raw
  }
}

