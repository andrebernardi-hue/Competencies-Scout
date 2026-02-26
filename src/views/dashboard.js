/**
 * Dashboard: home page.
 */
export function render(container) {
  container.innerHTML = '';
  container.className = 'page-content';

  const title = document.createElement('h2');
  title.className = 'type-display-2';
  title.textContent = 'Dashboard';
  container.appendChild(title);

  const p = document.createElement('p');
  p.className = 'type-body';
  p.style.marginTop = 'var(--space-4)';
  p.textContent = 'Welcome to Competencies Scout. Use the menu to open People or Competencies.';
  container.appendChild(p);
}
