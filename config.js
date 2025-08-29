import fs from 'fs';
import os from 'os';
import path from 'path';
import chalk from 'chalk';

const DEFAULTS = {
  color: null,
};

export function getConfigPath() {
  const home = os.homedir();
  return path.join(home, '.config', 'aoifetch', 'settings.json');
}

export function readConfig() {
  const file = getConfigPath();
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...(parsed || {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeConfig(partial) {
  const file = getConfigPath();
  const dir = path.dirname(file);
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  const current = readConfig();
  const next = { ...current, ...(partial || {}) };
  fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n', 'utf-8');
  return next;
}

export function getAllSettings() {
  return readConfig();
}

const ALLOWED_COLORS = [
  'black','red','green','yellow','blue','magenta','cyan','white',
  'gray','grey',
  'blackBright','redBright','greenBright','yellowBright','blueBright','magentaBright','cyanBright','whiteBright'
];

export function isValidColor(name) {
  return typeof name === 'string' && ALLOWED_COLORS.includes(name);
}

export function getColorizer(cfg) {
  const name = cfg && cfg.color;
  if (isValidColor(name) && typeof chalk[name] === 'function') return chalk[name];
  return chalk.cyan; // default
}
