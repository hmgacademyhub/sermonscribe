/* HMG SermonScribe v4 - Outline Generator */
import { stripHtml, getKeywords, detectReferences, wordCount, fleschKincaid } from './utils.js';

export function generateAdvancedOutline(sermon) {
  const text = stripHtml(sermon.content);
  const keywords = getKeywords(text);
  const verses = detectReferences(text);
  const wc = wordCount(text);
  const fk = fleschKincaid(text);
  let outline = `# Sermon Outline: ${sermon.title}\n\n**Preacher:** ${sermon.preacher || 'Unknown'}\n**Date:** ${sermon.date || 'N/A'}\n**Series:** ${sermon.series || 'N/A'}\n**Duration:** ${sermon.duration || 'N/A'}\n**Word Count:** ${wc}\n**Readability:** Grade ${fk.grade}\n\n---\n\n`;
  outline += `## Introduction\n\n- **Topic:** ${sermon.title}\n- **Main Text:** ${verses.length > 0 ? verses[0].ref : 'TBD'}\n- **Key Theme:** ${keywords[0] || 'TBD'}\n\n`;
  const h2Matches = sermon.content.match(/<h2>(.*?)<\/h2>/g) || [];
  if (h2Matches.length > 0) {
    outline += `## Main Points\n\n`;
    h2Matches.forEach((m, i) => { const title = m.replace(/<h2>/g,'').replace(/<\/h2>/g,''); outline += `### Point ${i+1}: ${title}\n\n`; });
  } else {
    outline += `## Main Points\n\n1. Point One\n2. Point Two\n3. Point Three\n\n`;
  }
  outline += `## Scripture References\n\n`;
  if (verses.length > 0) { verses.forEach(v => { outline += `- ${v.ref}: ${v.text || 'TBD'}\n`; }); } else { outline += `- No scripture references detected\n`; }
  outline += `\n## Application\n\n- Personal Application: What does this mean for your life?\n- Church Application: How does this apply to our community?\n- Action Steps: What will you do this week?\n\n## Conclusion\n\n- Summary of key points\n- Call to action\n- Closing prayer\n`;
  return outline;
}
