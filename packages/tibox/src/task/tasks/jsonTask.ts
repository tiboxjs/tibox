// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import { dest, src } from "gulp";
import { isWindows } from "../../utils";
import path from "path";

export class JsonTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public async handle(): Promise<void> {
    src(path.join("src/", this.filePath)).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(
              path.join(this.config.determinedDestDir, this.filePath)
            )
      )
    );
  }
}
