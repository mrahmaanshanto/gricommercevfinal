// scanReturn — how /m-scan hands a scanned item back to the screen that opened it.
//   scanHref(forKey, back?)  '/m-scan?for=<key>&back=<path>' (forKey: 'order' | 'pos' | 'receive' | 'count')
//   putScan(forKey, hit)     MScan keeps { for, code, sku, name, qty, serial, at } in sessionStorage ('gc.app.scan')
//   takeScan(forKey)         the calling screen reads it once (on mount and on focus / pageshow) and it is cleared;
//                            null when there is none or it is older than 2 minutes
// MScan then goes back (history.back(), or to `back` when there is no history).

const KEY = 'gc.app.scan';
export const SCAN_EVENT = 'gc:app-scan';

export const scanHref = (forKey, back) => '/m-scan?for=' + encodeURIComponent(forKey) + (back ? '&back=' + encodeURIComponent(back) : '');

export function putScan(forKey, hit) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ for: forKey, at: Date.now(), ...hit }));
    window.dispatchEvent(new CustomEvent(SCAN_EVENT));
  } catch { /* ignore */ }
}

export function takeScan(forKey) {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(KEY));
    if (!v || v.for !== forKey) return null;
    window.sessionStorage.removeItem(KEY);
    return Date.now() - (v.at || 0) < 120000 ? v : null;
  } catch { return null; }
}
