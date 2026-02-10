/**
 * UPDATED SCRIPT.JS
 * Features: Full Music List, Dark Theme, Data Manager, Universal 3DS Menus, Iframe Customization
 */

// --- CORE VARIABLES ---
const bgMusic = document.getElementById('bg-music');
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');
const prevPageSound = document.getElementById('prev-page-sound');
const nextPageSound = document.getElementById('next-page-sound');
const themeClickSound = document.getElementById('theme-click-sound');
const menuHoverSound = document.getElementById('menu-hover-sound');
const gameOpenSound = document.getElementById('game-open-sound');
const gameCloseSound = document.getElementById('game-close-sound');

const gamePagesWrapper = document.getElementById('game-pages-wrapper');
const pageIndicatorDots = document.getElementById('page-indicator-dots');
const prevPageButton = document.getElementById('prev-page-button');
const nextPageButton = document.getElementById('next-page-button');
let currentPage = 0;

// --- IFRAME MODAL LOGIC ---
const gameModal = document.getElementById('game-modal');
const gameModalContainer = document.getElementById('game-modal-container');
const gameModalTitle = document.getElementById('game-modal-title');
const gameIframe = document.getElementById('game-iframe');
const closeGameModalBtn = document.getElementById('close-game-modal-btn');

let wasMusicPlayingBeforeGame = false;
let currentGameUrl = '';

// Toast Logic
const toast = document.getElementById('toast-notification');
let toastTimeout;

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Audio Helper
function playSound(audioElement) {
    if (audioElement && typeof audioElement.play === 'function') {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }
}

// --- MUSIC DATA (Restored) ---
const songs = [
    { name: 'Wii U Mii Maker', url: '/assets/Wii U OST - Mii Maker (Mii Editor).flac' },
    { name: 'Droopy likes your face', url: '/assets/Droopy likes your face.flac' },
    { name: 'Sleepville', url: '/assets/Sleepville - Little Man Legends.mp3' },
    { name: 'Beneath the Mask', url: '/assets/Beneath the Mask -instrumental version- - Lyn.mp3' },
    { name: 'Training day', url: '/assets/MTraining Day.mp3' },
    { name: 'Super Mario Galaxy - File Select', url: '/assets/Super Mario Galaxy - File Select.mp3' },
    { name: 'Pokemon B&W 2 - Aspertia City', url: '/assets/Pokemon Black & White 2 OST - Aspertia City.mp3' },
    { name: '3_31 (Persona 3)', url: '/assets/3_31.mp3' },
    { name: 'Harry Mack - Reporting In', url: '/assets/Harry Mack - Reporting In.mp3' },
    { name: 'Nintendo DSi - Main Menu', url: '/assets/Nintendo DSi - Main Menu Theme.mp3' },
    { name: 'Takeshi Abo - Lightgreen', url: '/assets/Takeshi Abo - Lightgreen.mp3' },
    { name: 'Takeshi Abo - Illusions', url: '/assets/Takeshi Abo - Illusions.mp3' },
    { name: 'Garoad - Safe Haven', url: '/assets/Garoad - Safe Haven.mp3' }
];

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    initApp();
});

function initApp() {
    updatePage();
    populateMusicMenu();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Init Themes
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            applyTheme(theme);
            restoreThemeInputs(theme);
            if (theme.rainEnabled) toggleRain(true);
        } catch (e) { console.error(e); }
    } else {
        if(document.getElementById('input-preset')) document.getElementById('input-preset').value = 'custom';
    }

    const savedBGM = localStorage.getItem('qbbic-bgm');
    if (savedBGM && savedBGM !== 'none') {
        const song = songs.find(s => s.url === savedBGM);
        playBGM(savedBGM, song ? song.name : "Unknown");
    }

    init3DSMenuLogic();
}

function restoreThemeInputs(theme) {
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const setCheck = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };

    setVal('input-bg', theme.bg || '#e6e8e7');
    setVal('input-bar', theme.bar || '#c9c5c2');
    setVal('input-static', theme.static || '#555555');
    setVal('input-shape', theme.shape || 'squircle');
    setVal('input-font', theme.font || 'PopHappiness');
    setVal('input-layout', theme.displayMode || 'grid');
    setVal('input-noise-type', theme.noiseType || 'default');
    setVal('input-wii-btn-bg', theme.wiiBtnBg || '#ffffff');
    setVal('input-modal-bg', theme.modalBg || '#f7f7f7');
    setVal('input-modal-border', theme.modalBorder || '#d4d4d4');
    setVal('input-modal-blur', theme.modalBlur || '10');

    if (theme.layout) {
        setCheck('check-show-home', theme.layout.home !== false);
        setCheck('check-show-search', theme.layout.search !== false);
        setCheck('check-show-clock', theme.layout.clock !== false);
        
        if(theme.layout.rain) {
            setCheck('check-rain-shawarma', true);
            toggleRain(true);
        }
    }
}

// --- PAGE NAVIGATION ---
function updatePage() {
    if(!gamePagesWrapper) return;
    const offset = -currentPage * 100;
    gamePagesWrapper.style.transform = `translateX(${offset}%)`;

    const allGamePages = document.querySelectorAll('.game-buttons');
    allGamePages.forEach((page, index) => {
        page.style.pointerEvents = (index === currentPage) ? 'auto' : 'none';
    });

    if(pageIndicatorDots) {
        pageIndicatorDots.innerHTML = '';
        for (let i = 0; i < allGamePages.length; i++) {
            const dot = document.createElement('div');
            dot.classList.add('page-dot');
            if (i === currentPage) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentPage = i;
                updatePage();
                playSound(clickSound);
            });
            pageIndicatorDots.appendChild(dot);
        }
    }
    
    if(prevPageButton) prevPageButton.classList.toggle('disabled', currentPage === 0);
    if(nextPageButton) nextPageButton.classList.toggle('disabled', currentPage === allGamePages.length - 1);
}

if(prevPageButton) prevPageButton.addEventListener('click', () => { if (currentPage > 0) { currentPage--; updatePage(); playSound(prevPageSound); } });
if(nextPageButton) nextPageButton.addEventListener('click', () => { const allGamePages = document.querySelectorAll('.game-buttons'); if (currentPage < allGamePages.length - 1) { currentPage++; updatePage(); playSound(nextPageSound); } });

// --- GAME CLICK ---
document.querySelectorAll('.game-button').forEach(btn => {
    if (btn.classList.contains('placeholder')) return;
    btn.addEventListener('mouseenter', () => playSound(hoverSound));
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = btn.dataset.href;
        const title = btn.title || "Game";
        if (url && url !== '#') openGameModal(url, title);
    });
});

function openGameModal(url, title) {
    playSound(gameOpenSound);
    if(bgMusic) wasMusicPlayingBeforeGame = !bgMusic.paused;
    if(bgMusic) bgMusic.pause();
    currentGameUrl = url;
    if(gameModalTitle) gameModalTitle.textContent = title;

    gameModal.style.display = 'flex';
    setTimeout(() => gameModal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';

    gameIframe.src = url;
    gameIframe.onload = function() { this.contentWindow.focus(); };
    gameModalContainer.classList.add('crt-animate-open');
    showToast(`Launching ${title}...`);
}

function closeGameModal() {
    playSound(gameCloseSound);
    gameModalContainer.classList.remove('crt-animate-open');
    gameModalContainer.classList.add('crt-animate-close');
    setTimeout(() => {
        gameModal.classList.remove('active');
        setTimeout(() => {
            gameModal.style.display = 'none';
            gameIframe.src = 'about:blank';
            gameModalContainer.classList.remove('crt-animate-close');
            currentGameUrl = '';
            document.body.style.overflow = '';
            if (wasMusicPlayingBeforeGame && bgMusic) bgMusic.play().catch(() => {});
        }, 300);
    }, 400);
}

if(closeGameModalBtn) closeGameModalBtn.addEventListener('click', closeGameModal);

// --- MODAL CONTROLS ---
const btnReload = document.getElementById('reload-game-btn');
if(btnReload) btnReload.addEventListener('click', () => { if (gameIframe.src) gameIframe.src = gameIframe.src; });

const btnNewTab = document.getElementById('open-new-tab-btn');
if(btnNewTab) btnNewTab.addEventListener('click', () => { if (currentGameUrl) window.open(currentGameUrl, '_blank'); });

const btnBlank = document.getElementById('open-blank-btn');
if(btnBlank) btnBlank.addEventListener('click', () => {
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
        newWindow.document.write(`<!DOCTYPE html><html lang="en"><head><title>${gameModalTitle.textContent}</title><style>body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }</style></head><body><iframe src="${currentGameUrl}" style="width: 100vw; height: 100vh; border: none;" allowfullscreen></iframe></body></html>`);
        newWindow.document.close();
    }
});

const btnFullscreen = document.getElementById('fullscreen-btn');
if(btnFullscreen) btnFullscreen.addEventListener('click', () => {
    const requestFS = gameIframe.requestFullscreen || gameIframe.mozRequestFullScreen || gameIframe.webkitRequestFullscreen || gameIframe.msRequestFullscreen;
    if (requestFS) requestFS.call(gameIframe);
});

// --- THEME MAKER ---
const inputBg = document.getElementById('input-bg');
const inputBar = document.getElementById('input-bar');
const inputStatic = document.getElementById('input-static');
const inputShape = document.getElementById('input-shape');
const inputFont = document.getElementById('input-font');
const inputLayout = document.getElementById('input-layout');
const inputNoise = document.getElementById('input-noise-type');
const inputWiiBtnBg = document.getElementById('input-wii-btn-bg');
const inputModalBg = document.getElementById('input-modal-bg');
const inputModalBorder = document.getElementById('input-modal-border');
const inputModalBlur = document.getElementById('input-modal-blur');
const inputPreset = document.getElementById('input-preset');

// --- PRESETS ---
const themePresets = {
    wii: { 
        bg: '#e6e8e7', bar: '#c9c5c2', static: '#555555', wiiBtnBg: '#ffffff', 
        modalBg: '#f7f7f7', modalBorder: '#d4d4d4', modalBlur: '10',
        shape: 'squircle', font: 'PopHappiness', displayMode: 'grid', noiseType: 'default',
        layout: { home: true, search: true, clock: true } 
    },
    dark: { 
        bg: '#121212', bar: '#1f1f1f', static: '#e0e0e0', wiiBtnBg: '#2c2c2c', 
        modalBg: '#1e1e1e', modalBorder: '#333333', modalBlur: '15',
        shape: 'round', font: 'sans-serif', displayMode: 'grid', noiseType: 'none',
        layout: { home: true, search: true, clock: true } 
    }
};

function saveThemeToStorage(themeObj) {
    if(inputPreset) themeObj.preset = inputPreset.value;
    const checkRain = document.getElementById('check-rain-shawarma');
    if(checkRain) themeObj.rainEnabled = checkRain.checked;
    try { localStorage.setItem('customTheme', JSON.stringify(themeObj)); } catch (e) {}
}

function applyTheme(themeObj) {
    const { bg, bar, static, shape, font, wiiBtnBg, modalBg, modalBorder, modalBlur, displayMode, noiseType } = themeObj;

    const r = document.documentElement;
    r.style.setProperty('--bg-color', bg);
    r.style.setProperty('--bar-color', bar);
    r.style.setProperty('--static-color', static);
    r.style.setProperty('--wii-btn-bg', wiiBtnBg || '#ffffff');
    r.style.setProperty('--modal-bg', modalBg || '#f7f7f7');
    r.style.setProperty('--modal-border', modalBorder || '#d4d4d4');
    r.style.setProperty('--modal-backdrop-blur', (modalBlur || 10) + 'px');

    const fontVal = font === 'monospace' ? "'Courier New', monospace" : (font === 'sans-serif' ? "Arial, sans-serif" : "'PopHappiness', sans-serif");
    r.style.setProperty('--main-font', fontVal);

    let btnRad = '12px', cardRad = '25px';
    if (shape === 'square') { btnRad = '0px'; cardRad = '0px'; }
    else if (shape === 'rounded-square') { btnRad = '8px'; cardRad = '8px'; }
    else if (shape === 'squircle') { btnRad = '18px'; cardRad = '35px'; }
    else if (shape === 'round') { btnRad = '50%'; cardRad = '25px'; }

    r.style.setProperty('--btn-radius', btnRad);
    r.style.setProperty('--card-radius', cardRad);

    document.querySelectorAll('.game-buttons').forEach(el => {
        el.className = 'game-buttons';
        if (displayMode && displayMode !== 'grid') el.classList.add('layout-' + displayMode);
    });

    document.body.classList.remove('noise-default', 'noise-scanlines', 'noise-none');
    document.body.classList.add('noise-' + (noiseType || 'default'));

    if (themeObj.layout) {
        const setDisp = (id, show) => { const el = document.getElementById(id); if(el) el.style.display = show ? 'flex' : 'none'; };
        setDisp('wii-menu-button', themeObj.layout.home !== false);
        setDisp('data-menu-toggle', themeObj.layout.search !== false);
        setDisp('wii-date-time-display', themeObj.layout.clock !== false);
    }
    
    const encodedColor = encodeURIComponent(static);
    const svg = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="10" fill="none"/><path d="M 5 0 L 5 10" stroke="${encodedColor}" stroke-width="1" opacity="0.4"/></svg>')`;
    document.body.style.backgroundImage = svg;

    saveThemeToStorage(themeObj);
}

function getCurrentThemeObj() {
    const getChk = (id) => { const el = document.getElementById(id); return el ? el.checked : true; };
    return {
        bg: inputBg.value, bar: inputBar.value, static: inputStatic.value, shape: inputShape.value,
        font: inputFont.value, displayMode: inputLayout.value, noiseType: inputNoise.value,
        wiiBtnBg: inputWiiBtnBg.value, modalBg: inputModalBg.value, modalBorder: inputModalBorder.value,
        modalBlur: inputModalBlur.value,
        layout: {
            home: getChk('check-show-home'), search: getChk('check-show-search'),
            clock: getChk('check-show-clock')
        }
    };
}

// Preset Change
if(inputPreset) {
    inputPreset.addEventListener('change', (e) => {
        if (e.target.value === 'custom') return;
        const selected = themePresets[e.target.value];
        if (selected) {
            updateInputsFromTheme(selected);
            applyTheme(selected);
            playSound(clickSound);
            showToast(`Loaded ${e.target.options[e.target.selectedIndex].text}`);
        }
    });
}

// Manual Input Changes
const manualInputs = [inputBg, inputBar, inputStatic, inputShape, inputFont, inputLayout, inputNoise, inputWiiBtnBg, inputModalBg, inputModalBorder, inputModalBlur];
manualInputs.forEach(input => {
    if(!input) return;
    input.addEventListener('input', () => {
        if(inputPreset) inputPreset.value = 'custom';
        applyTheme(getCurrentThemeObj());
    });
});

// Reset
const btnReset = document.getElementById('reset-theme-btn');
if(btnReset) btnReset.addEventListener('click', () => {
    const defaults = themePresets.wii;
    updateInputsFromTheme(defaults);
    inputPreset.value = 'wii';
    applyTheme(defaults);
    playSound(clickSound);
    showToast("Theme Reset");
});

// JSON Save/Load (Theme)
const btnSaveTheme = document.getElementById('save-theme-btn');
if(btnSaveTheme) btnSaveTheme.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getCurrentThemeObj()));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = "qbbic_theme.json";
    anchor.click();
});

const btnLoadTheme = document.getElementById('load-theme-btn');
const inputLoadTheme = document.getElementById('input-load-theme');
if(btnLoadTheme && inputLoadTheme) {
    btnLoadTheme.addEventListener('click', () => inputLoadTheme.click());
    inputLoadTheme.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const theme = JSON.parse(event.target.result);
                applyTheme(theme);
                restoreThemeInputs(theme);
                if(inputPreset) inputPreset.value = 'custom';
                showToast("Theme Loaded!");
            } catch (e) { showToast("Error Loading File"); }
        };
        reader.readAsText(file);
    });
}

// --- MUSIC LOGIC ---
const volumeSlider = document.getElementById('volume-slider');
const nowPlayingText = document.getElementById('now-playing');

if(volumeSlider && bgMusic) {
    volumeSlider.addEventListener('input', (e) => { bgMusic.volume = e.target.value; });
}

function playBGM(url, name) {
    if(!bgMusic) return;
    bgMusic.src = url;
    if(volumeSlider) bgMusic.volume = volumeSlider.value;
    bgMusic.play().catch(e => console.log("Autoplay blocked"));
    localStorage.setItem('qbbic-bgm', url);
    if(nowPlayingText) nowPlayingText.textContent = name || "Unknown Track";
}

function populateMusicMenu() {
    const list = document.getElementById('music-list');
    if(!list) return;
    list.innerHTML = ''; 
    songs.forEach((song) => {
        const div = document.createElement('div');
        div.className = 'nds-item';
        div.innerHTML = `<span class="nds-item-name">${song.name}</span>`;
        div.onclick = () => {
            playBGM(song.url, song.name);
            showToast("Playing: " + song.name);
        };
        list.appendChild(div);
    });
}

const btnStopMusic = document.getElementById('music-option-stop');
if(btnStopMusic) btnStopMusic.addEventListener('click', () => {
    if(bgMusic) bgMusic.pause();
    localStorage.setItem('qbbic-bgm', 'none');
    if(nowPlayingText) nowPlayingText.textContent = "Stopped";
    showToast("Music Stopped");
});

const btnRandomMusic = document.getElementById('music-option-random');
if(btnRandomMusic) btnRandomMusic.addEventListener('click', () => {
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    playBGM(randomSong.url, randomSong.name);
    showToast("Playing Random");
});

// --- TIME ---
function updateDateTime() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if(timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if(dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

// --- SHAWARMA RAIN ---
const checkRain = document.getElementById('check-rain-shawarma');
let rainInterval;
function createShawarma() {
    if(document.querySelectorAll('.shawarma-item').length > 30) return;
    const el = document.createElement('div');
    el.innerText = '🌯';
    el.classList.add('shawarma-item');
    el.style.position = 'fixed';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-60px';
    el.style.fontSize = (Math.random() * 30 + 20) + 'px';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    const duration = Math.random() * 2000 + 2000;
    const animation = el.animate([{ transform: 'translateY(0)' }, { transform: `translateY(110vh)` }], { duration: duration, easing: 'linear' });
    animation.onfinish = () => el.remove();
}
function toggleRain(enabled) {
    if (enabled && !rainInterval) { rainInterval = setInterval(createShawarma, 200); }
    else if (!enabled) { clearInterval(rainInterval); rainInterval = null; document.querySelectorAll('.shawarma-item').forEach(el => el.remove()); }
}
if(checkRain) checkRain.addEventListener('change', (e) => {
    toggleRain(e.target.checked);
    if(inputPreset) inputPreset.value = 'custom';
    saveThemeToStorage(getCurrentThemeObj());
});

// --- MENU TOGGLING SYSTEM (UNIVERSAL) ---
function closeAllMenus() {
    document.querySelectorAll('.nds-theme-shop').forEach(el => el.style.display = 'none');
}

function setupMenuToggle(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    const closeBtn = document.getElementById('close-' + menuId.replace('#','') + '-btn') || menu.querySelector('.nds-close-btn');
    
    if(btn && menu) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isVisible = menu.style.display === 'flex';
            closeAllMenus();
            if(!isVisible) {
                menu.style.display = 'flex'; // 3DS menus are flex
                playSound(themeClickSound);
            }
        });
    }
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            menu.style.display = 'none';
            playSound(themeClickSound);
        });
    }
}

setupMenuToggle('theme-menu-toggle', 'theme-menu');
setupMenuToggle('music-menu-toggle', 'music-menu');
setupMenuToggle('wii-menu-button', 'home-menu');
setupMenuToggle('data-menu-toggle', 'data-menu');

// --- DATA MANAGER LOGIC ---
const btnGenBackup = document.getElementById('btn-generate-backup');
const txtExport = document.getElementById('data-export-area');
const btnCopyBackup = document.getElementById('btn-copy-backup');
const btnLoadBackup = document.getElementById('btn-load-backup');
const txtImport = document.getElementById('data-import-area');

if(btnGenBackup) {
    btnGenBackup.addEventListener('click', () => {
        const backup = JSON.stringify(localStorage);
        const encoded = btoa(unescape(encodeURIComponent(backup)));
        txtExport.value = encoded;
    });
}
if(btnCopyBackup) {
    btnCopyBackup.addEventListener('click', () => {
        if(txtExport.value) {
            txtExport.select();
            document.execCommand('copy');
            showToast("Copied to Clipboard!");
        }
    });
}
if(btnLoadBackup) {
    btnLoadBackup.addEventListener('click', () => {
        if(!txtImport.value) return;
        try {
            const decoded = decodeURIComponent(escape(atob(txtImport.value.trim())));
            const data = JSON.parse(decoded);
            
            // Restore
            localStorage.clear();
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
            });
            showToast("Data Restored! Reloading...");
            setTimeout(() => location.reload(), 1000);
        } catch(e) {
            showToast("Invalid Backup String!");
            console.error(e);
        }
    });
}

// --- 3DS PRESET LOGIC ---
function init3DSMenuLogic() {
    const presetItems = document.querySelectorAll('.nds-item[data-val]');
    const hiddenPresetInput = document.getElementById('input-preset');

    if(presetItems.length > 0 && hiddenPresetInput) {
        presetItems.forEach(item => {
            item.addEventListener('click', () => {
                presetItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                const val = item.dataset.val;
                hiddenPresetInput.value = val;
                const selectedTheme = themePresets[val];
                if (selectedTheme) {
                    updateInputsFromTheme(selectedTheme);
                    applyTheme(selectedTheme);
                    playSound(clickSound);
                    showToast(`Theme changed: ${item.querySelector('.nds-item-name').innerText}`);
                }
            });
        });
    }
}

// --- NAV LINKS ---
const navIndex = document.getElementById('nav-index');
if(navIndex) navIndex.addEventListener('click', () => window.location.href = 'index.html');
const navPath = document.getElementById('nav-path');
if(navPath) navPath.addEventListener('click', () => window.location.href = 'path.html');
const navSuggestions = document.getElementById('nav-suggestions');
if (navSuggestions) navSuggestions.addEventListener('click', () => window.open('https://forms.gle/VFSHz9TwhpWPgyGY6', '_blank'));
const navDiscord = document.getElementById('nav-discord');
if (navDiscord) navDiscord.addEventListener('click', () => window.open('https://discord.gg/TRguRu7mwc', '_blank'));

// --- TIME TRAVEL SECRET ---
const clockDisplay = document.getElementById('wii-date-time-display');
let timeState = 0;
if(clockDisplay) {
    clockDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        timeState = (timeState + 1) % 3;
        document.body.classList.remove('time-travel-future', 'time-travel-past');
        if (timeState === 1) { document.body.classList.add('time-travel-future'); showToast("WARPING TO 3025"); } 
        else if (timeState === 2) { document.body.classList.add('time-travel-past'); showToast("WARPING TO 1950"); } 
        else { showToast("PRESENT DAY"); playSound(clickSound); }
    });
}
