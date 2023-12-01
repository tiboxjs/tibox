import path from 'path'
import { fileURLToPath } from 'url'

import _ from 'lodash'

import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import pkg from './package.json' assert { type: 'json' };

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const external = Object.keys(pkg.dependencies || {})

// _.remove(external, (name) => name === 'miniprogram-ci')

export default {
  input: ['src/index.ts', 'src/cli.ts'],
  output: {
    dir: 'dist',
    sourcemap: true,
  },
  // 该选项用于匹配需要排除在 bundle 外部的模块
  // https://cn.rollupjs.org/configuration-options/#external
  // external: ['fs', 'path', 'util', 'os', 'tty', 'events', 'stream', 'assert', 'fsevent', /node_modules/, 'miniprogram-ci'],
  external: external,
  plugins: [
    // commonjs({
    //   extensions: ['.js'],
    //   // Optional peer deps of ws. Native deps that are mostly for performance.
    //   // Since ws is not that perf critical for us, just ignore these deps.
    //   ignore: ['bufferutil', 'utf-8-validate'],
    // }),
    nodeResolve({ preferBuiltins: true }),
    json(),
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      sourceMap: true,
    }),
  ],
}
