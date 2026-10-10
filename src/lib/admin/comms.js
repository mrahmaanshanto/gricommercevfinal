// admin/comms — GridCommerce's own messaging to leads and merchants (front end only; createStore key `comms`).
// Nothing is really sent: a send writes messages to the log with a status the demo works out (a bad number fails,
// most go through). The merchant panel's messaging (lib/messaging, lib/campaigns …) is never read or written here.
//
//   Reading
//     VARIABLES, PURPOSES, STATUS_TONE, CH_LABEL     the {{variables}}, template purposes, badge tones, channel names
//     contacts() · contactBy(k, id)                    merchants (the platform's stores' owners) and leads (LEADS)
//     audiences(t)                                     saved audiences: trials ending, overdue stores, new leads …
//     messages(data, { ch, status, kind, q })         the message log, newest first (rows enriched with the contact)
//     messageText(data, m)                             the text a message went out with ({ subject, body })
//     figures(data, t, days)                           sent / delivered / failed / cost per channel, calls, WhatsApp
//     series(data, t, days)                            sends per day by channel, for the chart
//     attention(data, t)                               failures and problems needing someone (at most five rows)
//     providerRows(data, t) · merchantUsage(t)         provider health; each store's SMS use this month
//     automationRuns(a, t)                             an automation's recent runs (worked out, not stored)
//     smsParts(text) · fill(text, vars) · varsFor(contact, t) · validPhone · validEmail
//   Changing (each commits and returns { ok, error?, … })
//     sendMessage · cancelSend · sendScheduledNow · retryMessages · runDue
//     saveCampaign · sendCampaign · cancelCampaign · saveTemplate · createTemplate · duplicateTemplate
//     setAutomationOn · saveAutomation · createAutomation · duplicateAutomation · deleteAutomation
//     setPrimary · setProviderOn · topUp · testProvider · saveEmailSettings · copyDmarc · recheckDomain
//     markRead · replyThread · setThreadStatus · assignThread

import { createStore } from './store';
import { db as platformDb, staff } from '@/lib/platform/store';
import { DAY, MIN, rng, startOfDay, dmy, dm, hm, taka } from '@/lib/platform/util';
import { merchantList, merchantRow, usageOf, walletOf, ownerOf } from './merchants';

// ---- words ----------------------------------------------------------------------------------------------------------
export const CH_LABEL = { sms: 'SMS', email: 'Email' };
export const STATUSES = ['Queued', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Failed'];
export const STATUS_TONE = { Queued: 'neutral', Scheduled: 'primary', Sent: 'primary', Delivered: 'success', Opened: 'success', Clicked: 'success', Bounced: 'warning', Failed: 'error', Draft: 'neutral', Cancelled: 'neutral', Sending: 'primary' };
export const KIND_LABEL = { single: 'Single', bulk: 'Bulk', scheduled: 'Scheduled', automation: 'Automation', campaign: 'Campaign', reply: 'Reply' };

export const PURPOSES = [
  ['onboarding', 'Merchant onboarding'], ['trial', 'Trial expiration'], ['renewal', 'Subscription renewal'],
  ['reminder', 'Payment reminder'], ['paid', 'Payment confirmation'], ['promo', 'Promotional offer'],
  ['support', 'Customer support'], ['meeting', 'Meeting reminder'], ['system', 'System notification'],
];
export const purposeLabel = (k) => (PURPOSES.find((p) => p[0] === k) || [k, k])[1];

/** [key, label, sample] — the sample fills the preview when no recipient is picked. */
export const VARIABLES = [
  ['owner_name', 'Owner or lead name', 'Rahim Uddin'], ['store_name', 'Store name', 'Dhaka Gadget Hub'],
  ['plan', 'Plan', 'Business'], ['amount', 'Amount', '৳3,100'], ['due_date', 'Due date', '18 Oct 2026'],
  ['invoice_no', 'Invoice number', 'INV-2026-0412'], ['trial_end', 'Trial ends', '14 Oct 2026'], ['days_left', 'Days left', '3'],
  ['link', 'Link', 'gcm.bd/p/7Q2K'], ['offer', 'Offer', '20% off the first 3 months'], ['code', 'Promo code', 'GROW20'],
  ['ticket_no', 'Ticket number', 'T-4821'], ['agent_name', 'Staff name', 'Farhana Akter'], ['meeting_time', 'Meeting time', '15 Oct, 11:00 AM'],
  ['date', 'Date', '16 Oct 2026'],
];
const SAMPLE = Object.fromEntries(VARIABLES.map(([k, , v]) => [k, v]));

// ---- helpers ----------------------------------------------------------------------------------------------------------
export function fill(text, vars) {
  return String(text || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (all, k) => (vars && vars[k] != null && vars[k] !== '' ? String(vars[k]) : all));
}
export const varsIn = (text) => [...new Set([...String(text || '').matchAll(/\{\{\s*([a-z_]+)\s*\}\}/g)].map((m) => m[1]))];

/** Characters and SMS parts: 160 a part in English, 70 in Bangla (any non-GSM character makes it Unicode). */
export function smsParts(text) {
  const t = String(text || '');
  const unicode = /[^\x00-\x7F]/.test(t.replace(/৳/g, 'Tk'));
  const per = unicode ? 70 : 160;
  return { chars: t.length, parts: t.length ? Math.max(1, Math.ceil(t.length / per)) : 0, per, unicode };
}
const digits = (p) => String(p || '').replace(/\D/g, '');
export function validPhone(p) { const d = digits(p).replace(/^88/, ''); return /^01[3-9]\d{8}$/.test(d); }
export function normPhone(p) { const d = digits(p).replace(/^88/, ''); return d.length === 11 ? d.slice(0, 5) + '-' + d.slice(5) : String(p || '').trim(); }
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(e || '').trim());

// ---- contacts -------------------------------------------------------------------------------------------------------------
export const LEADS = [
  ['L-2101', 'Sharmin Akter', 'Sharmin’s Kitchen', 'Dhaka', 'new', 1], ['L-2102', 'Tanvir Ahmed', 'Tech Bazar BD', 'Chattogram', 'new', 2],
  ['L-2103', 'Mehedi Hasan', 'Mehedi Mobile Zone', 'Sylhet', 'new', 3], ['L-2104', 'Nasrin Sultana', 'Nakshi Kantha House', 'Rajshahi', 'new', 4],
  ['L-2105', 'Arif Chowdhury', 'Chowdhury Traders', 'Khulna', 'new', 5], ['L-2106', 'Farzana Yasmin', 'Yasmin Boutique', 'Dhaka', 'new', 6],
  ['L-2107', 'Rashed Karim', 'Karim Electronics', 'Gazipur', 'contacted', 9], ['L-2108', 'Lubna Haque', 'Lubna Cosmetics', 'Dhaka', 'contacted', 11],
  ['L-2109', 'Sabbir Rahman', 'Sabbir Sports', 'Narayanganj', 'demo', 12], ['L-2110', 'Jannatul Ferdous', 'Ferdous Organic Foods', 'Bogura', 'demo', 14],
  ['L-2111', 'Imran Hossain', 'Hossain Furniture', 'Tangail', 'contacted', 16], ['L-2112', 'Taslima Begum', 'Taslima Jamdani', 'Narayanganj', 'proposal', 18],
  ['L-2113', 'Kamrul Islam', 'Kamrul Computers', 'Dhaka', 'demo', 20], ['L-2114', 'Rubina Khatun', 'Rubina Pickles', 'Pabna', 'contacted', 22],
  ['L-2115', 'Shakil Ahmed', 'Shakil Shoe Gallery', 'Chattogram', 'proposal', 24], ['L-2116', 'Moushumi Das', 'Das Sweets', 'Sylhet', 'new', 2],
  ['L-2117', 'Rafiq Mia', 'Mia Hardware', 'Bogura', 'contacted', 27], ['L-2118', 'Ayesha Siddiqua', 'Ayesha Hijab Store', 'Dhaka', 'demo', 8],
].map(([id, name, org, dist, stage, ago], i) => {
  const r = rng('lead' + id);
  const op = ['017', '018', '019', '015', '016', '013'][i % 6];
  const phone = op + String(r.int(10, 99)) + '-' + String(r.int(100000, 999999));
  const email = name.toLowerCase().split(' ')[0] + '.' + org.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10) + '@gmail.com';
  return { k: 'lead', id, name, org, dist, stage, ago, phone, email };
});

const CONTACTS = { at: 0, list: null };
function merchantContacts() {
  const d = platformDb();
  return d.shops.map((s) => {
    const o = ownerOf(s);
    const r = rng('phone' + s.id);
    const phone = !o.phone || /x/i.test(o.phone) ? ['017', '018', '019', '016', '015'][r.int(0, 4)] + String(r.int(10, 99)) + '-' + String(r.int(100000, 999999)) : normPhone(o.phone);
    return { k: 'merchant', id: s.id, name: o.name || s.name, org: s.name, phone, email: o.email || `owner@${s.sub}.com.bd`, lang: o.lang === 'বাংলা' ? 'bn' : 'en', dist: s.dist };
  });
}
/** Every contact: the stores' owners and the leads. */
export function contacts() {
  const d = platformDb();
  if (!CONTACTS.list || CONTACTS.at !== d.shops.length) CONTACTS.list = [...merchantContacts(), ...LEADS], CONTACTS.at = d.shops.length;
  return CONTACTS.list;
}
export function contactBy(k, id) {
  if (k === 'x') return null;
  return contacts().find((c) => c.k === (k === 'm' ? 'merchant' : k === 'l' ? 'lead' : k) && c.id === id) || null;
}
const ref = (c) => (c.k === 'merchant' ? { k: 'm', id: c.id } : c.k === 'lead' ? { k: 'l', id: c.id } : { k: 'x', name: c.name || '', addr: c.addr });
/** The variables for one recipient (its own name, store, plan …; the rest from the samples). */
export function varsFor(c, t, extra) {
  const v = { ...SAMPLE };
  if (c && c.k === 'merchant') {
    const d = platformDb();
    const shop = d.shops.find((x) => x.id === c.id);
    const row = shop ? merchantRow(d, shop, t) : null;
    v.owner_name = c.name; v.store_name = c.org;
    if (row) {
      v.plan = row.planName;
      if (row.owed) v.amount = taka(row.owed); else if (row.monthly) v.amount = taka(row.monthly);
      if (row.renewal) { v.due_date = dmy(row.renewal); if (row.stateKey === 'trial') { v.trial_end = dmy(row.renewal); v.days_left = String(Math.max(0, row.trialLeft || 0)); } }
    }
    v.link = 'gcm.bd/' + c.id;
  } else if (c && c.k === 'lead') {
    v.owner_name = c.name; v.store_name = c.org; v.link = 'gcm.bd/demo';
  } else if (c && c.name) v.owner_name = c.name;
  return { ...v, ...(extra || {}) };
}

/** Saved audiences, worked out now. Each: { key, label, note, list: contacts }. */
export function audiences(t) {
  const d = platformDb();
  const rows = merchantList(d, t).rows;
  const all = contacts();
  const mer = (pred) => rows.filter(pred).map((r) => all.find((c) => c.k === 'merchant' && c.id === r.id)).filter(Boolean);
  return [
    { key: 'trials-ending', label: 'Trials ending in 3 days', note: 'Stores on trial with 3 days or less left', list: mer((r) => r.stateKey === 'trial' && r.trialLeft != null && r.trialLeft <= 3) },
    { key: 'overdue', label: 'Overdue stores', note: 'Behind on payment (grace or past due)', list: mer((r) => r.view === 'late') },
    { key: 'trials', label: 'Every store on trial', note: 'All trials', list: mer((r) => r.stateKey === 'trial') },
    { key: 'paying', label: 'Paying merchants', note: 'Active subscriptions', list: mer((r) => r.view === 'paying') },
    { key: 'merchants', label: 'All merchants', note: 'Every store owner except closed stores', list: mer((r) => r.view !== 'closed') },
    { key: 'new-leads', label: 'New leads this week', note: 'Leads added in the last 7 days, not contacted yet', list: LEADS.filter((l) => l.stage === 'new' && l.ago <= 7) },
    { key: 'leads', label: 'All open leads', note: 'Every lead that has not signed up', list: LEADS },
  ];
}
export const audienceBy = (key, t) => audiences(t).find((a) => a.key === key) || null;

// ---- templates -----------------------------------------------------------------------------------------------------------
const T = (purpose, ch, name, en, bn) => ({ id: `T-${purpose.toUpperCase()}-${ch.toUpperCase()}`, purpose, ch, name, en, bn, status: 'Active', version: 1 });
const SIGN = '\n\nThe GridCommerce team';
const SIGN_BN = '\n\nGridCommerce টিম';
const SEED_TEMPLATES = [
  T('onboarding', 'sms', 'Welcome SMS',
    { body: 'Welcome to GridCommerce, {{owner_name}}! {{store_name}} is ready. Sign in: {{link}} Help: 09678-112233' },
    { body: 'GridCommerce-এ স্বাগতম, {{owner_name}}! {{store_name}} তৈরি। লগইন করুন: {{link}} সাহায্য: 09678-112233' }),
  T('onboarding', 'email', 'Welcome email',
    { subject: '{{store_name}} is ready on GridCommerce', body: 'Hi {{owner_name}},\n\nYour store {{store_name}} is set up on the {{plan}} plan. Sign in and add your first products:\n{{link}}\n\nYour trial runs until {{trial_end}}. Reply to this email if you need a hand. We answer within the hour.' + SIGN },
    { subject: '{{store_name}} GridCommerce-এ প্রস্তুত', body: 'প্রিয় {{owner_name}},\n\nআপনার স্টোর {{store_name}} {{plan}} প্ল্যানে চালু হয়েছে। লগইন করে প্রথম পণ্য যোগ করুন:\n{{link}}\n\nআপনার ট্রায়াল চলবে {{trial_end}} পর্যন্ত। কোনো সাহায্য লাগলে এই ইমেইলের উত্তর দিন।' + SIGN_BN }),
  T('trial', 'sms', 'Trial ending SMS',
    { body: '{{store_name}}: your GridCommerce trial ends in {{days_left}} days ({{trial_end}}). Pick a plan to keep selling: {{link}}' },
    { body: '{{store_name}}: আপনার GridCommerce ট্রায়াল {{days_left}} দিন পর ({{trial_end}}) শেষ হবে। বিক্রি চালু রাখতে প্ল্যান বেছে নিন: {{link}}' }),
  T('trial', 'email', 'Trial ending email',
    { subject: 'Your trial ends on {{trial_end}}', body: 'Hi {{owner_name}},\n\nThe free trial for {{store_name}} ends in {{days_left}} days, on {{trial_end}}. Choose a plan now and nothing changes for your shoppers:\n{{link}}\n\nPrefer to talk it through? Reply and we will call you.' + SIGN },
    { subject: 'আপনার ট্রায়াল {{trial_end}} তারিখে শেষ হবে', body: 'প্রিয় {{owner_name}},\n\n{{store_name}}-এর ফ্রি ট্রায়াল {{days_left}} দিন পর, {{trial_end}} তারিখে শেষ হবে। এখনই প্ল্যান বেছে নিন, আপনার ক্রেতাদের জন্য কিছুই বদলাবে না:\n{{link}}\n\nকথা বলতে চাইলে উত্তর দিন, আমরা ফোন করব।' + SIGN_BN }),
  T('renewal', 'sms', 'Renewal SMS',
    { body: '{{store_name}}: your {{plan}} plan renews on {{due_date}} for {{amount}}. Pay with bKash or card: {{link}}' },
    { body: '{{store_name}}: আপনার {{plan}} প্ল্যান {{due_date}} তারিখে {{amount}}-তে নবায়ন হবে। বিকাশ বা কার্ডে পরিশোধ করুন: {{link}}' }),
  T('renewal', 'email', 'Renewal email',
    { subject: 'Your {{plan}} plan renews on {{due_date}}', body: 'Hi {{owner_name}},\n\nThe {{plan}} plan for {{store_name}} renews on {{due_date}}. The bill is {{amount}}.\n\nPay ahead with bKash, Nagad or card:\n{{link}}' + SIGN },
    { subject: 'আপনার {{plan}} প্ল্যান {{due_date}} তারিখে নবায়ন হবে', body: 'প্রিয় {{owner_name}},\n\n{{store_name}}-এর {{plan}} প্ল্যান {{due_date}} তারিখে নবায়ন হবে। বিলের পরিমাণ {{amount}}।\n\nবিকাশ, নগদ বা কার্ডে আগেই পরিশোধ করুন:\n{{link}}' + SIGN_BN }),
  T('reminder', 'sms', 'Payment reminder SMS',
    { body: '{{store_name}}: invoice {{invoice_no}} for {{amount}} was due on {{due_date}}. Pay now to keep your store open: {{link}}' },
    { body: '{{store_name}}: ইনভয়েস {{invoice_no}} ({{amount}}) পরিশোধের তারিখ ছিল {{due_date}}। স্টোর চালু রাখতে এখনই পরিশোধ করুন: {{link}}' }),
  T('reminder', 'email', 'Payment reminder email',
    { subject: 'Invoice {{invoice_no}} is overdue', body: 'Hi {{owner_name}},\n\nInvoice {{invoice_no}} for {{amount}} was due on {{due_date}} and is still open. Pay now so {{store_name}} stays open:\n{{link}}\n\nAlready paid? Reply with the transaction ID and we will match it.' + SIGN },
    { subject: 'ইনভয়েস {{invoice_no}} বকেয়া', body: 'প্রিয় {{owner_name}},\n\nইনভয়েস {{invoice_no}} ({{amount}}) পরিশোধের তারিখ ছিল {{due_date}}, এখনও বাকি। {{store_name}} চালু রাখতে এখনই পরিশোধ করুন:\n{{link}}\n\nপরিশোধ করে থাকলে ট্রানজ্যাকশন আইডি দিয়ে উত্তর দিন।' + SIGN_BN }),
  T('paid', 'sms', 'Payment received SMS',
    { body: 'Thank you! We received {{amount}} for {{store_name}} (invoice {{invoice_no}}). Receipt: {{link}}' },
    { body: 'ধন্যবাদ! {{store_name}}-এর জন্য {{amount}} পেয়েছি (ইনভয়েস {{invoice_no}})। রসিদ: {{link}}' }),
  T('paid', 'email', 'Payment received email',
    { subject: 'Payment received: {{amount}}', body: 'Hi {{owner_name}},\n\nWe received {{amount}} for {{store_name}}. Invoice {{invoice_no}} is paid.\n\nYour receipt: {{link}}' + SIGN },
    { subject: 'পেমেন্ট পেয়েছি: {{amount}}', body: 'প্রিয় {{owner_name}},\n\n{{store_name}}-এর জন্য {{amount}} পেয়েছি। ইনভয়েস {{invoice_no}} পরিশোধিত।\n\nআপনার রসিদ: {{link}}' + SIGN_BN }),
  T('promo', 'sms', 'Offer SMS',
    { body: '{{owner_name}}, {{offer}} on GridCommerce until {{due_date}}. Use code {{code}}: {{link}}' },
    { body: '{{owner_name}}, GridCommerce-এ {{offer}}, {{due_date}} পর্যন্ত। কোড {{code}} ব্যবহার করুন: {{link}}' }),
  T('promo', 'email', 'Offer email',
    { subject: '{{offer}} until {{due_date}}', body: 'Hi {{owner_name}},\n\nFor a short time you get {{offer}} on GridCommerce: online store, POS, inbox and courier booking in one place.\n\nUse code {{code}} before {{due_date}}:\n{{link}}' + SIGN },
    { subject: '{{due_date}} পর্যন্ত {{offer}}', body: 'প্রিয় {{owner_name}},\n\nসীমিত সময়ের জন্য GridCommerce-এ {{offer}}: অনলাইন স্টোর, POS, ইনবক্স আর কুরিয়ার বুকিং এক জায়গায়।\n\n{{due_date}}-এর আগে কোড {{code}} ব্যবহার করুন:\n{{link}}' + SIGN_BN }),
  T('support', 'sms', 'Ticket reply SMS',
    { body: 'Ticket {{ticket_no}}: {{agent_name}} from GridCommerce support replied. See the answer: {{link}}' },
    { body: 'টিকিট {{ticket_no}}: GridCommerce সাপোর্ট থেকে {{agent_name}} উত্তর দিয়েছেন। দেখুন: {{link}}' }),
  T('support', 'email', 'Ticket solved email',
    { subject: 'Ticket {{ticket_no}} is solved', body: 'Hi {{owner_name}},\n\n{{agent_name}} marked your ticket {{ticket_no}} as solved. How did we do? One tap to rate us:\n{{link}}\n\nStill stuck? Reply to this email and the ticket opens again.' + SIGN },
    { subject: 'টিকিট {{ticket_no}} সমাধান হয়েছে', body: 'প্রিয় {{owner_name}},\n\n{{agent_name}} আপনার টিকিট {{ticket_no}} সমাধান হিসেবে চিহ্নিত করেছেন। আমাদের সেবা কেমন ছিল? এক ট্যাপে জানান:\n{{link}}\n\nএখনও সমস্যা? এই ইমেইলের উত্তর দিলে টিকিট আবার খুলবে।' + SIGN_BN }),
  T('meeting', 'sms', 'Demo reminder SMS',
    { body: 'Reminder: your GridCommerce demo with {{agent_name}} is at {{meeting_time}}. Join: {{link}}' },
    { body: 'মনে করিয়ে দিচ্ছি: {{agent_name}}-এর সাথে আপনার GridCommerce ডেমো {{meeting_time}}-এ। যোগ দিন: {{link}}' }),
  T('meeting', 'email', 'Demo booked email',
    { subject: 'Your GridCommerce demo: {{meeting_time}}', body: 'Hi {{owner_name}},\n\nYour demo with {{agent_name}} is booked for {{meeting_time}}. It takes about 30 minutes. Bring your product list and we will set up a sample store with you.\n\nJoin here: {{link}}' + SIGN },
    { subject: 'আপনার GridCommerce ডেমো: {{meeting_time}}', body: 'প্রিয় {{owner_name}},\n\n{{agent_name}}-এর সাথে আপনার ডেমো {{meeting_time}}-এ ঠিক হয়েছে। প্রায় ৩০ মিনিট লাগবে। পণ্যের তালিকা সাথে রাখুন, আমরা একসাথে একটি নমুনা স্টোর বানাব।\n\nযোগ দিন: {{link}}' + SIGN_BN }),
  T('system', 'sms', 'Maintenance SMS',
    { body: 'GridCommerce: maintenance on {{date}}, 2-3 AM. Your store stays open; the admin panel may be slow.' },
    { body: 'GridCommerce: {{date}} রাত ২–৩টা রক্ষণাবেক্ষণ চলবে। আপনার স্টোর খোলা থাকবে; অ্যাডমিন প্যানেল ধীর হতে পারে।' }),
  T('system', 'email', 'Monthly summary email',
    { subject: '{{store_name}}: your month on GridCommerce', body: 'Hi {{owner_name}},\n\nHere is the month for {{store_name}}: orders, messages sent and what is left in your credits. See the full summary:\n{{link}}\n\nYour {{plan}} plan renews on {{due_date}}.' + SIGN },
    { subject: '{{store_name}}: GridCommerce-এ আপনার মাস', body: 'প্রিয় {{owner_name}},\n\n{{store_name}}-এর এই মাসের হিসাব: অর্ডার, পাঠানো মেসেজ আর ক্রেডিটে কত বাকি। পুরো সারাংশ দেখুন:\n{{link}}\n\nআপনার {{plan}} প্ল্যান {{due_date}} তারিখে নবায়ন হবে।' + SIGN_BN }),
];

// ---- automations ------------------------------------------------------------------------------------------------------------
export const TRIGGERS = [
  ['trial_day', 'Trial reaches a day', 'merchants'], ['renewal_in', 'Days before renewal', 'merchants'], ['invoice_overdue', 'Invoice overdue', 'merchants'],
  ['payment_received', 'Payment received', 'merchants'], ['store_live', 'Store goes live', 'merchants'], ['new_lead', 'New lead', 'leads'],
  ['demo_booked', 'Demo booked', 'leads'], ['ticket_solved', 'Ticket solved', 'merchants'], ['schedule', 'On a schedule', 'merchants'],
];
export const triggerLabel = (k) => (TRIGGERS.find((x) => x[0] === k) || [k, k])[1];
export const STEP_TYPES = [
  ['wait', 'Wait', 'For a time'], ['sms', 'Send SMS', 'From a template'], ['email', 'Send email', 'From a template'],
  ['condition', 'Condition', 'Go on only if it is true'], ['notify', 'Tell a person', 'The account manager or a team'], ['stop', 'Stop', 'End the flow here'],
];
export const CONDITIONS = ['Invoice is still unpaid', 'Has not chosen a plan', 'Has not signed in since', 'Has fewer than 5 products', 'Did not open the last email', 'Has not replied', 'Has not booked a demo'];
const S = {
  trig: (when) => ({ type: 'trigger', when }), wait: (n, unit = 'days') => ({ type: 'wait', n, unit }),
  sms: (tpl) => ({ type: 'sms', tpl, lang: 'auto' }), email: (tpl) => ({ type: 'email', tpl, lang: 'auto' }),
  cond: (field) => ({ type: 'condition', field }), notify: (who) => ({ type: 'notify', who }), stop: () => ({ type: 'stop' }),
};
const SEED_AUTOMATIONS = [
  { id: 'A-01', name: 'Trial check-in, day 7', kind: 'event', trigger: 'trial_day', value: 7, audience: 'merchants', on: true,
    steps: [S.trig('Trial day 7'), S.email('T-ONBOARDING-EMAIL'), S.wait(1), S.cond('Has fewer than 5 products'), S.sms('T-ONBOARDING-SMS'), S.notify('Account manager')] },
  { id: 'A-02', name: 'Trial ends in 2 days (day 13)', kind: 'event', trigger: 'trial_day', value: 13, audience: 'merchants', on: true,
    steps: [S.trig('Trial day 13'), S.cond('Has not chosen a plan'), S.sms('T-TRIAL-SMS'), S.email('T-TRIAL-EMAIL')] },
  { id: 'A-03', name: 'Trial ended (day 15)', kind: 'event', trigger: 'trial_day', value: 15, audience: 'merchants', on: true,
    steps: [S.trig('Trial day 15'), S.cond('Has not chosen a plan'), S.email('T-TRIAL-EMAIL'), S.wait(2), S.notify('Sales team')] },
  { id: 'A-04', name: 'Renewal reminders: 7, 3 and 1 day', kind: 'event', trigger: 'renewal_in', value: 7, audience: 'merchants', on: true,
    steps: [S.trig('7 days before renewal'), S.email('T-RENEWAL-EMAIL'), S.wait(4), S.cond('Invoice is still unpaid'), S.sms('T-RENEWAL-SMS'), S.wait(2), S.cond('Invoice is still unpaid'), S.sms('T-RENEWAL-SMS')] },
  { id: 'A-05', name: 'Overdue invoice: day 1, 3 and 7', kind: 'event', trigger: 'invoice_overdue', value: 1, audience: 'merchants', on: true,
    steps: [S.trig('Invoice 1 day overdue'), S.sms('T-REMINDER-SMS'), S.wait(2), S.cond('Invoice is still unpaid'), S.email('T-REMINDER-EMAIL'), S.wait(4), S.cond('Invoice is still unpaid'), S.sms('T-REMINDER-SMS'), S.notify('Account manager')] },
  { id: 'A-06', name: 'Payment received thank-you', kind: 'event', trigger: 'payment_received', audience: 'merchants', on: true,
    steps: [S.trig('A payment is recorded'), S.sms('T-PAID-SMS'), S.email('T-PAID-EMAIL')] },
  { id: 'A-07', name: 'Welcome a new store', kind: 'event', trigger: 'store_live', audience: 'merchants', on: true,
    steps: [S.trig('Store goes live'), S.sms('T-ONBOARDING-SMS'), S.email('T-ONBOARDING-EMAIL')] },
  { id: 'A-08', name: 'New lead: first touch', kind: 'event', trigger: 'new_lead', audience: 'leads', on: true,
    steps: [S.trig('A lead is added'), S.wait(10, 'minutes'), S.sms('T-PROMO-SMS'), S.notify('Sales team')] },
  { id: 'A-09', name: 'Demo booked: confirm and remind', kind: 'event', trigger: 'demo_booked', audience: 'leads', on: true,
    steps: [S.trig('A demo is booked'), S.email('T-MEETING-EMAIL'), S.wait(1, 'hours before'), S.sms('T-MEETING-SMS')] },
  { id: 'A-10', name: 'Ticket solved: ask for a rating', kind: 'event', trigger: 'ticket_solved', audience: 'merchants', on: true,
    steps: [S.trig('A ticket is solved'), S.wait(2, 'hours'), S.email('T-SUPPORT-EMAIL')] },
  { id: 'A-11', name: 'Monthly summary to paying stores', kind: 'schedule', trigger: 'schedule', value: '1st of the month, 10:00', audience: 'merchants', on: true,
    steps: [S.trig('1st of the month, 10:00'), S.email('T-SYSTEM-EMAIL')] },
  { id: 'A-12', name: 'Lead nurturing: 14 days', kind: 'sequence', trigger: 'new_lead', audience: 'leads', on: true,
    steps: [S.trig('A lead is added'), S.email('T-PROMO-EMAIL'), S.wait(3), S.cond('Has not replied'), S.sms('T-PROMO-SMS'), S.wait(4), S.cond('Has not booked a demo'), S.email('T-PROMO-EMAIL'), S.wait(7), S.cond('Has not booked a demo'), S.notify('Sales team')] },
  { id: 'A-13', name: 'Maintenance notice (night before)', kind: 'schedule', trigger: 'schedule', value: 'Before planned maintenance, 18:00', audience: 'merchants', on: false,
    steps: [S.trig('The evening before maintenance'), S.sms('T-SYSTEM-SMS')] },
];
export const AUTO_KINDS = [['all', 'All'], ['event', 'Event-based'], ['schedule', 'Scheduled'], ['sequence', 'Sequences']];

// ---- providers ---------------------------------------------------------------------------------------------------------------
const SEED_PROVIDERS = [
  { id: 'sslw', ch: 'sms', name: 'SSL Wireless', on: true, primary: true, balance: 18450, low: 2000, rate: 0.45, base: 97.6, sender: 'GridCommerce', kind: 'Masking', latency: 4 },
  { id: 'alpha', ch: 'sms', name: 'Alpha SMS', on: true, primary: false, balance: 480, low: 1000, rate: 0.38, base: 95.2, sender: '8809617612345', kind: 'Non-masking', latency: 7 },
  { id: 'ses', ch: 'email', name: 'Amazon SES', on: true, primary: true, balance: 6240, low: 1000, rate: 0.012, base: 98.9, sender: 'hello@gridcommerce.com.bd', kind: 'Region ap-south-1', latency: 2 },
  { id: 'mailgun', ch: 'email', name: 'Mailgun', on: true, primary: false, balance: 2100, low: 500, rate: 0.09, base: 98.4, sender: 'mg.gridcommerce.com.bd', kind: 'Backup', latency: 3 },
];

// ---- the shared mailbox -----------------------------------------------------------------------------------------------------
const MAIL = [
  ['support', 'Rahim Uddin', 'rahim@dhakagadget.com.bd', '0031', 'bKash payment not showing on my invoice', 'I paid ৳3,100 by bKash yesterday (TrxID 9KD72HF1QZ) but the invoice still says unpaid. Please check.', 0.08, false],
  ['support', 'Nusrat Jahan', 'rongdhonuf@gmail.com', '0007', 'How do I add a second courier?', 'We want to use Steadfast for outside Dhaka and Pathao inside. Where do I set that?', 0.3, false],
  ['sales', 'Tanvir Ahmed', 'tanvir.techbazarbd@gmail.com', null, 'Pricing for 3 branches', 'We have 3 mobile shops in Chattogram. What would the Business plan cost with POS on all three?', 0.5, false],
  ['support', 'Kamal Hossain', 'kamal@bindubeauty.com', '0044', 'Store says read-only', 'Our admin panel says read-only. We will pay this week, can you open it for 3 days?', 0.9, true],
  ['sales', 'Sharmin Akter', 'sharmin.sharminskitc@gmail.com', null, 'Demo for a home kitchen business', 'Saw your Facebook ad. Can someone show me how the order inbox works? I sell on Facebook only.', 1.2, true],
  ['support', 'Ayesha Siddiqua', 'ayesha.ayeshahija@gmail.com', null, 'Can I import products from Excel?', 'I have 600 products in a sheet. Is there an import?', 1.6, true],
  ['sales', 'Mehedi Hasan', 'mehedi.mehedimobil@gmail.com', null, 'Re: Your GridCommerce demo', 'Thanks for the demo. Can we start the trial on Sunday instead?', 2.1, true],
  ['support', 'Jahid Hasan', 'owner@gazipurfurniture.com.bd', '0042', 'Invoice amount looks wrong', 'This month shows ৳2,500 but our plan is ৳2,000. Did the add-on start already?', 2.4, true],
  ['support', 'Shirin Akter', 'shirin@nodiorganic.com', '0058', 'SMS credits finished', 'Customers are not getting order SMS. Credits show ৳0. How do I top up?', 3, true],
  ['sales', 'Rashed Karim', 'rashed.karimelectr@gmail.com', null, 'Discount for a yearly plan?', 'If we pay for 12 months at once, is there a discount?', 3.5, true],
  ['support', 'Moin Uddin', 'moin@phonepoint.com.bd', '0073', 'Domain not connecting', 'I added the A record for phonepoint.com.bd two days ago but the store still does not open.', 4, true],
  ['sales', 'Lubna Haque', 'lubna.lubnacosmet@gmail.com', null, 'Partnership for beauty brands', 'We supply 40 beauty shops. Is there an agency or reseller programme?', 5, true],
];

// ---- seed ------------------------------------------------------------------------------------------------------------------
const AUTO_SMS = ['A-02', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08', 'A-09', 'A-01'];
const AUTO_EMAIL = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-09', 'A-10', 'A-12'];
const SMS_FAIL = ['Number switched off', 'Invalid number', 'Number blocks promotional SMS (DND)', 'Operator timeout'];
const MAIL_FAIL = ['Mailbox does not exist', 'Mailbox full', 'Rejected as spam by the receiving server'];

function seed(now) {
  const r = rng('comms-seed');
  const today = startOfDay(now);
  const all = contacts();
  const merchants = all.filter((c) => c.k === 'merchant');
  const autoById = Object.fromEntries(SEED_AUTOMATIONS.map((a) => [a.id, a]));
  const firstTpl = (a, ch) => (a.steps.find((s) => s.type === ch) || {}).tpl;
  const msgs = [];
  const sends = [];
  let seq = 1;
  const nextId = () => 'M' + String(seq++).padStart(5, '0');
  const outcome = (ch, rr, at) => {
    const x = rr();
    if (ch === 'sms') {
      if (at > now - 3 * MIN) return { st: 'Sent' };
      if (x < 0.022) return { st: 'Failed', err: rr.pick(SMS_FAIL) };
      if (x < 0.034) return { st: 'Sent' };
      return { st: 'Delivered' };
    }
    if (x < 0.012) return { st: 'Bounced', err: rr.pick(MAIL_FAIL) };
    if (x < 0.016) return { st: 'Failed', err: 'Provider refused the address' };
    if (x < 0.5) return { st: 'Delivered' };
    if (x < 0.85) return { st: 'Opened', oa: at + rr.int(5, 600) * MIN };
    return { st: 'Clicked', oa: at + rr.int(5, 300) * MIN, ca: at + rr.int(310, 900) * MIN };
  };
  const push = (ch, kind, c, tpl, at, extra = {}) => {
    const o = outcome(ch, r, at);
    const tplObj = SEED_TEMPLATES.find((x) => x.id === tpl);
    const lang = c.lang === 'bn' ? 'bn' : 'en';
    const prov = ch === 'sms' ? (r() < 0.86 ? 'sslw' : 'alpha') : (r() < 0.93 ? 'ses' : 'mailgun');
    const seg = ch === 'sms' && tplObj ? smsParts(tplObj[lang].body).parts + (lang === 'bn' ? 1 : 0) : 0;
    const rate = SEED_PROVIDERS.find((p) => p.id === prov).rate;
    const m = { id: nextId(), ch, kind, to: ref(c), tpl, lang, at, prov, seg, cost: Math.round((ch === 'sms' ? seg * rate : rate) * 100) / 100, ...o, ...extra };
    if (m.oa && m.oa > now) { delete m.oa; delete m.ca; m.st = 'Delivered'; }
    if (m.ca && m.ca > now) { delete m.ca; m.st = 'Opened'; }
    msgs.push(m);
    return m;
  };
  for (let k = 29; k >= 0; k--) {
    const day = today - k * DAY;
    const wd = new Date(day + 6 * 3600e3).getUTCDay();
    const f = wd === 5 ? 0.5 : 1;
    const nSms = Math.round(r.int(6, 13) * f);
    const nMail = Math.round(r.int(8, 15) * f);
    const timeOf = () => day + r.int(9 * 60, 20 * 60 + 30) * MIN;
    for (let i = 0; i < nSms; i++) {
      const at = timeOf(); if (at > now) continue;
      const a = autoById[r.pick(AUTO_SMS)];
      const c = a.audience === 'leads' ? r.pick(LEADS) : r.pick(merchants);
      push('sms', 'automation', c, firstTpl(a, 'sms'), at, { auto: a.id, by: 'Automation' });
    }
    for (let i = 0; i < nMail; i++) {
      const at = timeOf(); if (at > now) continue;
      const a = autoById[r.pick(AUTO_EMAIL)];
      const c = a.audience === 'leads' ? r.pick(LEADS) : r.pick(merchants);
      push('email', 'automation', c, firstTpl(a, 'email'), at, { auto: a.id, by: 'Automation' });
    }
    // a few hand sends by staff
    for (let i = 0; i < r.int(0, 2); i++) {
      const at = timeOf(); if (at > now) continue;
      const ch = r() < 0.55 ? 'sms' : 'email';
      const c = r() < 0.6 ? r.pick(merchants) : r.pick(LEADS);
      const tpl = r.pick(SEED_TEMPLATES.filter((x) => x.ch === ch && ['support', 'reminder', 'meeting', 'promo'].includes(x.purpose))).id;
      push(ch, 'single', c, tpl, at, { by: r.pick(['Farhana Akter', 'Tania Sultana', 'Nusrat Islam', 'Rakib Hasan']) });
    }
  }
  // the last day carries a cluster of failures so the overview has something to act on
  const lastDay = Math.max(today, now - 20 * 3600e3);
  for (let i = 0; i < 4; i++) {
    const c = r.pick(merchants);
    const at = Math.min(now - (i + 1) * 47 * MIN, lastDay + (i + 2) * 61 * MIN);
    push('sms', 'automation', c, 'T-REMINDER-SMS', at, { auto: 'A-05', by: 'Automation', st: 'Failed', err: i % 2 ? 'Number switched off' : 'Invalid number' });
  }
  for (let i = 0; i < 2; i++) {
    const c = r.pick(merchants);
    push('email', 'automation', c, 'T-RENEWAL-EMAIL', now - (i + 2) * 95 * MIN, { auto: 'A-04', by: 'Automation', st: 'Bounced', err: 'Mailbox does not exist' });
  }
  // bulk sends by staff (one send, several messages)
  const bulk = (id, ch, name, tpl, list, at, by) => {
    sends.push({ id, ch, kind: 'bulk', name, tpl, lang: 'en', at, status: 'Sent', count: list.length, by, createdAt: at });
    list.forEach((c, i) => push(ch, 'bulk', c, tpl, at + i * 4000, { send: id, by }));
  };
  bulk('S-0101', 'sms', 'Payment reminder · overdue stores', 'T-REMINDER-SMS', merchants.slice(10, 16), today - 3 * DAY + 11 * 3600e3, 'Nusrat Islam');
  bulk('S-0102', 'sms', 'Trials ending this week', 'T-TRIAL-SMS', merchants.slice(30, 39), today - 6 * DAY + 10.5 * 3600e3, 'Tania Sultana');
  bulk('S-0103', 'email', 'Steadfast webhook delay notice', 'T-SYSTEM-EMAIL', merchants.slice(0, 24), today - 9 * DAY + 16 * 3600e3, 'Rakib Hasan');
  bulk('S-0104', 'sms', 'Demo reminders · Thursday', 'T-MEETING-SMS', LEADS.slice(8, 13), today - 12 * DAY + 9 * 3600e3, 'Tania Sultana');
  // scheduled (not sent yet)
  const sched = (id, ch, name, tpl, list, at, by, subject) => sends.push({ id, ch, kind: 'scheduled', name, tpl, lang: 'en', subject, at, status: 'Scheduled', count: list.length, to: list.map(ref), by, createdAt: now - 2 * 3600e3 });
  sched('S-0201', 'sms', 'Maintenance notice · Thursday night', 'T-SYSTEM-SMS', merchants.slice(0, 40), today + 2 * DAY + 18 * 3600e3, 'Rakib Hasan');
  sched('S-0202', 'sms', 'Renewal heads-up · 1 Nov renewals', 'T-RENEWAL-SMS', merchants.slice(12, 21), today + 1 * DAY + 10 * 3600e3, 'Nusrat Islam');
  sched('S-0203', 'email', 'Demo follow-up · this week’s demos', 'T-MEETING-EMAIL', LEADS.slice(8, 14), today + 1 * DAY + 15 * 3600e3, 'Tania Sultana');
  sched('S-0204', 'email', 'New courier rates for November', 'T-SYSTEM-EMAIL', merchants.slice(0, 35), today + 4 * DAY + 11 * 3600e3, 'Mahin Khan');

  // campaigns
  const camp = (id, ch, name, audience, tpl, daysAgo, n, st, by, rates) => {
    const at = today - daysAgo * DAY + 11 * 3600e3;
    const rr = rng('camp' + id);
    const rate = ch === 'sms' ? 0.45 : 0.012;
    const seg = ch === 'sms' ? 2 : 1;
    const sent = st === 'Sent' ? n : 0;
    const delivered = Math.round(sent * (ch === 'sms' ? 0.95 + rr() * 0.03 : 0.97 + rr() * 0.02));
    const opened = ch === 'email' ? Math.round(delivered * (rates ? rates[0] : 0.32 + rr() * 0.12)) : 0;
    const clicked = Math.round(delivered * (rates ? rates[1] : ch === 'email' ? 0.06 + rr() * 0.05 : 0.03 + rr() * 0.03));
    return { id, ch, name, audience, tpl, lang: 'en', status: st, at: st === 'Draft' ? null : st === 'Scheduled' ? today + Math.abs(daysAgo) * DAY + 11 * 3600e3 : at, count: n, sent, delivered, failed: sent - delivered, opened, clicked, signups: st === 'Sent' ? Math.round(clicked * 0.12) : 0, cost: Math.round(sent * seg * rate), by, createdAt: at - 2 * DAY };
  };
  const campaigns = [
    camp('C-0031', 'sms', 'Eid offer: 20% off 3 months', 'leads', 'T-PROMO-SMS', 24, 412, 'Sent', 'Tania Sultana'),
    camp('C-0032', 'email', 'Eid offer: 20% off 3 months', 'leads', 'T-PROMO-EMAIL', 24, 1180, 'Sent', 'Tania Sultana'),
    camp('C-0033', 'email', 'New: courier booking from the inbox', 'merchants', 'T-SYSTEM-EMAIL', 15, 61, 'Sent', 'Mahin Khan', [0.58, 0.21]),
    camp('C-0034', 'sms', 'Trial users: book a setup call', 'trials', 'T-ONBOARDING-SMS', 8, 18, 'Sent', 'Rakib Hasan'),
    camp('C-0035', 'email', 'October webinar: selling on Facebook', 'leads', 'T-PROMO-EMAIL', 4, 1265, 'Sent', 'Tania Sultana'),
    camp('C-0036', 'sms', 'Puja offer for new shops', 'new-leads', 'T-PROMO-SMS', -3, 0, 'Scheduled', 'Tania Sultana'),
    camp('C-0037', 'email', 'Year-end: pay yearly, get 2 months free', 'paying', 'T-PROMO-EMAIL', 0, 0, 'Draft', 'Nusrat Islam'),
  ];

  const automations = SEED_AUTOMATIONS.map((a) => {
    const mine = msgs.filter((m) => m.auto === a.id);
    const last = mine.reduce((x, m) => Math.max(x, m.at), 0);
    return { ...a, steps: a.steps.map((s, i) => ({ ...s, id: 's' + (i + 1) })), lastRun: a.on ? last || now - (a.kind === 'schedule' ? 10 * DAY : 3 * 3600e3) : now - 33 * DAY, updatedAt: now - (8 + a.id.charCodeAt(3) % 9) * DAY, by: 'Mahin Khan' };
  });

  const threads = MAIL.map(([box, name, email, shopId, subject, body, daysAgo, read], i) => {
    const at = now - Math.round(daysAgo * DAY);
    const t = { id: 'TH-' + (301 + i), box, from: { name, email, shopId }, subject, read, status: i < 6 || i === 8 ? 'open' : 'done', assignee: box === 'sales' ? 'Tania Sultana' : i % 3 ? 'Farhana Akter' : null, at, msgs: [{ from: name, at, body, in: true }] };
    if (i === 6) t.msgs.unshift({ from: 'Tania Sultana', at: at - DAY, body: 'Thanks for your time today, Mehedi. Your trial link: gcm.bd/start. Any day works for us.', in: false });
    if (i >= 7 && i !== 8) t.msgs.push({ from: box === 'sales' ? 'Tania Sultana' : 'Farhana Akter', at: at + 3 * 3600e3, body: 'Thank you for writing. We have sorted this for you. Reply here if anything else comes up.', in: false });
    return t;
  });

  return {
    seq,
    msgs: msgs.sort((a, b) => b.at - a.at),
    sends,
    campaigns,
    templates: SEED_TEMPLATES.map((x) => ({ ...x, updatedAt: now - (12 + x.id.length % 7) * DAY, by: 'Mahin Khan', history: [{ v: 1, at: now - 40 * DAY, by: 'Mahin Khan', note: 'Created' }] })),
    automations,
    providers: SEED_PROVIDERS.map((p) => ({ ...p, checkedAt: now - 12 * MIN })),
    email: { provider: 'ses', fromName: 'GridCommerce', fromAddress: 'hello@gridcommerce.com.bd', replyTo: 'support@gridcommerce.com.bd', domain: 'gridcommerce.com.bd', spf: 'Verified', dkim: 'Verified', dmarc: 'Missing', dmarcCopied: false, checkedAt: now - 2 * 3600e3 },
    threads,
  };
}

export const comms = createStore({ key: 'comms', version: 1, seed });

// ---- reading ----------------------------------------------------------------------------------------------------------------
export const templateBy = (data, id) => data.templates.find((x) => x.id === id) || null;
export const automationBy = (data, id) => data.automations.find((x) => x.id === id) || null;
export const campaignBy = (data, id) => data.campaigns.find((x) => x.id === id) || null;
export const providerBy = (data, id) => data.providers.find((x) => x.id === id) || null;
export const primaryProvider = (data, ch) => data.providers.find((p) => p.ch === ch && p.primary && p.on) || data.providers.find((p) => p.ch === ch && p.on) || null;

/** A message with its contact's name, organisation and address. */
export function enrich(m) {
  const c = m.to.k === 'x' ? null : contactBy(m.to.k, m.to.id);
  const addr = c ? (m.ch === 'sms' ? c.phone : c.email) : m.to.addr;
  return { ...m, contact: c, name: c ? c.name : m.to.name || addr, org: c ? c.org : '', who: c ? (c.k === 'merchant' ? 'Merchant' : 'Lead') : 'Other', addr };
}
/** The message log, newest first. filter: { ch, status, kind, q, from, to, auto } */
export function messages(data, f = {}) {
  const q = String(f.q || '').trim().toLowerCase();
  const out = [];
  for (const m of data.msgs) {
    if (f.ch && m.ch !== f.ch) continue;
    if (f.status && m.st !== f.status) continue;
    if (f.kind && m.kind !== f.kind) continue;
    if (f.auto && m.auto !== f.auto) continue;
    if (f.from && m.at < f.from) continue;
    if (f.to && m.at >= f.to) continue;
    const e = enrich(m);
    if (q && ![e.name, e.org, e.addr, m.id, (templateBy(data, m.tpl) || {}).name].join(' ').toLowerCase().includes(q)) continue;
    out.push(e);
  }
  return out;
}
/** The text a message went out with. */
export function messageText(data, m, t) {
  if (m.body) return { subject: m.subject || '', body: m.body };
  const tpl = templateBy(data, m.tpl);
  if (!tpl) return { subject: '', body: '' };
  const c = m.contact !== undefined ? m.contact : enrich(m).contact;
  const v = varsFor(c || { name: m.to.name }, t);
  const side = tpl[m.lang] || tpl.en;
  return { subject: fill(side.subject, v), body: fill(side.body, v) };
}

const DELIVERED = new Set(['Delivered', 'Opened', 'Clicked']);
/** Sent / delivered / failed / cost by channel over the last `days` days (campaigns included), calls and WhatsApp. */
export function figures(data, t, days = 30) {
  const from = startOfDay(t) - (days - 1) * DAY;
  const prevFrom = from - days * DAY;
  const blank = () => ({ sent: 0, delivered: 0, failed: 0, cost: 0, opened: 0, clicked: 0 });
  const cur = { sms: blank(), email: blank() };
  const prev = { sms: blank(), email: blank() };
  for (const m of data.msgs) {
    if (m.at < prevFrom || m.at > t || m.st === 'Queued') continue;
    const b = (m.at >= from ? cur : prev)[m.ch];
    b.sent++; b.cost += m.cost || 0;
    if (DELIVERED.has(m.st)) b.delivered++;
    if (m.st === 'Failed' || m.st === 'Bounced') b.failed++;
    if (m.st === 'Opened' || m.st === 'Clicked') b.opened++;
    if (m.st === 'Clicked') b.clicked++;
  }
  for (const c of data.campaigns) {
    if (c.status !== 'Sent' || !c.at || c.at < prevFrom || c.at > t) continue;
    const b = (c.at >= from ? cur : prev)[c.ch];
    b.sent += c.sent; b.delivered += c.delivered; b.failed += c.failed; b.cost += c.cost; b.opened += c.opened; b.clicked += c.clicked;
  }
  let calls = 0, callsPrev = 0, wa = 0, waPrev = 0;
  for (let d = prevFrom; d <= t; d += DAY) { const x = callsOn(d), y = waOn(d); if (d >= from) { calls += x; wa += y; } else { callsPrev += x; waPrev += y; } }
  const rate = (b) => (b.sent ? (b.delivered / b.sent) * 100 : null);
  const both = (k) => cur.sms[k] + cur.email[k];
  return {
    days, sms: cur.sms, email: cur.email, prev,
    smsRate: rate(cur.sms), emailRate: rate(cur.email),
    rate: both('sent') ? (both('delivered') / both('sent')) * 100 : null,
    prevRate: prev.sms.sent + prev.email.sent ? ((prev.sms.delivered + prev.email.delivered) / (prev.sms.sent + prev.email.sent)) * 100 : null,
    failed: both('failed'), cost: Math.round(both('cost')), prevCost: Math.round(prev.sms.cost + prev.email.cost),
    calls, callsPrev, wa, waPrev, callMinutes: Math.round(calls * 4.2), waReplied: Math.round(wa * 0.91),
  };
}
/** Calls made by the team that day (sales and support), and WhatsApp conversations: fixed per date. */
export function callsOn(day) { const r = rng('calls:' + Math.floor((day + 6 * 3600e3) / DAY)); const wd = new Date(day + 6 * 3600e3).getUTCDay(); return Math.round(r.int(16, 34) * (wd === 5 ? 0.35 : 1)); }
export function waOn(day) { const r = rng('wa:' + Math.floor((day + 6 * 3600e3) / DAY)); const wd = new Date(day + 6 * 3600e3).getUTCDay(); return Math.round(r.int(22, 48) * (wd === 5 ? 0.6 : 1)); }

/** Messages per day by channel for the charts (campaigns only when `withCampaigns`, as they dwarf the daily sends). */
export function series(data, t, days = 14, only, withCampaigns = false) {
  const today = startOfDay(t);
  const out = [];
  for (let k = days - 1; k >= 0; k--) {
    const d = today - k * DAY;
    out.push({ d, label: dm(d).replace(/^0/, ''), title: dmy(d), sms: 0, email: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, wa: waOn(d), calls: callsOn(d) });
  }
  const first = out[0].d;
  const idx = (at) => Math.floor((at - first) / DAY);
  for (const m of data.msgs) {
    if (m.at < first || m.at > t || m.st === 'Queued') continue;
    const o = out[idx(m.at)]; if (!o) continue;
    o[m.ch]++;
    if (!only || m.ch === only) {
      if (DELIVERED.has(m.st)) o.delivered++;
      if (m.st === 'Failed' || m.st === 'Bounced') o.failed++;
      if (m.st === 'Opened' || m.st === 'Clicked') o.opened++;
      if (m.st === 'Clicked') o.clicked++;
    }
  }
  for (const c of withCampaigns ? data.campaigns : []) {
    if (c.status !== 'Sent' || !c.at || c.at < first || c.at > t) continue;
    const o = out[idx(c.at)]; if (!o) continue;
    o[c.ch] += c.sent;
    if (!only || c.ch === only) { o.delivered += c.delivered; o.failed += c.failed; o.opened += c.opened; o.clicked += c.clicked; }
  }
  return out;
}

/** What needs someone: failures grouped, low balances, domain records, failing automations. At most five rows. */
export function attention(data, t) {
  const day = t - DAY;
  const rows = [];
  const smsFail = data.msgs.filter((m) => m.ch === 'sms' && m.st === 'Failed' && m.at >= day);
  if (smsFail.length) {
    const reasons = [...new Set(smsFail.map((m) => m.err).filter(Boolean))].slice(0, 2).join(', ').toLowerCase();
    rows.push({ key: 'sms-fail', tone: 'err', title: `${smsFail.length} SMS failed in the last 24 hours`, sub: reasons ? 'Mostly: ' + reasons : 'Check the numbers and send again', href: '/admin/sms?tab=history&status=Failed' });
  }
  const bounced = data.msgs.filter((m) => m.ch === 'email' && (m.st === 'Bounced' || m.st === 'Failed') && m.at >= t - 3 * DAY);
  if (bounced.length) rows.push({ key: 'mail-bounce', tone: 'warn', title: `${bounced.length} emails bounced in 3 days`, sub: 'Fix the address on the merchant or lead', href: '/admin/email?tab=sent&status=Bounced' });
  for (const p of data.providers) {
    if (p.on && p.balance < p.low) rows.push({ key: 'low-' + p.id, tone: 'warn', title: `${p.name} balance is low: ${taka(p.balance)}`, sub: p.primary ? 'Main provider: top up before it runs out' : 'Backup provider: sends fail over to it if the main one stops', href: p.ch === 'sms' ? '/admin/sms?tab=provider' : '/admin/email?tab=settings' });
    if (!p.on && p.primary) rows.push({ key: 'off-' + p.id, tone: 'err', title: `${p.name} is off`, sub: 'Turn it on or make another provider the main one', href: p.ch === 'sms' ? '/admin/sms?tab=provider' : '/admin/email?tab=settings' });
  }
  const e = data.email;
  const missing = ['spf', 'dkim', 'dmarc'].filter((k) => e[k] !== 'Verified');
  if (missing.length) rows.push({ key: 'dns', tone: 'warn', title: `${missing.map((k) => k.toUpperCase()).join(', ')} not set up for ${e.domain}`, sub: 'Emails may land in spam until the record is added', href: '/admin/email?tab=settings' });
  const autoFail = {};
  for (const m of data.msgs) if (m.auto && (m.st === 'Failed' || m.st === 'Bounced') && m.at >= t - 7 * DAY) autoFail[m.auto] = (autoFail[m.auto] || 0) + 1;
  const worst = Object.entries(autoFail).sort((a, b) => b[1] - a[1])[0];
  if (worst && worst[1] >= 3) { const a = automationBy(data, worst[0]); if (a) rows.push({ key: 'auto-' + a.id, tone: 'warn', title: `“${a.name}” failed ${worst[1]} times this week`, sub: 'Open the automation to see the runs', href: '/admin/automations/edit?id=' + a.id }); }
  return rows.slice(0, 5);
}

/** Providers with this month's sends and the delivery rate worked out from the log (30 days). */
export function providerRows(data, t) {
  const from = t - 30 * DAY;
  return data.providers.map((p) => {
    const mine = data.msgs.filter((m) => m.prov === p.id && m.at >= from && m.st !== 'Queued');
    const ok = mine.filter((m) => DELIVERED.has(m.st)).length;
    const sent = mine.length;
    const reported = mine.filter((m) => m.st !== 'Sent').length;
    const delivery = reported >= 20 ? (ok / reported) * 100 : p.base;
    const status = !p.on ? 'Off' : p.balance < p.low ? 'Low balance' : delivery < 93 ? 'Slow delivery' : 'Working';
    return { ...p, sent, delivery, status, tone: !p.on ? 'neutral' : status === 'Working' ? 'success' : 'warning', spend: Math.round(mine.reduce((s, m) => s + (m.cost || 0), 0)) };
  });
}

/** Each store's messaging this month (from lib/admin/merchants › usageOf), most SMS first. */
export function merchantUsage(t) {
  const d = platformDb();
  const rows = merchantList(d, t).rows.filter((r) => r.view !== 'closed' && r.view !== 'setup');
  return rows.map((r) => {
    const shop = d.shops.find((s) => s.id === r.id);
    const u = usageOf(d, shop, t);
    const sms = u.comms.find((c) => c.key === 'sms');
    const wa = u.comms.find((c) => c.key === 'whatsapp');
    const em = u.comms.find((c) => c.key === 'email');
    const w = walletOf(d, r.id, t);
    return { id: r.id, name: r.name, owner: r.owner, plan: r.packageName, state: r.stateLabel, tone: r.tone, sms: sms.count, smsCost: sms.cost, wa: wa.count, email: em.count, cost: u.comms.reduce((s, c) => s + c.cost, 0), balance: w.balance, low: w.balance < 300 };
  }).sort((a, b) => b.sms - a.sms);
}

/** An automation's recent runs: who it ran for, how far it got, sent or failed. Worked out from its log and the date. */
export function automationRuns(data, a, t) {
  const fromLog = data.msgs.filter((m) => m.auto === a.id).slice(0, 12).map((m) => {
    const e = enrich(m);
    const tpl = templateBy(data, m.tpl);
    return { id: m.id, at: m.at, who: e.org || e.name, path: `${a.steps[0].when} → ${CH_LABEL[m.ch]} “${tpl ? tpl.name : m.tpl}”`, ok: !(m.st === 'Failed' || m.st === 'Bounced'), note: m.err || m.st };
  });
  if (fromLog.length || !a.on) return fromLog;
  const r = rng('runs' + a.id);
  const all = contacts().filter((c) => c.k === (a.audience === 'leads' ? 'lead' : 'merchant'));
  return Array.from({ length: 5 }, (_, i) => ({ id: a.id + '-' + i, at: (a.lastRun || t) - i * (a.kind === 'schedule' ? 30 : 1) * DAY, who: r.pick(all).org, path: a.steps.slice(0, 3).map((s) => stepTitle(data, s)).join(' → '), ok: true, note: 'Done' }));
}
export function stepTitle(data, s) {
  if (s.type === 'trigger') return s.when;
  if (s.type === 'wait') return `Wait ${s.n} ${s.unit}`;
  if (s.type === 'sms' || s.type === 'email') { const tp = templateBy(data, s.tpl); return `${CH_LABEL[s.type]}: ${tp ? tp.name : 'pick a template'}`; }
  if (s.type === 'condition') return `If ${String(s.field || '').toLowerCase()}`;
  if (s.type === 'notify') return `Tell ${s.who || 'a person'}`;
  return 'Stop';
}
export const sendCounts = (data, a, t) => {
  let d7 = 0, d30 = 0, f7 = 0;
  for (const m of data.msgs) if (m.auto === a.id) { if (m.at >= t - 30 * DAY) d30++; if (m.at >= t - 7 * DAY) { d7++; if (m.st === 'Failed' || m.st === 'Bounced') f7++; } }
  return { d7, d30, f7 };
};

// ---- changing -------------------------------------------------------------------------------------------------------------------
const me = () => { try { return staff().name; } catch { return 'Mahin Khan'; } };
const fail = (error) => ({ ok: false, error });

/** Send now or schedule. input: { ch, recipients: contacts or { k: 'x', addr, name }, tpl, lang, subject, body, at, name } */
export function sendMessage(input) {
  const { ch, recipients = [], tpl, lang = 'en', subject, body, at, name } = input || {};
  if (ch !== 'sms' && ch !== 'email') return fail('Pick SMS or email.');
  if (!recipients.length) return fail('Add at least one recipient.');
  if (!String(body || '').trim()) return fail(ch === 'sms' ? 'Write the message.' : 'Write the email.');
  if (ch === 'email' && !String(subject || '').trim()) return fail('Add a subject.');
  return comms.commit((data, now) => {
    const prov = primaryProvider(data, ch);
    if (!prov) return fail(`No ${CH_LABEL[ch]} provider is on. Turn one on first.`);
    const later = at && at > now + MIN;
    const id = 'S-' + String(1000 + data.sends.length + 1);
    const tplObj = templateBy(data, tpl);
    const custom = !tplObj || (tplObj[lang] || tplObj.en).body !== body || (ch === 'email' && (tplObj[lang] || tplObj.en).subject !== subject);
    const kind = later ? 'scheduled' : recipients.length > 1 ? 'bulk' : 'single';
    const label = name || (tplObj ? tplObj.name : 'Message') + (recipients.length > 1 ? ` · ${recipients.length} recipients` : '');
    const send = { id, ch, kind, name: label, tpl: tpl || null, lang, subject: subject || '', body: custom ? body : undefined, at: later ? at : now, status: later ? 'Scheduled' : 'Sent', count: recipients.length, by: me(), createdAt: now };
    if (later) { send.to = recipients.map((c) => (c.k === 'merchant' || c.k === 'lead' ? ref(c) : { k: 'x', name: c.name || '', addr: c.addr })); data.sends.unshift(send); return { ok: true, id, scheduled: true, count: recipients.length }; }
    data.sends.unshift(send);
    const res = deliver(data, now, send, recipients);
    return { ok: true, id, ...res };
  });
}
/** Write the messages of a send that goes out now. */
function deliver(data, now, send, recipients) {
  const prov = primaryProvider(data, send.ch);
  let sent = 0, failed = 0, cost = 0;
  const out = [];
  recipients.forEach((c, i) => {
    const full = c.k === 'm' || c.k === 'l' ? contactBy(c.k, c.id) : c;
    const addr = full ? (full.k === 'merchant' || full.k === 'lead' ? (send.ch === 'sms' ? full.phone : full.email) : full.addr) : '';
    const okAddr = send.ch === 'sms' ? validPhone(addr) : validEmail(addr);
    const tplObj = templateBy(data, send.tpl);
    const side = tplObj ? tplObj[send.lang] || tplObj.en : null;
    const v = varsFor(full && full.k !== 'x' ? full : { name: full ? full.name : '' }, now);
    const text = fill(send.body || (side ? side.body : ''), v);
    const seg = send.ch === 'sms' ? smsParts(text).parts : 0;
    const c1 = Math.round((send.ch === 'sms' ? seg * prov.rate : prov.rate) * 100) / 100;
    const m = {
      id: 'M' + String(data.seq++).padStart(5, '0'), send: send.id, ch: send.ch, kind: send.kind === 'scheduled' ? 'scheduled' : send.kind, to: full && (full.k === 'merchant' || full.k === 'lead') ? ref(full) : { k: 'x', name: (full && full.name) || '', addr },
      tpl: send.tpl, lang: send.lang, at: now + i * 1000, prov: prov.id, seg, cost: okAddr ? c1 : 0, by: send.by,
      st: okAddr ? 'Sent' : 'Failed', err: okAddr ? undefined : send.ch === 'sms' ? 'Invalid number' : 'Invalid address',
    };
    if (okAddr) m.fresh = true;
    if (send.body) { m.body = send.body; if (send.ch === 'email') m.subject = send.subject; }
    if (okAddr) { sent++; cost += c1; } else failed++;
    out.push(m);
  });
  data.msgs.unshift(...out.reverse());
  prov.balance = Math.max(0, Math.round((prov.balance - cost) * 100) / 100);
  return { sent, failed, cost: Math.round(cost * 100) / 100, provider: prov.name };
}
export function cancelSend(id) {
  return comms.commit((data) => {
    const s = data.sends.find((x) => x.id === id);
    if (!s) return fail('That send is gone.');
    if (s.status !== 'Scheduled') return fail('Only a scheduled send can be cancelled.');
    s.status = 'Cancelled';
    return { ok: true };
  });
}
export function sendScheduledNow(id) {
  return comms.commit((data, now) => {
    const s = data.sends.find((x) => x.id === id);
    if (!s || s.status !== 'Scheduled') return fail('This send is no longer scheduled.');
    if (!primaryProvider(data, s.ch)) return fail(`No ${CH_LABEL[s.ch]} provider is on.`);
    s.status = 'Sent'; s.sentAt = now;
    return { ok: true, ...deliver(data, now, s, s.to || []) };
  });
}
/** Send failed messages again (a bad address fails again). */
export function retryMessages(ids) {
  return comms.commit((data, now) => {
    let ok = 0, still = 0;
    for (const id of ids) {
      const m = data.msgs.find((x) => x.id === id);
      if (!m || !(m.st === 'Failed' || m.st === 'Bounced')) continue;
      const addr = enrich(m).addr;
      const good = m.ch === 'sms' ? validPhone(addr) && m.err !== 'Invalid number' : validEmail(addr) && m.err !== 'Mailbox does not exist';
      if (good) { m.st = 'Sent'; m.err = undefined; m.retriedAt = now; m.at = now; m.fresh = true; ok++; } else { m.retriedAt = now; still++; }
    }
    return { ok: true, sent: ok, still };
  });
}
/** Move what is due: sent messages get their delivery report, scheduled sends and campaigns go out. */
export function runDue() {
  const data = comms.get();
  const now = comms.now();
  const due = data.msgs.some((m) => m.fresh && now - m.at > 40e3)
    || data.sends.some((s) => s.status === 'Scheduled' && s.at <= now) || data.campaigns.some((c) => c.status === 'Scheduled' && c.at && c.at <= now);
  if (!due || !comms.isLive()) return { ok: true, n: 0 };
  return comms.commit((d, t) => {
    let n = 0;
    for (const m of d.msgs) {
      if (!m.fresh || t - m.at <= 40e3) continue;
      delete m.fresh;
      if (m.st === 'Sent') m.st = m.ch === 'sms' && rng(m.id)() >= 0.97 ? 'Sent' : 'Delivered';   // a few SMS never get a report
      n++;
    }
    for (const s of d.sends) if (s.status === 'Scheduled' && s.at <= t && primaryProvider(d, s.ch)) { s.status = 'Sent'; s.sentAt = t; deliver(d, t, s, s.to || []); n++; }
    for (const c of d.campaigns) if (c.status === 'Scheduled' && c.at && c.at <= t) { goCampaign(d, c, t); n++; }
    return { ok: true, n };
  });
}

// campaigns
export function saveCampaign(input) {
  const { id, ch, name, audience, tpl, lang = 'en', at, schedule } = input || {};
  if (!String(name || '').trim()) return fail('Name the campaign.');
  if (!audience) return fail('Pick who gets it.');
  if (!tpl) return fail('Pick a template.');
  return comms.commit((data, now) => {
    if (schedule && (!at || at <= now + 5 * MIN)) return fail('Pick a time at least 5 minutes from now.');
    let c = id ? campaignBy(data, id) : null;
    if (c && c.status !== 'Draft' && c.status !== 'Scheduled') return fail('A sent campaign can’t be changed.');
    if (!c) { c = { id: 'C-' + String(31 + data.campaigns.length).padStart(4, '0'), ch, status: 'Draft', count: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, signups: 0, cost: 0, by: me(), createdAt: now }; data.campaigns.unshift(c); }
    Object.assign(c, { name: name.trim(), audience, tpl, lang, at: schedule ? at : null, status: schedule ? 'Scheduled' : 'Draft' });
    return { ok: true, id: c.id };
  });
}
function goCampaign(data, c, t) {
  const a = audienceBy(c.audience, t);
  const n = c.audience === 'leads' && c.ch === 'email' ? 1200 + (a ? a.list.length : 0) : a ? a.list.length : 0;   // the leads list includes the website's newsletter sign-ups
  const r = rng('go' + c.id);
  const tpl = templateBy(data, c.tpl);
  const seg = c.ch === 'sms' && tpl ? smsParts(fill((tpl[c.lang] || tpl.en).body, SAMPLE)).parts : 1;
  const prov = primaryProvider(data, c.ch);
  const rate = prov ? prov.rate : 0.45;
  c.count = n; c.sent = n;
  c.delivered = Math.round(n * (c.ch === 'sms' ? 0.95 + r() * 0.03 : 0.97 + r() * 0.02));
  c.failed = n - c.delivered; c.opened = c.ch === 'email' ? Math.round(c.delivered * 0.36) : 0; c.clicked = Math.round(c.delivered * (c.ch === 'email' ? 0.07 : 0.035));
  c.signups = 0; c.cost = Math.round(n * seg * rate); c.status = 'Sent'; c.at = t;
  if (prov) prov.balance = Math.max(0, prov.balance - c.cost);
}
export function sendCampaign(id) {
  return comms.commit((data, t) => {
    const c = campaignBy(data, id);
    if (!c) return fail('That campaign is gone.');
    if (c.status === 'Sent') return fail('It has been sent already.');
    if (!primaryProvider(data, c.ch)) return fail(`No ${CH_LABEL[c.ch]} provider is on.`);
    goCampaign(data, c, t);
    return { ok: true, sent: c.sent, cost: c.cost };
  });
}
export function cancelCampaign(id) {
  return comms.commit((data) => {
    const c = campaignBy(data, id);
    if (!c || c.status !== 'Scheduled') return fail('Only a scheduled campaign can be cancelled.');
    c.status = 'Draft'; c.at = null;
    return { ok: true };
  });
}

// templates
export function saveTemplate(id, patch) {
  const p = patch || {};
  if (!String(p.name || '').trim()) return fail('Name the template.');
  if (!String((p.en || {}).body || '').trim()) return fail('Write the English version.');
  return comms.commit((data, now) => {
    const x = templateBy(data, id);
    if (!x) return fail('That template is gone.');
    if (x.ch === 'email' && !String((p.en || {}).subject || '').trim()) return fail('Add an English subject.');
    x.name = p.name.trim(); x.en = { ...p.en }; x.bn = { ...(p.bn || { body: '' }) }; if (p.status) x.status = p.status;
    if (p.purpose) x.purpose = p.purpose;
    x.version = (x.version || 1) + 1; x.updatedAt = now; x.by = me();
    x.history = [{ v: x.version, at: now, by: x.by, note: p.note || 'Edited' }, ...(x.history || [])].slice(0, 12);
    return { ok: true, version: x.version };
  });
}
export function createTemplate({ purpose = 'promo', ch = 'sms', name } = {}) {
  return comms.commit((data, now) => {
    let id = `T-${purpose.toUpperCase()}-${ch.toUpperCase()}-${data.templates.length + 1}`;
    while (templateBy(data, id)) id += 'X';
    const x = { id, purpose, ch, name: (name || '').trim() || 'New ' + (ch === 'sms' ? 'SMS' : 'email'), en: ch === 'email' ? { subject: '', body: '' } : { body: '' }, bn: ch === 'email' ? { subject: '', body: '' } : { body: '' }, status: 'Draft', version: 1, updatedAt: now, by: me(), history: [{ v: 1, at: now, by: me(), note: 'Created' }] };
    data.templates.push(x);
    return { ok: true, id };
  });
}
export function duplicateTemplate(id) {
  return comms.commit((data, now) => {
    const x = templateBy(data, id);
    if (!x) return fail('That template is gone.');
    const nid = x.id + '-COPY' + (data.templates.filter((y) => y.id.startsWith(x.id + '-COPY')).length + 1);
    data.templates.push({ ...JSON.parse(JSON.stringify(x)), id: nid, name: x.name + ' (copy)', status: 'Draft', version: 1, updatedAt: now, by: me(), history: [{ v: 1, at: now, by: me(), note: 'Copied from ' + x.name }] });
    return { ok: true, id: nid };
  });
}
/** Where a template is used: automations and campaigns. */
export function templateUse(data, id) {
  return { automations: data.automations.filter((a) => a.steps.some((s) => s.tpl === id)), campaigns: data.campaigns.filter((c) => c.tpl === id) };
}

// automations
export function setAutomationOn(id, on) {
  return comms.commit((data, now) => {
    const a = automationBy(data, id);
    if (!a) return fail('That automation is gone.');
    const bad = a.steps.find((s) => (s.type === 'sms' || s.type === 'email') && !templateBy(data, s.tpl));
    if (on && bad) return fail('A send step has no template. Pick one first.');
    a.on = !!on; a.updatedAt = now; a.by = me();
    return { ok: true };
  });
}
export function saveAutomation(id, patch) {
  const p = patch || {};
  if (!String(p.name || '').trim()) return fail('Name the automation.');
  if (!p.steps || !p.steps.length || p.steps[0].type !== 'trigger') return fail('An automation starts with its trigger.');
  if (!p.steps.some((s) => s.type === 'sms' || s.type === 'email')) return fail('Add at least one SMS or email step.');
  return comms.commit((data, now) => {
    const a = automationBy(data, id);
    if (!a) return fail('That automation is gone.');
    const bad = p.steps.find((s) => (s.type === 'sms' || s.type === 'email') && !templateBy(data, s.tpl));
    if (bad) return fail('Pick a template for every send step.');
    Object.assign(a, { name: p.name.trim(), trigger: p.trigger || a.trigger, value: p.value ?? a.value, audience: p.audience || a.audience, kind: p.kind || a.kind, steps: p.steps.map((s) => ({ ...s })), updatedAt: now, by: me() });
    return { ok: true };
  });
}
export function createAutomation() {
  return comms.commit((data, now) => {
    const id = 'A-' + String(data.automations.length + 1).padStart(2, '0') + 'N';
    data.automations.push({ id, name: 'New automation', kind: 'event', trigger: 'new_lead', audience: 'leads', on: false, lastRun: null, updatedAt: now, by: me(), steps: [{ id: 's1', type: 'trigger', when: 'A lead is added' }, { id: 's2', type: 'sms', tpl: 'T-PROMO-SMS', lang: 'auto' }] });
    return { ok: true, id };
  });
}
export function duplicateAutomation(id) {
  return comms.commit((data, now) => {
    const a = automationBy(data, id);
    if (!a) return fail('That automation is gone.');
    const nid = a.id + 'C' + data.automations.length;
    data.automations.push({ ...JSON.parse(JSON.stringify(a)), id: nid, name: a.name + ' (copy)', on: false, lastRun: null, updatedAt: now, by: me() });
    return { ok: true, id: nid };
  });
}
export function deleteAutomation(id) {
  return comms.commit((data) => {
    const i = data.automations.findIndex((a) => a.id === id);
    if (i < 0) return fail('That automation is gone.');
    data.automations.splice(i, 1);
    return { ok: true };
  });
}

// providers and settings
export function setPrimary(id) {
  return comms.commit((data) => {
    const p = providerBy(data, id);
    if (!p) return fail('That provider is gone.');
    if (!p.on) return fail('Turn it on first.');
    data.providers.filter((x) => x.ch === p.ch).forEach((x) => { x.primary = x.id === id; });
    if (p.ch === 'email') data.email.provider = id;
    return { ok: true };
  });
}
export function setProviderOn(id, on) {
  return comms.commit((data) => {
    const p = providerBy(data, id);
    if (!p) return fail('That provider is gone.');
    const other = data.providers.find((x) => x.ch === p.ch && x.id !== id && x.on);
    if (!on && p.primary && !other) return fail(`It is the only ${CH_LABEL[p.ch]} provider. Turn another on first.`);
    p.on = !!on;
    if (!on && p.primary && other) { p.primary = false; other.primary = true; if (p.ch === 'email') data.email.provider = other.id; return { ok: true, moved: other.name }; }
    return { ok: true };
  });
}
export function topUp(id, amount, ref2) {
  const n = Math.round(Number(amount) || 0);
  if (n < 500) return fail('Top up at least ৳500.');
  if (n > 200000) return fail('That is more than one top-up allows (৳2,00,000).');
  return comms.commit((data, now) => {
    const p = providerBy(data, id);
    if (!p) return fail('That provider is gone.');
    p.balance = Math.round((p.balance + n) * 100) / 100;
    p.topups = [{ at: now, amount: n, by: me(), ref: ref2 || '' }, ...(p.topups || [])].slice(0, 10);
    return { ok: true, balance: p.balance };
  });
}
export function testProvider(id) {
  return comms.commit((data, now) => {
    const p = providerBy(data, id);
    if (!p) return fail('That provider is gone.');
    if (!p.on) return fail(`${p.name} is off.`);
    p.checkedAt = now;
    return { ok: true, ms: 180 + (rng(p.id + now)() * 400 | 0) };
  });
}
export function saveEmailSettings(patch) {
  const p = patch || {};
  if (!String(p.fromName || '').trim()) return fail('Add the sender name.');
  if (!validEmail(p.fromAddress)) return fail('The from address doesn’t look right.');
  if (!validEmail(p.replyTo)) return fail('The reply-to address doesn’t look right.');
  const domain = String(p.fromAddress).split('@')[1];
  return comms.commit((data) => {
    const e = data.email;
    if (domain !== e.domain) return fail(`The from address must be on ${e.domain}, the verified domain.`);
    Object.assign(e, { fromName: p.fromName.trim(), fromAddress: p.fromAddress.trim(), replyTo: p.replyTo.trim() });
    if (p.provider && p.provider !== e.provider) { const pr = providerBy(data, p.provider); if (pr && pr.on) { data.providers.filter((x) => x.ch === 'email').forEach((x) => { x.primary = x.id === pr.id; }); e.provider = pr.id; } }
    return { ok: true };
  });
}
export const DMARC_RECORD = 'v=DMARC1; p=quarantine; rua=mailto:dmarc@gridcommerce.com.bd; pct=100';
export function copyDmarc() { return comms.commit((data) => { data.email.dmarcCopied = true; return { ok: true }; }); }
export function recheckDomain() {
  return comms.commit((data, now) => {
    const e = data.email;
    e.checkedAt = now;
    if (e.dmarc !== 'Verified' && e.dmarcCopied) e.dmarc = 'Verified';
    return { ok: true, missing: ['spf', 'dkim', 'dmarc'].filter((k) => e[k] !== 'Verified') };
  });
}

// the shared mailbox
export const threadBy = (data, id) => data.threads.find((x) => x.id === id) || null;
export function markRead(id, read = true) {
  return comms.commit((data) => { const th = threadBy(data, id); if (!th) return fail('That email is gone.'); th.read = read; return { ok: true }; });
}
export function replyThread(id, body) {
  if (!String(body || '').trim()) return fail('Write a reply.');
  return comms.commit((data, now) => {
    const th = threadBy(data, id);
    if (!th) return fail('That email is gone.');
    const prov = primaryProvider(data, 'email');
    if (!prov) return fail('No email provider is on.');
    th.msgs.push({ from: me(), at: now, body: body.trim(), in: false });
    th.read = true; th.status = 'open'; th.replied = now;
    data.msgs.unshift({ id: 'M' + String(data.seq++).padStart(5, '0'), ch: 'email', kind: 'reply', to: { k: 'x', name: th.from.name, addr: th.from.email }, tpl: null, lang: 'en', subject: 'Re: ' + th.subject, body: body.trim(), at: now, prov: prov.id, seg: 0, cost: prov.rate, st: 'Sent', fresh: true, by: me() });
    return { ok: true };
  });
}
export function setThreadStatus(id, status) {
  return comms.commit((data) => { const th = threadBy(data, id); if (!th) return fail('That email is gone.'); th.status = status; th.read = true; return { ok: true }; });
}
export function assignThread(id, name) {
  return comms.commit((data) => { const th = threadBy(data, id); if (!th) return fail('That email is gone.'); th.assignee = name || null; return { ok: true }; });
}

// ---- small text helpers the pages share --------------------------------------------------------------------------------------
export const whenText = (ms, t) => {
  if (!ms) return '—';
  const days = Math.round((startOfDay(t) - startOfDay(ms)) / DAY);
  if (days === 0) return 'Today ' + hm(ms);
  if (days === 1) return 'Yesterday ' + hm(ms);
  if (days === -1) return 'Tomorrow ' + hm(ms);
  if (days > 1 && days < 7) return days + ' days ago';
  return dm(ms) + ' ' + hm(ms);
};
