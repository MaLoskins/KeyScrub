# KeyScrub

**Paste AI text. Get clean ASCII.**

A simple-first tool for cleaning up Unicode artifacts from AI-generated text — smart quotes, hidden characters, fancy dashes, and more.

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── App.jsx                        # Thin composition root (layout + wiring)
├── App.css                        # All styles
├── main.jsx                       # Entry point
├── index.css                      # Global resets
├── components/
│   ├── Header.jsx                 # App header
│   ├── common/
│   │   ├── Accordion.jsx          # Collapsible section
│   │   ├── Toggle.jsx             # Toggle switch
│   │   ├── Select.jsx             # Dropdown select
│   │   └── SegmentedControl.jsx   # Multi-option switcher
│   └── panels/
│       ├── TextWorkspace.jsx      # Input/output two-pane editor
│       ├── OptionsPanel.jsx       # Settings sidebar
│       └── ChangesPanel.jsx       # What-changed summary + details
├── hooks/
│   └── useConverter.js            # Central state + derived data hook
└── lib/
    ├── analyzeText.js             # Pure text analysis (character inventory)
    ├── convertText.js             # Pure text conversion (rules + settings → output)
    ├── defaultRules.js            # Built-in replacement mappings
    ├── presets.js                 # Strictness presets (Gentle/Standard/Strict)
    └── settingsIO.js             # Export/import settings as JSON
```

## Design Principles

- **Simple-first UX**: Default screen is a basic copy/paste cleaner. Advanced features are behind collapsed "More options" sections.
- **Deterministic**: Same input + same settings + same rules = same output.
- **Pure logic**: All conversion and analysis functions are pure and unit-testable.
- **Never silent**: Every change is reflected in the "What changed?" panel.
