/**
 * Director profile: name and list of people who report to them.
 */
import { getDirectorById, getReportsToDirector } from '../data/directors.js';

/**
 * @param {HTMLElement} container
 * @param {string} directorId - Slug
 */
export function render(container, directorId) {
  const director = getDirectorById(directorId);
  container.innerHTML = '';
  container.className = 'page-content';

  if (!director) {
    const p = document.createElement('p');
    p.className = 'type-body';
    p.textContent = 'Director not found.';
    container.appendChild(p);
    return;
  }

  const back = document.createElement('a');
  back.href = '#/';
  back.className = 'type-body-sm';
  back.textContent = '← Back to people';
  back.style.display = 'inline-block';
  back.style.marginBottom = 'var(--space-4)';
  container.appendChild(back);

  const title = document.createElement('h2');
  title.className = 'type-display-2';
  title.textContent = director.name;
  container.appendChild(title);

  const sub = document.createElement('p');
  sub.className = 'type-body type-body-sm';
  sub.style.marginTop = 'var(--space-2)';
  sub.style.color = 'var(--color-text-secondary)';
  sub.textContent = 'Director';
  container.appendChild(sub);

  const reports = getReportsToDirector(directorId);
  const reportsTitle = document.createElement('h3');
  reportsTitle.className = 'type-heading-3';
  reportsTitle.style.marginTop = 'var(--space-6)';
  reportsTitle.textContent = `Reports (${reports.length})`;
  container.appendChild(reportsTitle);

  if (reports.length === 0) {
    const p = document.createElement('p');
    p.className = 'type-body';
    p.textContent = 'No direct reports.';
    container.appendChild(p);
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';
  table.setAttribute('role', 'grid');
  table.innerHTML = `
    <thead>
      <tr>
        <th class="type-table-header">Name</th>
        <th class="type-table-header">Role</th>
        <th class="type-table-header">Location</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  for (const p of reports) {
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.className = 'type-table-cell';
    const link = document.createElement('a');
    link.href = `#/person/${p.id}`;
    link.className = 'person-link type-table-cell';
    link.textContent = p.name;
    nameCell.appendChild(link);
    tr.appendChild(nameCell);
    tr.appendChild(createCell(p.role));
    tr.appendChild(createCell(p.location));
    tbody.appendChild(tr);
  }
  container.appendChild(table);
}

function createCell(text) {
  const td = document.createElement('td');
  td.className = 'type-table-cell';
  td.textContent = text || '—';
  return td;
}
