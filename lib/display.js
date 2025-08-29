import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

function safeCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function linuxDisplays() {
  // Try xrandr first
  const xr = safeCmd("sh -c 'command -v xrandr >/dev/null 2>&1 && xrandr --query'");
  if (xr) {
    const lines = xr.split(/\r?\n/);
    const results = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(/^([^\s]+)\s+connected[^0-9]*([0-9]{3,5})x([0-9]{3,5})/);
      if (m) {
        const name = m[1];
        const w = m[2];
        const h = m[3];
        let hz = '';
        // Look ahead for current mode line with a '*'
        for (let j = i + 1; j < lines.length; j++) {
          const l = lines[j];
          if (!/^\s/.test(l)) break;
          const mm = l.match(/\s+[0-9]{3,5}x[0-9]{3,5}\s+([0-9.]+)\*/);
          if (mm) { hz = mm[1]; break; }
        }
        results.push(`${name}: ${w}x${h}${hz ? ` @ ${hz}Hz` : ''}`);
      }
    }
    if (results.length) return results.join(', ');
  }
  // Wayland sway/wlroots: wlr-randr
  const wlr = safeCmd("sh -c 'command -v wlr-randr >/dev/null 2>&1 && wlr-randr'");
  if (wlr) {
    const res = [];
    for (const line of wlr.split(/\r?\n/)) {
      const m = line.match(/^(\S+)\s+".*?"\s+\d+x\d+\+\d+\+\d+\s+(\d+)mm x (\d+)mm\s*$/);
      if (m) continue; // header lines
      const cur = line.match(/\*\s*(\d{3,5})x(\d{3,5})\s+@\s*([0-9.]+)\s*Hz/i);
      if (cur) {
        res.push(`${cur[1]}x${cur[2]} @ ${cur[3]}Hz`);
      }
    }
    if (res.length) return res.join(', ');
  }
  return 'unknown';
}

function darwinDisplays() {
  const json = safeCmd('system_profiler SPDisplaysDataType -json');
  if (json) {
    try {
      const parsed = JSON.parse(json);
      const items = parsed.SPDisplaysDataType || [];
      const out = [];
      for (const it of items) {
        const nd = it.spdisplays_ndrvs || [];
        for (const d of nd) {
          const resText = d._spdisplays_resolution || d.spdisplays_resolution || '';
          let res = '';
          const rx = resText.match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);
          if (rx) res = `${rx[1]}x${rx[2]}`;
          const hzVal = d.spdisplays_refresh_rate;
          const hz = typeof hzVal === 'number' && hzVal > 0 ? `${hzVal}Hz` : '';
          if (res || hz) out.push(`${res}${hz ? ` @ ${hz}` : ''}`.trim());
        }
      }
      if (out.length) return out.join(', ');
    } catch {}
  }
  const txt = safeCmd('system_profiler SPDisplaysDataType');
  if (txt) {
    const out = [];
    let cur = '';
    for (const line of txt.split(/\r?\n/)) {
      const r = line.match(/Resolution:\s*(\d{3,5})\s*x\s*(\d{3,5})/i);
      if (r) { cur = `${r[1]}x${r[2]}`; continue; }
      const f = line.match(/Refresh Rate:\s*([0-9.]+)\s*Hz/i);
      if (f) { out.push(`${cur}${cur ? ' @ ' : ''}${f[1]}Hz`); cur = ''; }
    }
    if (out.length) return out.join(', ');
  }
  return 'unknown';
}

function windowsDisplays() {
  const ps = safeCmd("powershell -NoProfile -Command \"Try { Get-CimInstance Win32_VideoController | Select-Object CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate | ConvertTo-Json -Depth 2 } Catch { '' }\"");
  if (ps) {
    try {
      const data = JSON.parse(ps);
      const list = Array.isArray(data) ? data : [data];
      const parts = list
        .map(it => {
          const w = it.CurrentHorizontalResolution;
          const h = it.CurrentVerticalResolution;
          const hz = it.CurrentRefreshRate;
          if (w && h) return `${w}x${h}${hz ? ` @ ${hz}Hz` : ''}`;
          return null;
        })
        .filter(Boolean);
      if (parts.length) return parts.join(', ');
    } catch {}
  }
  const wmic = safeCmd('wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate');
  if (wmic) {
    const lines = wmic.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const parts = [];
    for (const line of lines.slice(1)) {
      const cols = line.split(/\s+/);
      if (cols.length >= 3) {
        const [hz, h, w] = cols.reverse();
        if (w && h) parts.push(`${w}x${h}${hz ? ` @ ${hz}Hz` : ''}`);
      }
    }
    if (parts.length) return parts.join(', ');
  }
  return 'unknown';
}

function termuxDisplays() {
  const ds = safeCmd('dumpsys display');
  if (ds) {
    const m = ds.match(/mode\s*\d+\s*:\s*(\d{3,5})x(\d{3,5})@([0-9.]+)/i) || ds.match(/(\d{3,5})x(\d{3,5})@([0-9.]+)/);
    if (m) return `${m[1]}x${m[2]} @ ${m[3]}Hz`;
  }
  return linuxDisplays();
}

export function getDisplays() {
  const platform = getPlatform();
  try {
    if (platform === 'darwin') return darwinDisplays();
    if (platform === 'win32') return windowsDisplays();
    if (platform === 'termux' || platform === 'android') return termuxDisplays();
    if (platform === 'linux') return linuxDisplays();
  } catch {}
  return 'unknown';
}

