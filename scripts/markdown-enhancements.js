'use strict';

const path = require('path');
const katex = require('katex');
const { escapeHTML, stripHTML, url_for } = require('hexo-util');

const GFM_ALERT_TITLES = {
  note: 'NOTE · 提示',
  tip: 'TIP · 技巧',
  important: 'IMPORTANT · 重要',
  warning: 'WARNING · 注意',
  caution: 'CAUTION · 危险警告'
};

function protectNunjucksBraces(html) {
  // Prevent Hexo's post-Markdown Nunjucks tag.render pass from misinterpreting
  // braces inside KaTeX <annotation encoding="application/x-tex"> or MathML.
  return html.replace(
    /(<annotation\b[^>]*>)([\s\S]*?)(<\/annotation>)/g,
    (_, open, tex, close) =>
      open + tex.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;') + close
  );
}

function renderKatexHtml(tex, displayMode) {
  const html = katex.renderToString(tex.trim(), {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml'
  });
  const safeHtml = protectNunjucksBraces(html);
  return displayMode ? `<div class="katex-block">${safeHtml}</div>\n` : safeHtml;
}

// 1. Intercept ```mermaid fenced code blocks BEFORE Hexo's built-in backtick_code_block (priority 10)
hexo.extend.filter.register(
  'before_post_render',
  function (data) {
    if (!data.content || !data.content.includes('```mermaid')) return data;
    data.content = data.content.replace(
      /^([^\S\r\n]*)`{3,}[^\S\r\n]*mermaid[^\S\r\n]*\r?\n([\s\S]*?)\r?\n\1`{3,}[^\S\r\n]*$/gm,
      (_, indent, diagramCode) => {
        const escaped = escapeHTML(diagramCode.trim())
          .replace(/\{/g, '&#123;')
          .replace(/\}/g, '&#125;');
        return `${indent}<hexoPostRenderCodeBlock><div class="hexo-mermaid-wrap"><pre class="mermaid">${escaped}</pre></div></hexoPostRenderCodeBlock>`;
      }
    );
    return data;
  },
  5
);

// 2. Build-time Server-Side KaTeX via hexo-renderer-marked's marked:extensions filter
hexo.extend.filter.register('marked:extensions', function (extensions) {
  extensions.push(
    {
      name: 'hexoBlockKatex',
      level: 'block',
      start(src) {
        const idx = src.indexOf('$$');
        return idx >= 0 ? idx : undefined;
      },
      tokenizer(src) {
        const multiMatch = /^[^\S\r\n]*\$\$[^\S\r\n]*\r?\n([\s\S]+?)\r?\n[^\S\r\n]*\$\$[^\S\r\n]*(?:\r?\n|$)/.exec(src);
        if (multiMatch) {
          return {
            type: 'hexoBlockKatex',
            raw: multiMatch[0],
            tex: multiMatch[1]
          };
        }
        const singleMatch = /^[^\S\r\n]*\$\$([^\r\n$]+?)\$\$[^\S\r\n]*(?:\r?\n|$)/.exec(src);
        if (singleMatch) {
          return {
            type: 'hexoBlockKatex',
            raw: singleMatch[0],
            tex: singleMatch[1]
          };
        }
      },
      renderer(token) {
        return renderKatexHtml(token.tex, true);
      }
    },
    {
      name: 'hexoInlineKatex',
      level: 'inline',
      start(src) {
        for (let i = 0; i < src.length; i++) {
          if (src[i] === '\\') {
            i++;
            continue;
          }
          if (src[i] === '$') return i;
        }
        return undefined;
      },
      tokenizer(src) {
        if (src[0] !== '$' || src[1] === '$') return;
        const firstAfter = src[1];
        if (!firstAfter || /\s/.test(firstAfter)) return;

        let i = 1;
        while (i < src.length) {
          const ch = src[i];
          if (ch === '\\') {
            i += 2;
            continue;
          }
          if (ch === '\n' || ch === '\r') return;
          if (ch === '$') {
            const prev = src[i - 1];
            const next = src[i + 1];
            if (!/\s/.test(prev) && next !== '$' && !/[0-9]/.test(next || '')) {
              const raw = src.slice(0, i + 1);
              const tex = src.slice(1, i);
              return {
                type: 'hexoInlineKatex',
                raw,
                tex
              };
            }
          }
          i++;
        }
      },
      renderer(token) {
        return renderKatexHtml(token.tex, false);
      }
    }
  );
});

// 3. Extend marked:renderer for clean Heading IDs (fixing Hexo 8 headerlink Swig cache crash!) and GFM Alerts
hexo.extend.filter.register('marked:renderer', function (renderer) {
  const { slugize, unescapeHTML } = require('hexo-util');

  renderer.heading = function ({ tokens, depth: level }) {
    const text = this.parser.parseInline(tokens);
    const plain = stripHTML(unescapeHTML(text)).replace(/!--swig\uFFFC\d+--/g, '').trim();
    let id = slugize(plain || `section-${level}`);
    const headingId = (this.options._headingId = this.options._headingId || {});
    if (headingId[id]) {
      id += `-${headingId[id]++}`;
    } else {
      headingId[id] = 1;
    }
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };

  renderer.blockquote = function ({ tokens }) {
    const innerHtml = this.parser.parse(tokens);
    const alertMatch = /^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]*\r?\n|<br\s*\/?>)?([\s\S]*)$/i.exec(
      innerHtml.trim()
    );
    if (!alertMatch) {
      return `<blockquote>\n${innerHtml}</blockquote>\n`;
    }

    const type = alertMatch[1].toLowerCase();
    const title = GFM_ALERT_TITLES[type] || type.toUpperCase();
    let rest = alertMatch[2];
    if (rest.startsWith('</p>')) {
      rest = rest.slice(4).trimStart();
    } else {
      rest = `<p>${rest}`;
    }

    return (
      `<div class="markdown-alert markdown-alert-${type}">\n` +
      `  <p class="markdown-alert-title">${escapeHTML(title)}</p>\n` +
      `  ${rest}\n` +
      `</div>\n`
    );
  };
});

// 4. Deterministic relative .md link resolution in after_post_render (preserves offline .md links in source!)
hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content || !data.source) return data;
  const currentSourceRel = String(data.source).replace(/\\/g, '/');
  const rawDir = path.posix.dirname(currentSourceRel);
  const currentDir = rawDir === '.' ? '' : rawDir;

  data.content = data.content.replace(
    /(<a\b[^>]*?\bhref=")([^"]+)(")/gi,
    (full, prefix, href, suffix) => {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(href)) return full;
      if (!/\.md(?:#.*)?$/i.test(href)) return full;

      const hashIdx = href.indexOf('#');
      const rawRel = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
      const hashPart = hashIdx >= 0 ? href.slice(hashIdx) : '';

      let resolved = path.posix.normalize(
        currentDir ? path.posix.join(currentDir, rawRel) : rawRel
      );
      if (resolved === 'index.md') {
        resolved = '/';
      } else if (resolved.endsWith('/index.md')) {
        resolved = '/' + resolved.slice(0, -'index.md'.length);
      } else {
        resolved = '/' + resolved.replace(/\.md$/i, '/');
      }
      const finalHref = url_for.call(this, resolved) + hashPart;
      return `${prefix}${finalHref}${suffix}`;
    }
  );
  return data;
});

// 4. Theme Helpers: Warehouse site.pages Sidebar Tree + Right-side Heading TOC
hexo.extend.helper.register('build_doc_nav', function () {
  const pages = this.site.pages.toArray();
  const byKey = new Map();

  for (const p of pages) {
    if (!p.navKey) continue;
    let cleanUrl = '/' + String(p.path || '').replace(/^\/+/, '');
    if (cleanUrl === '/index.html') {
      cleanUrl = '/';
    } else if (cleanUrl.endsWith('/index.html')) {
      cleanUrl = cleanUrl.slice(0, -'index.html'.length);
    }
    byKey.set(p.navKey, {
      key: p.navKey,
      title: p.navTitle || p.title || p.navKey,
      order: typeof p.order === 'number' ? p.order : 99,
      parent: p.parent || null,
      groupLabel: p.groupLabel || null,
      url: url_for.call(this, cleanUrl),
      rawUrl: cleanUrl,
      children: []
    });
  }

  const roots = [];
  for (const node of byKey.values()) {
    if (node.parent && byKey.has(node.parent)) {
      byKey.get(node.parent).children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortFn = (a, b) => a.order - b.order || a.key.localeCompare(b.key, 'en');
  roots.sort(sortFn);
  for (const node of byKey.values()) {
    node.children.sort(sortFn);
  }
  return roots;
});

hexo.extend.helper.register('normalize_page_url', function (pagePath) {
  let cleanUrl = '/' + String(pagePath || '').replace(/^\/+/, '');
  if (cleanUrl === '/index.html') return '/';
  if (cleanUrl.endsWith('/index.html')) return cleanUrl.slice(0, -'index.html'.length);
  return cleanUrl;
});

hexo.extend.helper.register('extract_doc_toc', function (htmlContent) {
  if (!htmlContent) return [];
  const items = [];
  const re = /<h([23])\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = re.exec(htmlContent)) !== null) {
    const level = Number(match[1]);
    const id = match[2];
    const text = stripHTML(match[3]).trim();
    if (text) items.push({ level, id, text });
  }
  return items;
});
