/**
 * UPDATED SCRIPT.JS
 * Improvements: Unified Menus, Modal Customization, Memory Card System
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

// Audio Helper
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
    name: 'Pokemon B&W 2 - Aspertia City',
    url: '/assets/Pokemon Black & White 2 OST - Aspertia City.mp3'
}, {
    name: '3_31 (Persona 3)',
    url: '/assets/3_31.mp3'
}, {
    name: 'Harry Mack - Reporting In',
    url: '/assets/Harry Mack - Reporting In.mp3'
}, {
    name: 'Nintendo DSi - Main Menu',
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

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    initApp();
});

function initApp() {
    updatePage();
    populateMusicMenu();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Keyboard Nav
    document.addEventListener('keydown', (e) => {
        if (gameModal.style.display === 'flex') {
            if (e.key === 'Escape') closeGameModal();
            return;
        }
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft') prevPageButton.click();
            else if (e.key === 'ArrowRight') nextPageButton.click();
        }
    });

    // Load Theme
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            applyTheme(theme);
            if (theme.preset) document.getElementById('input-preset').value = theme.preset;
            restoreThemeInputs(theme);
            if (theme.rainEnabled) {
                const rainCheck = document.getElementById('check-rain-shawarma');
                if(rainCheck) rainCheck.checked = true;
                toggleRain(true);
            }
        } catch (e) { console.error("Theme load error", e); }
    } else {
        const presetInput = document.getElementById('input-preset');
        if(presetInput) presetInput.value = 'custom';
    }

    const savedBGM = localStorage.getItem('qbbic-bgm');
    if (savedBGM && savedBGM !== 'none') {
        const song = songs.find(s => s.url === savedBGM);
        playBGM(savedBGM, song ? song.name : "Unknown");
    }

    // Load Notes
    const savedNotes = localStorage.getItem('qbbic-notes');
    if(savedNotes) {
        const noteArea = document.getElementById('memory-card-notes');
        if(noteArea) noteArea.value = savedNotes;
    }

    init3DSMenuLogic();
}

function restoreThemeInputs(theme) {
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const setCheck = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };

    setVal('input-bg', theme.bg || '#e6e8e7');
    setVal('input-bar', theme.bar || '#c9c5c2');
    setVal('input-shape', theme.shape || 'squircle');
    setVal('input-font', theme.font || 'PopHappiness');
    setVal('input-btn-hover', theme.btnHover || '#40c4ff');
    
    // Updated / New Inputs
    setVal('input-wii-btn-bg', theme.wiiBtnBg || '#ffffff');
    setVal('input-modal-bg', theme.modalBg || '#f7f7f7');
    setVal('input-modal-border', theme.modalBorder || '#d4d4d4');
    setVal('input-backdrop-color', theme.backdropColor || '#000000');
    setVal('input-backdrop-opacity', theme.backdropOpacity || 0.9);
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

    gameIframe.src = 'about:blank';
    gameModalContainer.classList.remove('crt-animate-open', 'crt-animate-close');
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
if(btnReload) btnReload.addEventListener('click', () => { if (gameIframe.src && gameIframe.src !== 'about:blank') { gameIframe.src = gameIframe.src; showToast("Reloading game..."); } });

const btnNewTab = document.getElementById('open-new-tab-btn');
if(btnNewTab) btnNewTab.addEventListener('click', () => { if (currentGameUrl) window.open(currentGameUrl, '_blank'); });

const btnBlank = document.getElementById('open-blank-btn');
if(btnBlank) btnBlank.addEventListener('click', () => { 
    const w = window.open('about:blank', '_blank'); 
    if(w) { w.document.write(`<iframe src="${currentGameUrl}" style="width:100vw;height:100vh;border:none;"></iframe>`); w.document.close(); } 
});

const btnFullscreen = document.getElementById('fullscreen-btn');
if(btnFullscreen) btnFullscreen.addEventListener('click', () => { const r = gameIframe.requestFullscreen || gameIframe.mozRequestFullScreen || gameIframe.webkitRequestFullscreen; if (r) r.call(gameIframe); });

// --- THEME VARIABLES ---
const inputBg = document.getElementById('input-bg');
const inputBar = document.getElementById('input-bar');
const inputShape = document.getElementById('input-shape');
const inputFont = document.getElementById('input-font');
const inputBtnHover = document.getElementById('input-btn-hover');
const inputWiiBtnBg = document.getElementById('input-wii-btn-bg');

// New Modal Inputs
const inputModalBg = document.getElementById('input-modal-bg');
const inputModalBorder = document.getElementById('input-modal-border');
const inputBackdropColor = document.getElementById('input-backdrop-color');
const inputBackdropOpacity = document.getElementById('input-backdrop-opacity');

const btnReset = document.getElementById('reset-theme-btn');
const inputPreset = document.getElementById('input-preset');

const themePresets = {
    wii: { bg: '#e6e8e7', bar: '#c9c5c2', wiiBtnBg: '#ffffff', modalBg: '#f7f7f7', modalBorder: '#d4d4d4', backdropColor: '#000000', backdropOpacity: 0.9, shape: 'squircle', font: 'PopHappiness', btnHover: '#40c4ff' },
    'pride-rainbow': { bg: '#f0f0f0', bar: '#ffadad', wiiBtnBg: '#fff0f0', modalBg: '#fff0f0', modalBorder: '#ffadad', backdropColor: '#330000', backdropOpacity: 0.8, shape: 'round', font: 'PopHappiness', btnHover: '#ffd6a5' },
    'pride-trans': { bg: '#f5fbff', bar: '#F5A9B8', wiiBtnBg: '#ffffff', modalBg: '#ffffff', modalBorder: '#5BCEFA', backdropColor: '#5BCEFA', backdropOpacity: 0.8, shape: 'squircle', font: 'sans-serif', btnHover: '#ffffff' }
};

function saveThemeToStorage(themeObj) {
    if(inputPreset) themeObj.preset = inputPreset.value;
    const checkRain = document.getElementById('check-rain-shawarma');
    if(checkRain) themeObj.rainEnabled = checkRain.checked;
    localStorage.setItem('customTheme', JSON.stringify(themeObj));
}

function applyTheme(themeObj) {
    const { bg, bar, shape, font, btnHover, wiiBtnBg, modalBg, modalBorder, backdropColor, backdropOpacity } = themeObj;
    const r = document.documentElement;

    r.style.setProperty('--bg-color', bg);
    r.style.setProperty('--bar-color', bar);
    r.style.setProperty('--wii-btn-bg', wiiBtnBg || '#ffffff');
    r.style.setProperty('--btn-hover-color', btnHover || '#40c4ff');
    
    // Modal & Backdrop
    r.style.setProperty('--modal-bg', modalBg || '#f7f7f7');
    r.style.setProperty('--modal-border', modalBorder || '#d4d4d4');
    
    // Convert hex+opacity to rgba for backdrop
    const hex = backdropColor || '#000000';
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){ c= [c[0], c[0], c[1], c[1], c[2], c[2]]; }
        c= '0x'+c.join('');
        r.style.setProperty('--modal-backdrop', 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+(backdropOpacity || 0.9)+')');
    }

    const fontVal = font === 'monospace' ? "'Courier New', monospace" : (font === 'sans-serif' ? "Arial, sans-serif" : "'PopHappiness', sans-serif");
    r.style.setProperty('--main-font', fontVal);

    let btnRad = '12px', cardRad = '25px';
    if (shape === 'square') { btnRad = '0px'; cardRad = '0px'; }
    else if (shape === 'rounded-square') { btnRad = '8px'; cardRad = '8px'; }
    else if (shape === 'squircle') { btnRad = '18px'; cardRad = '35px'; }
    else if (shape === 'round') { btnRad = '50%'; cardRad = '25px'; }

    r.style.setProperty('--btn-radius', btnRad);
    r.style.setProperty('--card-radius', cardRad);

    saveThemeToStorage(themeObj);
}

function getCurrentThemeObj() {
    return {
        bg: inputBg.value, bar: inputBar.value, shape: inputShape.value, font: inputFont.value,
        btnHover: inputBtnHover.value, wiiBtnBg: inputWiiBtnBg.value,
        modalBg: inputModalBg.value, modalBorder: inputModalBorder.value,
        backdropColor: inputBackdropColor.value, backdropOpacity: inputBackdropOpacity.value
    };
}

// Watch inputs
const allInputs = [inputBg, inputBar, inputShape, inputFont, inputBtnHover, inputWiiBtnBg, inputModalBg, inputModalBorder, inputBackdropColor, inputBackdropOpacity];
allInputs.forEach(inp => {
    if(inp) inp.addEventListener('input', () => {
        if(inputPreset) inputPreset.value = 'custom';
        applyTheme(getCurrentThemeObj());
    });
});

if(btnReset) btnReset.addEventListener('click', () => {
    updateInputsFromTheme(themePresets.wii);
    inputPreset.value = 'wii';
    applyTheme(themePresets.wii);
    showToast("Theme Reset");
});

function updateInputsFromTheme(theme) {
    restoreThemeInputs(theme);
}

// --- MUSIC LOGIC ---
const volumeSlider = document.getElementById('volume-slider');
const nowPlayingText = document.getElementById('now-playing');

if(volumeSlider && bgMusic) volumeSlider.addEventListener('input', (e) => bgMusic.volume = e.target.value);

function playBGM(url, name) {
    if(!bgMusic) return;
    bgMusic.src = url;
    bgMusic.play().catch(e => console.log("Autoplay blocked"));
    localStorage.setItem('qbbic-bgm', url);
    if(nowPlayingText) nowPlayingText.textContent = name || "Unknown";
}

function populateMusicMenu() {
    const menu = document.getElementById('music-menu');
    // FIND THE CORRECT LIST CONTAINER INSIDE THE NEW STRUCTURE
    const list = menu ? menu.querySelector('.nds-list') : null;
    if(!list) return;
    
    list.innerHTML = ''; 
    songs.forEach((song) => {
        const div = document.createElement('div');
        div.className = 'nds-item'; // Use new style class
        div.innerHTML = `
            <div class="nds-item-color" style="background:#40c4ff; display:flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white;"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <span class="nds-item-name">${song.name}</span>
        `;
        div.onclick = () => { playBGM(song.url, song.name); showToast("Playing: " + song.name); };
        list.appendChild(div);
    });
}

// Close Buttons for all NDS Style Menus
['music', 'home', 'theme', 'memory'].forEach(type => {
    const closeBtn = document.getElementById(`close-${type}-menu-btn`); // e.g. close-music-menu-btn
    const menuId = type === 'memory' ? 'memory-card-menu' : (type + '-menu');
    const menu = document.getElementById(menuId);
    
    if(closeBtn && menu) {
        closeBtn.addEventListener('click', () => {
            menu.style.display = 'none';
            playSound(themeClickSound);
        });
    }
});

// Toggle Logic
const toggleMap = {
    'music-menu-toggle': 'music-menu',
    'theme-menu-toggle': 'theme-menu',
    'wii-menu-button': 'home-menu',
    'memory-card-button': 'memory-card-menu'
};

Object.keys(toggleMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(toggleMap[btnId]);
    if(btn && menu) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Close others first
            Object.values(toggleMap).forEach(mId => {
                const m = document.getElementById(mId);
                if(m && m !== menu) m.style.display = 'none';
            });
            menu.style.display = (menu.style.display === 'flex' || menu.style.display === 'block') ? 'none' : 'flex'; // nds-theme-shop is flex
            playSound(themeClickSound);
        });
    }
});

// --- SHAWARMA RAIN ---
const checkRain = document.getElementById('check-rain-shawarma');
let rainInterval;
function createShawarma() {
    if(document.querySelectorAll('.shawarma-item').length > 50) return;
    const el = document.createElement('div');
    el.innerText = '🌯';
    el.classList.add('shawarma-item');
    el.style.position = 'fixed'; el.style.left = Math.random()*100+'vw'; el.style.top = '-60px';
    el.style.fontSize = (Math.random()*30+20)+'px'; el.style.zIndex='9999'; el.style.pointerEvents='none';
    document.body.appendChild(el);
    const anim = el.animate([{transform:'translateY(0) rotate(0deg)'}, {transform:`translateY(110vh) rotate(${Math.random()*360}deg)`}], {duration:2000+Math.random()*2000});
    anim.onfinish = () => el.remove();
}
function toggleRain(enabled) {
    if(enabled && !rainInterval) { rainInterval = setInterval(createShawarma, 200); showToast("Shawarma Rain!"); }
    else if(!enabled) { clearInterval(rainInterval); rainInterval=null; document.querySelectorAll('.shawarma-item').forEach(e=>e.remove()); }
}
if(checkRain) checkRain.addEventListener('change', (e) => toggleRain(e.target.checked));

// --- 3DS PRESET LOGIC ---
function init3DSMenuLogic() {
    const items = document.querySelectorAll('.nds-item[data-val]');
    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const val = item.dataset.val;
            if(themePresets[val]) {
                updateInputsFromTheme(themePresets[val]);
                applyTheme(themePresets[val]);
                playSound(clickSound);
            }
        });
    });
}

// Nav items in Home Menu
const navItems = { 'nav-index': 'index.html', 'nav-path': 'path.html' };
Object.keys(navItems).forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('click', () => window.location.href = navItems[id]);
});

const discordBtn = document.getElementById('nav-discord');
if(discordBtn) discordBtn.addEventListener('click', () => window.open('https://discord.gg/TRguRu7mwc', '_blank'));
const suggestBtn = document.getElementById('nav-suggestions');
if(suggestBtn) suggestBtn.addEventListener('click', () => window.open('https://forms.gle/VFSHz9TwhpWPgyGY6', '_blank'));

// --- TIME TRAVEL SECRET ---
const clock = document.getElementById('wii-date-time-display');
const futureAudio = document.getElementById('sound-time-travel-future');
let tState = 0;
if(clock) clock.addEventListener('click', () => {
    tState = (tState+1)%2; 
    document.body.classList.toggle('time-travel-future', tState===1);
    if(tState===1 && futureAudio) futureAudio.play().catch(()=>{});
});

function updateDateTime() {
    const now = new Date();
    const t = document.getElementById('current-time');
    const d = document.getElementById('current-date');
    if(t) t.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if(d) d.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}
