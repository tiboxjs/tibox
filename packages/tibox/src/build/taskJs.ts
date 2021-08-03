import { src, dest } from "gulp";
// import replace from "gulp-replace";
import changed from "gulp-changed";
// import prune from "gulp-prune";
// import filter from "gulp-filter";
// import gulpIf from "gulp-if";
// import rename from "gulp-rename";
import { TaskOptions } from "../libs/options";
import { subComponents } from "./plugins";
// const { subComponets /* , reverseHome */ } = require("./plugins");

// const {
//   distFolder,
//   patternReg,
//   replaceFunction,
//   // nodeModulesFilter,
//   options,
// } = require("./tools");

const jsFile = ["src/**/*.js"];

export default function jsTask(
  options: TaskOptions
): () => NodeJS.ReadWriteStream {
  return () => {
    let source = src(jsFile);
    for (let index = 0; index < options.plugins.length; index++) {
      source = source.pipe(options.plugins[index]());
    }
    return (
      source
        // .pipe(
        //   filter((file) => {
        //     return (
        //       !/^ext/.test(file.relative) ||
        //       file.relative.indexOf(`${options.product}.config.js`) > 0 ||
        //       file.relative.indexOf(
        //         `${options.product}${
        //           options.type === "stage" ? ".ext.stage.js" : ".ext.js"
        //         }`
        //       ) > 0
        //     );
        //   })
        // )
        // .pipe(
        //   gulpIf(
        //     (file) =>
        //       file.relative.indexOf(
        //         `${options.product}${
        //           options.type === "stage" ? ".ext.stage.js" : ".ext.js"
        //         }`
        //       ) > 0,
        //     rename((path) => {
        //       path.basename = "ext";
        //     })
        //   )
        // )
        .pipe(subComponents())
        // .pipe(replace(patternReg, replaceFunction))
        // .pipe(reverseHome())
        // .pipe(
        //   prune({
        //     dest: distFolder,
        //     ext: ['.js'],
        //     verbose: true,
        //     filter: nodeModulesFilter,
        //   }),
        // )
        .pipe(
          changed(options.destDir, {
            hasChanged: changed.compareLastModifiedTime,
          })
        )
        .pipe(dest(options.destDir))
    );
  };
}

module.exports.files = jsFile;
