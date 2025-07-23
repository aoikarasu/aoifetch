import os from 'os';
import { execSync } from 'child_process';
import { getPlatform } from './misc.js';
import { getWmicProps } from './win32/wmic.js';

export function getPrettyHost() {
  // Use getPlatform for Termux/Android detection
  if (getPlatform() === 'termux') {
    try {
      // Try to get device model from Android properties
      const brand = execSync('getprop ro.product.brand 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
      const model = execSync('getprop ro.product.model 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
      if (brand && model) {
        return `${brand} ${model} (Termux)`;
      }
    } catch { }
    return 'Android (Termux)';
  }

  if (getPlatform() === 'linux') {
    if (process.env.WSL_DISTRO_NAME) {
      return `Windows Subsystem For Linux - ${process.env.WSL_DISTRO_NAME}`;
    }
    try {
      const pretty = execSync("cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null", { encoding: 'utf8' }).trim();
      if (pretty && pretty !== 'None' && pretty !== '') return pretty;
    } catch { }
  }
  if (getPlatform() === 'darwin') return 'Apple Mac';
  if (getPlatform() === 'win32') {
    try {
      const arr = getWmicProps('Win32_ComputerSystem', ['Manufacturer','Model']);
      if (arr && arr[0]) {
        const manu = arr[0].Manufacturer?.trim();
        const model = arr[0].Model?.trim();
        if (manu && model) return `${manu} ${model}`;
        if (model) return model;
        if (manu) return manu;
      }
    } catch {}
    return 'Windows PC';
  }
  return os.hostname();
}
