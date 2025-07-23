import { execSync } from 'child_process';
import { queryWmicProps } from './win32/wmic.js';

export function getShell() {
  if (process.platform !== 'win32') {
    const shellPath = process.env.SHELL || 'unknown';
    const name = shellPath.split(/[\\/]/).pop() || 'unknown';
    return [name, shellPath];
  }
  try {
    const ppid = process.ppid;
    if (queryWmicProps) {
      const procList = queryWmicProps('process', `ProcessId=${ppid}`, ['Name', 'ExecutablePath'], { list: true });
      if (procList && procList.length && procList[0].Name) {
        const name = procList[0].Name.trim();
        const path = (procList[0].ExecutablePath && procList[0].ExecutablePath.trim()) || 'unknown';
        return [name, path];
      }
    }
    // fallback (shouldn't normally hit)
    const fallback = process.env.COMSPEC || 'cmd.exe';
    return [fallback.split(/[\\/]/).pop(), fallback];
  } catch (e) {
    // fallback to COMSPEC
    const fallback = process.env.COMSPEC || 'cmd.exe';
    return [fallback.split(/[\\/]/).pop(), fallback];
  }
}

export function getShellPath() {
  const shellArr = getShell();
  return shellArr[1] || 'unknown';
}

export function getShellVersion(shellPath) {
  try {
    const shellName = shellPath.split('/').pop();
    if (/bash|zsh|fish|ksh|dash/.test(shellName)) {
      let versionLine = execSync(`${shellPath} --version`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n')[0];
      const versionMatch = versionLine.match(/version\s+([\d.]+)/i) || versionLine.match(/(?:zsh|fish|dash|ksh)[^\d]*([\d.]+)/i);
      const platMatch = versionLine.match(/\(([^)]+)\)\s*$/);
      if (versionMatch) {
        let result = versionMatch[1];
        if (platMatch) result += ' (' + platMatch[1] + ')';
        return result;
      }
      return versionLine;
    } else if (process.platform === 'win32') {
      if (/cmd\.exe$/i.test(shellName)) {
        let line = execSync('ver', { encoding: 'utf8' }).trim();
        const m = line.match(/\[Version ([^\]]+)\]/i);
        if (m) return m[1];
        return line;
      } else if (/powershell/i.test(shellName)) {
        try {
          let psver = execSync(`${shellPath} -NoLogo -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"`, { encoding: 'utf8' }).trim();
          if (/^\d+(\.\d+)+$/.test(psver)) {
            return psver;
          }
        } catch(e) {}
        let psverLines = execSync(`${shellPath} -NoLogo -NoProfile -Command "$PSVersionTable.PSVersion"`, { encoding: 'utf8' }).trim().split('\n');
        for (const line of psverLines) {
          const m = line.match(/^(\d+)\s+(\d+)\s+(\d+)(?:\s+(\d+))?/); // Major Minor Build [Revision]
          if (m) {
            return m[1] + '.' + m[2] + '.' + m[3] + (m[4] ? '.' + m[4] : '');
          }
        }
        return 'N/A';
      }
    }
  } catch (e) { }
  return 'N/A';
}
