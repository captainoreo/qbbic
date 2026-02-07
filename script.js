/**
 * COMPLETED SCRIPT.JS - For Qbbic Launcher
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CORE VARIABLES & AUDIO ---
    const bgMusic = document.getElementById('bg-music');
    const hoverSound = document.getElementById('hover-sound'); // Ensure this ID exists in HTML or remove
    const clickSound = document.getElementById('click-sound');
    const themeClickSound = document.getElementById('theme-click-sound');
    const menuHoverSound = document.getElementById('menu-hover-sound');
    
    // Audio Helper
    function playSound(audioElement) {
        if (audioElement && typeof audioElement.play === 'function') {
            audioElement.currentTime = 0;
            audioElement.play().catch(() => {});
        }
    }

    // --- 2. CLOCK & DATE LOGIC ---
    function updateClock() {
        const now = new Date();
        const timeEl = document.getElementById('current-time');
        const dateEl = document.getElementById('current-date');
        
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
        if (dateEl) {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dateEl.textContent = `${days[now.getDay()]} ${now.getMonth() + 1}/${now.getDate()}`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 3. PAGE NAVIGATION LOGIC ---
    const gamePagesWrapper = document.getElementById('game-pages-wrapper');
    const pages = document.querySelectorAll('.game-buttons');
    const dotsContainer = document.getElementById('page-indicator-dots');
    const prevBtn = document.getElementById('prev-page-button');
    const nextBtn = document.getElementById('next-page-button');
    let currentPage = 0;
    const totalPages = pages.length;

    // Initialize Dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToPage(index) {
        if (index < 0) index = 0;
        if (index >= totalPages) index = totalPages - 1;
        
        currentPage = index;
        
        // Slide the wrapper (assuming 100vw width per page)
        if (gamePagesWrapper) {
            gamePagesWrapper.style.transform = `translateX(-${currentPage * 100}vw)`;
        }

        // Update Dots
        const allDots = document.querySelectorAll('.dot');
        allDots.forEach((d, i) => {
            d.classList.toggle('active', i === currentPage);
        });

        playSound(menuHoverSound);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // --- 4. GAME LAUNCHER (MODAL) LOGIC ---
    const gameModal = document.getElementById('game-modal');
    const gameTitle = document.getElementById('game-modal-title');
    const gameIframe = document.getElementById('game-iframe');
    const closeGameBtn = document.getElementById('close-game-modal-btn');
    let wasMusicPlaying = false;

    // Attach click events to all game buttons
    document.querySelectorAll('.game-button').forEach(btn => {
        btn.addEventListener('mouseenter', () => playSound(menuHoverSound));
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = btn.getAttribute('data-href');
            const title = btn.getAttribute('title') || btn.querySelector('.game-button-text')?.innerText;

            // Ignore placeholders or empty links
            if (!url || url === '#' || url.includes('placeholder')) return;

            openGame(title, url);
        });
    });

    function openGame(title, url) {
        if (!gameModal) return;

        // Handle Audio
        if (bgMusic && !bgMusic.paused) {
            wasMusicPlaying = true;
            bgMusic.pause();
        } else {
            wasMusicPlaying = false;
        }

        playSound(clickSound);

        // Setup Modal
        if (gameTitle) gameTitle.textContent = title;
        if (gameIframe) gameIframe.src = url;

        gameModal.style.display = 'flex';
        gameModal.classList.add('active');
    }

    function closeGame() {
        if (!gameModal) return;
        
        gameModal.style.display = 'none';
        gameModal.classList.remove('active');
        
        // Kill Iframe content (stops game audio/scripts)
        if (gameIframe) gameIframe.src = 'about:blank';

        // Resume Music
        if (wasMusicPlaying && bgMusic) {
            bgMusic.play().catch(e => console.log("Resume blocked"));
        }
        playSound(themeClickSound);
    }

    if (closeGameBtn) closeGameBtn.addEventListener('click', closeGame);


    // --- 5. MENU SYSTEM (Theme, Music, Data, Home) ---
    const menus = {
        music: { btn: 'music-menu-toggle', id: 'music-menu' },
        theme: { btn: 'theme-menu-toggle', id: 'theme-menu' },
        home:  { btn: 'wii-menu-button', id: 'home-menu' },
        data:  { btn: 'memory-card-button', id: 'data-menu' }
    };

    function closeAllMenus() {
        Object.values(menus).forEach(m => {
            const el = document.getElementById(m.id);
            if (el) el.style.display = 'none';
            const btn = document.getElementById(m.btn);
            if (btn) btn.classList.remove('active');
        });
    }

    Object.values(menus).forEach(menu => {
        const btn = document.getElementById(menu.btn);
        const el = document.getElementById(menu.id);
        
        if (btn && el) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = (el.style.display === 'block' || el.style.display === 'flex');
                closeAllMenus();
                
                if (!isVisible) {
                    el.style.display = (menu.id === 'theme-menu' || menu.id === 'data-menu') ? 'flex' : 'block';
                    btn.classList.add('active');
                    playSound(themeClickSound);
                }
            });
            el.addEventListener('click', (e) => e.stopPropagation());
        }
    });

    // Close on outside click
    document.addEventListener('click', () => closeAllMenus());
    
    // Close buttons inside menus
    document.querySelectorAll('.nds-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllMenus();
            playSound(clickSound);
        });
    });


    // --- 6. MUSIC PLAYER LOGIC ---
    const musicList = [
        { name: 'Wii U Mii Maker', url: '/assets/Wii U OST - Mii Maker (Mii Editor).flac' },
        { name: 'Wii Shop Channel', url: '/assets/shop.mp3' }, // Example
        // Add more songs here
    ];

    const volumeSlider = document.getElementById('volume-slider');
    
    function playTrack(url, name) {
        if (!bgMusic) return;
        bgMusic.src = url;
        bgMusic.volume = volumeSlider ? volumeSlider.value : 0.5;
        bgMusic.play().catch(e => console.log("Autoplay blocked:", e));
        
        const np = document.getElementById('now-playing');
        if (np) np.textContent = name;
        
        showToast("Playing: " + name);
        localStorage.setItem('saved-song-url', url);
        localStorage.setItem('saved-song-name', name);
    }

    // Populate Music List
    const musicListContainer = document.getElementById('music-list');
    if (musicListContainer) {
        musicListContainer.innerHTML = '';
        musicList.forEach(song => {
            const div = document.createElement('div');
            div.className = 'music-option';
            div.textContent = song.name;
            div.onclick = () => playTrack(song.url, song.name);
            musicListContainer.appendChild(div);
        });
    }

    // Volume Control
    if (volumeSlider && bgMusic) {
        volumeSlider.addEventListener('input', (e) => {
            bgMusic.volume = e.target.value;
        });
    }

    // Stop Button
    const stopBtn = document.getElementById('music-option-stop');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (bgMusic) bgMusic.pause();
            const np = document.getElementById('now-playing');
            if (np) np.textContent = "Stopped";
        });
    }


    // --- 7. DATA MANAGEMENT (Save/Load/Wipe) ---
    const btnSaveData = document.getElementById('btn-save-data');
    const btnLoadData = document.getElementById('btn-load-data');
    const btnWipeData = document.getElementById('btn-wipe-data');
    const fileInput = document.getElementById('data-file-input');

    if (btnSaveData) {
        btnSaveData.addEventListener('click', () => {
            const data = JSON.stringify(localStorage);
            const blob = new Blob([data], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qbbic_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            showToast("Data Saved to File!");
        });
    }

    if (btnLoadData && fileInput) {
        btnLoadData.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                    showToast("Data Loaded! Reloading...");
                    setTimeout(() => location.reload(), 1500);
                } catch (err) {
                    showToast("Error loading file.");
                }
            };
            reader.readAsText(file);
        });
    }

    if (btnWipeData) {
        btnWipeData.addEventListener('click', () => {
            if (confirm("Are you sure? This will wipe all saves and themes.")) {
                localStorage.clear();
                location.reload();
            }
        });
    }


    // --- 8. THEME ENGINE ---
    const themeInputs = {
        bg: document.getElementById('input-bg'),
        bar: document.getElementById('input-bar'),
        showHome: document.getElementById('check-show-home'),
        showClock: document.getElementById('check-show-clock'),
        rain: document.getElementById('check-rain-shawarma')
    };

    function applyTheme(theme) {
        if (!theme) return;
        
        // Colors
        if (theme.bgColor) {
            document.body.style.background = theme.bgColor; // Override class
            document.body.style.backgroundColor = theme.bgColor;
            if(themeInputs.bg) themeInputs.bg.value = theme.bgColor;
        }
        
        if (theme.barColor) {
            document.querySelector('.wii-bottom-bar').style.background = theme.barColor;
            // Also color the curve SVG if possible, typically via fill
            document.querySelector('.wii-bottom-bar').style.borderTopColor = theme.barColor; 
            if(themeInputs.bar) themeInputs.bar.value = theme.barColor;
        }

        // Toggles
        if (theme.showHome !== undefined) {
            const btn = document.getElementById('wii-menu-button');
            if(btn) btn.style.display = theme.showHome ? 'flex' : 'none';
            if(themeInputs.showHome) themeInputs.showHome.checked = theme.showHome;
        }

        if (theme.showClock !== undefined) {
            const clk = document.getElementById('wii-date-time-display');
            if(clk) clk.style.opacity = theme.showClock ? '1' : '0';
            if(themeInputs.showClock) themeInputs.showClock.checked = theme.showClock;
        }
        
        if (theme.rain !== undefined) {
            if(themeInputs.rain) themeInputs.rain.checked = theme.rain;
            // Simple toggle for rain class
            if(theme.rain) document.body.classList.add('raining-shawarma');
            else document.body.classList.remove('raining-shawarma');
        }
    }

    function getCurrentThemeState() {
        return {
            bgColor: themeInputs.bg ? themeInputs.bg.value : '#e6e8e7',
            barColor: themeInputs.bar ? themeInputs.bar.value : '#c9c5c2',
            showHome: themeInputs.showHome ? themeInputs.showHome.checked : true,
            showClock: themeInputs.showClock ? themeInputs.showClock.checked : true,
            rain: themeInputs.rain ? themeInputs.rain.checked : false
        };
    }

    // Theme Buttons
    const saveThemeBtn = document.getElementById('save-theme-btn');
    const resetThemeBtn = document.getElementById('reset-theme-btn');

    if (saveThemeBtn) {
        saveThemeBtn.addEventListener('click', () => {
            const t = getCurrentThemeState();
            localStorage.setItem('customTheme', JSON.stringify(t));
            applyTheme(t);
            showToast("Theme Saved!");
        });
    }

    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', () => {
            localStorage.removeItem('customTheme');
            location.reload();
        });
    }

    // Load saved theme on boot
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
        try { applyTheme(JSON.parse(savedTheme)); } catch(e) { console.error("Theme Load Error", e); }
    } else {
        // Default visuals
        applyTheme({ bgColor: '#e6e8e7', barColor: '#c9c5c2', showHome: true, showClock: true, rain: false });
    }
    
    // Live Preview Listeners
    if(themeInputs.bg) themeInputs.bg.addEventListener('input', () => applyTheme(getCurrentThemeState()));
    if(themeInputs.bar) themeInputs.bar.addEventListener('input', () => applyTheme(getCurrentThemeState()));
    if(themeInputs.showHome) themeInputs.showHome.addEventListener('change', () => applyTheme(getCurrentThemeState()));
    if(themeInputs.showClock) themeInputs.showClock.addEventListener('change', () => applyTheme(getCurrentThemeState()));
    if(themeInputs.rain) themeInputs.rain.addEventListener('change', () => applyTheme(getCurrentThemeState()));


    // --- 9. TOAST NOTIFICATION HELPER ---
    const toast = document.getElementById('toast-notification');
    let toastTimeout;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
    }
});
