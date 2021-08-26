import { dest, src } from "gulp";
import path from "path";
import { ITaskManager } from "..";
import { isWindows } from "../../utils";
import { SingleTask } from "../task";

export class ImageTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public async handle(): Promise<void> {
    src(path.join("src", this.filePath)).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/${this.filePath}`)
      )
    );
  }
}
