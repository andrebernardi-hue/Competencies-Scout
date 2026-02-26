/**
 * Competencies: one table per skill (category > skill). 50% width each, 2 columns.
 * Each table: Person, Rank, Role; sortable headers; scroll inside table container.
 */
import { getCategories, getSkillsInCategory, getScoresForSkill } from '../data/competencies.js';
import { getPersonById } from '../data/personnel.js';

export function render(container) {
  container.innerHTML = '';
  container.className = 'page-content competencies-page';

  const title = document.createElement('h2');
  title.className = 'type-heading-1';
  title.textContent = 'Competencies';
  container.appendChild(title);

  const categories = getCategories();
  if (!categories.length) {
    const p = document.createElement('p');
    p.className = 'type-body';
    p.textContent = 'No competency data loaded.';
    container.appendChild(p);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'competencies-grid';
  container.appendChild(grid);

  for (const category of categories) {
    const skills = getSkillsInCategory(category);
    for (const skill of skills) {
      const card = createSkillCard(category, skill);
      grid.appendChild(card);
    }
  }
}

/**
 * @param {string} category
 * @param {string} skill
 * @returns {HTMLElement}
 */
function createSkillCard(category, skill) {
  const card = document.createElement('div');
  card.className = 'competencies-card';
  const heading = document.createElement('h3');
  heading.className = 'type-heading-4 competencies-card__title';
  heading.textContent = skill;
  heading.title = `${category} › ${skill}`;
  card.appendChild(heading);

  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'competencies-card__scroll';
  const table = document.createElement('table');
  table.className = 'data-table competencies-table';
  table.setAttribute('role', 'grid');
  const personScores = getScoresForSkill(category, skill);
  const rows = personScores.map(({ personId, score }) => {
    const person = getPersonById(personId);
    return {
      name: person?.name ?? personId,
      personId,
      score,
      role: person?.role ?? '—',
    };
  });

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr></tr>';
  const headerRow = thead.querySelector('tr');
  for (const { key, label } of [
    { key: 'name', label: 'Person' },
    { key: 'score', label: 'Rank' },
    { key: 'role', label: 'Role' },
  ]) {
    const th = document.createElement('th');
    th.className = 'type-table-header';
    th.setAttribute('data-sortable', '');
    th.dataset.sortKey = key;
    const wrap = document.createElement('span');
    wrap.className = 'th-sort-content';
    wrap.appendChild(document.createTextNode(label));
    wrap.appendChild(createSortIcon());
    th.appendChild(wrap);
    headerRow.appendChild(th);
  }
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  for (const r of rows) {
    const tr = document.createElement('tr');
    tr.dataset.name = r.name;
    tr.dataset.score = String(r.score);
    tr.dataset.role = r.role;
    const nameCell = document.createElement('td');
    nameCell.className = 'type-table-cell';
    const link = document.createElement('a');
    link.href = `#/person/${r.personId}`;
    link.className = 'person-link type-table-cell';
    link.textContent = r.name;
    nameCell.appendChild(link);
    tr.appendChild(nameCell);
    tr.appendChild(createCell(String(r.score)));
    tr.appendChild(createCell(r.role));
    tbody.appendChild(tr);
  }
  scrollWrap.appendChild(table);
  card.appendChild(scrollWrap);

  const theads = table.querySelectorAll('th[data-sortable]');
  theads.forEach((th) => {
    th.addEventListener('click', () => sortTableBody(tbody, th.dataset.sortKey, th));
  });
  return card;
}

/** @returns {HTMLElement} */
function createSortIcon() {
  const span = document.createElement('span');
  span.className = 'sort-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `
    <svg class="sort-icon__svg" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path class="sort-icon__up" d="M4 6l4-4 4 4"/>
      <path class="sort-icon__down" d="M4 10l4 4 4-4"/>
    </svg>
  `;
  return span;
}

function createCell(text) {
  const td = document.createElement('td');
  td.className = 'type-table-cell';
  td.textContent = text;
  return td;
}

/**
 * Sort tbody by column; toggle asc/desc on same column. Update header aria-sort.
 * @param {HTMLTableSectionElement} tbody
 * @param {string} sortKey - 'name' | 'score' | 'role'
 * @param {HTMLTableCellElement} headerCell
 */
function sortTableBody(tbody, sortKey, headerCell) {
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const currentDir = headerCell.getAttribute('aria-sort');
  const nextDir = currentDir === 'ascending' ? 'descending' : 'ascending';
  const isNum = sortKey === 'score';
  rows.sort((a, b) => {
    const aVal = a.dataset[sortKey] ?? '';
    const bVal = b.dataset[sortKey] ?? '';
    if (isNum) {
      const an = Number(aVal);
      const bn = Number(bVal);
      return nextDir === 'ascending' ? an - bn : bn - an;
    }
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
    return nextDir === 'ascending' ? cmp : -cmp;
  });
  rows.forEach((r) => tbody.appendChild(r));
  headerCell.setAttribute('aria-sort', nextDir);
  tbody.closest('table')?.querySelectorAll('th[data-sortable]').forEach((th) => {
    const icon = th.querySelector('.sort-icon');
    if (th === headerCell) {
      th.classList.remove('sort-icon--asc', 'sort-icon--desc');
      th.classList.add(nextDir === 'ascending' ? 'sort-icon--asc' : 'sort-icon--desc');
      if (icon) icon.classList.add(nextDir === 'ascending' ? 'sort-icon--asc' : 'sort-icon--desc');
    } else {
      th.removeAttribute('aria-sort');
      th.classList.remove('sort-icon--asc', 'sort-icon--desc');
      if (icon) icon.classList.remove('sort-icon--asc', 'sort-icon--desc');
    }
  });
}
