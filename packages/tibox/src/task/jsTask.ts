import path from "path";
import { isWindows, matchImportJsFile } from "../utils";
import { ITaskManager } from ".";
// import { ResolvedConfig } from "..";
import { SingleTask } from "./task";
import _ from "lodash";
import { dest, src } from "gulp";

export class JsTask extends SingleTask {
  // constructor(config: ResolvedConfig, filePath: string) {
  //   super(config, filePath);
  // }

  public async init(options: ITaskManager): Promise<void> {
    const matchedResult = await matchImportJsFile(this.filePath);

    await Promise.all(
      _.map(matchedResult, (item) => {
        if (!/\.js$/.test(item)) {
          item += ".js";
        }
        const res = path.normalize(
          path.join(path.dirname(this.filePath), item)
        );

        return options.onRegistJsFileCallback(res);
      })
    );
    // TODO: 解析自己的文件内容， 继续递归
  }

  public async handle(): Promise<void> {
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
