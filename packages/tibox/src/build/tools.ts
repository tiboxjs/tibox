// const minimist = require('minimist')
// const _ = require('lodash-es');
// const camel = require('naming-style').camel
// const path = require('path')
// const fs = require('fs')

// const packageJson = JSON.parse(fs.readFileSync('./package.json'))

// // 需要转驼峰的参数
// const camelOptions = [
//   'private-key-path',
// ]
// /**
//  * product参数默认值
//  * @param { Boolean } watch 开发环境监听文件变化
//  * @param { String } product 生成产品
//  * @param { String } type stage:测试小程序，release:正式小程序
//  * @param { String } desc 上传的代码的注释
//  * @param { Number } robot 上传机器人的编号[1-5]
//  * @param { Number } home 首页类型1:心力手册首页,2:saas首页
//  */
// const knownOptions = {
//   boolean: ['watch', 'extdisable'],
//   string: ['product', 'type', 'desc', ...camelOptions],
//   number: ['robot', 'home'],
//   default: { watch: false, product: 'default', type: 'stage', robot: 1, home: 1, extdisable: false },
// }

// const options = minimist(process.argv.slice(2), knownOptions)

// _.each(camelOptions, item => {
//   options[camel(item)] = options[item]
//   delete options[item]
// });

// // 目标目录
// let distFolder = `./dist-college`
// let extFilePath = '../src/ext/'
// let extFileName = 'ext'
// let requireExtFilePath = `${extFilePath}${options.product}.${extFileName}`;
// if (options.product !== 'default') {
//   distFolder += `-${options.product}`
// }
// // 添加正式
// if (options.type === 'release') {
//   distFolder += '-release'
// }

// let plugins, tagName, colorsKey, colorsMain, colorsSub;
// if (options.product !== 'saas') {
//   // eslint-disable-next-line no-empty
//   if (options.type !== 'release') {
//     requireExtFilePath += '.stage'
//   }
//   // eslint-disable-next-line import/no-dynamic-require
//   plugins = require(requireExtFilePath).plugins
//   // eslint-disable-next-line import/no-dynamic-require
//   tagName = require(requireExtFilePath).diyStyle.common.tagName
//   // eslint-disable-next-line import/no-dynamic-require
//   colorsKey = require(requireExtFilePath).diyStyle.common.colors.key
//   // eslint-disable-next-line import/no-dynamic-require
//   colorsMain = require(requireExtFilePath).diyStyle.common.colors.main
//   // eslint-disable-next-line import/no-dynamic-require
//   colorsSub = require(requireExtFilePath).diyStyle.common.colors.sub
// } else {
//   plugins = {}
//   tagName = '组织'
//   colorsKey = 'blue'
//   colorsMain = '#F75A14'
//   colorsSub = '#5287C7'
// }

// const fileMap = {
//   buildPackage: './package.json',
//   copyProjectConfig: 'project.config.json',
//   jsTask: ['src/**/*.js', '!src/subComponents/**/*', '!src/ext/*.js'],
//   extTask: 'src/ext/*.js',
//   wxmlTask: ['src/**/*.wxml', '!src/subComponents/**/*'],
//   wxssTask: ['src/**/*.wxss', '!src/subComponents/**/*'],
//   jsonTask: ['src/**/*.json', '!src/subComponents/**/*', '!src/**/i18n/*.json'],
//   jsonI18nTask: 'src/**/i18n/*.json',
//   wxsTask: ['src/**/*.wxs', '!src/subComponents/**/*'],
//   imageTask: ['src/**/*.jpg', 'src/**/*.gif', 'src/**/*.png', 'src/**/*.bmp', '!src/subComponents/**/*'],
//   jsTaskCom: ['src/subComponents/**/*.js', '!src/subComponents/**/config.js'],
//   wxmlTaskCom: 'src/subComponents/**/*.wxml',
//   wxssTaskCom: 'src/subComponents/**/*.wxss',
//   jsonTaskCom: 'src/subComponents/**/*.json',
//   wxsTaskCom: 'src/subComponents/**/*.wxs',
//   imageTaskCom: ['src/subComponents/**/*.jpg', 'src/subComponents/**/*.png', 'src/subComponents/**/*.gif', 'src/subComponents/**/*.bmp'],
// }
// console.log()
// // eslint-disable-next-line import/no-dynamic-require
// const productConfig = require(`${process.cwd()}${path.sep}mpConfig${path.sep + options.product}.js`)
// /**
//  * 替换字符串规则
//  */
// const patternReg = /\[\[\w+\]\]/g
// const replaceStr = {
//   PRODUCT_NAME: options.product,
//   IS_RELEASE: options.type === 'release',
//   VERSION: packageJson.version,
//   HOME_TYPE: options.home,
//   DISCOVERY_NAME: options.home == 1 ? '发现' : '动态',
//   DISCOVERY_IMAGE: options.home == 1 ? 'discovery' : 'heart',
//   ...productConfig.strings,
// }

// if (tagName) {
//   replaceStr.TAG_NAME = tagName
// }

// if (colorsKey) {
//   replaceStr.COLORS_KEY = colorsKey
// }

// if (colorsMain) {
//   replaceStr.COLORS_MAIN = colorsMain
// }

// function replaceFunction(match) {
//   let key = match.substring(2, match.length - 2)
//   return replaceStr[key] || match
// }

// const nodeModulesFilter = (filterPath) => {
//   return (
//     !/node_modules/.test(filterPath) &&
//     !/miniprogram_npm/.test(filterPath) &&
//     !/package\.json/.test(filterPath) &&
//     !/project\.config\.json/.test(filterPath) &&
//     !/sitemap\.json/.test(filterPath) &&
//     !/locales/.test(filterPath)
//   )
// }

// module.exports = {
//   options,
//   distFolder,
//   fileMap,
//   patternReg,
//   replaceFunction,
//   colorsKey,
//   colorsMain,
//   colorsSub,
//   plugins,
//   productConfig,
//   nodeModulesFilter,
// }
