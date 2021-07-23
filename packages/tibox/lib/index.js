"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import _ from "lodash";
const vinyl_fs_1 = __importDefault(require("vinyl-fs"));
const map_stream_1 = __importDefault(require("map-stream"));
const chalk_1 = require("chalk");
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
vinyl_fs_1.default.src(["*.js"]).pipe(map_stream_1.default((file, cb) => {
    console.log(chalk_1.yellow(JSON.stringify(file)));
    cb(null, file);
}));
console.log(chalk_1.green(`hello world`));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwQkFBMEI7QUFDMUIsd0RBQTJCO0FBQzNCLDREQUE2QjtBQUU3QixpQ0FBc0M7QUFFdEMsdUNBQXVDO0FBQ3ZDLHVDQUF1QztBQUV2QyxnQ0FBZ0M7QUFDaEMscURBQXFEO0FBQ3JELDBEQUEwRDtBQUMxRCxVQUFVO0FBQ1Ysc0VBQXNFO0FBQ3RFLG1DQUFtQztBQUVuQywwQkFBMEI7QUFDMUIsVUFBVTtBQUNWLGtDQUFrQztBQUNsQyw2RUFBNkU7QUFDN0Usc0NBQXNDO0FBQ3RDLDBDQUEwQztBQUMxQywwQkFBMEI7QUFDMUIsUUFBUTtBQUVSLCtCQUErQjtBQUUvQixrQkFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNwQixvQkFBRyxDQUFDLENBQUMsSUFBVSxFQUFFLEVBQVksRUFBRSxFQUFFO0lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztBQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMifQ==