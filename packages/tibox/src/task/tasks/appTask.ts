import path from "path";
import { ResolvedConfig } from "../..";
import _ from "lodash";
// import chalk from "chalk";
import loadJsonFile from "load-json-file";
import { MultiTask } from "../task";
import { ITaskManager } from "..";
import { isImage, parseDir } from "../../utils";
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
export class AppTask extends MultiTask {
  constructor(config: ResolvedConfig) {
    super(config);
  }

  public async init(options: ITaskManager): Promise<void> {
    /* const [appJsTask, appJsonTask, appWxssTask] =  */ await Promise.all([
      options.onRegistJsFileCallback("app.js"),
      options.onRegistJsonFileCallback("app.json"),
      options.onRegistWxssFileCallback("app.wxss"),
    ]);

    const appJsonFileAbsolutePath = path.resolve(
      this.config.root,
      "src/",
      "app.json"
    );
    const appJson: MiniProgramAppConfig = await loadJsonFile(
      appJsonFileAbsolutePath
    );
    // 解析主包下的pages
    await Promise.all(
      _.map(appJson.pages, (item) => options.onRegistPageCallback(item))
    );

    // 解析分包下的pages
    await Promise.all(
      _.map(
        appJson.subPackages,
        async (currentSubPackageItem) =>
          await Promise.all(
            _.map(currentSubPackageItem.pages, (pageItem) =>
              options.onRegistPageCallback(
                path.join(currentSubPackageItem.root, pageItem)
              )
            )
          )
      )
    );
    // 解析appjson中配置的components
    await Promise.all(
      _.map(appJson.usingComponents, (item) =>
        options.onRegistComponentCallback(item)
      )
    );

    // TODO: 应该用递归解析来做分析，处理哪些图片。目前采用所有图片文件都处理，后期需要优化
    const fileList = await parseDir(path.resolve(this.config.root, "src/"), {
      recursive: true,
    });
    const images = _.compact(
      _.map(fileList, (filePath) => {
        if (isImage(filePath)) {
          return path.relative(path.join(this.config.root, "src"), filePath);
        } else {
          return null;
        }
      })
    );
    await Promise.all(
      _.map(images, (imagePath) => options.onRegistImageFileCallback(imagePath))
    );
  }

  public async handle(): Promise<void> {
    //
  }

  public override files(): string[] {
    return _.concat(super.files(), this.fileList());
  }

  public id(): string {
    return "App()";
  }

  private fileList(): string[] {
    return _.map(["app.js", "app.json", "app.wxss"], (item) =>
      path.join("src", item)
    );
  }
}
