let articles = [];

$(document).ready(() => {
    if (window.location.pathname.startsWith('/blog/')) {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 2 && pathParts[2] !== '') {
            // Article page - load content for the specific article
            loadArticleContent(pathParts[2]).catch(handleLoadError);
        } else {
            // Blog index page - load all articles
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
        
        // Verify and normalize article paths
        articles = articles.map(article => {
            if (!article.slug) throw new Error('Article missing slug');
            return {
                ...article,
                path: `/blog/${article.slug}/`
            };
        });
        
        renderArticles();
        initSearch();
    } catch (error) {
        handleLoadError(error);
    }
}

async function loadArticleContent(slug) {
    try {
        if (!slug) throw new Error('Invalid URL structure: Missing slug');

        const response = await fetch(`/blog/${slug}/content.html`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch content`);

        const content = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const metaScript = doc.querySelector('script[type="application/article-meta"]');
        const articleContent = doc.getElementById('article-content');
        if (!metaScript || !articleContent) throw new Error('Invalid article format: Missing metadata or content');

        const meta = JSON.parse(metaScript.textContent);
        $('#article-container').html(`
            ${meta.thumbnail ? `<img class="article-thumbnail" src="${meta.thumbnail}" alt="${meta.thumbnailAlt || ''}">` : ''}
            <div class="article-header">
                <h1>${meta.title}</h1>
                <div class="meta">
                    ${meta.date ? `<span>${new Date(meta.date).toLocaleDateString()}</span>` : ''}
                    ${meta.author ? `<span>By ${meta.author}</span>` : ''}
                    ${meta.tags?.map(tag => `<sl-tag>${tag}</sl-tag>`).join('') || ''}
                </div>
            </div>
            <div class="article-body">${articleContent.innerHTML}</div>
        `);

        Prism.highlightAll();
        document.title = `${meta.title} | Sodalite`;
    } catch (error) {
        handleLoadError(error);
    }
}

// Keep your existing renderArticles, initSearch, handleLoadError functions

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