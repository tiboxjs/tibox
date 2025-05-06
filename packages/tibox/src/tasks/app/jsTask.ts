import path from 'node:path'
import { access, stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import * as lodash from 'lodash-es'
import colors from 'picocolors'
import through from 'through2'
import { absolute2Relative, ensureDir, matchImportJsFile } from '../../utils'
import type { ITaskManager } from '..'
import { Task } from '../task'
import { createLogger } from '../../logger'
import { isNeedHandle } from '../../watcher'

export class JsTask extends Task {
  public id(): string {
    return this.relativeToRootPath
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    this.tasks = []
    const isDependencies = this.context.config.isDependencies
    if (!isDependencies(this.filePath) && !/(?:\\|\/)ext\.js/.test(this.filePath)) {
      try {
        await access(this.absolutePath)
        const matchedResult = await matchImportJsFile(this.absolutePath)

        const jsTasks = await Promise.all(
          lodash.map(matchedResult, item => {
            if (!isDependencies(item) && !/\.js$/.test(item)) {
              item += '.js'
            }
            const filePath = path.normalize(
              path.isAbsolute(item)
                ? absolute2Relative(this.context.config.root, item)
                : isDependencies(item)
                  ? item
                  : path.join(path.dirname(this.filePath), item)
            )
            return options.onRegistJsTaskCallback(filePath)
          })
        )
        this.tasks = jsTasks
      } catch (error: any) {
        if (!/no such file or directory/.test(error.message)) {
          throw error
        }
        createLogger().info(colors.yellow(`${this.absolutePath} 文件不存在，忽略解析`))
      }
    } else {
      // TODO: extjs需要如何处理?
    }
  }

  public override async onHandle(_: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies
    if (!isDependencies(this.filePath) && !/(?:\\|\/)ext\.js/.test(this.filePath)) {
      try {
        const stats = await stat(this.absolutePath)
        if (isNeedHandle(this.relativeToRootPath, stats.mtimeMs)) {
          const distPath = path.join(this.context.config.determinedDestDir, this.filePath)
          await ensureDir(path.join(this.context.config.root, path.dirname(distPath)))
          return new Promise((resolve, reject) => {
            createReadStream(path.join('src', this.filePath))
              .pipe(
                through.obj((buffer, encode, cb) => {
                  let fileContent = buffer.toString(encode) as string

                  const replacer = (matched: string) => {
                    const mapper: Record<string, string> = {
                      '[[VERSION]]': this.context.config.version as string,
                      '[[PRODUCT_NAME]]': this.context.config.product as string,
                      '[[GIT_COMMIT_ID]]': this.context.config.commitId,
                    }
                    return mapper[matched] || matched
                  }
                  fileContent = lodash.replace(fileContent, /\[\[.*?\]\]/g, replacer)
                  // TODO: 待优化
                  this.context.config.plugins.forEach(async plugin => {
                    fileContent = await plugin.transform(fileContent)
                  })

                  buffer = Buffer.from(fileContent)
                  cb(null, buffer)
                })
              )
              .pipe(createWriteStream(distPath))
              .on('finish', () => {
                resolve()
              })
              .on('error', res => {
                reject(res)
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
