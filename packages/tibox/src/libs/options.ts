import { Plugin, ResolvedConfig } from '../config'

export interface TaskOptions {
  destDir: string
  resolvedConfig: ResolvedConfig
  plugins: Plugin[]
}
