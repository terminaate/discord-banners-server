import { clamp, isFinite, round } from 'lodash';

export function formatBytes(bytes: number, decimals = 2) {
  if (!isFinite(bytes) || bytes < 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(
    clamp(Math.log(bytes) / Math.log(1024), 0, sizes.length - 1),
  );

  return `${round(bytes / Math.pow(1024, i), decimals)} ${sizes[i]}`;
}
