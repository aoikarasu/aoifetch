import { execSync } from 'child_process';
import { colorUsagePercent } from './color.js';

export function getDiskInfo() {
  try {
    if (process.platform === 'win32') {
      // Only check C: for root disk
      const out = execSync('wmic logicaldisk where "DeviceID=\'C:\'" get Size,FreeSpace /format:csv', { encoding: 'utf-8' });
      const lines = out.split('\n').filter(Boolean);
      if (lines.length < 2) return 'unknown';
      const data = lines[1].split(',');
      const free = parseInt(data[2], 10), total = parseInt(data[3], 10);
      if (isNaN(total) || isNaN(free)) return 'unknown';
      const used = total - free;
      const percent = ((used / total) * 100).toFixed(1);
      return `${(used / (1024 ** 3)).toFixed(2)} / ${(total / (1024 ** 3)).toFixed(2)} GB (${colorUsagePercent(percent)})`;
    } else {
      // Linux/macOS: parse df -k /
      const out = execSync('df -k /', { encoding: 'utf-8' });
      const lines = out.trim().split('\n');
      if (lines.length < 2) return 'unknown';
      const parts = lines[1].split(/\s+/);
      if (parts.length < 5) return 'unknown';
      const used = parseInt(parts[2], 10) * 1024;
      const total = parseInt(parts[1], 10) * 1024;
      const percent = ((used / total) * 100).toFixed(1);
      return `${(used / (1024 ** 3)).toFixed(2)} / ${(total / (1024 ** 3)).toFixed(2)} GB (${colorUsagePercent(percent)})`;
    }
  } catch (e) { }
  return 'unknown';
}
