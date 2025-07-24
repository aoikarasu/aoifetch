import fs from 'fs';

export function getPlatform() {
  if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) {
    return 'termux';
  }
  return process.platform;
}

export function isWsl() {
  if (process.env.WSL_INTEROP || process.env.WSL_DISTRO_NAME) {
    return true;
  }
  try {
    const version = fs.readFileSync('/proc/version', 'utf8');
    if (version.includes('Microsoft') || version.includes('WSL')) {
      return true;
    }
  } catch { }
  return false;
}

export function getUptime(os) {
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

export function getLocale() {
  const env = process.env;
  const loc = env.LC_ALL || env.LANG || env.LANGUAGE || '';
  if (loc && /^[\w-]+(?:\.[\w-]+)?/.test(loc)) {
    return loc;
  }
  return Intl.DateTimeFormat().resolvedOptions().locale + '.UTF-8';
}

export function parseSpacePadded(output) {
  const lines = output.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  // Determine column start indices by header row
  const header = lines[0];
  const indices = [];
  let lastWasSpace = true;
  for (let i = 0; i < header.length; i++) {
    const isSpace = header[i] === ' ';
    if (lastWasSpace && !isSpace) indices.push(i);
    lastWasSpace = isSpace;
  }
  // Columns by name
  const columns = indices.map((start, i) => {
    const end = indices[i + 1] ?? header.length;
    return header.substring(start, end).trim();
  });
  // Parse rows
  const rows = lines.slice(1).map(line => {
    const obj = {};
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = indices[i + 1] ?? line.length;
      obj[columns[i]] = (line.substring(start, end) || '').trim();
    }
    return obj;
  });
  return rows;
}

export function parseListFormat(output) {
  const lines = output.split(/\r?\n/);
  const objects = [];
  let obj = {};
  for (const line of lines) {
    if (!line.trim()) {
      if (Object.keys(obj).length) {
        objects.push(obj);
        obj = {};
      }
      continue;
    }
    const idx = line.indexOf('=');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      obj[key] = value;
    }
  }
  if (Object.keys(obj).length) objects.push(obj);
  return objects;
}
