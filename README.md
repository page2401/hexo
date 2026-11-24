# page2401/hexo

独立静态站点对比子模块 —— **Hexo (`hexo@8.1.2` Classic Node.js SSG)**。

- **线上预览地址**：`https://page.2401.xyz/hexo/`
- **对比总站地址**：`https://page.2401.xyz/`
- **精确锁定版本**：`hexo@8.1.2` · `hexo-renderer-ejs@2.0.0` · `hexo-renderer-marked@7.0.1` · `katex@0.19.1` · `mermaid@12.3.0`
- **四维本地扩展与零外部 CDN**：完整覆盖 Hexo 经典 `Tag`（`{% note %}` / `{% folding %}` 标签插件）、`Filter`（构建期 `marked:extensions` 服务端 KaTeX + `marked:renderer` GFM 警报 + 优先级 `5` Mermaid 围栏保护 + `.md` 相对链接重写）、`Helper`（`Warehouse` `site.pages` 动态多级侧栏与目录提取）与 `Generator`（本地静态输出 KaTeX 字体与 Mermaid 脚本至 `/hexo/vendor/`），非图表页面输出 `0` 个 `<script>` 标签，全站零外部 CDN 请求。
