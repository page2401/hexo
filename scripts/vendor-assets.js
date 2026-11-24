'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Hexo Static Vendor Generator:
 * Emits local katex.min.css, KaTeX webfont files, and mermaid.min.js from node_modules
 * directly into public/vendor/ at build time — zero external CDN requests!
 */
hexo.extend.generator.register('bench-vendor-assets', function () {
  const routes = [];
  const katexDist = path.join(hexo.base_dir, 'node_modules', 'katex', 'dist');
  const mermaidFile = path.join(hexo.base_dir, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

  const katexCss = path.join(katexDist, 'katex.min.css');
  if (fs.existsSync(katexCss)) {
    routes.push({
      path: 'vendor/katex.min.css',
      data: () => fs.createReadStream(katexCss)
    });
  }

  const fontsDir = path.join(katexDist, 'fonts');
  if (fs.existsSync(fontsDir)) {
    for (const fileName of fs.readdirSync(fontsDir)) {
      const fullPath = path.join(fontsDir, fileName);
      if (fs.statSync(fullPath).isFile()) {
        routes.push({
          path: `vendor/fonts/${fileName}`,
          data: () => fs.createReadStream(fullPath)
        });
      }
    }
  }

  if (fs.existsSync(mermaidFile)) {
    routes.push({
      path: 'vendor/mermaid.min.js',
      data: () => fs.createReadStream(mermaidFile)
    });
  }

  return routes;
});
