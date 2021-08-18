import _ from "lodash";

import { TaskGroup } from ".";

import { ResolvedConfig } from "..";
import { AppTask } from "./appTask";

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
    const appTask = new AppTask(this.config);
    await appTask.init();
    this.addTask(appTask);
  }

  public async handle(): Promise<void> {
    await Promise.all(_.map(this.subTasks, (task) => task.handle()));
  }
}
