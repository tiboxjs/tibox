import { ITaskManager } from "..";
import _ from "lodash";
import path from "path";
import { absolute2Relative } from "../../utils";
import loadJsonFile from "load-json-file";
import { Task } from "../task";

export type MiniProgramPageConfig = {
  usingComponents?: Record<string, string>;
};
export class PageTask extends Task {
  public override async onInit(options: ITaskManager): Promise<void> {
    this.tasks = await Promise.all([
      options.onRegistJsTaskCallback(`${this.filePath}.js`),
      options.onRegistJsonTaskCallback(`${this.filePath}.json`),
      options.onRegistWxmlTaskCallback(`${this.filePath}.wxml`),
      options.onRegistWxssTaskCallback(`${this.filePath}.wxss`),
    ]);

    const pageJson: MiniProgramPageConfig = await loadJsonFile(
      path.resolve(this.context.config.root, "src", `${this.filePath}.json`)
    );
    if (pageJson.usingComponents) {
      const otherComponentTasks = await Promise.all(
        _.map(pageJson.usingComponents, (componentPath) => {
          let targetPath: string;
          if (path.isAbsolute(componentPath)) {
            targetPath = absolute2Relative(
              this.context.config.root,
              componentPath
            );
          } else if (componentPath.startsWith(".")) {
            targetPath = path.relative(
              this.context.config.root,
              path.resolve(path.dirname(this.filePath), componentPath)
            );
          } else {
            targetPath = componentPath;
          }
          return options.onRegistComponentCallback(targetPath);
        })
      );
      this.tasks = _.concat(this.tasks, otherComponentTasks);
    }
  }

  public override async onHandle(): Promise<void> {
    //
  }

  public id(): string {
    return `Page(${this.filePath})`;
  }
}
