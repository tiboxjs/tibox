// eslint-disable-next-line node/no-missing-import
import { ResolvedConfig } from "../";
// import { TTask } from "../libs/task";
import path from "path";
import fs from "fs-extra";
// import os from "os";
import { createLogger } from "../logger";
import _ from "lodash";
import chalk from "chalk";
// import loadJsonFile from "load-json-file";
import { TaskManager } from "../task/taskManager";
import { parseDir } from "../utils";
// import { MiniProgramPage } from "./page";
// import { parseComponents } from "./component";
// import { SubPackage } from "./subPackage";

/**
 * 解析过后，返回给dev或者build的结果，供后续跟踪
 */
export type ParseResult = {
  // fileList: TFile[];
  // mapTask: Record<string, TTask | Array<TTask>>;
  taskManager: TaskManager;
};

export enum TFileType {
  appJs,
  appJson,
  appWxss,
  pageJs,
  pageJson,
  pageWxml,
  pageWxss,
  componentJs,
  componentJson,
  componentWxml,
  componentWxss,
  js,
  wxml,
  wxss,
  projectConfigJson,
  sitmapJson,
  image,
  // TODO: 还有tailwind和svg文件
}

/**
 * tibox里的文件，防止名字冲突，在前面加了个T
 */
export interface TFile {
  type: TFileType;
  path: string;
}

export class JsFile implements TFile {
  public type: TFileType;
  public path: string;
  public content?: string;

  constructor(type: TFileType, path: string) {
    this.type = type;
    this.path = path;
  }

  public async loadContent(): Promise<void> {
    this.content = await fs.promises.readFile(this.path, {
      encoding: "utf-8",
    });
  }
}

export class JsonFile implements TFile {
  public type: TFileType;
  public path: string;

  constructor(type: TFileType, path: string) {
    this.type = type;
    this.path = path;
  }
}
export class WxmlFile implements TFile {
  public type: TFileType;
  public path: string;

  constructor(type: TFileType, path: string) {
    this.type = type;
    this.path = path;
  }
}

export class WxssFile implements TFile {
  public type: TFileType;
  public path: string;

  constructor(type: TFileType, path: string) {
    this.type = type;
    this.path = path;
  }
}

export async function parse(
  resolvedConfig: ResolvedConfig
): Promise<ParseResult> {
  try {
    return await doParse(resolvedConfig);
  } finally {
    // console.log("doParse")
  }
}

async function doParse(resolvedConfig: ResolvedConfig): Promise<ParseResult> {
  const logger = createLogger(resolvedConfig.logLevel);
  // inlineConfig.root
  /**
   * 项目下需要监听的所有文件
   */
  const needWatches = [
    "src/",
    "project.config.json",
    // TODO: tailwind和svg目录后续处理
    // "tailwind.config.js",
    // "tailwind/",
    // "svg/",
  ];

  const ignoreFiles: RegExp = /\.DS_Store/;

  /**
   * 解析结果
   */
  let parseResult: string[] = [];
  for (const item of _.map(needWatches, (item) =>
    path.resolve(resolvedConfig.root, item)
  )) {
    parseResult = _.concat(
      parseResult,
      await parseDir(item, { recursive: true })
    );
  }
  parseResult = _.filter(parseResult, (item) => !ignoreFiles.test(item));
  parseResult = _.map(parseResult, (item) =>
    path.relative(resolvedConfig.root, item)
  );

  const { taskManager } = await parseMiniProgram(resolvedConfig);
  logger.info(chalk.blueBright(`allFiles: ${parseResult.length}`));
  const unTrackedFiles = _.pull(parseResult, ...taskManager.files());

  if (unTrackedFiles.length) {
    logger.info(chalk.green(`unTrackedFiles: ${unTrackedFiles.length}`));
    logger.info(
      chalk.green(`unTrackedFiles: ${JSON.stringify(unTrackedFiles, null, 2)}`)
    );
  }
  return { taskManager };
}

/**
 * 解析小程序目录结构
 * @param srcPath src目录绝对路径
 * @returns 解析结果
 */
async function parseMiniProgram(config: ResolvedConfig): Promise<ParseResult> {
  // const appJsonFilePath = path.resolve(srcPath, "app.json");
  // const appJson: MiniProgramAppConfig = await loadJsonFile(appJsonFilePath);
  // // 解析主包下的pages
  // const pages: MiniProgramPage[] = await Promise.all(
  //   _.map(appJson.pages, (item) => parsePage(srcPath, item))
  // );

  // const subPackages: SubPackage[] = _.map(
  //   appJson.subPackages,
  //   (subPackageItem) => {
  //     const pages = _.map(subPackageItem.pages, (pageItem) => {
  //       return new MiniProgramPage(pageItem, {
  //         subPackagePath: subPackageItem.root,
  //       });
  //     });
  //     return new SubPackage(subPackageItem.root, pages);
  //   }
  // );
  // // 解析分包下的pages
  // const subPackagesPagesObj = _.flatten(
  //   _.map(appJson.subPackages, (subItem) => {
  //     return _.map(subItem.pages, (pageItem) => {
  //       return {
  //         subPackage: subItem.root,
  //         pagePath: pageItem,
  //       };
  //     });
  //   })
  // );
  // const subPackagesPages = await Promise.all(
  //   _.map(subPackagesPagesObj, (item) =>
  //     parsePage(srcPath, item.pagePath, { subPackage: item.subPackage })
  //   )
  // );
  // // 本小程序的全部页面都在allPages中
  // const allPages = _.concat(pages, subPackagesPages);

  // console.log(chalk.yellow(`小程序页面共${allPages.length}个`));

  // parseComponents(appJson, allPages);

  //===========
  // const miniprogramApp: MiniProgramApp = new MiniProgramApp(srcPath);

  const rootTask = new TaskManager(config);
  await rootTask.init();
  // TODO: 假代码
  return { /* fileList: [], mapTask: {},  */ taskManager: rootTask };
}
