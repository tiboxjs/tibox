// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { Task } from "../task";
import fs from "fs-extra";
import path from "path";
import { isNeedHandle } from "../../watcher";

export class JsonTask extends Task {
  public id(): string {
    return this.relativeToRootPath;
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    //
  }

  public override async onHandle(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies;
    if (!isDependencies(this.filePath) && !/ext/.test(this.filePath)) {
      try {
        const stats = await fs.promises.stat(this.absolutePath);
        if (isNeedHandle(this.relativeToRootPath, stats.mtimeMs)) {
          const distPath = path.join(
            this.context.config.determinedDestDir,
            this.filePath
          );
          return fs.ensureDir(path.dirname(distPath)).then(() => {
            return new Promise((resolve, reject) => {
              fs.createReadStream(path.join("src/", this.filePath))
                .pipe(fs.createWriteStream(distPath))
                .on("finish", () => {
                  resolve();
                })
                .on("error", (res) => {
                  reject(res);
                });
            });
          });
        }
      } catch (error: any) {
        if (!/no such file or directory/.test(error.message)) {
          throw error;
        }
      }
    } else {
      return Promise.resolve();
    }
  }
}
