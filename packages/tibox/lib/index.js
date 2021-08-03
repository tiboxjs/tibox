"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./config"), exports);
// import _ from "lodash";
// import { src, dest } from "gulp";
// import replace from "gulp-replace";
// import vfs from "vinyl-fs";
// import map from "map-stream";
// import * as File from "vinyl";
// import { green } from "chalk";
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
// src(["src/project.config.json"])
//   .pipe(replace("$APPID$", "abc"))
//   .pipe(dest("dist"));
// vfs
//   .src(["src/*.js"])
//   .pipe(
//     map((file: File, cb: Function) => {
//       console.log(yellow(JSON.stringify(file)));
//       cb(null, file);
//     })
//   )
//   .dest("dist/");
// console.log(green(`hello world`));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXlCO0FBRXpCLDBCQUEwQjtBQUMxQixvQ0FBb0M7QUFDcEMsc0NBQXNDO0FBQ3RDLDhCQUE4QjtBQUM5QixnQ0FBZ0M7QUFDaEMsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUVqQyx1Q0FBdUM7QUFDdkMsdUNBQXVDO0FBRXZDLGdDQUFnQztBQUNoQyxxREFBcUQ7QUFDckQsMERBQTBEO0FBQzFELFVBQVU7QUFDVixzRUFBc0U7QUFDdEUsbUNBQW1DO0FBRW5DLDBCQUEwQjtBQUMxQixVQUFVO0FBQ1Ysa0NBQWtDO0FBQ2xDLDZFQUE2RTtBQUM3RSxzQ0FBc0M7QUFDdEMsMENBQTBDO0FBQzFDLDBCQUEwQjtBQUMxQixRQUFRO0FBRVIsK0JBQStCO0FBRS9CLG1DQUFtQztBQUNuQyxxQ0FBcUM7QUFDckMseUJBQXlCO0FBRXpCLE1BQU07QUFDTix1QkFBdUI7QUFDdkIsV0FBVztBQUNYLDBDQUEwQztBQUMxQyxtREFBbUQ7QUFDbkQsd0JBQXdCO0FBQ3hCLFNBQVM7QUFDVCxNQUFNO0FBQ04sb0JBQW9CO0FBRXBCLHFDQUFxQyJ9