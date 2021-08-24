// class TTask {}

import { ComponentTask } from "./componentTask";
import { JsonTask } from "./jsonTask";
import { JsTask } from "./jsTask";
import { PageTask } from "./pageTask";
import { Task } from "./task";
import { WxmlTask } from "./wxmlTask";
import { WxssTask } from "./wxssTask";

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
}
