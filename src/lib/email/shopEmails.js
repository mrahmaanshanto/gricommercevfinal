// email/shopEmails — the shop's designed emails (Communications › Message design › Email design, /message-design?tab=email; one email per
// event at /email-editor?event=). Batch B step 1.
//   getEmailDesign() · saveEmailDesign(d) · designFromShop()   the look every email shares (logo, colours, font,
//                       header, footer), filled from Settings › General until the shop changes it
//   EMAIL_LANGS · getEmailLang() · setEmailLang('en' | 'bn' | 'both')   which version customers get
//   emailFor(eventKey) → { en: { subject, preheader, blocks }, bn: { … }, custom }   the shop's version or the default
//   saveEmail(eventKey, value) · resetEmail(eventKey) · defaultEmail(eventKey, lang)
//   renderFor(eventKey, lang, { vars, data, dark }) → HTML · emailVarsFor(eventKey) · sampleVars(eventKey)
//   sendTestEmail(eventKey, lang, to) → logs it (delivery log + the test list with its HTML) · testEmails()
// Every email starts from the event's own text (notifications.js EVENTS) plus the part that fits it: the order table,
// the tracking box, a Pay now button, a coupon, product cards. Bangla versions are written here (BN).
// Front end only: real sending is the server's (the HTML is ready for it).

import { renderEmail, newBlock, blocksFromText, DEFAULT_DESIGN, SAMPLE_DATA } from './emailKit.js';
import { EVENTS, VARIABLES, CUSTOMER_VARIABLES, eventBy, eventClass } from '../notifications';
import { send as sendMessage } from '../messaging';
import { businessProfile } from '../businessProfile';

const DESIGN_KEY = 'gc.email.design';
const EMAILS_KEY = 'gc.email.templates';
const TESTS_KEY = 'gc.email.tests';
export const EMAIL_EVENT = 'gc:email';
const read = (k, fb) => { if (typeof window === 'undefined') return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(EMAIL_EVENT)); } catch { /* ignore */ } };

// ---- the design ---------------------------------------------------------------------------------------------------
function readGeneral() {
  let p = null;
  try { p = businessProfile(); } catch { p = null; }
  const b = (p && p.brand) || {}; const c = (p && p.contact) || {};
  return { name: b.name || 'Dazzle Shop', color: b.color, accent: b.accent, logo: b.logo || '', phone: c.phone || '01811-843300', email: c.email || 'hello@dazzleshop.com.bd', address: c.address || 'House 42, Road 27, Dhanmondi, Dhaka 1209' };
}
const hex = (x, d) => (/^#[0-9a-f]{6}$/i.test(String(x || '')) ? x : d);
/** The design made from the shop's own details (the starting point). */
export function designFromShop() {
  const g = readGeneral();
  return { ...DEFAULT_DESIGN, brandName: g.name, logo: g.logo, primary: hex(g.color, '#003087'), accent: hex(g.accent, '#009cde'), address: g.address, phone: g.phone, email: g.email, social: { facebook: 'https://facebook.com/dazzleshopbd', instagram: 'https://instagram.com/dazzleshopbd', youtube: '', whatsapp: 'https://wa.me/8801811843300' } };
}
export const getEmailDesign = () => ({ ...designFromShop(), ...read(DESIGN_KEY, {}) });
export const saveEmailDesign = (d) => write(DESIGN_KEY, d);
export const resetEmailDesign = () => { try { window.localStorage.removeItem(DESIGN_KEY); window.dispatchEvent(new CustomEvent(EMAIL_EVENT)); } catch { /* ignore */ } };

export const EMAIL_LANGS = [['en', 'English'], ['bn', 'Bangla'], ['both', 'Bangla first, English below']];
export const getEmailLang = () => read('gc.email.lang', 'en');
export const setEmailLang = (l) => write('gc.email.lang', l);

// ---- Bangla versions: subject · heading · text (the {{variables}} stay) ----------------------------------------------
const BN = {
  'new-order': ['অর্ডার {{order_id}} পেয়েছি', 'অর্ডারের জন্য ধন্যবাদ', 'আপনার অর্ডার {{order_id}} পেয়েছি। নিশ্চিত করতে আমরা আপনাকে ফোন করব।'],
  'on-hold': ['অর্ডার {{order_id}} যাচাইয়ের অপেক্ষায়', 'আমরা ফোন করব', 'অর্ডার {{order_id}} নিশ্চিত করতে আমরা শিগগিরই আপনাকে ফোন করব।'],
  'payment-pending': ['অর্ডার {{order_id}}-এর পেমেন্ট বাকি', 'পেমেন্ট করলেই অর্ডার চালু', 'অর্ডার {{order_id}}-এর জন্য {{remaining_amount}} পরিশোধ করুন।'],
  processing: ['অর্ডার {{order_id}}-এর পেমেন্ট পেয়েছি', 'পেমেন্ট পেয়েছি', 'অর্ডার {{order_id}}-এর জন্য {{paid_amount}} পেয়েছি। আমরা অর্ডার প্রস্তুত করছি।'],
  'verify-requested': ['অর্ডার {{order_id}} নিশ্চিত করা হচ্ছে', 'আমরা ফোন করছি', 'অর্ডার {{order_id}} নিশ্চিত করতে আমরা আপনাকে ফোন করছি।'],
  verified: ['অর্ডার {{order_id}} নিশ্চিত', 'নিশ্চিত করার জন্য ধন্যবাদ', 'অর্ডার {{order_id}} নিশ্চিত করার জন্য ধন্যবাদ।'],
  approved: ['অর্ডার {{order_id}} নিশ্চিত হয়েছে', 'আপনার অর্ডার নিশ্চিত', 'অর্ডার {{order_id}} নিশ্চিত হয়েছে। আমরা প্যাক করছি।'],
  'advance-requested': ['অর্ডার {{order_id}}-এর অগ্রিম', 'অগ্রিম দিয়ে অর্ডার নিশ্চিত করুন', 'অর্ডার {{order_id}} নিশ্চিত করতে {{advance_amount}} অগ্রিম দিন। বাকি {{remaining_amount}} ডেলিভারির সময় দেবেন।'],
  'advance-received': ['অর্ডার {{order_id}}-এর অগ্রিম পেয়েছি', 'অগ্রিম পেয়েছি', 'আপনার {{advance_amount}} অগ্রিম পেয়েছি। ডেলিভারিতে দিতে হবে {{remaining_amount}}।'],
  cancelled: ['অর্ডার {{order_id}} বাতিল হয়েছে', 'অর্ডার বাতিল', 'আপনার অর্ডার {{order_id}} বাতিল হয়েছে। {{cancel_reason}} প্রশ্ন থাকলে কল করুন {{support_phone}}।'],
  ready: ['অর্ডার {{order_id}} প্যাক হয়েছে', 'পার্সেল তৈরি', 'আপনার অর্ডার {{order_id}} প্যাক হয়েছে, শিগগিরই রওনা হবে।'],
  'in-transit': ['অর্ডার {{order_id}} রওনা হয়েছে', 'আপনার পার্সেল পথে', 'অর্ডার {{order_id}} {{courier_name}}-এর কাছে দেওয়া হয়েছে।'],
  'out-for-delivery': ['অর্ডার {{order_id}} আজ পৌঁছাবে', 'আজ ডেলিভারি', 'অর্ডার {{order_id}} আজ পৌঁছাবে। অনুগ্রহ করে {{cod_amount}} হাতে রাখুন।'],
  delivered: ['অর্ডার {{order_id}} ডেলিভারি হয়েছে', 'ডেলিভারি সম্পন্ন', 'অর্ডার {{order_id}} পৌঁছে গেছে। আমাদের থেকে কেনার জন্য ধন্যবাদ।'],
  'delivery-failed': ['অর্ডার {{order_id}} ডেলিভারি করা যায়নি', 'ডেলিভারি হয়নি', 'আজ অর্ডার {{order_id}} পৌঁছানো যায়নি। নতুন সময় ঠিক করতে কল করুন {{support_phone}}।'],
  'return-initiated': ['অর্ডার {{order_id}} ফেরত আসছে', 'ফেরত শুরু', 'অর্ডার {{order_id}} ({{customer_name}}) {{courier_name}} ফেরত পাঠাচ্ছে।'],
  returning: ['অর্ডার {{order_id}} ফেরত আসছে', 'পথে ফেরত', 'অর্ডার {{order_id}} ফেরত আসছে।'],
  returned: ['অর্ডার {{order_id}} ফেরত এসেছে', 'ফেরত এসেছে', 'অর্ডার {{order_id}} ({{customer_name}}) ফেরত এসেছে। স্টকে তুলুন।'],
  'payment-proof-received': ['অর্ডার {{order_id}}-এর পেমেন্ট প্রমাণ', 'পেমেন্ট প্রমাণ এসেছে', 'অর্ডার {{order_id}} ({{customer_name}}): {{paid_amount}}-এর পেমেন্ট প্রমাণ যাচাইয়ের অপেক্ষায়।'],
  'payment-rejected': ['অর্ডার {{order_id}}-এর পেমেন্ট নিশ্চিত হয়নি', 'পেমেন্ট নিশ্চিত হয়নি', 'অর্ডার {{order_id}}-এর পেমেন্ট নিশ্চিত করা যায়নি। {{reject_reason}}'],
  'order-updated': ['অর্ডার {{order_id}} বদলানো হয়েছে', 'অর্ডার আপডেট', 'আপনার অর্ডার {{order_id}} বদলানো হয়েছে। নতুন মোট {{order_total}}, ডেলিভারিতে দিতে হবে {{cod_amount}}।'],
  'quote-sent': ['{{store_name}}-এর কোটেশন', 'আপনার কোটেশন তৈরি', 'আপনার কোটেশন তৈরি। নিচের বোতামে দেখুন।'],
  'digital-sent': ['অর্ডার {{order_id}} তৈরি', 'আপনার অর্ডার তৈরি', 'অর্ডার {{order_id}} তৈরি। কী বা ডাউনলোড লিংক নিচে।'],
  'refund-sent': ['রিফান্ড পাঠানো হয়েছে', 'রিফান্ড পাঠিয়েছি', 'আপনার {{refund_amount}} রিফান্ড {{refund_method}}-এ পাঠানো হয়েছে।'],
  'return-received': ['ফেরত {{ref_id}} পেয়েছি', 'ফেরত পেয়েছি', 'আপনার ফেরত {{ref_id}} পেয়েছি, যাচাই করছি।'],
  'return-requested': ['ফেরতের অনুরোধ {{return_id}}', 'অনুরোধ পেয়েছি', 'অর্ডার {{order_id}}-এর ফেরতের অনুরোধ {{return_id}} পেয়েছি। এক দিনের মধ্যে জানাব।'],
  'return-approved': ['ফেরত {{return_id}} অনুমোদিত', 'ফেরত অনুমোদিত', 'আপনার ফেরত {{return_id}} অনুমোদিত। কুরিয়ার এসে নিয়ে যাবে, পণ্যটি প্যাক করে রাখুন।'],
  'credit-added': ['স্টোর ক্রেডিট যোগ হয়েছে', 'ক্রেডিট যোগ হয়েছে', '{{credit_amount}} স্টোর ক্রেডিট যোগ হয়েছে। ব্যালান্স {{credit_balance}}।'],
  'level-up': ['আপনি এখন {{level}}', 'নতুন লেভেল', 'আপনি এখন {{level}}। নতুন সুবিধা উপভোগ করুন।'],
  'invite-reward': ['আপনার আমন্ত্রণ পুরস্কার তৈরি', 'পুরস্কার তৈরি', 'আপনার আমন্ত্রিত বন্ধু কেনাকাটা করেছেন। আপনার পুরস্কার তৈরি।'],
  'points-expiring': ['আপনার পয়েন্ট শেষ হচ্ছে', 'পয়েন্ট শেষ হচ্ছে', '{{points}} পয়েন্ট {{due_date}} তারিখে শেষ হবে। তার আগে ব্যবহার করুন।'],
  'invoice-sent': ['ইনভয়েস {{invoice_id}}', 'আপনার ইনভয়েস', 'ইনভয়েস {{invoice_id}}, মোট {{invoice_total}}, পরিশোধের তারিখ {{due_date}}।'],
  'invoice-due': ['পরিশোধের সময়: {{invoice_id}}', 'পরিশোধের কথা মনে করিয়ে দিচ্ছি', 'ইনভয়েস {{invoice_id}}-এ {{due_amount}} {{due_date}}-এর মধ্যে পরিশোধ করতে হবে।'],
  'invoice-overdue': ['ইনভয়েস {{invoice_id}} বকেয়া', 'পরিশোধের তারিখ পেরিয়েছে', 'ইনভয়েস {{invoice_id}}-এর পরিশোধের তারিখ পেরিয়েছে। এখনও {{due_amount}} বাকি।'],
  'ticket-opened': ['আপনার অনুরোধ {{ticket_id}} পেয়েছি', 'অনুরোধ পেয়েছি', 'আপনার অনুরোধ {{ticket_id}} পেয়েছি: {{ticket_subject}}। শিগগিরই উত্তর দেব।'],
  'ticket-replied': ['{{ticket_id}}-এ নতুন উত্তর', 'আমরা উত্তর দিয়েছি', 'আপনার অনুরোধ {{ticket_id}}-এর উত্তর:\n\n{{reply_text}}'],
  'ticket-solved': ['অনুরোধ {{ticket_id}} সমাধান হয়েছে', 'সমাধান হয়েছে', 'আপনার অনুরোধ {{ticket_id}} সমাধান হয়েছে। আরও সাহায্য লাগলে এই ইমেইলের উত্তর দিন।'],
  'service-received': ['সার্ভিস অনুরোধ {{claim_id}}', 'সার্ভিস অনুরোধ পেয়েছি', '{{item_name}}-এর সার্ভিস অনুরোধ {{claim_id}} নেওয়া হয়েছে। আপডেট জানাব।'],
  'service-update': ['{{claim_id}}-এর আপডেট', 'মেরামতের খবর', '{{item_name}} ({{claim_id}}): {{claim_status}}।'],
  'service-ready': ['{{item_name}} তৈরি', 'নিয়ে যাওয়ার জন্য তৈরি', '{{item_name}} নিয়ে যাওয়ার জন্য তৈরি। অনুগ্রহ করে {{claim_id}} সাথে আনবেন।'],
  'cart-reminder': ['আপনার কার্টে কিছু রয়ে গেছে', 'কার্টে পণ্য অপেক্ষা করছে', 'আপনার কার্টে কিছু পণ্য রয়ে গেছে। চাইলে এখনই অর্ডার শেষ করুন।'],
  'back-in-stock': ['{{product_name}} আবার এসেছে', 'আবার স্টকে', '{{product_name}} আবার স্টকে এসেছে।'],
  'review-request': ['আপনার অর্ডার কেমন লাগল?', 'আপনার মতামত দিন', 'অর্ডার {{order_id}} কেমন লাগল? একটি রেটিং অন্য ক্রেতাদের সাহায্য করে।'],
  welcome: ['{{store_name}}-এ স্বাগতম', 'স্বাগতম', '{{store_name}}-এ স্বাগতম। আমাদের থেকে কেনার জন্য ধন্যবাদ।'],
  otp: ['আপনার লগইন কোড', 'আপনার কোড', 'আপনার {{store_name}} কোড {{otp_code}}। কাউকে বলবেন না।'],
  'password-reset': ['পাসওয়ার্ড নতুন করুন', 'পাসওয়ার্ড নতুন করুন', 'নিচের বোতামে চাপ দিয়ে নতুন পাসওয়ার্ড দিন।'],
};
const BN_GREET = 'প্রিয় {{customer_name}},';
const BN_BTN = { pay: 'এখনই পরিশোধ করুন', track: 'পার্সেল দেখুন', review: 'রেটিং দিন', cart: 'অর্ডার শেষ করুন', shop: 'কেনাকাটা করুন', product: 'পণ্যটি দেখুন', quote: 'কোটেশন দেখুন', reset: 'পাসওয়ার্ড দিন', download: 'ডাউনলোড করুন', request: 'অনুরোধ দেখুন', invoice: 'ইনভয়েস দেখুন' };
const EN_BTN = { pay: 'Pay now', track: 'Track your parcel', review: 'Rate your order', cart: 'Finish your order', shop: 'Shop now', product: 'See the product', quote: 'View quotation', reset: 'Set a new password', download: 'Download', request: 'View your request', invoice: 'View invoice' };

// the part that fits each event
const ORDER_TABLE = ['new-order', 'on-hold', 'payment-pending', 'processing', 'approved', 'advance-requested', 'advance-received', 'cancelled', 'ready', 'order-updated', 'verified', 'payment-rejected'];
const TRACKING = ['in-transit', 'out-for-delivery', 'delivery-failed'];
const BUTTON = { 'payment-pending': ['pay', '{{payment_link}}'], 'advance-requested': ['pay', '{{payment_link}}'], 'payment-rejected': ['pay', '{{payment_link}}'], 'invoice-due': ['pay', '{{payment_link}}'], 'invoice-overdue': ['pay', '{{payment_link}}'], 'invoice-sent': ['invoice', '{{payment_link}}'], 'in-transit': ['track', '{{tracking_url}}'], 'out-for-delivery': ['track', '{{tracking_url}}'], delivered: ['review', '{{review_link}}'], 'review-request': ['review', '{{review_link}}'], 'cart-reminder': ['cart', '{{cart_link}}'], 'back-in-stock': ['product', '{{product_link}}'], 'quote-sent': ['quote', '{{quote_link}}'], 'password-reset': ['reset', '{{reset_link}}'], 'digital-sent': ['download', '{{download_link}}'], 'ticket-replied': ['request', '{{tracking_url}}'], welcome: ['shop', '/store'] };
const INFO = {
  'refund-sent': { en: 'Amount: {{refund_amount}}\nSent to: {{refund_method}}\nReference: {{ref_id}}', bn: 'পরিমাণ: {{refund_amount}}\nপাঠানো হয়েছে: {{refund_method}}\nরেফারেন্স: {{ref_id}}' },
  'credit-added': { en: 'Added: {{credit_amount}}\nBalance: {{credit_balance}}', bn: 'যোগ হয়েছে: {{credit_amount}}\nব্যালান্স: {{credit_balance}}' },
  'invoice-sent': { en: 'Invoice: {{invoice_id}}\nTotal: {{invoice_total}}\nDue: {{due_date}}', bn: 'ইনভয়েস: {{invoice_id}}\nমোট: {{invoice_total}}\nপরিশোধের তারিখ: {{due_date}}' },
  'invoice-due': { en: 'Invoice: {{invoice_id}}\nDue: {{due_amount}}\nBy: {{due_date}}', bn: 'ইনভয়েস: {{invoice_id}}\nবাকি: {{due_amount}}\nতারিখ: {{due_date}}' },
  'invoice-overdue': { en: 'Invoice: {{invoice_id}}\nStill to pay: {{due_amount}}', bn: 'ইনভয়েস: {{invoice_id}}\nবাকি: {{due_amount}}' },
  'service-received': { en: 'Request: {{claim_id}}\nItem: {{item_name}}', bn: 'অনুরোধ: {{claim_id}}\nপণ্য: {{item_name}}' },
  'service-update': { en: 'Request: {{claim_id}}\nNow: {{claim_status}}', bn: 'অনুরোধ: {{claim_id}}\nএখন: {{claim_status}}' },
  'digital-sent': { en: 'Order: {{order_id}}\n{{licence_key}}', bn: 'অর্ডার: {{order_id}}\n{{licence_key}}' },
  otp: { en: 'Your code: {{otp_code}}', bn: 'আপনার কোড: {{otp_code}}' },
  'return-requested': { en: 'Return: {{return_id}}\nOrder: {{order_id}}', bn: 'ফেরত: {{return_id}}\nঅর্ডার: {{order_id}}' },
};
const COUPON = { 'cart-reminder': true, welcome: true };
const PRODUCTS = { delivered: 'You may also like', welcome: 'Popular right now', 'back-in-stock': '', 'cart-reminder': '' };
const SHOP_ONLY = ['return-initiated', 'returning', 'returned', 'payment-proof-received'];

const stripBody = (body) => String(body || '').replace(/^Hi \{\{customer_name\}\},\s*/, '').replace(/\n*\{\{store_name\}\}\s*$/, '').trim();
/** The default designed email of an event in one language. */
export function defaultEmail(key, lang = 'en') {
  const ev = eventBy(key);
  if (!ev) return { subject: '', preheader: '', blocks: [] };
  const bn = lang === 'bn' && BN[key];
  const subject = bn ? BN[key][0] : ev.subject;
  const heading = bn ? BN[key][1] : ev.subject;
  const blocks = [newBlock('heading', { text: heading })];
  const shopOnly = SHOP_ONLY.includes(key);
  if (!shopOnly && key !== 'otp') blocks.push(newBlock('text', { text: bn ? BN_GREET : 'Hi {{customer_name}},' }));
  if (bn) blocks.push(newBlock('text', { text: BN[key][2] }));
  // when a box shows the details (order table, tracking, details), the text keeps only its first line
  else if (INFO[key] || TRACKING.includes(key) || ORDER_TABLE.includes(key)) blocks.push(newBlock('text', { text: stripBody(ev.body).split('\n')[0] }));
  else blocksFromText(stripBody(ev.body)).filter((b) => b.type === 'text').forEach((b) => blocks.push(b));
  if (INFO[key]) blocks.push(newBlock('info', { rows: INFO[key][bn ? 'bn' : 'en'] }));
  if (TRACKING.includes(key)) blocks.push(newBlock('tracking', { url: '' }));
  if (ORDER_TABLE.includes(key) || key === 'cart-reminder') blocks.push(newBlock('order', { title: key === 'cart-reminder' ? (bn ? 'আপনার কার্ট' : 'Your cart') : bn ? 'অর্ডার {{order_id}}' : 'Order {{order_id}}' }));
  if (COUPON[key]) blocks.push(newBlock('coupon', { title: bn ? 'আপনার জন্য উপহার' : 'A gift for you', code: '{{coupon_code}}', text: '{{coupon_text}}' }));
  if (BUTTON[key]) { const [b, url] = BUTTON[key]; blocks.push(newBlock('button', { label: (bn ? BN_BTN : EN_BTN)[b], url, align: 'left' })); }
  if (PRODUCTS[key] != null && key in PRODUCTS && PRODUCTS[key] !== '') blocks.push(newBlock('products', { title: bn ? 'আপনার পছন্দ হতে পারে' : PRODUCTS[key], count: 3 }));
  if (key === 'back-in-stock') blocks.splice(blocks.length - 1, 0, newBlock('products', { title: '', count: 1 }));
  if (!shopOnly) blocks.push(newBlock('text', { text: bn ? 'প্রশ্ন থাকলে এই ইমেইলের উত্তর দিন বা কল করুন {{support_phone}}।' : 'Questions? Reply to this email or call {{support_phone}}.' }));
  const pre = bn ? BN[key][2] : stripBody(ev.body).split('\n')[0];
  return { subject, preheader: pre.slice(0, 110), blocks };
}

// ---- per-event storage -------------------------------------------------------------------------------------------
const allSaved = () => read(EMAILS_KEY, {});
/** The event's email in both languages (the shop's version where it made one). */
export function emailFor(key) {
  const s = allSaved()[key];
  return { en: (s && s.en) || defaultEmail(key, 'en'), bn: (s && s.bn) || defaultEmail(key, 'bn'), custom: !!s, savedAt: (s && s.savedAt) || 0 };
}
export function saveEmail(key, value) { const all = allSaved(); all[key] = { en: value.en, bn: value.bn, savedAt: Date.now() }; write(EMAILS_KEY, all); }
export function resetEmail(key) { const all = allSaved(); delete all[key]; write(EMAILS_KEY, all); }
export const customEmails = () => Object.keys(allSaved());

// ---- variables and preview ---------------------------------------------------------------------------------------
const SAMPLE_EXTRA = [['review_link', 'Review link', 'https://dazzleshop.com.bd/track?id=136829#review'], ['unsubscribe_url', 'Unsubscribe link', 'https://dazzleshop.com.bd/unsubscribe'], ['coupon_code', 'Coupon code', 'COMEBACK5'], ['coupon_text', 'Coupon text', '5% off, this week only']];
/** The {{variables}} an event's email can use: [key, label, sample]. */
export function emailVarsFor(key) {
  const ev = eventBy(key);
  const base = ev && ev.scope === 'customer' ? CUSTOMER_VARIABLES.filter(([k]) => ['customer_name', 'store_name', 'support_phone', ...(ev.vars || [])].includes(k)) : VARIABLES;
  const seen = new Set();
  return [...base, ...SAMPLE_EXTRA].filter(([k]) => (seen.has(k) ? false : (seen.add(k), true)));
}
export const sampleVars = (key) => { const v = Object.fromEntries([...VARIABLES, ...CUSTOMER_VARIABLES, ...SAMPLE_EXTRA].map(([k, , s]) => [k, s])); emailVarsFor(key).forEach(([k, , s]) => { v[k] = s; }); v.store_name = getEmailDesign().brandName; return v; };
/** An event's email as HTML (the shop's design and version). lang 'en' | 'bn'. */
export function renderFor(key, lang = 'en', { vars, data, dark = false, value } = {}) {
  const e = value || emailFor(key)[lang === 'bn' ? 'bn' : 'en'];
  return renderEmail({ design: getEmailDesign(), blocks: e.blocks, vars: vars || sampleVars(key), data: data || SAMPLE_DATA, lang, dark, preheader: e.preheader, subject: e.subject, kind: eventClass(key) === 'Marketing' ? 'offer' : 'service' });
}

// ---- test sends ----------------------------------------------------------------------------------------------------
export const testEmails = () => read(TESTS_KEY, []);
/** A test of the email (sample values) to the shop's own address: a delivery-log row plus the HTML kept to look at. */
export function sendTestEmail(key, lang, to, value) {
  const ev = eventBy(key);
  const e = value || emailFor(key)[lang === 'bn' ? 'bn' : 'en'];
  const vars = sampleVars(key);
  const html = renderFor(key, lang, { value: e });
  const subject = String(e.subject || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  let row = null;
  try { const r = sendMessage({ source: (ev && ev.source) || 'Orders', event: (ev ? ev.label : 'Email') + ' · test', cls: 'Service', channel: 'email', to: { name: 'Shop', email: to }, text: subject, internal: true }); row = r && r.row; } catch { row = null; }
  const test = { id: 'ET' + Date.now().toString(36), key, lang, to, subject, html, at: Date.now(), status: (row && row.status) || 'Delivered' };
  write(TESTS_KEY, [test, ...testEmails()].slice(0, 12));
  return test;
}
export { EVENTS };
