import { InlineConfig, resolveConfig } from "../config";
import chokidar from "chokidar";
import path from "path";
import { createLogger } from "../logger";
import chalk from "chalk";
import { parallel } from "gulp";
import wxmlTask from "./taskWxml";
import replace from "gulp-replace";
import { TaskOptions } from "../libs/options";
import Undertaker from "undertaker";
import wxssTask from "./taskWxss";
import jsonTask from "./taskJson";
import jsTask from "./taskJs";
import imageTask from "./taskImage";
import _ from "lodash";

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
  // One-liner for current directory
  const root = inlineConfig.root || ".";
  // 不监听 package.json、tibox.config.js、.env.*
  const needWatches = ["src/"/* , "tailwind.config.js", "tailwind/", "svg/" */];
  const resolvedPath = path.resolve(root, "src/");
  createLogger().info(chalk.green(`resolvedPath: ${resolvedPath}`));
  chokidar
    .watch(
      _.map(needWatches, (item) => path.resolve(root, item)),
      {
        ignored: ["**/node_modules/**", "**/.git/**"],
      }
    )
    .on("add", (ppath) => {
      console.log(
        "add",
        path.relative(inlineConfig.root || process.cwd(), ppath)
      );
    })
    .on("change", async (ppath) => {
      const config = await resolveConfig(
        inlineConfig,
        "dev",
        "default",
        "production"
      );
      const taskOptions: TaskOptions = {
        destDir: config.determinedDestDir,
        resolvedConfig: config,
        plugins: [
          () => {
            return replace(/\[\[\w+\]\]/g, (match) => {
              const key = match.substring(2, match.length - 2);
              return (
                (typeof config.replacer === "function" &&
                  config.replacer(key)) ||
                match
              );
            });
          },
          ...config.plugins,
        ],
      };

      const extName = path.extname(ppath);
      console.log(`extName:${extName} ppath:${ppath}`);
      const asyncTasks: Undertaker.Task[] = [];
      switch (extName) {
        case ".wxml":
          asyncTasks.push(
            wxmlTask(
              taskOptions,
              path.relative(
                path.resolve(inlineConfig.root || process.cwd(), "src/"),
                ppath
              )
            )
          );
          break;
        case ".wxss":
          asyncTasks.push(
            wxssTask(
              taskOptions,
              path.relative(
                path.resolve(inlineConfig.root || process.cwd(), "src/"),
                ppath
              )
            )
          );
          break;
        case ".json":
          asyncTasks.push(
            jsonTask(
              taskOptions,
              path.relative(
                path.resolve(inlineConfig.root || process.cwd(), "src/"),
                ppath
              )
            )
          );
          break;
        case ".js":
          asyncTasks.push(
            jsTask(
              taskOptions,
              path.relative(
                path.resolve(inlineConfig.root || process.cwd(), "src/"),
                ppath
              )
            )
          );
          break;
        case ".jpg":
        case ".gif":
        case ".png":
        case ".bmp":
        case ".svg":
          asyncTasks.push(
            imageTask(
              taskOptions,
              path.relative(
                path.resolve(inlineConfig.root || process.cwd(), "src/"),
                ppath
              )
            )
          );
          break;
      }
      if (asyncTasks.length) {
        const tasks = parallel(asyncTasks);
        await tasks((err) => {
          if (err) {
            console.error(err);
            process.exit(1);
          }
        });
      }

      console.log(
        "change",
        path.relative(inlineConfig.root || process.cwd(), ppath)
      );
    });
  return {} as DevOutput;
}
