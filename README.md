# AI塔羅牌占卜系統

一個基於 AI 的線上塔羅牌占卜系統，提供多種占卜服務。

## 功能特色

- 🤖 **AI塔羅占卜**: 使用先進的 AI 技術進行塔羅牌解讀
- ❓ **是否塔羅占卜**: 針對是/否問題的快速占卜
- 📅 **每日塔羅運勢**: 每日運勢指引
- 🎨 **美觀界面**: 現代化的響應式設計
- 📱 **移動端支援**: 完美適配手機和平板

## 技術架構

- **前端**: HTML5, CSS3, JavaScript, Bootstrap 5
- **後端**: Node.js, Express.js (本地開發)
- **部署**: Vercel Serverless Functions
- **AI**: OpenAI API (NVIDIA Nemotron 模型)

## 本地開發

### 安裝依賴

```bash
npm install
```

### 設置環境變數

創建 `.env` 文件並添加以下配置：

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://integrate.api.nvidia.com/v1
```

### 啟動開發服務器

```bash
npm run dev
```

訪問 http://localhost:3000

## Vercel 部署

### 1. 安裝 Vercel CLI

```bash
npm i -g vercel
```

### 2. 登入 Vercel

```bash
vercel login
```

### 3. 部署到 Vercel

```bash
vercel
```

### 4. 設置環境變數

在 Vercel 控制台中設置以下環境變數：

- `OPENAI_API_KEY`: 您的 OpenAI API 金鑰
- `OPENAI_BASE_URL`: OpenAI API 基礎 URL

### 5. 生產環境部署

```bash
vercel --prod
```

## API 端點

### AI塔羅占卜
- **POST** `/api/tarot-reading.js`
- 參數: `question`, `cardCount`, `readingType`

### 是否塔羅占卜
- **POST** `/api/yes-no-reading.js`
- 參數: `question`

### 每日塔羅運勢
- **GET** `/api/daily-reading.js`

### 獲取所有塔羅牌
- **GET** `/api/cards.js`

### 隨機抽取塔羅牌
- **POST** `/api/draw-cards.js`
- 參數: `count`

## 專案結構

```
AI-/
├── api/                    # Vercel Serverless Functions
│   ├── utils.js           # 共享工具函數
│   ├── tarot-reading.js   # AI塔羅占卜 API
│   ├── yes-no-reading.js  # 是否塔羅占卜 API
│   ├── daily-reading.js   # 每日塔羅運勢 API
│   ├── cards.js           # 獲取所有塔羅牌 API
│   └── draw-cards.js      # 隨機抽取塔羅牌 API
├── public/                 # 靜態文件
│   ├── index.html         # 主頁面
│   └── script.js          # 前端 JavaScript
├── server.js              # 本地開發服務器
├── package.json           # 專案配置
├── vercel.json           # Vercel 配置
└── README.md             # 專案說明
```

## 環境要求

- Node.js 18+
- npm 或 yarn
- Vercel 帳戶 (用於部署)

## 授權

MIT License

## 支援

如有問題，請提交 Issue 或聯繫開發者。 