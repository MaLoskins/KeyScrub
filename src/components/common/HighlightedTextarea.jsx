import { useRef, useCallback, useEffect, useMemo } from 'react';

/**
 * Build segments from a sorted array of { start, end } ranges.
 * Each segment is { text, hl: boolean }.
 * Ranges are [start, end) -- end is exclusive.
 */
function buildSegmentsFromRanges(text, ranges) {
  if (!ranges || ranges.length === 0 || !text) {
    return [{ text: text || '', hl: false }];
  }

  // Sort by start position, merge overlapping
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= prev.end) {
      prev.end = Math.max(prev.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }

  const segments = [];
  let pos = 0;

  for (const range of merged) {
    // Clamp to text bounds
    const start = Math.max(0, range.start);
    const end = Math.min(text.length, range.end);
    if (start >= text.length) break;

    if (start > pos) {
      segments.push({ text: text.slice(pos, start), hl: false });
    }
    if (end > start) {
      segments.push({ text: text.slice(start, end), hl: true });
    }
    pos = end;
  }

  if (pos < text.length) {
    segments.push({ text: text.slice(pos), hl: false });
  }

  return segments.length ? segments : [{ text, hl: false }];
}

/**
 * A textarea with an optional highlight backdrop.
 *
 * Supports two highlighting modes:
 *   1. `highlightRanges` -- array of { start, end } for exact position highlighting
 *   2. `highlight` -- a needle string (all occurrences highlighted)
 *
 * Ranges take precedence when provided and non-empty.
 */
export default function HighlightedTextarea({
  value = '',
  onChange,
  readOnly = false,
  placeholder = '',
  highlight = '',
  highlightRanges = null,
  wrapText = true,
  className = '',
  onBlur,
  autoFocus = false,
}) {
  const backdropRef = useRef(null);
  const textareaRef = useRef(null);

  const syncScroll = useCallback(() => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, highlight, highlightRanges, syncScroll]);

  // Decide which mode: ranges (precise) vs string search (legacy/input side)
  const hasRanges = highlightRanges && highlightRanges.length > 0;
  const hasNeedle = highlight.length > 0;
  const isHighlighting = (hasRanges || hasNeedle) && value.length > 0;

  const segments = useMemo(() => {
    if (!isHighlighting) return null;

    if (hasRanges) {
      return buildSegmentsFromRanges(value, highlightRanges);
    }

    // Fallback: string-search for input-side highlighting
    // (non-ASCII originals are safe to search for -- no false positives)
    return buildSegmentsFromNeedle(value, highlight);
  }, [isHighlighting, hasRanges, value, highlightRanges, highlight]);

  return (
    <div className={`ht-container ${wrapText ? '' : 'ht-nowrap'}`}>
      <div ref={backdropRef} className="ht-backdrop" aria-hidden="true">
        <div className="ht-content">
          {isHighlighting && segments
            ? segments.map((seg, i) =>
                seg.hl ? (
                  <mark key={i} className="ht-mark">{seg.text}</mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )
            : value}
          {'\n'}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className={`ht-textarea ${isHighlighting ? 'ht-textarea--transparent' : ''} ${className}`}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        onScroll={syncScroll}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
    </div>
  );
}

/**
 * String-search segmenter -- used for input-side highlighting where
 * the needle is a non-ASCII character (no false-positive risk).
 */
function buildSegmentsFromNeedle(text, needle) {
  if (!needle || !text) return [{ text: text || '', hl: false }];

  const segments = [];
  let lastIndex = 0;

  if ([...needle].length === 1) {
    const chars = [...text];
    let strIdx = 0;
    for (const ch of chars) {
      if (ch === needle) {
        if (strIdx > lastIndex) {
          segments.push({ text: text.slice(lastIndex, strIdx), hl: false });
        }
        segments.push({ text: ch, hl: true });
        lastIndex = strIdx + ch.length;
      }
      strIdx += ch.length;
    }
  } else {
    let idx = text.indexOf(needle, lastIndex);
    while (idx !== -1) {
      if (idx > lastIndex) {
        segments.push({ text: text.slice(lastIndex, idx), hl: false });
      }
      segments.push({ text: needle, hl: true });
      lastIndex = idx + needle.length;
      idx = text.indexOf(needle, lastIndex);
    }
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), hl: false });
  }

  return segments.length ? segments : [{ text, hl: false }];
}
