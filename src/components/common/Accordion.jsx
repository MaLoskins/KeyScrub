import { useState } from 'react';

export default function Accordion({
  title,
  defaultOpen = false,
  badge,
  children,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`accordion ${open ? 'accordion--open' : ''} ${className}`}>
      <button
        className="accordion-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        type="button"
      >
        <span className="accordion-arrow">{open ? '▾' : '▸'}</span>
        <span className="accordion-title">{title}</span>
        {badge != null && <span className="accordion-badge">{badge}</span>}
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}
