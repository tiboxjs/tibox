import { InlineConfig, resolveConfig } from "../config";
import chokidar from "chokidar";
import ora from "ora";
import _ from "lodash";
import { parse } from "../parse";
import { cmdCli, traceOutUnuse } from "../utils";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { debounce } from "throttle-debounce";
import { exec } from "child_process";
import chalk from "chalk";

export interface DevOptions {
  mock: boolean;
}

export type ResolvedDevOptions = Required<Omit<DevOptions, "base">>;

export type DevOutput = {};

/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
export async function dev(inlineConfig: InlineConfig = {}): Promise<DevOutput> {
  // parallelCallCounts++;
  try {
    return await doDev(inlineConfig);
  } finally {
    // parallelCallCounts--;
    // if (parallelCallCounts <= 0) {
    //   await Promise.all(parallelBuilds.map((bundle) => bundle.close()));
    //   parallelBuilds.length = 0;
    // }
  }
}
async function doDev(inlineConfig: InlineConfig = {}): Promise<DevOutput> {
  // const logger = createLogger(inlineConfig.logLevel);
  // // One-liner for current directory
  // const root = inlineConfig.root || ".";
  // 不监听 package.json、tibox.config.js、.env.*
  const needWatches = [
    "src/",
    "sitemap.json",
    "package.json",
    "project.config.json" /* , "tailwind.config.js", "tailwind/", "svg/" */,
  ];
  // const resolvedPath = path.resolve(root, "src/");
  // logger.info(chalk.green(`resolvedPath: ${resolvedPath}`));

  const spinner = ora("解析配置文件...").start();
  const config = await resolveConfig(
    inlineConfig,
    "dev",
    "default",
    "production"
  );

  spinner.text = "处理ext文件";
  // TODO: ext.js的处理，还得优化，暂时让小程序跑起来
  await fs.ensureDir(
    path.resolve(config.root, config.determinedDestDir, "ext")
  );

  const stream = fs.createWriteStream(
    path.resolve(config.root, `${config.determinedDestDir}/ext/ext.js`),
    { flags: "w" }
  );
  stream.write(
    Buffer.from(
      `module.exports = ${JSON.stringify(config.ext || {}, null, 2)}${os.EOL}`
    )
  );

  spinner.text = "解析项目目录文件";
  const parseResult = await parse(config);

  const debounceFunction = debounce(250, false, async () => {
    const watchingSpinner = ora("处理中...").start();
    const start = Date.now();

    await parseResult.taskManager.init();

    await parseResult.taskManager.handle(watchingSpinner);

    const time = Date.now() - start;
    let str;
    if (time < 1000) {
      str = chalk.greenBright(`${time}ms`);
    } else if (time < 3000) {
      str = chalk.yellowBright(`${time}ms`);
    } else {
      str = chalk.redBright(`${time}ms`);
    }
    watchingSpinner.succeed(`处理完成 耗时: ${str}`);
  });

  chokidar
    .watch(
      _.map(needWatches, (item) => path.resolve(config.root, item)),
      {
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/simpleService.d.ts",
          "**/simpleService.js",
        ],
        cwd: config.root,
        // ignoreInitial: true,
      }
    )
    .on("all", async (event, filePath) => {
      // createLogger().info(chalk.grey(`${event}, ${ppath}`));
      await debounceFunction();
    })
    .on("ready", async () => {
      await traceOutUnuse(
        parseResult.taskManager.context,
        parseResult.taskManager.wholeTask
      );
      spinner.succeed("初始化完成，开始监听...");
      const cliCMD = cmdCli();
      const cmd = `${cliCMD} open --project "${path.resolve(
        config.root,
        config.determinedDestDir
      )}"`;
      const cliSpinner = ora("正在启动开发工具...").start();
      exec(cmd, { timeout: 10000 }, (err) => {
        if (err) {
          cliSpinner.fail("微信开发者工具未能自动启动");
        } else {
          cliSpinner.succeed("开发工具启动完成");
        }
      });
    })
    .on("error", (error) => {
      spinner.warn(error.stack);
      spinner.fail(error.message);
    });
  // .on("add", (ppath) => {
  //   // handleFile("add", ppath);
  // })
  // .on("change", async (ppath) => {
  //   // handleFile("change", ppath);
  // });
  // parallel(extTask(taskOptions))((err) => {
  //   console.error(chalk.red(err));
  // });
  // await extTask(taskOptions);
  return {} as DevOutput;
}
