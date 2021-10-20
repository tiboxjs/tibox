import path from "path";
import { absolute2Relative, matchImportJsFile } from "../../utils";
import { ITaskManager } from "..";
import { Task } from "../task";
import _ from "lodash";
import fs from "fs-extra";
import { createLogger } from "../../logger";
import chalk from "chalk";

export class JsTask extends Task {
  public id(): string {
    return this.relativeToRootPath;
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    this.tasks = [];
    const isDependencies = this.context.config.isDependencies;
    if (!isDependencies(this.filePath) && !/ext/.test(this.filePath)) {
      if ((await fs.promises.stat(this.absolutePath)).isFile()) {
        this.isVirtual = false;
        const matchedResult = await matchImportJsFile(this.absolutePath);

        const jsTasks = await Promise.all(
          _.map(matchedResult, (item) => {
            if (!isDependencies(item) && !/\.js$/.test(item)) {
              item += ".js";
            }
            const filePath = path.normalize(
              path.isAbsolute(item)
                ? absolute2Relative(this.context.config.root, item)
                : isDependencies(item)
                ? item
                : path.join(path.dirname(this.filePath), item)
            );
            return options.onRegistJsTaskCallback(filePath);
          })
        );
        this.tasks = jsTasks;
      } else {
        this.isVirtual = true;
        createLogger().info(
          chalk.yellow(`${this.absolutePath} 文件不存在，忽略解析`)
        );
      }
    } else {
      // TODO: extjs需要如何处理?
    }
  }

  public override onHandle(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies;
    if (!isDependencies(this.filePath) && !/ext/.test(this.filePath)) {
      const distPath = path.join(
        this.context.config.determinedDestDir,
        this.filePath
      );
      return fs.ensureDir(path.dirname(distPath)).then(() => {
        return new Promise((resolve, reject) => {
          fs.createReadStream(path.join("src", this.filePath))
            .pipe(fs.createWriteStream(distPath))
            .on("finish", () => {
              resolve();
            })
            .on("error", (res) => {
              reject(res);
            });
        });
      });
    } else {
      return Promise.resolve();
    }
  }
}
