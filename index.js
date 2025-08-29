#!/usr/bin/env node
//import os from 'os';
import chalk from 'chalk';
import { program } from 'commander';
import pkg from './package.json' with { type: 'json' };
import { readConfig, writeConfig, getAllSettings, getConfigPath, getColorizer, isValidColor } from './config.js';
import { getBatteryPercentColored } from './lib/battery.js';
import { getCPU } from './lib/cpu.js';
import { getDiskInfo } from './lib/disk.js';
import { getPrettyHost } from './lib/host.js';
import { getLocale, getUptime } from './lib/misc.js';
import { getMemoryInfo } from './lib/memory.js';
import { getLocalIPs, getPublicIP } from './lib/network.js';
import { getPackages } from './lib/pkg.js';
import { getShell, getShellVersion } from './lib/shell.js';
import { getWM } from './lib/wm.js';
import { printColorBars } from './lib/color.js';
import { getPrettyOs } from './lib/os.js';
import { getGPU } from './lib/gpu.js';
import { getDisplays } from './lib/display.js';
import { getThermals } from './lib/thermals.js';
import { getTerminalName, getTerminalFont } from './lib/terminal.js';

function getConfig() {
  return readConfig();
}

function main() {
  const cfg = getConfig();
  const b = getColorizer(cfg);

  const os = getPrettyOs();
  const uname = os.userInfo().username;
  const hname = os.hostname();
  const userhost = `${uname}@${hname}`;
  console.log(b(userhost));
  console.log('-'.repeat(userhost.length));

  console.log(`${b('OS:')} ${os.pretty()} (${os.arch()})`);
  console.log(`${b('Host:')} ${getPrettyHost()}`);
  console.log(`${b('Kernel:')} ${os.type()} ${os.release()}`);
  console.log(`${b('Uptime:')} ${getUptime(os)}`);

  const [shellName, shellPath] = getShell();
  const shellVersion = getShellVersion(shellPath);
  console.log(`${b('Shell:')} ${shellName} ${shellVersion !== 'N/A' ? `${shellVersion}` : ''}`);

  console.log(`${b('WM:')} ${getWM()}`);
  console.log(`${b('Terminal:')} ${getTerminalName()}`);
  console.log(`${b('Font:')} ${getTerminalFont()}`);
  console.log(`${b('Packages:')} ${getPackages()}`);
  console.log(`${b('NodeJS:')} ${process.version}`);
  console.log(`${b('CPU:')} ${getCPU()}`);
  console.log(`${b('GPU:')} ${getGPU()}`);
  console.log(`${b('Displays:')} ${getDisplays()}`);
  console.log(`${b('Thermals:')} ${getThermals()}`);
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
  console.log(`${b('Public IP:')} ${getPublicIP()}`);

  console.log(`${b('Battery:')} ${getBatteryPercentColored()}`);
  console.log(`${b('Locale:')} ${getLocale()}`);

  printColorBars();
}

program
  .name('aoifetch')
  .description('Neofetch-style system info for Node.js')
  .version(pkg.version, '-v, --version', 'output the version number')
  .showHelpAfterError();

program
  .command('config')
  .description('View or change aoifetch settings')
  .option('--color [name]', 'Get or set the label color (e.g., cyan, redBright)')
  .option('--all', 'Show all settings')
  .action((opts) => {
    if (opts.all) {
      const all = getAllSettings();
      console.log(JSON.stringify(all, null, 2));
      console.log(`File: ${getConfigPath()}`);
      return;
    }

    if (opts.color === true) {
      const cfg = readConfig();
      const current = cfg.color || 'default (cyan)';
      console.log(`color: ${current}`);
      return;
    }
    if (typeof opts.color === 'string') {
      const name = opts.color;
      if (!isValidColor(name)) {
        console.log(`Invalid color: ${name}`);
        console.log('Valid colors: black, red, green, yellow, blue, magenta, cyan, white, gray/grey, and Bright variants (e.g., redBright).');
        return;
      }
      const next = writeConfig({ color: name });
      console.log(`Updated color to '${name}'.`);
      console.log(`File: ${getConfigPath()}`);
      return;
    }

    // If config was called without flags
    program.commands.find(c => c.name() === 'config').help();
  });

const argv = process.argv.slice(2);
if (argv.length === 0) {
  main();
} else {
  program.parse(process.argv);
}
