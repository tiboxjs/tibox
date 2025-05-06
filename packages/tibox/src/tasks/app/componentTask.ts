import path from 'node:path'
import { access } from 'node:fs/promises'
import * as _ from 'lodash-es'
import loadJsonFile from 'load-json-file'
import chalk from 'chalk'
import { createLogger /* , Logger */ } from '../../logger'
import { Task } from '../task'
import type { ITaskManager } from '..'
import { absolute2Relative } from '../../utils'
import { DEBUGING } from '../../constants'
export type MiniProgramComponentConfig = {
  usingComponents?: Record<string, string>
}
/**
 * 组件任务，专门处理组件
 */
export class ComponentTask extends Task {
  public override async onInit(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies
    if (isDependencies(this.filePath) || /^@/.test(this.filePath)) {
      if (DEBUGING) {
        createLogger().info(`\nComponent [${this.filePath}] ignore`)
      }
    } else {
      this.tasks = await Promise.all([
        options.onRegistJsTaskCallback(`${this.filePath}.js`),
        options.onRegistJsonTaskCallback(`${this.filePath}.json`),
        options.onRegistWxmlTaskCallback(`${this.filePath}.wxml`),
        options.onRegistWxssTaskCallback(`${this.filePath}.wxss`),
      ])

      const componentJsonFileAbsolutePath = path.resolve(this.context.config.root, 'src', `${this.filePath}.json`)
      try {
        await access(componentJsonFileAbsolutePath)
        const componentJson: MiniProgramComponentConfig = await loadJsonFile(
          path.resolve(this.context.config.root, 'src', `${this.filePath}.json`)
        )
        if (componentJson.usingComponents) {
          const otherComponentTasks = await Promise.all(
            _.map(componentJson.usingComponents, componentPath => {
              let targetPath: string
              if (path.isAbsolute(componentPath)) {
                targetPath = absolute2Relative(this.context.config.root, componentPath)
              } else if (componentPath.startsWith('.')) {
                targetPath = path.relative(
                  path.join(this.context.config.root, 'src'),
                  path.resolve(path.dirname(path.join('src', this.filePath)), componentPath)
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
        createLogger().info(chalk.yellow(`${componentJsonFileAbsolutePath} 文件不存在，忽略解析`))
      }
    }
  }

  public override async onHandle(): Promise<void> {
    //
  }

  public id(): string {
    return `Component(${this.filePath})`
  }
}
