import { ResolvedConfig } from "../..";
import _ from "lodash";
import path from "path";
import { createLogger /* , Logger */ } from "../../logger";
import { MultiTask } from "../task";
import { ITaskManager } from "..";
import loadJsonFile from "load-json-file";
import { absolute2Relative } from "../../utils";
export type MiniProgramComponentConfig = {
  usingComponents?: Record<string, string>;
};
/**
 * 组件任务，专门处理组件
 */
export class ComponentTask extends MultiTask {
  /**
   * 组件的路径，采用相对路径，不包括"src/"前缀。
   *
   * example："components/example/example"
   */
  private componentPath: string;
  private belongsToSubPackages: Set<string> = new Set();
  /**
   *
   * @param config 解析过后的Config
   * @param componentPath 组件路径
   */
  constructor(config: ResolvedConfig, componentPath: string) {
    super(config);
    this.componentPath = componentPath;

    // this.logger = createLogger();
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

  public async init(options: ITaskManager): Promise<void> {
    if (/^@/.test(this.componentPath)) {
      createLogger().info(`Component [${this.componentPath}] ignore`);
    } else {
      await Promise.all([
        options.onRegistJsFileCallback(`${this.componentPath}.js`),
        options.onRegistJsonFileCallback(`${this.componentPath}.json`),
        options.onRegistWxmlFileCallback(`${this.componentPath}.wxml`),
        options.onRegistWxssFileCallback(`${this.componentPath}.wxss`),
      ]);

      const [, jsonFilePath]: string[] = this.fileList();
      const componentJson: MiniProgramComponentConfig = await loadJsonFile(
        path.resolve(this.config.root, jsonFilePath)
      );
      if (componentJson.usingComponents) {
        await Promise.all(
          _.map(componentJson.usingComponents, (componentPath) => {
            let targetPath: string;
            if (path.isAbsolute(componentPath)) {
              targetPath = absolute2Relative(this.config.root, componentPath);
            } else if (componentPath.startsWith(".")) {
              targetPath = path.relative(
                path.join(this.config.root, "src"),
                path.resolve(
                  path.dirname(path.join("src", this.componentPath)),
                  componentPath
                )
              );
            } else {
              targetPath = componentPath;
            }
            return options.onRegistComponentCallback(targetPath);
          })
        );
      }
    }
  }

  public async handle(): Promise<void> {
    //
  }

  public id(): string {
    return `Component(${this.componentPath})`;
  }

  private fileList(): string[] {
    if (/^@/.test(this.componentPath)) {
      return [];
    } else {
      return _.map(["js", "json", "wxml", "wxss"], (item) =>
        // TODO: 这里需要根据belongsToSubPackages的值进行判断如何处理
        path.join("src", `${this.componentPath}.${item}`)
      );
    }
  }
}
