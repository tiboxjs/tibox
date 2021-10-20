import _ from "lodash";
import path from "path";
// import path from "path";
import { ITaskManager } from ".";
import { ResolvedConfig } from "..";

/**
 * 上下文环境
 */
export type Context = {
  config: ResolvedConfig;
};

/**
 * 任务抽象类
 */
export abstract class Task {
  /**
   * 上下文
   */
  context: Context;

  filePath: string;
  /**
   * 是否为虚任务，当对应文件不存在时，任务为虚任务
   */
  isVirtual: boolean = false;

  tasks: Array<Task>;

  constructor(context: Context, filePath: string) {
    this.context = context;
    this.filePath = filePath;
    this.tasks = [];
  }

  get relativeToRootPath(): string {
    return path.relative(
      this.context.config.root,
      path.join("src", this.filePath)
    );
  }

  get absolutePath(): string {
    return path.resolve(this.context.config.root, this.relativeToRootPath);
  }

  public abstract id(): string;

  async dispatchInit(options: ITaskManager): Promise<void> {
    await this.onInit(options);
  }

  async onInit(options: ITaskManager): Promise<void> {
    _.map(this.tasks, (task) => task.dispatchInit(options));
  }

  async dispatchHandle(options: ITaskManager): Promise<void> {
    await this.onHandle(options);
  }

  async onHandle(options: ITaskManager): Promise<void> {
    _.map(this.tasks, (task) => task.dispatchHandle(options));
  }

  // public abstract filePaths(): string[];

  // public abstract filePath(): string | null;

  // /**
  //  * 本任务，在dest目录对应的文件路径（相对路径，不含'dest/'）
  //  */
  //  destPaths(): string[];
}

// /**
//  * 多任务
//  */
// export abstract class MultiTask implements Task {
//   config: ResolvedConfig;
//   protected subTasks: Array<MultiTask | SingleTask> = [];
//   constructor(config: ResolvedConfig) {
//     this.config = config;
//   }

//   public abstract init(options: ITaskManager): Promise<void>;

//   public abstract handle(): Promise<void>;

//   public abstract id(): string;

//   public addTask<M extends MultiTask, S extends SingleTask>(
//     ...tasks: (M | S)[]
//   ): number {
//     return this.subTasks.push(...tasks);
//   }

//   public files(): string[] {
//     return _.flatten(_.map(this.subTasks, (item) => item.files()));
//   }

//   public seek(filePath: string): MultiTask | SingleTask | void {
//     // TODO: 改成 _.find()
//     for (let i = 0; i < this.subTasks.length; i++) {
//       const item = this.subTasks[i];
//       let result: MultiTask | SingleTask | void;
//       if (item instanceof MultiTask) {
//         result = item.seek(filePath);
//       } else if (item instanceof SingleTask) {
//         result = item.seek(filePath);
//       }
//       if (result) {
//         return result;
//       }
//     }
//   }

//   public destPaths(): string[] {
//     return [];
//   }
// }

// /**
//  * 单文件任务
//  */
// export abstract class SingleTask implements Task {
//   config: ResolvedConfig;
//   filePath: string;
//   constructor(config: ResolvedConfig, filePath: string) {
//     this.config = config;
//     this.filePath = filePath;
//   }

//   public abstract init(options: ITaskManager): Promise<void>;

//   public abstract handle(): Promise<void>;

//   public id(): string {
//     return this.filePath;
//   }

//   public files(): string[] {
//     return [path.join("src", this.filePath)];
//   }

//   public seek(this: SingleTask, filePath: string): SingleTask | void {
//     if (this.filePath === filePath) {
//       return this;
//     }
//   }
//   public destPaths(): string[] {
//     return [this.filePath];
//   }
// }
