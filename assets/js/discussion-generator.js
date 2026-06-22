/* ============================================
 HMG SermonScribe v3 — Advanced Discussion Guide
 ============================================ */

import { generateDiscussionQuestions } from './utils.js';

export function generateAdvancedDiscussionGuide(sermon) {
  const questions = generateDiscussionQuestions(sermon.tags || [], sermon.verses || [], sermon.title);
  
  let guide = `# Group Discussion Guide: ${sermon.title}\n`;
  guide += `**Based on the message delivered by ${sermon.preacher || 'the Pastor'}**\n\n`;
  
  guide += `## 🧊 Ice Breaker\n`;
  guide += `Share one thing that stood out to you most from today's sermon. Why did it resonate with you?\n\n`;
  
  guide += `## 🔍 Deep Dive Questions\n`;
  questions.slice(0, 4).forEach((q, i) => {
    guide += `${i+1}. ${q}\n`;
  });
  
  guide += `\n## 🛠️ Practical Application\n`;
  guide += `1. What is one a-ha moment from today that changes how you view your week?\n`;
  guide += `2. If you were to explain this message to a non-believer, how would you summarize the core truth?\n`;
  guide += `3. What is one specific act of obedience this message is calling you to?\n\n`;
  
  guide += `## 🙏 Prayer Focus\n`;
  guide += `Pray for each other to not only be hearers of the word, but doers also. Focus specifically on the theme of ${sermon.tags?.[0] || 'faith'}.\n`;
  
  return guide;
}
