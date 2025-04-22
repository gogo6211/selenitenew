let articles = [];

$(document).ready(() => {
    loadArticles().catch(handleLoadError);
});

async function loadArticles() {
    try {
        const response = await fetch('/articles.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        articles = await response.json();
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderArticles();
        initSearch();
        $('#articles').addClass('loaded');
    } catch (error) {
        throw error;
    }
}

function renderArticles() {
    const container = $('#articles').empty();
    
    if (articles.length === 0) {
        container.html(`
            <div class="no-articles">
                <sl-icon name="journal-x" style="font-size: 3rem;"></sl-icon>
                <p>No articles found</p>
            </div>
        `);
        return;
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