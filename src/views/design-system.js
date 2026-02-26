/**
 * Design System page: in-app access to tokens and components (same as Storybook).
 * Sub-rail menu to navigate between Type ramp, Colors, Button, Data table.
 */

const SECTIONS = [
  { id: '', label: 'Overview' },
  { id: 'type-ramp', label: 'Type ramp' },
  { id: 'colors', label: 'Colors' },
  { id: 'button', label: 'Button' },
  { id: 'data-table', label: 'Data table' },
];

/**
 * @param {HTMLElement} container - main-content
 * @param {string} [sectionId] - '' | 'type-ramp' | 'colors' | 'button' | 'data-table'
 */
export function render(container, sectionId = '') {
  container.innerHTML = '';
  container.className = '';

  const layout = document.createElement('div');
  layout.className = 'design-system-layout';

  const subNav = document.createElement('nav');
  subNav.className = 'design-system-nav';
  subNav.setAttribute('aria-label', 'Design system sections');
  for (const s of SECTIONS) {
    const a = document.createElement('a');
    a.href = s.id ? `#/design-system/${s.id}` : '#/design-system';
    a.className = 'design-system-nav__link';
    a.textContent = s.label;
    if ((!sectionId && !s.id) || sectionId === s.id) {
      a.classList.add('design-system-nav__link--current');
      a.setAttribute('aria-current', 'page');
    }
    subNav.appendChild(a);
  }
  layout.appendChild(subNav);

  const content = document.createElement('div');
  content.className = 'design-system-content page-content';
  const section = sectionId || 'overview';
  content.appendChild(renderSection(section));
  layout.appendChild(content);

  container.appendChild(layout);
}

/**
 * @param {string} section
 * @returns {HTMLElement}
 */
function renderSection(section) {
  const wrap = document.createElement('div');
  wrap.className = 'design-system-section';
  if (section === 'overview') {
    wrap.innerHTML = `
      <h2 class="type-display-2">Design System</h2>
      <p class="type-body" style="margin-top: var(--space-4);">Use the left menu to browse tokens and components. These match the styles used in Storybook.</p>
      <ul class="type-body" style="margin-top: var(--space-4);">
        <li><a href="#/design-system/type-ramp" class="person-link">Type ramp</a> – 16 semantic text styles</li>
        <li><a href="#/design-system/colors" class="person-link">Colors</a> – grays and accent</li>
        <li><a href="#/design-system/button" class="person-link">Button</a> – default, primary, sizes</li>
        <li><a href="#/design-system/data-table" class="person-link">Data table</a> – zebra rows</li>
      </ul>
    `;
    return wrap;
  }
  if (section === 'type-ramp') {
    const title = document.createElement('h2');
    title.className = 'type-display-2';
    title.textContent = 'Type ramp';
    wrap.appendChild(title);
    const styles = [
      'type-display-1', 'type-display-2', 'type-heading-1', 'type-heading-2', 'type-heading-3', 'type-heading-4',
      'type-body-lg', 'type-body', 'type-body-sm', 'type-caption', 'type-label', 'type-overline',
      'type-code', 'type-table-header', 'type-table-cell', 'type-button',
    ];
    const list = document.createElement('div');
    list.style.marginTop = 'var(--space-4)';
    styles.forEach((s) => {
      const p = document.createElement('p');
      p.className = s;
      p.style.margin = '0 0 0.5rem 0';
      p.textContent = `${s}: The quick brown fox`;
      list.appendChild(p);
    });
    wrap.appendChild(list);
    return wrap;
  }
  if (section === 'colors') {
    const title = document.createElement('h2');
    title.className = 'type-display-2';
    title.textContent = 'Colors';
    wrap.appendChild(title);
    const sub = document.createElement('h3');
    sub.className = 'type-heading-3';
    sub.style.marginTop = 'var(--space-6)';
    sub.textContent = 'Grays';
    wrap.appendChild(sub);
    const grays = document.createElement('div');
    grays.className = 'design-system-swatches';
    ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].forEach((n) => {
      const swatch = document.createElement('div');
      swatch.className = 'design-system-swatch';
      swatch.style.background = `var(--color-gray-${n})`;
      swatch.title = `--color-gray-${n}`;
      grays.appendChild(swatch);
    });
    wrap.appendChild(grays);
    const sub2 = document.createElement('h3');
    sub2.className = 'type-heading-3';
    sub2.style.marginTop = 'var(--space-6)';
    sub2.textContent = 'Accent';
    wrap.appendChild(sub2);
    const accents = document.createElement('div');
    accents.className = 'design-system-swatches';
    ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].forEach((n) => {
      const swatch = document.createElement('div');
      swatch.className = 'design-system-swatch';
      swatch.style.background = `var(--color-accent-${n})`;
      swatch.title = `--color-accent-${n}`;
      accents.appendChild(swatch);
    });
    wrap.appendChild(accents);
    return wrap;
  }
  if (section === 'button') {
    const title = document.createElement('h2');
    title.className = 'type-display-2';
    title.textContent = 'Button';
    wrap.appendChild(title);
    const defaultBtn = document.createElement('button');
    defaultBtn.type = 'button';
    defaultBtn.className = 'btn type-button';
    defaultBtn.textContent = 'Default';
    wrap.appendChild(defaultBtn);
    const primaryBtn = document.createElement('button');
    primaryBtn.type = 'button';
    primaryBtn.className = 'btn btn--primary type-button';
    primaryBtn.style.marginLeft = 'var(--space-2)';
    primaryBtn.textContent = 'Primary';
    wrap.appendChild(primaryBtn);
    const sizesTitle = document.createElement('h3');
    sizesTitle.className = 'type-heading-3';
    sizesTitle.style.marginTop = 'var(--space-6)';
    sizesTitle.textContent = 'Sizes';
    wrap.appendChild(sizesTitle);
    const sizesWrap = document.createElement('div');
    sizesWrap.style.display = 'flex';
    sizesWrap.style.gap = 'var(--space-2)';
    sizesWrap.style.marginTop = 'var(--space-2)';
    sizesWrap.style.alignItems = 'center';
    ['btn--sm', '', 'btn--lg'].forEach((mod) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `btn type-button ${mod}`.trim();
      b.textContent = mod ? (mod === 'btn--sm' ? 'Small' : 'Large') : 'Medium';
      sizesWrap.appendChild(b);
    });
    wrap.appendChild(sizesWrap);
    return wrap;
  }
  if (section === 'data-table') {
    const title = document.createElement('h2');
    title.className = 'type-display-2';
    title.textContent = 'Data table';
    wrap.appendChild(title);
    const table = document.createElement('table');
    table.className = 'data-table';
    table.setAttribute('role', 'grid');
    table.innerHTML = `
      <thead>
        <tr>
          <th class="type-table-header" data-sortable>Name</th>
          <th class="type-table-header" data-sortable>Role</th>
          <th class="type-table-header">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="type-table-cell">Alice</td>
          <td class="type-table-cell">Analyst</td>
          <td class="type-table-cell">92</td>
        </tr>
        <tr>
          <td class="type-table-cell">Bob</td>
          <td class="type-table-cell">Developer</td>
          <td class="type-table-cell">88</td>
        </tr>
        <tr>
          <td class="type-table-cell">Carol</td>
          <td class="type-table-cell">Designer</td>
          <td class="type-table-cell">95</td>
        </tr>
      </tbody>
    `;
    wrap.appendChild(table);
    return wrap;
  }
  wrap.textContent = 'Section not found.';
  return wrap;
}
