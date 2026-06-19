# HMG SermonScribe v3

> **Real-Time Sermon Transcription, Live Congregation Captions, Church Analytics, Bible Intelligence, Devotionals, Digital Bulletins, Prayer Wall, and Enterprise Accessibility. Zero API Cost. Offline First. Installable Everywhere.**
>
> A FaithTech product of **HMG Gospel** under **HMG Concepts**.
>
> Built by **Adewale Samson Adeagbo** — Educator, Data Scientist, AI-Augmented Solutions Developer.
> Enhanced by Arena.ai Agent with enterprise features, accessibility, SEO, and robust offline architecture.

---

## 🎯 Purpose

HMG SermonScribe v3 allows Christians to take accurate sermon notes while the pastor is preaching. They open the platform in their browser, tap **Start Recording**, and the sermon writes itself as the pastor speaks. v3 goes far beyond transcription — it generates sermon outlines, discussion questions, devotionals, flashcards, prayer lists, social media quotes, live congregation captions, digital bulletins, a prayer wall, and full analytics. All without a single paid API call.

---

## ✨ Philosophy

> _"Real problems. Real solutions. Built with what is available, not what is expensive."_

We do not use paid AI APIs. We use the **Web Speech API** built into modern browsers, **IndexedDB** for local storage, **BroadcastChannel + localStorage fallback** for live congregation sharing, and **Progressive Web App** technology for offline capability. No login, no server, no monthly bill.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Transcription | Web Speech API (native browser) | Free, real-time, no network needed for processing |
| Audio Backup | MediaRecorder API | Parallel safety net for missed words |
| Live Captions | BroadcastChannel + localStorage fallback | Congregation sees real-time captions on projector or phones |
| Storage | IndexedDB + localStorage | Persistent, offline, private, supports sermons, devotions, bulletins, prayers |
| PWA | Service Worker + Manifest + Offline Fallback | Installable, cacheable, fast repeat visits, graceful offline |
| Export | Vanilla JS + Blobs | 12 formats: TXT, MD, HTML, DOC, Print/PDF, SRT, Devotional, RSS, JSON, WhatsApp, Native Share, QR |
| Bible Data | 500+ curated verses (6 translations) + free Bible API caching | Fast lookup, autocomplete, zero network calls after first use |
| UI | Vanilla HTML/CSS/JS (ES modules) | Lightweight, no framework bloat, works on low bandwidth |
| Analytics | Client-side aggregation + Canvas | Word clouds, theme charts, preacher distribution, timeline, reading level |

---

## 📂 File Structure

```
sermonscribe/
├── index.html              # Main transcription app (the pulpit)
├── live.html               # Live congregation caption display (projector/phone)
├── analytics.html          # Sermon analytics dashboard (word clouds, charts, tables)
├── notes.html              # Congregation fill-in-the-blank sermon notes
├── devotions.html          # SOAP / BREAD devotional center
├── bulletin.html           # Digital bulletin builder for church programs
├── prayer-wall.html        # Congregation prayer wall
├── about.html              # Brand story, founder info, HMG ecosystem
├── features.html           # Detailed feature explanations (50+ features)
├── deploy.html             # Step-by-step deployment guide
├── offline.html            # Offline fallback page for service worker
├── manifest.json           # PWA manifest with icons, shortcuts, screenshots
├── sw.js                   # Service Worker (offline cache v3 with fallback)
├── robots.txt              # SEO crawl directives
├── sitemap.xml             # SEO sitemap for all pages
├── README.md               # This file
├── DEPLOYMENT.md           # Detailed deployment steps
├── assets/
│   ├── css/
│   │   └── style.css       # Complete stylesheet (light/dark/high-contrast/print/responsive/live)
│   ├── js/
│   │   ├── app.js          # Core engine (speech, editor, UI, state, all features)
│   │   ├── bible.js        # 500+ curated verses (6 translations) + reference parser + autocomplete + free API fallback
│   │   ├── export.js       # TXT, MD, HTML, DOC, Print, WhatsApp, SRT, Devotional, RSS, JSON, QR, Native Share
│   │   ├── storage.js      # IndexedDB wrapper (sermons, devotions, prayers, bulletins, notes, series, flashcards, cache)
│   │   ├── utils.js        # Utilities, debounce, toasts, modals, keyword extraction, SRT time, filler strip, quotes, prayers, discussion questions, reading level, TTS, wake lock, notifications, vibration, orientation
│   │   ├── broadcast.js    # BroadcastChannel + localStorage fallback for live congregation captions
│   │   ├── analytics.js    # Dashboard aggregation logic (charts, word clouds, tables)
│   │   ├── accessibility.js # Accessibility helpers (font size, contrast, focus traps)
│   │   ├── sermon-timer.js # Pastor countdown timer with vibration alerts
│   │   ├── word-cloud.js    # Canvas-based theme word cloud
│   │   ├── devotions.js     # SOAP / BREAD devotional generator
│   │   ├── bulletin.js      # Digital bulletin builder
│   │   ├── prayer-wall.js   # Prayer wall logic
│   │   ├── notes-mode.js    # Fill-in-the-blank congregation notes
│   │   └── offline-library.js # Offline sermon library search
│   └── images/
│       ├── icon-192.svg      # PWA icon (scalable, branded)
│       ├── icon-512.svg      # PWA icon (scalable, branded)
│       └── social-preview.jpg # Open Graph / Twitter Card image
└── .github/workflows/
    └── deploy.yml            # GitHub Actions auto-deploy (optional)
```

---

## 🚀 Quick Start

1. **Open** `index.html` in a modern browser (Chrome, Edge, Safari, Samsung Internet) on **localhost** or **HTTPS**.
2. **Allow microphone access** when prompted.
3. Click **🎙️ Start Recording** and speak. Text appears in the editor.
4. Click **🔖 Add Bookmark** during important moments.
5. Click **📤 Export** to save as TXT, MD, HTML, Word, SRT, Devotional, RSS, or share via WhatsApp.
6. Open **live.html** on a projector to show congregation captions in real time.
7. Open **analytics.html** to see your preaching themes, scripture coverage, and sermon statistics.
8. Open **devotions.html** for daily SOAP / BREAD journaling.
9. Open **bulletin.html** to build your church program digitally.
10. Open **prayer-wall.html** to submit and agree with prayer requests.

---

## 🌍 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions for GitHub Pages, Cloudflare Pages, Vercel, Netlify, and cPanel.

Also see the interactive **[deploy.html](deploy.html)** page inside the app.

---

## 📖 Features (50+ Total)

See **[features.html](features.html)** for a detailed breakdown of every capability.

**Core Transcription:** Real-time speech-to-text, audio backup, continuous listening, auto-restart, speaker labelling, multi-language support, sermon countdown timer, vibration feedback, screen wake lock.

**Live Congregation:** BroadcastChannel + QR share + localStorage fallback, live.html display page, landscape orientation lock.

**Bible Intelligence:** Smart reference detection, 500+ verse database in 6 translations (KJV, NIV, ESV, NLT, AMP, MSG), one-click insertion, verse autocomplete while typing, free Bible API fallback with IndexedDB caching.

**Content Generation:** Auto sermon outline, discussion questions, 5-day devotional, prayer request extractor, social media quote clips, scripture flashcards, reading level analyzer (Flesch-Kincaid), word cloud visualization, text-to-speech reader.

**Congregation Tools:** Fill-in-the-blank sermon notes, digital bulletin builder, SOAP/BREAD devotion center, congregation prayer wall with amen button.

**Editing Tools:** Rich text editor, sermon templates, find & replace, filler word removal, timestamped bookmarks, high-contrast mode, font size slider, keyboard shortcuts.

**Export Suite:** 12 formats including SRT subtitles, 5-day devotional Markdown, podcast RSS, JSON, native Web Share, and WhatsApp.

**Analytics:** Sermon dashboard with theme word clouds, scripture rankings, preacher distribution, sermon timeline, reading level tracking, detailed sermon table.

**Enterprise:** Custom church branding, PWA install, offline-first with fallback page, keyboard shortcuts, full accessibility (ARIA, focus traps, skip links, screen reader support), SEO (meta tags, Open Graph, Twitter Cards, JSON-LD, sitemap, robots.txt), backup & restore.

---

## 🏗️ Brand & Ecosystem

- **Parent:** [HMG Concepts](https://hmgconcepts.pages.dev/) — Education · Technology · Media · Gospel
- **Faith Arm:** [HMG Gospel](https://hmggospel.pages.dev/) — Christ-centred digital outreach
- **Education Arm:** [HMG Academy](https://hmgacademy.pages.dev/) — Virtual tutoring & exam prep
- **Technology Arm:** [HMG Technologies](https://hmgtechnologies.pages.dev/) — AI-augmented tools
- **Media Arm:** [HMG Media](https://hmgmedia.pages.dev/) — Content & brand visibility
- **Builder:** [Adewale Samson Adeagbo](https://cssadewale.pages.dev/) — Personal site & portfolio

---

## 📞 Contact & Support

- **WhatsApp:** [+234 810 086 6322](https://wa.me/2348100866322)
- **Email:** [cssadewale@gmail.com](mailto:cssadewale@gmail.com)
- **GitHub:** [@cssadewale](https://github.com/cssadewale)
- **YouTube:** [@hmgconcepts](https://youtube.com/@hmgconcepts)

---

## 📜 Licence & Attribution

© 2015 — 2026 **HMG Concepts** (His Marvellous Grace). Lagos, Nigeria. All rights reserved.

This software is provided as-is for churches, ministries, and individual believers. You are free to deploy, modify, and redistribute for non-commercial ministry purposes. For commercial licensing or white-label deployment, contact the builder via WhatsApp.

**"Every platform a pulpit. Every tool a testimony."**
