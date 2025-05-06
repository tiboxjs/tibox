import path from 'node:path'
import { access } from 'node:fs/promises'
import * as _ from 'lodash-es'
import { loadJsonFile } from 'load-json-file'
import colors from 'picocolors'
import type { ITaskManager } from '..'
import { absolute2Relative } from '../../utils'
import { Task } from '../task'
import { createLogger } from '../../logger'

export type MiniProgramPageConfig = {
  usingComponents?: Record<string, string>
}
export class PageTask extends Task {
  public override async onInit(options: ITaskManager): Promise<void> {
    this.tasks = await Promise.all([
      options.onRegistJsTaskCallback(`${this.filePath}.js`),
      options.onRegistJsonTaskCallback(`${this.filePath}.json`),
      options.onRegistWxmlTaskCallback(`${this.filePath}.wxml`),
      options.onRegistWxssTaskCallback(`${this.filePath}.wxss`),
    ])

    const pageJsonFileAbsolutePath = path.resolve(this.context.config.root, 'src', `${this.filePath}.json`)
    try {
      await access(pageJsonFileAbsolutePath)
      const pageJson: MiniProgramPageConfig = await loadJsonFile(pageJsonFileAbsolutePath)
      if (pageJson.usingComponents) {
        const otherComponentTasks = await Promise.all(
          _.map(pageJson.usingComponents, componentPath => {
            let targetPath: string
            if (path.isAbsolute(componentPath)) {
              targetPath = absolute2Relative(this.context.config.root, componentPath)
            } else if (componentPath.startsWith('.')) {
              targetPath = path.relative(
                this.context.config.root,
                path.resolve(path.dirname(this.filePath), componentPath)
              )
            } else {
              targetPath = componentPath
            }
            return options.onRegistComponentCallback(targetPath)
          })
        )
        this.tasks = _.concat(this.tasks, otherComponentTasks)
      }
    } catch (error: any) {
      if (!/no such file or directory/.test(error.message)) {
        throw error
      }
      createLogger().info(colors.yellow(`${pageJsonFileAbsolutePath} 文件不存在，忽略解析`))
    }
  }

  public override async onHandle(): Promise<void> {
    //
  }

  public id(): string {
    return `Page(${this.filePath})`
  }
}
