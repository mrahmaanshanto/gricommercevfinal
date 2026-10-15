// docSettings — Settings › Invoices & receipts (/set-invoices, SetInvoices.jsx): what customers receive on paper.
//   prefix          put in front of the sale or order number on an invoice ('' = the number as it is)
//   template        A4 invoice look: 'classic' · 'compact' (smaller, more lines on a page) · 'brand' (brand colour header)
//   footer          the note at the bottom of the A4 invoice
//   showBin         print the BIN / VAT registration number (invoice and receipt)
//   showWarranty    print each item's warranty and its end date (invoice and receipt)
//   receiptWidth    the thermal receipt roll: '58' or '80' (mm)
//   receiptFooter   the line at the bottom of the receipt
// Read by components/SaleInvoice.jsx and the POS receipt (Pos.jsx). Saved through the settings store (form 'invoices',
// lib/settingsStore.js), so the page has history and the save bar like the other settings pages.

import { readSettings } from './settingsStore';
import { MERCHANT } from './merchant';

export const DOC_FORM = 'invoices';
export const TEMPLATES = { classic: 'Classic', compact: 'Compact', brand: 'Brand colour' };
export const DOC_DEFAULTS = {
  prefix: 'INV-', template: 'classic',
  footer: `Thank you for shopping at ${MERCHANT.name}. Keep this invoice for warranty claims; bring it with the product and its box.`,
  showBin: true, showWarranty: true, receiptWidth: '80', receiptFooter: 'Thank you for shopping with us.',
};
const yes = (v) => v === true || v === 'true' || v === 'on';

/** The saved settings (the defaults on the server and before anything is saved). */
export function docSettings() {
  let saved = {};
  if (typeof window !== 'undefined') { try { saved = readSettings(DOC_FORM).values || {}; } catch { saved = {}; } }
  const v = { ...DOC_DEFAULTS, ...saved };
  return { ...v, showBin: yes(v.showBin), showWarranty: yes(v.showWarranty), receiptWidth: String(v.receiptWidth) === '58' ? '58' : '80', template: TEMPLATES[v.template] ? v.template : 'classic' };
}
/** The number printed on an invoice: the prefix, then the sale / order number (without a leading #). */
export function docNumber(id, s = docSettings()) {
  const raw = String(id || '').replace(/^#/, '');
  if (!s.prefix) return String(id || '');
  return raw.toUpperCase().startsWith(s.prefix.toUpperCase()) ? raw : s.prefix + raw;
}
