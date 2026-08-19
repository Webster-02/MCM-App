// MCM — Per-account appearance preferences
// Preferences are stored by signed-in/test user key, so one person's theme never changes another's.

const THEMES = {
  obsidian: {
    label: 'Obsidian Gold',
    vars: {
      '--bg': '#080808', '--bg-surface': '#0d0d0f', '--bg-card': '#101014', '--bg-card-hover': '#15151a',
      '--border': 'rgba(255,255,255,.07)', '--accent': '#c9a66b', '--accent-2': '#e2c993', '--accent-soft': 'rgba(201,166,107,.10)'
    }
  },
  midnight: {
    label: 'Midnight Blue',
    vars: {
      '--bg': '#070b12', '--bg-surface': '#0b111a', '--bg-card': '#0f1722', '--bg-card-hover': '#141e2b',
      '--border': 'rgba(120,170,220,.10)', '--accent': '#78aee8', '--accent-2': '#b8d7ff', '--accent-soft': 'rgba(120,174,232,.11)'
    }
  },
  emerald: {
    label: 'Emerald',
    vars: {
      '--bg': '#070c0a', '--bg-surface': '#0b1210', '--bg-card': '#0f1714', '--bg-card-hover': '#14211c',
      '--border': 'rgba(92,210,159,.10)', '--accent': '#57c997', '--accent-2': '#a8f0ce', '--accent-soft': 'rgba(87,201,151,.11)'
    }
  },
  violet: {
    label: 'Royal Violet',
    vars: {
      '--bg': '#09070f', '--bg-surface': '#100b18', '--bg-card': '#14101d', '--bg-card-hover': '#1a1425',
      '--border': 'rgba(172,130,255,.11)', '--accent': '#a983ff', '--accent-2': '#d5c2ff', '--accent-soft': 'rgba(169,131,255,.11)'
    }
  },
  rose: {
    label: 'Rose',
    vars: {
      '--bg': '#0e080b', '--bg-surface': '#150d11', '--bg-card': '#191014', '--bg-card-hover': '#21151a',
      '--border': 'rgba(240,150,178,.10)', '--accent': '#df8eaa', '--accent-2': '#f6c0d1', '--accent-soft': 'rgba(223,142,170,.11)'
    }
  }
};

function themeUserKey() {
  try {
    const raw = sessionStorage.getItem('mcm_user') || sessionStorage.getItem('msv_user');
    if (raw) {
      const user = JSON.parse(raw);
      return `mcm_theme_${user.uid || user.email || 'guest'}`;
    }
  } catch {}
  return 'mcm_theme_guest';
}

function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.obsidian;
  Object.entries(theme.vars).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
  document.documentElement.dataset.mcmTheme = themeId;
  try { localStorage.setItem(themeUserKey(), themeId); } catch {}
  document.querySelectorAll('[data-theme-option]').forEach(el => el.classList.toggle('active', el.dataset.themeOption === themeId));
}

function loadTheme() {
  let themeId = 'obsidian';
  try { themeId = localStorage.getItem(themeUserKey()) || 'obsidian'; } catch {}
  applyTheme(themeId);
}

function initThemePicker(containerId = 'appearanceThemePicker') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Object.entries(THEMES).map(([id, theme]) => `
    <button type="button" class="mcm-theme-option" data-theme-option="${id}" onclick="applyTheme('${id}')">
      <span class="mcm-theme-swatch mcm-theme-${id}"></span>
      <span><strong>${theme.label}</strong><small>Apply to this account only</small></span>
      <i class="ti ti-check"></i>
    </button>`).join('');
  const css = document.createElement('style');
  css.textContent = `
    .mcm-theme-option{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;margin:6px 0;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:12px;text-align:left;cursor:pointer}
    .mcm-theme-option:hover{border-color:var(--accent);background:var(--bg-card-hover)}
    .mcm-theme-option small{display:block;color:var(--text-muted);font-size:10px;margin-top:3px}
    .mcm-theme-option>i{margin-left:auto;opacity:0;color:var(--accent)}
    .mcm-theme-option.active{border-color:var(--accent);background:var(--accent-soft)}
    .mcm-theme-option.active>i{opacity:1}
    .mcm-theme-swatch{width:34px;height:34px;border-radius:10px;display:block;flex:0 0 auto;border:1px solid rgba(255,255,255,.10)}
    .mcm-theme-obsidian{background:linear-gradient(135deg,#080808 0 55%,#c9a66b 56%)}
    .mcm-theme-midnight{background:linear-gradient(135deg,#070b12 0 55%,#78aee8 56%)}
    .mcm-theme-emerald{background:linear-gradient(135deg,#070c0a 0 55%,#57c997 56%)}
    .mcm-theme-violet{background:linear-gradient(135deg,#09070f 0 55%,#a983ff 56%)}
    .mcm-theme-rose{background:linear-gradient(135deg,#0e080b 0 55%,#df8eaa 56%)}
  `;
  document.head.appendChild(css);
  loadTheme();
}

window.MCMTheme = { THEMES, applyTheme, loadTheme, initThemePicker };

document.addEventListener('DOMContentLoaded', () => loadTheme());
