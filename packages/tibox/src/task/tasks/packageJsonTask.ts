// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import { dest, src } from "gulp";
import { isWindows } from "../../utils";
import path from "path";
import { createLogger } from "../../logger";
import { exec } from "child_process";
import chalk from "chalk";

export class PackageJsonTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    return new Promise((resolve, reject) => {
      src(this.filePath)
        .pipe(
          dest(
            isWindows
              ? this.config.determinedDestDir
              : path.dirname(
                  `${this.config.determinedDestDir}/${this.filePath}`
                )
          )
        )
        .on("finish", () => {
          resolve("");
        })
        .on("error", (res) => {
          reject(res);
        });
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          const yarnCMDOptions = [
            "--prefer-offline",
            "--registry=http://registry.npm.manwei.com",
          ];
          exec(
            `cnpm i --production ${yarnCMDOptions.join(" ")}`,
            {
              cwd: this.config.determinedDestDir,
              timeout: 60000,
            },
            (err) => {
              if (err) {
                createLogger().error(chalk.red(err));
                reject(err);
              } else {
                resolve("");
              }
            }
          );
        });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          exec(
            `cli build-npm --project "${path.resolve(
              this.config.root,
              this.config.determinedDestDir
            )}"`,
            { timeout: 60000 },
            (err) => {
              if (err) {
                createLogger().error(chalk.red(err));
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      });
  }
}
