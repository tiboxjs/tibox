// class TTask {}

import { ComponentTask } from "./tasks/componentTask";
import { JsonTask } from "./tasks/jsonTask";
import { JsTask } from "./tasks/jsTask";
import { PageTask } from "./tasks/pageTask";
import { Task } from "./task";
import { WxmlTask } from "./tasks/wxmlTask";
import { WxssTask } from "./tasks/wxssTask";
import { ImageTask } from "./tasks/imageTask";

export type OnRegistPageCallback = (pagePath: string) => Promise<PageTask>;

export type OnRegistComponentCallback = (
  componentPath: string
) => Promise<ComponentTask>;

export type OnRegistJsFileCallback = (jsFilePath: string) => Promise<JsTask>;
export type OnRegistJsonFileCallback = (
  jsonFilePath: string
) => Promise<JsonTask>;
export type OnRegistWxmlFileCallback = (
  wxmlFilePath: string
) => Promise<WxmlTask>;
export type OnRegistWxssFileCallback = (
  wxssFilePath: string
) => Promise<WxssTask>;
export type OnRegistImageFileCallback = (
  imageFilePath: string
) => Promise<ImageTask>;

// /**
//  * 通过解析结果创建任务树
//  */
// export function createTaskTreeByParsedResult() {}

export interface ITaskManager {
  wholeTask: Task[];
  onRegistPageCallback: OnRegistPageCallback;
  onRegistComponentCallback: OnRegistComponentCallback;
  onRegistJsFileCallback: OnRegistJsFileCallback;
  onRegistJsonFileCallback: OnRegistJsonFileCallback;
  onRegistWxmlFileCallback: OnRegistWxmlFileCallback;
  onRegistWxssFileCallback: OnRegistWxssFileCallback;
  onRegistImageFileCallback: OnRegistImageFileCallback;
}
