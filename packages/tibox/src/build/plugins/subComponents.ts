import path from "path";
import _ from "lodash";
import through2 from "through2";
import loadJsonFile from "load-json-file";
import internal from "stream";
// const chalk = require('chalk')

type SubComponentsConfig = {
  subPackages: string[];
};

export function subComponents(): internal.Transform {
  // eslint-disable-next-line space-before-function-paren
  return through2.obj(function (file, encode, callback) {
    if (/^subComponents[\\/]/.test(file.relative)) {
      const targetFileAbsolutePathArray = file.path.split(path.sep);
      const subComponentsIndex =
        targetFileAbsolutePathArray.indexOf("subComponents");
      const start = subComponentsIndex + 2;
      const deleteCount =
        targetFileAbsolutePathArray.length - subComponentsIndex - 2;
      targetFileAbsolutePathArray.splice(start, deleteCount, "config.json");
      const configFileAbsolutePathArray = targetFileAbsolutePathArray;
      const configFilePath = configFileAbsolutePathArray.join(path.sep);
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
                const relativePathArray = _.split(file.relative, path.sep);
                other.path = path.join(
                  file.base,
                  "subPackages",
                  subPackage,
                  "components",
                  ..._.tail(relativePathArray)
                );
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
