import os from 'os';
import { colorUsagePercent } from './color.js';

export function getMemoryInfo() {
  // Returns: "used/total (colored percent%)" format, in GB
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percent = ((used / total) * 100).toFixed(1);
  return `${(used / (1024 ** 3)).toFixed(2)} / ${(total / (1024 ** 3)).toFixed(2)} GB (${colorUsagePercent(percent)})`;
}
