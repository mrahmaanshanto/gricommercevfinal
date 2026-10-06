// Grid AI profile — how the AI speaks for this shop and what it may and may not say (Grid AI › Behaviour).
// Defaults come from the shop's own settings (Settings › General, Delivery, Payments; order rules), so a fresh shop
// starts with true answers; anything the merchant changes here is kept in this browser (gc.gridai.profile).
// Office hours, the reply mode and per-channel Auto / Assist / Off stay in lib/aiReply.js (one owner).
//   getProfile() → every field (saved over the defaults)    saveProfile(changes, by)    resetProfile()

import { businessProfile } from '../businessProfile';
import { readSettings } from '../settingsStore';
import { getOrderRules } from '../orderRules';
import { logAi } from './activity';

export const PROFILE_EVENT = 'gc:gridai-profile';
const KEY = 'gc.gridai.profile';
export const TONES = ['Friendly', 'Professional', 'Warm and casual', 'Short and direct'];
export const LANGS = [['auto', 'Reply in the customer’s language'], ['bn', 'Bangla'], ['en', 'English']];
export const BANGLISH = [['banglish', 'Reply in Banglish'], ['bn', 'Reply in Bangla'], ['en', 'Reply in English']];
export const ADDRESSING = [['apu-bhai', 'Apu / Bhai'], ['sir-madam', 'Sir / Madam'], ['name', 'By their name'], ['plain', 'Just “you”']];

const num = (x) => parseFloat(String(x == null ? '' : x).replace(/[^\d.]/g, '')) || 0;
const ZONES = [['inside_dhaka', 'Inside Dhaka', 70, 1, 2], ['sub_dhaka', 'Sub-Dhaka', 110, 2, 3], ['outside_dhaka', 'Outside Dhaka', 150, 3, 5]];
const PAY = [['cash_on_delivery', 'Cash on delivery', true], ['bkash', 'bKash', true], ['nagad', 'Nagad', true], ['sslcommerz', 'Card (SSLCOMMERZ)', true], ['eps', 'EPS', true], ['bank_transfer', 'Bank transfer', true], ['rocket_send_money', 'Rocket', false]];

/** The shop's delivery zones (Settings › Delivery). */
export function deliveryZones() {
  const d = readSettings('delivery').values;
  return ZONES.map(([id, name, charge, from, to]) => ({ id, name, charge: num(d[id + '_delivery_charge'] ?? charge), from: num(d[id + '_delivery_time'] ?? from), to: num(d[id + '_delivery_time_to'] ?? to), unit: String(d[id + '_delivery_time_unit'] || 'Days').toLowerCase() }));
}
/** Payment methods switched on in Settings › Payments. */
export function paymentMethods() {
  const p = readSettings('payments').values;
  return PAY.filter(([id, , on]) => (p[id] === undefined ? on : !!p[id])).map(([, name]) => name);
}

function defaults() {
  const b = businessProfile();
  const pay = readSettings('payments').values;
  const zones = deliveryZones();
  const days = getOrderRules().returnDays;
  return {
    businessName: b.brand.name, businessType: 'Online and retail shop', tone: 'Friendly', language: 'auto', banglish: 'banglish', addressing: 'apu-bhai',
    workingHours: b.contact.hours, supportHours: b.contact.hours,
    deliveryAreas: zones.map((z) => z.name + ' ৳' + z.charge).join(' · '),
    deliveryTime: zones.map((z) => z.name + ' ' + z.from + '–' + z.to + ' ' + z.unit).join(' · '),
    payments: paymentMethods(),
    refundRules: 'Refunds go back the way the customer paid, within 7 working days after we receive the item.',
    returnRules: days ? 'Return or exchange within ' + days + ' days of delivery, unused and with the tag. Sale items can be exchanged, not returned.' : 'We don’t take returns. Damaged or wrong items are replaced.',
    warrantyRules: 'Electronics carry the brand’s warranty shown on the product page. Keep the invoice.',
    escalationRules: 'Hand to a person for refunds, complaints, payment problems, angry customers and anything the AI is not sure about.',
    escalationContacts: b.contact.phone + ' · ' + b.contact.email,
    contactInfo: b.contact.phone + ' · ' + b.contact.email + ' · ' + b.contact.address,
    restrictedTopics: 'Politics, religion, other shops, medical advice',
    neverPromise: 'Exact delivery dates, refunds before they are approved, discounts above the limit, stock that is not confirmed',
    neverDisclose: 'Supplier names and buying prices, other customers’ details, staff phone numbers, internal notes',
    maxDiscount: num(pay.maximum_discount ?? '150'),
    showStockQty: false, showPrice: true, shareLinks: true, suggestAlternatives: true,
    products: { allow: true, max: 3, price: true, image: true, link: true, stock: true },
  };
}
const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };

export function getProfile() {
  const d = defaults(), s = read();
  return { ...d, ...s, products: { ...d.products, ...(s.products || {}) } };
}
/** Save changed fields. `changes` is { field: value }; the change is written to the AI activity log. */
export function saveProfile(changes, by = 'You') {
  const next = { ...read(), ...changes };
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(PROFILE_EVENT)); } catch { /* ignore */ }
  const n = Object.keys(changes).length;
  logAi({ kind: 'settings', title: 'Behaviour changed', detail: n === 1 ? '1 setting' : n + ' settings', by });
}
export function resetProfile(by = 'You') {
  try { window.localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent(PROFILE_EVENT)); } catch { /* ignore */ }
  logAi({ kind: 'settings', title: 'Behaviour reset to the shop settings', by });
}
