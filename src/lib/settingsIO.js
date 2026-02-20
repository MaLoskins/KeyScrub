/**
 * Settings & rules export/import utilities.
 */

export function exportToJSON(settings, rules) {
  const customRules = rules.filter((r) => r.category === 'custom');
  const payload = {
    version: 1,
    settings,
    customRules: customRules.map(({ id, find, replace, label, enabled }) => ({
      id,
      find,
      replace,
      label,
      enabled,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export function importFromJSON(json) {
  try {
    const data = JSON.parse(json);
    if (!data || data.version !== 1) {
      return { error: 'Unrecognized format' };
    }
    return {
      settings: data.settings || null,
      customRules: data.customRules || [],
      error: null,
    };
  } catch {
    return { error: 'Invalid JSON' };
  }
}

export function downloadJSON(content, filename = 'unieraser-settings.json') {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
