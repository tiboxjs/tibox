import { src, dest } from "gulp";
// import replace from "gulp-replace";
import changed from "gulp-changed";
import { TaskOptions } from "../libs/options";
import { subComponents } from "./plugins";
// import prune from "gulp-prune"

// const { subComponets } = require('./plugins')

// const {
//   distFolder,
//   patternReg,
//   replaceFunction,
//   nodeModulesFilter,
// } = require('./tools')

const wxsFile = ["src/**/*.wxs"];

export default function wxsTask(
  options: TaskOptions
): () => NodeJS.ReadWriteStream {
  return () => {
    let source = src(wxsFile);
    for (let index = 0; index < options.plugins.length; index++) {
      source = source.pipe(options.plugins[index]());
    }
    return (
      source
        // .pipe(replace(patternReg, replaceFunction))
        .pipe(subComponents())
        // .pipe(
        //   prune({
        //     dest: distFolder,
        //     ext: ['.wxs'],
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
module.exports.files = wxsFile;
