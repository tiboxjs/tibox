/**
 * 解析目标目录
 * @param project 项目名
 * @param product 产品分支
 * @param mode 模式
 * @returns 
 */
export function parseDestFolderName(project: string, product: string, mode: string): string {
  return `dist-${parseProjectName(project, product, mode)}`
}

/**
 * 解析项目名称
 * @param project 项目名
 * @param product 产品分支
 * @param mode 模式
 * @returns 
 */
export function parseProjectName(project: string, product: string, mode: string): string {
  return `${project}-${product}-${mode}`
}
