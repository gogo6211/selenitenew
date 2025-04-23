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
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            error.code = 'A001';
            throw error;
        }
        
        articles = await response.json();
        
        // Verify and normalize article paths
        articles = articles.map(article => {
            if (!article.slug) {
                const error = new Error('Article missing slug');
                error.code = 'A002';
                throw error;
            }
            return {
                ...article,
                path: `/blog/${article.slug}/`
            };
        });
        
        renderArticles();
        initSearch();
    } catch (error) {
        error.code = error.code || 'A999';
        handleLoadError(error, 'loadArticles');
    }
}

async function loadArticleContent(slug) {
    try {
        if (!slug) {
            // Fix: robust slug extraction fallback
            slug = window.location.pathname.replace(/\/blog\/|\/index\.html|\/$/g, '').split('/')[0];
        }
        if (!slug) {
            const error = new Error('Invalid URL structure: Missing slug');
            error.code = 'B001';
            throw error;
        }

        let response;
        try {
            response = await fetch(`/blog/${slug}/content.html`);
        } catch (e) {
            e.code = 'B002';
            throw e;
        }
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: Failed to fetch content`);
            error.code = 'B003';
            throw error;
        }

        let content;
        try {
            content = await response.text();
        } catch (e) {
            e.code = 'B004';
            throw e;
        }

        let parser, doc;
        try {
            parser = new DOMParser();
            doc = parser.parseFromString(content, 'text/html');
        } catch (e) {
            e.code = 'B005';
            throw e;
        }

        const metaScript = doc.querySelector('script[type="application/article-meta"]');
        const articleContent = doc.getElementById('article-content');
        if (!metaScript) {
            const error = new Error('Invalid article format: Missing metadata');
            error.code = 'B006';
            throw error;
        }
        if (!articleContent) {
            const error = new Error('Invalid article format: Missing content');
            error.code = 'B007';
            throw error;
        }

        let meta;
        try {
            meta = JSON.parse(metaScript.textContent);
        } catch (e) {
            e.code = 'B008';
            throw new Error('Invalid article metadata JSON');
        }

        const $container = $('#article-container');
        if ($container.length === 0) {
            const error = new Error('Missing #article-container in index.html');
            error.code = 'B009';
            throw error;
        }

        $container.html(`
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

        if (typeof Prism !== 'undefined' && Prism.highlightAll) {
            Prism.highlightAll();
        } else {
            console.warn('[BlogJS] Prism.js not loaded (B010)');
        }
        document.title = `${meta.title} | Sodalite`;
    } catch (error) {
        error.code = error.code || 'B999';
        handleLoadError(error, 'loadArticleContent');
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

function handleLoadError(error, context = '') {
    const code = error.code || 'Z999';
    console.error(`[BlogJS] Error${context ? ' in ' + context : ''} (${code}):`, error);
    $('#articles').html(`
        <div class="error-state">
            <sl-alert variant="danger" open>
                <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                Failed to load articles (Error code: <b>${code}</b>): ${error.message}
            </sl-alert>
        </div>
    `);
    // Optional: show debug banner for critical errors
    if (typeof window !== 'undefined' && window.document && !document.getElementById('debug-banner')) {
        let banner = document.createElement('div');
        banner.id = 'debug-banner';
        banner.style = "background:#c00;color:#fff;padding:1em;text-align:center;z-index:9999;position:fixed;top:0;left:0;width:100vw;font-size:1.1em";
        banner.innerHTML = `<b>DEBUG ERROR (${code})</b>: ${error.message || error}`;
        document.body.prepend(banner);
    }
}

// Match your existing interval check pattern
function check() {
    // Your existing check logic
    if ($("#panicmode").length > 0) {
        $("#panicmode").prop({ href: panicurl });
    }
}