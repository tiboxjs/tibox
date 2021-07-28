export function buildDestFolderName(
  project: string,
  product: string,
  mode: string
): string {
  return `dist-${buildProjectName(project, product, mode)}`;
}

export function buildProjectName(
  project: string,
  product: string,
  mode: string
): string {
  return `${project}-${product}-${mode}`;
}
