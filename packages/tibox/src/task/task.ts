import _ from "lodash";
import path from "path";
import { ITaskManager } from ".";
import { ResolvedConfig } from "..";

/**
 * 所有的文件处理皆为任务
 */
export interface Task {
  config: ResolvedConfig;

  /**
   * 任务的初始化，留给异步任务处理
   */
  init(options?: ITaskManager): Promise<void>;

  /**
   * 任务的处理
   */
  handle(): Promise<void>;

  files(): string[];

  id(): string;
}

/**
 * 多任务
 */
export abstract class MultiTask implements Task {
  config: ResolvedConfig;
  protected subTasks: Array<MultiTask | SingleTask> = [];
  constructor(config: ResolvedConfig) {
    this.config = config;
  }

  public abstract init(options: ITaskManager): Promise<void>;

  public abstract handle(): Promise<void>;

  public abstract id(): string;

  public addTask<M extends MultiTask, S extends SingleTask>(
    ...tasks: (M | S)[]
  ): number {
    return this.subTasks.push(...tasks);
  }

  public files(): string[] {
    return _.flatten(_.map(this.subTasks, (item) => item.files()));
  }

  public seek(filePath: string): MultiTask | SingleTask | void {
    // TODO: 改成 _.find()
    for (let i = 0; i < this.subTasks.length; i++) {
      const item = this.subTasks[i];
      let result: MultiTask | SingleTask | void;
      if (item instanceof MultiTask) {
        result = item.seek(filePath);
      } else if (item instanceof SingleTask) {
        result = item.seek(filePath);
      }
      if (result) {
        return result;
      }
    }
  }
}

/**
 * 单文件任务
 */
export abstract class SingleTask implements Task {
  config: ResolvedConfig;
  filePath: string;
  constructor(config: ResolvedConfig, filePath: string) {
    this.config = config;
    this.filePath = filePath;
  }

  public abstract init(options: ITaskManager): Promise<void>;

  public abstract handle(): Promise<void>;

  public id(): string {
    return this.filePath;
  }

  public files(): string[] {
    return [path.join("src", this.filePath)];
  }

  public seek(this: SingleTask, filePath: string): SingleTask | void {
    if (this.filePath === filePath) {
      return this;
    }
  }
}
