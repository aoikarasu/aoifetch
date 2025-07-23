#!/usr/bin/env node
import os from 'os';
import chalk from 'chalk';
import { getBatteryPercentColored } from './lib/battery.js';
import { getCPU } from './lib/cpu.js';
import { getDiskInfo } from './lib/disk.js';
import { getPrettyHost } from './lib/host.js';
import { getLocale, getUptime } from './lib/misc.js';
import { getMemoryInfo } from './lib/memory.js';
import { getLocalIPs } from './lib/network.js';
import { getPackages } from './lib/pkg.js';
import { getShell, getShellPath, getShellVersion } from './lib/shell.js';
import { getWM } from './lib/wm.js';
import { printColorBars } from './lib/color.js';

function main() {
  const b = chalk.cyan;

  const uname = os.userInfo().username;
  const hname = os.hostname();
  const userhost = `${uname}@${hname}`;
  console.log(b(userhost));
  console.log('-'.repeat(userhost.length));

  console.log(`${b('OS:')} ${os.type()} ${os.release()} (${os.platform()})`);
  console.log(`${b('Host:')} ${getPrettyHost()}`);
  console.log(`${b('Kernel:')} ${os.release()}`);
  console.log(`${b('Uptime:')} ${getUptime(os)}`);

  const [shellName, shellPath] = getShell();
  const shellVersion = getShellVersion(shellPath);
  console.log(`${b('Shell:')} ${shellName} ${shellVersion !== 'N/A' ? `${shellVersion}` : ''}`);

  console.log(`${b('WM:')} ${getWM()}`);
  console.log(`${b('Packages:')} ${getPackages()}`);
  console.log(`${b('NodeJS:')} ${process.version}`);
  console.log(`${b('CPU:')} ${getCPU()}`);
  console.log(`${b('Memory:')} ${getMemoryInfo()}`);
  console.log(`${b('Disk (/):')} ${getDiskInfo()}`);

  const localIPs = getLocalIPs();
  if (localIPs.length > 0) {
    for (const ip of localIPs) {
      console.log(`${b(`Local IP (${ip.name}):`)} ${ip.address}/${ip.maskBits}`);
    }
  } else {
    console.log(`${b('Local IP:')} N/A`);
  }

  console.log(`${b('Battery:')} ${getBatteryPercentColored()}`);
  console.log(`${b('Locale:')} ${getLocale()}`);

  printColorBars();
}

main();
