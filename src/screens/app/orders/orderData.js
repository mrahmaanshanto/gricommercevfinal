// orderData — the phone app's order and customer helpers. Everything here composes the merchant libs the web
// order screens call (lib/orders.js, orderFlow.js, orderStatus.js, orderLinks.js, customers.js, crm.js), so the app
// and the web read and change the same orders.
//   listTabs(online)        the list's tabs: the web's ORDER_TABS with All (online editions) or the Retail tabs
//   inTab(o, tab)           does the order belong to a tab
//   payPill(o)              the payment pill { tone, text } in the boards' tones
//   areaOf(o)               "Uttara, Dhaka" from the address ("Counter · Dhanmondi" for a counter sale)
//   channelOf(o)            the channel filter's value: the order's source (Website, Facebook …) or 'Counter'
//   DATE_RANGES / inRange   the date filter (today, yesterday, 7 days, 30 days) on the shop's clock
//   digitsOf(p) · plural(n, one, many?) · byName()
// Front end only: no server; the libs keep everything in this browser.

import { ORDER_TABS, tabKeys, orderStatus } from '@/lib/orderStatus';
import { isCounterSale } from '@/lib/orders';
import { currentUser } from '@/lib/team';
import { startOfDay } from '@/lib/settlements';

export const digitsOf = (p) => String(p || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
/** Who is doing it (written to the order's activity). */
export const byName = () => { try { return (currentUser() || {}).name || 'Staff'; } catch { return 'Staff'; } };

// Retail (no online module): every order is a counter sale, finished or on due (the web's RETAIL_TABS)
const RETAIL_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Payment due' },
  { key: 'delivered', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'returned', label: 'Returned' },
];
/** The list's tabs. Online editions open on On hold (the work); All is last. */
export const listTabs = (online) => (online ? [...ORDER_TABS.map((t) => ({ key: t.key, label: t.label })), { key: 'all', label: 'All' }] : RETAIL_TABS);
export const inTab = (o, tab) => tab === 'all' || tabKeys(tab).includes(o.statusKey);
/** A tab key the list knows (Home and the web link ?status=ready etc.: the tab that holds that status). */
export function tabFor(status, online) {
  const tabs = listTabs(online);
  if (!status) return tabs[0].key;
  if (tabs.some((t) => t.key === status)) return status;
  const hit = online ? ORDER_TABS.find((t) => t.keys.includes(status)) : null;
  return hit ? hit.key : orderStatus(status) ? 'all' : tabs[0].key;
}

const PAY = {
  Paid: ['ok', 'Paid'],
  COD: ['grey', 'Cash on delivery'],
  Partial: ['warn', 'Partly paid'],
  Unpaid: ['err', 'Unpaid'],
};
export function payPill(o) {
  const p = PAY[o.payment] || ['grey', o.payment || 'Payment'];
  return { tone: p[0], text: p[1] };
}
export const PAYMENT_FILTERS = [['Paid', 'Paid'], ['COD', 'Cash on delivery'], ['Partial', 'Partly paid'], ['Unpaid', 'Unpaid']];

/** "Uttara, Dhaka" from the address; a counter sale shows where it was sold. */
export function areaOf(o) {
  if (isCounterSale(o)) {
    const parts = String(o.channel || '').split('·').map((x) => x.trim()).filter(Boolean);
    return parts[1] ? 'Counter · ' + parts[1] : 'Counter sale';
  }
  const bits = String(o.address || '').split(',').map((x) => x.replace(/\b\d{4}\b/g, '').trim()).filter(Boolean);
  return bits.slice(-2).join(', ') || o.zone || '';
}
/** The channel filter's value for an order. */
export const channelOf = (o) => (isCounterSale(o) ? 'Counter' : o.source || 'Online');

const DAY = 24 * 60 * 60 * 1000;
export const DATE_RANGES = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']];
export function inRange(t, range, now) {
  if (!range) return true;
  const day = startOfDay(now);
  if (range === 'today') return t >= day;
  if (range === 'yesterday') return t >= day - DAY && t < day;
  if (range === '7d') return t >= day - 6 * DAY;
  if (range === '30d') return t >= day - 29 * DAY;
  return true;
}

/** Shrink an image file to 480 px on the long side (JPEG data URL), as the web order page does. */
export function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose an image')); return; }
    if (file.size > 15 * 1024 * 1024) { reject(new Error('Image is too large (15 MB max)')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 480 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image')); };
    img.src = url;
  });
}
