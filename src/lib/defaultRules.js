/**
 * Default replacement rules, organized by category.
 * Each rule: { id, category, label, find, replace, enabled }
 *
 * Categories:
 *   "punctuation" -- smart quotes, dashes, ellipsis, etc.
 *   "hidden"      -- zero-width joiners, soft hyphens, BOM, etc.
 *   "symbol"      -- misc typographic symbols (arrows, bullets, …)
 */

let _nextId = 1;
const rid = () => `default-${_nextId++}`;

// -- Smart punctuation --------------------------------------------
const PUNCTUATION_RULES = [
  // Smart / curly quotes → straight
  { find: '\u2018', replace: "'",  label: 'Left single quote' },
  { find: '\u2019', replace: "'",  label: 'Right single quote' },
  { find: '\u201C', replace: '"',  label: 'Left double quote' },
  { find: '\u201D', replace: '"',  label: 'Right double quote' },
  { find: '\u201A', replace: "'",  label: 'Single low-9 quote' },
  { find: '\u201E', replace: '"',  label: 'Double low-9 quote' },
  { find: '\u2039', replace: "'",  label: 'Single left angle quote' },
  { find: '\u203A', replace: "'",  label: 'Single right angle quote' },
  { find: '\u00AB', replace: '"',  label: 'Left guillemet' },
  { find: '\u00BB', replace: '"',  label: 'Right guillemet' },
  // Dashes
  { find: '\u2013', replace: '--',  label: 'En dash' },
  { find: '\u2014', replace: '--',  label: 'Em dash' },
  { find: '\u2015', replace: '--',  label: 'Horizontal bar' },
  // Ellipsis
  { find: '\u2026', replace: '...', label: 'Ellipsis' },
  // Spaces that look like normal spaces but aren't
  { find: '\u00A0', replace: ' ',   label: 'Non-breaking space' },
  { find: '\u202F', replace: ' ',   label: 'Narrow no-break space' },
  { find: '\u2007', replace: ' ',   label: 'Figure space' },
  { find: '\u2009', replace: ' ',   label: 'Thin space' },
  { find: '\u200A', replace: ' ',   label: 'Hair space' },
  { find: '\u2002', replace: ' ',   label: 'En space' },
  { find: '\u2003', replace: ' ',   label: 'Em space' },
  // Misc punctuation
  { find: '\u2022', replace: '*',   label: 'Bullet' },
  { find: '\u2023', replace: '>',   label: 'Triangle bullet' },
  { find: '\u2043', replace: '-',   label: 'Hyphen bullet' },
  { find: '\u2027', replace: '-',   label: 'Hyphenation point' },
  { find: '\u00B7', replace: '.',   label: 'Middle dot' },
  { find: '\u2212', replace: '-',   label: 'Minus sign' },
].map((r) => ({
  id: rid(),
  category: 'punctuation',
  enabled: true,
  ...r,
}));

// -- Hidden / zero-width characters -------------------------------
const HIDDEN_RULES = [
  { find: '\u200B', replace: '', label: 'Zero-width space' },
  { find: '\u200C', replace: '', label: 'Zero-width non-joiner' },
  { find: '\u200D', replace: '', label: 'Zero-width joiner' },
  { find: '\u200E', replace: '', label: 'Left-to-right mark' },
  { find: '\u200F', replace: '', label: 'Right-to-left mark' },
  { find: '\u00AD', replace: '', label: 'Soft hyphen' },
  { find: '\uFEFF', replace: '', label: 'Byte order mark' },
  { find: '\u2060', replace: '', label: 'Word joiner' },
  { find: '\u2061', replace: '', label: 'Function application' },
  { find: '\u2062', replace: '', label: 'Invisible times' },
  { find: '\u2063', replace: '', label: 'Invisible separator' },
  { find: '\u2064', replace: '', label: 'Invisible plus' },
  { find: '\u180E', replace: '', label: 'Mongolian vowel separator' },
  { find: '\u034F', replace: '', label: 'Combining grapheme joiner' },
  { find: '\u061C', replace: '', label: 'Arabic letter mark' },
  { find: '\u2066', replace: '', label: 'Left-to-right isolate' },
  { find: '\u2067', replace: '', label: 'Right-to-left isolate' },
  { find: '\u2068', replace: '', label: 'First strong isolate' },
  { find: '\u2069', replace: '', label: 'Pop directional isolate' },
  { find: '\u202A', replace: '', label: 'Left-to-right embedding' },
  { find: '\u202B', replace: '', label: 'Right-to-left embedding' },
  { find: '\u202C', replace: '', label: 'Pop directional formatting' },
  { find: '\u202D', replace: '', label: 'Left-to-right override' },
  { find: '\u202E', replace: '', label: 'Right-to-left override' },
].map((r) => ({
  id: rid(),
  category: 'hidden',
  enabled: true,
  ...r,
}));

export const DEFAULT_RULES = [...PUNCTUATION_RULES, ...HIDDEN_RULES];

/**
 * Return a fresh deep copy of the default rules so consumers can mutate safely.
 */
export function getDefaultRules() {
  return DEFAULT_RULES.map((r) => ({ ...r }));
}

/**
 * Create a blank custom rule.
 */
export function createCustomRule(find = '', replace = '') {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: 'custom',
    label: 'Custom replacement',
    find,
    replace,
    enabled: true,
  };
}
