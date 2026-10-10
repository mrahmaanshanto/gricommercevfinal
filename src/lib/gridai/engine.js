// Grid AI engine — the one orchestrator every part of GridCommerce uses (Inbox Copilot and Autopilot, Test AI, the
// merchant assistant, automations). A turn is a bounded workflow:
//   understand (language, intents, budget, product) → pick the agent → read knowledge → call tools → policy check →
//   write the answer → decide (send by itself · suggest · hand to a person) → meter the cost.
// Every turn returns a trace (steps), its sources, the tools it called, the model and tier, tokens and cost in taka.
//
//   customerTurn(conv, { sandbox, variant })      a reply for the last customer message(s) of a conversation
//   merchantTurn(question, user, { sandbox })     an answer for the shop team, from the shop's own data
//   summarize(conv)                               two or three lines about a conversation
//   langOf(text) · understand(text)               language and intents (Bangla, Banglish, English)
//   TOOLS                                         every tool: surface, risk level 1–4, the permission it needs
//
// Rules the engine keeps (brief §2): live shop data (price, stock, orders) always wins over documents; customer-facing
// tools only return public fields (never cost, supplier, margin, notes or other customers); a customer's order is only
// shown to the number it belongs to; nothing in a message can switch a tool on, change a price or raise a limit;
// a discount above the shop's limit, refunds and bulk sends always go to approval.
//
// Front end only: the "model" is simulated with rules and templates over the real demo data, so the behaviour, the
// trace, the routing and the cost model are what the server version will have; the wording is what changes.

import { getCatalog, stockAt, LOW_AT, isUntracked } from '../stock';
import { whyNotSellable } from '../sellable';
import { getOrders, isCounterSale } from '../orders';
import { getSales, getSaleLines, salesByChannel } from '../salesBook';
import { getLeads, followState } from '../leads';
import { getConvs, samePhone, firstName } from '../inbox';
import { canSee } from '../team';
import { formatBDT } from '../format';
import { aiAction, controlFor, getAiSettings } from '../aiReply';
import { getProfile, deliveryZones, paymentMethods } from './profile';
import { getEntries } from './knowledge';
import { getModels, tierOf, modelFor, costOf } from './models';
import { getAgents } from './agents';
import { meter, budgetState } from './usage';

const isBrowser = typeof window !== 'undefined';
const money = (n) => formatBDT(n);
let seq = 0;
const runId = () => 'RUN-' + Date.now().toString(36).toUpperCase() + (seq++).toString(36).toUpperCase();
const SHOP_DOMAIN = 'dazzleshop.com.bd';

// ---- tools ---------------------------------------------------------------------------------------------------------
// [id, label, surface (customer · merchant · both), risk 1 read · 2 draft · 3 low-risk action · 4 needs approval, area]
export const TOOLS = [
  ['search_products', 'Search products', 'both', 1, 'Products'], ['get_product_details', 'Product details', 'both', 1, 'Products'],
  ['check_stock', 'Check stock', 'both', 1, 'Inventory'], ['calculate_order_total', 'Order total and delivery', 'both', 1, 'Orders'],
  ['get_order_status', 'Order status', 'customer', 1, 'Orders'], ['create_order_draft', 'Order draft', 'customer', 2, 'Orders'],
  ['submit_confirmed_order', 'Place a confirmed order', 'customer', 3, 'Orders'], ['create_lead', 'Add a lead', 'both', 3, 'CRM'],
  ['update_lead', 'Update a lead', 'both', 3, 'CRM'], ['schedule_followup', 'Schedule a follow-up', 'both', 3, 'CRM'],
  ['request_human', 'Hand to a person', 'customer', 1, 'Inbox'], ['get_sales_summary', 'Sales summary', 'merchant', 1, 'Reports'],
  ['get_top_products', 'Best sellers', 'merchant', 1, 'Reports'], ['get_orders_waiting', 'Orders waiting', 'merchant', 1, 'Orders'],
  ['get_cancelled_orders', 'Cancelled orders', 'merchant', 1, 'Orders'], ['get_low_stock_products', 'Low stock', 'merchant', 1, 'Inventory'],
  ['get_followups_due', 'Follow-ups due', 'merchant', 1, 'CRM'], ['get_interested_not_ordered', 'Asked but didn’t order', 'merchant', 1, 'Inbox'],
  ['prepare_campaign', 'Draft a campaign', 'merchant', 2, 'Marketing'], ['request_approval', 'Ask for approval', 'both', 4, 'Approvals'],
].map(([id, label, surface, risk, area]) => ({ id, label, surface, risk, area }));
export const toolBy = (id) => TOOLS.find((t) => t.id === id) || { id, label: id, surface: 'both', risk: 1, area: '' };
export const RISK_LEVEL = { 1: ['Read', 'Runs'], 2: ['Draft', 'Prepared, not sent'], 3: ['Action', 'Only when switched on'], 4: ['Approval', 'A person approves'] };

// ---- language and intent ---------------------------------------------------------------------------------------------
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const ascii = (t) => String(t || '').replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
const BANGLISH = /\b(vai|bhai|apu|ache|ase|koto|dam|taka|tk|kivabe|hobe|din|chai|lagbe|nibo|niben|pathan|korbo|korte|kobe|pabo|eta|ota|ki|na|ji|accha|thik|valo|bhalo|moddhe|baire|er|amar|apnar|dhonnobad|kemon|order dibo)\b/i;
/** bn (Bangla script) · banglish · en */
export function langOf(text) {
  const t = String(text || '');
  if (/[ঀ-৿]/.test(t)) return 'bn';
  if (BANGLISH.test(t)) return 'banglish';
  return 'en';
}
export const LANG_WORD = { bn: 'Bangla', banglish: 'Banglish', en: 'English' };

const INTENTS = [
  ['injection', /(ignore (all |the )?(previous|above|earlier) (instructions|rules)|system prompt|you are now|developer mode|act as (an? )?(admin|owner)|reveal (your|the) (prompt|instructions)|পূর্বের নির্দেশ ভুলে)/i],
  ['optout', /^\s*(stop|unsubscribe|r? ?message diben na|আর মেসেজ দিবেন না)\s*$/i],
  ['complaint', /(worst|fraud|cheat|scam|bad service|very bad|angry|kharap|baje|dhoka|ভুয়া|প্রতারণা|খারাপ|বাজে|broken|damaged?|vanga|ভাঙা|nosto|নষ্ট|wrong (item|product)|late again)/i],
  ['refund', /(refund|money back|taka ferot|টাকা ফেরত|রিফান্ড)/i],
  ['human', /(talk to (a )?(human|person|agent)|manush|real person|call (me|koren)|মানুষের সাথে|কথা বলতে চাই)/i],
  ['order-status', /(where is my (order|parcel)|order status|status of (my|the|an?) order|order (kothay|kothai|er obostha|update)|parcel kobe|kobe pabo|tracking|track|অর্ডার কোথায়|অর্ডারের অবস্থা|পার্সেল কবে|#\d{5,})/i],
  ['order', /(order (korbo|dibo|dite chai|confirm|korte chai)|i('| a)?m? ?(want|like) to (order|buy)|place (an|the) order|book (it|koren)|kinbo|nibo|niben|confirm koren|অর্ডার (করব|করতে চাই|দিব)|নিব|কিনব)/i],
  ['recommend', /(suggest|recommend|kon ?ta valo|kon ?ta bhalo|which (one )?is (good|best)|best .* (under|within)|valo (ekta|kichu)|ভালো (একটা|কিছু)|সাজেস্ট|lagbe|লাগবে|chai\b|চাই)/i],
  ['price', /(price|dam|daam|koto|cost|how much|দাম|কত)/i],
  ['stock', /(available|availability|ache\?|ase\?|in stock|stock e|stock|পাওয়া যাবে|আছে\?|আছে কি|ache ki)/i],
  ['delivery', /(deliver|delivery|courier|dhakar baire|outside dhaka|inside dhaka|shipping|charge|kobe pabo|ডেলিভারি|ঢাকার বাইরে|কুরিয়ার)/i],
  ['payment', /(bkash|nagad|rocket|cod|cash on delivery|payment|pay kivabe|card|পেমেন্ট|বিকাশ|নগদ|ক্যাশ অন)/i],
  ['warranty', /(warranty|guarantee|original|authentic|ওয়ারেন্টি|গ্যারান্টি|অরিজিনাল)/i],
  ['return', /(return|exchange|bodol|change kora|ferot dibo|রিটার্ন|এক্সচেঞ্জ|বদল)/i],
  ['greeting', /^\s*(hi+|hello|hey|salam|assalam[ua] ?alaikum|aslm|হ্যালো|আসসালামু|সালাম)\b/i],
  ['thanks', /^\s*(thanks?|thank you|dhonnobad|ধন্যবাদ|ok+|okay|thik ache|👍|❤️)\W*\s*$/i],
];
const CATS = [
  ['Wearables', /(watch|ghori|ghori|ঘড়ি|smart ?band|band\b|wearable)/i],
  ['Audio', /(earbud|earphone|headphone|airpod|speaker|neckband|ইয়ারবাড|হেডফোন)/i],
  ['Power banks', /(power ?bank|পাওয়ার ব্যাংক)/i],
  ['Phones', /(phone|mobile|smartphone|ফোন|মোবাইল|redmi|galaxy|iphone|realme|symphony)/i],
  ['Accessories', /(charger|cable|adapter|case|cover|glass|protector|holder|otg|chargar|চার্জার|কভার)/i],
];
const BUDGET_WORDS = /(moddhe|moddhe|within|under|below|er niche|budget|maximum|max|মধ্যে|এর নিচে|বাজেট|bajet)/i;
/** Money the customer names as a budget, in taka (2k, 2,000 tk, ২০০০ টাকা …). */
export function budgetOf(text) {
  const t = ascii(text).toLowerCase();
  const m = t.match(/(\d[\d,]*(?:\.\d+)?)\s*(k|hajar|হাজার)?\s*(tk|taka|টাকা|৳|bdt)?/g);
  if (!m) return 0;
  let best = 0;
  m.forEach((s) => {
    const mm = s.match(/(\d[\d,]*(?:\.\d+)?)\s*(k|hajar|হাজার)?\s*(tk|taka|টাকা|৳|bdt)?/);
    let n = parseFloat(mm[1].replace(/,/g, '')) || 0;
    if (mm[2]) n *= 1000;
    const money = !!mm[3] || !!mm[2] || BUDGET_WORDS.test(t);
    if (money && n >= 100 && n < 10000000 && !/^0?1\d{9}$/.test(mm[1])) best = Math.max(best, n);
  });
  return best;
}
const sellableRows = () => getCatalog().filter((r) => !whyNotSellable(r, 'online'));
/** A product the text names (best word overlap), else none. */
export function productIn(text, rows = sellableRows()) {
  const words = ascii(text).toLowerCase();
  let best = null, score = 0;
  rows.forEach((r) => {
    const tokens = (r.name + ' ' + (r.variant || '')).toLowerCase().split(/[\s·/,()]+/).filter((w) => w.length >= 3 && !/^(the|and|for|with|pro|max|black|blue|grey|white)$/.test(w));
    const hit = tokens.filter((w) => words.includes(w)).length;
    const s = hit + (words.includes(r.name.toLowerCase()) ? 3 : 0);
    if (hit && s > score) { score = s; best = r; }
  });
  return best;
}
/** What a message is about. */
export function understand(text) {
  const t = String(text || '');
  const intents = INTENTS.filter(([, re]) => re.test(t)).map(([k]) => k);
  const cat = (CATS.find(([, re]) => re.test(t)) || [''])[0];
  const budget = budgetOf(t);
  if (budget && cat && !intents.includes('recommend')) intents.push('recommend');
  if (!intents.length && cat) intents.push('recommend');
  const phone = (ascii(t).match(/(?:\+?88)?(01[3-9]\d{8})/) || [])[1] || '';
  const orderNo = (t.match(/#(\d{5,})/) || [])[1] || '';
  // greetings and thanks matter only when nothing else was asked
  const main = intents.filter((k) => !['greeting', 'thanks'].includes(k));
  return { intents: main.length ? main : intents, lang: langOf(t), cat, budget, phone, orderNo, product: productIn(t) };
}

// ---- tools that read the shop --------------------------------------------------------------------------------------
const band = (avail) => (avail <= 0 ? 'out' : avail <= LOW_AT ? 'low' : 'in');
const BAND_WORD = { in: 'In stock', low: 'Few left', out: 'Out of stock' };
/** Public fields only: what a customer may see about a product. */
function publicRow(r) {
  const avail = isUntracked(r) ? 99 : stockAt(r.sku).available;
  return { sku: r.sku, name: r.name, variant: r.variant || '', cat: r.cat, price: Number(r.price) || 0, stock: band(avail), link: 'https://' + SHOP_DOMAIN + '/p/' + r.sku.toLowerCase(), image: r.image || '' };
}
function searchProducts({ cat = '', max = 0, query = '', limit = 3 }) {
  let rows = sellableRows();
  if (cat) rows = rows.filter((r) => r.cat === cat);
  if (query) { const q = query.toLowerCase(); rows = rows.filter((r) => r.name.toLowerCase().includes(q)); }
  const all = rows.map(publicRow).filter((p) => p.stock !== 'out');
  const within = max ? all.filter((p) => p.price <= max).sort((a, b) => b.price - a.price) : all.sort((a, b) => a.price - b.price);
  const closest = max && !within.length ? all.filter((p) => p.price > max).sort((a, b) => a.price - b.price).slice(0, 1) : [];
  return { found: within.slice(0, limit), closest, total: within.length };
}
function zones() { try { return deliveryZones(); } catch { return [{ name: 'Inside Dhaka', charge: 70, from: 1, to: 2, unit: 'Days' }, { name: 'Outside Dhaka', charge: 150, from: 3, to: 5, unit: 'Days' }]; } }
function orderStatusFor(phone) {
  if (!phone) return null;
  const mine = getOrders().filter((o) => !isCounterSale(o) && samePhone(o.phone, phone)).sort((a, b) => b.at - a.at);
  return mine[0] || null;
}

// ---- knowledge -------------------------------------------------------------------------------------------------------
const KB_FOR = { delivery: ['delivery', 'faq'], payment: ['payments', 'faq'], warranty: ['warranty', 'faq'], return: ['returns', 'policies'], refund: ['returns', 'policies'], price: ['sales', 'campaign'], recommend: ['products', 'campaign'], stock: ['products'], order: ['delivery', 'payments'], complaint: ['policies'], 'order-status': ['delivery'] };
function retrieve(text, intents, allowed = []) {
  const want = new Set(intents.flatMap((k) => KB_FOR[k] || []));
  const words = ascii(text).toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const now = Date.now();
  return getEntries()
    .filter((e) => (!e.until || e.until > now) && (!allowed.length || allowed.includes(e.category)))
    .map((e) => {
      const hay = (e.title + ' ' + e.text).toLowerCase();
      const s = (want.has(e.category) ? 2 : 0) + words.filter((w) => hay.includes(w)).length + (e.category === 'custom' ? 0.5 : 0);
      return { e, s };
    })
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ e }) => ({ id: e.id, title: e.title, category: e.category, text: e.text }));
}

// ---- writing ---------------------------------------------------------------------------------------------------------
// one sentence per language: [en, banglish, bn]
const L = (lang, en, bl, bn) => (lang === 'bn' ? bn : lang === 'banglish' ? bl : en);
const pList = (lang, ps) => ps.map((p, i) => `${i + 1}) ${p.name}${p.variant ? ' (' + p.variant + ')' : ''} — ${money(p.price)}${p.stock === 'low' ? L(lang, ' · few left', ' · alpo ache', ' · অল্প আছে') : ''}`).join('\n');

/** The customer's recent words: their messages after the shop's last reply (at most 3). */
function pending(conv) {
  const msgs = (conv && conv.messages) || [];
  const out = [];
  for (let i = msgs.length - 1; i >= 0 && out.length < 3; i--) {
    const m = msgs[i];
    if (m.from === 'agent') break;
    if (m.from === 'customer' && m.text) out.unshift(m.text);
  }
  if (!out.length) { const last = [...msgs].reverse().find((m) => m.from === 'customer' && m.text); if (last) out.push(last.text); }
  return out.join('\n');
}
/** The product the conversation is about: a product card sent, else the last one named. */
function productInConv(conv) {
  const msgs = (conv && conv.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.type === 'product' && m.sku) { const r = getCatalog().find((x) => x.sku === m.sku); if (r) return r; }
    if (m.text) { const p = productIn(m.text); if (p) return p; }
  }
  return null;
}
/** What the customer has told us for an order: name, phone, address, area. */
function orderFields(conv) {
  const text = ((conv && conv.messages) || []).filter((m) => m.from === 'customer' && m.text).map((m) => m.text).join('\n');
  const phone = (ascii(text).match(/(?:\+?88)?(01[3-9]\d{8})/) || [])[1] || (conv && conv.phone) || '';
  const addr = (text.match(/^.*(road|rd\b|house|flat|sector|block|lane|para|bazar|thana|upazila|district|বাসা|রোড|সেক্টর|ব্লক|থানা|জেলা).*$/im) || [])[0] || '';
  const named = (text.match(/(?:amar nam|my name is|name:|নাম[:ঃ]?)\s*([A-Za-zঀ-৿ .]{3,30})/i) || [])[1] || '';
  const outside = /(dhakar baire|outside dhaka|ঢাকার বাইরে|chittagong|chattogram|sylhet|rajshahi|khulna|barisal|rangpur|mymensingh|comilla|cumilla|bogura|চট্টগ্রাম|সিলেট)/i.test(text);
  const zone = outside ? 'Outside Dhaka' : /(dhaka|dhanmondi|mirpur|uttara|gulshan|banani|mohammadpur|badda|ঢাকা)/i.test(text) ? 'Inside Dhaka' : '';
  return { name: named.trim() || ((conv && conv.name) || ''), phone, address: addr.trim(), zone };
}

/** The decision: send by itself, suggest, or hand to a person. */
function decide(conv, u, agent, sandbox) {
  const aiIntent = { 'order-status': 'order-status', order: 'price', price: 'price', stock: 'stock', delivery: 'delivery', payment: 'payment', return: 'return', complaint: 'complaint', refund: 'refund', recommend: 'price', warranty: 'return' }[u.intents[0]] || '';
  if (['complaint', 'refund', 'human'].includes(u.intents[0])) return { act: 'person', reason: u.intents[0] === 'human' ? 'The customer asked for a person' : 'Complaints and refunds go to a person' };
  if (u.intents[0] === 'injection') return { act: 'suggest', reason: 'The message tried to change the AI’s rules; a person checks the reply' };
  if (!agent || !agent.on) return { act: 'suggest', reason: 'This agent is off: the reply waits for a person' };
  const ctl = controlFor({ conv }, getAiSettings());
  if (conv && conv.autopilot === false) return { act: 'suggest', reason: 'A person took over this conversation' };
  if (ctl.mode === 'off' && !(conv && conv.autopilot)) return { act: 'off', reason: 'AI is off for this ' + ctl.from };
  if (isBrowser && !sandbox) { const b = budgetState(); if (b.state === 'over' && b.atLimit === 'copilot') return { act: 'suggest', reason: 'The month’s AI budget is used up: Copilot only' }; }
  const aiTurns = ((conv && conv.messages) || []).filter((m) => m.ai && m.from === 'agent').length;
  // Autopilot switched on for this chat (or Auto for its channel) answers by itself even when the shop default is Assist;
  // the allowed intents, office hours and the hand-over count still apply
  const settings = getAiSettings();
  const auto = (conv && conv.autopilot) || ctl.mode === 'auto';
  const a = aiAction({ intent: aiIntent, aiTurns }, auto && (settings.mode === 'suggest' || settings.mode === 'off') ? { ...settings, mode: 'auto' } : settings);
  if (auto) return a.act === 'off' ? { act: 'suggest', reason: a.reason } : a;
  return { act: 'suggest', reason: 'Assist: the AI writes, a person sends' };
}

const AGENT_FOR = { recommend: 'sales', price: 'sales', stock: 'sales', order: 'order', 'order-status': 'order', delivery: 'support', payment: 'support', warranty: 'support', return: 'support', refund: 'support', complaint: 'support', human: 'support', greeting: 'support', thanks: 'support', injection: 'support', optout: 'support' };
const TASK_FOR = { recommend: 'recommend', price: 'sell', stock: 'sell', order: 'order', 'order-status': 'faq', delivery: 'faq', payment: 'faq', warranty: 'faq', return: 'faq', refund: 'complaint', complaint: 'complaint', human: 'greeting', greeting: 'greeting', thanks: 'greeting', optout: 'optout', injection: 'faq' };

/**
 * A reply for a conversation. Returns the run: { id, at, surface, agent, intents, lang, steps, sources, tools, products,
 * order, lead, reply, decision, tier, model, tokensIn, tokensOut, cost, ms, confidence }.
 */
export function customerTurn(conv, { sandbox = false, variant = 0, text: given } = {}) {
  const t0 = Date.now();
  const text = given != null ? given : pending(conv);
  const u = understand(text);
  const lang = u.lang;
  const prof = getProfile();
  const name = firstName((conv && conv.name) || '');
  const agents = getAgents();
  const primary = u.intents[0] || 'other';
  const agent = agents.find((a) => a.id === (AGENT_FOR[primary] || 'support')) || agents[0];
  const steps = [];
  const tools = [];
  const call = (id, detail, ok = true) => { tools.push(id); steps.push({ kind: 'tool', label: toolBy(id).label, detail, ok, risk: toolBy(id).risk }); };
  steps.push({ kind: 'input', label: 'Message received', detail: text ? '“' + text.replace(/\n/g, ' · ').slice(0, 140) + '”' : 'No message from the customer yet' });
  const conf = u.intents.length ? (u.intents.length > 2 ? 0.74 : 0.9) : 0.55;
  steps.push({ kind: 'understand', label: 'Understood', detail: [u.intents.length ? u.intents.map((k) => INTENT_WORD[k] || k).join(' + ') : 'Not sure', LANG_WORD[lang], u.budget ? 'budget ' + money(u.budget) : '', u.cat ? u.cat : '', 'confidence ' + Math.round(conf * 100) + '%'].filter(Boolean).join(' · ') });
  steps.push({ kind: 'agent', label: 'Agent: ' + agent.name, detail: agent.on ? agent.purpose : 'This agent is switched off' });

  // knowledge
  const sources = retrieve(text, u.intents, agent.knowledge);
  if (u.intents.some((k) => ['delivery', 'order'].includes(k))) sources.unshift({ id: 'B-delivery', title: 'Delivery settings', category: 'delivery', text: prof.deliveryTime, live: true });
  if (u.intents.includes('payment')) sources.unshift({ id: 'B-payments', title: 'Payment settings', category: 'payments', text: prof.payments.join(', '), live: true });
  if (u.intents.some((k) => ['return', 'refund', 'warranty', 'complaint'].includes(k))) sources.unshift({ id: 'B-policies', title: 'Shop policies', category: 'policies', text: [prof.returnRules, prof.refundRules, prof.warrantyRules].join(' '), live: true });
  steps.push({ kind: 'knowledge', label: 'Knowledge', detail: sources.length ? sources.map((s) => s.title + (s.live ? ' (live)' : '')).join(' · ') : 'Nothing needed' });

  // tools and the answer, intent by intent
  const parts = [];
  let products = [];
  let order = null;
  let lead = null;
  let handover = false;
  const product = u.product || (/\b(eta|eita|this|it|ota|এটা|এইটা)\b/i.test(text) || u.intents.some((k) => ['price', 'stock', 'order'].includes(k)) ? productInConv(conv) : null);
  const pub = product ? publicRow(product) : null;
  const z = zones();
  const zoneLine = (lg) => z.map((x) => `${x.name} ${money(x.charge)} (${x.from}–${x.to} ${L(lg, 'days', 'din', 'দিন')})`).join(', ');

  if (u.intents.includes('injection')) {
    steps.push({ kind: 'policy', label: 'Blocked an instruction', detail: 'The message asked the AI to ignore its rules. Rules come only from the shop’s settings.', ok: false });
    parts.push(L(lang, 'I can help with our products, prices, delivery and your orders. What would you like to know?', 'Ami product, dam, delivery ar apnar order niye help korte pari. Ki janate chan?', 'আমি পণ্য, দাম, ডেলিভারি আর আপনার অর্ডার নিয়ে সাহায্য করতে পারি। কী জানতে চান?'));
  }
  if (u.intents.includes('optout')) {
    steps.push({ kind: 'policy', label: 'Opt-out', detail: 'No more marketing messages to this customer (consent updated)' });
    parts.push(L(lang, 'Done. We won’t send you offers any more. You can still message us any time.', 'Thik ache, ar offer pathabo na. Dorkar hole jekono shomoy message korben.', 'ঠিক আছে, আর অফার পাঠাব না। দরকার হলে যেকোনো সময় মেসেজ করবেন।'));
  }
  if (u.intents.includes('recommend')) {
    const r = searchProducts({ cat: u.cat, max: u.budget, limit: (prof.products && prof.products.max) || 3 });
    call('search_products', [u.cat || 'all categories', u.budget ? 'up to ' + money(u.budget) : '', 'in stock'].filter(Boolean).join(' · ') + ' → ' + (r.found.length ? r.found.length + ' found' : 'none'));
    products = r.found;
    if (r.found.length) {
      parts.push(L(lang, `Here ${r.found.length === 1 ? 'is a' : 'are ' + r.found.length} ${(u.cat || 'option').toLowerCase()}${r.found.length === 1 ? '' : 's'}${u.budget ? ' within ' + money(u.budget) : ''}:\n`, `${u.budget ? money(u.budget) + ' er moddhe ' : ''}ei ${r.found.length} ta bhalo option ache:\n`, `${u.budget ? money(u.budget) + '-এর মধ্যে ' : ''}এই ${r.found.length}টি ভালো অপশন আছে:\n`) + pList(lang, r.found));
      parts.push(L(lang, 'Shall I send pictures and details of one of them?', 'Konta pochondo? Chobi ar details pathabo?', 'কোনটা পছন্দ? ছবি আর বিস্তারিত পাঠাব?'));
    } else if (r.closest.length) {
      products = r.closest;
      const c = r.closest[0];
      parts.push(L(lang, `We don’t have a ${(u.cat || 'product').toLowerCase()} within ${money(u.budget)} right now. The closest is ${c.name} at ${money(c.price)}.`, `${money(u.budget)} er moddhe ekhon kono ${(u.cat || 'product').toLowerCase()} nei. Shobcheye kachakachi ${c.name}, dam ${money(c.price)}.`, `${money(u.budget)}-এর মধ্যে এখন কোনো ${u.cat || 'পণ্য'} নেই। সবচেয়ে কাছাকাছি ${c.name}, দাম ${money(c.price)}।`));
    } else {
      parts.push(L(lang, 'I couldn’t find that in stock right now. I’ll ask the team and get back to you.', 'Eta ekhon stock e pacchi na. Team ke jiggesh kore janacchi.', 'এটা এখন স্টকে পাচ্ছি না। টিমকে জিজ্ঞেস করে জানাচ্ছি।'));
      handover = true;
    }
  }
  if (pub && (u.intents.includes('price') || u.intents.includes('stock')) && !u.intents.includes('recommend')) {
    call('get_product_details', pub.name);
    call('check_stock', pub.name + ' → ' + BAND_WORD[pub.stock]);
    products = [pub];
    if (pub.stock === 'out') {
      const alt = searchProducts({ cat: pub.cat, max: Math.round(pub.price * 1.2), limit: 1 }).found.filter((p) => p.sku !== pub.sku);
      parts.push(L(lang, `Sorry, ${pub.name} is out of stock right now.`, `Dukkhito, ${pub.name} ekhon stock e nei.`, `দুঃখিত, ${pub.name} এখন স্টকে নেই।`) + (alt[0] ? L(lang, ` A similar one: ${alt[0].name} at ${money(alt[0].price)}.`, ` Kachakachi option: ${alt[0].name}, ${money(alt[0].price)}.`, ` কাছাকাছি অপশন: ${alt[0].name}, ${money(alt[0].price)}।`) : ''));
      if (alt[0]) products = [pub, alt[0]];
    } else {
      parts.push(L(lang, `${pub.name} is ${money(pub.price)}${u.intents.includes('stock') || u.intents.includes('price') ? ' and ' + (pub.stock === 'low' ? 'only a few are left' : 'it is in stock') : ''}.`, `${pub.name} er dam ${money(pub.price)}, ${pub.stock === 'low' ? 'alpo kichu ache' : 'stock e ache'}.`, `${pub.name}-এর দাম ${money(pub.price)}, ${pub.stock === 'low' ? 'অল্প কিছু আছে' : 'স্টকে আছে'}।`));
    }
  } else if (!pub && (u.intents.includes('price') || u.intents.includes('stock')) && !u.intents.includes('recommend')) {
    parts.push(L(lang, 'Which product do you mean? Send the name or a picture and I’ll check the price and stock.', 'Kon product ta? Nam ba chobi pathan, dam ar stock dekhe janacchi.', 'কোন পণ্যটা? নাম বা ছবি পাঠান, দাম আর স্টক দেখে জানাচ্ছি।'));
  }
  // a link to the product page (the shop's own domain only)
  if (/\b(link|url)\b|লিংক|লিঙ্ক/i.test(text) && (pub || products[0]) && getProfile().shareLinks !== false) {
    const lp = pub || products[0];
    parts.push(L(lang, 'Here is the link: ' + lp.link, 'Link: ' + lp.link, 'লিংক: ' + lp.link));
  }
  if (u.intents.includes('delivery')) {
    call('calculate_order_total', 'Delivery zones from Settings › Delivery');
    parts.push(L(lang, `Yes, we deliver all over Bangladesh: ${zoneLine(lang)}. Cash on delivery is available.`, `Ji, shara Bangladesh e delivery hoy: ${zoneLine(lang)}. Cash on delivery ache.`, `জি, সারা বাংলাদেশে ডেলিভারি হয়: ${zoneLine(lang)}। ক্যাশ অন ডেলিভারি আছে।`));
  }
  if (u.intents.includes('payment')) parts.push(L(lang, `You can pay by ${prof.payments.join(', ')}.`, `Payment korte parben: ${prof.payments.join(', ')}.`, `পেমেন্ট করতে পারবেন: ${prof.payments.join(', ')}।`));
  if (u.intents.includes('warranty')) parts.push(L(lang, prof.warrantyRules, 'Product gulo original. ' + prof.warrantyRules, 'সব পণ্য অরিজিনাল। ' + prof.warrantyRules));
  if (u.intents.includes('return')) parts.push(L(lang, prof.returnRules, prof.returnRules, prof.returnRules));
  if (u.intents.includes('order-status')) {
    const phone = u.phone || (conv && conv.phone) || '';
    const verified = !!phone && !!conv && (!u.phone || samePhone(u.phone, conv.phone));
    const o = verified ? orderStatusFor(phone) : null;
    call('get_order_status', verified ? (o ? o.id + ' · ' + o.status : 'No order on this number') : 'Number not verified: not shown', verified);
    if (!verified) parts.push(L(lang, 'Please send the phone number you ordered with and I’ll check your order.', 'Je number diye order korechen seta pathan, order check kore janacchi.', 'যে নম্বর দিয়ে অর্ডার করেছেন সেটা পাঠান, অর্ডার চেক করে জানাচ্ছি।'));
    else if (o) parts.push(L(lang, `Your order ${o.id} is ${o.status}.${o.consignment && o.consignment !== '—' ? ' Tracking: ' + o.consignment + '.' : ''}`, `Apnar order ${o.id} ekhon ${o.status}.${o.consignment && o.consignment !== '—' ? ' Tracking: ' + o.consignment + '.' : ''}`, `আপনার অর্ডার ${o.id} এখন ${o.status}।${o.consignment && o.consignment !== '—' ? ' ট্র্যাকিং: ' + o.consignment + '।' : ''}`));
    else parts.push(L(lang, 'I can’t find an order on this number. Did you order with another number?', 'Ei number e kono order pacchi na. Onno number diye order korechen?', 'এই নম্বরে কোনো অর্ডার পাচ্ছি না। অন্য নম্বর দিয়ে অর্ডার করেছেন?'));
  }
  if (u.intents.includes('order')) {
    const f = orderFields(conv);
    const item = pub || (products[0] || null);
    const missing = [!item && 'product', !f.name && 'name', !f.phone && 'phone', !f.address && 'address'].filter(Boolean);
    const zone = z.find((x) => x.name === (f.zone || 'Inside Dhaka')) || z[0];
    order = { item, qty: 1, ...f, zone: zone.name, delivery: zone.charge, payment: 'Cash on delivery', subtotal: item ? item.price : 0, total: item ? item.price + zone.charge : 0, missing };
    call('create_order_draft', missing.length ? 'Still needed: ' + missing.join(', ') : 'Ready: ' + money(order.total) + ' with delivery');
    if (missing.length) parts.push(L(lang, `To place the order, please send your ${missing.filter((m) => m !== 'product').join(', ')}${missing.includes('product') ? ' and the product you want' : ''}.`, `Order korte ${missing.filter((m) => m !== 'product').map((m) => ({ name: 'nam', phone: 'phone number', address: 'full address (district, area)' }[m])).join(', ')}${missing.includes('product') ? ' ar kon product' : ''} pathan please.`, `অর্ডার করতে ${missing.filter((m) => m !== 'product').map((m) => ({ name: 'নাম', phone: 'ফোন নম্বর', address: 'পুরো ঠিকানা (জেলা, এলাকা)' }[m])).join(', ')}${missing.includes('product') ? ' আর কোন পণ্য' : ''} পাঠান।`));
    else parts.push(L(lang, `Here is your order: ${item.name} × 1 = ${money(item.price)}, delivery ${money(zone.charge)}, total ${money(order.total)}, cash on delivery to ${f.address}. Shall I confirm it?`, `Apnar order: ${item.name} × 1 = ${money(item.price)}, delivery ${money(zone.charge)}, mot ${money(order.total)}, cash on delivery, thikana ${f.address}. Confirm korbo?`, `আপনার অর্ডার: ${item.name} × ১ = ${money(item.price)}, ডেলিভারি ${money(zone.charge)}, মোট ${money(order.total)}, ক্যাশ অন ডেলিভারি, ঠিকানা ${f.address}। কনফার্ম করব?`));
  }
  if (u.intents.includes('complaint') || u.intents.includes('refund') || u.intents.includes('human')) {
    handover = true;
    call('request_human', u.intents.includes('human') ? 'The customer asked for a person' : 'Complaint or refund');
    parts.push(L(lang, u.intents.includes('human') ? 'Sure, someone from our team will reply here shortly.' : `I’m sorry about this, ${name}. I’ve passed it to our team and someone will reply here shortly.`, u.intents.includes('human') ? 'Ji, amader team er ekjon ekhuni reply korben.' : `Dukkhito ${name}. Amader team ke janiye diyechi, ekjon ekhuni reply korben.`, u.intents.includes('human') ? 'জি, আমাদের টিমের একজন এখনই উত্তর দেবেন।' : `দুঃখিত ${name}। আমাদের টিমকে জানিয়েছি, একজন এখনই উত্তর দেবেন।`));
  }
  if (!parts.length) {
    if (u.intents.includes('thanks')) parts.push(L(lang, `You’re welcome, ${name}! Anything else I can help with?`, `Apnake o dhonnobad ${name}! Ar kichu lagbe?`, `আপনাকেও ধন্যবাদ ${name}! আর কিছু লাগবে?`));
    else if (u.intents.includes('greeting') || !text) parts.push(L(lang, `Hello ${name}! How can I help you today?`, `Assalamu alaikum ${name}! Kivabe help korte pari?`, `আসসালামু আলাইকুম ${name}! কীভাবে সাহায্য করতে পারি?`));
    else { handover = true; parts.push(L(lang, 'Let me check this with the team and get back to you.', 'Team er sathe check kore janacchi.', 'টিমের সাথে কথা বলে জানাচ্ছি।')); }
  }

  // a lead: buying interest from someone who isn't already a lead
  if (u.intents.some((k) => ['recommend', 'price', 'stock', 'order'].includes(k)) && conv && conv.phone && !getLeads().some((l) => samePhone(l.phone, conv.phone))) {
    const p = products[0] || pub;
    lead = { name: conv.name, phone: conv.phone, interest: p ? p.name : (u.cat || 'Products'), value: p ? p.price : u.budget || 0, source: ({ facebook: 'Facebook', instagram: 'Instagram', whatsapp: 'WhatsApp' })[conv.ch] || 'Website' };
    steps.push({ kind: 'tool', label: 'Lead spotted', detail: lead.interest + (lead.value ? ' · ' + money(lead.value) : '') + ' · not added until a person accepts', ok: true, risk: 3 });
  }

  // policy
  const disc = /(discount|less|kom kore|কম করে|ছাড়)/i.test(text);
  steps.push({ kind: 'policy', label: 'Policy check', detail: ['Customer tools return public fields only', disc ? 'No discount offered (limit ' + money(prof.maxDiscount || 0) + '; more needs approval)' : '', order && !order.missing.length ? 'Order waits for the customer’s yes' : '', 'Links only to ' + SHOP_DOMAIN].filter(Boolean).join(' · '), ok: true });

  // model, routing and cost
  // Regenerate: another wording (a personal opening, or the parts as one paragraph)
  const opener = variant % 3 === 1 ? L(lang, `Hi ${name}! `, `${name}, `, `${name}, `) : '';
  const reply = opener + (variant % 3 === 2 ? parts.join(' ') : parts.join('\n\n'));
  const task = TASK_FOR[primary] || 'faq';
  const tier = handover && primary === 'complaint' ? 3 : tierOf(task);
  const model = modelFor(tier);
  const tokensIn = tier ? Math.round(900 + text.length / 3 + sources.reduce((a, s) => a + s.text.length, 0) / 4 + products.length * 60 + tools.length * 80) : 0;
  const tokensOut = tier ? Math.round(reply.length / 3.6 + 30) : 0;
  const cost = Math.round(costOf(model, tokensIn, tokensOut) * 100) / 100;
  steps.push({ kind: 'model', label: tier ? 'Reply written' : 'Answered by a rule', detail: tier ? `${model.name}${model.fallback ? ' (fallback)' : ''} · tier ${tier} · ${tokensIn.toLocaleString('en-IN')} in / ${tokensOut} out · ৳${cost.toFixed(2)}` : 'No model needed · ৳0' });
  const decision = handover ? { act: 'person', reason: 'Handed to a person' } : decide(conv, u, agent, sandbox);
  steps.push({ kind: 'decision', label: { auto: 'Sent by GridAI', suggest: 'Suggested to a person', person: 'Handed to a person', off: 'AI is off' }[decision.act], detail: decision.reason });
  const run = {
    id: runId(), at: Date.now(), surface: 'customer', agent: agent.id, agentName: agent.name, intents: u.intents, intent: primary, lang, budget: u.budget, cat: u.cat,
    steps, sources, tools, products, order, lead, reply, decision, tier, model: model.name, tokensIn, tokensOut, cost, ms: 900 + Math.round(tokensIn / 4),
    confidence: conf, conv: conv ? conv.id : '', channel: conv ? conv.ch : 'test', outcome: decision.act === 'auto' ? 'auto' : decision.act === 'person' ? 'person' : 'suggest', sandbox,
  };
  run.ms = Math.max(run.ms, Date.now() - t0);
  return meter(run);
}
const INTENT_WORD = { recommend: 'Product suggestion', price: 'Price', stock: 'Stock', delivery: 'Delivery', payment: 'Payment', warranty: 'Warranty', return: 'Return', refund: 'Refund', complaint: 'Complaint', order: 'Wants to order', 'order-status': 'Order status', human: 'Wants a person', greeting: 'Greeting', thanks: 'Thanks', injection: 'Tried to change the rules', optout: 'Opt-out' };
export { INTENT_WORD };

/** Two or three lines about a conversation for the customer panel and hand-overs. */
export function summarize(conv) {
  const msgs = (conv && conv.messages) || [];
  const said = msgs.filter((m) => m.from === 'customer' && m.text).map((m) => m.text);
  if (!said.length) return { lines: ['No messages from the customer yet.'], intents: [], products: [], mood: 'neutral' };
  const all = said.join('\n');
  const u = understand(all);
  const prods = [...new Set(said.map((t) => productIn(t)).filter(Boolean).map((p) => p.name))].slice(0, 3);
  const mood = u.intents.includes('complaint') ? 'unhappy' : /(thanks|dhonnobad|ধন্যবাদ|great|valo|❤️|👍)/i.test(all) ? 'happy' : 'neutral';
  const lines = [];
  lines.push((u.intents.length ? 'Asked about ' + u.intents.filter((k) => !['greeting', 'thanks'].includes(k)).map((k) => (INTENT_WORD[k] || k).toLowerCase()).join(', ') : 'Chatting') + (prods.length ? ' — ' + prods.join(', ') : u.cat ? ' — ' + u.cat.toLowerCase() : '') + (u.budget ? ', budget ' + money(u.budget) : '') + '.');
  const lastOut = [...msgs].reverse().find((m) => m.from === 'agent');
  const lastIn = [...msgs].reverse().find((m) => m.from === 'customer');
  lines.push(lastIn && (!lastOut || lastIn.at > lastOut.at) ? 'Waiting for our reply.' : 'We replied last' + (lastOut && lastOut.ai ? ' (GridAI).' : '.'));
  if (mood === 'unhappy') lines.push('Customer is unhappy: handle with care.');
  else if (u.intents.includes('order')) lines.push('Ready to order: collect the details and confirm.');
  return { lines, intents: u.intents, products: prods, mood, lang: u.lang };
}

// ---- the merchant assistant ---------------------------------------------------------------------------------------------
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const MERCHANT = [
  ['sales-today', /((sale|sales|sell|sold|revenue|বিক্রি|সেল).*(today|aj|aaj|আজ))|((today|aj|আজ).*(sale|sales|sell|বিক্রি|সেল))|today'?s sales|সেলস সামারি/i],
  ['report-month', /(last month|previous month|gotomash|গত মাস).*(report|sales|সেল|রিপোর্ট)|(report|রিপোর্ট).*(last month|গত মাস)|monthly report/i],
  ['top-products', /(best|top|most).*(sell|selling|sold)|সবচেয়ে বেশি বিক্রি|best ?seller/i],
  ['courier-waiting', /(courier|কুরিয়ার).*(not|baki|বাকি|হয়নি|দেওয়া বাকি|yet)|(not|yet).*(courier|shipped)|waiting to ship|ready for courier/i],
  ['low-stock', /(low stock|stock kom|স্টক কম|out of stock|স্টক .*নিচে|stock .*(below|under))/i],
  ['followups', /(follow ?up|ফলোআপ|ফলো আপ|call back today)/i],
  ['interested', /(asked|জানতে চেয়েছে|interested).*(didn'?t|not|করেনি|kore ni)|(didn'?t|not) order/i],
  ['cancelled', /(cancel|ক্যানসেল|বাতিল)/i],
  ['sales-week', /(week|7 days|seven days|সাত দিন|সপ্তাহ|this month|এই মাস)/i],
];
// what a question needs: [nav id the person must be able to open, words for the denial]
const NEEDS = {
  'sales-today': [['rep-all', 'acc-home', 'rep-daily'], 'sales figures'], 'report-month': [['rep-all', 'acc-home'], 'sales reports'], 'sales-week': [['rep-all', 'acc-home', 'rep-daily'], 'sales figures'],
  'top-products': [['rep-all', 'products-all', 'stock-list'], 'product sales'], 'courier-waiting': [['orders-all', 'orders'], 'orders'],
  'low-stock': [['stock-list', 'products-low', 'products-all'], 'stock'], followups: [['leads'], 'leads and follow-ups'], interested: [['inbox', 'leads'], 'the Inbox'], cancelled: [['orders-all', 'orders'], 'orders'],
};
const mayAsk = (user, k) => !NEEDS[k] || NEEDS[k][0].some((id) => canSee(user, id));

/**
 * An answer for the shop team. Returns { id, kind, lang, blocks: [{ type: 'text' | 'figures' | 'table' | 'list' | 'action', … }],
 * steps, sources, tier, model, cost, denied }.
 */
export function merchantTurn(question, user, { sandbox = false, now = Date.now() } = {}) {
  const q = String(question || '').trim();
  const lang = langOf(q) === 'bn' ? 'bn' : 'en';
  const T = (en, bn) => (lang === 'bn' ? bn : en);
  const thr = (ascii(q).match(/(?:below|under|নিচে|kom|less than)\s*(\d+)|(\d+)\s*(?:-এর|er)?\s*(?:নিচে|niche)/i) || []);
  const threshold = Number(thr[1] || thr[2]) || LOW_AT;
  const kind = (MERCHANT.find(([, re]) => re.test(q)) || ['help'])[0];
  const steps = [{ kind: 'input', label: 'Question', detail: '“' + q.slice(0, 140) + '”' }, { kind: 'understand', label: 'Understood', detail: (kind === 'help' ? 'Not one of the questions I can answer yet' : kind.replace('-', ' ')) + ' · ' + (lang === 'bn' ? 'Bangla' : 'English') }];
  const blocks = [];
  let denied = false;
  const tool = (id, detail) => steps.push({ kind: 'tool', label: toolBy(id).label, detail, ok: true, risk: toolBy(id).risk });
  if (!mayAsk(user, kind)) {
    denied = true;
    steps.push({ kind: 'policy', label: 'Not allowed', detail: (user ? user.name : 'This person') + ' can’t open ' + NEEDS[kind][1], ok: false });
    blocks.push({ type: 'text', text: T(`You don’t have access to ${NEEDS[kind][1]}, so I can’t show this. Ask the shop owner if you need it.`, `আপনার ${NEEDS[kind][1]} দেখার অনুমতি নেই, তাই এটা দেখাতে পারছি না। দরকার হলে মালিককে বলুন।`) });
  } else if (kind === 'sales-today' || kind === 'sales-week' || kind === 'report-month') {
    const d0 = startOfDay(now);
    const range = kind === 'sales-today' ? [d0, now + 1, T('Today', 'আজ')] : kind === 'sales-week' ? (/(month|মাস)/i.test(q) ? [new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime(), now + 1, T('This month', 'এই মাস')] : [d0 - 6 * 864e5, now + 1, T('Last 7 days', 'গত ৭ দিন')]) : (() => { const d = new Date(now); const a = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(); const b = new Date(d.getFullYear(), d.getMonth(), 1).getTime(); return [a, b, T('Last month', 'গত মাস')]; })();
    const s = salesByChannel(range[0], range[1]);
    tool('get_sales_summary', range[2] + ' · ' + money(s.all.net) + ' net from ' + s.all.orders + ' sales');
    const chans = ['Online', 'Retail'].filter((c) => s[c] && (s[c].revenue || s[c].orders));
    blocks.push({ type: 'figures', title: range[2], items: [[T('Net sales', 'নিট বিক্রি'), money(s.all.net)], [T('Sales', 'বিক্রির সংখ্যা'), String(s.all.orders)], [T('Average sale', 'গড় বিক্রি'), money(s.all.avg)], [T('Returns', 'রিটার্ন'), money(s.all.returns)]] });
    if (chans.length > 1) blocks.push({ type: 'table', head: [T('Channel', 'চ্যানেল'), T('Sales', 'বিক্রি'), T('Net', 'নিট')], rows: chans.map((c) => [c, String(s[c].orders), money(s[c].net)]) });
    if (kind === 'report-month') {
      const top = topProducts(range[0], range[1], 5);
      tool('get_top_products', top.length + ' products');
      if (top.length) blocks.push({ type: 'table', title: T('Best sellers', 'সবচেয়ে বেশি বিক্রি'), head: [T('Product', 'পণ্য'), T('Qty', 'সংখ্যা'), T('Sales', 'বিক্রি')], rows: top.map((p) => [p.name, String(p.qty), money(p.revenue)]) });
      blocks.push({ type: 'action', label: T('Open the full sales report', 'পুরো সেলস রিপোর্ট খুলুন'), href: '/report?id=sales-by-day' });
    } else blocks.push({ type: 'action', label: T('Open Daily summary', 'ডেইলি সামারি খুলুন'), href: '/daily-summary' });
  } else if (kind === 'top-products') {
    const d0 = startOfDay(now);
    const top = topProducts(d0 - 6 * 864e5, now + 1, 5);
    tool('get_top_products', 'Last 7 days · ' + top.length + ' products');
    blocks.push(top.length ? { type: 'table', title: T('Best sellers · last 7 days', 'সবচেয়ে বেশি বিক্রি · গত ৭ দিন'), head: [T('Product', 'পণ্য'), T('Qty', 'সংখ্যা'), T('Sales', 'বিক্রি')], rows: top.map((p) => [p.name, String(p.qty), money(p.revenue)]) } : { type: 'text', text: T('No sales in the last 7 days.', 'গত ৭ দিনে কোনো বিক্রি নেই।') });
  } else if (kind === 'courier-waiting') {
    const list = getOrders().filter((o) => !isCounterSale(o) && ['approved', 'ready'].includes(o.statusKey)).sort((a, b) => a.at - b.at);
    const fresh = getOrders().filter((o) => !isCounterSale(o) && ['onhold', 'processing', 'pending'].includes(o.statusKey)).length;
    tool('get_orders_waiting', list.length + ' approved or packed · ' + fresh + ' still to approve');
    blocks.push({ type: 'text', text: list.length ? T(`${list.length} orders are approved but not with the courier yet. ${fresh} more are waiting to be approved.`, `${list.length}টি অর্ডার অনুমোদিত কিন্তু এখনো কুরিয়ারে দেওয়া হয়নি। আরও ${fresh}টি অনুমোদনের অপেক্ষায়।`) : T(`Every approved order is with the courier. ${fresh} are waiting to be approved.`, `সব অনুমোদিত অর্ডার কুরিয়ারে আছে। ${fresh}টি অনুমোদনের অপেক্ষায়।`) });
    if (list.length) blocks.push({ type: 'list', items: list.slice(0, 6).map((o) => ({ title: o.id + ' · ' + o.customer, sub: o.status + ' · ' + (o.total || money(o.amount)), href: '/order-detail?id=' + encodeURIComponent(o.id) + '&from=gridai' })), more: list.length > 6 ? list.length - 6 : 0 });
    blocks.push({ type: 'action', label: T('Open Orders', 'অর্ডার খুলুন'), href: '/merchant-orders' });
  } else if (kind === 'low-stock') {
    const rows = getCatalog().filter((r) => !isUntracked(r) && (r.st || 'active') === 'active').map((r) => ({ r, a: stockAt(r.sku).available })).filter((x) => x.a <= threshold).sort((a, b) => a.a - b.a);
    tool('get_low_stock_products', 'At or under ' + threshold + ' · ' + rows.length + ' products');
    blocks.push({ type: 'text', text: rows.length ? T(`${rows.length} products have ${threshold} or fewer left across all places.`, `${rows.length}টি পণ্যের স্টক ${threshold} বা তার কম।`) : T(`No product is at ${threshold} or fewer.`, `কোনো পণ্যের স্টক ${threshold}-এর নিচে নেই।`) });
    if (rows.length) blocks.push({ type: 'table', head: [T('Product', 'পণ্য'), 'SKU', T('Left', 'বাকি')], rows: rows.slice(0, 8).map((x) => [x.r.name, x.r.sku, String(x.a)]) });
    blocks.push({ type: 'action', label: T('Open Stock', 'স্টক খুলুন'), href: '/stock' });
  } else if (kind === 'followups') {
    const due = getLeads().map((l) => ({ l, st: followState(l, now) })).filter((x) => x.st === 'today' || x.st === 'overdue');
    tool('get_followups_due', due.length + ' due today or late');
    blocks.push({ type: 'text', text: due.length ? T(`${due.length} customers need a follow-up today${due.some((x) => x.st === 'overdue') ? ' (' + due.filter((x) => x.st === 'overdue').length + ' are late)' : ''}.`, `আজ ${due.length} জনকে ফলোআপ দিতে হবে।`) : T('No follow-ups are due today.', 'আজ কোনো ফলোআপ নেই।') });
    if (due.length) {
      blocks.push({ type: 'list', items: due.slice(0, 6).map(({ l, st }) => ({ title: l.name + (l.company ? ' · ' + l.company : ''), sub: (l.next ? l.next.what : 'Follow up') + (st === 'overdue' ? ' · late' : ''), href: '/sales-leads' })), more: Math.max(0, due.length - 6) });
      blocks.push({ type: 'action', label: T('Prepare follow-up messages', 'ফলোআপ মেসেজ তৈরি করুন'), approval: { kind: 'bulk-message', title: 'Follow-up messages to ' + due.length + ' customers', count: due.length } });
    }
  } else if (kind === 'interested') {
    const since = now - 7 * 864e5;
    const orders = getOrders();
    const list = getConvs().filter((c) => (c.messages || []).some((m) => m.from === 'customer' && m.text && m.at >= since && understand(m.text).intents.some((k) => ['price', 'stock', 'recommend'].includes(k))))
      .filter((c) => !c.phone || !orders.some((o) => samePhone(o.phone, c.phone) && o.at >= since));
    tool('get_interested_not_ordered', 'Last 7 days · ' + list.length + ' people');
    blocks.push({ type: 'text', text: list.length ? T(`${list.length} people asked about a product in the last 7 days and haven’t ordered.`, `গত ৭ দিনে ${list.length} জন পণ্য সম্পর্কে জানতে চেয়েছেন কিন্তু অর্ডার করেননি।`) : T('Everyone who asked has ordered.', 'যারা জানতে চেয়েছেন সবাই অর্ডার করেছেন।') });
    if (list.length) {
      blocks.push({ type: 'list', items: list.slice(0, 6).map((c) => { const s = summarize(c); return { title: c.name, sub: s.lines[0], href: '/merchant-inbox?c=' + encodeURIComponent(c.id) }; }), more: Math.max(0, list.length - 6) });
      blocks.push({ type: 'action', label: T('Send them a follow-up', 'ফলোআপ পাঠান'), approval: { kind: 'bulk-message', title: 'Follow-up to ' + list.length + ' interested customers', count: list.length } });
    }
  } else if (kind === 'cancelled') {
    const d = new Date(now);
    const a = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), b = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const list = getOrders().filter((o) => o.statusKey === 'cancelled' && ((o.times && o.times.cancelled) || o.at) >= a && ((o.times && o.times.cancelled) || o.at) < b);
    const why = {};
    list.forEach((o) => { const r = o.cancelReason || o.reason || 'No reason recorded'; why[r] = (why[r] || 0) + 1; });
    tool('get_cancelled_orders', 'Last month · ' + list.length + ' orders');
    blocks.push({ type: 'figures', title: T('Cancelled last month', 'গত মাসে বাতিল'), items: [[T('Orders', 'অর্ডার'), String(list.length)], [T('Value', 'মূল্য'), money(list.reduce((s, o) => s + (o.amount || 0), 0))]] });
    if (list.length) blocks.push({ type: 'table', head: [T('Reason', 'কারণ'), T('Orders', 'অর্ডার')], rows: Object.entries(why).sort((x, y) => y[1] - x[1]).map(([r, n]) => [r, String(n)]) });
    blocks.push({ type: 'text', text: list.length ? T('Most cancellations happen before verification. Calling COD orders within an hour usually cuts them.', 'বেশিরভাগ বাতিল হয় যাচাইয়ের আগে। এক ঘণ্টার মধ্যে কল করলে সাধারণত কমে।') : T('No orders were cancelled last month.', 'গত মাসে কোনো অর্ডার বাতিল হয়নি।') });
  } else {
    blocks.push({ type: 'text', text: T('I can answer questions about sales, best sellers, orders waiting for the courier, low stock, follow-ups, people who asked but didn’t order, and cancelled orders. Try one of the suggestions.', 'আমি বিক্রি, বেশি বিক্রি হওয়া পণ্য, কুরিয়ারে দেওয়া বাকি অর্ডার, কম স্টক, ফলোআপ, যারা জানতে চেয়েছে কিন্তু অর্ডার করেনি, আর বাতিল অর্ডার নিয়ে উত্তর দিতে পারি।') });
  }
  steps.push({ kind: 'policy', label: denied ? 'Stopped' : 'Policy check', detail: denied ? 'Answer withheld' : 'Read-only · figures from the shop’s own books · actions wait for approval', ok: !denied });
  const tier = kind === 'help' || denied ? 1 : tierOf('assistant');
  const model = modelFor(tier);
  const size = JSON.stringify(blocks).length;
  const tokensIn = Math.round(1100 + q.length / 3 + size / 3), tokensOut = Math.round(size / 6 + 40);
  const cost = Math.round(costOf(model, tokensIn, tokensOut) * 100) / 100;
  steps.push({ kind: 'model', label: 'Answer written', detail: `${model.name} · tier ${tier} · ${tokensIn.toLocaleString('en-IN')} in / ${tokensOut} out · ৳${cost.toFixed(2)}` });
  const agent = ['sales-today', 'sales-week', 'report-month', 'top-products', 'cancelled'].includes(kind) ? 'analytics' : kind === 'low-stock' ? 'inventory' : 'operations';
  return meter({ id: runId(), at: Date.now(), surface: 'merchant', agent, kind, lang, blocks, steps, sources: [], tools: steps.filter((s) => s.kind === 'tool').map((s) => s.label), tier, model: model.name, tokensIn, tokensOut, cost, ms: 1200 + Math.round(tokensIn / 3), denied, outcome: denied ? 'denied' : 'answered', sandbox });
}
function topProducts(from, to, n) {
  const map = new Map();
  getSaleLines(getSales()).filter((l) => l.at >= from && l.at < to).forEach((l) => {
    const k = l.sku || l.name;
    const p = map.get(k) || map.set(k, { name: l.name, qty: 0, revenue: 0 }).get(k);
    p.qty += Number(l.qty) || 0; p.revenue += Number(l.revenue) || 0;
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, n).map((p) => ({ ...p, revenue: Math.round(p.revenue) }));
}
export const MERCHANT_SUGGESTIONS = [
  ['আজকে কত টাকার সেল হয়েছে?', 'bn'], ['Best sellers in the last 7 days', 'en'], ['যেসব অর্ডার এখনো কুরিয়ারে দেওয়া হয়নি সেগুলো দেখাও।', 'bn'],
  ['Which products are low on stock?', 'en'], ['আজকে কোন কোন কাস্টমারকে ফলোআপ দিতে হবে?', 'bn'], ['Who asked about a product but didn’t order?', 'en'],
  ['আমার গত মাসের সেলস রিপোর্ট তৈরি করো।', 'bn'], ['Analyse last month’s cancelled orders', 'en'],
];
