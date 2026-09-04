(() => {
  const init = () => {
    const app = document.querySelector('.app');
    const side = app?.querySelector('.side, .sidebar');
    const top = app?.querySelector('.top, .topbar');
    if (!app || !side || !top || document.querySelector('.mcm-mobile-menu')) return;

    const button = document.createElement('button');
    button.className = 'mcm-mobile-menu';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open navigation');
    button.innerHTML = '<i class="ti ti-menu-2"></i>';
    top.prepend(button);

    const overlay = document.createElement('div');
    overlay.className = 'mcm-mobile-overlay';
    document.body.appendChild(overlay);

    const close = () => {
      side.classList.remove('mcm-drawer-open');
      overlay.classList.remove('mcm-overlay-open');
      button.setAttribute('aria-label', 'Open navigation');
    };
    const open = () => {
      side.classList.add('mcm-drawer-open');
      overlay.classList.add('mcm-overlay-open');
      button.setAttribute('aria-label', 'Close navigation');
    };
    button.addEventListener('click', () => side.classList.contains('mcm-drawer-open') ? close() : open());
    overlay.addEventListener('click', close);
    side.addEventListener('click', e => { if (e.target.closest('[data-section], #logout, .danger')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
