export default function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="toggle-row">
      <span className="toggle-label-wrap">
        <span className="toggle-label-text">{label}</span>
        {hint && <span className="toggle-hint">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-switch ${checked ? 'toggle-switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </label>
  );
}
