/**
 * Dashboard: home page. Reports and charts via src/lib/charts.js.
 */
import { createSpectrumBar, createScatter, createPersonRankBar, linearRegression } from '../lib/charts.js';
import {
  getSpectrumData,
  getTopCompetencies,
  getBottomCompetencies,
  getPersonAverageScores,
  getCategories,
  getSkillsInCategory,
  getScoresForPerson,
  getScoresForSkill,
  getScore,
} from '../data/competencies.js';
import { getPersonIdsForRoles, getPersonById, getAllPeople } from '../data/personnel.js';

const SPECTRUM_ROLES = ['Manager', 'Staff'];
const TOP_N = 5;
const BOTTOM_N = 5;
const UNDER_PRESSURE_N = 10;

export function render(container) {
  container.innerHTML = '';
  container.className = 'page-content dashboard-page';

  // Global filter state and helpers
  const pillState = { Manager: true, Staff: true };
  function getAllowedPersonIds() {
    const roles = SPECTRUM_ROLES.filter((r) => pillState[r]);
    return roles.length ? getPersonIdsForRoles(roles) : new Set();
  }
  const refreshFns = [];

  // Title row: role filter pills (page title is in the header)
  const titleRow = document.createElement('div');
  titleRow.className = 'dashboard-page__title-row';
  const pillContainer = document.createElement('div');
  pillContainer.className = 'spectrum-pills';
  pillContainer.setAttribute('aria-label', 'Filter by role');

  function refreshAll() {
    refreshFns.forEach((fn) => fn());
  }

  SPECTRUM_ROLES.forEach((role) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'spectrum-pill spectrum-pill--on';
    pill.textContent = role;
    pill.dataset.role = role;
    pill.setAttribute('aria-pressed', 'true');
    pill.addEventListener('click', () => {
      pillState[role] = !pillState[role];
      pill.classList.toggle('spectrum-pill--on', pillState[role]);
      pill.setAttribute('aria-pressed', String(pillState[role]));
      refreshAll();
    });
    pillContainer.appendChild(pill);
  });
  titleRow.appendChild(pillContainer);
  container.appendChild(titleRow);

  const initialPersonIds = getAllowedPersonIds();
  const spectrum = getSpectrumData({ allowedPersonIds: initialPersonIds.size ? initialPersonIds : undefined });
  let chart = null;
  if (spectrum.labels.length) {
    const section = document.createElement('section');
    section.className = 'dashboard-report dashboard-report--spectrum';
    section.setAttribute('aria-label', 'Spectrum report of all competencies');
    const heading = document.createElement('h3');
    heading.className = 'type-display-3';
    heading.textContent = 'Spectrum report';
    section.appendChild(heading);
    const chartWrap = document.createElement('div');
    chartWrap.className = 'dashboard-report__chart';
    chartWrap.style.height = '320px';
    const canvas = document.createElement('canvas');
    chartWrap.appendChild(canvas);
    section.appendChild(chartWrap);
    container.appendChild(section);
    chart = createSpectrumBar(canvas, {
      labels: spectrum.labels,
      fullLabels: spectrum.fullLabels,
      values: spectrum.values,
      categoryBoundaries: spectrum.categoryBoundaries,
      categoryIndices: spectrum.categoryIndices,
      categoryNames: spectrum.categoryNames,
    });
    refreshFns.push(() => {
      const allowed = getAllowedPersonIds();
      const next = getSpectrumData({ allowedPersonIds: allowed });
      chart.data.datasets[0].data = next.values;
      chart.update();
    });
    requestAnimationFrame(() => {
      chart.resize();
    });
  }

  const blocksWrapper = document.createElement('div');
  blocksWrapper.className = 'dashboard-blocks';
  container.appendChild(blocksWrapper);

  function createFilteredBlock(title, renderContent, options = {}) {
    const { displayAs = 'list' } = options; // 'list' | 'table'
    const section = document.createElement('section');
    section.className = 'dashboard-block';
    const box = document.createElement('div');
    box.className = 'dashboard-block__box';
    const header = document.createElement('div');
    header.className = 'dashboard-report__header';
    const heading = document.createElement('h3');
    heading.className = 'type-display-3';
    heading.textContent = title;
    header.appendChild(heading);
    const contentEl = document.createElement('div');
    contentEl.className = 'dashboard-block__content';

    function update() {
      const allowed = getAllowedPersonIds();
      contentEl.innerHTML = '';
      if (allowed.size === 0) {
        contentEl.appendChild(document.createTextNode('No data for the selected roles.'));
        return;
      }
      const items = renderContent(allowed);
      if (items.length === 0) {
        contentEl.appendChild(document.createTextNode('No data for the selected roles.'));
      } else if (displayAs === 'table') {
        const table = document.createElement('table');
        table.className = 'dashboard-block__table';
        table.setAttribute('role', 'grid');
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th class="type-table-header">Competency</th><th class="type-table-header">Avg</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        items.forEach((item) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td class="type-body">${escapeHtml(item.text)}</td><td class="type-body dashboard-block__cell--value">${escapeHtml(String(item.value))}</td>`;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        contentEl.appendChild(table);
      } else {
        const list = document.createElement('ul');
        list.className = 'dashboard-block__list';
        items.forEach((item) => {
          const li = document.createElement('li');
          li.className = 'dashboard-block__item';
          if (item.href) {
            const a = document.createElement('a');
            a.href = item.href;
            a.textContent = item.text;
            a.className = 'type-body';
            li.appendChild(a);
          } else {
            li.textContent = item.text;
            li.className = 'dashboard-block__item type-body';
          }
          if (item.sub != null) {
            const sub = document.createElement('span');
            sub.className = 'dashboard-block__sub';
            sub.textContent = item.sub;
            sub.setAttribute('aria-hidden', 'true');
            li.appendChild(document.createTextNode(' '));
            li.appendChild(sub);
          }
          list.appendChild(li);
        });
        contentEl.appendChild(list);
      }
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    box.appendChild(header);
    box.appendChild(contentEl);
    section.appendChild(box);
    blocksWrapper.appendChild(section);
    refreshFns.push(update);
    update();
  }

  createFilteredBlock(
    'Top ranked competencies',
    (allowed) => {
      const list = getTopCompetencies(TOP_N, { allowedPersonIds: allowed });
      return list.map(({ fullLabel, value }) => ({
        text: fullLabel.includes(' › ') ? fullLabel.split(' › ').pop() : fullLabel,
        value,
      }));
    },
    { displayAs: 'table' }
  );

  createFilteredBlock(
    'Lowest ranked competencies',
    (allowed) => {
      const list = getBottomCompetencies(BOTTOM_N, { allowedPersonIds: allowed });
      return list.map(({ fullLabel, value }) => ({
        text: fullLabel.includes(' › ') ? fullLabel.split(' › ').pop() : fullLabel,
        value,
      }));
    },
    { displayAs: 'table' }
  );

  createFilteredBlock('Under Pressure People', (allowed) => {
    const scores = getPersonAverageScores({ allowedPersonIds: allowed });
    const bottom = [...scores]
      .sort((a, b) => a.average - b.average)
      .slice(0, UNDER_PRESSURE_N);
    return bottom.map(({ personId, average }) => {
      const person = getPersonById(personId);
      return {
        text: person?.name ?? personId,
        href: `#/person/${personId}`,
        sub: ` — ${average}`,
      };
    });
  });

  // Divider below the three cards
  const divider = document.createElement('hr');
  divider.className = 'dashboard-divider';
  container.appendChild(divider);

  // Scatter: Years of experience (x) vs Competency rank (y), with Y-axis mode dropdown
  const scatterSection = document.createElement('section');
  scatterSection.className = 'dashboard-scatter-section';
  scatterSection.setAttribute('aria-label', 'Experience vs competency rank');
  const scatterHeading = document.createElement('h3');
  scatterHeading.className = 'type-display-3';
  scatterHeading.textContent = 'Experience vs. Competency Rank';
  scatterSection.appendChild(scatterHeading);

  function parseYears(str) {
    const s = String(str ?? '').trim();
    if (!s) return null;
    const n = parseInt(s, 10);
    if (!Number.isNaN(n)) return n;
    const range = s.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) return (parseInt(range[1], 10) + parseInt(range[2], 10)) / 2;
    const plus = s.match(/^(\d+)\+$/);
    if (plus) return parseInt(plus[1], 10);
    return null;
  }

  const yAxisSelect = document.createElement('select');
  yAxisSelect.className = 'dashboard-scatter-select type-body';
  yAxisSelect.setAttribute('aria-label', 'Y-axis data');

  const optgroupOverall = document.createElement('optgroup');
  optgroupOverall.label = 'Overall';
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'All Averages';
  optgroupOverall.appendChild(optAll);
  yAxisSelect.appendChild(optgroupOverall);

  const categoriesList = getCategories();
  const optgroupCategory = document.createElement('optgroup');
  optgroupCategory.label = 'Category average';
  categoriesList.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = `cat:${cat}`;
    opt.textContent = cat;
    optgroupCategory.appendChild(opt);
  });
  yAxisSelect.appendChild(optgroupCategory);

  const optgroupCompetency = document.createElement('optgroup');
  optgroupCompetency.label = 'Competency (raw)';
  categoriesList.forEach((cat) => {
    getSkillsInCategory(cat).forEach((skill) => {
      const opt = document.createElement('option');
      opt.value = `skill:${cat}|${skill}`;
      opt.textContent = `${cat} › ${skill}`;
      optgroupCompetency.appendChild(opt);
    });
  });
  yAxisSelect.appendChild(optgroupCompetency);

  const scatterControls = document.createElement('div');
  scatterControls.className = 'dashboard-scatter-controls';
  scatterControls.appendChild(yAxisSelect);
  scatterSection.appendChild(scatterControls);

  const scatterCard = document.createElement('div');
  scatterCard.className = 'dashboard-scatter-card';

  const scatterLayout = document.createElement('div');
  scatterLayout.className = 'dashboard-scatter-layout';

  const chartWrap = document.createElement('div');
  chartWrap.className = 'dashboard-scatter-chart';
  chartWrap.style.height = '360px';
  const canvas = document.createElement('canvas');
  chartWrap.appendChild(canvas);
  scatterLayout.appendChild(chartWrap);

  const scatterStatsPanel = document.createElement('div');
  scatterStatsPanel.className = 'dashboard-scatter-stats-panel';
  scatterStatsPanel.setAttribute('aria-label', 'Regression statistics and outliers');
  scatterLayout.appendChild(scatterStatsPanel);
  scatterCard.appendChild(scatterLayout);
  scatterSection.appendChild(scatterCard);
  container.appendChild(scatterSection);

  function parseYAxisValue(value) {
    if (value === 'all') return { mode: 'all' };
    if (value.startsWith('cat:')) return { mode: 'category', category: value.slice(4) };
    if (value.startsWith('skill:')) {
      const rest = value.slice(6);
      const sep = rest.indexOf('|');
      return { mode: 'competency', category: rest.slice(0, sep), skill: rest.slice(sep + 1) };
    }
    return { mode: 'all' };
  }

  function buildScatterPoints() {
    const allowed = getAllowedPersonIds();
    const people = getAllPeople().filter((p) => !allowed.size || allowed.has(p.id));
    const { mode, category, skill } = parseYAxisValue(yAxisSelect.value);
    const points = [];

    if (mode === 'all') {
      const avgByPerson = new Map(getPersonAverageScores({ allowedPersonIds: allowed.size ? allowed : undefined }).map((r) => [r.personId, r.average]));
      for (const p of people) {
        const years = parseYears(p.yearsOfExperience);
        const y = avgByPerson.get(p.id);
        if (years != null && y != null) points.push({ x: years, y, label: p.name });
      }
    } else if (mode === 'category' && category) {
      for (const p of people) {
        const years = parseYears(p.yearsOfExperience);
        if (years == null) continue;
        const entries = (getScoresForPerson(p.id) ?? []).filter((e) => e.category === category);
        const sum = entries.reduce((a, e) => a + e.score, 0);
        const y = entries.length ? Math.round((sum / entries.length) * 100) / 100 : null;
        if (y != null) points.push({ x: years, y, label: p.name });
      }
    } else if (mode === 'competency' && category && skill) {
      const personScores = getScoresForSkill(category, skill);
      const filtered = allowed.size ? personScores.filter((ps) => allowed.has(ps.personId)) : personScores;
      for (const { personId, score } of filtered) {
        const person = getPersonById(personId);
        const years = person ? parseYears(person.yearsOfExperience) : null;
        if (years != null) points.push({ x: years, y: score, label: person?.name ?? personId });
      }
    }
    return points;
  }

  const MAX_OUTLIERS = 5;

  function getModelInterpretation(r, r2, yTitle) {
    const absR = Math.abs(r);
    const pct = Math.round(r2 * 100);
    const reliable = r2 >= 0.1 && absR >= 0.2;
    if (!reliable) {
      return 'The data is not reliable to predict if the years of experience explain the rank.';
    }
    const direction = r >= 0 ? 'positive' : 'negative';
    const strength = absR >= 0.7 ? 'strong' : absR >= 0.4 ? 'moderate' : 'weak';
    return `There's a ${strength} ${direction} correlation between Years of Experience and ${yTitle}. ${pct}% of the variability is predicted by the model.`;
  }

  function updateScatterStatsPanel(points, yTitle) {
    scatterStatsPanel.innerHTML = '';
    if (points.length < 2) {
      scatterStatsPanel.appendChild(document.createTextNode('Not enough data for regression.'));
      return;
    }
    const xy = points.map((p) => [p.x, p.y]);
    const reg = linearRegression(xy);
    const [slope, intercept] = reg.equation;
    const n = points.length;
    const r2 = reg.r2 ?? 0;
    const r = slope >= 0 ? Math.sqrt(r2) : -Math.sqrt(r2);
    const adjR2 = n > 2 ? 1 - (1 - r2) * (n - 1) / (n - 2) : r2;

    const statsList = document.createElement('dl');
    statsList.className = 'dashboard-scatter-stats-list';
    const pairs = [
      ['R', r.toFixed(4)],
      ['R²', r2.toFixed(4)],
      ['Adjusted R²', adjR2.toFixed(4)],
      ['Intercept', intercept.toFixed(4)],
    ];
    pairs.forEach(([term, value]) => {
      const dt = document.createElement('dt');
      dt.className = 'dashboard-scatter-stats-term';
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.className = 'dashboard-scatter-stats-value';
      dd.textContent = value;
      statsList.appendChild(dt);
      statsList.appendChild(dd);
    });
    scatterStatsPanel.appendChild(statsList);

    const interpretationBox = document.createElement('div');
    interpretationBox.className = 'dashboard-scatter-interpretation';
    interpretationBox.setAttribute('aria-live', 'polite');
    interpretationBox.textContent = getModelInterpretation(r, r2, yTitle ?? 'rank');
    scatterStatsPanel.appendChild(interpretationBox);

    const residuals = points.map((p) => ({
      label: p.label ?? '',
      residual: p.y - (slope * p.x + intercept),
    }));
    residuals.sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
    const outliers = residuals.slice(0, MAX_OUTLIERS);

    const outliersHeading = document.createElement('h4');
    outliersHeading.className = 'type-heading-4 dashboard-scatter-outliers-heading';
    outliersHeading.textContent = 'Outliers';
    scatterStatsPanel.appendChild(outliersHeading);
    const outliersList = document.createElement('ul');
    outliersList.className = 'dashboard-scatter-outliers-list';
    outliers.forEach(({ label, residual }) => {
      const li = document.createElement('li');
      li.className = 'dashboard-scatter-outliers-item';
      li.textContent = `${label} (${residual >= 0 ? '+' : ''}${residual.toFixed(2)})`;
      li.title = `Residual: ${residual.toFixed(4)}`;
      outliersList.appendChild(li);
    });
    scatterStatsPanel.appendChild(outliersList);
  }

  let scatterChart = null;
  function refreshScatter() {
    const points = buildScatterPoints();
    const sel = parseYAxisValue(yAxisSelect.value);
    const yTitle = sel.mode === 'all' ? 'Avg competency rank' : sel.mode === 'category' ? `Avg rank: ${sel.category}` : `${sel.category} › ${sel.skill}`;
    if (scatterChart) scatterChart.destroy();
    if (points.length) {
      scatterChart = createScatter(canvas, {
        points,
        showTrendline: true,
        showR2: true,
        xTitle: 'Years of experience',
        yTitle,
      });
    }
    updateScatterStatsPanel(points, yTitle);
  }
  refreshScatter();
  yAxisSelect.addEventListener('change', refreshScatter);

  refreshFns.push(refreshScatter);

  // Chart 2: Rank by person — two bar charts (Managers | Staff), same Y-axis dropdown
  const chart2Section = document.createElement('section');
  chart2Section.className = 'dashboard-chart2-section';
  chart2Section.setAttribute('aria-label', 'Rank by person');
  const chart2Heading = document.createElement('h3');
  chart2Heading.className = 'type-display-3';
  chart2Heading.textContent = 'Rank by person';
  chart2Section.appendChild(chart2Heading);

  const chart2YAxisSelect = document.createElement('select');
  chart2YAxisSelect.className = 'dashboard-scatter-select type-body';
  chart2YAxisSelect.setAttribute('aria-label', 'Y-axis data');
  const c2OptgroupOverall = document.createElement('optgroup');
  c2OptgroupOverall.label = 'Overall';
  const c2OptAll = document.createElement('option');
  c2OptAll.value = 'all';
  c2OptAll.textContent = 'All Averages';
  c2OptgroupOverall.appendChild(c2OptAll);
  chart2YAxisSelect.appendChild(c2OptgroupOverall);
  const c2OptgroupCategory = document.createElement('optgroup');
  c2OptgroupCategory.label = 'Category average';
  categoriesList.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = `cat:${cat}`;
    opt.textContent = cat;
    c2OptgroupCategory.appendChild(opt);
  });
  chart2YAxisSelect.appendChild(c2OptgroupCategory);
  const c2OptgroupCompetency = document.createElement('optgroup');
  c2OptgroupCompetency.label = 'Competency (raw)';
  categoriesList.forEach((cat) => {
    getSkillsInCategory(cat).forEach((skill) => {
      const opt = document.createElement('option');
      opt.value = `skill:${cat}|${skill}`;
      opt.textContent = `${cat} › ${skill}`;
      c2OptgroupCompetency.appendChild(opt);
    });
  });
  chart2YAxisSelect.appendChild(c2OptgroupCompetency);

  const chart2Controls = document.createElement('div');
  chart2Controls.className = 'dashboard-scatter-controls';
  chart2Controls.appendChild(chart2YAxisSelect);
  chart2Section.appendChild(chart2Controls);

  const chart2Grid = document.createElement('div');
  chart2Grid.className = 'dashboard-chart2-grid';
  const managerCard = document.createElement('div');
  managerCard.className = 'dashboard-chart2-card';
  const managerTitle = document.createElement('h4');
  managerTitle.className = 'type-heading-4';
  managerTitle.textContent = 'Managers';
  managerCard.appendChild(managerTitle);
  const managerChartWrap = document.createElement('div');
  managerChartWrap.className = 'dashboard-chart2-chart';
  managerChartWrap.style.height = '280px';
  const managerCanvas = document.createElement('canvas');
  managerChartWrap.appendChild(managerCanvas);
  managerCard.appendChild(managerChartWrap);
  chart2Grid.appendChild(managerCard);

  const staffCard = document.createElement('div');
  staffCard.className = 'dashboard-chart2-card';
  const staffTitle = document.createElement('h4');
  staffTitle.className = 'type-heading-4';
  staffTitle.textContent = 'Staff';
  staffCard.appendChild(staffTitle);
  const staffChartWrap = document.createElement('div');
  staffChartWrap.className = 'dashboard-chart2-chart';
  staffChartWrap.style.height = '280px';
  const staffCanvas = document.createElement('canvas');
  staffChartWrap.appendChild(staffCanvas);
  staffCard.appendChild(staffChartWrap);
  chart2Grid.appendChild(staffCard);
  chart2Section.appendChild(chart2Grid);
  container.appendChild(chart2Section);

  function getRankForPerson(personId, { mode, category, skill }) {
    if (mode === 'all') {
      const list = getPersonAverageScores({});
      const r = list.find((x) => x.personId === personId);
      return r?.average ?? null;
    }
    if (mode === 'category' && category) {
      const entries = (getScoresForPerson(personId) ?? []).filter((e) => e.category === category);
      if (!entries.length) return null;
      const sum = entries.reduce((a, e) => a + e.score, 0);
      return Math.round((sum / entries.length) * 100) / 100;
    }
    if (mode === 'competency' && category && skill) {
      const score = getScore(personId, category, skill);
      return score ?? null;
    }
    return null;
  }

  function buildChart2Data(role) {
    const personIds = [...getPersonIdsForRoles([role])];
    const sel = parseYAxisValue(chart2YAxisSelect.value);
    const rows = personIds
      .map((personId) => {
        const person = getPersonById(personId);
        const rank = getRankForPerson(personId, sel);
        if (rank == null) return null;
        return { label: person?.name ?? personId, value: rank };
      })
      .filter(Boolean);
    rows.sort((a, b) => a.value - b.value);
    const vals = rows.map((r) => r.value);
    const n = vals.length;
    const average = n ? vals.reduce((s, v) => s + v, 0) / n : 0;
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = n >> 1;
    const median = n ? (n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2) : 0;
    const freq = new Map();
    vals.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
    let maxCount = 0;
    let mode = null;
    freq.forEach((count, v) => {
      if (count > maxCount) {
        maxCount = count;
        mode = v;
      }
    });
    const variance = n > 1 ? vals.reduce((s, v) => s + (v - average) ** 2, 0) / n : 0;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = average !== 0 ? (standardDeviation / average) * 100 : null;
    return {
      labels: rows.map((r) => r.label),
      values: vals,
      stats: { average, median, mode: mode ?? average },
      variance,
      standardDeviation,
      coefficientOfVariation,
    };
  }

  function formatChart2Stats(data) {
    const cv = data.coefficientOfVariation != null ? `${data.coefficientOfVariation.toFixed(2)}%` : '—';
    return [
      `Standard Deviation: <strong>${data.standardDeviation.toFixed(4)}</strong>`,
      `Variance: <strong>${data.variance.toFixed(4)}</strong>`,
      `Coefficient of Variation: <strong>${cv}</strong>`,
      `Average: <strong>${data.stats.average.toFixed(2)}</strong>`,
      `Median: <strong>${data.stats.median.toFixed(2)}</strong>`,
      `Mode: <strong>${data.stats.mode.toFixed(2)}</strong>`,
    ].join(' &nbsp; ');
  }

  let managerBarChart = null;
  let staffBarChart = null;
  let managerStatsEl = null;
  let staffStatsEl = null;
  function refreshChart2() {
    if (managerBarChart) {
      managerBarChart.destroy();
      managerBarChart = null;
    }
    if (staffBarChart) {
      staffBarChart.destroy();
      staffBarChart = null;
    }
    const managerData = buildChart2Data('Manager');
    const staffData = buildChart2Data('Staff');
    if (managerData.labels.length) {
      managerBarChart = createPersonRankBar(managerCanvas, {
        labels: managerData.labels,
        values: managerData.values,
        stats: managerData.stats,
      });
      if (managerStatsEl) managerStatsEl.remove();
      managerStatsEl = document.createElement('div');
      managerStatsEl.className = 'dashboard-chart2-stats';
      managerStatsEl.setAttribute('aria-label', 'Statistics');
      managerStatsEl.innerHTML = formatChart2Stats(managerData);
      managerCard.appendChild(managerStatsEl);
    } else {
      if (managerStatsEl) {
        managerStatsEl.remove();
        managerStatsEl = null;
      }
    }
    if (staffData.labels.length) {
      staffBarChart = createPersonRankBar(staffCanvas, {
        labels: staffData.labels,
        values: staffData.values,
        stats: staffData.stats,
      });
      if (staffStatsEl) staffStatsEl.remove();
      staffStatsEl = document.createElement('div');
      staffStatsEl.className = 'dashboard-chart2-stats';
      staffStatsEl.setAttribute('aria-label', 'Statistics');
      staffStatsEl.innerHTML = formatChart2Stats(staffData);
      staffCard.appendChild(staffStatsEl);
    } else {
      if (staffStatsEl) {
        staffStatsEl.remove();
        staffStatsEl = null;
      }
    }
  }
  chart2YAxisSelect.addEventListener('change', refreshChart2);
  refreshChart2();
}
