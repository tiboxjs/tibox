import { src, dest, series } from "gulp";
import { exec, ExecException } from "child_process";
import path from "path";
import through from "through2";
// import replace from "gulp-replace";
import _ from "lodash";
// import fs from "fs";
import chalk from "chalk";
// import loadJsonFile from "load-json-file";
import { TaskOptions } from "../libs/options";
import Undertaker from "undertaker";
import { isWindows } from "../utils";

// const { options, distFolder } = require("./tools");
// const { fileMap, productConfig } = require("./tools");

const yarnCMDOptions = [
  "--prefer-offline",
  "--registry=http://registry.npm.manwei.com",
];
// TODO: log暂时注释掉
// console.log(`--cache-folder: ${process.env.GITLAB_RUNNER_CI_CACHE_FOLODER}`);
if (process.env.GITLAB_RUNNER_CI_CACHE_FOLODER) {
  if (path.isAbsolute(process.env.GITLAB_RUNNER_CI_CACHE_FOLODER)) {
    yarnCMDOptions.push(
      `--cache-folder=${process.env.GITLAB_RUNNER_CI_CACHE_FOLODER}`
    );
  } else {
    yarnCMDOptions.push(
      `--cache-folder=../${process.env.GITLAB_RUNNER_CI_CACHE_FOLODER}`
    );
  }
}

function copyProjectConfigJson(
  options: TaskOptions
): () => NodeJS.ReadWriteStream {
  return () => {
    return src("project.config.json")
      .pipe(
        through.obj((file, encode, cb) => {
          const projectConfigJson = JSON.parse(file.contents.toString());
          projectConfigJson.appid = options.resolvedConfig.appid;
          projectConfigJson.projectname =
            options.resolvedConfig.determinedProjectName;
          file.contents = Buffer.from(
            JSON.stringify(projectConfigJson, null, 2)
          );
          cb(null, file);
        })
      )
      .pipe(dest(options.resolvedConfig.determinedDestDir));
  };
}

/**
 *
 * @param options 参数
 * @returns 流
 */
function copyPackageJson(options: TaskOptions): () => NodeJS.ReadWriteStream {
  return () => {
    return src("package.json")
      .pipe(
        through.obj((file, encode, cb) => {
          const { dependencies } = JSON.parse(file.contents.toString());
          const finalPackageJson = { dependencies };
          file.contents = Buffer.from(
            JSON.stringify(finalPackageJson, null, 2)
          );
          cb(null, file);
        })
      )
      .pipe(dest(options.destDir));
  };
}

/**
 * 安装依赖
 */
export function installPackage(
  options: TaskOptions,
  callback?: Undertaker.TaskCallback
): Undertaker.Task {
  return () => {
    console.log(chalk.yellow("安装package.json依赖 start..."));
    const startTime = Date.now();
    return exec(
      `cnpm i --production ${yarnCMDOptions.join(" ")}`,
      {
        cwd: options.destDir,
        timeout: 60000,
      },
      (err: ExecException | null) => {
        console.log(
          chalk.green(`安装package.json依赖 end ${Date.now() - startTime}ms`)
        );
        if (typeof callback === "function") {
          if (err) {
            callback(err);
          } else {
            callback();
          }
        }
      }
    );
  };
}
// /**
//  * 检查依赖升级
//  */
// const outdatedPackage = (cb) => {
//   console.log(chalk.yellow('检查package.json依赖库版本情况 start...'))
//   let startTime = Date.now()
//   exec(`cnpm outdated --json ${yarnCMDOptions.join(' ')}`,
//     {
//       cwd: distFolder,
//       timeout: 30000,
//     }, (err, stdout) => {
//       console.log(chalk.green(`检查package.json依赖库版本情况 end ${Date.now() - startTime}ms`))
//       if (err && !stdout) {
//         cb(err)
//       } else {
//         let outdatedObj
//         try {
//           outdatedObj = JSON.parse(stdout)
//         } catch (error) {
//           outdatedObj = null
//         }
//         if (outdatedObj) { // 只提示，人工判断是否需要升级
//           for (let packageName in outdatedObj) {
//             let obj = outdatedObj[packageName]
//             if (obj.current === 'linked') {
//               console.log(`${packageName}使用版本为[linked]，绕过更新`.gray)
//             } else if (!_.isEqual(obj.current, obj.wanted)) {
//               console.log(
//                 `${packageName}使用版本为[${obj.current || '无'}]，需要更新为[${obj.wanted}]`.yellow,
//               )
//             }
//           }
//           cb()
//         } else {
//           cb()
//         }
//       }
//     })
// }

/**
 * cli 转换依赖
 * https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html#自动预览
 */
export function cliBuildNpm(
  options: TaskOptions,
  callback?: Undertaker.TaskCallback
): Undertaker.Task {
  return () => {
    console.log(chalk.yellow("cli 构建npm start..."));
    const targetPath = path.resolve(process.cwd(), options.destDir);
    console.log(chalk.gray(`目标路径:${targetPath}`));
    const startTime = Date.now();
    return exec(
      `${isWindows ? "cli.bat" : "cli"} build-npm --project "${targetPath}"`,
      { timeout: 60000 },
      (err) => {
        console.log(chalk.green(`cli 构建npm end ${Date.now() - startTime}ms`));
        if (err) {
          console.log(chalk.red("cli 检查环境变量"));
          typeof callback === "function" && callback(err);
        } else {
          typeof callback === "function" && callback();
        }
      }
    );
  };
}

// /**
//  * 复制项目配置
//  */
// const copyProjectConfig = (callback) => {
//   fs.access(`${distFolder}/project.config.json`, fs.constants.R_OK, err => {
//     callback()
//     if (err) {
//       let index, projectName;
//       projectName = `miniprogram-union`
//       projectName += `-${options.product}`
//       if (options.type === 'stage') {
//         index = 0;
//         projectName += `-stage`
//       } else if (options.type === 'release') {
//         index = 1;
//         projectName += `-release`
//       } else {
//         index = 0;
//         projectName += `-stage`
//       }
//       return src(fileMap.copyProjectConfig)
//         .pipe(replace(/\$APPID\$/, productConfig.appids[index]))
//         .pipe(replace(/\$PROJECT_NAME\$/, projectName))
//         .pipe(dest(distFolder))
//     }
//   })
// }

export function getBuildPackageTask(
  options: TaskOptions
): Undertaker.TaskFunction {
  const tasks = [
    copyProjectConfigJson(options),
    copyPackageJson(options),
    installPackage(options),
    // cliBuildNpm(options),
  ];
  console.log(`options.resolvedConfig.dev:${options.resolvedConfig.dev}`);
  if (options.resolvedConfig.command === "dev") {
    tasks.push(cliBuildNpm(options));
  }
  return series(...tasks);
}
// /**
//  * 安装依赖流水线
//  */
// const tasks = [copyPackage, installPackage, copyProjectConfig]
// if (options.watch) {
//   tasks.push(cliBuildNpm)
//   tasks.push(outdatedPackage)
// }
