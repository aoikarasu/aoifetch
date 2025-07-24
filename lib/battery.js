import { execSync } from 'child_process';
import { colorBatteryPercent } from './color.js';
import { getPlatform, isWsl } from './misc.js';
import { getBatteryStatus } from './win32/battery.js';
import { getWmicProps } from './win32/wmic.js';

export function getBattery() {
  try {
    // Use getPlatform for platform detection, including Termux
    if (getPlatform() === 'termux') {
      try {
        const result = execSync('termux-battery-status 2>/dev/null', { encoding: 'utf-8' });
        if (result) {
          const battery = JSON.parse(result);
          if (battery.percentage !== undefined) {
            return battery.percentage + '%' + (battery.status ? ` [${battery.status}]` : '');
          }
        }
      } catch { }
      try {
        execSync('which termux-battery-status 2>/dev/null', { encoding: 'utf-8' });
        return 'Install Termux:API app and grant permissions';
      } catch {
        return 'Install termux-api package (pkg install termux-api)';
      }
    }

    const platform = getPlatform();
    const wsl = isWsl();
    if (platform === 'linux' && !wsl) {
      const res = execSync(
        "upower -i $(upower -e 2>/dev/null | grep BAT) 2>/dev/null | grep percentage | awk '{print $2}'",
        { encoding: 'utf-8' }
      ).trim();
      if (res)
        return res;
    } else if (platform === 'darwin') {
      const res = execSync("pmset -g batt | grep -Eo '[0-9]+%' | head -1", { encoding: 'utf-8' }).trim();
      if (res) return res;
    } else if (platform === 'win32' || wsl) {
      try {
        const arr = getWmicProps('Win32_Battery', ['EstimatedChargeRemaining', 'BatteryStatus'], { wsl });
        const bat = arr && arr[0];
        if (!bat || !bat.EstimatedChargeRemaining) {
          return `0% [${getBatteryStatus(2)}]`;
        }
        const pct = bat.EstimatedChargeRemaining.trim();
        const statusValue = Number(bat.BatteryStatus || '2');
        const statusLabel = getBatteryStatus(statusValue);
        return `${pct}% [${statusLabel}]`;
      } catch {
        return 'unknown';
      }
    }
  } catch { }
  return 'unknown';
}

export function getBatteryPercentColored() {
  let raw = getBattery();
  let pct = null;
  if (typeof raw === 'string') {
    const match = raw.match(/(\d+)%/);
    if (match) {
      pct = parseInt(match[1], 10);
    }
  }
  if (pct === null) return raw;
  return raw.replace(/\d+%/, colorBatteryPercent(pct));
}
