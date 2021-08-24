import { ResolvedConfig } from "..";
import { ITaskManager } from ".";
import _ from "lodash";
import path from "path";
import { dest, src } from "gulp";
import { isWindows } from "../utils";
import loadJsonFile from "load-json-file";
import { createLogger } from "../logger";
import chalk from "chalk";
import { MultiTask } from "./task";

export type MiniProgramPageConfig = {
  usingComponents?: Record<string, string>;
};
export class PageTask extends MultiTask {
  private pagePath: string;

  private subPackage?: string;

  constructor(config: ResolvedConfig, pagePath: string, subPackage?: string) {
    super(config);
    this.pagePath = pagePath;
    this.subPackage = subPackage;
  }

  public async init(options: ITaskManager): Promise<void> {
    await Promise.all([
      options.onRegistJsFileCallback(
        path.join("src/", this.subPackage || "", `${this.pagePath}.js`)
      ),
      options.onRegistJsonFileCallback(
        path.join("src/", this.subPackage || "", `${this.pagePath}.json`)
      ),
      options.onRegistWxmlFileCallback(
        path.join("src/", this.subPackage || "", `${this.pagePath}.wxml`)
      ),
      options.onRegistWxssFileCallback(
        path.join("src/", this.subPackage || "", `${this.pagePath}.wxss`)
      ),
    ]);

    // TODO: 解析界面的js文件（找到依赖）、json文件(找到子组件)、wxml文件(找到import)、wxss文件(找到import)
    const [, jsonFilePath]: string[] = this.fileList();
    const pageJson: MiniProgramPageConfig = await loadJsonFile(
      path.resolve(this.config.root, "src/", jsonFilePath)
    );
    if (pageJson.usingComponents) {
      await Promise.all(
        _.map(pageJson.usingComponents, (componentPath) => {
          let targetPath: string;
          if (path.isAbsolute(componentPath)) {
            targetPath = componentPath;
          } else if (componentPath.startsWith(".")) {
            targetPath = path.relative(
              this.config.root,
              path.resolve(
                this.subPackage || "",
                path.dirname(this.pagePath),
                componentPath
              )
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
    const [jsFilePath, jsonFilePath, wxmlFilePath, wxssFilePath]: string[] =
      this.fileList();
    src(`src/${jsFilePath}`).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/${jsFilePath}`)
      )
    );
    src(`src/${jsonFilePath}`).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/${jsonFilePath}`)
      )
    );
    src(`src/${wxmlFilePath}`).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/${wxmlFilePath}`)
      )
    );
    src(`src/${wxssFilePath}`).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/${wxssFilePath}`)
      )
    );
  }

  public id(): string {
    return `Page(${this.subPackage || ""}${this.pagePath})`;
  }

  private fileList(): string[] {
    return _.map(["js", "json", "wxml", "wxss"], (item) =>
      path.join(this.subPackage || "", `${this.pagePath}.${item}`)
    );
  }
}
