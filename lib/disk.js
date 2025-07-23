import { execSync } from 'child_process';
import { colorUsagePercent } from './color.js';
import { getWmicProps } from './win32/wmic.js';

export function getDiskInfo() {
  try {
    if (process.platform === 'win32') {
      // Robust method: use getWmicProps for C: drive
      const arr = getWmicProps('Win32_LogicalDisk', ['FreeSpace', 'Size', 'DeviceID']);
      // Find the row with DeviceID === 'C:'
      const drive = arr.find(d => d.DeviceID && d.DeviceID.trim().toUpperCase() === 'C:');
      if (!drive || !drive.Size || !drive.FreeSpace) return 'unknown';
      const total = parseInt(drive.Size, 10);
      const free = parseInt(drive.FreeSpace, 10);
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
