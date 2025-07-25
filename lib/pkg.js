import fs from 'fs';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { getPlatform, parseListFormat } from './misc.js';

const MAC_PKG_COMMAND = {
  'brew': 'brew list | wc -l',
  'port': 'port installed | grep -c Active'
}

const NIX_PKG_COMMAND = {
  'apk': 'apk info | wc -l',
  'dpkg': `dpkg -l | grep '^ii' | wc -l`,
  'pacman': 'pacman -Q | wc -l',
  'pkg': 'pkg list-installed | wc -l',
  'rpm': 'rpm -qa | wc -l',
}

function safeCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function cmdExists(cmd) {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`);
    return true;
  } catch {
    return false;
  }
}

function runManagers(pkgArray, managers, commands) {
  for (const man in managers) {
    if (managers[man] !== '') {
      const out = safeCmd(commands[man]);
      if (out && !isNaN(Number(out))) pkgArray.push([man, Number(out)]);
    }
  }
}

export function getPackages() {
  let pkgArray = [];
  const platform = getPlatform();

  if (platform === 'linux' || platform === 'termux' || platform === 'android') {
    const output = safeCmd(`whereis apk dpkg pacman pkg rpm`);
    const managers = parseListFormat(output, ':')[0];
    runManagers(pkgArray, managers, NIX_PKG_COMMAND);
  } else if (platform === 'darwin') {
    const appsDir = '/Applications';
    if (fs.existsSync(appsDir)) {
      let n = 0;
      try {
        n = fs.readdirSync(appsDir).filter(f => f.endsWith('.app')).length;
      } catch { }
      if (n) pkgArray.push(['apps', n]);
    }

    const managers = [];
    for (const cmd of ['brew', 'port']) {
      if (cmdExists(cmd)) { managers.push(cmd); }
    }
    runManagers(pkgArray, managers, MAC_PKG_COMMAND);
  } else if (platform === 'win32') {
    const appCount = safeCmd(`powershell -NoProfile -Command "try { (Get-StartApps | Measure-Object).Count } catch { 0 }"`);
    if (appCount && !isNaN(Number(appCount))) pkgArray.push(['apps', Number(appCount)]);

    const chocoCount = safeCmd('powershell -NoProfile -Command "try { choco list --limit-output | Measure-Object | Select -expand Count  } catch { 0 }"');
    if (chocoCount > 0) pkgArray.push(['choco', chocoCount]);
  }

  if (fs.existsSync('./node_modules')) {
    const count = fs.readdirSync('./node_modules').filter(f => !f.startsWith('.')).length;
    if (count) pkgArray.push(['node', count]);
  }

  if (pkgArray.length === 0) return 'unknown';
  const y = chalk.yellow;
  return pkgArray.map(([k, v]) => `${y(v)} (${k})`).join(', ');
}
