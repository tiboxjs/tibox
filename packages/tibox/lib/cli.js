"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// examples/basic-usage.js
const cac_1 = require("cac");
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = require("./logger");
const cli = cac_1.cac("tibox");
/**
 * removing global flags before passing as command specific sub-configs
 */
function cleanOptions(options) {
    const ret = { ...options };
    delete ret["--"];
    delete ret.mode;
    delete ret.m;
    delete ret.product;
    delete ret.p;
    delete ret.config;
    delete ret.c;
    delete ret.logLevel;
    // delete ret.clearScreen
    return ret;
}
cli
    .option("-c, --config <config>", "[string] 指定一个配置文件路径", {
    default: "tibox.config.js",
})
    .option("-l, --logLevel <level>", `[string] info | warn | error | silent`)
    // .option('--clearScreen', `[boolean] allow/disable clear screen when logging`)
    // .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
    // .option('-f, --filter <filter>', `[string] filter debug logs`)
    .option("-p, --product <product>", `[string] 设置product`, {
    default: "default",
})
    .option("-m, --mode <mode>", `[string] 设置mode，内置development、production，也可以是其他自定义的值`, {
    default: "development",
});
cli
    .command("[root]")
    .alias("dev")
    .action(async (root, options) => {
    const { dev } = await Promise.resolve().then(() => __importStar(require("./dev")));
    const devOptions = cleanOptions(options);
    try {
        await dev({
            root,
            product: options.product,
            mode: options.mode,
            configFile: options.config,
            logLevel: options.logLevel,
            // clearScreen: options.clearScreen,
            dev: devOptions,
        });
    }
    catch (e) {
        logger_1.createLogger(options.logLevel).error(chalk_1.default.red(`error during build:\n${e.stack}`));
        process.exit(1);
    }
});
cli
    .command("build [root]", "构建小程序")
    .action(async (root, options) => {
    logger_1.createLogger(options.logLevel).warn(chalk_1.default.green(`root:${root}, options:${JSON.stringify(options, null, 2)}`));
    const { build } = await Promise.resolve().then(() => __importStar(require("./build")));
    const buildOptions = cleanOptions(options);
    try {
        await build({
            root,
            product: options.product,
            mode: options.mode,
            configFile: options.config,
            logLevel: options.logLevel,
            // clearScreen: options.clearScreen,
            build: buildOptions,
        });
    }
    catch (e) {
        logger_1.createLogger(options.logLevel).error(chalk_1.default.red(`error during build:\n${e.stack}`));
        process.exit(1);
    }
});
cli
    .command("upload [root]", "上传小程序")
    .option("--private-key-path <privateKeyPath>", "指定一个privateKeyPath参数")
    .option("--desc <desc>", "指定一个版本描述")
    .action(async (root, options) => {
    // TODO: 未实现
    console.log(root, options);
});
cli.help();
cli.version(require("../package.json").version);
cli.parse();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQkFBMEI7QUFDMUIsNkJBQTBCO0FBQzFCLGtEQUEwQjtBQUkxQixxQ0FBa0Q7QUFFbEQsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBY3pCOztHQUVHO0FBQ0gsU0FBUyxZQUFZLENBQUMsT0FBeUI7SUFDN0MsTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBQzNCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztJQUNoQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDYixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDbkIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2IsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNiLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQztJQUNwQix5QkFBeUI7SUFDekIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsR0FBRztLQUNBLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxxQkFBcUIsRUFBRTtJQUN0RCxPQUFPLEVBQUUsaUJBQWlCO0NBQzNCLENBQUM7S0FDRCxNQUFNLENBQUMsd0JBQXdCLEVBQUUsdUNBQXVDLENBQUM7SUFDMUUsZ0ZBQWdGO0lBQ2hGLHNFQUFzRTtJQUN0RSxpRUFBaUU7S0FDaEUsTUFBTSxDQUFDLHlCQUF5QixFQUFFLG9CQUFvQixFQUFFO0lBQ3ZELE9BQU8sRUFBRSxTQUFTO0NBQ25CLENBQUM7S0FDRCxNQUFNLENBQ0wsbUJBQW1CLEVBQ25CLHNEQUFzRCxFQUN0RDtJQUNFLE9BQU8sRUFBRSxhQUFhO0NBQ3ZCLENBQ0Ys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