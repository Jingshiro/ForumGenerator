# 论坛体生成器 (Forum Generator)

## 📖 项目简介 (Introduction)

**论坛体生成器** 是一个用于创作和导出“论坛体”小说/故事的专业工具。它允许用户以所见即所得的方式编写带有论坛特质（如楼主、楼层、头像、引用回复等）的故事，并能将其导出为美观、独立的 HTML 文件，方便在手机或电脑上沉浸式阅读。

主要特点：

- **所见即所得编辑器**：实时预览论坛排版效果。
- **多主题支持**：内置现代、古风、幻想、校园等多种风格主题。
- **Markdown 支持**：支持加粗、斜体、引用、链接等 Markdown 语法。
- **客户端小尾巴**：支持随机或顺序显示不同的设备/客户端标识（如 "iPhone 16 Pro Max" 等）。
- **智能时间管理**：支持“隐藏”、“随机生成”（严格递增）以及“手动指定”时间戳，满足不同创作需求。
- **持久化配置**：自定义 CSS、时间设置等偏好配置会自动保存，刷新页面不丢失。
- **专业导出**：生成的 HTML 文件包含完整的样式和交互（如侧边栏导航、锚点跳转），且完全静态化，无需依赖外部服务器。

---

## 🚀 开始使用 (Quick Start)

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

---

### [在线使用](https://myst423.shop/forumgenerator/)

## 🛠️ 技术实现 (Technical Details)

### 1. 技术栈 (Tech Stack)

- **核心框架**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/) (实用类原子化 CSS) + 原生 CSS (用于主题定制)
- **Markdown 渲染**: [react-markdown](https://github.com/remarkjs/react-markdown) (编辑器预览) / [Marked](https://github.com/markedjs/marked) (导出渲染)
- **图标库**: [Lucide React](https://lucide.dev/)
- **本地存储**: LocalStorage (用于保存偏好设置和自定义 CSS)

### 2. 项目结构 (Directory Structure)

```
src/
├── components/      # UI 组件 (Header, PostItem, Sidebar, Modals...)
├── theme/           # 主题系统
│   ├── base.css     # 基础重置样式
│   └── fonts.ts     # 字体加载逻辑
├── utils/           # 工具函数
│   ├── exporter.ts  # 核心导出逻辑 (Server-Side Rendering in Browser)
│   ├── parser.ts    # 文本/Markdown 解析器
│   └── timeUtils.ts # 时间生成与计算逻辑
├── hacks/           # 自定义钩子 (Hooks)
│   ├── usePreferences.ts # 全局配置管理
│   └── useClientTails.ts # 小尾巴管理
├── types.ts         # TypeScript 类型定义
└── App.tsx          # 主入口与路由逻辑
```

### 3. 核心运行逻辑 (Core Logic)

#### 数据流

- 应用状态由 `threads` (帖子列表) 和 `activeThead` 对象管理。
- 用户输入不仅包含文本，还携带元数据（是否楼主、时间戳、马甲等）。
- 时间管理模块 (`timeUtils`) 负责根据配置（随机/隐藏/手动）计算每一帖的最终显示时间。

#### 导出机制 (The "Exporter")

这是本项目的技术难点与核心。为了保证导出的 HTML 既美观又健壮，我们经历了从“客户端动态渲染”到“静态 HTML 生成”的重构：

1.  **静态生成 (SSR-like)**: 在点击导出的瞬间，利用 `marked` 库在内存中将所有 Markdown 内容转换为静态 HTML 字符串。
2.  **样式注入**: 将当前选中的主题 CSS、Tailwind 基础样式、以及用户的**自定义 CSS** 内联注入到 HTML `<style>` 标签中，确保单文件独立运行。
3.  **交互脚本**: 注入增强版的原生 JavaScript，负责处理“侧边栏切换”、“锚点跳转”以及跨楼层引用，确保导出文件的交互体验与编辑器内完全一致。

---

## 🚀 优化方向 (Future Optimizations)

1.  **主题与可视化编辑器**
    - 增加更多预设主题。
    - 开发全可视化主题编辑器 (Theme GUI)，允许用户通拖拽、取色器实时定制皮肤，无需编写 CSS 代码。

2.  **优化随机时间功能**
    - 增加更多细粒度控制，如“发帖高峰时段”、“夜间模式”等时间分布逻辑，使生成的时间流更符合人类行为学。

3.  **PDF 导出**
    - 支持直接导出为排版精美的 PDF 文档，方便分享。

4.  **头像设置**
    - 支持自定义头像，方便个性化设置。
