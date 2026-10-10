# ZJY-HSBL Portfolio

Research & Engineering Portfolio for **ZJY-HSBL / 海生不浪**.

> Software Engineering × Visual Intelligence × Intelligent Systems  
> 软件工程 × 视觉智能 × 智能系统

Live site: https://zjy-hsbl.github.io/

## Overview / 项目简介

This repository contains a dependency-free personal technical portfolio built with plain HTML, CSS and JavaScript. It presents research directions, selected projects, publications, awards, a research timeline and project case studies.

本仓库是海生不浪的个人技术主页，使用原生 HTML、CSS 与 JavaScript 构建，不依赖前端框架或构建工具。网站集中展示研究方向、代表性项目、学术成果、竞赛经历、研究时间线以及旗舰项目 Case Study。

## Site Structure / 网站结构

```text
/
├── index.html                  # Main portfolio / 主页
├── research/                   # Research graph / 研究图谱
├── publications/               # Publication archive / 学术成果
├── projects/
│   ├── scoliovision/
│   ├── nexatrack/
│   ├── sage-seg/
│   └── dynaflux/               # Flagship case studies / 旗舰项目
├── app.js                      # Homepage behavior
├── navigation.js               # Global command palette
├── projects.js                 # Project catalog
├── styles.css                  # Global styles
├── archive.css                 # Research/publication styles
├── projects/project.css        # Case-study styles
├── scripts/validate-site.mjs   # Zero-dependency static validation
├── sitemap.xml
├── robots.txt
└── site.webmanifest
```

## Features / 主要特性

- Research Graph connecting software engineering, visual intelligence, medical intelligence, spatiotemporal learning and intelligent systems.
- Dynamic GitHub project metadata with a 30-minute local cache and static fallback.
- Dedicated case-study pages for ScolioVision, NexaTrack, SAGE-Seg and DynaFlux.
- Command Palette via `Ctrl/⌘ + K` or `/`.
- Dark/light theme support.
- Reduced-motion, keyboard navigation, skip navigation and high-contrast support.
- SEO metadata, JSON-LD, sitemap, robots.txt and web manifest.
- Zero-dependency CI validation for JavaScript syntax, local references, anchors, duplicate IDs and core metadata.

## Local Preview / 本地预览

No build step is required.

无需安装依赖或执行构建，直接启动一个本地静态服务器即可：

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Validation / 静态检查

Node.js 22+:

```bash
node scripts/validate-site.mjs
```

The same validation runs automatically through GitHub Actions on pushes and pull requests.

## Design Principle / 设计原则

The site intentionally stays framework-free. For a static portfolio, plain HTML/CSS/JavaScript keeps the runtime small, the architecture explicit and maintenance straightforward.

本项目刻意保持原生静态架构。对于个人作品集网站而言，这种方式能够减少依赖、降低运行复杂度，并保持结构清晰、部署稳定和长期可维护性。

## Portfolio updates / 内容维护

The curated project catalog now includes Iterduca, FolderBox, Vitrunda, BoundEvo, AMFTrack and BoneAgeVision alongside the four original research case studies. Each repository card uses live GitHub metadata when the API is available and a static description otherwise. The research graph, publication archive and home timeline are updated to reflect these projects.

代表项目列表现已补充 Iterduca、FolderBox、Vitrunda、BoundEvo、AMFTrack 与 BoneAgeVision，并保留原有四个研究案例页。GitHub API 可用时读取动态项目资料，否则使用本地简介；研究图谱、论文归档和时间线同步更新。

**Visual and interaction policy / 视觉与交互约定：** preserve the animated sea background, reveal transitions, theme switching, live repository sync, filters and command palette during future content updates. / 后续更新内容时保留海浪动态背景、滚动过渡、主题切换、仓库动态同步、项目筛选及快捷搜索功能。
