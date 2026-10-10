// admin/inbox — GridCommerce's own inbox and phone desk (front end only; createStore key `inbox`, localStorage
// `gc.admin.inbox`). Never reads or writes the merchant panel's lib/inbox: these are GridCommerce's conversations with
// leads, merchants (by store id, lib/platform), affiliates and partners.
//
//   Reading
//     CHANNELS, CHANNEL_IDS, KINDS, STATUSES, PRIORITIES, AI_MODES, SENSITIVE, LINES, OUTCOMES, TEAM
//     inbox                               the store (useAdminStore(inbox) → { data, t, live })
//     statusOf(c, t)                      open · pending · snoozed · closed (a snooze that has passed is open again)
//     aiModeOf(c, data)                   the conversation's AI mode (its own, else the default in data.settings)
//     viewOf / VIEWS / inView(c, view, me, t)   the list's views: All, Mine, Unassigned, Unread, Priority, Closed
//     lastOf(c), previewOf(m), sameContact(a, b), history(data, c)
//     aiSuggestions(c, me)                2–3 reply drafts for the last thing the contact wrote (demo rules)
//     sensitiveOf(text)                   the SENSITIVE topic a reply touches (refund, price, cancel, payment) or null
//     fillReply(body, ctx)                {{first}} {{name}} {{store}} {{agent}} in a saved reply
//     callCost(call) · callUsage(calls, t) · isFollowUp(call)
//
//   Changing (each commits and returns { ok, error? })
//     markRead · markUnread · send(id, msgs) · setStatus(id, status, until?) · setPriority · assign(id, staffId)
//     toggleTag · saveContactNote · setAi(id, mode|null) · setDefaultAi(mode) · takeOver(id)
//     approveDraft(id, draftId, text?) · rejectDraft(id, draftId) · schedule(id, msg, at) · cancelScheduled · sendScheduledNow
//     flushScheduled() · contactWrites(id, text) (demo) · aiAnswer(id) (Auto mode, by the rules) · react(id, msgId, emoji)
//     startConversation({ ch, kind, name, handle, text }) · upsertReply · deleteReply
//     logCall(call) · updateCall(id, patch) · followUpDone(id)
// Times are worked out from `now` when the demo is built; pages show date-based figures only after `live`.

import { createStore } from './store';
import { STAFF } from '@/lib/platform/catalogue';
import { staff as currentStaff } from '@/lib/platform/store';
import { DAY, MIN, rng, startOfDay, startOfMonth } from '@/lib/platform/util';

// ---- lists ------------------------------------------------------------------------------------------------------
export const CHANNELS = {
  messenger: { name: 'Facebook Messenger', short: 'Messenger', window: 'Messenger · reply within 24 hours of their last message', call: true },
  instagram: { name: 'Instagram', short: 'Instagram', window: 'Instagram · reply within 24 hours', call: true },
  whatsapp: { name: 'WhatsApp', short: 'WhatsApp', window: 'WhatsApp · free replies for 24 hours, then a template', call: true },
  email: { name: 'Email', short: 'Email', window: 'Email · from support@gridcommerce.com.bd' },
  web: { name: 'Website live chat', short: 'Live chat', window: 'Live chat on gridcommerce.net' },
  telegram: { name: 'Telegram', short: 'Telegram', window: 'Telegram', call: true },
};
export const CHANNEL_IDS = Object.keys(CHANNELS);
export const channelName = (ch) => (CHANNELS[ch] || { name: ch }).name;
export const KINDS = {
  lead: { label: 'Lead', tone: 'primary', href: (c) => '/admin/leads?q=' + encodeURIComponent(c.company || c.name), link: 'Open in Leads' },
  merchant: { label: 'Merchant', tone: 'success', href: (c) => '/admin/merchant?id=' + c.shopId, link: 'Open merchant' },
  affiliate: { label: 'Affiliate', tone: 'warning', href: (c) => '/admin/affiliates?q=' + encodeURIComponent(c.name), link: 'Open in Affiliates' },
  partner: { label: 'Partner', tone: 'neutral', href: (c) => '/admin/integrations?q=' + encodeURIComponent(c.company || c.name), link: 'Open in Integrations' },
};
export const STATUSES = [['open', 'Open'], ['pending', 'Pending'], ['snoozed', 'Snoozed'], ['closed', 'Closed']];
export const PRIORITIES = [['urgent', 'Urgent', 'error'], ['high', 'High', 'warning'], ['normal', 'Normal', 'neutral'], ['low', 'Low', 'neutral']];
export const priorityOf = (p) => PRIORITIES.find((x) => x[0] === p) || PRIORITIES[2];
export const AI_MODES = [
  ['off', 'AI off', 'People answer. GridAI stays quiet.'],
  ['assist', 'AI assist', 'GridAI suggests replies. It never sends.'],
  ['auto', 'AI auto', 'GridAI answers by the rules. Refunds, prices, cancellations and payment details wait for a person.'],
];
export const aiModeName = (m) => (AI_MODES.find((x) => x[0] === m) || AI_MODES[0])[1];
/** Topics GridAI may never answer on its own: in Auto they wait in "Needs approval". */
export const SENSITIVE = [
  ['refund', 'Refund', /refund|money back|ফেরত/i],
  ['price', 'Price change', /discount|price|cheaper|কম দাম|commission rate|rate increase|offer you/i],
  ['cancel', 'Cancellation', /cancel|close (my|the) (store|account)|বন্ধ/i],
  ['payment', 'Payment details', /bkash|nagad|card|bank|account number|payout|transaction|pay /i],
];
export const sensitiveOf = (text) => { const hit = SENSITIVE.find(([, , re]) => re.test(text || '')); return hit ? hit[0] : null; };
export const sensitiveName = (k) => (SENSITIVE.find((x) => x[0] === k) || [k, k])[1];
export const TEAM = STAFF.filter((s) => !s.inactive);
export const staffById = (id) => STAFF.find((s) => s.id === id) || null;
export const staffName = (id) => (staffById(id) || { name: id === 'ai' ? 'GridAI' : 'Someone' }).name;
export const firstName = (name) => String(name || '').split(' ')[0];
const meId = () => (currentStaff() || {}).id || 'mahin';

/** GridCommerce's numbers, one per team (Calls › Assigned numbers). Rates are per started minute; 09610 hotlines carry a
 *  monthly rent (৳), the mobile lines none. */
export const LINES = [
  { id: 'sales', name: 'Sales hotline', number: '09610-001100', team: 'Sales', staff: ['tania', 'mahin'], hours: 'Sat–Thu 9:00–20:00', rent: 500 },
  { id: 'support', name: 'Support hotline', number: '09610-001200', team: 'Support', staff: ['farhana', 'sadia'], hours: 'Every day 9:00–22:00', rent: 500 },
  { id: 'billing', name: 'Billing & accounts', number: '09610-001300', team: 'Finance', staff: ['nusrat'], hours: 'Sun–Thu 10:00–18:00', rent: 500 },
  { id: 'onboarding', name: 'Onboarding', number: '01896-002200', team: 'Operations', staff: ['rakib'], hours: 'Sat–Thu 10:00–19:00', rent: 0 },
  { id: 'partners', name: 'Partner desk', number: '01896-002300', team: 'Partnerships', staff: ['mahin'], hours: 'Sun–Thu 10:00–18:00', rent: 0 },
];
export const lineOf = (id) => LINES.find((l) => l.id === id) || LINES[1];
export const RATE = { in: 0.3, out: 0.6 };
export const OUTCOMES = ['Resolved', 'Interested', 'Demo booked', 'Payment promised', 'Callback needed', 'Not interested', 'No answer', 'Voicemail left', 'Wrong number'];
export const OUTCOME_TONE = { Resolved: 'success', Interested: 'primary', 'Demo booked': 'primary', 'Payment promised': 'success', 'Callback needed': 'warning', 'Not interested': 'neutral', 'No answer': 'neutral', 'Voicemail left': 'neutral', 'Wrong number': 'neutral' };

// ---- helpers -------------------------------------------------------------------------------------------------------
const mid = () => 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const sysMsg = (icon, text, at) => ({ id: mid(), at, from: 'system', icon, text });
export const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^880/, '0');
export function statusOf(c, t) {
  if (c.status === 'snoozed' && c.snoozeUntil && c.snoozeUntil <= t) return 'open';
  return c.status || 'open';
}
export const aiModeOf = (c, data) => c.ai || (data && data.settings ? data.settings.defaultAi : 'assist');
export const lastOf = (c) => { for (let i = c.messages.length - 1; i >= 0; i--) if (c.messages[i].from !== 'system') return c.messages[i]; return c.messages[c.messages.length - 1] || null; };
export const lastAt = (c) => { const m = c.messages[c.messages.length - 1]; return m ? m.at : 0; };
export function previewOf(m) {
  if (!m) return '';
  if (m.type === 'voice') return 'Voice message';
  if (m.type === 'call') return m.dir === 'missed' ? 'Missed call' : 'Voice call';
  if (m.files && m.files.length && !m.text) return '📎 ' + m.files.join(', ');
  return (m.files && m.files.length ? '📎 ' : '') + (m.text || '');
}
/** Minutes the contact has waited for an answer (0 when the last word is ours). */
export function waiting(c, t) {
  const last = lastOf(c);
  if (!last || last.from !== 'contact') return 0;
  return Math.max(0, Math.round((t - last.at) / MIN));
}
export const sameContact = (a, b) => a.id !== b.id && (a.contactKey === b.contactKey);
export const history = (data, c) => data.convs.filter((x) => sameContact(x, c)).sort((a, b) => lastAt(b) - lastAt(a));

export const VIEWS = [['all', 'All'], ['mine', 'Mine'], ['unassigned', 'Unassigned'], ['unread', 'Unread'], ['priority', 'Priority'], ['closed', 'Closed']];
export function inView(c, view, me, t) {
  const st = statusOf(c, t);
  if (view === 'closed') return st === 'closed';
  if (st === 'closed') return false;
  if (view === 'mine') return c.assignee === me;
  if (view === 'unassigned') return !c.assignee;
  if (view === 'unread') return !!c.unread;
  if (view === 'priority') return c.priority === 'urgent' || c.priority === 'high';
  return true;
}

export function fillReply(body, ctx) {
  return String(body || '')
    .replace(/{{\s*first\s*}}/g, firstName(ctx.name) || 'there')
    .replace(/{{\s*name\s*}}/g, ctx.name || 'there')
    .replace(/{{\s*store\s*}}/g, ctx.store || 'your store')
    .replace(/{{\s*agent\s*}}/g, firstName(ctx.agent) || 'GridCommerce');
}

// ---- GridAI (demo rules) ---------------------------------------------------------------------------------------------
const TOPICS = [
  { re: /refund|money back|ফেরত/i, drafts: [
    'Sorry about this, {{first}}. I have asked our billing team to check the charge; you will hear from us today with the refund amount and when it reaches you.',
    'Thanks for flagging it, {{first}}. Could you send the invoice number? I will check whether the refund goes back to your card or as GridCommerce credits.',
    'Understood. A refund needs a quick check by our finance team; I will update you here before 6 PM.',
  ] },
  { re: /cancel|close (my|the) (store|account)|বন্ধ/i, drafts: [
    'Sorry to hear that, {{first}}. Before you go: we can pause {{store}} for up to 3 months at no cost, and your data stays. Would that help?',
    'I can help with that. May I ask what is not working for you? If it is the price, I can check what fits your sales better.',
    'Noted. Cancelling takes effect at the end of this billing month; your store stays open until then and you can export everything.',
  ] },
  { re: /discount|price|plan|package|pricing|cost|কত|দাম|upgrade|commission/i, drafts: [
    'Hi {{first}}! Our plans are Growth ৳1,000, Business ৳2,500 and Enterprise ৳5,000 a month, each with a 15-day free trial. Yearly saves two months.',
    'Most stores your size start on Growth (৳1,000/month) and move to Business when they add a second branch or staff. Shall I book a 20-minute demo?',
    'I can send you the full price sheet with every module. Which matters most to you: online orders, the POS or courier booking?',
  ] },
  { re: /bkash|nagad|payment|pay|invoice|bill|due|card|transaction/i, drafts: [
    'Thanks, {{first}}. Your latest invoice and the payment link are in Settings › Subscription & billing. bKash, Nagad and cards all work there.',
    'Could you send the transaction ID? I will match the payment to your invoice and confirm here.',
    'I have checked: the payment is received and your invoice shows Paid. Thank you!',
  ] },
  { re: /error|not working|bug|stuck|fail|problem|issue|সমস্যা|print|sync|webhook|api/i, drafts: [
    'Sorry for the trouble, {{first}}. Could you send a screenshot of the error and the time it happened? I will pass it to our tech team right away.',
    'Thanks for the details. I have opened a support ticket for this; our engineers usually reply within 4 working hours.',
    'Could you try once more after signing out and back in? If it still fails, I will connect you with our tech team.',
  ] },
  { re: /courier|pathao|steadfast|redx|delivery|address|phone/i, drafts: [
    'Yes {{first}}! GridCommerce books Pathao, Steadfast and RedX for you: the address goes over by itself and you get the tracking ID in the order.',
    'Your delivery staff can sign in on their phone with their own login and see only the orders given to them.',
    'Courier booking and the delivery app are in every plan, Growth included. Want me to set it up with you on a call?',
  ] },
  { re: /how (do|can) i|where (is|do)|kivabe|কীভাবে/i, drafts: [
    'Good question, {{first}}. Here is the short guide for that: help.gridcommerce.net. If you like, I can show you on a quick screen share.',
    'You will find it under Settings in the menu on the left. Tell me if you get stuck and I will walk you through it.',
    'I have sent you a 1-minute video that shows exactly this. Anything else I can help with?',
  ] },
  { re: /demo|trial|start|sign ?up|setup|set up/i, drafts: [
    'Happy to help, {{first}}! I can show you GridCommerce in a 20-minute video call. Does tomorrow at 11 AM or 4 PM suit you?',
    'You can start a 15-day free trial at gridcommerce.net; no card needed. I will be your contact during the trial.',
    'Our onboarding team sets up your products and courier for free in the first week. Shall I connect you?',
  ] },
  { re: /link|referral|banner|track|affiliate/i, drafts: [
    'Thanks, {{first}}. I have checked your referral link; sign-ups from it are tracking. New ones show in your dashboard within an hour.',
    'Here are the new banners for October; use your own link with each so the sign-ups count for you.',
    'Commission is paid on the 10th for every store that paid its first month. I will send this month\'s statement today.',
  ] },
];
const FALLBACK = [
  'Thanks for the message, {{first}}! Let me check and get back to you shortly.',
  'Got it. Could you share a bit more detail so I can help properly?',
  'Thank you, {{first}}. Is there anything else I can help with today?',
];
/** 2–3 reply drafts for the last thing the contact wrote. */
export function aiSuggestions(c, me) {
  // the last two things the contact wrote, newest first
  const text = c.messages.filter((m) => m.from === 'contact').slice(-2).reverse().map((m) => m.text || '').join(' \n ');
  const topic = TOPICS.find((x) => x.re.test(text.split(' \n ')[0])) || TOPICS.find((x) => x.re.test(text));
  const ctx = { name: c.name, store: c.company, agent: staffName(me) };
  return (topic ? topic.drafts : FALLBACK).map((d) => fillReply(d, ctx));
}

// ---- the demo --------------------------------------------------------------------------------------------------------
const C = (key, kind, name, company, extra = {}) => ({ key, kind, name, company, ...extra });
const CONTACTS = [
  // leads
  C('L-shirin', 'lead', 'Shirin Akter', "Shirin's Kitchen", { phone: '01712-345611', district: 'Dhaka', source: 'Facebook ad' }),
  C('L-tanvir', 'lead', 'Tanvir Ahmed', 'Urban Threads BD', { handle: 'tanvir.ahmed.ctg', district: 'Chattogram', source: 'Website' }),
  C('L-mehnaz', 'lead', 'Mehnaz Chowdhury', 'Mehnaz Boutique', { handle: '@mehnaz.boutique', district: 'Sylhet', source: 'Instagram' }),
  C('L-rashed', 'lead', 'Rashed Karim', 'Karim Electronics', { email: 'rashed@karimelectronics.com', district: 'Rajshahi', source: 'Website' }),
  C('L-farzana', 'lead', 'Farzana Haque', 'Organic Bazar Khulna', { email: 'farzana.organic@gmail.com', district: 'Khulna', source: 'Referral' }),
  C('L-arman', 'lead', 'Arman Hossain', 'Gadget Point Cumilla', { phone: '01819-552210', district: 'Cumilla', source: 'Facebook ad' }),
  C('L-nadia', 'lead', 'Nadia Islam', "Nadia's Hijab House", { handle: 'nadia.hijabhouse', district: 'Dhaka', source: 'Facebook page' }),
  C('L-sabbir', 'lead', 'Sabbir Rahman', 'Sabbir Pharmacy', { email: 'sabbir.pharma@yahoo.com', district: 'Gazipur', source: 'Website' }),
  C('L-lamia', 'lead', 'Lamia Sultana', 'Lamia Crafts', { handle: '@lamiacrafts', district: 'Mymensingh', source: 'Instagram' }),
  C('L-rubel', 'lead', 'Kazi Rubel', 'Rubel Tiles & Sanitary', { handle: '@kazirubel', phone: '01911-783402', district: 'Narayanganj', source: 'Referral' }),
  C('L-priya', 'lead', 'Priya Saha', 'Saha Sweets', { phone: '01716-990341', district: 'Bogura', source: 'Google search' }),
  C('L-jubayer', 'lead', 'Jubayer Alam', 'Alam Furniture', { email: 'jubayer@alamfurniture.com.bd', district: 'Jashore', source: 'Trade fair' }),
  // merchants (store ids from lib/platform)
  C('S-0031', 'merchant', 'Arif Hossain', 'Dhaka Gadget Hub', { shopId: '0031', phone: '01711-203344', email: 'arif@dhakagadgethub.com' }),
  C('S-0007', 'merchant', 'Nusrat Jahan', 'Rongdhonu Fashion', { shopId: '0007', handle: 'rongdhonu.fashion', phone: '01712-440921' }),
  C('S-0009', 'merchant', 'Jahid Hasan', 'Dhaka Shoe Corner', { shopId: '0009', phone: '01819-220476' }),
  C('S-0012', 'merchant', 'Faruk Ahmed', 'Mohona Traders', { shopId: '0012', email: 'mohonatraders@gmail.com', phone: '01715-339012' }),
  C('S-0017', 'merchant', 'Rumana Akter', 'Shonali Crafts', { shopId: '0017', email: 'rumana@shonalicrafts.com' }),
  C('S-0023', 'merchant', 'Rafiq Uddin', 'Ghorer Bazar BD', { shopId: '0023', phone: '01713-667820' }),
  C('S-0028', 'merchant', 'Tahsin Mahmud', 'Tech Zone Uttara', { shopId: '0028', handle: 'techzone.uttara', phone: '01977-150233' }),
  C('S-0038', 'merchant', 'Sharmin Akter', 'Rupsha Sports', { shopId: '0038', handle: '@rupshasports', phone: '01730-118845' }),
  C('S-0058', 'merchant', 'Kamrul Islam', 'Nodi Organic', { shopId: '0058', email: 'kamrul@nodiorganic.com' }),
  C('S-0061', 'merchant', 'Imran Hossain', 'Kolpo Books', { shopId: '0061', email: 'imran@kolpobooks.com' }),
  C('S-0066', 'merchant', 'Nasima Begum', 'Mehedi Traders', { shopId: '0066', phone: '01818-556701' }),
  C('S-0072', 'merchant', 'Shirin Sultana', 'Sabuj Bazar', { shopId: '0072', handle: 'sabujbazar.sylhet', phone: '01716-882245' }),
  C('S-0075', 'merchant', 'Nasrin Sultana', 'Ruposhi Jewels', { shopId: '0075', phone: '01913-447720' }),
  C('S-0052', 'merchant', 'Habibur Rahman', 'Gadget Corner Mirpur', { shopId: '0052', phone: '01671-204418' }),
  // affiliates
  C('A-rafsan', 'affiliate', 'Rafsan Jani', 'TechBangla (YouTube)', { handle: 'rafsan.techbangla', phone: '01780-224510' }),
  C('A-tasnim', 'affiliate', 'Tasnim Ferdous', 'Tasnim Writes (blog)', { handle: '@tasnimwrites' }),
  C('A-mahfuz', 'affiliate', 'Mahfuz Alam', 'Digital Dhaka Agency', { email: 'mahfuz@digitaldhaka.agency' }),
  C('A-sumaiya', 'affiliate', 'Sumaiya Khan', 'Sumaiya Khan (Facebook creator)', { handle: '@sumaiyakhan' }),
  C('A-ovi', 'affiliate', 'Ovi Rahman', 'Ovi Rahman (reseller)', { phone: '01556-781230' }),
  // partners
  C('P-pathao', 'partner', 'Sajid Mahmud', 'Pathao Courier', { email: 'sajid.mahmud@pathao.com' }),
  C('P-ssl', 'partner', 'Rumana Yasmin', 'SSLCOMMERZ', { email: 'rumana.y@sslcommerz.com' }),
  C('P-bkash', 'partner', 'Iftekhar Uddin', 'bKash Merchant Team', { phone: '01730-990012' }),
  C('P-steadfast', 'partner', 'Mamun Hossain', 'Steadfast Courier', { handle: '@mamun_steadfast' }),
  C('P-xprinter', 'partner', 'Shafiq Ahmed', 'Xprinter BD (distributor)', { phone: '01819-330876' }),
  C('P-redx', 'partner', 'Tahmina Akter', 'RedX', { handle: 'tahmina.redx' }),
];
const contactBy = (key) => CONTACTS.find((c) => c.key === key);

// [contact, channel, status, priority, assignee, tags, ai (null = default), tickets, minutes ago, unread, script, extra]
// script lines: 'c|text' contact · 'c|text|file1, file2' with files · 'a:id|text' staff · 'i|text' GridAI ·
// 'n:id|text' internal note · 's:icon|text' system line · 'v|12' voice message (s) · 'k:out|180' call bubble · '~' a day earlier
const SCRIPTS = [
  ['L-shirin', 'whatsapp', 'open', 'high', 'tania', ['Pricing', 'Hot lead'], null, [], 6, 2, [
    'c|Assalamu alaikum. I sell home-cooked food on Facebook, about 40 orders a day. How much is GridCommerce?',
    'a:tania|Walaikum assalam Shirin! For 40 orders a day the Growth plan fits well: ৳1,000 a month, with a 15-day free trial.',
    'c|Does it book Pathao and Steadfast by itself? Right now I copy every address by hand 😅',
    'c|And can my delivery boy see the orders on his phone?',
  ]],
  ['L-tanvir', 'messenger', 'open', 'normal', '', ['Demo'], null, [], 18, 1, [
    'c|Hi, I run Urban Threads in Chattogram, 2 outlets + online. Can I see a demo this week?',
  ]],
  ['L-mehnaz', 'instagram', 'open', 'normal', 'tania', ['Instagram shop'], 'auto', [], 44, 0, [
    'c|Does GridCommerce connect with my Instagram shop? I tag products in reels.',
    'i|Hi Mehnaz! Yes: GridCommerce syncs your products to the Meta catalog, so the same items show on Instagram and Facebook shops. Stock updates by itself when you sell.',
    'c|Great. How do I start a trial?',
    'i|You can start a 15-day free trial at gridcommerce.net (no card needed). Tania from our team will be your contact during the trial.',
  ]],
  ['L-rashed', 'email', 'pending', 'normal', 'tania', ['POS'], null, [], 26 * 60, 0, [
    'c|Hello, we have 3 electronics shops in Rajshahi. Which barcode scanner and receipt printer work with your POS? We want IMEI on the invoice too.|Karim-Electronics-shops.pdf',
    'a:tania|Hi Rashed, thanks! Any USB or Bluetooth scanner works; for receipts we support Xprinter XP-58 and XP-80. IMEI and warranty print on each invoice. I have attached the hardware list.',
    'a:tania|Following up: would you like a quote for 3 shops on the Business plan?',
  ]],
  ['L-farzana', 'email', 'open', 'low', '', ['Referral'], null, [], 3 * 60, 1, [
    'c|Hi! Kamrul bhai from Nodi Organic told me about you. I sell organic vegetables in Khulna with home delivery. Is there a plan for small sellers?',
  ]],
  ['L-arman', 'whatsapp', 'open', 'urgent', 'tania', ['Pricing', 'Discount'], 'auto', [], 12, 1, [
    'c|Bhai I will take the Business plan for 2 shops if you give 30% discount. Other software is cheaper.',
  ], { approvals: [{ topic: 'price', text: 'Thanks Arman! For 2 shops on the yearly Business plan I can offer 2 months free (৳25,000 instead of ৳30,000). Shall I send the invoice?' }] }],
  ['L-nadia', 'messenger', 'closed', 'normal', 'tania', ['Not now'], null, [], 3 * 24 * 60, 0, [
    'c|How much for the website only? I don\'t need POS.',
    'a:tania|Hi Nadia! The Online Growth plan (৳1,000/month) includes the website, checkout and courier booking. No POS needed.',
    'c|Ok I will think after Eid. Thanks',
    's:circle-check|Closed by Tania Sultana',
  ]],
  ['L-sabbir', 'web', 'open', 'normal', '', [], null, [], 2, 1, [
    'c|hello is anyone there? I need software for my pharmacy with expiry date tracking',
  ]],
  ['L-lamia', 'instagram', 'snoozed', 'low', 'tania', ['Follow up'], null, [], 2 * 24 * 60, 0, [
    'c|Love your reels! Is there Bangla in the app? My staff don\'t read English well.',
    'a:tania|Yes Lamia, the whole app works in Bangla, including receipts and SMS. Want me to show you?',
    'c|After 15th please, busy with a fair now',
    's:alarm-clock|Snoozed until 16 Oct by Tania Sultana',
  ], { snoozeDays: 5 }],
  ['L-rubel', 'telegram', 'open', 'normal', 'mahin', ['Wholesale'], null, [], 95, 0, [
    'c|Do you handle wholesale? Dealers buy from me on credit with different price lists.',
    'a:mahin|Hi Rubel, wholesale price lists and dealer credit limits are on our roadmap for December. Retail and POS work today.',
    'n:mahin|@Tania he has 6 dealers, good fit once wholesale is back. Add to the December list.',
  ]],
  ['L-priya', 'whatsapp', 'open', 'normal', 'tania', ['Demo'], null, [], 35, 0, [
    'c|আমাদের মিষ্টির দোকান, বগুড়ায় ২টা শাখা। হিসাব রাখার সফটওয়্যার লাগবে।',
    'a:tania|জি প্রিয়া আপু, দুই শাখার স্টক আর বিক্রি এক জায়গায় দেখতে পারবেন। কাল একটা ডেমো দেখাতে পারি?',
    'c|কাল বিকেল ৪টায় হলে ভালো হয়',
  ]],
  ['L-jubayer', 'email', 'open', 'normal', '', ['Trade fair'], null, [], 5 * 60, 1, [
    'c|We met at the SME fair. Please send the proposal for Alam Furniture (showroom + factory). We need installment sales.|Alam-Furniture-requirements.docx',
  ]],
  // merchants
  ['S-0031', 'whatsapp', 'open', 'urgent', 'farhana', ['Payments', 'Bug'], null, ['T-2291'], 4, 3, [
    'c|bKash payment is failing on my checkout since morning! Customers are calling me 😡',
    'c|Screenshot attached|bkash-error.png',
    'a:farhana|Sorry Arif bhai, checking now. Is it every payment or only some?',
    'c|Every one since 10 AM. I lost 15 orders already',
    'n:farhana|@Rakib bKash returns "merchant not active" for 0031. Looks like their merchant wallet renewal. Ticket T-2291.',
  ]],
  ['S-0031', 'email', 'closed', 'normal', 'nusrat', ['Invoice'], null, [], 9 * 24 * 60, 0, [
    'c|Please send the VAT invoice for September with our BIN.',
    'a:nusrat|Hi Arif, the September invoice with your BIN is attached.',
    's:circle-check|Closed by Nusrat Islam',
  ]],
  ['S-0007', 'messenger', 'open', 'high', 'nusrat', ['Refund', 'Credits'], 'auto', ['T-2284'], 22, 1, [
    'c|I bought 10,000 SMS credits by mistake twice. Please refund one pack.',
  ], { approvals: [{ topic: 'refund', text: 'Sorry about the double purchase, Nusrat. I have refunded one SMS pack (৳600) to your bKash; it reaches you within 3 working days.' }] }],
  ['S-0009', 'whatsapp', 'open', 'high', 'farhana', ['Churn risk'], 'auto', [], 48, 1, [
    'c|I want to cancel my subscription. Sales are low this season.',
  ], { approvals: [{ topic: 'cancel', text: 'Understood, Jahid. I have cancelled your subscription; it ends on 30 Oct and you will not be billed again.' }] }],
  ['S-0012', 'email', 'pending', 'normal', 'nusrat', ['Invoice'], null, [], 7 * 60, 0, [
    'c|Our accountant needs all invoices from January to September in one PDF.',
    'a:nusrat|Hi Faruk, I am putting them together; you will have one PDF tomorrow morning.',
  ]],
  ['S-0017', 'web', 'open', 'normal', 'sadia', ['How-to'], null, [], 15, 0, [
    'c|How do I add sizes and colours to one product? It makes separate products now.',
    'a:sadia|Hi Rumana! Open the product, scroll to Variants and add Size and Colour as options; every mix gets its own stock and price.',
    'c|Found it, thank you! 🙏',
  ]],
  ['S-0023', 'whatsapp', 'open', 'high', 'rakib', ['Courier', 'Bug'], null, ['T-2288'], 55, 1, [
    'c|Pathao booking is stuck on "processing" for 23 orders.',
    'a:rakib|Thanks Rafiq bhai. Pathao changed their store IDs last night; I am re-linking your store now.',
    'c|Still stuck. I need to send these today',
  ]],
  ['S-0028', 'messenger', 'open', 'normal', 'tania', ['Upgrade'], null, [], 70, 0, [
    'c|We opened a second branch. What is the price to move to Business?',
    'a:tania|Congratulations Tahsin! Business is ৳2,500 a month and adds branches, staff roles and stock transfers. The difference is pro-rated for this month.',
  ]],
  ['S-0038', 'telegram', 'open', 'normal', 'farhana', ['POS', 'Hardware'], null, ['T-2279'], 140, 0, [
    'c|Receipt printer prints blank paper since the update',
    'v|14',
    'a:farhana|Thanks Sharmin. Please open POS › Settings › Printer and switch paper width to 58 mm, then print a test page.',
    'c|It works now 👍',
  ]],
  ['S-0058', 'email', 'open', 'normal', 'rakib', ['Domain'], null, [], 4 * 60, 1, [
    'c|I bought nodiorganic.com from Namecheap. How do I connect it to my store?',
  ]],
  ['S-0061', 'web', 'pending', 'low', 'sadia', ['Theme'], null, [], 22 * 60, 0, [
    'c|Can I change the home page banner size?',
    'a:sadia|Yes Imran. Online Store › Themes › Customise › Banner lets you pick full width or boxed. Shall I send a short video?',
  ]],
  ['S-0066', 'whatsapp', 'open', 'normal', 'nusrat', ['Payment due'], null, [], 32, 1, [
    'a:nusrat|Assalamu alaikum Nasima apa, your October bill of ৳1,000 is 5 days overdue. The store goes read-only after 7 days.',
    'c|আমি আজকে নগদে পাঠাবো। কোন নাম্বারে পাঠাবো?',
  ]],
  ['S-0072', 'messenger', 'closed', 'normal', 'sadia', ['How-to'], null, [], 2 * 24 * 60, 0, [
    'c|How do I give my cashier access only to POS?',
    'a:sadia|Settings › Team › Add staff, choose the Shop seller role. They see only the register.',
    'c|Done thanks',
    's:circle-check|Closed by Sadia Rahman',
  ]],
  ['S-0075', 'whatsapp', 'open', 'normal', 'rakib', ['Onboarding'], null, [], 85, 0, [
    'c|Is my store ready? You said 2 days.',
    'a:rakib|Hi Nasrin apa, your products are imported and the domain is connecting now. It will be live by this evening.',
    'n:rakib|Domain step failed once (DNS). Retried at 2 PM.',
  ]],
  ['S-0052', 'web', 'open', 'normal', '', ['Staff'], null, [], 9, 1, [
    'c|One of my staff left. How do I stop his login right now?',
  ]],
  ['S-0028', 'email', 'closed', 'low', 'nusrat', ['Invoice'], null, [], 20 * 24 * 60, 0, [
    'c|Please add our trade licence number on invoices.',
    'a:nusrat|Done, Tahsin. It shows on every invoice from now on.',
    's:circle-check|Closed by Nusrat Islam',
  ]],
  ['S-0023', 'messenger', 'closed', 'normal', 'sadia', [], null, [], 14 * 24 * 60, 0, [
    'c|How do I print 50 shipping labels at once?',
    'a:sadia|Orders › select them › Print labels. It makes one PDF.',
    's:circle-check|Closed by Sadia Rahman',
  ]],
  // affiliates
  ['A-rafsan', 'messenger', 'open', 'high', 'nusrat', ['Payout'], 'auto', [], 28, 1, [
    'c|Bhai September commission still not received. 14 stores signed up from my video.',
  ], { approvals: [{ topic: 'payment', text: 'Hi Rafsan! Your September payout of ৳8,400 for 14 stores is approved and goes to your bKash 01780-224510 on the 12th.' }] }],
  ['A-tasnim', 'instagram', 'open', 'normal', 'tania', ['Tracking'], null, [], 3 * 60, 0, [
    'c|My referral link shows 0 sign-ups but 3 readers told me they joined',
    'a:tania|Thanks Tasnim, let me check. Did they sign up on the phone app or the website?',
  ]],
  ['A-mahfuz', 'email', 'open', 'normal', 'mahin', ['Commission'], 'auto', [], 6 * 60, 1, [
    'c|We brought 40 stores this year. Can we move to 25% commission from 20%?',
  ], { approvals: [{ topic: 'price', text: 'Hi Mahfuz, thank you for 40 stores this year! We can offer 25% commission from November for agencies above 30 stores a year.' }] }],
  ['A-sumaiya', 'telegram', 'closed', 'low', 'tania', ['Assets'], null, [], 5 * 24 * 60, 0, [
    'c|Do you have new banners for Puja?',
    'a:tania|Yes! Here are 6 Puja banners in Bangla and English.|Puja-banners.zip',
    's:circle-check|Closed by Tania Sultana',
  ]],
  ['A-ovi', 'whatsapp', 'open', 'normal', '', ['Payout'], null, [], 75, 1, [
    'c|I changed my bKash number. New one 01556-781299. Please send payouts there.',
  ]],
  // partners
  ['P-pathao', 'email', 'open', 'high', 'rakib', ['Integration', 'API'], null, ['T-2288'], 2 * 60, 0, [
    'c|Hi team, we are moving the order webhook to v2 on 20 Oct. Old endpoint stops on 31 Oct. Spec attached.|pathao-webhook-v2.pdf',
    'a:rakib|Thanks Sajid. We will move on our staging this week; can you share sandbox keys for v2?',
    'n:rakib|23 orders stuck for Ghorer Bazar (T-2288) may be the store-ID change, asked Sajid to confirm.',
  ]],
  ['P-ssl', 'email', 'pending', 'normal', 'nusrat', ['Settlement'], null, [], 26 * 60, 0, [
    'c|Attached is the September settlement report for GridCommerce stores.|SSL-settlement-Sep-2026.xlsx',
    'a:nusrat|Thank you Rumana. Three stores show a 2-day delay; could you check those transaction IDs?',
  ]],
  ['P-bkash', 'whatsapp', 'open', 'urgent', 'mahin', ['Payments'], null, ['T-2291'], 8, 1, [
    'a:mahin|Iftekhar bhai, store 0031 (Dhaka Gadget Hub) gets "merchant not active" since 10 AM. Can you check their wallet?',
    'c|Checking. Their merchant renewal documents expired yesterday. Need trade licence copy.',
  ]],
  ['P-steadfast', 'telegram', 'open', 'normal', 'rakib', ['COD'], null, [], 4 * 60, 0, [
    'c|COD payouts for 18 GridCommerce stores will be one day late (bank holiday).',
    'a:rakib|Noted, thanks Mamun. We will tell the stores.',
  ]],
  ['P-xprinter', 'whatsapp', 'open', 'low', 'mahin', ['Hardware'], null, [], 30 * 60, 0, [
    'c|New stock of XP-80 printers came. Partner price ৳6,200. How many for next month?',
  ]],
  ['P-redx', 'messenger', 'closed', 'normal', 'rakib', ['Integration'], null, [], 6 * 24 * 60, 0, [
    'c|RedX API keys for your sandbox are ready.',
    'k:out|184',
    'a:rakib|Got them, thanks Tahmina. Testing this week.',
    's:circle-check|Closed by Rakib Hasan',
  ]],
];

const REPLIES = [
  { id: 'r1', title: 'Greeting', short: 'hi', lang: 'en', body: 'Hi {{first}}! This is {{agent}} from GridCommerce. How can I help you today?' },
  { id: 'r2', title: 'শুভেচ্ছা', short: 'salam', lang: 'bn', body: 'আসসালামু আলাইকুম {{first}}! আমি GridCommerce থেকে {{agent}}। কীভাবে সাহায্য করতে পারি?' },
  { id: 'r3', title: 'Plans and prices', short: 'price', lang: 'en', body: 'Our plans: Growth ৳1,000, Business ৳2,500 and Enterprise ৳5,000 a month. Every plan starts with a 15-day free trial, no card needed.' },
  { id: 'r4', title: 'Book a demo', short: 'demo', lang: 'en', body: 'I would love to show you GridCommerce, {{first}}. Pick a time that suits you: https://gridcommerce.net/demo' },
  { id: 'r5', title: 'How to pay', short: 'pay', lang: 'en', body: 'You can pay your bill in Settings › Subscription & billing by bKash, Nagad or card. The invoice updates as soon as the payment arrives.' },
  { id: 'r6', title: 'Ticket opened', short: 'ticket', lang: 'en', body: 'Thanks {{first}}, I have opened a support ticket for {{store}}. Our tech team replies within 4 working hours.' },
  { id: 'r7', title: 'Trial extended', short: 'trial', lang: 'en', body: 'Good news {{first}}: I have extended your trial by 7 days, so you have time to try everything.' },
  { id: 'r8', title: 'ধন্যবাদ', short: 'thanks', lang: 'bn', body: 'ধন্যবাদ {{first}}! আর কিছু লাগলে এখানেই লিখবেন।' },
];

function seedConvs(now) {
  const r = rng('admin-inbox');
  let n = 0;
  return SCRIPTS.map(([key, ch, status, priority, assignee, tags, ai, tickets, minsAgo, unread, script, extra = {}], i) => {
    const ct = contactBy(key);
    const last = now - minsAgo * MIN;
    // walk back from the last message: a few minutes between lines, a day for '~'
    const times = [];
    let at = last;
    for (let k = script.length - 1; k >= 0; k--) {
      times[k] = at;
      at -= script[k] === '~' ? DAY : r.int(2, 11) * MIN;
    }
    const messages = [];
    script.forEach((line, k) => {
      if (line === '~') return;
      const [head, text = '', files = ''] = line.split('|');
      const [who, arg] = head.split(':');
      const base = { id: 'm' + i + '-' + n++, at: times[k] };
      if (who === 'c') messages.push({ ...base, from: 'contact', type: 'text', text, files: files ? files.split(',').map((f) => f.trim()) : [] });
      else if (who === 'a') messages.push({ ...base, from: 'agent', by: arg, type: 'text', text, files: files ? files.split(',').map((f) => f.trim()) : [], status: 'read' });
      else if (who === 'i') messages.push({ ...base, from: 'ai', type: 'text', text, status: 'read' });
      else if (who === 'n') messages.push({ ...base, from: 'note', by: arg, type: 'text', text });
      else if (who === 's') messages.push({ ...base, from: 'system', icon: arg, text });
      else if (who === 'v') messages.push({ ...base, from: 'contact', type: 'voice', dur: Number(text) || 8 });
      else if (who === 'k') messages.push({ ...base, from: 'agent', by: assignee || 'rakib', type: 'call', dir: arg, dur: Number(text) || 60, status: 'read' });
    });
    if (ai === 'auto' && messages.length && messages[0].from === 'contact') messages.splice(1, 0, { id: 'm' + i + '-ai', at: messages[0].at + 1000, from: 'system', icon: 'sparkles', text: 'GridAI answers this chat by the rules (AI auto)' });
    const approvals = (extra.approvals || []).map((a, k) => ({ id: 'ap' + i + '-' + k, at: last + 20 * 1000, topic: a.topic, text: a.text }));
    return {
      id: 'C-' + (1101 + i), contactKey: ct.key, kind: ct.kind, name: ct.name, company: ct.company, shopId: ct.shopId || '',
      phone: ct.phone || '', email: ct.email || '', handle: ct.handle || '', district: ct.district || '', source: ct.source || '',
      ch, status, snoozeUntil: status === 'snoozed' ? startOfDay(now) + (extra.snoozeDays || 2) * DAY + 10 * 3600e3 : null,
      priority, tags, assignee, ai, tickets, unread, note: '', messages, approvals, scheduled: [],
    };
  });
}

function seedCalls(now) {
  const r = rng('admin-calls');
  const people = CONTACTS.filter((c) => c.phone);
  const unknown = ['01722-458130', '01844-905517', '01951-330284', '01633-728109', '01790-114622'];
  const lineFor = (c) => (!c ? 'sales' : c.kind === 'merchant' ? r.pick(['support', 'support', 'billing', 'onboarding']) : c.kind === 'lead' ? 'sales' : c.kind === 'partner' ? 'partners' : 'billing');
  const NOTES = {
    Resolved: ['Walked them through it, working now', 'Fixed the printer setting on the call', 'Explained the invoice, all clear'],
    Interested: ['Wants the price sheet on WhatsApp', 'Comparing with two other apps, call next week', 'Liked the courier booking'],
    'Demo booked': ['Demo booked Thursday 11:00 on Google Meet', 'Demo at their shop on Saturday'],
    'Payment promised': ['Will pay by bKash tonight', 'Paying on the 15th after salary'],
    'Callback needed': ['Asked us to call after Asr', 'Owner not in, call tomorrow', 'Needs a price for 3 branches'],
    'Not interested': ['Happy with Excel for now', 'Shop closing for renovation'],
    'No answer': [''], 'Voicemail left': ['Left a message about the overdue bill'], 'Wrong number': ['Was looking for a courier'],
  };
  const calls = [];
  for (let i = 0; i < 60; i++) {
    const c = r.chance(0.86) ? r.pick(people) : null;
    const dirRoll = r();
    const dir = dirRoll < 0.42 ? 'in' : dirRoll < 0.84 ? 'out' : 'missed';
    const line = lineFor(c);
    const ln = lineOf(line);
    const agent = dir === 'missed' ? '' : r.pick(ln.staff);
    // spread over the last ~24 days, more of them recent; office hours
    const back = Math.floor(Math.pow(r(), 1.7) * 24);
    let at = startOfDay(now) - back * DAY + (9 * 60 + r.int(0, 11 * 60)) * MIN;
    if (at > now) at -= DAY;
    const answered = dir !== 'missed' && !(dir === 'out' && r.chance(0.18));
    const dur = answered ? r.int(35, 720) : 0;
    let outcome = dir === 'missed' ? '' : !answered ? r.pick(['No answer', 'No answer', 'Voicemail left']) : c && c.kind === 'lead' ? r.pick(['Interested', 'Demo booked', 'Callback needed', 'Not interested', 'Interested']) : c && c.kind === 'merchant' && line === 'billing' ? r.pick(['Payment promised', 'Resolved', 'Callback needed']) : !c ? r.pick(['Wrong number', 'Interested']) : r.pick(['Resolved', 'Resolved', 'Callback needed']);
    if (i < 4 && dir !== 'missed') outcome = '';
    const follow = outcome === 'Callback needed' || outcome === 'Interested' || (dir === 'missed' && back <= 3);
    calls.push({
      id: 'CL-' + (3001 + i), at, dir, line, phone: c ? c.phone : r.pick(unknown), name: c ? c.name : '', company: c ? c.company : '', kind: c ? c.kind : '',
      contactKey: c ? c.key : '', shopId: c ? c.shopId || '' : '', agent, dur, outcome, note: outcome ? r.pick(NOTES[outcome] || ['']) : '',
      rec: dur > 0, followUp: follow ? (dir === 'missed' ? at + 30 * MIN : startOfDay(at) + r.int(1, 4) * DAY + 11 * 3600e3) : null, followDone: follow && back > 6,
    });
  }
  return calls.sort((a, b) => b.at - a.at);
}

export const inbox = createStore({
  key: 'inbox',
  version: 1,
  seed: (now) => ({ convs: seedConvs(now), replies: REPLIES.map((x) => ({ ...x, uses: 0 })), calls: seedCalls(now), settings: { defaultAi: 'assist' }, seq: { conv: 1200, call: 3100 } }),
});

// ---- changes --------------------------------------------------------------------------------------------------------
const NOPE = (error) => ({ ok: false, error });
function onConv(id, fn) {
  return inbox.commit((d, now) => {
    const c = d.convs.find((x) => x.id === id);
    if (!c) return NOPE('This conversation is no longer here.');
    const out = fn(c, now, d);
    return out && out.ok === false ? out : { ok: true, ...(out || {}) };
  });
}
const by = () => staffName(meId());
const push = (c, msgs) => { c.messages.push(...(Array.isArray(msgs) ? msgs : [msgs])); };

export const markRead = (id) => onConv(id, (c) => { c.unread = 0; });
export const markUnread = (id) => onConv(id, (c) => { c.unread = Math.max(1, c.unread || 0); });

/** Send messages (replies, notes, files). A reply reopens a closed or snoozed chat and takes an unassigned one. */
export function send(id, msgs) {
  return onConv(id, (c, now) => {
    const me = meId();
    const rows = msgs.map((m) => ({ id: mid(), at: now, ...m }));
    const reply = rows.some((m) => m.from === 'agent');
    if (reply && (c.status === 'closed' || c.status === 'snoozed')) { push(c, sysMsg('rotate-ccw', `Reopened by ${by()} with a reply`, now)); c.status = 'open'; c.snoozeUntil = null; }
    if (reply && !c.assignee) { push(c, sysMsg('user-round-check', `Assigned to ${by()} (first reply)`, now)); c.assignee = me; }
    push(c, rows);
    c.unread = 0;
    return { ids: rows.map((m) => m.id) };
  });
}
/** The demo's delivery ticks: sent → delivered → read. */
export const tick = (id, ids, status) => onConv(id, (c) => { c.messages.forEach((m) => { if (ids.includes(m.id) && m.status !== 'read') m.status = status; }); });

export function setStatus(id, status, until) {
  const word = { open: 'Reopened', pending: 'Set to Pending', snoozed: 'Snoozed', closed: 'Closed' }[status];
  if (!word) return NOPE('Unknown status.');
  return onConv(id, (c, now) => {
    if (status === 'snoozed' && !(until > now)) return NOPE('Pick a time in the future.');
    c.status = status;
    c.snoozeUntil = status === 'snoozed' ? until : null;
    if (status === 'closed') c.unread = 0;
    push(c, sysMsg({ open: 'rotate-ccw', pending: 'hourglass', snoozed: 'alarm-clock', closed: 'circle-check' }[status], `${word}${status === 'snoozed' ? ' until ' + new Date(until).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Dhaka' }) : ''} by ${by()}`, now));
    return null;
  });
}
export function setPriority(id, p) {
  if (!PRIORITIES.some((x) => x[0] === p)) return NOPE('Unknown priority.');
  return onConv(id, (c, now) => {
    if (c.priority === p) return null;
    c.priority = p;
    push(c, sysMsg('flag', `Priority set to ${priorityOf(p)[1]} by ${by()}`, now));
    return null;
  });
}
/** Assign or transfer to a teammate (or '' to unassign). The thread gets a line saying who did it. */
export function assign(id, staffId) {
  if (staffId && !staffById(staffId)) return NOPE('Pick someone from the team.');
  return onConv(id, (c, now) => {
    if (c.assignee === staffId) return null;
    const from = c.assignee;
    c.assignee = staffId || '';
    const text = !staffId ? `Unassigned by ${by()}` : from ? `Transferred from ${staffName(from)} to ${staffName(staffId)} by ${by()}` : `Assigned to ${staffName(staffId)} by ${by()}`;
    push(c, sysMsg(from && staffId ? 'arrow-right-left' : 'user-round-check', text, now));
    return null;
  });
}
export function toggleTag(id, tag) {
  const t = String(tag || '').trim();
  if (!t) return NOPE('Type a tag.');
  return onConv(id, (c) => { c.tags = c.tags.includes(t) ? c.tags.filter((x) => x !== t) : [...c.tags, t]; });
}
export const saveContactNote = (id, note) => onConv(id, (c) => { c.note = String(note || ''); });

export function setAi(id, mode) {
  if (mode && !AI_MODES.some((x) => x[0] === mode)) return NOPE('Unknown AI mode.');
  return onConv(id, (c, now, d) => {
    c.ai = mode || null;
    const eff = aiModeOf(c, d);
    push(c, sysMsg('sparkles', `${aiModeName(eff)}${mode ? '' : ' (the default)'} for this chat · set by ${by()}`, now));
    return null;
  });
}
export function setDefaultAi(mode) {
  if (!AI_MODES.some((x) => x[0] === mode)) return NOPE('Unknown AI mode.');
  return inbox.commit((d) => { d.settings.defaultAi = mode; return { ok: true }; });
}
/** A person takes the chat from GridAI: AI off for this chat, waiting drafts are dropped. */
export function takeOver(id) {
  return onConv(id, (c, now) => {
    const me = meId();
    c.ai = 'off';
    const dropped = c.approvals.length;
    c.approvals = [];
    if (!c.assignee) c.assignee = me;
    push(c, sysMsg('hand', `${by()} took over from GridAI${dropped ? ` · ${dropped} draft${dropped === 1 ? '' : 's'} dropped` : ''}`, now));
    return null;
  });
}
/** Send a waiting GridAI draft (as written, or edited first). */
export function approveDraft(id, draftId, text) {
  return onConv(id, (c, now) => {
    const a = c.approvals.find((x) => x.id === draftId);
    if (!a) return NOPE('This draft was already handled.');
    const body = String(text != null ? text : a.text).trim();
    if (!body) return NOPE('The reply is empty.');
    c.approvals = c.approvals.filter((x) => x.id !== draftId);
    push(c, { id: mid(), at: now, from: 'ai', type: 'text', text: body, status: 'sent', approvedBy: meId() });
    push(c, sysMsg('shield-check', `${sensitiveName(a.topic)} reply approved by ${by()}${text != null && text.trim() !== a.text ? ' (edited)' : ''}`, now));
    c.unread = 0;
    return null;
  });
}
export function rejectDraft(id, draftId) {
  return onConv(id, (c, now) => {
    const a = c.approvals.find((x) => x.id === draftId);
    if (!a) return NOPE('This draft was already handled.');
    c.approvals = c.approvals.filter((x) => x.id !== draftId);
    push(c, sysMsg('x', `GridAI's ${sensitiveName(a.topic).toLowerCase()} reply rejected by ${by()}`, now));
    return null;
  });
}
/** Keep a reply to send later. */
export function schedule(id, msg, at) {
  if (!msg || (!String(msg.text || '').trim() && !(msg.files || []).length)) return NOPE('Write the message first.');
  return onConv(id, (c, now) => {
    if (!(at > now)) return NOPE('Pick a time in the future.');
    c.scheduled.push({ id: mid(), at, by: meId(), text: String(msg.text || '').trim(), files: msg.files || [] });
    c.scheduled.sort((a, b) => a.at - b.at);
    return null;
  });
}
export const cancelScheduled = (id, sid) => onConv(id, (c) => { c.scheduled = c.scheduled.filter((x) => x.id !== sid); });
export function sendScheduledNow(id, sid) {
  return onConv(id, (c, now) => {
    const s = c.scheduled.find((x) => x.id === sid);
    if (!s) return NOPE('Already sent.');
    c.scheduled = c.scheduled.filter((x) => x.id !== sid);
    push(c, { id: mid(), at: now, from: 'agent', by: s.by, type: 'text', text: s.text, files: s.files, status: 'sent' });
    return null;
  });
}
/** Send every scheduled message whose time has come (pages call this as the clock moves). */
export function flushScheduled() {
  const d = inbox.get();
  const t = inbox.now();
  if (!inbox.isLive() || !d.convs.some((c) => c.scheduled.some((s) => s.at <= t))) return 0;
  return inbox.commit((data, now) => {
    let n = 0;
    data.convs.forEach((c) => {
      const due = c.scheduled.filter((s) => s.at <= now);
      if (!due.length) return;
      c.scheduled = c.scheduled.filter((s) => s.at > now);
      due.forEach((s) => { push(c, { id: mid(), at: s.at, from: 'agent', by: s.by, type: 'text', text: s.text, files: s.files, status: 'delivered' }); n++; });
    });
    return n;
  });
}
/** Demo: the contact writes back. */
export function contactWrites(id, text, opts = {}) {
  return onConv(id, (c, now) => {
    push(c, { id: mid(), at: now, from: 'contact', type: 'text', text, files: [] });
    c.messages.forEach((m) => { if ((m.from === 'agent' || m.from === 'ai') && m.status !== 'read') m.status = 'read'; });
    if (!opts.open) c.unread = (c.unread || 0) + 1;
    if (c.status === 'closed' || c.status === 'snoozed') { c.status = 'open'; c.snoozeUntil = null; }
    return null;
  });
}
/** AI auto: GridAI answers the last message by the rules. A sensitive answer waits in Needs approval. */
export function aiAnswer(id) {
  return onConv(id, (c, now, d) => {
    if (aiModeOf(c, d) !== 'auto') return NOPE('GridAI is not on auto for this chat.');
    const last = [...c.messages].reverse().find((m) => m.from !== 'system' && m.from !== 'note');
    if (!last || last.from !== 'contact') return NOPE('Nothing to answer.');
    const text = aiSuggestions(c, 'ai')[0].replace(/GridAI/g, 'GridCommerce');
    const topic = sensitiveOf(last.text) || sensitiveOf(text);
    if (topic) { c.approvals.push({ id: mid(), at: now, topic, text }); return { waiting: true }; }
    push(c, { id: mid(), at: now, from: 'ai', type: 'text', text, status: 'delivered' });
    return { waiting: false };
  });
}
export function react(id, msgId, emoji) {
  return onConv(id, (c) => {
    const m = c.messages.find((x) => x.id === msgId);
    if (!m) return NOPE('Message not found.');
    const me = meId();
    const r = { ...(m.reactions || {}) };
    if (r[me] === emoji) delete r[me]; else r[me] = emoji;
    m.reactions = r;
    return null;
  });
}
/** Start a conversation from the inbox (an outbound message to a lead, merchant, affiliate or partner). */
export function startConversation({ ch, kind, name, company, handle, text }) {
  const nm = String(name || '').trim();
  const body = String(text || '').trim();
  if (!CHANNELS[ch]) return NOPE('Pick a channel.');
  if (!KINDS[kind]) return NOPE('Pick who this is.');
  if (!nm) return NOPE('Enter their name.');
  if (!String(handle || '').trim()) return NOPE(ch === 'email' ? 'Enter their email address.' : 'Enter their number or handle.');
  if (!body) return NOPE('Write the first message.');
  return inbox.commit((d, now) => {
    const me = meId();
    const id = 'C-' + (++d.seq.conv);
    const h = String(handle).trim();
    const known = d.convs.find((c) => c.name.toLowerCase() === nm.toLowerCase());
    d.convs.push({
      id, contactKey: known ? known.contactKey : 'N-' + id, kind, name: nm, company: String(company || '').trim() || (known ? known.company : ''), shopId: known ? known.shopId : '',
      phone: ch === 'email' ? '' : /\d{6,}/.test(h.replace(/\D/g, '')) ? h : '', email: ch === 'email' ? h : '', handle: ch === 'email' || /^\+?[\d\s-]+$/.test(h) ? '' : h,
      district: '', source: 'Started by GridCommerce', ch, status: 'open', snoozeUntil: null, priority: 'normal', tags: [], assignee: me, ai: null, tickets: [], unread: 0, note: '',
      messages: [sysMsg('square-pen', `Started by ${by()}`, now), { id: mid(), at: now, from: 'agent', by: me, type: 'text', text: body, files: [], status: 'sent' }],
      approvals: [], scheduled: [],
    });
    return { ok: true, id };
  });
}
export function upsertReply({ id, title, short, body, lang = 'en' }) {
  const t = String(title || '').trim(), s = String(short || '').trim().replace(/^\//, '').toLowerCase(), b = String(body || '').trim();
  if (!t) return NOPE('Give the reply a title.');
  if (!/^[a-z0-9-]{2,16}$/.test(s)) return NOPE('Shortcut: 2–16 letters or numbers, no spaces.');
  if (!b) return NOPE('Write the reply.');
  return inbox.commit((d) => {
    if (d.replies.some((r) => r.short === s && r.id !== id)) return NOPE(`/${s} is already used.`);
    if (id) { const r = d.replies.find((x) => x.id === id); if (!r) return NOPE('Reply not found.'); Object.assign(r, { title: t, short: s, body: b, lang }); }
    else d.replies.push({ id: 'r' + Date.now().toString(36), title: t, short: s, body: b, lang, uses: 0 });
    return { ok: true };
  });
}
export const deleteReply = (id) => inbox.commit((d) => { d.replies = d.replies.filter((r) => r.id !== id); return { ok: true }; });
export const countReplyUse = (id) => inbox.commit((d) => { const r = d.replies.find((x) => x.id === id); if (r) r.uses = (r.uses || 0) + 1; return { ok: true }; });

// ---- calls ------------------------------------------------------------------------------------------------------------
export const callCost = (c) => (c.dur ? Math.ceil(c.dur / 60) * (RATE[c.dir] || 0) : 0);
export const isFollowUp = (c) => !!c.followUp && !c.followDone;
/** This month: minutes and ৳ by line and direction (call cost, plus the numbers' rent in `total`). */
export function callUsage(calls, t) {
  const from = startOfMonth(t);
  const rows = calls.filter((c) => c.at >= from);
  const mins = (list) => list.reduce((a, c) => a + (c.dur ? Math.ceil(c.dur / 60) : 0), 0);
  const cost = (list) => list.reduce((a, c) => a + callCost(c), 0);
  return {
    calls: rows.length, minutes: mins(rows), cost: Math.round(cost(rows) * 100) / 100, rent: LINES.reduce((a, l) => a + (l.rent || 0), 0),
    get total() { return Math.round((this.cost + this.rent) * 100) / 100; },
    inMin: mins(rows.filter((c) => c.dir === 'in')), outMin: mins(rows.filter((c) => c.dir === 'out')),
    lines: LINES.map((l) => { const x = rows.filter((c) => c.line === l.id); return { ...l, calls: x.length, minutes: mins(x), cost: Math.round(cost(x) * 100) / 100, missed: x.filter((c) => c.dir === 'missed').length }; }),
  };
}
/** Add a call to the log (from the dialer or a callback). */
export function logCall({ dir = 'out', line = 'sales', phone, name = '', company = '', kind = '', contactKey = '', shopId = '', dur = 0, outcome = '', note = '', followUp = null, from = '' }) {
  if (!digits(phone)) return NOPE('Enter a number.');
  if (!['in', 'out', 'missed'].includes(dir)) return NOPE('Unknown direction.');
  if (outcome && !OUTCOMES.includes(outcome)) return NOPE('Pick an outcome.');
  if (outcome === 'Callback needed' && !followUp) return NOPE('Pick when to call back.');
  return inbox.commit((d, now) => {
    const id = 'CL-' + (++d.seq.call);
    d.calls.unshift({ id, at: now, dir, line, phone, name, company, kind, contactKey, shopId, agent: meId(), dur: Math.max(0, Math.round(dur)), outcome, note: String(note || '').trim(), rec: dur > 0, followUp: followUp || null, followDone: false });
    if (from) { const f = d.calls.find((c) => c.id === from); if (f) f.followDone = true; }
    return { ok: true, id };
  });
}
export function updateCall(id, patch) {
  if (patch.outcome && !OUTCOMES.includes(patch.outcome)) return NOPE('Pick an outcome.');
  if (patch.outcome === 'Callback needed' && !patch.followUp) return NOPE('Pick when to call back.');
  return inbox.commit((d) => {
    const c = d.calls.find((x) => x.id === id);
    if (!c) return NOPE('Call not found.');
    Object.assign(c, patch, patch.followUp && patch.followUp !== c.followUp ? { followDone: false } : {});
    return { ok: true };
  });
}
export const followUpDone = (id, done = true) => updateCall(id, { followDone: done });
