"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = exports.loadConfigFromFile = exports.mergeConfig = exports.resolveConfig = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const build_1 = require("./build");
const esbuild_1 = require("esbuild");
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const utils_1 = require("./utils");
const tools_1 = require("./libs/tools");
const load_json_file_1 = __importDefault(require("load-json-file"));
async function resolveConfig(inlineConfig, command, defaultProduct = "default", defaultMode = "development") {
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
        const loadResult = await loadConfigFromFile(configEnv, configFile, config.root
        // config.logLevel
        );
        if (loadResult) {
            config = mergeConfig(loadResult.config, config);
            configFile = loadResult.path;
            // configFileDependencies = loadResult.dependencies;
        }
    }
    // user config may provide an alternative mode
    mode = config.mode || mode;
    // resolve root
    const resolvedRoot = utils_1.normalizePath(config.root ? path_1.default.resolve(config.root) : process.cwd());
    // load .env files
    const envDir = config.envDir
        ? utils_1.normalizePath(path_1.default.resolve(resolvedRoot, config.envDir))
        : resolvedRoot;
    const userEnv = inlineConfig.envFile !== false && loadEnv(product, mode, envDir);
    // Note it is possible for user to have a custom mode, e.g. `staging` where
    // production-like behavior is expected. This is indicated by NODE_ENV=production
    // loaded from `.staging.env` and set by us as VITE_USER_NODE_ENV
    const isProduction = (process.env.VITE_USER_NODE_ENV || mode) === "production";
    if (isProduction) {
        // in case default mode was not production and is overwritten
        process.env.NODE_ENV = "production";
    }
    const resolvedBuildOptions = build_1.resolveBuildOptions(config.build);
    const finalParseProjectName = config.projectName || tools_1.parseProjectName;
    // 格式通常为 agility-default-development
    const determinedProjectName = finalParseProjectName(config.project || "project", config.product || defaultProduct, config.mode || defaultMode);
    // 格式通常为 dist-agility-default-development
    const determinedDestDir = tools_1.parseDestFolderName(config.project || "project", config.product || defaultProduct, config.mode || defaultMode);
    const packageJson = (await load_json_file_1.default("./package.json"));
    const resolved = {
        ...config,
        configFile: configFile ? utils_1.normalizePath(configFile) : undefined,
        // configFileDependencies,
        inlineConfig,
        root: resolvedRoot,
        // base: BASE_URL,
        // resolve: resolveOptions,
        // publicDir: resolvedPublicDir,
        // cacheDir,
        command,
        project: config.project || "newProject",
        product: config.product || "default",
        mode,
        appid: config.appid || "",
        determinedProjectName,
        determinedDestDir,
        isProduction,
        // plugins: userPlugins,
        // server: resolveServerOptions(resolvedRoot, config.server),
        build: resolvedBuildOptions,
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
        replacer: (key) => {
            // TODO: 暂时先放这，不知道应该放哪
            const replaceStr = {
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
    // TODO Deprecation warnings - remove when out of beta
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
exports.resolveConfig = resolveConfig;
function mergeConfigRecursively(a, b, rootPath) {
    const merged = { ...a };
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
        if (utils_1.isObject(existing) && utils_1.isObject(value)) {
            merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key);
            continue;
        }
        // fields that require special handling
        if (existing != null) {
            if (key === "alias" && (rootPath === "resolve" || rootPath === "")) {
                merged[key] = mergeAlias(existing, value);
                continue;
            }
            else if (key === "assetsInclude" && rootPath === "") {
                merged[key] = [].concat(existing, value);
                continue;
            }
        }
        merged[key] = value;
    }
    return merged;
}
function mergeConfig(a, b, isRoot = true) {
    return mergeConfigRecursively(a, b, isRoot ? "" : ".");
}
exports.mergeConfig = mergeConfig;
function mergeAlias(a = [], b = []) {
    return [...normalizeAlias(a), ...normalizeAlias(b)];
}
function normalizeAlias(o) {
    return Array.isArray(o)
        ? o.map(normalizeSingleAlias)
        : Object.keys(o).map((find) => normalizeSingleAlias({
            find,
            replacement: o[find],
        }));
}
// https://github.com/vitejs/vite/issues/1363
// work around https://github.com/rollup/plugins/issues/759
function normalizeSingleAlias({ find, replacement }) {
    if (typeof find === "string" &&
        find.endsWith("/") &&
        replacement.endsWith("/")) {
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
async function loadConfigFromFile(configEnv, configFile, configRoot = process.cwd()
// logLevel?: LogLevel
) {
    // const start = Date.now();
    let resolvedPath;
    let dependencies = [];
    if (configFile) {
        // explicit config path is always resolved from cwd
        resolvedPath = path_1.default.resolve(configFile);
    }
    else {
        // implicit config file loaded from inline root (if present)
        // otherwise from cwd
        const jsconfigFile = path_1.default.resolve(configRoot, "tibox.config.js");
        if (fs_1.default.existsSync(jsconfigFile)) {
            resolvedPath = jsconfigFile;
        }
    }
    if (!resolvedPath) {
        // debug("no config file found.");
        return null;
    }
    try {
        let userConfig;
        if (!userConfig) {
            // 1. try to directly require the module (assuming commonjs)
            try {
                // clear cache in case of server restart
                delete require.cache[require.resolve(resolvedPath)];
                userConfig = require(resolvedPath);
                // debug(`cjs config loaded in ${Date.now() - start}ms`);
            }
            catch (e) {
                // const ignored = new RegExp(
                //   [
                //     `Cannot use import statement`,
                //     `Must use import to load ES Module`,
                //     // #1635, #2050 some Node 12.x versions don't have esm detection
                //     // so it throws normal syntax errors when encountering esm syntax
                //     `Unexpected token`,
                //     `Unexpected identifier`,
                //   ].join("|")
                // );
                // if (!ignored.test(e.message)) {
                //   throw e;
                // }
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
            path: utils_1.normalizePath(resolvedPath),
            config,
            dependencies,
        };
    }
    catch (e) {
        // createLogger(logLevel).error(
        //   chalk.red(`failed to load config from ${resolvedPath}`)
        // );
        // TODO: 下面这行我自己添加的
        console.error(e);
        throw e;
    }
}
exports.loadConfigFromFile = loadConfigFromFile;
async function bundleConfigFile(fileName, mjs = false) {
    const result = await esbuild_1.build({
        absWorkingDir: process.cwd(),
        entryPoints: [fileName],
        outfile: "out.js",
        write: false,
        platform: "node",
        bundle: true,
        format: mjs ? "esm" : "cjs",
        sourcemap: "inline",
        metafile: true,
        // plugins: [
        //   {
        //     name: "externalize-deps",
        //     setup(build) {
        //       build.onResolve({ filter: /.*/ }, (args) => {
        //         const id = args.path;
        //         if (id[0] !== "." && !path.isAbsolute(id)) {
        //           return {
        //             external: true,
        //           };
        //         }
        //       });
        //     },
        //   },
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
        // ],
    });
    const { text } = result.outputFiles[0];
    return {
        code: text,
        dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
    };
}
async function loadConfigFromBundledFile(fileName, bundledCode) {
    const extension = path_1.default.extname(fileName);
    const defaultLoader = require.extensions[extension];
    require.extensions[extension] = (module, filename) => {
        if (filename === fileName) {
            module._compile(bundledCode, filename);
        }
        else {
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
function loadEnv(product, mode, envDir, prefix = "TIBOX_") {
    if (mode === "local") {
        throw new Error(`"local" cannot be used as a mode name because it conflicts with ` +
            `the .local postfix for .env files.`);
    }
    const env = {};
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
            env[key] = process.env[key];
        }
    }
    for (const file of envFiles) {
        const path = utils_1.lookupFile(envDir, [file], true);
        if (path) {
            const parsed = dotenv_1.default.parse(fs_1.default.readFileSync(path), {
                debug: !!process.env.DEBUG || undefined,
            });
            // let environment variables use each other
            dotenv_expand_1.default({
                parsed,
                // prevent process.env mutation
                ignoreProcessEnv: true,
            });
            // only keys that start with prefix are exposed to client
            for (const [key, value] of Object.entries(parsed)) {
                if (key.startsWith(prefix) && env[key] === undefined) {
                    env[key] = value;
                }
                else if (key === "NODE_ENV") {
                    // NODE_ENV override in .env file
                    process.env.VITE_USER_NODE_ENV = value;
                }
            }
        }
    }
    return env;
}
exports.loadEnv = loadEnv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBd0I7QUFDeEIsNENBQW9CO0FBQ3BCLG1DQUlpQjtBQUNqQixxQ0FBZ0M7QUFDaEMsb0RBQTRCO0FBQzVCLGtFQUF5QztBQUN6QyxtQ0FNaUI7QUFHakIsd0NBQXFFO0FBQ3JFLG9FQUEwQztBQXlHbkMsS0FBSyxVQUFVLGFBQWEsQ0FDakMsWUFBMEIsRUFDMUIsT0FBd0IsRUFDeEIsY0FBYyxHQUFHLFNBQVMsRUFDMUIsV0FBVyxHQUFHLGFBQWE7SUFFM0IsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzFCLDZDQUE2QztJQUM3QyxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxJQUFJLGNBQWMsQ0FBQztJQUN2RCxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQztJQUU1Qyx3RUFBd0U7SUFDeEUsc0VBQXNFO0lBQ3RFLDZCQUE2QjtJQUM3QixJQUFJLElBQUksS0FBSyxZQUFZLEVBQUU7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0tBQ3JDO0lBRUQsTUFBTSxTQUFTLEdBQUc7UUFDaEIsT0FBTztRQUNQLElBQUk7UUFDSixPQUFPO0tBQ1IsQ0FBQztJQUVGLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFDNUIsSUFBSSxVQUFVLEtBQUssS0FBSyxFQUFFO1FBQ3hCLE1BQU0sVUFBVSxHQUFHLE1BQU0sa0JBQWtCLENBQ3pDLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxDQUFDLElBQUk7UUFDWCxrQkFBa0I7U0FDbkIsQ0FBQztRQUNGLElBQUksVUFBVSxFQUFFO1lBQ2QsTUFBTSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQzdCLG9EQUFvRDtTQUNyRDtLQUNGO0lBRUQsOENBQThDO0lBQzlDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztJQUUzQixlQUFlO0lBQ2YsTUFBTSxZQUFZLEdBQUcscUJBQWEsQ0FDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FDeEQsQ0FBQztJQUVGLGtCQUFrQjtJQUNsQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTTtRQUMxQixDQUFDLENBQUMscUJBQWEsQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLFlBQVksQ0FBQztJQUNqQixNQUFNLE9BQU8sR0FDWCxZQUFZLENBQUMsT0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVuRSwyRUFBMkU7SUFDM0UsaUZBQWlGO0lBQ2pGLGlFQUFpRTtJQUNqRSxNQUFNLFlBQVksR0FDaEIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxLQUFLLFlBQVksQ0FBQztJQUM1RCxJQUFJLFlBQVksRUFBRTtRQUNoQiw2REFBNkQ7UUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0tBQ3JDO0lBRUQsTUFBTSxvQkFBb0IsR0FBRywyQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFL0QsTUFBTSxxQkFBcUIsR0FDekIsTUFBTSxDQUFDLFdBQVcsSUFBSSx3QkFBZ0IsQ0FBQztJQUV6QyxvQ0FBb0M7SUFDcEMsTUFBTSxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FDakQsTUFBTSxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzNCLE1BQU0sQ0FBQyxPQUFPLElBQUksY0FBYyxFQUNoQyxNQUFNLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FDM0IsQ0FBQztJQUVGLHlDQUF5QztJQUN6QyxNQUFNLGlCQUFpQixHQUFXLDJCQUFtQixDQUNuRCxNQUFNLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFDM0IsTUFBTSxDQUFDLE9BQU8sSUFBSSxjQUFjLEVBQ2hDLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUMzQixDQUFDO0lBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFNLHdCQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBZ0IsQ0FBQztJQUUxRSxNQUFNLFFBQVEsR0FBbUI7UUFDL0IsR0FBRyxNQUFNO1FBQ1QsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMscUJBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztRQUM5RCwwQkFBMEI7UUFDMUIsWUFBWTtRQUNaLElBQUksRUFBRSxZQUFZO1FBQ2xCLGtCQUFrQjtRQUNsQiwyQkFBMkI7UUFDM0IsZ0NBQWdDO1FBQ2hDLFlBQVk7UUFDWixPQUFPO1FBQ1AsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksWUFBWTtRQUN2QyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sSUFBSSxTQUFTO1FBQ3BDLElBQUk7UUFDSixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3pCLHFCQUFxQjtRQUNyQixpQkFBaUI7UUFDakIsWUFBWTtRQUNaLHdCQUF3QjtRQUN4Qiw2REFBNkQ7UUFDN0QsS0FBSyxFQUFFLG9CQUFvQjtRQUMzQixHQUFHLEVBQUU7WUFDSCxHQUFHLE9BQU87WUFDVixZQUFZO1lBQ1osSUFBSSxFQUFFLElBQUk7WUFDVixHQUFHLEVBQUUsQ0FBQyxZQUFZO1lBQ2xCLElBQUksRUFBRSxZQUFZO1NBQ25CO1FBQ0QsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRTtRQUM3QixnQ0FBZ0M7UUFDaEMsK0RBQStEO1FBQy9ELEtBQUs7UUFDTCxVQUFVO1FBQ1Ysa0JBQWtCO1FBQ2xCLGtCQUFrQjtRQUNsQiw0QkFBNEI7UUFDNUIsc0JBQXNCO1FBQ3RCLGlEQUFpRDtRQUNqRCw4Q0FBOEM7UUFDOUMsT0FBTztRQUNQLEtBQUs7UUFDTCxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNoQixzQkFBc0I7WUFDdEIsTUFBTSxVQUFVLEdBQTJCO2dCQUN6QyxZQUFZLEVBQUUsTUFBTSxDQUFDLE9BQU8sSUFBSSxTQUFTO2dCQUN6QyxVQUFVLEVBQUUsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFO2dCQUM5QyxPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU87YUFDN0IsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLEtBQUssVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDO0tBQ0YsQ0FBQztJQUVGLHlEQUF5RDtJQUN6RCxjQUFjO0lBQ2QsZ0JBQWdCO0lBQ2hCLG1CQUFtQjtJQUNuQixnQkFBZ0I7SUFDaEIsS0FBSztJQUVMLCtCQUErQjtJQUMvQiwyRUFBMkU7SUFFM0UsMkJBQTJCO0lBQzNCLHlDQUF5QztJQUN6QyxtQkFBbUI7SUFDbkIsb0RBQW9EO0lBQ3BELFFBQVE7SUFDUixJQUFJO0lBRUosc0RBQXNEO0lBRXRELGtDQUFrQztJQUNsQyw4QkFBOEI7SUFDOUIsa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQixTQUFTO0lBQ1QsaUJBQWlCO0lBQ2pCLHlCQUF5QjtJQUN6QixtRUFBbUU7SUFDbkUsMENBQTBDO0lBQzFDLFdBQVc7SUFDWCxRQUFRO0lBQ1IsT0FBTztJQUNQLEtBQUs7SUFFTCw0QkFBNEI7SUFDNUIsMkJBQTJCO0lBQzNCLG9CQUFvQjtJQUNwQixrREFBa0Q7SUFDbEQsT0FBTztJQUNQLHFDQUFxQztJQUNyQyxJQUFJO0lBQ0osd0RBQXdEO0lBQ3hELHVCQUF1QjtJQUN2QixZQUFZO0lBQ1osNkJBQTZCO0lBQzdCLHNCQUFzQjtJQUN0QixxREFBcUQ7SUFDckQsb0JBQW9CO0lBQ3BCLFNBQVM7SUFDVCw0QkFBNEI7SUFDNUIsT0FBTztJQUNQLE1BQU07SUFFTixzQkFBc0I7SUFDdEIsb0VBQW9FO0lBQ3BFLElBQUk7SUFDSiw2Q0FBNkM7SUFDN0MsdUJBQXVCO0lBQ3ZCLFlBQVk7SUFDWiw2QkFBNkI7SUFDN0IsaUJBQWlCO0lBQ2pCLHdDQUF3QztJQUN4QyxvQkFBb0I7SUFDcEIsU0FBUztJQUNULHFDQUFxQztJQUNyQyxPQUFPO0lBQ1AsTUFBTTtJQUVOLHVCQUF1QjtJQUN2QixzRUFBc0U7SUFDdEUsSUFBSTtJQUNKLDhDQUE4QztJQUM5Qyx1QkFBdUI7SUFDdkIsWUFBWTtJQUNaLDZCQUE2QjtJQUM3QixrQkFBa0I7SUFDbEIseUNBQXlDO0lBQ3pDLG9CQUFvQjtJQUNwQixTQUFTO0lBQ1Qsc0NBQXNDO0lBQ3RDLE9BQU87SUFDUCxNQUFNO0lBRU4sd0NBQXdDO0lBQ3hDLDJCQUEyQjtJQUMzQixnQ0FBZ0M7SUFDaEMsNkRBQTZEO0lBQzdELE9BQU87SUFDUCxJQUFJO0lBQ0osOERBQThEO0lBQzlELHVCQUF1QjtJQUN2QixZQUFZO0lBQ1osNkJBQTZCO0lBQzdCLGtDQUFrQztJQUNsQyxnRUFBZ0U7SUFDaEUsb0JBQW9CO0lBQ3BCLFNBQVM7SUFDVCw4REFBOEQ7SUFDOUQsT0FBTztJQUNQLE1BQU07SUFFTixPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBL09ELHNDQStPQztBQUVELFNBQVMsc0JBQXNCLENBQzdCLENBQXNCLEVBQ3RCLENBQXNCLEVBQ3RCLFFBQWdCO0lBRWhCLE1BQU0sTUFBTSxHQUF3QixFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDN0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDbkIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtZQUNqQixTQUFTO1NBQ1Y7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQztZQUN0QyxTQUFTO1NBQ1Y7UUFDRCxJQUFJLGdCQUFRLENBQUMsUUFBUSxDQUFDLElBQUksZ0JBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN6QyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsc0JBQXNCLENBQ2xDLFFBQVEsRUFDUixLQUFLLEVBQ0wsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUN0QyxDQUFDO1lBQ0YsU0FBUztTQUNWO1FBRUQsdUNBQXVDO1FBQ3ZDLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNwQixJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsRUFBRTtnQkFDbEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLFNBQVM7YUFDVjtpQkFBTSxJQUFJLEdBQUcsS0FBSyxlQUFlLElBQUksUUFBUSxLQUFLLEVBQUUsRUFBRTtnQkFDckQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxTQUFTO2FBQ1Y7U0FDRjtRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7S0FDckI7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBZ0IsV0FBVyxDQUN6QixDQUFzQixFQUN0QixDQUFzQixFQUN0QixNQUFNLEdBQUcsSUFBSTtJQUViLE9BQU8sc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQU5ELGtDQU1DO0FBRUQsU0FBUyxVQUFVLENBQUMsSUFBa0IsRUFBRSxFQUFFLElBQWtCLEVBQUU7SUFDNUQsT0FBTyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLENBQWU7SUFDckMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztRQUM3QixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUMxQixvQkFBb0IsQ0FBQztZQUNuQixJQUFJO1lBQ0osV0FBVyxFQUFHLENBQVMsQ0FBQyxJQUFJLENBQUM7U0FDOUIsQ0FBQyxDQUNILENBQUM7QUFDUixDQUFDO0FBRUQsNkNBQTZDO0FBQzdDLDJEQUEyRDtBQUMzRCxTQUFTLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBUztJQUN4RCxJQUNFLE9BQU8sSUFBSSxLQUFLLFFBQVE7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDbEIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFDekI7UUFDQSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QyxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUM1RDtJQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDL0IsQ0FBQztBQUVELG1DQUFtQztBQUNuQywrQ0FBK0M7QUFDL0Msc0NBQXNDO0FBQ3RDLHFDQUFxQztBQUNyQyxzQ0FBc0M7QUFDdEMsd0NBQXdDO0FBRXhDLG1CQUFtQjtBQUNuQixzQ0FBc0M7QUFDdEMscURBQXFEO0FBQ3JELDREQUE0RDtBQUM1RCxvQ0FBb0M7QUFDcEMsVUFBVTtBQUNWLE1BQU07QUFFTixxREFBcUQ7QUFDckQsSUFBSTtBQUVHLEtBQUssVUFBVSxrQkFBa0IsQ0FDdEMsU0FBb0IsRUFDcEIsVUFBbUIsRUFDbkIsYUFBcUIsT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNsQyxzQkFBc0I7O0lBTXRCLDRCQUE0QjtJQUU1QixJQUFJLFlBQWdDLENBQUM7SUFDckMsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO0lBRWhDLElBQUksVUFBVSxFQUFFO1FBQ2QsbURBQW1EO1FBQ25ELFlBQVksR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3pDO1NBQU07UUFDTCw0REFBNEQ7UUFDNUQscUJBQXFCO1FBQ3JCLE1BQU0sWUFBWSxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDakUsSUFBSSxZQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQy9CLFlBQVksR0FBRyxZQUFZLENBQUM7U0FDN0I7S0FDRjtJQUVELElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsa0NBQWtDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxJQUFJO1FBQ0YsSUFBSSxVQUF3QyxDQUFDO1FBRTdDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZiw0REFBNEQ7WUFDNUQsSUFBSTtnQkFDRix3Q0FBd0M7Z0JBQ3hDLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ25DLHlEQUF5RDthQUMxRDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLDhCQUE4QjtnQkFDOUIsTUFBTTtnQkFDTixxQ0FBcUM7Z0JBQ3JDLDJDQUEyQztnQkFDM0MsdUVBQXVFO2dCQUN2RSx3RUFBd0U7Z0JBQ3hFLDBCQUEwQjtnQkFDMUIsK0JBQStCO2dCQUMvQixnQkFBZ0I7Z0JBQ2hCLEtBQUs7Z0JBQ0wsa0NBQWtDO2dCQUNsQyxhQUFhO2dCQUNiLElBQUk7YUFDTDtTQUNGO1FBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLG9FQUFvRTtZQUNwRSwyREFBMkQ7WUFDM0QsNkRBQTZEO1lBQzdELHNEQUFzRDtZQUN0RCxNQUFNLE9BQU8sR0FBRyxNQUFNLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JELFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQ3BDLFVBQVUsR0FBRyxNQUFNLHlCQUF5QixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekUsa0VBQWtFO1NBQ25FO1FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sVUFBVSxLQUFLLFVBQVU7WUFDcEQsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7WUFDdkIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hCLDJCQUEyQjtRQUMzQixnRUFBZ0U7UUFDaEUsSUFBSTtRQUNKLE9BQU87WUFDTCxJQUFJLEVBQUUscUJBQWEsQ0FBQyxZQUFZLENBQUM7WUFDakMsTUFBTTtZQUNOLFlBQVk7U0FDYixDQUFDO0tBQ0g7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLGdDQUFnQztRQUNoQyw0REFBNEQ7UUFDNUQsS0FBSztRQUVMLG1CQUFtQjtRQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxDQUFDO0tBQ1Q7QUFDSCxDQUFDO0FBMUZELGdEQTBGQztBQUVELEtBQUssVUFBVSxnQkFBZ0IsQ0FDN0IsUUFBZ0IsRUFDaEIsR0FBRyxHQUFHLEtBQUs7SUFFWCxNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQUssQ0FBQztRQUN6QixhQUFhLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUM1QixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUM7UUFDdkIsT0FBTyxFQUFFLFFBQVE7UUFDakIsS0FBSyxFQUFFLEtBQUs7UUFDWixRQUFRLEVBQUUsTUFBTTtRQUNoQixNQUFNLEVBQUUsSUFBSTtRQUNaLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSztRQUMzQixTQUFTLEVBQUUsUUFBUTtRQUNuQixRQUFRLEVBQUUsSUFBSTtRQUNkLGFBQWE7UUFDYixNQUFNO1FBQ04sZ0NBQWdDO1FBQ2hDLHFCQUFxQjtRQUNyQixzREFBc0Q7UUFDdEQsZ0NBQWdDO1FBQ2hDLHVEQUF1RDtRQUN2RCxxQkFBcUI7UUFDckIsOEJBQThCO1FBQzlCLGVBQWU7UUFDZixZQUFZO1FBQ1osWUFBWTtRQUNaLFNBQVM7UUFDVCxPQUFPO1FBQ1AsTUFBTTtRQUNOLG1DQUFtQztRQUNuQyxxQkFBcUI7UUFDckIsK0RBQStEO1FBQy9ELDBFQUEwRTtRQUMxRSxtQkFBbUI7UUFDbkIsNkRBQTZEO1FBQzdELCtCQUErQjtRQUMvQix3QkFBd0I7UUFDeEIsMENBQTBDO1FBQzFDLHNEQUFzRDtRQUN0RCxnQkFBZ0I7UUFDaEIsd0JBQXdCO1FBQ3hCLGtDQUFrQztRQUNsQyx3REFBd0Q7UUFDeEQsZ0JBQWdCO1FBQ2hCLHNFQUFzRTtRQUN0RSxhQUFhO1FBQ2IsWUFBWTtRQUNaLFNBQVM7UUFDVCxPQUFPO1FBQ1AsS0FBSztLQUNOLENBQUMsQ0FBQztJQUNILE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLE9BQU87UUFDTCxJQUFJLEVBQUUsSUFBSTtRQUNWLFlBQVksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7S0FDekUsQ0FBQztBQUNKLENBQUM7QUFNRCxLQUFLLFVBQVUseUJBQXlCLENBQ3RDLFFBQWdCLEVBQ2hCLFdBQW1CO0lBRW5CLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUUsQ0FBQztJQUNyRCxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBa0IsRUFBRSxRQUFnQixFQUFFLEVBQUU7UUFDdkUsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ3hCLE1BQWdDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNuRTthQUFNO1lBQ0wsYUFBYSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNqQztJQUNILENBQUMsQ0FBQztJQUNGLHdDQUF3QztJQUN4QyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDbEQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxhQUFhLENBQUM7SUFDOUMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQWdCLE9BQU8sQ0FDckIsT0FBZSxFQUNmLElBQVksRUFDWixNQUFjLEVBQ2QsTUFBTSxHQUFHLFFBQVE7SUFFakIsSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFO1FBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQ2Isa0VBQWtFO1lBQ2hFLG9DQUFvQyxDQUN2QyxDQUFDO0tBQ0g7SUFFRCxNQUFNLEdBQUcsR0FBMkIsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sUUFBUSxHQUFHO1FBQ2YsdUNBQXVDLENBQUMsUUFBUSxPQUFPLElBQUksSUFBSSxRQUFRO1FBQ3ZFLGlDQUFpQyxDQUFDLFFBQVEsT0FBTyxJQUFJLElBQUksRUFBRTtRQUMzRCx5QkFBeUIsQ0FBQyxRQUFRLE9BQU8sUUFBUTtRQUNqRCxtQkFBbUIsQ0FBQyxRQUFRLE9BQU8sRUFBRTtRQUNyQyxpQkFBaUIsQ0FBQyxZQUFZO1FBQzlCLG1CQUFtQixDQUFDLE1BQU07S0FDM0IsQ0FBQztJQUVGLGdFQUFnRTtJQUNoRSxnRUFBZ0U7SUFDaEUsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQzdCLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ3BELEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBVyxDQUFDO1NBQ3ZDO0tBQ0Y7SUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUMzQixNQUFNLElBQUksR0FBRyxrQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakQsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxTQUFTO2FBQ3hDLENBQUMsQ0FBQztZQUVILDJDQUEyQztZQUMzQyx1QkFBWSxDQUFDO2dCQUNYLE1BQU07Z0JBQ04sK0JBQStCO2dCQUMvQixnQkFBZ0IsRUFBRSxJQUFJO2FBQ2hCLENBQUMsQ0FBQztZQUVWLHlEQUF5RDtZQUN6RCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDakQsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLEVBQUU7b0JBQ3BELEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ2xCO3FCQUFNLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtvQkFDN0IsaUNBQWlDO29CQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztpQkFDeEM7YUFDRjtTQUNGO0tBQ0Y7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUExREQsMEJBMERDIn0=