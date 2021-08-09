import { src, dest } from "gulp";
import changed from "gulp-changed";
import path from "path";
import { isWindows } from "../utils";
import { TaskOptions } from "../libs/options";
// import prune from "gulp-prune";
// import debug from "gulp-debug";
// import path from "path";
// import gulpif from "gulp-if";
// import filter from "gulp-filter";
import { subComponents } from "./subComponents";
// const { subComponets } = require("./plugins");

// const {
//   options,
//   distFolder,
//   nodeModulesFilter,
//   colorsKey,
// } = require("./tools");

const imageFile = [
  "src/**/*.jpg",
  "src/**/*.gif",
  "src/**/*.png",
  "src/**/*.bmp",
  "src/**/*.svg",
];

export const files = imageFile;
// const menuImageSpecial: string[] = [];

export default function imageTask(
  options: TaskOptions,
  filePath: string
): () => NodeJS.ReadWriteStream {
  return () => {
    return (
      src(`src/${filePath}`)
        .pipe(subComponents(options.resolvedConfig))
        // .pipe(
        //   gulpif(
        //     (file) => {
        //       return file.path.indexOf(path.join("images", "menu", "")) > 0;
        //     },
        //     filter((file) => {
        //       if (options.product === "saas") {
        //         return !menuImageSpecial
        //           .map((item) => {
        //             return path.join("images", "menu", item);
        //           })
        //           .some((item) => {
        //             return file.path.indexOf(item) > 0;
        //           });
        //       } else {
        //         if (file.path.match(/images[\\/]menu[\\/][a-z]+.png/)) {
        //           return true;
        //         } else {
        //           return (
        //             file.path.indexOf(path.join("images", "menu", colorsKey)) > 0
        //           );
        //         }
        //       }
        //     })
        //   )
        // )
        // .pipe(
        //   prune({
        //     dest: distFolder,
        //     ext: [".jpg", ".gif", ".png", ".bmp"],
        //     verbose: true,
        //     filter: nodeModulesFilter,
        //   })
        // )
        .pipe(
          changed(options.destDir, {
            hasChanged: changed.compareLastModifiedTime,
          })
        )
        .pipe(
          dest(
            isWindows
              ? options.destDir
              : path.dirname(`${options.destDir}/${filePath}`)
          )
        )
    );
  };
}

module.exports.files = imageFile;
