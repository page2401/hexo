---
title: "04. 目录结构与路由取舍"
description: "实测 Hexo 博客基因下的 _posts 与独立 Page 双轨路由机制、<slug>/index.md 干净目录约定与 Warehouse 动态侧栏。"
navKey: 04-directory
navTitle: "04. 目录结构与路由取舍"
groupLabel: "nested · 多级嵌套子页"
order: 4
sectionBadge: "Hexo Page Directory"
sectionContext: "source/04-directory/index.md → Warehouse site.pages"
---

# 04. 目录结构与路由取舍（Post / Page 双轨制与目录化约定）

将标准 GFM 母版 `docs/04-directory/` 迁移至 **Hexo (`hexo@8.1.2`)** 时，清晰暴露出“博客引擎改造成多级知识库文档站”时的核心架构特征与取舍：

{% note info Hexo 路由与目录三大核心实测发现 %}
1. **博客基因导致的 `_posts` vs `Page` 双轨制**：`_config.yml` 中的全局 `permalink: :year/:month/:day/:title/` **仅对 `source/_posts/` 下的博文生效**！对于放置在 `source/` 下的独立文档页（`Page` 模型），若直接放 `source/01-annotations.md`，Hexo `assetProcessor` 会固定输出 `public/01-annotations.html`。
2. **`pretty_urls.trailing_html: false` 的隐蔽陷阱**：Hexo 配置中的 `pretty_urls` 仅裁剪 `url_for()` 生成的超链接后缀，**并不会改变磁盘上生成的 `.html` 文件路径**——若在纯静态文件服务器上盲目关闭 `trailing_html`，会导致无后缀链接集体 404！因此 Hexo 官方 `hexo new page <slug>` 确立了将每篇独立页展开为 `<slug>/index.md` 目录（如 `source/01-annotations/index.md` → `public/01-annotations/index.html`）的干净 URL 范式。
3. **`source_dir: source` 天然隔离 + `Warehouse` 动态聚合侧边栏**：仓库根目录 `README.md` 被干净隔离在 `source/` 之外；由于 Hexo `Page` 模型不像博文那样拥有 `Categories`，本子站通过自定义 Helper 直接查询 `site.pages`（`warehouse@6` 内存表），按 `order` 与 `parent` 字段自动构建多级树，并在 `after_post_render` 中将离线 `.md` 相对链接自动重写为线上路由。
{% endnote %}

## 母版与 Hexo 目录派生对比

1. **`source/` 内容根隔离**：工程根目录下的 `_config.yml`、`scripts/`、`themes/` 与 `README.md` 均不会混入 `source/` 编译流。
2. **目录化单页结构**：单文件章节如 `docs/04-directory/nested/01-order-and-url.md` 派生为 `source/04-directory/nested/01-order-and-url/index.md`，确保静态产物天然落盘为 `index.html` 干净目录路由。
3. **保留离线可点击 `.md` 相对路径**：源码内继续使用 `./nested/01-order-and-url/index.md` 相对链接，GitHub 网页端与本地编辑器点击直达，构建期自动重写为 `/hexo/04-directory/nested/01-order-and-url/`。

## 嵌套子文档入口

- [进入子文档 A：排序前缀与 URL 纯净度权衡](./nested/01-order-and-url/index.md)
- [进入子文档 B：多级子目录与侧边栏同步机制](./nested/02-sidebar-sync/index.md)
