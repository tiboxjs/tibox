import { ResolvedConfig } from "..";
import { InitOptions, OnRegistComponentCallback, Task } from ".";
import _ from "lodash";
import path from "path";
import { dest, src } from "gulp";
import { isWindows } from "../utils";
import loadJsonFile from "load-json-file";
import { createLogger } from "../logger";
import chalk from "chalk";

export type MiniProgramPageConfig = {
  usingComponents?: Record<string, string>;
};
export class PageTask extends Task {
  private pagePath: string;

  private subPackage?: string;

  constructor(config: ResolvedConfig, pagePath: string, subPackage?: string) {
    super(config);
    this.pagePath = pagePath;
    this.subPackage = subPackage;
  }

  public async init(options?: InitOptions): Promise<void> {
    // TODO: 解析界面的js文件（找到依赖）、json文件(找到子组件)、wxml文件(找到import)、wxss文件(找到import)
    const [, jsonFilePath]: string[] = this.fileList();
    const pageJson: MiniProgramPageConfig = await loadJsonFile(
      path.resolve(this.config.root, "src/", jsonFilePath)
    );
    if (pageJson.usingComponents) {
      if (options && typeof options.onRegistComponentCallback === "function") {
        const cb: OnRegistComponentCallback = options.onRegistComponentCallback;
        await Promise.all(
          _.map(pageJson.usingComponents, (componentPath) => {
            let targetPath: string;
            let ignore: boolean = false;
            if (path.isAbsolute(componentPath)) {
              targetPath = componentPath;
            } else if (componentPath.startsWith(".")) {
              createLogger().info(
                chalk.yellow(
                  `this.pagePath: ${
                    this.pagePath
                  }\ncomponentPath: ${componentPath}\npath.resolve(this.pagePath, componentPath): ${path.resolve(
                    this.subPackage || "",
                    path.dirname(this.pagePath),
                    componentPath
                  )}`
                )
              );
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
              targetPath = "";
              ignore = true;
            }
            if (ignore) {
              return Promise.resolve();
            } else {
              return cb(targetPath);
            }
          })
        );
      }
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

  /**
   * 返回本任务需要处理的文件路径
   * @returns 相对项目根路径的相对路径
   */
  public files(): string[] {
    // 把"src/"拼上
    return _.map(this.fileList(), (item) => `src/${item}`);
  }

  private fileList(): string[] {
    return _.map(["js", "json", "wxml", "wxss"], (item) =>
      path.join(this.subPackage || "", `${this.pagePath}.${item}`)
    );
  }
}
