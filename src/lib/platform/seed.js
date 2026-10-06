// platform/seed — the demo world the console starts with, built around an anchor time (the first visit, or a
// fixed design moment for the server render). Everything is a plain record; the billing engine (billing.js)
// works out states, balances and what is due from these records, and moves them on as the clock runs.
//
// The stores and situations follow the console's design boards: Dhaka Gadget Hub in grace on day 3, Bindu Beauty
// past due and read-only, Rupsha Sports suspended, trials ending, a provisioning run stopped at Domain, the ৳833
// outage credit waiting for a second approval, and so on. The rest of the 62 stores are generated (fixed seed).

import { DAY, MIN, rng, pad4, addMonths, at, periodOf, yearOf, dayOfMonth, weekday, TZ } from './util';
import { basePlans, STAGES, ADDONS } from './catalogue';

// [tid, name, ladder, plan, scenario, extra]
//   scenario: active · grace:<days overdue> · pastdue:<days> · suspended:<days> · trial:<day> · paused · cancelled ·
//             archived · failed (provisioning stopped) · running (provisioning now) · due:<days until due, 0 = today>
/** Bump when the demo data's shape or seed changes: saved data from an older version is replaced (store.js). */
export const DATA_VERSION = 2;

const NAMED = [
  ['0007', 'Rongdhonu Fashion', 'online', 'business', 'active', { months: 14, src: 'Meta ads', by: 'Tania Sultana', dist: 'Dhaka', am: 'Tania Sultana', cat: 'Fashion', h: 86, orders: 1840, every: 1, mods: ['Landing pages', 'Loyalty', 'Cart recovery', 'Inbox'], dom: 'rongdhonu.com.bd', items: ['G3'], owner: 'Nusrat Jahan' }],
  ['0009', 'Dhaka Shoe Corner', 'online', 'growth', 'active', { months: 18, src: 'Website', by: 'Tania Sultana', dist: 'Dhaka', cat: 'Fashion', sub: 'dhakashoe', every: 1 }],
  ['0012', 'Mohona Traders', 'wholesale', 'enterprise', 'active', { months: 13, src: 'Event', by: 'Mahin Khan', dist: 'Dhaka', am: 'Mahin Khan', cat: 'Grocery', h: 90, orders: 3120, every: 1, mods: ['Wholesale dues', 'Warehouse', 'Payroll', 'Inbox', 'AI products'], dom: 'mohonatraders.com.bd', items: ['G3', 'G5'], pays: 'bank' }],
  ['0017', 'Shonali Crafts', 'online', 'growth', 'active', { months: 10, src: 'Reference', by: 'Tania Sultana', dist: 'Dhaka', am: 'Tania Sultana', cat: 'Fashion', h: 78, orders: 410, every: 1, mods: ['POS', 'Landing pages'], dom: 'shonalicrafts.com', segs: ['Online', 'Retail'], modTrial: 'M04', owner: 'Rumana Akter' }],
  ['0023', 'Ghorer Bazar BD', 'online', 'business', 'due:0', { months: 9, src: 'YouTube ads', by: 'Mahin Khan', dist: 'Dhaka', am: 'Mahin Khan', cat: 'Grocery', h: 69, orders: 1320, last: 8, mods: ['Landing pages', 'Cart recovery', 'Inbox'], dom: 'ghorerbazarbd.com' }],
  ['0028', 'Tech Zone Uttara', 'retail', 'growth', 'due:2', { months: 11, src: 'Physical visit', by: 'Rakib Hasan', dist: 'Dhaka', am: 'Rakib Hasan', cat: 'Electronics', h: 63, orders: 205, last: 34, mods: ['POS'], dom: 'techzoneuttara.com.bd', ref: '0031' }],
  ['0031', 'Dhaka Gadget Hub', 'retail', 'business', 'grace:3', { months: 14, src: 'Physical visit', by: 'Rakib Hasan', helper: 'Tania Sultana', campaign: 'Elephant Road campaign', dist: 'Dhaka', am: 'Farhana Akter', cat: 'Electronics', h: 54, orders: 960, every: 1, mods: ['POS', 'Loyalty', 'Cart recovery', 'Warehouse', 'Blasts'], dom: 'dhakagadgethub.com.bd', owner: 'Arif Hossain', modTrial: 'M05', items: ['SMS'] }],
  ['0038', 'Rupsha Sports', 'retail', 'growth', 'suspended:19', { months: 8, src: 'YouTube ads', by: 'Rakib Hasan', dist: 'Khulna', am: 'Rakib Hasan', cat: 'Fashion', h: 18, orders: 0, last: 19, mods: ['POS'], dom: 'rupshasports.com.bd', items: ['M05'] }],
  ['0044', 'Bindu Beauty', 'online', 'business', 'pastdue:9', { months: 7, src: 'Meta ads', by: 'Rakib Hasan', dist: 'Chattogram', am: 'Rakib Hasan', cat: 'Beauty', h: 33, orders: 640, last: 9, mods: ['Landing pages', 'Loyalty', 'Blasts'], dom: 'bindubeauty.com.bd' }],
  ['0058', 'Nodi Organic', 'online', 'growth', 'trial:9', { src: 'Meta ads', by: 'Rakib Hasan', dist: 'Bogura', am: null, cat: 'Grocery', h: 41, orders: 12, last: 6, mods: ['Landing pages'] }],
  ['0061', 'Kolpo Books', 'online', 'growth', 'trial:12', { src: 'Website', by: 'Tania Sultana', dist: 'Dhaka', am: 'Tania Sultana', cat: 'Fashion', h: 72, orders: 48, every: 1, mods: ['Landing pages'] }],
  ['0066', 'Mehedi Traders', 'wholesale', 'business', 'active', { months: 12, src: 'Event', by: 'Farhana Akter', dist: 'Narayanganj', am: 'Farhana Akter', cat: 'Grocery', h: 81, orders: 780, every: 2, mods: ['Wholesale dues', 'Warehouse', 'Loyalty'], dom: 'meheditraders.com.bd', items: ['M05'], pays: 'nagad' }],
  ['0069', 'Pabna Dairy Hub', 'wholesale', 'growth', 'trial:13', { src: 'Affiliate', by: 'Mahin Khan', dist: 'Pabna', am: 'Mahin Khan', cat: 'Grocery', h: 58, orders: 4, last: 2, mods: ['Wholesale dues'] }],
  ['0072', 'Sabuj Bazar', 'online', 'business', 'trial:6', { src: 'Meta ads', by: 'Tania Sultana', dist: 'Sylhet', am: 'Tania Sultana', cat: 'Grocery', h: 82, orders: 31, every: 1, mods: ['Landing pages', 'Cart recovery'] }],
  ['0074', 'Rongin Saree', 'online', 'growth', 'trial:5', { src: 'Reference', by: 'Farhana Akter', dist: 'Tangail', am: 'Farhana Akter', cat: 'Fashion', h: 77, orders: 22, every: 1, mods: ['Landing pages'] }],
  ['0075', 'Ruposhi Jewels', 'online', 'business', 'failed', { src: 'Physical visit', by: 'Rakib Hasan', dist: 'Dhaka', cat: 'Jewellery and accessories', sub: 'ruposhi', owner: 'Nasrin Sultana' }],
  ['0076', 'Chaldal Mini Mart', 'online', 'growth', 'running', { src: 'Website', by: 'Tania Sultana', dist: 'Dhaka', cat: 'Grocery' }],
  ['0021', 'Adda Foods', 'online', 'growth', 'archived', { months: 9, src: 'Meta ads', by: 'Tania Sultana', dist: 'Dhaka', cat: 'Grocery', last: 95 }],
  ['0047', 'Mobile Bari', 'retail', 'business', 'active', { months: 9, src: 'Reference', by: 'Rakib Hasan', dist: 'Dhaka', cat: 'Electronics', every: 1, ref: '0031', mods: ['POS'] }],
  ['0052', 'Gadget Corner Mirpur', 'retail', 'growth', 'active', { months: 6, src: 'Reference', by: 'Rakib Hasan', dist: 'Dhaka', cat: 'Electronics', every: 2, ref: '0031', mods: ['POS'] }],
  ['0070', 'Smart Shop BD', 'retail', 'growth', 'trial:14', { src: 'Affiliate', by: 'Rakib Hasan', dist: 'Dhaka', cat: 'Electronics', every: 1, ref: '0031', mods: ['POS'] }],
  ['0073', 'Phone Point', 'retail', 'growth', 'trial:4', { src: 'Affiliate', by: 'Rakib Hasan', dist: 'Dhaka', cat: 'Electronics', every: 1, ref: '0031', mods: ['POS'] }],
  ['0035', 'Dhaka Denim Works', 'online', 'growth', 'paused', { months: 8, src: 'Meta ads', by: 'Tania Sultana', dist: 'Dhaka', cat: 'Fashion', last: 12 }],
];

const NAMES = [
  'Nakshi Kantha House', 'Shapla Kitchen', 'Megh Boutique', 'Padma Fish Mart', 'Nilgiri Tea House', 'Kantha Stories', 'Jamdani Ghor',
  'Ruchi Snacks', 'Shada Kalo Fashion', 'Tech Point BD', 'Seoul Beauty Imports', 'Ghorer Khabar', 'Shopno Toys', 'Sundarban Honey',
  'Bogura Doi Ghar', 'Sylhet Tea Leaf', 'Barishal Pickles', 'Rajshahi Mango Hub', 'Comilla Rasmalai', 'Dhaka Watch House',
  'Mirpur Mobile Zone', 'Uttara Pharmacy Plus', 'Gulshan Home Decor', 'Banani Book Corner', 'Mohakhali Electronics', 'Khilgaon Fabrics',
  'Old Dhaka Perfumes', 'Nawabpur Hardware', 'Panthapath Paints', 'Kawran Bazar Fresh', 'Narayanganj Knitwear', 'Gazipur Furniture',
  'Savar Leather Works', 'Tangail Tant', 'Jessore Flowers', 'Rangpur Rice Traders', 'Dinajpur Litchi Hub', 'Noakhali Sweets',
  'Feni Garments', 'Kushtia Handloom', 'Chattala Spices', 'Bikrampur Ghee', 'Moheshkhali Paan', 'Cox Sea Shells',
];
const OWNERS = ['Rafiq Uddin', 'Sharmin Akter', 'Kamrul Islam', 'Nasima Begum', 'Jahid Hasan', 'Taslima Khatun', 'Mizanur Rahman', 'Shirin Sultana', 'Habibur Rahman', 'Lipi Akter', 'Faruk Ahmed', 'Rokeya Begum', 'Imran Hossain', 'Mousumi Das', 'Sohel Rana', 'Nazma Parvin'];
const GEN_DIST = ['Dhaka', 'Dhaka', 'Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Narayanganj', 'Gazipur', 'Rajshahi', 'Bogura', 'Tangail'];
const GEN_SRC = ['Meta ads', 'Meta ads', 'Website', 'Reference', 'Physical visit', 'YouTube ads', 'Affiliate', 'Event'];
const GEN_BY = ['Tania Sultana', 'Rakib Hasan', 'Farhana Akter', 'Mahin Khan'];
const GEN_CAT = ['Fashion', 'Grocery', 'Electronics', 'Beauty', 'Fashion', 'Jewellery and accessories'];
const MODS = { online: ['Landing pages', 'Cart recovery', 'Loyalty', 'Inbox', 'Blasts'], retail: ['POS', 'Loyalty', 'Warehouse'], wholesale: ['Wholesale dues', 'Warehouse', 'Loyalty'] };

// what the generated stores are: [ladder, plan, scenario] — with the named ones this gives 62 live stores:
// Online 41 (Growth 19, Business 17, Enterprise 5), Retail 12, Wholesale 9; 18 in trial; 41 paying.
const GEN = [
  ...Array(9).fill(['online', 'growth', 'active']), ...Array(9).fill(['online', 'business', 'active']), ...Array(4).fill(['online', 'enterprise', 'active']),
  ['online', 'growth', 'trial:3'], ['online', 'business', 'trial:8'], ['online', 'growth', 'trial:11'], ['online', 'business', 'trial:2'], ['online', 'enterprise', 'trial:7'],
  ['online', 'growth', 'trial:13'], ['online', 'business', 'trial:5'],
  ['online', 'growth', 'cancelled'], ['online', 'business', 'cancelled'], ['online', 'business', 'pastdue:11'],
  ['online', 'business', 'due:1'], ['online', 'growth', 'due:4'],
  ['retail', 'growth', 'active'], ['retail', 'business', 'active'], ['retail', 'growth', 'trial:10'], ['retail', 'business', 'trial:1'],
  ['wholesale', 'growth', 'active'], ['wholesale', 'business', 'active'], ['wholesale', 'enterprise', 'active'], ['wholesale', 'business', 'trial:4'], ['wholesale', 'growth', 'trial:12'], ['wholesale', 'business', 'due:3'],
];

const COLLECT_BY = ['Rakib Hasan', 'Rakib Hasan', 'Rakib Hasan', 'Farhana Akter', 'Mahin Khan'];

/** Build the whole demo database around `anchor` (ms). */
export function buildSeed(anchor) {
  const A = anchor;
  const R = rng('gridcommerce-platform');
  const db = {
    v: DATA_VERSION, anchor: A, seq: { inv: {}, cn: {}, adj: 43, pay: 1, call: 1, note: 1, run: 1, item: 1, ev: 1, trial: 1 },
    plans: basePlans(A), planDrafts: [],
    shops: [], subs: {}, invoices: [], payments: [], credits: [], adjustments: [], calls: [], notes: [], runs: [], events: [],
    settings: { adjThreshold: 500, graceDays: 7, readOnlyDays: 14 },
  };

  // ---- the stores -------------------------------------------------------------------------------
  const used = new Set(NAMED.map((n) => n[0]));
  const free = [];
  for (let i = 1; free.length < GEN.length; i++) if (!used.has(pad4(i))) free.push(pad4(i));
  const rows = [
    ...NAMED.map(([tid, name, ladder, plan, sc, x]) => ({ tid, name, ladder, plan, sc, x })),
    ...GEN.map(([ladder, plan, sc], i) => {
      const r = rng('gen' + i);
      const tid = free[i];
      const x = {
        months: sc.startsWith('trial') ? 0 : r.int(3, 20), src: r.pick(GEN_SRC), by: r.pick(GEN_BY), dist: r.pick(GEN_DIST),
        cat: r.pick(GEN_CAT), every: r.pick([1, 1, 1, 2, 3]), mods: MODS[ladder].filter(() => r.chance(0.4)),
        orders: plan === 'enterprise' ? r.int(2000, 6000) : plan === 'business' ? r.int(300, 2100) : r.int(40, 460),
        h: r.int(62, 94), owner: r.pick(OWNERS), autoCharge: r.chance(0.15),
      };
      if (sc === 'cancelled') x.last = r.int(20, 60);
      if (sc.startsWith('pastdue')) { x.last = 11; x.h = 38; }
      if (x.autoCharge) x.pays = 'card';
      return { tid, name: NAMES[i % NAMES.length], ladder, plan, sc, x };
    }),
  ];

  for (const row of rows) {
    const { tid, name, ladder, plan, sc, x } = row;
    const r = rng('shop' + tid);
    const [kind, nStr] = sc.split(':');
    const n = Number(nStr || 0);
    const slug = x.sub || name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18);
    let created;
    if (kind === 'trial') created = Math.min(A - 3600e3, at(A - (n - 1) * DAY, r.int(9, 12)));
    else if (kind === 'failed') created = A - 38 * MIN;
    else if (kind === 'running') created = A - 50 * 1000;
    else created = addMonths(A, -(x.months || 6), r.int(2, 27)) - 15 * DAY;
    const segs = x.segs || [ladder === 'online' ? 'Online' : ladder === 'retail' ? 'Retail' : 'Wholesale'];
    const ownerName = x.owner || r.pick(OWNERS);
    const shop = {
      id: tid, name, legal: name, cat: x.cat || 'Fashion', dist: x.dist || 'Dhaka', address: '',
      owner: { name: ownerName, phone: '+880 1' + r.int(3, 9) + r.int(10, 99) + '-XXXXXX', email: slug.slice(0, 10) + '@gmail.com', lang: 'বাংলা' },
      sub: slug, dom: x.dom || null, segs, createdAt: created, src: x.src || 'Website', by: x.by || 'Tania Sultana',
      helper: x.helper || (r.chance(0.5) ? 'Tania Sultana' : null), campaign: x.campaign || null, ref: x.ref || null,
      am: x.am === undefined ? x.by || null : x.am, mods: x.mods || [], h0: x.h || 75,
      orders0: x.orders ?? 100, every: x.every || null, lastDays0: x.last ?? null,
      status: kind === 'failed' || kind === 'running' ? 'setup' : 'live',
      control: null, // staff-set access: 'readonly' | 'suspended' | 'paused-storefront'
      resetAt: null, resetBy: null,
    };
    if (tid === '0031') { shop.address = 'Elephant Road, Dhaka'; shop.desc = 'Mobile accessories and gadgets'; shop.resetAt = A - 18 * DAY - 25 * 3600e3; shop.resetBy = 'Farhana Akter'; }
    if (tid === '0075') shop.address = 'Shop 22, Bashundhara City, Panthapath';
    db.shops.push(shop);

    // ---- subscription ----
    const trialStart = kind === 'trial' ? created : created;
    const paidFrom = created + 15 * DAY;
    const billDay = Math.min(dayOfMonth(paidFrom), 28);
    const version = ladder === 'online' ? (x.months > 12 ? 2 : 3) : ladder === 'retail' ? 2 : 1;
    const sub = {
      shopId: tid, ladder, plan, version, cycle: 'monthly', billDay,
      status: kind === 'trial' ? 'trial' : kind === 'paused' ? 'paused' : kind === 'cancelled' ? 'cancelled' : kind === 'archived' ? 'archived' : kind === 'failed' || kind === 'running' ? 'setup' : 'active',
      trialStart, trialDays: 15, nextDue: null,
      autoCharge: !!x.autoCharge, payMethod: x.pays === 'card' ? 'Card' : x.pays === 'bank' ? 'Bank transfer' : x.pays === 'nagad' ? 'Nagad' : 'bKash',
      items: [], moduleTrials: [], pausedAt: null, cancelledAt: null, cancelReason: null, archivedAt: null,
    };
    const upgradeAt = addMonths(A, -7, 27);
    if (tid === '0031') {
      // started on Growth, moved to Business after the Analytics trial
      sub.items.push({ id: 'IT' + db.seq.item++, kind: 'plan', code: 'growth', name: null, price: null, period: 'Monthly', since: paidFrom, until: upgradeAt });
      sub.items.push({ id: 'IT' + db.seq.item++, kind: 'plan', code: 'business', name: null, price: null, period: 'Monthly', since: upgradeAt, until: null });
    } else {
      sub.items.push({ id: 'IT' + db.seq.item++, kind: 'plan', code: plan, name: null, price: null, period: 'Monthly', since: paidFrom, until: null });
    }
    for (const code of x.items || []) {
      const a = ADDONS.find((z) => z.code === code);
      const since = code === 'SMS' && tid === '0031' ? addMonths(A, -6, 5) : addMonths(A, -r.int(2, 6), r.int(1, 27));
      sub.items.push({ id: 'IT' + db.seq.item++, kind: a.kind, code, name: a.name, price: a.price, period: a.period, since, until: null });
    }
    if (tid === '0031') {
      sub.items.push({ id: 'IT' + db.seq.item++, kind: 'oneoff', code: 'LP5', name: '5 extra landing pages', price: 300, period: 'Once', since: addMonths(A, -4, 12), until: null });
      sub.moduleTrials.push({ id: 'MT' + db.seq.trial++, code: 'M05', name: 'Warehouse (M05)', start: at(A - 8 * DAY, 11, 30), days: 14, by: 'Farhana Akter', reason: 'Upgrade offer', autoAdd: true, price: 1000, use: '2 warehouses · 38 transfers', result: null });
      sub.moduleTrials.push({ id: 'MT' + db.seq.trial++, code: 'G2', name: 'Analytics hub (G2)', start: addMonths(A, -7, 20), days: 7, by: 'Rakib Hasan', reason: 'Sales evaluation', autoAdd: false, price: 0, use: 'Opened 19 times', result: 'Converted with Business' });
      sub.moduleTrials.push({ id: 'MT' + db.seq.trial++, code: 'M12', name: 'Landing pages (M12)', start: addMonths(A, -4, 2), days: 7, by: 'Tania Sultana', reason: 'Upgrade offer', autoAdd: true, price: 0, use: '2 pages published', result: 'Became add-on' });
    } else if (x.modTrial) {
      sub.moduleTrials.push({ id: 'MT' + db.seq.trial++, code: x.modTrial, name: x.modTrial === 'M04' ? 'POS (M04)' : 'Warehouse (M05)', start: at(A - 5 * DAY, 12), days: 14, by: 'Tania Sultana', reason: 'Upgrade offer', autoAdd: false, price: 1000, use: '', result: null });
    }
    db.subs[tid] = sub;

    // ---- bills: one invoice per month from the first paid month up to the latest that is issued ----
    const priceOf = (it) => it.kind === 'plan' ? db.plans[ladder].versions.find((v) => v.v === version).plans[it.code].price : it.price;
    if (kind === 'trial' || kind === 'failed' || kind === 'running') {
      if (kind === 'trial') invoice(db, { shopId: tid, issuedAt: created + 60000, dueAt: created + 60000, period: periodOf(created), lines: [{ label: `${cap(ladder)} · ${cap(plan)} plan, 15-day trial`, amount: 0 }], noCharge: true });
    } else {
      // when the latest bill fell due (or falls due): scenario decides
      let lastDue;
      if (kind === 'grace' || kind === 'pastdue' || kind === 'suspended') lastDue = at(A - n * DAY, 0, 0);
      else if (kind === 'due') lastDue = at(A + n * DAY, 0, 0);
      else lastDue = null;
      let due = at(paidFrom, 0, 0);
      // a bill is issued 7 days before it falls due; seed every bill whose issue day has come
      const stopAt = kind === 'cancelled' || kind === 'archived' ? A - (x.last || 30) * DAY : kind === 'paused' ? A - 12 * DAY : A;
      if (lastDue) {
        // line the cycle up so that one bill falls due exactly on lastDue
        sub.billDay = Math.min(dayOfMonth(lastDue), 28);
        due = at(addMonths(lastDue, -(x.months || 6), sub.billDay), 0, 0);
      } else {
        due = at(addMonths(paidFrom, 0, billDay), 0, 0);
      }
      let k = 0;
      while (due - 7 * DAY <= stopAt && k < 40) {
        const lines = [];
        for (const it of sub.items) {
          if (it.until && it.until <= due) continue;
          if (it.period === 'Once') { if (it.since > due - 31 * DAY && it.since <= due) lines.push({ label: it.name, amount: it.price, kind: it.kind }); continue; }
          if (it.since > due + DAY) continue;
          lines.push({ label: it.kind === 'plan' ? `${cap(ladder)} · ${cap(it.code)} plan` : it.name, amount: priceOf(it), kind: it.kind });
        }
        if (tid === '0031' && due > upgradeAt && due - upgradeAt < 31 * DAY) lines.push({ label: 'Plan changed Growth → Business, prorated', amount: 1050, kind: 'proration' });
        if (tid === '0017' && periodOf(due) === periodOf(addMonths(A, -1, 1))) lines.push({ label: 'Top-up: 200 extra orders', amount: 600, kind: 'topup' });
        if (!lines.length) { k++; due = at(addMonths(due, 1, sub.billDay), 0, 0); continue; }
        const inv = invoice(db, { shopId: tid, issuedAt: due - 7 * DAY + r.int(0, 3) * 3600e3, dueAt: due, period: periodOf(due), lines });
        const unpaid = (lastDue && Math.abs(due - lastDue) < DAY) || (kind === 'due' && due > A - DAY);
        // the board's unpaid bills wait for a call; other upcoming bills the owners pay themselves (billing.js)
        if (unpaid) inv.hold = true;
        if (!unpaid && due <= A + 7 * DAY && (due <= A || r.chance(0.3))) {
          // paid: most from the panel, some on a call, a few at the bank; mostly on time
          const late = r.chance(0.18) ? r.int(1, 6) : 0;
          const paidAt = Math.min(A - 3600e3, due - (late ? -late * DAY : r.int(0, 3) * DAY) + r.int(9, 21) * 3600e3);
          if (paidAt > due + 30 * DAY || paidAt < inv.issuedAt) { /* keep it simple */ }
          const via = x.pays === 'card' ? 'auto' : x.pays === 'bank' ? 'call' : tid === '0031' && due > addMonths(A, -3, 1) ? 'call' : r.chance(0.68) ? 'panel' : 'call';
          const method = x.pays === 'card' ? 'Card' : x.pays === 'bank' ? 'Bank transfer' : x.pays === 'nagad' ? 'Nagad' : r.chance(0.85) ? 'bKash' : 'Nagad';
          pay(db, { invoiceId: inv.id, shopId: tid, amount: inv.total, method, via, at: Math.max(inv.issuedAt + 3600e3, paidAt), by: via === 'panel' ? 'Owner' : via === 'auto' ? 'Auto-charge' : r.pick(COLLECT_BY), txId: txid(r) });
        }
        k++;
        due = at(addMonths(due, 1, sub.billDay), 0, 0);
      }
      sub.nextDue = due;
      // one-off items were billed in the months above
      for (const it of sub.items) if (it.period === 'Once') it.billedIn = 'seed';
      if (kind === 'paused') sub.pausedAt = A - 12 * DAY;
      if (kind === 'cancelled') { sub.cancelledAt = A - (x.last || 30) * DAY; sub.cancelReason = r.pick(['Closed the business', 'Moved to another platform', 'Too expensive']); }
      if (kind === 'archived') { sub.cancelledAt = A - 120 * DAY; sub.archivedAt = A - 80 * DAY; sub.cancelReason = 'Closed the business'; }
    }

    // ---- provisioning run ----
    if (A - created < 40 * DAY || kind === 'failed' || kind === 'running') {
      const stages = STAGES.map(([key, , ms]) => ({ key, ms: Math.round(ms * (0.6 + r() * 0.9)) }));
      const run = { id: 'RUN-' + pad4(db.seq.run++), shopId: tid, startedAt: created, stages, failedAt: null, error: null, retried: 0 };
      if (kind === 'failed') { run.failedAt = 'domain'; run.error = `The subdomain ${slug}.gridcommerce.com.bd is reserved by an archived store. Pick a new name with the owner, then retry; the first four stages are kept.`; }
      db.runs.push(run);
    }
  }

  // ---- collection calls, adjustments, credits, notes, events ------------------------------------
  const inv = (tid) => db.invoices.filter((i) => i.shopId === tid && !i.noCharge).sort((a, b) => b.dueAt - a.dueAt)[0];
  const dgh = inv('0031');
  call(db, { shopId: '0031', invoiceId: dgh.id, at: at(A - 3 * DAY, 16, 40), by: 'Rakib Hasan', outcome: 'noanswer', note: 'No answer · SMS pay link sent' });
  const sunday = at(A + nextSunday(A) * DAY, 11);
  call(db, { shopId: '0031', invoiceId: dgh.id, at: at(A - 2 * DAY, 20, 15), by: 'Rakib Hasan', outcome: 'promised', note: 'Promised to pay by bKash on ' + weekday(sunday), method: 'bKash', promiseAt: sunday, nextAt: sunday });
  const bb = inv('0044');
  for (let i = 3; i >= 1; i--) call(db, { shopId: '0044', invoiceId: bb.id, at: at(A - i * 2 * DAY, 15, 10 + i), by: 'Rakib Hasan', outcome: 'noanswer', note: 'No answer', nextAt: i === 1 ? at(A, 16) : null });
  const rs = inv('0038');
  call(db, { shopId: '0038', invoiceId: rs.id, at: at(A - 4 * DAY, 12, 5), by: 'Rakib Hasan', outcome: 'later', note: 'Asked to call after Puja', nextAt: at(A + 16 * DAY, 11) });
  const gb = inv('0023');
  call(db, { shopId: '0023', invoiceId: gb.id, at: at(A, 9, 0), by: 'System', outcome: 'reminder', note: 'Panel reminder sent 09:00', nextAt: at(A + DAY, 11) });

  // adjustments (ADJ-0039 … 0042 as on the board, plus small credits this month)
  const sc = db.invoices.filter((i) => i.shopId === '0017' && !i.noCharge).sort((a, b) => b.dueAt - a.dueAt)[1];
  const smallCredits = [['0007', 300, 'GOODWILL'], ['0012', 500, 'OUTAGE-CREDIT'], ['0066', 400, 'OUTAGE-CREDIT'], ['0047', 500, 'OUTAGE-CREDIT'], ['0009', 250, 'BILLING-ERROR'], ['0052', 350, 'OUTAGE-CREDIT']];
  adjust(db, { id: 'ADJ-0039', shopId: '0038', invoiceId: rs.id, type: 'waive', amount: rs.total, reason: 'GOODWILL', note: 'Waive the bill · store closed for flood repairs', by: 'Rakib Hasan', at: at(A - 5 * DAY, 13), status: 'rejected', decidedBy: 'Nusrat Islam', decidedAt: at(A - 4 * DAY, 10), decisionNote: 'Store was trading online during the repairs.' });
  adjust(db, { id: 'ADJ-0040', shopId: '0017', invoiceId: sc.id, type: 'credit', amount: 500, reason: 'OUTAGE-CREDIT', linked: 'INC-108 · courier outage', note: 'Credit ৳500 · courier outage, 2 days', by: 'Farhana Akter', at: sc.dueAt + 2 * DAY, status: 'approved', decidedBy: 'Mahin Khan', decidedAt: sc.dueAt + 2 * DAY + 3600e3 });
  const mt = inv('0012');
  adjust(db, { id: 'ADJ-0041', shopId: '0012', invoiceId: 'next', type: 'discount', amount: 12000, pct: 20, reason: 'PREPAY-DISCOUNT', note: 'Discount 20% for yearly prepay', by: 'Mahin Khan', at: at(A - DAY, 15, 20), status: 'pending' });
  adjust(db, { id: 'ADJ-0042', shopId: '0031', invoiceId: dgh.id, type: 'credit', amount: 833, reason: 'OUTAGE-CREDIT', linked: 'INC-114 · Steadfast webhook delays', note: 'Credit for 10 days of Steadfast delivery failures caused by the courier outage.', by: 'Farhana Akter', at: at(A, 10, 40), status: 'pending', approver: 'Nusrat Islam', remindedAt: at(A, 13) });
  smallCredits.forEach(([tid, amt, reason], i) => {
    const target = inv(tid);
    if (!target || !mt) return;
    adjust(db, { id: 'ADJ-' + pad4(30 + i), shopId: tid, invoiceId: target.id, type: 'credit', amount: amt, reason, note: reason === 'GOODWILL' ? 'Goodwill credit after a late delivery of the theme' : reason === 'BILLING-ERROR' ? 'SMS pack billed twice' : 'Credit for courier outage days', by: i % 2 ? 'Farhana Akter' : 'Rakib Hasan', at: at(A - (i + 2) * DAY, 12), status: 'approved', decidedBy: 'auto', decidedAt: at(A - (i + 2) * DAY, 12) });
  });

  // notes and tasks on the Merchant page
  note(db, { shopId: '0031', by: 'Rakib Hasan', at: A - 30 * DAY, pinned: true, kind: 'note', text: 'Arif prefers calls after 20:00. Pays by bKash; last two months paid on our call, not from the panel.' });
  note(db, { shopId: '0031', by: 'Farhana Akter', at: at(A, 10, 45), kind: 'task', due: A, text: `Call about ${dgh.id} after Steadfast is fixed; offer the ৳833 outage credit (ADJ-0042).` });
  note(db, { shopId: '0044', by: 'Rakib Hasan', at: A - 6 * DAY, kind: 'note', text: 'Owner travels to Chattogram port often; try the manager Sabina if no answer.' });

  // things the console saw happen (shown in Activity next to the billing records)
  ev(db, '0031', at(A, 10, 7), 'staff', 'Farhana Akter replied on ticket T-2291');
  ev(db, '0031', at(A, 10, 2), 'owner', 'Arif Hossain signed in from Dhaka · Chrome on Android');
  ev(db, '0031', at(A, 9, 48), 'team', 'Sumon Roy updated prices on 6 products');
  ev(db, '0031', at(A - DAY, 14, 33), 'staff', 'Store opened by support with the owner\'s PIN, 6 min');
  ev(db, '0031', at(A - 8 * DAY, 11, 30), 'staff', 'Warehouse trial started for 14 days, by Farhana Akter');
  ev(db, '0031', shopById(db, '0031').resetAt, 'staff', 'Password reset link sent by SMS, by Farhana Akter');
  ev(db, '0031', addMonths(A, -7, 27), 'staff', 'Plan changed Growth → Business, prorated ৳1,050');
  for (const s of db.shops) ev(db, s.id, s.createdAt, 'owner', s.src === 'Physical visit' ? 'Store created on a field visit' : 'Store created · came from ' + s.src);
  return db;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/** Days from `ms` to the next Sunday (1–7). */
const nextSunday = (ms) => (7 - new Date(ms + TZ).getUTCDay()) % 7 || 7;
const txid = (r) => Array.from({ length: 9 }, () => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[r.int(0, 33)]).join('');
const shopById = (db, id) => db.shops.find((s) => s.id === id);

/** Add an invoice with the next number for its year. */
export function invoice(db, { shopId, issuedAt, dueAt, period, lines, noCharge = false }) {
  const y = yearOf(issuedAt);
  db.seq.inv[y] = (db.seq.inv[y] || 0) + 1;
  const total = lines.reduce((t, l) => t + (l.amount || 0), 0);
  const inv = { id: 'TMP-' + (db.invoices.length + 1), y, shopId, issuedAt, dueAt, period, lines, total, noCharge: noCharge || total === 0, voided: false, charges: [], reminders: [] };
  db.invoices.push(inv);
  return inv;
}
/** Number the seeded invoices in the order they were issued (INV-2026-0912 …); returns old id -> new id. */
function numberInvoices(db) {
  const by = {};
  const map = {};
  const base = (y) => (y >= 2026 ? 380 : 120);
  db.invoices.slice().sort((a, b) => a.issuedAt - b.issuedAt).forEach((inv) => {
    by[inv.y] = (by[inv.y] || 0) + 1;
    const id = `INV-${inv.y}-${pad4(by[inv.y] + base(inv.y))}`;
    map[inv.id] = id;
    inv.id = id;
  });
  db.seq.inv = {};
  for (const y of Object.keys(by)) db.seq.inv[y] = by[y] + base(Number(y));
  return map;
}
export function pay(db, p) {
  const rec = { id: 'PAY-' + pad4(db.seq.pay++), status: 'ok', ...p };
  db.payments.push(rec);
  return rec;
}
export function call(db, c) {
  const rec = { id: 'CALL-' + pad4(db.seq.call++), promiseAt: null, nextAt: null, ...c };
  db.calls.push(rec);
  return rec;
}
export function adjust(db, a) {
  const rec = { linked: null, pct: null, approver: null, decidedBy: null, decidedAt: null, decisionNote: null, cnId: null, questions: [], ...a };
  db.adjustments.push(rec);
  return rec;
}
export function note(db, n) {
  const rec = { id: 'N' + db.seq.note++, pinned: false, kind: 'note', done: false, ...n };
  db.notes.push(rec);
  return rec;
}
export function ev(db, shopId, atMs, kind, text) {
  db.events.push({ id: 'E' + db.seq.ev++, shopId, at: atMs, kind, text });
}

/** The seed with invoice numbers and credit notes in place. */
export function seedDB(anchor) {
  const db = buildSeed(anchor);
  // invoice numbers follow the date each bill was issued; everything that points at a bill follows the new number
  const map = numberInvoices(db);
  for (const coll of [db.payments, db.calls, db.adjustments]) for (const x of coll) if (map[x.invoiceId]) x.invoiceId = map[x.invoiceId];
  for (const n of db.notes) n.text = n.text.replace(/TMP-\d+/g, (m) => map[m] || m);
  // approved credits are credit notes (CN-2026-0014 …)
  db.seq.cn = { [yearOf(anchor)]: 13 };
  for (const a of db.adjustments.filter((x) => x.status === 'approved' && x.type === 'credit').sort((x, y) => x.decidedAt - y.decidedAt)) {
    const y = yearOf(a.decidedAt);
    db.seq.cn[y] = (db.seq.cn[y] || 0) + 1;
    const id = `CN-${y}-${pad4(db.seq.cn[y])}`;
    db.credits.push({ id, invoiceId: a.invoiceId, shopId: a.shopId, amount: a.amount, reason: a.reason, adjId: a.id, at: a.decidedAt, by: a.by });
    a.cnId = id;
  }
  return db;
}
