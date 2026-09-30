// Framework-free UI helpers shared by the screens and the shadow-DOM shell.
// They only dispatch events; <Overlays> (mounted once in the root layout) draws the result.

const isBrowser = typeof window !== 'undefined';

/** toast('Order exported') · toast('Leave approved', { undo: () => … }) · tone: 'success' | 'error' | 'info' */
export function toast(message, opts = {}) {
  if (isBrowser) window.dispatchEvent(new CustomEvent('gc:toast', { detail: { message, ...opts } }));
}

/**
 * Asks before a destructive action. Resolves true when confirmed.
 *   if (await confirmDialog({ title: 'Block this customer?', body: '…', confirmLabel: 'Block', tone: 'danger' })) …
 */
export function confirmDialog(opts) {
  if (!isBrowser) return Promise.resolve(false);
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('gc:confirm', { detail: { ...opts, resolve } }));
  });
}

// ---- locale ------------------------------------------------------------------------------------
const LOCALE_KEY = 'gc.locale';

export function getLocale() {
  if (!isBrowser) return 'en';
  try { return window.localStorage.getItem(LOCALE_KEY) === 'bn' ? 'bn' : 'en'; } catch { return 'en'; }
}

export function setLocale(locale) {
  if (!isBrowser) return;
  const next = locale === 'bn' ? 'bn' : 'en';
  try { window.localStorage.setItem(LOCALE_KEY, next); } catch { /* private mode: keep for this page only */ }
  document.cookie = `${LOCALE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = next;
  window.dispatchEvent(new CustomEvent('gc:locale', { detail: next }));
}

/** Small persisted flags (sidebar collapse, and so on). */
export function readFlag(key) {
  try { return window.localStorage.getItem(key) === '1'; } catch { return false; }
}
export function writeFlag(key, on) {
  try { window.localStorage.setItem(key, on ? '1' : '0'); } catch { /* ignore */ }
}
