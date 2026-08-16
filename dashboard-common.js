// MCM — Shared dashboard utilities

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

function applyMCMBrand() {
  document.title = document.title.replace(/MySVL|SVL/gi, 'MCM');

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (!node.nodeValue) return;
    const value = node.nodeValue;
    if (/MySVL|SVL/i.test(value)) {
      node.nodeValue = value.replace(/MySVL/gi, 'MCM').replace(/\bSVL\b/gi, 'MCM');
    }
  });
}

function replaceNavLabel(buttonId, label) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  const textNode = [...btn.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
  if (textNode) textNode.nodeValue = ` ${label} `;
}

function simplifyStudentNavigation() {
  if (!/student-dashboard\.html/i.test(window.location.pathname)) return;

  replaceNavLabel('nav-slides', 'Library');
  replaceNavLabel('nav-subjects', 'Courses');
  replaceNavLabel('nav-quiz', 'Quizzes');
  replaceNavLabel('nav-flashcards', 'Flashcards');
  replaceNavLabel('nav-learninglab', 'Learning Insights');
  replaceNavLabel('nav-questarena', 'Practice Arena');
  replaceNavLabel('nav-ai', 'AI Study Assistant');
  replaceNavLabel('nav-tasks', 'Tasks');
  replaceNavLabel('nav-social', 'Community');
  replaceNavLabel('nav-chat', 'Messages');
  replaceNavLabel('nav-rooms', 'Study Rooms');
  replaceNavLabel('nav-leaderboard', 'Leaderboard');
  replaceNavLabel('nav-grades', 'Grades');
  replaceNavLabel('nav-attendance', 'Attendance');
  replaceNavLabel('nav-profile', 'Profile');
  replaceNavLabel('nav-notifications', 'Notifications');
  replaceNavLabel('nav-settings', 'Settings');

  ['nav-skillradar', 'nav-pomodoro', 'nav-games', 'nav-studyarcade'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  document.querySelectorAll('.sidebar-nav .nav-label').forEach(label => {
    if (label.textContent.trim().toLowerCase() === 'fun zone') label.style.display = 'none';
  });

  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.textContent = 'MCM';
  const logoVer = document.querySelector('.logo-ver');
  if (logoVer) logoVer.textContent = 'Student Platform';
}

function simplifyTeacherNavigation() {
  if (!/teacher-dashboard\.html/i.test(window.location.pathname)) return;

  const labels = {
    'my slides': 'Slide Library',
    'upload slides': 'Upload Slides',
    'quiz builder': 'Quizzes',
    'assignments': 'Assignments',
    'announcements': 'Announcements',
    'my students': 'Students',
    'attendance': 'Attendance',
    'grades': 'Grades',
    'at-risk': 'At Risk',
    'analytics': 'Analytics',
    'class discussion': 'Discussion',
    'resources': 'Resources',
    'notifications': 'Notifications',
    'settings': 'Settings'
  };

  document.querySelectorAll('.nav-item').forEach(item => {
    const text = (item.textContent || '').trim().toLowerCase();
    for (const [source, label] of Object.entries(labels)) {
      if (text.startsWith(source)) {
        const textNode = [...item.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
        if (textNode) textNode.nodeValue = ` ${label}`;
        break;
      }
    }
  });

  if (!document.getElementById('mcm-teacher-shell')) {
    const style = document.createElement('style');
    style.id = 'mcm-teacher-shell';
    style.textContent = `
      body.teacher-mcm .logo-mark { background: linear-gradient(145deg,#c9a66b,#8b6b39) !important; box-shadow:0 8px 26px rgba(201,166,107,.18)!important; }
      body.teacher-mcm .sidebar { border-right-color:#242018; }
      body.teacher-mcm .nav-item.active { background:rgba(201,166,107,.10)!important; color:#d9bb8c!important; border-left:1px solid rgba(201,166,107,.4)!important; }
      body.teacher-mcm .sidebar-user .avatar { background:rgba(201,166,107,.12)!important; color:#d9bb8c!important; }
      body.teacher-mcm .s-card:hover, body.teacher-mcm .card:hover { border-color:rgba(201,166,107,.24)!important; }
      body.teacher-mcm .welcome-banner-teacher { border-color:rgba(201,166,107,.16)!important; box-shadow:0 16px 48px rgba(0,0,0,.22)!important; }
      @media(max-width:900px){body.teacher-mcm .s-card-grid{grid-template-columns:1fr 1fr!important}}
    `;
    document.head.appendChild(style);
  }
  document.body.classList.add('teacher-mcm');

  const logoText = document.querySelector('.logo-text');
  if (logoText) logoText.textContent = 'MCM';
  const logoVer = document.querySelector('.logo-ver');
  if (logoVer) logoVer.textContent = 'Faculty Platform';
  const sidebarRole = document.querySelector('.sidebar-user-role');
  if (sidebarRole) sidebarRole.textContent = 'Faculty · MCM';

  const welcome = document.querySelector('#sec-dashboard > div');
  if (welcome) welcome.classList.add('welcome-banner-teacher');
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
  applyMCMBrand,
  simplifyStudentNavigation,
  simplifyTeacherNavigation,
  setupMobileMenu,
  tabSwitch,
  hidePageLoader
});

document.addEventListener('DOMContentLoaded', () => {
  applyMCMBrand();
  simplifyStudentNavigation();
  simplifyTeacherNavigation();
  setupModalBackdrops();
  setupMobileMenu();
});
