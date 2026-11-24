---
title: "嵌套子页 A：排序前缀与 URL 纯净度权衡"
navKey: 01-order-and-url
navTitle: "嵌套子页 A：排序前缀与 URL 纯净度权衡"
parent: 04-directory
order: 1
sectionBadge: "Hexo Nested Page"
sectionContext: "source/04-directory/nested/01-order-and-url/index.md"
---

# 嵌套子页 A：排序前缀与 URL 纯净度权衡

在母版目录 `docs/04-directory/nested/` 中，文件名使用 `01-order-and-url.md` 以保证在 Git 与代码编辑器中按阅读先后顺序排列。派生至 Hexo 后，独立页面展开为 `01-order-and-url/index.md` 以产出干净目录路由 `/hexo/04-directory/nested/01-order-and-url/`（若希望进一步抹除线上 URL 中的 `01-` 序号前缀，亦可在单页 Frontmatter 中显式声明 `permalink: 04-directory/nested/order-and-url/`）。

- [返回《04. 目录结构与路由取舍》](../../index.md)
- [下一篇：《嵌套子页 B：多级子目录与侧边栏同步机制》](../02-sidebar-sync/index.md)
