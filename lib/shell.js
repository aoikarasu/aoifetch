import { execSync } from 'child_process';

export function getShell() {
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
