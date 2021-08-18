import { ResolvedConfig } from "..";
import { Task } from ".";
import _ from "lodash";
import path from "path";
import { dest, src } from "gulp";
import { isWindows } from "../utils";

export class PageTask extends Task {
  private pagePath: string;

  private subPackage?: string;

  constructor(config: ResolvedConfig, pagePath: string, subPackage?: string) {
    super(config);
    this.pagePath = pagePath;
    this.subPackage = subPackage;
  }

  public async init(): Promise<void> {
    // TODO: 解析界面的js文件（找到依赖）、json文件(找到子组件)、wxml文件(找到import)、wxss文件(找到import)
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
