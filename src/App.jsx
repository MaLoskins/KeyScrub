import { useState, useCallback } from 'react';
import { useConverter } from './hooks/useConverter.js';
import Header from './components/Header.jsx';
import OptionsPanel from './components/panels/OptionsPanel.jsx';
import TextWorkspace from './components/panels/TextWorkspace.jsx';
import ChangesPanel from './components/panels/ChangesPanel.jsx';
import './App.css';

function App() {
  const {
    inputText,
    setInputText,
    settings,
    rules,
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
  } = useConverter();

  // Hover state: which changeLog entry is being hovered in the right panel
  const [hoveredEntry, setHoveredEntry] = useState(null);

  const handleHoverEntry = useCallback((entry) => {
    setHoveredEntry(entry);
  }, []);

  return (
    <div className="app">
      <Header />

      <main className="main" role="main">
        <div className="layout">
          {/* Left sidebar: options (OptionsPanel renders its own <aside>) */}
          <OptionsPanel
            settings={settings}
            rules={rules}
            onUpdateSettings={updateSettings}
            onApplyStrictness={applyStrictness}
            onAddRule={addRule}
            onUpdateRule={updateRule}
            onRemoveRule={removeRule}
            onImportCustomRules={importCustomRules}
          />

          {/* Center: workspace */}
          <TextWorkspace
            inputText={inputText}
            onInputChange={setInputText}
            onClear={clearInput}
            outputText={output.text}
            onCopy={copyOutput}
            totalChanges={output.totalChanges}
            highlightInput={hoveredEntry?.original || ''}
            highlightInputRanges={hoveredEntry?.inputPositions || null}
            highlightOutputRanges={hoveredEntry?.outputPositions || null}
            wrapText={settings.wrapText}
            markdownPreview={settings.markdownPreview}
          />

          {/* Right sidebar: what changed (ChangesPanel renders its own <aside>) */}
          <ChangesPanel
            changeLog={output.changeLog}
            totalChanges={output.totalChanges}
            rules={rules}
            onAddOrUpdateOverride={addOrUpdateOverride}
            onRemoveOverride={removeOverride}
            onSkipChar={skipChar}
            onUnskipChar={unskipChar}
            onHoverEntry={handleHoverEntry}
          />
        </div>
      </main>

      {/* Footer: hidden SEO content for crawlers */}
      <footer className="sr-only">
        <h2>About KeyScrub</h2>
        <p>
          KeyScrub is a free, open-source Unicode text cleaner that runs
          entirely in your browser. It detects and converts non-ASCII characters
          including smart quotes, curly quotes, em dashes, en dashes, ellipsis
          characters, non-breaking spaces, zero-width spaces, zero-width joiners,
          byte order marks, directional formatting marks, and other hidden
          Unicode characters that can cause problems in code, data processing,
          and plain text environments.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Convert smart quotes and curly quotes to straight ASCII quotes</li>
          <li>Remove invisible zero-width Unicode characters (U+200B, U+FEFF, U+200D)</li>
          <li>Convert or remove emojis from text</li>
          <li>Simplify accented and diacritic characters to ASCII equivalents</li>
          <li>Preserve code blocks and URLs during conversion</li>
          <li>Custom find-and-replace rules for any character</li>
          <li>Real-time change log showing every conversion</li>
          <li>Skip specific characters to keep them unchanged</li>
          <li>Edit any replacement inline</li>
          <li>Export and import settings</li>
          <li>Standard and strict ASCII-only modes</li>
          <li>Markdown preview with rendered output</li>
          <li>100% client-side — no data leaves your browser</li>
        </ul>
        <h2>Common use cases</h2>
        <ul>
          <li>Cleaning text copied from Word, Google Docs, or PDFs</li>
          <li>Preparing text for code editors and terminals</li>
          <li>Fixing encoding issues in CSV and data files</li>
          <li>Removing hidden characters from user-submitted content</li>
          <li>Converting international text to ASCII-safe formats</li>
          <li>Stripping formatting from rich text sources</li>
        </ul>
      </footer>
    </div>
  );
}

export default App;