/**
 * Escape a string for safe use inside a RegExp pattern.
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns true if `char` is an accented Latin letter that NFKD-decomposes
 * to ASCII letters only. Used to decide whether to preserve accents.
 */
export function isAccentedLatin(char) {
  const norm = char.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return norm.length > 0 && /^[a-zA-Z]+$/.test(norm) && char !== norm;
}

/**
 * Split `text` into segments that are either "protected" (code blocks, URLs)
 * or freely processable. Returns Array<{ text, isProtected, start, end }>.
 */
export function segmentText(text, protectCode, protectLinks) {
  const ranges = [];

  if (protectCode) {
    // Fenced code blocks: ```...```
    const fenced = /```[\s\S]*?```/g;
    let m;
    while ((m = fenced.exec(text)) !== null)
      ranges.push({ start: m.index, end: m.index + m[0].length });

    // Inline code: `...`
    const inline = /`[^`\n]+`/g;
    while ((m = inline.exec(text)) !== null)
      ranges.push({ start: m.index, end: m.index + m[0].length });
  }

  if (protectLinks) {
    const urls = /https?:\/\/[^\s)>\]"']+/g;
    let m;
    while ((m = urls.exec(text)) !== null)
      ranges.push({ start: m.index, end: m.index + m[0].length });
  }

  // Sort and merge overlapping ranges
  ranges.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const r of ranges) {
    if (merged.length && r.start <= merged[merged.length - 1].end)
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, r.end);
    else
      merged.push({ ...r });
  }

  const segments = [];
  let last = 0;
  for (const { start, end } of merged) {
    if (start > last)
      segments.push({ text: text.slice(last, start), isProtected: false });
    segments.push({ text: text.slice(start, end), isProtected: true });
    last = end;
  }
  if (last < text.length)
    segments.push({ text: text.slice(last), isProtected: false });
  if (!segments.length)
    segments.push({ text, isProtected: false });

  return segments;
}

/**
 * Generate a stable-enough unique ID for custom rules (not used in conversion output).
 */
export function generateId() {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Readable placeholder for invisible/non-printing characters. */
const INVISIBLE = new Set([
  '\u200B', '\u200C', '\u200D', '\u2060', '\uFEFF', '\u00AD',
  '\u200E', '\u200F',
]);
export function displayChar(char) {
  if (INVISIBLE.has(char)) return '[hidden]';
  if (char === '\u00A0' || char === '\u202F' || char === '\u200A' || char === '\u3000')
    return '[space]';
  return char;
}
