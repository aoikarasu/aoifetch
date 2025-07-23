import { execSync } from 'child_process';
import { queryWmicProps } from './win32/wmic.js';

export function getShell() {
  if (process.platform !== 'win32') {
    const shellPath = process.env.SHELL || 'unknown';
    return shellPath.split(/[\\/]/).pop();
  }
  try {
    const ppid = process.ppid;
    if (queryWmicProps) {
      const procList = queryWmicProps('process', `ProcessId=${ppid}`, ['Name'], { list: true });
      if (procList && procList.length && procList[0].Name) {
        return procList[0].Name.trim();
      }
    } else {
      // fallback (shouldn't normally hit)
      return process.env.COMSPEC ? process.env.COMSPEC.split(/[\\/]/).pop() : 'cmd.exe';
    }
  } catch (e) {
    // fallback to COMSPEC
    return process.env.COMSPEC ? process.env.COMSPEC.split(/[\\/]/).pop() : 'cmd.exe';
  }
}

export function getShellPath() {
  if (process.platform === 'win32') return process.env.COMSPEC || 'cmd.exe';
  return process.env.SHELL || 'unknown';
}

export function getShellVersion(shellPath) {
  try {
    const shellName = shellPath.split('/').pop();
    if (/bash|zsh|fish|ksh|dash/.test(shellName)) {
      let version = execSync(`${shellPath} --version`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n')[0];
      return version;
    } else if (process.platform === 'win32') {
      if (/cmd\.exe$/i.test(shellPath)) {
        return execSync('ver', { encoding: 'utf8' }).trim().split('\n')[0];
      } else if (/powershell/i.test(shellPath)) {
        let v = execSync(`${shellPath} -Command "$PSVersionTable.PSVersion"`, { encoding: 'utf8' }).trim().split('\n')[0];
        return v;
      }
    }
  } catch (e) { }
  return 'N/A';
}
