// eslint-disable-next-line node/no-missing-import
import { readdir } from "fs/promises";
import { ResolvedConfig } from "../";
import { TTask } from "../libs/task";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { createLogger, LogLevel } from "../logger";
import _ from "lodash";
import chalk from "chalk";
import loadJsonFile from "load-json-file";

/**
 * 解析过后，返回给dev或者build的结果，供后续跟踪
 */
export type ParseResult = {
  fileList: TFile[];
  mapTask: Record<string, TTask | Array<TTask>>;
};

enum TFileType {
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
  // 还有tailwind和svg文件
}

/**
 * tibox里的文件，防止名字冲突，在前面加了个T
 */
export type TFile = {
  type: TFileType;
  path: string;
};

/**
 * 小程序app.json文件的subPackages字段中每一个item的类型定义
 */
export type MiniProgramAppJsonSubPackage = {
  root: string;
  pages: string[];
  usingComponents: Record<string, string>;
};

/**
 * 小程序app.json文件的文件内容
 */
export type MiniProgramAppJson = {
  pages: string[];
  subPackages?: MiniProgramAppJsonSubPackage[];
};

/**
 * 解析（parse）后的，小程序代码包结果
 */
export type ParsedMiniProgramResult = {
  appJson: MiniProgramAppJson;

  unusedFiles: TFile[];
};

/**
 * 本小程序的Page
 */
export type MiniProgramPage = {
  path: string;
  jsFile?: MiniProgramPageJsFile;
  jsonFile?: MiniProgramPageJsonFile;
  wxmlFile: MiniProgramPageWxmlFile;
  wxssFile?: MiniProgramPageWxssFile;
};

/**
 * 小程序的Page的JS文件
 */
export type MiniProgramPageJsFile = {
  path: string;
  importPaths?: string[];
};

/**
 * 小程序的Page的JSON文件
 */
export type MiniProgramPageJsonFile = {
  path: string;
};

/**
 * 小程序的Page的wxml文件
 */
export type MiniProgramPageWxmlFile = {
  path: string;
  // TODO: wxml有import吗？
  importPaths?: string[];
};

/**
 * 小程序的Page的wxss文件
 */
export type MiniProgramPageWxssFile = {
  path: string;
  importPaths?: string[];
};

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
  const needWatches = [
    "src/",
    "project.config.json",
    // TODO: tailwind和svg目录后续处理
    // "tailwind.config.js",
    // "tailwind/",
    // "svg/",
  ];

  const ignoreFiles: RegExp = /\.DS_Store/;

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

  logger.info(chalk.blueBright(parseResult.join(os.EOL)));

  return await parseMiniProgram(path.resolve(resolvedConfig.root, "src/"));
}

/**
 * 解析目录下的文件
 * @param pathDir
 * @param options
 */
async function parseDir(
  pathDir: string,
  options: { recursive?: boolean; logLevel?: LogLevel } = {}
): Promise<string[]> {
  const { recursive /* , logLevel */ } = options;
  // const logger = createLogger(logLevel);
  if (!path.isAbsolute(pathDir)) {
    throw Error(`${pathDir} is not a absolute path!`);
  }

  const stat = await fs.stat(pathDir);
  if (stat.isFile()) {
    return [path.resolve(pathDir)];
  } else {
    const readDirResult = await readdir(pathDir);
    if (recursive) {
      let result: string[] = [];
      for (const item of readDirResult) {
        result = _.concat(
          result,
          await parseDir(path.resolve(pathDir, item), { recursive })
        );
      }
      return result;
    } else {
      return readDirResult;
    }
  }
}

async function parseMiniProgram(srcPath: string): Promise<ParseResult> {
  const appJsonFilePath = path.resolve(path.join(srcPath, "app.json"));
  const appJson: MiniProgramAppJson = await loadJsonFile(appJsonFilePath);
  const pages: MiniProgramPage[] = await Promise.all(
    _.map(appJson.pages, (item) => parsePage(srcPath, item))
  );

  _.forEach(pages, (item) => {
    console.log(
      chalk.green(
        `小程序页面${item.path} [${item.jsFile?.path}] [${item.jsonFile?.path}] [${item.wxmlFile.path}] [${item.wxssFile?.path}]`
      )
    );
  });

  // TODO: 假代码
  return { fileList: [], mapTask: {} };
}

async function parsePage(
  srcPath: string,
  pagePath: string,
  options: { subPackage?: string } = {}
): Promise<MiniProgramPage> {
  const res: {
    jsFile?: MiniProgramPageJsFile;
    jsonFile?: MiniProgramPageJsonFile;
    wxmlFile?: MiniProgramPageWxmlFile;
    wxssFile?: MiniProgramPageWxssFile;
    path: string;
  } = { path: pagePath };
  const [jsFilePath, jsonFilePath, wxmlFilePath, wxssFilePath] = _.map(
    [".js", ".json", ".wxml", ".wxss"],
    (item) => path.resolve(srcPath, `${pagePath}${item}`)
  );

  const [jsFileStat, jsonFileStat, wxmlFileStat, wxssFileStat] =
    await Promise.all(
      _.map([jsFilePath, jsonFilePath, wxmlFilePath, wxssFilePath], (item) =>
        fs.promises.stat(item)
      )
    );

  if (jsFileStat.isFile()) {
    res.jsFile = {
      path: path.relative(srcPath, jsFilePath),
    };
  }
  if (jsonFileStat.isFile()) {
    res.jsonFile = {
      path: path.relative(srcPath, jsonFilePath),
    };
  }
  if (!wxmlFileStat.isFile()) {
    throw new Error(`The page ${pagePath}'s wxml file doesn't exists!`);
  }
  res.wxmlFile = {
    path: path.relative(srcPath, wxmlFilePath),
  };
  if (wxssFileStat.isFile()) {
    res.wxssFile = {
      path: path.relative(srcPath, wxssFilePath),
    };
  }
  return res as MiniProgramPage;
}
