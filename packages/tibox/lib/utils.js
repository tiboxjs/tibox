"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupFile = exports.isObject = exports.normalizePath = exports.isWindows = exports.createDebugger = exports.slash = void 0;
const debug_1 = __importDefault(require("debug"));
// import chalk from 'chalk'
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
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
function slash(p) {
    return p.replace(/\\/g, "/");
}
exports.slash = slash;
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
const filter = process.env.VITE_DEBUG_FILTER;
const DEBUG = process.env.DEBUG;
function createDebugger(ns, options = {}) {
    const log = debug_1.default(ns);
    const { onlyWhenFocused } = options;
    const focus = typeof onlyWhenFocused === "string" ? onlyWhenFocused : ns;
    return (msg, ...args) => {
        if (filter && !msg.includes(filter)) {
            return;
        }
        if (onlyWhenFocused && !(DEBUG === null || DEBUG === void 0 ? void 0 : DEBUG.includes(focus))) {
            return;
        }
        log(msg, ...args);
    };
}
exports.createDebugger = createDebugger;
exports.isWindows = os_1.default.platform() === "win32";
// const VOLUME_RE = /^[A-Z]:/i
function normalizePath(id) {
    return path_1.default.posix.normalize(exports.isWindows ? slash(id) : id);
}
exports.normalizePath = normalizePath;
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
function isObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}
exports.isObject = isObject;
// export function isDefined<T>(value: T | undefined | null): value is T {
//   return value != null
// }
function lookupFile(dir, formats, pathOnly = false) {
    for (const format of formats) {
        const fullPath = path_1.default.join(dir, format);
        if (fs_1.default.existsSync(fullPath) && fs_1.default.statSync(fullPath).isFile()) {
            return pathOnly ? fullPath : fs_1.default.readFileSync(fullPath, "utf-8");
        }
    }
    const parentDir = path_1.default.dirname(dir);
    if (parentDir !== dir) {
        return lookupFile(parentDir, formats, pathOnly);
    }
}
exports.lookupFile = lookupFile;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLDRCQUE0QjtBQUM1Qiw0Q0FBb0I7QUFDcEIsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QiwyQ0FBMkM7QUFDM0MsK0VBQStFO0FBQy9FLGdDQUFnQztBQUNoQyx5Q0FBeUM7QUFDekMsdUNBQXVDO0FBQ3ZDLGdEQUFnRDtBQUNoRCxXQUFXO0FBQ1gsc0JBQXNCO0FBQ3RCLGlCQUFpQjtBQUNqQixrREFBa0Q7QUFFbEQsU0FBZ0IsS0FBSyxDQUFDLENBQVM7SUFDN0IsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsc0JBRUM7QUFFRCx1RUFBdUU7QUFDdkUsdUVBQXVFO0FBQ3ZFLGlEQUFpRDtBQUNqRCxrRkFBa0Y7QUFDbEYsSUFBSTtBQUVKLDhFQUE4RTtBQUU5RSxtREFBbUQ7QUFDbkQsaUNBQWlDO0FBQ2pDLElBQUk7QUFFSixrREFBa0Q7QUFDbEQsa0VBQWtFO0FBRWxFLDJDQUEyQztBQUMzQyxRQUFRO0FBQ1Isc0RBQXNEO0FBQ3RELGFBQWE7QUFFYixrREFBa0Q7QUFFbEQsa0ZBQWtGO0FBQ2xGLDhCQUE4QjtBQUM5QixlQUFlO0FBQ2YsNERBQTREO0FBQzVELHFDQUFxQztBQUNyQyxzREFBc0Q7QUFDdEQsT0FBTztBQUNQLElBQUk7QUFFSixxQkFBcUI7QUFDckIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztBQUU3QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQU1oQyxTQUFnQixjQUFjLENBQzVCLEVBQVUsRUFDVixVQUEyQixFQUFFO0lBRTdCLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJ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