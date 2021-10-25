import { ITaskManager } from "..";
import _ from "lodash";
import path from "path";
import { absolute2Relative } from "../../utils";
import loadJsonFile from "load-json-file";
import { Task } from "../task";
import fs from "fs-extra";
import { createLogger } from "../../logger";
import chalk from "chalk";

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

    const pageJsonFileAbsolutePath = path.resolve(
      this.context.config.root,
      "src",
      `${this.filePath}.json`
    );
    try {
      await fs.promises.access(pageJsonFileAbsolutePath);
      const pageJson: MiniProgramPageConfig = await loadJsonFile(
        pageJsonFileAbsolutePath
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
    } catch (error: any) {
      if (!/no such file or directory/.test(error.message)) {
        throw error;
      }
      createLogger().info(
        chalk.yellow(`${pageJsonFileAbsolutePath} 文件不存在，忽略解析`)
      );
    }
  }

  public override async onHandle(): Promise<void> {
    //
  }

  public id(): string {
    return `Page(${this.filePath})`;
  }
}
