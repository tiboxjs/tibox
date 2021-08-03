import { src, dest } from "gulp";
import changed from "gulp-changed";
import { TaskOptions } from "../libs/options";
// import prune from "gulp-prune";
// import debug from "gulp-debug";
// import path from "path";
// import gulpif from "gulp-if";
// import filter from "gulp-filter";
import { subComponents } from "./plugins";
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
  options: TaskOptions
): () => NodeJS.ReadWriteStream {
  return () => {
    return (
      src(imageFile)
        .pipe(subComponents())
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
        .pipe(dest(options.destDir))
    );
  };
}

module.exports.files = imageFile;
