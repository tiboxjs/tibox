// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import fs from "fs-extra";
import path from "path";

export class JsonTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    const distPath = path.join(this.config.determinedDestDir, this.filePath);
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
