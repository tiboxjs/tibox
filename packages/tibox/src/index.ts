// import _ from "lodash";
import vfs from "vinyl-fs";
import map from "map-stream";
import * as File from "vinyl";
import { yellow, green } from "chalk";

// import { program } from "commander";
// import create from "./order/create";

// // ts-cli -v、ts-cli --version
// // 临时禁用规则，保证这里可以通过 require 方法获取 package.json 中的版本号
// /* eslint-disable @typescript-eslint/no-var-requires */
// program
//   .version(`${require("../package.json").version}`, "-v --version")
//   .usage("<command> [options]");

// // ts-cli create newPro
// program
//   .command("create <app-name>")
//   .description("Create new project from => ts-cli create yourProjectName")
//   .action(async (name: string) => {
//     // 创建命令具体做的事情都在这里，name 是你指定的 newPro
//     await create(name);
//   });

// program.parse(process.argv);

vfs.src(["src/*.js"]).pipe(
  map((file: File, cb: Function) => {
    console.log(yellow(JSON.stringify(file)));
    cb(null, file);
  })
).dest('dist/');

console.log(green(`hello world`));
