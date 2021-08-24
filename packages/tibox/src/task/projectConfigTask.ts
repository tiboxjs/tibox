import { ResolvedConfig } from "..";
import path from "path";
import { dest, src } from "gulp";
import { isWindows } from "../utils";
import through from "through2";
import { SingleTask } from "./task";
import { ITaskManager } from ".";

export class ProjectConfigTask extends SingleTask {
  constructor(config: ResolvedConfig, filePath: string) {
    super(config, filePath);
  }
  public async init(options: ITaskManager): Promise<void> {
    // TODO: 有无处理?
  }
  public async handle(): Promise<void> {
    const [configJsonFile] = this.fileList();
    src(configJsonFile)
      .pipe(
        through.obj((file, encode, cb) => {
          const projectConfigJson = JSON.parse(file.contents.toString());
          projectConfigJson.appid = this.config.appid;
          projectConfigJson.projectname = this.config.determinedProjectName;
          file.contents = Buffer.from(
            JSON.stringify(projectConfigJson, null, 2)
          );
          cb(null, file);
        })
      )
      .pipe(
        dest(
          isWindows
            ? this.config.determinedDestDir
            : path.dirname(
                `${this.config.determinedDestDir}/project.config.json`
              )
        )
      );
  }

  private fileList(): string[] {
    return ["project.config.json"];
  }
}
