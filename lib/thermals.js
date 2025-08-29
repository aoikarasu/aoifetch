import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

function safeCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function formatTempsC(values) {
  const temps = values.filter(v => typeof v === 'number' && isFinite(v));
  if (!temps.length) return 'unknown';
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  if (temps.length === 1) return `${max.toFixed(1)}°C`;
  return `${min.toFixed(1)}–${max.toFixed(1)}°C`;
}

function linuxThermals() {
  // Try lm-sensors JSON first
  const json = safeCmd("sh -c 'command -v sensors >/dev/null 2>&1 && sensors -j'");
  if (json) {
    try {
      const data = JSON.parse(json);
      const temps = [];
      const walk = obj => {
        if (obj && typeof obj === 'object') {
          for (const k of Object.keys(obj)) {
            const v = obj[k];
            if (/temp.*?_input$/i.test(k) && typeof v === 'number') temps.push(v);
            if (v && typeof v === 'object') walk(v);
          }
        }
      };
      walk(data);
      if (temps.length) return formatTempsC(temps);
    } catch {}
  }
  // Fallback to /sys/class/thermal
  const list = safeCmd("ls -1 /sys/class/thermal 2>/dev/null | grep '^thermal_zone' || true");
  if (list) {
    const temps = [];
    for (const z of list.split(/\r?\n/).filter(Boolean)) {
      const t = safeCmd(`cat /sys/class/thermal/${z}/temp 2>/dev/null`);
      if (!t) continue;
      let n = Number(t);
      if (!isNaN(n)) {
        if (n > 1000) n = n / 1000; // milli°C → °C
        temps.push(n);
      }
    }
    if (temps.length) return formatTempsC(temps);
  }
  return 'unknown';
}

function darwinThermals() {
  // Use iStats if available
  const istats = safeCmd("sh -c 'command -v istats >/dev/null 2>&1 && istats --no-graphs'");
  if (istats) {
    const temps = [];
    for (const line of istats.split(/\r?\n/)) {
      const m = line.match(/([0-9]+\.?[0-9]*)°C/);
      if (m) temps.push(Number(m[1]));
    }
    if (temps.length) return formatTempsC(temps);
  }
  // No privileged powermetrics; return unknown gracefully
  return 'unknown';
}

function windowsThermals() {
  const ps = safeCmd(
    "powershell -NoProfile -Command \"Try { Get-WmiObject -Namespace root/wmi -Class MSAcpi_ThermalZoneTemperature | Select-Object CurrentTemperature | ConvertTo-Json } Catch { '' }\""
  );
  if (ps) {
    try {
      const data = JSON.parse(ps);
      const list = Array.isArray(data) ? data : [data];
      const temps = list
        .map(it => (it && typeof it.CurrentTemperature === 'number') ? (it.CurrentTemperature / 10) - 273.15 : NaN)
        .filter(n => !isNaN(n));
      if (temps.length) return formatTempsC(temps);
    } catch {}
  }
  return 'unknown';
}

function termuxThermals() {
  // Battery temp in 0.1°C
  const ds = safeCmd('dumpsys battery');
  if (ds) {
    const m = ds.match(/temperature\s*:\s*(\d+)/i);
    if (m) {
      const c = Number(m[1]) / 10;
      if (!isNaN(c)) return `${c.toFixed(1)}°C`;
    }
  }
  return linuxThermals();
}

export function getThermals() {
  const platform = getPlatform();
  try {
    if (platform === 'darwin') return darwinThermals();
    if (platform === 'win32') return windowsThermals();
    if (platform === 'termux' || platform === 'android') return termuxThermals();
    if (platform === 'linux') return linuxThermals();
  } catch {}
  return 'unknown';
}

