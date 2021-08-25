import { ResolvedConfig } from "../..";
import { ITaskManager } from "..";
import _ from "lodash";
import path from "path";
import { absolute2Relative } from "../../utils";
import loadJsonFile from "load-json-file";
import { createLogger } from "../../logger";
import chalk from "chalk";
import { MultiTask } from "../task";

export type MiniProgramPageConfig = {
  usingComponents?: Record<string, string>;
};
export class PageTask extends MultiTask {
  private pagePath: string;

  constructor(config: ResolvedConfig, pagePath: string) {
    super(config);
    this.pagePath = pagePath;
  }

  public async init(options: ITaskManager): Promise<void> {
    await Promise.all([
      options.onRegistJsFileCallback(`${this.pagePath}.js`),
      options.onRegistJsonFileCallback(`${this.pagePath}.json`),
      options.onRegistWxmlFileCallback(`${this.pagePath}.wxml`),
      options.onRegistWxssFileCallback(`${this.pagePath}.wxss`),
    ]);

    const [, jsonFilePath]: string[] = this.fileList();
    const pageJson: MiniProgramPageConfig = await loadJsonFile(
      path.resolve(this.config.root, "src/", jsonFilePath)
    );
    if (pageJson.usingComponents) {
      await Promise.all(
        _.map(pageJson.usingComponents, (componentPath) => {
          let targetPath: string;
          if (path.isAbsolute(componentPath)) {
            targetPath = absolute2Relative(this.config.root, componentPath);
          } else if (componentPath.startsWith(".")) {
            targetPath = path.relative(
              this.config.root,
              path.resolve(path.dirname(this.pagePath), componentPath)
            );
            createLogger().info(chalk.yellow(`targetPath: ${targetPath}`));
          } else {
            targetPath = componentPath;
          }
          return options.onRegistComponentCallback(targetPath);
        })
      );
    }
  }

  public async handle(): Promise<void> {
    //
  }

  public id(): string {
    return `Page(${this.pagePath})`;
  }

  private fileList(): string[] {
    return _.map(
      ["js", "json", "wxml", "wxss"],
      (item) => `${this.pagePath}.${item}`
    );
  }
}
