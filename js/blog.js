// /blog.js

document.addEventListener('DOMContentLoaded', () => {
    // normalize path and split into segments
    const path = location.pathname
    const clean = path.replace(/^\/|\/$/g, '')  // remove leading + trailing slash
    const parts = clean.split('/')              // e.g. ["blog"], ["blog","test2"], ["blog.html"]
  
    const isIndex =
      path === '/blog.html' ||
      clean === 'blog' ||
      clean === 'blog/index.html'
    const isArticle =
      parts[0] === 'blog' &&
      parts.length === 2 &&
      !parts[1].endsWith('.html')
  
    console.log('[blog.js] isIndex:', isIndex, 'isArticle:', isArticle)
  
    if (isArticle) {
      renderArticle()
    } else {
      renderIndex()
    }
  })
  
  
  // —— INDEX PAGE ——
  async function renderIndex() {
    const container = document.getElementById('articles')
    if (!container) {
      console.error('[blog.js] #articles container not found')
      return
    }
  
    try {
      const res = await fetch('/articles.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const articles = await res.json()
  
      // clear any loading placeholder
      container.innerHTML = ''
  
      if (!articles.length) {
        container.innerHTML = `<p>No articles found.</p>`
        return
      }
  
      for (const a of articles) {
        const card = document.createElement('div')
        card.className = 'article-card'
        card.innerHTML = `
          <img src="${a.thumbnail}" alt="${a.title}" class="article-thumbnail"/>
          <h2>${a.title}</h2>
          <small>${new Date(a.date).toLocaleDateString()} • ${a.author}</small>
          <p>${a.excerpt}</p>
        `
        card.addEventListener('click', () => {
          location.href = `/blog/${a.slug}/`
        })
        container.appendChild(card)
      }
  
      // wire up search
      const search = document.getElementById('blogsearch')
      if (search) {
        search.addEventListener('input', e => {
          const q = e.target.value.toLowerCase()
          document.querySelectorAll('.article-card').forEach(card => {
            card.style.display =
              card.textContent.toLowerCase().includes(q) ? '' : 'none'
          })
        })
      }
    }
    catch (err) {
      console.error('[blog.js] renderIndex error', err)
      container.innerHTML =
        `<p class="error">Failed to load articles: ${err.message}</p>`
    }
  }








  function processParagraphInlineCode(container) {
    container.querySelectorAll('p').forEach(p => {
      // We only want to replace backticks in the *text* nodes,
      // so we split by backticks, then wrap every odd segment in code.
      let parts = p.innerHTML.split(/`([^`]+)`/g);
      // parts will be [ beforeText, codeText, afterText, ... ]
      for (let i = 1; i < parts.length; i += 2) {
        parts[i] = `<code>${parts[i]}</code>`;
      }
      p.innerHTML = parts.join('');
    });
  }
  
  // Call it on your tempDiv right before inserting:
  processParagraphInlineCode(tempDiv);

  

  // … after your sl-code-block → <pre><code> conversion …
processParagraphInlineCode(tempDiv);

// Now build the final HTML:
const articleHTML = `
  ${meta.thumbnail ? `<img …>` : ''}
  <div class="article-header">…</div>
  <div class="article-body">${tempDiv.innerHTML}</div>
`;







  
  // —— ARTICLE PAGE ——
  async function renderArticle() {
    const container = document.getElementById('article-container')
    if (!container) {
      console.error('[blog.js] #article-container not found')
      return
    }
  
    try {
      // slug is the second segment: /blog/<slug>/
      const slug = location.pathname.replace(/\/blog\/|\/$/g, '').split('/')[1]
      const res  = await fetch(`/blog/${slug}/content.html`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
  
      const doc    = new DOMParser().parseFromString(text, 'text/html')
      const metaS  = doc.querySelector('script[type="application/article-meta"]')
      const artDiv = doc.getElementById('article-content')
      if (!metaS || !artDiv) throw new Error('Invalid article format')
  
      const meta     = JSON.parse(metaS.textContent)
      const bodyHTML = artDiv.innerHTML
  
      // inject into page
      container.innerHTML = `
        ${meta.thumbnail ? `<img class="article-thumbnail" src="${meta.thumbnail}" alt="${meta.thumbnailAlt||''}">` : ''}
        <div class="article-header">
          <h1>${meta.title}</h1>
          <div class="meta">
            ${meta.date   ? `<time>${new Date(meta.date).toLocaleDateString()}</time>` : ''}
            ${meta.author ? `<span>By ${meta.author}</span>` : ''}
            ${(meta.tags||[]).map(t=>`<sl-tag>${t}</sl-tag>`).join('')}
          </div>
        </div>
        <div class="article-body">${bodyHTML}</div>
      `
  
      // code–block → <pre><code class="language-…">
      container.querySelectorAll('sl-code-block').forEach(el => {
        const lang     = el.getAttribute('language') || 'plaintext'
        const codeText = el.textContent.trim()
        const pre  = document.createElement('pre');
        pre.classList.add('line-numbers');
        const code = document.createElement('code');
        code.classList.add(`language-${lang}`)
        code.textContent = codeText
        pre.appendChild(code)
        el.replaceWith(pre)
      })
  
      // Prism highlighting
      if (window.Prism) {
        Prism.highlightAll()
      } else {
        console.warn('Prism not loaded')
      }
  
      document.title = `${meta.title} | Sodalite`
    }
    catch (err) {
      console.error('[blog.js] renderArticle error', err)
      container.innerHTML = `
        <sl-alert variant="danger" open>
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          Failed to load article: ${err.message}
        </sl-alert>
      `
    }
  }
  
  
  // —— THEME & FALLBACK CSS VARS ——
  document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('selenite.theme') || 'dark'
    document.body.setAttribute('theme', theme)
    const root = getComputedStyle(document.documentElement)
    if (!root.getPropertyValue('--bg').trim()) {
      document.documentElement.style.setProperty('--bg', '#10002b')
      document.documentElement.style.setProperty('--textcolor', '#e0aaff')
    }
  })
  