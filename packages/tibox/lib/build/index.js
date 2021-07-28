"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBuildOptions = exports.build = void 0;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config");
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
    const config = await config_1.resolveConfig(inlineConfig, "build", "production");
    console.log(config);
    console.log(chalk_1.default.red(`appid is ${config.appid}`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYnVpbGQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHNDQUF3RDtBQTZKeEQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLEtBQUssQ0FDekIsZUFBNkIsRUFBRTtJQUUvQix3QkFBd0I7SUFDeEIsSUFBSTtRQUNGLE9BQU8sTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDcEM7WUFBUztRQUNSLHdCQUF3QjtRQUN4QixpQ0FBaUM7UUFDakMsdUVBQXVFO1FBQ3ZFLCtCQUErQjtRQUMvQixJQUFJO0tBQ0w7QUFDSCxDQUFDO0FBYkQsc0JBYUM7QUFFRCxLQUFLLFVBQVUsT0FBTyxDQUFDLGVBQTZCLEVBQUU7SUFDcEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxzQkFBYSxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRW5ELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUlELFNBQWdCLG1CQUFtQixDQUFDLEdBQWtCO0lBQ3BELE1BQU0sUUFBUSxHQUF5QjtRQUNyQyxxQkFBcUI7UUFDckIsZ0NBQWdDO1FBQ2hDLGtCQUFrQjtRQUNsQix1QkFBdUI7UUFDdkIsMkJBQTJCO1FBQzNCLDJCQUEyQjtRQUMzQixvQkFBb0I7UUFDcEIscUJBQXFCO1FBQ3JCLHFCQUFxQjtRQUNyQiwrQkFBK0I7UUFDL0IsaUNBQWlDO1FBQ2pDLDZCQUE2QjtRQUM3QixLQUFLO1FBQ0wsOEJBQThCO1FBQzlCLHVCQUF1QjtRQUN2QiwrQkFBK0I7UUFDL0Isc0NBQXNDO1FBQ3RDLEtBQUs7UUFDTCx1Q0FBdUM7UUFDdkMscUJBQXFCO1FBQ3JCLHVCQUF1QjtRQUN2QixlQUFlO1FBQ2YscUJBQXFCO1FBQ3JCLG1CQUFtQjtRQUNuQixjQUFjO1FBQ2QsY0FBYztRQUNkLHNCQUFzQjtRQUN0QixvQkFBb0I7UUFDcEIsOEJBQThCO1FBQzlCLGVBQWU7UUFDZixHQUFHLEdBQUc7S0FDUCxDQUFDO0lBRUYsa0NBQWtDO0lBQ2xDLHVDQUF1QztJQUN2Qyw0QkFBNEI7SUFDNUIsa0ZBQWtGO0lBQ2xGLHdCQUF3QjtJQUN4QixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLG1CQUFtQjtJQUNuQixrQkFBa0I7SUFDbEIsb0JBQW9CO0lBQ3BCLE9BQU87SUFDUCw2RUFBNkU7SUFDN0Usd0VBQXdFO0lBQ3hFLGdDQUFnQztJQUNoQyxJQUFJO0lBRUosOENBQThDO0lBQzlDLDhDQUE4QztJQUM5Qyw2QkFBNkI7SUFDN0IsSUFBSTtJQUVKLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUF6REQsa0RBeURDIn0=