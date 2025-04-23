let articles = [];

$(document).ready(() => {
    loadArticles().catch(handleLoadError);
});

// Updated article loading code
async function loadArticle() {
    try {
        const slug = window.location.pathname.split('/blog/')[1].split('/')[0];
        const response = await fetch(`/blog/${slug}/content.html`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const content = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        // Error handling for missing metadata
        const metaScript = doc.querySelector('script[type="application/article-meta"]');
        if (!metaScript) throw new Error('Missing article metadata');
        
        const meta = JSON.parse(metaScript.textContent);
        
        // Error handling for missing content
        const articleContent = doc.getElementById('article-content');
        if (!articleContent) throw new Error('Missing article content div');

        // Build article HTML
        const articleHTML = `
            ${meta.thumbnail ? `
            <img class="article-thumbnail" 
                 src="${meta.thumbnail}" 
                 alt="${meta.thumbnailAlt || 'Article thumbnail'}">` : ''}
            
            <div class="article-header">
                <h1>${meta.title}</h1>
                <div class="meta">
                    ${meta.date ? `<span>${new Date(meta.date).toLocaleDateString()}</span>` : ''}
                    ${meta.author ? `<span>By ${meta.author}</span>` : ''}
                    ${meta.tags?.map(tag => `<sl-tag>${tag}</sl-tag>`).join('') || ''}
                </div>
            </div>
            
            <div class="article-body">
                ${articleContent.innerHTML}
            </div>
        `;

        document.getElementById('article-container').innerHTML = articleHTML;
        document.title = `${meta.title} | Sodalite`;

        // Initialize components
        customElements.whenDefined('sl-code-block').then(() => {
            Prism.highlightAll();
        });

    } catch (error) {
        console.error('Article load error:', error);
        document.getElementById('article-container').innerHTML = `
            <sl-alert variant="danger" open>
                <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                Error loading article: ${error.message}
            </sl-alert>
        `;
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