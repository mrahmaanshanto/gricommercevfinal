// admin/meetings — GridCommerce's own meetings with merchants, leads, partners and the team (super admin › Sales & CRM
// › Meetings). Front end only: createStore key `meetings` (localStorage gc.admin.meetings). Never reads the merchant
// panel's lib/meetings, and does not read lib/admin/crm (a lead is kept as its name, with an optional lead id).
//   meeting: { id 'MT-1001', title, type (TYPES id), at (ms), mins, provider ('zoom'|'meet'|'phone'|'office'), link,
//              merchantId, merchantName, leadName, leadId, participants: [{ name, role }], host (STAFF name),
//              staff: [STAFF names], agenda, notes, attachments: [file names], tasks: [task ids], outcome, outcomeAt,
//              status ('scheduled'|'completed'|'missed'|'rescheduled'|'cancelled'), cancelReason, moves: [{ from, to,
//              at, by, reason }], ai: { summary, items: [{ id, text, owner, due ('YYYY-MM-DD'), taskId }], at } | null,
//              reminders: [minutes before], history: [{ at, by, text }], createdBy, createdAt }
// "Needs an outcome": scheduled or rescheduled and already over. Change functions commit and return { ok, error?, meeting? }.

import { createStore } from './store';
import { addTask, dayKey } from './tasks';
import { STAFF } from '@/lib/platform/catalogue';
import { db as platformDB } from '@/lib/platform/store';
import { DAY, MIN, rng, at as atHour, startOfDay, weekday, dm, hm } from '@/lib/platform/util';

export const TYPES = [
  { id: 'demo', label: 'Product demo', icon: 'presentation', tone: 'primary', team: 'sales' },
  { id: 'sales', label: 'Sales meeting', icon: 'handshake', tone: 'success', team: 'sales' },
  { id: 'onboarding', label: 'Onboarding', icon: 'rocket', tone: 'info', team: 'operations' },
  { id: 'support', label: 'Customer support', icon: 'life-buoy', tone: 'warning', team: 'support' },
  { id: 'technical', label: 'Technical', icon: 'code-xml', tone: 'secondary', team: 'technical' },
  { id: 'internal', label: 'Internal team', icon: 'users', tone: 'neutral', team: 'operations' },
  { id: 'partner', label: 'Partner', icon: 'building-2', tone: 'secondary', team: 'operations' },
  { id: 'followup', label: 'Follow-up', icon: 'repeat', tone: 'primary', team: 'sales' },
];
export const STATUS = {
  scheduled: { label: 'Scheduled', tone: 'primary' },
  completed: { label: 'Completed', tone: 'success' },
  missed: { label: 'Missed', tone: 'error' },
  rescheduled: { label: 'Rescheduled', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};
export const PROVIDERS = [
  { id: 'meet', label: 'Google Meet', icon: 'video' },
  { id: 'zoom', label: 'Zoom', icon: 'video' },
  { id: 'phone', label: 'Phone call', icon: 'phone' },
  { id: 'office', label: 'At the office', icon: 'building' },
];
export const OFFICE = 'GridCommerce office, Gulshan 1, Dhaka';
export const LENGTHS = [15, 30, 45, 60, 90];
export const REMINDERS = [[15, '15 min before'], [60, '1 hour before'], [1440, '1 day before']];
export const OUTCOMES = ['Interested — next step agreed', 'Needs a proposal', 'Signed up', 'Not interested', 'Issue resolved', 'Escalated to the tech team', 'Information shared'];
/** Types that are about a merchant or a lead (the others may be internal). */
export const NEEDS_WHO = ['demo', 'sales', 'onboarding', 'support', 'followup'];

export const typeOf = (id) => TYPES.find((t) => t.id === id) || TYPES[0];
export const providerOf = (id) => PROVIDERS.find((p) => p.id === id) || PROVIDERS[0];
export const endOf = (m) => m.at + m.mins * MIN;
export const isOpen = (m) => m.status === 'scheduled' || m.status === 'rescheduled';
/** Over, but nobody recorded how it went. */
export const needsOutcome = (m, t) => isOpen(m) && endOf(m) < t;
export const isToday = (m, t) => startOfDay(m.at) === startOfDay(t);
/** Who the meeting is with, and where that record lives. */
export function whoOf(m) {
  if (m.merchantId) return { kind: 'merchant', id: m.merchantId, name: m.merchantName, href: `/admin/merchant?id=${m.merchantId}` };
  if (m.leadName) return { kind: 'lead', id: m.leadId || '', name: m.leadName, href: '/admin/leads' };
  return { kind: 'none', id: '', name: m.participants && m.participants[0] ? m.participants[0].name : 'The team', href: null };
}

// ---- links --------------------------------------------------------------------------------------------------------
const LET = 'abcdefghijkmnopqrstuvwxyz';
/** A Zoom or Google Meet address for a meeting (demo: made up, the same for the same seed). */
export function makeLink(provider, seed) {
  const r = rng('link:' + seed);
  if (provider === 'zoom') return `https://zoom.us/j/${8 + r.int(0, 1)}${Array.from({ length: 9 }, () => r.int(0, 9)).join('')}`;
  if (provider === 'meet') { const s = (n) => Array.from({ length: n }, () => LET[r.int(0, LET.length - 1)]).join(''); return `https://meet.google.com/${s(3)}-${s(4)}-${s(3)}`; }
  return '';
}

// ---- AI summary (demo text) ---------------------------------------------------------------------------------------
const ITEMS = {
  demo: [['Send the pricing and the Puja offer', 'host', 1], ['Set up a trial store with their products', 'Rakib Hasan', 2], ['Book the follow-up call', 'host', 5]],
  sales: [['Send the proposal', 'host', 1], ['Share two case studies from the same trade', 'host', 2], ['Check the payment plan with Finance', 'Nusrat Islam', 3]],
  onboarding: [['Import the product list', 'Rakib Hasan', 1], ['Connect bKash and the courier', 'Rakib Hasan', 2], ['Check in after the first 10 orders', 'host', 7]],
  support: [['Reproduce the problem on staging', 'Mahin Khan', 1], ['Update the merchant by SMS', 'host', 1], ['Close the ticket once confirmed', 'host', 3]],
  technical: [['Write the fix plan', 'Mahin Khan', 1], ['Test on the merchant’s store', 'Rakib Hasan', 3]],
  internal: [['Share the notes with the team', 'host', 0], ['Update the task board', 'host', 1]],
  partner: [['Review the draft agreement', 'Nusrat Islam', 3], ['Test their API on staging', 'Rakib Hasan', 5]],
  followup: [['Send the recap message', 'host', 0], ['Set the next step in the pipeline', 'host', 2]],
};
const LEADS_IN = { demo: 'walked through orders, inventory, the bKash checkout and courier booking', sales: 'went through the plans, the price for their branches and how billing works', onboarding: 'set up the store, the payment methods and the first products', support: 'went through the problem step by step and checked the logs', technical: 'reviewed the cause and the fix', internal: 'went through the week’s numbers and who does what', partner: 'discussed the integration, the rates and the timeline', followup: 'picked up from the last meeting and agreed the next step' };

/** The summary and action items an AI note-taker would write (demo text from the meeting's own facts). */
export function draftSummary(m) {
  const who = whoOf(m);
  const type = typeOf(m.type);
  const first = String(m.notes || m.agenda || '').split(/(?<=[.!?])\s+/)[0].trim();
  const summary = `${type.label} with ${who.kind === 'none' ? 'the team' : who.name} (${m.mins} min). ${m.host} ${LEADS_IN[m.type] || 'went through the agenda'}.`
    + (first ? ` Key point: ${first.replace(/[.!?]?$/, '.')}` : '')
    + (m.outcome ? ` Outcome: ${m.outcome}.` : '');
  const day = startOfDay(m.at);
  const items = (ITEMS[m.type] || ITEMS.internal).map(([text, owner, d], i) => ({ id: 'a' + (i + 1), text, owner: owner === 'host' ? m.host : owner, due: dayKey(day + d * DAY), taskId: '' }));
  return { summary, items };
}

// ---- the demo -----------------------------------------------------------------------------------------------------
const MER = {
  '0007': ['Rongdhonu Fashion', 'Nusrat Jahan'], '0009': ['Dhaka Shoe Corner', 'Jahid Hasan'], '0012': ['Mohona Traders', 'Faruk Ahmed'],
  '0023': ['Ghorer Bazar BD', 'Rafiq Uddin'], '0028': ['Tech Zone Uttara', 'Mousumi Das'], '0031': ['Dhaka Gadget Hub', 'Arif Hossain'],
  '0038': ['Rupsha Sports', 'Sharmin Akter'], '0044': ['Bindu Beauty', 'Mousumi Das'], '0061': ['Kolpo Books', 'Imran Hossain'],
  '0075': ['Ruposhi Jewels', 'Nasrin Sultana'], '0076': ['Chaldal Mini Mart', 'Rafiq Uddin'],
};
const LEADS = {
  'Shapla Electronics': 'Rafiq Ahmed', 'Bogura Sweets': 'Abdul Karim', 'Padma Pharma': 'Dr. Selina Parvin', 'Barishal Fish Mart': 'Habibur Rahman',
  'Sylhet Tea House': 'Tahmina Chowdhury', 'Cumilla Bakers': 'Nazmul Huda', 'Rangpur Agro Ltd': 'Shafiqul Alam', 'Chattogram Shoe Palace': 'Rashed Karim',
  'Gazipur Furniture House': 'Mizanur Rahman', 'Khulna Mobile Point': 'Sohel Rana', 'Narayanganj Textiles': 'Anwar Hossain',
};
const PARTNERS = { steadfast: ['Kamrul Hasan', 'Partnerships, Steadfast Courier'], bkash: ['Farzana Haque', 'Merchant team, bKash'], pathao: ['Tanvir Alam', 'Courier sales, Pathao'], ssl: ['Mahbub Rahman', 'Account manager, SSLCOMMERZ'] };

// [day offset, hour, minute, mins, type, who ('m:0031' | 'l:Name' | 'p:key' | ''), title, provider, host, staff, agenda, past status, extra]
const ROWS = [
  [-25, 11, 0, 60, 'internal', '', 'Q4 sales plan', 'office', 'Mahin Khan', ['Tania Sultana', 'Nusrat Islam'], 'Targets for Oct–Dec, the Puja offer and who covers which district.'],
  [-22, 12, 0, 45, 'demo', 'l:Bogura Sweets', '', 'meet', 'Tania Sultana', [], 'Show the Retail edition for 3 counters and the sweet-box variants.', 'completed', { outcome: 'Not interested', notes: 'They only need a simple POS for now. Price is too high for 3 counters. Check again in March.' }],
  [-20, 15, 0, 30, 'sales', 'l:Shapla Electronics', 'First call', 'meet', 'Tania Sultana', [], 'Two branches in Mirpur and an online page. They use Excel for stock today.'],
  [-18, 11, 30, 60, 'onboarding', 'm:0023', 'Store setup, session 1', 'zoom', 'Rakib Hasan', [], 'Products, bKash, Pathao and the delivery charges.', 'completed', { attachments: ['ghorer-bazar-products.xlsx'] }],
  [-16, 10, 0, 30, 'internal', '', 'Weekly sales stand-up', 'office', 'Tania Sultana', ['Mahin Khan'], 'Open deals and this week’s demos.'],
  [-15, 16, 0, 45, 'demo', 'l:Padma Pharma', '', 'zoom', 'Tania Sultana', ['Mahin Khan'], 'Retail edition for 5 pharmacy branches; expiry tracking; a server in Bangladesh.', 'missed'],
  [-14, 12, 30, 30, 'support', 'm:0031', 'bKash payments not showing', 'phone', 'Farhana Akter', [], 'Orders paid by bKash stay on “Payment due”.', 'completed', { outcome: 'Escalated to the tech team', notes: 'Three orders from 1–2 Oct paid by bKash still show Payment due. Webhook may be failing. Sent to Mahin.' }],
  [-13, 15, 0, 60, 'partner', 'p:steadfast', 'COD payout API', 'meet', 'Rakib Hasan', ['Nusrat Islam'], 'Daily COD payout file through their API instead of email.'],
  [-11, 11, 0, 45, 'technical', 'm:0028', 'Slow checkout review', 'meet', 'Mahin Khan', ['Rakib Hasan'], 'Checkout takes 8 seconds on 4G after choosing bKash.', 'completed', { outcome: 'Issue resolved', notes: 'Big product images on the checkout page. Will add the CDN rule and compress images.', attachments: ['checkout-trace.har'] }],
  [-10, 14, 0, 30, 'support', 'm:0009', 'Courier booking fails', 'phone', 'Sadia Rahman', ['Farhana Akter'], 'Pathao booking returns an error for Sylhet addresses.'],
  [-9, 16, 30, 30, 'followup', 'l:Shapla Electronics', 'Pricing questions', 'meet', 'Tania Sultana', [], 'Questions on the Growth plan and the price for two branches.', 'completed', { outcome: 'Needs a proposal', notes: 'They want Growth for 2 branches plus online. Asked for the Puja offer. Proposal by Sunday.', task: [0, 'T-2101', 'Send the Growth proposal with the Puja offer'] }],
  [-7, 11, 0, 60, 'onboarding', 'm:0075', 'Store setup, session 1', 'zoom', 'Rakib Hasan', [], 'Product photos, gold rate pricing and the store address.', 'completed', { outcome: 'Information shared', notes: 'Setup stopped: the store address is taken. Owner will choose a new name.' }],
  [-6, 12, 0, 30, 'sales', 'l:Barishal Fish Mart', 'Plans and pricing', 'phone', 'Tania Sultana', [], 'Online orders with cold-chain delivery.', 'cancelled', { reason: 'The owner is travelling. Will call back after Puja.' }],
  [-5, 15, 0, 60, 'internal', '', 'Puja campaign planning', 'office', 'Mahin Khan', ['Tania Sultana', 'Farhana Akter'], 'Offer, ad budget, support cover during the holidays.'],
  [-4, 11, 30, 30, 'support', 'm:0007', 'Courier labels print blank', 'meet', 'Farhana Akter', ['Sadia Rahman'], 'Labels come out blank on their Xprinter.'],
  [-3, 16, 0, 45, 'demo', 'l:Sylhet Tea House', '', 'meet', 'Tania Sultana', [], 'Online store for tea gift boxes; delivery outside Sylhet.', 'completed', { outcome: 'Signed up', notes: 'Loved the gift-box variants and bKash checkout. Signing up for Growth this week.', task: [1, 'T-2131'], attachments: ['GridCommerce-pricing-2026.pdf'] }],
  [-2, 12, 0, 30, 'followup', 'm:0038', 'Upgrade to Business', 'phone', 'Tania Sultana', [], 'They hit the product limit on Growth.', 'missed'],
  [-1, 11, 0, 30, 'sales', 'm:0012', 'Payment plan for overdue invoices', 'phone', 'Nusrat Islam', ['Tania Sultana'], 'Two invoices overdue; agree a plan.'],
  [-1, 15, 30, 45, 'partner', 'p:bkash', 'Settlement report format', 'meet', 'Nusrat Islam', ['Rakib Hasan'], 'Daily settlement file with the transaction IDs.'],
  [0, 9, 30, 15, 'internal', '', 'Daily support stand-up', 'office', 'Farhana Akter', ['Sadia Rahman'], 'Open tickets, anything urgent from the weekend.'],
  [0, 11, 0, 45, 'demo', 'l:Cumilla Bakers', '', 'meet', 'Tania Sultana', [], 'Retail edition for 2 shops plus cake pre-orders online.'],
  [0, 15, 0, 60, 'onboarding', 'm:0076', 'Product import and payments', 'zoom', 'Rakib Hasan', [], '400 products from their Excel file; bKash and Nagad.'],
  [0, 17, 30, 30, 'followup', 'l:Padma Pharma', 'Demo, second try', 'phone', 'Tania Sultana', [], 'Missed the demo on the 15th. Short call to book a new time.', 'rescheduled'],
  [1, 10, 30, 45, 'technical', 'm:0031', 'bKash webhook fix review', 'meet', 'Mahin Khan', ['Farhana Akter'], 'Walk the merchant through the fix and check the three stuck orders.'],
  [1, 14, 0, 30, 'sales', 'l:Rangpur Agro Ltd', 'Discovery call', 'meet', 'Tania Sultana', [], 'Wholesale of seeds and fertiliser to 40 dealers.'],
  [2, 11, 0, 45, 'demo', 'l:Chattogram Shoe Palace', '', 'zoom', 'Tania Sultana', [], 'Variants by size and colour; 3 branches.', 'rescheduled'],
  [2, 16, 0, 30, 'internal', '', 'Release 4.12 go / no-go', 'meet', 'Mahin Khan', ['Rakib Hasan'], 'Courier statement export: test results and the rollout.'],
  [3, 12, 0, 45, 'onboarding', 'm:0075', 'Store setup, session 2', 'zoom', 'Rakib Hasan', [], 'New store address, then products and payments.'],
  [3, 15, 30, 15, 'support', 'm:0061', 'Refund for the double charge', 'phone', 'Nusrat Islam', [], 'Charged ৳2,500 twice on 2 Oct.'],
  [4, 11, 0, 60, 'partner', 'p:pathao', 'Rate card 2027', 'office', 'Rakib Hasan', ['Nusrat Islam', 'Mahin Khan'], 'Rates for GridCommerce merchants and the COD fee.'],
  [5, 10, 0, 30, 'sales', 'm:0038', 'Upgrade to Business', 'meet', 'Tania Sultana', [], 'Product limit; the Business plan and its price.'],
  [6, 15, 0, 45, 'demo', 'l:Gazipur Furniture House', '', 'zoom', 'Tania Sultana', [], 'Made-to-order furniture with advance payments.'],
  [7, 11, 30, 30, 'followup', 'l:Sylhet Tea House', 'Sign-up and kickoff', 'meet', 'Tania Sultana', ['Rakib Hasan'], 'Confirm the plan and book the onboarding sessions.'],
  [8, 16, 0, 60, 'internal', '', 'Monthly all-hands', 'office', 'Mahin Khan', ['Rakib Hasan', 'Farhana Akter', 'Tania Sultana', 'Nusrat Islam', 'Sadia Rahman'], 'September numbers, Puja results, hiring.'],
  [9, 12, 0, 45, 'technical', 'm:0028', 'CDN rollout check', 'meet', 'Mahin Khan', ['Rakib Hasan'], 'Check checkout speed after the CDN rule.'],
  [12, 11, 0, 30, 'sales', 'l:Khulna Mobile Point', 'Discovery call', 'phone', 'Tania Sultana', [], 'Mobile shop with repairs; IMEI tracking.'],
  [14, 15, 0, 60, 'partner', 'p:ssl', 'Quarterly review', 'meet', 'Nusrat Islam', ['Mahin Khan'], 'Gateway fees, failed payments, the new EMI option.'],
  [16, 11, 0, 45, 'demo', 'l:Narayanganj Textiles', '', 'zoom', 'Tania Sultana', [], 'Wholesale textile orders and dues.'],
  [18, 12, 0, 30, 'followup', 'm:0044', 'Renewal check-in', 'phone', 'Tania Sultana', [], 'Plan renews next month; any questions.'],
];

function build(row, i, now) {
  const [off, h, mi, mins, type, who, title0, provider, host, staff, agenda, past, extra = {}] = row;
  let day = startOfDay(now) + off * DAY;
  if (off !== 0 && weekday(day) === 'Fri') day += off < 0 ? -DAY : DAY;   // Friday is the weekend
  const at = atHour(day, h, mi);
  const id = 'MT-' + (1001 + i);
  const m = {
    id, title: '', type, at, mins, provider, link: makeLink(provider, id), merchantId: '', merchantName: '', leadName: '', leadId: '',
    participants: [], host, staff, agenda, notes: '', attachments: extra.attachments || [], tasks: [], outcome: '', outcomeAt: null,
    status: 'scheduled', cancelReason: '', moves: [], ai: null, reminders: provider === 'office' ? [60] : [1440, 15],
    history: [], createdBy: host, createdAt: at - (5 + (i % 6)) * DAY,
  };
  if (who.startsWith('m:')) { const [name, owner] = MER[who.slice(2)]; m.merchantId = who.slice(2); m.merchantName = name; m.participants = [{ name: owner, role: 'Owner, ' + name }]; }
  if (who.startsWith('l:')) { m.leadName = who.slice(2); m.participants = [{ name: LEADS[m.leadName], role: 'Owner, ' + m.leadName }]; }
  if (who.startsWith('p:')) { const [name, role] = PARTNERS[who.slice(2)]; m.participants = [{ name, role }]; }
  const subject = m.merchantName || m.leadName || (who.startsWith('p:') ? m.participants[0].role.split(', ')[1] : '');
  m.title = title0 ? (subject ? `${title0} · ${subject}` : title0) : `${typeOf(type).label} · ${subject}`;
  m.history.push({ at: m.createdAt, by: host, text: 'Scheduled · invite sent' });

  const over = endOf(m) < now;
  const status = over ? (past === 'rescheduled' || !past ? 'completed' : past) : past === 'rescheduled' ? 'rescheduled' : 'scheduled';
  if (past === 'rescheduled') {
    const from = at - 2 * DAY;
    m.moves.push({ from, to: at, at: m.createdAt + DAY, by: host, reason: 'Asked for a later time' });
    m.history.push({ at: m.createdAt + DAY, by: host, text: `Moved from ${dm(from)} ${hm(from)}` });
  }
  m.status = status;
  if (status === 'completed') {
    m.notes = extra.notes || `${m.agenda} Went through it with ${m.participants[0] ? m.participants[0].name : 'the team'}; next steps agreed.`;
    m.outcome = extra.outcome || (type === 'internal' ? 'Information shared' : type === 'support' ? 'Issue resolved' : type === 'onboarding' ? 'Information shared' : 'Interested — next step agreed');
    m.outcomeAt = endOf(m) + 20 * MIN;
    m.ai = { ...draftSummary(m), at: endOf(m) + 5 * MIN };
    if (extra.task) { const [idx, taskId, text] = extra.task; m.ai.items[idx].taskId = taskId; if (text) m.ai.items[idx].text = text; m.tasks.push(taskId); }
    m.history.push({ at: m.outcomeAt, by: host, text: `Completed · ${m.outcome}` });
  }
  if (status === 'missed') m.history.push({ at: endOf(m) + 10 * MIN, by: host, text: 'Marked missed · they did not join' });
  if (status === 'cancelled') { m.cancelReason = extra.reason || ''; m.history.push({ at: at - DAY, by: host, text: `Cancelled · ${m.cancelReason}` }); }
  return m;
}

function seed(now) {
  const list = ROWS.map((row, i) => build(row, i, now));
  return { meetings: list, seq: 1001 + list.length };
}

export const meetingsStore = createStore({ key: 'meetings', version: 1, seed });

// ---- reads --------------------------------------------------------------------------------------------------------
export const allMeetings = () => meetingsStore.get().meetings.slice().sort((a, b) => a.at - b.at);
export const meetingById = (id) => meetingsStore.get().meetings.find((m) => m.id === id) || null;

/** The page's views at time t: today · upcoming · completed · missed · rescheduled · all (newest first for the past). */
export function views(list, t) {
  const live = list.filter((m) => m.status !== 'cancelled');
  return {
    today: live.filter((m) => isToday(m, t)),
    upcoming: live.filter((m) => isOpen(m) && m.at >= t),
    completed: list.filter((m) => m.status === 'completed').reverse(),
    missed: list.filter((m) => m.status === 'missed' || needsOutcome(m, t)).reverse(),
    rescheduled: list.filter((m) => m.status === 'rescheduled' || (m.moves || []).length).filter((m) => m.status !== 'completed' || m.at >= startOfDay(t)),
    all: list.slice().reverse(),
  };
}

/** The next reminder that will go out (or null). */
export function nextReminder(m, t) {
  if (!isOpen(m)) return null;
  const times = (m.reminders || []).map((mins) => m.at - mins * MIN).filter((x) => x > t).sort((a, b) => a - b);
  return times[0] || null;
}

// ---- changes ------------------------------------------------------------------------------------------------------
const clash = (list, host, at, mins, skipId) => list.find((x) => x.id !== skipId && isOpen(x) && (x.host === host || (x.staff || []).includes(host)) && at < endOf(x) && x.at < at + mins * MIN);

/** Book a meeting. input: { title, type, merchantId, leadName, leadId, participants, host, staff, at, mins, provider, agenda, reminders, invite } */
export function scheduleMeeting(input, by) {
  const type = TYPES.some((x) => x.id === input.type) ? input.type : '';
  if (!type) return { ok: false, error: 'Choose the meeting type.' };
  const shop = input.merchantId ? platformDB().shops.find((s) => s.id === input.merchantId) : null;
  if (input.merchantId && !shop) return { ok: false, error: 'That merchant is not on the platform.' };
  const leadName = String(input.leadName || '').trim();
  if (NEEDS_WHO.includes(type) && !shop && !leadName) return { ok: false, error: 'Choose the merchant or write the lead’s name.' };
  if (!STAFF.some((s) => s.name === input.host)) return { ok: false, error: 'Choose who runs the meeting.' };
  const mins = Number(input.mins) || 30;
  if (!Number.isFinite(input.at)) return { ok: false, error: 'Choose the date and time.' };
  return meetingsStore.commit((d, now) => {
    if (input.at < now - 5 * MIN) return { ok: false, error: 'That time has passed. Choose a later time.' };
    const busy = clash(d.meetings, input.host, input.at, mins);
    if (busy) return { ok: false, error: `${input.host} has “${busy.title}” at ${hm(busy.at)}. Choose another time.` };
    const id = 'MT-' + d.seq;
    d.seq += 1;
    const subject = shop ? shop.name : leadName;
    const provider = PROVIDERS.some((p) => p.id === input.provider) ? input.provider : 'meet';
    const m = {
      id, title: String(input.title || '').trim() || `${typeOf(type).label}${subject ? ' · ' + subject : ''}`, type, at: input.at, mins, provider,
      link: makeLink(provider, id + ':' + now), merchantId: shop ? shop.id : '', merchantName: shop ? shop.name : '',
      leadName: shop ? '' : leadName, leadId: shop ? '' : String(input.leadId || '').trim(),
      participants: (input.participants || []).filter((p) => p && p.name), host: input.host, staff: (input.staff || []).filter((s) => s !== input.host),
      agenda: String(input.agenda || '').trim(), notes: '', attachments: [], tasks: [], outcome: '', outcomeAt: null, status: 'scheduled',
      cancelReason: '', moves: [], ai: null, reminders: (input.reminders || []).map(Number).filter(Boolean),
      history: [{ at: now, by, text: input.invite === false ? 'Scheduled' : 'Scheduled · invite sent' }], createdBy: by, createdAt: now,
    };
    if (shop && !m.participants.length) m.participants = [{ name: shop.owner.name, role: 'Owner, ' + shop.name }];
    d.meetings.push(m);
    return { ok: true, meeting: m };
  });
}

function change(id, fn) {
  return meetingsStore.commit((d, now) => {
    const m = d.meetings.find((x) => x.id === id);
    if (!m) return { ok: false, error: 'That meeting is gone.' };
    const out = fn(m, now, d);
    return out && out.ok === false ? out : { ok: true, meeting: m };
  });
}

/** Move a meeting to a new time (it shows as Rescheduled; the people are told). */
export function rescheduleMeeting(id, at, mins, by, reason = '') {
  if (!Number.isFinite(at)) return { ok: false, error: 'Choose the new date and time.' };
  return change(id, (m, now, d) => {
    if (m.status === 'cancelled' || m.status === 'completed') return { ok: false, error: `A ${STATUS[m.status].label.toLowerCase()} meeting can’t be moved.` };
    if (at < now) return { ok: false, error: 'Choose a time that has not passed.' };
    const len = Number(mins) || m.mins;
    if (at === m.at && len === m.mins) return { ok: false, error: 'Choose a different time.' };
    const busy = clash(d.meetings, m.host, at, len, m.id);
    if (busy) return { ok: false, error: `${m.host} has “${busy.title}” at ${hm(busy.at)}. Choose another time.` };
    m.moves = [...(m.moves || []), { from: m.at, to: at, at: now, by, reason: String(reason || '').trim() }];
    m.history.push({ at: now, by, text: `Moved from ${dm(m.at)} ${hm(m.at)} to ${dm(at)} ${hm(at)}${reason ? ' · ' + reason : ''}` });
    m.at = at; m.mins = len; m.status = 'rescheduled';
    return null;
  });
}

export function cancelMeeting(id, reason, by) {
  const why = String(reason || '').trim();
  if (why.length < 3) return { ok: false, error: 'Say why the meeting is cancelled.' };
  return change(id, (m, now) => {
    if (!isOpen(m)) return { ok: false, error: 'Only a meeting that has not happened can be cancelled.' };
    m.status = 'cancelled'; m.cancelReason = why;
    m.history.push({ at: now, by, text: `Cancelled · ${why}` });
    return null;
  });
}

export function markMissed(id, by, note = '') {
  return change(id, (m, now) => {
    if (!isOpen(m)) return { ok: false, error: 'Only a meeting that has not happened can be marked missed.' };
    if (m.at > now) return { ok: false, error: 'The meeting has not started yet.' };
    m.status = 'missed';
    m.history.push({ at: now, by, text: 'Marked missed' + (note ? ' · ' + note : '') });
    return null;
  });
}

export function saveNotes(id, notes, by) {
  return change(id, (m, now) => {
    const s = String(notes || '').trim();
    if (s === (m.notes || '')) return null;
    m.notes = s;
    m.history.push({ at: now, by, text: 'Notes updated' });
    return null;
  });
}

/** Record how it went: { outcome, notes, followUp: { title, owner, due } }. Writes the AI summary and action items. */
export function completeMeeting(id, { outcome, notes, followUp } = {}, by) {
  if (!OUTCOMES.includes(outcome)) return { ok: false, error: 'Choose the outcome.' };
  const m0 = meetingById(id);
  if (!m0) return { ok: false, error: 'That meeting is gone.' };
  if (m0.status === 'cancelled') return { ok: false, error: 'This meeting was cancelled.' };
  if (m0.at > meetingsStore.now()) return { ok: false, error: 'You can record the outcome once the meeting has started.' };
  let task = null;
  if (followUp && String(followUp.title || '').trim()) {
    const r = addTask({ title: followUp.title, team: typeOf(m0.type).team, assignees: [followUp.owner || m0.host], due: followUp.due || '', priority: 'normal', related: { kind: 'meeting', id: m0.id, label: m0.title }, from: 'meeting ' + m0.id }, by);
    if (!r.ok) return r;
    task = r.task;
  }
  return change(id, (m, now) => {
    if (typeof notes === 'string' && notes.trim()) m.notes = notes.trim();
    m.outcome = outcome; m.outcomeAt = now; m.status = 'completed';
    if (task) m.tasks = [...(m.tasks || []), task.id];
    m.ai = { ...draftSummary(m), at: now };
    m.history.push({ at: now, by, text: `Completed · ${outcome}${task ? ` · follow-up task ${task.id}` : ''}` });
    return null;
  });
}

/** (Re)write the AI summary and action items from the notes (keeps items already made into tasks). */
export function generateSummary(id, by) {
  return change(id, (m, now) => {
    if (!String(m.notes || m.agenda || '').trim()) return { ok: false, error: 'Write the notes first; the summary is made from them.' };
    const next = draftSummary(m);
    const kept = (m.ai ? m.ai.items : []).filter((x) => x.taskId);
    next.items = next.items.map((x) => kept.find((k) => k.text === x.text) || x);
    m.ai = { ...next, at: now };
    m.history.push({ at: now, by, text: 'AI summary written' });
    return null;
  });
}

/** Turn one action item into a task in the Tasks store. */
export function actionToTask(id, itemId, by) {
  const m = meetingById(id);
  const item = m && m.ai ? m.ai.items.find((x) => x.id === itemId) : null;
  if (!item) return { ok: false, error: 'That action item is gone.' };
  if (item.taskId) return { ok: false, error: `Already task ${item.taskId}.` };
  const r = addTask({ title: item.text + (whoOf(m).kind !== 'none' ? ` · ${whoOf(m).name}` : ''), team: typeOf(m.type).team, assignees: [item.owner], due: item.due, priority: 'normal', related: { kind: 'meeting', id: m.id, label: m.title }, from: 'meeting ' + m.id }, by);
  if (!r.ok) return r;
  const out = change(id, (mm, now) => {
    const it = mm.ai.items.find((x) => x.id === itemId);
    it.taskId = r.task.id;
    mm.tasks = [...(mm.tasks || []), r.task.id];
    mm.history.push({ at: now, by, text: `Task ${r.task.id} made: ${item.text}` });
    return null;
  });
  return { ...out, task: r.task };
}

/** A follow-up task for this meeting: { title, owner, due }. */
export function addFollowUpTask(id, { title, owner, due }, by) {
  const m = meetingById(id);
  if (!m) return { ok: false, error: 'That meeting is gone.' };
  const r = addTask({ title, team: typeOf(m.type).team, assignees: [owner || m.host], due: due || '', priority: 'normal', related: { kind: 'meeting', id: m.id, label: m.title }, from: 'meeting ' + m.id }, by);
  if (!r.ok) return r;
  const out = change(id, (mm, now) => { mm.tasks = [...(mm.tasks || []), r.task.id]; mm.history.push({ at: now, by, text: `Follow-up task ${r.task.id}` }); return null; });
  return { ...out, task: r.task };
}

export function addAttachment(id, name, by) {
  const n = String(name || '').trim();
  if (!n) return { ok: false, error: 'Choose a file.' };
  return change(id, (m, now) => {
    if ((m.attachments || []).includes(n)) return { ok: false, error: `${n} is already attached.` };
    m.attachments = [...(m.attachments || []), n];
    m.history.push({ at: now, by, text: `Attached ${n}` });
    return null;
  });
}
export function removeAttachment(id, name, by) {
  return change(id, (m, now) => { m.attachments = (m.attachments || []).filter((x) => x !== name); m.history.push({ at: now, by, text: `Removed ${name}` }); return null; });
}
export function setReminders(id, list, by) {
  return change(id, (m, now) => {
    m.reminders = [...new Set(list.map(Number).filter(Boolean))].sort((a, b) => b - a);
    m.history.push({ at: now, by, text: m.reminders.length ? 'Reminders: ' + m.reminders.map((x) => (REMINDERS.find((r) => r[0] === x) || [0, x + ' min'])[1]).join(', ') : 'Reminders off' });
    return null;
  });
}
