import path from 'node:path'
import * as _ from 'lodash-es'
// import chalk from "chalk";
import loadJsonFile from 'load-json-file'
import type { Context} from '../task';
import { Task } from '../task'
import type { ITaskManager } from '..'
import { isImage, parseDir  } from '../../utils'
// import through2 from "through2";
// import { RootTask } from "./rootTask";

export type SubPackagePath = string
export type PagePath = string

export type MiniProgramAppConfigSubPackage = {
  root: SubPackagePath
  pages: PagePath[]
}

export type MiniProgramAppConfig = {
  pages: string[]
  workers: string
  subPackages: MiniProgramAppConfigSubPackage[]
  usingComponents: Record<string, string>
}

/**
 * App对应的任务
 */
export class AppTask extends Task {
  constructor(context: Context) {
    super(context, 'app')
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    const [appJsTask, appJsonTask, appWxssTask] = await Promise.all([
      options.onRegistJsTaskCallback(`${this.filePath}.js`),
      options.onRegistJsonTaskCallback(`${this.filePath}.json`),
      options.onRegistWxssTaskCallback(`${this.filePath}.wxss`),
    ])

    const appJson: MiniProgramAppConfig = await loadJsonFile(appJsonTask.absolutePath)

    const [rootPageTasks, subPagesTask, workersTask, componentTasks, imageTasks] = await Promise.all([
      // 解析主包下的pages
      Promise.all(
        _.map(appJson.pages, item => {
          return options.onRegistPageCallback(path.join('', item))
        })
      ),
      // 解析分包下的pages
      Promise.all(
        _.map(
          appJson.subPackages,
          async currentSubPackageItem =>
            await Promise.all(
              _.map(currentSubPackageItem.pages, pageItem => {
                return options.onRegistPageCallback(`${currentSubPackageItem.root}/${pageItem}`)
              })
            )
        )
      ),
      new Promise<string>((resolve, reject) => {
        if (appJson.workers) {
          resolve(appJson.workers)
        } else {
          reject("no workers")
        }
      }).then((workers) => {
        return parseDir(path.resolve(this.context.config.root, `src/${workers}`), {
          recursive: true,
        })
      })
        .then(fileList => {
          return _.map(fileList, filePath => {
            return path.relative(path.join(this.context.config.root, `src/`), filePath)
          })
        })
        .then(async workerFiles => {
          return Promise.all(_.map(workerFiles, workerPath => options.onRegistJsTaskCallback(workerPath)))
        }).catch(error => {
          if (error === "no workers") {
            return []
          } else {
            throw error
          }
        }),
      Promise.all(
        _.map(appJson.usingComponents, item => {
          return options.onRegistComponentCallback(item)
        })
      ),
      parseDir(path.resolve(this.context.config.root, 'src/'), {
        recursive: true,
      })
        .then(fileList => {
          return _.compact(
            _.map(fileList, filePath => {
              if (isImage(filePath)) {
                return path.relative(path.join(this.context.config.root, 'src'), filePath)
              } else {
                return null
              }
            })
          )
        })
        .then(async images => {
          return Promise.all(_.map(images, imagePath => options.onRegistImageTaskCallback(imagePath)))
        }),
    ])

    this.tasks = _.concat(
      appJsTask,
      appJsonTask,
      appWxssTask,
      rootPageTasks,
      _.flatten(subPagesTask),
      componentTasks,
      imageTasks,
      workersTask
    )
  }

  public override async onHandle(): Promise<void> {
    //
  }

  public id(): string {
    return 'App()'
  }
}
