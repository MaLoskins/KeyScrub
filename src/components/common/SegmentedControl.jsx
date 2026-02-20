export default function SegmentedControl({ label, value, onChange, options }) {
  return (
    <div className="segmented-row">
      {label && <span className="segmented-label">{label}</span>}
      <div className="segmented-control">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`segmented-btn ${
              value === opt.value ? 'segmented-btn--active' : ''
            }`}
            onClick={() => onChange(opt.value)}
            title={opt.description || ''}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
