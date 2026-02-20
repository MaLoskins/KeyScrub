import { useState, useRef, useCallback } from 'react';
import Toggle from '../common/Toggle.jsx';
import Select from '../common/Select.jsx';
import SegmentedControl from '../common/SegmentedControl.jsx';
import Accordion from '../common/Accordion.jsx';
import { PRESETS, PRESET_KEYS } from '../../lib/presets.js';
import {
  exportToJSON,
  importFromJSON,
  downloadJSON,
} from '../../lib/settingsIO.js';

const EMOJI_OPTIONS = [
  { value: 'remove', label: 'Remove emojis' },
  { value: 'keep', label: 'Keep emojis' },
  { value: 'convert', label: 'Convert to words' },
];

const STRICTNESS_OPTIONS = PRESET_KEYS.map((k) => ({
  value: k,
  label: PRESETS[k].label,
  description: PRESETS[k].description,
}));

export default function OptionsPanel({
  settings,
  rules,
  onUpdateSettings,
  onApplyStrictness,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onImportCustomRules,
}) {
  const fileInputRef = useRef(null);

  const customRules = rules.filter((r) => r.category === 'custom');

  // -- Custom rule inputs ----------------------------------------─
  const [newFind, setNewFind] = useState('');
  const [newReplace, setNewReplace] = useState('');

  const handleAddRule = useCallback(() => {
    if (!newFind) return;
    onAddRule(newFind, newReplace);
    setNewFind('');
    setNewReplace('');
  }, [newFind, newReplace, onAddRule]);

  // -- Import / Export --------------------------------------------
  const handleExport = useCallback(() => {
    const json = exportToJSON(settings, rules);
    downloadJSON(json);
  }, [settings, rules]);

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = importFromJSON(reader.result);
        if (result.error) {
          alert('Import failed: ' + result.error);
          return;
        }
        if (result.settings) onUpdateSettings(result.settings);
        if (result.customRules?.length) onImportCustomRules(result.customRules);
      };
      reader.readAsText(file);
      // Reset so user can re-import the same file
      e.target.value = '';
    },
    [onUpdateSettings, onImportCustomRules]
  );

  return (
    <aside className="options-panel">
      <div className="options-section">
        <h3 className="options-heading">Options</h3>

        {/* -- Simple options -- */}
        <SegmentedControl
          label="Strictness"
          value={settings.strictness}
          onChange={onApplyStrictness}
          options={STRICTNESS_OPTIONS}
        />

        <Select
          label="Emojis"
          value={settings.emojiMode}
          onChange={(v) => onUpdateSettings({ emojiMode: v })}
          options={EMOJI_OPTIONS}
        />

        <Toggle
          label="Fix punctuation"
          hint="Smart quotes → straight quotes, fancy dashes → hyphens"
          checked={settings.fixPunctuation}
          onChange={(v) => onUpdateSettings({ fixPunctuation: v })}
        />

        <Toggle
          label="Remove hidden characters"
          hint="Strips invisible characters that can break formatting"
          checked={settings.removeHidden}
          onChange={(v) => onUpdateSettings({ removeHidden: v })}
        />

        <Toggle
          label="Keep accents"
          hint={
            !settings.keepAccents
              ? 'Accents will be simplified (é → e)'
              : 'Accented characters stay as-is'
          }
          checked={settings.keepAccents}
          onChange={(v) => onUpdateSettings({ keepAccents: v })}
        />

        <Toggle
          label="Wrap text"
          hint={
            settings.wrapText
              ? 'Long lines wrap to fit the panel'
              : 'Lines preserve original formatting, scroll horizontally'
          }
          checked={settings.wrapText}
          onChange={(v) => onUpdateSettings({ wrapText: v })}
        />

        <Toggle
          label="Markdown preview"
          hint={
            settings.markdownPreview
              ? 'Showing rendered markdown in both panels'
              : 'Showing raw text'
          }
          checked={settings.markdownPreview}
          onChange={(v) => onUpdateSettings({ markdownPreview: v })}
        />
      </div>

      {/* -- More options -- */}
      <div className="options-section">
        <Accordion title="Custom replacements" badge={customRules.length || null}>
          <div className="custom-rules">
            <div className="custom-rule-add">
              <input
                className="custom-rule-input"
                type="text"
                placeholder="Find…"
                value={newFind}
                onChange={(e) => setNewFind(e.target.value)}
              />
              <span className="custom-rule-arrow">→</span>
              <input
                className="custom-rule-input"
                type="text"
                placeholder="Replace with…"
                value={newReplace}
                onChange={(e) => setNewReplace(e.target.value)}
              />
              <button
                className="btn-ghost btn-small"
                onClick={handleAddRule}
                disabled={!newFind}
                type="button"
              >
                Add
              </button>
            </div>
            <p className="custom-rule-hint">
              Examples: — → --, ← → &lt;-, © → (c)
            </p>

            {customRules.length > 0 && (
              <ul className="custom-rule-list">
                {customRules.map((rule) => (
                  <li key={rule.id} className="custom-rule-item">
                    <span className="custom-rule-find">{rule.find || '…'}</span>
                    <span className="custom-rule-arrow">→</span>
                    <span className="custom-rule-replace">
                      {rule.replace || '(remove)'}
                    </span>
                    <button
                      className="btn-icon"
                      onClick={() => onRemoveRule(rule.id)}
                      title="Remove rule"
                      type="button"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Accordion>

        <Accordion title="Where cleaning applies">
          <Toggle
            label="Don't change code blocks"
            checked={settings.preserveCode}
            onChange={(v) => onUpdateSettings({ preserveCode: v })}
          />
          <Toggle
            label="Don't change links"
            checked={settings.preserveLinks}
            onChange={(v) => onUpdateSettings({ preserveLinks: v })}
          />
        </Accordion>

        <Accordion title="Backup & share settings">
          <div className="settings-io">
            <button
              className="btn-ghost"
              onClick={handleExport}
              type="button"
            >
              Export settings
            </button>
            <button
              className="btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Import settings
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </div>
        </Accordion>
      </div>
    </aside>
  );
}
