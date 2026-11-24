'use strict';

const { escapeHTML } = require('hexo-util');

const NOTE_DEFAULT_TITLES = {
  info: '信息提示 (Hexo Note Tag)',
  note: '提示说明',
  tip: '性能优化与实践技巧',
  success: '推荐实践',
  important: '重要约定',
  warning: '边界注意',
  danger: '危险警告',
  caution: '危险警告'
};

const KNOWN_TYPES = new Set(Object.keys(NOTE_DEFAULT_TITLES));

/**
 * Hexo Iconic Paired Tag Plugin:
 * {% note [type] [custom title...] %}
 * Markdown content...
 * {% endnote %}
 */
hexo.extend.tag.register(
  'note',
  function (args, content) {
    let type = 'info';
    let titleParts = args.slice();

    if (titleParts.length > 0 && KNOWN_TYPES.has(titleParts[0].toLowerCase())) {
      type = titleParts.shift().toLowerCase();
    }
    if (type === 'note') type = 'info';
    if (type === 'success') type = 'tip';
    if (type === 'caution') type = 'danger';

    const title = titleParts.join(' ').trim() || NOTE_DEFAULT_TITLES[type] || type.toUpperCase();
    const rendered = hexo.render.renderSync({ text: content || '', engine: 'markdown' });

    return (
      `<aside class="hexo-note is-${type}">\n` +
      `  <div class="hexo-note-title">${escapeHTML(title)}</div>\n` +
      `  <div class="hexo-note-body">\n${rendered}  </div>\n` +
      `</aside>\n`
    );
  },
  { ends: true }
);

/**
 * Hexo Iconic Collapsible Tag Plugin (Butterfly / Volantis / Fluid style):
 * {% folding [open] [summary title...] %}
 * Markdown content...
 * {% endfolding %}
 */
hexo.extend.tag.register(
  'folding',
  function (args, content) {
    const parts = args.slice();
    let isOpen = false;
    if (parts.length > 0 && parts[0].toLowerCase() === 'open') {
      isOpen = true;
      parts.shift();
    }
    const summary = parts.join(' ').trim() || '点击展开查看详情';
    const rendered = hexo.render.renderSync({ text: content || '', engine: 'markdown' });

    return (
      `<details class="hexo-folding"${isOpen ? ' open' : ''}>\n` +
      `  <summary>${escapeHTML(summary)}</summary>\n` +
      `  <div class="hexo-folding-body">\n${rendered}  </div>\n` +
      `</details>\n`
    );
  },
  { ends: true }
);
