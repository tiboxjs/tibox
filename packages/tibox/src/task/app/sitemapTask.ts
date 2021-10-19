import fs from "fs-extra";
import path from "path";
import { isFileExist } from "../../utils";
import { ITaskManager } from "..";
import { SingleTask } from "../task";

export class SitemapTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    return isFileExist(path.resolve(this.config.root, this.filePath)).then(
      (flag) => {
        if (flag) {
          return new Promise((resolve, reject) => {
            fs.createReadStream(this.filePath)
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
    );
  }
}
