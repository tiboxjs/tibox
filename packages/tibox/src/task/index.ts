// class TTask {}

import { ComponentTask } from "./app/componentTask";
import { JsonTask } from "./app/jsonTask";
import { JsTask } from "./app/jsTask";
import { PageTask } from "./app/pageTask";
import { Task } from "./task";
import { WxmlTask } from "./app/wxmlTask";
import { WxssTask } from "./app/wxssTask";
import { ImageTask } from "./app/imageTask";

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
