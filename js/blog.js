let articles = [];

document.addEventListener('DOMContentLoaded', () => {
  // Apply theme
  const theme = localStorage.getItem('selenite.theme') || 'dark';
  document.body.setAttribute('theme', theme);

  // Decide mode by URL
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'blog' && parts.length === 2) {
    loadArticle(parts[1]);
  } else if ((parts[0] === 'blog' && parts.length === 1) || window.location.pathname.endsWith('blog.html')) {
    loadList();
  }
});

async function loadList() {
  try {
    const res = await fetch('/articles.json');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    articles = await res.json();
    articles = articles.map(a => ({ ...a, path: `/blog/${a.slug}/` }));
    renderList();
    setupSearch();
  } catch (e) {
    showError('#articles', `Failed to load list: ${e.message}`);
  }
}

async function loadArticle(slug) {
  const container = document.getElementById('article-container');
  if (!container) return;
  try {
    const res = await fetch(`/blog/${slug}/content.html`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');

    const metaScript = doc.querySelector('script[type="application/article-meta"]');
    const contentEl = doc.getElementById('article-content');
    if (!metaScript || !contentEl) throw new Error('Malformed article');

    const meta = JSON.parse(metaScript.textContent);
    document.title = `${meta.title} | Sodalite`;
    container.innerHTML = `
      ${meta.thumbnail ? `<img src="${meta.thumbnail}" alt="${meta.thumbnailAlt||''}" class="article-thumbnail">` : ''}
      <h1>${meta.title}</h1>
      <div class="meta">
        ${meta.date ? `<time>${new Date(meta.date).toLocaleDateString()}</time>` : ''}
        ${meta.author ? `<span>By ${meta.author}</span>` : ''}
        ${meta.tags?.map(t => `<sl-tag>${t}</sl-tag>`).join('')||''}
      </div>
      <div class="article-body">${contentEl.innerHTML}</div>
    `;
    if (window.Prism) Prism.highlightAll();
  } catch (e) {
    showError('#article-container', `Failed to load article: ${e.message}`);
  }
}

function renderList() {
  const root = document.getElementById('articles');
  if (!articles.length) {
    root.innerHTML = '<p>No articles found.</p>';
    return;
  }
  root.innerHTML = articles.map(a => `
    <div class="article-card" onclick="location.href='${a.path}'">
      ${a.thumbnail?`<img src="${a.thumbnail}" alt="${a.title}" class="article-thumbnail">`:''}
      <h2>${a.title}</h2>
      <p>${a.excerpt}</p>
      <small>${new Date(a.date).toLocaleDateString()} • ${a.author}</small>
    </div>
  `).join('');
}

function setupSearch() {
  const input = document.getElementById('blogsearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll('.article-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q)? '' : 'none';
    });
  });
}

function showError(selector, msg) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = `<sl-alert variant="danger" open>${msg}</sl-alert>`;
}
