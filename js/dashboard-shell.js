// Shared dashboard navigation, identity and logout helpers.
import { getCurrentUser, signOut, ROLE_PAGES } from '../auth.js';

export function initDashboardShell({ allowedRoles = [], activeRole = '' } = {}) {
  const user = getCurrentUser();
  if (!user || (allowedRoles.length && !allowedRoles.includes(user.role))) return null;

  const displayName = user.name || user.email || 'MCM User';
  const displayRole = String(user.role || activeRole || '').toUpperCase();

  document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = displayName; });
  document.querySelectorAll('[data-user-role]').forEach((el) => { el.textContent = displayRole; });
  document.querySelectorAll('[data-user-email]').forEach((el) => { el.textContent = user.email || ''; });

  // Support existing dashboard headers that do not yet use data attributes.
  document.querySelectorAll('.topinfo small, .profile-subtitle').forEach((el) => {
    if (!el.dataset.shellBound) {
      el.textContent = `${displayRole} · ${displayName}`;
      el.dataset.shellBound = 'true';
    }
  });

  document.querySelectorAll('[data-action="logout"], #logout, [data-logout]').forEach((button) => {
    if (button.dataset.shellBound) return;
    button.dataset.shellBound = 'true';
    button.addEventListener('click', () => signOut());
  });

  document.querySelectorAll('[data-nav-role]').forEach((link) => {
    const page = ROLE_PAGES[link.dataset.navRole];
    if (page) link.href = page;
  });

  document.querySelectorAll('[data-menu-toggle]').forEach((button) => {
    if (button.dataset.shellBound) return;
    const target = document.querySelector(button.dataset.menuToggle || '[data-sidebar]');
    if (!target) return;
    button.dataset.shellBound = 'true';
    button.addEventListener('click', () => {
      const open = target.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  document.documentElement.dataset.activeRole = activeRole || user.role || '';
  return user;
}
