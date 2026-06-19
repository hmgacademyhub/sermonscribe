# HMG SermonScribe v3 — Deployment Guide

Deploy HMG SermonScribe v3 to any static hosting platform. No server, no database, no API keys required.

---

## 1. GitHub Pages (Recommended)

1. Fork or upload the `sermonscribe` folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` or `master` branch and `/ (root)` folder.
5. Click **Save**. Your site will be live at `https://yourusername.github.io/sermonscribe/`.
6. **Important:** If your repo is named `sermonscribe`, the site will be served from `/sermonscribe/`. All internal links in v3 use relative paths (`./`) so this works automatically.
7. For a custom domain, add a `CNAME` file in the root with your domain name (e.g., `sermon.yourchurch.com`).
8. Ensure **Enforce HTTPS** is checked in the Pages settings.

---

## 2. Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Pages → Create a project**.
3. Connect your GitHub repository containing the `sermonscribe` folder.
4. Set **Build command** to `exit 0` (static site, no build needed).
5. Set **Build output directory** to `sermonscribe` (if the folder is inside a repo) or `.` (if repo root is the app).
6. Deploy. Cloudflare will provide a `*.pages.dev` URL.
7. Enable **Always Use HTTPS** and set custom headers if desired.
8. Add a custom domain in **Custom domains** tab.

---

## 3. Vercel

1. Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. During import, set **Root Directory** to `sermonscribe` if the app is in a subfolder.
3. Set **Framework Preset** to `Other` (static site).
4. Deploy. Vercel provides a `*.vercel.app` URL.
5. Add a custom domain in **Project Settings → Domains**.
6. Ensure **HTTPS** is enforced by default.

---

## 4. Netlify

1. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**.
2. Select your repository. Set **Base directory** to `sermonscribe` if needed.
3. Leave build command blank and set **Publish directory** to `.` or `sermonscribe`.
4. Deploy. Netlify provides a `*.netlify.app` URL.
5. Enable **Asset optimization** and **HTTPS** by default.
6. Add a custom domain in **Domain settings**.

---

## 5. cPanel / Shared Hosting

1. Zip the `sermonscribe` folder locally.
2. Log in to your cPanel → **File Manager** → `public_html`.
3. Upload the zip file and extract it.
4. If you want the app at a subdomain (e.g., `sermon.yourchurch.com`), create a subdomain in cPanel and upload contents to its folder.
5. Ensure the `.htaccess` file (if present) does not block service worker or manifest JSON MIME types.
6. Add the following to `.htaccess` if needed for MIME types:

```apache
AddType application/json .json
AddType text/cache-manifest .manifest
AddType application/manifest+json .webmanifest
```

7. Ensure your SSL certificate is active (HTTPS required for Web Speech API, MediaRecorder, and Service Worker).

---

## 🔒 HTTPS Requirement

**Web Speech API, MediaRecorder, and Service Worker** require a secure context (HTTPS or localhost). Ensure your hosting platform serves the site over HTTPS. All modern static hosts enforce this by default.

---

## 🔄 Post-Deployment Checklist

- [ ] Open the site in Chrome/Edge and verify the **Install** prompt appears (PWA).
- [ ] Test microphone permissions on **index.html**.
- [ ] Verify **live.html** opens captions correctly.
- [ ] Check **analytics.html** loads sermon data from IndexedDB.
- [ ] Test **offline mode** by disabling network in DevTools → Network → Offline.
- [ ] Confirm all pages appear in **Google Search Console** via `sitemap.xml`.
- [ ] Update `sitemap.xml` and `robots.txt` with your actual domain name.
- [ ] Verify **Open Graph** and **Twitter Cards** by sharing the URL on social media.
- [ ] Test **high contrast mode** and **font size slider** for accessibility.
- [ ] Test **keyboard shortcuts**: Ctrl+S (save), Ctrl+Space (record), Ctrl+N (new sermon), Ctrl+P (present), Ctrl+F (find), Ctrl+B (bookmark), Ctrl+K (timer).
- [ ] Verify **export** of TXT, MD, HTML, DOC, SRT, Devotional, RSS, and JSON.
- [ ] Test **WhatsApp share** and **Native Web Share** on mobile.
- [ ] Confirm **QR codes** generate correctly for sermon sharing and live captions.
- [ ] Test **dark mode** toggle and system preference sync.
- [ ] Check **Analytics dashboard** after creating at least 2 sermons.

---

## 🛠️ Optional: GitHub Actions Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './sermonscribe'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

This workflow automatically deploys the `sermonscribe` folder to GitHub Pages on every push to `main`.

---

## 🌐 SEO & Discoverability

After deployment:

1. Submit your `sitemap.xml` to [Google Search Console](https://search.google.com/search-console).
2. Submit your site to [Bing Webmaster Tools](https://www.bing.com/webmasters).
3. Share your URL on social media to trigger Open Graph previews.
4. Add your site to church directories and ministry listings.
5. Encourage congregation members to install the PWA for recurring visits.

---

© 2026 HMG Concepts. All rights reserved.
