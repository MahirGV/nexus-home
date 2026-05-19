# Nebula Homepage - Offline Edition

This application is a refined, customizable browser dashboard designed for speed, beauty, and utility. It has been configured to build as a **single, self-contained HTML file** that works perfectly offline without any external dependencies or servers.

## 🚀 How to use as your Browser Homepage

To get your own offline copy for your browser:

### 1. Export from AI Studio
- Open the **Settings** menu in the top right of AI Studio.
- Click **Export to ZIP** or **Export to GitHub**.

### 2. Build the Single File
Once you have the code on your computer:
1. Open your terminal/command prompt in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the offline file:
   ```bash
   npm run build
   ```
4. Find your file at **`dist/index.html`**.

### 3. Set as Homepage
#### **Firefox**
1. Copy the full path to your `index.html` file (e.g., `file:///C:/Users/You/Documents/nebula/dist/index.html`).
2. Go to **Settings > Home**.
3. Under **Homepage and new windows**, choose **Custom URLs...**.
4. Paste the `file://` path.

#### **Chrome / Edge**
1. Copy the `file://` path to your `index.html`.
2. Go to **Settings > Appearance**.
3. Enable **Show home button** and paste the path.
4. (Optional) Install an extension like "Custom New Tab" to use it for every new tab.

## ✨ Features
- **Central Search**: Quick access to Google, DuckDuckGo, or Bing.
- **Animated Dock**: Beautiful, physics-based application dock.
- **Smart Folders**: Group your bookmarks into folders with automatically generated mini-previews.
- **Personalized**: Change backgrounds, colors, and dock sizes.
- **Full Offline**: Once built, no internet connection is required to load the UI.
- **Local Storage**: All your settings and bookmarks are saved directly in your browser's memory.

## 🛠 Tech Stack
- React + Vite
- Tailwind CSS
- Lucide React (Icons)
- Framer Motion (Animations)
- Vite Plugin SingleFile (Offline bundling)
