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

      <main className="main">
        <div className="layout">
          {/* Left sidebar: options */}
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

          {/* Right sidebar: what changed */}
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
    </div>
  );
}

export default App;
