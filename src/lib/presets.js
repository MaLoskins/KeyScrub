/**
 * Presets map a user-friendly strictness level to a concrete settings object.
 *
 * Two levels:
 *   Standard - converts non-ASCII symbols via any-ascii, respects user prefs.
 *   Strict   - forces full ASCII output (accents simplified, emojis converted).
 */

export const PRESETS = {
  standard: {
    key: 'standard',
    label: 'Standard',
    description: 'Recommended cleanup',
    settings: {
      emojiMode: 'remove',
      fixPunctuation: true,
      removeHidden: true,
      keepAccents: true,
      preserveCode: true,
      preserveLinks: true,
      wrapText: true,
      markdownPreview: true,
    },
  },
  strict: {
    key: 'strict',
    label: 'Strict',
    description: 'ASCII-only output',
    settings: {
      emojiMode: 'remove',
      fixPunctuation: true,
      removeHidden: true,
      keepAccents: false,
      preserveCode: true,
      preserveLinks: true,
      wrapText: true,
      markdownPreview: true,
    },
  },
};

export const PRESET_KEYS = Object.keys(PRESETS);

export function getPresetSettings(key) {
  const preset = PRESETS[key];
  if (!preset) return PRESETS.standard.settings;
  return { ...preset.settings };
}

export const DEFAULT_SETTINGS = {
  ...PRESETS.standard.settings,
  strictness: 'standard',
};
