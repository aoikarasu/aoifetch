export function getPlatform() {
  if (process.env.PREFIX && process.env.PREFIX.includes('com.termux')) {
    return 'termux';
  }
  return process.platform;
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
