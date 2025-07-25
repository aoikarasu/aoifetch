import os from 'os';
import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

export function getCPU() {
  try {
    const cpus = os.cpus();
    let model = 'Unknown';
    let speed = null;
    let coreCount = 0;

    if (cpus && cpus.length > 0) {
      coreCount = cpus.length;
      if (cpus[0].model) {
        model = cpus[0].model;
      }
      if (cpus[0].speed) {
        speed = cpus[0].speed;
      }
    }

    // Fallback for Termux/Android and other Linux systems where os.cpus() fails
    if (["linux", "android", "termux"].includes(getPlatform())) {
      // Try to get core count from /proc/cpuinfo
      if (coreCount === 0) {
        try {
          const coreInfo = execSync('cat /proc/cpuinfo | grep "^processor" | wc -l', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          if (coreInfo) {
            coreCount = parseInt(coreInfo, 10) || 0;
          }
        } catch { }
      }

      // Try to get model name
      if (model === 'Unknown') {
        const cpuinfo = execSync('cat /proc/cpuinfo | grep "model name" | head -1', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (cpuinfo) {
          const match = cpuinfo.match(/model name\s*:\s*(.+)/);
          if (match) model = match[1];
        }

        // Try Hardware field for ARM devices like Android
        if (model === 'Unknown') {
          const hardware = execSync('cat /proc/cpuinfo | grep "Hardware" | head -1', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          if (hardware) {
            const match = hardware.match(/Hardware\s*[:]\s*(.+)/) || hardware.match(/Hardware\s+(.+)/);
            if (match) model = match[1];
          }
        }

        // Try CPU part for ARM
        if (model === 'Unknown') {
          const cpuPart = execSync('cat /proc/cpuinfo | grep "CPU part" | head -1', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          if (cpuPart) {
            const match = cpuPart.match(/CPU part\s*:\s*(.+)/);
            if (match) model = `ARM CPU (${match[1]})`;
          }
        }
      }

      // Try to get CPU frequency from /proc/cpuinfo if not available from os.cpus()
      if (!speed) {
        try {
          const cpuMhz = execSync('cat /proc/cpuinfo | grep "cpu MHz" | head -1', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          if (cpuMhz) {
            const match = cpuMhz.match(/cpu MHz\s*:\s*([0-9.]+)/);
            if (match) {
              speed = parseFloat(match[1]);
            }
          }
        } catch { }
      }
    }

    let result = model;

    // Only append clock speed if not already present in the model string
    if (speed) {
      const ghz = (speed / 1000).toFixed(2);
      // Regex: contains @ ... GHz or MHz (case insensitive, allows whitespace)
      const atHzRegex = /@\s*[\d+.]+\s*(G|M)Hz/i;
      if (!atHzRegex.test(model)) {
        result += ` @ ${ghz} GHz`;
      }
    }

    if (coreCount > 0) {
      if (result.indexOf('@') > -1) {
        result = result.replace('@', `(${coreCount}) @`);
      }
      else {
        result += ` (${coreCount})`;
      }
    }

    return result;
  } catch (e) { }
  return 'Unknown';
}
