import path from 'node:path'
import * as _ from 'lodash-es'
// import path from "path";
import type { ResolvedConfig } from '..'
import type { ITaskManager } from '.'

/**
 * 上下文环境
 */
export type Context = {
  config: ResolvedConfig
}

/**
 * 任务抽象类
 */
export abstract class Task {
  /**
   * 上下文
   */
  context: Context

  filePath: string

  tasks: Array<Task>

  constructor(context: Context, filePath: string) {
    this.context = context
    this.filePath = filePath
    this.tasks = []
  }

  get relativeToRootPath(): string {
    return path.relative(this.context.config.root, path.join('src', this.filePath))
  }

  get absolutePath(): string {
    return path.resolve(this.context.config.root, this.relativeToRootPath)
  }

  public abstract id(): string

  async dispatchInit(options: ITaskManager): Promise<void> {
    await this.onInit(options)
  }

  async onInit(options: ITaskManager): Promise<void> {
    _.map(this.tasks, task => task.dispatchInit(options))
  }

  async dispatchHandle(options: ITaskManager): Promise<void> {
    await this.onHandle(options)
  }

  async onHandle(options: ITaskManager): Promise<void> {
    _.map(this.tasks, task => task.dispatchHandle(options))
  }

  // public abstract filePaths(): string[];

  // public abstract filePath(): string | null;

  // /**
  //  * 本任务，在dest目录对应的文件路径（相对路径，不含'dest/'）
  //  */
  //  destPaths(): string[];
}
