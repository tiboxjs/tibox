import path from 'node:path'
import { stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { ensureDir } from '../../utils'
import type { ITaskManager } from '..'
import { Task } from '../task'
import { isNeedHandle } from '../../watcher'

export class ImageTask extends Task {
  public id(): string {
    return this.relativeToRootPath
  }

  public override async onInit(_: ITaskManager): Promise<void> {
    //
  }

  public override onHandle(_: ITaskManager): Promise<void> {
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
