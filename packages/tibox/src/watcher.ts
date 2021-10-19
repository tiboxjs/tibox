const records: Record<string, number> = {};

export function isNeedHandle(
  ppath: string,
  time: number,
  isAdd: boolean = true
): boolean {
  const recordTime = records[ppath] || 0;
  let result;
  if (recordTime < time || recordTime <= 0) {
    result = true;
    if (isAdd) {
      records[ppath] = time;
    }
  } else {
    result = false;
  }
  return result;
}
