/* ============================================
 HMG SermonScribe v3 — Content Repurposer
 Enterprise-grade content transformation.
 ============================================ */

import { stripHtml, getKeywords, extractTopSentences, capitalize } from './utils.js';

export function generateSocialKit(sermon) {
  const text = stripHtml(sermon.content);
  const quotes = extractTopSentences(text, 5);
  const keywords = getKeywords(text);
  const hashtags = keywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ');

  const posts = quotes.map((quote, i) => {
    return {
      x: `📌 ${quote}\n\n${hashtags} #SermonScribe`,
      facebook: `✨ Inspiring thought from today's message: "${quote}"\n\nJoin us as we dive deeper into ${keywords[0] || 'God's Word'}. ${hashtags}`,
      instagram: `"${quote}"\n.\n.\n${hashtags} #Faith #Church #Growth`
    };
  });

  return { posts, hashtags };
}

export function generateBlogDraft(sermon) {
  const text = stripHtml(sermon.content);
  const quotes = extractTopSentences(text, 3);
  const keywords = getKeywords(text);

  return `
# ${sermon.title}
*By ${sermon.preacher || 'The Pastor'}*

## Introduction
${quotes[0] || 'Explore the powerful truths from today's message.'}

## Key Takeaways
${keywords.map(k => `- **${k}**: How this theme transforms our daily walk.`).join('\n')}

## Deep Dive
${text.slice(0, 500)}... [Full sermon available in archives]

## Final Reflection
"${quotes[1] || 'Reflect on the grace of God today.'}"

---
*Originally delivered on ${sermon.date}.*
  `.trim();
}

export function generateNewsletter(sermon) {
  const text = stripHtml(sermon.content);
  const quote = extractTopSentences(text, 1)[0] || 'Join us in reflecting on today\'s word.';

  return `
Subject: 💌 Weekly Reflection: ${sermon.title}

Dear Church Family,

We were blessed by today's message, "${sermon.title}". 

One key highlight was: "${quote}"

We encourage you to spend time this week meditating on this truth and applying it to your life.

Blessings,
${sermon.preacher || 'Your Ministry Team'}
  `.trim();
}
