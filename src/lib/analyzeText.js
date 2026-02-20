/**
 * Analyze a string and return an inventory of non-standard characters
 * grouped by category.
 *
 * Returns: {
 *   hidden:      [{ char, label, positions: [number] }],
 *   punctuation: [{ char, label, positions: [number] }],
 *   emoji:       [{ char, label, positions: [number] }],
 *   accent:      [{ char, label, positions: [number] }],
 *   other:       [{ char, label, positions: [number] }],
 *   totalIssues: number,
 * }
 *
 * Pure function — does not mutate input.
 */

import { DEFAULT_RULES } from './defaultRules.js';

// Build a lookup from character → rule (for labelling)
const RULE_MAP = new Map();
for (const rule of DEFAULT_RULES) {
  RULE_MAP.set(rule.find, rule);
}

// ── Category detectors ───────────────────────────────────────────

const HIDDEN_RE =
  /[\u200B-\u200F\u00AD\uFEFF\u2060-\u2064\u180E\u034F\u061C\u2066-\u2069\u202A-\u202E]/;

// Very broad emoji regex — covers most common emoji ranges
const EMOJI_RE =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{200D}\u{20E3}]/u;

// Characters with diacritics / accents (composed or combining marks)
const COMBINING_RE = /[\u0300-\u036F\u0100-\u024F\u1E00-\u1EFF]/;

function isHidden(ch) {
  return HIDDEN_RE.test(ch);
}

function isEmoji(ch) {
  return EMOJI_RE.test(ch);
}

function hasAccent(ch) {
  if (ch.length > 1) return false;
  const code = ch.codePointAt(0);
  // Extended Latin with diacritics
  if (code >= 0x00C0 && code <= 0x00FF && code !== 0x00D7 && code !== 0x00F7)
    return true;
  if (code >= 0x0100 && code <= 0x024F) return true;
  if (code >= 0x1E00 && code <= 0x1EFF) return true;
  if (COMBINING_RE.test(ch)) return true;
  return false;
}

function isPunctuation(ch) {
  const rule = RULE_MAP.get(ch);
  return rule && rule.category === 'punctuation';
}

function isAscii(ch) {
  const code = ch.codePointAt(0);
  return code >= 0x20 && code <= 0x7E;
}

function isBasicWhitespace(ch) {
  return ch === '\n' || ch === '\r' || ch === '\t';
}

function labelFor(ch) {
  const rule = RULE_MAP.get(ch);
  if (rule) return rule.label;
  const code = ch.codePointAt(0);
  if (code <= 0x20) return `Control character`;
  return `Non-ASCII character`;
}

// ── Main analysis function ───────────────────────────────────────

export function analyzeText(text) {
  const result = {
    hidden: [],
    punctuation: [],
    emoji: [],
    accent: [],
    other: [],
    totalIssues: 0,
  };

  if (!text) return result;

  // Collect by character identity
  const buckets = new Map(); // char → { char, category, label, positions }

  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // Skip normal ASCII + basic whitespace
    if (isAscii(ch) || isBasicWhitespace(ch)) continue;

    let category;
    if (isHidden(ch)) category = 'hidden';
    else if (isPunctuation(ch)) category = 'punctuation';
    else if (isEmoji(ch)) category = 'emoji';
    else if (hasAccent(ch)) category = 'accent';
    else category = 'other';

    const key = ch;
    if (!buckets.has(key)) {
      buckets.set(key, {
        char: ch,
        category,
        label: labelFor(ch),
        positions: [],
      });
    }
    buckets.get(key).positions.push(i);
  }

  for (const entry of buckets.values()) {
    const target = result[entry.category];
    if (target) {
      target.push(entry);
      result.totalIssues += entry.positions.length;
    }
  }

  // Sort each bucket by count descending
  for (const cat of ['hidden', 'punctuation', 'emoji', 'accent', 'other']) {
    result[cat].sort((a, b) => b.positions.length - a.positions.length);
  }

  return result;
}
