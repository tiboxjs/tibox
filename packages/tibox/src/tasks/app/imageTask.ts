import path from 'path'
import { stat } from 'fs/promises'
import { createWriteStream, createReadStream } from 'fs'
import { ensureDir } from '../../utils'
import { ITaskManager } from '..'
import { Task } from '../task'
import { isNeedHandle } from '../../watcher'

export class ImageTask extends Task {
  public id(): string {
    return this.relativeToRootPath
  }

  public override async onInit(options: ITaskManager): Promise<void> {
    //
  }

  public override onHandle(options: ITaskManager): Promise<void> {
    return stat(this.absolutePath)
      .then(stats => {
        return isNeedHandle(this.relativeToRootPath, stats.mtimeMs)
      })
      .then(needHandle => {
        if (needHandle) {
          const distPath = path.join(this.context.config.determinedDestDir, this.filePath)
          const dirname = path.dirname(distPath)
          return ensureDir(path.join(this.context.config.root, dirname)).then(() => {
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
        } else {
          return Promise.resolve()
        }
      })
  }
}
