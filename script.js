// --- CORE VARIABLES ---
const bgMusic = document.getElementById('bg-music');
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');
const themeClickSound = document.getElementById('theme-click-sound');
const gameOpenSound = document.getElementById('game-open-sound');
const gameCloseSound = document.getElementById('game-close-sound');

const gamePagesWrapper = document.getElementById('game-pages-wrapper');
let currentPage = 0;
const totalPages = 15; // Set to 15 to match HTML

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    updatePage();
    populateMusicMenu();
    updateDateTime();
    loadTheme();
    loadNotes();
    setInterval(updateDateTime, 1000);
});

// --- MENU TOGGLE LOGIC ---
const menuMap = {
    'memory-card-button': 'memory-card-menu',
    'theme-menu-toggle': 'theme-menu',
    'music-menu-toggle': 'music-menu',
    'wii-menu-button': 'home-menu'
};

function closeAllMenus() {
    document.querySelectorAll('.nds-theme-shop').forEach(el => {
        el.style.display = 'none';
    });
}

Object.keys(menuMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    const targetId = menuMap[btnId];
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(targetId);
            const isVisible = target.style.display === 'flex';
            
            closeAllMenus();
            
            if (!isVisible) {
                target.style.display = 'flex';
                playSound(themeClickSound);
            }
        });
    }
});

document.querySelectorAll('.nds-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAllMenus();
        playSound(clickSound);
    });
});

// --- PAGE NAVIGATION ---
function updatePage() {
    if(!gamePagesWrapper) return;
    const offset = -currentPage * 100;
    gamePagesWrapper.style.transform = `translateX(${offset}%)`;
    
    // Update Dots
    const dotsContainer = document.getElementById('page-indicator-dots');
    dotsContainer.innerHTML = '';
    for(let i=0; i<totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = (i === currentPage) ? 'page-dot active' : 'page-dot';
        dotsContainer.appendChild(dot);
    }
    
    document.getElementById('prev-page-button').classList.toggle('disabled', currentPage === 0);
    document.getElementById('next-page-button').classList.toggle('disabled', currentPage === totalPages - 1);
}

document.getElementById('prev-page-button').addEventListener('click', () => {
    if(currentPage > 0) { currentPage--; updatePage(); playSound(clickSound); }
});
document.getElementById('next-page-button').addEventListener('click', () => {
    if(currentPage < totalPages - 1) { currentPage++; updatePage(); playSound(clickSound); }
});

// --- GAME LAUNCHER ---
const gameModal = document.getElementById('game-modal');
const gameIframe = document.getElementById('game-iframe');
let wasMusicPlaying = false;

document.querySelectorAll('.game-button:not(.placeholder)').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const url = btn.dataset.href;
        const title = btn.title;
        if(url && url !== "#") openGame(url, title);
    });
});

function openGame(url, title) {
    document.getElementById('game-modal-title').innerText = title;
    gameModal.classList.add('active');
    gameIframe.src = url;
    playSound(gameOpenSound);
    
    if(bgMusic && !bgMusic.paused) {
        wasMusicPlaying = true;
        bgMusic.pause();
    }
}

document.getElementById('close-game-modal-btn').addEventListener('click', () => {
    gameModal.classList.remove('active');
    gameIframe.src = 'about:blank';
    playSound(gameCloseSound);
    
    if(wasMusicPlaying && bgMusic) {
        bgMusic.play();
        wasMusicPlaying = false;
    }
});

// Fullscreen & Reload
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if(gameIframe.requestFullscreen) gameIframe.requestFullscreen();
});
document.getElementById('reload-game-btn').addEventListener('click', () => {
    gameIframe.src = gameIframe.src;
});

// --- MUSIC SYSTEM (FULL TRACK LIST) ---
const songs = [
    { name: 'Wii U Mii Maker', url: 'assets/Wii U OST - Mii Maker (Mii Editor).flac' },
    { name: 'Droopy likes your face', url: 'assets/Droopy likes your face.flac' },
    { name: 'Sleepville', url: 'assets/Sleepville - Little Man Legends.mp3' },
    { name: 'Beneath the Mask', url: 'assets/Beneath the Mask -instrumental version- - Lyn.mp3' },
    { name: 'Training day', url: 'assets/MTraining Day.mp3' },
    { name: 'Super Mario Galaxy - File Select', url: 'assets/Super Mario Galaxy - File Select.mp3' },
    { name: 'Pokemon B&W 2 - Aspertia City', url: 'assets/Pokemon Black & White 2 OST - Aspertia City.mp3' },
    { name: '3_31 (Persona 3)', url: 'assets/3_31.mp3' },
    { name: 'Harry Mack - Reporting In', url: 'assets/Harry Mack - Reporting In.mp3' },
    { name: 'Nintendo DSi - Main Menu', url: 'assets/Nintendo DSi - Main Menu Theme.mp3' },
    { name: 'Takeshi Abo - Lightgreen', url: 'assets/Takeshi Abo - Lightgreen.mp3' },
    { name: 'Takeshi Abo - Illusions', url: 'assets/Takeshi Abo - Illusions.mp3' },
    { name: 'Garoad - Safe Haven', url: 'assets/Garoad - Safe Haven.mp3' }
];

function populateMusicMenu() {
    const list = document.getElementById('music-list-container');
    if(!list) return;
    list.innerHTML = '';
    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'nds-item';
        div.innerHTML = `<span class="nds-item-name">${song.name}</span>`;
        div.onclick = () => {
            bgMusic.src = song.url;
            bgMusic.play();
            document.getElementById('now-playing').innerText = song.name;
        };
        list.appendChild(div);
    });
}
document.getElementById('music-option-stop').addEventListener('click', () => {
    bgMusic.pause();
    document.getElementById('now-playing').innerText = "Stopped";
});
document.getElementById('volume-slider').addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

// --- THEME SYSTEM ---
function loadTheme() {
    const saved = localStorage.getItem('wii-theme');
    if(saved) {
        const theme = JSON.parse(saved);
        applyTheme(theme);
    }
}
function applyTheme(theme) {
    const root = document.documentElement;
    if(theme.bg) root.style.setProperty('--bg-color', theme.bg);
    if(theme.bar) root.style.setProperty('--bar-color', theme.bar);
    if(theme.rain) toggleRain(true);
    else toggleRain(false);
}

document.getElementById('save-theme-btn').addEventListener('click', () => {
    const theme = {
        bg: document.getElementById('input-bg').value,
        bar: document.getElementById('input-bar').value,
        rain: document.getElementById('check-rain-shawarma').checked
    };
    applyTheme(theme);
    localStorage.setItem('wii-theme', JSON.stringify(theme));
    showToast("Theme Saved!");
});
document.getElementById('reset-theme-btn').addEventListener('click', () => {
    localStorage.removeItem('wii-theme');
    window.location.reload();
});

// --- MEMORY CARD (NOTES) ---
function loadNotes() {
    const notes = localStorage.getItem('wii-notes');
    if(notes) document.getElementById('memory-card-notes').value = notes;
}
document.getElementById('save-notes-btn').addEventListener('click', () => {
    const val = document.getElementById('memory-card-notes').value;
    localStorage.setItem('wii-notes', val);
    showToast("Notes Saved to Memory Card!");
});

// --- UTILS ---
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('current-date').innerText = now.toLocaleDateString([], {weekday:'short', month:'numeric', day:'numeric'});
}
function playSound(audio) {
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(e => {});
    }
}
function showToast(msg) {
    const t = document.getElementById('toast-notification');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// --- SHAWARMA RAIN EFFECT ---
let rainInterval;
function toggleRain(enable) {
    if(enable && !rainInterval) {
        rainInterval = setInterval(() => {
            const el = document.createElement('div');
            el.className = 'shawarma-item';
            el.innerText = '🌯';
            el.style.left = Math.random() * 100 + 'vw';
            document.body.appendChild(el);
            
            const anim = el.animate([
                { transform: 'translateY(-50px) rotate(0deg)' },
                { transform: `translateY(110vh) rotate(${Math.random()*360}deg)` }
            ], { duration: 3000 + Math.random()*2000 });
            
            anim.onfinish = () => el.remove();
        }, 300);
    } else if (!enable && rainInterval) {
        clearInterval(rainInterval);
        rainInterval = null;
    }
}
