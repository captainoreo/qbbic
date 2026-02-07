/**
 * UPDATED SCRIPT.JS - Matches games.html structure
 */

// --- CORE VARIABLES ---
const bgMusic = document.getElementById('bg-music');
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');
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

// Toast Logic
const toast = document.getElementById('toast-notification');
let toastTimeout;
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// Audio Helper
function playSound(audioElement) {
    if (audioElement && typeof audioElement.play === 'function') {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }
}

// --- MUSIC LOGIC ---
const songs = [
    { name: 'Wii U Mii Maker', url: '/assets/Wii U OST - Mii Maker (Mii Editor).flac' },
    // Add more songs here...
];

function playBGM(url, name) {
    if(!bgMusic) return;
    bgMusic.src = url;
    bgMusic.play().catch(e => console.log("Autoplay blocked"));
    localStorage.setItem('qbbic-bgm', url);
    const np = document.getElementById('now-playing');
    if(np) np.textContent = name || "Unknown Track";
}

function populateMusicMenu() {
    const list = document.getElementById('music-list');
    if(!list) return;
    list.innerHTML = '';
    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'music-option';
        div.textContent = song.name;
        div.onclick = () => { playBGM(song.url, song.name); showToast("Playing: " + song.name); };
        list.appendChild(div);
    });
}

// --- MENUS TOGGLE LOGIC ---
const menus = {
    music: { btn: 'music-menu-toggle', id: 'music-menu' },
    theme: { btn: 'theme-menu-toggle', id: 'theme-menu' },
    home:  { btn: 'wii-menu-button', id: 'home-menu' },
    data:  { btn: 'memory-card-button', id: 'data-menu' }
};

// Close all menus helper
function closeAllMenus() {
    Object.values(menus).forEach(m => {
        const el = document.getElementById(m.id);
        if(el) el.style.display = 'none';
        const btn = document.getElementById(m.btn);
        if(btn) btn.classList.remove('active');
    });
}

Object.values(menus).forEach(menu => {
    const btn = document.getElementById(menu.btn);
    const el = document.getElementById(menu.id);
    if(btn && el) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop click from bubbling to document
            const isVisible = el.style.display === 'block' || el.style.display === 'flex';
            closeAllMenus();
            if(!isVisible) {
                el.style.display = (menu.id === 'theme-menu' || menu.id === 'data-menu') ? 'flex' : 'block';
                playSound(themeClickSound);
            }
        });
        el.addEventListener('click', (e) => e.stopPropagation()); // Prevent clicking inside menu from closing it
    }
});

// Close when clicking outside
document.addEventListener('click', () => closeAllMenus());

// Close buttons inside menus
document.querySelectorAll('.nds-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAllMenus();
        playSound(clickSound);
    });
});

// --- INIT ---
window.addEventListener('load', () => {
    populateMusicMenu();
    // Load saved theme...
    const savedTheme = localStorage.getItem('customTheme');
    if(savedTheme) { try { applyTheme(JSON.parse(savedTheme)); } catch(e){} }
});

// --- PLACEHOLDER FUNCTIONS FOR THEME LOGIC (Add logic from previous answer here) ---
function applyTheme(t) { /* Copy applyTheme logic from previous answer */ }
