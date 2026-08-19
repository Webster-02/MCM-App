// MCM — Per-account visual theme system
// Each account gets its own stored theme preference. This changes the UI accent
// palette without changing role permissions or data access.

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
      if (raw) {
        const u = JSON.parse(raw);
        return u.uid || u.email || u.role || 'account';
      }
    } catch {}
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('student')) return 'student-account';
    if (path.includes('teacher')) return 'teacher-account';
    if (path.includes('superadmin')) return 'superadmin-account';
    if (path.includes('admin')) return 'admin-account';
    if (path.includes('svl')) return 'svl-account';
    return 'account';
  }

  function storageKey() { return `mcm_theme_${getIdentity()}`; }

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
  }

  function currentTheme() {
    try { return localStorage.getItem(storageKey()) || 'obsidian'; } catch { return 'obsidian'; }
  }

  function buildPanel() {
    if (document.getElementById('mcm-theme-panel')) return;

    const style = document.createElement('style');
    style.id = 'mcm-theme-style';
    style.textContent = `
      #mcm-theme-trigger{position:fixed;right:18px;bottom:18px;z-index:9998;width:42px;height:42px;border-radius:13px;border:1px solid rgba(255,255,255,.10);background:#121216;color:var(--accent);display:grid;place-items:center;cursor:pointer;box-shadow:0 14px 36px rgba(0,0,0,.28)}
      #mcm-theme-panel{position:fixed;right:18px;bottom:70px;z-index:9999;width:260px;background:#101014;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:14px;box-shadow:0 20px 55px rgba(0,0,0,.35);display:none}
      #mcm-theme-panel.open{display:block;animation:mcmThemeIn .18s ease both}
      #mcm-theme-panel h4{margin:0 0 4px;font-size:13px;color:#f2f2f4}#mcm-theme-panel p{margin:0 0 12px;font-size:10px;color:#777783;line-height:1.5}
      .mcm-theme-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mcm-theme-option{display:flex;align-items:center;gap:8px;padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:#0b0b0f;color:#ddd;cursor:pointer;font-size:10px}.mcm-theme-option.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent-glow) inset}.mcm-theme-swatch{width:18px;height:18px;border-radius:50%;flex:none}
      @keyframes mcmThemeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
    `;
    document.head.appendChild(style);

    const trigger = document.createElement('button');
    trigger.id = 'mcm-theme-trigger';
    trigger.type = 'button';
    trigger.title = 'Customise appearance';
    trigger.innerHTML = '<i class="ti ti-palette"></i>';

    const panel = document.createElement('div');
    panel.id = 'mcm-theme-panel';
    panel.innerHTML = `<h4>Appearance</h4><p>Choose a personal accent palette. Your preference is saved to this account only.</p><div class="mcm-theme-options"></div>`;

    const options = panel.querySelector('.mcm-theme-options');
    Object.entries(THEMES).forEach(([key, theme]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mcm-theme-option';
      btn.dataset.theme = key;
      btn.innerHTML = `<span class="mcm-theme-swatch" style="background:${theme.accent}"></span><span>${theme.label}</span>`;
      btn.onclick = () => { applyTheme(key); refreshActive(); };
      options.appendChild(btn);
    });

    function refreshActive() {
      options.querySelectorAll('.mcm-theme-option').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === currentTheme()));
    }

    trigger.onclick = () => panel.classList.toggle('open');
    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && e.target !== trigger) panel.classList.remove('open');
    });
    document.body.appendChild(trigger);
    document.body.appendChild(panel);
    applyTheme(currentTheme());
    refreshActive();
  }

  function init() {
    buildPanel();
  }

  window.MCMTheme = { THEMES, applyTheme, currentTheme, init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
