/**
 * Competency insights drawer: stats (avg, median, mode, SD, variance) and grouped bar charts per location and per director.
 */
import { getCategories, getSkillsInCategory, getScoresForSkill } from '../data/competencies.js';
import { getCompetencyDescription } from '../data/competency-descriptions.js';
import { getPersonById } from '../data/personnel.js';
import { createGroupedBar } from '../lib/charts.js';
import { slugify } from '../lib/slug.js';

/**
 * @param {HTMLElement} container
 * @param {string} categorySlug
 * @param {string} skillSlug
 */
export function render(container, categorySlug, skillSlug) {
  container.innerHTML = '';
  container.className = 'page-content drawer-profile';

  const categories = getCategories();
  const category = categories.find((c) => slugify(c) === categorySlug);
  const skill = category ? (getSkillsInCategory(category).find((s) => slugify(s) === skillSlug)) : null;

  if (!category || !skill) {
    const p = document.createElement('p');
    p.className = 'type-body';
    p.textContent = 'Competency not found.';
    container.appendChild(p);
    return;
  }

  const personScores = getScoresForSkill(category, skill);
  const scores = personScores.map(({ personId, score }) => {
    const person = getPersonById(personId);
    return {
      personId,
      score,
      location: (person?.location ?? '').trim() || '—',
      director: (person?.director ?? '').trim() || '—',
    };
  });
  const values = scores.map((s) => s.score);
  const n = values.length;

  const header = document.createElement('div');
  header.className = 'drawer-profile__header';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'drawer-profile__close btn type-button-sm';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
    const returnHash = document.body.dataset.drawerReturnHash || '#/competencies';
    window.location.hash = returnHash;
  });
  header.appendChild(closeBtn);
  container.appendChild(header);

  const title = document.createElement('h2');
  title.className = 'type-display-2';
  title.textContent = skill;
  container.appendChild(title);

  const description = getCompetencyDescription(skill);
  if (description) {
    const descBlock = document.createElement('div');
    descBlock.className = 'competency-insights__description';
    const descPara = document.createElement('p');
    descPara.className = 'type-body competency-insights__description-text';
    descPara.textContent = description;
    descBlock.appendChild(descPara);
    container.appendChild(descBlock);
  }

  if (n === 0) {
    const p = document.createElement('p');
    p.className = 'type-body';
    p.textContent = 'No scores for this competency.';
    container.appendChild(p);
    return;
  }

  const average = values.reduce((a, b) => a + b, 0) / n;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = n >> 1;
  const median = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const freq = new Map();
  values.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
  let maxCount = 0;
  let modeVal = values[0];
  freq.forEach((count, v) => {
    if (count > maxCount) {
      maxCount = count;
      modeVal = v;
    }
  });
  const variance = n > 1 ? values.reduce((s, v) => s + (v - average) ** 2, 0) / n : 0;
  const standardDeviation = Math.sqrt(variance);

  const statsSection = document.createElement('section');
  statsSection.className = 'competency-insights__section';
  statsSection.setAttribute('aria-label', 'Statistics');
  const statsHeading = document.createElement('h3');
  statsHeading.className = 'type-heading-4';
  statsHeading.textContent = 'Insights';
  statsSection.appendChild(statsHeading);
  const statsList = document.createElement('dl');
  statsList.className = 'competency-insights__stats';
  const statsPairs = [
    ['Average', average.toFixed(2)],
    ['Median', median.toFixed(2)],
    ['Mode', String(modeVal)],
    ['Standard Deviation', standardDeviation.toFixed(4)],
    ['Variance', variance.toFixed(4)],
  ];
  statsPairs.forEach(([term, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    statsList.appendChild(dt);
    statsList.appendChild(dd);
  });
  statsSection.appendChild(statsList);
  container.appendChild(statsSection);

  function modeOf(arr) {
    if (!arr.length) return 0;
    const f = new Map();
    arr.forEach((v) => f.set(v, (f.get(v) ?? 0) + 1));
    let max = 0;
    let out = arr[0];
    f.forEach((count, v) => {
      if (count > max) {
        max = count;
        out = v;
      }
    });
    return out;
  }

  function avgOf(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  const byLocation = new Map();
  const byDirector = new Map();
  scores.forEach(({ score, location, director }) => {
    if (!byLocation.has(location)) byLocation.set(location, []);
    byLocation.get(location).push(score);
    if (!byDirector.has(director)) byDirector.set(director, []);
    byDirector.get(director).push(score);
  });

  const locationLabels = [...byLocation.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const locationAvgs = locationLabels.map((loc) => avgOf(byLocation.get(loc)));
  const locationModes = locationLabels.map((loc) => modeOf(byLocation.get(loc)));

  const chartSectionLoc = document.createElement('section');
  chartSectionLoc.className = 'competency-insights__section';
  chartSectionLoc.setAttribute('aria-label', 'Ranks by location');
  const chartHeadingLoc = document.createElement('h3');
  chartHeadingLoc.className = 'type-heading-4';
  chartHeadingLoc.textContent = 'Average and Mode rank by Location';
  chartSectionLoc.appendChild(chartHeadingLoc);
  const chartWrapLoc = document.createElement('div');
  chartWrapLoc.className = 'competency-insights__chart';
  chartWrapLoc.style.height = '240px';
  const canvasLoc = document.createElement('canvas');
  chartWrapLoc.appendChild(canvasLoc);
  chartSectionLoc.appendChild(chartWrapLoc);
  container.appendChild(chartSectionLoc);

  if (locationLabels.length) {
    createGroupedBar(canvasLoc, {
      labels: locationLabels,
      datasets: [
        { label: 'Average', data: locationAvgs },
        { label: 'Mode', data: locationModes },
      ],
    });
  }

  const directorLabels = [...byDirector.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const directorAvgs = directorLabels.map((d) => avgOf(byDirector.get(d)));
  const directorModes = directorLabels.map((d) => modeOf(byDirector.get(d)));

  const chartSectionDir = document.createElement('section');
  chartSectionDir.className = 'competency-insights__section';
  chartSectionDir.setAttribute('aria-label', 'Ranks by director');
  const chartHeadingDir = document.createElement('h3');
  chartHeadingDir.className = 'type-heading-4';
  chartHeadingDir.textContent = 'Average and Mode rank by Director';
  chartSectionDir.appendChild(chartHeadingDir);
  const chartWrapDir = document.createElement('div');
  chartWrapDir.className = 'competency-insights__chart';
  chartWrapDir.style.height = '240px';
  const canvasDir = document.createElement('canvas');
  chartWrapDir.appendChild(canvasDir);
  chartSectionDir.appendChild(chartWrapDir);
  container.appendChild(chartSectionDir);

  if (directorLabels.length) {
    createGroupedBar(canvasDir, {
      labels: directorLabels,
      datasets: [
        { label: 'Average', data: directorAvgs },
        { label: 'Mode', data: directorModes },
      ],
    });
  }
}
