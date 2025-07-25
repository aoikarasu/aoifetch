import chalk from 'chalk';
import { execSync } from 'child_process';
import { parseSpacePadded, parseListFormat } from '../misc.js';

export function queryCimProps(module, props, opts) {
  const options = Object.assign({ verbose: false, wsl: false }, opts);
  const propstr = props?.join(',');
  let cmd = `Get-CimInstance -ClassName ${module}`;
  if (propstr) {
    cmd += ` | Select-Object  ${propstr}`;
  }
  cmd += ' | Format-List *';
  cmd = `powershell.exe -Command "${cmd}"`;
  if (!options.verbose) {
    cmd += options.wsl ? ' 2>/dev/null' : ' 2>nul';
  }
  if (options.verbose) {
    console.log('Shell command:', chalk.gray(cmd));
  }
  const output = execSync(cmd, { encoding: 'utf8' });
  return parseListFormat(output, ':');
}
