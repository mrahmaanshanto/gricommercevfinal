// settingsStore — saved settings with a version number (Nayeem's brief #16: "Version conflict instead of last-write-wins
// silent overwrite"). Every settings form (screens/settings-console/SetChrome.jsx › SettingsLogic) keeps its saved values
// here instead of only while the page is open.
//
//   readSettings(formId)   → { values, version, fieldVersions, savedAt, savedBy }
//   writeSettings(formId, changes, { baseVersion, by, force }) → { ok, version } or { conflict: { version, savedAt,
//                          savedBy, fields: [names saved elsewhere since baseVersion], values } }
//     A conflict is raised only when one of the fields being saved was saved by someone else after the page opened;
//     other fields saved meanwhile are simply kept (the page reloads them).
//   simulateOtherSave(formId, values, who) — the demo's "another admin saved this page" (?conflict=1 on a settings page)
//   SETTINGS_EVENT fires on every save, so open pages in this browser can reload.
//
// Front end only: kept in this browser (gc.settings). Two tabs of the same browser behave like two admins. A real shop
// keeps the version on the server and checks it when the save arrives.

const KEY = 'gc.settings';
export const SETTINGS_EVENT = 'gc:settings';
const ssr = () => typeof window === 'undefined';
const blank = () => ({ values: {}, version: 0, fieldVersions: {}, savedAt: 0, savedBy: '' });

function loadAll() { if (ssr()) return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function saveAll(all, formId) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: { formId } }));
  } catch { /* storage full: the page keeps the values until it closes */ }
}

/** What is saved for a form (empty values until it is first saved). */
export function readSettings(formId) {
  const all = loadAll();
  return { ...blank(), ...(all[formId] || {}) };
}

/** One saved value, or `fallback` (for libs that read a setting: businessProfile.js, consents.js …). */
export function settingValue(formId, name, fallback) {
  const v = readSettings(formId).values[name];
  return v === undefined ? fallback : v;
}

/**
 * Save changed values of a form. `baseVersion` is the version the page loaded.
 * → { ok: true, version } | { conflict: { version, savedAt, savedBy, fields, values } }
 */
export function writeSettings(formId, changes, { baseVersion = 0, by = 'You', force = false } = {}) {
  const all = loadAll();
  const cur = { ...blank(), ...(all[formId] || {}) };
  const names = Object.keys(changes || {});
  const clash = names.filter((n) => (cur.fieldVersions[n] || 0) > baseVersion);
  if (clash.length && !force) {
    return { conflict: { version: cur.version, savedAt: cur.savedAt, savedBy: cur.savedBy, fields: clash, values: cur.values } };
  }
  const version = cur.version + 1;
  const next = { ...cur, values: { ...cur.values, ...changes }, version, savedAt: Date.now(), savedBy: by, fieldVersions: { ...cur.fieldVersions } };
  names.forEach((n) => { next.fieldVersions[n] = version; });
  all[formId] = next;
  saveAll(all, formId);
  return { ok: true, version };
}

/** Demo: someone else saves `values` on this form now (used by ?conflict=1 and by the tests). */
export function simulateOtherSave(formId, values, who = 'Tanvir Hossain (CTO)') {
  const cur = readSettings(formId);
  return writeSettings(formId, values, { baseVersion: cur.version, by: who });
}
