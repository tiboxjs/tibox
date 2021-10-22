import path from "path";
import fs from "fs";
import {
  BuildOptions,
  resolveBuildOptions,
  ResolvedBuildOptions,
} from "./build";
import { build } from "esbuild";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import {
  // createDebugger,
  // isExternalUrl,
  isObject,
  lookupFile,
  normalizePath,
} from "./utils";
import { AliasOptions, Alias } from "../types/alias";
import { DevOptions } from "./dev";
import { resolveUploadOptions, UploadOptions } from "./upload";
import { parseDestFolderName, parseProjectName } from "./libs/tools";
import loadJsonFile from "load-json-file";
import { LogLevel } from "./logger";
import _ from "lodash";

// import { CLIENT_DIR, DEFAULT_ASSETS_RE } from './constants'
export interface ConfigEnv {
  command: "build" | "dev" | "upload";
  product: string;
  mode: string;
}

export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;
export type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn;

export type Plugin = {
  name: string;
  handle: (resolveConfig: ResolvedConfig) => NodeJS.ReadWriteStream;
};

export interface UserConfig {
  /**
   * Project root directory. Can be an absolute path, or a path relative from
   * the location of the config file itself.
   * @default process.cwd()
   */
  root?: string;
  project?: string;
  product?: string;
  mode?: string;
  // sourceDir?: string;
  // destDir?: string;
  appid?: string;
  projectName?: (project: string, product: string, mode: string) => string;
  ext?: Record<string, any>;
  /**
   * Server specific options, e.g. host, port, https...
   */
  dev?: DevOptions;

  /**
   * Build specific options
   */
  build?: BuildOptions;

  /**
   * upload specific options
   */
  upload?: UploadOptions;

  /**
   * Environment files directory. Can be an absolute path, or a path relative from
   * the location of the config file itself.
   * @default root
   */
  envDir?: string;

  /**
   * Log level.
   * Default: 'info'
   */
  logLevel?: LogLevel;

  plugins?: Plugin[];
}

export interface InlineConfig extends UserConfig {
  configFile?: string | false;
  envFile?: false;
}

export type handleDistResult = {
  fileContent: Uint8Array | null;
  dist: string;
};

export type gulpHandletype = {
  regExp: RegExp;
  fn: (
    srcPath: string,
    distRootPath: string,
    opts?: Record<string, unknown>
  ) => handleDistResult[] | handleDistResult;
};

/**
 * 解析完成后的配置
 */
export type ResolvedConfig = Readonly<
  Omit<
    UserConfig,
    "plugins" | "alias" | "dedupe" | "assetsInclude" | "optimizeDeps"
  > & {
    configFile: string | undefined;
    // configFileDependencies: string[];
    inlineConfig: InlineConfig;
    root: string;
    // base: string;
    // publicDir: string
    command: "build" | "dev" | "upload";
    dependencies: Record<string, string>;
    isDependencies: (name: string) => boolean;
    project: string;
    product: string;
    appid: string;
    version: string;
    /**
     * 最终的项目名称
     */
    determinedProjectName: string;
    /**
     * 最终的dispatch目录
     */
    determinedDestDir: string;
    /**
     * development、staging、production或其他的
     */
    mode: string;
    isProduction: boolean;
    env: Record<string, any>;
    // resolve: ResolveOptions & {
    //   alias: Alias[]
    // }
    // TODO: 暂时移除了plugin，后期考虑plugin结构
    // plugins: /* readonly  */ Plugin[];
    // dev: ResolvedDevOptions;
    build: ResolvedBuildOptions;
    replacer?: (key: string) => string;
    // assetsInclude: (file: string) => boolean
    // logger: Logger
    // createResolver: (options?: Partial<InternalResolveOptions>) => ResolveFn
    // optimizeDeps: Omit<DepOptimizationOptions, 'keepNames'>
  }
>;

type PackageJson = {
  version: string;
  dependencies: Record<string, string>;
};

export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: "build" | "dev" | "upload",
  defaultProduct = "default",
  defaultMode = "development"
): Promise<ResolvedConfig> {
  let config = inlineConfig;
  // let configFileDependencies: string[] = [];
  const product = inlineConfig.product || defaultProduct;
  let mode = inlineConfig.mode || defaultMode;

  // some dependencies e.g. @vue/compiler-* relies on NODE_ENV for getting
  // production-specific behavior, so set it here even though we haven't
  // resolve the final mode yet
  if (mode === "production") {
    process.env.NODE_ENV = "production";
  }

  const configEnv = {
    product,
    mode,
    command,
  };

  let { configFile } = config;
  if (configFile !== false) {
    try {
      const loadResult = await loadConfigFromFile(
        configEnv,
        configFile,
        config.root
        // config.logLevel
      );
      if (loadResult) {
        config = mergeConfig(loadResult.config, config);
        configFile = loadResult.path;
        // configFileDependencies = loadResult.dependencies;
      }
    } catch (error: any) {
      if (/Cannot find module/.test(error.message)) {
        throw new Error("Config file can't be found!");
      }
    }
  }

  // user config may provide an alternative mode
  mode = config.mode || mode;

  // resolve root
  const resolvedRoot = normalizePath(
    config.root ? path.resolve(config.root) : process.cwd()
  );

  // load .env files
  const envDir = config.envDir
    ? normalizePath(path.resolve(resolvedRoot, config.envDir))
    : resolvedRoot;
  const userEnv =
    inlineConfig.envFile !== false && loadEnv(product, mode, envDir);

  // Note it is possible for user to have a custom mode, e.g. `staging` where
  // production-like behavior is expected. This is indicated by NODE_ENV=production
  // loaded from `.staging.env` and set by us as VITE_USER_NODE_ENV
  const isProduction =
    (process.env.VITE_USER_NODE_ENV || mode) === "production";
  if (isProduction) {
    // in case default mode was not production and is overwritten
    process.env.NODE_ENV = "production";
  }

  const resolvedBuildOptions = resolveBuildOptions(config.build);

  const finalParseProjectName: UserConfig["projectName"] =
    config.projectName || parseProjectName;

  // 格式通常为 agility-default-development
  const determinedProjectName = finalParseProjectName(
    config.project || "project",
    config.product || defaultProduct,
    config.mode || defaultMode
  );

  // 格式通常为 dist-agility-default-development
  const determinedDestDir: string = parseDestFolderName(
    config.project || "project",
    config.product || defaultProduct,
    config.mode || defaultMode
  );

  const packageJson = (await loadJsonFile("./package.json")) as PackageJson;

  const resolvedUploadOptions = resolveUploadOptions(config.upload);

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
    isDependencies: (name) => {
      return (
        /^weui-miniprogram/.test(name) ||
        _.some(
          packageJson.dependencies,
          (item, key) => key === name.replace(/\\/, "/")
        )
      );
    },
    project: config.project || "newProject",
    product: config.product || "default",
    mode,
    version: packageJson.version,
    appid: config.appid || "",
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
    // plugins: config.plugins || [],
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
    replacer: (key) => {
      // TODO: 暂时先放这，不知道应该放哪
      const replaceStr: Record<string, string> = {
        PRODUCT_NAME: config.product || "default",
        IS_RELEASE: (mode === "production").toString(),
        VERSION: packageJson.version,
      };
      console.log(`replacer: ${key}: ${replaceStr[key]}`);
      return replaceStr[key];
    },
  };

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
  //     chalk.yellow.bold(
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

  return resolved;
}

function mergeConfigRecursively(
  a: Record<string, any>,
  b: Record<string, any>,
  rootPath: string
) {
  const merged: Record<string, any> = { ...a };
  for (const key in b) {
    const value = b[key];
    if (value == null) {
      continue;
    }

    const existing = merged[key];
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value];
      continue;
    }
    if (isObject(existing) && isObject(value)) {
      merged[key] = mergeConfigRecursively(
        existing,
        value,
        rootPath ? `${rootPath}.${key}` : key
      );
      continue;
    }

    // fields that require special handling
    if (existing != null) {
      if (key === "alias" && (rootPath === "resolve" || rootPath === "")) {
        merged[key] = mergeAlias(existing, value);
        continue;
      } else if (key === "assetsInclude" && rootPath === "") {
        merged[key] = [].concat(existing, value);
        continue;
      }
    }

    merged[key] = value;
  }
  return merged;
}

export function mergeConfig(
  a: Record<string, any>,
  b: Record<string, any>,
  isRoot = true
): Record<string, any> {
  return mergeConfigRecursively(a, b, isRoot ? "" : ".");
}

function mergeAlias(a: AliasOptions = [], b: AliasOptions = []): Alias[] {
  return [...normalizeAlias(a), ...normalizeAlias(b)];
}

function normalizeAlias(o: AliasOptions): Alias[] {
  return Array.isArray(o)
    ? o.map(normalizeSingleAlias)
    : Object.keys(o).map((find) =>
        normalizeSingleAlias({
          find,
          replacement: (o as any)[find],
        })
      );
}

// https://github.com/vitejs/vite/issues/1363
// work around https://github.com/rollup/plugins/issues/759
function normalizeSingleAlias({ find, replacement }: Alias): Alias {
  if (
    typeof find === "string" &&
    find.endsWith("/") &&
    replacement.endsWith("/")
  ) {
    find = find.slice(0, find.length - 1);
    replacement = replacement.slice(0, replacement.length - 1);
  }
  return { find, replacement };
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

export async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd()
  // logLevel?: LogLevel
): Promise<{
  path: string;
  config: UserConfig;
  dependencies: string[];
} | null> {
  // const start = Date.now();

  let resolvedPath: string | undefined;
  let dependencies: string[] = [];

  if (configFile) {
    // explicit config path is always resolved from cwd
    resolvedPath = path.resolve(configFile);
  } else {
    // implicit config file loaded from inline root (if present)
    // otherwise from cwd
    const jsconfigFile = path.resolve(configRoot, "tibox.config.js");
    if (fs.existsSync(jsconfigFile)) {
      resolvedPath = jsconfigFile;
    }
  }

  if (!resolvedPath) {
    // debug("no config file found.");
    return null;
  }

  try {
    let userConfig: UserConfigExport | undefined;

    if (!userConfig) {
      // 1. try to directly require the module (assuming commonjs)
      try {
        // clear cache in case of server restart
        delete require.cache[require.resolve(resolvedPath)];
        userConfig = require(resolvedPath);
        // debug(`cjs config loaded in ${Date.now() - start}ms`);
      } catch (e: any) {
        const ignored = new RegExp(
          [
            `Cannot use import statement`,
            `Must use import to load ES Module`,
            // #1635, #2050 some Node 12.x versions don't have esm detection
            // so it throws normal syntax errors when encountering esm syntax
            `Unexpected token`,
            `Unexpected identifier`,
          ].join("|")
        );
        if (!ignored.test(e.message)) {
          throw e;
        }
      }
    }

    if (!userConfig) {
      // 2. if we reach here, the file is ts or using es import syntax, or
      // the user has type: "module" in their package.json (#917)
      // transpile es import syntax to require syntax using rollup.
      // lazy require rollup (it's actually in dependencies)
      const bundled = await bundleConfigFile(resolvedPath);
      dependencies = bundled.dependencies;
      userConfig = await loadConfigFromBundledFile(resolvedPath, bundled.code);
      // debug(`bundled config file loaded in ${Date.now() - start}ms`);
    }

    const config = await (typeof userConfig === "function"
      ? userConfig(configEnv)
      : userConfig);
    // if (!isObject(config)) {
    //   throw new Error(`config must export or return an object.`);
    // }
    return {
      path: normalizePath(resolvedPath),
      config,
      dependencies,
    };
  } catch (e) {
    // createLogger(logLevel).error(
    //   chalk.red(`failed to load config from ${resolvedPath}`)
    // );

    // TODO: 下面这行我自己添加的
    console.error(e);
    throw e;
  }
}

/**
 * 打包配置文件，将其依赖一起解析
 * @param fileName
 * @param mjs
 * @returns
 */
async function bundleConfigFile(
  fileName: string,
  mjs = false
): Promise<{ code: string; dependencies: string[] }> {
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: "out.js",
    write: false,
    platform: "node",
    bundle: true,
    format: mjs ? "esm" : "cjs",
    sourcemap: "inline",
    metafile: true,
    plugins: [
      {
        name: "externalize-deps",
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path;
            if (id[0] !== "." && !path.isAbsolute(id)) {
              return {
                external: true,
              };
            }
          });
        },
      },
      //   {
      //     name: "replace-import-meta",
      //     setup(build) {
      //       build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
      //         const contents = await fs.promises.readFile(args.path, "utf8");
      //         return {
      //           loader: args.path.endsWith(".ts") ? "ts" : "js",
      //           contents: contents
      //             .replace(
      //               /\bimport\.meta\.url\b/g,
      //               JSON.stringify(`file://${args.path}`)
      //             )
      //             .replace(
      //               /\b__dirname\b/g,
      //               JSON.stringify(path.dirname(args.path))
      //             )
      //             .replace(/\b__filename\b/g, JSON.stringify(args.path)),
      //         };
      //       });
      //     },
      //   },
    ],
  });
  const { text } = result.outputFiles[0];
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
  };
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any;
}

async function loadConfigFromBundledFile(
  fileName: string,
  bundledCode: string
): Promise<UserConfig> {
  const extension = path.extname(fileName);
  const defaultLoader = require.extensions[extension]!;
  require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === fileName) {
      (module as NodeModuleWithCompile)._compile(bundledCode, filename);
    } else {
      defaultLoader(module, filename);
    }
  };
  // clear cache in case of server restart
  delete require.cache[require.resolve(fileName)];
  const raw = require(fileName);
  const config = raw.__esModule ? raw.default : raw;
  require.extensions[extension] = defaultLoader;
  return config;
}

export function loadEnv(
  product: string,
  mode: string,
  envDir: string,
  prefix = "TIBOX_"
): Record<string, string> {
  if (mode === "local") {
    throw new Error(
      `"local" cannot be used as a mode name because it conflicts with ` +
        `the .local postfix for .env files.`
    );
  }

  const env: Record<string, string> = {};
  const envFiles = [
    /** with product and mode local file */ `.env.${product}.${mode}.local`,
    /** with product and mode file */ `.env.${product}.${mode}`,
    /** product local file */ `.env.${product}.local`,
    /** product file */ `.env.${product}`,
    /** local file */ `.env.local`,
    /** default file */ `.env`,
  ];

  // check if there are actual env variables starting with TIBOX_*
  // these are typically provided inline and should be prioritized
  for (const key in process.env) {
    if (key.startsWith(prefix) && env[key] === undefined) {
      env[key] = process.env[key] as string;
    }
  }

  for (const file of envFiles) {
    const path = lookupFile(envDir, [file], true);
    if (path) {
      const parsed = dotenv.parse(fs.readFileSync(path), {
        debug: !!process.env.DEBUG || undefined,
      });

      // let environment variables use each other
      dotenvExpand({
        parsed,
        // prevent process.env mutation
        ignoreProcessEnv: true,
      } as any);

      // only keys that start with prefix are exposed to client
      for (const [key, value] of Object.entries(parsed)) {
        if (key.startsWith(prefix) && env[key] === undefined) {
          env[key] = value;
        } else if (key === "NODE_ENV") {
          // NODE_ENV override in .env file
          process.env.VITE_USER_NODE_ENV = value;
        }
      }
    }
  }

  return env;
}
