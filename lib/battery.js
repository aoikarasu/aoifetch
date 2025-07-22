import { execSync } from 'child_process';
import { colorBatteryPercent } from './color.js';
import { getPlatform } from './misc.js';

export function getBattery() {
  try {
    // Use getPlatform for platform detection, including Termux
    if (getPlatform() === 'termux') {
      // Try termux-battery-status if termux-api is installed
      try {
        const result = execSync('termux-battery-status 2>/dev/null', { encoding: 'utf-8' });
        if (result) {
          const battery = JSON.parse(result);
          if (battery.percentage !== undefined) {
            return battery.percentage + '%';
          }
        }
      } catch { }
      // Fallback: Check if termux-api is available
      try {
        execSync('which termux-battery-status 2>/dev/null', { encoding: 'utf-8' });
        return 'Install Termux:API app and grant permissions';
      } catch {
        return 'Install termux-api package (pkg install termux-api)';
      }
    }

    if (getPlatform() === 'linux') {
      const res = execSync(
        "upower -i $(upower -e 2>/dev/null | grep BAT) 2>/dev/null | grep percentage | awk '{print $2}'",
        { encoding: 'utf-8' }
      ).trim();
      if (res) return res;
    } else if (getPlatform() === 'darwin') {
      const res = execSync("pmset -g batt | grep -Eo '[0-9]+%' | head -1", { encoding: 'utf-8' }).trim();
      if (res) return res;
    } else if (getPlatform() === 'win32') {
      const res = execSync("WMIC PATH Win32_Battery Get EstimatedChargeRemaining", { encoding: 'utf-8' }).split('\n')[1];
      if (res && res.trim()) return res.trim() + '%';
    }
  } catch { }
  return 'unknown';
}

export function getBatteryPercentColored() {
  let pct = null;
  let raw = getBattery();
  if (typeof raw === 'string' && /\d+/.test(raw)) {
    pct = parseInt(raw.match(/\d+/)[0], 10);
  }
  if (pct === null) return raw;
  return colorBatteryPercent(pct);
}
