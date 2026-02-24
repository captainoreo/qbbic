// modern.js

// Add or change your Developer Picks here. Must match the 'title' attribute exactly!
const DEV_PICKS = [
    "Dynamite Headdy", 
    "Undertale", 
    "Cave Story", 
    "Spelunky",
    "Hollow Knight",
    "Pizza Tower",
    "Mario 64",
    "OMORI",
    "Terraria",
    "Balatro"
];

window.addEventListener('load', () => {
    buildModernLayout();
});

function buildModernLayout() {
    const classicContainer = document.getElementById('game-pages-container');
    if (!classicContainer) return;

    // Create the main wrapper for Modern Mode
    const modernContainer = document.createElement('div');
    modernContainer.id = 'modern-container';

    // Build the Header (Logo + Text)
    const headerContainer = document.createElement('div');
    headerContainer.className = 'modern-header-container';
    
    const logoImg = document.createElement('img');
    logoImg.src = '/assets/Icon (1).svg';
    logoImg.alt = 'Qbbic Logo';
    logoImg.className = 'modern-logo';
    
    const logoText = document.createElement('h1');
    logoText.textContent = 'Qbbic';
    logoText.className = 'modern-logo-text';
    
    headerContainer.appendChild(logoImg);
    headerContainer.appendChild(logoText);

    // Headers
    const devTitle = document.createElement('h2');
    devTitle.className = 'modern-section-title';
    devTitle.textContent = 'Developer Picks';
    
    const allTitle = document.createElement('h2');
    allTitle.className = 'modern-section-title';

    // Layout Containers
    const devGrid = document.createElement('div');
    devGrid.className = 'modern-dev-grid';

    // Grid container for all games
    const allGrid = document.createElement('div');
    allGrid.className = 'modern-all-grid';

    // Scrape all existing games from the classic HTML grid
    const allGameNodes = document.querySelectorAll('#game-pages-container .game-button:not(.placeholder)');
    
    // Add the dynamic count to the "All Games" title
    allTitle.textContent = `All Games (${allGameNodes.length})`;
    
    allGameNodes.forEach(node => {
        const title = node.title || node.querySelector('.game-button-text').innerText;
        
        // 1. Clone and add to "All Games" grid
        const listClone = node.cloneNode(true);
        attachModalLogic(listClone, node.dataset.href, title);
        allGrid.appendChild(listClone);

        // 2. Clone and add to "Dev Picks" if the title matches our array
        if (DEV_PICKS.includes(title)) {
            const devClone = node.cloneNode(true);
            attachModalLogic(devClone, node.dataset.href, title);
            devGrid.appendChild(devClone);
        }
    });

    // Assemble the DOM
    modernContainer.appendChild(headerContainer);
    modernContainer.appendChild(devTitle);
    modernContainer.appendChild(devGrid);
    modernContainer.appendChild(allTitle);
    modernContainer.appendChild(allGrid);

    // Insert it into the page right next to the classic container
    classicContainer.parentNode.insertBefore(modernContainer, classicContainer.nextSibling);
}

// Re-binds the hover and click sounds/modal logic to the new cloned buttons
function attachModalLogic(element, url, title) {
    element.addEventListener('mouseenter', () => {
        if (typeof hoverSound !== 'undefined') playSound(hoverSound);
    });
    
    element.addEventListener('click', (e) => {
        e.preventDefault();
        if (url && url !== '#') {
            if (typeof openGameModal === 'function') {
                openGameModal(url, title);
            }
        }
    });
}
