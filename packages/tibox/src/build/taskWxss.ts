import { src, dest } from "gulp";
// import debug from "gulp-debug";
// import replace from "gulp-replace"
// import changed from "gulp-changed";
// import prune from "gulp-prune"
import { TaskOptions } from "../libs/options";
import { subComponents } from "./subComponents";
// const { subComponets, reverseHome } = require('./plugins')

// const {
//   distFolder,
//   patternReg,
//   replaceFunction,
//   nodeModulesFilter,
// } = require('./tools')

const wxssFile = ["src/**/*.wxss"];

export default function wxssTask(
  options: TaskOptions
): () => NodeJS.ReadWriteStream {
  return () => {
    let source = src(wxssFile);
    for (let index = 0; index < options.plugins.length; index++) {
      source = source.pipe(options.plugins[index](options.resolvedConfig));
    }
    return (
      source
        // .pipe(replace(patternReg, replaceFunction))
        .pipe(subComponents())
        // .pipe(reverseHome())
        // .pipe(
        //   prune({
        //     dest: distFolder,
        //     ext: ['.wxss'],
        //     verbose: true,
        //     filter: nodeModulesFilter,
        //   }),
        // )
        // .pipe(debug())
        // .pipe(
        //   changed(options.destDir, {
        //     hasChanged: changed.compareLastModifiedTime,
        //   })
        // )
        .pipe(dest(options.destDir))
    );
  };
}

module.exports.files = wxssFile;
