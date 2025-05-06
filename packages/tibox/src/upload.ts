import miniprogramci from 'miniprogram-ci'
import colors from 'picocolors'
import type { InlineConfig } from './config';
import { resolveConfig } from './config'
import { createLogger } from './logger'

export interface UploadOptions {
  privateKeyPath: string
  desc?: string
  robot?: number
}

export type UploadOutput = any
/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
export async function upload(inlineConfig: InlineConfig = {}): Promise<UploadOutput> {
  // parallelCallCounts++;
  try {
    return await doUpload(inlineConfig)
  } finally {
    // parallelCallCounts--;
    // if (parallelCallCounts <= 0) {
    //   await Promise.all(parallelBuilds.map((bundle) => bundle.close()));
    //   parallelBuilds.length = 0;
    // }
  }
}

async function doUpload(inlineConfig: InlineConfig = {}): Promise<UploadOutput> {
  const config = await resolveConfig(inlineConfig, 'upload', 'default', 'production')
  const project = new miniprogramci.Project({
    appid: config.appid,
    type: 'miniProgram',
    projectPath: config.determinedDestDir,
    privateKeyPath: config.upload?.privateKeyPath,
    ignores: ['node_modules/**/*', 'yarn.lock', 'yarn-error.log'],
  })
  const warning = await miniprogramci.packNpm(project, {
    ignores: ['pack_npm_ignore_list'],
    reporter: infos => {
      console.log(infos)
    },
  })
  createLogger().warn(colors.yellow(`ci.packNpm warning: ${warning}`))
  try {
    const uploadResult = await miniprogramci.upload({
      project,
      version: config.version,
      desc: config.upload?.desc,
      setting: {
        minify: true,
        es6: true,
        es7: true,
      },
      robot: config.upload?.robot,
      // qrcodeFormat: 'image',
      // qrcodeOutputDest,
      // onProgressUpdate: console.log,
    })
    console.info(colors.green(`uploadResult:${JSON.stringify(uploadResult, null, '  ')}`))
  } catch (error: any) {
    console.error(colors.red(`code:${error.code}`))
    console.error(colors.red(`path:${error.path}`))
    console.error(colors.red(error))
    process.exit(1)
  }

  return {}
}

// TODO Omit base 不需要怎么删掉？
export type ResolvedUploadOptions = Required<Omit<UploadOptions, 'base'>>

export function resolveUploadOptions(raw?: UploadOptions): ResolvedUploadOptions {
  const resolved: ResolvedUploadOptions = {
    privateKeyPath: '',
    desc: '',
    robot: 1,
    ...raw,
  }

  // // handle special build targets
  // if (resolved.target === "modules") {
  //   // Support browserslist
  //   // "defaults and supports es6-module and supports es6-module-dynamic-import",
  //   resolved.target = [
  //     "es2019",
  //     "edge88",
  //     "firefox78",
  //     "chrome87",
  //     "safari13.1",
  //   ];
  // } else if (resolved.target === "esnext" && resolved.minify === "terser") {
  //   // esnext + terser: limit to es2019 so it can be minified by terser
  //   resolved.target = "es2019";
  // }

  // // normalize false string into actual false
  // if ((resolved.minify as any) === "false") {
  //   resolved.minify = false;
  // }

  return resolved
}
