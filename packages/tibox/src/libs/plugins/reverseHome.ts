// const path = require('path');
// const async = require('async');
// const through = require('through2')
// const { dest } = require('gulp')
// const gulpif = require('gulp-if')
// const rename = require('gulp-rename')
// const { distFolder, options } = require('../tools')

// /**
//  * 颠倒home
//  */
// const reverseHome = function () {
//   return gulpif(file => {
//     return options.home == 2 && /^pages/.test(path.relative(file.base, file.path))
//   }, rename(path => {
//     if (path.basename == 'home') { // 首页
//       path.basename = 'discovery'
//     } else if (path.basename == 'discovery') {
//       path.basename = 'home'
//     }
//   }))
// }

// module.exports = reverseHome
