import _ from "lodash";

import { TaskGroup } from ".";

import { ResolvedConfig } from "..";
import { AppTask } from "./appTask";
import { ProjectConfigTask } from "./projectConfigTask";

/**
 * 根节点任务
 */
export class RootTask extends TaskGroup {
  public constructor(config: ResolvedConfig) {
    super(config);
  }
  /**
   * 初始化任务
   */
  public async init(): Promise<void> {
    // TODO: 放在一个Promise.all 里，一起异步初始化(init)
    const appTask = new AppTask(this.config);
    await appTask.init();
    this.addTask(appTask);

    const projectConfigTask = new ProjectConfigTask(this.config);
    await projectConfigTask.init();
    this.addTask(projectConfigTask);
  }

  public async handle(): Promise<void> {
    await Promise.all(_.map(this.subTasks, (task) => task.handle()));
  }
}
