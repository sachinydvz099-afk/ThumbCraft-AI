# ThumbCraft AI 🎨

> **“Turn YouTube Links into Thumbnails. Create Better Ones with AI.”**

ThumbCraft AI is a modern, responsive, production-quality mini SaaS web application for content creators, designers, and marketers. It lets users instantly extract and download YouTube thumbnails across 5 verified resolution tiers, generate custom alternative thumbnails with AI using an interchangeable provider architecture, and polish compositions directly in the browser with a lightweight HTML5 Canvas studio.

Designed to be hosted with **100% static hosting on GitHub Pages** without requiring a dedicated backend server or exposing secret API keys.

---

## 🌟 Key Features

### 1. YouTube Thumbnail Downloader
- **Universal URL Support**: Handles standard `watch?v=...`, `youtu.be/...`, `shorts/...`, `embed/...`, `live/...`, and timestamps.
- **5 Resolution Tiers**:
  - `MaxRes HD` (1280 × 720 px, 1080p/720p)
  - `Standard SD` (640 × 480 px)
  - `High Quality HQ` (480 × 360 px)
  - `Medium Quality MQ` (320 × 180 px)
  - `Default` (120 × 90 px)
- **Smart Fallback Detection**: Automatically checks YouTube's CDN. If YouTube returns a 120×90 dummy placeholder instead of a real MaxRes image, ThumbCraft AI detects it and cleanly falls back to the highest available resolution without promising unavailable files.
- **CORS-Resilient Downloader**: Attempts client-side Blob downloads, offscreen canvas rendering, and graceful fallback to opening the original CDN file in a new tab with meaningful filenames like `youtube-thumbnail-VIDEO_ID-maxres.jpg`.
- **Copy Video ID & Links**: 1-click clipboard actions with toast notifications.

### 2. AI Thumbnail Generator
- **Pluggable Adapter Architecture**:
  - **Free Public AI Engine (Default)**: Powered by Pollinations Flux with zero API keys required—ideal for static GitHub Pages!
  - **Custom Serverless Proxy**: Route generation through your external Cloudflare Worker, AWS Lambda, or Vercel function without exposing secrets.
  - **OpenAI Compatible (BYOK)**: Store your private API key strictly in browser `localStorage`.
  - **Honest Unconfigured Mode**: Accurately indicates when no provider is active instead of showing stock photos.
- **Preset Styles**: Gaming, Technology, Education, Finance, Vlogging, Travel, Fitness, News, Entertainment, and Custom.
- **Aspect Ratios**: 16:9 Standard (1280×720), 1:1 Square (1080×1080), 9:16 Vertical (720×1280).
- **Prompt Inspiration**: One-click prompt starters for high-converting YouTube thumbnails.

### 3. Thumbnail Enhancement Studio
- **100% In-Browser HTML5 Canvas**: Zero backend required.
- **Typography & Headlines**: Custom font families (Impact, Outfit, Inter, Montserrat), size sliders, text stroke/outlines, and drop shadows.
- **Sticker Badges**: Customizable pills (`MUST WATCH`, `NEW`, `4K HD`, `TUTORIAL`, `VIRAL`).
- **Overlays & Adjustments**: Bottom dark gradient for text legibility, top gradient, vignette edge darkening, brightness and contrast filters.
- **Instant Export**: Export in crisp PNG or JPEG format.

---

## 📸 Screenshots

| Feature | Preview |
|---|---|
| **Thumbnail Downloader** | ![Downloader Interface](https://via.placeholder.com/800x450/111827/818cf8?text=ThumbCraft+AI+-+Downloader) |
| **AI Thumbnail Generator** | ![AI Generator](https://via.placeholder.com/800x450/111827/ec4899?text=ThumbCraft+AI+-+AI+Generator) |
| **Studio Enhancement Editor** | ![Studio Editor](https://via.placeholder.com/800x450/111827/10b981?text=ThumbCraft+AI+-+Studio+Editor) |

---

## 🛠️ Technology Stack

- **Core Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with custom dark palette, glassmorphism, and glow utilities
- **Icons**: Lucide React
- **Graphics Engine**: HTML5 2D Canvas API
- **Testing**: Vitest unit test suite (19 tests covering URL extraction, CDN validation, and AI prompt building)
- **Deployment**: GitHub Pages via GitHub Actions

---

## 💻 Local Installation & Development

### Prerequisites
- Node.js (v18.0.0 or v20.x recommended)
- npm (v9.x or v10.x)
- Git

### Windows PowerShell Setup

1. **Clone the repository**:
   ```powershell
   git clone https://github.com/YOUR_USERNAME/thumbcraft-ai.git
   cd thumbcraft-ai
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Start the development server**:
   ```powershell
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Run unit tests**:
   ```powershell
   npm test
   ```

5. **Build for production**:
   ```powershell
   npm run build
   ```

6. **Preview production build locally**:
   ```powershell
   npm run preview
   ```

---

## 🚀 GitHub Pages Deployment Guide

ThumbCraft AI is designed for seamless deployment to GitHub Pages using the included automated workflow (`.github/workflows/deploy.yml`).

### Step 1: Initialize Git and Push to GitHub

In PowerShell:
```powershell
# 1. Initialize git repository if not already done
git init

# 2. Stage and commit all files
git add .
git commit -m "feat: initial release of ThumbCraft AI"

# 3. Rename branch to main
git branch -M main

# 4. Link your remote GitHub repository
# Replace YOUR_USERNAME and REPO_NAME with your GitHub details
git remote add origin https://github.com/YOUR_USERNAME/thumbcraft-ai.git

# 5. Push code to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings

1. Go to your repository on **GitHub.com**.
2. Click on **Settings** > **Pages** (under "Code and automation" in the left sidebar).
3. Under **Build and deployment** > **Source**, select:
   👉 **GitHub Actions**
4. Trigger the workflow by pushing to `main` or going to the **Actions** tab and selecting **Deploy ThumbCraft AI to GitHub Pages** > **Run workflow**.
5. Once complete, your site will be live at:
   `https://YOUR_USERNAME.github.io/thumbcraft-ai/`

---

## 🔒 Security & AI Integration Architecture

### Static Hosting Guarantees
- **No Hardcoded Keys**: The public codebase and built assets contain **zero secret API keys**.
- **No Server Leakage**: Static hosting on GitHub Pages prevents private token exposure.
- **Client-Side Storage**: When users bring their own API keys, they are stored exclusively in their personal browser's `localStorage` and never transmitted to our repository.

### Connecting an Optional Serverless Proxy
To use commercial AI models (e.g. OpenAI DALL-E, Stability AI, Midjourney) in production without exposing private keys, configure a serverless proxy:

```
[User Browser (ThumbCraft AI)]
        ↓  (HTTPS POST prompt)
[Your Cloudflare Worker / AWS Lambda / Vercel Function]
        ↓  (Stores private API key securely as environment secret)
[Image Generation API (e.g. OpenAI / Replicate)]
```

Set the resulting proxy URL inside the **AI Provider Configuration** modal on the website.

---

## ⚖️ Legal & Thumbnail Reuse Notice

- **Intellectual Property**: Thumbnails downloaded using ThumbCraft AI remain the intellectual property and copyright of their respective video creators and YouTube copyright holders.
- **Fair Use**: Downloading public thumbnails is intended for archival, commentary, reference, educational review, and fair use under applicable copyright laws.
- **Commercial Notice**: Creators should seek proper authorization from thumbnail copyright owners before republishing or monetizing original artwork.
- **Disclaimer**: ThumbCraft AI is an independent open-source tool and is not affiliated, endorsed, or sponsored by YouTube, Google LLC, or Alphabet Inc.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!
Licensed under the [MIT License](LICENSE).
