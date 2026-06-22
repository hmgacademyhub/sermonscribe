/* ============================================
 HMG SermonScribe v3 — Advanced Outline Generator
 ============================================ */

import { stripHtml, getKeywords, extractTopSentences } from './utils.js';

export function generateAdvancedOutline(sermon) {
  const content = sermon.content || '';
  const text = stripHtml(content);
  const keywords = getKeywords(text);
  
  // Extract sections based on headings
  const sections = [];
  const div = document.createElement('div');
  div.innerHTML = content;
  
  const headings = div.querySelectorAll('h2, h3');
  if (headings.length > 0) {
    headings.forEach((h, i) => {
      let nextEl = h.nextElementSibling;
      let sectionText = '';
      while (nextEl && nextEl.tagName !== 'H2' && nextEl.tagName !== 'H3') {
        sectionText += nextEl.textContent + ' ';
        nextEl = nextEl.nextElementSibling;
      }
      sections.push({
        title: h.textContent.trim(),
        level: h.tagName,
        summary: extractTopSentences(sectionText, 1)[0] || 'No detailed summary available.'
      });
    });
  } else {
    // Fallback if no headings: split by paragraphs
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 50);
    paragraphs.slice(0, 5).forEach((p, i) => {
      sections.push({
        title: `Key Point ${i+1}`,
        level: 'H2',
        summary: p.slice(0, 120) + '...'
      });
    });
  }

  let outline = `# Sermon Outline: ${sermon.title}\n`;
  outline += `**Date:** ${sermon.date} | **Preacher:** ${sermon.preacher}\n\n`;
  
  outline += `## 🎯 Core Theme\n${keywords.join(', ') || 'General Faith'}\n\n`;
  
  outline += `## 📖 Structure\n`;
  sections.forEach(s => {
    const prefix = s.level === 'H2' ? '###' : '####';
    outline += `${prefix} ${s.title}\n> ${s.summary}\n\n`;
  });
  
  outline += `## 🔑 Key Verses\n`;
  if (sermon.verses && sermon.verses.length > 0) {
    outline += sermon.verses.map(v => `- ${v.ref}: ${v.text}`).join('\n');
  } else {
    outline += `No specific verses recorded.`;
  }
  
  outline += `\n\n## 💡 Final Application\nReflect on how these points challenge your current walk with Christ.`;
  
  return outline;
}
