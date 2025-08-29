import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

function safeCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function readIfExists(path) {
  try { return fs.readFileSync(path, 'utf-8'); } catch { return null; }
}

export function getTerminalName() {
  const env = process.env;
  // Termux
  if (env.TERMUX_VERSION) return 'Termux';
  // Windows Terminal
  if (env.WT_SESSION) return 'Windows Terminal';
  // Konsole
  if (env.KONSOLE_VERSION) return 'Konsole';
  // Kitty
  if (env.TERM === 'xterm-kitty' || env.KITTY_PID) return 'kitty';
  // iTerm / Apple Terminal / WezTerm / Hyper
  if (env.TERM_PROGRAM) {
    const map = {
      'Apple_Terminal': 'Terminal.app',
      'iTerm.app': 'iTerm2',
      'WezTerm': 'WezTerm',
      'Hyper': 'Hyper',
      'WarpTerminal': 'Warp',
    };
    return map[env.TERM_PROGRAM] || env.TERM_PROGRAM;
  }
  // GNOME Terminal exposes TERMINAL_EMULATOR
  if (env.TERMINAL_EMULATOR) return env.TERMINAL_EMULATOR;
  // Fallbacks
  if (env.COLORTERM) return env.COLORTERM;
  if (env.SSH_TTY) return 'ssh';
  return env.TERM || 'unknown';
}

function linuxFontGuessByConfigs() {
  const home = os.homedir();
  // GNOME Terminal via gsettings
  const profId = safeCmd("gsettings get org.gnome.Terminal.ProfilesList default");
  if (profId && /^'/.test(profId)) {
    const id = profId.replace(/^'|'$/g, '');
    const useSys = safeCmd(`gsettings get org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:${id}/ use-system-font`);
    const font = safeCmd(`gsettings get org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:${id}/ font`);
    if (useSys && useSys.includes('false') && font) return font.replace(/^'|'$/g, '');
    const mono = safeCmd('gsettings get org.gnome.desktop.interface monospace-font-name');
    if (mono) return mono.replace(/^'|'$/g, '');
  }
  // Konsole
  const konsolerc = readIfExists(`${home}/.config/konsolerc`);
  if (konsolerc) {
    const m = konsolerc.match(/DefaultProfile=(.*)\s*$/m);
    const profName = m ? m[1] : null;
    if (profName) {
      const prof = readIfExists(`${home}/.local/share/konsole/${profName}`);
      if (prof) {
        const fm = prof.match(/^Font=(.+)$/m);
        if (fm) {
          const parts = fm[1].split(',');
          if (parts.length) return parts[0];
        }
      }
    }
  }
  // kitty
  const kittyConf = readIfExists(`${home}/.config/kitty/kitty.conf`);
  if (kittyConf) {
    const m = kittyConf.match(/^\s*(font_family|font)\s+(.+)$/m);
    if (m) return m[2].trim();
  }
  // alacritty
  const ala = readIfExists(`${home}/.config/alacritty/alacritty.yml`) || readIfExists(`${home}/.alacritty.yml`);
  if (ala) {
    // naive: look for first 'family:' after a 'font:' section
    const lines = ala.split(/\r?\n/);
    let inFont = false;
    for (const line of lines) {
      if (/^\s*font\s*:\s*$/.test(line)) { inFont = true; continue; }
      if (inFont) {
        const m = line.match(/^\s*family\s*:\s*"?([^"#]+)"?/);
        if (m) return m[1].trim();
        if (/^\S/.test(line)) inFont = false; // end of font block
      }
    }
  }
  // wezterm
  const wez = readIfExists(`${home}/.wezterm.lua`) || readIfExists(`${home}/.config/wezterm/wezterm.lua`);
  if (wez) {
    let m = wez.match(/font\s*=\s*wezterm\.font\(\s*"([^"]+)"/);
    if (m) return m[1];
    m = wez.match(/font_with_fallback\s*\{\s*"([^"]+)"/);
    if (m) return m[1];
  }
  // foot
  const foot = readIfExists(`${home}/.config/foot/foot.ini`);
  if (foot) {
    const m = foot.match(/^\s*font\s*=\s*([^\n#]+)/m);
    if (m) return m[1].trim();
  }
  return null;
}

function macFont() {
  // iTerm2
  const iterm = safeCmd(`defaults read com.googlecode.iterm2 "Normal Font"`);
  if (iterm) return iterm;
  // Terminal.app often stores font in complex plist; best-effort to get default monospace
  const mono = safeCmd('defaults read -g AppleFontSmoothing >/dev/null 2>&1; defaults read -g NSFixedPitchFont');
  if (mono) return mono;
  return null;
}

function windowsFont() {
  // Windows Terminal settings.json
  const ps = safeCmd(
    "powershell -NoProfile -Command \"Try { $p = Get-Content -Raw \"$env:LOCALAPPDATA\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState\\settings.json\" | ConvertFrom-Json; $id = $p.defaultProfile; $prof = $p.profiles.list | Where-Object { $_.guid -eq $id }; $prof.font.face } Catch { '' }\""
  );
  if (ps) return ps;
  // Newer Windows Terminal path
  const ps2 = safeCmd(
    "powershell -NoProfile -Command \"Try { $p = Get-Content -Raw \"$env:LOCALAPPDATA\\Microsoft\\Windows Terminal\\settings.json\" | ConvertFrom-Json; $id = $p.defaultProfile; $prof = $p.profiles.list | Where-Object { $_.guid -eq $id }; $prof.font.face } Catch { '' }\""
  );
  if (ps2) return ps2;
  return null;
}

export function getTerminalFont() {
  const platform = getPlatform();
  try {
    if (platform === 'darwin') return macFont() || 'unknown';
    if (platform === 'win32') return windowsFont() || 'unknown';
    if (platform === 'termux' || platform === 'android') return 'unknown';
    if (platform === 'linux') return linuxFontGuessByConfigs() || 'unknown';
  } catch {}
  return 'unknown';
}

