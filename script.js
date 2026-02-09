/**
 * UPDATED SCRIPT.JS - Universal Menus & Player Editor
 */

// --- VARIABLES ---
const bgMusic = document.getElementById('bg-music');
const clickSound = document.getElementById('click-sound');
const themeClickSound = document.getElementById('theme-click-sound');

// --- THEME EDITOR INPUTS ---
const themeInputs = {
    bg: document.getElementById('input-bg'),
    bar: document.getElementById('input-bar'),
    accent: document.getElementById('input-btn-hover'),
    btnBg: document.getElementById('input-wii-btn-bg'),
    text: document.getElementById('input-static'),
    shadow: document.getElementById('input-shadow-intensity'),
    scanline: document.getElementById('input-scanline-opacity'),
    cursor: document.getElementById('input-cursor'),
    font: document.getElementById('input-font'),
    shape: document.getElementById('input-shape')
};

// --- PLAYER EDITOR INPUTS ---
const playerInputs = {
    padding: document.getElementById('player-padding'),
    radius: document.getElementById('player-radius'),
    glow: document.getElementById('player-glow'),
    color: document.getElementById('player-bg-color')
};

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    initTheme();
    initMenus();
    initSearch();
    initGameModal();
    initPlayerEditor();
    updatePage();
    setInterval(updateDateTime, 1000);
});

// --- UNIVERSAL MENU LOGIC ---
function initMenus() {
    // Mapping triggers to menus
    const menuMap = [
        { trigger: 'wii-menu-button', menu: 'home-menu', close: 'close-home-menu-btn' },
        { trigger: 'music-menu-toggle', menu: 'music-menu', close: 'close-music-menu-btn' },
        { trigger: 'theme-menu-toggle', menu: 'theme-menu', close: 'close-theme-menu-btn' },
        { trigger: 'memory-card-button', menu: 'memory-card-menu', close: 'close-memory-menu-btn' },
        { trigger: 'search-button', menu: 'search-container', close: 'close-search-btn' }
    ];

    menuMap.forEach(item => {
        const triggerBtn = document.getElementById(item.trigger);
        const menuEl = document.getElementById(item.menu);
        const closeBtn = document.getElementById(item.close);

        if(triggerBtn && menuEl) {
            triggerBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent immediate close
                const isVisible = menuEl.style.display !== 'none';
                closeAllMenus(); // Close others first
                if (!isVisible) {
                    menuEl.style.display = 'flex';
                    playSound(themeClickSound);
                    
                    // Special case for search focus
                    if(item.menu === 'search-container') {
                        setTimeout(() => document.getElementById('search-input').focus(), 100);
                    }
                }
            });
        }

        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                menuEl.style.display = 'none';
                playSound(themeClickSound);
            });
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.universal-menu') && !e.target.closest('.wii-button')) {
            closeAllMenus();
        }
    });
}

function closeAllMenus() {
    document.querySelectorAll('.universal-menu').forEach(el => el.style.display = 'none');
}

// --- THEME ENGINE ---
function initTheme() {
    // Load saved
    const saved = localStorage.getItem('qbbic-theme');
    if (saved) applyTheme(JSON.parse(saved));

    // Listeners for all inputs
    Object.values(themeInputs).forEach(input => {
        if(!input) return;
        input.addEventListener('input', updateThemeLive);
        input.addEventListener('change', saveTheme); // Save on final change
    });
}

function updateThemeLive() {
    const r = document.documentElement.style;
    const v = {
        bg: themeInputs.bg.value,
        bar: themeInputs.bar.value,
        accent: themeInputs.accent.value,
        btnBg: themeInputs.btnBg.value,
        text: themeInputs.text.value,
        shadow: themeInputs.shadow.value + 'px',
        scanline: themeInputs.scanline.value,
        cursor: themeInputs.cursor.value,
        font: themeInputs.font.value,
        shape: themeInputs.shape.value
    };

    r.setProperty('--bg-color', v.bg);
    r.setProperty('--bar-color', v.bar);
    r.setProperty('--btn-hover-color', v.accent);
    r.setProperty('--wii-btn-bg', v.btnBg);
    r.setProperty('--static-color', v.text);
    r.setProperty('--shadow-intensity', v.shadow);
    r.setProperty('--scanline-opacity', v.scanline);

    // Cursor Logic
    let cursorVal = 'auto';
    if(v.cursor === 'hand') cursorVal = 'pointer'; // Simple fallback
    else if(v.cursor === 'crosshair') cursorVal = 'crosshair';
    else if(v.cursor === 'default') cursorVal = "url('/assets/cursor.png'), auto";
    r.setProperty('--cursor-image', cursorVal);

    // Font Logic
    const fontMap = { 'PopHappiness': "'PopHappiness', sans-serif", 'sans-serif': 'Arial, sans-serif', 'monospace': "'Courier New', monospace" };
    r.setProperty('--main-font', fontMap[v.font]);

    // Shape Logic
    let rad = '12px', cardRad = '25px';
    if(v.shape === 'round') { rad = '25px'; cardRad = '25px'; }
    if(v.shape === 'square') { rad = '4px'; cardRad = '4px'; }
    r.setProperty('--btn-radius', rad);
    r.setProperty('--card-radius', cardRad);
}

function saveTheme() {
    const data = {};
    Object.keys(themeInputs).forEach(k => data[k] = themeInputs[k].value);
    localStorage.setItem('qbbic-theme', JSON.stringify(data));
    showToast("Theme Saved");
}

function applyTheme(data) {
    if(!data) return;
    Object.keys(themeInputs).forEach(k => {
        if(data[k] && themeInputs[k]) themeInputs[k].value = data[k];
    });
    updateThemeLive();
}

// --- PLAYER EDITOR LOGIC ---
function initPlayerEditor() {
    const toggle = document.getElementById('game-editor-toggle');
    const panel = document.getElementById('player-settings-panel');
    
    if(toggle && panel) {
        toggle.addEventListener('click', () => {
            const isVis = panel.style.display !== 'none';
            panel.style.display = isVis ? 'none' : 'block';
        });
    }

    // Apply Live Changes to Player Variables
    Object.keys(playerInputs).forEach(key => {
        playerInputs[key].addEventListener('input', (e) => {
            const val = e.target.value;
            const unit = key === 'color' ? '' : 'px';
            document.documentElement.style.setProperty(`--player-${key}`, val + unit);
            
            // Special case for bezel color affecting modal bg
            if(key === 'color') {
                document.documentElement.style.setProperty('--modal-bg', val);
            }
        });
    });
}

// --- STANDARD GAME/PAGE LOGIC (Simplified for brevity) ---
let currentPage = 0;
const pagesWrapper = document.getElementById('game-pages-wrapper');
const prevBtn = document.getElementById('prev-page-button');
const nextBtn = document.getElementById('next-page-button');

function updatePage() {
    if(!pagesWrapper) return;
    pagesWrapper.style.transform = `translateX(${-currentPage * 100}%)`;
    
    // Simple Dot Logic
    const dots = document.getElementById('page-indicator-dots');
    if(dots) {
        dots.innerHTML = '';
        const total = document.querySelectorAll('.game-buttons').length;
        for(let i=0; i<total; i++) {
            const d = document.createElement('div');
            d.className = `page-dot ${i===currentPage?'active':''}`;
            d.onclick = () => { currentPage = i; updatePage(); };
            dots.appendChild(d);
        }
    }
}

if(prevBtn) prevBtn.onclick = () => { if(currentPage > 0) currentPage--; updatePage(); };
if(nextBtn) nextBtn.onclick = () => { if(currentPage < 14) currentPage++; updatePage(); };

// --- SEARCH LOGIC ---
function initSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    
    if(!input) return;
    
    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        results.innerHTML = '';
        if(!q) return;

        const allBtns = document.querySelectorAll('.game-button:not(.placeholder)');
        allBtns.forEach(btn => {
            const txt = (btn.title || btn.textContent).toLowerCase();
            if(txt.includes(q)) {
                const div = document.createElement('div');
                div.className = 'uni-list-item';
                div.textContent = btn.title || "Game";
                div.onclick = () => {
                    // Navigate and highlight
                    const parentPage = btn.closest('.game-buttons');
                    const pages = Array.from(document.querySelectorAll('.game-buttons'));
                    currentPage = pages.indexOf(parentPage);
                    updatePage();
                    closeAllMenus();
                    
                    // Highlight effect
                    setTimeout(() => {
                        btn.style.transform = 'scale(1.2)';
                        btn.style.borderColor = 'var(--btn-hover-color)';
                        setTimeout(() => { btn.style.transform = ''; btn.style.borderColor = ''; }, 1000);
                    }, 300);
                };
                results.appendChild(div);
            }
        });
    });
}

// --- MODAL LOGIC ---
function initGameModal() {
    const modal = document.getElementById('game-modal');
    const iframe = document.getElementById('game-iframe');
    const close = document.getElementById('close-game-modal-btn');
    
    document.querySelectorAll('.game-button').forEach(btn => {
        if(btn.classList.contains('placeholder')) return;
        btn.onclick = (e) => {
            e.preventDefault();
            const url = btn.dataset.href;
            if(url) {
                iframe.src = url;
                modal.classList.add('active');
                document.getElementById('game-modal-title').textContent = btn.title;
            }
        };
    });

    if(close) close.onclick = () => {
        modal.classList.remove('active');
        iframe.src = 'about:blank';
    };
}

// Helpers
function showToast(msg) {
    const t = document.getElementById('toast-notification');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}
function playSound(au) { if(au) { au.currentTime=0; au.play().catch(()=>{}); } }
function updateDateTime() {
    const now = new Date();
    const t = document.getElementById('current-time');
    if(t) t.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
