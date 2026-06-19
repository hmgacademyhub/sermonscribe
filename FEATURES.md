# Feature Breakdown — HMG SermonScribe v2

> **24 enterprise-grade features. Zero paid API. Zero server cost.**  
> Built for Nigerian churches, usable anywhere. Every feature is explained below with its purpose, how it works, and why it matters.

---

## 1. Real-Time Speech Transcription (Core)

**What it does:** Converts the pastor’s voice into editable text as he preaches. Members open the app, tap **Start Recording**, and the sermon writes itself.

**How it works:** Uses the native **Web Speech API** built into Chrome, Edge, Safari, and Samsung Internet. Continuous listening with interim + final results, auto-restart on error, speaker labelling (Pastor / Guest / Reader / Choir), and multi-language support.

**Why it matters:** Typing on a phone while listening is distracting. Members miss the anointing because they are focused on their thumbs. This removes that friction entirely.

---

## 2. Audio Backup Recording (Enterprise Safety Net)

**What it does:** While the speech-to-text engine is running, a parallel audio track is recorded using the **MediaRecorder API**.

**How it works:** The microphone stream is duplicated. One stream goes to the speech recogniser. The other is encoded into a WebM audio blob. When the user stops recording, the blob is saved and presented as a downloadable file with a built-in `<audio>` player.

**Why it matters:** No speech recognition engine is perfect. Accents, background noise, or technical vocabulary can cause errors. The audio file is a complete backup. If a transcript is wrong, a secretary or the pastor can replay the audio and correct it. This is the enterprise difference between a toy and a tool.

---

## 3. Live Congregation Captions (Competitive Feature from OneAccord / Wordly)

**What it does:** The congregation can see the sermon transcript in real time on a projector screen or on their own phones.

**How it works:**
- **Projector mode:** The scribe opens **live.html** on a projector-connected laptop. The main app pushes transcript updates via **BroadcastChannel** (supported in Chrome, Edge, Firefox, Safari 15.4+). The congregation sees large, high-contrast captions on the sanctuary screen.
- **Phone mode:** The scribe generates a QR code from the live share URL. Congregation members scan it with their camera app. The page auto-refreshes every 3 seconds to pull the latest transcript from `localStorage`.

**Why it matters:** This is the feature that separates SermonScribe from personal note-taking apps. Competitors like OneAccord and Wordly charge $150+/month for live translation. We provide live caption broadcasting **for free** using only browser APIs.

---

## 4. Offline-First PWA Architecture

**What it does:** The app installs to your home screen, works without internet after the first visit, and loads instantly on repeat visits.

**How it works:** Service Worker (`sw.js`) caches all HTML, CSS, JS, and image assets. IndexedDB stores all sermon data. The manifest tells the browser this is an installable app.

**Why it matters:** Nigerian churches often have poor or zero connectivity inside the sanctuary. Members should not depend on a data signal to take notes. Once the app is cached, it works inside a concrete hall with 0 bars.

---

## 5. Smart Bible Reference Detection + Autocomplete (Competitive Feature from CiteVerse / Sermon Keeper)

**What it does:** As the pastor quotes or references a scripture, the app detects it and displays the full verse. While typing references manually, the app auto-completes them.

**How it works:**
- A regular-expression parser scans the editor text for patterns like `John 3:16`, `Romans 8:28`, `1 Cor 13:4-8`.
- A **curated, compact Bible database** (~200 key verses, ~30KB) is embedded in the app. When a match is found, the full text is shown.
- **Autocomplete:** While typing inside the editor, if the last characters match a scripture pattern, a dropdown of matching verses appears. One click inserts the full text.

**Why it matters:** Typing long scriptures during a fast-paced sermon is impractical. This feature lets the scribe insert the full text in one click, ensuring accuracy and saving time. The database is lightweight enough to not slow down a low-end Android phone.

---

## 6. Rich Text Editor with Sermon Templates

**What it does:** Transcription is raw. The editor lets you shape it into a professional, structured sermon document.

**How it works:** Contenteditable div with formatting toolbar: Bold, italic, underline, Heading 2, Heading 3, bullet lists, numbered lists, blockquotes. Templates: Expository, Topical, Testimony. Caret-aware insertion. Auto-save every 10 seconds.

**Why it matters:** Many church members are not professional secretaries. Templates guide them into a format that the pastor, media team, or church archive can use immediately.

---

## 7. Timestamped Moment Bookmarks (Competitive Feature from Sermon Keeper / Bible Note)

**What it does:** During recording, the scribe can tap a "Bookmark" button to mark an important moment with a timestamp.

**How it works:** The app records the current elapsed time and inserts a 🔖 timestamp marker into the transcript. The bookmark is also stored in the sermon metadata. After the service, the scribe can jump to any bookmark to review or edit that specific section.

**Why it matters:** Sermon Keeper and Bible Note charge subscription fees for this feature. We provide it free, natively, because Nigerian churches need to mark prophetic moments, altar calls, and important quotes without paying a monthly fee.

---

## 8. Filler Word Removal (Competitive Feature from Sermon Scribe)

**What it does:** One-click stripper removes speech fillers from the transcript.

**How it works:** Regex-based replacement removes "um", "uh", "hmm", "like", "you know", "basically", "literally", "actually", "so yeah", and "okay" from the entire transcript.

**Why it matters:** Speech-to-text engines are faithful transcribers — they transcribe every sound. Pastors do not want their printed sermon notes filled with "um" and "uh". This produces a cleaner, more professional document in one click.

---

## 9. Find & Replace / Bulk Edit (Competitive Feature from Otter.ai / Descript)

**What it does:** Global search and replace across the entire transcript, with optional regular expression support.

**How it works:** A modal dialog asks for "Find", "Replace with", and a checkbox for "Use regular expressions". The operation runs on the entire editor HTML content.

**Why it matters:** If a speech engine consistently mishears a pastor's name or a church term, manually fixing every occurrence is tedious. One Find & Replace operation fixes every instance instantly.

---

## 10. Post-Recording Audio Upload & Transcription (Competitive Feature from ScreenApp / Sermon Shots)

**What it does:** Drag and drop an MP3, WAV, or M4A sermon recording, and the browser transcribes it using the same speech engine.

**How it works:** The user drags an audio file onto the upload zone (or clicks to browse). The browser creates an `<audio>` element, plays the file, and pipes the audio output into a new `SpeechRecognition` instance. The transcript is inserted into the editor as the audio plays.

**Why it matters:** Not every church has someone with a laptop in the front row. Some churches record the sermon on a phone or soundboard and want to transcribe it later. This feature allows batch transcription without uploading anything to a cloud server.

---

## 11. Auto-Generated Sermon Outline (Competitive Feature from Sermon Scribe / Wordwell)

**What it does:** Generates a structured sermon outline from the transcript without any AI API.

**How it works:** Rule-based algorithm:
- Splits the transcript into paragraphs.
- Extracts the first sentence of each paragraph as a potential heading.
- Prioritises sentences that follow scripture references or contain bold/italic formatting.
- Compiles a Markdown outline with Introduction, Main Points, Conclusion, and Key Scriptures.

**Why it matters:** Sermon Scribe and Wordwell use AI to generate outlines and charge subscription fees. Our rule-based approach produces a usable outline instantly, for free, using only client-side logic.

---

## 12. Discussion Questions Generator (Competitive Feature from FaithStack / SermonUp)

**What it does:** Generates discussion questions for small groups based on the sermon's themes and scriptures.

**How it works:** Template-based question engine uses detected themes and scripture references to generate questions like: "How does [THEME] relate to [VERSE] in your daily life?", "In what areas do you need to grow in [THEME]?", "How can our church community demonstrate [THEME] this week?"

**Why it matters:** Small group leaders need discussion guides. Instead of reading the entire sermon again, they get 6 ready-made questions in one click.

---

## 13. Prayer Request Extractor (Unique Feature — No Direct Competitor)

**What it does:** Automatically detects and extracts prayer requests from the sermon transcript.

**How it works:** Pattern-matching engine detects phrases like "pray for", "let us pray", "prayer request", "intercede for", "lift up", and extracts the surrounding sentence as a prayer item.

**Why it matters:** During a sermon, the pastor may mention several people, situations, or nations that need prayer. The scribe can miss these while trying to keep up with the main message. This feature ensures no prayer request is lost.

---

## 14. Shareable Quotes & Social Media Clips (Competitive Feature from WhisperTranscribe / Sermon Shots)

**What it does:** Algorithm extracts the most impactful sentences and formats them for one-click sharing.

**How it works:** Rule-based scoring system:
- Short sentences (40–280 characters) score higher.
- Sentences containing powerful words (faith, grace, victory, believe, promise) score higher.
- Sentences immediately following scripture references score higher.
- Sentences with quotation marks or imperative verbs score higher.
The top 6 sentences are displayed as "Shareable Quotes" with one-click WhatsApp sharing.

**Why it matters:** Church media teams need quotable content for Instagram, WhatsApp status, and Facebook. This feature extracts the best lines without manual reading.

---

## 15. Scripture Flash Cards (Competitive Feature from Bible Note / Scripture Memory Fellowship)

**What it does:** Turn detected Bible verses into interactive memory cards.

**How it works:** Detected verses from the sermon are displayed as cards with the reference visible and the text blurred. The user taps to reveal the verse. All cards can be saved to a persistent IndexedDB flashcard library for later review.

**Why it matters:** Scripture memorisation is a core Christian discipline. Instead of using a separate Bible memory app, the congregation can memorise the verses from the sermon they just heard.

---

## 16. 5-Day Devotional Generator (Competitive Feature from Sermon Scribe / Wordwell)

**What it does:** Creates a structured 5-day reading plan from any sermon.

**How it works:** Rule-based devotional generator:
- Day 1: Reflection & Key Scripture
- Day 2: Personal Application
- Day 3: Sharing the Message
- Day 4: Deeper Study & Prayer
- Day 5: Living It Out
Each day includes a Scripture Focus, Guiding Question, Action Step, and Closing Prayer. Generated from the sermon's detected themes and scriptures using template filling.

**Why it matters:** Sermon Scribe and Wordwell charge monthly fees for devotional generation. We provide it for free, offline, with no AI API.

---

## 17. Sermon Analytics Dashboard (Competitive Feature from Wordwell / Everprise)

**What it does:** A separate analytics page (`analytics.html`) that shows preaching patterns, scripture coverage, and spiritual themes.

**How it works:** Client-side aggregation from the IndexedDB sermon library:
- Total sermons, total words, average sermon length
- Unique themes detected across all sermons (word cloud)
- Most quoted scriptures (ranked list)
- Sermon series breakdown
- Total recording duration

**Why it matters:** Pastors rarely have visibility into their own preaching patterns. This dashboard shows them which themes they preach most often, which books of the Bible they quote most, and whether their coverage is balanced.

---

## 18. Enterprise Export Suite (8 Formats)

**What it does:** When the sermon is complete, the user can export it in eight different ways — all processed entirely in the browser.

| Format | Best For |
|--------|----------|
| Plain Text (.txt) | WhatsApp, SMS, basic archiving |
| Markdown (.md) | Blogs, GitHub, Notion, Obsidian |
| Web Page (.html) | Email attachments, church websites |
| Microsoft Word (.doc) | Secretaries, formal church records |
| Print / Save as PDF | Bulletins, handouts, pulpit copies |
| Subtitles (.srt) | Video captions, YouTube uploads |
| 5-Day Devotional (.md) | Congregation follow-up content |
| WhatsApp Share | Immediate distribution to members |

**Why it matters:** Different church roles need different formats. The media team wants Markdown. The secretary wants Word. The evangelist wants WhatsApp. The video editor wants SRT. One app provides all eight.

---

## 19. Shareable URL & QR Code

**What it does:** Generate a link that encodes the entire sermon, which anyone can open instantly without needing the app or a server.

**How it works:** The sermon data is serialised to JSON, compressed with Base64 encoding, and appended to the URL hash. When the recipient opens the link, the app decodes the hash and offers to import the sermon.

**Why it matters:** In a Nigerian church, members often want the sermon notes before they leave the building. The scribe can generate a QR code on their phone. Members scan it with their camera app and the sermon opens immediately. No group admin, no email, no database.

---

## 20. Presenter & Projector Mode

**What it does:** A clean, full-screen reading view with no toolbars, sidebars, or buttons — ideal for reviewing notes on a pulpit tablet or projecting corrected notes onto a screen. The separate **live.html** page provides a black-background, high-contrast caption display for sanctuary projectors.

**How it works:** Presenter mode hides all non-essential UI elements and enlarges the text. Projector mode (`live.html`) uses a dark background with white text at a very large font size, optimised for readability from the back of a church hall.

**Why it matters:** The pastor or an assistant may want to review the corrected transcript on the pulpit device without the risk of accidentally clicking a button or editing the text during the service.

---

## 21. Accessibility & Keyboard Shortcuts

**What it does:** Power-user controls and screen-reader support so the app is usable by everyone.

**Shortcuts:**
- **Ctrl + Space** — Start / Stop recording
- **Ctrl + S** — Force save immediately
- **Ctrl + N** — New sermon
- **Ctrl + P** — Presenter mode
- **Ctrl + F** — Find & Replace
- **Ctrl + B** — Add Bookmark
- **Escape** — Close modals, drawers, exit presenter mode

**Accessibility:** ARIA live regions, screen-reader announcements, reduced-motion preference, visible focus indicators.

**Why it matters:** A church is a community of diverse abilities. The platform must be usable by a 70-year-old elder with failing eyesight, a youth with a cracked screen, and a tech-savvy media team member.

---

## 22. Backup & Restore

**What it does:** Download the entire sermon library (including series, bookmarks, and flashcards) as a single JSON file, and restore it later on any device.

**How it works:** The IndexedDB database is serialised to JSON, wrapped in a metadata envelope, and downloaded as a `.json` file. Restore reads the same JSON file, validates the structure, and writes every sermon back into IndexedDB.

**Why it matters:** Phones break. Browsers get cleared. Members upgrade devices. Without backup, years of sermon notes can vanish. A monthly backup to Google Drive or email protects the church’s spiritual heritage.

---

## 23. Nigerian Context Optimisation

**What it does:** The app is not a generic Western tool with African colours. It is built from the ground up for Nigerian realities.

**Optimisations:**
- **Lightweight:** Core app under 300KB. Works on Tecno, Infinix, and Itel devices with 1GB RAM.
- **WhatsApp-first:** The most common export path is WhatsApp, not email or Dropbox.
- **Offline-first:** Church buildings often have zero signal. The app must work without it.
- **No app store:** Members are hesitant to install apps from Google Play due to storage limits. A PWA via browser is frictionless.
- **Multi-language speech:** Supports English, Yoruba, Igbo, and Hausa speech recognition where the browser model permits.
- **Zero recurring cost:** No monthly subscription that a small church cannot afford.

**Why it matters:** Technology that is not built for its users’ constraints will be abandoned. HMG SermonScribe v2 is designed for the actual devices, networks, and habits of Nigerian church members.

---

## 24. Custom Church Branding (Competitive Feature from OneAccord / SermonAudio)

**What it does:** Churches can upload their own name, accent colour, logo URL, and WhatsApp contact so the app appears branded for their congregation.

**How it works:** A "Church Branding" modal collects the church name, accent colour (HTML colour picker), logo URL, and phone number. These are stored in local settings and applied to the app header, export documents, and footer.

**Why it matters:** OneAccord and SermonAudio charge monthly fees for custom branding. We provide it for free because every church should feel ownership over the tools their members use.

---

## 📞 Summary Table

| Feature | Status | Cost | Offline | Server Required |
|---------|--------|------|---------|-----------------|
| Speech-to-text | ✅ Native | Free | Yes | No |
| Audio backup | ✅ Native | Free | Yes | No |
| Live congregation captions | ✅ BroadcastChannel + QR | Free | Yes | No |
| PWA install | ✅ | Free | Yes | No |
| Bible detection + autocomplete | ✅ | Free | Yes | No |
| Rich editor + templates | ✅ | Free | Yes | No |
| Timestamped bookmarks | ✅ | Free | Yes | No |
| Filler word removal | ✅ | Free | Yes | No |
| Find & replace | ✅ | Free | Yes | No |
| Audio file upload transcription | ✅ | Free | Yes | No |
| Auto sermon outline | ✅ Rule-based | Free | Yes | No |
| Discussion questions | ✅ Template-based | Free | Yes | No |
| Prayer extractor | ✅ Pattern-based | Free | Yes | No |
| Social quotes | ✅ Algorithmic | Free | Yes | No |
| Scripture flashcards | ✅ | Free | Yes | No |
| 5-day devotional | ✅ Rule-based | Free | Yes | No |
| Analytics dashboard | ✅ Client-side | Free | Yes | No |
| Export (8 formats) | ✅ | Free | Yes | No |
| Share URL / QR | ✅ | Free | Yes | No |
| Presenter + projector mode | ✅ | Free | Yes | No |
| Accessibility + shortcuts | ✅ | Free | Yes | No |
| Backup & restore | ✅ | Free | Yes | No |
| Nigerian context | ✅ | Free | Yes | No |
| Custom church branding | ✅ | Free | Yes | No |

**Total cost to church: ₦0.00**

---

*Built by Adewale Samson Adeagbo for HMG Gospel under HMG Concepts.*  
*Lagos, Nigeria. 2026.*
