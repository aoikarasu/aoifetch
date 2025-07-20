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

console.log(chalk.cyan('      _      _        _     _           _     '));
console.log(chalk.cyan('  __| | ___| | _____| |__ (_)_ __   __| |___ '));
console.log(chalk.cyan(' / _` |/ _ \ |/ / _ \ |_ \| | \ \ / /| / __|'));
console.log(chalk.cyan('| (_| |  __/   <  __/ |_) | | |\ V / | \__ \\'));
console.log(chalk.cyan(' \__,_|\___|_|\_\___|_.__/|_|_| \_/  |_|___/'));
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
