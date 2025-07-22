import { execSync } from 'child_process';

export function getPackages() {
  try {
    if (process.platform === 'win32') return 'see installed apps';
    return execSync('find ./node_modules -type d -maxdepth 1 | wc -l', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}
