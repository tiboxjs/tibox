// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import fs from "fs-extra";
import path from "path";
import { createLogger } from "../../logger";
import { exec } from "child_process";
import chalk from "chalk";
import { isNeedHandle } from "../../watcher";
import npminstall from "npminstall";
import Context from "npminstall/lib/context";

import _ from "lodash";
import { isWindows } from "../../utils";

export class PackageJsonTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    const distPath = path.join(this.config.determinedDestDir, this.filePath);
    return fs.promises
      .stat(this.filePath)
      .then((stats) => {
        return isNeedHandle(this.filePath, stats.mtimeMs);
      })
      .then((needHandle) => {
        if (needHandle) {
          return fs
            .ensureDir(path.dirname(distPath))
            .then(() => {
              return new Promise((resolve, reject) => {
                fs.createReadStream(this.filePath)
                  .pipe(fs.createWriteStream(distPath))
                  .on("finish", () => {
                    resolve("");
                  })
                  .on("error", (res) => {
                    reject(res);
                  });
              });
            })
            .then(() => {
              return npminstall(
                {
                  root: this.config.determinedDestDir,
                  registry: "http://registry.npm.manwei.com",
                  production: true,
                  trace: false,
                },
                new Context()
              );
            })
            .then(() => {
              if (this.config.command === "dev") {
                return new Promise((resolve, reject) => {
                  let cliCMD = isWindows ? "cli.bat" : "cli";
                  if (
                    process.env.WETOOLS_HOME &&
                    typeof process.env.WETOOLS_HOME === "string"
                  ) {
                    cliCMD = path.join(
                      process.env.WETOOLS_HOME,
                      `${isWindows ? "cli.bat" : "cli"}`
                    );
                  }
                  const time = Date.now();
                  exec(
                    `${cliCMD} build-npm --project "${path.resolve(
                      this.config.root,
                      this.config.determinedDestDir
                    )}"`,
                    { timeout: 60000 },
                    (err) => {
                      if (err) {
                        createLogger().error(chalk.red(err));
                        reject(err);
                      } else {
                        createLogger().info(
                          chalk.green(`构建npm包成功 ${Date.now() - time}ms`)
                        );
                        resolve();
                      }
                    }
                  );
                });
              } else {
                return Promise.resolve();
              }
            });
        } else {
          return Promise.resolve();
        }
      });
  }
}
