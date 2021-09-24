import path from "path";
import { absolute2Relative, isWindows, matchImportJsFile } from "../../utils";
import { ITaskManager } from "..";
// import { ResolvedConfig } from "..";
import { SingleTask } from "../task";
import _ from "lodash";
import { dest, src } from "gulp";
import fs from "fs-extra";
import { createLogger } from "../../logger";
import chalk from "chalk";

export class JsTask extends SingleTask {
  // constructor(config: ResolvedConfig, filePath: string) {
  //   super(config, filePath);
  // }

  public async init(options: ITaskManager): Promise<void> {
    if (
      !this.config.isDependencies(this.filePath) &&
      !/ext/.test(this.filePath)
    ) {
      const fileAbsolutePath = path.resolve(
        this.config.root,
        path.join("src", this.filePath)
      );
      if ((await fs.promises.stat(fileAbsolutePath)).isFile()) {
        const matchedResult = await matchImportJsFile(fileAbsolutePath);

        await Promise.all(
          _.map(matchedResult, (item) => {
            if (!this.config.isDependencies(item) && !/\.js$/.test(item)) {
              item += ".js";
            }
            const res = path.normalize(
              path.isAbsolute(item)
                ? absolute2Relative(this.config.root, item)
                : this.config.isDependencies(item)
                ? item
                : path.join(path.dirname(this.filePath), item)
            );

            return options.onRegistJsFileCallback(res);
          })
        );
      } else {
        createLogger().info(
          chalk.yellow(`${fileAbsolutePath} 文件不存在，忽略解析`)
        );
      }
    } else {
      // TODO ext.js文件的处理还未考虑
    }
  }

  public handle(): Promise<void> {
    if (
      !this.config.isDependencies(this.filePath) &&
      !/ext/.test(this.filePath)
    ) {
      return new Promise((resolve, reject) => {
        let source = src(path.join("src", this.filePath));
        for (let index = 0; index < this.config.plugins.length; index++) {
          source = source.pipe(this.config.plugins[index].handle(this.config));
        }

        source
          .pipe(
            dest(
              isWindows
                ? this.config.determinedDestDir
                : path.dirname(
                    path.join(this.config.determinedDestDir, this.filePath)
                  )
            )
          )
          .on("finish", () => {
            resolve();
          })
          .on("error", (res) => {
            reject(res);
          });
      });
    } else {
      return Promise.resolve();
    }
  }
}
