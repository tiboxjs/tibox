import path from "path";
import _ from "lodash";
import through2 from "through2";
import loadJsonFile from "load-json-file";
import internal from "stream";
import { ResolvedConfig } from "../config";
import fs from "fs";
import chalk from "chalk";
// const chalk = require('chalk')

type SubComponentsConfig = {
  subPackages: string[];
};

export function subComponents(
  resolvedConfig: ResolvedConfig
): internal.Transform {
  // eslint-disable-next-line space-before-function-paren
  return through2.obj(function (file, encode, callback) {
    const relativePath = path.relative(
      path.resolve(resolvedConfig.root, "src/"),
      file.path
    );
    if (/^subComponents[\\/]/.test(relativePath)) {
      const targetFileAbsolutePathArray = relativePath.split(path.sep);
      const subComponentsIndex =
        targetFileAbsolutePathArray.indexOf("subComponents");
      const start = subComponentsIndex + 2;
      const deleteCount =
        targetFileAbsolutePathArray.length - subComponentsIndex - 2;
      targetFileAbsolutePathArray.splice(start, deleteCount, "config.json");
      const configFileAbsolutePathArray = targetFileAbsolutePathArray;
      const configFilePath = path.resolve(
        resolvedConfig.root,
        "src/",
        configFileAbsolutePathArray.join(path.sep)
      );
      loadJsonFile(configFilePath)
        .then((config) => {
          if (config) {
            const subComponetsConfig = config as SubComponentsConfig;
            if (
              subComponetsConfig.subPackages &&
              subComponetsConfig.subPackages.length
            ) {
              subComponetsConfig.subPackages.forEach((subPackage) => {
                const other = file.clone();
                // const targetFileRelativePathArray = file.path.split(path.sep)
                const relativePathArray = _.split(relativePath, path.sep);
                other.path = path.join(
                  resolvedConfig.root,
                  resolvedConfig.determinedDestDir,
                  "subPackages",
                  subPackage,
                  "components",
                  ..._.tail(relativePathArray)
                );
                console.log(chalk.red(`other.path:${other.path}`));
                fs.mkdirSync(path.dirname(other.path), {
                  recursive: true,
                });
                // fs.promises.
                this.push(other);
              });
            }
            callback();
          } else {
            callback(new Error("配置文件 不正确"));
          }
        })
        .catch((err) => {
          callback(err);
        });
    } else {
      // this.push(file)
      callback(null, file);
    }
  });
}
