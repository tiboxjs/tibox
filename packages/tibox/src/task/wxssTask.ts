import { dest, src } from "gulp";
import path from "path";
import { isWindows } from "../utils";
import { ITaskManager } from ".";
import { SingleTask } from "./task";

export class WxssTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    // throw new Error("Method not implemented.");s
  }
  public async handle(): Promise<void> {
    // throw new Error("Method not implemented.");
    src(this.filePath).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(
              `${this.config.determinedDestDir}/${this.filePath.substring(
                "src/".length
              )}`
            )
      )
    );
  }
}
