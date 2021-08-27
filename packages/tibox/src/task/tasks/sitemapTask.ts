import { dest, src } from "gulp";
import path from "path";
import { isFileExist, isWindows } from "../../utils";
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
            src(this.filePath)
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
        }
      }
    );
  }
}
