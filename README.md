# GUAN Yuehan · 个人主页

一个纯原生 HTML / CSS / JavaScript 实现的响应式个人主页，**不依赖任何第三方框架或构建工具**，
克隆下来用浏览器直接打开 `index.html` 即可运行。

## 目录结构

```
portfolio/
├── index.html        # 页面结构（语义化标签）
├── css/style.css     # 样式（CSS 变量 + 响应式 + 明暗主题）
├── js/main.js        # 交互逻辑（无依赖的原生 JS）
└── README.md
```

## 功能特性

| 功能 | 实现方式 |
| --- | --- |
| 首屏 Canvas 粒子背景 | 原生 Canvas 2D，点数按屏幕面积自适应，页面隐藏时暂停动画 |
| 打字机效果 | `setTimeout` 递归 + 状态机（打字 / 停留 / 删除） |
| 滚动进入动画 | `IntersectionObserver` 观察元素，避免 Scroll 事件中做布局计算 |
| 数字滚动 | `requestAnimationFrame` + easeOutCubic 缓动 |
| 明暗主题 | CSS 变量 + `data-theme` 属性，选择写入 `localStorage` |
| 移动端抽屉导航 | CSS `transform` 过渡 + 汉堡按钮状态切换 |
| 导航高亮 / 吸顶 | `IntersectionObserver` 计算当前区块 + `scroll` 监听切换类名 |
| 复制邮箱 | `navigator.clipboard` API，降级到 `execCommand` |
| 无障碍 / 降级 | 尊重 `prefers-reduced-motion`，`@media print` 打印样式 |

## 本地预览

```bash
# 方式一：直接双击 index.html
# 方式二（推荐）：起一个本地静态服务器
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 部署

静态站点，任意静态托管平台都可直接部署：

- **GitHub Pages**：仓库 Settings → Pages → 选择 `main` 分支根目录
- **Vercel / Netlify**：导入仓库，构建命令留空，输出目录填 `.`

## 待完善

- [ ] 替换占位的邮箱与 GitHub 链接（`index.html` 中搜索 `your-mail@example.com`）
- [ ] 添加项目截图或演示动图
