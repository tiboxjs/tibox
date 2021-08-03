// const path = require('path');
// const through = require('through2')

// const DEFAULT_WXS_PATH = path.resolve('./src/i18n/locales.wxs');
// const DEFAULT_WXS_NAME = 'i18n';
// const getWxsTag = function (path$$1, moduleName) { return `<wxs src="${path$$1}" module="${moduleName}" />\n`; };
// /**
//  * 给wxml添加wxs
//  */
// const addWxs = function (options) {
//   return through.obj((file, _, cb) => {
//     let opts = options || { wxsPath: '', wxsModuleName: '', i18nFunctionName: '' }
//     const wxsTags = []
//     if (!Array.isArray(opts)) {
//       opts = [opts]
//     }
//     opts.forEach(opt => {
//       let wxsPath = opt.wxsPath || DEFAULT_WXS_PATH;
//       let wxsModuleName = opt.wxsModuleName || DEFAULT_WXS_NAME;
//       let relativeWxsPath = path.relative(path.dirname(file.path), wxsPath);
//       if (process.platform === 'win32') {
//         relativeWxsPath = relativeWxsPath.replace(/\\/g, '/');
//       }
//       if (file.path.indexOf('subComponents') > -1) {
//         relativeWxsPath = `../../${relativeWxsPath}`
//       }
//       wxsTags.push(Buffer.from(getWxsTag(relativeWxsPath, wxsModuleName)))
//     })
//     file.contents = Buffer.concat([...wxsTags, Buffer.from(file.contents)])
//     cb(null, file)
//   })
// }

// module.exports = addWxs
