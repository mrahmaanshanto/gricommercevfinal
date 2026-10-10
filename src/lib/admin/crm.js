// admin/crm — GridCommerce's own sales CRM: people and shops who might buy a GridCommerce subscription (front end
// only; localStorage gc.admin.crm through createStore). Never reads the merchant panel's lib/leads.js.
//
//   A lead: who (name, business, mobile, email), where it came from (SOURCES), the business (type, category, current
//   software, orders a month), what it wants (interested modules, package → expected ৳ a month), its salesperson,
//   stage (STAGES; Lost carries a reason), last contact, next follow-up, notes, activity, tasks, quotations, meetings,
//   the stage history and — once won and set up — the merchant (platform store id) it became.
//
//   Reads:   leads() · leadById(id) · stageOf(key) · stageIndex(key) · isOpen(l) · followState(l, t) · reachedIndex(l)
//            planLabel(ladder, plan) · priceFor(plan, modules) · quoteTotal(q) · forecast(list) · funnel(from, to)
//            allMeetings() · parseImport(text, leads) · platformSource(src) · segsOf(type)
//   Changes: addLead · updateLead · setNext · moveStage · markLost · logActivity · addNote · addTask · toggleTask
//            addQuote · setQuoteStatus · scheduleMeeting · completeMeeting · bulkAssign · bulkMove · importLeads
//            convertToMerchant (runs lib/platform/shops.js › provisionStore, then marks the lead Won with the store id)
//   Every change returns { ok, error?, field? } and writes the lead's activity. The demo (≈120 leads over six months)
//   is built around the first visit; won leads point at real platform stores whose source fits (db().shops).

import { createStore } from './store';
import { rng, DAY, startOfDay, pad4, dm, hm, taka, num } from '@/lib/platform/util';
import { MODULES, PLAN_NAME, LADDERS, ADDONS, ladderLabel } from '@/lib/platform/catalogue';
import { db as platformDB, load as platformLoad, staff as platformStaff } from '@/lib/platform/store';
import { provisionStore } from '@/lib/platform/shops';

// ---- the lists ----------------------------------------------------------------------------------------------------
export const STAGES = [
  { key: 'new', label: 'New', tone: 'neutral', weight: 0.05, next: 'First call' },
  { key: 'contacted', label: 'Contacted', tone: 'primary', weight: 0.1, next: 'Qualify the needs' },
  { key: 'qualified', label: 'Qualified', tone: 'primary', weight: 0.2, next: 'Book a demo' },
  { key: 'demo', label: 'Demo scheduled', tone: 'primary', weight: 0.3, next: 'Give the demo' },
  { key: 'demodone', label: 'Demo done', tone: 'primary', weight: 0.45, next: 'Send the quotation' },
  { key: 'proposal', label: 'Proposal sent', tone: 'warning', weight: 0.6, next: 'Chase the quotation' },
  { key: 'negotiation', label: 'Negotiation', tone: 'warning', weight: 0.75, next: 'Close the deal' },
  { key: 'won', label: 'Won', tone: 'success', weight: 1 },
  { key: 'lost', label: 'Lost', tone: 'error', weight: 0 },
];
export const OPEN_STAGES = STAGES.filter((s) => s.key !== 'won' && s.key !== 'lost').map((s) => s.key);
export const SOURCES = ['Facebook Ads', 'Google Ads', 'Website registration', 'Organic search', 'Affiliate', 'Referral', 'WhatsApp', 'Messenger', 'Manual entry', 'Trade fair', 'Direct call'];
export const TYPES = ['Online', 'Retail', 'Wholesale', 'Mixed'];
export const CATEGORIES = ['Fashion', 'Electronics', 'Mobile & gadgets', 'Grocery', 'Beauty', 'Jewellery and accessories', 'Furniture', 'Pharmacy', 'Books & stationery', 'Food & sweets', 'Home decor', 'Sports'];
export const SOFTWARE = ['None (Facebook page only)', 'Excel sheets', 'Paper ledger', 'Tally', 'Shopify', 'WooCommerce', 'Daraz Seller Center', 'Another POS', 'Custom website'];
export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Narayanganj', 'Gazipur', 'Bogura', 'Cumilla', 'Rangpur', 'Mymensingh', 'Barishal', 'Jashore', 'Tangail', 'Pabna'];
export const LOST_REASONS = ['Price too high', 'Chose a competitor', 'Not ready yet', 'Stopped replying', 'Needs a feature we lack', 'Budget cut', 'Fake or duplicate lead'];
/** GridCommerce's sales people: Tania (STAFF) and the two sales executives, plus Mahin on key accounts. */
export const SALES_TEAM = [
  { name: 'Tania Sultana', title: 'Sales lead', ini: 'TS', color: '#2e559d' },
  { name: 'Shakil Ahmed', title: 'Sales executive', ini: 'SA', color: '#0070a0' },
  { name: 'Mithila Chowdhury', title: 'Sales executive', ini: 'MC', color: '#7d94bf' },
  { name: 'Mahin Khan', title: 'Admin · key accounts', ini: 'MK', color: '#00567a' },
];
export const SALES_NAMES = SALES_TEAM.map((s) => s.name);
export const ACT_KINDS = {
  call: ['Call', 'phone'], whatsapp: ['WhatsApp', 'message-circle'], email: ['Email', 'mail'], meeting: ['Meeting', 'video'],
  note: ['Note', 'sticky-note'], stage: ['Stage', 'arrow-right-left'], quote: ['Quotation', 'file-text'], system: ['System', 'zap'],
};
export const LOG_KINDS = ['call', 'whatsapp', 'email', 'meeting'];
export const MEETING_KINDS = ['Google Meet', 'Zoom', 'Office visit', 'At their shop', 'Phone call'];
export const QUOTE_STATUS = { draft: ['Draft', 'neutral'], sent: ['Sent', 'primary'], accepted: ['Accepted', 'success'], declined: ['Declined', 'error'], expired: ['Expired', 'neutral'] };
export const PLAN_PRICE = { growth: 1000, business: 2500, enterprise: 5000 };
export const PLANS = Object.keys(PLAN_PRICE);
/** The modules a lead can be interested in (names from the platform's MODULES). */
export const INTEREST_MODULES = ['Online orders', 'Courier and COD', 'Checkout', 'Themes', 'Landing pages', 'POS', 'Counter sales', 'Cash and expenses',
  'Warranty', 'Purchasing', 'Wholesale dues', 'Warehouse', 'HR and payroll', 'Promotions', 'Loyalty', 'Cart recovery', 'Analytics', 'Inbox', 'Blasts',
  'AI products', 'Migration'].filter((n) => MODULES.some((m) => m.name === n));
/** Interested modules that are billed on top of the plan (ADDONS, monthly ones). */
const ADDON_OF = { Warehouse: 'M05', 'HR and payroll': 'M19', 'AI products': 'G5', Inbox: 'G3', Migration: 'S6' };
export const addonCodes = (mods) => (mods || []).map((m) => ADDON_OF[m]).filter(Boolean);

// ---- small reads --------------------------------------------------------------------------------------------------
export const stageOf = (key) => STAGES.find((s) => s.key === key) || STAGES[0];
export const stageIndex = (key) => STAGES.findIndex((s) => s.key === key);
export const isOpen = (l) => OPEN_STAGES.includes(l.stage);
export const planLabel = (ladder, plan) => `${ladderLabel(ladder)} · ${PLAN_NAME[plan] || plan}`;
/** A month's price: the plan plus the monthly add-ons among the modules. */
export function priceFor(plan, mods) {
  const extra = addonCodes(mods).map((c) => ADDONS.find((a) => a.code === c)).filter((a) => a && a.period === 'Monthly').reduce((s, a) => s + a.price, 0);
  return (PLAN_PRICE[plan] || 0) + extra;
}
export const quoteTotal = (q) => Math.round((q.price || 0) * (1 - (q.discount || 0) / 100));
/** "overdue" · "today" · "soon" (next 2 days) · "later" · "none" — for open leads. */
export function followState(l, t) {
  if (!l.next || !isOpen(l)) return 'none';
  const d0 = startOfDay(t);
  if (l.next.at < d0) return 'overdue';
  if (l.next.at < d0 + DAY) return 'today';
  if (l.next.at < d0 + 3 * DAY) return 'soon';
  return 'later';
}
/** The furthest open stage a lead reached (won = Won's index), from its history. */
export function reachedIndex(l) {
  let m = 0;
  for (const h of l.history || []) { if (h.stage !== 'lost') m = Math.max(m, stageIndex(h.stage)); }
  return m;
}
/** Open pipeline: count, value a month, and the value weighted by stage. */
export function forecast(list) {
  const open = list.filter(isOpen);
  return {
    count: open.length,
    value: open.reduce((s, l) => s + (l.value || 0), 0),
    weighted: Math.round(open.reduce((s, l) => s + (l.value || 0) * stageOf(l.stage).weight, 0)),
  };
}
/** Lead source → the platform's "came from" list (lib/platform/catalogue SOURCES). */
export function platformSource(src) {
  return ({
    'Facebook Ads': 'Meta ads', Messenger: 'Meta ads', 'Google Ads': 'YouTube ads', 'Website registration': 'Website', 'Organic search': 'Website',
    Affiliate: 'Affiliate', Referral: 'Reference', 'Trade fair': 'Event',
  })[src] || 'Physical visit';
}
/** Business type → the store's segments. */
export const segsOf = (type) => (type === 'Mixed' ? ['Online', 'Retail'] : [type || 'Online']);
const ladderOfType = (type) => (type === 'Retail' ? 'retail' : type === 'Wholesale' ? 'wholesale' : 'online');
const typeOfSegs = (segs) => (segs.length > 1 ? 'Mixed' : segs[0] || 'Online');

const MOBILE = /^01[3-9]\d{8}$/;
const digits = (s) => String(s || '').replace(/\D/g, '').replace(/^880/, '0').replace(/^(?=1[3-9])/, '0');
/** "01711223344" → "01711-223344" */
export const fmtMobile = (s) => { const d = digits(s); return d.length === 11 ? d.slice(0, 5) + '-' + d.slice(5) : String(s || '').trim(); };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- the demo -----------------------------------------------------------------------------------------------------
const M_FIRST = ['Arif', 'Rakibul', 'Sohel', 'Jahid', 'Imran', 'Kamrul', 'Faruk', 'Mizanur', 'Habibur', 'Rafiq', 'Tanvir', 'Shahin', 'Nayeem', 'Riyad', 'Sabbir', 'Mehedi', 'Asif', 'Fahim', 'Rasel', 'Masud', 'Tareq', 'Anisur', 'Delwar', 'Belal', 'Ziaul', 'Monir'];
const F_FIRST = ['Nusrat', 'Sharmin', 'Mousumi', 'Taslima', 'Rumana', 'Nasrin', 'Shirin', 'Lipi', 'Nazma', 'Rokeya', 'Farzana', 'Tahmina', 'Jannatul', 'Sumaiya', 'Afsana', 'Mitu', 'Ruma', 'Shampa'];
const M_LAST = ['Hossain', 'Rahman', 'Islam', 'Ahmed', 'Khan', 'Uddin', 'Chowdhury', 'Sarker', 'Mia', 'Haque', 'Talukder', 'Bhuiyan', 'Molla', 'Sheikh', 'Das', 'Roy'];
const F_LAST = ['Akter', 'Sultana', 'Begum', 'Islam', 'Rahman', 'Chowdhury', 'Khatun', 'Das', 'Jahan'];
const BRANDS = ['Rongdhonu', 'Shapla', 'Megh', 'Nodi', 'Akash', 'Shonali', 'Bindu', 'Kolpo', 'Ruposhi', 'Shobuj', 'Projapoti', 'Doel', 'Kashful', 'Joba', 'Palash', 'Shimul', 'Bokul', 'Jonaki', 'Taj', 'Al-Madina', 'Bismillah', 'New Star'];
const PLACES = ['Dhanmondi', 'Mirpur', 'Uttara', 'Banani', 'Gulshan', 'Bashundhara', 'Mohammadpur', 'Chawkbazar', 'New Market', 'Elephant Road', 'Agrabad', 'GEC', 'Zindabazar', 'Khulna', 'Rajshahi', 'Bogura', 'Cumilla', 'Narayanganj', 'Gazipur', 'Savar', 'Rangpur', 'Mymensingh', 'Jashore', 'Tangail'];
const NOUNS = {
  Fashion: ['Fashion House', 'Boutique', 'Saree Ghor', 'Panjabi Corner', 'Style Point', 'Threads'],
  Electronics: ['Electronics', 'Tech Store', 'Digital Point'],
  'Mobile & gadgets': ['Mobile Zone', 'Gadget Hub', 'Phone Point', 'Gadget Bari'],
  Grocery: ['Bazar', 'Mini Mart', 'Super Shop', 'Fresh Mart'],
  Beauty: ['Beauty Corner', 'Cosmetics', 'Glow Shop'],
  'Jewellery and accessories': ['Jewellers', 'Gold House', 'Accessories'],
  Furniture: ['Furniture', 'Wood Craft', 'Interiors'],
  Pharmacy: ['Pharmacy', 'Medicine Corner', 'Health Care'],
  'Books & stationery': ['Book House', 'Library', 'Stationery'],
  'Food & sweets': ['Sweets', 'Mishti Ghor', 'Bakery', 'Foods'],
  'Home decor': ['Home Decor', 'Living', 'Crafts'],
  Sports: ['Sports', 'Fitness Store'],
};
const SOFT_BY_TYPE = {
  Online: ['None (Facebook page only)', 'None (Facebook page only)', 'Excel sheets', 'Shopify', 'WooCommerce', 'Daraz Seller Center', 'Custom website'],
  Retail: ['Paper ledger', 'Excel sheets', 'Tally', 'Another POS', 'Another POS', 'Paper ledger'],
  Wholesale: ['Paper ledger', 'Tally', 'Excel sheets', 'Tally'],
  Mixed: ['Excel sheets', 'Another POS', 'WooCommerce', 'Tally', 'None (Facebook page only)'],
};
const MODS_BY_TYPE = {
  Online: [['Online orders', 'Courier and COD', 'Checkout', 'Themes'], ['Landing pages', 'Inbox', 'Promotions', 'Cart recovery', 'Analytics', 'AI products', 'Blasts', 'Loyalty']],
  Retail: [['POS', 'Counter sales', 'Cash and expenses', 'Warranty'], ['Loyalty', 'Promotions', 'Warehouse', 'HR and payroll', 'Analytics']],
  Wholesale: [['Purchasing', 'Wholesale dues', 'Warehouse'], ['HR and payroll', 'Analytics', 'Inbox']],
  Mixed: [['Online orders', 'Courier and COD', 'POS', 'Counter sales'], ['Warehouse', 'Loyalty', 'Promotions', 'Inbox', 'Analytics', 'HR and payroll']],
};
const NOTES = [
  'Owner decides with his brother; call after Asr.', 'Runs three Facebook pages, wants one stock for all.', 'Wants Bangla invoices and bKash on checkout.',
  'Compared us with a local POS; their price is lower but no online store.', 'Has 2 branches, asked about a warehouse transfer.',
  'Prefers WhatsApp to calls during the day.', 'Their accountant uses Tally — needs an export.', 'Asked if staff phones can be used as the register.',
  'Courier: uses Steadfast and Pathao now.', 'Wants a demo at the shop, not online.', 'Pays by bKash merchant; asked about monthly auto-pay.',
];
const TASKS = ['Send the pricing PDF', 'Share the demo store link', 'Prepare a migration estimate', 'Confirm their courier accounts', 'Send case study (fashion shop)', 'Call back after Jumma', 'Check if Tally export is enough', 'Book the office visit'];
const CALLS = [
  'Introduced GridCommerce; interested, asked for the price.', 'Talked about their order volume and couriers.', 'Owner busy; asked to call back.',
  'Walked through POS and stock; liked the branch view.', 'Asked about yearly discount.', 'Confirmed the modules they need.',
];
const WAS = ['Sent the brochure and price list on WhatsApp.', 'Shared the demo video.', 'Sent the quotation PDF on WhatsApp.', 'They asked for a bKash payment option.'];
const EMAILS = ['Sent the proposal by email.', 'Sent the onboarding checklist.', 'Emailed the case study.'];

function seed(now) {
  const r = rng('gc-admin-crm-v1');
  const raw = [];
  const team = (x) => (x < 0.36 ? 'Tania Sultana' : x < 0.64 ? 'Shakil Ahmed' : x < 0.88 ? 'Mithila Chowdhury' : 'Mahin Khan');
  const person = () => {
    const f = r.chance(0.38);
    return (f ? r.pick(F_FIRST) : r.pick(M_FIRST)) + ' ' + (f ? r.pick(F_LAST) : r.pick(M_LAST));
  };
  const mobile = () => '01' + r.pick(['3', '4', '5', '6', '7', '8', '9']) + String(r.int(10, 99)) + '-' + String(r.int(100000, 999999));
  const emailOf = (name, biz) => (r.chance(0.2) ? '' : `${name.split(' ')[0].toLowerCase()}.${biz.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 12)}@${r.pick(['gmail.com', 'gmail.com', 'yahoo.com', 'outlook.com'])}`);
  const pickMods = (type, sw) => {
    const [base, extra] = MODS_BY_TYPE[type];
    const out = base.filter(() => r.chance(0.75));
    if (!out.length) out.push(base[0]);
    for (const m of extra) if (r.chance(0.22)) out.push(m);
    if (['Shopify', 'WooCommerce', 'Tally', 'Another POS'].includes(sw) && r.chance(0.4)) out.push('Migration');
    return out;
  };
  const planFor = (orders) => (orders < 300 ? (r.chance(0.85) ? 'growth' : 'business') : orders < 1500 ? (r.chance(0.8) ? 'business' : 'growth') : r.chance(0.6) ? 'enterprise' : 'business');
  const hourAt = (day, lo = 10, hi = 19) => startOfDay(day) + r.int(lo, hi) * 3600e3 + r.pick([0, 15, 30, 45]) * 6e4;

  // one lead's story: stages from New to `final` (+ won/lost), activity between createdAt and end
  function story(l, final, end, lostReason) {
    const path = STAGES.slice(0, stageIndex(final === 'won' || final === 'lost' ? l.reach : final) + 1).map((s) => s.key);
    if (final === 'won') path.push('won');
    const span = Math.max(0, end - l.createdAt);
    const times = path.map((_, i) => (i === 0 ? l.createdAt : l.createdAt + Math.round((span * i) / Math.max(1, path.length - 1 + (final === 'lost' ? 1 : 0)))));
    l.history = path.map((stage, i) => ({ stage, at: times[i], by: i === 0 ? 'System' : l.owner }));
    const acts = [{ kind: 'system', text: `Lead came in from ${l.source}`, at: l.createdAt, by: 'System' }];
    path.forEach((stage, i) => {
      if (i === 0) return;
      const tt = times[i];
      const from = stageOf(path[i - 1]).label;
      if (stage === 'contacted') acts.push({ kind: 'call', text: r.pick(CALLS), at: tt - 20 * 6e4, by: l.owner });
      if (stage === 'qualified') acts.push({ kind: r.chance(0.5) ? 'call' : 'whatsapp', text: `Qualified: about ${num(l.orders)} orders a month, wants ${l.modules.slice(0, 2).join(' and ') || 'the core'}.`, at: tt - 15 * 6e4, by: l.owner });
      if (stage === 'demo') l.meetings.push({ kind: r.pick(MEETING_KINDS.slice(0, 4)), title: 'Product demo', at: path[i + 1] ? times[i + 1] - 2 * 3600e3 : null, by: l.owner, with: l.name, done: !!path[i + 1], note: path[i + 1] ? r.pick(['Showed orders, courier and stock; liked the dashboard.', 'Demo at the shop; the owner and manager joined.', 'Went through POS and branch stock.']) : '' });
      if (stage === 'demodone') acts.push({ kind: 'meeting', text: 'Demo given · ' + (l.meetings[l.meetings.length - 1] || {}).kind, at: tt - 30 * 6e4, by: l.owner });
      if (stage === 'proposal') {
        const status = final === 'proposal' || final === 'negotiation' ? 'sent' : final === 'won' ? 'accepted' : r.chance(0.5) ? 'declined' : 'expired';
        l.quotes.push({ ladder: l.ladder, plan: l.plan, modules: l.modules.slice(), price: l.value, discount: final === 'won' && r.chance(0.5) ? r.pick([5, 10]) : 0, validUntil: tt + 14 * DAY, status, at: tt, by: l.owner, note: '' });
        acts.push({ kind: 'quote', text: `Quotation sent · ${planLabel(l.ladder, l.plan)} ${taka(l.value)} a month`, at: tt + 6e4, by: l.owner });
      }
      if (stage === 'negotiation') {
        acts.push({ kind: 'call', text: r.pick(['Asked for 10% off on yearly.', 'Wants the first month free.', 'Asked to add 2 more staff seats at the same price.']), at: tt - 10 * 6e4, by: l.owner });
        if (final === 'negotiation' && r.chance(0.5)) l.quotes.push({ ladder: l.ladder, plan: l.plan, modules: l.modules.slice(), price: l.value, discount: 10, validUntil: now + r.int(3, 12) * DAY, status: 'draft', at: tt + 3600e3, by: l.owner, note: 'Revised with 10% off for a yearly plan.' });
      }
      acts.push({ kind: 'stage', text: `${from} → ${stageOf(stage).label}`, at: tt, by: l.owner });
      const wa = r.chance(0.6);
      if (r.chance(0.35)) acts.push({ kind: wa ? 'whatsapp' : 'email', text: wa ? r.pick(WAS) : r.pick(EMAILS), at: tt + r.int(2, 30) * 3600e3 < end ? tt + r.int(2, 30) * 3600e3 : tt + 3600e3, by: l.owner });
    });
    if (final === 'lost') {
      acts.push({ kind: 'stage', text: `${stageOf(path[path.length - 1]).label} → Lost · ${lostReason}`, at: end, by: l.owner });
      l.history.push({ stage: 'lost', at: end, by: l.owner });
      l.lostReason = lostReason;
      l.lostAt = end;
    }
    if (final === 'won') { l.wonAt = end; acts.push({ kind: 'system', text: 'Signed up' + (l.merchantId ? ` · became store #${l.merchantId}` : ' · store not set up yet'), at: end + 6e4, by: 'System' }); }
    l.activity = acts.filter((a) => a.at <= now).sort((a, b) => a.at - b.at);
    const contact = l.activity.filter((a) => LOG_KINDS.includes(a.kind) || a.kind === 'quote');
    l.lastContact = contact.length ? contact[contact.length - 1].at : null;
  }

  function base({ name, business, mobile: mob, email, source, type, category, district, software, orders, modules, plan, owner, createdAt }) {
    const ladder = ladderOfType(type);
    return {
      id: '', name, business, mobile: mob, email, source, type, category, district, software, orders, modules,
      ladder, plan, value: priceFor(plan, modules), owner, stage: 'new', lostReason: null, lostAt: null, wonAt: null, merchantId: null,
      createdAt, lastContact: null, next: null, notes: [], activity: [], tasks: [], quotes: [], meetings: [], history: [],
    };
  }

  // 1 · leads that became real stores (platform stores opened in the last ~6 months)
  let shops = [];
  try { platformLoad(); shops = platformDB().shops || []; } catch { shops = []; }
  const recent = shops.filter((s) => s.createdAt <= now && now - s.createdAt < 170 * DAY && s.owner).sort((a, b) => b.createdAt - a.createdAt).slice(0, 16);
  const SRC_FOR = { 'Meta ads': ['Facebook Ads', 'Messenger'], 'YouTube ads': ['Google Ads'], Website: ['Website registration', 'Organic search'], Reference: ['Referral'], Affiliate: ['Affiliate'], Event: ['Trade fair'], 'Physical visit': ['Direct call', 'Manual entry', 'WhatsApp'] };
  for (const s of recent) {
    const sub = (platformDB().subs || {})[s.id] || {};
    const segs = s.segs || ['Online'];
    const type = typeOfSegs(segs);
    const cat = CATEGORIES.includes(s.cat) ? s.cat : s.cat === 'Electronics' ? 'Electronics' : 'Fashion';
    const sw = r.pick(SOFT_BY_TYPE[type]);
    const orders = Math.round(r.int(120, 2400) / 10) * 10;
    const created = s.createdAt - r.int(12, 40) * DAY;
    const l = base({
      name: s.owner.name, business: s.name, mobile: fmtMobile(s.owner.phone), email: s.owner.email || '', source: r.pick(SRC_FOR[s.src] || ['Direct call']),
      type, category: cat, district: s.dist || 'Dhaka', software: sw, orders, modules: pickMods(type, sw), plan: sub.plan || 'growth', owner: team(r()), createdAt: hourAt(created),
    });
    l.ladder = sub.ladder || l.ladder;
    l.value = priceFor(l.plan, l.modules);
    l.merchantId = s.id;
    l.stage = 'won';
    l.reach = 'negotiation';
    story(l, 'won', Math.min(now, s.createdAt - 2 * 3600e3));
    raw.push(l);
  }

  // 2 · everyone else
  const n = 120 - raw.length;
  for (let i = 0; i < n; i++) {
    const age = i < 4 ? 0 : Math.floor(Math.pow(r(), 1.25) * 178);
    const type = r.pick(['Online', 'Online', 'Online', 'Retail', 'Retail', 'Mixed', 'Wholesale']);
    const category = r.pick(type === 'Retail' ? ['Mobile & gadgets', 'Electronics', 'Pharmacy', 'Fashion', 'Grocery', 'Books & stationery'] : type === 'Wholesale' ? ['Grocery', 'Fashion', 'Electronics', 'Food & sweets'] : CATEGORIES);
    const name = person();
    const business = (r.chance(0.5) ? r.pick(BRANDS) : r.pick(PLACES)) + ' ' + r.pick(NOUNS[category]);
    const sw = r.pick(SOFT_BY_TYPE[type]);
    const orders = Math.round((type === 'Wholesale' ? r.int(30, 600) : type === 'Retail' ? r.int(200, 3600) : r.int(60, 3000)) / 10) * 10;
    const createdDay = startOfDay(now) - age * DAY;
    let createdAt = hourAt(createdDay, 9, 20);
    if (createdAt > now - 20 * 6e4) createdAt = now - r.int(30, 300) * 6e4;
    const l = base({
      name, business, mobile: mobile(), email: emailOf(name, business), source: r.pick(SOURCES), type, category,
      district: r.chance(0.45) ? 'Dhaka' : r.pick(DISTRICTS), software: sw, orders, modules: pickMods(type, sw), plan: planFor(orders),
      owner: team(r()), createdAt,
    });
    // where it stands, by age
    const x = r();
    let final;
    if (i === 10 || i === 37) final = 'won';
    else if (age > 45) final = x < 0.32 ? 'lost' : null;
    else if (age > 14) final = x < 0.15 ? 'lost' : null;
    else final = age > 3 && x < 0.06 ? 'lost' : null;
    if (!final) {
      const max = Math.min(6, Math.floor(age / 3) + 1);
      final = age <= 1 ? (r.chance(0.7) ? 'new' : 'contacted') : OPEN_STAGES[r.int(age > 20 ? 1 : 0, max)];
    }
    l.stage = final;
    if (final === 'won') {
      l.reach = 'negotiation';
      story(l, 'won', now - r.int(1, 4) * DAY);
    } else if (final === 'lost') {
      l.reach = OPEN_STAGES[r.int(0, 6)];
      story(l, 'lost', Math.min(now - DAY, l.createdAt + r.int(5, Math.max(6, age - 1)) * DAY), r.pick(LOST_REASONS));
    } else {
      // the follow-up decides how far the story runs
      const f = r();
      let end;
      let next = null;
      const what = stageOf(final).next;
      if (age === 0) { end = createdAt; next = f < 0.8 ? { at: Math.max(now + 3600e3, createdAt + 2 * 3600e3), what } : null; }
      else if (f < 0.13) { const k = r.int(1, 4); end = startOfDay(now) - (k + 1) * DAY + 12 * 3600e3; next = { at: startOfDay(now) - k * DAY + r.int(10, 17) * 3600e3, what }; }
      else if (f < 0.26) { end = startOfDay(now) - r.int(1, 3) * DAY + 15 * 3600e3; next = { at: startOfDay(now) + r.int(10, 19) * 3600e3, what }; }
      else if (f < 0.88) { end = Math.min(now - 3600e3, startOfDay(now) - r.int(0, 3) * DAY + 13 * 3600e3); next = { at: startOfDay(now) + r.int(1, 10) * DAY + r.int(10, 18) * 3600e3, what }; }
      else { end = startOfDay(now) - r.int(2, 6) * DAY + 12 * 3600e3; }
      end = Math.max(createdAt, Math.min(end, now));
      if (next && next.at < createdAt) next.at = createdAt + 2 * 3600e3;
      story(l, final, end);
      if (final === 'demo') {
        const m = l.meetings[l.meetings.length - 1];
        const mAt = next && next.at > now ? next.at : startOfDay(now) + r.int(1, 5) * DAY + r.pick([11, 12, 15, 16]) * 3600e3;
        if (m) m.at = mAt;
        next = { at: mAt, what: 'Product demo' };
      }
      l.next = next;
      if (r.chance(0.6)) {
        const k = r.int(1, 2);
        for (let j = 0; j < k; j++) {
          const due = startOfDay(now) + r.int(-3, 7) * DAY + 17 * 3600e3;
          const done = due < now && r.chance(0.5);
          l.tasks.push({ title: r.pick(TASKS), due, owner: l.owner, done, doneAt: done ? due - 3600e3 : null, at: Math.min(now, Math.max(createdAt, due - 3 * DAY)), by: l.owner });
        }
      }
    }
    if (r.chance(0.45)) l.notes.push({ text: r.pick(NOTES), at: Math.min(now, l.createdAt + r.int(1, 48) * 3600e3), by: l.owner });
    raw.push(l);
  }

  // ids in the order the leads came in
  raw.sort((a, b) => a.createdAt - b.createdAt);
  const seq = { lead: 1001, act: 1, note: 1, task: 1, quote: 1, meet: 1 };
  for (const l of raw) {
    delete l.reach;
    l.id = 'L-' + seq.lead++;
    l.activity = l.activity.map((a) => ({ id: 'A' + seq.act++, ...a }));
    l.notes = l.notes.map((x) => ({ id: 'N' + seq.note++, ...x }));
    l.tasks = l.tasks.map((x) => ({ id: 'T' + seq.task++, ...x }));
    l.quotes = l.quotes.map((x) => ({ id: 'QT-' + pad4(seq.quote++), ...x }));
    l.meetings = l.meetings.filter((m) => m.at).map((x) => ({ id: 'MT-' + pad4(seq.meet++), ...x }));
  }
  return { leads: raw.reverse(), seq };
}

export const crm = createStore({ key: 'crm', version: 1, seed });

// ---- reads --------------------------------------------------------------------------------------------------------
export const leads = () => crm.get().leads;
export const leadById = (id) => crm.get().leads.find((l) => l.id === id) || null;
/** Every meeting on every lead, soonest first (for the Meetings page and the lead's Meetings tab). */
export function allMeetings() {
  return crm.get().leads.flatMap((l) => l.meetings.map((m) => ({ ...m, leadId: l.id, business: l.business, leadName: l.name, owner: l.owner }))).sort((a, b) => a.at - b.at);
}

/**
 * The sales funnel for leads that came in during [from, to), the same shape as lib/admin/company.js › funnel:
 * { new, qualified, meeting (demo booked), demo (demo done), proposal, won, lost, conversion }.
 */
export function funnel(from, to) {
  const ls = crm.get().leads.filter((l) => l.createdAt >= from && l.createdAt < to);
  const reach = (k) => ls.filter((l) => reachedIndex(l) >= stageIndex(k)).length;
  const out = {
    new: ls.length, qualified: reach('qualified'), meeting: reach('demo'), demo: reach('demodone'), proposal: reach('proposal'),
    won: ls.filter((l) => l.stage === 'won').length, lost: ls.filter((l) => l.stage === 'lost').length,
  };
  out.conversion = out.new ? out.won / out.new : 0;
  return out;
}

/**
 * The funnel as work done in [from, to): new leads that came in, and leads that reached each stage in the period
 * (from their stage history). Same shape as `funnel`; the dashboard uses this one, so "this month" shows this month's work.
 */
export function funnelMoves(from, to) {
  const ls = crm.get().leads;
  const moved = (stage) => ls.filter((l) => l.history.some((h) => h.stage === stage && h.at >= from && h.at < to)).length;
  const out = {
    new: ls.filter((l) => l.createdAt >= from && l.createdAt < to).length,
    qualified: moved('qualified'), meeting: moved('demo'), demo: moved('demodone'), proposal: moved('proposal'),
    won: moved('won'), lost: moved('lost'),
  };
  // closed in the period: how many of the decided leads were won
  out.conversion = out.won + out.lost ? out.won / (out.won + out.lost) : 0;
  return out;
}

// ---- changes ------------------------------------------------------------------------------------------------------
const who = () => (platformStaff() || {}).name || 'Mahin Khan';
const find = (data, id) => data.leads.find((l) => l.id === id);
const act = (data, l, t, kind, text, extra = {}) => { const a = { id: 'A' + data.seq.act++, kind, text, at: t, by: who(), ...extra }; l.activity.push(a); return a; };
function stageTo(data, l, t, stage, extra = '') {
  const from = stageOf(l.stage).label;
  l.stage = stage;
  l.history.push({ stage, at: t, by: who() });
  act(data, l, t, 'stage', `${from} → ${stageOf(stage).label}${extra}`);
}
const missing = { ok: false, error: 'This lead no longer exists.' };

/** Check a lead's fields (add, edit, import). Returns { field, error } or null. */
function check(f, data, selfId) {
  if (!String(f.name || '').trim()) return { field: 'name', error: 'Enter the person’s name.' };
  if (!String(f.business || '').trim()) return { field: 'business', error: 'Enter the business name.' };
  const d = digits(f.mobile);
  if (!MOBILE.test(d)) return { field: 'mobile', error: 'Enter a Bangladesh mobile number, like 01711-223344.' };
  const dup = data.leads.find((l) => l.id !== selfId && isOpen(l) && digits(l.mobile) === d);
  if (dup) return { field: 'mobile', error: `This number is already an open lead (${dup.id}, ${dup.business}).` };
  if (f.email && !EMAIL.test(String(f.email).trim())) return { field: 'email', error: 'Enter a valid email, or leave it empty.' };
  if (f.orders !== undefined && f.orders !== '' && !(Number(f.orders) >= 0)) return { field: 'orders', error: 'Orders a month is a number.' };
  return null;
}
function clean(f) {
  const mods = (f.modules || []).filter((m) => INTEREST_MODULES.includes(m));
  const type = TYPES.includes(f.type) ? f.type : 'Online';
  const plan = PLANS.includes(f.plan) ? f.plan : 'growth';
  return {
    name: String(f.name).trim(), business: String(f.business).trim(), mobile: fmtMobile(f.mobile), email: String(f.email || '').trim(),
    source: SOURCES.includes(f.source) ? f.source : 'Manual entry', type, category: CATEGORIES.includes(f.category) ? f.category : CATEGORIES[0],
    district: String(f.district || 'Dhaka').trim() || 'Dhaka', software: String(f.software || SOFTWARE[0]).trim(), orders: Math.round(Number(f.orders) || 0),
    modules: mods, ladder: LADDERS.some((x) => x.id === f.ladder) ? f.ladder : ladderOfType(type), plan,
    value: f.value !== undefined && f.value !== '' && Number(f.value) > 0 ? Math.round(Number(f.value)) : priceFor(plan, mods),
    owner: SALES_NAMES.includes(f.owner) ? f.owner : SALES_NAMES[0],
  };
}
function blank(data, fields, t, by) {
  return {
    id: 'L-' + data.seq.lead++, ...fields, stage: 'new', lostReason: null, lostAt: null, wonAt: null, merchantId: null,
    createdAt: t, lastContact: null, next: null, notes: [], activity: [], tasks: [], quotes: [], meetings: [], history: [{ stage: 'new', at: t, by }],
  };
}

/** Add a lead (the Add lead sheet). f.nextAt / f.nextWhat set the first follow-up; f.note adds a note. */
export function addLead(f) {
  return crm.commit((data, t) => {
    const bad = check(f, data);
    if (bad) return { ok: false, ...bad };
    const l = blank(data, clean(f), t, who());
    act(data, l, t, 'system', `Lead added by ${who()} · ${l.source}`);
    if (f.nextAt) l.next = { at: Number(f.nextAt), what: String(f.nextWhat || '').trim() || stageOf('new').next };
    if (String(f.note || '').trim()) l.notes.push({ id: 'N' + data.seq.note++, text: String(f.note).trim(), at: t, by: who() });
    data.leads.unshift(l);
    return { ok: true, lead: l };
  });
}

const EDITABLE = ['name', 'business', 'mobile', 'email', 'source', 'type', 'category', 'district', 'software', 'orders', 'modules', 'ladder', 'plan', 'value', 'owner'];
const LABEL = { name: 'name', business: 'business', mobile: 'mobile', email: 'email', source: 'source', type: 'business type', category: 'category', district: 'district', software: 'current software', orders: 'orders a month', modules: 'modules', ladder: 'package', plan: 'plan', value: 'expected subscription', owner: 'salesperson' };
/** Edit a lead's details. Only the fields given change; a new salesperson is written to the activity by name. */
export function updateLead(id, patch) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    const merged = { ...l, ...patch };
    const bad = check(merged, data, id);
    if (bad) return { ok: false, ...bad };
    const c = clean(merged);
    if (patch.value === undefined && (patch.plan !== undefined || patch.modules !== undefined)) c.value = priceFor(c.plan, c.modules);
    const changed = EDITABLE.filter((k) => JSON.stringify(l[k]) !== JSON.stringify(c[k]));
    if (!changed.length) return { ok: true, changed: 0 };
    const oldOwner = l.owner;
    for (const k of changed) l[k] = c[k];
    if (changed.includes('owner')) act(data, l, t, 'system', `Salesperson ${oldOwner} → ${l.owner}`);
    const rest = changed.filter((k) => k !== 'owner');
    if (rest.length) act(data, l, t, 'system', 'Edited ' + rest.map((k) => LABEL[k]).join(', '));
    return { ok: true, changed: changed.length };
  });
}

/** Set (or clear, with null) the next follow-up. */
export function setNext(id, next) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    if (!isOpen(l)) return { ok: false, error: 'Won and lost leads have no follow-up.' };
    if (next && !(Number(next.at) > 0)) return { ok: false, field: 'at', error: 'Pick a date and time.' };
    l.next = next ? { at: Number(next.at), what: String(next.what || '').trim() || stageOf(l.stage).next } : null;
    act(data, l, t, 'system', next ? `Follow-up set for ${dm(l.next.at)} ${hm(l.next.at)} · ${l.next.what}` : 'Follow-up cleared');
    return { ok: true };
  });
}

/** Move a lead to a stage. Lost needs { reason }. A lead that became a store can't leave Won. */
export function moveStage(id, stage, { reason, note } = {}) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    if (!STAGES.some((s) => s.key === stage)) return { ok: false, error: 'Unknown stage.' };
    if (l.stage === stage) return { ok: false, error: `Already ${stageOf(stage).label}.` };
    if (l.merchantId) return { ok: false, error: `This lead is already store #${l.merchantId}.` };
    if (stage === 'lost') {
      const why = String(reason || '').trim();
      if (!why) return { ok: false, field: 'reason', error: 'Pick why it was lost.' };
      l.lostReason = why + (String(note || '').trim() ? ' · ' + String(note).trim() : '');
      l.lostAt = t;
      l.next = null;
      stageTo(data, l, t, 'lost', ' · ' + l.lostReason);
      return { ok: true };
    }
    if (l.stage === 'lost') { l.lostReason = null; l.lostAt = null; }
    if (stage === 'won') { l.wonAt = t; l.next = null; } else l.wonAt = null;
    stageTo(data, l, t, stage);
    return { ok: true };
  });
}
export const markLost = (id, reason, note) => moveStage(id, 'lost', { reason, note });

/** Log a call, WhatsApp, email or meeting. A first contact moves a New lead to Contacted. next: {at, what} | null | undefined (leave). */
export function logActivity(id, { kind, text, next } = {}) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    if (!LOG_KINDS.includes(kind)) return { ok: false, field: 'kind', error: 'Pick what happened.' };
    const txt = String(text || '').trim();
    if (!txt) return { ok: false, field: 'text', error: 'Write what happened.' };
    if (next && !(Number(next.at) > 0)) return { ok: false, field: 'next', error: 'Pick when to follow up.' };
    act(data, l, t, kind, txt);
    l.lastContact = t;
    let moved = false;
    if (l.stage === 'new') { stageTo(data, l, t, 'contacted'); moved = true; }
    if (next !== undefined && isOpen(l)) l.next = next ? { at: Number(next.at), what: String(next.what || '').trim() || stageOf(l.stage).next } : null;
    return { ok: true, moved };
  });
}

export function addNote(id, text) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    const txt = String(text || '').trim();
    if (!txt) return { ok: false, field: 'text', error: 'Write the note first.' };
    const n = { id: 'N' + data.seq.note++, text: txt, at: t, by: who() };
    l.notes.unshift(n);
    return { ok: true, note: n };
  });
}

export function addTask(id, { title, due, owner } = {}) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    const txt = String(title || '').trim();
    if (!txt) return { ok: false, field: 'title', error: 'Say what needs doing.' };
    if (!(Number(due) > 0)) return { ok: false, field: 'due', error: 'Pick a due date.' };
    const task = { id: 'T' + data.seq.task++, title: txt, due: Number(due), owner: SALES_NAMES.includes(owner) ? owner : l.owner, done: false, doneAt: null, at: t, by: who() };
    l.tasks.push(task);
    act(data, l, t, 'system', `Task added: ${txt} · ${task.owner} by ${dm(task.due)}`);
    return { ok: true, task };
  });
}
export function toggleTask(id, taskId) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    const task = l && l.tasks.find((x) => x.id === taskId);
    if (!task) return { ok: false, error: 'This task no longer exists.' };
    task.done = !task.done;
    task.doneAt = task.done ? t : null;
    if (task.done) act(data, l, t, 'system', `Task done: ${task.title}`);
    return { ok: true, done: task.done };
  });
}

/** A quotation: package + modules + price (a month) − discount %, valid until. status 'draft' or 'sent' (sending moves the lead to Proposal sent). */
export function addQuote(id, f = {}) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    if (!LADDERS.some((x) => x.id === f.ladder)) return { ok: false, field: 'ladder', error: 'Pick the package.' };
    if (!PLANS.includes(f.plan)) return { ok: false, field: 'plan', error: 'Pick the plan.' };
    const price = Math.round(Number(f.price));
    if (!(price > 0)) return { ok: false, field: 'price', error: 'Enter the price a month.' };
    const discount = Number(f.discount || 0);
    if (!(discount >= 0 && discount <= 40)) return { ok: false, field: 'discount', error: 'A discount is 0–40%. Above that, ask Mahin Khan.' };
    if (!(Number(f.validUntil) > t)) return { ok: false, field: 'validUntil', error: 'Valid until must be after today.' };
    const status = f.status === 'sent' ? 'sent' : 'draft';
    const q = { id: 'QT-' + pad4(data.seq.quote++), ladder: f.ladder, plan: f.plan, modules: (f.modules || []).filter((m) => INTEREST_MODULES.includes(m)), price, discount, validUntil: Number(f.validUntil), status, at: t, by: who(), note: String(f.note || '').trim() };
    l.quotes.unshift(q);
    act(data, l, t, 'quote', `Quotation ${q.id} ${status === 'sent' ? 'sent' : 'drafted'} · ${planLabel(q.ladder, q.plan)} ${taka(quoteTotal(q))} a month${discount ? ` (${discount}% off)` : ''}`);
    if (status === 'sent') { l.lastContact = t; if (isOpen(l) && stageIndex(l.stage) < stageIndex('proposal')) stageTo(data, l, t, 'proposal'); }
    return { ok: true, quote: q };
  });
}
/** Mark a quotation sent, accepted or declined. Accepting sets the lead's package and price and moves it to Negotiation. */
export function setQuoteStatus(id, quoteId, status) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    const q = l && l.quotes.find((x) => x.id === quoteId);
    if (!q) return { ok: false, error: 'This quotation no longer exists.' };
    if (!QUOTE_STATUS[status] || status === 'draft') return { ok: false, error: 'Unknown status.' };
    if (q.status === status) return { ok: false, error: `Already ${QUOTE_STATUS[status][0].toLowerCase()}.` };
    q.status = status;
    q[status + 'At'] = t;
    act(data, l, t, 'quote', `Quotation ${q.id} ${QUOTE_STATUS[status][0].toLowerCase()}`);
    if (status === 'sent') { l.lastContact = t; if (isOpen(l) && stageIndex(l.stage) < stageIndex('proposal')) stageTo(data, l, t, 'proposal'); }
    if (status === 'accepted') {
      for (const o of l.quotes) if (o !== q && (o.status === 'sent' || o.status === 'draft')) o.status = 'expired';
      l.ladder = q.ladder; l.plan = q.plan; l.modules = q.modules.slice(); l.value = quoteTotal(q);
      if (isOpen(l) && stageIndex(l.stage) < stageIndex('negotiation')) stageTo(data, l, t, 'negotiation');
    }
    return { ok: true };
  });
}

/** Book a meeting (demo). Booking moves an earlier lead to Demo scheduled and makes it the next follow-up. */
export function scheduleMeeting(id, { at, kind, title } = {}) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    if (!l) return missing;
    if (!(Number(at) > t)) return { ok: false, field: 'at', error: 'Pick a time later than now.' };
    const m = { id: 'MT-' + pad4(data.seq.meet++), kind: MEETING_KINDS.includes(kind) ? kind : MEETING_KINDS[0], title: String(title || '').trim() || 'Product demo', at: Number(at), by: who(), with: l.name, done: false, note: '' };
    l.meetings.push(m);
    act(data, l, t, 'meeting', `${m.title} booked for ${dm(m.at)} ${hm(m.at)} · ${m.kind}`);
    if (isOpen(l)) {
      l.next = { at: m.at, what: m.title };
      if (stageIndex(l.stage) < stageIndex('demo')) stageTo(data, l, t, 'demo');
    }
    return { ok: true, meeting: m };
  });
}
/** A meeting happened: its note goes on the lead; a demo moves the lead to Demo done. */
export function completeMeeting(id, meetingId, note) {
  return crm.commit((data, t) => {
    const l = find(data, id);
    const m = l && l.meetings.find((x) => x.id === meetingId);
    if (!m) return { ok: false, error: 'This meeting no longer exists.' };
    if (m.done) return { ok: false, error: 'Already marked done.' };
    m.done = true;
    m.note = String(note || '').trim();
    act(data, l, t, 'meeting', `${m.title} done${m.note ? ' · ' + m.note : ''}`);
    l.lastContact = t;
    if (l.next && l.next.at === m.at) l.next = null;
    if (l.stage === 'demo') stageTo(data, l, t, 'demodone');
    return { ok: true };
  });
}

/** Give the selected leads to one salesperson. */
export function bulkAssign(ids, owner) {
  if (!SALES_NAMES.includes(owner)) return { ok: false, field: 'owner', error: 'Pick a salesperson.' };
  return crm.commit((data, t) => {
    let n = 0;
    for (const id of ids) {
      const l = find(data, id);
      if (!l || l.owner === owner) continue;
      act(data, l, t, 'system', `Salesperson ${l.owner} → ${owner}`);
      l.owner = owner;
      n++;
    }
    return { ok: true, n };
  });
}
/** Move the selected leads to one stage (Lost needs a reason). Leads that became stores are skipped. */
export function bulkMove(ids, stage, reason) {
  if (!STAGES.some((s) => s.key === stage)) return { ok: false, field: 'stage', error: 'Pick a stage.' };
  if (stage === 'lost' && !String(reason || '').trim()) return { ok: false, field: 'reason', error: 'Pick why they were lost.' };
  let n = 0;
  let skipped = 0;
  for (const id of ids) { const r = moveStage(id, stage, { reason }); if (r.ok) n++; else skipped++; }
  return { ok: true, n, skipped };
}

// ---- import ---------------------------------------------------------------------------------------------------------
const HEAD = { name: 'name', lead: 'name', person: 'name', business: 'business', shop: 'business', company: 'business', mobile: 'mobile', phone: 'mobile',
  email: 'email', source: 'source', type: 'type', 'business type': 'type', category: 'category', district: 'district', software: 'software', 'current software': 'software',
  orders: 'orders', 'monthly orders': 'orders', modules: 'modules', 'interested modules': 'modules' };
function splitCsv(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',' || c === '\t') { out.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}
/**
 * Read pasted CSV (first line = headers: name, business, mobile, email, source, type, category, district, software,
 * orders, modules — "modules" separated by ";"). Each row comes back as { line, data, error } so the sheet can preview it.
 */
export function parseImport(text, existing = leads()) {
  const lines = String(text || '').split(/\r?\n/).filter((x) => x.trim());
  if (lines.length < 2) return { rows: [], error: 'Paste a header line and at least one lead.' };
  const head = splitCsv(lines[0]).map((h) => HEAD[h.toLowerCase()] || null);
  if (!head.includes('name') || !head.includes('mobile') || !head.includes('business')) return { rows: [], error: 'The first line needs at least the columns name, business and mobile.' };
  const seen = new Set();
  const rows = lines.slice(1).map((ln, i) => {
    const cells = splitCsv(ln);
    const d = {};
    head.forEach((k, j) => { if (k) d[k] = cells[j] || ''; });
    const mods = String(d.modules || '').split(/[;|]/).map((m) => m.trim()).filter(Boolean);
    const data = {
      name: d.name, business: d.business, mobile: d.mobile, email: d.email || '',
      source: SOURCES.find((s) => s.toLowerCase() === String(d.source || '').toLowerCase()) || 'Manual entry',
      type: TYPES.find((s) => s.toLowerCase() === String(d.type || '').toLowerCase()) || 'Online',
      category: CATEGORIES.find((s) => s.toLowerCase() === String(d.category || '').toLowerCase()) || CATEGORIES[0],
      district: d.district || 'Dhaka', software: d.software || SOFTWARE[0], orders: Number(String(d.orders || '0').replace(/[^\d]/g, '')) || 0,
      modules: mods.map((m) => INTEREST_MODULES.find((x) => x.toLowerCase() === m.toLowerCase())).filter(Boolean),
    };
    let bad = check(data, { leads: existing });
    const dg = digits(data.mobile);
    if (!bad && seen.has(dg)) bad = { field: 'mobile', error: 'Same number twice in this list.' };
    seen.add(dg);
    return { line: i + 2, data, error: bad ? bad.error : null };
  });
  return { rows, error: null };
}
/** Add the good rows of a parsed import, all to one salesperson. */
export function importLeads(rows, { owner } = {}) {
  return crm.commit((data, t) => {
    let added = 0;
    const skipped = [];
    for (const row of rows) {
      const f = { ...row.data, owner: SALES_NAMES.includes(owner) ? owner : SALES_NAMES[0] };
      const bad = check(f, data);
      if (bad) { skipped.push({ line: row.line, error: bad.error }); continue; }
      f.plan = f.orders < 300 ? 'growth' : f.orders < 1500 ? 'business' : 'enterprise';
      const l = blank(data, clean(f), t, who());
      act(data, l, t, 'system', `Imported by ${who()} · ${l.source}`);
      l.next = { at: startOfDay(t) + DAY + 11 * 3600e3, what: stageOf('new').next };
      data.leads.unshift(l);
      added++;
    }
    return { ok: added > 0, added, skipped, error: added ? null : 'No row could be added.' };
  });
}

// ---- convert ---------------------------------------------------------------------------------------------------------
/**
 * Turn a lead into a merchant: provisionStore (lib/platform/shops.js) with the form `f` (the same fields as Add merchant:
 * name, owner, phone, email, sub, segs, plan, trial, modules (add-on codes), cat, dist, src, by …). Its error comes back
 * as is ({ ok:false, field, error }). On success the lead is Won with the new store's id.
 */
export function convertToMerchant(id, f) {
  const l = leadById(id);
  if (!l) return missing;
  if (l.merchantId) return { ok: false, error: `Already store #${l.merchantId}.` };
  if (l.stage === 'lost') return { ok: false, error: 'Reopen the lead before converting it.' };
  const res = provisionStore(f);
  if (!res || !res.ok) return res || { ok: false, error: 'The store could not be created.' };
  crm.commit((data, t) => {
    const x = find(data, id);
    if (!x) return;
    x.merchantId = res.id;
    if (x.stage !== 'won') { x.wonAt = t; x.next = null; stageTo(data, x, t, 'won'); }
    if (f.plan && PLANS.includes(f.plan)) x.plan = f.plan;
    for (const q of x.quotes) if (q.status === 'sent' || q.status === 'draft') q.status = 'expired';
    act(data, x, t, 'system', `Converted to merchant #${res.id} · ${f.name} (${PLAN_NAME[f.plan] || f.plan}${f.trial ? ', 15-day trial' : ', paid from today'})`);
  });
  return { ok: true, id: res.id };
}
