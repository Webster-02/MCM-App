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

function injectMCMHomeEnhancements() {
  const dashboard = document.getElementById('sec-dashboard');
  if (!dashboard || document.getElementById('mcmFocusStrip')) return;

  const welcome = dashboard.querySelector('.welcome-banner');
  if (!welcome) return;

  const strip = document.createElement('div');
  strip.id = 'mcmFocusStrip';
  strip.innerHTML = `
    <div class="mcm-focus-head">
      <div>
        <span class="mcm-eyebrow">TODAY</span>
        <h3>Pick up where you left off</h3>
      </div>
      <span class="mcm-focus-date">Your study space</span>
    </div>
    <div class="mcm-focus-grid">
      <button class="mcm-focus-card" onclick="navigate('slides')"><span class="mcm-focus-icon"><i class="ti ti-presentation"></i></span><span><b>Continue learning</b><small>Open your latest slides</small></span><i class="ti ti-arrow-up-right mcm-focus-arrow"></i></button>
      <button class="mcm-focus-card" onclick="navigate('quiz')"><span class="mcm-focus-icon gold"><i class="ti ti-help-circle"></i></span><span><b>Test your knowledge</b><small>Take a quick quiz</small></span><i class="ti ti-arrow-up-right mcm-focus-arrow"></i></button>
      <button class="mcm-focus-card" onclick="navigate('tasks')"><span class="mcm-focus-icon green"><i class="ti ti-checkbox"></i></span><span><b>Stay on track</b><small>Review pending tasks</small></span><i class="ti ti-arrow-up-right mcm-focus-arrow"></i></button>
      <button class="mcm-focus-card" onclick="navigate('ai')"><span class="mcm-focus-icon purple"><i class="ti ti-sparkles"></i></span><span><b>Ask MCM AI</b><small>Get help with a concept</small></span><i class="ti ti-arrow-up-right mcm-focus-arrow"></i></button>
    </div>`;

  welcome.insertAdjacentElement('afterend', strip);

  const style = document.createElement('style');
  style.id = 'mcm-modern-overrides';
  style.textContent = `
    :root{--mcm-gold:#C9A66B;--mcm-gold-soft:rgba(201,166,107,.12)}
    .logo-text{letter-spacing:-.04em!important;font-weight:800!important}
    .logo-mark{background:linear-gradient(145deg,#c9a66b,#8b6b39)!important;box-shadow:0 8px 26px rgba(201,166,107,.18)!important}
    .sidebar-nav .nav-label{color:#78788c!important;letter-spacing:.12em!important;font-size:9px!important}
    .nav-item{border-radius:9px!important}
    .nav-item.active{background:rgba(201,166,107,.10)!important;color:#d9bb8c!important;border-left:1px solid rgba(201,166,107,.4)!important}
    .welcome-banner{background:linear-gradient(135deg,#111217 0%,#0d0e13 62%,#16110b 100%)!important;border-color:rgba(201,166,107,.16)!important;box-shadow:0 16px 48px rgba(0,0,0,.22)!important}
    .welcome-banner::before{background:radial-gradient(circle,rgba(201,166,107,.13) 0%,transparent 70%)!important}
    .s-card{background:rgba(18,18,28,.72)!important;border-color:rgba(255,255,255,.055)!important}
    .s-card:hover{border-color:rgba(201,166,107,.24)!important;background:#17171f!important}
    #mcmFocusStrip{margin:0 0 22px;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.01));border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:18px 18px 16px}
    .mcm-focus-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:13px}
    .mcm-eyebrow{font-size:9px;letter-spacing:.16em;color:#8a8a9b;font-weight:700}
    .mcm-focus-head h3{margin-top:4px;font-size:15px;color:#f1f1f4}
    .mcm-focus-date{font-size:11px;color:#6d6d7d}
    .mcm-focus-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
    .mcm-focus-card{display:flex;align-items:center;gap:10px;text-align:left;width:100%;padding:12px;border:1px solid rgba(255,255,255,.055);border-radius:13px;background:#101117;color:#ededf3;cursor:pointer;transition:.18s ease}
    .mcm-focus-card:hover{transform:translateY(-2px);border-color:rgba(201,166,107,.28);background:#15161c}
    .mcm-focus-icon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(124,105,255,.10);color:#9b8fff;flex:0 0 auto}
    .mcm-focus-icon.gold{background:var(--mcm-gold-soft);color:var(--mcm-gold)}
    .mcm-focus-icon.green{background:rgba(34,201,122,.10);color:#4fd493}
    .mcm-focus-icon.purple{background:rgba(168,85,247,.10);color:#bb78f7}
    .mcm-focus-card span:nth-child(2){min-width:0;display:flex;flex-direction:column}
    .mcm-focus-card b{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mcm-focus-card small{font-size:9px;color:#747487;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mcm-focus-arrow{margin-left:auto;color:#585869;font-size:14px}
    @media(max-width:900px){.mcm-focus-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:520px){.mcm-focus-grid{grid-template-columns:1fr}.mcm-focus-head{align-items:flex-start;flex-direction:column;gap:4px}}
  `;
  document.head.appendChild(style);
}

function applyMCMExperience() {
  applyMCMBrand();
  simplifyStudentNavigation();
  injectMCMHomeEnhancements();
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
  injectMCMHomeEnhancements,
  applyMCMExperience,
  setupMobileMenu,
  tabSwitch,
  hidePageLoader
});

document.addEventListener('DOMContentLoaded', () => {
  applyMCMExperience();
  setupModalBackdrops();
  setupMobileMenu();
});
