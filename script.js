/**
 * UPDATED SCRIPT.JS
 * Improvements: Memory Card System, UI Refresh, Keyboard Nav, Audio Safety, Performance Fixes
 */

// --- CORE VARIABLES ---
const bgMusic = document.getElementById('bg-music');
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');
const prevPageSound = document.getElementById('prev-page-sound');
const nextPageSound = document.getElementById('next-page-sound');
const themeClickSound = document.getElementById('theme-click-sound');
const searchClickSound = document.getElementById('search-click-sound');
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

// Audio Helper to prevent crashes if ID is missing
function playSound(audioElement) {
    if (audioElement && typeof audioElement.play === 'function') {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }
}

// --- MUSIC DATA ---
const songs = [{
    name: 'Wii U Mii Maker',
    url: '/assets/Wii U OST - Mii Maker (Mii Editor).flac'
}, {
    name: 'Droopy likes your face',
    url: '/assets/Droopy likes your face.flac'
}, {
    name: 'Sleepville',
    url: '/assets/Sleepville - Little Man Legends.mp3'
}, {
    name: 'Beneath the Mask',
    url: '/assets/Beneath the Mask -instrumental version- - Lyn.mp3'
}, {
    name: 'Training day',
    url: '/assets/MTraining Day.mp3'
}, {
    name: 'Super Mario Galaxy - File Select',
    url: '/assets/Super Mario Galaxy - File Select.mp3'
}, {
    name: 'Pokemon Black & White 2 OST - Aspertia City',
    url: '/assets/Pokemon Black & White 2 OST - Aspertia City.mp3'
}, {
    name: '3_31 (Persona 3)',
    url: '/assets/3_31.mp3'
}, {
    name: 'Harry Mack - Reporting In',
    url: '/assets/Harry Mack - Reporting In.mp3'
}, {
    name: 'Nintendo DSi - Main Menu Theme',
    url: '/assets/Nintendo DSi - Main Menu Theme.mp3'
}, {
    name: 'Takeshi Abo - Lightgreen',
    url: '/assets/Takeshi Abo - Lightgreen.mp3'
}, {
    name: 'Takeshi Abo - Illusions',
    url: '/assets/Takeshi Abo - Illusions.mp3'
}, {
    name: 'Garoad - Safe Haven',
    url: '/assets/Garoad - Safe Haven.mp3'
}, ];

// --- INITIALIZATION WRAPPER ---
window.addEventListener('load', () => {
    initApp();
    indexAllGames(); // Index games for search
});

function initApp() {
    updatePage();
    populateMusicMenu();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // --- KEYBOARD NAVIGATION SUPPORT (NEW) ---
    document.addEventListener('keydown', (e) => {
        // If modal is open, Escape closes it
        if (gameModal.style.display === 'flex') {
            if (e.key === 'Escape') closeGameModal();
            return;
        }

        // If search is open, Escape closes it
        const searchContainer = document.getElementById('search-container');
        if (searchContainer && searchContainer.style.display === 'flex') {
            if (e.key === 'Escape') {
                searchContainer.style.display = 'none';
            }
            return;
        }

        // Page Navigation
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft') {
                prevPageButton.click();
            } else if (e.key === 'ArrowRight') {
                nextPageButton.click();
            }
        }
    });

    // Init Themes
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            applyTheme(theme);
            if (theme.preset) document.getElementById('input-preset').value = theme.preset;
            else document.getElementById('input-preset').value = 'custom';
            
            // Restore Inputs
            restoreThemeInputs(theme);

            // Restore Rain
            if (theme.rainEnabled) {
                const rainCheck = document.getElementById('check-rain-shawarma');
                if(rainCheck) rainCheck.checked = true;
                toggleRain(true);
            }
        } catch (e) {
            console.error("Theme load error", e);
        }
    } else {
        const presetInput = document.getElementById('input-preset');
        if(presetInput) presetInput.value = 'custom';
    }

    const savedBGM = localStorage.getItem('qbbic-bgm');
    if (savedBGM && savedBGM !== 'none') {
        const song = songs.find(s => s.url === savedBGM);
        playBGM(savedBGM, song ? song.name : "Unknown");
    }

    // Load Memory Card Notes
    const savedNotes = localStorage.getItem('qbbic-notes');
    if(savedNotes) {
        const noteArea = document.getElementById('memory-card-notes');
        if(noteArea) noteArea.value = savedNotes;
    }

    // Initialize 3DS Menu Logic (Moved here for safety)
    init3DSMenuLogic();
}

function restoreThemeInputs(theme) {
    // Helper to safely set values if elements exist
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const setCheck = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };

    setVal('input-bg', theme.bg || '#e6e8e7');
    setVal('input-bar', theme.bar || '#c9c5c2');
    setVal('input-static', theme.static || '#555555');
    setVal('input-shape', theme.shape || 'squircle');
    setVal('input-font', theme.font || 'PopHappiness');
    setVal('input-opacity', theme.opacity || 1);
    setVal('input-layout', theme.displayMode || 'grid');
    setVal('input-noise-type', theme.noiseType || 'default');
    setVal('input-btn-hover', theme.btnHover || '#40c4ff');
    setVal('input-wii-btn-bg', theme.wiiBtnBg || '#ffffff');
    setVal('input-modal-bg', theme.modalBg || '#f7f7f7');
    setVal('input-modal-border', theme.modalBorder || '#d4d4d4');

    if (theme.layout) {
        setCheck('check-show-home', theme.layout.home !== false);
        setCheck('check-show-search', theme.layout.search !== false);
        setCheck('check-show-clock', theme.layout.clock !== false);
        setCheck('check-show-music', theme.layout.music !== false);
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

if(prevPageButton) {
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updatePage();
            playSound(prevPageSound);
        }
    });
}

if(nextPageButton) {
    nextPageButton.addEventListener('click', () => {
        const allGamePages = document.querySelectorAll('.game-buttons');
        if (currentPage < allGamePages.length - 1) {
            currentPage++;
            updatePage();
            playSound(nextPageSound);
        }
    });
}

// --- GAME CLICK LOGIC ---
document.querySelectorAll('.game-button').forEach(btn => {
    if (btn.classList.contains('placeholder')) return;
    btn.addEventListener('mouseenter', () => playSound(hoverSound));
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = btn.dataset.href;
        const title = btn.title || "Game";
        if (url && url !== '#') {
            openGameModal(url, title);
        }
    });
});

function openGameModal(url, title) {
    playSound(gameOpenSound);
    if(bgMusic) wasMusicPlayingBeforeGame = !bgMusic.paused;
    if(bgMusic) bgMusic.pause();
    currentGameUrl = url;
    if(gameModalTitle) gameModalTitle.textContent = title;

    // Show Modal
    gameModal.style.display = 'flex';
    setTimeout(() => gameModal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';

    gameIframe.src = 'about:blank';
    gameModalContainer.classList.remove('crt-animate-open', 'crt-animate-close');

    gameIframe.src = url;
    gameIframe.onload = function() {
        this.contentWindow.focus();
    };
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

// --- MENU BAR SOUNDS ---
document.querySelectorAll('.wii-bottom-bar .wii-button').forEach(btn => {
    btn.addEventListener('mouseenter', () => playSound(menuHoverSound));
});

// --- ADVANCED MODAL BUTTONS ---
const btnReload = document.getElementById('reload-game-btn');
if(btnReload) btnReload.addEventListener('click', () => {
    if (gameIframe.src && gameIframe.src !== 'about:blank') {
        gameIframe.src = gameIframe.src;
        showToast("Reloading game...");
        setTimeout(() => { if(gameIframe.contentWindow) gameIframe.contentWindow.focus(); }, 500);
    }
});

const btnNewTab = document.getElementById('open-new-tab-btn');
if(btnNewTab) btnNewTab.addEventListener('click', () => {
    if (currentGameUrl) window.open(currentGameUrl, '_blank');
});

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

// --- THEME MAKER VARIABLES ---
const inputBg = document.getElementById('input-bg');
const inputBar = document.getElementById('input-bar');
const inputStatic = document.getElementById('input-static');
const inputShape = document.getElementById('input-shape');
const inputFont = document.getElementById('input-font');
const inputOpacity = document.getElementById('input-opacity');
const inputBgImage = document.getElementById('input-bg-image');
const inputBgUpload = document.getElementById('input-bg-upload');

const checkHome = document.getElementById('check-show-home');
const checkSearch = document.getElementById('check-show-search');
const checkClock = document.getElementById('check-show-clock');
const checkMusic = document.getElementById('check-show-music');
const inputBtnHover = document.getElementById('input-btn-hover');

const inputLayout = document.getElementById('input-layout');
const inputNoise = document.getElementById('input-noise-type');

/* NEW INPUTS */
const inputWiiBtnBg = document.getElementById('input-wii-btn-bg');
const inputModalBg = document.getElementById('input-modal-bg');
const inputModalBorder = document.getElementById('input-modal-border');

const btnReset = document.getElementById('reset-theme-btn');
const inputPreset = document.getElementById('input-preset');

// PRESET DATA CONFIGURATION
const themePresets = {
    wii: { bg: '#e6e8e7', bar: '#c9c5c2', static: '#555555', wiiBtnBg: '#ffffff', modalBg: '#f7f7f7', modalBorder: '#d4d4d4', shape: 'squircle', font: 'PopHappiness', opacity: 1, bgImage: '', btnHover: '#40c4ff', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-rainbow': { bg: '#f0f0f0', bar: '#ffadad', static: '#ff6b6b', wiiBtnBg: '#fff0f0', modalBg: '#fff0f0', modalBorder: '#ffadad', shape: 'round', font: 'PopHappiness', opacity: 1, bgImage: '', btnHover: '#ffd6a5', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-trans': { bg: '#f5fbff', bar: '#F5A9B8', static: '#5BCEFA', wiiBtnBg: '#ffffff', modalBg: '#ffffff', modalBorder: '#5BCEFA', shape: 'squircle', font: 'sans-serif', opacity: 1, bgImage: '', btnHover: '#ffffff', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-bi': { bg: '#f3e6fa', bar: '#D00070', static: '#0038A8', wiiBtnBg: '#f3e6fa', modalBg: '#f3e6fa', modalBorder: '#D00070', shape: 'rounded-square', font: 'sans-serif', opacity: 1, bgImage: '', btnHover: '#9B4F96', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-pan': { bg: '#fffacd', bar: '#ff218c', static: '#00b8ff', wiiBtnBg: '#ffffea', modalBg: '#ffffea', modalBorder: '#ff218c', shape: 'round', font: 'PopHappiness', opacity: 1, bgImage: '', btnHover: '#ffd700', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-ace': { bg: '#1a1a1a', bar: '#800080', static: '#a3a3a3', wiiBtnBg: '#333333', modalBg: '#333333', modalBorder: '#800080', shape: 'square', font: 'monospace', opacity: 0.8, bgImage: '', btnHover: '#ffffff', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-enby': { bg: '#fffbea', bar: '#9c59d1', static: '#2c2c2c', wiiBtnBg: '#ffffff', modalBg: '#fffbea', modalBorder: '#9c59d1', shape: 'squircle', font: 'sans-serif', opacity: 1, bgImage: '', btnHover: '#fc4b4b', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-lesbian': { bg: '#fff0f0', bar: '#d53d5e', static: '#a30262', wiiBtnBg: '#ffe6e6', modalBg: '#ffe6e6', modalBorder: '#d53d5e', shape: 'rounded-square', font: 'PopHappiness', opacity: 1, bgImage: '', btnHover: '#ff9a56', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-genderqueer': { bg: '#f9f9f9', bar: '#b57edc', static: '#4a8123', wiiBtnBg: '#ffffff', modalBg: '#ffffff', modalBorder: '#b57edc', shape: 'round', font: 'sans-serif', opacity: 1, bgImage: '', btnHover: '#ffffff', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-intersex': { bg: '#ffdb00', bar: '#7902aa', static: '#4a006a', wiiBtnBg: '#fff5cc', modalBg: '#fff5cc', modalBorder: '#7902aa', shape: 'round', font: 'PopHappiness', opacity: 1, bgImage: '', btnHover: '#ffffff', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } },
    'pride-aro': { bg: '#f0fff0', bar: '#3da542', static: '#000000', wiiBtnBg: '#ffffff', modalBg: '#ffffff', modalBorder: '#3da542', shape: 'square', font: 'monospace', opacity: 1, bgImage: '', btnHover: '#a9a9a9', displayMode: 'grid', noiseType: 'default', layout: { home: true, search: true, clock: true, music: true } }
};

function saveThemeToStorage(themeObj) {
    if(inputPreset) themeObj.preset = inputPreset.value;
    const checkRain = document.getElementById('check-rain-shawarma');
    if(checkRain) themeObj.rainEnabled = checkRain.checked;
    try {
        localStorage.setItem('customTheme', JSON.stringify(themeObj));
    } catch (e) {}
}

function applyTheme(themeObj) {
    const { bg, bar, static, shape, font, opacity, bgImage, layout, btnHover, displayMode, noiseType, wiiBtnBg, modalBg, modalBorder } = themeObj;

    const r = document.documentElement;
    r.style.setProperty('--bg-color', bg);
    r.style.setProperty('--bar-color', bar);
    r.style.setProperty('--static-color', static);
    r.style.setProperty('--wii-btn-bg', wiiBtnBg || '#ffffff');
    r.style.setProperty('--modal-bg', modalBg || '#f7f7f7');
    r.style.setProperty('--modal-border', modalBorder || '#d4d4d4');
    r.style.setProperty('--card-opacity', opacity || 1);
    r.style.setProperty('--btn-hover-color', btnHover || '#40c4ff');

    const fontVal = font === 'monospace' ? "'Courier New', monospace" : (font === 'sans-serif' ? "Arial, sans-serif" : "'PopHappiness', sans-serif");
    r.style.setProperty('--main-font', fontVal);

    let btnRad = '12px', cardRad = '25px', cardClip = 'none';
    if (shape === 'square') { btnRad = '0px'; cardRad = '0px'; }
    else if (shape === 'rounded-square') { btnRad = '8px'; cardRad = '8px'; }
    else if (shape === 'squircle') { btnRad = '18px'; cardRad = '35px'; }
    else if (shape === 'round') { btnRad = '50%'; cardRad = '25px'; }

    r.style.setProperty('--btn-radius', btnRad);
    r.style.setProperty('--card-radius', cardRad);
    r.style.setProperty('--card-clip', cardClip);

    document.querySelectorAll('.game-buttons').forEach(el => {
        el.className = 'game-buttons'; // Reset classes
        if (displayMode && displayMode !== 'grid') el.classList.add('layout-' + displayMode);
    });

    document.body.classList.remove('noise-default', 'noise-scanlines', 'noise-dots', 'noise-none');
    document.body.classList.add('noise-' + (noiseType || 'default'));

    const currentPreset = inputPreset ? inputPreset.value : 'custom';

    if (bgImage && bgImage.trim() !== "") {
        document.body.style.backgroundImage = `url('${bgImage}')`;
        document.body.classList.add('bg-is-image');
        document.body.classList.remove('bg-wii');
    } else {
        document.body.classList.remove('bg-is-image');
        if (currentPreset === 'wii') {
             document.body.classList.add('bg-wii');
             document.body.style.backgroundImage = '';
        } else {
            document.body.classList.remove('bg-wii');
            const encodedColor = encodeURIComponent(static);
            const svg = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="10" fill="none"/><path d="M 5 0 L 5 10" stroke="${encodedColor}" stroke-width="1" opacity="0.4"/></svg>')`;
            document.body.style.backgroundImage = svg;
            document.body.style.backgroundSize = '10px 10px';
        }
    }

    if (layout) {
        const setDisp = (id, show) => { const el = document.getElementById(id); if(el) el.style.display = show ? 'flex' : 'none'; };
        setDisp('wii-menu-button', layout.home !== false);
        setDisp('search-button', layout.search !== false);
        setDisp('music-menu-toggle', layout.music !== false);
        
        const clock = document.getElementById('wii-date-time-display');
        if(clock) clock.style.display = layout.clock !== false ? 'block' : 'none';
    }
    saveThemeToStorage(themeObj);
}

function getCurrentThemeObj() {
    let currentBgImage = inputBgImage ? inputBgImage.value : '';
    const currentBodyBg = document.body.style.backgroundImage;
    if (currentBodyBg.includes('data:image') && !currentBodyBg.includes('svg')) {
        currentBgImage = currentBodyBg.slice(5, -2);
    }
    
    // Safety for checkboxes
    const getChk = (el) => el ? el.checked : true;
    
    return {
        bg: inputBg.value, bar: inputBar.value, static: inputStatic.value, shape: inputShape.value,
        font: inputFont.value, opacity: inputOpacity.value, bgImage: currentBgImage,
        btnHover: inputBtnHover.value, displayMode: inputLayout.value, noiseType: inputNoise.value,
        wiiBtnBg: inputWiiBtnBg.value, modalBg: inputModalBg.value, modalBorder: inputModalBorder.value,
        layout: {
            home: getChk(checkHome), search: getChk(checkSearch),
            clock: getChk(checkClock), music: getChk(checkMusic)
        }
    };
}

function updateInputsFromTheme(theme) {
    restoreThemeInputs(theme);
    if(inputBgImage) inputBgImage.value = theme.bgImage || '';
}

// PRESET LISTENER
if(inputPreset) {
    inputPreset.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') return;
        const selectedTheme = themePresets[val];
        if (selectedTheme) {
            updateInputsFromTheme(selectedTheme);
            applyTheme(selectedTheme);
            playSound(clickSound);
            showToast(`Loaded ${e.target.options[e.target.selectedIndex].text}`);
        }
    });
}

// SWITCH TO CUSTOM ON EDIT
const manualInputs = [inputBg, inputBar, inputStatic, inputShape, inputFont, inputOpacity, checkHome, checkSearch, checkClock, checkMusic, inputBtnHover, inputLayout, inputNoise, inputWiiBtnBg, inputModalBg, inputModalBorder];
manualInputs.forEach(input => {
    if(!input) return;
    input.addEventListener('change', () => {
        if(inputPreset) inputPreset.value = 'custom';
        applyTheme(getCurrentThemeObj());
    });
    if (input.type === 'color' || input.type === 'range') input.addEventListener('input', () => {
        if(inputPreset) inputPreset.value = 'custom';
        applyTheme(getCurrentThemeObj());
    });
});

if(inputBgImage) inputBgImage.addEventListener('change', () => {
    if(inputBgUpload) inputBgUpload.value = '';
    if(inputPreset) inputPreset.value = 'custom';
    applyTheme(getCurrentThemeObj());
});

if(inputBgUpload) inputBgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            const currentTheme = getCurrentThemeObj();
            currentTheme.bgImage = dataUrl;
            inputBgImage.value = '';
            inputPreset.value = 'custom';
            applyTheme(currentTheme);
        };
        reader.readAsDataURL(file);
    }
});

// Reset
if(btnReset) btnReset.addEventListener('click', () => {
    const defaults = themePresets.wii;
    updateInputsFromTheme(defaults);
    inputPreset.value = 'wii';
    applyTheme(defaults);
    playSound(clickSound);
    showToast("Theme Reset");
});

// Save/Load logic
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
                updateInputsFromTheme(theme);
                if(inputPreset) inputPreset.value = 'custom';
                showToast("Theme Loaded!");
            } catch (e) {
                showToast("Error Loading File");
            }
        };
        reader.readAsText(file);
    });
}

// Toggle Menus
const btnThemeToggle = document.getElementById('theme-menu-toggle');
if(btnThemeToggle) btnThemeToggle.addEventListener('click', () => {
    const menu = document.getElementById('theme-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    playSound(themeClickSound);
});

// --- IMPROVED SEARCH LOGIC (Consolidated) ---
const btnSearch = document.getElementById('search-button');
const btnSearchClose = document.getElementById('search-submit-button'); // Acts as close
const inputSearch = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchContainer = document.getElementById('search-container');

// Store all games data for quick access
let allGamesData = [];

function indexAllGames() {
    allGamesData = [];
    const pages = document.querySelectorAll('.game-buttons');
    
    pages.forEach((page, pageIndex) => {
        const buttons = page.querySelectorAll('.game-button');
        buttons.forEach(btn => {
            if (btn.classList.contains('placeholder')) return;
            
            // Get Image URL from inline style
            let bgImage = '';
            if (btn.style.backgroundImage) {
                bgImage = btn.style.backgroundImage.slice(5, -2); // Remove url('...')
            }

            allGamesData.push({
                title: (btn.title || btn.textContent).trim(),
                searchStr: (btn.title || btn.textContent).toLowerCase(),
                element: btn,
                pageIndex: pageIndex,
                image: bgImage
            });
        });
    });
}

// Toggle Search Bar
if (btnSearch) {
    btnSearch.addEventListener('click', () => {
        const isFlex = searchContainer.style.display === 'flex';
        searchContainer.style.display = isFlex ? 'none' : 'flex';
        
        if (!isFlex) {
            inputSearch.value = '';
            if(searchResults) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('has-results');
            }
            if(inputSearch) inputSearch.focus();
            playSound(searchClickSound);
            // Re-index just in case DOM changed
            indexAllGames(); 
        }
    });
}

// Close Button logic
if (btnSearchClose) {
    btnSearchClose.addEventListener('click', () => {
        if(searchContainer) searchContainer.style.display = 'none';
    });
}

// Input Listener (Live Search)
if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if(!searchResults) return;
        searchResults.innerHTML = '';
        
        if (query.length === 0) {
            searchResults.classList.remove('has-results');
            return;
        }

        const matches = allGamesData.filter(game => game.searchStr.includes(query));
        
        if (matches.length > 0) {
            searchResults.classList.add('has-results');
            matches.slice(0, 10).forEach(game => { // Limit to 10 results for performance
                const div = document.createElement('div');
                div.className = 'search-result-item';
                
                // Create HTML for result
                div.innerHTML = `
                    <div class="search-thumb" style="background-image: url('${game.image}')"></div>
                    <span>${game.title} <small style="opacity:0.6; font-size:0.7em">(Page ${game.pageIndex + 1})</small></span>
                `;

                // Click Event
                div.addEventListener('click', () => {
                    launchGameFromSearch(game);
                });

                searchResults.appendChild(div);
            });
        } else {
            searchResults.classList.remove('has-results');
        }
    });

    // Enter Key to select first result
    inputSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstResult = searchResults.querySelector('.search-result-item');
            if (firstResult) firstResult.click();
        }
    });
}

function launchGameFromSearch(gameObj) {
    // 1. Close Search
    if(searchContainer) searchContainer.style.display = 'none';
    
    // 2. Navigate to Page
    currentPage = gameObj.pageIndex;
    updatePage();
    
    // 3. Highlight the specific button
    const btn = gameObj.element;
    
    // Scroll to it if needed (rare in this layout, but good safety)
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add Highlight Animation
    btn.style.transition = "all 0.5s ease";
    btn.style.transform = "scale(1.4)";
    btn.style.zIndex = "100";
    btn.style.boxShadow = "0 0 50px #40c4ff";
    btn.style.borderColor = "#40c4ff";

    playSound(clickSound);

    // Remove Highlight after 1.5s
    setTimeout(() => {
        btn.style.transform = "";
        btn.style.zIndex = "";
        btn.style.boxShadow = "";
        btn.style.borderColor = "";
    }, 1500);
}

document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('search-container');
    if(searchContainer && !e.target.closest('#search-container') && !e.target.closest('#search-button')) {
        // If we click outside, clear visual filters just in case (though new logic doesn't use them)
        if (searchContainer.style.display === 'flex') {
             // Optional: Close search on outside click
             // searchContainer.style.display = 'none';
        }
    }
});

// --- MUSIC LOGIC ---
const volumeSlider = document.getElementById('volume-slider');
const nowPlayingText = document.getElementById('now-playing');

if(volumeSlider && bgMusic) {
    volumeSlider.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value;
    });
}

function playBGM(url, name) {
    if(!bgMusic) return;
    bgMusic.src = url;
    if(volumeSlider) bgMusic.volume = volumeSlider.value;
    bgMusic.play().catch(e => console.log("Autoplay blocked until interaction"));
    localStorage.setItem('qbbic-bgm', url);
    if(nowPlayingText) nowPlayingText.textContent = name || "Unknown Track";
}

function populateMusicMenu() {
    const list = document.getElementById('music-list');
    if(!list) return;
    list.innerHTML = ''; // Clear first to avoid dupes on re-run
    songs.forEach((song, idx) => {
        const div = document.createElement('div');
        div.className = 'music-option';
        div.textContent = song.name;
        div.onclick = () => {
            playBGM(song.url, song.name);
            showToast("Playing: " + song.name);
        };
        list.appendChild(div);
    });
}

const musicToggleBtn = document.getElementById('music-menu-toggle');
if(musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
        const menu = document.getElementById('music-menu');
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
        musicToggleBtn.classList.toggle('active', !isVisible);
        playSound(themeClickSound);

        if (bgMusic && bgMusic.paused && localStorage.getItem('qbbic-bgm') !== 'none') {
            bgMusic.play().catch(() => {});
        }
    });
}

const btnStopMusic = document.getElementById('music-option-stop');
if(btnStopMusic) btnStopMusic.addEventListener('click', () => {
    if(bgMusic) bgMusic.pause();
    localStorage.setItem('qbbic-bgm', 'none');
    if(nowPlayingText) nowPlayingText.textContent = "Stopped";
    document.getElementById('music-menu').style.display = 'none';
    musicToggleBtn.classList.remove('active');
    showToast("Music Stopped");
});

const btnRandomMusic = document.getElementById('music-option-random');
if(btnRandomMusic) btnRandomMusic.addEventListener('click', () => {
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    playBGM(randomSong.url, randomSong.name);
    document.getElementById('music-menu').style.display = 'none';
    musicToggleBtn.classList.remove('active');
    showToast("Playing Random: " + randomSong.name);
});

// --- TIME LOGIC ---
function updateDateTime() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if(timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if(dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

// Global Click Close Logic
document.addEventListener('click', (e) => {
    const themeMenu = document.getElementById('theme-menu');
    const themeToggle = document.getElementById('theme-menu-toggle');
    const musicMenu = document.getElementById('music-menu');
    const searchContainer = document.getElementById('search-container');
    const homeMenu = document.getElementById('home-menu');
    const homeBtn = document.getElementById('wii-menu-button');
    const memMenu = document.getElementById('memory-card-menu');
    const memBtn = document.getElementById('memory-card-button');

    if (themeMenu && themeToggle && !e.target.closest('#theme-menu') && !e.target.closest('#theme-menu-toggle') && !e.target.closest('input') && !e.target.closest('select')) {
        themeMenu.style.display = 'none';
    }
    if (musicMenu && musicToggleBtn && !e.target.closest('#music-menu') && !e.target.closest('#music-menu-toggle')) {
        musicMenu.style.display = 'none';
        musicToggleBtn.classList.remove('active');
    }
    if (searchContainer && btnSearch && !e.target.closest('#search-container') && !e.target.closest('#search-button')) {
        searchContainer.style.display = 'none';
    }
    if (homeMenu && homeBtn && !e.target.closest('#home-menu') && !e.target.closest('#wii-menu-button')) {
        homeMenu.style.display = 'none';
    }
    if (memMenu && memBtn && !e.target.closest('#memory-card-menu') && !e.target.closest('#memory-card-button')) {
        memMenu.style.display = 'none';
    }
});

// --- HOME MENU LOGIC ---
const homeMenu = document.getElementById('home-menu');
const homeBtn = document.getElementById('wii-menu-button');

if(homeBtn && homeMenu) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = homeMenu.style.display === 'block';
        homeMenu.style.display = isVisible ? 'none' : 'block';
        playSound(themeClickSound);
    });
}

// Nav buttons
const navIndex = document.getElementById('nav-index');
if(navIndex) navIndex.addEventListener('click', () => window.location.href = 'index.html');
const navPath = document.getElementById('nav-path');
if(navPath) navPath.addEventListener('click', () => window.location.href = 'path.html');

const navSuggestions = document.getElementById('nav-suggestions');
if (navSuggestions) navSuggestions.addEventListener('click', () => window.open('https://forms.gle/VFSHz9TwhpWPgyGY6', '_blank'));

const navDiscord = document.getElementById('nav-discord');
if (navDiscord) navDiscord.addEventListener('click', () => window.open('https://discord.gg/TRguRu7mwc', '_blank'));

// --- MEMORY CARD LOGIC (NEW) ---
const memBtn = document.getElementById('memory-card-button');
const memMenu = document.getElementById('memory-card-menu');
const memClose = document.getElementById('close-memory-menu-btn');
const memNotes = document.getElementById('memory-card-notes');
const btnSaveNotes = document.getElementById('save-notes-btn');
const btnExportData = document.getElementById('export-data-btn');
const btnImportData = document.getElementById('import-data-btn');
const inputImportData = document.getElementById('input-import-data');

if(memBtn && memMenu) {
    memBtn.addEventListener('click', () => {
        const isVisible = memMenu.style.display === 'block';
        memMenu.style.display = isVisible ? 'none' : 'block';
        playSound(themeClickSound);
    });
}

if(memClose) {
    memClose.addEventListener('click', () => {
        memMenu.style.display = 'none';
        playSound(themeClickSound);
    });
}

if(btnSaveNotes) {
    btnSaveNotes.addEventListener('click', () => {
        const notes = memNotes.value;
        localStorage.setItem('qbbic-notes', notes);
        showToast("Notes Saved to Memory Card!");
        playSound(clickSound);
    });
}

if(btnExportData) {
    btnExportData.addEventListener('click', () => {
        // Collect all localStorage data
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const anchor = document.createElement('a');
        anchor.href = dataStr;
        anchor.download = "qbbic_memory_card.json";
        anchor.click();
        showToast("Data Exported");
    });
}

if(btnImportData && inputImportData) {
    btnImportData.addEventListener('click', () => inputImportData.click());
    inputImportData.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                // Restore logic
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                
                // Re-apply immediate effects
                const savedTheme = localStorage.getItem('customTheme');
                if (savedTheme) applyTheme(JSON.parse(savedTheme));
                
                const savedNotes = localStorage.getItem('qbbic-notes');
                if(savedNotes && memNotes) memNotes.value = savedNotes;

                showToast("Memory Card Loaded!");
                playSound(clickSound);
            } catch (e) {
                showToast("Corrupt Memory Card Data");
            }
        };
        reader.readAsText(file);
    });
}

// --- SHAWARMA RAIN LOGIC (OPTIMIZED) ---
const checkRain = document.getElementById('check-rain-shawarma');
let rainInterval;
const MAX_SHAWARMAS = 50; // Optimization: Cap max items

function createShawarma() {
    if(document.querySelectorAll('.shawarma-item').length > MAX_SHAWARMAS) return;

    const el = document.createElement('div');
    el.innerText = '🌯';
    el.classList.add('shawarma-item'); // Add class for tracking
    el.style.position = 'fixed';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-60px';
    el.style.fontSize = (Math.random() * 30 + 20) + 'px';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.filter = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))';

    document.body.appendChild(el);

    const duration = Math.random() * 2000 + 2000;
    const animation = el.animate([
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: `translateY(110vh) rotate(${Math.random() * 360}deg)` }
    ], {
        duration: duration,
        easing: 'linear'
    });

    animation.onfinish = () => el.remove();
}

function toggleRain(enabled) {
    if (enabled) {
        if (!rainInterval) {
            rainInterval = setInterval(createShawarma, 200);
            showToast("Shawarma Rain Activated! 🌯");
        }
    } else {
        clearInterval(rainInterval);
        rainInterval = null;
        document.querySelectorAll('.shawarma-item').forEach(el => el.remove());
    }
}

if(checkRain) {
    checkRain.addEventListener('change', (e) => {
        toggleRain(e.target.checked);
        if(inputPreset) inputPreset.value = 'custom';
        const currentTheme = getCurrentThemeObj();
        saveThemeToStorage(currentTheme);
    });
}

// --- SECRET TIME TRAVEL FEATURE ---
const clockDisplay = document.getElementById('wii-date-time-display');
let timeState = 0;
const futureAudio = document.getElementById('sound-time-travel-future');
const pastAudio = document.getElementById('sound-time-travel-past');

if(clockDisplay) {
    clockDisplay.addEventListener('click', () => {
        timeState = (timeState + 1) % 3;

        document.body.classList.remove('time-travel-future', 'time-travel-past');

        // Safe pause
        if(futureAudio) { futureAudio.pause(); futureAudio.currentTime = 0; }
        if(pastAudio) { pastAudio.pause(); pastAudio.currentTime = 0; }

        if (timeState === 1) {
            document.body.classList.add('time-travel-future');
            showToast("WARPING TO THE FUTURE >> 3025");
            if(futureAudio) futureAudio.play().catch(e => console.log("Missing future audio"));
        } else if (timeState === 2) {
            document.body.classList.add('time-travel-past');
            showToast("WARPING TO THE PAST << 1950");
            if(pastAudio) pastAudio.play().catch(e => console.log("Missing past audio"));
        } else {
            showToast("RETURNING TO PRESENT");
            playSound(clickSound);
        }
    });
}

// --- NEW NINTENDO 3DS MENU LOGIC (Consolidated) ---
function init3DSMenuLogic() {
    const presetItems = document.querySelectorAll('.nds-item');
    const hiddenPresetInput = document.getElementById('input-preset');
    const closeThemeMenuBtn = document.getElementById('close-theme-menu-btn');

    if(presetItems.length > 0 && hiddenPresetInput) {
        presetItems.forEach(item => {
            item.addEventListener('click', () => {
                // Visual Selection
                presetItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                // Logic Application
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

        // Hook Manual Inputs to clear selection
        const clearSelectionInputs = [inputBg, inputBar, inputWiiBtnBg, inputFont, checkHome, checkSearch];
        clearSelectionInputs.forEach(input => {
            if(input) {
                input.addEventListener('input', () => {
                    presetItems.forEach(i => i.classList.remove('selected'));
                    hiddenPresetInput.value = 'custom';
                });
            }
        });
    }

    if(closeThemeMenuBtn) {
        closeThemeMenuBtn.addEventListener('click', () => {
            const menu = document.getElementById('theme-menu');
            if(menu) menu.style.display = 'none';
            playSound(themeClickSound);
        });
    }
}
