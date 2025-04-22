let articles = [];

$(document).ready(() => {
    // Initialize blog functionality
    loadArticles();
    
    // Set up periodic check (matches your existing pattern)
    interval = setInterval(check, 1000);
});

async function loadArticles() {
    try {
        // Show loading state
        $('#articles').html(`
            <div class="loading-state">
                <sl-spinner style="font-size: 2rem;"></sl-spinner>
                <p>Loading articles...</p>
            </div>
        `);

        // Load articles
        const response = await fetch('/articles.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        articles = await response.json();
        if (!Array.isArray(articles)) throw new Error('Invalid articles format');
        
        // Process articles
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderArticles();
        initSearch();

    } catch (error) {
        handleLoadError(error);
    }
}

function renderArticles() {
    const container = $('#articles').empty();
    
    if (articles.length === 0) {
        return container.html(`
            <div class="no-articles">
                <sl-icon name="journal-x" style="font-size: 3rem;"></sl-icon>
                <p>No articles found</p>
            </div>
        `);
    }

    articles.forEach(article => {
        const card = `
            <div class="article-card" data-slug="${article.slug}">
                ${article.thumbnail ? `
                <img class="article-thumbnail" 
                     src="${article.thumbnail}" 
                     alt="${article.title}">` : ''}
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">
                    <span>${new Date(article.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>${article.author}</span>
                </div>
                <div class="article-excerpt">${article.excerpt}</div>
            </div>
        `;
        container.append(card);
    });

    // Add click handlers
    $('.article-card').on('click', function() {
        const slug = $(this).data('slug');
        const article = articles.find(a => a.slug === slug);
        if (article?.path) window.location.href = article.path;
    });
}

function initSearch() {
    $('#blogsearch').on('input', function() {
        const query = $(this).val().toLowerCase();
        $('.article-card').each(function() {
            const text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(query));
        });
    });
}

function handleLoadError(error) {
    console.error('Article load failed:', error);
    $('#articles').html(`
        <div class="error-state">
            <sl-alert variant="danger" open>
                <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                Failed to load articles: ${error.message}
            </sl-alert>
        </div>
    `);
}

// Match your existing interval check pattern
function check() {
    // Your existing check logic
    if ($("#panicmode").length > 0) {
        $("#panicmode").prop({ href: panicurl });
    }
}