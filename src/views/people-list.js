/**
 * People list view: all personnel from CSV. Names link to person profile, directors link to director profile.
 */
import { getAllPeople } from '../data/personnel.js';
import { getDirectorIdByName } from '../data/directors.js';

/**
 * @param {HTMLElement} container
 */
export function render(container) {
  const people = getAllPeople();
  container.innerHTML = '';
  container.className = 'page-content';

  const title = document.createElement('h2');
  title.className = 'type-heading-1';
  title.textContent = 'People';
  container.appendChild(title);

  const table = document.createElement('table');
  table.className = 'data-table';
  table.setAttribute('role', 'grid');
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="type-table-header">Name</th>
      <th class="type-table-header">Director</th>
      <th class="type-table-header">Role</th>
      <th class="type-table-header">Location</th>
    </tr>
  `;
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for (const p of people) {
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.className = 'type-table-cell';
    const nameLink = document.createElement('a');
    nameLink.href = `#/person/${p.id}`;
    nameLink.className = 'person-link type-table-cell';
    nameLink.textContent = p.name;
    nameCell.appendChild(nameLink);
    tr.appendChild(nameCell);
    tr.appendChild(createDirectorCell(p.director));
    tr.appendChild(createCell(p.role));
    tr.appendChild(createCell(p.location));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

/**
 * @param {string} text
 * @returns {HTMLTableCellElement}
 */
function createCell(text) {
  const td = document.createElement('td');
  td.className = 'type-table-cell';
  td.textContent = text || '—';
  return td;
}

/**
 * Director cell: link to director profile when we have a matching director id.
 * @param {string} directorName
 * @returns {HTMLTableCellElement}
 */
function createDirectorCell(directorName) {
  const td = document.createElement('td');
  td.className = 'type-table-cell';
  if (!directorName?.trim()) {
    td.textContent = '—';
    return td;
  }
  const directorId = getDirectorIdByName(directorName);
  if (directorId) {
    const link = document.createElement('a');
    link.href = `#/director/${directorId}`;
    link.className = 'person-link type-table-cell';
    link.textContent = directorName;
    td.appendChild(link);
  } else {
    td.textContent = directorName;
  }
  return td;
}
