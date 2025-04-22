let articles = [];

// Properly handle theme synchronization
function syncTheme() {
    const theme = localStorage.getItem('selenite.theme') || 'main';
    document.body.setAttribute('theme', theme);
    
    // Fix JSON parsing with proper fallback
    const customTheme = JSON.parse(localStorage.getItem('selenite.customTheme') || '{}');
    Object.keys(customTheme).forEach(key => {
        document.body.style.setProperty(`--${key}`, customTheme[key]);
    });
}

// Improved article loading
async function loadArticles() {
    try {
        const response = await fetch('/articles.json');
        if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
        
        articles = await response.json();
        if (!Array.isArray(articles)) throw new Error('Invalid articles format');
        
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderArticles();
        initSearch();
        $('#articles').removeClass('loading-state');
    } catch (error) {
        handleLoadError(error);
    }
}

// Enhanced error handling
function handleLoadError(error) {
    console.error('Article load failed:', error);
    $('#articles').html(`
        <div class="error-state">
            <sl-alert variant="danger" open>
                <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                Error loading content: ${error.message}
            </sl-alert>
        </div>
    `);
}

// Rest of your code remains the same
$(document).ready(function() {
    syncTheme();
    loadArticles();
    
    // Force redraw for theme changes
    window.addEventListener('storage', function(e) {
        if(e.key === 'selenite.theme' || e.key === 'selenite.customTheme') {
            syncTheme();
            $('.article-card, #blogsearch').hide().show(0); // Trigger repaint
        }
    });
});