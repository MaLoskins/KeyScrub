import { useState, useCallback } from 'react';

function buildSummary(changeLog) {
  const cats = { hidden: 0, punctuation: 0, emoji: 0, accent: 0, other: 0, custom: 0 };
  let skippedTotal = 0;
  for (const entry of changeLog) {
    if (entry.skipped) { skippedTotal += entry.count; continue; }
    const cat = entry.category in cats ? entry.category : 'other';
    cats[cat] += entry.count;
  }
  const parts = [];
  if (cats.hidden > 0) parts.push(`${cats.hidden} hidden`);
  if (cats.punctuation > 0) parts.push(`${cats.punctuation} punctuation`);
  if (cats.emoji > 0) parts.push(`${cats.emoji} emoji`);
  if (cats.accent > 0) parts.push(`${cats.accent} accent`);
  if (cats.other > 0) parts.push(`${cats.other} symbol`);
  if (cats.custom > 0) parts.push(`${cats.custom} custom`);
  if (skippedTotal > 0) parts.push(`${skippedTotal} skipped`);
  return parts;
}

function displayChar(ch) {
  if (!ch) return '';
  if (ch.length === 1) {
    const code = ch.codePointAt(0);
    if (
      code < 0x20 ||
      (code >= 0x200b && code <= 0x200f) ||
      code === 0xfeff ||
      code === 0x00ad ||
      (code >= 0x2060 && code <= 0x2064) ||
      (code >= 0x2066 && code <= 0x2069) ||
      (code >= 0x202a && code <= 0x202e) ||
      code === 0x180e ||
      code === 0x034f ||
      code === 0x061c
    ) {
      return `[U+${code.toString(16).toUpperCase().padStart(4, '0')}]`;
    }
  }
  return ch;
}

function EditableCell({ value, onChange, isModified, className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = useCallback(() => {
    setDraft(value);
    setEditing(true);
  }, [value]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  }, [draft, value, onChange]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') {
        setDraft(value);
        setEditing(false);
      }
    },
    [commit, value]
  );

  if (editing) {
    return (
      <input
        className="changes-edit-input"
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      className={`changes-cell-editable ${className || ''} ${isModified ? 'changes-cell--modified' : ''}`}
      onClick={startEdit}
      title="Click to edit"
    >
      <code>{value || '(removed)'}</code>
      <span className="changes-cell-edit-icon">✎</span>
    </button>
  );
}

export default function ChangesPanel({
  changeLog,
  totalChanges,
  rules,
  onAddOrUpdateOverride,
  onRemoveOverride,
  onSkipChar,
  onUnskipChar,
  onHoverEntry,
}) {
  const customOverrides = new Set();
  if (rules) {
    for (const r of rules) {
      if (r.category === 'custom') customOverrides.add(r.find);
    }
  }

  const summaryParts = buildSummary(changeLog);
  const activeCount = changeLog.filter((e) => !e.skipped).reduce((s, e) => s + e.count, 0);
  const skippedCount = changeLog.filter((e) => e.skipped).reduce((s, e) => s + e.count, 0);

  const handleReplaceEdit = useCallback(
    (original, newReplace) => {
      onAddOrUpdateOverride(original, newReplace);
    },
    [onAddOrUpdateOverride]
  );

  const handleMouseEnter = useCallback(
    (entry) => { if (onHoverEntry) onHoverEntry(entry); },
    [onHoverEntry]
  );

  const handleMouseLeave = useCallback(() => {
    if (onHoverEntry) onHoverEntry(null);
  }, [onHoverEntry]);

  const hasAnyEntries = changeLog.length > 0;

  return (
    <aside className="changes-sidebar">
      <h3 className="changes-sidebar-heading">What changed</h3>

      {!hasAnyEntries ? (
        <p className="changes-empty">
          No changes detected. Paste text on the left to see what gets cleaned up.
        </p>
      ) : (
        <>
          {/* -- Summary strip -- */}
          <div className="changes-summary">
            <span className="changes-summary-icon">✦</span>
            <span className="changes-summary-text">
              {activeCount} change{activeCount !== 1 ? 's' : ''}
              {skippedCount > 0 && `, ${skippedCount} skipped`}
              {summaryParts.length > 0 && ': '}
              {summaryParts.join(', ')}
            </span>
          </div>

          {/* -- Scrollable table -- */}
          <div className="changes-table-scroll">
            <table className="changes-table">
              <thead>
                <tr>
                  <th>Found</th>
                  <th>Replaced with</th>
                  <th className="changes-th-count">#</th>
                  <th className="changes-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                {changeLog.map((entry, i) => {
                  const isOverridden = customOverrides.has(entry.original);
                  const isSkipped = entry.skipped;

                  // Determine row class
                  let rowClass = '';
                  if (isSkipped) rowClass = 'changes-row--skipped';
                  else if (isOverridden) rowClass = 'changes-row--modified';

                  return (
                    <tr
                      key={i}
                      className={rowClass}
                      onMouseEnter={() => handleMouseEnter(entry)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Found column */}
                      <td className="changes-td-found">
                        <code className="changes-found-char">
                          {displayChar(entry.original)}
                        </code>
                        <span className="changes-found-label">{entry.label}</span>
                      </td>

                      {/* Replaced with */}
                      <td className="changes-td-replace">
                        {isSkipped ? (
                          /* Skipped: show the would-be replacement struck through */
                          <span className="changes-replace--skipped">
                            <code>{entry.replacement || '(removed)'}</code>
                            <span className="changes-skipped-tag">kept</span>
                          </span>
                        ) : (
                          /* Active: editable cell */
                          <>
                            <EditableCell
                              value={entry.replacement}
                              onChange={(newVal) =>
                                handleReplaceEdit(entry.original, newVal)
                              }
                              isModified={isOverridden}
                              className={
                                isOverridden
                                  ? 'changes-replace--modified'
                                  : 'changes-replace--default'
                              }
                            />
                            {isOverridden && (
                              <button
                                type="button"
                                className="changes-revert-btn"
                                title="Revert to default"
                                onClick={() => onRemoveOverride(entry.original)}
                              >
                                ↺
                              </button>
                            )}
                          </>
                        )}
                      </td>

                      {/* Count */}
                      <td className="changes-td-count">{entry.count}</td>

                      {/* Skip / Unskip action */}
                      <td className="changes-td-actions">
                        {isSkipped ? (
                          <button
                            type="button"
                            className="changes-action-btn changes-action-btn--restore"
                            title="Restore conversion"
                            onClick={() => onUnskipChar(entry.original)}
                          >
                            ↺
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="changes-action-btn changes-action-btn--skip"
                            title="Skip -- keep original character"
                            onClick={() => onSkipChar(entry.original)}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="changes-legend">
            <span className="changes-legend-item">
              <span className="changes-legend-dot changes-legend-dot--default" />
              Default
            </span>
            <span className="changes-legend-item">
              <span className="changes-legend-dot changes-legend-dot--modified" />
              Modified
            </span>
            <span className="changes-legend-item">
              <span className="changes-legend-dot changes-legend-dot--skipped" />
              Skipped
            </span>
          </div>
        </>
      )}
    </aside>
  );
}
