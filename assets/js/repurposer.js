/* HMG SermonScribe v4 - Repurposer Module */
import { stripHtml, getKeywords, detectReferences, extractTopSentences } from './utils.js';

export function generateSocialKit(sermon) {
  const text = stripHtml(sermon.content);
  const themes = getKeywords(text);
  const verses = detectReferences(text);
  const topSentences = extractTopSentences(text, 5);
  const mainVerse = verses.length > 0 ? verses[0].ref : 'Scripture';
  const mainTheme = themes[0] || 'Faith';
  const facebookPost = `${sermon.title}\n\n"${topSentences[0] || sermon.title}"\n\n${sermon.preacher ? 'Preached by ' + sermon.preacher : ''}\n${mainVerse ? ' ' + mainVerse : ''}\n\n#Sermon #${mainTheme} #Faith #Church`;
  const twitterPost = `"${(topSentences[0] || sermon.title).slice(0, 140)}"\n\n${sermon.title}\n${mainVerse || ''}\n\n#Sermon #Faith #${mainTheme}`;
  const instagramCaption = `${sermon.title}\n\n${topSentences[0] || ''}\n\n${mainVerse || ''}\n${sermon.preacher || ''}\n\n#Sermon #Faith #Church #Gospel #${mainTheme} #BibleStudy`;
  return { posts: [{ facebook: facebookPost, twitter: twitterPost, instagram: instagramCaption }, { facebook: `Today's Message: ${sermon.title}\n\n${topSentences[1] || ''}\n\n${mainVerse ? ' ' + mainVerse : ''}\n\n#SermonOfTheDay #${mainTheme}`, twitter: `Today's Message: ${sermon.title}\n\n${(topSentences[1] || '').slice(0, 140)}\n\n#Sermon #Faith`, instagram: `${sermon.title}\n\n${topSentences[1] || ''}\n\n#SermonOfTheDay #Faith #${mainTheme} #BibleVerse` }, { facebook: `Key Takeaway from ${sermon.title}:\n\n${topSentences[2] || 'Listen to the full sermon for powerful insights!'}\n\n${sermon.preacher ? ' ' + sermon.preacher : ''}\n\n#Faith #Church #${mainTheme}`, twitter: `Key takeaway:\n\n${(topSentences[2] || 'Listen to the full sermon!').slice(0, 180)}\n\n#Faith #${mainTheme}`, instagram: `${sermon.title} - Key Takeaway\n\n${topSentences[2] || 'Swipe for more!'}\n\n#Faith #Sermon #${mainTheme} #Gospel` }] };
}

export function generateBlogDraft(sermon) {
  const text = stripHtml(sermon.content);
  const themes = getKeywords(text);
  const verses = detectReferences(text);
  const intro = text.slice(0, 300);
  let blog = `# ${sermon.title}\n\n*By ${sermon.preacher || 'Guest Speaker'} | ${sermon.date || 'Today'}*\n\n> "${verses.length > 0 ? verses[0].ref + ' - ' + (verses[0].text || '') : 'Let the Word speak to your heart.'}"\n\n## Introduction\n\n${intro}\n\n## Key Themes\n\n`;
  themes.forEach(t => { blog += `- **${t}**: This theme runs throughout the message.\n`; });
  blog += `\n## Main Message\n\n${text.slice(300, 1500)}\n\n## Reflection\n\nTake time to meditate on the key scripture and consider how this message applies to your daily life.\n\n## Prayer\n\nLord, help us to understand and apply Your Word. May this message transform our hearts and minds. In Jesus' name, Amen.\n\n---\n\n*Originally preached at ${sermon.series || 'our church'} by ${sermon.preacher || 'Guest Speaker'}.*\n`;
  return blog;
}

export function generateNewsletter(sermon) {
  const text = stripHtml(sermon.content);
  const themes = getKeywords(text);
  const verses = detectReferences(text);
  const quote = text.split(/[.!?]+/).find(s => s.trim().length > 50 && s.trim().length < 200) || '';
  let email = `Subject: This Week's Sermon: ${sermon.title}\n\nDear Church Family,\n\n${sermon.preacher || 'Our pastor'} shared a powerful message titled "${sermon.title}"${sermon.series ? ' as part of our "' + sermon.series + '" series' : ''}.\n\n**Key Scripture:** ${verses.length > 0 ? verses[0].ref : 'TBD'}\n\n> "${quote.slice(0, 200)}..."\n\n**Key Themes:** ${themes.slice(0, 3).join(', ') || 'Faith, Hope, Love'}\n\nTake some time this week to reflect on the message and consider how God is speaking to you through it.\n\nBlessings,\nThe Church Communications Team`;
  return email;
}
