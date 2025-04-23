// /blog.js
(async () => {
    const isArticlePage = location.pathname.match(/^\/blog\/[^\/]+\/(?:index\.html)?$/);
    if (isArticlePage) {
      await renderArticle();
    } else {
      await renderIndex();
    }
  })();
  
  // —— INDEX PAGE ——
  async function renderIndex() {
    try {
      const res = await fetch('/articles.json');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const articles = await res.json();
  
      const container = document.getElementById('articles');
      if (!articles.length) {
        container.innerHTML = `<p>No articles found.</p>`;
        return;
      }
  
      articles.forEach(a => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
          <img src="${a.thumbnail}" alt="${a.title}" class="article-thumbnail"/>
          <h2>${a.title}</h2>
          <small>${new Date(a.date).toLocaleDateString()} • ${a.author}</small>
          <p>${a.excerpt}</p>
        `;
        card.addEventListener('click', () => {
          location.href = `/blog/${a.slug}/`;
        });
        container.appendChild(card);
      });
  
      // simple client-side search
      document.getElementById('blogsearch').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.article-card').forEach(card => {
          card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
  
    } catch (err) {
      document.getElementById('articles').innerHTML =
        `<p class="error">Failed to load articles: ${err.message}</p>`;
    }
  }
  
  // —— ARTICLE PAGE ——
  async function renderArticle() {
    const container = document.getElementById('article-container');
    try {
      // derive slug and fetch content.html
      const slug = location.pathname.replace(/\/blog\/|\/$/g, '').split('/')[1];
      const res = await fetch(`/blog/${slug}/content.html`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const text = await res.text();
  
      // parse
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const meta = JSON.parse(doc.querySelector('script[type="application/article-meta"]').textContent);
      const body = doc.getElementById('article-content').innerHTML;
  
      // build
      container.innerHTML = `
        ${meta.thumbnail ? `<img src="${meta.thumbnail}" alt="${meta.thumbnailAlt||''}" class="article-thumbnail"/>` : ''}
        <h1>${meta.title}</h1>
        <div class="meta">
          ${meta.date ? `<time>${new Date(meta.date).toLocaleDateString()}</time>` : ''}
          ${meta.author ? `<span>By ${meta.author}</span>` : ''}
          ${(meta.tags||[]).map(t=>`<sl-tag>${t}</sl-tag>`).join('')}
        </div>
        <div class="article-body">${body}</div>
      `;
  
      // syntax highlighting with highlight.js
      if (window.hljs) {
        document.querySelectorAll('pre code').forEach(block => {
          window.hljs.highlightElement(block);
        });
      }
      document.title = `${meta.title} | Sodalite`;
  
    } catch (err) {
      container.innerHTML = `
        <sl-alert variant="danger" open>
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          Failed to load article: ${err.message}
        </sl-alert>
      `;
    }
  }
  
  // —— THEME & FALLBACK CSS VARS ——
  document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('selenite.theme') || 'dark';
    document.body.setAttribute('theme', theme);
    const root = getComputedStyle(document.documentElement);
    if (!root.getPropertyValue('--bg').trim()) {
      document.documentElement.style.setProperty('--bg', '#10002b');
      document.documentElement.style.setProperty('--textcolor', '#e0aaff');
    }
  });
