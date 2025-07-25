import os from 'os';
import { execSync } from 'child_process';
import { getPlatform } from './misc.js';

export function getLocalIPs() {
  const ips = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        let mask = net.netmask;
        let maskBits = 0;
        if (mask && typeof mask === 'string') {
          maskBits = mask.split('.').map(Number)
            .map(octet => octet.toString(2))
            .join('').split('1').length - 1;
        }
        ips.push({
          name,
          address: net.address,
          maskBits,
        });
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
