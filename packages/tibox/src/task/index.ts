// class TTask {}

import _ from "lodash";
import { ResolvedConfig } from "../";

export type InitOptions = {
  onRegistComponentCallback?: OnRegistComponentCallback;
};

export type OnRegistComponentCallback = (
  componentPath: string
) => Promise<void>;

// /**
//  * 通过解析结果创建任务树
//  */
// export function createTaskTreeByParsedResult() {}

export abstract class Task {
  protected config: ResolvedConfig;
  constructor(config: ResolvedConfig) {
    this.config = config;
  }

  /**
   * 任务的初始化，留给异步任务处理
   */
  public abstract init(options?: InitOptions): Promise<void>;

  /**
   * 任务的处理
   */
  public abstract handle(): Promise<void>;

  public abstract files(): string[];
}

export abstract class TaskGroup extends Task {
  public subTasks: Array<Task> = [];
  constructor(config: ResolvedConfig) {
    super(config);
  }

  public addTask<T extends Task>(...tasks: T[]): number {
    return this.subTasks.push(...tasks);
  }

  public files(): string[] {
    return _.flatten(_.map(this.subTasks, (item) => item.files()));
  }
}

export interface JsTask {}

export interface JsonTask {}

export interface WxmlTask {}

export interface WxssTask {}
