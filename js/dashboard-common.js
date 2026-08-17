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

function openModal(id) { const el = document.getElementById(id); if (el) el.classList.add('open'); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); }
function setupModalBackdrops() { document.querySelectorAll('.modal-backdrop').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); })); }
function toggleSidebar() { const sidebar = document.getElementById('sidebar'); if (sidebar) sidebar.classList.toggle('open'); }
async function doLogout() { try { await window._logout(); } catch { window.location.href = 'index.html'; } }
function getGreeting() { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening'; }
function getInitials(name) { return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

function initDashboardUser(user, options = {}) {
  const { avatarIds = ['sidebarAvatar', 'topbarAvatar'], nameIds = ['sidebarName'], emailIds = [], welcomeId = null, welcomeSuffix = '', emoji = '👋' } = options;
  const initials = getInitials(user.name);
  avatarIds.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });
  nameIds.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = user.name; });
  emailIds.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = user.email; });
  if (welcomeId) { const el = document.getElementById(welcomeId); if (el) { const first = (user.name || '').split(' ')[0] || 'there'; el.textContent = `${getGreeting()}, ${first}${welcomeSuffix || emoji}`; } }
}

function applyMCMBrand() {
  document.title = document.title.replace(/MySVL|SVL/gi, 'MCM');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => { if (!node.nodeValue) return; const value = node.nodeValue; if (/MySVL|SVL/i.test(value)) node.nodeValue = value.replace(/MySVL/gi, 'MCM').replace(/\bSVL\b/gi, 'MCM'); });
}

function replaceNavLabel(buttonId, label) {
  const btn = document.getElementById(buttonId); if (!btn) return;
  const textNode = [...btn.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
  if (textNode) textNode.nodeValue = ` ${label} `;
}

function simplifyStudentNavigation() {
  if (!/student-dashboard\.html/i.test(window.location.pathname)) return;
  const labels = {'nav-slides':'Library','nav-subjects':'Courses','nav-quiz':'Quizzes','nav-flashcards':'Flashcards','nav-learninglab':'Learning Insights','nav-questarena':'Practice Arena','nav-ai':'AI Study Assistant','nav-tasks':'Tasks','nav-social':'Community','nav-chat':'Messages','nav-rooms':'Study Rooms','nav-leaderboard':'Leaderboard','nav-grades':'Grades','nav-attendance':'Attendance','nav-profile':'Profile','nav-notifications':'Notifications','nav-settings':'Settings'};
  Object.entries(labels).forEach(([id,label]) => replaceNavLabel(id,label));
  ['nav-skillradar','nav-pomodoro','nav-games','nav-studyarcade'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  document.querySelectorAll('.sidebar-nav .nav-label').forEach(label => { if (label.textContent.trim().toLowerCase() === 'fun zone') label.style.display = 'none'; });
  const logoText = document.querySelector('.logo-text'); if (logoText) logoText.textContent = 'MCM';
  const logoVer = document.querySelector('.logo-ver'); if (logoVer) logoVer.textContent = 'Student Platform';
}

function simplifyTeacherNavigation() {
  if (!/teacher-dashboard\.html/i.test(window.location.pathname)) return;
  const labels = {'my slides':'Slide Library','upload slides':'Upload Slides','quiz builder':'Quizzes','assignments':'Assignments','announcements':'Announcements','my students':'Students','attendance':'Attendance','grades':'Grades','at-risk':'At Risk','analytics':'Analytics','class discussion':'Discussion','resources':'Resources','notifications':'Notifications','settings':'Settings'};
  document.querySelectorAll('.nav-item').forEach(item => { const text = (item.textContent || '').trim().toLowerCase(); for (const [source,label] of Object.entries(labels)) { if (text.startsWith(source)) { const textNode = [...item.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()); if (textNode) textNode.nodeValue = ` ${label}`; break; } } });
  document.body.classList.add('teacher-mcm');
  if (!document.getElementById('mcm-teacher-shell')) { const style = document.createElement('style'); style.id = 'mcm-teacher-shell'; style.textContent = `body.teacher-mcm .logo-mark{background:linear-gradient(145deg,#c9a66b,#8b6b39)!important;box-shadow:0 8px 26px rgba(201,166,107,.18)!important} body.teacher-mcm .nav-item.active{background:rgba(201,166,107,.10)!important;color:#d9bb8c!important;border-left:1px solid rgba(201,166,107,.4)!important} body.teacher-mcm .sidebar-user .avatar{background:rgba(201,166,107,.12)!important;color:#d9bb8c!important} body.teacher-mcm .s-card:hover,body.teacher-mcm .card:hover{border-color:rgba(201,166,107,.24)!important}`; document.head.appendChild(style); }
  const logoText = document.querySelector('.logo-text'); if (logoText) logoText.textContent = 'MCM';
  const logoVer = document.querySelector('.logo-ver'); if (logoVer) logoVer.textContent = 'Faculty Platform';
  const sidebarRole = document.querySelector('.sidebar-user-role'); if (sidebarRole) sidebarRole.textContent = 'Faculty · MCM';
}

function simplifyAdminNavigation() {
  if (!/admin-dashboard\.html/i.test(window.location.pathname)) return;
  const labels = {'dashboard':'Overview','analytics':'Analytics','universities':'Universities','departments':'Departments','teachers':'Faculty','students':'Students','classes':'Classes','slides':'Content Library','quizzes':'Quizzes','announcements':'Announcements','billing':'Plans & Billing','reports':'Reports','auditlog':'Audit Log','notifications':'Notifications','settings':'Settings'};
  document.querySelectorAll('.nav-item').forEach(item => { const text = (item.textContent || '').trim().toLowerCase(); for (const [source,label] of Object.entries(labels)) { if (text === source || text.startsWith(source)) { const textNode = [...item.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()); if (textNode) textNode.nodeValue = ` ${label} `; break; } } });
  const logoText = document.querySelector('.logo-text'); if (logoText) logoText.textContent = 'MCM';
  const logoVer = document.querySelector('.logo-ver'); if (logoVer) logoVer.textContent = 'Admin Platform';
  const sidebarRole = document.querySelector('.sidebar-user-role'); if (sidebarRole) sidebarRole.textContent = 'University Admin · MCM';
  document.body.classList.add('admin-mcm');
  if (!document.getElementById('mcm-admin-shell')) {
    const style = document.createElement('style'); style.id = 'mcm-admin-shell'; style.textContent = `body.admin-mcm .logo-mark{background:linear-gradient(145deg,#c9a66b,#8b6b39)!important;box-shadow:0 8px 26px rgba(201,166,107,.18)!important} body.admin-mcm .nav-item.active{background:rgba(201,166,107,.10)!important;color:#d9bb8c!important;border-left:1px solid rgba(201,166,107,.4)!important} body.admin-mcm .sidebar-user .avatar{background:rgba(201,166,107,.12)!important;color:#d9bb8c!important} body.admin-mcm .s-card:hover,body.admin-mcm .card:hover{border-color:rgba(201,166,107,.24)!important} body.admin-mcm .badge-amber{background:rgba(201,166,107,.12)!important;color:#d9bb8c!important}`; document.head.appendChild(style);
  }
}

function addCommunityStyles() {
  if (document.getElementById('mcm-community-styles')) return;
  const style = document.createElement('style');
  style.id = 'mcm-community-styles';
  style.textContent = `
    .mcm-community{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px}
    .mcm-community-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}
    .mcm-community-kicker{font-size:9px;letter-spacing:.16em;color:#888894;font-weight:700;text-transform:uppercase}
    .mcm-community-title{font-size:24px;font-weight:700;letter-spacing:-.04em;margin-top:4px}
    .mcm-community-sub{font-size:12px;color:var(--text-secondary);margin-top:5px}
    .mcm-community-actions{display:flex;gap:8px;flex-wrap:wrap}
    .mcm-community-tabs{display:flex;gap:6px;overflow:auto;padding:5px;background:var(--bg-surface);border:1px solid var(--border);border-radius:14px;margin-bottom:14px}
    .mcm-community-tab{border:0;background:transparent;color:var(--text-muted);padding:8px 12px;border-radius:9px;font:500 12px var(--font);cursor:pointer;white-space:nowrap}
    .mcm-community-tab.active,.mcm-community-tab:hover{background:var(--bg-card);color:var(--text-primary)}
    .mcm-composer{background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.01));border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:15px;margin-bottom:14px}
    .mcm-composer-top{display:flex;gap:10px;align-items:center}
    .mcm-composer-input{flex:1;text-align:left;background:#101117;border:1px solid rgba(255,255,255,.06);color:var(--text-secondary);padding:11px 13px;border-radius:11px;font:400 12px var(--font);cursor:pointer}
    .mcm-post{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px}
    .mcm-post-top{display:flex;gap:10px;align-items:center}
    .mcm-post-author{font-size:12px;font-weight:600}.mcm-post-meta{font-size:10px;color:var(--text-muted);margin-top:2px}
    .mcm-post-tag{margin-left:auto;font-size:9px;color:#d9bb8c;background:rgba(201,166,107,.10);padding:4px 8px;border-radius:999px}
    .mcm-post-title{font-size:14px;font-weight:600;margin-top:12px}.mcm-post-body{font-size:12px;line-height:1.7;color:var(--text-secondary);margin-top:5px}
    .mcm-post-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.mcm-post-action{border:1px solid var(--border);background:transparent;color:var(--text-secondary);border-radius:9px;padding:6px 10px;font:500 11px var(--font);cursor:pointer}.mcm-post-action:hover{color:var(--text-primary);background:var(--bg-card-hover)}
    .mcm-side-card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:15px;margin-bottom:12px}.mcm-side-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.mcm-side-title b{font-size:12px}
    .mcm-group{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid var(--border)}.mcm-group:last-child{border-bottom:0}.mcm-group-name{font-size:11px;font-weight:600}.mcm-group-meta{font-size:9px;color:var(--text-muted);margin-top:2px}
    .mcm-topic{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)}.mcm-topic:last-child{border-bottom:0}.mcm-topic b{font-size:11px}.mcm-topic span{display:block;font-size:9px;color:var(--text-muted);margin-top:2px}
    .mcm-community-banner{background:linear-gradient(135deg,#111217 0%,#0f1014 65%,#17120c 100%);border:1px solid rgba(201,166,107,.15);border-radius:16px;padding:16px;margin-bottom:14px}
    .mcm-community-banner h3{font-size:13px}.mcm-community-banner p{margin-top:4px;font-size:11px}
    @media(max-width:980px){.mcm-community{grid-template-columns:1fr}.mcm-community-side{display:grid;grid-template-columns:1fr 1fr;gap:12px}.mcm-side-card{margin-bottom:0}}
    @media(max-width:650px){.mcm-community-side{grid-template-columns:1fr}.mcm-community-head{flex-direction:column}.mcm-community-actions{width:100%}}
  `;
  document.head.appendChild(style);
}

function injectCommunity() {
  if (!/student-dashboard\.html/i.test(window.location.pathname)) return;
  const sec = document.getElementById('sec-social');
  if (!sec || sec.dataset.mcmCommunity === '1') return;
  sec.dataset.mcmCommunity = '1';
  addCommunityStyles();
  sec.innerHTML = `
    <div class="mcm-community-head">
      <div><div class="mcm-community-kicker">MCM / Academic Network</div><div class="mcm-community-title">Community</div><div class="mcm-community-sub">Learn together, ask questions, share resources and stay connected to your university.</div></div>
      <div class="mcm-community-actions"><button class="btn btn-primary" onclick="mcmCommunityCompose('discussion')"><i class="ti ti-message-circle-plus"></i> Start Discussion</button><button class="btn btn-secondary" onclick="mcmCommunityCompose('poll')"><i class="ti ti-chart-bar-popular"></i> Create Poll</button></div>
    </div>
    <div class="mcm-community">
      <div>
        <div class="mcm-community-banner"><div style="display:flex;align-items:center;gap:10px"><div class="ib ib-md ib-accent"><i class="ti ti-school"></i></div><div><h3>Your academic community</h3><p>FAST NUCES · BS Computer Science · Semester 5 · Your current SVLs</p></div></div></div>
        <div class="mcm-community-tabs"><button class="mcm-community-tab active" onclick="mcmCommunityTab(this,'feed')">My Feed</button><button class="mcm-community-tab" onclick="mcmCommunityTab(this,'questions')">Q&A</button><button class="mcm-community-tab" onclick="mcmCommunityTab(this,'groups')">Study Groups</button><button class="mcm-community-tab" onclick="mcmCommunityTab(this,'announcements')">Announcements</button></div>
        <div class="mcm-composer"><div class="mcm-composer-top"><div class="avatar av-md av-accent">AR</div><button class="mcm-composer-input" onclick="mcmCommunityCompose('discussion')">Ask a question, share a resource, or start a discussion...</button></div><div style="display:flex;gap:7px;margin-top:10px;flex-wrap:wrap"><button class="mcm-post-action" onclick="mcmCommunityCompose('question')"><i class="ti ti-help-circle"></i> Question</button><button class="mcm-post-action" onclick="mcmCommunityCompose('resource')"><i class="ti ti-link"></i> Resource</button><button class="mcm-post-action" onclick="mcmCommunityCompose('poll')"><i class="ti ti-chart-bar"></i> Poll</button></div></div>
        <div id="mcmCommunityFeed">
          <article class="mcm-post"><div class="mcm-post-top"><div class="avatar av-sm av-teal">AK</div><div><div class="mcm-post-author">Dr. Ahmed Khan <span class="badge badge-teal">Faculty</span></div><div class="mcm-post-meta">Data Structures · 24 min ago</div></div><span class="mcm-post-tag">Pinned</span></div><div class="mcm-post-title">Quiz 2 is now open — focus on AVL rotations</div><div class="mcm-post-body">Review the lecture slides on rotations before attempting the quiz. I have also added a short practice set for your SVL.</div><div class="mcm-post-actions"><button class="mcm-post-action" onclick="mcmAction('discussion')"><i class="ti ti-message-circle"></i> 18 replies</button><button class="mcm-post-action" onclick="mcmAction('save')"><i class="ti ti-bookmark"></i> Save</button><button class="mcm-post-action" onclick="mcmAction('share')"><i class="ti ti-share-3"></i> Share</button></div></article>
          <article class="mcm-post"><div class="mcm-post-top"><div class="avatar av-sm av-purple">AR</div><div><div class="mcm-post-author">Ali Raza</div><div class="mcm-post-meta">Class Discussion · 1 hr ago</div></div><span class="mcm-post-tag">Question</span></div><div class="mcm-post-title">Can someone explain the difference between BFS and DFS?</div><div class="mcm-post-body">I understand the basic traversal but I am confused about when to choose one over the other in exam questions.</div><div class="mcm-post-actions"><button class="mcm-post-action" onclick="mcmAction('answer')"><i class="ti ti-message-plus"></i> Answer</button><button class="mcm-post-action" onclick="mcmAction('helpful')"><i class="ti ti-thumb-up"></i> Helpful · 7</button><button class="mcm-post-action" onclick="mcmAction('save')"><i class="ti ti-bookmark"></i> Save</button></div></article>
          <article class="mcm-post"><div class="mcm-post-top"><div class="avatar av-sm av-amber">HM</div><div><div class="mcm-post-author">Hassan Malik</div><div class="mcm-post-meta">Study Group · 3 hrs ago</div></div><span class="mcm-post-tag">Resource</span></div><div class="mcm-post-title">My condensed DB Systems revision notes</div><div class="mcm-post-body">Sharing my revision outline for normalization and SQL joins. Please add corrections if you spot anything missing.</div><div class="mcm-post-actions"><button class="mcm-post-action" onclick="mcmAction('open-resource')"><i class="ti ti-file-text"></i> Open Resource</button><button class="mcm-post-action" onclick="mcmAction('save')"><i class="ti ti-bookmark"></i> Save</button></div></article>
        </div>
      </div>
      <aside class="mcm-community-side">
        <div class="mcm-side-card"><div class="mcm-side-title"><b>Your Study Groups</b><button class="btn btn-ghost btn-sm" onclick="mcmAction('groups')">View all</button></div><div class="mcm-group"><div class="ib ib-sm ib-accent"><i class="ti ti-database"></i></div><div><div class="mcm-group-name">DB Systems · Revision</div><div class="mcm-group-meta">18 members · 4 new</div></div></div><div class="mcm-group"><div class="ib ib-sm ib-teal"><i class="ti ti-code"></i></div><div><div class="mcm-group-name">Data Structures</div><div class="mcm-group-meta">24 members · 2 new</div></div></div><div class="mcm-group"><div class="ib ib-sm ib-purple"><i class="ti ti-brain"></i></div><div><div class="mcm-group-name">Exam Prep · CS5</div><div class="mcm-group-meta">31 members · active now</div></div></div></div>
        <div class="mcm-side-card"><div class="mcm-side-title"><b>Trending Questions</b><span class="badge badge-amber">Today</span></div><div class="mcm-topic"><div class="ib ib-sm ib-amber"><i class="ti ti-help-circle"></i></div><div><b>AVL vs Red Black Tree</b><span>14 replies · Data Structures</span></div></div><div class="mcm-topic"><div class="ib ib-sm ib-blue"><i class="ti ti-help-circle"></i></div><div><b>BCNF vs 3NF</b><span>9 replies · DB Systems</span></div></div><div class="mcm-topic"><div class="ib ib-sm ib-green"><i class="ti ti-help-circle"></i></div><div><b>Deadlock conditions</b><span>7 replies · OS</span></div></div></div>
        <div class="mcm-side-card"><div class="mcm-side-title"><b>Community Guidelines</b></div><p style="font-size:10px;line-height:1.7;color:var(--text-secondary)">Keep discussions academic, respectful and useful. Faculty can pin, lock or moderate threads. Report content that does not belong here.</p><button class="btn btn-secondary btn-sm btn-full mt-10" onclick="mcmAction('guidelines')">View guidelines</button></div>
      </aside>
    </div>`;
}

function mcmCommunityTab(btn, type) {
  document.querySelectorAll('.mcm-community-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const feed = document.getElementById('mcmCommunityFeed');
  if (!feed) return;
  const presets = {
    feed: `
      <article class="mcm-post"><div class="mcm-post-top"><div class="avatar av-sm av-teal">AK</div><div><div class="mcm-post-author">Dr. Ahmed Khan <span class="badge badge-teal">Faculty</span></div><div class="mcm-post-meta">Data Structures · 24 min ago</div></div><span class="mcm-post-tag">Pinned</span></div><div class="mcm-post-title">Quiz 2 is now open — focus on AVL rotations</div><div class="mcm-post-body">Review the lecture slides on rotations before attempting the quiz. I have also added a short practice set for your SVL.</div><div class="mcm-post-actions"><button class="mcm-post-action" onclick="mcmAction('discussion')"><i class="ti ti-message-circle"></i> 18 replies</button><button class="mcm-post-action" onclick="mcmAction('save')"><i class="ti ti-bookmark"></i> Save</button></div></article>`,
    questions: `<article class="mcm-post"><div class="mcm-post-top"><div class="avatar av-sm av-purple">AR</div><div><div class="mcm-post-author">Ali Raza</div><div class="mcm-post-meta">Q&A · 1 hr ago</div></div><span class="mcm-post-tag">Question</span></div><div class="mcm-post-title">Can someone explain BFS vs DFS for exam questions?</div><div class="mcm-post-body">Add an answer with a simple example. Faculty replies can be marked as accepted.</div><div class="mcm-post-actions"><button class="mcm-post-action" onclick="mcmAction('answer')"><i class="ti ti-message-plus"></i> Answer</button><button class="mcm-post-action" onclick="mcmAction('helpful')"><i class="ti ti-thumb-up"></i> Helpful · 7</button></div></article>`,
    groups: `<div class="card"><div class="sec-head"><h3><i class="ti ti-users-group" style="color:#c9a66b"></i> Study Groups</h3><button class="btn btn-primary btn-sm" onclick="mcmCommunityCompose('group')">Create Group</button></div><div class="mcm-group"><div class="ib ib-sm ib-accent"><i class="ti ti-database"></i></div><div><div class="mcm-group-name">DB Systems · Revision</div><div class="mcm-group-meta">18 members · 4 new messages</div></div><button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="mcmAction('open-group')">Open</button></div><div class="mcm-group"><div class="ib ib-sm ib-teal"><i class="ti ti-code"></i></div><div><div class="mcm-group-name">Data Structures</div><div class="mcm-group-meta">24 members · active now</div></div><button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="mcmAction('open-group')">Open</button></div></div>`,
    announcements: `<article class="mcm-post"><div class="mcm-post-top"><div class="avatar av-sm av-teal">AK</div><div><div class="mcm-post-author">Dr. Ahmed Khan <span class="badge badge-teal">Faculty</span></div><div class="mcm-post-meta">Department announcement · Today</div></div><span class="mcm-post-tag">Announcement</span></div><div class="mcm-post-title">Midterm review session on Thursday</div><div class="mcm-post-body">Bring your questions. The review will cover trees, graphs and asymptotic analysis.</div></article>`
  };
  feed.innerHTML = presets[type] || presets.feed;
}

function mcmCommunityCompose(type) {
  const titles = {question:'Ask a question',discussion:'Start a discussion',resource:'Share a resource',poll:'Create a poll',group:'Create a study group'};
  toast(titles[type] || 'Community', 'The community composer is ready for this workflow.', 'info');
}
function mcmAction(type) { toast('Community', `${type.replace(/-/g,' ')} workflow selected.`, 'info'); }

function setupMobileMenu() { if (window.innerWidth >= 900) return; const left = document.querySelector('.topbar-left'); const existing = document.getElementById('mobileMenuBtn'); if (!left || existing) return; const btn = document.createElement('button'); btn.className = 'topbar-btn'; btn.id = 'mobileMenuBtn'; btn.innerHTML = '<i class="ti ti-menu-2"></i>'; btn.onclick = toggleSidebar; left.prepend(btn); }
function tabSwitch(btn) { btn.closest('.tab-bar').querySelectorAll('.tab-item').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }
function hidePageLoader() { const loader = document.getElementById('pageLoader'); if (loader) loader.classList.add('hide'); }

Object.assign(window, {toast,openModal,closeModal,toggleSidebar,doLogout,getGreeting,getInitials,initDashboardUser,applyMCMBrand,simplifyStudentNavigation,simplifyTeacherNavigation,simplifyAdminNavigation,injectCommunity,mcmCommunityTab,mcmCommunityCompose,mcmAction,setupMobileMenu,tabSwitch,hidePageLoader});

document.addEventListener('DOMContentLoaded', () => { applyMCMBrand(); simplifyStudentNavigation(); simplifyTeacherNavigation(); simplifyAdminNavigation(); injectCommunity(); setupModalBackdrops(); setupMobileMenu(); });
