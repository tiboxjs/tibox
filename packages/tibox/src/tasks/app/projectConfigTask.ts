import path from "path";
import fs from "fs-extra";
import through from "through2";
import { Context, Task } from "../task";
import { ITaskManager } from "..";
import { isNeedHandle } from "../../watcher";

export class ProjectConfigTask extends Task {
  constructor(context: Context) {
    super(context, "project.config.json");
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
    return fs.promises
      .stat(this.absolutePath)
      .then((stats) => {
        return isNeedHandle(this.relativeToRootPath, stats.mtimeMs);
      })
      .then((needHandle) => {
        if (needHandle) {
          return new Promise((resolve, reject) => {
            fs.createReadStream(this.absolutePath)
              .pipe(
                through.obj((buffer, encode, cb) => {
                  const projectConfigJson = JSON.parse(buffer.toString());
                  projectConfigJson.appid = this.context.config.appid;
                  projectConfigJson.projectname =
                    this.context.config.determinedProjectName;
                  buffer = Buffer.from(
                    JSON.stringify(projectConfigJson, null, 2)
                  );
                  cb(null, buffer);
                })
              )
              .pipe(
                fs.createWriteStream(
                  path.join(
                    this.context.config.determinedDestDir,
                    this.filePath
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
        } else {
          return Promise.resolve();
        }
      });
  }
}
