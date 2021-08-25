import { dest, src } from "gulp";
import path from "path";
import { absolute2Relative, isWindows, matchImportWxmlFile } from "../../utils";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import _ from "lodash";

export class WxmlTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    const matchedResult = await matchImportWxmlFile(
      path.resolve(this.config.root, path.join("src", this.filePath))
    );

    await Promise.all(
      _.map(matchedResult, (item) => {
        if (!/\.wxml$/.test(item)) {
          item += ".wxml";
        }
        const res = path.normalize(
          path.isAbsolute(item)
            ? absolute2Relative(this.config.root, item)
            : path.join(path.dirname(this.filePath), item)
        );

        return options.onRegistWxmlFileCallback(res);
      })
    );
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
