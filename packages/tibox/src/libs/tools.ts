export function parseDestFolderName(project: string, product: string, mode: string): string {
  return `dist-${parseProjectName(project, product, mode)}`
}

export function parseProjectName(project: string, product: string, mode: string): string {
  return `${project}-${product}-${mode}`
}
