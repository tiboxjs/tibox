import path from "path";
import { absolute2Relative, matchImportJsFile } from "../../utils";
import { ITaskManager } from "..";
// import { ResolvedConfig } from "..";
import { SingleTask } from "../task";
import _ from "lodash";
import fs from "fs-extra";
import { createLogger } from "../../logger";
import chalk from "chalk";
// import through from "through2";

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
        fs.createReadStream(path.join("src", this.filePath))
          .pipe(
            fs.createWriteStream(
              path.join(this.config.determinedDestDir, this.filePath)
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
