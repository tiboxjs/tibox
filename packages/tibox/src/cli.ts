// examples/basic-usage.js
import { cac } from "cac";

import { UploadOptions } from "./upload";
import { BuildOptions } from "./build";
import { DevOptions } from "./dev";

const cli = cac("tibox");

interface GlobalCLIOptions {
  "--"?: string[];
  product?: string;
  p?: string;
  mode?: string;
  m?: string;
  config?: string;
  c?: string;
}

/**
 * removing global flags before passing as command specific sub-configs
 */
function cleanOptions(options: GlobalCLIOptions) {
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
  .action(async (root: string, options: DevOptions & GlobalCLIOptions) => {
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
  .action(async (root: string, options: BuildOptions & GlobalCLIOptions) => {
    const { build } = await import("./build");
    const buildOptions = cleanOptions(options) as BuildOptions;

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
    } catch (e) {
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
  .action(async (root: string, options: UploadOptions & GlobalCLIOptions) => {
    console.log(root, options);
  });

cli.help();
cli.version(require("../package.json").version);
cli.parse();
