import { useState, useMemo, useCallback } from 'react';
import { DEFAULT_SETTINGS, getPresetSettings } from '../lib/presets.js';
import { getDefaultRules, createCustomRule } from '../lib/defaultRules.js';
import { analyzeText } from '../lib/analyzeText.js';
import { convertText } from '../lib/convertText.js';

export function useConverter() {
  const [inputText, setInputText] = useState('');
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [rules, setRules] = useState(() => getDefaultRules());
  const [skippedChars, setSkippedChars] = useState(() => new Set());

  // -- Derived ----------------------------------------------------

  const analysis = useMemo(() => analyzeText(inputText), [inputText]);

  const output = useMemo(
    () => convertText(inputText, settings, rules, skippedChars),
    [inputText, settings, rules, skippedChars]
  );

  // -- Settings callbacks -----------------------------------------

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyStrictness = useCallback((level) => {
    const preset = getPresetSettings(level);
    setSettings((prev) => ({ ...prev, ...preset, strictness: level }));
  }, []);

  // -- Rule callbacks ---------------------------------------------

  const addRule = useCallback((find = '', replace = '') => {
    const rule = createCustomRule(find, replace);
    setRules((prev) => [...prev, rule]);
    return rule;
  }, []);

  const updateRule = useCallback((id, patch) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }, []);

  const removeRule = useCallback((id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addOrUpdateOverride = useCallback((find, replace) => {
    // If this char was skipped, unskip it first since the user is now setting a custom value
    setSkippedChars((prev) => {
      if (prev.has(find)) {
        const next = new Set(prev);
        next.delete(find);
        return next;
      }
      return prev;
    });
    setRules((prev) => {
      const existing = prev.find(
        (r) => r.category === 'custom' && r.find === find
      );
      if (existing) {
        return prev.map((r) =>
          r.id === existing.id ? { ...r, replace } : r
        );
      }
      const rule = createCustomRule(find, replace);
      rule.label = 'Custom override';
      return [...prev, rule];
    });
  }, []);

  const removeOverride = useCallback((find) => {
    setRules((prev) =>
      prev.filter((r) => !(r.category === 'custom' && r.find === find))
    );
  }, []);

  // -- Skip callbacks ---------------------------------------------

  const skipChar = useCallback((ch) => {
    setSkippedChars((prev) => {
      const next = new Set(prev);
      next.add(ch);
      return next;
    });
  }, []);

  const unskipChar = useCallback((ch) => {
    setSkippedChars((prev) => {
      const next = new Set(prev);
      next.delete(ch);
      return next;
    });
  }, []);

  const importCustomRules = useCallback((customRules) => {
    setRules((prev) => {
      const withoutCustom = prev.filter((r) => r.category !== 'custom');
      const newCustom = customRules.map((r) => ({
        ...createCustomRule(r.find, r.replace),
        id: r.id || createCustomRule().id,
        label: r.label || 'Custom replacement',
        enabled: r.enabled !== false,
      }));
      return [...withoutCustom, ...newCustom];
    });
  }, []);

  // -- Text callbacks ---------------------------------------------

  const clearInput = useCallback(() => setInputText(''), []);

  const copyOutput = useCallback(() => {
    if (output.text) {
      navigator.clipboard.writeText(output.text);
    }
  }, [output.text]);

  return {
    inputText,
    setInputText,
    settings,
    rules,
    skippedChars,
    analysis,
    output,
    updateSettings,
    applyStrictness,
    addRule,
    updateRule,
    removeRule,
    addOrUpdateOverride,
    removeOverride,
    skipChar,
    unskipChar,
    importCustomRules,
    clearInput,
    copyOutput,
  };
}
