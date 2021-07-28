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
Object.defineProperty(exports, "__esModule", { value: true });
// examples/basic-usage.js
const cac_1 = require("cac");
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
    return ret;
}
cli
    .command("[root]")
    .alias("dev")
    .option("-p, --product [product]", "指定一个product参数", {
    default: "default",
})
    .option("-m, --mode [mode]", "指定一个mode参数", {
    default: "development",
})
    .action(async (root, options) => {
    // TODO: 未实现
    console.log(root, options);
});
cli
    .command("build [root]", "构建小程序")
    .option("-p, --product [product]", "指定一个product参数", {
    default: "default",
})
    .option("-m, --mode [mode]", "指定一个mode参数", {
    default: "development",
})
    .option("-c, --config [config]", "指定一个配置文件路径", {
    default: "tibox.config.js",
})
    .action(async (root, options) => {
    const { build } = await Promise.resolve().then(() => __importStar(require("./build")));
    const buildOptions = cleanOptions(options);
    try {
        await build({
            root,
            product: options.product,
            mode: options.mode,
            configFile: options.config,
            // logLevel: options.logLevel,
            // clearScreen: options.clearScreen,
            build: buildOptions,
        });
    }
    catch (e) {
        // createLogger(options.logLevel).error(
        //   chalk.red(`error during build:\n${e.stack}`)
        // );
        process.exit(1);
    }
});
cli
    .command("upload [root]", "构建小程序")
    .option("-p, --product [product]", "指定一个product参数", {
    default: "default",
})
    .option("-m, --mode [mode]", "指定一个mode参数", {
    default: "development",
})
    .option("--private-key-path <privateKeyPath>", "指定一个privateKeyPath参数")
    .option("--desc <desc>", "指定一个版本描述")
    .action(async (root, options) => {
    console.log(root, options);
});
cli.help();
cli.version(require("../package.json").version);
cli.parse();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQkFBMEI7QUFDMUIsNkJBQTBCO0FBTTFCLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQVl6Qjs7R0FFRztBQUNILFNBQVMsWUFBWSxDQUFDLE9BQXlCO0lBQzdDLE1BQU0sR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQztJQUMzQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDaEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2IsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDO0lBQ25CLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNiLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUNsQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDYixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxHQUFHO0tBQ0EsT0FBTyxDQUFDLFFBQVEsQ0FBQztLQUNqQixLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ1osTUFBTSxDQUFDLHlCQUF5QixFQUFFLGVBQWUsRUFBRTtJQUNsRCxPQUFPLEVBQUUsU0FBUztDQUNuQixDQUFDO0tBQ0QsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFlBQVksRUFBRTtJQUN6QyxPQUFPLEVBQUUsYUFBYTtDQUN2QixDQUFDO0tBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFZLEVBQUUsT0FBc0MsRUFBRSxFQUFFO0lBQ3JFLFlBQVk7SUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUVMLEdBQUc7S0FDQSxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztLQUNoQyxNQUFNLENBQUMseUJBQXlCLEVBQUUsZUFBZSxFQUFFO0lBQ2xELE9BQU8sRUFBRSxTQUFTO0NBQ25CLENBQUM7S0FDRCxNQUFNLENBQUMsbUJBQW1CLEVBQUUsWUFBWSxFQUFFO0lBQ3pDLE9BQU8sRUFBRSxhQUFhO0NBQ3ZCLENBQUM7S0FDRCxNQUFNLENBQUMsdUJBQXVCLEVBQUUsWUFBWSxFQUFFO0lBQzdDLE9BQU8sRUFBRSxpQkFBaUI7Q0FDM0IsQ0FBQztLQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBWSxFQUFFLE9BQXdDLEVBQUUsRUFBRTtJQUN2RSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsd0RBQWEsU0FBUyxHQUFDLENBQUM7SUFDMUMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBaUIsQ0FBQztJQUUzRCxJQUFJO1FBQ0YsTUFBTSxLQUFLLENBQUM7WUFDVixJQUFJO1lBQ0osT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixVQUFVLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDMUIsOEJBQThCO1lBQzlCLG9DQUFvQztZQUNwQyxLQUFLLEVBQUUsWUFBWTtTQUNwQixDQUFDLENBQUM7S0FDSjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1Ysd0NBQXdDO1FBQ3hDLGlEQUFpRDtRQUNqRCxLQUFLO1FBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUMsQ0FBQyxDQUFDO0FBRUwsR0FBRztLQUNBLE9BQU8sQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDO0tBQ2pDLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRSxlQUFlLEVBQUU7SUFDbEQsT0FBTyxFQUFFLFNBQVM7Q0FDbkIsQ0FBQztLQUNELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLEVBQUU7SUFDekMsT0FBTyxFQUFFLGFBQWE7Q0FDdkIsQ0FBQztLQUNELE1BQU0sQ0FBQyxxQ0FBcUMsRUFBRSxzQkFBc0IsQ0FBQztLQUNyRSxNQUFNLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQztLQUNuQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQVksRUFBRSxPQUF5QyxFQUFFLEVBQUU7SUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFTCxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyJ9