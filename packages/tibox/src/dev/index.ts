import { InlineConfig, resolveConfig } from "../config";
import chokidar from "chokidar";
import ora from "ora";
import chalk from "chalk";
import _ from "lodash";
import { parse } from "../parse";
import { createLogger } from "../logger";
import { cmdCli, parseDir, prune } from "../utils";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { debounce } from "throttle-debounce";
import { exec } from "child_process";

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
  spinner.text = "解析小程序文件依赖关系";
  await parseResult.taskManager.handle();
  const allValidDestFiles = _.map(
    parseResult.taskManager.wholeTask,
    (task) => task.filePath
  );

  spinner.text = `扫描${config.determinedDestDir}目录无用文件`;
  const allDestFiles = _.map(
    await parseDir(path.resolve(config.root, config.determinedDestDir), {
      recursive: true,
      ignore: /(node_modules|miniprogram_npm)/,
    }),
    (filePath: string) =>
      path.relative(path.join(config.root, config.determinedDestDir), filePath)
  );

  const unuseFiles = _.pull(allDestFiles, ...allValidDestFiles);
  if (unuseFiles.length) {
    spinner.info("移除无用文件");
    _.forEach(unuseFiles, (item) => {
      spinner.info(item);
    });
    await Promise.all(
      _.map(unuseFiles, (unuseItem) =>
        prune(path.resolve(config.root, config.determinedDestDir, unuseItem))
      )
    );
  }

  const debounceFunction = debounce(250, false, async () => {
    const start = Date.now();
    const watchingSpinner = ora("处理中...").start();
    await parseResult.taskManager.handle();
    watchingSpinner.succeed(`完成 ${Date.now() - start}ms`);
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
        ignoreInitial: true,
      }
    )
    .on("all", async (event, ppath) => {
      createLogger().info(chalk.grey(`${event}, ${ppath}`));
      await debounceFunction();
      // await parseResult.taskManager.handle();
    })
    .on("ready", () => {
      spinner.succeed("初始化完成，开始监听...");
      const cliCMD = cmdCli();
      const cmd = `${cliCMD} open --project "${path.resolve(
        config.root,
        config.determinedDestDir
      )}"`;
      const cliSpinner = ora("正在启动开发工具:" + cmd).start();
      exec(cmd, { timeout: 10000 }, (err) => {
        if (err) {
          cliSpinner.fail(err.message);
          createLogger().error(chalk.red(err));
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
