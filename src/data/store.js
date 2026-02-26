/**
 * In-memory data store for CSV datasets. Supports load, edit, and save.
 * No backend; save is either download or File System Access API (Chrome).
 */

import { loadCsvFromPath, parseCsv, serializeCsv } from '../lib/csv.js';

/** @typedef {{ id: string, path: string, headers: string[], rows: Record<string, string>[], fileHandle?: FileSystemFileHandle }} Dataset */

const datasets = /** @type {Map<string, Dataset>} */ (new Map());

/**
 * Load a CSV from path into the store. Use path as id (e.g. '/data/export.csv').
 * @param {string} path - e.g. '/data/export.csv'
 * @returns {Promise<Dataset>}
 */
export async function loadDataset(path) {
  const { headers, rows } = await loadCsvFromPath(path);
  const id = path;
  const dataset = { id, path, headers, rows };
  datasets.set(id, dataset);
  return dataset;
}

/**
 * Load a CSV from a user-picked file (File Picker). Enables save back to same file later.
 * @returns {Promise<Dataset>}
 */
export async function loadDatasetFromFile() {
  if (!('showOpenFilePicker' in window)) {
    throw new Error('File System Access API not supported (use Chrome or Edge). Use loadDataset("/data/…") and saveAsDownload instead.');
  }
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }],
    multiple: false,
  });
  const file = await handle.getFile();
  const text = await file.text();
  const { headers, rows } = parseCsv(text);
  const id = file.name;
  const dataset = { id, path: file.name, headers, rows, fileHandle: handle };
  datasets.set(id, dataset);
  return dataset;
}

/**
 * @param {string} id - Dataset id (path or filename)
 * @returns {Dataset | undefined}
 */
export function getDataset(id) {
  return datasets.get(id);
}

/**
 * @returns {Dataset[]}
 */
export function getAllDatasets() {
  return [...datasets.values()];
}

/**
 * Update one row by index.
 * @param {string} id
 * @param {number} rowIndex
 * @param {Record<string, string>} row
 */
export function updateRow(id, rowIndex, row) {
  const d = datasets.get(id);
  if (!d) throw new Error(`Dataset not found: ${id}`);
  if (rowIndex < 0 || rowIndex >= d.rows.length) throw new Error('Row index out of range');
  d.rows[rowIndex] = { ...d.rows[rowIndex], ...row };
}

/**
 * Add a row.
 * @param {string} id
 * @param {Record<string, string>} row
 */
export function addRow(id, row) {
  const d = datasets.get(id);
  if (!d) throw new Error(`Dataset not found: ${id}`);
  d.rows.push(row);
}

/**
 * Remove a row by index.
 * @param {string} id
 * @param {number} rowIndex
 */
export function removeRow(id, rowIndex) {
  const d = datasets.get(id);
  if (!d) throw new Error(`Dataset not found: ${id}`);
  d.rows.splice(rowIndex, 1);
}

/**
 * Update a single cell.
 * @param {string} id
 * @param {number} rowIndex
 * @param {string} header
 * @param {string} value
 */
export function updateCell(id, rowIndex, header, value) {
  const d = datasets.get(id);
  if (!d) throw new Error(`Dataset not found: ${id}`);
  if (rowIndex < 0 || rowIndex >= d.rows.length) throw new Error('Row index out of range');
  if (!d.headers.includes(header)) throw new Error(`Unknown column: ${header}`);
  d.rows[rowIndex] = { ...d.rows[rowIndex], [header]: value };
}

/**
 * Save dataset to a downloaded file (user chooses where to save). Always works.
 * @param {string} id
 * @param {string} [suggestedName] - e.g. 'export.csv'
 */
export function saveAsDownload(id, suggestedName) {
  const d = datasets.get(id);
  if (!d) throw new Error(`Dataset not found: ${id}`);
  const csv = serializeCsv(d.headers, d.rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const name = suggestedName || d.path.split('/').pop() || 'data.csv';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Save dataset back to the same file (only if it was opened via file picker). Chrome/Edge.
 * @param {string} id
 */
export async function saveToFile(id) {
  const d = datasets.get(id);
  if (!d) throw new Error(`Dataset not found: ${id}`);
  if (!d.fileHandle) {
    throw new Error('This dataset was loaded from a URL. Use saveAsDownload(id) to export, or open the file via "Open file" to save back.');
  }
  const csv = serializeCsv(d.headers, d.rows);
  const writable = await d.fileHandle.createWritable();
  await writable.write(csv);
  await writable.close();
}

/**
 * Check if a dataset can be saved back to file (has file handle).
 * @param {string} id
 * @returns {boolean}
 */
export function canSaveToFile(id) {
  return !!datasets.get(id)?.fileHandle;
}
