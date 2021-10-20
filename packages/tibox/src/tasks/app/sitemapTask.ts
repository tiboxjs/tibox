import fs from "fs-extra";
import path from "path";
import { isFileExist } from "../../utils";
import { ITaskManager } from "..";
import { Context, Task } from "../task";

export class SitemapTask extends Task {
  constructor(context: Context) {
    super(context, "sitemap.json");
  }
  public id(): string {
    return this.relativeToRootPath;
  }

  override get relativeToRootPath(): string {
    return path.relative(this.context.config.root, this.filePath);
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    //
  }
  public override onHandle(options: ITaskManager): Promise<void> {
    return isFileExist(
      path.resolve(this.context.config.root, this.filePath)
    ).then((flag) => {
      if (flag) {
        return new Promise((resolve, reject) => {
          fs.createReadStream(this.filePath)
            .pipe(
              fs.createWriteStream(
                path.join(this.context.config.determinedDestDir, this.filePath)
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
    });
  }
}
