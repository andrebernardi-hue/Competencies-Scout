/**
 * Local CSV load, parse, and serialize. No backend, no cache.
 */
import Papa from 'papaparse';

/**
 * @param {string} path - Path relative to project root, e.g. '/data/export.csv'
 * @returns {Promise<{ headers: string[], rows: Record<string, string>[] }>}
 */
export async function loadCsvFromPath(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load CSV: ${path} ${res.status}`);
  const text = await res.text();
  return parseCsv(text);
}

/**
 * @param {string} raw - Raw CSV string
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function parseCsv(raw) {
  const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
  return {
    headers: parsed.meta.fields || [],
    rows: parsed.data,
  };
}

/**
 * Serialize headers + rows back to CSV string (for saving).
 * @param {string[]} headers
 * @param {Record<string, string>[]} rows
 * @returns {string}
 */
export function serializeCsv(headers, rows) {
  if (!headers.length) return '';
  return Papa.unparse(rows, { columns: headers });
}
