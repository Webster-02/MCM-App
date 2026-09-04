// Shared dashboard navigation, identity and logout helpers.
import { getCurrentUser, signOut, ROLE_PAGES } from '../auth.js';

export function initDashboardShell({ allowedRoles = [], activeRole = '' } = {}) {
  const user = getCurrentUser();
  if (!user || (allowedRoles.length && !allowedRoles.includes(user.role))) return null;

  document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = user.name || user.email || 'MCM User'; });
  document.querySelectorAll('[data-user-role]').forEach((el) => { el.textContent = String(user.role || '').toUpperCase(); });
  document.querySelectorAll('[data-user-email]').forEach((el) => { el.textContent = user.email || ''; });

  document.querySelectorAll('[data-action="logout"], #logout, [data-logout]').forEach((button) => {
    button.addEventListener('click', () => signOut());
  });

  document.querySelectorAll('[data-nav-role]').forEach((link) => {
    const page = ROLE_PAGES[link.dataset.navRole];
    if (page) link.href = page;
  });

  document.querySelectorAll('[data-menu-toggle]').forEach((button) => {
    const target = document.querySelector(button.dataset.menuToggle || '[data-sidebar]');
    if (!target) return;
    button.addEventListener('click', () => {
      const open = target.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  document.documentElement.dataset.activeRole = activeRole || user.role || '';
  return user;
}
