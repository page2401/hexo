---
title: "嵌套子页 B：多级子目录与侧边栏同步机制"
navKey: 02-sidebar-sync
navTitle: "嵌套子页 B：多级子目录与侧边栏同步机制"
parent: 04-directory
order: 2
sectionBadge: "Hexo Nested Page"
sectionContext: "Warehouse site.pages 动态父子聚合"
---

# 嵌套子页 B：多级子目录与侧边栏同步机制

在纯 Markdown 母版仓库中，新增一篇子目录文档无需修改任何外部配置文件；而传统 Hexo 博客主题通常只按时间流展示 `_posts/` 博文，对 `Page` 独立页面缺乏原生层级树（往往需要在 `_config.yml` 或 `_data/sidebar.yml` 手写整棵菜单）。本子站通过自定义 `build_doc_nav` Helper 直接遍历 Hexo 内置 `Warehouse` 数据库的 `site.pages` 表，读取单页 Frontmatter 中的 `parent: 04-directory` 与 `order: 2` 动态生成多级侧边栏，避免手改全局配置表。

- [返回上一篇：《嵌套子页 A：排序前缀与 URL 纯净度权衡》](../01-order-and-url/index.md)
- [返回《04. 目录结构与路由取舍》](../../index.md)
