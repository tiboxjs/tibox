import { stat } from 'fs/promises'
import { createWriteStream, createReadStream } from 'fs'
import path from 'path'
import { isFileExist } from '../../utils'
import { ITaskManager } from '..'
import { Context, Task } from '../task'
import { isNeedHandle } from '../../watcher'

export class SitemapTask extends Task {
  constructor(context: Context) {
    super(context, 'sitemap.json')
  }
  public id(): string {
    return this.relativeToRootPath
  }

  override get relativeToRootPath(): string {
    return path.relative(this.context.config.root, this.filePath)
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    //
  }
  public override onHandle(options: ITaskManager): Promise<void> {
    return isFileExist(path.resolve(this.context.config.root, this.filePath)).then(flag => {
      if (flag) {
        return stat(this.absolutePath)
          .then(stats => {
            return isNeedHandle(this.relativeToRootPath, stats.mtimeMs)
          })
          .then(needHandle => {
            if (needHandle) {
              return new Promise((resolve, reject) => {
                createReadStream(this.filePath)
                  .pipe(createWriteStream(path.join(this.context.config.determinedDestDir, this.filePath)))
                  .on('finish', () => {
                    resolve()
                  })
                  .on('error', res => {
                    reject(res)
                  })
              })
            } else {
              return Promise.resolve()
            }
          })
      }
    })
  }
}
