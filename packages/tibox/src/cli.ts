// examples/basic-usage.js
import { cac } from "cac";
import chalk from "chalk";
import { UploadOptions } from "./upload";
import { BuildOptions } from "./build";
import { DevOptions } from "./dev";
import { createLogger, LogLevel } from "./logger";

import { build, PluginBuild } from "esbuild";

const cli = cac("tibox");
interface GlobalCLIOptions {
  "--"?: string[];
  product?: string;
  p?: string;
  mode?: string;
  m?: string;
  config?: string;
  c?: string;
  l?: LogLevel;
  logLevel?: LogLevel;
  // clearScreen?: boolean;
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
  .option(
    "-m, --mode <mode>",
    `[string] 设置mode，内置development、production，也可以是其他自定义的值`,
    {
      default: "development",
    }
  );

cli
  .command("[root]")
  .alias("dev")
  .action(async (root: string, options: DevOptions & GlobalCLIOptions) => {
    const { dev } = await import("./dev");
    const devOptions = cleanOptions(options) as DevOptions;
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
    } catch (e: any) {
      createLogger(options.logLevel).error(
        chalk.red(`error during build:\n${e.stack}`)
      );
      process.exit(1);
    }
  });

cli
  .command("build [root]", "构建小程序")
  .action(async (root: string, options: BuildOptions & GlobalCLIOptions) => {
    createLogger(options.logLevel).warn(
      chalk.green(`root:${root}, options:${JSON.stringify(options, null, 2)}`)
    );
    const { build } = await import("./build");
    const buildOptions = cleanOptions(options) as BuildOptions;

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
    } catch (e: any) {
      createLogger(options.logLevel).error(
        chalk.red(`error during build:\n${e.stack}`)
      );
      process.exit(1);
    }
  });

cli
  .command("upload [root]", "上传小程序")
  .option("--private-key-path <privateKeyPath>", "指定一个privateKeyPath参数")
  .option("--desc <desc>", "指定一个版本描述")
  .action(async (root: string, options: UploadOptions & GlobalCLIOptions) => {
    // TODO: 未实现
    // console.log(root, options);

    const envPlugin = {
      name: "env",
      setup(build: PluginBuild) {
        console.log(chalk.yellow(`env plugin setup function`));
        // Intercept import paths called "env" so esbuild doesn't attempt
        // to map them to a file system location. Tag them with the "env-ns"
        // namespace to reserve them for this plugin.
        build.onResolve({ filter: /^env$/ }, (args) => ({
          path: args.path,
          namespace: "env-ns",
        }));

        // Load paths tagged with the "env-ns" namespace and behave as if
        // they point to a JSON file containing the environment variables.
        build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => ({
          contents: JSON.stringify(process.env),
          loader: "json",
        }));
      },
    };

    await build({
      entryPoints: ["src/app.js"],
      outfile: "dist/app.js",
      charset: "utf8",
      plugins: [envPlugin],
    });
  });

cli.help();
cli.version(require("../package.json").version);
cli.parse();
