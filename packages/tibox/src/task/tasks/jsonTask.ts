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
    return new Promise((resolve, reject) => {
      fs.createReadStream(path.join("src/", this.filePath))
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
  }
}
