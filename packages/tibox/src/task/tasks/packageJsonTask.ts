// import { createLogger } from "../logger";
import { ITaskManager } from "..";
import { SingleTask } from "../task";
import fs from "fs-extra";
import path from "path";
import { createLogger } from "../../logger";
import { exec } from "child_process";
import chalk from "chalk";

export class PackageJsonTask extends SingleTask {
  public async init(options: ITaskManager): Promise<void> {
    //
  }
  public handle(): Promise<void> {
    const distPath = path.join(this.config.determinedDestDir, this.filePath);
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
        if (this.config.command === "dev") {
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
        } else {
          return Promise.resolve();
        }
      });
  }
}
