import { execSync } from 'child_process';
import { colorBatteryPercent } from './color.js';
import { getPlatform } from './misc.js';
import { getBatteryStatus } from './win32/battery.js';

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

    if (getPlatform() === 'linux') {
      const res = execSync(
        "upower -i $(upower -e 2>/dev/null | grep BAT) 2>/dev/null | grep percentage | awk '{print $2}'",
        { encoding: 'utf-8' }
      ).trim();
      if (res)
        return res;
    } else if (getPlatform() === 'darwin') {
      const res = execSync("pmset -g batt | grep -Eo '[0-9]+%' | head -1", { encoding: 'utf-8' }).trim();
      if (res) return res;
    } else if (getPlatform() === 'win32') {
      // status
      let [batPercentRes, batStatusRes] = ['', ''];
      try {
        batPercentRes = execSync("WMIC PATH Win32_Battery Get EstimatedChargeRemaining", { encoding: 'utf-8' });
        batStatusRes = execSync("WMIC PATH Win32_Battery Get BatteryStatus", { encoding: 'utf-8' });
      } catch {}

      if (batPercentRes.includes('No Instance(s) Available.')) {
        return `0% [${getBatteryStatus(2)}]`;
      }
      let pct = (batPercentRes.split(/\r?\n/)[1]||'').trim();
      let sts = (batStatusRes.split(/\r?\n/)[1]||'').trim();
      pct = pct ? pct : '0';
      let statusLabel = getBatteryStatus(Number(sts)||2);
      return `${pct}% [${statusLabel}]`;
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
