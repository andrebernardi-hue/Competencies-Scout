/**
 * Hash-based router: #/dashboard, #/people, #/competencies, #/person/:id (overlay drawer), #/director/:id.
 * Opening a profile overlays the drawer on top of current content; main content is not re-rendered.
 */
import { render as renderDashboard } from './views/dashboard.js';
import { render as renderPeopleList } from './views/people-list.js';
import { render as renderCompetencies } from './views/competencies.js';
import { render as renderPersonProfile } from './views/person-profile.js';
import { render as renderDirectorProfile } from './views/director-profile.js';
import { render as renderDesignSystem } from './views/design-system.js';

/**
 * @param {{ mainContent: HTMLElement, drawerContent: HTMLElement, body: HTMLElement }} targets
 */
export function init(targets) {
  const { mainContent, drawerContent, body } = targets;
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const navLinks = document.querySelectorAll('.app-nav__link');
  const pageTitleEl = document.getElementById('page-title');

  const TAB_LABELS = {
    dashboard: 'Dashboard',
    people: 'People',
    competencies: 'Competencies',
    'design-system': 'Design System',
  };

  function setNavCurrent(path) {
    const current = path === 'dashboard' || path === '' ? 'dashboard' : path === 'people' || path === 'person' ? 'people' : path === 'competencies' ? 'competencies' : path === 'design-system' ? 'design-system' : null;
    navLinks.forEach((a) => {
      const linkPath = a.getAttribute('data-nav');
      a.classList.toggle('nav-current', linkPath === current);
      a.setAttribute('aria-current', linkPath === current ? 'page' : null);
    });
    if (pageTitleEl) {
      pageTitleEl.textContent = TAB_LABELS[current] ?? 'Dashboard';
    }
  }

  function closeDrawer() {
    const returnHash = document.body.dataset.drawerReturnHash || '#/people';
    window.location.hash = returnHash;
  }

  function openDrawer(personId) {
    if (!document.body.dataset.drawerReturnHash) {
      document.body.dataset.drawerReturnHash = '#/people';
    }
    renderPersonProfile(drawerContent, personId);
    if (drawer) {
      drawer.removeAttribute('hidden');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (backdrop) {
      backdrop.removeAttribute('hidden');
      backdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function hideDrawer() {
    drawerContent.innerHTML = '';
    if (drawer) {
      drawer.setAttribute('hidden', '');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) {
      backdrop.setAttribute('hidden', '');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  }

  function handleRoute() {
    let hash = window.location.hash.slice(1) || '/';
    if (hash === '/') hash = 'dashboard';
    const [path, ...rest] = hash.split('/').filter(Boolean);

    if (path === 'person' && rest.length) {
      setNavCurrent('people');
      openDrawer(rest[0]);
      /* do not re-render main – overlay on top of current view */
    } else {
      hideDrawer();
      if (path === 'director' && rest.length) {
        document.body.dataset.drawerReturnHash = '#/director/' + rest[0];
        setNavCurrent(null);
        renderDirectorProfile(mainContent, rest[0]);
      } else if (path === 'people') {
        document.body.dataset.drawerReturnHash = '#/people';
        setNavCurrent('people');
        renderPeopleList(mainContent);
      } else if (path === 'competencies') {
        document.body.dataset.drawerReturnHash = '#/competencies';
        setNavCurrent('competencies');
        renderCompetencies(mainContent);
      } else if (path === 'design-system') {
        document.body.dataset.drawerReturnHash = '#/design-system' + (rest.length ? '/' + rest[0] : '');
        setNavCurrent('design-system');
        renderDesignSystem(mainContent, rest[0] || '');
      } else {
        document.body.dataset.drawerReturnHash = '#/dashboard';
        setNavCurrent('dashboard');
        renderDashboard(mainContent);
      }
    }
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
