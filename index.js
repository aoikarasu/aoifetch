import os from 'os';
import chalk from 'chalk';
import { execSync } from 'child_process';

function getUptime() {
  const uptimeSec = os.uptime();
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getShell() {
  if (process.platform === 'win32') return process.env.COMSPEC || 'cmd.exe';
  return process.env.SHELL || 'unknown';
}

function getWM() {
  if (process.platform === 'linux') {
    try {
      return execSync('echo $XDG_CURRENT_DESKTOP', { encoding: 'utf-8' }).trim() || 'unknown';
    } catch {
      return 'unknown';
    }
  }
  return 'N/A';
}

function getPackages() {
  try {
    if (process.platform === 'win32') return 'see installed apps';
    return execSync('find ./node_modules -type d -maxdepth 1 | wc -l', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

// Returns array of local IPs in form: '{name, address, maskBits}'
function getLocalIPs() {
  const ips = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        // Calculate CIDR prefix (netmask)
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

function getLocale() {
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

function getBattery() {
  try {
    if (process.platform === 'linux') {
      const res = execSync("upower -i $(upower -e | grep BAT) | grep percentage | awk '{print $2}'", { encoding: 'utf-8' }).trim();
      if (res) return res;
    } else if (process.platform === 'darwin') {
      const res = execSync("pmset -g batt | grep -Eo '[0-9]+%' | head -1", { encoding: 'utf-8' }).trim();
      if (res) return res;
    } else if (process.platform === 'win32') {
      const res = execSync("WMIC PATH Win32_Battery Get EstimatedChargeRemaining", { encoding: 'utf-8' }).split('\n')[1];
      if(res && res.trim()) return res.trim() + '%';
    }
  } catch {}
  return 'unknown';
}

function printColorBars() {
  const colors = [
    chalk.bgBlack('   '),
    chalk.bgRed('   '),
    chalk.bgGreen('   '),
    chalk.bgYellow('   '),
    chalk.bgBlue('   '),
    chalk.bgMagenta('   '),
    chalk.bgCyan('   '),
    chalk.bgWhite('   ')
  ];
  const bright = [
    chalk.bgGray('   '),
    chalk.bgRedBright('   '),
    chalk.bgGreenBright('   '),
    chalk.bgYellowBright('   '),
    chalk.bgBlueBright('   '),
    chalk.bgMagentaBright('   '),
    chalk.bgCyanBright('   '),
    chalk.bgWhiteBright('   ')
  ];
  console.log('\n' + colors.join('') + '\n' + bright.join('') + '\n');
}

console.log(chalk.cyan('      _      _        _     _           _     '));
console.log(chalk.cyan('  __| | ___| | _____| |__ (_)_ __   __| |___ '));
console.log(chalk.cyan(' / _` |/ _ \\ |/ / _ \\ |_ \\| | \\ \\ / /| / __|'));
console.log(chalk.cyan('| (_| |  __/   <  __/ |_) | | |\\ V / | \\__ \\'));
console.log(chalk.cyan(' \\__,_|\\___|_|\\_\\___|_./|_|_| \\_/  |_|___/'));
console.log();

console.log(`${chalk.bold('User:')}     ${os.userInfo().username}`);
console.log(`${chalk.bold('OS:')}       ${os.type()} ${os.release()} (${os.platform()})`);
console.log(`${chalk.bold('Host:')}     ${os.hostname()}`);
console.log(`${chalk.bold('Kernel:')}   ${os.release()}`);
console.log(`${chalk.bold('Uptime:')}   ${getUptime()}`);
console.log(`${chalk.bold('Shell:')}    ${getShell()}`);
console.log(`${chalk.bold('WM:')}       ${getWM()}`);
console.log(`${chalk.bold('Packages:')} ${getPackages()}`);
console.log(`${chalk.bold('NodeJS:')}   ${process.version}`);
console.log(`${chalk.bold('CPU:')}      ${os.cpus()[0].model}`);
console.log(`${chalk.bold('Memory:')}   ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`);

// Print all local IPs like: Local IP (eth0): 192.168.8.178/24
const localIPs = getLocalIPs();
if (localIPs.length > 0) {
  for (const ip of localIPs) {
    console.log(`${chalk.bold(`Local IP (${ip.name}):`)} ${ip.address}/${ip.maskBits}`);
  }
} else {
  console.log(`${chalk.bold('Local IP:')} N/A`);
}

console.log(`${chalk.bold('Battery:')}  ${getBattery()}`);
console.log(`${chalk.bold('Locale:')}   ${getLocale()}`);

printColorBars();
