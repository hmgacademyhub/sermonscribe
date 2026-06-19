/* ============================================
 HMG SermonScribe v3 — Utilities + Enterprise Helpers
 ============================================ */

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export function getToday() {
  return new Date().toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export function getTimestamp() {
  return new Date().toISOString();
}

export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

export function downloadBlob(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 160);
}

export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sentenceCount(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
}

export function paragraphCount(text) {
  return text.split(/\n+/).filter(p => p.trim().length > 10).length;
}

export function fleschKincaid(text) {
  const words = Math.max(1, wordCount(text));
  const sentences = Math.max(1, sentenceCount(text));
  const syllables = text.split(/\s+/).reduce((acc, w) => acc + Math.max(1, countSyllables(w)), 0);
  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  const ease = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return { grade: Math.round(grade * 10) / 10, ease: Math.round(ease * 10) / 10 };
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  const m = word.match(/[aeiouy]+/g);
  if (!m) return 1;
  let s = m.length;
  if (word.endsWith('e') && !word.endsWith('le')) s--;
  return Math.max(1, s);
}

export function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
}

export function getKeywords(text) {
  const themes = {
    Faith: ['faith', 'believe', 'trust', 'believing', 'believer', 'believers'],
    Grace: ['grace', 'favour', 'favor', 'unmerited', 'mercy', 'mercies'],
    Love: ['love', 'loving', 'beloved', 'charity', 'compassion', 'compassionate'],
    HolySpirit: ['holy spirit', 'spirit of god', 'anointing', 'anointed', 'pentecost', 'spirit-filled'],
    Prayer: ['pray', 'prayer', 'praying', 'supplication', 'intercede', 'intercession'],
    Salvation: ['salvation', 'saved', 'redeem', 'redemption', 'saviour', 'savior', 'deliverance', 'deliver'],
    Forgiveness: ['forgive', 'forgiveness', 'forgiven', 'pardon', 'reconcile', 'reconciliation'],
    Obedience: ['obey', 'obedience', 'obedient', 'submit', 'submission', 'surrender', 'yield'],
    Kingdom: ['kingdom', 'kingdom of god', 'kingdom of heaven', 'reign', 'throne', 'royal'],
    Purpose: ['purpose', 'destiny', 'calling', 'call', 'plan', 'ordained', 'ordination'],
    Prosperity: ['prosper', 'prosperity', 'abundance', 'blessing', 'bless', 'blessed', 'favour', 'increase'],
    Trials: ['trial', 'tribulation', 'suffering', 'persecution', 'test', 'storm', 'valley', ' affliction'],
    Worship: ['worship', 'praise', 'adore', 'glorify', 'magnify', 'honour', 'honor', 'exalt'],
    Family: ['family', 'marriage', 'husband', 'wife', 'children', 'parent', 'home', 'household'],
    Unity: ['unity', 'together', 'one accord', 'agreement', 'harmony', 'fellowship', 'fellowshiping'],
    Evangelism: ['evangelism', 'gospel', 'preach', 'witness', 'soul', 'winning', 'harvest', 'mission'],
    Healing: ['heal', 'healing', 'health', 'miracle', 'miracles', 'restore', 'restoration'],
    Wisdom: ['wisdom', 'knowledge', 'understanding', 'discernment', 'insight', 'revelation']
  };
  const lower = text.toLowerCase();
  const found = [];
  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some(k => lower.includes(k))) found.push(theme);
  }
  return [...new Set(found)];
}

export function createToast(message, type = 'info') {
  const container = document.querySelector('.toast-container') || (() => { const c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); return c; })();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 300); }, 4000);
}

export function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(id); }, { once: true });
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { closeModal(id); document.removeEventListener('keydown', esc); } });
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
}

export function openDrawer(id) {
  document.getElementById(id)?.classList.add('open');
  document.querySelector('.drawer-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDrawer(id) {
  document.getElementById(id)?.classList.remove('open');
  document.querySelector('.drawer-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

export function srtTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${h}:${m}:${s},${ms}`;
}

export function stripFillerWords(text) {
  return text.replace(/\b(uh+|um+|hmm+|ah+|er+|like\s|you\s+know|i\s+mean|sort\s+of|kind\s+of|basically|literally|actually|so\s+yeah|okay|right|well)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
}

export function extractTopSentences(text, count = 5) {
  const sentences = text.replace(/([.!?])\s+/g, "$1|").split("|").filter(s => s.trim().length > 40 && s.trim().length < 280);
  const scored = sentences.map(s => {
    let score = 0;
    const lower = s.toLowerCase();
    if (/believe|faith|trust|hope|love|grace|power|victory|promise|bless|salvation|eternal|heaven|glory|miracle|transform|renew|strength|overcome|persevere|rejoice|worship|pray/.test(lower)) score += 3;
    if (/therefore|conclusion|finally|in\s+summary|remember|never\s+forget|take\s+away|challenge/.test(lower)) score += 2;
    if (s.includes('"') || s.includes("'")) score += 1;
    if (/question|ask|consider|reflect|ponder/.test(lower)) score += 1;
    if (lower.includes('jesus') || lower.includes('christ') || lower.includes('god') || lower.includes('lord')) score += 2;
    return { sentence: s.trim(), score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.sentence);
}

export function extractPrayerRequests(text) {
  const patterns = [
    /\b(pray\s+for|let\s+us\s+pray|we\s+pray|prayer\s+request|intercede\s+for|lift\s+up|bring\s+before\s+the\s+lord|mention\s+in\s+prayer)\b[^.!?]*[.!?]/gi,
    /\b(brother|sister|family|member|congregation|community|nation|sick|hospital|bereaved|mourning|grieving|travelling|journey|mercy|healing|comfort|strength|guidance|protection|deliverance)\b[^.!?]{0,120}[.!?]/gi
  ];
  const requests = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) requests.push(m[0].trim());
    re.lastIndex = 0;
  }
  return [...new Set(requests)].slice(0, 20);
}

export function generateDiscussionQuestions(themes, verses, title) {
  const questions = [];
  const used = new Set();
  for (const v of verses.slice(0, 3)) {
    const q = `How does ${v.ref} relate to the message of "${title}"?`;
    if (!used.has(q)) { questions.push(q); used.add(q); }
  }
  for (const t of themes.slice(0, 4)) {
    const templates = [
      `In what areas of your life do you need to grow in ${t.toLowerCase()}?`,
      `Share a personal experience where ${t.toLowerCase()} made a difference.`,
      `How can our church community demonstrate ${t.toLowerCase()} this week?`,
      `What is one practical step you will take to apply ${t.toLowerCase()} from today's message?`
    ];
    for (const tpl of templates) { if (!used.has(tpl)) { questions.push(tpl); used.add(tpl); break; } }
  }
  while (questions.length < 6) {
    const fill = `What is the Holy Spirit saying to you personally through this sermon?`;
    if (!used.has(fill)) { questions.push(fill); used.add(fill); }
    break;
  }
  return questions;
}

export function generateDayQuestion(day, themes, verses) {
  const t = themes[0] || 'faith';
  const v = verses[0] || 'the Word';
  const q = [
    `How does ${v} challenge your understanding of ${t}?`,
    `What area of your life needs more ${t} this week?`,
    `Who can you share this message about ${t} with today?`,
    `What does ${v} teach you about trusting God in difficult moments?`,
    `Write one commitment you will make to grow in ${t}.`
  ];
  return q[day - 1] || q[0];
}

export function generateDayAction(day, themes, verses) {
  const t = themes[0] || 'faith';
  const a = [
    `Read and meditate on the key scripture today.`,
    `Journal one specific application of ${t} in your life.`,
    `Call or message someone to encourage them in ${t}.`,
    `Spend 15 minutes in prayer specifically about ${t}.`,
    `Choose one habit that reflects ${t} and practice it daily this week.`
  ];
  return a[day - 1] || a[0];
}

export function generateDayPrayer(day, themes) {
  const t = themes[0] || 'faith';
  const p = [
    `Lord, open my heart to receive Your Word about ${t}.`,
    `Father, show me where I need to grow in ${t}.`,
    `Holy Spirit, give me boldness to live out ${t}.`,
    `Lord, let Your truth about ${t} transform my mind and actions.`,
    `Thank You, God, for the gift of Your Word and the power of ${t}.`
  ];
  return p[day - 1] || p[0];
}

export function htmlToMarkdown(html) {
  let md = html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<div[^>]*>(.*?)<\/div>/gi, '\n$1\n')
    .replace(/<[^>]+>/g, '');
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

export function buildFullHTML(sermon, forPrint = false) {
  const text = stripHtml(sermon.content);
  const wc = wordCount(text);
  const rt = estimateReadTime(text);
  const fk = fleschKincaid(text);
  const body = sermon.content || '<p><em>No content</em></p>';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(sermon.title)} — SermonScribe</title>
<style>
body{font-family:system-ui,Georgia,serif;line-height:1.7;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111;background:#fff}
h1{font-size:1.8rem;margin-bottom:.25rem}
.meta{color:#555;font-size:.9rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #ddd}
blockquote{border-left:4px solid #d97706;padding-left:1rem;margin:1rem 0;color:#444;font-style:italic}
</style>
</head>
<body>
<h1>${escapeHtml(sermon.title)}</h1>
<div class="meta">
  <strong>Date:</strong> ${escapeHtml(sermon.date || getToday())} &nbsp;|&nbsp;
  <strong>Preacher:</strong> ${escapeHtml(sermon.preacher || 'Unknown')} &nbsp;|&nbsp;
  <strong>Duration:</strong> ${escapeHtml(sermon.duration || 'N/A')} &nbsp;|&nbsp;
  <strong>Series:</strong> ${escapeHtml(sermon.series || 'N/A')} &nbsp;|&nbsp;
  <strong>Words:</strong> ${wc} &nbsp;|&nbsp;
  <strong>Read time:</strong> ~${rt} min &nbsp;|&nbsp;
  <strong>Grade level:</strong> ${fk.grade}
</div>
${body}
</body>
</html>`;
}

export function escapeXml(str) {
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
}

export function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

export function shareViaNative(data) {
  if (navigator.share) {
    navigator.share(data).catch(() => {});
  } else {
    return false;
  }
}

export function requestWakeLock() {
  if ('wakeLock' in navigator) {
    return navigator.wakeLock.request('screen').catch(() => null);
  }
  return Promise.resolve(null);
}

export function releaseWakeLock(lock) {
  if (lock && 'release' in lock) lock.release().catch(() => {});
}

export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('denied');
  return Notification.requestPermission();
}

export function notify(title, options = {}) {
  if (Notification.permission === 'granted') {
    try { new Notification(title, { icon: './assets/images/icon-192.svg', ...options }); } catch {}
  }
}

export function lockOrientation(orientation) {
  if (screen.orientation && screen.orientation.lock) {
    return screen.orientation.lock(orientation).catch(() => {});
  }
  return Promise.resolve();
}

export function textToSpeech(text, lang = 'en-NG') {
  if (!('speechSynthesis' in window)) return null;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.95;
  window.speechSynthesis.speak(u);
  return u;
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

export function parseMarkdownToHtml(md) {
  return md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/\n/gim, '<br>');
}

export function setFontSize(size) {
  document.documentElement.style.setProperty('--editor-font-size', size + 'px');
  document.querySelectorAll('.sermon-editor').forEach(el => el.style.fontSize = size + 'px');
}

export function getBooks() {
  return ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
}
