// businessProfile — the shop's brand, legal business, customer contact and billing profile, as saved in Settings ›
// General (Nayeem's brief #16). Invoices, receipts and report letterheads read it (instead of the fixed demo values in
// merchant.js) once they are wired; GridCommerce's own bills use the billing profile.
//
//   businessProfile() → { brand: { name, color, accent, logo }, legal: { name, type, licence, bin, tin, address, country },
//                         contact: { phone, email, address, hours }, billing: { name, address, taxId, email },
//                         defaults: { currency, country, timezone } }
//   invoiceIdentity() → the block printed on an invoice or receipt: { name, tradingName, address, phone, email, bin, tin, licence }
//   RISKY — what changing currency, country or timezone does (the confirmation in SetChrome.jsx › SetGuards)

import { MERCHANT } from './merchant';
import { readSettings } from './settingsStore';

export const BUSINESS_TYPES = ['Sole proprietorship', 'Partnership', 'Private limited company', 'Public limited company', 'Other'];

/** What a change does, shown before it is saved. */
export const RISKY = {
  currency: { effects: [
    'Prices and amounts already saved keep their currency. Nothing is converted.',
    'Invoices, receipts and reports show the new symbol from now on.',
    'Payment gateways and couriers that only take ৳ stop working until you set them up again.',
  ] },
  country: { effects: [
    'Checkout and address forms start with the new country.',
    'VAT rules, delivery areas and phone checks are set for Bangladesh. Check them after the change.',
  ] },
  timezone: { effects: [
    'Times already saved don’t change. Orders, reports and shifts show them in the new zone.',
    'Daily and weekly totals may move between days.',
    'Scheduled reports and campaigns run on the new zone’s clock.',
  ] },
};

const DEFAULTS = {
  store_name: MERCHANT.name, brand_color: '#003087', brand_accent: '#009cde',
  legal_name: 'Dazzle Shop Ltd.', business_type: 'Private limited company', trade_licence: MERCHANT.licence, bin: MERCHANT.bin, tin: '', registered_address: MERCHANT.address,
  support_phone: '+8801811843300', support_email: 'hello@dazzleshop.com.bd', store_address: 'House 42, Road 27, Dhanmondi, Dhaka 1209', working_hours_text: 'Sat–Thu, 10:00 AM – 8:00 PM',
  billing_name: 'Dazzle Shop Ltd.', billing_address: MERCHANT.address, billing_tax_id: MERCHANT.bin, billing_email: MERCHANT.email,
  currency: 'Bangladeshi Taka — ৳ (BDT)', default_country: 'Bangladesh', timezone: '(UTC+06:00) Asia/Dhaka',
};

export function businessProfile() {
  const v = { ...DEFAULTS, ...readSettings('general').values };
  const media = readSettings('media').values;
  return {
    brand: { name: v.store_name, color: v.brand_color, accent: v.brand_accent, logo: media.asset_light || '' },
    legal: { name: v.legal_name, type: v.business_type, licence: v.trade_licence, bin: v.bin, tin: v.tin, address: v.registered_address, country: v.default_country },
    contact: { phone: v.support_phone, email: v.support_email, address: v.store_address, hours: v.working_hours_text },
    billing: { name: v.billing_name, address: v.billing_address, taxId: v.billing_tax_id, email: v.billing_email },
    defaults: { currency: v.currency, country: v.default_country, timezone: v.timezone },
  };
}

/** The identity block an invoice or receipt prints (snapshot it on the document when it is issued). */
export function invoiceIdentity() {
  const p = businessProfile();
  return { name: p.legal.name, tradingName: p.brand.name, address: p.legal.address, phone: p.contact.phone, email: p.contact.email, bin: p.legal.bin, tin: p.legal.tin, licence: p.legal.licence };
}
