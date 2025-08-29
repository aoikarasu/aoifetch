import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

function safeCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function linuxGpu() {
  // Prefer lspci; fallback to glxinfo; otherwise unknown.
  const pci = safeCmd("sh -c 'command -v lspci >/dev/null 2>&1 && lspci -nn | grep -iE " + JSON.stringify('(vga|3d|display)') + "'");
  if (pci) {
    const lines = pci.split(/\r?\n/).filter(Boolean);
    const names = lines.map(l => l.replace(/^.*?:\s*/, '')).map(s => s.replace(/\s*\[.*?\]\s*/g, '').trim());
    if (names.length) return names.join(', ');
  }
  const glx = safeCmd("sh -c 'command -v glxinfo >/dev/null 2>&1 && glxinfo -B | grep -i " + JSON.stringify('Device:') + " | head -1'");
  if (glx) {
    const m = glx.match(/Device:\s*(.+)/i);
    if (m) return m[1].trim();
  }
  return 'unknown';
}

function darwinGpu() {
  const json = safeCmd('system_profiler SPDisplaysDataType -json');
  if (json) {
    try {
      const parsed = JSON.parse(json);
      const items = parsed.SPDisplaysDataType || [];
      const names = items.map(it => {
        const name = it.sppci_model || it._name || 'GPU';
        const vram = it.spdisplays_vram || it.spdisplays_vram_shared || '';
        return vram ? `${name} (${vram})` : name;
      }).filter(Boolean);
      if (names.length) return names.join(', ');
    } catch {}
  }
  const txt = safeCmd("system_profiler SPDisplaysDataType | grep -E 'Chipset Model:|VRAM' | sed 's/^ *//' ");
  if (txt) return txt.split(/\r?\n/).filter(Boolean).join('; ');
  return 'unknown';
}

function windowsGpu() {
  const ps = safeCmd("powershell -NoProfile -Command \"Try { Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM | ConvertTo-Json -Depth 2 } Catch { '' }\"");
  if (ps) {
    try {
      const data = JSON.parse(ps);
      const list = Array.isArray(data) ? data : [data];
      const names = list.filter(Boolean).map(it => {
        const name = it.Name || 'GPU';
        const ram = typeof it.AdapterRAM === 'number' ? it.AdapterRAM : NaN;
        if (!isNaN(ram) && ram > 0) {
          const gb = (ram / (1024 ** 3)).toFixed(1);
          return `${name} (${gb} GB)`;
        }
        return name;
      });
      if (names.length) return names.join(', ');
    } catch {}
  }
  const wmic = safeCmd('wmic path win32_VideoController get Name');
  if (wmic) {
    const lines = wmic.split(/\r?\n/).map(s => s.trim()).filter(s => s && !/^name$/i.test(s));
    if (lines.length) return lines.join(', ');
  }
  return 'unknown';
}

function termuxGpu() {
  // Best-effort: try Android props that sometimes reveal GL/Vulkan drivers.
  const egl = safeCmd('getprop ro.hardware.egl');
  const vk = safeCmd('getprop ro.hardware.vulkan');
  const renderer = safeCmd('getprop ro.gfx.driver.0');
  const parts = [egl, vk, renderer].filter(s => s && s.toLowerCase() !== 'unknown');
  if (parts.length) return parts.join(', ');
  return linuxGpu();
}

export function getGPU() {
  const platform = getPlatform();
  try {
    if (platform === 'darwin') return darwinGpu();
    if (platform === 'win32') return windowsGpu();
    if (platform === 'termux' || platform === 'android') return termuxGpu();
    if (platform === 'linux') return linuxGpu();
  } catch {}
  return 'unknown';
}

