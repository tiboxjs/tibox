import fs from "fs-extra";
import path from "path";
import { absolute2Relative, matchImportWxssFile } from "../../utils";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import _ from "lodash";

export class WxssTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    const matchedResult = await matchImportWxssFile(
      path.resolve(this.config.root, path.join("src", this.filePath))
    );

    await Promise.all(
      _.map(matchedResult, (item) => {
        if (!/\.wxss$/.test(item)) {
          item += ".wxss";
        }
        const res = path.normalize(
          path.isAbsolute(item)
            ? absolute2Relative(this.config.root, item)
            : path.join(path.dirname(this.filePath), item)
        );

        return options.onRegistWxssFileCallback(res);
      })
    );
  }
  public handle(): Promise<void> {
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
  }
}
