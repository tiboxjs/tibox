// class TTask {}

import type { ComponentTask } from './app/componentTask'
import type { JsonTask } from './app/jsonTask'
import type { JsTask } from './app/jsTask'
import type { PageTask } from './app/pageTask'
import type { Task } from './task'
import type { WxmlTask } from './app/wxmlTask'
import type { WxssTask } from './app/wxssTask'
import type { ImageTask } from './app/imageTask'

export type OnRegistPageCallback = (pagePath: string) => Promise<PageTask>

export type OnRegistComponentCallback = (componentPath: string) => Promise<ComponentTask>

export type OnRegistJsTaskCallback = (jsPath: string) => Promise<JsTask>

export type OnRegistJsonTaskCallback = (jsonPath: string) => Promise<JsonTask>

export type OnRegistWxmlTaskCallback = (wxmlPath: string) => Promise<WxmlTask>

export type OnRegistWxssTaskCallback = (wxssPath: string) => Promise<WxssTask>

export type OnRegistImageTaskCallback = (imagePath: string) => Promise<ImageTask>

// /**
//  * 通过解析结果创建任务树
//  */
// export function createTaskTreeByParsedResult() {}

export interface ITaskManager {
  wholeTask: Record<string, Task>
  onRegistPageCallback: OnRegistPageCallback
  onRegistComponentCallback: OnRegistComponentCallback
  onRegistJsTaskCallback: OnRegistJsTaskCallback
  onRegistJsonTaskCallback: OnRegistJsonTaskCallback
  onRegistWxmlTaskCallback: OnRegistWxmlTaskCallback
  onRegistWxssTaskCallback: OnRegistWxssTaskCallback
  onRegistImageTaskCallback: OnRegistImageTaskCallback
}
