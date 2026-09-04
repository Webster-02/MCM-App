(() => {
  const init = () => {
    const app = document.querySelector('.app');
    const side = app?.querySelector('.side, .sidebar');
    const top = app?.querySelector('.top, .topbar');
    if (!app || !side || !top || document.querySelector('.mcm-mobile-menu')) return;

    const menuButton = document.createElement('button');
    menuButton.className = 'mcm-mobile-menu';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-label', 'Open navigation');
    menuButton.innerHTML = '<i class="ti ti-menu-2"></i>';
    top.prepend(menuButton);

    const overlay = document.createElement('div');
    overlay.className = 'mcm-mobile-overlay';
    document.body.appendChild(overlay);

    const closeDrawer = () => {
      side.classList.remove('mcm-drawer-open');
      overlay.classList.remove('mcm-overlay-open');
      menuButton.setAttribute('aria-label', 'Open navigation');
    };
    const openDrawer = () => {
      side.classList.add('mcm-drawer-open');
      overlay.classList.add('mcm-overlay-open');
      menuButton.setAttribute('aria-label', 'Close navigation');
    };
    menuButton.addEventListener('click', () => side.classList.contains('mcm-drawer-open') ? closeDrawer() : openDrawer());
    overlay.addEventListener('click', closeDrawer);
    side.addEventListener('click', (event) => { if (event.target.closest('[data-section], #logout, .danger')) closeDrawer(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDrawer(); });

    const sourceButtons = [...side.querySelectorAll('[data-section]')];
    if (!sourceButtons.length || document.querySelector('.mcm-mobile-bottom-nav')) return;
    const preferred = [['home','Home','ti-home-2'],['courses','Courses','ti-book-2'],['notes','Notes','ti-notebook'],['discussions','Discussions','ti-message-circle-2'],['profile','Profile','ti-user']];
    const findSource = (key) => sourceButtons.find((button) => `${button.dataset.section || ''} ${button.textContent || ''}`.toLowerCase().includes(key));
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'mcm-mobile-bottom-nav';
    bottomNav.setAttribute('aria-label', 'Mobile navigation');
    preferred.forEach(([key, label, icon]) => {
      const source = findSource(key);
      if (!source) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mcm-mobile-bottom-item';
      button.innerHTML = `<i class="ti ${icon}"></i><span>${label}</span>`;
      button.addEventListener('click', () => source.click());
      bottomNav.appendChild(button);
    });
    if (bottomNav.children.length) document.body.appendChild(bottomNav);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
