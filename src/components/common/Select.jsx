export default function Select({ label, value, onChange, options, hint }) {
  return (
    <label className="select-row">
      <span className="select-label-wrap">
        <span className="select-label-text">{label}</span>
        {hint && <span className="select-hint">{hint}</span>}
      </span>
      <select
        className="select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
