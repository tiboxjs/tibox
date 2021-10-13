import _ from "lodash";
import { ITaskManager } from ".";

import { ResolvedConfig } from "..";
import { AppTask } from "./tasks/appTask";
import { ComponentTask } from "./tasks/componentTask";
import { ImageTask } from "./tasks/imageTask";
import { JsonTask } from "./tasks/jsonTask";
import { JsTask } from "./tasks/jsTask";
import { PageTask } from "./tasks/pageTask";
import { ProjectConfigTask } from "./tasks/projectConfigTask";
import { Task } from "./task";
import { WxmlTask } from "./tasks/wxmlTask";
import { WxssTask } from "./tasks/wxssTask";
import { PackageJsonTask } from "./tasks/packageJsonTask";
import path from "path";
import { absolute2Relative } from "../utils";
// import { createLogger } from "../logger";
// import chalk from "chalk";
import { SitemapTask } from "./tasks/sitemapTask";

/**
 * 根节点任务
 */
export class TaskManager implements ITaskManager {
  private config: ResolvedConfig;
  wholeTask: Task[];
  public constructor(config: ResolvedConfig) {
    this.config = config;
    this.wholeTask = [];
  }

  public async onRegistPageCallback(pagePath: string): Promise<PageTask> {
    // createLogger().info(chalk.grey(`onRegistPageCallback: ${pagePath}`));
    if (path.isAbsolute(pagePath)) {
      pagePath = absolute2Relative(this.config.root, pagePath);
    }
    let pageTask = new PageTask(this.config, pagePath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === pageTask.id()
    );
    if (findResult) {
      pageTask = findResult as PageTask;
    } else {
      await pageTask.init(this);
      this.wholeTask.push(pageTask);
    }

    return pageTask;
  }

  public async onRegistComponentCallback(
    componentPath: string
  ): Promise<ComponentTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistComponentCallback: ${componentPath}`)
    // );
    if (path.isAbsolute(componentPath)) {
      componentPath = absolute2Relative(this.config.root, componentPath);
    }
    let componentTask = new ComponentTask(this.config, componentPath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === componentTask.id()
    );
    if (findResult) {
      componentTask = findResult as ComponentTask;
    } else {
      await componentTask.init(this);
      this.wholeTask.push(componentTask);
    }

    return componentTask;
  }

  public async onRegistJsFileCallback(jsFilePath: string): Promise<JsTask> {
    // createLogger().info(chalk.grey(`onRegistJsFileCallback: ${jsFilePath}`));
    let jsTask = new JsTask(this.config, jsFilePath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === jsTask.id()
    );
    if (findResult) {
      jsTask = findResult as JsTask;
    } else {
      await jsTask.init(this);
      this.wholeTask.push(jsTask);
    }

    return jsTask;
  }

  public async onRegistJsonFileCallback(
    jsonFilePath: string
  ): Promise<JsonTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistJsonFileCallback: ${jsonFilePath}`)
    // );
    let jsonTask = new JsonTask(this.config, jsonFilePath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === jsonTask.id()
    );
    if (findResult) {
      jsonTask = findResult as JsonTask;
    } else {
      await jsonTask.init(this);
      this.wholeTask.push(jsonTask);
    }

    return jsonTask;
  }

  public async onRegistWxmlFileCallback(
    wxmlFilePath: string
  ): Promise<WxmlTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistWxmlFileCallback: ${wxmlFilePath}`)
    // );
    let wxmlTask = new WxmlTask(this.config, wxmlFilePath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === wxmlTask.id()
    );
    if (findResult) {
      wxmlTask = findResult as WxmlTask;
    } else {
      await wxmlTask.init(this);
      this.wholeTask.push(wxmlTask);
    }

    return wxmlTask;
  }

  public async onRegistWxssFileCallback(wxssPath: string): Promise<WxssTask> {
    // createLogger().info(chalk.grey(`onRegistWxssFileCallback: ${wxssPath}`));
    let wxssTask = new WxssTask(this.config, wxssPath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === wxssTask.id()
    );
    if (findResult) {
      wxssTask = findResult as WxssTask;
    } else {
      await wxssTask.init(this);
      this.wholeTask.push(wxssTask);
    }

    return wxssTask;
  }

  public async onRegistImageFileCallback(
    imageFilePath: string
  ): Promise<ImageTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistImageFileCallback: ${imageFilePath}`)
    // );
    let imageTask = new ImageTask(this.config, imageFilePath);

    const findResult = _.find(
      this.wholeTask,
      (item) => item.id() === imageTask.id()
    );
    if (findResult) {
      imageTask = findResult as ImageTask;
    } else {
      await imageTask.init(this);
      this.wholeTask.push(imageTask);
    }

    return imageTask;
  }
  /**
   * 初始化任务
   */
  public async init(): Promise<void> {
    // TODO: 放在一个Promise.all 里，一起异步初始化(init)
    const appTask = new AppTask(this.config);
    await appTask.init(this);
    this.wholeTask.push(appTask);

    const projectConfigTask = new ProjectConfigTask(
      this.config,
      "project.config.json"
    );
    await projectConfigTask.init(this);
    this.wholeTask.push(projectConfigTask);

    const sitemapTask = new SitemapTask(this.config, "sitemap.json");
    await sitemapTask.init(this);
    this.wholeTask.push(sitemapTask);

    const packageJsonTask = new PackageJsonTask(this.config, "package.json");
    await packageJsonTask.init(this);
    this.wholeTask.push(packageJsonTask);
  }

  public async handle(): Promise<void> {
    await Promise.all(_.map(this.wholeTask, (task) => task.handle()));
  }

  public files(): string[] {
    return _.flatten(_.map(this.wholeTask, (task) => task.files()));
  }

  public destPaths(): string[] {
    return _.flatten(_.map(this.wholeTask, (task) => task.destPaths()));
  }
}
