import _ from "lodash";
import { ITaskManager } from ".";

import { AppTask } from "./app/appTask";
import { ComponentTask } from "./app/componentTask";
import { ImageTask } from "./app/imageTask";
import { JsonTask } from "./app/jsonTask";
import { JsTask } from "./app/jsTask";
import { PageTask } from "./app/pageTask";
import { ProjectConfigTask } from "./app/projectConfigTask";
import { Context, Task } from "./task";
import { WxmlTask } from "./app/wxmlTask";
import { WxssTask } from "./app/wxssTask";
import { PackageJsonTask } from "./app/packageJsonTask";
import path from "path";
import { absolute2Relative } from "../utils";
// import { createLogger } from "../logger";
// import chalk from "chalk";
import { SitemapTask } from "./app/sitemapTask";

/**
 * 根节点任务
 */
export class TaskManager implements ITaskManager {
  private context: Context;
  wholeTask: Record<string, Task>;
  public constructor(context: Context) {
    this.context = context;
    this.wholeTask = {};
  }

  public async onRegistPageCallback(pagePath: string): Promise<PageTask> {
    // createLogger().info(chalk.grey(`onRegistPageCallback: ${pagePath}`));
    if (path.isAbsolute(pagePath)) {
      pagePath = absolute2Relative(this.context.config.root, pagePath);
    }
    let pageTask = new PageTask(this.context, pagePath);

    const findResult = this.wholeTask[pagePath];
    if (findResult) {
      pageTask = findResult as PageTask;
    } else {
      await pageTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[pagePath] = pageTask;
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
      componentPath = absolute2Relative(
        this.context.config.root,
        componentPath
      );
    }
    let componentTask = new ComponentTask(this.context, componentPath);

    const findResult = this.wholeTask[componentPath];
    if (findResult) {
      componentTask = findResult as ComponentTask;
    } else {
      await componentTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[componentPath] = componentTask;
    }

    return componentTask;
  }

  public async onRegistJsTaskCallback(jsFilePath: string): Promise<JsTask> {
    // createLogger().info(chalk.grey(`onRegistJsFileCallback: ${jsFilePath}`));
    let jsTask = new JsTask(this.context, jsFilePath);

    const findResult = this.wholeTask[jsFilePath];
    if (findResult) {
      jsTask = findResult as JsTask;
    } else {
      await jsTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[jsFilePath] = jsTask;
    }

    return jsTask;
  }

  public async onRegistJsonTaskCallback(
    jsonFilePath: string
  ): Promise<JsonTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistJsonFileCallback: ${jsonFilePath}`)
    // );
    let jsonTask = new JsonTask(this.context, jsonFilePath);

    const findResult = this.wholeTask[jsonFilePath];
    if (findResult) {
      jsonTask = findResult as JsonTask;
    } else {
      await jsonTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[jsonFilePath] = jsonTask;
    }

    return jsonTask;
  }

  public async onRegistWxmlTaskCallback(
    wxmlFilePath: string
  ): Promise<WxmlTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistWxmlFileCallback: ${wxmlFilePath}`)
    // );
    let wxmlTask = new WxmlTask(this.context, wxmlFilePath);

    const findResult = this.wholeTask[wxmlFilePath];
    if (findResult) {
      wxmlTask = findResult as WxmlTask;
    } else {
      await wxmlTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[wxmlFilePath] = wxmlTask;
    }

    return wxmlTask;
  }

  public async onRegistWxssTaskCallback(wxssPath: string): Promise<WxssTask> {
    // createLogger().info(chalk.grey(`onRegistWxssFileCallback: ${wxssPath}`));
    let wxssTask = new WxssTask(this.context, wxssPath);

    const findResult = this.wholeTask[wxssPath];
    if (findResult) {
      wxssTask = findResult as WxssTask;
    } else {
      await wxssTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[wxssPath] = wxssTask;
    }

    return wxssTask;
  }

  public async onRegistImageTaskCallback(
    imageFilePath: string
  ): Promise<ImageTask> {
    // createLogger().info(
    //   chalk.grey(`onRegistImageFileCallback: ${imageFilePath}`)
    // );
    let imageTask = new ImageTask(this.context, imageFilePath);

    const findResult = this.wholeTask[imageFilePath];
    if (findResult) {
      imageTask = findResult as ImageTask;
    } else {
      await imageTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[imageFilePath] = imageTask;
    }

    return imageTask;
  }
  /**
   * 初始化任务
   */
  public async init(): Promise<void> {
    // TODO: 放在一个Promise.all 里，一起异步初始化(init)
    const appTask = new AppTask(this.context);
    await appTask.dispatchInit(this);
    this.wholeTask["app"] = appTask;

    const projectConfigTask = new ProjectConfigTask(this.context);
    await projectConfigTask.dispatchInit(this);
    this.wholeTask["project.config.json"] = projectConfigTask;

    const sitemapTask = new SitemapTask(this.context);
    await sitemapTask.dispatchInit(this);
    this.wholeTask["sitemap.json"] = sitemapTask;

    const packageJsonTask = new PackageJsonTask(this.context);
    await packageJsonTask.dispatchInit(this);
    this.wholeTask["package.json"] = sitemapTask;
  }

  public async handle(): Promise<void> {
    await Promise.all(
      _.map(this.wholeTask, (task) => task.dispatchHandle(this))
    );
  }
}
