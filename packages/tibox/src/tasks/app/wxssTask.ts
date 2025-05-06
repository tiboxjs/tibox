import { access, stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import path from 'node:path'
import * as _ from 'lodash-es'
import colors from 'picocolors'
import { absolute2Relative, ensureDir, matchImportWxssFile  } from '../../utils'
import type { ITaskManager } from '..'
import { Task } from '../task'
import { isNeedHandle } from '../../watcher'
import { createLogger } from '../../logger'

export class WxssTask extends Task {
  public id(): string {
    return this.relativeToRootPath
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies
    if (!isDependencies(this.filePath)) {
      try {
        await access(this.absolutePath)
        const matchedResult = await matchImportWxssFile(
          path.resolve(this.context.config.root, path.join('src', this.filePath))
        )

        const wxssTasks = await Promise.all(
          _.map(matchedResult, item => {
            if (!/\.wxss$/.test(item)) {
              item += '.wxss'
            }
            const filePath = path.normalize(
              path.isAbsolute(item)
                ? absolute2Relative(this.context.config.root, item)
                : path.join(path.dirname(this.filePath), item)
            )
            return options.onRegistWxssTaskCallback(filePath)
          })
        )
        this.tasks = wxssTasks
      } catch (error: any) {
        if (!/no such file or directory/.test(error.message)) {
          throw error
        }
        createLogger().info(colors.yellow(`${this.absolutePath} 文件不存在，忽略解析`))
      }
    }
  }

  public override async onHandle(_: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies
    if (!isDependencies(this.filePath)) {
      try {
        const stats = await stat(this.absolutePath)
        if (isNeedHandle(this.relativeToRootPath, stats.mtimeMs)) {
          const distPath = path.join(this.context.config.determinedDestDir, this.filePath)
          return ensureDir(path.join(this.context.config.root, path.dirname(distPath))).then(() => {
            return new Promise((resolve, reject) => {
              createReadStream(path.join('src', this.filePath))
                .pipe(createWriteStream(distPath))
                .on('finish', () => {
                  resolve()
                })
                .on('error', res => {
                  reject(res)
                })
            })
          })
        }
      } catch (error: any) {
        if (!/no such file or directory/.test(error.message)) {
          throw error
        }
      }
    } else {
      return Promise.resolve()
    }
  }
}
