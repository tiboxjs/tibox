// import chalk from "chalk"
import { src, dest } from "gulp";
// import path from "path"
// import replace from "gulp-replace";
import changed from "gulp-changed";
// import filter from "gulp-filter"
// import prune from "gulp-prune"
// import gulpIf from "gulp-if"
// import jeditor from "gulp-json-editor"
import { TaskOptions } from "../libs/options";
import { subComponents } from "./plugins";
// const { subComponets, reverseHome } = require('./plugins');
// const { options, plugins, colorsKey, colorsMain } = require('./tools');

// const {
//   distFolder,
//   patternReg,
//   replaceFunction,
//   nodeModulesFilter,
// } = require('./tools');

const jsonFile = [
  "src/**/*.json",
  "!/src/project.config.json",
  "!src/**/i18n/*.json",
  "!src/subComponents/*/config.json",
];

export const files: string[] = jsonFile;

export default function jsonTask(
  options: TaskOptions
): () => NodeJS.ReadWriteStream {
  return () => {
    let source = src(jsonFile);
    for (let index = 0; index < options.plugins.length; index++) {
      source = source.pipe(options.plugins[index]());
    }
    return (
      source
        // .pipe(gulpIf(options.product !== 'saas', filter(['**', '!*/ext.json'])))
        // .pipe(
        //   gulpIf(
        //     (file) => {
        //       return (
        //         file.path.lastIndexOf(['src', 'ext.json'].join(path.sep)) >= 0 &&
        //         options.extdisable
        //       );
        //     },
        //     jeditor((json) => {
        //       console.info('set ext.json extEnable false');
        //       json.extEnable = false;
        //       return json;
        //     }),
        //   ),
        // )
        // .pipe(replace(patternReg, replaceFunction))
        // .pipe(
        //   gulpIf(
        //     (file) => file.path.lastIndexOf(['src', 'app.json'].join(path.sep)) >= 0,
        //     jeditor((json) => {
        //       if (plugins) {
        //         console.info(chalk.yellow('给app.json注入plugins字段 start...'));
        //         json.plugins = plugins;
        //         console.info(chalk.green('给app.json注入plugins字段 end'));
        //       }
        //       if (options.home == 1) {
        //         json.tabBar.list.splice(2, 1)
        //       }
        //       return json;
        //     }),
        //   ),
        // )
        // .pipe(
        //   gulpIf(
        //     (file) => {
        //       return (
        //         options.product === 'gsm' &&
        //         file.path.lastIndexOf(['src', 'app.json'].join(path.sep)) >= 0
        //       );
        //     },
        //     jeditor((json) => {
        //       console.info('北大光华项目，要求删除tab栏上的“组织”');
        //       json.tabBar.list.splice(1, 1);
        //       return json;
        //     }),
        //   ),
        // )
        .pipe(subComponents())
        // .pipe(reverseHome())
        // .pipe(
        //   prune({
        //     dest: distFolder,
        //     ext: ['.json'],
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

module.exports.files = jsonFile;
