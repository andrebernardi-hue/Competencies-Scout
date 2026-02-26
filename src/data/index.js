/**
 * Data layer: load, edit, and save CSV datasets. All in memory; save via download or File System Access API.
 */
export {
  loadDataset,
  loadDatasetFromFile,
  getDataset,
  getAllDatasets,
  updateRow,
  addRow,
  removeRow,
  updateCell,
  saveAsDownload,
  saveToFile,
  canSaveToFile,
} from './store.js';
