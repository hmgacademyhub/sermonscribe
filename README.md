# HMG SermonScribe v2

> **Real-Time Sermon Transcription, Live Congregation Captions, Sermon Analytics, Bible Flashcards, and Church Intelligence. Zero API Cost. Offline First.**  
> A FaithTech product of **HMG Gospel** under **HMG Concepts**.  
> Built by **Adewale Samson Adeagbo** — Educator, Data Scientist, AI-Augmented Solutions Developer.

---

## 🎯 Purpose

HMG SermonScribe v2 allows Christians to take accurate sermon notes while the pastor is preaching. They open the platform in their browser, tap **Start Recording**, and the sermon writes itself as the pastor speaks. But v2 goes far beyond transcription — it generates sermon outlines, discussion questions, devotionals, flashcards, prayer lists, social media quotes, and live congregation captions. All without a single paid API call.

## ✨ Philosophy

> *"Real problems. Real solutions. Built with what is available, not what is expensive."*

We do not use paid AI APIs. We use the **Web Speech API** built into modern browsers, **IndexedDB** for local storage, **BroadcastChannel** for live congregation sharing, and **Progressive Web App** technology for offline capability. No login, no server, no monthly bill.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Transcription | Web Speech API (native browser) | Free, real-time, no network needed for processing |
| Audio Backup | MediaRecorder API | Parallel safety net for missed words |
| Live Captions | BroadcastChannel + QR share | Congregation sees real-time captions on projector or phones |
| Storage | IndexedDB + localStorage | Persistent, offline, private, supports series & flashcards |
| PWA | Service Worker + Manifest | Installable, cacheable, fast repeat visits |
| Export | Vanilla JS + Blobs | 8 formats: TXT, MD, HTML, DOC, Print/PDF, SRT, Devotional, WhatsApp |
| Bible Data | Curated JSON (200+ verses, ~30KB) | Fast lookup, autocomplete, zero network calls |
| UI | Vanilla HTML/CSS/JS (ES modules) | Lightweight, no framework bloat, works on low bandwidth |
| Analytics | Client-side aggregation | Word counts, theme clouds, verse rankings, series breakdown |

---

## 📂 File Structure

```
sermon v2/
├── index.html              # Main transcription app (the pulpit)
├── live.html               # Live congregation caption display (projector/phone)
├── analytics.html          # Sermon analytics dashboard
├── about.html              # Brand story, founder info, HMG ecosystem
├── features.html           # Detailed feature explanations (24 features)
├── deploy.html             # Step-by-step deployment guide
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline cache v2)
├── README.md               # This file
├── DEPLOYMENT.md           # Detailed deployment steps
├── FEATURES.md             # Feature-by-feature deep dive
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions auto-deploy
└── assets/
    ├── css/style.css       # Complete stylesheet (light/dark/print/responsive/live)
    ├── js/
    │   ├── app.js          # Core engine (speech, editor, UI, state, all features)
    │   ├── bible.js        # 200+ curated verses + reference parser + autocomplete
    │   ├── export.js       # TXT, MD, HTML, DOC, Print, WhatsApp, SRT, Devotional, QR, Share URL
    │   ├── storage.js      # IndexedDB wrapper (sermons, settings, series, flashcards, backup)
    │   ├── utils.js        # Utilities, debounce, toasts, modals, keyword extraction, SRT time, filler strip, quotes, prayers, discussion questions
    │   ├── broadcast.js    # BroadcastChannel live congregation transcript sharing
    │   ├── outline-generator.js   # Rule-based sermon outline generation
    │   ├── discussion-generator.js # Template-based discussion question generation
    │   ├── prayer-extractor.js     # Prayer request pattern extraction
    │   ├── filler-remover.js       # Filler word regex stripper
    │   ├── flashcards.js           # Interactive scripture memory cards
    │   ├── social-clip.js          # Social media quote extraction
    │   ├── analytics.js            # Dashboard aggregation logic
    │   ├── church-branding.js      # Custom church logo, colour, name
    │   ├── audio-upload.js         # Drag-and-drop audio file transcription
    │   ├── reading-plan.js       # 5-day devotional generator
    │   └── verse-autocomplete.js   # Bible verse typing autocomplete
    └── images/
        ├── icon-192.svg      # PWA icon (scalable, branded)
        └── icon-512.svg      # PWA icon (scalable, branded)
```

---

## 🚀 Quick Start

1. **Open** `index.html` in a modern browser (Chrome, Edge, Safari, Samsung Internet) on **localhost** or **HTTPS**.
2. **Allow microphone access** when prompted.
3. Click **🎙️ Start Recording** and speak. Text appears in the editor.
4. Click **🔖 Add Bookmark** during important moments.
5. Click **📤 Export** to save as TXT, MD, HTML, Word, SRT, Devotional, or share via WhatsApp.
6. Open **live.html** on a projector to show congregation captions in real time.
7. Open **analytics.html** to see your preaching themes, scripture coverage, and sermon statistics.

---

## 🌍 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions for GitHub Pages, Cloudflare Pages, Vercel, Netlify, and cPanel.

---

## 📖 Features (24 Total)

See **[FEATURES.md](FEATURES.md)** for a detailed breakdown of every capability.

**Core Transcription:** Real-time speech-to-text, audio backup, continuous listening, auto-restart, speaker labelling, multi-language support.

**Live Congregation:** BroadcastChannel projector captions, QR code sharing, live.html display page.

**Bible Intelligence:** Smart reference detection, 200+ verse database, one-click insertion, verse autocomplete while typing.

**Content Generation:** Auto sermon outline, discussion questions, 5-day devotional, prayer request extractor, social media quote clips, scripture flashcards.

**Editing Tools:** Rich text editor, sermon templates, find & replace, filler word removal, timestamped bookmarks.

**Export Suite:** 8 formats including SRT subtitles and 5-day devotional Markdown.

**Analytics:** Sermon dashboard with theme word clouds, scripture rankings, series breakdown, duration totals.

**Enterprise:** Custom church branding, PWA install, offline-first, keyboard shortcuts, accessibility, backup & restore.

---

## 🏗️ Brand & Ecosystem

- **Parent:** [HMG Concepts](https://hmgconcepts.pages.dev) — Education · Technology · Media · Gospel
- **Faith Arm:** [HMG Gospel](https://hmggospel.pages.dev) — Christ-centred digital outreach
- **Education Arm:** [HMG Academy](https://hmgacademy.pages.dev) — Virtual tutoring & exam prep
- **Technology Arm:** [HMG Technologies](https://hmgtechnologies.pages.dev) — AI-augmented tools
- **Media Arm:** [HMG Media](https://hmgmedia.pages.dev) — Content & brand visibility
- **Builder:** [Adewale Samson Adeagbo](https://cssadewale.pages.dev) — Personal site & portfolio

---

## 📞 Contact & Support

- **WhatsApp:** [+234 810 086 6322](https://wa.me/2348100866322)
- **Email:** cssadewale@gmail.com
- **GitHub:** [@cssadewale](https://github.com/cssadewale)
- **YouTube:** [@hmgconcepts](https://youtube.com/@hmgconcepts)

---

## 📜 Licence & Attribution

© 2015 — 2026 **HMG Concepts** (His Marvellous Grace). Lagos, Nigeria. All rights reserved.

This software is provided as-is for churches, ministries, and individual believers. You are free to deploy, modify, and redistribute for non-commercial ministry purposes. For commercial licensing or white-label deployment, contact the builder via WhatsApp.

**"Every platform a pulpit. Every tool a testimony."**
