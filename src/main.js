/**
 * App entry. Imports global styles and initializes the dashboard.
 * All data stays local; no cache dependency for display or storage.
 */
import './styles/main.css';

import { createIcons, LayoutDashboard, Users, ClipboardList, Palette } from 'lucide';
import { loadCsvFromPath, parseCsv, serializeCsv } from './lib/csv.js';
import * as dataStore from './data/index.js';
import { loadPersonnel } from './data/personnel.js';
import { loadCompetencies } from './data/competencies.js';
import { buildDirectorsIndex } from './data/directors.js';
import { init as initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  createIcons({
    icons: { LayoutDashboard, Users, ClipboardList, Palette },
    attrs: { class: 'app-nav__svg' },
  });

  const mainContent = document.getElementById('main-content');
  const drawerContent = document.getElementById('drawer-content');
  const appBody = document.getElementById('app-body');
  if (!mainContent || !drawerContent || !appBody) return;
  try {
    await loadPersonnel();
    buildDirectorsIndex();
    await loadCompetencies();
    initRouter({ mainContent, drawerContent, body: appBody });
  } catch (e) {
    mainContent.innerHTML = `<p class="type-body">Failed to load: ${String(e.message)}</p>`;
  }
});

export { loadCsvFromPath, parseCsv, serializeCsv, dataStore };
