import { useState, useCallback, useRef } from 'react';
import HighlightedTextarea from '../common/HighlightedTextarea.jsx';
import MarkdownPreview from '../common/MarkdownPreview.jsx';

export default function TextWorkspace({
  inputText,
  onInputChange,
  onClear,
  outputText,
  onCopy,
  totalChanges,
  highlightInput,
  highlightInputRanges,
  highlightOutputRanges,
  wrapText,
  markdownPreview,
}) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedPlain, setCopiedPlain] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const outputPreviewRef = useRef(null);

  // -- Copy handlers --

  const handleCopyMarkdown = useCallback(() => {
    if (outputText) navigator.clipboard.writeText(outputText);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1500);
  }, [outputText]);

  const handleCopyPlain = useCallback(() => {
    if (outputPreviewRef.current) {
      navigator.clipboard.writeText(outputPreviewRef.current.innerText);
    } else if (outputText) {
      navigator.clipboard.writeText(outputText);
    }
    setCopiedPlain(true);
    setTimeout(() => setCopiedPlain(false), 1500);
  }, [outputText]);

  const hasContent = inputText.length > 0;
  const hasOutput = outputText.length > 0;

  // Input panel shows preview when: preview on, has content, NOT focused for editing
  const showInputPreview = markdownPreview && hasContent && !inputFocused;

  return (
    <div className="workspace">
      {/* -- Input panel -- */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-label">Paste text</span>
          {hasContent && (
            <button className="btn-ghost" onClick={onClear} type="button">
              Clear
            </button>
          )}
        </div>

        <div className="panel-body">
          {showInputPreview ? (
            <div
              className="md-preview-clickable"
              onClick={() => setInputFocused(true)}
              title="Click to edit"
            >
              <MarkdownPreview
                value={inputText}
                placeholder="Paste your text here…"
              />
            </div>
          ) : (
            <HighlightedTextarea
              value={inputText}
              onChange={onInputChange}
              placeholder="Paste your text here…"
              highlight={highlightInput || ''}
              highlightRanges={highlightInputRanges}
              wrapText={wrapText}
              onBlur={markdownPreview ? () => setInputFocused(false) : undefined}
              autoFocus={inputFocused}
            />
          )}
        </div>

        <div className="panel-footer">
          <span className="char-count">{inputText.length} chars</span>
          {showInputPreview && (
            <span className="preview-badge">preview · click to edit</span>
          )}
        </div>
      </div>

      {/* -- Divider -- */}
      <div className="divider">
        <div className="divider-line" />
        <span className="divider-icon">{totalChanges > 0 ? '✦' : '→'}</span>
        <div className="divider-line" />
      </div>

      {/* -- Output panel -- */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-label">
            Cleaned text
            {totalChanges > 0 && (
              <span className="badge">{totalChanges} changed</span>
            )}
          </span>

          <div className="panel-header-actions">
            {markdownPreview ? (
              <>
                <button
                  className="btn-primary"
                  onClick={handleCopyPlain}
                  disabled={!hasOutput}
                  type="button"
                >
                  {copiedPlain ? 'Copied!' : 'Copy'}
                </button>
                <button
                  className="btn-ghost"
                  onClick={handleCopyMarkdown}
                  disabled={!hasOutput}
                  type="button"
                >
                  {copiedMd ? 'Copied!' : 'Copy MD'}
                </button>
              </>
            ) : (
              <button
                className="btn-primary"
                onClick={handleCopyMarkdown}
                disabled={!hasOutput}
                type="button"
              >
                {copiedMd ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        <div className="panel-body">
          {markdownPreview && hasOutput ? (
            <MarkdownPreview
              ref={outputPreviewRef}
              value={outputText}
              placeholder="Cleaned text will appear here…"
            />
          ) : (
            <HighlightedTextarea
              value={outputText}
              readOnly
              placeholder="Cleaned text will appear here…"
              highlightRanges={highlightOutputRanges}
              wrapText={wrapText}
            />
          )}
        </div>

        <div className="panel-footer">
          <span className="char-count">{outputText.length} chars</span>
          {markdownPreview && hasOutput && (
            <span className="preview-badge">preview</span>
          )}
        </div>
      </div>
    </div>
  );
}
