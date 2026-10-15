// checkoutSettings — how the online store's checkout behaves (ON-F15), set in Settings › Checkout (/set-checkout,
// screens/settings-console/SetCheckout.jsx, form 'checkout') and read by the storefront checkout
// (screens/storefront/Checkout.jsx) and the thank-you / order-status page (/track).
//
//   checkoutSettings() → { guest, otp, email ('hidden' | 'optional' | 'required'), area, note, terms, codFee, codLimit,
//                          minOrder }
//     guest     customers can order without an account; off = they sign in with their mobile number (a code by SMS)
//     otp       the mobile number is checked with a code before the order is placed
//     area      district and area must be chosen (they set the delivery zone and charge, bdAreas.js)
//     terms     the "I agree to the terms" box must be ticked (the text and page are Settings › Privacy & consent)
//     codFee    added to cash-on-delivery orders · codLimit   no cash on delivery above this total (0 = no limit)
//     minOrder  the smallest order total (0 = none)
// Front end only: read from this browser's saved settings. The code is not really sent: the demo shows it on screen.

import { settingValue } from './settingsStore';

export const CHECKOUT_DEFAULTS = { guest: true, otp: false, email: 'optional', area: true, note: true, terms: true, codFee: 0, codLimit: 0, minOrder: 0 };
export const EMAIL_CHOICES = ['Hidden', 'Optional', 'Required'];
const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return Number.isFinite(n) && n > 0 ? n : 0; };
const bool = (v, d) => (v === undefined || v === null || v === '' ? d : v === true || v === 'true' || v === 'On');

export function checkoutSettings() {
  if (typeof window === 'undefined') return { ...CHECKOUT_DEFAULTS };
  const get = (n, d) => settingValue('checkout', n, d);
  const email = String(get('email_field', 'Optional')).toLowerCase();
  return {
    guest: bool(get('guest_checkout', true), true),
    otp: bool(get('phone_otp', false), false),
    email: ['hidden', 'optional', 'required'].includes(email) ? email : 'optional',
    area: bool(get('area_required', true), true),
    note: bool(get('notes_field', true), true),
    terms: bool(get('terms_checkbox', true), true),
    codFee: num(get('cod_fee', '0')),
    codLimit: num(get('cod_limit', '0')),
    minOrder: num(get('min_order', '0')),
  };
}
/** A sign-in or check code for a mobile number (demo: the same number always gets the same code). */
export function demoCode(phone) {
  let h = 7;
  for (const c of String(phone || '')) h = (h * 31 + c.charCodeAt(0)) % 9000;
  return String(1000 + h);
}
