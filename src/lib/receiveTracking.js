// receiveTracking — what Receive goods must record for each piece that arrives (PR-F3):
//   trackOf(key)            'imei' | 'serial' | 'batch' | '' for a product (SKU, name or barcode):
//                           the product's own "Inventory tracking" (Add product › invMode) wins; else its IMEI / Serial /
//                           Expiry flag or a unit already in the serial register (serials.trackingOf); else its template's
//                           expiry. The demo's Screen Cleaning Kit (a spray, catalogue-only) is kept by batch and expiry.
//   checkIncoming(raw, …)   is this number fit to go on the shelf? (format, not twice in this delivery, not already in
//                           the shop or sold) → { ok, serial, error }
// The numbers are saved by serials.receiveSerials (the POS register and its IMEI chips read them) and
// serialTrace.recordSerial (the IMEI trace shows "Received" with the supplier and the delivery). Front end only.

import { productBy } from './stock';
import { findProduct } from './products';
import { trackingOf, isImei, serialBy, SERIAL_STATES } from './serials';
import { findUnit } from './serialTrace';
import { tplDefaults } from './productTemplates';

const DEMO_BATCH = { 'AC-CLN-KIT': true };
const norm = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

export function trackOf(key) {
  const c = productBy(key);
  if (!c) return '';
  let p = null;
  try { p = findProduct({ id: c.productId, sku: c.sku }); } catch { p = null; }
  const mode = p && p.invMode;
  if (mode) return mode === 'imei' || mode === 'serial' || mode === 'batch' ? mode : '';
  const t = trackingOf(c.sku);
  if (t) return t;
  if (p && (p.flags || []).includes('Expiry')) return 'batch';
  if (p && p.template) { try { if (tplDefaults(p.template).expires) return 'batch'; } catch { /* ignore */ } }
  return DEMO_BATCH[c.sku] ? 'batch' : '';
}

export function checkIncoming(raw, { kind, taken = [] } = {}) {
  const serial = norm(raw);
  if (!serial) return { ok: false, serial, error: kind === 'imei' ? 'Scan or type the IMEI.' : 'Scan or type the serial number.' };
  if (kind === 'imei' && !/^\d{15}$/.test(serial)) return { ok: false, serial, error: 'An IMEI has 15 digits.' };
  if (kind === 'imei' && !isImei(serial)) return { ok: false, serial, error: 'This IMEI is not valid. Check the last digit.' };
  if (kind !== 'imei' && serial.length < 4) return { ok: false, serial, error: 'A serial number has at least 4 characters.' };
  if (taken.map(norm).includes(serial)) return { ok: false, serial, error: 'Already scanned in this delivery.' };
  const u = serialBy(serial);
  if (u) return { ok: false, serial, error: u.state === 'sold' ? `Already sold on ${u.saleId}.` : `Already in the shop: ${u.product} at ${u.place} (${(SERIAL_STATES[u.state] || u.state).toLowerCase()}).` };
  const t = findUnit(serial);
  if (t && t.status !== 'written off') return { ok: false, serial, error: `Already in the shop: ${t.name}${t.place ? ' at ' + t.place : ''} (${t.status}).` };
  return { ok: true, serial };
}
