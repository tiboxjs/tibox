// eslint-disable-next-line node/no-missing-import
import { ResolvedConfig } from '../'
import _ from 'lodash'
import { TaskManager } from '../tasks/taskManager'

/**
 * 解析过后，返回给dev或者build的结果，供后续跟踪
 */
export type ParseResult = {
  // fileList: TFile[];
  // mapTask: Record<string, TTask | Array<TTask>>;
  taskManager: TaskManager
}

export enum TFileType {
  appJs,
  appJson,
  appWxss,
  pageJs,
  pageJson,
  pageWxml,
  pageWxss,
  componentJs,
  componentJson,
  componentWxml,
  componentWxss,
  js,
  wxml,
  wxss,
  projectConfigJson,
  sitmapJson,
  image,
  // TODO: 还有tailwind和svg文件
}

// /**
//  * tibox里的文件，防止名字冲突，在前面加了个T
//  */
// export interface TFile {
//   type: TFileType;
//   path: string;
// }

// export class JsFile implements TFile {
//   public type: TFileType;
//   public path: string;
//   public content?: string;

//   constructor(type: TFileType, path: string) {
//     this.type = type;
//     this.path = path;
//   }

//   public async loadContent(): Promise<void> {
//     this.content = await fs.promises.readFile(this.path, {
//       encoding: "utf-8",
//     });
//   }
// }

// export class JsonFile implements TFile {
//   public type: TFileType;
//   public path: string;

//   constructor(type: TFileType, path: string) {
//     this.type = type;
//     this.path = path;
//   }
// }
// export class WxmlFile implements TFile {
//   public type: TFileType;
//   public path: string;

//   constructor(type: TFileType, path: string) {
//     this.type = type;
//     this.path = path;
//   }
// }

// export class WxssFile implements TFile {
//   public type: TFileType;
//   public path: string;

//   constructor(type: TFileType, path: string) {
//     this.type = type;
//     this.path = path;
//   }
// }

/**
 *
 * @param resolvedConfig 解析完成的配置
 * @returns 小程序全解析后的结果
 */
export async function parse(resolvedConfig: ResolvedConfig): Promise<ParseResult> {
  try {
    return await doParse(resolvedConfig)
  } finally {
    // console.log("doParse")
  }
}

async function doParse(resolvedConfig: ResolvedConfig): Promise<ParseResult> {
  const taskManager = new TaskManager({ config: resolvedConfig })
  await taskManager.init()
  return { /* fileList: [], mapTask: {},  */ taskManager: taskManager }
}
