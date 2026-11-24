---
title: "05. 高阶代码块与语法高亮"
description: "实测 Hexo 8 内置 {% codeblock %} 标签插件（标题栏、lang:ts、line_number、mark:3,7-9 行高亮）与 hexo-util 服务端 highlight.js 编译表现。"
navKey: 05-code-blocks
navTitle: "05. 高阶代码块与语法高亮"
order: 5
---

# 05. 高阶代码块与语法高亮（Hexo `{% raw %}{% codeblock %}{% endraw %}` + 服务端 `highlight.js`）

技术文档中超过 40% 的篇幅由代码块构成，但标准 CommonMark / GitHub Flavored Markdown **仅定义了围栏语言标识（```` ```ts ````）**，并未定义文件名标题栏、指定行高亮、带语法着色的行级 Diff 以及多语言 Tab 代码组。本文件由标准 GFM 母版派生适配至 **Hexo (`hexo@8.1.2` + `hexo-util` 服务端 `highlight.js`)**。

## 1. 代码块文件名标题栏与基础语法高亮（内置 `{% raw %}{% codeblock %}{% endraw %}`）

早在现代前端文档框架发明 `title="..."` 之前，Hexo 便从 Octopress 继承并内置了经典的 **`{% raw %}{% codeblock [title] [lang:language] [line_number:true] [mark:1,3-5] %}{% endraw %}`** 标签插件（其实反引号围栏底层 `backtick_code_block` 过滤器同样支持在语言名后直接追加空格分隔标题与 `mark:` 键值对！）：

- 构建期调用 `hexo-util` 封装的 **`highlight.js`** 在 Node.js 端直出 `<figure class="highlight ts"><figcaption><span>...</span></figcaption>...</figure>`，页面保持 **0 KB 客户端 JS**。
- **重要边界**：与三反引号围栏不同，成对标签 `{% raw %}{% codeblock %}{% endraw %}` 先经过 Nunjucks 解析——若代码体内部含有字面量 `{% raw %}{{ ... }}{% endraw %}` 或 `{% raw %}{% ... %}{% endraw %}`，外层反倒不如直接使用 Hexo 增强版反引号围栏安全！

{% codeblock scripts/resolve-route.ts lang:ts line_number:true mark:3,7-9 %}
export interface RouteContext {
  basePath: string
  slug: string
  cleanUrls: boolean
}

export function formatDocRoute(ctx: RouteContext): string {
  const prefix = ctx.basePath.endsWith('/') ? ctx.basePath : `${ctx.basePath}/`
  const normalized = ctx.slug.replace(/^\/+|\/+$/g, '')
  if (!normalized || normalized === 'index') return prefix
  return ctx.cleanUrls ? `${prefix}${normalized}/` : `${prefix}${normalized}.html`
}
{% endcodeblock %}

## 2. 关键行聚焦与高亮（`mark:3,7-9` 区间标记）

通过 `mark:3,7-9` 参数，Hexo 8 在构建期将第 `3` 行与第 `7–9` 行包裹进语义化 `<mark>...</mark>` 元素（注：浏览器默认对 `<mark>` 施加刺眼的亮黄色 `#ffff00` 背景与纯黑文字，深色模式下必须在主题 CSS 中重置 `figure.highlight mark` 背景与继承文字色）：

{% codeblock bench.config.json lang:json line_number:true mark:3,7-9 %}
{
  "id": "ssg-benchmark",
  "routeStyle": "clean",
  "strictZeroCdn": true,
  "markdown": {
    "mathEngine": "katex",
    "diagramEngine": "mermaid",
    "lineHighlight": true,
    "codeTransformers": ["diff", "focus"]
  }
}
{% endcodeblock %}

## 3. 代码增删对比着色（`highlight.js` `diff` 词法规则）

标准 ```` ```diff ```` 围栏块经服务端 `highlight.js` 解析后，分别为 `-` 删除行与 `+` 新增行生成 `.hljs-deletion` 与 `.hljs-addition` 类名（同样整块切换为 `diff` 语法，不叠加底层 TypeScript 词法高亮）：

```diff
 export function mountSubsite(baseDir: string, subPath: string): string | null {
-  const cleanRel = decodeURIComponent(subPath).replace(/\.\./g, '')
-  return `${baseDir}/${cleanRel}`
+  const resolvedBase = path.resolve(baseDir)
+  const target = path.resolve(resolvedBase, decodeURIComponent(subPath).replace(/^\/+/, ''))
+  return target.startsWith(`${resolvedBase}${path.sep}`) ? target : null
 }
```

## 4. 多语言运行时命令组（`{% raw %}{% folding %}{% endraw %}` 零脚本折叠面板组）

Hexo 核心未内置 `tabs` 标签插件（NexT / Butterfly 等商业主题各自通过私有 `{% raw %}{% tabs %}{% endraw %}` + 客户端脚本实现）；为严守非图表页 **0 个 `<script>` 标签** 的纯净基准，此处采用与第 01 章一致的 `{% raw %}{% folding %}{% endraw %}` 标签插件组织四套运行时构建命令：

{% folding open Node.js (package.json) %}
```bash
npm ci && npm run build
```
{% endfolding %}

{% folding Deno 2 (deno.json) %}
```bash
deno task build
```
{% endfolding %}

{% folding Python (requirements.txt) %}
```bash
pip install -r requirements.txt && sphinx-build -b dirhtml . _build/dirhtml
```
{% endfolding %}

{% folding Ruby (Gemfile) %}
```bash
bundle install && bundle exec jekyll build
```
{% endfolding %}

## 5. 四大底层高亮引擎能力对照小结

| 高亮引擎代表 | 典型采用框架 | 构建期零运行时 JS | 原生行号 / 行高亮 | 保留词法着色的 Diff |
| :--- | :--- | :--- | :--- | :--- |
| **Shiki / Expressive Code** | VitePress、Starlight、Fumadocs、Nextra、Rspress、Nuxt、Quartz | ✅ 纯静态内联样式 | ✅ `{1,3-5}` / `[!code highlight]` | ✅ `// [!code ++]` |
| **Prism.js** | Docusaurus、VuePress、Eleventy (plugin)、Gatsby | ✅ 静态 Token 类名 | ✅ `{1,3-5}` / 魔法注释 | ⚠️ 需配 diff-highlight 插件 |
| **Pygments / Rouge** | MkDocs Material、Sphinx、Pelican、Jekyll | ✅ Python/Ruby 编译直出 | ✅ `hl_lines` / `emphasize-lines` | ⚠️ 仅标准 `diff` 块红绿 |
| **Chroma / Giallo / hljs** | Hugo (Go Chroma)、Zola (Rust Giallo)、mdBook (hljs) | ✅ (mdBook 为客户端 hljs) | ✅ Hugo/Zola 原生 `hl_lines` | ⚠️ 仅标准 `diff` 块红绿 |
