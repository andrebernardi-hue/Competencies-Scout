# Competencies Scout

Dashboard and platform to read and display data from local CSV files. Modern HTML, JS, and CSS with a design system in Storybook. All data stays local; no backend, no cache dependency.

## Setup

```bash
npm install
```

## Commands

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (with HMR — CSS/style updates without relaunch) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run storybook` | Start Storybook for design tokens and components |
| `npm run build-storybook` | Build static Storybook |

## Data / backend

All data is **local** and kept **in memory**. No server, no cache for display or storage.

- **CSV location**: Put files in **`public/data/`** (served at `/data/...`).
- **Data layer**: `src/data/store.js` — load, edit, and save datasets.

### Load

- **From app URL**: `loadDataset('/data/export.csv')` — loads from your hosted `/data/` folder into the store.
- **From disk (file picker)**: `loadDatasetFromFile()` — user picks a CSV; store keeps a file handle so you can **save back to the same file** (Chrome/Edge only, File System Access API).

### Edit (in memory)

- `getDataset(id)`, `getAllDatasets()`
- `updateRow(id, rowIndex, row)`, `addRow(id, row)`, `removeRow(id, rowIndex)`
- `updateCell(id, rowIndex, header, value)`

### Save

- **Download**: `saveAsDownload(id, optionalFilename)` — builds CSV and triggers a file download. Works in all browsers; user can replace the file in `public/data/` manually if they want.
- **Save to same file**: `saveToFile(id)` — only if the dataset was opened via `loadDatasetFromFile()`. Writes back to the file on disk (Chrome/Edge). Use `canSaveToFile(id)` to check.

```js
import { loadDataset, getDataset, updateCell, saveAsDownload, saveToFile, canSaveToFile } from './data/index.js';

const ds = await loadDataset('/data/scores.csv');
updateCell(ds.id, 0, 'Score', '95');
saveAsDownload(ds.id);  // always works
if (canSaveToFile(ds.id)) await saveToFile(ds.id);  // if opened via picker
```

## Structure

- **`public/data/`** — CSV files (served at `/data/...`)
- **`src/data/`** — Data layer: store (load/edit/save), re-exported from `index.js`.
- **`src/lib/`** — CSV parse/serialize (`csv.js`), chart helpers.
- **`src/styles/tokens/`** — Design tokens. Consumed by app and Storybook; do not hardcode elsewhere.
- **`src/styles/base/`** — Reset, type ramp, grid, tables.
- **`src/components/`** — Reusable UI.
- **`src/stories/`** — Storybook for the design system.

## Stack

- **Vite** — Build and dev server; HMR for instant style updates.
- **Storybook (HTML + Vite)** — Design system documentation.
- **PapaParse** — CSV parsing.
- **Chart.js** — Charts (use when building reports).

## Browser

Desktop only. Chrome and Safari supported.
