// import debug from "debug";
// import chalk from 'chalk'
import { readFileSync, existsSync, statSync, constants } from 'fs'
import { readFile, readdir, mkdir, stat, access, rm } from 'fs/promises'
import os from 'os'
import path from 'path'
import { createLogger, LogLevel } from './logger'
import _ from 'lodash'
import { Context, Task } from './tasks/task'
import chalk from 'chalk'
// import { pathToFileURL, URL } from 'url'
// import { FS_PREFIX, DEFAULT_EXTENSIONS, VALID_ID_PREFIX } from './constants'
// import resolve from 'resolve'
// import builtins from 'builtin-modules'
// import { FSWatcher } from 'chokidar'
// import remapping from '@ampproject/remapping'
// import {
//   DecodedSourceMap,
//   RawSourceMap
// } from '@ampproject/remapping/dist/types/types'

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

// // Strip valid id prefix. This is prepended to resolved Ids that are
// // not valid browser import specifiers by the importAnalysis plugin.
// export function unwrapId(id: string): string {
//   return id.startsWith(VALID_ID_PREFIX) ? id.slice(VALID_ID_PREFIX.length) : id
// }

// export const flattenId = (id: string): string => id.replace(/[\/\.]/g, '_')

// export function isBuiltin(id: string): boolean {
//   return builtins.includes(id)
// }

// export const bareImportRE = /^[\w@](?!.*:\/\/)/
// export const deepImportRE = /^([^@][^/]*)\/|^(@[^/]+\/[^/]+)\//

// export let isRunningWithYarnPnp: boolean
// try {
//   isRunningWithYarnPnp = Boolean(require('pnpapi'))
// } catch {}

// const ssrExtensions = ['.js', '.json', '.node']

// export function resolveFrom(id: string, basedir: string, ssr = false): string {
//   return resolve.sync(id, {
//     basedir,
//     extensions: ssr ? ssrExtensions : DEFAULT_EXTENSIONS,
//     // necessary to work with pnpm
//     preserveSymlinks: isRunningWithYarnPnp || false
//   })
// }

// set in bin/vite.js
/* const filter = process.env.VITE_DEBUG_FILTER;

const DEBUG = process.env.DEBUG;

interface DebuggerOptions {
  onlyWhenFocused?: boolean | string;
}

export function createDebugger(
  ns: string,
  options: DebuggerOptions = {},
): debug.Debugger["log"] {
  const log = debug(ns);
  const { onlyWhenFocused } = options;
  const focus = typeof onlyWhenFocused === "string" ? onlyWhenFocused : ns;
  return (msg: string, ...args: any[]) => {
    if (filter && !msg.includes(filter)) {
      return;
    }
    if (onlyWhenFocused && !DEBUG?.includes(focus)) {
      return;
    }
    log(msg, ...args);
  };
} */

export const isWindows = os.platform() === 'win32'
// const VOLUME_RE = /^[A-Z]:/i

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

// export function fsPathFromId(id: string): string {
//   const fsPath = normalizePath(id.slice(FS_PREFIX.length))
//   return fsPath.startsWith('/') || fsPath.match(VOLUME_RE)
//     ? fsPath
//     : `/${fsPath}`
// }

// export function ensureVolumeInPath(file: string): string {
//   return isWindows ? path.resolve(file) : file
// }

// export const queryRE = /\?.*$/s
// export const hashRE = /#.*$/s

// export const cleanUrl = (url: string): string =>
//   url.replace(hashRE, '').replace(queryRE, '')

// export const externalRE = /^(https?:)?\/\//
// export const isExternalUrl = (url: string): boolean => externalRE.test(url)

// export const dataUrlRE = /^\s*data:/i
// export const isDataUrl = (url: string): boolean => dataUrlRE.test(url)

// const knownJsSrcRE = /\.((j|t)sx?|mjs|vue|marko|svelte)($|\?)/
// export const isJSRequest = (url: string): boolean => {
//   url = cleanUrl(url)
//   if (knownJsSrcRE.test(url)) {
//     return true
//   }
//   if (!path.extname(url) && !url.endsWith('/')) {
//     return true
//   }
//   return false
// }

// const importQueryRE = /(\?|&)import=?(?:&|$)/
// const trailingSeparatorRE = /[\?&]$/
// export const isImportRequest = (url: string): boolean => importQueryRE.test(url)

// export function removeImportQuery(url: string): string {
//   return url.replace(importQueryRE, '$1').replace(trailingSeparatorRE, '')
// }

// export function injectQuery(url: string, queryToInject: string): string {
//   // encode percents for consistent behavior with pathToFileURL
//   // see #2614 for details
//   let resolvedUrl = new URL(url.replace(/%/g, '%25'), 'relative:///')
//   if (resolvedUrl.protocol !== 'relative:') {
//     resolvedUrl = pathToFileURL(url)
//   }
//   let { protocol, pathname, search, hash } = resolvedUrl
//   if (protocol === 'file:') {
//     pathname = pathname.slice(1)
//   }
//   pathname = decodeURIComponent(pathname)
//   return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${
//     hash || ''
//   }`
// }

// const timestampRE = /\bt=\d{13}&?\b/
// export function removeTimestampQuery(url: string): string {
//   return url.replace(timestampRE, '').replace(trailingSeparatorRE, '')
// }

// export async function asyncReplace(
//   input: string,
//   re: RegExp,
//   replacer: (match: RegExpExecArray) => string | Promise<string>
// ): Promise<string> {
//   let match: RegExpExecArray | null
//   let remaining = input
//   let rewritten = ''
//   while ((match = re.exec(remaining))) {
//     rewritten += remaining.slice(0, match.index)
//     rewritten += await replacer(match)
//     remaining = remaining.slice(match.index + match[0].length)
//   }
//   rewritten += remaining
//   return rewritten
// }

// export function timeFrom(start: number, subtract = 0): string {
//   const time: number | string = Date.now() - start - subtract
//   const timeString = (time + `ms`).padEnd(5, ' ')
//   if (time < 10) {
//     return chalk.green(timeString)
//   } else if (time < 50) {
//     return chalk.yellow(timeString)
//   } else {
//     return chalk.red(timeString)
//   }
// }

// /**
//  * pretty url for logging.
//  */
// export function prettifyUrl(url: string, root: string): string {
//   url = removeTimestampQuery(url)
//   const isAbsoluteFile = url.startsWith(root)
//   if (isAbsoluteFile || url.startsWith(FS_PREFIX)) {
//     let file = path.relative(root, isAbsoluteFile ? url : fsPathFromId(url))
//     const seg = file.split('/')
//     const npmIndex = seg.indexOf(`node_modules`)
//     const isSourceMap = file.endsWith('.map')
//     if (npmIndex > 0) {
//       file = seg[npmIndex + 1]
//       if (file.startsWith('@')) {
//         file = `${file}/${seg[npmIndex + 2]}`
//       }
//       file = `npm: ${chalk.dim(file)}${isSourceMap ? ` (source map)` : ``}`
//     }
//     return chalk.dim(file)
//   } else {
//     return chalk.dim(url)
//   }
// }

export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

// export function isDefined<T>(value: T | undefined | null): value is T {
//   return value != null
// }

export function lookupFile(dir: string, formats: string[], pathOnly = false): string | undefined {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (existsSync(fullPath) && statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : readFileSync(fullPath, 'utf-8')
    }
  }
  const parentDir = path.dirname(dir)
  if (parentDir !== dir) {
    return lookupFile(parentDir, formats, pathOnly)
  }
}

/**
 * 确保路径存在
 * @param path 路径
 */
export async function ensureDir(path: string): Promise<void> {
  if (!(await isFileExist(path))) {
    await mkdir(path, { recursive: true })
  }
}

// const splitRE = /\r?\n/

// const range: number = 2

// export function pad(source: string, n = 2): string {
//   const lines = source.split(splitRE)
//   return lines.map((l) => ` `.repeat(n) + l).join(`\n`)
// }

// export function posToNumber(
//   source: string,
//   pos: number | { line: number; column: number }
// ): number {
//   if (typeof pos === 'number') return pos
//   const lines = source.split(splitRE)
//   const { line, column } = pos
//   let start = 0
//   for (let i = 0; i < line - 1; i++) {
//     start += lines[i].length + 1
//   }
//   return start + column
// }

// export function numberToPos(
//   source: string,
//   offset: number | { line: number; column: number }
// ): { line: number; column: number } {
//   if (typeof offset !== 'number') return offset
//   if (offset > source.length) {
//     throw new Error('offset is longer than source length!')
//   }
//   const lines = source.split(splitRE)
//   let counted = 0
//   let line = 0
//   let column = 0
//   for (; line < lines.length; line++) {
//     const lineLength = lines[line].length + 1
//     if (counted + lineLength >= offset) {
//       column = offset - counted + 1
//       break
//     }
//     counted += lineLength
//   }
//   return { line: line + 1, column }
// }

// export function generateCodeFrame(
//   source: string,
//   start: number | { line: number; column: number } = 0,
//   end?: number
// ): string {
//   start = posToNumber(source, start)
//   end = end || start
//   const lines = source.split(splitRE)
//   let count = 0
//   const res: string[] = []
//   for (let i = 0; i < lines.length; i++) {
//     count += lines[i].length + 1
//     if (count >= start) {
//       for (let j = i - range; j <= i + range || end > count; j++) {
//         if (j < 0 || j >= lines.length) continue
//         const line = j + 1
//         res.push(
//           `${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${
//             lines[j]
//           }`
//         )
//         const lineLength = lines[j].length
//         if (j === i) {
//           // push underline
//           const pad = start - (count - lineLength) + 1
//           const length = Math.max(
//             1,
//             end > count ? lineLength - pad : end - start
//           )
//           res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length))
//         } else if (j > i) {
//           if (end > count) {
//             const length = Math.max(Math.min(end - count, lineLength), 1)
//             res.push(`   |  ` + '^'.repeat(length))
//           }
//           count += lineLength + 1
//         }
//       }
//       break
//     }
//   }
//   return res.join('\n')
// }

// export function writeFile(
//   filename: string,
//   content: string | Uint8Array
// ): void {
//   const dir = path.dirname(filename)
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true })
//   }
//   fs.writeFileSync(filename, content)
// }

// /**
//  * Delete every file and subdirectory. **The given directory must exist.**
//  * Pass an optional `skip` array to preserve files in the root directory.
//  */
// export function emptyDir(dir: string, skip?: string[]): void {
//   for (const file of fs.readdirSync(dir)) {
//     if (skip?.includes(file)) {
//       continue
//     }
//     const abs = path.resolve(dir, file)
//     // baseline is Node 12 so can't use rmSync :(
//     if (fs.lstatSync(abs).isDirectory()) {
//       emptyDir(abs)
//       fs.rmdirSync(abs)
//     } else {
//       fs.unlinkSync(abs)
//     }
//   }
// }

// export function copyDir(srcDir: string, destDir: string): void {
//   fs.mkdirSync(destDir, { recursive: true })
//   for (const file of fs.readdirSync(srcDir)) {
//     const srcFile = path.resolve(srcDir, file)
//     if (srcFile === destDir) {
//       continue
//     }
//     const destFile = path.resolve(destDir, file)
//     const stat = fs.statSync(srcFile)
//     if (stat.isDirectory()) {
//       copyDir(srcFile, destFile)
//     } else {
//       fs.copyFileSync(srcFile, destFile)
//     }
//   }
// }

// export function ensureLeadingSlash(path: string): string {
//   return !path.startsWith('/') ? '/' + path : path
// }

// export function ensureWatchedFile(
//   watcher: FSWatcher,
//   file: string | null,
//   root: string
// ): void {
//   if (
//     file &&
//     // only need to watch if out of root
//     !file.startsWith(root + '/') &&
//     // some rollup plugins use null bytes for private resolved Ids
//     !file.includes('\0') &&
//     fs.existsSync(file)
//   ) {
//     // resolve file to normalized system path
//     watcher.add(path.resolve(file))
//   }
// }

// interface ImageCandidate {
//   url: string
//   descriptor: string
// }
// const escapedSpaceCharacters = /( |\\t|\\n|\\f|\\r)+/g
// export async function processSrcSet(
//   srcs: string,
//   replacer: (arg: ImageCandidate) => Promise<string>
// ): Promise<string> {
//   const imageCandidates: ImageCandidate[] = srcs
//     .split(',')
//     .map((s) => {
//       const [url, descriptor] = s
//         .replace(escapedSpaceCharacters, ' ')
//         .trim()
//         .split(' ', 2)
//       return { url, descriptor }
//     })
//     .filter(({ url }) => !!url)

//   const ret = await Promise.all(
//     imageCandidates.map(async ({ url, descriptor }) => {
//       return {
//         url: await replacer({ url, descriptor }),
//         descriptor
//       }
//     })
//   )

//   const url = ret.reduce((prev, { url, descriptor }, index) => {
//     descriptor = descriptor || ''
//     return (prev +=
//       url + ` ${descriptor}${index === ret.length - 1 ? '' : ', '}`)
//   }, '')

//   return url
// }

// // based on https://github.com/sveltejs/svelte/blob/abf11bb02b2afbd3e4cac509a0f70e318c306364/src/compiler/utils/mapped_code.ts#L221
// const nullSourceMap: RawSourceMap = {
//   names: [],
//   sources: [],
//   mappings: '',
//   version: 3
// }
// export function combineSourcemaps(
//   filename: string,
//   sourcemapList: Array<DecodedSourceMap | RawSourceMap>
// ): RawSourceMap {
//   if (
//     sourcemapList.length === 0 ||
//     sourcemapList.every((m) => m.sources.length === 0)
//   ) {
//     return { ...nullSourceMap }
//   }

//   // We don't declare type here so we can convert/fake/map as RawSourceMap
//   let map //: SourceMap
//   let mapIndex = 1
//   const useArrayInterface =
//     sourcemapList.slice(0, -1).find((m) => m.sources.length !== 1) === undefined
//   if (useArrayInterface) {
//     map = remapping(sourcemapList, () => null, true)
//   } else {
//     map = remapping(
//       sourcemapList[0],
//       function loader(sourcefile) {
//         if (sourcefile === filename && sourcemapList[mapIndex]) {
//           return sourcemapList[mapIndex++]
//         } else {
//           return { ...nullSourceMap }
//         }
//       },
//       true
//     )
//   }
//   if (!map.file) {
//     delete map.file
//   }

//   return map as RawSourceMap
// }

// export function unique<T>(arr: T[]): T[] {
//   return Array.from(new Set(arr))
// }

// export interface Hostname {
//   // undefined sets the default behaviour of server.listen
//   host: string | undefined
//   // resolve to localhost when possible
//   name: string
// }

// export function resolveHostname(
//   optionsHost: string | boolean | undefined
// ): Hostname {
//   let host: string | undefined
//   if (
//     optionsHost === undefined ||
//     optionsHost === false ||
//     optionsHost === 'localhost'
//   ) {
//     // Use a secure default
//     host = '127.0.0.1'
//   } else if (optionsHost === true) {
//     // If passed --host in the CLI without arguments
//     host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
//   } else {
//     host = optionsHost
//   }

//   // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
//   const name =
//     (optionsHost !== '127.0.0.1' && host === '127.0.0.1') ||
//     host === '0.0.0.0' ||
//     host === '::' ||
//     host === undefined
//       ? 'localhost'
//       : host

//   return { host, name }
// }

export async function matchImportJsFile(filePath: string): Promise<RegExpMatchArray | null> {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`The parameter filePath(${filePath}) is not absolute path`)
  }
  const fileContent = await readFile(filePath, {
    encoding: 'utf-8',
  })
  const matchedResult = fileContent
    .replaceAll(/(\/\/.*|\/\*[^]*?\*\/)/g, '')
    .match(/(?<=^((import|export) ((.|\r?\n)* from )?|.*require\()[\'\"]).*(?=[\'\"]\)?;?)/gm)
  return matchedResult
}

export async function matchImportWxmlFile(filePath: string): Promise<RegExpMatchArray | null> {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`The parameter filePath(${filePath}) is not absolute path`)
  }
  const fileContent = await readFile(filePath, {
    encoding: 'utf-8',
  })
  const matchedResult = fileContent.match(/(?<=^ *\<import *src *\= *[\'\"]).*(?=[\'\"] *[\/\>|\> *(\<\/import\>)])/gm)
  return matchedResult
}

export async function matchImportWxssFile(filePath: string): Promise<RegExpMatchArray | null> {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`The parameter filePath(${filePath}) is not absolute path`)
  }
  const fileContent = await readFile(filePath, {
    encoding: 'utf-8',
  })
  const matchedResult = fileContent.match(/(?<=^@import *[\'\"]).*(?=[\'\"];?)/gm)
  return matchedResult
}

/**
 * 根据文件名判断是否为图片文件
 * @param filePath 文件路径 ex: src/images/hello.png
 * @returns true 如果是图片文件
 */
export function isImage(filePath: string): boolean {
  return /\.(png|jpg|svg)$/.test(filePath)
}

/**
 * 解析目录下的文件
 * @param pathDir
 * @param options
 */
export async function parseDir(
  pathDir: string,
  options: {
    recursive?: boolean
    logLevel?: LogLevel
    ignore?: RegExp
  } = {}
): Promise<string[]> {
  const { recursive, logLevel, ignore } = options
  // const logger = createLogger(logLevel);
  if (!path.isAbsolute(pathDir)) {
    throw Error(`${pathDir} is not a absolute path!`)
  }

  if ((!ignore || !ignore.test(pathDir)) && (await isFileExist(pathDir))) {
    const statRes = await stat(pathDir)
    if (statRes.isFile()) {
      return [path.resolve(pathDir)]
    } else {
      const readDirResult = await readdir(pathDir)
      if (recursive) {
        let result: string[] = []
        for (const item of readDirResult) {
          result = _.concat(
            result,
            await parseDir(path.resolve(pathDir, item), {
              recursive,
              logLevel,
              ignore,
            })
          )
        }
        return result
      } else {
        return readDirResult
      }
    }
  } else {
    return []
  }
}

export async function isFileExist(filePath: string): Promise<boolean> {
  if (!path.isAbsolute(filePath)) {
    throw Error(`${filePath} is not a absolute path!`)
  }
  try {
    await access(filePath, constants.R_OK)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 清理文件或者目录
 * @param filePath 文件路径
 * @returns 是否成功
 */
export async function prune(filePath: string): Promise<boolean> {
  if (!path.isAbsolute(filePath)) {
    throw Error(`${filePath} is not a absolute path!`)
  }
  try {
    await rm(filePath, { recursive: true })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 针对小程序中，某些路径的配置，有点形似绝对路径（实际不是，实际是相对src/的路径），通过此方法转换
 *
 * 例如，转换前为 "/components/tbc-example/tbc-example"， 转换后为"components/tbc-example/tbc-example"
 * @param root 项目根路径
 * @param filePath 目标文件
 * @returns 相对项目根目录的路径
 */
export function absolute2Relative(root: string, filePath: string): string {
  return path.relative(path.resolve(root, 'src/'), path.normalize(`src/${filePath}`))
}

export function cmdCli(): string {
  let cliCMD = isWindows ? 'cli.bat' : 'cli'
  if (process.env.WETOOLS_HOME && typeof process.env.WETOOLS_HOME === 'string') {
    if (isWindows) {
      cliCMD = `call "${path.join(process.env.WETOOLS_HOME, 'cli.bat')}"`
    } else {
      cliCMD = path.join(process.env.WETOOLS_HOME, 'cli')
    }
  }
  return cliCMD
}

export function cmdCliFaid(err: Error | null): boolean {
  if (err && /(command not found)|(is not recognized as an internal or external command)/.test(err.message)) {
    createLogger().info(
      chalk.bgRed(
        `未能检测到微信开发者命令行工具，请设置环境变量WETOOLS_HOME，指向开发者工具安装目录${
          isWindows
            ? '(例如：C:\\Program Files (x86)\\Tencent\\微信web开发者工具)'
            : '(例如：/Applications/wechatwebdevtools.app/Contents/MacOS)'
        }`
      )
    )
    return true
  } else {
    return false
  }
}

export async function traceOutUnuse(context: Context, wholeTask: Record<string, Task>): Promise<void> {
  const logger = createLogger(context.config.logLevel)
  /**
   * 项目下需要监听的所有文件
   */
  const needWatches = [
    'src/',
    'project.config.json',
    // TODO: tailwind和svg目录后续处理
    // "tailwind.config.js",
    // "tailwind/",
    // "svg/",
  ]

  const ignoreFiles: RegExp = /\.DS_Store/

  /**
   * 解析结果
   */
  let parseResult: string[] = []
  for (const item of _.map(needWatches, item => path.resolve(context.config.root, item))) {
    parseResult = _.concat(parseResult, await parseDir(item, { recursive: true }))
  }
  // 过滤掉我们并不想跟踪的文件
  parseResult = _.filter(parseResult, item => !ignoreFiles.test(item))
  parseResult = _.map(parseResult, item => path.relative(context.config.root, item))

  // logger.info(chalk.blueBright(`allFiles: ${parseResult.length}`));
  const unTrackedFiles = _.pull(parseResult, ..._.map(wholeTask, task => task.relativeToRootPath))

  // const trackedFiles = taskManager.files();
  // logger.info(
  //   chalk.blueBright(`trackedFiles: ${JSON.stringify(trackedFiles, null, 2)}`)
  // );

  if (unTrackedFiles.length) {
    logger.info(
      chalk.yellow(
        `\n发现以下${unTrackedFiles.length}个文件存在于项目中，但是并未被引用。请检查依赖关系是否正确，在依赖关系被解决前TiBox不会对这些文件做处理`
      )
    )
    _.forEach(unTrackedFiles, (item, index) => {
      logger.info(chalk.yellow(`  ${index + 1}. ${item}`))
    })
  }
}
