import os from 'os';
import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

export function getLocalIPs() {
  const ips = [];
  let nets = {};
  try {
    nets = os.networkInterfaces();
  } catch {
    // Some environments (e.g., UserLAnd) can throw from os.networkInterfaces().
    return ips;
  }
  for (const name of Object.keys(nets || {})) {
    const entries = nets[name] || [];
    for (const net of entries) {
      if (net && net.family === 'IPv4' && !net.internal) {
        const mask = typeof net.netmask === 'string' ? net.netmask : '';
        let maskBits = 0;
        if (mask) {
          try {
            maskBits = mask
              .split('.')
              .map(n => Math.max(0, Math.min(255, Number(n) || 0)))
              .map(oct => oct.toString(2).padStart(8, '0'))
              .join('')
              .replace(/0/g, '')
              .length;
          } catch { maskBits = 0; }
        }
        ips.push({ name, address: net.address, maskBits });
      }
    }
  }
  return ips;
}

export function getPublicIP() {
  try {
    const platform = getPlatform();
    const curl = platform === 'win32' ? 'curl.exe' : 'curl';
    const devnull = platform === 'win32' ? 'nul' : '/dev/null';
    const output = execSync(`${curl} -s https://api.ipify.org 2>${devnull}`, { encoding: 'utf-8' });
    // TODO: parse output
    return output;
  }
  catch {
    return 'unknown';
  }
}
