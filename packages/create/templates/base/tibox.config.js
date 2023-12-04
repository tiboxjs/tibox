// eslint-disable-next-line import/no-extraneous-dependencies
import { loadEnv } from '@tibox/tibox-cli'
// eslint-disable-next-line import/no-extraneous-dependencies
// import through2 from 'through2'
// import path from 'path'
// eslint-disable-next-line import/no-extraneous-dependencies
// import chalk from 'chalk'
// import os from 'os'
// import fs from 'fs'

export default async ({ product, mode, command }) => {
  const { TIBOX_APPID } = loadEnv(product, mode, process.cwd())
  const ext = await import(`./exts/${product}.${mode}.js`)

  return {
    project: 'demo',
    product: 'default',
    mode: 'development',
    // sourceDir: 'src',
    // destDir: 'dist',
    appid: TIBOX_APPID,
    ext: ext.default,
    dev: {},
    build: {},
    upload: {
      robot: 1,
    },
    envDir: './',
    plugins: [
      // {
      //   name: '',
      //   transform: (code) => {
      //     if (code.indexOf('wx.request') > -1) {
      //       console.log(code)
      //     }
      //     return code
      //   },
      // },
    ],
  }
}