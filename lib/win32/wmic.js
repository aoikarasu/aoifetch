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
 * Parses WMIC /format:csv output into array of objects.
 */
export function parseCsv(output) {
  const lines = output.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const [header, ...data] = lines;
  const columns = header.split(',');
  return data.map(line => {
    const values = line.split(',');
    const obj = {};
    columns.forEach((col, i) => { obj[col] = values[i]; });
    return obj;
  });
}

/**
 * Calls WMIC and returns parsed output (space table or CSV).
 * module: e.g. "Win32_Battery"
 * props: array of property names
 * opts: {csv:boolean}
 */
export function getWmicProps(module, props, opts = {}) {
  const propstr = props.join(',');
  let output = '';
  if (opts.csv) {
    output = execSync(`WMIC PATH ${module} GET ${propstr} /format:csv`, { encoding: 'utf8' });
    return parseCsv(output);
  } else {
    output = execSync(`WMIC PATH ${module} GET ${propstr}`, { encoding: 'utf8' });
    return parseSpacePadded(output);
  }
}
