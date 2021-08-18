import { ResolvedConfig } from "..";
import { Task } from ".";
import _ from "lodash";
import path from "path";
import { isWindows } from "../utils";
import { src, dest } from "gulp";
import chalk from "chalk";
import { createLogger, Logger } from "../logger";

/**
 * 组件任务，专门处理组件
 */
export class ComponentTask extends Task {
  /**
   * 组件的路径，采用相对路径，不包括"src/"前缀。
   *
   * example："/components/example/example"
   */
  private componentPath: string;
  private belongsToSubPackages: Set<string> = new Set();
  private logger: Logger;
  constructor(config: ResolvedConfig, componentPath: string) {
    super(config);
    this.componentPath = componentPath;

    this.logger = createLogger();
  }

  /**
   * 为当前组件，添加一个分包所属。
   * 组件会dispatch到所属的分包中
   * @param subPackage 分包路径
   */
  public emitSubPackage(subPackage: string): Set<String> {
    return this.belongsToSubPackages.add(subPackage);
  }

  /**
   * 为当前组件，添加一个分包所属。
   * 组件会dispatch到所属的分包中
   * @param subPackage 分包路径
   */
  public unemitSubPackage(subPackage: string): boolean {
    return this.belongsToSubPackages.delete(subPackage);
  }

  public async init(): Promise<void> {
    // TODO: 未填写逻辑
  }

  public async handle(): Promise<void> {
    if (/^@/.test(this.componentPath)) {
      this.logger.info(chalk.green(`跳过 组件[${this.componentPath}]的处理`));
      return;
    }
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

  public files(): string[] {
    return _.map(this.fileList(), (item) => path.normalize(`src/${item}`));
  }

  private fileList(): string[] {
    if (/^@/.test(this.componentPath)) {
      return [];
    } else {
      return _.map(["js", "json", "wxml", "wxss"], (item) =>
        // TODO: 这里需要根据belongsToSubPackages的值进行判断如何处理
        path.join(`${this.componentPath}.${item}`)
      );
    }
  }
}
