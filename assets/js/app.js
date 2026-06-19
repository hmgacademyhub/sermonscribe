/* ============================================
 HMG SermonScribe v3 — Core Application Engine
 FaithTech product of HMG Gospel under HMG Concepts.
 Zero API cost. Offline-first. Enterprise-grade. Accessible.
 ============================================ */

import {
  generateId, formatTime, getToday, getTimestamp, debounce, createToast, openModal, closeModal,
  openDrawer, closeDrawer, getKeywords, stripHtml, wordCount, estimateReadTime, capitalize,
  stripFillerWords, extractTopSentences, extractPrayerRequests, generateDiscussionQuestions,
  requestWakeLock, releaseWakeLock, vibrate, requestNotificationPermission, notify,
  lockOrientation, textToSpeech, stopSpeech, fileToText, parseMarkdownToHtml, setFontSize, fleschKincaid, sentenceCount, paragraphCount, shareViaNative
} from './utils.js';

import { detectReferences, getAllVerses, getVersesByBook, autocompleteVerse, getBooks, getTranslation, setTranslation, fetchVerse, getTranslations } from './bible.js';

import {
  saveSermon, loadSermons, getSermon, deleteSermon, saveSettings, getSettings,
  exportAllSermons, importAllSermons, saveFlashcard, loadFlashcards, deleteFlashcard,
  saveSeries, deleteSeries, getAllSeries, searchSermons, loadDevotions, saveDevotion, savePrayer, saveBulletin, saveNote, loadNotesBySermon
} from './storage.js';

import { exportTXT, exportMD, exportHTML, exportDOCX, exportPrint, shareWhatsApp, shareWebNative, generateShareableURL, parseSharedURL, generateQRDataURL, exportSRT, exportReadingPlan, generateRSS, exportJSON } from './export.js';

import { LiveBroadcast } from './broadcast.js';

const state = {
  sermons: [], currentId: null, isRecording: false, isPaused: false,
  recordStart: 0, elapsed: 0, recognition: null, mediaRecorder: null,
  audioChunks: [], audioUrl: null, language: 'en-NG', interimText: '',
  theme: 'light', autoSaveInterval: 10, speakerLabel: 'Pastor', preacherName: '',
  lastSaved: null, activeTab: 'recent', presentMode: false, bookmarks: [],
  seriesFilter: '', liveBroadcast: null, focusMode: false, churchBranding: null,
  searchQuery: '', wakeLock: null, fontSize: 16, highContrast: false, ttsUtterance: null
};

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const els = {
  editor: () => $('#editor'), title: () => $('#sermon-title'), preacher: () => $('#preacher-name'),
  series: () => $('#series-select'), sermonList: () => $('#sermon-list'), recordBtn: () => $('#record-btn'),
  pauseBtn: () => $('#pause-btn'), recordHud: () => $('#record-hud'), recordTime: () => $('#record-time'),
  recordStatus: () => $('#record-status'), langSelect: () => $('#lang-select'), speakerSelect: () => $('#speaker-select'),
  themeToggle: () => $('#theme-toggle'), biblePanel: () => $('#bible-panel'), keywordPanel: () => $('#keyword-panel'),
  exportPanel: () => $('#export-panel'), statusBar: () => $('#status-bar'), wordCount: () => $('#word-count'),
  readTime: () => $('#read-time'), lastSaved: () => $('#last-saved'), toastContainer: () => $('#toast-container'),
  bookmarkPanel: () => $('#bookmark-panel'), prayerPanel: () => $('#prayer-panel'), quotePanel: () => $('#quote-panel'),
  seriesList: () => $('#series-list'), searchInput: () => $('#search-input'), sentenceCount: () => $('#sentence-count'),
  paragraphCount: () => $('#paragraph-count'), gradeLevel: () => $('#grade-level'), verseAutocomplete: () => $('#verse-autocomplete')
};

async function init() {
  initTheme(); await loadSettings(); await loadSermonList(); checkSharedURL();
  initSpeechRecognition(); initAudioRecorder(); initAutoSave(); initKeyboardShortcuts();
  initPWA(); initUI(); initLiveBroadcast(); initVerseAutocomplete(); initChurchBranding();
  initAccessibility(); injectSEOMeta(); createToast('HMG SermonScribe v3 is ready. Click the microphone to begin.', 'info');
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) createToast('Speech recognition is not supported in this browser. Use Chrome or Edge for best results.', 'warn');
  requestNotificationPermission();
}

function initTheme() {
  const saved = localStorage.getItem('hmg-theme') || 'light';
  state.theme = saved;
  document.documentElement.setAttribute('data-theme', saved);
  document.documentElement.style.setProperty('color-scheme', saved === 'dark' ? 'dark' : 'light');
}

async function loadSettings() {
  const lang = await getSettings('language'); if (lang) state.language = lang;
  const speaker = await getSettings('speakerLabel'); if (speaker) state.speakerLabel = speaker;
  const preacher = await getSettings('preacherName'); if (preacher) state.preacherName = preacher;
  const theme = await getSettings('theme'); if (theme) { state.theme = theme; document.documentElement.setAttribute('data-theme', theme); }
  const autoSave = await getSettings('autoSaveInterval'); if (autoSave) state.autoSaveInterval = parseInt(autoSave);
  const branding = await getSettings('churchBranding'); if (branding) state.churchBranding = branding;
  const fontSize = await getSettings('fontSize'); if (fontSize) { state.fontSize = parseInt(fontSize); setFontSize(state.fontSize); }
  const highContrast = await getSettings('highContrast'); if (highContrast) { state.highContrast = highContrast; if (highContrast) document.documentElement.setAttribute('data-theme', 'high-contrast'); }
  const t = await getSettings('translation'); if (t) setTranslation(t);
  if (els.langSelect()) els.langSelect().value = state.language;
  if (els.speakerSelect()) els.speakerSelect().value = state.speakerLabel;
  if (els.preacher()) els.preacher().value = state.preacherName;
}

async function loadSermonList() {
  const all = await loadSermons(200, state.seriesFilter || null);
  state.sermons = all;
  renderSermonList(); renderSeriesList();
  if (!state.currentId && state.sermons.length > 0) await openSermon(state.sermons[0].id);
  else if (!state.currentId) await newSermon();
}

function checkSharedURL() {
  if (window.location.hash.startsWith('#share=')) {
    const shared = parseSharedURL(window.location.hash);
    if (shared) {
      openModal('import-share-modal');
      $('#import-share-title').textContent = shared.t || 'Untitled Sermon';
      $('#import-share-btn').onclick = async () => {
        const id = generateId();
        const sermon = { id, title: shared.t || 'Imported Sermon', date: shared.d || getToday(), preacher: shared.p || '', content: shared.c || '', duration: shared.du || '', series: shared.s || '', tags: [], createdAt: getTimestamp(), bookmarks: [] };
        await saveSermon(sermon); state.sermons.unshift(sermon); state.currentId = id;
        renderSermonList(); renderEditor(); closeModal('import-share-modal');
        createToast('Shared sermon imported successfully.', 'success'); window.location.hash = '';
      };
    }
  }
}

function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); state.deferredInstall = e; });
}

function initLiveBroadcast() { state.liveBroadcast = new LiveBroadcast(); }

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  state.recognition = new SpeechRecognition();
  state.recognition.continuous = true; state.recognition.interimResults = true; state.recognition.lang = state.language;
  state.recognition.onstart = () => { state.isRecording = true; state.isPaused = false; updateRecordUI(); vibrate(50); };
  state.recognition.onresult = (event) => {
    let interim = '', final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) final += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    if (final) insertTranscript(final);
    state.interimText = interim; updateRecordUI(); broadcastTranscript();
  };
  state.recognition.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    if (e.error === 'not-allowed') { createToast('Microphone access denied. Please allow microphone permission.', 'error'); stopRecording(); return; }
    if (state.isRecording && !state.isPaused) { try { state.recognition.start(); } catch (_) {} }
  };
  state.recognition.onend = () => {
    if (state.isRecording && !state.isPaused) { try { state.recognition.start(); } catch (_) {} }
    else if (!state.isRecording) updateRecordUI();
  };
}

function initAudioRecorder() { /* MediaRecorder set up in startAudioRecording */ }

async function startAudioRecording() {
  if (!navigator.mediaDevices) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = []; state.mediaRecorder = new MediaRecorder(stream);
    state.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) state.audioChunks.push(e.data); };
    state.mediaRecorder.onstop = () => {
      const blob = new Blob(state.audioChunks, { type: 'audio/webm' }); state.audioUrl = URL.createObjectURL(blob);
      stream.getTracks().forEach(t => t.stop()); renderAudioAttachment();
    };
    state.mediaRecorder.start(1000);
  } catch (e) { console.log('Audio recorder not available:', e.message); }
}

function stopAudioRecording() { if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') state.mediaRecorder.stop(); }

function broadcastTranscript() {
  if (!state.liveBroadcast || !state.isRecording) return;
  const text = stripHtml(els.editor()?.innerHTML || '');
  state.liveBroadcast.broadcastTranscript(text, state.elapsed);
}

function toggleRecording() {
  if (!state.recognition) { createToast('Speech recognition is not available in this browser. Use Chrome/Edge/Samsung Internet.', 'error'); return; }
  if (state.isRecording) stopRecording(); else startRecording();
}

function startRecording() {
  if (!state.currentId) newSermon();
  state.isRecording = true; state.isPaused = false; state.recordStart = Date.now() - (state.elapsed * 1000);
  state.recognition.lang = state.language;
  try { state.recognition.start(); } catch (e) { createToast('Could not start recording: ' + e.message, 'error'); return; }
  startTimer(); startAudioRecording(); notify('Recording Started', { body: 'SermonScribe is listening and transcribing.' });
  requestWakeLock().then(lock => state.wakeLock = lock);
  lockOrientation('portrait').catch(() => {});
  vibrate([100, 50, 100]);
  createToast('Recording started. Speak clearly.', 'success');
}

function pauseRecording() {
  state.isPaused = true; try { state.recognition.stop(); } catch (_) {}
  stopTimer(); stopAudioRecording(); updateRecordUI(); vibrate(50);
  notify('Recording Paused', { body: 'Tap resume to continue transcribing.' });
  createToast('Recording paused.', 'warn');
  if (state.wakeLock) { releaseWakeLock(state.wakeLock); state.wakeLock = null; }
}

function resumeRecording() {
  state.isPaused = false; state.recognition.lang = state.language;
  try { state.recognition.start(); } catch (_) {}
  startTimer(); startAudioRecording(); updateRecordUI(); vibrate(50);
  requestWakeLock().then(lock => state.wakeLock = lock);
  createToast('Recording resumed.', 'success');
}

function stopRecording() {
  state.isRecording = false; state.isPaused = false;
  try { state.recognition.stop(); } catch (_) {}
  stopTimer(); stopAudioRecording(); state.elapsed = 0; state.interimText = '';
  updateRecordUI(); persistCurrent(); stopSpeech();
  if (state.wakeLock) { releaseWakeLock(state.wakeLock); state.wakeLock = null; }
  lockOrientation('any').catch(() => {});
  notify('Recording Stopped', { body: 'Sermon saved to your library.' });
  vibrate([100, 50, 100, 50, 100]);
  createToast('Recording stopped. Sermon saved.', 'success');
}

function insertTranscript(text) {
  const editor = els.editor(); if (!editor) return;
  const prefix = state.speakerLabel ? ` <strong>${state.speakerLabel}:</strong> ` : '';
  const sentence = text.charAt(0).toUpperCase() + text.slice(1);
  const html = `<p>${prefix}${sentence.trim()}</p>`;
  if (document.getSelection && document.getSelection().rangeCount > 0) document.execCommand('insertHTML', false, html);
  else editor.innerHTML += html;
  editor.scrollTop = editor.scrollHeight; updateStats(); debouncedSave(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes();
}

let timerInterval = null;
function startTimer() { if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(() => { if (!state.isPaused) { state.elapsed = Math.floor((Date.now() - state.recordStart) / 1000); updateRecordUI(); } }, 1000); }
function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

function updateRecordUI() {
  const hud = els.recordHud(), btn = els.recordBtn(), pauseBtn = els.pauseBtn();
  if (!hud || !btn) return;
  if (state.isRecording) {
    hud.style.display = 'flex'; els.recordTime().textContent = formatTime(state.elapsed);
    els.recordStatus().textContent = state.isPaused ? 'Paused' : (state.interimText || 'Listening...');
    btn.innerHTML = '🔴 Stop'; btn.classList.add('btn-danger'); btn.classList.remove('btn-primary');
    if (pauseBtn) { pauseBtn.style.display = 'inline-flex'; pauseBtn.textContent = state.isPaused ? '▶️ Resume' : '⏸ Pause'; }
  } else {
    hud.style.display = 'none'; btn.innerHTML = '🎙️ Start Recording'; btn.classList.remove('btn-danger'); btn.classList.add('btn-primary');
    if (pauseBtn) pauseBtn.style.display = 'none';
  }
}

function addBookmark() {
  if (!state.isRecording && state.elapsed === 0) { createToast('Start recording to add bookmarks.', 'warn'); return; }
  const time = state.elapsed; const text = prompt('Bookmark note (optional):') || 'Important Moment';
  const bm = { id: generateId(), time, note: text, createdAt: getTimestamp() };
  state.bookmarks.push(bm); renderBookmarks();
  const editor = els.editor();
  if (editor) { document.execCommand('insertHTML', false, `<p><strong>🔖 [${formatTime(time)}]</strong> ${text}</p>`); debouncedSave(); }
  createToast(`Bookmark added at ${formatTime(time)}`, 'success'); vibrate(50);
}

function renderBookmarks() {
  const container = els.bookmarkPanel(); if (!container) return;
  if (!state.bookmarks || !state.bookmarks.length) { container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">No bookmarks yet. Tap 🔖 during recording.</p>'; return; }
  container.innerHTML = state.bookmarks.map(bm => `<div class="bookmark-item" style="padding:.4rem 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="seekBookmark(${bm.time})"><span style="font-variant-numeric:tabular-nums;color:var(--accent);font-weight:700">${formatTime(bm.time)}</span> <span style="font-size:.85rem">${bm.note}</span></div>`).join('');
}

window.seekBookmark = (time) => { state.elapsed = time; state.recordStart = Date.now() - (time * 1000); createToast(`Seeked to ${formatTime(time)}.`, 'info'); };

function initUI() {
  els.editor()?.addEventListener('input', () => { updateStats(); debouncedSave(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes(); });
  els.title()?.addEventListener('input', debounce(() => { persistCurrent(); renderSermonList(); }, 500));
  els.preacher()?.addEventListener('input', debounce(() => persistCurrent(), 500));
  els.series()?.addEventListener('change', debounce(() => { persistCurrent(); renderSermonList(); }, 500));
  els.langSelect()?.addEventListener('change', (e) => { state.language = e.target.value; saveSettings('language', state.language); });
  els.speakerSelect()?.addEventListener('change', (e) => { state.speakerLabel = e.target.value; saveSettings('speakerLabel', state.speakerLabel); });
  els.themeToggle()?.addEventListener('click', toggleTheme);
  $('#menu-toggle')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));
  $('#search-input')?.addEventListener('input', debounce((e) => { state.searchQuery = e.target.value; renderSermonList(); }, 300));
  $('#font-size-slider')?.addEventListener('input', (e) => { state.fontSize = parseInt(e.target.value); setFontSize(state.fontSize); saveSettings('fontSize', state.fontSize); });
  $('#high-contrast-toggle')?.addEventListener('change', (e) => { state.highContrast = e.target.checked; document.documentElement.setAttribute('data-theme', state.highContrast ? 'high-contrast' : state.theme); saveSettings('highContrast', state.highContrast); });
  $('#translation-select')?.addEventListener('change', (e) => { setTranslation(e.target.value); saveSettings('translation', e.target.value); detectBibleReferences(); });
  initAudioUpload(); initImportHandlers();
}

function toggleTheme() {
  const next = state.theme === 'light' ? 'dark' : 'light';
  state.theme = next; document.documentElement.setAttribute('data-theme', next); document.documentElement.style.setProperty('color-scheme', next === 'dark' ? 'dark' : 'light');
  localStorage.setItem('hmg-theme', next); saveSettings('theme', next);
}

function initAccessibility() {
  const size = state.fontSize || 16; setFontSize(size);
  if (state.highContrast) document.documentElement.setAttribute('data-theme', 'high-contrast');
}

async function newSermon() {
  if (state.isRecording) stopRecording();
  const id = generateId();
  const sermon = { id, title: 'Untitled Sermon', date: getToday(), preacher: state.preacherName || '', series: els.series()?.value || '', content: '<h2>Introduction</h2><p></p><h2>Main Points</h2><p></p><h2>Conclusion</h2><p></p>', duration: '0:00', tags: [], createdAt: getTimestamp(), bookmarks: [], verses: [] };
  await saveSermon(sermon); state.sermons.unshift(sermon); state.currentId = id; state.elapsed = 0; state.audioUrl = null; state.bookmarks = []; $('#audio-attachment').innerHTML = '';
  renderSermonList(); renderEditor(); renderBookmarks(); updateStats(); createToast('New sermon created.', 'info');
}

async function openSermon(id) {
  if (state.isRecording) { const ok = confirm('You are currently recording. Stop and switch sermons?'); if (!ok) return; }
  const sermon = await getSermon(id); if (!sermon) { createToast('Sermon not found.', 'error'); return; }
  state.currentId = id; state.elapsed = parseDuration(sermon.duration || '0:00'); state.audioUrl = null; state.bookmarks = sermon.bookmarks || []; $('#audio-attachment').innerHTML = '';
  renderSermonList(); renderEditor(); renderBookmarks(); updateStats(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes();
}

async function deleteCurrentSermon() {
  if (!state.currentId) return; const ok = confirm('Delete this sermon permanently? This cannot be undone.'); if (!ok) return;
  await deleteSermon(state.currentId); state.sermons = state.sermons.filter(s => s.id !== state.currentId); state.currentId = null; state.elapsed = 0;
  if (state.sermons.length > 0) await openSermon(state.sermons[0].id); else await newSermon();
  createToast('Sermon deleted.', 'info');
}

function parseDuration(dur) { const parts = (dur || '0:00').split(':'); return (parseInt(parts[0] || 0) * 60) + parseInt(parts[1] || 0); }

function renderEditor() {
  const s = state.sermons.find(x => x.id === state.currentId); if (!s) return;
  els.title().value = s.title || 'Untitled Sermon'; els.preacher().value = s.preacher || '';
  els.series().value = s.series || ''; els.editor().innerHTML = s.content || '';
  updateStats(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes();
}

function renderSermonList() {
  const container = els.sermonList(); if (!container) return;
  let sermons = state.sermons;
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    sermons = sermons.filter(s => (s.title || '').toLowerCase().includes(q) || (s.content || '').toLowerCase().includes(q) || (s.preacher || '').toLowerCase().includes(q) || (s.series || '').toLowerCase().includes(q));
  }
  if (sermons.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;padding:.5rem">No sermons found.</p>'; return; }
  container.innerHTML = sermons.map(s => `<div class="sermon-item ${s.id === state.currentId ? 'active' : ''}" onclick="openSermonInline('${s.id}')"><div><div class="title">${escapeHtml(s.title || 'Untitled')}</div><div class="meta"><span>📅 ${s.date || 'No date'}</span><span>⏱ ${s.duration || '0:00'}</span>${s.series ? `<span>📂 ${s.series}</span>` : ''}</div></div><button class="btn-ghost btn-sm" onclick="event.stopPropagation();deleteSermonInline('${s.id}')" aria-label="Delete sermon">🗑️</button></div>`).join('');
}

async function renderSeriesList() {
  const container = els.seriesList(); if (!container) return;
  const series = await getAllSeries(); const opts = ['No Series'];
  for (const s of series) opts.push(escapeHtml(s.name));
  container.innerHTML = opts.map(o => `<option value="${o === 'No Series' ? '' : o}">${o}</option>`).join('');
  const current = state.sermons.find(s => s.id === state.currentId); if (current && current.series) container.value = current.series;
}

window.openSermonInline = (id) => openSermon(id);
window.deleteSermonInline = async (id) => { if (state.currentId === id) { await deleteCurrentSermon(); return; } const ok = confirm('Delete this sermon?'); if (!ok) return; await deleteSermon(id); state.sermons = state.sermons.filter(s => s.id !== id); renderSermonList(); };

function updateStats() {
  const text = stripHtml(els.editor()?.innerHTML || '');
  const wc = wordCount(text); const rt = estimateReadTime(text); const sc = sentenceCount(text); const pc = paragraphCount(text); const fk = fleschKincaid(text);
  if (els.wordCount()) els.wordCount().textContent = `${wc} words`;
  if (els.readTime()) els.readTime().textContent = `~${rt} min read`;
  if (els.sentenceCount()) els.sentenceCount().textContent = `${sc} sentences`;
  if (els.paragraphCount()) els.paragraphCount().textContent = `${pc} paragraphs`;
  if (els.gradeLevel()) els.gradeLevel().textContent = `Grade ${fk.grade}`;
}

window.formatDoc = (cmd, val = null) => { document.execCommand(cmd, false, val); els.editor().focus(); };
window.insertTemplate = (type) => {
  const templates = {
    expository: `<h2>Text:</h2><p><em>Context and background...</em></p><h3>Main Point 1</h3><p></p><h3>Main Point 2</h3><p></p><h3>Main Point 3</h3><p></p><h2>Application</h2><p></p><h2>Conclusion</h2><p></p>`,
    topical: `<h2>Topic:</h2><p><em>Definition and relevance...</em></p><h3>Point 1</h3><p></p><h3>Point 2</h3><p></p><h3>Point 3</h3><p></p><h2>Conclusion</h2><p></p>`,
    testimony: `<h2>Testimony Title</h2><p><em>Background of the situation...</em></p><h3>The Challenge</h3><p></p><h3>The Turning Point</h3><p></p><h3>The Victory</h3><p></p><h2>Lesson & Encouragement</h2><p></p>`,
    fill_blank: `<h2>Fill-in-the-Blank Sermon Notes</h2><p><span class="fill-blank" onclick="this.textContent=prompt('Your answer:')||'____'">____</span></p>`
  };
  const html = templates[type] || templates.expository;
  if (document.getSelection && document.getSelection().rangeCount > 0) document.execCommand('insertHTML', false, html); else els.editor().innerHTML += html;
};

function detectBibleReferences() {
  const text = stripHtml(els.editor()?.innerHTML || ''); const matches = detectReferences(text); const container = els.biblePanel();
  if (!container) return;
  if (matches.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">No scripture references detected yet.</p>'; return; }
  const unique = [...new Map(matches.map(m => [m.ref, m])).values()];
  container.innerHTML = unique.slice(0, 15).map(m => `<div class="verse-card" onclick="insertVerse('${m.ref}')"><div class="verse-ref">${m.ref}</div><div class="verse-text">${m.text}</div></div>`).join('');
}

window.insertVerse = (ref) => {
  const v = getAllVerses().find(x => x.ref === ref); if (!v) return;
  const html = `<blockquote><p><strong>${v.ref}</strong> — ${v.text}</p></blockquote>`;
  document.execCommand('insertHTML', false, html); els.editor().focus(); debouncedSave(); detectBibleReferences();
};

window.setBibleTab = (tab) => {
  state.activeTab = tab; if (tab === 'detected') detectBibleReferences(); else if (tab === 'common') renderCommonVerses(); else if (tab === 'search') { const q = prompt('Search verse (e.g. John 3:16, love, grace):'); if (q) searchVerses(q); }
  $$('.bible-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
};

function renderCommonVerses() { const container = els.biblePanel(); if (!container) return; const all = getAllVerses().slice(0, 25); container.innerHTML = all.map(m => `<div class="verse-card" onclick="insertVerse('${m.ref}')"><div class="verse-ref">${m.ref}</div><div class="verse-text">${m.text}</div></div>`).join(''); }
function searchVerses(query) { const q = query.toLowerCase(); const matches = getAllVerses().filter(v => v.ref.toLowerCase().includes(q) || v.text.toLowerCase().includes(q)); const container = els.biblePanel(); if (!container) return; container.innerHTML = matches.slice(0, 15).map(m => `<div class="verse-card" onclick="insertVerse('${m.ref}')"><div class="verse-ref">${m.ref}</div><div class="verse-text">${m.text}</div></div>`).join(''); }

function updateKeywords() { const text = stripHtml(els.editor()?.innerHTML || ''); const keywords = getKeywords(text); const container = els.keywordPanel(); if (!container) return; if (keywords.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Start typing to detect themes.</p>'; return; } container.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:.4rem">${keywords.map(k => `<span class="keyword-chip">${k}</span>`).join('')}</div>`; }
function updatePrayers() { const text = stripHtml(els.editor()?.innerHTML || ''); const prayers = extractPrayerRequests(text); const container = els.prayerPanel(); if (!container) return; if (prayers.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Detected prayer requests will appear here.</p>'; return; } container.innerHTML = prayers.map(p => `<div class="prayer-card"><p style="margin:0;font-size:.85rem">🙏 ${p}</p></div>`).join(''); }
function updateQuotes() { const text = stripHtml(els.editor()?.innerHTML || ''); const quotes = extractTopSentences(text, 6); const container = els.quotePanel(); if (!container) return; if (quotes.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem">Shareable quotes will appear as you write.</p>'; return; } container.innerHTML = quotes.map((q, i) => `<div class="quote-card"><p style="margin:0;font-size:.85rem">${q}</p><button class="btn-ghost btn-sm" onclick="shareQuote('${escapeQuotes(q)}',${i})" style="margin-top:.4rem">💬 Share</button></div>`).join(''); }
window.shareQuote = (quote, i) => { const msg = encodeURIComponent(`💬 *Quote from today's sermon:*\n\n"${quote}"\n\n_Shared via HMG SermonScribe v3_`); window.open(`https://wa.me/?text=${msg}`, '_blank'); };
function escapeQuotes(s) { return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"'); }

window.openExport = () => openDrawer('export-drawer');
window.closeExport = () => closeDrawer('export-drawer');
window.doExport = (format) => {
  const s = getCurrentSermon(); if (!s) return;
  switch (format) {
    case 'txt': exportTXT(s); break; case 'md': exportMD(s); break; case 'html': exportHTML(s); break;
    case 'docx': exportDOCX(s); break; case 'print': exportPrint(s); break; case 'whatsapp': shareWhatsApp(s); break;
    case 'srt': exportSRT(s); break; case 'devotional': exportReadingPlan(s); break; case 'json': exportJSON(s); break;
    case 'rss': generateRSS(state.sermons); break; case 'native': shareWebNative(s); break;
    default: createToast('Unknown format', 'error');
  }
  closeDrawer('export-drawer'); createToast(`Exported as ${format.toUpperCase()}`, 'success');
};

window.openShare = () => {
  const s = getCurrentSermon(); if (!s) return; const url = generateShareableURL(s);
  if (!url) { createToast('Sermon too large to share via URL. Export as file instead.', 'warn'); return; }
  openModal('share-modal'); $('#share-url').value = url;
  generateQRDataURL(url).then(dataUrl => { $('#share-qr').innerHTML = `<img src="${dataUrl}" alt="QR Code" style="max-width:256px;border-radius:8px">`; }).catch(() => { $('#share-qr').innerHTML = '<p>QR generation unavailable.</p>'; });
};
window.copyShareURL = () => { const el = $('#share-url'); el.select(); navigator.clipboard.writeText(el.value).then(() => createToast('Link copied to clipboard!', 'success')); };

window.openPresent = () => { document.body.classList.add('present-mode'); state.presentMode = true; lockOrientation('landscape').catch(() => {}); createToast('Presenter mode active. Press Escape to exit.', 'info'); };
window.exitPresent = () => { document.body.classList.remove('present-mode'); state.presentMode = false; lockOrientation('any').catch(() => {}); };

window.openSettings = () => openModal('settings-modal');
window.closeSettings = () => closeModal('settings-modal');
window.openBackup = () => openModal('backup-modal');
window.closeBackup = () => closeModal('backup-modal');
window.doBackup = async () => { const data = await exportAllSermons(); downloadBlob('hmg-sermonscribe-v3-backup.json', 'application/json', data); closeModal('backup-modal'); createToast('Backup downloaded.', 'success'); };
window.doRestore = async () => {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return; const text = await file.text();
    try { const count = await importAllSermons(text); await loadSermonList(); closeModal('backup-modal'); createToast(`Restored ${count} sermons and data.`, 'success'); } catch (err) { createToast('Restore failed: ' + err.message, 'error'); }
  }; input.click();
};

window.openFindReplace = () => openModal('find-replace-modal');
window.closeFindReplace = () => closeModal('find-replace-modal');
window.doFindReplace = () => {
  const find = $('#fr-find').value; const replace = $('#fr-replace').value; const useRegex = $('#fr-regex').checked; if (!find) return;
  const editor = els.editor(); let html = editor.innerHTML;
  const flags = useRegex ? 'gi' : 'gi';
  const re = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  html = html.replace(re, replace); editor.innerHTML = html; closeModal('find-replace-modal'); createToast('Find and replace completed.', 'success');
};
window.openFillerRemoval = () => { const editor = els.editor(); if (!editor) return; const text = stripHtml(editor.innerHTML); const cleaned = stripFillerWords(text); editor.innerHTML = cleaned.replace(/\n/g, '<p></p>'); createToast('Filler words removed (uh, um, like, you know).', 'success'); };

window.openLiveCaption = () => { if (!state.liveBroadcast) return; const url = state.liveBroadcast.getShareURL(); window.open(url, '_blank'); createToast('Live caption page opened. Share the URL or QR with your congregation.', 'success'); };
window.generateLiveQR = () => { if (!state.liveBroadcast) return; const url = state.liveBroadcast.getShareURL(); generateQRDataURL(url).then(dataUrl => { $('#live-qr-modal-body').innerHTML = `<img src="${dataUrl}" alt="QR Code" style="max-width:256px;border-radius:8px"><p>Congregation scans this to see live captions. Refresh QR every few minutes.</p>`; openModal('live-qr-modal'); }).catch(() => createToast('QR generation failed.', 'error')); };

window.openOutlineGenerator = () => {
  const s = getCurrentSermon(); if (!s) return; const text = stripHtml(s.content);
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 30);
  const headings = []; const paragraphs = text.split('\n').filter(p => p.trim().length > 50);
  for (let i = 0; i < Math.min(5, paragraphs.length); i++) headings.push(paragraphs[i].slice(0, 80));
  const outline = `# Sermon Outline: ${s.title}\n\n## Introduction\n${headings[0] || '[Intro summary]'}\n\n## Main Points\n${headings.slice(1, 4).map((h, i) => `${i + 1}. ${h}`).join('\n') || '[Main points]'}\n\n## Conclusion\n${headings[4] || '[Conclusion summary]'}\n\n## Key Scriptures\n${(s.verses || []).map(v => `- ${v.ref}`).join('\n') || '[Scriptures]'}\n`;
  $('#outline-preview').value = outline; openModal('outline-modal');
};
window.downloadOutline = () => { const text = $('#outline-preview').value; const s = getCurrentSermon(); downloadBlob(`${slugify(s.title)}-outline.md`, 'text/markdown', text); closeModal('outline-modal'); createToast('Outline downloaded.', 'success'); };

window.openDiscussionGenerator = () => {
  const s = getCurrentSermon(); if (!s) return;
  const questions = generateDiscussionQuestions(s.tags || [], s.verses || [], s.title);
  const text = `# Discussion Questions: ${s.title}\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`;
  $('#discussion-preview').value = text; openModal('discussion-modal');
};
window.downloadDiscussion = () => { const text = $('#discussion-preview').value; const s = getCurrentSermon(); downloadBlob(`${slugify(s.title)}-discussion.md`, 'text/markdown', text); closeModal('discussion-modal'); createToast('Discussion guide downloaded.', 'success'); };

window.openFlashcards = () => {
  const s = getCurrentSermon(); if (!s) return;
  const refs = (s.verses || []).length ? (s.verses || []) : getAllVerses().slice(0, 10);
  const container = $('#flashcard-container'); if (!container) return;
  container.innerHTML = refs.map((v, i) => `<div class="verse-card" style="cursor:pointer" onclick="revealFlashcard(${i})"><div class="verse-ref">${v.ref}</div><div id="fc-text-${i}" style="filter:blur(4px);user-select:none">${v.text}</div></div>`).join('');
  openModal('flashcard-modal');
};
window.revealFlashcard = (i) => { const el = document.getElementById(`fc-text-${i}`); if (el) { el.style.filter = 'none'; el.style.userSelect = 'auto'; } };
window.saveAllFlashcards = async () => {
  const s = getCurrentSermon(); if (!s) return; const refs = (s.verses || []).length ? (s.verses || []) : getAllVerses().slice(0, 10);
  for (const v of refs) await saveFlashcard({ id: generateId(), ref: v.ref, text: v.text, sermonId: s.id, createdAt: getTimestamp() });
  createToast('Flashcards saved to library.', 'success'); closeModal('flashcard-modal');
};

window.openChurchBranding = () => openModal('branding-modal');
window.saveChurchBranding = () => {
  const name = $('#cb-name').value; const color = $('#cb-color').value; const logo = $('#cb-logo').value; const phone = $('#cb-phone').value;
  state.churchBranding = { name, color, logo, phone, updatedAt: getTimestamp() }; saveSettings('churchBranding', state.churchBranding); applyChurchBranding(); closeModal('branding-modal'); createToast('Church branding saved.', 'success');
};
function applyChurchBranding() { if (!state.churchBranding) return; const b = state.churchBranding; if ($('#brand-title') && b.name) $('#brand-title').textContent = b.name; if (b.color) { document.documentElement.style.setProperty('--accent', b.color); document.documentElement.style.setProperty('--accent-glow', b.color + '25'); } }
function initChurchBranding() { applyChurchBranding(); }

window.openAnalyticsPage = () => window.open('analytics.html', '_blank');
window.openDevotionsPage = () => window.open('devotions.html', '_blank');
window.openNotesPage = () => window.open('notes.html', '_blank');
window.openBulletinPage = () => window.open('bulletin.html', '_blank');
window.openPrayerWallPage = () => window.open('prayer-wall.html', '_blank');

window.openSermonTimer = () => openModal('timer-modal');
window.closeSermonTimer = () => closeModal('timer-modal');
window.startSermonTimer = () => {
  const mins = parseInt($('#timer-minutes').value || 30); let remaining = mins * 60;
  const el = $('#timer-display');
  state.sermonTimerInterval = setInterval(() => {
    remaining--; if (remaining <= 0) { clearInterval(state.sermonTimerInterval); vibrate([200, 100, 200]); createToast('Sermon time is up!', 'warn'); notify('Sermon Timer', { body: 'Your allotted sermon time has ended.' }); }
    const m = Math.floor(remaining / 60).toString().padStart(2, '0'); const s = (remaining % 60).toString().padStart(2, '0');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);
  createToast('Sermon timer started.', 'success');
};
window.stopSermonTimer = () => { if (state.sermonTimerInterval) { clearInterval(state.sermonTimerInterval); state.sermonTimerInterval = null; createToast('Sermon timer stopped.', 'info'); } };

window.openWordCloud = () => { openModal('word-cloud-modal'); setTimeout(() => renderWordCloud('word-cloud-canvas'), 300); };
function renderWordCloud(id) {
  const text = stripHtml(els.editor()?.innerHTML || ''); const themes = getKeywords(text);
  const canvas = document.getElementById(id); if (!canvas) return;
  const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, rect.width, rect.height);
  const entries = Object.entries(themes).map(([k, v]) => [k, 1]).sort((a, b) => b[1] - a[1]).slice(0, 30);
  if (!entries.length) { ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.fillText('Write more content to generate word cloud', 10, 20); return; }
  const max = entries[0][1]; let x = 10, y = 30;
  entries.forEach(([word, count], i) => { const size = 14 + (count / max) * 28; ctx.font = `bold ${size}px system-ui`; ctx.fillStyle = ['#d97706', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#0f172a'][i % 6]; const w = ctx.measureText(word).width; if (x + w > rect.width - 10) { x = 10; y += size + 10; } ctx.fillText(word, x, y); x += w + 16; });
}

window.speakText = () => { const text = stripHtml(els.editor()?.innerHTML || '').slice(0, 500); if (!text) return; textToSpeech(text, state.language); createToast('Reading sermon aloud...', 'info'); };
window.stopSpeak = () => stopSpeech();

function initAudioUpload() {
  const zone = $('#audio-upload-zone'); if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); const files = e.dataTransfer.files; if (files.length) handleAudioFile(files[0]); });
  zone.addEventListener('click', () => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'audio/*'; input.onchange = e => { if (e.target.files.length) handleAudioFile(e.target.files[0]); }; input.click(); });
}

function handleAudioFile(file) {
  const audio = new Audio(); audio.src = URL.createObjectURL(file);
  audio.onloadedmetadata = () => {
    createToast(`Audio loaded: ${file.name} (${Math.round(audio.duration)}s). Attach as sermon backup.`, 'success');
    state.audioUrl = audio.src; renderAudioAttachment();
  };
  audio.onerror = () => createToast('Could not load audio file.', 'error');
}

function initImportHandlers() {
  $('#import-txt-btn')?.addEventListener('click', () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.txt,.md'; input.onchange = async (e) => { const file = e.target.files[0]; if (!file) return; const text = await fileToText(file); const html = file.name.endsWith('.md') ? parseMarkdownToHtml(text) : text.replace(/\n/g, '<p></p>'); els.editor().innerHTML = html; createToast(`${file.name} imported.`, 'success'); }; input.click(); });
}

function initVerseAutocomplete() {
  const editor = els.editor(); if (!editor) return;
  editor.addEventListener('input', () => {
    const sel = window.getSelection(); if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0); const pre = range.startContainer.textContent?.slice(0, range.startOffset) || '';
    const match = pre.match(/((?:1\s|2\s|3\s)?[A-Za-z]+\s\d+(:\d+)?)$/);
    if (match) showVerseAutocomplete(match[1], range); else hideVerseAutocomplete();
  });
}

function showVerseAutocomplete(query, range) {
  const matches = autocompleteVerse(query); if (!matches.length) return; const box = els.verseAutocomplete(); if (!box) return;
  box.style.display = 'block'; box.innerHTML = matches.map(m => `<div class="autocomplete-item" onclick="insertAutocompleteVerse('${m.ref}')">${m.ref}</div>`).join('');
  const rect = range.getBoundingClientRect(); box.style.top = (rect.bottom + window.scrollY + 4) + 'px'; box.style.left = rect.left + 'px';
}

function hideVerseAutocomplete() { const box = els.verseAutocomplete(); if (box) box.style.display = 'none'; }
window.insertAutocompleteVerse = (ref) => { insertVerse(ref); hideVerseAutocomplete(); };

function getCurrentSermon() { return state.sermons.find(s => s.id === state.currentId) || null; }
async function persistCurrent() {
  const s = getCurrentSermon(); if (!s) return;
  s.title = els.title()?.value || s.title; s.preacher = els.preacher()?.value || s.preacher; s.series = els.series()?.value || s.series;
  s.content = els.editor()?.innerHTML || s.content; s.duration = formatTime(state.elapsed); s.tags = getKeywords(stripHtml(s.content)); s.verses = detectReferences(s.content); s.bookmarks = state.bookmarks;
  await saveSermon(s); state.lastSaved = new Date(); if (els.lastSaved()) els.lastSaved().textContent = 'Saved just now';
}
const debouncedSave = debounce(() => persistCurrent(), 800);

function initAutoSave() { setInterval(() => { if (state.currentId && !state.isPaused) persistCurrent(); }, state.autoSaveInterval * 1000); }

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.presentMode) { exitPresent(); e.preventDefault(); }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's': e.preventDefault(); persistCurrent(); createToast('Saved manually.', 'success'); break;
        case ' ': e.preventDefault(); toggleRecording(); break;
        case 'n': e.preventDefault(); newSermon(); break;
        case 'p': e.preventDefault(); openPresent(); break;
        case 'f': e.preventDefault(); openFindReplace(); break;
        case 'b': e.preventDefault(); addBookmark(); break;
        case 'k': e.preventDefault(); openSermonTimer(); break;
      }
    }
  });
}

function renderAudioAttachment() { const container = $('#audio-attachment'); if (!container || !state.audioUrl) return; container.innerHTML = `<div class="card-body compact" style="display:flex;align-items:center;gap:.5rem"><audio controls src="${state.audioUrl}" style="flex:1"></audio><a href="${state.audioUrl}" download class="btn btn-sm">Download</a></div>`; }

function injectSEOMeta() {
  const title = document.title; const url = window.location.href; const desc = 'HMG SermonScribe v3 — Real-time sermon transcription, offline-first notes, live congregation captions, Bible intelligence, devotions, and church analytics. Zero API cost. Built by HMG Gospel.';
  const add = (p, c) => { let m = document.querySelector(`meta[property="${p}"],meta[name="${p}"]`); if (!m) { m = document.createElement('meta'); m.setAttribute(m.hasAttribute('property') ? 'property' : 'name', p); document.head.appendChild(m); } m.setAttribute('content', c); };
  add('description', desc); add('og:title', title); add('og:description', desc); add('og:url', url); add('og:type', 'website'); add('og:image', './assets/images/social-preview.jpg'); add('twitter:card', 'summary_large_image'); add('twitter:title', title); add('twitter:description', desc); add('twitter:image', './assets/images/social-preview.jpg');
  let ld = document.querySelector('script[type="application/ld+json"]'); if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; document.head.appendChild(ld); }
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'HMG SermonScribe v3', url: url, applicationCategory: 'ProductivityApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' }, author: { '@type': 'Organization', name: 'HMG Gospel', url: 'https://hmgconcepts.pages.dev' } });
}

function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

window.closeModal = closeModal; window.openModal = openModal; window.closeDrawer = closeDrawer; window.openDrawer = openDrawer;
window.togglePauseRecording = () => { if (state.isPaused) resumeRecording(); else pauseRecording(); };
window.saveSetting = (key, value) => { saveSettings(key, value); createToast(`${capitalize(key)} updated`, 'success'); };
window.addBookmark = addBookmark; window.openLiveCaption = openLiveCaption; window.generateLiveQR = generateLiveQR;
window.openOutlineGenerator = openOutlineGenerator; window.openDiscussionGenerator = openDiscussionGenerator;
window.openFlashcards = openFlashcards; window.openChurchBranding = openChurchBranding; window.openAnalyticsPage = openAnalyticsPage;
window.openFillerRemoval = openFillerRemoval; window.openFindReplace = openFindReplace; window.doFindReplace = doFindReplace;
window.saveChurchBranding = saveChurchBranding; window.saveAllFlashcards = saveAllFlashcards; window.revealFlashcard = revealFlashcard;
window.downloadOutline = downloadOutline; window.downloadDiscussion = downloadDiscussion; window.insertAutocompleteVerse = insertAutocompleteVerse;
window.insertVerse = insertVerse; window.setBibleTab = setBibleTab; window.openExport = openExport; window.closeExport = closeExport;
window.doExport = doExport; window.openShare = openShare; window.copyShareURL = copyShareURL; window.openPresent = openPresent;
window.exitPresent = exitPresent; window.openSettings = openSettings; window.closeSettings = closeSettings; window.openBackup = openBackup;
window.closeBackup = closeBackup; window.doBackup = doBackup; window.doRestore = doRestore; window.newSermon = newSermon;
window.deleteCurrentSermon = deleteCurrentSermon; window.openSermonInline = openSermonInline; window.deleteSermonInline = deleteSermonInline;
window.formatDoc = formatDoc; window.insertTemplate = insertTemplate; window.shareQuote = shareQuote;
window.seekBookmark = seekBookmark; window.speakText = speakText; window.stopSpeak = stopSpeak;
window.openDevotionsPage = openDevotionsPage; window.openNotesPage = openNotesPage; window.openBulletinPage = openBulletinPage;
window.openPrayerWallPage = openPrayerWallPage; window.openSermonTimer = openSermonTimer; window.startSermonTimer = startSermonTimer;
window.stopSermonTimer = stopSermonTimer; window.openWordCloud = openWordCloud;

document.addEventListener('DOMContentLoaded', init);
