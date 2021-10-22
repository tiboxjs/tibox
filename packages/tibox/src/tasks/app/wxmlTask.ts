import path from "path";
import fs from "fs-extra";
import { absolute2Relative, matchImportWxmlFile } from "../../utils";
import { ITaskManager } from "..";
import { Task } from "../task";
import _ from "lodash";
import { isNeedHandle } from "../../watcher";

export class WxmlTask extends Task {
  public id(): string {
    return this.relativeToRootPath;
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies;
    if (!isDependencies(this.filePath) && !/ext/.test(this.filePath)) {
      const matchedResult = await matchImportWxmlFile(
        path.resolve(this.context.config.root, path.join("src", this.filePath))
      );

      const wxmlTasks = await Promise.all(
        _.map(matchedResult, (item) => {
          if (!/\.wxml$/.test(item)) {
            item += ".wxml";
          }
          const filePath = path.normalize(
            path.isAbsolute(item)
              ? absolute2Relative(this.context.config.root, item)
              : path.join(path.dirname(this.filePath), item)
          );

          return options.onRegistWxmlTaskCallback(filePath);
        })
      );
      this.tasks = wxmlTasks || [];
    }
  }

  public override onHandle(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies;
    if (!isDependencies(this.filePath) && !/ext/.test(this.filePath)) {
      return fs.promises
        .stat(this.absolutePath)
        .then((stats) => {
          return isNeedHandle(this.relativeToRootPath, stats.mtimeMs);
        })
        .then((needHandle) => {
          if (needHandle) {
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
        });
    } else {
      return Promise.resolve();
    }
  }
}
