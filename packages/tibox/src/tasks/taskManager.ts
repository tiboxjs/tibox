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
import { absolute2Relative, parseDir, prune } from "../utils";
// import { createLogger } from "../logger";
// import chalk from "chalk";
import { SitemapTask } from "./app/sitemapTask";
import ora from "ora";

/**
 * 根节点任务
 */
export class TaskManager implements ITaskManager {
  context: Context;
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

    const findResult = this.wholeTask[pageTask.relativeToRootPath];
    if (findResult) {
      pageTask = findResult as PageTask;
    } else {
      await pageTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[pageTask.relativeToRootPath] = pageTask;
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

    const findResult = this.wholeTask[componentTask.relativeToRootPath];
    if (findResult) {
      componentTask = findResult as ComponentTask;
    } else {
      await componentTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[componentTask.relativeToRootPath] = componentTask;
    }

    return componentTask;
  }

  public async onRegistJsTaskCallback(jsFilePath: string): Promise<JsTask> {
    // createLogger().info(chalk.grey(`onRegistJsFileCallback: ${jsFilePath}`));
    let jsTask = new JsTask(this.context, jsFilePath);

    const findResult = this.wholeTask[jsTask.relativeToRootPath];
    if (findResult) {
      jsTask = findResult as JsTask;
    } else {
      await jsTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[jsTask.relativeToRootPath] = jsTask;
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

    const findResult = this.wholeTask[jsonTask.relativeToRootPath];
    if (findResult) {
      jsonTask = findResult as JsonTask;
    } else {
      await jsonTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[jsonTask.relativeToRootPath] = jsonTask;
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

    const findResult = this.wholeTask[wxmlTask.relativeToRootPath];
    if (findResult) {
      wxmlTask = findResult as WxmlTask;
    } else {
      await wxmlTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[wxmlTask.relativeToRootPath] = wxmlTask;
    }

    return wxmlTask;
  }

  public async onRegistWxssTaskCallback(wxssPath: string): Promise<WxssTask> {
    // createLogger().info(chalk.grey(`onRegistWxssFileCallback: ${wxssPath}`));
    let wxssTask = new WxssTask(this.context, wxssPath);

    const findResult = this.wholeTask[wxssTask.relativeToRootPath];
    if (findResult) {
      wxssTask = findResult as WxssTask;
    } else {
      await wxssTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[wxssTask.relativeToRootPath] = wxssTask;
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

    const findResult = this.wholeTask[imageTask.relativeToRootPath];
    if (findResult) {
      imageTask = findResult as ImageTask;
    } else {
      await imageTask.dispatchInit(this as unknown as ITaskManager);
      this.wholeTask[imageTask.relativeToRootPath] = imageTask;
    }

    return imageTask;
  }
  /**
   * 初始化任务
   */
  public async init(): Promise<void> {
    this.wholeTask = {};
    const appTask = new AppTask(this.context);
    const projectConfigTask = new ProjectConfigTask(this.context);
    const sitemapTask = new SitemapTask(this.context);
    const packageJsonTask = new PackageJsonTask(this.context);

    await Promise.all([
      appTask.dispatchInit(this),
      projectConfigTask.dispatchInit(this),
      sitemapTask.dispatchInit(this),
      packageJsonTask.dispatchInit(this),
    ]);

    this.wholeTask[appTask.relativeToRootPath] = appTask;
    this.wholeTask[projectConfigTask.relativeToRootPath] = projectConfigTask;
    this.wholeTask[sitemapTask.relativeToRootPath] = sitemapTask;
    this.wholeTask[packageJsonTask.relativeToRootPath] = packageJsonTask;
  }

  public async handle(spinner: ora.Ora): Promise<void> {
    await Promise.all(
      _.map(this.wholeTask, (task) => task.dispatchHandle(this))
    );

    const config = this.context.config;
    spinner.text = "解析小程序文件依赖关系";
    const allValidDestFiles = _.map(this.wholeTask, (task) => task.filePath);
    const ignoreDestFiles = ["project.private.config.json"];

    spinner.text = `扫描${config.determinedDestDir}目录无用文件`;
    const allDestFiles = _.map(
      await parseDir(path.resolve(config.root, config.determinedDestDir), {
        recursive: true,
        ignore: /(node_modules|miniprogram_npm)/,
      }),
      (filePath: string) =>
        path.relative(
          path.join(config.root, config.determinedDestDir),
          filePath
        )
    );

    const unuseFiles = _.pull(
      allDestFiles,
      ..._.map(allValidDestFiles, (item) => path.normalize(item)),
      ..._.map(ignoreDestFiles, (item) => path.normalize(item))
    );
    if (unuseFiles.length) {
      spinner.info("移除无用文件");
      _.forEach(unuseFiles, (item) => {
        spinner.info(item);
      });
      await Promise.all(
        _.map(unuseFiles, (unuseItem) =>
          prune(path.resolve(config.root, config.determinedDestDir, unuseItem))
        )
      );
    }
  }
}
