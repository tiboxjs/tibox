// import { createLogger } from "../logger";
import { stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import chalk from 'chalk'
import * as _ from 'lodash-es'
import { isNeedHandle } from '../../watcher'
import { createLogger } from '../../logger'
import { Task } from '../task'
import type { Context as TContext} from '../task';
import { cmdCli, cmdCliFaid, ensureDir  } from '../../utils'
import type { ITaskManager } from '..'

export class PackageJsonTask extends Task {
  constructor(context: TContext) {
    super(context, 'package.json')
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
    return stat(this.absolutePath)
      .then(stats => {
        return isNeedHandle(this.relativeToRootPath, stats.mtimeMs)
      })
      .then(needHandle => {
        if (needHandle) {
          const distPath = path.join(this.context.config.determinedDestDir, this.filePath)
          return ensureDir(path.join(this.context.config.root, path.dirname(distPath)))
            .then(() => {
              return new Promise((resolve, reject) => {
                createReadStream(this.filePath)
                  .pipe(createWriteStream(distPath))
                  .on('finish', () => {
                    resolve('')
                  })
                  .on('error', res => {
                    reject(res)
                  })
              })
            })
            .then(() => {
              return new Promise((resolve, reject) => {
                const yarnCMDOptions = ['--prefer-offline', '--registry=http://registry.npm.manwei.com']
                exec(
                  `cnpm i --production ${yarnCMDOptions.join(' ')}`,
                  {
                    cwd: this.context.config.determinedDestDir,
                    timeout: 60000,
                  },
                  err => {
                    if (err) {
                      if (/Unexpected token < in JSON at position 0/.test(err.message)) {
                        createLogger().error(chalk.red('执行cnpm安装时，registry服务响应异常，请检查网络是否正常'))
                        resolve('')
                      } else {
                        reject(err)
                      }
                    } else {
                      resolve('')
                    }
                  }
                )
              }).catch(err => {
                createLogger().error(chalk.red(err))
                return Promise.resolve()
              })
            })
            .then(() => {
              if (this.context.config.command === 'dev') {
                return new Promise((resolve, _) => {
                  const cliCMD = cmdCli()
                  const time = Date.now()
                  exec(
                    `${cliCMD} build-npm --project "${path.resolve(
                      this.context.config.root,
                      this.context.config.determinedDestDir
                    )}"`,
                    { timeout: 30000 },
                    err => {
                      if (!err) {
                        createLogger().info(chalk.green(`构建npm包成功 ${Date.now() - time}ms`))
                      } else {
                        const handled = cmdCliFaid(err)
                        if (!handled) {
                          createLogger().error(chalk.red(err.message))
                        }
                      }
                      resolve()
                    }
                  )
                })
              } else {
                return Promise.resolve()
              }
            })
        } else {
          return Promise.resolve()
        }
      })
  }
}
