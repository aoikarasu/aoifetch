import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

export function getWM() {
  const platform = getPlatform();
  if (platform === 'linux') {
    try {
      return execSync('echo $XDG_CURRENT_DESKTOP', { encoding: 'utf-8' }).trim() || 'unknown';
    } catch {
      return 'unknown';
    }
  } else if (platform === 'win32') {
    return 'Desktop Window Manager';
  }
  return 'N/A';
}
