# typeshit

> 轻量化的 txt / markdown 文本编辑器

简洁、美观、好用。专注于纯文本和 Markdown，不做更多。

## 特性

- 支持 `.txt` `.md` `.markdown`
- 实时 Markdown 预览（编辑 / 预览 / 分屏三种模式）
- 代码块语法高亮（JavaScript、TypeScript、Python、Rust、Bash、JSON、HTML、CSS、Go、Java、SQL、YAML 等）
- 浅色 / 深色主题，自动记忆上次选择
- 多标签页（脏标记 · 中键关闭）
- 编辑器 ↔ 预览滚动同步
- 自定义无边框窗口
- 单实例运行：再次「打开方式 → typeshit」会作为新标签加入已有窗口
- 关闭脏文件时弹应用内确认对话框，支持「全部保存 / 都不保存 / 取消」
- 字数 / 字符数 / 行数 / 光标位置 / 编码实时统计
- 体积小、启动快（可执行文件约 12 MB，运行时内存约 50 MB）

## 快捷键

| 快捷键                | 功能                   |
| ------------------ | -------------------- |
| `Ctrl + N`         | 新建标签                 |
| `Ctrl + O`         | 打开文件                 |
| `Ctrl + S`         | 保存                   |
| `Ctrl + Shift + S` | 另存为                  |
| `Ctrl + W`         | 关闭当前标签               |
| `Ctrl + Tab`       | 切换到下一个标签             |
| `Ctrl + /`         | 切换视图模式（编辑 / 分屏 / 预览） |
| `Ctrl + T`         | 切换浅色 / 深色主题          |
| `Ctrl + F`         | 在当前文件中查找             |

## 使用

- **直接打开**：双击 `typeshit.exe`，用快捷键或菜单打开文件
- **文件关联 / 「打开方式」**：右键 `.md` / `.txt` → 「打开方式」选 typeshit，文件会自动加载
- **命令行**：`typeshit path/to/file.md` 启动并打开指定文件

## 安装

到 [Releases](../../releases) 页面下载对应平台的安装包：

- **Windows**：`.exe`（NSIS 安装程序）
- **macOS**：`.dmg`
- **Linux**：`.AppImage` 或 `.deb`

也可以下载 portable 版直接运行 `typeshit.exe`，无需安装。

## 从源码构建

需要：

- [Node.js](https://nodejs.org/) ≥ 20
- [Rust](https://www.rust-lang.org/tools/install) ≥ 1.77
- 平台依赖：参见 [Tauri 先决条件](https://tauri.app/start/prerequisites/)

```bash
git clone https://github.com/lightcatch/typeshit.git
cd typeshit
npm install
npm run tauri dev                    # 开发模式
npm run tauri build                  # 打包安装程序
npm run tauri build -- --no-bundle   # 仅产出 exe，跳过安装包打包阶段
```

> 打包安装程序时，Tauri 会从 GitHub 下载 NSIS / WiX 工具集。中国大陆开发机首次构建可能超时，建议本地先用 `--no-bundle` 验证可执行文件，正式发布走 GitHub Actions。

## 技术栈

- [Tauri 2](https://tauri.app/) — 桌面壳
- [Svelte 5](https://svelte.dev/) — 前端框架（runes 模式）
- [CodeMirror 6](https://codemirror.net/) — 编辑器内核
- [markdown-it](https://github.com/markdown-it/markdown-it) — Markdown 渲染
- [highlight.js](https://highlightjs.org/) — 代码块高亮

## 项目结构

```
typeshit/
├── src/                    # 前端 (Svelte 5)
│   ├── lib/
│   │   ├── components/     # UI 组件 (TitleBar/TabBar/Editor/Preview/StatusBar/Dialog)
│   │   ├── state/          # 状态管理 (tabs / prefs / dialog / scroll)
│   │   ├── editor/         # CodeMirror 6 装配
│   │   ├── markdown/       # markdown-it 渲染器
│   │   └── fs/             # 文件 IO
│   ├── styles/             # CSS 主题与排版
│   ├── App.svelte
│   └── main.ts
└── src-tauri/              # 后端 (Rust)
    ├── src/                # 入口、initial-file 命令
    ├── capabilities/       # 权限白名单
    └── tauri.conf.json
```

## 发布流程

打 git tag 触发 GitHub Actions 自动构建多平台安装包并创建 Release：

```bash
git tag v0.1.0
git push origin v0.1.0
```

工作流定义见 [`.github/workflows/release.yml`](./.github/workflows/release.yml)。

## 贡献

欢迎 issue 和 pull request。在提交大改动前，建议先开 issue 讨论。

## 协议

[MIT](./LICENSE)
