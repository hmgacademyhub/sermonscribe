# Deployment Guide — HMG SermonScribe v2

> **Zero-cost deployment to modern static hosts.**  
> This guide covers every step for GitHub Pages, Cloudflare Pages, Vercel, Netlify, and traditional web hosting.

---

## ⚠️ Pre-Deployment Requirements

1. **HTTPS is mandatory.** The Web Speech API only works on `localhost` or `https://` origins. All platforms listed below provide HTTPS automatically.
2. **Microphone permission.** The first time a user opens the app, the browser will ask for microphone access. Churches should instruct members to tap **Allow**.
3. **Browser support.** Recommend **Chrome**, **Edge**, **Safari**, or **Samsung Internet** for the best speech recognition accuracy.

---

## 📂 Step 1: Prepare Your Files

Ensure your `sermon v2` folder contains exactly these items:

```
sermon v2/
├── index.html
├── live.html
├── analytics.html
├── about.html
├── features.html
├── deploy.html
├── manifest.json
├── sw.js
├── README.md
├── DEPLOYMENT.md
├── FEATURES.md
├── .github/
│   └── workflows/
│       └── deploy.yml
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── bible.js
│   │   ├── export.js
│   │   ├── storage.js
│   │   ├── utils.js
│   │   ├── broadcast.js
│   │   ├── outline-generator.js
│   │   ├── discussion-generator.js
│   │   ├── prayer-extractor.js
│   │   ├── filler-remover.js
│   │   ├── flashcards.js
│   │   ├── social-clip.js
│   │   ├── analytics.js
│   │   ├── church-branding.js
│   │   ├── audio-upload.js
│   │   ├── reading-plan.js
│   │   └── verse-autocomplete.js
│   └── images/
│       ├── icon-192.svg
│       └── icon-512.svg
```

If you deploy to a subfolder, update `manifest.json` `start_url` / `scope`, `sw.js` cache paths, and HTML canonical tags.

---

## 🚀 Platform 1: GitHub Pages (Recommended)

### 1.1 Create Repository
1. Go to [github.com/new](https://github.com/new).
2. Name it `hmg-sermonscribe-v2` (or any name). Choose **Public**.
3. Do NOT initialise with README if you already have files locally.

### 1.2 Push Your Code
Open your terminal in the folder that contains the `sermon v2` directory:

```bash
git init
git add "sermon v2/"
git commit -m "Initial commit: HMG SermonScribe v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hmg-sermonscribe-v2.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 1.3 Enable Pages
1. On your repo page, click **Settings → Pages**.
2. Under **Build and deployment**: Source: **Deploy from a branch** → Branch: `main` / `/(root)` → **Save**.
3. Wait 1–2 minutes. Your live URL: `https://yourusername.github.io/hmg-sermonscribe-v2/`

### 1.4 (Optional) GitHub Actions
The file `.github/workflows/deploy.yml` is included. In Pages settings, set **Source: GitHub Actions** for automatic redeploy on every push.

---

## 🌐 Platform 2: Cloudflare Pages (Best for Speed & Africa)

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Pages → Create a project** → Connect your GitHub repo.
3. Select branch `main`.
4. Build command: *(leave blank)*. Build output directory: `sermon v2` (if repo root is parent) or `/` (if repo root IS the app).
5. Click **Save and Deploy**.

---

## ▲ Platform 3: Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import `hmg-sermonscribe-v2` from GitHub.
3. Set **Root Directory** to `sermon v2` if applicable.
4. Click **Deploy**. Live in ~30 seconds.

---

## ◆ Platform 4: Netlify

1. Zip the `sermon v2` folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the ZIP onto the page. Netlify deploys instantly.

---

## 📁 Platform 5: cPanel / Shared Hosting

1. Log in to cPanel → **File Manager** → `public_html`.
2. Upload the **contents** of the `sermon v2` folder into the desired subfolder.
3. Add `.htaccess` to force HTTPS if your host does not:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🔄 Updating the App After Deployment

When you release a new version:

1. Increment the `CACHE_NAME` in `sw.js` (e.g., `hmg-sermonscribe-v2` → `hmg-sermonscribe-v3`).
2. Commit and push to GitHub. GitHub Pages / Cloudflare / Vercel / Netlify will rebuild automatically.
3. Tell users to **refresh the page twice** to force the Service Worker update.

---

## 🧪 Post-Deployment Testing Checklist

- [ ] Open live URL in Chrome/Edge on Android or desktop.
- [ ] Tap **Allow** for microphone permission.
- [ ] Tap **Start Recording** and speak. Text appears within 2 seconds.
- [ ] Tap **🔖 Add Bookmark** and confirm timestamp appears.
- [ ] Tap **Stop** and confirm text stays in the editor.
- [ ] Refresh the page and confirm sermon is still in sidebar (IndexedDB works).
- [ ] Click **Export → Print** and verify branded, clean preview.
- [ ] Click browser menu → **Add to Home Screen**. PWA installs with HMG S icon.
- [ ] Turn off Wi-Fi / mobile data and reload. App interface should still appear.
- [ ] Visit **live.html** and confirm black screen for projector captions.
- [ ] Visit **analytics.html** and confirm dashboard loads.
- [ ] Test **Find & Replace** modal and **Filler Removal** button.

---

*Built with zero server cost for the Nigerian church and beyond.*
