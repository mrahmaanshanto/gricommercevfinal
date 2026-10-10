// admin/gridai — GridCommerce's own AI assistant (GridAI), the one that answers leads and merchants in the Inbox, the
// website chat and WhatsApp. Front end only: a browser store (`gc.admin.gridai`), canned rule-based answers.
//
//   Knowledge   docs (uploaded files: PDF, DOCX, CSV, TXT), sites (gridcommerce.net pages), faqs (EN + BN), policies
//               (business policies and support procedures, `kind`), training (past conversations, include on/off),
//               useSets / usePricing (product and pricing read from lib/platform's catalogue and plans: on/off only)
//   Behaviour   behaviour (tone, language, length, intervention, escalation rules, handoff triggers, sensitive actions,
//               approvals, working hours, banned topics) and history (who changed what)
//   Performance days (one summary row per day, 60 days), recent (conversations with transcripts), unanswered
//
// Reads:   statusOf(item, t) · allSources(d, t) · health(d, t) · performance(d, t, days) · answer(q, ctx) · PERSONAS …
// Changes: addDocs · reindexDoc · removeDoc · addSite · recrawl · recrawlAll · removeSite · saveFaq · removeFaq ·
//          savePolicy · setUse · setSetUse · setPricingUse · setInclude · saveBehaviour · resolveUnanswered
//          each returns { ok, error? } (plus what it made).
// "Indexing" and "Crawling" finish by themselves: an item carries `readyAt` and `outcome`; statusOf() reads the clock.

import { createStore } from './store';
import { db as platformDB, staff } from '@/lib/platform/store';
import { MODULES, SETS, LADDERS, PLAN_IDS, PLAN_NAME, LIMIT_KEYS, UNLIMITED } from '@/lib/platform/catalogue';
import { DAY, MIN, rng, startOfDay, taka, num, hm, dmy } from '@/lib/platform/util';

export const STALE_DAYS = 30;
export const MAX_MB = 20;
export const ACCEPT = '.pdf,.docx,.txt,.csv,.md';
export const CHANNELS = [['inbox', 'Inbox'], ['web', 'Website chat'], ['whatsapp', 'WhatsApp']];
export const channelLabel = (k) => (CHANNELS.find((c) => c[0] === k) || [k, k])[1];
export const STATUS_WORD = { indexed: 'Indexed', indexing: 'Indexing', crawling: 'Crawling', failed: 'Failed', off: 'Off' };
export const STATUS_TONE = { indexed: 'success', indexing: 'primary', crawling: 'primary', failed: 'error', off: 'neutral' };
export const OUTCOME_WORD = { resolved: 'Resolved by AI', escalated: 'Handed to a person', failed: 'Failed' };
export const OUTCOME_TONE = { resolved: 'success', escalated: 'warning', failed: 'error' };
export const FAQ_TOPICS = ['Pricing', 'Trial', 'Setup', 'Orders', 'Couriers', 'Payments', 'POS', 'Account', 'Inbox', 'Other'];

export const TONES = [['friendly', 'Friendly'], ['professional', 'Professional'], ['formal', 'Formal']];
export const LANGS = [['auto', 'Same as the person (auto)'], ['en', 'English'], ['bn', 'বাংলা (Bangla)']];
export const LENGTHS = [['short', 'Short (1–2 sentences)'], ['normal', 'Normal (a short paragraph)']];
export const LEVELS = [['auto', 'Auto', 'GridAI answers by itself and hands the rest to a person.'], ['assist', 'Assist', 'GridAI writes a draft; a person sends it.'], ['off', 'Off', 'Every conversation goes straight to a person.']];
export const RULES = [['allowed', 'GridAI may do it'], ['approval', 'Needs approval'], ['never', 'Never: hand to a person']];
export const HANDOFF = [
  ['asked', 'The person asks for a human'],
  ['upset', 'The person is upset or uses strong words'],
  ['lowConfidence', 'GridAI is not sure of the answer'],
  ['repeat', 'The same question comes back after an answer'],
  ['legal', 'Legal, fraud or data-protection words'],
  ['enterprise', 'An Enterprise merchant writes'],
];
export const TEAMS = ['Support (Farhana Akter)', 'Sales (Tania Sultana)', 'Finance (Nusrat Islam)', 'Operations (Rakib Hasan)', 'Admin (Mahin Khan)'];
export const APPROVERS = ['Nusrat Islam', 'Rakib Hasan', 'Farhana Akter', 'Mahin Khan', 'Tania Sultana'];
const DAYS_ORDER = [[6, 'Sat'], [0, 'Sun'], [1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri']];
export const DAY_NAMES = DAYS_ORDER;

/** The people the Test chat can play. */
export const PERSONAS = [
  { id: 'lead', label: 'New lead', name: 'Arif Hossain', who: 'Owns a clothing page on Facebook, Mirpur', channel: 'web', lang: 'en',
    facts: [['Stage', 'New lead · first chat'], ['Interested in', 'Online orders, courier'], ['Came from', 'Meta ads']],
    ask: ['How much does GridCommerce cost?', 'Can I take bKash payments?', 'Do you connect with Pathao and Steadfast?', 'Is there a free trial?'] },
  { id: 'trial', label: 'Trial merchant', name: 'Sharmin Akter', who: 'Shonali Crafts · trial day 9 of 15', channel: 'inbox', lang: 'en', shop: '0017',
    facts: [['Plan', 'Online · Business (trial)'], ['Trial', 'Day 9 of 15'], ['Setup', '5 of 8 steps done']],
    ask: ['How do I add my courier?', 'Can you extend my trial by a week?', 'What happens when the trial ends?', 'Does the Business plan have POS?'] },
  { id: 'late', label: 'Late-paying merchant', name: 'Faruk Ahmed', who: 'Mohona Traders · bill 9 days late', channel: 'whatsapp', lang: 'en', shop: '0012',
    facts: [['Plan', 'Retail · Growth'], ['Bill', '৳1,000 · 9 days late'], ['State', 'Read-only in 5 days']],
    ask: ['I paid by bKash but it is not showing', 'Why is my store going read-only?', 'Can I get a discount this month?', 'I want to talk to a person'] },
  { id: 'angry', label: 'Angry merchant', name: 'Rafiq Uddin', who: 'Ghorer Bazar BD · Enterprise', channel: 'inbox', lang: 'en', shop: '0023',
    facts: [['Plan', 'Online · Enterprise'], ['Open tickets', '2 (courier sync)'], ['Mood', 'Upset since yesterday']],
    ask: ['Your courier sync is useless, orders are stuck!', 'I want a refund for this month', 'Cancel my account now', 'Why should I keep paying for this?'] },
  { id: 'bangla', label: 'Bangla speaker', name: 'Nusrat Jahan', who: 'Rongdhonu Fashion · writes in Bangla', channel: 'whatsapp', lang: 'bn', shop: '0007',
    facts: [['Plan', 'Online · Growth'], ['Language', 'বাংলা'], ['Last ticket', 'SMS not delivered']],
    ask: ['প্যাকেজের দাম কত?', 'পাসওয়ার্ড ভুলে গেছি', 'বিকাশে টাকা দিয়েছি কিন্তু দেখাচ্ছে না', 'ফ্রি ট্রায়াল কতদিন?'] },
];

// ---- seed ----------------------------------------------------------------------------------------------------------
const PEOPLE = ['Arif Hossain', 'Sharmin Akter', 'Mehedi Hasan', 'Taslima Begum', 'Shakil Ahmed', 'Rubina Yasmin', 'Imran Chowdhury',
  'Nasrin Sultana', 'Kamrul Islam', 'Fahim Rahman', 'Jannatul Ferdous', 'Sabbir Hossain', 'Mitu Akter', 'Habibur Rahman', 'Lima Khatun'];
const TEAM = ['Farhana Akter', 'Rakib Hasan', 'Tania Sultana', 'Mahin Khan', 'Sadia Rahman'];

const DOCS = [
  ['GridCommerce merchant guide 2026.pdf', 4.2, 86, 12], ['Online store setup checklist.pdf', 0.8, 14, 20], ['POS register handbook.pdf', 2.6, 48, 45],
  ['Courier guide: Pathao, Steadfast, RedX.pdf', 1.4, 22, 8], ['bKash and Nagad payment setup.pdf', 0.9, 11, 33], ['Pricing sheet October 2026.pdf', 0.3, 4, 3],
  ['HR and payroll module overview.pdf', 1.1, 18, 60], ['Warehouse and stock transfer guide.docx', 0.6, 16, 15], ['Merchant FAQ export September.csv', 0.2, 1, 10],
  ['Inbox and automation playbook.pdf', 1.9, 31, 5], ['Scanned trade licence sample.pdf', 6.4, 3, 2, 'failed', 'The pages are scanned images, so no text could be read. Upload a text PDF.'],
  ['Release notes Q3 2026.txt', 0.05, 1, 1], ['Bangla onboarding script.docx', 0.4, 9, 18], ['Old pricing 2025.pdf', 0.3, 4, 300, 'indexed', '', false],
];
const SITES = [
  ['/', 'Home', 6, 2], ['/pricing', 'Pricing', 3, 2], ['/features/orders', 'Online orders', 4, 6], ['/features/pos', 'POS', 4, 6],
  ['/features/inventory', 'Inventory', 5, 6], ['/features/inbox', 'Inbox', 3, 9], ['/features/gridai', 'GridAI', 2, 41], ['/help', 'Help centre', 64, 4],
  ['/help/billing', 'Help · Billing', 12, 4], ['/help/couriers', 'Help · Couriers', 9, 4], ['/blog', 'Blog', 40, 3, 'failed', 'Timed out after 30 s on page 41 of the blog.'],
  ['/about', 'About', 1, 52], ['/terms', 'Terms of service', 1, 38], ['/privacy', 'Privacy policy', 1, 38],
];
const FAQS = [
  ['Pricing', 'How much does GridCommerce cost?', 'Plans start at ৳1,000 a month (Growth). Business is ৳2,500 and Enterprise ৳5,000. Paying yearly gives about two months free.',
    'GridCommerce-এর খরচ কত?', 'প্যাকেজ শুরু মাসে ৳১,০০০ থেকে (Growth)। Business ৳২,৫০০ আর Enterprise ৳৫,০০০। বছরে একবারে দিলে প্রায় দুই মাস ফ্রি।', 412],
  ['Trial', 'Is there a free trial?', 'Yes. Every plan has a 15-day free trial with all its modules. No card is needed.',
    'ফ্রি ট্রায়াল আছে?', 'হ্যাঁ। প্রতিটি প্যাকেজে ১৫ দিনের ফ্রি ট্রায়াল, সব মডিউলসহ। কার্ড লাগে না।', 286],
  ['Payments', 'Can I take bKash and Nagad payments?', 'Yes. Connect bKash, Nagad, SSLCOMMERZ or EPS in Settings › Payments. Money reaches your account on the gateway’s payout days.',
    'বিকাশ আর নগদে পেমেন্ট নেওয়া যায়?', 'হ্যাঁ। Settings › Payments-এ বিকাশ, নগদ, SSLCOMMERZ বা EPS যুক্ত করুন। গেটওয়ের পেআউটের দিনে টাকা আপনার অ্যাকাউন্টে আসে।', 198],
  ['Couriers', 'Which couriers do you connect with?', 'Pathao, Steadfast, RedX and Paperfly. Booking, tracking and COD payouts come into GridCommerce by themselves.',
    'কোন কোন কুরিয়ারের সাথে যুক্ত?', 'পাঠাও, স্টেডফাস্ট, রেডএক্স আর পেপারফ্লাই। বুকিং, ট্র্যাকিং আর COD পেআউট নিজে থেকেই GridCommerce-এ আসে।', 175],
  ['Setup', 'Can you move my products from WooCommerce?', 'Yes. Connect WooCommerce in Connections and import products, or ask for Assisted migration (৳5,000, done in 3 working days).',
    'WooCommerce থেকে প্রোডাক্ট আনা যাবে?', 'হ্যাঁ। Connections-এ WooCommerce যুক্ত করে প্রোডাক্ট ইমপোর্ট করুন, অথবা Assisted migration নিন (৳৫,০০০, ৩ কর্মদিবসে)।', 92],
  ['POS', 'Does GridCommerce work in my physical shop?', 'Yes. The POS register sells at the counter, prints receipts and shares one stock with your online store. It is in the Retail plans.',
    'দোকানে কি GridCommerce চলবে?', 'হ্যাঁ। POS দিয়ে কাউন্টারে বিক্রি, রসিদ প্রিন্ট আর অনলাইনের সাথে একই স্টক। এটা Retail প্যাকেজে আছে।', 133],
  ['Account', 'How many staff can use my account?', 'Growth has 2 staff seats, Business 5 and Enterprise 15. Each person gets their own sign-in and role.',
    'কতজন স্টাফ ব্যবহার করতে পারবে?', 'Growth-এ ২ জন, Business-এ ৫ জন আর Enterprise-এ ১৫ জন। প্রত্যেকে আলাদা লগইন আর রোল পায়।', 88],
  ['Orders', 'Is there a limit on orders?', 'Growth includes 500 orders a month, Business 2,500 and Enterprise 10,000. We warn you at 80% and you can top up.',
    'অর্ডারের কোনো লিমিট আছে?', 'Growth-এ মাসে ৫০০ অর্ডার, Business-এ ২,৫০০ আর Enterprise-এ ১০,০০০। ৮০%-এ সতর্ক করি, চাইলে টপ-আপ করা যায়।', 121],
  ['Inbox', 'Can I answer Facebook and WhatsApp messages in one place?', 'Yes. The Inbox brings Messenger, Instagram, WhatsApp and comments together. It is an add-on (৳1,200 a month) with messaging credits.',
    'ফেসবুক আর হোয়াটসঅ্যাপের মেসেজ এক জায়গায় দেখা যায়?', 'হ্যাঁ। Inbox-এ মেসেঞ্জার, ইনস্টাগ্রাম, হোয়াটসঅ্যাপ আর কমেন্ট একসাথে। এটা অ্যাড-অন (মাসে ৳১,২০০), মেসেজ ক্রেডিটসহ।', 104],
  ['Payments', 'How do I pay my GridCommerce bill?', 'Pay from Settings › Subscription by bKash, Nagad, Rocket, card or bank transfer. Bills come 7 days before your billing day.',
    'GridCommerce-এর বিল কীভাবে দেব?', 'Settings › Subscription থেকে বিকাশ, নগদ, রকেট, কার্ড বা ব্যাংক ট্রান্সফারে দিন। বিলিং তারিখের ৭ দিন আগে বিল আসে।', 157],
  ['Setup', 'Can I use my own domain?', 'Yes. Add your domain in Settings › Domains and point it to us; the SSL certificate is set up by itself within an hour.',
    'নিজের ডোমেইন ব্যবহার করা যাবে?', 'হ্যাঁ। Settings › Domains-এ ডোমেইন যোগ করে আমাদের দিকে পয়েন্ট করুন; এক ঘণ্টার মধ্যে SSL নিজে থেকেই চালু হয়।', 76],
  ['Other', 'Is my data safe?', 'Your data stays in your store only. We back it up every day and never share it. You can export it at any time.',
    'আমার ডেটা কি নিরাপদ?', 'আপনার ডেটা শুধু আপনার স্টোরেই থাকে। প্রতিদিন ব্যাকআপ নিই, কারো সাথে শেয়ার করি না। যেকোনো সময় এক্সপোর্ট করতে পারবেন।', 64],
];
const POLICIES = [
  ['policy', 'Refund policy', 'Monthly plans are not refunded once the month has started. Yearly plans are refunded for the unused full months within the first 60 days. Refunds go back the way the bill was paid within 7 working days. Every refund is approved by Finance.', 21],
  ['policy', 'Data and privacy policy', 'Merchant data belongs to the merchant. GridCommerce staff open a store only with the owner’s PIN. Data is kept in Bangladesh-region servers, backed up daily, and deleted 90 days after an account is closed.', 64],
  ['policy', 'Trial terms', 'Every plan has a 15-day free trial with all its modules. No card is needed. On day 16 the store moves to the chosen plan; unpaid trials become read-only and are closed after 40 days.', 12],
  ['policy', 'Late payment terms', 'Bills are sent 7 days before the billing day. 1–7 days late: grace, everything works. 8–14 days: read-only. 15 days and more: suspended until paid. Paying lifts it at once.', 30],
  ['policy', 'Fair use of messaging credits', 'SMS, WhatsApp and email are paid from prepaid credits. Unused credits carry over for 12 months. Bulk sends to bought lists are not allowed.', 44],
  ['procedure', 'Courier sync failure', '1. Ask which courier and since when. 2. Check Connections › Delivery: an expired API key is the usual cause. 3. Ask the merchant to reconnect with a new key. 4. Stuck parcels re-sync within 10 minutes. 5. Still failing after reconnecting: hand to Operations.', 9],
  ['procedure', 'Password reset', '1. Confirm the phone or email on the account. 2. Send the reset link (valid 30 minutes). 3. Never ask for the old password or the code. 4. Locked after 5 tries: wait 15 minutes.', 15],
  ['procedure', 'Payment not showing', '1. Ask for the transaction ID and the number paid from. 2. bKash and Nagad payments show within 10 minutes. 3. Not found after 30 minutes: hand to Finance with the ID. 4. Never mark a bill paid without Finance.', 6],
  ['procedure', 'Store read-only or suspended', '1. Check the bill and days late. 2. Explain the late payment terms. 3. Paying lifts it at once. 4. A promise to pay later or a payment plan goes to Finance.', 11],
  ['procedure', 'SMS not delivered', '1. Check the credit balance. 2. Check the number format (+880). 3. Operator delays clear within an hour. 4. Many failures from one store: hand to Operations.', 40],
];
const TRAIN_TOPICS = [
  ['Pricing for a clothing page', 'web', 'up'], ['Pathao API key expired', 'inbox', 'up'], ['bKash payment not showing', 'whatsapp', 'up'], ['Trial extension request', 'inbox', 'down'],
  ['POS receipt printer setup', 'inbox', 'up'], ['Custom domain SSL', 'web', 'up'], ['Moving from WooCommerce', 'web', 'up'], ['Refund for yearly plan', 'inbox', 'down'],
  ['SMS not delivered to Grameenphone', 'whatsapp', 'up'], ['Adding staff with roles', 'inbox', 'up'], ['Order limit warning', 'inbox', null], ['Steadfast COD payout timing', 'whatsapp', 'up'],
  ['Bangla invoice template', 'whatsapp', 'up'], ['Store suspended for unpaid bill', 'whatsapp', 'down'], ['Inbox add-on price', 'web', 'up'], ['Warehouse transfer between branches', 'inbox', null],
  ['Password reset by phone', 'whatsapp', 'up'], ['Landing page limit', 'inbox', 'up'], ['Facebook catalogue sync', 'inbox', 'up'], ['Payroll for 12 staff', 'web', 'up'],
];
const UNANSWERED = [
  ['Can I sell on Daraz from GridCommerce?', 37], ['Do you have an app for iPhone?', 29], ['Can two shops share one account?', 24],
  ['Is VAT (Mushak 6.3) invoice supported?', 19], ['Can I pay the bill in 3 parts?', 14], ['Does the POS work offline all day?', 11], ['Can customers track orders by SMS link?', 8],
];
// a conversation: [topic, source, outcome, turns [who, text]]
const TALKS = [
  ['Pricing', 'Pricing · Business plan', 'resolved', [['u', 'How much is the Business plan?'], ['a', 'Business is ৳2,500 a month or ৳27,000 a year. It adds offers, loyalty, cart recovery and analytics to the everyday core.'], ['u', 'Ok thanks, I will start the trial'], ['a', 'Great. The 15-day trial needs no card. Start at gridcommerce.net/start.']]],
  ['Courier sync', 'Procedure · Courier sync failure', 'resolved', [['u', 'Pathao orders are not syncing since morning'], ['a', 'That is usually an expired Pathao API key. Open Connections › Delivery › Pathao and reconnect with a new key; stuck parcels re-sync within 10 minutes.'], ['u', 'Done, it works now'], ['a', 'Good to hear. Anything else?']]],
  ['Payment', 'Procedure · Payment not showing', 'escalated', [['u', 'I paid ৳2,500 by bKash 1 hour ago, bill still unpaid'], ['a', 'Please send the transaction ID and the number you paid from.'], ['u', 'TrxID 9KD72HX1QZ from 01712-XXXXXX'], ['a', 'I could not find it yet, so I passed it to our Finance team. They will confirm within the hour.'], ['s', 'Nusrat here from Finance: found it, your bill is marked paid. Sorry for the wait.']]],
  ['Trial', 'Policy · Trial terms', 'escalated', [['u', 'Can I get 7 more days of trial?'], ['a', 'Extending a trial needs a person’s approval. I have asked Operations; you will hear back today.'], ['s', 'Rakib from Operations: extended by 7 days. Good luck with the setup!']]],
  ['Refund', 'Policy · Refund policy', 'escalated', [['u', 'I want my money back for this month, nothing works'], ['a', 'I am sorry it has been hard. Monthly plans are not refunded once the month starts, but I have passed this to a person who can look at your case.'], ['s', 'Farhana from Support: let us fix the problem first. I am calling you in 5 minutes.']]],
  ['POS', 'Docs · POS register handbook.pdf', 'resolved', [['u', 'Which receipt printer works with POS?'], ['a', 'Any 58 mm or 80 mm thermal printer over USB or Bluetooth. Xprinter and Rongta are the most used. Set it up in POS › Settings › Printer.']]],
  ['Domain', 'FAQ · Can I use my own domain?', 'resolved', [['u', 'How do I connect my .com.bd domain?'], ['a', 'Add it in Settings › Domains and point the A record to us. The SSL certificate turns on by itself within an hour.']]],
  ['Daraz', '—', 'failed', [['u', 'Can I sell on Daraz from GridCommerce?'], ['a', 'I am not sure about that yet. Let me get someone who knows.'], ['u', 'ok'], ['a', 'Sorry, no one is free right now. We will reply by email.']]],
  ['Bangla', 'FAQ · ফ্রি ট্রায়াল আছে?', 'resolved', [['u', 'ফ্রি ট্রায়াল কতদিন?'], ['a', 'প্রতিটি প্যাকেজে ১৫ দিনের ফ্রি ট্রায়াল, সব মডিউলসহ। কার্ড লাগে না।'], ['u', 'ধন্যবাদ']]],
  ['SMS', 'Procedure · SMS not delivered', 'resolved', [['u', 'Order SMS are not reaching customers'], ['a', 'Your SMS credit balance is ৳0, so sending stopped. Top up in Settings › Credits and sending starts again at once.']]],
  ['Inbox', 'Website · /features/inbox', 'resolved', [['u', 'Does the inbox include Instagram comments?'], ['a', 'Yes. The Inbox brings Messenger, Instagram messages and comments, and WhatsApp into one list.']]],
  ['Angry', 'Behaviour · Handoff', 'escalated', [['u', 'This is the worst software, my orders vanished!!!'], ['a', 'I am sorry. I have passed this to a person right away so nothing gets lost.'], ['s', 'Rakib from Operations: your orders are safe, they were filtered by date. I have reset the view.']]],
];

function seed(now) {
  const r = rng('gridai-v1');
  const today = startOfDay(now);
  const by = (i) => TEAM[i % TEAM.length];
  const docs = DOCS.map(([name, mb, pages, days, status = 'indexed', note = '', use = true], i) => ({
    id: 'd' + (i + 1), name, size: Math.round(mb * 1048576), pages, status, note, use, by: by(i), updated: now - days * DAY - r.int(1, 600) * MIN,
  }));
  const sites = SITES.map(([path, title, pages, days, status = 'indexed', note = ''], i) => ({
    id: 's' + (i + 1), url: 'https://gridcommerce.net' + (path === '/' ? '' : path), path, title, pages, status, note, use: true, updated: now - days * DAY - r.int(30, 500) * MIN,
  }));
  const faqs = FAQS.map(([topic, q, a, qBn, aBn, uses], i) => ({ id: 'f' + (i + 1), topic, q, a, qBn, aBn, uses, use: true, by: by(i + 2), updated: now - r.int(2, 50) * DAY }));
  const policies = POLICIES.map(([kind, title, body, days], i) => ({ id: 'p' + (i + 1), kind, title, body, use: true, by: by(i + 1), updated: now - days * DAY - r.int(30, 400) * MIN }));
  let shops = [];
  try { shops = platformDB().shops.filter((s) => s.status !== 'closed').slice(0, 30); } catch { shops = []; }
  const training = TRAIN_TOPICS.map(([title, channel, rating], i) => {
    const shop = i % 3 !== 0 && shops.length ? shops[(i * 7) % shops.length] : null;
    return { id: 'c' + (i + 1), title, channel, rating, include: rating !== 'down' && i !== 10, who: shop ? shop.name : PEOPLE[i % PEOPLE.length], shopId: shop ? shop.id : null,
      messages: 4 + r.int(0, 8), at: now - (6 + i * 2) * DAY - r.int(0, 600) * MIN };
  });

  // one row a day for 60 days: fewer chats on Fridays, slowly growing
  const days = [];
  for (let k = 59; k >= 0; k--) {
    const day = today - k * DAY;
    const wd = new Date(day + 6 * 3600e3).getUTCDay();
    const base = 50 + (59 - k) * 0.42 + (wd === 5 ? -18 : wd === 6 ? 6 : 0) + r.int(-7, 9);
    const total = Math.max(18, Math.round(base));
    const failed = Math.round(total * (0.035 + r() * 0.035));
    const escalated = Math.round(total * (0.13 + r() * 0.07));
    const resolved = total - failed - escalated;
    const rated = Math.round(total * (0.3 + r() * 0.12));
    const down = Math.round(rated * (0.08 + r() * 0.1));
    const inbox = Math.round(total * (0.42 + r() * 0.06)), web = Math.round(total * (0.3 + r() * 0.05));
    const ch = { inbox, web, whatsapp: total - inbox - web };
    const tokens = total * (2300 + r.int(0, 700));
    days.push({ day, total, resolved, escalated, failed, up: rated - down, down, tokens, channels: ch, cost: +(tokens / 1000 * 0.42).toFixed(2) });
  }

  // recent conversations with transcripts (the last 10 days)
  const recent = [];
  for (let i = 0; i < 36; i++) {
    const tpl = TALKS[(i * 5 + (i >> 2)) % TALKS.length];
    const shop = i % 4 !== 1 && shops.length ? shops[(i * 3) % shops.length] : null;
    const start = now - (i * 6.5 + r.int(0, 40) / 10) * 3600e3;
    const channel = tpl[0] === 'Bangla' ? 'whatsapp' : CHANNELS[(i + (tpl[0].length % 3)) % 3][0];
    const rating = tpl[2] === 'failed' ? 'down' : r.chance(0.55) ? (tpl[2] === 'escalated' && r.chance(0.4) ? 'down' : 'up') : null;
    const tokens = 1400 + r.int(0, 3600);
    recent.push({
      id: 'v' + (1000 + i), at: start, channel, topic: tpl[0], source: tpl[1], outcome: tpl[2], rating, tokens, cost: +(tokens / 1000 * 0.42).toFixed(2),
      who: shop ? (typeof shop.owner === 'object' ? shop.owner.name : shop.owner) || PEOPLE[i % PEOPLE.length] : PEOPLE[(i * 2) % PEOPLE.length],
      shop: shop ? shop.name : null, shopId: shop ? shop.id : null, kind: shop ? 'merchant' : 'lead',
      staff: tpl[3].some((m) => m[0] === 's') ? (/Finance/.test(tpl[3].find((m) => m[0] === 's')[1]) ? 'Nusrat Islam' : /Operations/.test(tpl[3].find((m) => m[0] === 's')[1]) ? 'Rakib Hasan' : 'Farhana Akter') : null,
      messages: tpl[3].map(([w, text], j) => ({ r: w === 'u' ? 'user' : w === 'a' ? 'ai' : 'staff', text, at: start + j * (1 + r.int(0, 3)) * MIN })),
    });
  }

  const unanswered = UNANSWERED.map(([q, count], i) => ({ id: 'u' + (i + 1), q, count, last: now - r.int(1, 70) * 3600e3, done: false }));
  const behaviour = {
    tone: 'friendly', language: 'auto', length: 'short', level: 'auto', confidence: 60, maxReplies: 3,
    escalation: [
      { id: 'e1', when: 'Billing, refunds or a payment not found', to: 'Finance (Nusrat Islam)' },
      { id: 'e2', when: 'Courier, SMS or a store that is down', to: 'Operations (Rakib Hasan)' },
      { id: 'e3', when: 'A lead asks for a demo or a custom price', to: 'Sales (Tania Sultana)' },
      { id: 'e4', when: 'Anything else GridAI cannot answer', to: 'Support (Farhana Akter)' },
    ],
    handoff: { asked: true, upset: true, lowConfidence: true, repeat: true, legal: true, enterprise: false },
    sensitive: [
      { id: 'refund', label: 'Refund a payment', rule: 'approval', approver: 'Nusrat Islam' },
      { id: 'discount', label: 'Offer a discount or a free month', rule: 'approval', approver: 'Nusrat Islam' },
      { id: 'trial', label: 'Extend a trial', rule: 'approval', approver: 'Rakib Hasan' },
      { id: 'plan', label: 'Change a merchant’s plan', rule: 'approval', approver: 'Rakib Hasan' },
      { id: 'unsuspend', label: 'Lift a read-only or suspended store', rule: 'never', approver: 'Nusrat Islam' },
      { id: 'cancel', label: 'Close an account', rule: 'never', approver: 'Mahin Khan' },
      { id: 'reset', label: 'Send a password reset link', rule: 'allowed', approver: 'Farhana Akter' },
    ],
    approvals: { waitMin: 30, onTimeout: 'person', notify: true },
    hours: { from: '09:00', to: '21:00', days: [6, 0, 1, 2, 3, 4], outside: 'answer' },
    banned: 'Competitors’ prices, legal advice, tax advice, politics, religion',
    never: 'Promise a feature that is not released, promise courier delivery times, share another merchant’s data',
  };
  const history = [
    { id: 'h1', at: now - 2 * DAY - 95 * MIN, by: 'Farhana Akter', what: 'Hand to a person when not sure: below 60%' },
    { id: 'h2', at: now - 9 * DAY - 300 * MIN, by: 'Mahin Khan', what: 'Close an account: Needs approval → Never: hand to a person' },
    { id: 'h3', at: now - 16 * DAY - 40 * MIN, by: 'Nusrat Islam', what: 'Refund a payment: approver Nusrat Islam' },
    { id: 'h4', at: now - 31 * DAY - 210 * MIN, by: 'Farhana Akter', what: 'Language: English → Same as the person (auto)' },
  ];
  return {
    docs, sites, faqs, policies, training, days, recent, unanswered, behaviour, history,
    useSets: Object.fromEntries(SETS.map((s) => [s.id, s.id !== 'service'])),
    usePricing: { online: true, retail: true, wholesale: false },
  };
}

export const gridai = createStore({ key: 'gridai', version: 1, seed });
const me = () => { try { return staff().name; } catch { return 'Mahin Khan'; } };
const nextId = (list, p) => p + (Math.max(0, ...list.map((x) => Number(String(x.id).slice(p.length)) || 0)) + 1);

// ---- reads -----------------------------------------------------------------------------------------------------------
/** Where an item stands now: indexing / crawling end by themselves at `readyAt`. Off items say Off. */
export function statusOf(item, t) {
  const st = (item.status === 'indexing' || item.status === 'crawling') && item.readyAt && t >= item.readyAt ? item.outcome || 'indexed' : item.status;
  return st || 'indexed';
}
export const isStale = (item, t) => !!item.updated && t - item.updated > STALE_DAYS * DAY;
export const sizeText = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
export const isPending = (d, t) => [...d.docs, ...d.sites].some((x) => { const s = statusOf(x, t); return s === 'indexing' || s === 'crawling'; });

/** Every source in one list (Knowledge base tab). */
export function allSources(d, t) {
  const rows = [];
  d.docs.forEach((x) => rows.push({ key: 'doc:' + x.id, kind: 'doc', id: x.id, tab: 'documents', name: x.name, type: (x.name.split('.').pop() || '').toUpperCase() + ' file', status: statusOf(x, t), updated: x.updated, use: x.use, note: x.note }));
  d.sites.forEach((x) => rows.push({ key: 'site:' + x.id, kind: 'site', id: x.id, tab: 'websites', name: x.url.replace(/^https?:\/\//, ''), type: 'Website · ' + num(x.pages) + (x.pages === 1 ? ' page' : ' pages'), status: statusOf(x, t), updated: x.updated, use: x.use, note: x.note }));
  d.faqs.forEach((x) => rows.push({ key: 'faq:' + x.id, kind: 'faq', id: x.id, tab: 'faqs', name: x.q, type: 'FAQ · ' + x.topic, status: 'indexed', updated: x.updated, use: x.use }));
  d.policies.forEach((x) => rows.push({ key: 'pol:' + x.id, kind: 'policy', id: x.id, tab: 'policies', name: x.title, type: x.kind === 'policy' ? 'Business policy' : 'Support procedure', status: 'indexed', updated: x.updated, use: x.use }));
  return rows.sort((a, b) => (b.updated || 0) - (a.updated || 0));
}

/** The Knowledge health line: failing sources, in-use sources not updated in 30 days, sources in use. */
export function health(d, t) {
  const rows = allSources(d, t);
  const failing = rows.filter((x) => x.status === 'failed');
  const stale = rows.filter((x) => x.use && x.status !== 'failed' && (x.kind === 'doc' || x.kind === 'site' || x.kind === 'policy') && isStale(x, t));
  return { rows, failing, stale, inUse: rows.filter((x) => x.use && x.status === 'indexed').length, pending: rows.filter((x) => x.status === 'indexing' || x.status === 'crawling').length };
}

/** The product catalogue grouped by set, as GridAI may quote it. */
export function catalogue() {
  return SETS.map((s) => ({ ...s, modules: MODULES.filter((m) => m.set === s.id) })).filter((s) => s.modules.length);
}
/** Live plan prices per ladder from the platform's plan catalogue (db().plans). */
export function pricing(plans) {
  return LADDERS.map((l) => {
    const lad = plans && plans[l.id];
    const live = lad ? lad.versions.find((v) => v.v === lad.live) : null;
    return { ...l, v: live ? live.v : null, plans: live ? PLAN_IDS.map((p) => ({ id: p, ...live.plans[p] })) : [] };
  });
}
export const limitText = (k, v) => (v >= UNLIMITED ? 'Unlimited' : num(v) + (k === 'storage' ? ' GB' : ''));
export { LIMIT_KEYS, PLAN_NAME };

/** Figures, charts and lists for the Performance page over the last `n` days (and the n days before). */
export function performance(d, t, n = 30) {
  const end = startOfDay(t) + DAY;
  const cur = d.days.filter((x) => x.day >= end - n * DAY && x.day < end);
  const prev = d.days.filter((x) => x.day >= end - 2 * n * DAY && x.day < end - n * DAY);
  const sum = (rows, k) => rows.reduce((a, x) => a + x[k], 0);
  const fig = (rows) => {
    const total = sum(rows, 'total');
    return { total, resolved: sum(rows, 'resolved'), escalated: sum(rows, 'escalated'), failed: sum(rows, 'failed'), up: sum(rows, 'up'), down: sum(rows, 'down'),
      tokens: sum(rows, 'tokens'), cost: rows.reduce((a, x) => a + x.cost, 0), rate: total ? sum(rows, 'resolved') / total : 0 };
  };
  const a = fig(cur), b = fig(prev);
  const change = (x, y) => (y ? (x - y) / y : null);
  const channels = CHANNELS.map(([k, l]) => {
    const conv = cur.reduce((s, x) => s + x.channels[k], 0);
    return { key: k, label: l, conv, cost: a.total ? (a.cost * conv) / a.total : 0 };
  }).sort((x, y) => y.cost - x.cost);
  return {
    figs: { ...a, change: { total: change(a.total, b.total), rate: b.rate ? a.rate - b.rate : null, escalated: change(a.escalated, b.escalated), failed: change(a.failed, b.failed), cost: change(a.cost, b.cost) },
      satisfaction: a.up + a.down ? a.up / (a.up + a.down) : null, perConv: a.total ? a.cost / a.total : 0 },
    perDay: cur,
    channels,
    unanswered: d.unanswered.filter((u) => !u.done).sort((x, y) => y.count - x.count).slice(0, 5),
    recent: [...d.recent].sort((x, y) => y.at - x.at),
  };
}

// ---- changes -----------------------------------------------------------------------------------------------------
/** Upload files (front end only: name and size). Each shows Indexing, then Indexed (or Failed) a few seconds later. */
export function addDocs(files) {
  const list = Array.from(files || []);
  if (!list.length) return { ok: false, error: 'Choose a file first.' };
  const bad = list.find((f) => !/\.(pdf|docx|txt|csv|md)$/i.test(f.name));
  if (bad) return { ok: false, error: bad.name + ': only PDF, DOCX, TXT, CSV and MD files can be added.' };
  const big = list.find((f) => f.size > MAX_MB * 1048576);
  if (big) return { ok: false, error: big.name + ' is larger than ' + MAX_MB + ' MB.' };
  return gridai.commit((d, now) => {
    const added = list.map((f, i) => {
      const id = nextId(d.docs, 'd');
      const pdf = /\.pdf$/i.test(f.name);
      const fail = (f.size || 0) === 0 || /scan/i.test(f.name);
      const doc = { id, name: f.name, size: f.size || 0, pages: Math.max(1, Math.round((f.size || 0) / (pdf ? 52000 : 9000))), status: 'indexing', readyAt: now + 4000 + i * 1500,
        outcome: fail ? 'failed' : 'indexed', note: fail ? (f.size ? 'The pages are scanned images, so no text could be read. Upload a text PDF.' : 'The file is empty.') : '', use: true, by: me(), updated: now };
      d.docs.unshift(doc);
      return doc;
    });
    return { ok: true, added };
  });
}
export function reindexDoc(id) {
  return gridai.commit((d, now) => {
    const x = d.docs.find((y) => y.id === id); if (!x) return { ok: false, error: 'This file is no longer here.' };
    Object.assign(x, { status: 'indexing', readyAt: now + 3500, outcome: /scan/i.test(x.name) ? 'failed' : 'indexed', updated: now, by: me() });
    if (x.outcome === 'indexed') x.note = '';
    return { ok: true };
  });
}
export const removeDoc = (id) => gridai.commit((d) => { const n = d.docs.length; d.docs = d.docs.filter((x) => x.id !== id); return n === d.docs.length ? { ok: false, error: 'This file is no longer here.' } : { ok: true }; });

/** Add a website address; it is crawled for a few seconds. */
export function addSite(raw) {
  let s = String(raw || '').trim();
  if (!s) return { ok: false, error: 'Type a web address.' };
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch { return { ok: false, error: 'That is not a web address.' }; }
  if (!/\./.test(u.hostname)) return { ok: false, error: 'That is not a web address.' };
  const url = (u.origin + u.pathname).replace(/\/$/, '');
  return gridai.commit((d, now) => {
    if (d.sites.some((x) => x.url.replace(/\/$/, '') === url)) return { ok: false, error: 'This address is already a source.' };
    const r = rng(url);
    const site = { id: nextId(d.sites, 's'), url, path: u.pathname || '/', title: u.hostname === 'gridcommerce.net' ? (u.pathname.split('/').filter(Boolean).pop() || 'Home') : u.hostname,
      pages: r.int(1, 30), status: 'crawling', readyAt: now + 5000, outcome: 'indexed', note: '', use: true, updated: now };
    d.sites.unshift(site);
    return { ok: true, site };
  });
}
export function recrawl(id) {
  return gridai.commit((d, now) => {
    const x = d.sites.find((y) => y.id === id); if (!x) return { ok: false, error: 'This address is no longer here.' };
    Object.assign(x, { status: 'crawling', readyAt: now + 4500, outcome: 'indexed', note: '', updated: now, pages: x.path === '/blog' ? 52 : x.pages });
    return { ok: true };
  });
}
export const recrawlAll = () => gridai.commit((d, now) => { d.sites.filter((x) => x.use).forEach((x, i) => Object.assign(x, { status: 'crawling', readyAt: now + 3000 + i * 600, outcome: 'indexed', note: '', updated: now })); return { ok: true, n: d.sites.filter((x) => x.use).length }; });
export const removeSite = (id) => gridai.commit((d) => { d.sites = d.sites.filter((x) => x.id !== id); return { ok: true }; });

/** Add or edit an FAQ (English required, Bangla optional). Marks a matching unanswered question as answered. */
export function saveFaq(f) {
  const q = String(f.q || '').trim(), a = String(f.a || '').trim();
  if (!q) return { ok: false, error: 'Write the question.', field: 'q' };
  if (!a) return { ok: false, error: 'Write the answer.', field: 'a' };
  if ((f.qBn || '').trim() && !(f.aBn || '').trim()) return { ok: false, error: 'Write the Bangla answer too, or leave the Bangla question empty.', field: 'aBn' };
  return gridai.commit((d, now) => {
    const row = { q, a, qBn: String(f.qBn || '').trim(), aBn: String(f.aBn || '').trim(), topic: f.topic || 'Other', updated: now, by: me() };
    let id = f.id;
    if (id) { const x = d.faqs.find((y) => y.id === id); if (!x) return { ok: false, error: 'This FAQ is no longer here.' }; Object.assign(x, row); }
    else { id = nextId(d.faqs, 'f'); d.faqs.unshift({ id, uses: 0, use: true, ...row }); }
    if (f.fromUnanswered) { const u = d.unanswered.find((y) => y.id === f.fromUnanswered); if (u) u.done = true; }
    d.unanswered.forEach((u) => { if (u.q.toLowerCase() === q.toLowerCase()) u.done = true; });
    return { ok: true, id };
  });
}
export const removeFaq = (id) => gridai.commit((d) => { d.faqs = d.faqs.filter((x) => x.id !== id); return { ok: true }; });

export function savePolicy({ id, title, body }) {
  if (!String(title || '').trim()) return { ok: false, error: 'Give it a title.' };
  if (String(body || '').trim().length < 20) return { ok: false, error: 'Write what GridAI should know (at least a sentence).' };
  return gridai.commit((d, now) => {
    const x = d.policies.find((y) => y.id === id); if (!x) return { ok: false, error: 'This entry is no longer here.' };
    Object.assign(x, { title: title.trim(), body: body.trim(), updated: now, by: me() });
    return { ok: true };
  });
}

/** Turn a source on or off: kind 'doc' | 'site' | 'faq' | 'policy'. */
export function setUse(kind, id, on) {
  const key = { doc: 'docs', site: 'sites', faq: 'faqs', policy: 'policies' }[kind];
  if (!key) return { ok: false, error: 'Unknown source.' };
  return gridai.commit((d) => { const x = d[key].find((y) => y.id === id); if (!x) return { ok: false, error: 'This source is no longer here.' }; x.use = !!on; return { ok: true }; });
}
export const setSetUse = (setId, on) => gridai.commit((d) => { d.useSets[setId] = !!on; return { ok: true }; });
export const setPricingUse = (ladder, on) => gridai.commit((d) => { d.usePricing[ladder] = !!on; return { ok: true }; });
export const setInclude = (id, on) => gridai.commit((d) => { const x = d.training.find((y) => y.id === id); if (!x) return { ok: false, error: 'Not found.' }; x.include = !!on; return { ok: true }; });
export const includeRated = () => gridai.commit((d) => { let n = 0; d.training.forEach((x) => { const v = x.rating === 'up'; if (x.include !== v) n++; x.include = v; }); return { ok: true, n }; });
export const resolveUnanswered = (id) => gridai.commit((d) => { const u = d.unanswered.find((y) => y.id === id); if (u) u.done = true; return { ok: true }; });

// ---- behaviour ---------------------------------------------------------------------------------------------------
const word = (list, k) => (list.find((x) => x[0] === k) || [k, k])[1];
const daysText = (days) => DAYS_ORDER.filter(([d]) => days.includes(d)).map(([, l]) => l).join(', ') || 'none';

/** What changed between two behaviour settings, one line each (for the history). */
export function behaviourChanges(a, b) {
  const out = [];
  if (a.tone !== b.tone) out.push(`Tone: ${word(TONES, a.tone)} → ${word(TONES, b.tone)}`);
  if (a.language !== b.language) out.push(`Language: ${word(LANGS, a.language)} → ${word(LANGS, b.language)}`);
  if (a.length !== b.length) out.push(`Reply length: ${word(LENGTHS, a.length)} → ${word(LENGTHS, b.length)}`);
  if (a.level !== b.level) out.push(`AI replies: ${word(LEVELS, a.level)} → ${word(LEVELS, b.level)}`);
  if (a.confidence !== b.confidence) out.push(`Hand to a person when not sure: below ${b.confidence}%`);
  if (a.maxReplies !== b.maxReplies) out.push(`Hand to a person after ${b.maxReplies} AI replies without a fix`);
  HANDOFF.forEach(([k, l]) => { if (!!a.handoff[k] !== !!b.handoff[k]) out.push(`Handoff “${l}”: ${b.handoff[k] ? 'on' : 'off'}`); });
  if (JSON.stringify(a.escalation) !== JSON.stringify(b.escalation)) out.push(`Escalation rules: ${b.escalation.length} rules`);
  b.sensitive.forEach((s) => {
    const o = a.sensitive.find((x) => x.id === s.id) || {};
    if (o.rule !== s.rule) out.push(`${s.label}: ${word(RULES, o.rule)} → ${word(RULES, s.rule)}`);
    else if (o.approver !== s.approver && s.rule === 'approval') out.push(`${s.label}: approver ${s.approver}`);
  });
  if (JSON.stringify(a.approvals) !== JSON.stringify(b.approvals)) out.push(`Approvals: wait ${b.approvals.waitMin} min, then ${b.approvals.onTimeout === 'person' ? 'hand to a person' : 'tell the person to wait'}`);
  if (a.hours.from !== b.hours.from || a.hours.to !== b.hours.to || JSON.stringify(a.hours.days) !== JSON.stringify(b.hours.days)) out.push(`Working hours: ${b.hours.from}–${b.hours.to}, ${daysText(b.hours.days)}`);
  if (a.hours.outside !== b.hours.outside) out.push(`Outside working hours: ${b.hours.outside === 'answer' ? 'GridAI answers' : 'GridAI takes a message'}`);
  if (a.banned !== b.banned) out.push('Banned topics changed');
  if (a.never !== b.never) out.push('“Never promise or share” changed');
  return out;
}

export function behaviourErrors(b) {
  const e = {};
  if (!/^\d\d:\d\d$/.test(b.hours.from) || !/^\d\d:\d\d$/.test(b.hours.to)) e.hours = 'Give a start and an end time.';
  else if (b.hours.from >= b.hours.to) e.hours = 'The end time must be after the start time.';
  if (!b.hours.days.length) e.days = 'Pick at least one working day.';
  if (b.escalation.some((x) => !String(x.when).trim())) e.escalation = 'Each escalation rule needs a “when”.';
  if (!(b.approvals.waitMin >= 5 && b.approvals.waitMin <= 240)) e.wait = 'Between 5 and 240 minutes.';
  return e;
}

export function saveBehaviour(next) {
  const errs = behaviourErrors(next);
  if (Object.keys(errs).length) return { ok: false, error: Object.values(errs)[0], errors: errs };
  return gridai.commit((d, now) => {
    const changes = behaviourChanges(d.behaviour, next);
    if (!changes.length) return { ok: false, error: 'Nothing changed.' };
    d.behaviour = JSON.parse(JSON.stringify(next));
    const who = me();
    changes.forEach((what, i) => d.history.unshift({ id: 'h' + now + '-' + i, at: now, by: who, what }));
    d.history = d.history.slice(0, 60);
    return { ok: true, changes };
  });
}

// ---- answers (Test chat) -------------------------------------------------------------------------------------------
const BN = /[\u0980-\u09FF]/;
const STOP = new Set('the a an is are do does can i my me you your to of for in on and or it how what which with be from this that there have has will we our'.split(' '));
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9\u0980-\u09FF ]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
const MODULE_WORDS = [
  [/\bpos\b|counter|register|দোকান/i, 'M04'], [/warehouse|branch|transfer|গুদাম/i, 'M05'], [/payroll|salary|hr\b|বেতন/i, 'M19'], [/inbox|messenger|whatsapp inbox|comments?/i, 'G3'],
  [/loyalty|points|reward/i, 'M20'], [/cart recovery|abandon/i, 'G4'], [/landing page/i, 'M12'], [/theme|storefront|website builder/i, 'M11'], [/analytics|report/i, 'G2'],
  [/purchas|supplier/i, 'M13'], [/warranty|imei/i, 'M28'], [/promotion|coupon|offer/i, 'M21'], [/seo|google/i, 'M10'], [/review/i, 'M09'],
];
const plansOf = (ctx, ladder) => { const p = pricing(ctx.plans).find((l) => l.id === ladder); return p && p.plans.length ? p : null; };
const inPlans = (ctx, setId) => {
  const out = [];
  pricing(ctx.plans).forEach((l) => l.plans.forEach((p) => { if ((p.sets || {})[setId] === 'Included' || ((setId === 'retail' || setId === 'online') && l.set === setId)) out.push(l.label + ' · ' + p.name); }));
  return [...new Set(out)];
};
const t0 = (en, bn, more = '', moreBn = '') => ({ en, bn, more, moreBn });
function moduleReply(code, ctx, d) {
  const mod = MODULES.find((m) => m.code === code);
  if (!mod || !d.useSets[mod.set]) return null;
  const set = SETS.find((s) => s.id === mod.set);
  const where = inPlans(ctx, mod.set);
  const addon = ['M05', 'M19', 'G3', 'G5'].includes(mod.code);
  return { msg: t0(`Yes, ${mod.name} is part of GridCommerce (${set.label}).${where.length ? ' It is included in ' + where.slice(0, 3).join(', ') + '.' : ''}${addon ? ' It can also be added to any plan as an add-on.' : ''}`,
    `হ্যাঁ, ${mod.name} GridCommerce-এ আছে (${set.label})।${addon ? ' যেকোনো প্যাকেজে অ্যাড-অন হিসেবেও নেওয়া যায়।' : ''}`), sources: [`Product · ${mod.name} (${mod.code})`], confidence: 0.84 };
}

/** A canned, rule-based reply. ctx: { persona, d (gridai data), plans (db().plans), t, turn, last } →
 *  { text, sources[], confidence, handoff, approval, draft, off, unanswered }. */
export function answer(question, ctx) {
  const q = String(question || '').trim();
  const d = ctx.d, b = d.behaviour, persona = PERSONAS.find((p) => p.id === ctx.persona) || PERSONAS[0];
  const bangla = b.language === 'bn' || (b.language === 'auto' && (BN.test(q) || (persona.lang === 'bn' && !/[a-z]{3}/i.test(q))));
  const low = q.toLowerCase();
  const pol = (title) => d.policies.find((p) => p.title === title && p.use);
  const sensitive = (id) => b.sensitive.find((s) => s.id === id);
  let r = null;           // { msg: t0(...), sources, confidence, action, handoff }
  let handoff = null;

  if (b.level === 'off') {
    return { text: bangla ? 'GridAI বন্ধ আছে। একজন মানুষ শিগগিরই উত্তর দেবেন।' : 'GridAI is off, so a person will answer this.', sources: ['Behaviour · AI replies: Off'], confidence: 1, handoff: 'GridAI is off: every conversation goes to a person', approval: null, off: true };
  }
  // banned topics
  const banned = String(b.banned || '').toLowerCase();
  const bannedHit = [['competitor', /competitor|shopify price|daraz seller fee|cheaper than/], ['legal', /lawyer|legal advice|sue|court/], ['tax', /tax advice|income tax|vat return/], ['politics', /politic|election|party/], ['religion', /religio/]]
    .find(([k, re]) => banned.includes(k) && re.test(low));
  if (bannedHit) {
    r = { msg: t0('I can’t help with that topic. I can answer anything about GridCommerce: plans, setup, orders, couriers and payments.', 'এই বিষয়ে আমি সাহায্য করতে পারি না। GridCommerce-এর প্যাকেজ, সেটআপ, অর্ডার, কুরিয়ার বা পেমেন্ট নিয়ে জিজ্ঞেস করুন।'), sources: ['Behaviour · Banned topics'], confidence: 0.95 };
  }
  // asked for a person
  if (!r && /human|real person|agent|talk to (a|some)|call me|manager|মানুষ|কথা বলতে|ফোন দিন/.test(low)) {
    r = { msg: t0('Of course. I am passing you to a person now; they reply within 15 minutes in working hours.', 'অবশ্যই। এখনই একজন মানুষের কাছে পাঠাচ্ছি; কাজের সময়ে ১৫ মিনিটের মধ্যে উত্তর পাবেন।'), sources: ['Behaviour · Human handoff'], confidence: 0.98 };
    if (b.handoff.asked) handoff = 'The person asked for a human';
  }
  const upset = /useless|worst|terrible|angry|fraud|scam|cheat|rubbish|!!|ফালতু|বাজে|প্রতারণা|রাগ/.test(low) || (persona.id === 'angry' && /refund|cancel|why|useless|keep paying/.test(low));
  if (b.handoff.legal && /fraud|scam|lawyer|police|court|data leak|প্রতারণা/.test(low)) handoff = handoff || 'Legal or fraud words';
  if (!r && /cancel|close my account|delete my account|অ্যাকাউন্ট বন্ধ/.test(low)) {
    const s = sensitive('cancel');
    r = { msg: t0('I am sorry to hear that. Closing an account is done by a person, so I have passed this on. Your data stays safe and can be exported first.', 'শুনে খারাপ লাগল। অ্যাকাউন্ট বন্ধ একজন মানুষ করেন, তাই পাঠিয়ে দিলাম। আপনার ডেটা নিরাপদ, আগে এক্সপোর্ট করে নিতে পারবেন।'), sources: ['Policy · Data and privacy policy'], confidence: 0.9, action: s };
  }
  if (!r && /refund|money back|টাকা ফেরত|রিফান্ড/.test(low)) {
    const p = pol('Refund policy');
    r = p ? { msg: t0('Monthly plans are not refunded once the month has started; yearly plans are refunded for unused full months within 60 days.', 'মাস শুরু হলে মাসিক প্যাকেজের টাকা ফেরত হয় না; বার্ষিক প্যাকেজে ৬০ দিনের মধ্যে বাকি পুরো মাসগুলোর টাকা ফেরত হয়।', 'Refunds go back the way the bill was paid within 7 working days.', 'বিল যেভাবে দিয়েছেন সেভাবেই ৭ কর্মদিবসে ফেরত যায়।'), sources: ['Policy · Refund policy'], confidence: 0.88, action: sensitive('refund') } : null;
  }
  if (!r && /discount|free month|cheaper|offer me|ছাড়|ডিসকাউন্ট/.test(low)) {
    r = { msg: t0('Paying yearly already saves about two months. A discount for your account is decided by our Finance team.', 'বছরে একবারে দিলে প্রায় দুই মাস বাঁচে। আপনার জন্য আলাদা ছাড় Finance টিম ঠিক করে।'), sources: ['Pricing · Yearly prices'], confidence: 0.8, action: sensitive('discount') };
  }
  if (!r && /extend|more days|আরো দিন|বাড়ান/.test(low) && /trial|ট্রায়াল|days|দিন/.test(low)) {
    r = { msg: t0('A trial can be extended once by up to 7 days.', 'ট্রায়াল একবার সর্বোচ্চ ৭ দিন বাড়ানো যায়।'), sources: ['Policy · Trial terms'], confidence: 0.86, action: sensitive('trial') };
  }
  if (!r && /trial|ট্রায়াল/.test(low) && pol('Trial terms')) {
    const p = persona.id === 'trial';
    r = { msg: t0(p ? 'You are on day 9 of 15. On day 16 your store moves to the Business plan at ৳2,500 a month; pay from Settings › Subscription to keep it running.' : 'Every plan has a 15-day free trial with all its modules. No card is needed.',
      p ? 'আপনি ১৫ দিনের ৯ম দিনে আছেন। ১৬তম দিনে স্টোর Business প্যাকেজে (মাসে ৳২,৫০০) যাবে; চালু রাখতে Settings › Subscription থেকে পেমেন্ট দিন।' : 'প্রতিটি প্যাকেজে ১৫ দিনের ফ্রি ট্রায়াল, সব মডিউলসহ। কার্ড লাগে না।',
      'Unpaid trials become read-only, and are closed after 40 days.', 'পেমেন্ট না হলে স্টোর রিড-অনলি হয়, ৪০ দিন পর বন্ধ হয়।'), sources: ['Policy · Trial terms'], confidence: 0.93 };
  }
  if (!r && /password|sign ?in|log ?in|forgot|পাসওয়ার্ড|লগইন/.test(low) && pol('Password reset')) {
    const s = sensitive('reset');
    r = { msg: s.rule === 'allowed'
      ? t0('I have sent a reset link to the phone on your account. It works for 30 minutes. Never share the code with anyone, including us.', 'আপনার অ্যাকাউন্টের ফোনে রিসেট লিংক পাঠিয়েছি, ৩০ মিনিট কাজ করবে। কোডটি কাউকে দেবেন না, আমাদেরও না।')
      : t0('A person will send you a reset link shortly. Never share the code with anyone, including us.', 'একজন শিগগিরই রিসেট লিংক পাঠাবেন। কোডটি কাউকে দেবেন না, আমাদেরও না।'),
      sources: ['Procedure · Password reset'], confidence: 0.94, action: s.rule === 'allowed' ? null : s };
  }
  if (!r && /courier|pathao|steadfast|redx|paperfly|sync|parcel|কুরিয়ার|পার্সেল/.test(low)) {
    const fail = /not|stuck|fail|useless|isn|problem|হচ্ছে না/.test(low);
    if (fail && pol('Courier sync failure')) {
      r = { msg: t0('That is usually an expired courier API key. Open Connections › Delivery, reconnect the courier with a new key, and stuck parcels re-sync within 10 minutes.', 'সাধারণত কুরিয়ারের API কী মেয়াদোত্তীর্ণ হলে এমন হয়। Connections › Delivery-তে নতুন কী দিয়ে আবার যুক্ত করুন, ১০ মিনিটে আটকে থাকা পার্সেল সিঙ্ক হবে।', 'If it still fails after reconnecting, our Operations team takes over.', 'তারপরও না হলে Operations টিম দেখবে।'), sources: ['Procedure · Courier sync failure'], confidence: 0.87 };
    } else if (/\b(add|connect|set ?up|how)\b|যুক্ত/.test(low)) {
      r = { msg: t0('Open Connections › Delivery, pick the courier (Pathao, Steadfast, RedX or Paperfly) and paste the API key from your courier account. Bookings and tracking start at once.', 'Connections › Delivery-তে গিয়ে কুরিয়ার (পাঠাও, স্টেডফাস্ট, রেডএক্স বা পেপারফ্লাই) বেছে আপনার কুরিয়ার অ্যাকাউন্টের API কী দিন। সাথে সাথে বুকিং আর ট্র্যাকিং শুরু।', 'COD payouts then show in Payouts by themselves.', 'COD পেআউট নিজে থেকেই Payouts-এ দেখাবে।'), sources: ['Docs · Courier guide: Pathao, Steadfast, RedX.pdf'], confidence: 0.91 };
    } else {
      const f = d.faqs.find((x) => x.use && /couriers/i.test(x.q));
      r = { msg: t0(f ? f.a : 'Pathao, Steadfast, RedX and Paperfly are connected.', f && f.aBn ? f.aBn : 'পাঠাও, স্টেডফাস্ট, রেডএক্স আর পেপারফ্লাই যুক্ত।', 'Add yours in Connections › Delivery with the courier’s API key.', 'Connections › Delivery-তে কুরিয়ারের API কী দিয়ে যুক্ত করুন।'), sources: [f ? 'FAQ · ' + f.q : 'Docs · Courier guide: Pathao, Steadfast, RedX.pdf'], confidence: 0.9 };
    }
  }
  if (!r && /(paid|payment|bkash|nagad|বিকাশ|নগদ|টাকা দিয়েছি)/.test(low) && /(not show|not showing|still|missing|দেখাচ্ছে না|আসেনি|unpaid)/.test(low) && pol('Payment not showing')) {
    r = { msg: t0('bKash and Nagad payments show within 10 minutes. Please send the transaction ID and the number you paid from, and I will check.', 'বিকাশ ও নগদের পেমেন্ট ১০ মিনিটের মধ্যে দেখায়। ট্রানজ্যাকশন আইডি আর যে নম্বর থেকে দিয়েছেন সেটা পাঠান, আমি দেখছি।', 'If it is not found after 30 minutes, Finance confirms it by hand.', '৩০ মিনিটেও না পেলে Finance নিজে নিশ্চিত করবে।'), sources: ['Procedure · Payment not showing'], confidence: 0.85 };
    if (persona.id === 'late') handoff = handoff || 'Payment not found: goes to Finance';
  }
  if (!r && /read-?only|suspend|locked|blocked|বন্ধ হয়ে|রিড/.test(low) && pol('Late payment terms')) {
    const late = persona.id === 'late';
    r = { msg: t0(late ? 'Your bill of ৳1,000 is 9 days late, so the store is read-only now and is suspended on day 15. Paying lifts it at once.' : 'A store becomes read-only 8 days after a missed bill and is suspended after 15 days. Paying lifts it at once.',
      late ? 'আপনার ৳১,০০০ বিল ৯ দিন বাকি, তাই স্টোর এখন রিড-অনলি, ১৫ দিনে সাসপেন্ড হবে। পেমেন্ট দিলেই সাথে সাথে চালু হবে।' : 'বিল ৮ দিন বাকি থাকলে স্টোর রিড-অনলি হয়, ১৫ দিনে সাসপেন্ড। পেমেন্ট দিলেই সাথে সাথে চালু।',
      'Pay from Settings › Subscription by bKash, Nagad, Rocket, card or bank.', 'Settings › Subscription থেকে বিকাশ, নগদ, রকেট, কার্ড বা ব্যাংকে দিন।'), sources: ['Policy · Late payment terms'], confidence: 0.9, action: /unlock|lift|open|চালু করে/.test(low) ? sensitive('unsuspend') : null };
  }
  const modHit = MODULE_WORDS.find(([re]) => re.test(low));
  if (!r && modHit && /\b(have|has|include|includes|does|is there|support|got)\b|আছে/.test(low)) r = moduleReply(modHit[1], ctx, d);
  if (!r && /price|cost|plan|package|how much|pricing|monthly|yearly|দাম|খরচ|প্যাকেজ|কত টাকা/.test(low)) {
    const ladder = persona.id === 'late' ? 'retail' : /pos|shop|retail|দোকান/.test(low) ? 'retail' : 'online';
    const lad = d.usePricing[ladder] ? plansOf(ctx, ladder) : null;
    if (lad) {
      const named = lad.plans.find((p) => low.includes(p.name.toLowerCase()));
      const list = lad.plans.map((p) => `${p.name} ${taka(p.price)}`).join(', ');
      r = named
        ? { msg: t0(`${named.name} is ${taka(named.price)} a month or ${taka(named.yearly)} a year. ${named.tagline}`, `${named.name} মাসে ${taka(named.price)} অথবা বছরে ${taka(named.yearly)}।`, `It includes ${limitText('orders', named.limits.orders)} orders a month and ${named.limits.seats} staff seats.`, `মাসে ${limitText('orders', named.limits.orders)} অর্ডার আর ${named.limits.seats} জন স্টাফ।`), sources: [`Pricing · ${lad.label} · ${named.name} plan`], confidence: 0.96 }
        : { msg: t0(`${lad.label} plans a month: ${list}. Every plan starts with a 15-day free trial.`, `${lad.label} প্যাকেজ (মাসিক): ${list}। প্রতিটিতে ১৫ দিনের ফ্রি ট্রায়াল।`, 'Paying yearly gives about two months free.', 'বছরে একবারে দিলে প্রায় দুই মাস ফ্রি।'), sources: [`Pricing · ${lad.label} plans (v${lad.v})`], confidence: 0.94 };
    }
  }
  if (!r && modHit) r = moduleReply(modHit[1], ctx, d);
  if (!r) {
    // the FAQ with the most words in common
    const qw = new Set(words(q));
    let best = null, score = 0;
    d.faqs.filter((f) => f.use).forEach((f) => {
      const s = words(f.q + ' ' + (f.qBn || '')).filter((w) => qw.has(w)).length;
      if (s > score) { score = s; best = f; }
    });
    if (best && score >= 2) r = { msg: t0(best.a, best.aBn || best.a), sources: ['FAQ · ' + (bangla && best.qBn ? best.qBn : best.q)], confidence: Math.min(0.92, 0.55 + score * 0.12) };
  }
  if (!r) {
    r = { msg: t0('I am not sure about that yet. I will check with the team so you get the right answer.', 'এ বিষয়ে আমি এখনো নিশ্চিত নই। সঠিক উত্তরের জন্য টিমের সাথে কথা বলছি।'), sources: [], confidence: 0.32, unanswered: true };
  }

  // handoff and approval rules
  if (upset && b.handoff.upset) handoff = handoff || 'The person is upset';
  if (r.confidence * 100 < b.confidence && b.handoff.lowConfidence) handoff = handoff || `Not sure (${Math.round(r.confidence * 100)}% < ${b.confidence}%)`;
  if (b.handoff.repeat && ctx.last && ctx.last.trim().toLowerCase() === low) handoff = handoff || 'The same question came back';
  if (b.handoff.enterprise && persona.id === 'angry') handoff = handoff || 'Enterprise merchant';
  if (ctx.turn >= b.maxReplies && !handoff && persona.id === 'angry') handoff = `${b.maxReplies} AI replies without a fix`;
  let approval = null;
  if (r.action) {
    if (r.action.rule === 'approval') approval = { action: r.action.label, approver: r.action.approver, wait: b.approvals.waitMin };
    else if (r.action.rule === 'never') handoff = handoff || `${r.action.label}: only a person may do this`;
  }
  // outside working hours
  const tt = ctx.t || Date.now();
  const clock = hm(tt), wd = new Date(tt + 6 * 3600e3).getUTCDay();
  const open = b.hours.days.includes(wd) && clock >= b.hours.from && clock < b.hours.to;
  let note = '';
  if (!open && b.hours.outside === 'collect') { note = bangla ? 'এখন অফিস বন্ধ; কাল সকালে একজন উত্তর দেবেন।' : 'We are closed now; a person replies when we open.'; handoff = handoff || 'Outside working hours: GridAI took a message'; }

  const m = r.msg;
  let text = bangla ? m.bn : m.en;
  if (b.length === 'normal' && (bangla ? m.moreBn : m.more)) text += ' ' + (bangla ? m.moreBn : m.more);
  if (upset && !bangla && !/sorry/i.test(text)) text = 'I am sorry for the trouble. ' + text;
  if (b.tone === 'formal' && !bangla) text = text.replace(/^Of course\./, 'Certainly.').replace(/^Great\./, 'Thank you.');
  if (b.tone === 'friendly' && !bangla && r.confidence > 0.85 && !upset && !handoff) text = text + ' 🙂';
  if (approval) text += bangla ? ` (এটার জন্য ${approval.approver}-এর অনুমোদন লাগবে।)` : ` I have asked ${approval.approver} to approve it.`;
  if (note) text += ' ' + note;
  return { text, sources: r.sources, confidence: r.confidence, handoff, approval, draft: b.level === 'assist', unanswered: !!r.unanswered, bangla };
}

export const personaBy = (id) => PERSONAS.find((p) => p.id === id) || PERSONAS[0];
export const when = (ms) => dmy(ms) + ' · ' + hm(ms);

