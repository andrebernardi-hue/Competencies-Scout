/**
 * Person profile view: single person's info from personnel CSV + competency scores.
 */
import { getPersonById } from '../data/personnel.js';
import { getDirectorIdByName } from '../data/directors.js';
import { getScoresForPerson, getCategories } from '../data/competencies.js';

/**
 * @param {HTMLElement} container
 * @param {string} personId - Slug (id)
 */
export function render(container, personId) {
  const person = getPersonById(personId);
  container.innerHTML = '';
  container.className = 'page-content drawer-profile';

  if (!person) {
    const p = document.createElement('p');
    p.className = 'type-body';
    p.textContent = 'Person not found.';
    container.appendChild(p);
    return;
  }

  const header = document.createElement('div');
  header.className = 'drawer-profile__header';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'drawer-profile__close btn type-button-sm';
  closeBtn.setAttribute('aria-label', 'Close profile');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
    const returnHash = document.body.dataset.drawerReturnHash || '#/people';
    window.location.hash = returnHash;
  });
  header.appendChild(closeBtn);
  container.appendChild(header);

  const title = document.createElement('h2');
  title.className = 'type-display-2';
  title.textContent = person.name;
  container.appendChild(title);

  const dl = document.createElement('dl');
  dl.className = 'profile-details';
  const directorId = getDirectorIdByName(person.director);
  const directorValue = person.director
    ? directorId
      ? (() => {
          const a = document.createElement('a');
          a.href = `#/director/${directorId}`;
          a.className = 'person-link';
          a.textContent = person.director;
          return a;
        })()
      : document.createTextNode(person.director)
    : document.createTextNode('—');
  const fields = [
    ['Director', directorValue],
    ['Location', person.location],
    ['Role', person.role],
    ['Years of Experience', person.yearsOfExperience],
  ];
  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.className = 'type-label';
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.className = 'type-body';
    if (typeof value === 'string') {
      dd.textContent = value || '—';
    } else {
      dd.appendChild(value);
    }
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
  container.appendChild(dl);

  const scores = getScoresForPerson(personId);
  if (scores.length) {
    const scoresSection = document.createElement('section');
    scoresSection.className = 'profile-competencies';
    const scoresTitle = document.createElement('h3');
    scoresTitle.className = 'type-heading-3';
    scoresTitle.textContent = 'Competency scores (1–4)';
    scoresSection.appendChild(scoresTitle);
    const byCategory = groupScoresByCategory(scores);
    const categoryOrder = getCategories();
    for (const cat of categoryOrder) {
      const skills = byCategory.get(cat);
      if (!skills?.length) continue;
      const catHeading = document.createElement('h4');
      catHeading.className = 'type-heading-4';
      catHeading.textContent = cat;
      scoresSection.appendChild(catHeading);
      const table = document.createElement('table');
      table.className = 'data-table profile-scores-table';
      table.innerHTML = '<thead><tr><th class="type-table-header">Skill</th><th class="type-table-header">Score</th></tr></thead><tbody></tbody>';
      const tbody = table.querySelector('tbody');
      for (const { skill, score } of skills) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="type-table-cell">${escapeHtml(skill)}</td><td class="type-table-cell">${score}</td>`;
        tbody.appendChild(tr);
      }
      scoresSection.appendChild(table);
    }
    container.appendChild(scoresSection);
  }

  const idNote = document.createElement('p');
  idNote.className = 'type-caption';
  idNote.textContent = `ID for matching with other data: ${person.id}`;
  container.appendChild(idNote);
}

/**
 * @param {import('../data/competencies.js').ScoreEntry[]} scores
 * @returns {Map<string, { skill: string, score: number }[]>}
 */
function groupScoresByCategory(scores) {
  const map = new Map();
  for (const { category, skill, score } of scores) {
    const list = map.get(category) ?? [];
    list.push({ skill, score });
    map.set(category, list);
  }
  return map;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
