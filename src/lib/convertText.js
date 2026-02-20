/**
 * Convert text according to settings and rules.
 *
 * Pure function: same input + settings + rules + skipped = same output.
 *
 * Returns: {
 *   text: string,
 *   changeLog: [{
 *     original, replacement, label, category, count, skipped,
 *     inputPositions:  [{ start, end }],
 *     outputPositions: [{ start, end }],
 *   }],
 *   totalChanges: number,
 * }
 */

import anyAscii from 'any-ascii';

// -- Helpers ------------------------------------------------------

function isAsciiSafe(ch) {
  for (let i = 0; i < ch.length; i++) {
    const c = ch.charCodeAt(i);
    if (c >= 0x20 && c <= 0x7e) continue;
    if (c === 0x09 || c === 0x0a || c === 0x0d) continue;
    return false;
  }
  return true;
}

function isAccentedLatin(ch) {
  const code = ch.codePointAt(0);
  return (
    (code >= 0x00c0 && code <= 0x00ff && code !== 0x00d7 && code !== 0x00f7) ||
    (code >= 0x0100 && code <= 0x024f) ||
    (code >= 0x1e00 && code <= 0x1eff)
  );
}

const EMOJI_RE =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u;

function isEmoji(ch) {
  return EMOJI_RE.test(ch);
}

function categorizeChar(ch) {
  const code = ch.codePointAt(0);
  if (isAccentedLatin(ch)) return { category: 'accent', label: 'Accent simplified' };
  if (isEmoji(ch)) return { category: 'emoji', label: 'Emoji converted' };
  if (code >= 0x0370 && code <= 0x03ff) return { category: 'other', label: 'Greek character' };
  if (code >= 0x0400 && code <= 0x04ff) return { category: 'other', label: 'Cyrillic character' };
  if (code >= 0x0600 && code <= 0x06ff) return { category: 'other', label: 'Arabic character' };
  if (code >= 0x0900 && code <= 0x097f) return { category: 'other', label: 'Devanagari character' };
  if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf) || (code >= 0xf900 && code <= 0xfaff))
    return { category: 'other', label: 'CJK character' };
  if ((code >= 0x2190 && code <= 0x21ff) || (code >= 0x27f0 && code <= 0x27ff) || (code >= 0x2900 && code <= 0x297f) || (code >= 0x2b00 && code <= 0x2bff))
    return { category: 'other', label: 'Arrow symbol' };
  if ((code >= 0x2200 && code <= 0x22ff) || (code >= 0x2100 && code <= 0x214f) || (code >= 0x2300 && code <= 0x23ff))
    return { category: 'other', label: 'Math/symbol' };
  if (code >= 0x20a0 && code <= 0x20cf) return { category: 'other', label: 'Currency symbol' };
  if (code >= 0x2000 && code <= 0x206f) return { category: 'punctuation', label: 'Typographic symbol' };
  if ((code >= 0x2500 && code <= 0x257f) || (code >= 0x25a0 && code <= 0x25ff) || (code >= 0x2580 && code <= 0x259f))
    return { category: 'other', label: 'Box/geometric symbol' };
  return { category: 'other', label: 'Non-ASCII character' };
}

function findCodeRanges(text) {
  const ranges = [];
  const fencedRe = /```[\s\S]*?```/g;
  let match;
  while ((match = fencedRe.exec(text)) !== null) {
    ranges.push([match.index, match.index + match[0].length - 1]);
  }
  return ranges;
}

function findLinkRanges(text) {
  const ranges = [];
  const re = /\[([^\]]*)\]\(([^)]+)\)|https?:\/\/[^\s)>]+/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    ranges.push([match.index, match.index + match[0].length - 1]);
  }
  return ranges;
}

function isInRanges(pos, ranges) {
  return ranges.some((r) => pos >= r[0] && pos <= r[1]);
}

/**
 * Figure out what a character WOULD be converted to, without applying it.
 * Used for skipped chars so the changelog shows the would-be replacement.
 */
function wouldConvertTo(ch, ruleMap, emojiMode, keepAccents) {
  // Check direct rule
  const rule = ruleMap.get(ch);
  if (rule) return { replacement: rule.replace, label: rule.label, category: rule.category };

  // Check emoji
  if (isEmoji(ch)) {
    if (emojiMode === 'remove') return { replacement: '', label: 'Emoji removed', category: 'emoji' };
    if (emojiMode === 'convert') return { replacement: anyAscii(ch) || '', label: 'Emoji converted', category: 'emoji' };
  }

  // Check accent (only if would be converted)
  if (!keepAccents && isAccentedLatin(ch)) {
    const ascii = anyAscii(ch);
    if (ascii !== ch) return { replacement: ascii, label: 'Accent simplified', category: 'accent' };
  }

  // any-ascii fallback
  const ascii = anyAscii(ch);
  if (ascii !== ch) {
    const { category, label } = categorizeChar(ch);
    return { replacement: ascii, label, category };
  }

  return null;
}

// -- Main conversion ----------------------------------------------

export function convertText(text, settings = {}, rules = [], skippedChars = null) {
  if (!text) {
    return { text: '', changeLog: [], totalChanges: 0 };
  }

  const {
    emojiMode = 'remove',
    fixPunctuation = true,
    removeHidden = true,
    keepAccents = true,
    preserveCode = true,
    preserveLinks = true,
  } = settings;

  const codeRanges = preserveCode ? findCodeRanges(text) : [];
  const linkRanges = preserveLinks ? findLinkRanges(text) : [];

  const ruleMap = new Map();
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.category === 'punctuation' && !fixPunctuation) continue;
    if (rule.category === 'hidden' && !removeHidden) continue;
    ruleMap.set(rule.find, rule);
  }

  const skipped = skippedChars instanceof Set ? skippedChars : new Set(skippedChars || []);

  const changeMap = new Map();

  function recordChange(original, replacement, label, category, inStart, inEnd, outStart, outEnd, isSkipped = false) {
    const key = original + '\u0000' + replacement + '\u0000' + (isSkipped ? 's' : 'a');
    if (!changeMap.has(key)) {
      changeMap.set(key, {
        original,
        replacement,
        label,
        category,
        count: 0,
        skipped: isSkipped,
        inputPositions: [],
        outputPositions: [],
      });
    }
    const entry = changeMap.get(key);
    entry.count++;
    entry.inputPositions.push({ start: inStart, end: inEnd });
    if (outEnd > outStart) {
      entry.outputPositions.push({ start: outStart, end: outEnd });
    }
  }

  const chars = [...text];
  const output = [];
  let strPos = 0;
  let outPos = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const charLen = ch.length;

    // -- Protected ranges --
    if (isInRanges(strPos, codeRanges) || isInRanges(strPos, linkRanges)) {
      output.push(ch);
      strPos += charLen;
      outPos += charLen;
      continue;
    }

    // -- Already ASCII? Pass through --
    if (isAsciiSafe(ch)) {
      output.push(ch);
      strPos += charLen;
      outPos += charLen;
      continue;
    }

    // -- Skipped? Pass through but record what WOULD have happened --
    if (skipped.has(ch)) {
      const would = wouldConvertTo(ch, ruleMap, emojiMode, keepAccents);
      if (would) {
        recordChange(ch, would.replacement, would.label, would.category,
          strPos, strPos + charLen, outPos, outPos + charLen, true);
      }
      output.push(ch);
      strPos += charLen;
      outPos += charLen;
      continue;
    }

    // -- 1. Direct rule match --
    const rule = ruleMap.get(ch);
    if (rule) {
      output.push(rule.replace);
      recordChange(ch, rule.replace, rule.label, rule.category,
        strPos, strPos + charLen, outPos, outPos + rule.replace.length);
      strPos += charLen;
      outPos += rule.replace.length;
      continue;
    }

    // -- 2. Emoji handling --
    if (isEmoji(ch)) {
      if (emojiMode === 'keep') {
        output.push(ch);
        strPos += charLen;
        outPos += charLen;
        continue;
      }
      if (emojiMode === 'remove') {
        recordChange(ch, '', 'Emoji removed', 'emoji',
          strPos, strPos + charLen, outPos, outPos);
        strPos += charLen;
        continue;
      }
      if (emojiMode === 'convert') {
        const replacement = anyAscii(ch) || '';
        output.push(replacement);
        recordChange(ch, replacement, 'Emoji converted', 'emoji',
          strPos, strPos + charLen, outPos, outPos + replacement.length);
        strPos += charLen;
        outPos += replacement.length;
        continue;
      }
    }

    // -- 3. Accent handling --
    if (keepAccents && isAccentedLatin(ch)) {
      output.push(ch);
      strPos += charLen;
      outPos += charLen;
      continue;
    }

    // -- 4. Universal any-ascii fallback --
    const ascii = anyAscii(ch);
    if (ascii !== ch) {
      const { category, label } = categorizeChar(ch);
      output.push(ascii);
      recordChange(ch, ascii, label, category,
        strPos, strPos + charLen, outPos, outPos + ascii.length);
      strPos += charLen;
      outPos += ascii.length;
      continue;
    }

    // -- 5. Unknown pass-through --
    output.push(ch);
    strPos += charLen;
    outPos += charLen;
  }

  const changeLog = [...changeMap.values()].sort((a, b) => {
    // Active changes first, then skipped
    if (a.skipped !== b.skipped) return a.skipped ? 1 : -1;
    return b.count - a.count;
  });

  // totalChanges only counts active (non-skipped) conversions
  const totalChanges = changeLog
    .filter((c) => !c.skipped)
    .reduce((sum, c) => sum + c.count, 0);

  return { text: output.join(''), changeLog, totalChanges };
}
