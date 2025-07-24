import chalk from 'chalk';
import { execSync } from 'child_process';
import { parseSpacePadded, parseListFormat } from '../misc.js';

function baseQueryWmicProps(module, where, props, opts) {
  const options = Object.assign({ list: true, verbose: false, wsl: false }, opts);
  const propstr = props.join(',');
  let cmd = `WMIC ${module}`;
  if (where && where.trim()) {
    cmd += ` where (${where.trim()})`;
  }
  cmd += ` get ${propstr}`;
  if (options.list) {
    cmd += ' /format:list';
  }
  if (options.wsl) {
    cmd = `cmd.exe /C "${cmd}"`;
  }
  if (!options.verbose) {
    cmd += options.wsl ? ' 2>/dev/null' : ' 2>nul';
  }
  if (options.verbose) {
    console.log('Shell command:', chalk.gray(cmd));
  }
  const output = execSync(cmd, { encoding: 'utf8' });
  if (options.list) {
    return parseListFormat(output);
  } else {
    return parseSpacePadded(output);
  }
}

export function getWmicProps(module, props, options) {
  return baseQueryWmicProps(`PATH ${module}`, null, props, options);
}

export function queryWmicProps(module, where, props, options) {
  return baseQueryWmicProps(module, where, props, options);
}

export function queryWslWmicProps(module, where, props, options) {
  return baseQueryWmicProps(module, where, props, { ...options, wsl: true });
}
