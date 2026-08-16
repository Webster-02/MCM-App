// MySVL — Shared dashboard utilities (toast, modals, sidebar, user init)

function toast(title, msg = '', type = 'info') {
  const icons = { success: 'ti-circle-check', error: 'ti-alert-circle', info: 'ti-info-circle', warning: 'ti-alert-triangle' };
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent)', warning: 'var(--amber)' };
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="ti ${icons[type]}" style="color:${colors[type]};font-size:20px;flex-shrink:0;"></i><div class="toast-body"><div class="toast-title">${title}</div>${msg ? `<div class="toast-msg">${msg}</div>` : ''}</div>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => el.remove(), 260);
  }, 3500);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function setupModalBackdrops() {
  document.querySelectorAll('.modal-backdrop').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('open');
    });
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

async function doLogout() {
  try {
    await window._logout();
  } catch {
    window.location.href = 'index.html';
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name) {
  return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function initDashboardUser(user, options = {}) {
  const {
    avatarIds = ['sidebarAvatar', 'topbarAvatar'],
    nameIds = ['sidebarName'],
    emailIds = [],
    welcomeId = null,
    welcomeSuffix = '',
    emoji = '👋'
  } = options;

  const initials = getInitials(user.name);
  avatarIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = initials;
  });
  nameIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = user.name;
  });
  emailIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = user.email;
  });
  if (welcomeId) {
    const el = document.getElementById(welcomeId);
    if (el) {
      const first = (user.name || '').split(' ')[0] || 'there';
      el.textContent = `${getGreeting()}, ${first}${welcomeSuffix || emoji}`;
    }
  }
}

function setupMobileMenu() {
  if (window.innerWidth >= 900) return;
  const left = document.querySelector('.topbar-left');
  const existing = document.getElementById('mobileMenuBtn');
  if (!left || existing) return;
  const btn = document.createElement('button');
  btn.className = 'topbar-btn';
  btn.id = 'mobileMenuBtn';
  btn.innerHTML = '<i class="ti ti-menu-2"></i>';
  btn.onclick = toggleSidebar;
  left.prepend(btn);
}

function tabSwitch(btn) {
  btn.closest('.tab-bar').querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function hidePageLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) loader.classList.add('hide');
}

Object.assign(window, {
  toast,
  openModal,
  closeModal,
  toggleSidebar,
  doLogout,
  getGreeting,
  getInitials,
  initDashboardUser,
  setupMobileMenu,
  tabSwitch,
  hidePageLoader
});

document.addEventListener('DOMContentLoaded', () => {
  setupModalBackdrops();
  setupMobileMenu();
});
