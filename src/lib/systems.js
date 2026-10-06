// systems — the three GridCommerce systems a merchant signs in to (one section on the sign-in page). Each is its own
// site, locked to its edition (src/lib/edition.js); on the full product site, choosing one previews that edition.
//   enterSystem(ed)  after signing in: this site's own system → its dashboard; another system → that site's
//                    dashboard (demo: signed in there too); on the full site → preview it here.

import { LOCKED, currentEditionId, previewEdition } from './edition';

export const SYSTEMS = [
  { ed: 'retail-wholesale', url: 'https://gricommerce-retail-wholesale.netlify.app', icon: 'store', blurb: 'Shops, counters and stock' },
  { ed: 'online', url: 'https://gricommerce-online.netlify.app', icon: 'shopping-bag', blurb: 'Online orders and couriers' },
  { ed: 'retail-online', url: 'https://gricommerce-retail-online.netlify.app', icon: 'layers', blurb: 'Shops and online together' },
];
export const systemBy = (ed) => SYSTEMS.find((s) => s.ed === ed) || null;

/** The system email / phone sign-in opens: the site's own (or the previewed edition), else ?system=, else Retail + Online. */
export function defaultSystem() {
  if (systemBy(currentEditionId())) return currentEditionId();
  try { const q = new URLSearchParams(window.location.search).get('system'); if (systemBy(q)) return q; } catch { /* ignore */ }
  return LOCKED ? currentEditionId() : 'retail-online';
}

/** Where a signed-in merchant goes for the chosen system. */
export function enterSystem(ed, go) {
  if (!LOCKED) { previewEdition(ed); go('/merchant-overview?edition=' + ed); return; }
  if (ed === currentEditionId() || !systemBy(ed)) { go('/merchant-overview'); return; }
  window.location.href = systemBy(ed).url + '/merchant-overview';
}
