import os from 'os';
import chalk from 'chalk';
import { execSync } from 'child_process';

function getUptime() {
  const uptimeSec = os.uptime();
  const days = Math.floor(uptimeSec / (3600 * 24));
  const hours = Math.floor((uptimeSec % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  let parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  return parts.join(", ");
}

function getShell() {
  if (process.platform === 'win32') return process.env.COMSPEC || 'cmd.exe';
  return process.env.SHELL || 'unknown';
}

function getShellVersion(shellPath) {
  try {
    const shellName = shellPath.split('/').pop();
    if (/bash|zsh|fish|ksh|dash/.test(shellName)) {
      let version = execSync(`${shellPath} --version`, { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).split('\n')[0];
      return version;
    } else if (process.platform === 'win32') {
      if (/cmd\.exe$/i.test(shellPath)) {
        return execSync('ver', { encoding: 'utf8' }).trim().split('\n')[0];
      } else if (/powershell/i.test(shellPath)) {
        let v = execSync(`${shellPath} -Command "$PSVersionTable.PSVersion"`, {encoding:'utf8'}).trim().split('\n')[0];
        return v;
      }
    }
  } catch(e) {}
  return 'N/A';
}

function getPrettyHost() {
  if (process.platform === 'linux') {
    if (process.env.WSL_DISTRO_NAME) {
      return `Windows Subsystem For Linux - ${process.env.WSL_DISTRO_NAME}`;
    }
    try {
      const pretty = execSync("cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null", {encoding:'utf8'}).trim();
      if (pretty && pretty !== 'None' && pretty !== '') return pretty;
    } catch {}
    if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) {
      return 'Android (Termux)';
    }
  }
  if (process.platform === 'darwin') return 'Apple Mac';
  if (process.platform === 'win32') {
    try {
      const pretty = execSync('wmic computersystem get model', {encoding:'utf8'}).split('\n')[1]?.trim();
      if (pretty && pretty !== '') return pretty;
    } catch {}
    return 'Windows PC';
  }
  return os.hostname();
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

function getLocalIPs() {
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

function getLocale() {
  const env = process.env;
  const loc = env.LC_ALL || env.LANG || env.LANGUAGE || '';
  if(loc && /^[\w-]+(?:\.[\w-]+)?/.test(loc)) {
    return loc;
  }
  return Intl.DateTimeFormat().resolvedOptions().locale + '.UTF-8';
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

function main() {
  const b = chalk.cyan;

  const uname = os.userInfo().username;
  const hname = os.hostname();
  const userhost = `${uname}@${hname}`;
  console.log(b(userhost));
  console.log('-'.repeat(userhost.length));

  console.log(`${b('OS:')}       ${os.type()} ${os.release()} (${os.platform()})`);
  console.log(`${b('Host:')}     ${getPrettyHost()}`);
  console.log(`${b('Kernel:')}   ${os.release()}`);
  console.log(`${b('Uptime:')}   ${getUptime()}`);

  const shellPath = getShell();
  const shellVersion = getShellVersion(shellPath);
  console.log(`${b('Shell:')}    ${shellPath} ${shellVersion !== 'N/A' ? `(${shellVersion})` : ''}`);

  console.log(`${b('WM:')}       ${getWM()}`);
  console.log(`${b('Packages:')} ${getPackages()}`);
  console.log(`${b('NodeJS:')}   ${process.version}`);
  console.log(`${b('CPU:')}      ${os.cpus()[0].model}`);
  console.log(`${b('Memory:')}   ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`);

  const localIPs = getLocalIPs();
  if (localIPs.length > 0) {
    for (const ip of localIPs) {
      console.log(`${b(`Local IP (${ip.name}):`)} ${ip.address}/${ip.maskBits}`);
    }
  } else {
    console.log(`${b('Local IP:')} N/A`);
  }

  console.log(`${b('Battery:')}  ${getBattery()}`);
  console.log(`${b('Locale:')}   ${getLocale()}`);

  printColorBars();
}

main();
