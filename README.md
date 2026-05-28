# typeshit

> 轻量化的 txt / markdown 文本编辑器

简洁、美观、好用。专注于纯文本和 Markdown，不做更多。

## 特性

- 支持 `.txt` `.md`，实时 Markdown 预览（编辑 / 预览 / 分屏）
- 代码块语法高亮（JS/TS/Python/Rust/Bash 等 14 种）
- 浅色 / 深色主题
- 多标签 + 滚动同步
- 单实例 + 文件关联（再次「打开方式」会作为新标签加入已有窗口）
- 体积小，约 12 MB

## 快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl + N` / `O` / `S` / `Shift + S` | 新建 / 打开 / 保存 / 另存为 |
| `Ctrl + W` / `Ctrl + Tab` | 关闭 / 切换标签 |
| `Ctrl + /` / `Ctrl + T` / `Ctrl + F` | 切换视图 / 主题 / 查找 |

## 安装

到 [Releases](../../releases) 下载对应平台的安装包。

## 从源码构建

需要 [Node.js](https://nodejs.org/) ≥ 20、[Rust](https://www.rust-lang.org/tools/install) ≥ 1.77，以及 [Tauri 平台依赖](https://tauri.app/start/prerequisites/)。

```bash
git clone https://github.com/lightcatch/typeshit.git
cd typeshit
npm install
npm run tauri dev      # 开发
npm run tauri build    # 打包
```

## 技术栈

[Tauri 2](https://tauri.app/) · [Svelte 5](https://svelte.dev/) · [CodeMirror 6](https://codemirror.net/) · [markdown-it](https://github.com/markdown-it/markdown-it) · [highlight.js](https://highlightjs.org/)

## 协议

[MIT](./LICENSE)
