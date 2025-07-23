import { execSync } from 'child_process';

/**
 * Parses WMIC output with space-padded columns (default/table output).
 * Returns an array of objects per row.
 */
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

/**
 * Parses WMIC /format:list output into array of objects.
 * Blank line separates objects. Lines are key=value
 */
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

/**
 * Calls WMIC and returns parsed output (space table or list).
 * module: e.g. "Win32_Battery"
 * props: array of property names
 * opts: {list:boolean}
 */
export function getWmicProps(module, props, opts = { list: true }) {
  const propstr = props.join(',');
  let output = '';
  if (opts.list) {
    output = execSync(`WMIC PATH ${module} GET ${propstr} /format:list 2>nul`, { encoding: 'utf8' });
    return parseListFormat(output);
  } else {
    output = execSync(`WMIC PATH ${module} GET ${propstr} 2>nul`, { encoding: 'utf8' });
    return parseSpacePadded(output);
  }
}
