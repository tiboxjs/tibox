import { stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import path from 'node:path'
import { isFileExist } from '../../utils'
import type { ITaskManager } from '..'
import type { Context} from '../task';
import { Task } from '../task'
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

  public override async onInit(_: ITaskManager): Promise<void> {
    //
  }
  public override onHandle(_: ITaskManager): Promise<void> {
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
