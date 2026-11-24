---
title: "00. 概览与版本档案 (Hexo v8)"
description: "经典中文与技术博客开山鼻祖 Hexo (hexo@8.1.2) 静态文档化改造基准实测子站。"
layout: index
navKey: index
navTitle: "00. 概览与版本档案"
order: 0
---

# Hexo (`8.1.2` CJS) 基准实测子站

本子模块由主仓 `page2401.github.io/docs/` 标准 GFM 母版**最小化派生适配**而来，实测中文开发者社区最具历史影响力的 Node.js 静态站点生成器 **Hexo (`hexo@8.1.2`)** 在**四维插件体系（Tag / Filter / Helper / Generator）**、**Nunjucks 标签插件（Tag Plugins）**、**Warehouse 内存文档数据库（`site.pages`）** 以及 **零客户端 JS 构建期 SSR 公式与高亮** 下的真实表现。

<div class="hero-grid">
  <div class="hero-card">
    <h3><a href="./01-annotations/index.md">01. 专属标注与元数据 →</a></h3>
    <p>实测 Hexo 招牌 Nunjucks 标签插件 <code>{% raw %}{% note %}{% endraw %}</code> / <code>{% raw %}{% folding %}{% endraw %}</code> 与 <code>marked:renderer</code> GFM 警报扩展。</p>
  </div>
  <div class="hero-card">
    <h3><a href="./02-diagrams/index.md">02. 流程图与时序图 →</a></h3>
    <p>在内置 <code>backtick_code_block</code> 高亮前通过优先级 <code>5</code> 过滤器拦截围栏，按需挂载本地 <code>mermaid@12.3.0</code>。</p>
  </div>
  <div class="hero-card">
    <h3><a href="./03-math/index.md">03. 数学公式排版 →</a></h3>
    <p>基于 <code>marked:extensions</code> 调用 <code>katex@0.19.1</code> 构建期直出 HTML，隔离 Nunjucks 花括号冲突，实现 <strong>0 个 script 标签</strong>。</p>
  </div>
  <div class="hero-card">
    <h3><a href="./04-directory/index.md">04. 目录结构与路由取舍 →</a></h3>
    <p>剖析博客基因下 <code>_posts/</code> 与独立 <code>Page</code> 双轨路由差异及 <code>&lt;slug&gt;/index.md</code> 干净 URL 约定。</p>
  </div>
</div>

## 精确锁定版本档案（`package.json`）

Hexo 8 延续了经典的 Node.js CommonJS 插件生态与 `scripts/*.js` 自动加载机制。本子站不引入任何臃肿三方商业主题，使用精炼的自定义 `themes/bench`（EJS 模板）与 3 个本地扩展脚本完成全部构建期渲染，非图表页面输出 **0 字节客户端 JS（0 个 `<script>` 标签）**，全站零外部 CDN 请求：

| 依赖包名称 | 精确锁定版本 | 在本子站中的职责与接入方式 |
| :--- | :--- | :--- |
| `hexo` | `8.1.2` | 核心构建引擎（内置 `warehouse@6` 内存数据库、`nunjucks@3.2` 标签预处理器与 `hexo-util` 服务端代码高亮） |
| `hexo-renderer-ejs` | `2.0.0` | 官方 EJS 布局模板渲染器（驱动 `themes/bench/layout/{layout,index,page}.ejs`） |
| `hexo-renderer-marked` | `7.0.1` | 官方默认 Markdown 渲染器（底层封装 `marked@15.0.12`，暴露 `marked:extensions` 与 `marked:renderer` 钩子） |
| `katex` | `0.19.1` | 构建期在 `marked:extensions` 中服务端渲染公式 HTML + MathML，由 `Generator` 输出本地 CSS 与字体至 `/hexo/vendor/` |
| `mermaid` | `12.3.0` | 仅当页面产物包含 `.mermaid` 图表容器时按需加载本地 `/hexo/vendor/mermaid.min.js` |

## 五大标准基准章节对照

| 章节路径 | 测试维度 | 相对母版 `docs/*.md` 的核心派生改造点 |
| :--- | :--- | :--- |
| [`01-annotations/index.md`](./01-annotations/index.md) | 专属标注与元数据 | 第 2 节改用 Hexo 招牌 `{% raw %}{% note type 标题 %}{% endraw %}` 标签插件；第 3 节并列对比 `{% raw %}{% folding %}{% endraw %}` 与原生 `<details>`；第 4 节靠 `marked:renderer` 直通 `> [!NOTE]` |
| [`02-diagrams/index.md`](./02-diagrams/index.md) | 流程图与时序图 | 正文三段 Mermaid 代码块一字不改；靠优先级 `5` 的 `before_post_render` 抢在内置 `highlight.js` 前接管围栏块 |
| [`03-math/index.md`](./03-math/index.md) | 数学公式排版 | 正文公式与 `\$` 转义测试一字不改；通过 `marked:extensions` 构建期直出 KaTeX HTML 并转义 `<annotation>` 花括号防 Nunjucks 报错 |
| [`04-directory/`](./04-directory/index.md) | 目录结构与路由取舍 | 因全局 `permalink` 仅对 `_posts/` 生效，独立文档页遵循 `hexo new page` 展开为 `<slug>/index.md`，由 `Warehouse` 查询动态构建多级侧栏 |
