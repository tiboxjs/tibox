import { createLogger } from "../logger";
import { ITaskManager } from ".";
import { SingleTask } from "./task";
import { dest, src } from "gulp";
import { isWindows } from "../utils";
import path from "path";

export class JsonTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    // throw new Error("Method not implemented.");
    createLogger().info(`JsonFile: ${this.filePath}`);
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
