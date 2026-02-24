// modern.js

// Add or change your Developer Picks here. Must match the 'title' attribute exactly!
const DEV_PICKS = ["Dynamite Headdy", "Undertale", "Cave Story", "Spelunky"];

window.addEventListener('load', () => {
    buildModernLayout();
});

function buildModernLayout() {
    const classicContainer = document.getElementById('game-pages-container');
    if (!classicContainer) return;

    // Create the main wrapper for Modern Mode
    const modernContainer = document.createElement('div');
    modernContainer.id = 'modern-container';

    // Headers
    const devTitle = document.createElement('h2');
    devTitle.className = 'modern-section-title';
    devTitle.textContent = 'Developer Picks';
    
    const allTitle = document.createElement('h2');
    allTitle.className = 'modern-section-title';
    allTitle.textContent = 'All Games';

    // Layout Containers
    const devGrid = document.createElement('div');
    devGrid.className = 'modern-dev-grid';

    const allList = document.createElement('div');
    allList.className = 'modern-vertical-list';

    // Scrape all existing games from the classic HTML grid
    const allGameNodes = document.querySelectorAll('#game-pages-container .game-button:not(.placeholder)');
    
    allGameNodes.forEach(node => {
        const title = node.title || node.querySelector('.game-button-text').innerText;
        
        // 1. Clone and add to "All Games" list
        const listClone = node.cloneNode(true);
        attachModalLogic(listClone, node.dataset.href, title);
        allList.appendChild(listClone);

        // 2. Clone and add to "Dev Picks" if the title matches our array
        if (DEV_PICKS.includes(title)) {
            const devClone = node.cloneNode(true);
            attachModalLogic(devClone, node.dataset.href, title);
            devGrid.appendChild(devClone);
        }
    });

    // Assemble the DOM
    modernContainer.appendChild(devTitle);
    modernContainer.appendChild(devGrid);
    modernContainer.appendChild(allTitle);
    modernContainer.appendChild(allList);

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
