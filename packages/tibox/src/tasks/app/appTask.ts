import path from "path";
import _ from "lodash";
// import chalk from "chalk";
import loadJsonFile from "load-json-file";
import { Context, Task } from "../task";
import { ITaskManager } from "..";
import { parseDir } from "../../utils";
import { isImage } from "../../utils";
// import through2 from "through2";
// import { RootTask } from "./rootTask";

export type SubPackagePath = string;
export type PagePath = string;

export type MiniProgramAppConfigSubPackage = {
  root: SubPackagePath;
  pages: PagePath[];
};

export type MiniProgramAppConfig = {
  pages: string[];
  subPackages: MiniProgramAppConfigSubPackage[];
  usingComponents: Record<string, string>;
};

/**
 * App对应的任务
 */
export class AppTask extends Task {
  constructor(context: Context) {
    super(context, "app");
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    const appFileTasks = await Promise.all([
      options.onRegistJsTaskCallback("app.js"),
      options.onRegistJsonTaskCallback("app.json"),
      options.onRegistWxssTaskCallback("app.wxss"),
    ]);

    const root = this.context.config.root;
    const appJson: MiniProgramAppConfig = await loadJsonFile(
      path.resolve(root, "src/", "app.json")
    );

    // 解析主包下的pages
    const rootPagesTask = await Promise.all(
      _.map(appJson.pages, (item) => {
        return options.onRegistPageCallback(path.join("", item)); // TODO: 传相对 未进过处理的相对目录，不能计算路径
      })
    );

    // 解析分包下的pages
    const subPagesTask = await Promise.all(
      _.map(
        appJson.subPackages,
        async (currentSubPackageItem) =>
          await Promise.all(
            _.map(currentSubPackageItem.pages, (pageItem) => {
              return options.onRegistPageCallback(
                `${currentSubPackageItem.root}/${pageItem}`
              );
            })
          )
      )
    );

    // 解析appjson中配置的components
    const componentTasks = await Promise.all(
      _.map(appJson.usingComponents, (item) => {
        return options.onRegistComponentCallback(item);
      })
    );

    // TODO: 应该用递归解析来做分析，处理哪些图片。目前采用所有图片文件都处理，后期需要优化
    const fileList = await parseDir(
      path.resolve(this.context.config.root, "src/"),
      {
        recursive: true,
      }
    );
    const images = _.compact(
      _.map(fileList, (filePath) => {
        if (isImage(filePath)) {
          return path.relative(
            path.join(this.context.config.root, "src"),
            filePath
          );
        } else {
          return null;
        }
      })
    );
    const imageTasks = await Promise.all(
      _.map(images, (imagePath) => options.onRegistImageTaskCallback(imagePath))
    );

    this.tasks = _.concat(
      appFileTasks,
      rootPagesTask,
      _.flatten(subPagesTask),
      componentTasks,
      imageTasks
    );
  }

  public override async onHandle(): Promise<void> {
    //
  }

  public id(): string {
    return "App()";
  }
}
