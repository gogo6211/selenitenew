let articles = [];

$(document).ready(() => {
    // Check if we're on an article page or listing
    if (window.location.pathname.startsWith('/blog/') {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 2) {
            loadArticle();
        } else {
            loadArticles().catch(handleLoadError);
        }
    } else {
        loadArticles().catch(handleLoadError);
    }
});

async function loadArticles() {
    try {
        const response = await fetch('/articles.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        articles = await response.json();
        
        // Add proper paths to articles
        articles = articles.map(article => ({
            ...article,
            path: `/blog/${article.slug}/`
        }));
        
        renderArticles();
        initSearch();
    } catch (error) {
        handleLoadError(error);
    }
}

function renderArticles() {
    const container = $('#articles').empty();
    
    if (!articles.length) {
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

    $('.article-card').on('click', function() {
        const slug = $(this).data('slug');
        window.location.href = `/blog/${slug}/`;
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