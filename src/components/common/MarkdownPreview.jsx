import { useMemo, forwardRef } from 'react';
import { marked } from 'marked';

// Configure marked for safe, sane defaults
marked.setOptions({
  breaks: true,       // GFM line breaks
  gfm: true,          // GitHub Flavored Markdown
});

/**
 * Renders markdown text as HTML inside a scrollable container.
 * Exposes a ref so the parent can read .innerText for plain-text copy.
 */
const MarkdownPreview = forwardRef(function MarkdownPreview(
  { value = '', placeholder = '', className = '' },
  ref
) {
  const html = useMemo(() => {
    if (!value) return '';
    return marked.parse(value);
  }, [value]);

  if (!value) {
    return (
      <div className={`md-preview ${className}`}>
        <span className="md-preview-placeholder">{placeholder}</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`md-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

export default MarkdownPreview;
