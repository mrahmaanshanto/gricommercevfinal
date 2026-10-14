// platform/services — GridCommerce's Services shop (Module B, work package of 14 Oct 2026): merchants buy expert help
// (SEO, Meta / Google ads, branding, store design, product upload, migration, setup, content) and GridCommerce's staff and
// partner experts deliver it. Shared by both sides, like a server would be: the merchant panel's Services pages and the
// super admin's Services area read and write this one store (browser storage gc.services, event gc:services).
// It reads no other lib; the super admin side copies its money into Finance (lib/admin/servicesSync.js).
//
//   Catalogue   services: { id, name, cat, icon, blurb, gets[], cycle 'oneoff'|'monthly', packages[{ id, name, price, days,
//               revisions, includes[] }], addons[{ id, name, price }], brief[{ id, label, type, options?, req, help? }],
//               faq[{ q, a }], samples[], access { needed, area, minutes } (store access the work needs), editions[],
//               plans[] (empty = all), status 'live'|'paused', financeId (the Finance › Income service, when there is one) }
//   Experts     { id, name, kind 'staff'|'partner', skills[serviceIds], capacity, commission (% to a partner), rating, active }
//   Orders      { id 'SO-1012', invNo, shopId, shopName, serviceId, pkgId, addons[], cycle, fee, vatPct, vat, total, brief{},
//               files[], paid { method, txId, at }, status, expertId, priority, startedAt, dueAt, pausedMs, waitingSince,
//               revisionsUsed, messages[], deliverables[], reports[] (monthly), access, quotes[], refunds[], rating,
//               history[], closedAt, closeReason }
//   Statuses    brief (Brief received) → progress (In progress) ⇄ waiting (Waiting for you; the deadline stops) → qa (In
//               review: a lead checks it) → delivered (the merchant approves or asks for a change) → closed. A monthly
//               service delivers a report each month and goes back to In progress. cancelled · refunded end early.
//               Quiet merchants: Waiting for you for QUIET_DAYS (14) closes the order by itself, with notice from day 10.
//   Money       billables(order) are the charges (the first payment, accepted extra-work quotes, each month of a retainer);
//               payables(order) what a partner expert earns (commission % of the fee, when the work is approved);
//               refunds: full before work starts, part after (reason, approved by someone else). Ad spend is never ours:
//               the brief asks the budget, the merchant pays Meta / Google directly.
// Front end only. A real build keeps this on the server; payments go through the gateway, store access through the
// access-session service, files through storage.

export const KEY = 'gc.services';
export const EVENT = 'gc:services';
export const SELF_SHOP = '0090';                 // the merchant panel's own demo store (lib/platform/seed.js)
export const SELF_NAME = 'Dazzle Shop';
export const QUIET_DAYS = 14;
export const QUIET_WARN = 10;
const DAY = 864e5, H = 3600e3, MIN = 6e4;
const isBrowser = typeof window !== 'undefined';

export const CATS = [
  { id: 'grow', name: 'Grow sales', icon: 'trending-up' },
  { id: 'look', name: 'Look', icon: 'palette' },
  { id: 'setup', name: 'Setup', icon: 'wrench' },
  { id: 'content', name: 'Content', icon: 'pen-line' },
];
export const catName = (id) => (CATS.find((c) => c.id === id) || { name: id }).name;

export const STATUS = {
  brief: { label: 'Brief received', tone: 'info', step: 0 },
  progress: { label: 'In progress', tone: 'primary', step: 1 },
  waiting: { label: 'Waiting for you', tone: 'warning', step: 2, admin: 'Waiting for the merchant' },
  qa: { label: 'In review', tone: 'info', step: 3, admin: 'Quality check' },
  delivered: { label: 'Delivered', tone: 'success', step: 4, admin: 'Delivered · merchant to approve' },
  closed: { label: 'Closed', tone: 'neutral', step: 5 },
  cancelled: { label: 'Cancelled', tone: 'neutral', step: 5 },
  refunded: { label: 'Refunded', tone: 'neutral', step: 5 },
};
export const STEPS = ['brief', 'progress', 'waiting', 'qa', 'delivered', 'closed'];
export const statusLabel = (s, admin) => (STATUS[s] ? (admin && STATUS[s].admin) || STATUS[s].label : s);
export const PAY_METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['card', 'Card'], ['credits', 'GridCommerce credits']];
export const payLabel = (k) => (PAY_METHODS.find((x) => x[0] === k) || [k, k])[1];
/** What an expert may open in the store (the owner approves it, for a set time). */
export const AREAS = [['products', 'Products only'], ['online-store', 'Online Store only'], ['all', 'The whole store']];
export const areaLabel = (k) => (AREAS.find((x) => x[0] === k) || [k, k])[1];
export const REFUND_REASONS = ['Work not started', 'Not what was agreed', 'Late delivery', 'Merchant cancelled', 'Goodwill', 'Other'];
export const FIELD_TYPES = [['text', 'Short text'], ['textarea', 'Long text'], ['url', 'Web address'], ['money', 'Amount (৳)'], ['number', 'Number'], ['select', 'Pick one'], ['files', 'Files']];

// ---- clock -------------------------------------------------------------------------------------------------------------
export function now() {
  if (!isBrowser) return 0;
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}

// ---- the catalogue (seed) -----------------------------------------------------------------------------------------------
const P = (id, name, price, days, revisions, includes) => ({ id, name, price, days, revisions, includes });
const F = (id, label, type, req = false, extra = {}) => ({ id, label, type, req, ...extra });
const BRAND_FILES = F('files', 'Brand files (logo, colours, old designs)', 'files');
const SERVICES = [
  {
    id: 'seo', name: 'SEO', cat: 'grow', icon: 'search-check', cycle: 'monthly', financeId: null,
    blurb: 'Rank higher on Google for what your customers search, month after month.',
    gets: ['Keyword plan for your products', 'Titles and descriptions written for every page', 'Technical fixes (speed, redirects, schema)', 'A report every month'],
    packages: [
      P('starter', 'Starter', 8000, 30, 1, ['Up to 50 products', '10 keywords tracked', 'Monthly report']),
      P('standard', 'Standard', 15000, 30, 2, ['Up to 200 products', '30 keywords tracked', '2 blog posts a month', 'Monthly report and a call']),
      P('pro', 'Pro', 25000, 30, 3, ['Whole catalogue', '60 keywords tracked', '4 blog posts a month', 'Google Business posts', 'Fortnightly call']),
    ],
    addons: [{ id: 'blog2', name: '2 extra blog posts a month', price: 4000 }, { id: 'gbp', name: 'Google Business profile set-up', price: 3000 }],
    brief: [F('goal', 'What should SEO bring you?', 'textarea', true, { help: 'More orders from Google, a product line, a city …' }), F('rivals', 'Competitors you watch', 'textarea', false, { help: 'Their websites, one per line.' }), F('focus', 'Products or categories to push first', 'textarea', true), F('site', 'Your website', 'url', true, { placeholder: 'https://dazzleshop.com.bd' })],
    faq: [{ q: 'When will I see results?', a: 'Usually in 2–3 months. The monthly report shows what moved.' }, { q: 'Can I stop any time?', a: 'Yes. The service stops at the end of the month you are in.' }],
    samples: ['Mobile shop in Dhanmondi: 3.1× Google visits in 4 months', 'Fashion page: top 3 for “jamdani saree online”'],
    access: { needed: true, area: 'online-store', minutes: 60 }, editions: ['online', 'retail-online', 'full'], plans: [], status: 'live',
  },
  {
    id: 'meta-ads', name: 'Meta ads management', cat: 'grow', icon: 'megaphone', cycle: 'monthly', financeId: null,
    blurb: 'Facebook and Instagram ads run for you: audiences, creatives and weekly tuning.',
    gets: ['Campaign plan', 'Ad creatives and copy in Bangla and English', 'Pixel and catalogue checked', 'Weekly tuning and a monthly report'],
    packages: [
      P('starter', 'Starter', 10000, 30, 1, ['Up to ৳50,000 ad spend a month', '2 campaigns', '6 creatives']),
      P('standard', 'Standard', 18000, 30, 2, ['Up to ৳2,00,000 ad spend', '4 campaigns', '12 creatives', 'Retargeting']),
      P('pro', 'Pro', 30000, 30, 3, ['Any ad spend', 'Unlimited campaigns', '20 creatives', 'Catalogue and video ads']),
    ],
    addons: [{ id: 'video', name: '2 short video ads', price: 6000 }],
    brief: [F('goal', 'What should the ads do?', 'textarea', true), F('spend', 'Ad spend a month (paid to Meta by you)', 'money', true, { help: 'Kept apart from our fee: you pay Meta directly.' }), F('audience', 'Who buys from you?', 'textarea', true), F('page', 'Facebook page', 'url', true)],
    faq: [{ q: 'Is the ad spend in your price?', a: 'No. You pay Meta for the ads; our fee is for running them.' }],
    samples: ['Gadget shop: cost per order down from ৳310 to ৳140 in 6 weeks'],
    access: { needed: false }, editions: ['online', 'retail-online', 'comms', 'full'], plans: [], status: 'live',
  },
  {
    id: 'google-ads', name: 'Google ads management', cat: 'grow', icon: 'badge-dollar-sign', cycle: 'monthly', financeId: null,
    blurb: 'Search and Shopping ads that show your products when people are ready to buy.',
    gets: ['Search and Performance Max campaigns', 'Merchant Center feed checked', 'Negative keywords every week', 'A monthly report'],
    packages: [
      P('starter', 'Starter', 9000, 30, 1, ['Up to ৳50,000 ad spend', 'Search campaign']),
      P('standard', 'Standard', 16000, 30, 2, ['Up to ৳2,00,000 ad spend', 'Search + Shopping']),
    ],
    addons: [],
    brief: [F('goal', 'What should the ads do?', 'textarea', true), F('spend', 'Ad spend a month (paid to Google by you)', 'money', true, { help: 'Kept apart from our fee: you pay Google directly.' }), F('site', 'Your website', 'url', true)],
    faq: [{ q: 'Do I need Google Merchant Center?', a: 'For Shopping ads, yes. We connect it with you (Sales channels › Google).' }],
    samples: [], access: { needed: false }, editions: ['online', 'retail-online', 'full'], plans: ['growth', 'business'], status: 'live',
  },
  {
    id: 'branding', name: 'Branding', cat: 'look', icon: 'palette', cycle: 'oneoff', financeId: null,
    blurb: 'A logo, colours and a small brand kit that make your shop easy to remember.',
    gets: ['Logo in 3 ideas', 'Colours and fonts', 'Social media kit', 'Brand guide (PDF)'],
    packages: [
      P('starter', 'Starter', 12000, 7, 2, ['Logo (2 ideas)', 'Colours and fonts']),
      P('standard', 'Standard', 25000, 12, 3, ['Logo (3 ideas)', 'Colours and fonts', 'Social media kit', 'Brand guide']),
      P('pro', 'Pro', 45000, 20, 4, ['Everything in Standard', 'Packaging and receipt design', 'Shop sign artwork']),
    ],
    addons: [{ id: 'cards', name: 'Business cards and letterhead', price: 4000 }],
    brief: [F('about', 'Tell us about your shop', 'textarea', true), F('likes', 'Brands you like (and why)', 'textarea'), F('words', '3 words your brand should feel like', 'text', true), BRAND_FILES],
    faq: [{ q: 'Who owns the logo?', a: 'You do, with the source files, once the order is approved.' }],
    samples: ['Pixel Studio · 40+ shops branded'], access: { needed: false }, editions: [], plans: [], status: 'live',
  },
  {
    id: 'store-design', name: 'Custom store design', cat: 'look', icon: 'layout-template', cycle: 'oneoff', financeId: 'SV-04',
    blurb: 'Your online store designed to your brand: home page, product and category pages.',
    gets: ['Home, product and category pages designed', 'Set up in your Online Store', 'Phone and desktop checked'],
    packages: [
      P('starter', 'Starter', 25000, 15, 2, ['Home page', 'Theme colours and fonts']),
      P('standard', 'Standard', 45000, 21, 3, ['Home, product and category pages', 'Header and footer', 'Banners for 2 offers']),
      P('pro', 'Pro', 80000, 30, 4, ['Everything in Standard', 'Landing page for a campaign', 'Brand photos styled']),
    ],
    addons: [{ id: 'landing', name: 'One more landing page', price: 8000 }],
    brief: [F('site', 'Your website', 'url', true), F('like', 'Websites you like', 'textarea', true), F('must', 'What must be on the home page?', 'textarea'), BRAND_FILES],
    faq: [], samples: ['Signal-based store for Dhaka Gadget Hub'],
    access: { needed: true, area: 'online-store', minutes: 60 }, editions: ['online', 'retail-online', 'full'], plans: [], status: 'live',
  },
  {
    id: 'product-upload', name: 'Product upload', cat: 'setup', icon: 'package-plus', cycle: 'oneoff', financeId: 'SV-05',
    blurb: 'We add your products: titles, prices, variants, photos and categories.',
    gets: ['Products added from your sheet or photos', 'Variants and prices set', 'Categories and tags'],
    packages: [
      P('starter', '100 products', 1500, 3, 1, ['Up to 100 products']),
      P('standard', '300 products', 4000, 5, 1, ['Up to 300 products', 'Photo clean-up']),
      P('pro', '1,000 products', 12000, 10, 2, ['Up to 1,000 products', 'Photo clean-up', 'SEO titles']),
    ],
    addons: [{ id: 'desc', name: 'Short description for each product', price: 2000 }],
    brief: [F('sheet', 'Your product list (Excel, CSV or photos)', 'files', true), F('notes', 'Anything we should know', 'textarea')],
    faq: [{ q: 'What if I have no list?', a: 'Send photos of the products and the prices; we type them in.' }],
    samples: [], access: { needed: true, area: 'products', minutes: 60 }, editions: [], plans: [], status: 'live',
  },
  {
    id: 'migration', name: 'Move from another platform', cat: 'setup', icon: 'arrow-right-left', cycle: 'oneoff', financeId: 'SV-02',
    blurb: 'Products, customers and past orders moved from WooCommerce, Shopify or a spreadsheet.',
    gets: ['Products and stock', 'Customers', 'Past orders', 'Old links redirected'],
    packages: [
      P('starter', 'Basic', 8000, 5, 1, ['Products and customers']),
      P('standard', 'Full', 15000, 7, 2, ['Products, customers and past orders', 'Redirects for old links']),
      P('pro', 'Full + checks', 30000, 10, 2, ['Everything in Full', 'Side-by-side check before you switch']),
    ],
    addons: [],
    brief: [F('from', 'Moving from', 'select', true, { options: ['WooCommerce', 'Shopify', 'Daraz', 'Spreadsheet', 'Other'] }), F('site', 'Your old website', 'url'), F('count', 'About how many products?', 'number', true)],
    faq: [], samples: [], access: { needed: true, area: 'all', minutes: 60 }, editions: [], plans: [], status: 'live',
  },
  {
    id: 'store-setup', name: 'Store setup', cat: 'setup', icon: 'store', cycle: 'oneoff', financeId: 'SV-01',
    blurb: 'Payments, couriers, taxes, staff and notifications set up with you on a call.',
    gets: ['Payments and couriers connected', 'Taxes and receipts set', 'Staff and roles', 'A training call'],
    packages: [P('starter', 'Basic', 5000, 3, 1, ['Payments and couriers']), P('standard', 'Complete', 10000, 5, 1, ['Everything above', 'Staff, POS and receipts', 'Training call'])],
    addons: [],
    brief: [F('needs', 'What should be ready?', 'textarea', true), F('call', 'Best time for a call', 'text')],
    faq: [], samples: [], access: { needed: true, area: 'all', minutes: 60 }, editions: [], plans: [], status: 'live',
  },
  {
    id: 'descriptions', name: 'Product descriptions', cat: 'content', icon: 'file-pen-line', cycle: 'oneoff', financeId: null,
    blurb: 'Clear product descriptions in Bangla and English that answer buyers’ questions.',
    gets: ['Short and long descriptions', 'Specs table', 'SEO title and description'],
    packages: [P('starter', '50 products', 3000, 5, 1, ['50 products']), P('standard', '150 products', 8000, 10, 2, ['150 products']), P('pro', '500 products', 22000, 20, 2, ['500 products'])],
    addons: [{ id: 'bn', name: 'Bangla and English both', price: 2500 }],
    brief: [F('tone', 'How should it sound?', 'select', true, { options: ['Friendly', 'Expert', 'Short and simple'] }), F('which', 'Which products first?', 'textarea', true)],
    faq: [], samples: [], access: { needed: true, area: 'products', minutes: 60 }, editions: [], plans: [], status: 'live',
  },
  {
    id: 'photo-guide', name: 'Product photography guidance', cat: 'content', icon: 'camera', cycle: 'oneoff', financeId: null,
    blurb: 'Take product photos that sell with your phone: a session and a simple setup list.',
    gets: ['A 1-hour session (video call or at your shop)', 'Lighting and background setup', 'Photo checklist'],
    packages: [P('starter', 'Video call', 4000, 5, 0, ['1-hour video call', 'Checklist']), P('standard', 'At your shop', 7000, 7, 0, ['1 hour at your shop in Dhaka', 'Checklist', '10 photos edited'])],
    addons: [],
    brief: [F('what', 'What do you sell?', 'textarea', true), F('when', 'Good days and times', 'text', true)],
    faq: [], samples: [], access: { needed: false }, editions: [], plans: [], status: 'paused',
  },
];

const EXPERTS = [
  { id: 'tanvir', name: 'Tanvir Alam', kind: 'staff', skills: ['seo', 'google-ads', 'descriptions'], capacity: 6, commission: 0, rating: 4.7, phone: '+880 1711-220031', email: 'tanvir@gridcommerce.net', active: true },
  { id: 'sumaiya', name: 'Sumaiya Ahmed', kind: 'staff', skills: ['store-design', 'branding'], capacity: 4, commission: 0, rating: 4.8, phone: '+880 1711-220032', email: 'sumaiya@gridcommerce.net', active: true },
  { id: 'nabila', name: 'Nabila Chowdhury', kind: 'staff', skills: ['descriptions', 'product-upload', 'store-setup'], capacity: 8, commission: 0, rating: 4.6, phone: '+880 1711-220033', email: 'nabila@gridcommerce.net', active: true },
  { id: 'adscraft', name: 'AdsCraft BD', kind: 'partner', skills: ['meta-ads', 'google-ads'], capacity: 10, commission: 65, rating: 4.5, phone: '+880 1819-440010', email: 'team@adscraft.com.bd', active: true },
  { id: 'pixel', name: 'Pixel Studio', kind: 'partner', skills: ['branding', 'photo-guide', 'store-design'], capacity: 5, commission: 60, rating: 4.9, phone: '+880 1913-550020', email: 'hello@pixelstudio.bd', active: true },
  { id: 'datamove', name: 'DataMove', kind: 'partner', skills: ['migration', 'product-upload'], capacity: 6, commission: 55, rating: 4.4, phone: '+880 1515-660030', email: 'ops@datamove.com.bd', active: true },
];

// ---- seed orders -----------------------------------------------------------------------------------------------------------
const VAT = 15;
const money = (fee, vatPct = VAT) => { const vat = Math.round((fee * vatPct) / 100); return { fee, vatPct, vat, total: fee + vat }; };
function seedOrders(t) {
  const out = [];
  let n = 1001;
  const mk = (o) => {
    const svc = SERVICES.find((s) => s.id === o.serviceId);
    const pkg = svc.packages.find((p) => p.id === o.pkgId);
    const addFee = (o.addons || []).reduce((a, id) => a + ((svc.addons.find((x) => x.id === id) || {}).price || 0), 0);
    const paidAt = t - o.daysAgo * DAY;
    const startedAt = o.status === 'brief' ? null : paidAt + 4 * H;
    const id = 'SO-' + n++;
    const order = {
      id, invNo: 'SINV-' + id.slice(3), shopId: o.shopId, shopName: o.shopName, serviceId: svc.id, pkgId: pkg.id, addons: o.addons || [], cycle: svc.cycle,
      ...money(pkg.price + addFee), brief: o.brief || {}, files: o.files || [],
      paid: { method: o.method || 'bkash', txId: 'TXS' + String(paidAt).slice(-8), at: paidAt },
      status: o.status, expertId: o.expertId || null, priority: o.priority || 'normal', startedAt, dueAt: startedAt ? startedAt + pkg.days * DAY : null,
      pausedMs: o.pausedMs || 0, waitingSince: o.status === 'waiting' ? t - (o.waitingDays || 1) * DAY : null, revisionsUsed: o.revisionsUsed || 0,
      qa: true, messages: [], deliverables: o.deliverables || [], reports: o.reports || [], access: o.access || { status: 'none' }, quotes: [], refunds: [],
      rating: o.rating || null, history: [{ at: paidAt, by: o.shopName, text: 'Ordered and paid ' + payLabel(o.method || 'bkash') }], closedAt: o.status === 'closed' ? t - (o.closedDays || 2) * DAY : null, closeReason: o.status === 'closed' ? 'Approved' : '',
    };
    (o.msgs || []).forEach(([from, name, text, hoursAgo, internal]) => order.messages.push({ id: id + '-M' + (order.messages.length + 1), at: t - hoursAgo * H, from, name, text, files: [], internal: !!internal }));
    out.push(order);
    return order;
  };
  mk({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: 'product-upload', pkgId: 'standard', daysAgo: 3, status: 'progress', expertId: 'nabila', method: 'nagad',
    brief: { notes: 'Accessories first: cases, chargers, cables. Prices in the sheet include VAT.' }, files: [{ name: 'dazzle-accessories.xlsx', size: '84 KB', by: SELF_NAME, at: t - 3 * DAY }],
    access: { status: 'used', area: 'products', minutes: 60, askedAt: t - 2.5 * DAY, approvedAt: t - 2.4 * DAY },
    msgs: [['expert', 'Nabila Chowdhury', 'Got the sheet, thank you. 212 accessories are in so far. Phones next.', 20], ['merchant', SELF_NAME, 'Great. Please keep the warranty line on each charger.', 18], ['expert', 'Nabila Chowdhury', 'Will do. Done by Friday.', 17]] });
  mk({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: 'branding', pkgId: 'starter', daysAgo: 26, status: 'closed', expertId: 'pixel', method: 'card', closedDays: 12, revisionsUsed: 1,
    deliverables: [{ id: 'D1', name: 'dazzle-logo-final.zip', note: 'Logo in all sizes, colours and fonts', at: t - 13 * DAY, by: 'Pixel Studio', version: 2 }],
    rating: { stars: 5, text: 'Loved the new logo.', at: t - 12 * DAY } });
  mk({ shopId: '0007', shopName: 'Rongdhonu Fashion', serviceId: 'meta-ads', pkgId: 'standard', daysAgo: 40, status: 'progress', expertId: 'adscraft',
    brief: { spend: '120000', goal: 'Eid sales of sarees and panjabis' }, reports: [{ id: 'R1', month: 1, title: 'Month 1 report', summary: 'Cost per order ৳182 (target ৳200). Best ad: the jamdani carousel.', kpis: [['Orders from ads', '412'], ['Cost per order', '৳182'], ['Return on ad spend', '4.1×']], status: 'sent', at: t - 9 * DAY, rating: { stars: 4, text: '' } }] });
  mk({ shopId: '0012', shopName: 'Mohona Traders', serviceId: 'migration', pkgId: 'standard', daysAgo: 6, status: 'waiting', expertId: 'datamove', waitingDays: 2, pausedMs: 0,
    msgs: [['expert', 'DataMove', 'We need the WooCommerce admin login (or an export) to move past orders.', 50]] });
  mk({ shopId: '0017', shopName: 'Shonali Crafts', serviceId: 'store-design', pkgId: 'standard', daysAgo: 18, status: 'qa', expertId: 'sumaiya', priority: 'high',
    deliverables: [{ id: 'D1', name: 'shonali-home-v1.pdf', note: 'Home, product and category pages', at: t - 1 * DAY, by: 'Sumaiya Ahmed', version: 1 }] });
  mk({ shopId: '0031', shopName: 'Dhaka Gadget Hub', serviceId: 'seo', pkgId: 'starter', daysAgo: 35, status: 'delivered', expertId: 'tanvir',
    reports: [{ id: 'R1', month: 1, title: 'Month 1 report', summary: 'Titles and descriptions written for 48 products; 6 keywords on page 1.', kpis: [['Google visits', '+64%'], ['Keywords on page 1', '6 of 10'], ['Orders from Google', '31']], status: 'sent', at: t - 2 * DAY }] });
  mk({ shopId: '0044', shopName: 'Bindu Beauty', serviceId: 'descriptions', pkgId: 'standard', daysAgo: 15, status: 'progress', expertId: 'nabila', priority: 'high' });
  mk({ shopId: '0066', shopName: 'Mehedi Traders', serviceId: 'store-setup', pkgId: 'standard', daysAgo: 1, status: 'brief', brief: { needs: 'bKash, Steadfast and POS for 2 counters' } });
  mk({ shopId: '0072', shopName: 'Sabuj Bazar', serviceId: 'google-ads', pkgId: 'starter', daysAgo: 0.3, status: 'brief', brief: { spend: '40000', goal: 'Grocery orders in Sylhet' } });
  return { list: out, seq: n };
}

function seed(t) {
  const o = seedOrders(t);
  return { v: 1, services: JSON.parse(JSON.stringify(SERVICES)), experts: JSON.parse(JSON.stringify(EXPERTS)), orders: o.list, seq: { order: o.seq, refund: 1, quote: 1 }, settings: { vatPct: VAT, qaDefault: true, quietDays: QUIET_DAYS } };
}

// ---- storage ------------------------------------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
const EMPTY = { v: 1, services: SERVICES, experts: EXPERTS, orders: [], seq: { order: 1001, refund: 1, quote: 1 }, settings: { vatPct: VAT, qaDefault: true, quietDays: QUIET_DAYS } };
export function read() {
  if (!isBrowser) return EMPTY;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== 1) { db = seed(now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try {
    const raw = JSON.stringify(db);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, db };
    if (!quiet) window.dispatchEvent(new CustomEvent(EVENT));
  } catch { /* ignore */ }
}
/** Change the data: fn(db, now) returns a result; the data is saved and screens redraw. */
export function commit(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}
export function resetServices() { try { window.localStorage.removeItem(KEY); } catch { /* ignore */ } cache = { raw: undefined, db: null }; read(); window.dispatchEvent(new CustomEvent(EVENT)); }

// ---- reads ----------------------------------------------------------------------------------------------------------------
export const getServices = () => read().services;
export const serviceById = (id) => read().services.find((s) => s.id === id) || null;
export const pkgOf = (svc, pkgId) => (svc ? svc.packages.find((p) => p.id === pkgId) || null : null);
export const getExperts = () => read().experts;
export const expertById = (id) => read().experts.find((e) => e.id === id) || null;
export const settings = () => read().settings;
/** Services a store sees: live, and for its edition and plan (empty lists = everyone). */
export function catalogFor({ edition = 'full', plan = 'business' } = {}) {
  return read().services.filter((s) => s.status === 'live' && (!s.editions.length || edition === 'full' || s.editions.includes(edition)) && (!s.plans.length || s.plans.includes(plan)));
}
export function priceOf(svc, pkgId, addons = []) {
  const pkg = pkgOf(svc, pkgId);
  if (!pkg) return money(0, settings().vatPct);
  const add = addons.reduce((a, id) => a + ((svc.addons.find((x) => x.id === id) || {}).price || 0), 0);
  return money(pkg.price + add, settings().vatPct);
}
/** Average stars and count from the service's rated orders (and their monthly reports). */
export function ratingOf(serviceId, orders = read().orders) {
  const r = [];
  orders.filter((o) => o.serviceId === serviceId).forEach((o) => { if (o.rating) r.push(o.rating.stars); (o.reports || []).forEach((x) => { if (x.rating) r.push(x.rating.stars); }); });
  return { avg: r.length ? Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 : 0, count: r.length };
}
export const getOrders = (shopId) => read().orders.filter((o) => !shopId || o.shopId === shopId).slice().sort((a, b) => b.paid.at - a.paid.at);
export const orderById = (id) => read().orders.find((o) => o.id === id) || null;

/**
 * An order as it stands now: { status (a quiet merchant's order closes by itself), due (the deadline with the waiting
 * time added), overdue, left (ms to the deadline), paused, quietLeft (days before it closes itself), revisionsLeft,
 * openDeliverable, lastReport, svc, pkg, expert, refundable }.
 */
export function stateOf(o, t = now()) {
  const svc = serviceById(o.serviceId) || {};
  const pkg = pkgOf(svc, o.pkgId) || { revisions: 0, days: 0 };
  const quietDays = settings().quietDays || QUIET_DAYS;
  let status = o.status;
  let autoClosed = false;
  const waitingMs = o.status === 'waiting' && o.waitingSince ? t - o.waitingSince : 0;
  if (o.status === 'waiting' && waitingMs > quietDays * DAY) { status = 'closed'; autoClosed = true; }
  const paused = (o.pausedMs || 0) + (status === 'waiting' ? waitingMs : 0);
  const due = o.dueAt ? o.dueAt + paused : null;
  const working = ['brief', 'progress', 'qa'].includes(status);
  const overdue = !!due && working && t > due;
  const refunded = (o.refunds || []).filter((r) => r.status === 'sent').reduce((a, r) => a + r.amount, 0);
  const paidTotal = o.total + (o.quotes || []).filter((q) => q.status === 'accepted').reduce((a, q) => a + q.total, 0);
  return {
    status, autoClosed, due, overdue, left: due ? due - t : null, paused, waiting: status === 'waiting',
    quietLeft: status === 'waiting' ? Math.max(0, Math.ceil((quietDays * DAY - waitingMs) / DAY)) : null,
    quietWarn: status === 'waiting' && waitingMs > QUIET_WARN * DAY,
    revisionsLeft: Math.max(0, (pkg.revisions || 0) - (o.revisionsUsed || 0)),
    lastReport: (o.reports || []).filter((r) => r.status === 'sent').slice(-1)[0] || null,
    svc, pkg, expert: o.expertId ? expertById(o.expertId) : null, paidTotal, refunded, refundable: paidTotal - refunded - (o.refunds || []).filter((r) => ['requested', 'approved'].includes(r.status)).reduce((a, r) => a + r.amount, 0),
  };
}
/** Active orders on an expert (for load and suggestions). */
export const loadOf = (expertId, orders = read().orders, t = now()) => orders.filter((o) => o.expertId === expertId && ['brief', 'progress', 'waiting', 'qa'].includes(stateOf(o, t).status)).length;
/** The best expert for a service: has the skill, is active, has room; least loaded, then best rated. */
export function suggestExpert(serviceId) {
  const db = read();
  return db.experts.filter((e) => e.active && e.skills.includes(serviceId))
    .map((e) => ({ e, load: loadOf(e.id, db.orders), room: e.capacity - loadOf(e.id, db.orders) }))
    .sort((a, b) => (b.room > 0) - (a.room > 0) || a.load / a.e.capacity - b.load / b.e.capacity || b.e.rating - a.e.rating)[0]?.e || null;
}

// ---- money: what is charged and what partners earn ------------------------------------------------------------------------------
/** Each charge once: { key, at, fee, vat, total, method, txId, label } — the payment, accepted quotes, each month of a retainer. */
export function billables(o, t = now()) {
  const svc = serviceById(o.serviceId) || { name: o.serviceId };
  const out = [{ key: o.id + ':pay', at: o.paid.at, fee: o.fee, vat: o.vat, total: o.total, method: o.paid.method, txId: o.paid.txId, label: `${svc.name} · ${(pkgOf(svc, o.pkgId) || {}).name || ''}${o.cycle === 'monthly' ? ' · month 1' : ''}` }];
  (o.quotes || []).filter((q) => q.status === 'accepted').forEach((q) => out.push({ key: o.id + ':' + q.id, at: q.acceptedAt, fee: q.fee, vat: q.vat, total: q.total, method: q.method, txId: q.txId, label: `${svc.name} · extra work: ${q.text}` }));
  if (o.cycle === 'monthly' && !['cancelled', 'refunded'].includes(o.status)) {
    const end = Math.min(o.closedAt || t, o.stopAt || t, t);
    for (let m = 2; o.paid.at + (m - 1) * 30 * DAY <= end; m++) {
      const at = o.paid.at + (m - 1) * 30 * DAY;
      out.push({ key: o.id + ':m' + m, at, fee: o.fee, vat: o.vat, total: o.total, method: 'subscription', txId: '', label: `${svc.name} · month ${m} (billed with the subscription)` });
    }
  }
  return out;
}
/** What a partner expert earns: commission % of the fee, once the work (or a month's report) is approved. */
export function payables(o) {
  const ex = o.expertId ? expertById(o.expertId) : null;
  if (!ex || ex.kind !== 'partner' || !ex.commission) return [];
  const svc = serviceById(o.serviceId) || { name: o.serviceId };
  const out = [];
  if (o.cycle === 'oneoff' && o.status === 'closed' && o.closeReason === 'Approved') out.push({ key: o.id + ':payout', at: o.closedAt, amount: Math.round((o.fee * ex.commission) / 100), expert: ex, label: `${svc.name} for ${o.shopName} (${o.id})` });
  (o.reports || []).filter((r) => r.status === 'sent' && r.approvedAt).forEach((r) => out.push({ key: o.id + ':payout:' + r.id, at: r.approvedAt, amount: Math.round((o.fee * ex.commission) / 100), expert: ex, label: `${svc.name} month ${r.month} for ${o.shopName} (${o.id})` }));
  return out;
}

// ---- helpers --------------------------------------------------------------------------------------------------------------
const fail = (error, field) => ({ ok: false, error, field });
const hist = (o, t, by, text) => o.history.push({ at: t, by, text });
const sysMsg = (o, t, text) => o.messages.push({ id: o.id + '-M' + (o.messages.length + 1), at: t, from: 'system', name: 'GridCommerce', text, files: [], internal: false });
const findOrder = (db, id) => db.orders.find((o) => o.id === id);
/** Leave Waiting for you: the waited time is added to the deadline. */
const unwait = (o, t) => { if (o.status === 'waiting' && o.waitingSince) { o.pausedMs = (o.pausedMs || 0) + (t - o.waitingSince); o.waitingSince = null; } };
const txId = (t) => 'TXS' + String(t).slice(-8) + Math.random().toString(36).slice(2, 4).toUpperCase();

// ---- merchant ---------------------------------------------------------------------------------------------------------------
/** Check a brief against the service's form: { ok, errors { fieldId: message } }. */
export function checkBrief(svc, brief = {}) {
  const errors = {};
  (svc.brief || []).forEach((f) => {
    const v = brief[f.id];
    const empty = f.type === 'files' ? !(Array.isArray(v) && v.length) : !String(v == null ? '' : v).trim();
    if (f.req && empty) errors[f.id] = f.type === 'files' ? 'Add at least one file.' : 'Please fill this in.';
    else if (!empty && f.type === 'url' && !/^https?:\/\/\S+\.\S+/.test(String(v).trim())) errors[f.id] = 'Enter a web address starting with https://';
    else if (!empty && (f.type === 'money' || f.type === 'number') && !(Number(String(v).replace(/[^0-9.]/g, '')) > 0)) errors[f.id] = 'Enter a number.';
  });
  return { ok: !Object.keys(errors).length, errors };
}
/** Buy a service (demo payment). f: { shopId, shopName, serviceId, pkgId, addons, brief, method } → { ok, order } */
export function placeOrder(f) {
  const svc = serviceById(f.serviceId);
  if (!svc || svc.status !== 'live') return fail('This service is not on sale right now.');
  const pkg = pkgOf(svc, f.pkgId);
  if (!pkg) return fail('Pick a package.', 'pkg');
  const chk = checkBrief(svc, f.brief);
  if (!chk.ok) return { ok: false, error: 'Fill in the brief first.', errors: chk.errors };
  if (!PAY_METHODS.some((m) => m[0] === f.method)) return fail('Pick how you pay.', 'method');
  return commit((db, t) => {
    const id = 'SO-' + db.seq.order++;
    const m = priceOf(svc, pkg.id, f.addons || []);
    const files = (f.brief && Object.values(f.brief).flatMap((v) => (Array.isArray(v) ? v : []))) || [];
    const o = {
      id, invNo: 'SINV-' + id.slice(3), shopId: f.shopId || SELF_SHOP, shopName: f.shopName || SELF_NAME, serviceId: svc.id, pkgId: pkg.id, addons: f.addons || [], cycle: svc.cycle,
      ...m, brief: { ...f.brief }, files: files.map((x) => ({ ...x, by: f.shopName || SELF_NAME, at: t })), paid: { method: f.method, txId: txId(t), at: t },
      status: 'brief', expertId: null, priority: 'normal', startedAt: null, dueAt: null, pausedMs: 0, waitingSince: null, revisionsUsed: 0, qa: db.settings.qaDefault !== false,
      messages: [], deliverables: [], reports: [], access: { status: 'none' }, quotes: [], refunds: [], rating: null, history: [], closedAt: null, closeReason: '',
    };
    hist(o, t, o.shopName, `Ordered ${svc.name} · ${pkg.name} and paid ${payLabel(f.method)}`);
    sysMsg(o, t, `Thank you. Your brief is in. An expert is assigned within one working day; ${pkg.days} days to deliver from then.`);
    db.orders.push(o);
    return { ok: true, order: o };
  });
}
export function postMessage(id, { from = 'merchant', name, text, files = [], internal = false }) {
  if (!String(text || '').trim() && !files.length) return fail('Write a message.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    o.messages.push({ id: o.id + '-M' + (o.messages.length + 1), at: t, from, name: name || (from === 'merchant' ? o.shopName : 'GridCommerce'), text: String(text || '').trim(), files, internal: !!internal });
    files.forEach((x) => o.files.push({ ...x, by: name || o.shopName, at: t }));
    // the merchant answering a question puts the work back in progress (and the deadline runs again)
    if (from === 'merchant' && o.status === 'waiting' && o.access.status !== 'asked') { unwait(o, t); o.status = 'progress'; hist(o, t, o.shopName, 'Answered · back in progress'); }
    return { ok: true };
  });
}
/** The merchant approves what was delivered (or this month's report). */
export function approveDelivery(id) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.status !== 'delivered') return fail('Nothing is waiting for your approval.');
    if (o.cycle === 'monthly') {
      const r = o.reports.filter((x) => x.status === 'sent').slice(-1)[0];
      if (r) r.approvedAt = t;
      o.status = 'progress'; o.startedAt = t; o.dueAt = t + 30 * DAY; o.pausedMs = 0;
      hist(o, t, o.shopName, `Approved month ${r ? r.month : ''} report · next month started`);
    } else {
      o.status = 'closed'; o.closedAt = t; o.closeReason = 'Approved';
      hist(o, t, o.shopName, 'Approved the work · order closed');
    }
    return { ok: true };
  });
}
export function requestChange(id, text) {
  if (!String(text || '').trim()) return fail('Say what should change.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.status !== 'delivered') return fail('Nothing is waiting for your approval.');
    const st = stateOf(o, t);
    if (st.revisionsLeft <= 0) return fail('No changes are left in this package. Ask the expert for a quote for more.');
    o.revisionsUsed = (o.revisionsUsed || 0) + 1;
    o.status = 'progress';
    o.messages.push({ id: o.id + '-M' + (o.messages.length + 1), at: t, from: 'merchant', name: o.shopName, text: 'Change requested: ' + String(text).trim(), files: [], internal: false });
    hist(o, t, o.shopName, `Asked for a change (${o.revisionsUsed} of ${st.pkg.revisions} used)`);
    return { ok: true };
  });
}
/** Rate the order (or a monthly report: reportId). */
export function rate(id, stars, text = '', reportId = null) {
  if (!(stars >= 1 && stars <= 5)) return fail('Pick 1 to 5 stars.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    const rec = { stars, text: String(text || '').trim(), at: t };
    if (reportId) { const r = o.reports.find((x) => x.id === reportId); if (!r) return fail('This report is gone.'); r.rating = rec; } else o.rating = rec;
    hist(o, t, o.shopName, `Rated ${stars} star${stars === 1 ? '' : 's'}`);
    return { ok: true };
  });
}
/** The owner approves (or declines) the store access the expert asked for. */
export function answerAccess(id, yes, { minutes } = {}) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.access.status !== 'asked') return fail('No store access is waiting for you.');
    if (yes) {
      Object.assign(o.access, { status: 'approved', approvedAt: t, minutes: Number(minutes) || o.access.minutes || 60 });
      hist(o, t, o.shopName, `Approved store access · ${areaLabel(o.access.area)} · ${o.access.minutes} min`);
      sysMsg(o, t, `Store access approved: ${areaLabel(o.access.area)}, up to ${o.access.minutes} minutes. Every change is logged.`);
    } else {
      Object.assign(o.access, { status: 'declined', declinedAt: t });
      hist(o, t, o.shopName, 'Declined store access');
      sysMsg(o, t, 'Store access declined. The expert will ask you for what they need instead.');
    }
    if (o.status === 'waiting') { unwait(o, t); o.status = 'progress'; }
    return { ok: true };
  });
}
/** The merchant accepts an extra-work quote and pays it (demo). */
export function acceptQuote(id, quoteId, method) {
  if (!PAY_METHODS.some((m) => m[0] === method)) return fail('Pick how you pay.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    const q = o && o.quotes.find((x) => x.id === quoteId);
    if (!q || q.status !== 'sent') return fail('This quote is no longer open.');
    Object.assign(q, { status: 'accepted', acceptedAt: t, method, txId: txId(t) });
    if (q.days) o.dueAt = (o.dueAt || t) + q.days * DAY;
    hist(o, t, o.shopName, `Accepted extra work “${q.text}” and paid ${payLabel(method)}`);
    return { ok: true };
  });
}
export function declineQuote(id, quoteId) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const q = o && o.quotes.find((x) => x.id === quoteId);
    if (!q || q.status !== 'sent') return fail('This quote is no longer open.');
    q.status = 'declined'; q.declinedAt = t;
    hist(o, t, o.shopName, `Declined extra work “${q.text}”`);
    return { ok: true };
  });
}
/** Cancel before work starts: the full fee comes back (a refund for finance to approve and send). */
export function cancelOrder(id, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    if (o.status !== 'brief') return fail('Work has started. Ask the expert or support about a refund.');
    o.status = 'cancelled'; o.closedAt = t; o.closeReason = 'Cancelled before work started';
    o.refunds.push({ id: 'SRF-' + db.seq.refund++, amount: o.total, reason: 'Merchant cancelled', note: 'Cancelled before work started', status: 'requested', by: by || o.shopName, at: t });
    hist(o, t, by || o.shopName, 'Cancelled before work started · full refund requested');
    return { ok: true };
  });
}

// ---- staff (super admin) ---------------------------------------------------------------------------------------------------------
export function assign(id, expertId, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const ex = db.experts.find((e) => e.id === expertId);
    if (!o) return fail('This order is gone.');
    if (!ex || !ex.active) return fail('Pick an active expert.');
    if (!ex.skills.includes(o.serviceId)) return fail(`${ex.name} doesn’t do this service. Add the skill on Experts first.`);
    const was = o.expertId;
    o.expertId = ex.id;
    if (o.status === 'brief') {
      const svc = db.services.find((s) => s.id === o.serviceId);
      const pkg = svc && svc.packages.find((p) => p.id === o.pkgId);
      o.status = 'progress'; o.startedAt = t; o.dueAt = t + ((pkg && pkg.days) || 7) * DAY;
      sysMsg(o, t, `${ex.name} is your expert. Work has started; delivery by ${new Date(o.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.`);
    }
    hist(o, t, by, was ? `Moved from ${(db.experts.find((e) => e.id === was) || {}).name} to ${ex.name}` : `Assigned to ${ex.name}`);
    return { ok: true };
  });
}
export function setPriority(id, priority, by) {
  return commit((db, t) => { const o = findOrder(db, id); if (!o) return fail('This order is gone.'); o.priority = priority === 'high' ? 'high' : 'normal'; hist(o, t, by, 'Priority ' + o.priority); return { ok: true }; });
}
/** Ask the merchant something: the order waits for them and the deadline stops. */
export function askMerchant(id, text, by) {
  if (!String(text || '').trim()) return fail('Write what you need from the merchant.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || !['progress', 'brief'].includes(o.status)) return fail('Only work in progress can wait for the merchant.');
    o.status = 'waiting'; o.waitingSince = t;
    o.messages.push({ id: o.id + '-M' + (o.messages.length + 1), at: t, from: 'expert', name: by, text: String(text).trim(), files: [], internal: false });
    hist(o, t, by, 'Waiting for the merchant · deadline paused');
    return { ok: true };
  });
}
export function resume(id, by) {
  return commit((db, t) => { const o = findOrder(db, id); if (!o || o.status !== 'waiting') return fail('This order is not waiting.'); unwait(o, t); o.status = 'progress'; hist(o, t, by, 'Back in progress · deadline running'); return { ok: true }; });
}
export function addDeliverable(id, { name, note }, by) {
  if (!String(name || '').trim()) return fail('Name the file or link.', 'name');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    const prev = o.deliverables.filter((d) => d.name === String(name).trim()).length;
    o.deliverables.push({ id: 'D' + (o.deliverables.length + 1), name: String(name).trim(), note: String(note || '').trim(), at: t, by, version: prev + 1, draft: true });
    hist(o, t, by, `Added ${String(name).trim()}`);
    return { ok: true };
  });
}
/** A monthly service's report (it goes through the quality check like any delivery). */
export function addReport(id, { summary, kpis }, by) {
  if (!String(summary || '').trim()) return fail('Write what happened this month.', 'summary');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.cycle !== 'monthly') return fail('Only a monthly service has reports.');
    const month = (o.reports || []).length + 1;
    o.reports.push({ id: 'R' + month, month, title: `Month ${month} report`, summary: String(summary).trim(), kpis: (kpis || []).filter((k) => k[0] && k[1]), status: 'draft', at: t, by });
    hist(o, t, by, `Wrote the month ${month} report`);
    return { ok: true };
  });
}
/** Hand the work in: to the quality check (when the order has one), else straight to the merchant. */
export function submitWork(id, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.status !== 'progress') return fail('Only work in progress can be handed in.');
    const hasNew = o.cycle === 'monthly' ? o.reports.some((r) => r.status === 'draft') : o.deliverables.some((d) => d.draft);
    if (!hasNew) return fail(o.cycle === 'monthly' ? 'Write this month’s report first.' : 'Add the file or link you are delivering first.');
    if (o.qa) { o.status = 'qa'; hist(o, t, by, 'Handed in · quality check'); return { ok: true }; }
    deliver(o, t, by);
    return { ok: true };
  });
}
function deliver(o, t, by) {
  o.deliverables.forEach((d) => { d.draft = false; });
  o.reports.forEach((r) => { if (r.status !== 'sent') { r.status = 'sent'; r.at = t; } });
  o.status = 'delivered';
  hist(o, t, by, 'Delivered to the merchant');
  sysMsg(o, t, o.cycle === 'monthly' ? 'This month’s report is ready. Approve it or ask for a change.' : 'Your work is ready. Approve it, or ask for a change.');
}
/** The lead's quality check: pass (delivered to the merchant) or send back with a note (internal). */
export function qaDecide(id, pass, note, by) {
  if (!pass && !String(note || '').trim()) return fail('Say what to fix.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.status !== 'qa') return fail('This order is not in the quality check.');
    if (pass) { deliver(o, t, by); hist(o, t, by, 'Quality check passed'); }
    else {
      o.status = 'progress';
      o.messages.push({ id: o.id + '-M' + (o.messages.length + 1), at: t, from: 'staff', name: by, text: 'Quality check: ' + String(note).trim(), files: [], internal: true });
      hist(o, t, by, 'Quality check: sent back');
    }
    return { ok: true };
  });
}
/** Ask the owner for store access (they approve it in their panel; sessionId links the super admin's access session). */
export function requestAccess(id, { area, minutes = 60, sessionId = null }, by) {
  if (!AREAS.some((a) => a[0] === area)) return fail('Pick what the expert may open.');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    if (o.access.status === 'asked') return fail('The owner has not answered the last request yet.');
    o.access = { status: 'asked', area, minutes: Number(minutes) || 60, askedAt: t, askedBy: by, sessionId };
    if (o.status === 'progress' || o.status === 'brief') { o.status = 'waiting'; o.waitingSince = t; }
    const ex = o.expertId ? db.experts.find((e) => e.id === o.expertId) : null;
    sysMsg(o, t, `${ex ? ex.name : by} asks to open your store: ${areaLabel(area)}, up to ${minutes} minutes. Approve or decline it here.`);
    hist(o, t, by, `Asked for store access · ${areaLabel(area)}`);
    return { ok: true };
  });
}
export function markAccessUsed(id, by) {
  return commit((db, t) => { const o = findOrder(db, id); if (!o || o.access.status !== 'approved') return fail('No approved access.'); o.access.status = 'used'; o.access.usedAt = t; hist(o, t, by, 'Used the store access'); return { ok: true }; });
}
/** More than the package covers: a paid extra-work quote for the merchant to accept. */
export function proposeQuote(id, { text, fee, days }, by) {
  const f = Math.round(Number(String(fee || '').replace(/[^0-9.]/g, '')) || 0);
  if (!String(text || '').trim()) return fail('Say what the extra work is.', 'text');
  if (!f) return fail('Enter the price.', 'fee');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    const m = money(f, db.settings.vatPct);
    o.quotes.push({ id: 'Q' + db.seq.quote++, text: String(text).trim(), ...m, days: Number(days) || 0, status: 'sent', at: t, by });
    sysMsg(o, t, `Extra work offered: ${String(text).trim()} for ৳${m.total.toLocaleString('en-IN')} (VAT included). Accept or decline it here.`);
    hist(o, t, by, `Offered extra work · ৳${m.total.toLocaleString('en-IN')}`);
    return { ok: true };
  });
}
/** Ask for a refund: full before work starts, part after (with a reason); someone else approves it. */
export function requestRefund(id, { amount, reason, note }, by) {
  const a = Math.round(Number(String(amount || '').replace(/[^0-9.]/g, '')) || 0);
  if (!a) return fail('Enter the amount.', 'amount');
  if (!reason) return fail('Pick a reason.', 'reason');
  if (reason === 'Other' && !String(note || '').trim()) return fail('Say why in the note.', 'note');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    const st = stateOf(o, t);
    if (a > st.refundable) return fail(`At most ৳${st.refundable.toLocaleString('en-IN')} can go back.`, 'amount');
    if (o.status !== 'brief' && a === st.paidTotal && reason !== 'Not what was agreed') return fail('Work has started: a full refund needs the reason “Not what was agreed”. Otherwise refund part of it.', 'amount');
    o.refunds.push({ id: 'SRF-' + db.seq.refund++, amount: a, reason, note: String(note || '').trim(), status: 'requested', by, at: t });
    hist(o, t, by, `Refund asked · ৳${a.toLocaleString('en-IN')} · ${reason}`);
    return { ok: true };
  });
}
export function decideRefund(id, refundId, yes, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const r = o && o.refunds.find((x) => x.id === refundId);
    if (!r) return fail('This refund is gone.');
    if (yes === 'sent') {
      if (r.status !== 'approved') return fail('Approve it before it is sent.');
      Object.assign(r, { status: 'sent', sentAt: t, sentBy: by });
      const st = stateOf(o, t);
      if (st.refunded >= st.paidTotal) { o.status = 'refunded'; o.closedAt = o.closedAt || t; o.closeReason = o.closeReason || 'Refunded'; }
      hist(o, t, by, `Refund sent · ৳${r.amount.toLocaleString('en-IN')}`);
      sysMsg(o, t, `৳${r.amount.toLocaleString('en-IN')} has been sent back to you (${payLabel(o.paid.method)}).`);
      return { ok: true };
    }
    if (r.status !== 'requested') return fail('This refund is not waiting for approval.');
    if (r.by === by) return fail('You asked for this refund, so someone else approves it.');
    Object.assign(r, yes ? { status: 'approved', approvedBy: by, approvedAt: t } : { status: 'declined', declinedBy: by, declinedAt: t });
    hist(o, t, by, `Refund ${yes ? 'approved' : 'declined'} · ৳${r.amount.toLocaleString('en-IN')}`);
    return { ok: true };
  });
}
export function closeOrder(id, reason, by) {
  return commit((db, t) => { const o = findOrder(db, id); if (!o) return fail('This order is gone.'); if (['closed', 'cancelled', 'refunded'].includes(o.status)) return fail('It is already closed.'); unwait(o, t); o.status = 'closed'; o.closedAt = t; o.closeReason = reason || 'Closed by staff'; hist(o, t, by, 'Closed · ' + o.closeReason); return { ok: true }; });
}
/** Stop a monthly service at the end of the month it is in. */
export function stopRetainer(id, by) {
  return commit((db, t) => { const o = findOrder(db, id); if (!o || o.cycle !== 'monthly') return fail('Only a monthly service can be stopped.'); o.stopAt = o.paid.at + Math.ceil((t - o.paid.at) / (30 * DAY)) * 30 * DAY; hist(o, t, by, 'Stops at the end of this month'); return { ok: true }; });
}

// ---- catalogue and experts (super admin) ------------------------------------------------------------------------------------
export function saveService(svc) {
  if (!String(svc.name || '').trim()) return fail('Name the service.', 'name');
  if (!svc.packages || !svc.packages.length) return fail('Add at least one package.', 'packages');
  const bad = svc.packages.find((p) => !String(p.name || '').trim() || !(Number(p.price) > 0) || !(Number(p.days) > 0));
  if (bad) return fail('Every package needs a name, a price and delivery days.', 'packages');
  if ((svc.brief || []).some((f) => !String(f.label || '').trim())) return fail('Every brief question needs a label.', 'brief');
  return commit((db) => {
    const id = svc.id || String(svc.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-3);
    const rec = { addons: [], brief: [], faq: [], samples: [], access: { needed: false }, editions: [], plans: [], status: 'paused', gets: [], ...svc, id, packages: svc.packages.map((p) => ({ ...p, price: Number(p.price), days: Number(p.days), revisions: Number(p.revisions) || 0 })) };
    const i = db.services.findIndex((s) => s.id === id);
    if (i >= 0) db.services[i] = rec; else db.services.push(rec);
    return { ok: true, service: rec };
  });
}
export function setServiceStatus(id, status) {
  return commit((db) => { const s = db.services.find((x) => x.id === id); if (!s) return fail('This service is gone.'); s.status = status === 'live' ? 'live' : 'paused'; return { ok: true }; });
}
export function saveExpert(ex) {
  if (!String(ex.name || '').trim()) return fail('Enter the name.', 'name');
  if (ex.kind === 'partner' && !(Number(ex.commission) >= 0 && Number(ex.commission) <= 100)) return fail('Commission is a percent from 0 to 100.', 'commission');
  return commit((db) => {
    const id = ex.id || 'ex-' + Date.now().toString(36);
    const rec = { skills: [], capacity: 5, commission: 0, rating: 0, active: true, ...ex, id, capacity: Number(ex.capacity) || 1, commission: ex.kind === 'partner' ? Number(ex.commission) || 0 : 0 };
    const i = db.experts.findIndex((e) => e.id === id);
    if (i >= 0) db.experts[i] = rec; else db.experts.push(rec);
    return { ok: true, expert: rec };
  });
}
export function saveSettings(patch) {
  const v = Number(patch.vatPct);
  if (patch.vatPct != null && !(v >= 0 && v <= 100)) return fail('VAT is a percent from 0 to 100.', 'vatPct');
  return commit((db) => { db.settings = { ...db.settings, ...patch, vatPct: patch.vatPct != null ? v : db.settings.vatPct }; return { ok: true }; });
}
/** Bookkeeping marks the super admin's sync leaves on an order (which charges and payouts are in Finance). */
export function markBooked(id, field, key, ref) {
  return commit((db) => { const o = findOrder(db, id); if (!o) return fail('gone'); o[field] = { ...(o[field] || {}), [key]: ref }; return { ok: true }; });
}

// ---- reports ------------------------------------------------------------------------------------------------------------------
export function reportOf(t = now(), from = 0) {
  const db = read();
  const orders = db.orders.filter((o) => o.paid.at >= from);
  const byService = db.services.map((s) => {
    const os = orders.filter((o) => o.serviceId === s.id);
    const revenue = os.reduce((a, o) => a + billables(o, t).filter((b) => b.at >= from).reduce((x, b) => x + b.fee, 0), 0);
    const done = os.filter((o) => ['delivered', 'closed'].includes(stateOf(o, t).status) || (o.reports || []).some((r) => r.status === 'sent'));
    const onTime = done.filter((o) => { const h = o.history.find((x) => /Delivered/.test(x.text)); return h && o.dueAt ? h.at <= o.dueAt + (o.pausedMs || 0) : true; });
    return { id: s.id, name: s.name, orders: os.length, revenue, onTime: done.length ? Math.round((onTime.length / done.length) * 100) : null, revisions: os.length ? Math.round((os.reduce((a, o) => a + (o.revisionsUsed || 0), 0) / os.length) * 10) / 10 : 0, rating: ratingOf(s.id, orders) };
  }).filter((r) => r.orders);
  const byExpert = db.experts.map((e) => {
    const os = orders.filter((o) => o.expertId === e.id);
    const stars = [];
    os.forEach((o) => { if (o.rating) stars.push(o.rating.stars); (o.reports || []).forEach((r) => { if (r.rating) stars.push(r.rating.stars); }); });
    return { id: e.id, name: e.name, kind: e.kind, orders: os.length, load: loadOf(e.id, db.orders, t), capacity: e.capacity, rating: stars.length ? Math.round((stars.reduce((a, b) => a + b, 0) / stars.length) * 10) / 10 : null };
  }).filter((r) => r.orders);
  const shops = {};
  orders.forEach((o) => { shops[o.shopId] = (shops[o.shopId] || 0) + 1; });
  return { byService, byExpert, orders: orders.length, revenue: byService.reduce((a, r) => a + r.revenue, 0), repeat: Object.values(shops).filter((n) => n > 1).length, buyers: Object.keys(shops).length };
}
