// MCM — Per-account visual theme system
(() => {
  const THEMES = {
    obsidian: { label: 'Obsidian Gold', accent: '#c9a66b', accent2: '#e2c993', accentSoft: 'rgba(201,166,107,.12)', accentGlow: 'rgba(201,166,107,.24)', purple: '#8b6bff' },
    midnight: { label: 'Midnight Blue', accent: '#6ea8ff', accent2: '#a8c7ff', accentSoft: 'rgba(110,168,255,.12)', accentGlow: 'rgba(110,168,255,.24)', purple: '#8b7cff' },
    emerald: { label: 'Emerald', accent: '#5ed1a2', accent2: '#a7f0d0', accentSoft: 'rgba(94,209,162,.12)', accentGlow: 'rgba(94,209,162,.24)', purple: '#68a0ff' },
    royal: { label: 'Royal Violet', accent: '#9b8cff', accent2: '#c6bfff', accentSoft: 'rgba(155,140,255,.12)', accentGlow: 'rgba(155,140,255,.24)', purple: '#b07cff' },
    rose: { label: 'Rose', accent: '#e68aa9', accent2: '#f4bfd0', accentSoft: 'rgba(230,138,169,.12)', accentGlow: 'rgba(230,138,169,.24)', purple: '#a78bfa' }
  };

  function getIdentity() {
    try {
      const raw = sessionStorage.getItem('mcm_user') || sessionStorage.getItem('msv_user');
      if (raw) { const u = JSON.parse(raw); return u.uid || u.email || u.role || 'account'; }
    } catch {}
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('student')) return 'student-account';
    if (path.includes('teacher')) return 'teacher-account';
    if (path.includes('superadmin')) return 'superadmin-account';
    if (path.includes('admin')) return 'admin-account';
    if (path.includes('svl')) return 'svl-account';
    return 'account';
  }

  const storageKey = () => `mcm_theme_${getIdentity()}`;

  function applyTheme(name) {
    const theme = THEMES[name] || THEMES.obsidian;
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-2', theme.accent2);
    root.style.setProperty('--accent-soft', theme.accentSoft);
    root.style.setProperty('--accent-glow', theme.accentGlow);
    root.style.setProperty('--purple', theme.purple);
    root.dataset.mcmTheme = name;
    try { localStorage.setItem(storageKey(), name); } catch {}
    document.querySelectorAll('[data-mcm-theme-option]').forEach(btn => btn.classList.toggle('active', btn.dataset.mcmThemeOption === name));
  }

  const currentTheme = () => { try { return localStorage.getItem(storageKey()) || 'obsidian'; } catch { return 'obsidian'; } };

  function ensureStyles() {
    if (document.getElementById('mcm-theme-style')) return;
    const style = document.createElement('style');
    style.id = 'mcm-theme-style';
    style.textContent = `
      #mcm-theme-trigger{position:fixed;right:18px;bottom:18px;z-index:9998;width:42px;height:42px;border-radius:13px;border:1px solid rgba(255,255,255,.10);background:#121216;color:var(--accent);display:grid;place-items:center;cursor:pointer;box-shadow:0 14px 36px rgba(0,0,0,.28)}
      #mcm-theme-panel{position:fixed;right:18px;bottom:70px;z-index:9999;width:260px;background:#101014;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px;box-shadow:0 20px 55px rgba(0,0,0,.35);display:none}
      #mcm-theme-panel.open{display:block}
      #mcm-theme-panel h4{margin:0 0 4px;font-size:13px;color:#f2f2f4}#mcm-theme-panel p{margin:0 0 12px;font-size:10px;color:#777783;line-height:1.5}
      .mcm-theme-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mcm-theme-option{display:flex;align-items:center;gap:8px;padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:#0b0b0f;color:#ddd;cursor:pointer;font-size:10px}.mcm-theme-option.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent-glow) inset}.mcm-theme-swatch{width:18px;height:18px;border-radius:50%;flex:none}
      .mcm-appearance-card{margin-top:16px;padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--bg-card);color:var(--text-primary)}
      .mcm-appearance-card h3{display:flex;align-items:center;gap:8px;margin:0 0 5px;font-size:14px}.mcm-appearance-card h3 i{color:var(--accent)}
      .mcm-appearance-card p{margin:0 0 14px;color:var(--text-muted);font-size:11px;line-height:1.55}
      .mcm-settings-theme-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.mcm-settings-theme-btn{border:1px solid var(--border);background:transparent;color:var(--text-primary);border-radius:11px;padding:9px;cursor:pointer;text-align:left}.mcm-settings-theme-btn:hover,.mcm-settings-theme-btn.active{border-color:var(--accent);background:var(--accent-soft)}.mcm-settings-theme-btn .dot{display:block;width:100%;height:24px;border-radius:8px;margin-bottom:7px}.mcm-settings-theme-btn strong{font-size:10px;display:block}.mcm-settings-theme-btn small{display:block;color:var(--text-muted);font-size:8px;margin-top:2px}
      @media(max-width:760px){.mcm-settings-theme-grid{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function renderThemeButtons(container) {
    container.innerHTML = Object.entries(THEMES).map(([key, theme]) => `<button type="button" class="mcm-settings-theme-btn" data-mcm-theme-option="${key}"><span class="dot" style="background:linear-gradient(135deg,#090909 0 55%,${theme.accent} 56%)"></span><strong>${theme.label}</strong><small>Personal</small></button>`).join('');
    container.querySelectorAll('[data-mcm-theme-option]').forEach(btn => btn.addEventListener('click', () => applyTheme(btn.dataset.mcmThemeOption)));
  }

  function findSettingsSection() {
    const sections = [...document.querySelectorAll('.page-section,.section')];
    return sections.find(el => /settings/i.test(el.id || '')) || sections.find(el => /settings/i.test(el.textContent || '')) || null;
  }

  function injectAppearanceIntoSettings() {
    const settings = findSettingsSection();
    if (!settings || settings.querySelector('.mcm-appearance-card')) return;
    const card = document.createElement('section');
    card.className = 'mcm-appearance-card';
    card.innerHTML = `<h3><i class="ti ti-palette"></i> Appearance</h3><p>Choose the colour palette for this account. Your selection is saved privately and does not change other accounts.</p><div class="mcm-settings-theme-grid"></div>`;
    settings.appendChild(card);
    renderThemeButtons(card.querySelector('.mcm-settings-theme-grid'));
    applyTheme(currentTheme());
  }

  function buildFloatingPanel() {
    if (document.getElementById('mcm-theme-panel')) return;
    const trigger = document.createElement('button'); trigger.id='mcm-theme-trigger'; trigger.type='button'; trigger.title='Customise appearance'; trigger.innerHTML='<i class="ti ti-palette"></i>';
    const panel = document.createElement('div'); panel.id='mcm-theme-panel'; panel.innerHTML='<h4>Appearance</h4><p>Personal theme for this account only.</p><div class="mcm-theme-options"></div>';
    const options=panel.querySelector('.mcm-theme-options');
    Object.entries(THEMES).forEach(([key,theme])=>{const btn=document.createElement('button');btn.type='button';btn.className='mcm-theme-option';btn.dataset.mcmThemeOption=key;btn.innerHTML=`<span class="mcm-theme-swatch" style="background:${theme.accent}"></span><span>${theme.label}</span>`;btn.onclick=()=>applyTheme(key);options.appendChild(btn)});
    trigger.onclick=()=>panel.classList.toggle('open');
    document.addEventListener('click',e=>{if(!panel.contains(e.target)&&e.target!==trigger)panel.classList.remove('open')});
    document.body.appendChild(trigger);document.body.appendChild(panel);
  }

  function init(){
    ensureStyles(); applyTheme(currentTheme()); injectAppearanceIntoSettings();
    setTimeout(injectAppearanceIntoSettings,300); setTimeout(injectAppearanceIntoSettings,1000); buildFloatingPanel();
  }

  window.MCMTheme={THEMES,applyTheme,currentTheme,init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
