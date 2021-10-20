// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { Task } from "../task";
import fs from "fs-extra";
import path from "path";

export class JsonTask extends Task {
  public id(): string {
    return this.relativeToRootPath;
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    //
  }

  public override onHandle(options: ITaskManager): Promise<void> {
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
}
