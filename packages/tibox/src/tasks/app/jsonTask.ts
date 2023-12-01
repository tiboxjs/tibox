// import { createLogger } from "../logger";
import { ITaskManager } from '..'
import { Task } from '../task'
import { stat } from 'fs/promises'
import { createWriteStream, createReadStream } from 'fs'
import { ensureDir } from '../../utils'
import path from 'path'
import { isNeedHandle } from '../../watcher'
import through from 'through2'

export class JsonTask extends Task {
  public id(): string {
    return this.relativeToRootPath
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    //
  }

  public override async onHandle(options: ITaskManager): Promise<void> {
    const isDependencies = this.context.config.isDependencies
    if (!isDependencies(this.filePath)) {
      try {
        const stats = await stat(this.absolutePath)
        if (isNeedHandle(this.relativeToRootPath, stats.mtimeMs)) {
          const distPath = path.join(this.context.config.determinedDestDir, this.filePath)
          return ensureDir(path.join(this.context.config.root, path.dirname(distPath))).then(() => {
            return new Promise((resolve, reject) => {
              createReadStream(path.join('src/', this.filePath))
                .pipe(
                  through.obj((buffer, encode, cb) => {
                    let fileContent = buffer.toString(encode) as string
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
