/* HMG SermonScribe v4 - Export Engine */
import { downloadBlob, stripHtml, slugify, getToday, estimateReadTime, wordCount, srtTime, escapeHtml, fleschKincaid, sentenceCount, paragraphCount, buildFullHTML, parseMarkdownToHtml, shareViaNative } from './utils.js';

export function exportTXT(sermon) {
  const text = stripHtml(sermon.content);
  const header = `TITLE: ${sermon.title}\nDATE: ${sermon.date || getToday()}\nPREACHER: ${sermon.preacher || 'Unknown'}\nDURATION: ${sermon.duration || 'N/A'}\nWORDS: ${wordCount(text)}\nSENTENCES: ${sentenceCount(text)}\nPARAGRAPHS: ${paragraphCount(text)}\nREAD TIME: ~${estimateReadTime(text)} min\nGRADE LEVEL: ${fleschKincaid(text).grade}\nSERIES: ${sermon.series || 'N/A'}\nEXPORTED BY: HMG SermonScribe v4\nBRAND: HMG Gospel under HMG Concepts\n================================\n\n`;
  downloadBlob(`${slugify(sermon.title)}.txt`, 'text/plain', header + text);
}

export function exportMD(sermon) {
  const text = stripHtml(sermon.content);
  const fk = fleschKincaid(text);
  const header = `# ${sermon.title}\n\n- **Date:** ${sermon.date || getToday()}\n- **Preacher:** ${sermon.preacher || 'Unknown'}\n- **Duration:** ${sermon.duration || 'N/A'}\n- **Series:** ${sermon.series || 'N/A'}\n- **Words:** ${wordCount(text)}\n- **Sentences:** ${sentenceCount(text)}\n- **Paragraphs:** ${paragraphCount(text)}\n- **Read time:** ~${estimateReadTime(text)} min\n- **Grade level:** ${fk.grade}\n- **Exported by:** HMG SermonScribe v4\n\n---\n\n`;
  downloadBlob(`${slugify(sermon.title)}.md`, 'text/markdown', header + text);
}

export function exportHTML(sermon) { downloadBlob(`${slugify(sermon.title)}.html`, 'text/html', buildFullHTML(sermon)); }

export function exportDOCX(sermon) {
  const html = buildFullHTML(sermon, true);
  const blob = new Blob(['<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>' + escapeHtml(sermon.title) + '</title></head><body>' + html + '</body></html>'], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${slugify(sermon.title)}.doc`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export function exportPrint(sermon) {
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups to print.'); return; }
  win.document.write(buildFullHTML(sermon, true)); win.document.close(); win.focus();
  setTimeout(() => win.print(), 400);
}

export function shareWhatsApp(sermon) {
  const text = stripHtml(sermon.content).slice(0, 3000);
  const msg = encodeURIComponent(`*${sermon.title}*\n${sermon.date || getToday()} | ${sermon.duration || 'N/A'}\n${text.slice(0, 2000)}${text.length > 2000 ? '...' : ''}\n\n_Shared via HMG SermonScribe v4_`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

export function shareWebNative(sermon) {
  if (navigator.share) { const text = stripHtml(sermon.content).slice(0, 500); navigator.share({ title: sermon.title, text: `${sermon.preacher ? sermon.preacher + ' - ' : ''}${text}...`, url: window.location.href }).catch(() => {}); }
}

export function generateShareableURL(sermon) {
  try {
    const payload = { t: sermon.title, d: sermon.date || getToday(), p: sermon.preacher || '', c: sermon.content, du: sermon.duration || '', s: sermon.series || '' };
    const json = JSON.stringify(payload);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    if (b64.length > 65000) return null;
    return `${window.location.origin}${window.location.pathname}#share=${b64}`;
  } catch (e) { return null; }
}

export function parseSharedURL(hash) {
  try {
    if (!hash.startsWith('#share=')) return null;
    const b64 = hash.slice(7);
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch (e) { return null; }
}

export function generateQRDataURL(text) {
  return new Promise((resolve, reject) => {
    if (typeof QRCode === 'undefined') { reject(new Error('QRCode library not loaded')); return; }
    try { QRCode.toDataURL(text, { width: 256, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } }, (err, url) => { if (err) reject(err); else resolve(url); }); } catch (e) { reject(e); }
  });
}

export function exportSRT(sermon) {
  if (!sermon.bookmarks || !sermon.bookmarks.length) { alert('No bookmarks found. Add timestamped bookmarks during recording to generate SRT.'); return; }
  const cues = sermon.bookmarks.map((bm, i) => { const start = srtTime(bm.time); const end = srtTime((sermon.bookmarks[i + 1]?.time) || (bm.time + 5)); return `${i + 1}\n${start} --> ${end}\n${bm.text || '[Sermon continues]'}\n`; });
  downloadBlob(`${slugify(sermon.title)}.srt`, 'text/plain', cues.join('\n'));
}

export function exportReadingPlan(sermon) {
  const text = stripHtml(sermon.content); const themes = sermon.tags || []; const verses = (sermon.verses || []).map(v => v.ref);
  const plan = { app: 'HMG SermonScribe v4', title: `5-Day Devotional: ${sermon.title}`, date: getToday(), source: sermon.title, preacher: sermon.preacher || 'Unknown', days: [] };
  for (let i = 1; i <= 5; i++) { plan.days.push({ day: i, focus: i === 1 ? 'Reflection and Key Scripture' : i === 2 ? 'Personal Application' : i === 3 ? 'Sharing the Message' : i === 4 ? 'Deeper Study and Prayer' : 'Living It Out', 'Scripture Focus': verses[i - 1] || verses[0] || 'Psalm 119:105', 'Guiding Question': generateDayQuestion(i, themes, verses), 'Action Step': generateDayAction(i, themes), 'Closing Prayer': generateDayPrayer(i, themes) }); }
  const md = `# ${plan.title}\n\n> Based on: *${sermon.title}* by ${plan.preacher}\n> Exported from HMG SermonScribe v4\n\n---\n\n` + plan.days.map(d => `## Day ${d.day}: ${d.focus}\n\n**Scripture Focus:** ${d['Scripture Focus']}\n\n**Guiding Question:** ${d['Guiding Question']}\n\n**Action Step:** ${d['Action Step']}\n\n**Closing Prayer:** ${d['Closing Prayer']}\n`).join('\n---\n\n');
  downloadBlob(`${slugify(sermon.title)}-devotional.md`, 'text/markdown', md);
}

export function generateRSS(sermons) {
  const items = sermons.slice(0, 50).map(s => { const text = escapeHtml(stripHtml(s.content).slice(0, 300)); const date = new Date(s.createdAt || Date.now()).toUTCString(); return `<item><title>${escapeHtml(s.title)}</title><link>${escapeHtml(window.location.origin + window.location.pathname + '#' + s.id)}</link><pubDate>${date}</pubDate><description>${text}...</description></item>`; }).join('\n');
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>HMG SermonScribe Podcast</title><link>${escapeHtml(window.location.origin + window.location.pathname)}</link><description>Podcast feed of sermons transcribed with HMG SermonScribe v4</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  downloadBlob('sermonscribe-podcast.rss', 'application/rss+xml', rss);
}

export function exportJSON(sermon) { downloadBlob(`${slugify(sermon.title)}.json`, 'application/json', JSON.stringify(sermon, null, 2)); }

function generateDayQuestion(day, themes, verses) { const t = themes[0] || 'faith'; const v = verses[0] || 'the Word'; const q = [`How does ${v} challenge your understanding of ${t}?`,`What area of your life needs more ${t} this week?`,`Who can you share this message about ${t} with today?`,`What does ${v} teach you about trusting God in difficult moments?`,`Write one commitment you will make to grow in ${t}.`]; return q[day - 1] || q[0]; }
function generateDayAction(day, themes) { const t = themes[0] || 'faith'; const a = [`Read and meditate on the key scripture today.`,`Journal one specific application of ${t} in your life.`,`Call or message someone to encourage them in ${t}.`,`Spend 15 minutes in prayer specifically about ${t}.`,`Choose one habit that reflects ${t} and practice it daily this week.`]; return a[day - 1] || a[0]; }
function generateDayPrayer(day, themes) { const t = themes[0] || 'faith'; const p = [`Lord, open my heart to receive Your Word about ${t}.`,`Father, show me where I need to grow in ${t}.`,`Holy Spirit, give me boldness to live out ${t}.`,`Lord, let Your truth about ${t} transform my mind and actions.`,`Thank You, God, for the gift of Your Word and the power of ${t}.`]; return p[day - 1] || p[0]; }
