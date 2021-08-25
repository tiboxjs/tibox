import path from "path";
import { absolute2Relative, isWindows, matchImportJsFile } from "../../utils";
import { ITaskManager } from "..";
// import { ResolvedConfig } from "..";
import { SingleTask } from "../task";
import _ from "lodash";
import { dest, src } from "gulp";
// import { createLogger } from "../logger";
// import chalk from "chalk";

export class JsTask extends SingleTask {
  // constructor(config: ResolvedConfig, filePath: string) {
  //   super(config, filePath);
  // }

  public async init(options: ITaskManager): Promise<void> {
    if (!/^@/.test(this.filePath)) {
      const matchedResult = await matchImportJsFile(
        path.resolve(this.config.root, path.join("src", this.filePath))
      );

      await Promise.all(
        _.map(matchedResult, (item) => {
          if (!/\.js$/.test(item)) {
            item += ".js";
          }
          const res = path.normalize(
            path.isAbsolute(item)
              ? absolute2Relative(this.config.root, item)
              : /^@/.test(item)
              ? item
              : path.join(path.dirname(this.filePath), item)
          );

          return options.onRegistJsFileCallback(res);
        })
      );
    }
  }

  public async handle(): Promise<void> {
    if (!/^@/.test(this.filePath)) {
      src(path.join("src", this.filePath)).pipe(
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
}
