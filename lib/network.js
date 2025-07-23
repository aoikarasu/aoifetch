import os from 'os';

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
