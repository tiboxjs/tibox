import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import MagicString from 'magic-string'
import { defineConfig } from 'rollup'
import type { Plugin } from 'rollup'

// import * as _ from 'lodash'

import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)).toString(),
)

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const external = Object.keys(pkg.dependencies || {})

// _.remove(external, (name) => name === 'miniprogram-ci')


/**
 * Inject CJS Context for each deps chunk
 */
function cjsPatchPlugin(): Plugin {
  const cjsPatch = `
import { createRequire as __cjs_createRequire } from 'node:module';

const __require = __cjs_createRequire(import.meta.url);
`.trimStart()

  return {
    name: 'cjs-chunk-patch',
    renderChunk(code, chunk) {
      if (!chunk.fileName.includes('chunks/dep-')) return
      if (!code.includes('__require')) return

      const match = /^(?:import[\s\S]*?;\s*)+/.exec(code)
      const index = match ? match.index! + match[0].length : 0
      const s = new MagicString(code)
      // inject after the last `import`
      s.appendRight(index, cjsPatch)
      console.log('patched cjs context: ' + chunk.fileName)
      return s.toString()
    },
  }
}

export default defineConfig({
  input: ['src/index.ts', 'src/cli.ts', 'src/constants.ts'],
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
    esbuild({
      tsconfig: path.resolve(__dirname, 'src/tsconfig.json'),
      target: 'node18',
      // ...esbuildOptions,
    }),
    commonjs({
      extensions: ['.js'],
      // Optional peer deps of ws. Native deps that are mostly for performance.
      // Since ws is not that perf critical for us, just ignore these deps.
      ignore: ['bufferutil', 'utf-8-validate'],
      sourceMap: false,
      strictRequires: 'auto',
    }),
    json(),
    cjsPatchPlugin(),
  ],
})

