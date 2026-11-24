---
title: "01. 专属标注与元数据"
description: "实测 Hexo 8 的宽松 YAML Frontmatter、经典 Nunjucks 标签插件 ({% note %} / {% folding %}) 与 marked:renderer GFM Alerts。"
navKey: 01-annotations
navTitle: "01. 专属标注与元数据"
order: 1
---

# 01. 专属标注与元数据（Hexo Tag Plugins + GFM Alerts）

不同静态网站生成器对“提示框 / 标注（Callouts / Admonitions）”和页面元数据的语法约定存在显著分歧。本文件由标准 GFM 母版派生适配至 **Hexo (`hexo@8.1.2`)**。

## 1. Frontmatter 元数据机制

Hexo 使用 `hexo-front-matter` 解析顶部 YAML（同样支持省略开头 `---` 的简写格式），对自定义字段完全免 Schema 约束，并自动为每个 `Page` 注入文件系统时间戳 `date` 与 `updated` 存入内置 `Warehouse` 数据库：

- **当前页标题字段**：`title: "01. 专属标注与元数据"`
- **页面摘要字段**：`description: "..."`
- **自定义导航元数据**：`navKey`、`order`、`parent`（存入 `site.pages` 供主题 Helper 动态组装多级文档侧边栏；遇到重度花括号页面还可单页声明 `disableNunjucks: true` 关闭标签解析）

## 2. 标准提示语义块（Hexo 招牌 Nunjucks 标签插件 `{% raw %}{% note %}{% endraw %}`）

与 VitePress 的三冒号 `::: tip` 不同，Hexo 自诞生起便确立了以 `hexo.extend.tag.register('note', fn, { ends: true })` 为核心的 **Tag Plugins（Nunjucks / Swig 风格标签插件）** 传统（NexT、Fluid、Butterfly、Volantis 等主流主题均沿用 `{% raw %}{% note type 标题 %}...{% endnote %}{% endraw %}` 方言）：

{% note info 默认信息提示块 %}
静态站点对比平台的每个子模块均独立维护 `main`（源码）与 `page`（构建产物）双分支，互不污染提交历史。
{% endnote %}

{% note tip 性能优化建议（自定义标题语义） %}
在 Hexo 成对标签插件内部调用 `hexo.render.renderSync({ text: content, engine: 'markdown' })`，即可让容器内部无缝支持行内代码、**加粗强调**与构建期数学公式，最终输出纯静态 `<aside class="hexo-note">`，无需任何客户端脚本。
{% endnote %}

{% note warning Nunjucks 预处理器冲突边界注意 %}
Hexo 会在 Markdown 渲染管线中执行 Nunjucks 标签求值。若要在正文段落中展示字面量 `{% raw %}{% note %}{% endraw %}` 或双花括号 `{% raw %}{{ variable }}{% endraw %}`，必须包裹在内置的 `{% raw %}{% raw %}...{% endraw %}{% endraw %}` 标签中（或在三反引号代码块中由内置 `backtick_code_block` 自动转义花括号），否则会触发 `Template render error`！
{% endnote %}

{% note danger 不可逆分支覆盖警告 %}
自动化流水线在向 `page` 分支推送构建产物时会启用 `force_orphan: true`，切勿在 `page` 分支直接手工修改代码！
{% endnote %}

## 3. 可折叠详情容器（`{% raw %}{% folding %}{% endraw %}` 标签插件与原生 `<details>`）

Hexo 生态主题广泛提供 `{% raw %}{% folding 标题 %}...{% endfolding %}{% endraw %}` 标签插件以规避手写 HTML 闭合标签，同时 `hexo-renderer-marked`（关闭 `dompurify` 时）亦完整兼容标准 CommonMark 原生 `<details>`：

{% folding 点击展开查看 Hexo 标签插件折叠容器示例 %}
通过 `hexo.extend.tag.register('folding', ..., { ends: true })` 注册的折叠插件，内部可直接混排列表与公式 $e^{i\pi} + 1 = 0$。
{% endfolding %}

<details>
<summary>点击展开查看母版原生 &lt;details&gt; 折叠容器源码结构</summary>

{% raw %}
```markdown
{% note tip 性能优化建议 %}
Hexo 标签插件与纯正 GFM 语法并存对比。
{% endnote %}
```
{% endraw %}

除了代码块，折叠容器内同样支持列表、表格与数学公式 $f(x) = x^2 + 1$。

</details>

## 4. GitHub 风格引用警报（GFM Alerts）跨框架直通测试

以下三段**保持母版原文一字不改**！值得注意的实测结论是：官方默认渲染器 `hexo-renderer-marked@7.0.1` **开箱并未内置 GFM Alert 解析器**（且社区 `marked-alert@2` 为纯 ESM 包，无法在 Hexo CJS `scripts/` 中直接 `require`）；本子站在 `scripts/markdown-enhancements.js` 中利用官方 `marked:renderer` 钩子扩展了 20 行 `blockquote` 规则，实现了全部 5 类警报零改造直通：

> [!NOTE]
> 这是一段标准的 GitHub Flavored Markdown `[!NOTE]` 警报文本，用于检验各生成器对母版语法的零改造直通能力。

> [!IMPORTANT]
> 跨平台迁移 Markdown 文档时，是否原生兼容 `> [!IMPORTANT]` 与 `> [!WARNING]` 直接决定了母版文档的派生改造成本。

> [!CAUTION]
> 若目标生成器未内置 GFM Alert 解析器（如 VuePress v1、Starlight 默认配置、Docsify v4 旧插件），上方标记会退化为普通引用块并原样露出 `[!CAUTION]` 字符串。
