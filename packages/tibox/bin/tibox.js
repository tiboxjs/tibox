#!/usr/bin/env node
import { performance } from 'node:perf_hooks'

global.__tibox_start_time = performance.now();

// 将构建目录(dist)下的 cli.js 作为脚手架的入口
function start() {
  return import("../dist/cli.js");
}
start();
