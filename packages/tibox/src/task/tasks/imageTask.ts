import { dest, src } from "gulp";
import path from "path";
import { ITaskManager } from "..";
import { isWindows } from "../../utils";
import { SingleTask } from "../task";

export class ImageTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    return new Promise((resolve, reject) => {
      src(path.join("src", this.filePath))
        .pipe(
          dest(
            isWindows
              ? this.config.determinedDestDir
              : path.dirname(
                  `${this.config.determinedDestDir}/${this.filePath}`
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
