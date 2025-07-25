import os from 'os';
import { execSync } from 'child_process';
import { getPlatform, parseListFormat } from "./misc.js";
import { queryCimProps } from './win32/cim.js';

export function getPrettyOs() {
  const platform = getPlatform();
  const pos = Object.assign({}, os);
  pos.pretty = os.type;

  if (platform == 'linux') {
    try {
      const output = execSync('cat /etc/os-release 2>/dev/null', { encoding: 'utf-8' });
      const props = parseListFormat(output)[0];
      pos.pretty = () => (props.PRETTY_NAME ?? props.NAME ?? os.type()).replace(/^"(.*)"$/, '$1');
    }
    catch { }
  }
  else if (platform == 'win32') {
    try {
      const props = queryCimProps('Win32_OperatingSystem', ['Caption', 'OSArchitecture'])[0];
      pos.pretty = () => props.Caption ?? os.type();
      pos.arch = () => props.OSArchitecture ?? os.arch();
    }
    catch { }
  }
  return pos;
}