import { InlineConfig, resolveConfig } from "../config";
// import chokidar from "chokidar";
// import { createLogger } from "../logger";
import chalk from "chalk";
// import { parallel } from "gulp";
// import wxmlTask from "./taskWxml";
// import replace from "gulp-replace";
// import { TaskOptions } from "../libs/options";
// import Undertaker from "undertaker";
// import wxssTask from "./taskWxss";
// import jsonTask from "./taskJson";
// import jsTask from "./taskJs";
// import imageTask from "./taskImage";
import _ from "lodash";
// import { getBuildPackageTask } from "./init";
// import extTask from "./ext";
import { parse } from "../parse";
import { createLogger } from "../logger";
import { parseDir, prune } from "../utils";
import path from "path";
import fs from "fs-extra";
import os from "os";

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
  // // 不监听 package.json、tibox.config.js、.env.*
  // const needWatches = [
  //   "src/",
  //   "project.config.json" /* , "tailwind.config.js", "tailwind/", "svg/" */,
  // ];
  // const resolvedPath = path.resolve(root, "src/");
  // logger.info(chalk.green(`resolvedPath: ${resolvedPath}`));

  const config = await resolveConfig(
    inlineConfig,
    "dev",
    "default",
    "production"
  );
  // const taskOptions: TaskOptions = {
  //   destDir: config.determinedDestDir,
  //   resolvedConfig: config,
  //   plugins: [
  //     () => {
  //       return replace(/\[\[\w+\]\]/g, (match) => {
  //         const key = match.substring(2, match.length - 2);
  //         return (
  //           (typeof config.replacer === "function" && config.replacer(key)) ||
  //           match
  //         );
  //       });
  //     },
  //     ...config.plugins,
  //   ],
  // };

  // async function handleFile(
  //   eventName: "add" | "change",
  //   ppath: string
  // ): Promise<void> {
  //   const extName = path.extname(ppath);
  //   const asyncTasks: Undertaker.Task[] = [];
  // const root = config.root;

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

  const parseResult = await parse(config);
  await parseResult.taskManager.handle();
  const allValidDestFiles = parseResult.taskManager.destPaths();

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
    createLogger().info(
      chalk.yellowBright(
        `移除unuseFiles: ${JSON.stringify(unuseFiles, null, 2)}`
      )
    );
    await Promise.all(
      _.map(unuseFiles, (unuseItem) =>
        prune(path.resolve(config.root, config.determinedDestDir, unuseItem))
      )
    );
  }

  // const taskOptions: TaskOptions = {
  //   destDir: config.determinedDestDir,
  //   resolvedConfig: config,
  //   plugins: [
  //     () => {
  //       return replace(/\[\[\w+\]\]/g, (match) => {
  //         const key = match.substring(2, match.length - 2);
  //         return (
  //           (typeof config.replacer === "function" && config.replacer(key)) ||
  //           match
  //         );
  //       });
  //     },
  //     ...config.plugins,
  //   ],
  // };

  //   const options = taskOptions;
  //   const filePath = path.relative(
  //     path.resolve(inlineConfig.root || process.cwd(), "src/"),
  //     ppath
  //   );
  //   // logger.info(chalk.gray(`ext:${extName} path:${filePath}`));
  //   if (/(project\.config\.json)|(package\.json)$/.test(filePath)) {
  //     const taskFn = getBuildPackageTask(options);
  //     await taskFn((err) => {
  //       if (err) {
  //         console.error(err);
  //         process.exit(1);
  //       }
  //     });
  //   } else {
  //     switch (extName) {
  //       case ".wxml":
  //         asyncTasks.push(wxmlTask(options, filePath));
  //         break;
  //       case ".wxss":
  //         asyncTasks.push(wxssTask(options, filePath));
  //         break;
  //       case ".json":
  //         asyncTasks.push(jsonTask(options, filePath));
  //         break;
  //       case ".js":
  //         asyncTasks.push(jsTask(options, filePath));
  //         break;
  //       case ".jpg":
  //       case ".gif":
  //       case ".png":
  //       case ".bmp":
  //       case ".svg":
  //         asyncTasks.push(imageTask(options, filePath));
  //         break;
  //     }
  //     if (asyncTasks.length) {
  //       const tasks = parallel(asyncTasks);
  //       await tasks((err) => {
  //         if (err) {
  //           console.error(err);
  //           process.exit(1);
  //         }
  //       });
  //     }

  //     // logger.info(
  //     //   chalk.green(
  //     //     `${eventName} ${path.relative(
  //     //       inlineConfig.root || process.cwd(),
  //     //       ppath
  //     //     )}`
  //     //   )
  //     // );
  //   }
  // }
  // parallel(extTask(taskOptions))((err) => {
  //   console.error(chalk.red(err));
  // });
  // await extTask(taskOptions);
  // chokidar
  //   .watch(
  //     _.map(needWatches, (item) => path.resolve(root, item)),
  //     {
  //       ignored: ["**/node_modules/**", "**/.git/**"],
  //     }
  //   )
  //   .on("add", (ppath) => {
  //     handleFile("add", ppath);
  //   })
  //   .on("change", async (ppath) => {
  //     handleFile("change", ppath);
  //   });
  return {} as DevOutput;
}
