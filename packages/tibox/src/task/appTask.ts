import path from "path";
import { TaskGroup } from ".";
import { ResolvedConfig } from "..";
import _ from "lodash";
// import chalk from "chalk";
import { dest, src } from "gulp";
import { isWindows } from "../utils";
import loadJsonFile from "load-json-file";
import { PageTask } from "./pageTask";
import { ComponentTask } from "./componentTask";
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

export class AppTask extends TaskGroup {
  // private mainPageTasks: PageTask[] = []

  constructor(config: ResolvedConfig) {
    super(config);
  }

  public async init(): Promise<void> {
    const appJsonFilePath = path.resolve(this.config.root, "src/", "app.json");
    const appJson: MiniProgramAppConfig = await loadJsonFile(appJsonFilePath);
    // 解析主包下的pages
    const pageTasks: PageTask[] = _.map(
      appJson.pages,
      (item) => new PageTask(this.config, item)
    );

    await Promise.all(
      _.map(pageTasks, (item) =>
        item.init({
          onRegistComponentCallback: async (componentPath) => {
            const componentTask = new ComponentTask(this.config, componentPath);
            await componentTask.init();
            this.addTask(componentTask);
          },
        })
      )
    );
    this.addTask(...pageTasks);

    // 解析分包下的pages
    const subPackagesPageTask: PageTask[] = _.reduce(
      appJson.subPackages,
      (pre: PageTask[], currentSubPackageItem) => {
        const pageTasks = _.map(
          currentSubPackageItem.pages,
          (pageItem) =>
            new PageTask(this.config, pageItem, currentSubPackageItem.root)
        );
        return _.concat(pre, pageTasks);
      },
      []
    );

    await Promise.all(
      _.map(subPackagesPageTask, (item) =>
        item.init({
          onRegistComponentCallback: async (componentPath) => {
            const componentTask = new ComponentTask(this.config, componentPath);
            await componentTask.init();
            this.addTask(componentTask);
          },
        })
      )
    );
    this.addTask(...subPackagesPageTask);

    // 解析appjson中配置的components
    const componentsTasks: ComponentTask[] = _.map(
      appJson.usingComponents,
      (item) => new ComponentTask(this.config, item)
    );

    await Promise.all(_.map(componentsTasks, (item) => item.init()));
    this.addTask(...componentsTasks);
  }

  public async handle(): Promise<void> {
    const [jsFilePath, jsonFilePath, wxssFilePath] = this.fileList();
    src(jsFilePath).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/app.js`)
      )
    );
    src(jsonFilePath).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/app.json`)
      )
    );
    src(wxssFilePath).pipe(
      dest(
        isWindows
          ? this.config.determinedDestDir
          : path.dirname(`${this.config.determinedDestDir}/app.wxss`)
      )
    );

    await Promise.all(_.map(this.subTasks, (item) => item.handle()));
  }

  public override files(): string[] {
    return _.concat(super.files(), this.fileList());
  }

  private fileList(): string[] {
    return _.map(["app.js", "app.json", "app.wxss"], (item) =>
      path.join("src/", item)
    );
  }
}
