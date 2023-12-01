import path from 'path'
import { stat } from 'fs/promises'
import { createWriteStream, createReadStream } from 'fs'
import through from 'through2'
import { Context, Task } from '../task'
import { ITaskManager } from '..'
import { isNeedHandle } from '../../watcher'

export class ProjectConfigTask extends Task {
  constructor(context: Context) {
    super(context, 'project.config.json')
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
    return stat(this.absolutePath)
      .then(stats => {
        return isNeedHandle(this.relativeToRootPath, stats.mtimeMs)
      })
      .then(needHandle => {
        if (needHandle) {
          return new Promise((resolve, reject) => {
            createReadStream(this.absolutePath)
              .pipe(
                through.obj((buffer, encode, cb) => {
                  const projectConfigJson = JSON.parse(buffer.toString(encode))
                  projectConfigJson.appid = this.context.config.appid
                  projectConfigJson.projectname = this.context.config.determinedProjectName
                  buffer = Buffer.from(JSON.stringify(projectConfigJson, null, 2))
                  cb(null, buffer)
                })
              )
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
}
