// leads — people and shops who might buy, and the follow-ups that turn them into customers (Leads page,
// dashboards). Front end only: kept in this browser.
//   lead: { id, name, company, phone, email, source, kind ('Retail'|'Wholesale'|'Corporate'), interest, value (৳),
//           stage, owner (user id from lib/team.js), next: { at (ms), what } | null, area,
//           log: [{ at, by, kind ('note'|'call'|'message'|'meeting'|'stage'|'quote'), text }], lost, customer, at }
// Winning a lead adds them to the customer book (lib/customers.js).

import { saveCustomerOnce } from './customers';
import { wholesaleOn } from './edition';

export const LEADS_KEY = 'gc.leads';
export const LEADS_EVENT = 'gc:leads';
export const STAGES = [
  ['new', 'New', 'slate', 'Just came in — nobody has talked to them yet'],
  ['contacted', 'Contacted', 'info', 'We have spoken; they are interested'],
  ['qualified', 'Qualified', 'primary', 'Real need, budget and timing'],
  ['quote', 'Quote sent', 'warning', 'Price or sample sent, waiting for a yes'],
  ['won', 'Won', 'success', 'Bought — now a customer'],
  ['lost', 'Lost', 'error', 'Not buying this time'],
];
export const OPEN_STAGES = ['new', 'contacted', 'qualified', 'quote'];
export const SOURCES = ['Facebook', 'Instagram', 'WhatsApp', 'Website', 'Phone call', 'Walk-in', 'Referral', 'Trade fair'];
// 'Wholesale' only while wholesale is on (edition.js; off for now): business buyers are 'Corporate'
export const KINDS = ['Retail', 'Wholesale', 'Corporate'].filter((k) => k !== 'Wholesale' || wholesaleOn());
/** A lead's kind as shown: a wholesale lead reads 'Corporate' while wholesale is off. */
export const kindOf = (l) => (l.kind === 'Wholesale' && !wholesaleOn() ? 'Corporate' : l.kind);
export const LOG_KINDS = { note: ['Note', 'sticky-note'], call: ['Call', 'phone'], message: ['Message', 'message-circle'], meeting: ['Meeting', 'users'], stage: ['Stage', 'git-commit-horizontal'], quote: ['Quote', 'file-text'] };
export const LOST_REASONS = ['Price too high', 'Bought elsewhere', 'No reply', 'Not needed now', 'Out of stock', 'Delivery area'];
export const stageOf = (k) => STAGES.find((s) => s[0] === k) || STAGES[0];
// chance of winning by stage, for the weighted pipeline
export const STAGE_WEIGHT = { new: 0.1, contacted: 0.25, qualified: 0.5, quote: 0.7, won: 1, lost: 0 };

const at = (m, d, h = 11, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
const L = (kind, m, d, h, by, text) => ({ at: at(m, d, h), by, kind, text });

// [id, name, company, phone, source, kind, interest, value, stage, owner, next [m, d, h, what] | null, area, log, created [m, d]]
const ROWS = [
  ['LD-1001', 'Abdur Rahman', 'Rahman Telecom', '01711-345678', 'Trade fair', 'Wholesale', '120 phones a month for 3 shops in Savar', 485000, 'quote', 'arafat', [10, 1, 15, 'Send the revised quote, price list B'], 'Savar', [L('note', 9, 18, 16, 'arafat', 'Met at the Dhaka trade fair. Owns 3 grocery shops.'), L('call', 9, 22, 12, 'arafat', 'Wants 200 cartons a month if price beats Meghna by 2%.'), L('quote', 9, 27, 17, 'arafat', 'Sent price list A. Says too high.')], [9, 18]],
  ['LD-1002', 'Nusrat Jahan', 'Glow & Go Courier', '01819-882211', 'Instagram', 'Corporate', 'Phones for 30 delivery riders', 96000, 'qualified', 'arafat', [10, 2, 11, 'Bring two sample phones to the office in Banani'], 'Banani', [L('message', 9, 25, 20, 'lamia', 'Asked on Instagram about salon prices.'), L('call', 9, 28, 13, 'arafat', 'Needs serums, toner and sunscreen for 2 branches.')], [9, 25]],
  ['LD-1003', 'Tania Islam', '', '01712-554433', 'Facebook', 'Retail', 'Puja gift — a phone for her mother', 18500, 'contacted', 'lamia', [10, 1, 17, 'Send photos of the new phones on WhatsApp'], 'Mirpur', [L('message', 9, 30, 21, 'lamia', 'Commented on the Puja teaser, then sent a message.')], [9, 30]],
  ['LD-1004', 'Kabir Hossain', 'Hossain Telecom', '01911-778899', 'Referral', 'Wholesale', 'Chargers and cables for the shop', 142000, 'new', 'arafat', [10, 1, 12, 'First call — introduced by Rahim Uddin'], 'Uttara', [L('note', 10, 1, 9, 'ceo', 'Rahim Uddin says Kabir wants a second supplier.')], [10, 1]],
  ['LD-1005', 'Shapla Begum', '', '01556-223344', 'Walk-in', 'Retail', 'Wedding gift — two iPhone 15s', 24000, 'quote', 'rakib', [9, 30, 18, 'Call back about the price for two iPhones'], 'Dhanmondi', [L('meeting', 9, 26, 17, 'rakib', 'Came to Dhanmondi with her sister. Wedding on 25 Oct.'), L('quote', 9, 27, 12, 'rakib', 'Bridal set quote ৳24,000 with 8% off.')], [9, 26]],
  ['LD-1006', 'Mahmud Hasan', 'BrightPath School', '01611-998877', 'Website', 'Corporate', 'Eid gifts for 120 teachers', 210000, 'contacted', 'ceo', [10, 3, 11, 'Meeting at the school with the principal'], 'Mohammadpur', [L('message', 9, 29, 10, 'arafat', 'Filled the corporate gift form on the website.'), L('call', 9, 30, 15, 'ceo', 'Wants 120 gift boxes under ৳1,800 each.')], [9, 29]],
  ['LD-1007', 'Rokeya Sultana', '', '01733-112244', 'WhatsApp', 'Retail', 'Phone for her son’s exam result', 9500, 'won', 'arafat', null, 'Dhanmondi', [L('message', 9, 12, 19, 'arafat', 'Wants a budget phone under ৳15,000.'), L('stage', 9, 15, 12, 'arafat', 'First order placed — ৳9,520.')], [9, 12]],
  ['LD-1008', 'Imran Chowdhury', 'Chowdhury Super Shop', '01822-334455', 'Phone call', 'Wholesale', 'Chargers and cables, 80 boxes', 156000, 'lost', 'arafat', null, 'Narayanganj', [L('call', 9, 8, 11, 'arafat', 'Asked for price list.'), L('stage', 9, 19, 16, 'arafat', 'Went with another supplier — 3% cheaper.')], [9, 8], 'Price too high'],
  ['LD-1009', 'Farzana Akter', '', '01744-556677', 'Facebook', 'Retail', 'Phone + case + glass bundle', 6200, 'new', 'lamia', [10, 1, 14, 'Reply to the Facebook message'], 'Rampura', [L('message', 10, 1, 8, 'lamia', 'Asked if the bundle comes with a free cover.')], [10, 1]],
  ['LD-1010', 'Sajjad Karim', 'Karim Electronics', '01799-445566', 'Trade fair', 'Wholesale', 'Earbuds and power banks for resale', 268000, 'qualified', 'ceo', [10, 4, 12, 'Send the electronics price list and warranty terms'], 'Chattogram', [L('note', 9, 18, 15, 'ceo', 'Big shop in New Market, Chattogram.'), L('call', 9, 24, 11, 'ceo', 'Wants 6-month warranty in writing.')], [9, 18]],
  ['LD-1011', 'Rumi Das', '', '01677-889900', 'Instagram', 'Retail', 'Type-C earphones ×3', 3600, 'contacted', 'lamia', [9, 29, 16, 'Remind about the restock — earphones back in stock'], 'Gulshan', [L('message', 9, 27, 22, 'lamia', 'Wanted 3 earphones; out of stock then.')], [9, 27]],
  ['LD-1012', 'Arman Hossain', 'Hossain Builders', '01866-554411', 'Referral', 'Corporate', 'Phones for 40 site engineers', 320000, 'quote', 'arafat', [10, 2, 10, 'Ask about the quote — they compare two suppliers'], 'Tejgaon', [L('meeting', 9, 21, 14, 'arafat', 'Visited the kitchen. Uses 400 kg rice a week.'), L('quote', 9, 25, 18, 'arafat', 'Weekly supply quote ৳80,000 a week, 30-day credit.')], [9, 21]],
  ['LD-1013', 'Lipi Rani', '', '01922-778811', 'Walk-in', 'Retail', 'Puja phones for the family', 32000, 'won', 'rakib', null, 'Dhanmondi', [L('meeting', 9, 28, 18, 'rakib', 'Chose 4 phones, coming back with her mother.'), L('stage', 9, 30, 17, 'rakib', 'Bought — ৳31,400 at Dhanmondi counter 1.')], [9, 28]],
  ['LD-1014', 'Hasan Mahmud', 'Mahmud Mart', '01533-667788', 'Website', 'Wholesale', 'Accessories for a mobile corner', 74000, 'contacted', 'arafat', [9, 30, 12, 'Call — asked for the minimum order'], 'Bashundhara', [L('message', 9, 26, 11, 'arafat', 'Wholesale form on the website.')], [9, 26]],
  ['LD-1015', 'Nasrin Sultana', '', '01788-990011', 'Phone call', 'Retail', 'iPhone 15 on EMI', 11800, 'new', 'farhana', [10, 1, 16, 'Call back after 4 PM'], 'Mirpur', [L('call', 10, 1, 10, 'farhana', 'Called the order line; wants advice on an iPhone on EMI.')], [10, 1]],
  ['LD-1016', 'Shafiq Ahmed', 'Ahmed Garments', '01811-224466', 'Referral', 'Corporate', 'Puja bonus gift cards for 300 workers', 450000, 'qualified', 'ceo', [10, 2, 15, 'Meeting with HR at the factory in Gazipur'], 'Gazipur', [L('call', 9, 29, 12, 'ceo', 'Wants ৳1,500 gift cards for 300 workers before 15 Oct.')], [9, 29]],
  ['LD-1017', 'Moni Akter', '', '01755-332211', 'Facebook', 'Retail', 'Kids’ tablet for online classes', 4800, 'lost', 'lamia', null, 'Savar', [L('message', 9, 14, 20, 'lamia', 'Asked for a bundle price.'), L('stage', 9, 20, 11, 'lamia', 'No reply after two reminders.')], [9, 14], 'No reply'],
  ['LD-1018', 'Jamal Uddin', 'Uddin Telecom', '01722-889944', 'Trade fair', 'Wholesale', 'Feature phones, 50 a week', 198000, 'new', 'arafat', [10, 2, 12, 'First call after the trade fair'], 'Keraniganj', [L('note', 9, 19, 17, 'arafat', 'Card from the trade fair stall.')], [9, 19]],
];
const SEED = ROWS.map(([id, name, company, phone, source, kind, interest, value, stage, owner, next, area, log, [cm, cd], lost = '']) => ({
  id, name, company, phone, email: '', source, kind: kind === 'Wholesale' && !wholesaleOn() ? 'Corporate' : kind, interest, value, stage, owner, area, log, lost, customer: stage === 'won' ? phone : '',
  next: next ? { at: at(next[0], next[1], next[2]), what: next[3] } : null, at: at(cm, cd, 10),
}));

const ssr = () => typeof window === 'undefined';
export function getLeads() {
  if (ssr()) return SEED;
  try { return JSON.parse(window.localStorage.getItem(LEADS_KEY)) || SEED; } catch { return SEED; }
}
const write = (list) => { try { window.localStorage.setItem(LEADS_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(LEADS_EVENT)); } catch { /* ignore */ } };
const nextId = (list) => 'LD-' + (list.reduce((m, l) => Math.max(m, Number(String(l.id).slice(3)) || 0), 1000) + 1);

export function saveLead(lead, by = 'ceo') {
  const list = getLeads();
  if (!lead.id) {
    const row = { stage: 'new', log: [], next: null, lost: '', customer: '', email: '', area: '', company: '', ...lead, value: Math.round(Number(lead.value) || 0), id: nextId(list), at: Date.now() };
    row.log = [{ at: Date.now(), by, kind: 'note', text: `Lead added · ${row.source}` }, ...row.log];
    write([row, ...list]);
    return row;
  }
  write(list.map((x) => (x.id === lead.id ? { ...x, ...lead, value: Math.round(Number(lead.value ?? x.value) || 0) } : x)));
  return lead;
}
/** Log a call, message, meeting, quote or note; optionally set the next follow-up. */
export function logActivity(id, { kind, text, by, next }) {
  const l = getLeads().find((x) => x.id === id);
  if (!l) return;
  const patch = { log: [...l.log, { at: Date.now(), by, kind, text }] };
  if (next !== undefined) patch.next = next;
  if (l.stage === 'new' && ['call', 'message', 'meeting'].includes(kind)) { patch.stage = 'contacted'; patch.log.push({ at: Date.now(), by, kind: 'stage', text: 'Moved to Contacted' }); }
  if (kind === 'quote' && ['new', 'contacted', 'qualified'].includes(l.stage)) { patch.stage = 'quote'; patch.log.push({ at: Date.now(), by, kind: 'stage', text: 'Moved to Quote sent' }); }
  saveLead({ id, ...patch });
}
/** Move a lead along. Won adds them to the customer book; lost keeps the reason. */
export function moveStage(id, stage, { by, reason = '' } = {}) {
  const l = getLeads().find((x) => x.id === id);
  if (!l || l.stage === stage) return null;
  let customer = l.customer;
  if (stage === 'won') {
    const c = saveCustomerOnce({ name: l.company ? `${l.name} · ${l.company}` : l.name, phone: l.phone, address: l.area, types: [wholesaleOn() && (l.kind === 'Wholesale' || l.kind === 'Corporate') ? 'Wholesale' : 'Retail'], addedFrom: 'order' });
    customer = c ? c.phone : '';
  }
  const text = stage === 'lost' ? `Lost${reason ? ' · ' + reason : ''}` : `Moved to ${stageOf(stage)[1]}${stage === 'won' ? ' · added to customers' : ''}`;
  saveLead({ id, stage, lost: stage === 'lost' ? reason : '', customer, next: stage === 'won' || stage === 'lost' ? null : l.next, log: [...l.log, { at: Date.now(), by, kind: 'stage', text }] });
  return customer;
}
export function removeLead(id) { write(getLeads().filter((l) => l.id !== id)); }

/** Follow-up state against now: 'overdue' | 'today' | 'soon' | 'later' | 'none'. */
export function followState(l, now) {
  if (!l.next || !OPEN_STAGES.includes(l.stage)) return 'none';
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  const t = l.next.at;
  if (t < now) return 'overdue';
  if (t < d0.getTime() + 864e5) return 'today';
  if (t < d0.getTime() + 3 * 864e5) return 'soon';
  return 'later';
}
