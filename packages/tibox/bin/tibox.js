#!/usr/bin/env node

global.__tibox_start_time = Date.now();

// 将构建目录(lib)下的 cli.js 作为脚手架的入口
function start() {
  require("../lib/cli");
}
start();
