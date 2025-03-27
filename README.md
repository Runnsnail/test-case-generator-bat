# AI 测试用例生成器

<p align="center">
  <img src="public/logo.png" alt="AI 测试用例生成器" width="200" />
</p>

<p align="center">
  <b>利用人工智能自动分析需求文档，生成测试分析、思维导图和测试用例</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/版本-1.0.0-blue" alt="版本" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="许可证" />
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
</p>

## 📑 目录

- [项目介绍](#项目介绍)
- [功能特点](#功能特点)
- [技术栈](#技术栈)
- [安装与运行](#安装与运行)
- [使用指南](#使用指南)
- [项目结构](#项目结构)
- [API 文档](#api-文档)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 🚀 项目介绍

AI 测试用例生成器是一款基于人工智能的工具，旨在帮助测试工程师和开发人员自动化测试用例生成过程。通过分析需求文档，系统能够自动生成测试分析报告、测试策略思维导图和详细的测试用例，大幅提高测试效率和质量。
![微信图片_20250327130537](https://github.com/user-attachments/assets/49450f6d-9915-4a15-b1e1-54c05abc73ee)



## ✨ 功能特点

- **多种输入方式**：支持上传文档、提供URL或直接粘贴文本内容
- **AI 驱动分析**：利用先进的AI模型深入分析需求文档
- **测试分析报告**：自动生成全面的测试分析文档
- **思维导图可视化**：以思维导图形式展示测试策略和测试点
- **测试用例生成**：自动生成结构化的测试用例
- **多种导出格式**：支持PDF、Excel等多种格式导出
- **实时编辑**：支持在线编辑测试分析和思维导图
- **现代化界面**：采用科技感十足的用户界面设计

## 💻 技术栈

- **前端框架**：Next.js 14
- **UI 组件**：Shadcn UI
- **样式方案**：Tailwind CSS
- **动画效果**：Framer Motion
- **图表可视化**：React Flow
- **PDF 处理**：jsPDF
- **Excel 处理**：ExcelJS
- **AI 模型集成**：OpenAI API

## 📦 安装与运行

### 前提条件

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/test-case-generator-bat.git
cd test-case-generator-bat

# AI 测试用例生成器

<p align="center">
  <img src="public/logo.png" alt="AI 测试用例生成器" width="200" />
</p>

<p align="center">
  <b>利用人工智能自动分析需求文档，生成测试分析、思维导图和测试用例</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/版本-1.0.0-blue" alt="版本" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="许可证" />
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
</p>



### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/test-case-generator-bat.git
cd test-case-generator-bat
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置环境变量

创建 `.env.local` 文件并添加以下内容：

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
OPENAI_API_KEY=your_openai_api_key
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

5. 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

## 📝 使用指南

### 上传需求文档

1. 在首页选择"上传需求"选项卡
2. 通过拖放或点击上传按钮上传文档文件
3. 或者提供文档URL
4. 或者直接粘贴需求文本内容
5. 点击"分析需求文档"按钮开始分析

### 查看测试分析

1. 分析完成后，系统会自动切换到"测试分析"选项卡
2. 查看生成的测试分析报告
3. 可以编辑分析内容或下载为PDF文档

### 使用思维导图

1. 切换到"思维导图"选项卡
2. 查看自动生成的测试策略思维导图
3. 可以通过双击节点编辑内容
4. 可以下载思维导图为PNG图片

### 管理测试用例

1. 切换到"测试用例"选项卡
2. 查看生成的测试用例列表
3. 可以编辑、筛选和排序测试用例
4. 可以导出测试用例为Excel文件

## 📂 项目结构

```
test-case-generator-bat/
├── app/                  # Next.js 应用目录
│   ├── page.tsx          # 主页面组件
│   ├── layout.tsx        # 应用布局
│   └── globals.css       # 全局样式
├── components/           # 可复用组件
│   ├── document-uploader.tsx    # 文档上传组件
│   ├── mind-map-viewer.tsx      # 思维导图查看器
│   └── test-case-table.tsx      # 测试用例表格
├── hooks/                # 自定义钩子
├── services/             # API 服务
│   └── analysis-service.ts      # 文档分析服务
├── styles/               # 样式文件
├── public/               # 静态资源
└── docs/                 # 文档
    └── api-documentation.md     # API 文档
```

## 📚 API 文档

详细的 API 文档请参阅 [API 文档](docs/api-documentation.md)。

## 🤝 贡献指南

我们欢迎所有形式的贡献，无论是新功能、bug 修复还是文档改进。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

---

<p align="center">
  由 ❤️ 和 ☕ 驱动开发
</p>
```

这个 README 文件包含了项目的完整介绍、功能特点、安装说明和使用方法等内容，采用了现代化的 Markdown 格式，并添加了徽章和表情符号使其更加生动。您可以根据实际情况调整其中的内容，例如 GitHub 仓库地址、许可证类型等。
