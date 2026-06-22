/* ============================================
 HMG SermonScribe v4 - Core Application Engine
 BUG-FIXED + ENHANCED
 Zero API cost. Offline-first. Enterprise-grade.
 ============================================ */

import {
  generateId, formatTime, getToday, getTimestamp, debounce, createToast, openModal, closeModal,
  openDrawer, closeDrawer, getKeywords, stripHtml, wordCount, estimateReadTime, capitalize,
  stripFillerWords, extractTopSentences, extractPrayerRequests, generateDiscussionQuestions,
  requestWakeLock, releaseWakeLock, vibrate, requestNotificationPermission, notify,
  lockOrientation, textToSpeech, stopSpeech, fileToText, parseMarkdownToHtml, setFontSize,
  fleschKincaid, sentenceCount, paragraphCount, shareViaNative, downloadBlob, escapeHtml, slugify, srtTime
} from './utils.js';

import { generateSocialKit, generateBlogDraft, generateNewsletter } from './repurposer.js';
import { generateAdvancedOutline } from './outline-generator.js';
import { generateAdvancedDiscussionGuide } from './discussion-generator.js';
import { detectReferences, getAllVerses, getVersesByBook, autocompleteVerse, getBooks, getTranslation, setTranslation, fetchVerse, getTranslations } from './bible.js';

import {
  saveSermon, loadSermons, getSermon, deleteSermon, saveSettings, getSettings,
  exportAllSermons, importAllSermons, saveFlashcard, loadFlashcards, deleteFlashcard,
  saveSeries, deleteSeries, getAllSeries, searchSermons, loadDevotions, saveDevotion,
  savePrayer, saveBulletin, saveNote, loadNotesBySermon
} from './storage.js';

import {
  exportTXT, exportMD, exportHTML, exportDOCX, exportPrint, shareWhatsApp, shareWebNative,
  generateShareableURL, parseSharedURL, generateQRDataURL, exportSRT, exportReadingPlan,
  generateRSS, exportJSON
} from './export.js';

import { LiveBroadcast } from './broadcast.js';

const state = {
  sermons: [], currentId: null, isRecording: false, isPaused: false,
  recordStart: 0, elapsed: 0, recognition: null, mediaRecorder: null,
  audioChunks: [], audioUrl: null, language: 'en-NG', interimText: '',
  theme: 'light', autoSaveInterval: 10, speakerLabel: 'Pastor', preacherName: '',
  lastSaved: null, activeTab: 'detected', presentMode: false, bookmarks: [],
  seriesFilter: '', liveBroadcast: null, focusMode: false, churchBranding: null,
  searchQuery: '', wakeLock: null, fontSize: 16, highContrast: false, ttsUtterance: null,
  restartCount: 0, maxRestarts: 5, offlineQueue: [], isOnline: navigator.onLine,
  sermonTags: [], readingHistory: [], showShortcuts: false, autoPunctuate: true, deferredInstall: null
};

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const els = {
  editor: () => $('#editor'), title: () => $('#sermon-title'), preacher: () => $('#preacher-name'),
  series: () => $('#series-select'), sermonList: () => $('#sermon-list'), recordBtn: () => $('#record-btn'),
  pauseBtn: () => $('#pause-btn'), recordHud: () => $('#record-hud'), recordTime: () => $('#record-time'),
  recordStatus: () => $('#record-status'), langSelect: () => $('#lang-select'), speakerSelect: () => $('#speaker-select'),
  themeToggle: () => $('#theme-toggle'), biblePanel: () => $('#bible-panel'), keywordPanel: () => $('#keyword-panel'),
  statusBar: () => $('#status-bar'), wordCount: () => $('#word-count'), readTime: () => $('#read-time'),
  lastSaved: () => $('#last-saved'), bookmarkPanel: () => $('#bookmark-panel'), prayerPanel: () => $('#prayer-panel'),
  quotePanel: () => $('#quote-panel'), seriesList: () => $('#series-list'), searchInput: () => $('#search-input'),
  sentenceCount: () => $('#sentence-count'), paragraphCount: () => $('#paragraph-count'),
  gradeLevel: () => $('#grade-level'), verseAutocomplete: () => $('#verse-autocomplete')
};

async function init() {
  initTheme(); await loadSettings(); await loadSermonList(); checkSharedURL();
  initSpeechRecognition(); initAutoSave(); initKeyboardShortcuts();
  initPWA(); initUI(); initLiveBroadcast(); initVerseAutocomplete();
  initChurchBranding(); initAccessibility(); injectSEOMeta();
  initOnlineStatus();
  createToast('HMG SermonScribe v4 is ready. Click the microphone to begin.', 'success');
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition)
    createToast('Speech recognition not supported. Use Chrome, Edge, or Safari.', 'warn');
  requestNotificationPermission();
}

function initTheme() {
  const saved = localStorage.getItem('hmg-theme') || 'light';
  state.theme = saved;
  document.documentElement.setAttribute('data-theme', saved);
  document.documentElement.style.setProperty('color-scheme', saved === 'dark' ? 'dark' : 'light');
}

async function loadSettings() {
  try {
    const keys = ['language','speakerLabel','preacherName','theme','autoSaveInterval','churchBranding','fontSize','highContrast','translation'];
    const vals = {};
    for (const k of keys) { const v = await getSettings(k); if (v !== null && v !== undefined) vals[k] = v; }
    if (vals.language) state.language = vals.language;
    if (vals.speakerLabel) state.speakerLabel = vals.speakerLabel;
    if (vals.preacherName) state.preacherName = vals.preacherName;
    if (vals.autoSaveInterval) state.autoSaveInterval = parseInt(vals.autoSaveInterval);
    if (vals.churchBranding) state.churchBranding = vals.churchBranding;
    if (vals.fontSize) { state.fontSize = parseInt(vals.fontSize); setFontSize(state.fontSize); }
    if (vals.highContrast) { state.highContrast = vals.highContrast; document.documentElement.setAttribute('data-theme','high-contrast'); }
    if (vals.theme) { state.theme = vals.theme; document.documentElement.setAttribute('data-theme', vals.theme); }
    if (vals.translation) setTranslation(vals.translation);
    if (els.langSelect()) els.langSelect().value = state.language;
    if (els.speakerSelect()) els.speakerSelect().value = state.speakerLabel;
    if (els.preacher()) els.preacher().value = state.preacherName;
  } catch (e) { console.warn('Settings load failed:', e); }
}

function toggleTheme() {
  const next = state.theme === 'light' ? 'dark' : 'light';
  state.theme = next;
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.style.setProperty('color-scheme', next === 'dark' ? 'dark' : 'light');
  localStorage.setItem('hmg-theme', next);
  saveSettings('theme', next);
}

async function loadSermonList() {
  try {
    state.sermons = await loadSermons(200, state.seriesFilter || null);
    renderSermonList(); await renderSeriesList();
    if (!state.currentId && state.sermons.length > 0) await openSermon(state.sermons[0].id);
    else if (!state.currentId) await newSermon();
  } catch (e) { console.error('Failed to load sermon list:', e); }
}

function checkSharedURL() {
  if (!window.location.hash.startsWith('#share=')) return;
  const shared = parseSharedURL(window.location.hash);
  if (!shared) return;
  openModal('import-share-modal');
  const titleEl = $('#import-share-title');
  if (titleEl) titleEl.textContent = shared.t || 'Untitled Sermon';
  const importBtn = $('#import-share-btn');
  if (importBtn) {
    importBtn.onclick = async () => {
      const id = generateId();
      const sermon = { id, title: shared.t || 'Imported Sermon', date: shared.d || getToday(), preacher: shared.p || '', content: shared.c || '', duration: shared.du || '', series: shared.s || '', tags: [], createdAt: getTimestamp(), bookmarks: [] };
      await saveSermon(sermon); state.sermons.unshift(sermon); state.currentId = id;
      renderSermonList(); renderEditor(); closeModal('import-share-modal');
      createToast('Shared sermon imported successfully.', 'success'); window.location.hash = '';
    };
  }
}

function initPWA() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); state.deferredInstall = e; });
}

function initLiveBroadcast() { try { state.liveBroadcast = new LiveBroadcast(); } catch (e) { state.liveBroadcast = null; } }

function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { console.warn('SpeechRecognition not supported'); return; }
  try {
    state.recognition = new SR();
    state.recognition.continuous = true; state.recognition.interimResults = true;
    state.recognition.lang = state.language; state.recognition.maxAlternatives = 1;
    state.recognition.onstart = () => { state.isRecording = true; state.isPaused = false; state.restartCount = 0; updateRecordUI(); vibrate(50); };
    state.recognition.onresult = event => {
      let interim = '', finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (finalText.trim()) { let processed = finalText.trim(); if (state.autoPunctuate) processed = autoCapitalize(processed); insertTranscript(processed); }
      state.interimText = interim; updateRecordUI(); broadcastTranscript();
    };
    state.recognition.onerror = e => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'not-allowed') { createToast('Microphone access denied. Please allow permission.', 'error'); stopRecording(); return; }
      if (e.error === 'network') { createToast('Network error during transcription.', 'warn'); return; }
      restartRecognitionSafely();
    };
    state.recognition.onend = () => { if (state.isRecording && !state.isPaused) restartRecognitionSafely(); else if (!state.isRecording) updateRecordUI(); };
  } catch (e) { console.error('Speech recognition init failed:', e); }
}

function restartRecognitionSafely() {
  if (state.restartCount >= state.maxRestarts) { createToast('Speech recognition stopped after too many errors.', 'warn'); state.isRecording = false; updateRecordUI(); return; }
  state.restartCount++;
  setTimeout(() => { if (state.recognition && state.isRecording && !state.isPaused) { try { state.recognition.start(); } catch (_) {} } }, 100);
}

function autoCapitalize(text) { if (!text) return text; text = text.charAt(0).toUpperCase() + text.slice(1); if (!/[.!?]$/.test(text)) text += '.'; return text; }

function toggleRecording() {
  if (!state.recognition) { createToast('Speech recognition not available. Use Chrome, Edge, or Safari.', 'error'); return; }
  if (state.isRecording) stopRecording(); else startRecording();
}

function startRecording() {
  if (!state.currentId) newSermon();
  state.isRecording = true; state.isPaused = false;
  state.recordStart = Date.now() - (state.elapsed * 1000);
  state.recognition.lang = state.language;
  try { state.recognition.start(); } catch (e) { createToast('Could not start recording: ' + e.message, 'error'); state.isRecording = false; return; }
  startTimer(); startAudioRecording();
  try { notify('Recording Started', { body: 'SermonScribe is listening and transcribing.' }); } catch(_) {}
  requestWakeLock().then(l => { if (l) state.wakeLock = l; }).catch(()=>{});
  lockOrientation('portrait').catch(()=>{});
  vibrate([100,50,100]); updateRecordUI(); createToast('Recording started. Speak clearly.', 'success');
}

function pauseRecording() {
  state.isPaused = true;
  try { if (state.recognition && state.recognition.state !== 'inactive') state.recognition.stop(); } catch(_) {}
  stopTimer(); stopAudioRecording(); updateRecordUI(); vibrate(50);
  try { notify('Recording Paused', { body: 'Tap resume to continue.' }); } catch(_) {}
  createToast('Recording paused.', 'warn');
  if (state.wakeLock) { releaseWakeLock(state.wakeLock); state.wakeLock = null; }
}

function resumeRecording() {
  state.isPaused = false; state.recognition.lang = state.language;
  try { state.recognition.start(); } catch(_) { state.isPaused = true; createToast('Could not resume. Stop and start again.', 'error'); return; }
  startTimer(); startAudioRecording(); updateRecordUI(); vibrate(50);
  requestWakeLock().then(l => { if (l) state.wakeLock = l; }).catch(()=>{});
  createToast('Recording resumed.', 'success');
}

function stopRecording() {
  state.isRecording = false; state.isPaused = false; state.restartCount = 0;
  try { if (state.recognition && state.recognition.state !== 'inactive') state.recognition.stop(); } catch(_) {}
  stopTimer(); stopAudioRecording(); state.elapsed = 0; state.interimText = '';
  updateRecordUI(); persistCurrent(); stopSpeech();
  if (state.wakeLock) { releaseWakeLock(state.wakeLock); state.wakeLock = null; }
  lockOrientation('any').catch(()=>{});
  try { notify('Recording Stopped', { body: 'Sermon saved.' }); } catch(_) {}
  vibrate([100,50,100,50,100]); createToast('Recording stopped. Sermon saved.', 'success');
}

function initAudioRecorder() {}

async function startAudioRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = []; state.mediaRecorder = new MediaRecorder(stream);
    state.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) state.audioChunks.push(e.data); };
    state.mediaRecorder.onstop = () => {
      const blob = new Blob(state.audioChunks, { type: 'audio/webm' });
      state.audioUrl = URL.createObjectURL(blob);
      stream.getTracks().forEach(t => t.stop()); renderAudioAttachment();
    };
    state.mediaRecorder.start(1000);
  } catch (e) {
    if (e.name === 'NotAllowedError') createToast('Microphone permission denied.', 'error');
    else if (e.name === 'NotFoundError') createToast('No microphone found.', 'error');
  }
}

function stopAudioRecording() { if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') state.mediaRecorder.stop(); }

function broadcastTranscript() { if (!state.liveBroadcast || !state.isRecording) return; const text = stripHtml(els.editor()?.innerHTML || ''); state.liveBroadcast.broadcastTranscript(text, state.elapsed); }

let timerInterval = null;
function startTimer() { if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(() => { if (!state.isPaused) { state.elapsed = Math.floor((Date.now() - state.recordStart) / 1000); updateRecordUI(); } }, 1000); }
function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

function updateRecordUI() {
  const hud = els.recordHud(), btn = els.recordBtn(), pauseBtn = els.pauseBtn();
  if (!hud || !btn) return;
  if (state.isRecording) {
    hud.style.display = 'flex';
    const tEl = els.recordTime(); if (tEl) tEl.textContent = formatTime(state.elapsed);
    const sEl = els.recordStatus(); if (sEl) sEl.textContent = state.isPaused ? 'Paused' : (state.interimText || 'Listening...');
    btn.innerHTML = 'Stop'; btn.classList.add('btn-danger'); btn.classList.remove('btn-primary');
    if (pauseBtn) { pauseBtn.style.display = 'inline-flex'; pauseBtn.textContent = state.isPaused ? 'Resume' : 'Pause'; }
  } else {
    hud.style.display = 'none'; btn.innerHTML = 'Start Recording';
    btn.classList.remove('btn-danger'); btn.classList.add('btn-primary');
    if (pauseBtn) pauseBtn.style.display = 'none';
  }
}

function insertTranscript(text) {
  const editor = els.editor(); if (!editor) return;
  const prefix = state.speakerLabel ? ` <strong>${state.speakerLabel}:</strong> ` : '';
  const sentence = text.charAt(0).toUpperCase() + text.slice(1);
  const html = `<p>${prefix}${sentence.trim()}</p>`;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0); range.deleteContents();
    const div = document.createElement('div'); div.innerHTML = html; range.insertNode(div);
    range.setStartAfter(div); range.collapse(true); sel.removeAllRanges(); sel.addRange(range);
  } else { editor.innerHTML += html; }
  editor.scrollTop = editor.scrollHeight; updateStats(); debouncedSave(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes();
}

function addBookmark() {
  if (!state.isRecording && state.elapsed === 0) { createToast('Start recording to add bookmarks.', 'warn'); return; }
  const time = state.elapsed; const note = prompt('Bookmark note (optional):') || 'Important Moment';
  const bm = { id: generateId(), time, note, createdAt: getTimestamp() };
  state.bookmarks.push(bm); renderBookmarks();
  const editor = els.editor();
  if (editor) { const bmHtml = `<p><strong>[${formatTime(time)}]</strong> ${note}</p>`; const sel = window.getSelection(); if (sel && sel.rangeCount > 0) { const range = sel.getRangeAt(0); const div = document.createElement('div'); div.innerHTML = bmHtml; range.insertNode(div); } else { editor.innerHTML += bmHtml; } debouncedSave(); }
  createToast(`Bookmark added at ${formatTime(time)}`, 'success'); vibrate(50);
}

function renderBookmarks() {
  const c = els.bookmarkPanel(); if (!c) return;
  if (!state.bookmarks || !state.bookmarks.length) { c.innerHTML = '<p class="placeholder">No bookmarks yet.</p>'; return; }
  c.innerHTML = state.bookmarks.map(bm => `<div class="bookmark-item" data-time="${bm.time}"><span class="bookmark-time">${formatTime(bm.time)}</span><span class="bookmark-note">${escapeHtml(bm.note)}</span></div>`).join('');
}
window.seekBookmark = time => { state.elapsed = time; state.recordStart = Date.now() - (time * 1000); createToast(`Seeked to ${formatTime(time)}.`, 'info'); };

function initUI() {
  const editor = els.editor();
  if (editor) editor.addEventListener('input', () => { updateStats(); debouncedSave(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes(); });
  if (els.title()) els.title().addEventListener('input', debounce(() => { persistCurrent(); renderSermonList(); }, 500));
  if (els.preacher()) els.preacher().addEventListener('input', debounce(() => persistCurrent(), 500));
  if (els.series()) els.series().addEventListener('change', debounce(() => { persistCurrent(); renderSermonList(); }, 500));
  if (els.langSelect()) els.langSelect().addEventListener('change', e => { state.language = e.target.value; saveSettings('language', state.language); if (state.recognition) state.recognition.lang = state.language; });
  if (els.speakerSelect()) els.speakerSelect().addEventListener('change', e => { state.speakerLabel = e.target.value; saveSettings('speakerLabel', state.speakerLabel); });
  if (els.themeToggle()) els.themeToggle().addEventListener('click', toggleTheme);
  const menuBtn = $('#menu-toggle');
  if (menuBtn) menuBtn.addEventListener('click', () => { const sb = document.getElementById('sidebar'); const ov = document.getElementById('sidebar-overlay'); if (sb) sb.classList.toggle('open'); if (ov) ov.style.display = sb?.classList.contains('open') ? 'block' : 'none'; });
  if (els.searchInput()) els.searchInput().addEventListener('input', debounce(e => { state.searchQuery = e.target.value; renderSermonList(); }, 300));
  const fsl = $('#font-size-slider'); if (fsl) fsl.addEventListener('input', e => { state.fontSize = parseInt(e.target.value); setFontSize(state.fontSize); saveSettings('fontSize', state.fontSize); const v=$('#font-size-value'); if(v) v.textContent=state.fontSize; });
  const hct = $('#high-contrast-toggle'); if (hct) hct.addEventListener('change', e => { state.highContrast = e.target.checked; document.documentElement.setAttribute('data-theme', state.highContrast?'high-contrast':state.theme); saveSettings('highContrast', state.highContrast); });
  const dft = $('#dyslexic-font-toggle'); if (dft) dft.addEventListener('change', e => { document.body.classList.toggle('dyslexic-font', e.target.checked); saveSettings('dyslexicFont', e.target.checked); });
  const rmt = $('#reading-mode-toggle'); if (rmt) rmt.addEventListener('change', e => { document.body.classList.toggle('reading-mode', e.target.checked); const sb = document.getElementById('sidebar'); if (sb) sb.style.display = e.target.checked ? 'none' : ''; saveSettings('readingMode', e.target.checked); });
  const ts = $('#translation-select'); if (ts) ts.addEventListener('change', e => { setTranslation(e.target.value); saveSettings('translation', e.target.value); detectBibleReferences(); });
}

function initAccessibility() { const s = state.fontSize||16; setFontSize(s); if (state.highContrast) document.documentElement.setAttribute('data-theme','high-contrast'); }

function initOnlineStatus() {
  state.isOnline = navigator.onLine;
  window.addEventListener('online', () => { state.isOnline = true; createToast('Back online!','success'); processOfflineQueue(); });
  window.addEventListener('offline', () => { state.isOnline = false; createToast('You are offline. Changes saved locally.','warn'); });
}

async function processOfflineQueue() {
  if (!state.offlineQueue.length) return;
  createToast(`Processing ${state.offlineQueue.length} queued ops...`, 'info');
  for (const op of state.offlineQueue) try { await op(); } catch(e) { console.error('Queue op failed:',e); }
  state.offlineQueue = []; createToast('Queue processed.', 'success');
}

async function newSermon() {
  if (state.isRecording) stopRecording();
  const id = generateId();
  const sermon = { id, title:'Untitled Sermon', date:getToday(), preacher:state.preacherName||'', series:els.series()?.value||'', content:'<h2>Introduction</h2>\n<p>Start typing or recording your sermon here...</p>\n<h2>Main Points</h2>\n<p></p>\n<h2>Conclusion</h2>\n<p></p>', duration:'0:00', tags:[], createdAt:getTimestamp(), bookmarks:[], verses:[] };
  await saveSermon(sermon); state.sermons.unshift(sermon); state.currentId = id; state.elapsed = 0; state.audioUrl = null; state.bookmarks = [];
  const aa = $('#audio-attachment'); if (aa) aa.innerHTML = '';
  renderSermonList(); renderEditor(); renderBookmarks(); updateStats(); createToast('New sermon created.', 'info');
}

async function openSermon(id) {
  if (state.isRecording) { if (!confirm('Stop recording and switch sermons?')) return; stopRecording(); }
  const sermon = await getSermon(id); if (!sermon) { createToast('Sermon not found.', 'error'); return; }
  state.currentId = id; state.elapsed = parseDuration(sermon.duration||'0:00'); state.audioUrl = null; state.bookmarks = sermon.bookmarks||[];
  const aa = $('#audio-attachment'); if (aa) aa.innerHTML = '';
  renderSermonList(); renderEditor(); renderBookmarks(); updateStats(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes();
  if (!state.readingHistory.includes(id)) { state.readingHistory.unshift(id); if (state.readingHistory.length>50) state.readingHistory.pop(); }
}

async function deleteCurrentSermon() {
  if (!state.currentId) return; if (!confirm('Delete this sermon permanently?')) return;
  await deleteSermon(state.currentId); state.sermons = state.sermons.filter(s => s.id !== state.currentId); state.currentId = null; state.elapsed = 0;
  if (state.sermons.length > 0) await openSermon(state.sermons[0].id); else await newSermon();
  createToast('Sermon deleted.', 'info');
}

function parseDuration(d) { const p=(d||'0:00').split(':'); return (parseInt(p[0]||0)*60)+parseInt(p[1]||0); }

function renderEditor() {
  const s = state.sermons.find(x => x.id === state.currentId); if (!s) return;
  if (els.title()) els.title().value = s.title||'Untitled Sermon';
  if (els.preacher()) els.preacher().value = s.preacher||'';
  if (els.series()) els.series().value = s.series||'';
  if (els.editor()) els.editor().innerHTML = s.content||'';
  updateStats(); detectBibleReferences(); updateKeywords(); updatePrayers(); updateQuotes();
}

function renderSermonList() {
  const c = els.sermonList(); if (!c) return;
  let sermons = state.sermons;
  if (state.searchQuery) { const q = state.searchQuery.toLowerCase(); sermons = sermons.filter(s => (s.title||'').toLowerCase().includes(q)||(s.content||'').toLowerCase().includes(q)||(s.preacher||'').toLowerCase().includes(q)||(s.series||'').toLowerCase().includes(q)||(s.tags||[]).some(t => t.toLowerCase().includes(q))); }
  if (!sermons.length) { c.innerHTML = '<p class="placeholder">No sermons found.</p>'; return; }
  c.innerHTML = sermons.map(s => `<div class="sermon-item" data-id="${s.id}" onclick="openSermonInline('${s.id}')"><div class="sermon-info"><div class="sermon-title">${escapeHtml(s.title||'Untitled')}</div><div class="sermon-meta">${s.date||'No date'} | ${s.duration||'0:00'}${s.series?' | '+escapeHtml(s.series):''}${s.preacher?' | '+escapeHtml(s.preacher):''}</div></div><button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteSermonInline('${s.id}')" aria-label="Delete">Delete</button></div>`).join('');
}

async function renderSeriesList() {
  const c = els.seriesList(); if (!c) return;
  try { const series = await getAllSeries(); let opts = '<select class="btn btn-ghost btn-sm btn-block" onchange="filterSeries(this.value)"><option value="">All Series</option>'; for (const s of series) opts += `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`; opts += '</select>'; c.innerHTML = opts; const cur = state.sermons.find(s => s.id === state.currentId); if (cur && cur.series) { const o = c.querySelector(`option[value="${cur.series}"]`); if (o) c.querySelector('select').value = cur.series; } } catch(e) { console.error('Series render failed:',e); }
}

window.filterSeries = async (val) => { state.seriesFilter = val; await loadSermonList(); };

function updateStats() {
  const editor = els.editor(); if (!editor) return;
  const text = stripHtml(editor.innerHTML||'');
  const wc = wordCount(text), rt = estimateReadTime(text), sc = sentenceCount(text), pc = paragraphCount(text), fk = fleschKincaid(text);
  if (els.wordCount()) els.wordCount().textContent = `${wc} words`;
  if (els.readTime()) els.readTime().textContent = `~${rt} min read`;
  if (els.sentenceCount()) els.sentenceCount().textContent = `${sc} sentences`;
  if (els.paragraphCount()) els.paragraphCount().textContent = `${pc} paragraphs`;
  if (els.gradeLevel()) els.gradeLevel().textContent = `Grade ${fk.grade}`;
}

function detectBibleReferences() {
  const editor = els.editor(); if (!editor) return;
  const text = stripHtml(editor.innerHTML||''); const matches = detectReferences(text); const c = els.biblePanel(); if (!c) return;
  if (!matches.length) { c.innerHTML = '<p class="placeholder">No scripture references detected yet.</p>'; return; }
  const unique = [...new Map(matches.map(m=>[m.ref,m])).values()];
  c.innerHTML = unique.slice(0,15).map(m => `<div class="bible-verse" onclick="insertVerse('${escapeHtml(m.ref)}')"><div class="verse-ref">${escapeHtml(m.ref)}</div><div class="verse-text">${escapeHtml(m.text||'Loading...')}</div></div>`).join('');
}

window.insertVerse = ref => {
  const v = getAllVerses().find(x => x.ref === ref); if (!v) return;
  const html = `<blockquote><strong>${escapeHtml(v.ref)}</strong> - ${escapeHtml(v.text)}</blockquote>`;
  const editor = els.editor(); if (!editor) return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) { const range = sel.getRangeAt(0); range.deleteContents(); const div = document.createElement('div'); div.innerHTML = html; range.insertNode(div); } else { editor.innerHTML += html; }
  editor.focus(); debouncedSave(); detectBibleReferences();
};

window.setBibleTab = tab => {
  state.activeTab = tab;
  if (tab==='detected') detectBibleReferences(); else if (tab==='common') renderCommonVerses(); else if (tab==='search') { const q=prompt('Search verse (e.g. John 3:16, love, grace):'); if(q) searchVerses(q); } else if (tab==='bookmarks') renderBookmarks(); else if (tab==='prayers') updatePrayers(); else if (tab==='keywords') updateKeywords(); else if (tab==='quotes') updateQuotes();
  $$('.panel-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
};

function renderCommonVerses() { const c = els.biblePanel(); if (!c) return; c.innerHTML = getAllVerses().slice(0,25).map(m => `<div class="bible-verse" onclick="insertVerse('${escapeHtml(m.ref)}')"><div class="verse-ref">${escapeHtml(m.ref)}</div><div class="verse-text">${escapeHtml(m.text)}</div></div>`).join(''); }
function searchVerses(query) { const q = query.toLowerCase(); const matches = getAllVerses().filter(v => v.ref.toLowerCase().includes(q)||v.text.toLowerCase().includes(q)); const c = els.biblePanel(); if (!c) return; c.innerHTML = matches.slice(0,15).map(m => `<div class="bible-verse" onclick="insertVerse('${escapeHtml(m.ref)}')"><div class="verse-ref">${escapeHtml(m.ref)}</div><div class="verse-text">${escapeHtml(m.text)}</div></div>`).join(''); }

function updateKeywords() { const editor = els.editor(); if (!editor) return; const text = stripHtml(editor.innerHTML||''); const keywords = getKeywords(text); const c = els.keywordPanel(); if (!c) return; if (!keywords.length) { c.innerHTML='<p class="placeholder">Start typing to detect themes.</p>'; return; } c.innerHTML = keywords.map(k=>`<span class="keyword-tag">${escapeHtml(k)}</span>`).join(''); }
function updatePrayers() { const editor = els.editor(); if (!editor) return; const text = stripHtml(editor.innerHTML||''); const prayers = extractPrayerRequests(text); const c = els.prayerPanel(); if (!c) return; if (!prayers.length) { c.innerHTML='<p class="placeholder">Detected prayer requests will appear here.</p>'; return; } c.innerHTML = prayers.map(p=>`<div class="prayer-item"> ${escapeHtml(p)}</div>`).join(''); }
function updateQuotes() { const editor = els.editor(); if (!editor) return; const text = stripHtml(editor.innerHTML||''); const quotes = extractTopSentences(text, 6); const c = els.quotePanel(); if (!c) return; if (!quotes.length) { c.innerHTML='<p class="placeholder">Shareable quotes will appear as you write.</p>'; return; } c.innerHTML = quotes.map((q,i)=>`<div class="quote-item"><p>"${escapeHtml(q)}"</p><button class="btn btn-sm" onclick="shareQuote(this.dataset.quote)" data-quote="${escapeHtml(q)}">Share</button></div>`).join(''); }

window.shareQuote = (quote) => { const msg = encodeURIComponent(`Quote from today's sermon:\n\n"${quote}"\n\n_Shared via HMG SermonScribe v4_`); window.open(`https://wa.me/?text=${msg}`, '_blank'); };

window.openExport = () => openDrawer('export-drawer');
window.closeExport = () => closeDrawer('export-drawer');
window.doExport = format => { const s = getCurrentSermon(); if (!s) return; switch(format) { case 'txt': exportTXT(s); break; case 'md': exportMD(s); break; case 'html': exportHTML(s); break; case 'docx': exportDOCX(s); break; case 'print': exportPrint(s); break; case 'whatsapp': shareWhatsApp(s); break; case 'srt': exportSRT(s); break; case 'devotional': exportReadingPlan(s); break; case 'json': exportJSON(s); break; case 'rss': generateRSS(state.sermons); break; case 'native': shareWebNative(s); break; default: createToast('Unknown format','error'); } closeDrawer('export-drawer'); createToast(`Exported as ${format.toUpperCase()}`,'success'); };
window.doImport = () => { const input = document.createElement('input'); input.type='file'; input.accept='.txt,.md,.html'; input.onchange = async e => { const file = e.target.files[0]; if (!file) return; try { const text = await fileToText(file); const html = file.name.endsWith('.md') ? parseMarkdownToHtml(text) : text.replace(/\n/g,'<br>'); const editor = els.editor(); if (editor) { editor.innerHTML += html; createToast(`${file.name} imported.`,'success'); updateStats(); debouncedSave(); } } catch(err) { createToast(`Import failed: ${err.message}`,'error'); } }; input.click(); };

window.openShare = () => { const s = getCurrentSermon(); if (!s) return; const url = generateShareableURL(s); if (!url) { createToast('Sermon too large to share via URL.','warn'); return; } openModal('share-modal'); const urlEl = $('#share-url'); if (urlEl) urlEl.value = url; generateQRDataURL(url).then(dataUrl => { const qr = $('#share-qr'); if (qr) qr.innerHTML = `<img src="${dataUrl}" alt="QR Code" style="max-width:200px;margin:1rem auto;display:block">`; }).catch(() => { const qr=$('#share-qr'); if(qr) qr.innerHTML='<p>QR generation unavailable.</p>'; }); };
window.copyShareURL = () => { const el = $('#share-url'); if (!el) return; el.select(); navigator.clipboard.writeText(el.value).then(()=>createToast('Link copied!','success')).catch(()=>createToast('Copy failed.','error')); };

window.openPresent = () => { document.body.classList.add('present-mode'); state.presentMode = true; lockOrientation('landscape').catch(()=>{}); createToast('Presenter mode active. Press Escape to exit.','info'); };
window.exitPresent = () => { document.body.classList.remove('present-mode'); state.presentMode = false; lockOrientation('any').catch(()=>{}); };

window.openSettings = () => openModal('settings-modal'); window.closeSettings = () => closeModal('settings-modal');
window.openBackup = () => openModal('backup-modal'); window.closeBackup = () => closeModal('backup-modal');
window.doBackup = async () => { try { const data = await exportAllSermons(); downloadBlob('hmg-sermonscribe-v4-backup.json','application/json',data); closeModal('backup-modal'); createToast('Backup downloaded.','success'); } catch(e) { createToast('Backup failed: '+e.message,'error'); } };
window.doRestore = async () => { const input = document.createElement('input'); input.type='file'; input.accept='.json'; input.onchange = async e => { const file = e.target.files[0]; if (!file) return; try { const text = await file.text(); const count = await importAllSermons(text); await loadSermonList(); closeModal('backup-modal'); createToast(`Restored ${count} sermons.`,'success'); } catch(err) { createToast('Restore failed: '+err.message,'error'); } }; input.click(); };

window.openFindReplace = () => openModal('find-replace-modal'); window.closeFindReplace = () => closeModal('find-replace-modal');
window.doFindReplace = () => { const find = $('#fr-find')?.value; const replace = $('#fr-replace')?.value; const useRegex = $('#fr-regex')?.checked; if (!find) return; const editor = els.editor(); if (!editor) return; const pattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const re = new RegExp(pattern, 'gi'); walkTextNodes(editor, node => { node.textContent = node.textContent.replace(re, replace||''); }); closeModal('find-replace-modal'); createToast('Find & replace completed.','success'); debouncedSave(); };
function walkTextNodes(node, callback) { if (node.nodeType === Node.TEXT_NODE) { callback(node); } else if (node.nodeType === Node.ELEMENT_NODE) { for (let child of node.childNodes) walkTextNodes(child, callback); } }

window.openFillerRemoval = () => { const editor = els.editor(); if (!editor) return; const text = stripHtml(editor.innerHTML); const cleaned = stripFillerWords(text); editor.innerHTML = cleaned.replace(/\n/g,'<p>'); createToast('Filler words removed.','success'); debouncedSave(); };

window.openLiveCaption = () => { if (!state.liveBroadcast) { createToast('Live broadcast not available.','error'); return; } const url = state.liveBroadcast.getShareURL(); window.open(url,'_blank'); createToast('Live caption page opened.','info'); };
window.generateLiveQR = () => { if (!state.liveBroadcast) return; const url = state.liveBroadcast.getShareURL(); generateQRDataURL(url).then(dataUrl => { const body = $('#live-qr-modal-body'); if (body) body.innerHTML = `<img src="${dataUrl}" alt="QR Code" style="max-width:200px;margin:1rem auto;display:block"><p>Congregation scans this to see live captions.</p>`; openModal('live-qr-modal'); }).catch(() => createToast('QR generation failed.','error')); };

window.openOutlineGenerator = () => { const s = getCurrentSermon(); if (!s) return; try { const outline = generateAdvancedOutline(s); const prev = $('#outline-preview'); if (prev) prev.value = outline; openModal('outline-modal'); } catch(e) { createToast('Outline generation failed: '+e.message,'error'); } };
window.downloadOutline = () => { const text = $('#outline-preview')?.value; const s = getCurrentSermon(); if (!text||!s) return; downloadBlob(`${slugify(s.title)}-outline.md`,'text/markdown',text); closeModal('outline-modal'); createToast('Outline downloaded.','success'); };

window.openDiscussionGenerator = () => { const s = getCurrentSermon(); if (!s) return; try { const guide = generateAdvancedDiscussionGuide(s); const prev = $('#discussion-preview'); if (prev) prev.value = guide; openModal('discussion-modal'); } catch(e) { createToast('Discussion generation failed: '+e.message,'error'); } };
window.downloadDiscussion = () => { const text = $('#discussion-preview')?.value; const s = getCurrentSermon(); if (!text||!s) return; downloadBlob(`${slugify(s.title)}-discussion.md`,'text/markdown',text); closeModal('discussion-modal'); createToast('Discussion guide downloaded.','success'); };

window.openFlashcards = () => { const s = getCurrentSermon(); if (!s) return; const refs = (s.verses||[]).length ? (s.verses||[]) : getAllVerses().slice(0,10); const c = $('#flashcard-container'); if (!c) return; c.innerHTML = refs.map((v,i) => `<div class="flashcard" onclick="revealFlashcard(${i})" tabindex="0" role="button"><div class="flashcard-front">${escapeHtml(v.ref)}</div><div class="flashcard-back" id="fc-text-${i}" style="filter:blur(8px);user-select:none">${escapeHtml(v.text)}</div></div>`).join(''); openModal('flashcard-modal'); };
window.revealFlashcard = i => { const el=document.getElementById(`fc-text-${i}`); if(el){el.style.filter='none';el.style.userSelect='auto';} };
window.saveAllFlashcards = async () => { const s = getCurrentSermon(); if (!s) return; const refs = (s.verses||[]).length ? (s.verses||[]) : getAllVerses().slice(0,10); for (const v of refs) await saveFlashcard({id:generateId(),ref:v.ref,text:v.text,sermonId:s.id,createdAt:getTimestamp()}); createToast('Flashcards saved.','success'); closeModal('flashcard-modal'); };

window.openChurchBranding = () => openModal('branding-modal');
window.saveChurchBranding = () => { const name=$('#cb-name')?.value, color=$('#cb-color')?.value, logo=$('#cb-logo')?.value, phone=$('#cb-phone')?.value; state.churchBranding = {name,color,logo,phone,updatedAt:getTimestamp()}; saveSettings('churchBranding',state.churchBranding); applyChurchBranding(); closeModal('branding-modal'); createToast('Church branding saved.','success'); };
function applyChurchBranding() { if (!state.churchBranding) return; const b = state.churchBranding; if ($('#brand-title') && b.name) $('#brand-title').textContent = b.name; if (b.color) { document.documentElement.style.setProperty('--accent',b.color); document.documentElement.style.setProperty('--accent-glow',b.color+'25'); } }
function initChurchBranding() { applyChurchBranding(); }

window.openAnalyticsPage = () => window.open('analytics.html','_blank');
window.openDevotionsPage = () => window.open('devotions.html','_blank');
window.openNotesPage = () => window.open('notes.html','_blank');
window.openBulletinPage = () => window.open('bulletin.html','_blank');
window.openPrayerWallPage = () => window.open('prayer-wall.html','_blank');
window.openCalendarPage = () => window.open('calendar.html','_blank');

window.openSermonTimer = () => openModal('timer-modal'); window.closeSermonTimer = () => closeModal('timer-modal');
window.startSermonTimer = () => { const mins = parseInt($('#timer-minutes')?.value||30); let remaining = mins*60; const el=$('#timer-display'); if (state.sermonTimerInterval) clearInterval(state.sermonTimerInterval); state.sermonTimerInterval = setInterval(() => { remaining--; if (remaining<=0) { clearInterval(state.sermonTimerInterval); vibrate([200,100,200]); createToast('Sermon time is up!','warn'); try { notify('Sermon Timer',{body:'Your allotted sermon time has ended.'}); } catch(_) {} return; } const m=Math.floor(remaining/60).toString().padStart(2,'0'), s=(remaining%60).toString().padStart(2,'0'); if (el) el.textContent=`${m}:${s}`; },1000); createToast('Sermon timer started.','success'); };
window.stopSermonTimer = () => { if (state.sermonTimerInterval) { clearInterval(state.sermonTimerInterval); state.sermonTimerInterval=null; createToast('Timer stopped.','info'); } };

window.openWordCloud = () => { openModal('word-cloud-modal'); setTimeout(()=>renderWordCloud('word-cloud-canvas'),300); };
function renderWordCloud(id) { const editor=els.editor(); if(!editor) return; const text=stripHtml(editor.innerHTML||''); const themes=getKeywords(text); const canvas=document.getElementById(id); if(!canvas) return; const ctx=canvas.getContext('2d'), dpr=window.devicePixelRatio||1, rect=canvas.getBoundingClientRect(); canvas.width=rect.width*dpr; canvas.height=rect.height*dpr; ctx.scale(dpr,dpr); ctx.clearRect(0,0,rect.width,rect.height); const entries=Object.entries(themes).map(([k,v])=>[k,1]).sort((a,b)=>b[1]-a[1]).slice(0,30); if(!entries.length){ctx.fillStyle='#94a3b8';ctx.font='14px sans-serif';ctx.fillText('Write more content to generate word cloud',10,20);return;} const max=entries[0][1]; let x=10,y=30; const colors=['#d97706','#2563eb','#059669','#dc2626','#7c3aed','#0f172a']; entries.forEach(([word],i)=>{ const size=14+(1/max)*28; ctx.font=`bold ${size}px system-ui`; ctx.fillStyle=colors[i%6]; const w=ctx.measureText(word).width; if(x+w>rect.width-10){x=10;y+=size+10;} ctx.fillText(word,x,y); x+=w+16; }); }

window.speakText = () => { const editor=els.editor(); if(!editor)return; const text=stripHtml(editor.innerHTML||'').slice(0,500); if(!text)return; textToSpeech(text,state.language); createToast('Reading sermon aloud...','info'); };
window.stopSpeak = () => stopSpeech();

function initAudioUpload() { const zone=$('#audio-upload-zone'); if(!zone) return; zone.addEventListener('dragover', e=>{e.preventDefault();zone.classList.add('dragover');}); zone.addEventListener('dragleave', ()=>zone.classList.remove('dragover')); zone.addEventListener('drop', e=>{e.preventDefault();zone.classList.remove('dragover');if(e.dataTransfer.files.length)handleAudioFile(e.dataTransfer.files[0]);}); zone.addEventListener('click', ()=>{const input=document.createElement('input');input.type='file';input.accept='audio/*';input.onchange=e=>{if(e.target.files.length)handleAudioFile(e.target.files[0]);};input.click();}); }
function handleAudioFile(file) { const audio=new Audio(); audio.src=URL.createObjectURL(file); audio.onloadedmetadata=()=>{createToast(`Audio loaded: ${file.name} (${Math.round(audio.duration)}s).`,'success');state.audioUrl=audio.src;renderAudioAttachment();}; audio.onerror=()=>createToast('Could not load audio file.','error'); }

function initVerseAutocomplete() { const editor=els.editor(); if(!editor) return; editor.addEventListener('input', ()=>{ const sel=window.getSelection(); if(!sel.rangeCount) return; const range=sel.getRangeAt(0); const pre=range.startContainer.textContent?.slice(0,range.startOffset)||''; const match=pre.match(/((?:1\s|2\s|3\s)?[A-Za-z]+\s\d+(:\d+)?)$/); if(match) showVerseAutocomplete(match[1],range); else hideVerseAutocomplete(); }); }
function showVerseAutocomplete(query, range) { const matches=autocompleteVerse(query); if(!matches.length)return; const box=els.verseAutocomplete(); if(!box)return; box.style.display='block'; box.innerHTML=matches.map(m=>`<div class="verse-autocomplete-item" onclick="insertAutocompleteVerse('${escapeHtml(m.ref)}')">${escapeHtml(m.ref)}</div>`).join(''); const rect=range.getBoundingClientRect(); box.style.top=(rect.bottom+window.scrollY+4)+'px'; box.style.left=rect.left+'px'; }
function hideVerseAutocomplete() { const box=els.verseAutocomplete(); if(box)box.style.display='none'; }
window.insertAutocompleteVerse = ref => { insertVerse(ref); hideVerseAutocomplete(); };

function getCurrentSermon() { return state.sermons.find(s=>s.id===state.currentId)||null; }
async function persistCurrent() { const s=getCurrentSermon(); if(!s) return; s.title=els.title()?.value||s.title; s.preacher=els.preacher()?.value||s.preacher; s.series=els.series()?.value||s.series; s.content=els.editor()?.innerHTML||s.content; s.duration=formatTime(state.elapsed); s.tags=getKeywords(stripHtml(s.content)); s.verses=detectReferences(s.content); s.bookmarks=state.bookmarks; await saveSermon(s); state.lastSaved=new Date(); const ls=els.lastSaved(); if(ls)ls.textContent='Saved just now'; }
const debouncedSave = debounce(() => persistCurrent(), 800);
function initAutoSave() { setInterval(() => { if(state.currentId && !state.isPaused) persistCurrent(); }, state.autoSaveInterval*1000); }

function initKeyboardShortcuts() { document.addEventListener('keydown', e => { if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return; if (e.key==='Escape'&&state.presentMode) { exitPresent(); e.preventDefault(); return; } if (e.ctrlKey||e.metaKey) { switch(e.key.toLowerCase()) { case 's': e.preventDefault(); persistCurrent(); createToast('Saved manually.','success'); break; case ' ': e.preventDefault(); toggleRecording(); break; case 'n': e.preventDefault(); newSermon(); break; case 'p': e.preventDefault(); openPresent(); break; case 'f': e.preventDefault(); openFindReplace(); break; case 'b': e.preventDefault(); addBookmark(); break; case 'k': e.preventDefault(); openSermonTimer(); break; case 't': e.preventDefault(); toggleTheme(); break; } } }); }

function renderAudioAttachment() { const c=$('#audio-attachment'); if(!c||!state.audioUrl) return; c.innerHTML=`<div class="audio-player"><audio controls src="${state.audioUrl}"></audio><a href="${state.audioUrl}" download="sermon-recording.webm" class="btn btn-sm">Download Audio</a></div>`; }

function injectSEOMeta() {
  const title=document.title, url=window.location.href;
  const desc='HMG SermonScribe v4 - Real-time sermon transcription, offline-first notes, live congregation captions, Bible intelligence, devotions, and church analytics. Zero API cost.';
  const addMeta = (prop,content) => { let m=document.querySelector(`meta[property="${prop}"],meta[name="${prop}"]`); if(!m){m=document.createElement('meta');if(prop.startsWith('og:')||prop.startsWith('twitter:'))m.setAttribute('property',prop);else m.setAttribute('name',prop);document.head.appendChild(m);} m.setAttribute('content',content); };
  addMeta('description',desc); addMeta('og:title',title); addMeta('og:description',desc); addMeta('og:url',url); addMeta('og:type','website'); addMeta('twitter:card','summary_large_image'); addMeta('twitter:title',title); addMeta('twitter:description',desc);
  let ld=document.querySelector('script[type="application/ld+json"]'); if(!ld){ld=document.createElement('script');ld.type='application/ld+json';document.head.appendChild(ld);}
  ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebApplication',name:'HMG SermonScribe v4',url,applicationCategory:'ProductivityApplication',operatingSystem:'Any',offers:{'@type':'Offer',price:'0',priceCurrency:'NGN'},author:{'@type':'Organization',name:'HMG Gospel',url:'https://hmgconcepts.pages.dev'}});
}

window.openRepurposer = () => { const s=getCurrentSermon(); if(!s){createToast('Please write a sermon first.','warn');return;} openModal('repurpose-modal'); setRepurposeTab('social'); };
window.setRepurposeTab = tab => { const s=getCurrentSermon(), contentEl=$('#repurpose-content'); if(!contentEl||!s)return; $$('#repurpose-modal .panel-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab)); try { if(tab==='social'){const{posts}=generateSocialKit(s);contentEl.innerHTML=posts.map((p,i)=>`<div class="repurpose-item"><h4>Option ${i+1}:</h4><p>${escapeHtml(p.facebook)}</p></div>`).join('');} else if(tab==='blog') contentEl.textContent=generateBlogDraft(s); else if(tab==='email') contentEl.textContent=generateNewsletter(s); } catch(e) { contentEl.textContent=`Error: ${e.message}`; } };
window.copyRepurposeContent = () => { const text=$('#repurpose-content')?.textContent; if(!text)return; navigator.clipboard.writeText(text).then(()=>createToast('Copied!','success')).catch(()=>createToast('Copy failed.','error')); };

window.openSermonInline = id => openSermon(id);
window.deleteSermonInline = async id => { if(state.currentId===id){await deleteCurrentSermon();return;} if(!confirm('Delete this sermon?'))return; await deleteSermon(id); state.sermons=state.sermons.filter(s=>s.id!==id); renderSermonList(); };
window.formatDoc = (cmd,val=null) => { document.execCommand(cmd,false,val); els.editor()?.focus(); };
window.saveSetting = (key,value) => { saveSettings(key,value); createToast(`${capitalize(key)} updated`,'success'); };

window.insertTemplate = type => {
  const templates = { expository: '<h2>Text:</h2>\n<p><em>Context and background...</em></p>\n<h3>Main Point 1</h3>\n<p></p>\n<h3>Main Point 2</h3>\n<p></p>\n<h3>Main Point 3</h3>\n<p></p>\n<h2>Application</h2>\n<p></p>\n<h2>Conclusion</h2>\n<p></p>', topical: '<h2>Topic:</h2>\n<p><em>Definition and relevance...</em></p>\n<h3>Point 1</h3>\n<p></p>\n<h3>Point 2</h3>\n<p></p>\n<h3>Point 3</h3>\n<p></p>\n<h2>Conclusion</h2>\n<p></p>', testimony: '<h2>Testimony Title</h2>\n<p><em>Background...</em></p>\n<h3>The Challenge</h3>\n<p></p>\n<h3>The Turning Point</h3>\n<p></p>\n<h3>The Victory</h3>\n<p></p>\n<h2>Lesson and Encouragement</h2>\n<p></p>', fill_blank: '<h2>Fill-in-the-Blank Sermon Notes</h2>\n<p>_____</p>' };
  const html = templates[type] || templates.expository;
  const editor = els.editor(); if (!editor) return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) { const range = sel.getRangeAt(0); range.deleteContents(); const div = document.createElement('div'); div.innerHTML = html; range.insertNode(div); } else { editor.innerHTML += html; }
  editor.focus(); debouncedSave();
};

document.addEventListener('DOMContentLoaded', init);
