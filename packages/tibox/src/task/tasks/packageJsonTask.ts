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
  public async handle(): Promise<void> {
    src(this.filePath)
      .pipe(
        dest(
          isWindows
            ? this.config.determinedDestDir
            : path.dirname(`${this.config.determinedDestDir}/${this.filePath}`)
        )
      )
      .on("finish", () => {
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
            if (err) createLogger().error(chalk.red(err));
          }
        ).on("finish", (code) => {
          exec(
            `cli build-npm --project "${path.resolve(
              this.config.root,
              this.config.determinedDestDir
            )}"`,
            { timeout: 60000 },
            (err) => {
              if (err) createLogger().error(chalk.red(err));
            }
          );
        });
      });
  }
}
