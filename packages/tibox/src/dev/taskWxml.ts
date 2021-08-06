import { src, dest } from "gulp";
// import replace from "gulp-replace";
import changed from "gulp-changed";
// import prune from "gulp-prune";
// import filter from "gulp-filter";
// import gulpIf from "gulp-if";
// import rename from "gulp-rename";
import { TaskOptions } from "../libs/options";
import { subComponents } from "./subComponents";
import path from "path";
// const { addWxs, subComponets, reverseHome } = require('./plugins')

// const {
//   distFolder,
//   patternReg,
//   replaceFunction,
//   nodeModulesFilter,
// } = require('./tools')

const wxmlFile = ["src/**/*.wxml"];

export default function wxmlTask(
  options: TaskOptions,
  filePath: string
): () => NodeJS.ReadWriteStream {
  return () => {
    let source = src(`src/${filePath}`);
    for (let index = 0; index < options.plugins.length; index++) {
      source = source.pipe(options.plugins[index](options.resolvedConfig));
    }
    return (
      source
        // .pipe(addWxs())
        // .pipe(replace(patternReg, replaceFunction))
        .pipe(subComponents(options.resolvedConfig))
        // .pipe(reverseHome())
        // .pipe(
        //   prune({
        //     dest: distFolder,
        //     ext: ['.wxml'],
        //     verbose: true,
        //     filter: nodeModulesFilter,
        //   }),
        // )
        .pipe(
          changed(options.destDir, {
            hasChanged: changed.compareLastModifiedTime,
          })
        )
        .pipe(dest(path.dirname(`${options.destDir}/${filePath}`)))
    );
  };
}

module.exports = wxmlTask;
module.exports.files = wxmlFile;
