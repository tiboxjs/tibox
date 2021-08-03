"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBuildOptions = exports.build = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const gulp_1 = require("gulp");
const taskImage_1 = __importDefault(require("./taskImage"));
const taskJson_1 = __importDefault(require("./taskJson"));
const taskJs_1 = __importDefault(require("./taskJs"));
const taskWxml_1 = __importDefault(require("./taskWxml"));
const taskWxs_1 = __importDefault(require("./taskWxs"));
const taskWxss_1 = __importDefault(require("./taskWxss"));
const init_1 = require("./init");
const ext_1 = __importDefault(require("./ext"));
const gulp_replace_1 = __importDefault(require("gulp-replace"));
/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
async function build(inlineConfig = {}) {
    // parallelCallCounts++;
    try {
        return await doBuild(inlineConfig);
    }
    finally {
        // parallelCallCounts--;
        // if (parallelCallCounts <= 0) {
        //   await Promise.all(parallelBuilds.map((bundle) => bundle.close()));
        //   parallelBuilds.length = 0;
        // }
    }
}
exports.build = build;
async function doBuild(inlineConfig = {}) {
    const config = await config_1.resolveConfig(inlineConfig, "build", "default", "production");
    console.log(config);
    // 格式通常为 /path/to/project/dist-agility-default-development
    const resolvedDestDir = path_1.default.resolve(config.determinedDestDir);
    console.log(chalk_1.default.red(`resolvedDestDir is ${resolvedDestDir}`));
    console.log(chalk_1.default.green(`config.ext:${config.ext}`));
    const taskOptions = {
        destDir: config.determinedDestDir,
        resolvedConfig: config,
        plugins: [
            () => {
                return gulp_replace_1.default(/\[\[\w+\]\]/g, (match) => {
                    const key = match.substring(2, match.length - 2);
                    return ((typeof config.replacer === "function" && config.replacer(key)) ||
                        match);
                });
            },
            ...config.plugins,
        ],
    };
    const tasks = gulp_1.parallel(init_1.getBuildPackageTask(taskOptions), 
    // TODO: 这个任务的顺序问题，需要调整，放在这首次运行会报错
    ext_1.default(taskOptions), taskJs_1.default(taskOptions), taskJson_1.default(taskOptions), 
    // i18nTask,
    taskWxml_1.default(taskOptions), taskWxss_1.default(taskOptions), taskWxs_1.default(taskOptions), taskImage_1.default(taskOptions)
    // watchTask,
    );
    const result = await tasks((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
    console.log(chalk_1.default.red(`result:${result}`));
    return {};
}
function resolveBuildOptions(raw) {
    const resolved = {
        // target: "modules",
        // polyfillDynamicImport: false,
        // outDir: "dist",
        // assetsDir: "assets",
        // assetsInlineLimit: 4096,
        // cssCodeSplit: !raw?.lib,
        // sourcemap: false,
        // rollupOptions: {},
        // commonjsOptions: {
        //   include: [/node_modules/],
        //   extensions: [".js", ".cjs"],
        //   ...raw?.commonjsOptions,
        // },
        // dynamicImportVarsOptions: {
        //   warnOnError: true,
        //   exclude: [/node_modules/],
        //   ...raw?.dynamicImportVarsOptions,
        // },
        // minify: raw?.ssr ? false : "terser",
        // terserOptions: {},
        // cleanCssOptions: {},
        // write: true,
        // emptyOutDir: null,
        // manifest: false,
        // lib: false,
        // ssr: false,
        // ssrManifest: false,
        // brotliSize: true,
        // chunkSizeWarningLimit: 500,
        // watch: null,
        ...raw,
    };
    // // handle special build targets
    // if (resolved.target === "modules") {
    //   // Support browserslist
    //   // "defaults and supports es6-module and supports es6-module-dynamic-import",
    //   resolved.target = [
    //     "es2019",
    //     "edge88",
    //     "firefox78",
    //     "chrome87",
    //     "safari13.1",
    //   ];
    // } else if (resolved.target === "esnext" && resolved.minify === "terser") {
    //   // esnext + terser: limit to es2019 so it can be minified by terser
    //   resolved.target = "es2019";
    // }
    // // normalize false string into actual false
    // if ((resolved.minify as any) === "false") {
    //   resolved.minify = false;
    // }
    return resolved;
}
exports.resolveBuildOptions = resolveBuildOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYnVpbGQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLGdEQUF3QjtBQUN4QixzQ0FBd0Q7QUFDeEQsK0JBQWdDO0FBQ2hDLDREQUFvQztBQUNwQywwREFBa0M7QUFDbEMsc0RBQThCO0FBQzlCLDBEQUFrQztBQUNsQyx3REFBZ0M7QUFDaEMsMERBQWtDO0FBQ2xDLGlDQUE2QztBQUU3QyxnREFBNEI7QUFDNUIsZ0VBQW1DO0FBNEpuQzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsS0FBSyxDQUN6QixlQUE2QixFQUFFO0lBRS9CLHdCQUF3QjtJQUN4QixJQUFJO1FBQ0YsT0FBTyxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNwQztZQUFTO1FBQ1Isd0JBQXdCO1FBQ3hCLGlDQUFpQztRQUNqQyx1RUFBdUU7UUFDdkUsK0JBQStCO1FBQy9CLElBQUk7S0FDTDtBQUNILENBQUM7QUFiRCxzQkFhQztBQUVELEtBQUssVUFBVSxPQUFPLENBQUMsZUFBNkIsRUFBRTtJQUNwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLHNCQUFhLENBQ2hDLFlBQVksRUFDWixPQUFPLEVBQ1AsU0FBUyxFQUNULFlBQVksQ0FDYixDQUFDO0lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVwQiwwREFBMEQ7SUFDMUQsTUFBTSxlQUFlLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVoRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFD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