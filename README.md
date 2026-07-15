# Revo — AI店长 · 二手3C经营助手

AI发现每件资产的新价值。

## 目录结构

```
Revo-App
├── src/        # 代码工程（纯静态：HTML + 原生 JS + CSS，无构建步骤）
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── components/   # 页面组件（HomePage / InventoryPage / HubPage 等）
│   └── data/         # Mock 数据（未来替换为真实 API）
├── docs/       # 产品资料（理念 / 商业模式 / AI决策模型 / 数据结构 / 规划）
├── assets/     # UI 设计资源（架构图 / 视觉海报 / Logo）
└── package.json
```

## 本地运行

```bash
npm start
# 打开 http://127.0.0.1:8080
```

## 部署

纯静态站点：Vercel 等平台以 `src/` 作为输出目录直接部署，无需构建。
