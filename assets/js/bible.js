/* HMG SermonScribe v4 - Bible Module */
import { getSettings, cacheVerse, getCachedVerse } from './storage.js';

let currentTranslation = 'kjv';
export function setTranslation(t) { currentTranslation = t; }
export function getTranslation() { return currentTranslation; }
export function getTranslations() { return ['kjv','niv','esv','nkjv','nlt','nasb']; }
export function getBooks() { return ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation']; }

const COMMON_VERSES = [
  { ref: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
  { ref: 'Romans 8:28', text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.' },
  { ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' },
  { ref: 'Isaiah 41:10', text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
  { ref: 'Romans 3:23', text: 'For all have sinned, and come short of the glory of God.' },
  { ref: 'Romans 6:23', text: 'For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.' },
  { ref: 'Psalm 119:105', text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
  { ref: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { ref: 'Ephesians 2:8-9', text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.' },
  { ref: 'Matthew 11:28', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
  { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' },
  { ref: 'Isaiah 40:31', text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.' },
  { ref: 'Romans 12:2', text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.' },
  { ref: 'Joshua 1:9', text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.' },
  { ref: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.' },
  { ref: 'Psalm 91:1', text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.' },
  { ref: 'Matthew 6:33', text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
  { ref: 'James 1:5', text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.' },
  { ref: 'Proverbs 16:3', text: 'Commit thy works unto the LORD, and thy thoughts shall be established.' },
  { ref: 'Matthew 28:19-20', text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you.' },
  { ref: '2 Timothy 3:16-17', text: 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.' },
  { ref: '1 Corinthians 13:4-7', text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.' },
  { ref: 'Psalm 19:14', text: 'Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.' },
  { ref: 'Proverbs 22:6', text: 'Train up a child in the way he should go: and when he is old, he will not depart from it.' },
  { ref: 'Isaiah 55:8-9', text: 'For my thoughts are not your thoughts, neither are your ways my ways, saith the LORD. For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts.' },
  { ref: 'Romans 10:9', text: 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.' },
  { ref: 'Psalm 37:4', text: 'Delight thyself also in the LORD; and he shall give thee the desires of thine heart.' }
];

export function getAllVerses() { return [...COMMON_VERSES]; }
export function getVersesByBook(bookName) { return COMMON_VERSES.filter(v => v.ref.toLowerCase().startsWith(bookName.toLowerCase())); }
export function autocompleteVerse(query) { const q = query.toLowerCase().trim(); if (!q) return []; return COMMON_VERSES.filter(v => v.ref.toLowerCase().startsWith(q) || v.ref.toLowerCase().includes(q) || v.text.toLowerCase().includes(q)).slice(0, 8); }

const BOOK_PATTERNS = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Psalm','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];

export function detectReferences(text) {
  const refs = [];
  const regex = /((?:1|2|3)\s+)?([A-Za-z]+)\s+(\d+)(?::(\d+)(?:[-\u2013](\d+))?)?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const num = match[1] || ''; const book = match[2]; const chapter = match[3]; const verse = match[4] || ''; const endVerse = match[5] || '';
    const possibleBooks = BOOK_PATTERNS.filter(b => { const clean = b.replace(/^\d+\s*/, ''); return clean.toLowerCase() === book.toLowerCase() && (num ? b.startsWith(num.trim()) : true); });
    for (const b of possibleBooks) { const ref = `${b} ${chapter}${verse ? ':' + verse : ''}${endVerse ? '-' + endVerse : ''}`; if (!refs.find(r => r.ref === ref)) { const verseData = COMMON_VERSES.find(v => v.ref.toLowerCase() === ref.toLowerCase()); refs.push({ ref, text: verseData ? verseData.text : 'Click to fetch' }); } }
  }
  return refs;
}

export async function fetchVerse(ref, translation = 'kjv') {
  const cached = await getCachedVerse(ref, translation);
  if (cached) return cached;
  try {
    const cleanRef = ref.replace(/\s+/g, '+');
    const response = await fetch(`https://bible-api.com/${cleanRef}?translation=${translation}`);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const text = data.text || 'Verse not found';
    await cacheVerse(ref, text, translation);
    return text;
  } catch (e) {
    console.warn('Failed to fetch verse:', e);
    const verse = COMMON_VERSES.find(v => v.ref.toLowerCase() === ref.toLowerCase());
    return verse ? verse.text : 'Verse not found';
  }
}
