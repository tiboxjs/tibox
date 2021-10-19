import { ResolvedConfig } from "../..";
import path from "path";
import fs from "fs-extra";
import through from "through2";
import { SingleTask } from "../task";
import { ITaskManager } from "..";

export class ProjectConfigTask extends SingleTask {
  constructor(config: ResolvedConfig, filePath: string) {
    super(config, filePath);
  }
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    return new Promise((resolve, reject) => {
      const [configJsonFile] = this.fileList();
      fs.createReadStream(configJsonFile)
        .pipe(
          through.obj((buffer, encode, cb) => {
            const projectConfigJson = JSON.parse(buffer.toString());
            projectConfigJson.appid = this.config.appid;
            projectConfigJson.projectname = this.config.determinedProjectName;
            buffer = Buffer.from(JSON.stringify(projectConfigJson, null, 2));
            cb(null, buffer);
          })
        )
        .pipe(
          fs.createWriteStream(
            path.join(this.config.determinedDestDir, "project.config.json")
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

  public override files(): string[] {
    return this.fileList();
  }

  private fileList(): string[] {
    return ["project.config.json"];
  }
}
