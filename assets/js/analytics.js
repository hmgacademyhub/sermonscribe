/* ============================================
 HMG SermonScribe v3 — Client-Side Analytics Dashboard
 ============================================ */

import { loadSermons, getAllSeries, loadFlashcards, loadDevotions, loadPrayers, loadBulletins } from './storage.js';
import { wordCount, stripHtml, getKeywords, fleschKincaid, estimateReadTime } from './utils.js';

export async function renderDashboard() {
  const sermons = await loadSermons(1000);
  const series = await getAllSeries();
  const flashcards = await loadFlashcards();
  const devotions = await loadDevotions();
  const prayers = await loadPrayers();
  const bulletins = await loadBulletins();

  const totalWords = sermons.reduce((a, s) => a + wordCount(stripHtml(s.content || '')), 0);
  const totalDuration = sermons.reduce((a, s) => a + parseDuration(s.duration || '0:00'), 0);
  const allThemes = {};
  const allPreachers = {};
  const allVerses = {};
  const allDates = {};

  sermons.forEach(s => {
    const themes = getKeywords(stripHtml(s.content || ''));
    themes.forEach(t => { allThemes[t] = (allThemes[t] || 0) + 1; });
    if (s.preacher) allPreachers[s.preacher] = (allPreachers[s.preacher] || 0) + 1;
    (s.verses || []).forEach(v => { allVerses[v.ref] = (allVerses[v.ref] || 0) + 1; });
    if (s.date) allDates[s.date.slice(0, 7)] = (allDates[s.date.slice(0, 7)] || 0) + 1;
  });

  updateStat('stat-sermon-count', sermons.length);
  updateStat('stat-total-words', totalWords.toLocaleString());
  updateStat('stat-total-hours', Math.round(totalDuration / 3600 * 10) / 10);
  updateStat('stat-series-count', series.length);
  updateStat('stat-flashcards', flashcards.length);
  updateStat('stat-devotions', devotions.length);
  updateStat('stat-prayers', prayers.length);
  updateStat('stat-bulletins', bulletins.length);

  renderWordCloud('word-cloud', allThemes, 300);
  renderBarChart('preacher-chart', allPreachers, 8);
  renderBarChart('verse-chart', allVerses, 10);
  renderLineChart('timeline-chart', allDates);

  renderSermonTable('sermon-table', sermons);
}

function updateStat(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function parseDuration(dur) {
  const parts = (dur || '0:00').split(':');
  return (parseInt(parts[0] || 0) * 60) + parseInt(parts[1] || 0);
}

function renderWordCloud(canvasId, themes, maxSize = 300) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const entries = Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 40);
  const max = Math.max(1, entries[0]?.[1] || 1);
  const colors = ['#d97706', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#0f172a', '#64748b'];

  let x = 10, y = 30;
  entries.forEach(([word, count], i) => {
    const size = 12 + (count / max) * 24;
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.fillStyle = colors[i % colors.length];
    const width = ctx.measureText(word).width;
    if (x + width > rect.width - 10) { x = 10; y += size + 10; }
    ctx.fillText(word, x, y);
    x += width + 16;
  });
}

function renderBarChart(canvasId, data, limit = 8) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (!entries.length) { ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.fillText('No data yet', 10, 20); return; }
  const max = Math.max(1, entries[0][1]);
  const barH = 22, gap = 8, margin = 10;
  const chartW = rect.width - margin * 2 - 100;

  entries.forEach(([label, val], i) => {
    const y = margin + i * (barH + gap);
    const barW = (val / max) * chartW;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(margin + 100, y, chartW, barH);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(margin + 100, y, barW, barH);
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.fillText(label.slice(0, 18), margin, y + 16);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(val, margin + 100 + barW + 6, y + 16);
  });
}

function renderLineChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length < 2) { ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.fillText('Not enough timeline data', 10, 20); return; }
  const max = Math.max(1, ...entries.map(e => e[1]));
  const padding = 30;
  const chartW = rect.width - padding * 2;
  const chartH = rect.height - padding * 2;
  const step = chartW / (entries.length - 1);

  ctx.beginPath();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  entries.forEach(([date, val], i) => {
    const x = padding + i * step;
    const y = padding + chartH - (val / max) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  entries.forEach(([date], i) => {
    if (i % 2 === 0) ctx.fillText(date.slice(5), padding + i * step - 10, rect.height - 5);
  });
}

function renderSermonTable(id, sermons) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = sermons.slice(0, 50).map(s => {
    const text = stripHtml(s.content || '');
    const fk = fleschKincaid(text);
    return `<tr>
      <td style="padding:.5rem;border-bottom:1px solid var(--border)"><strong>${escapeHtml(s.title || 'Untitled')}</strong></td>
      <td style="padding:.5rem;border-bottom:1px solid var(--border)">${escapeHtml(s.preacher || '-')}</td>
      <td style="padding:.5rem;border-bottom:1px solid var(--border)">${s.date || '-'}</td>
      <td style="padding:.5rem;border-bottom:1px solid var(--border)">${wordCount(text)}</td>
      <td style="padding:.5rem;border-bottom:1px solid var(--border)">${fk.grade}</td>
      <td style="padding:.5rem;border-bottom:1px solid var(--border)">${s.duration || '0:00'}</td>
    </tr>`;
  }).join('');
}

function escapeHtml(s) { return s.replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>'); }

if (document.getElementById('stat-sermon-count')) renderDashboard();
