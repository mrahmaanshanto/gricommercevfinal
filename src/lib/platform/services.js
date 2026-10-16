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
//               (a deliverable may carry `kit`: a store design file the merchant previews and applies, Batch A)
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
//
// Batch D (Oct 2026):
//   Pictures    a service has `cover` (picture or '' = a coloured tile with its icon), `gallery[{ src, caption }]` and
//               `proof[{ src, title, result, client }]` (proof of work), shown on its own page like a Fiverr gig.
//   Offers      createOffer(): an instant custom service for one store (a hidden service, `custom: true`, status 'custom')
//               and an order in `unpaid` (Awaiting payment) with `offer { code, expiresAt, sent[] }`; the store opens the
//               payment link (/service-offer?code=) and pays (payOffer) to confirm; past expiresAt it is `expired`.
//               An unpaid order's `paid` is { at: created, method: '', txId: '', pending: true } and bills nothing.
//   Teams       teams[{ id, name, lead, members[expertIds], skills[], bank }]; an order may go to a team (`teamId`, its
//               lead is the expert). Experts and teams carry `bank { method, name, account, branch }`.
//   Tasks       order.tasks[{ id, title, who { kind 'expert'|'team', id }, due, status 'todo'|'doing'|'done', cost,
//               pay { status 'unpaid'|'owed'|'paid', at, ref, to (bank at the time) } }]: the work split into tasks, each
//               with what its expert or team is paid; a task's payout is owed once the task is done and paid through
//               Finance (servicesSync books it as an expense waiting for approval and reads back when it is paid).
//               order.costs[{ id, label, kind, amount, at, by }] = other money spent on the order (tools, stock photos …).
//   Updates     order.updates[{ id, at, by, text, progress, shared, publishedAt }]: progress notes; only shared ones show
//               to the store (publishUpdate / unpublishUpdate).
//   Profit      profitOf(order) = fees billed − refunds (without VAT) − task payouts − other costs.
//   Sharing     shareText(svc) = an automatic summary for WhatsApp / email / social; `svc.share.text` overrides it.
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
  unpaid: { label: 'Awaiting payment', tone: 'warning', step: -1, admin: 'Offer sent · awaiting payment' },
  expired: { label: 'Offer expired', tone: 'neutral', step: 5 },
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
export const TASK_STATUS = [['todo', 'To do'], ['doing', 'Doing'], ['done', 'Done']];
export const PAY_STATUS = { unpaid: 'Not due yet', owed: 'Owed · in Finance', paid: 'Paid' };
export const COST_KINDS = [['tools', 'Tools and software'], ['stock', 'Stock photos, fonts, music'], ['print', 'Printing and samples'], ['travel', 'Travel'], ['other', 'Other']];
export const BANK_METHODS = [['bank', 'Bank account'], ['bkash', 'bKash'], ['nagad', 'Nagad']];
export const bankText = (b) => (!b || !b.account ? 'No payout account yet' : b.method === 'bank' ? `${b.name || 'Bank'} · ${b.account}${b.branch ? ' · ' + b.branch : ''}` : `${(BANK_METHODS.find((x) => x[0] === b.method) || ['', b.method])[1]} · ${b.account}`);
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
    blurb: 'Your online store designed to your brand, delivered as a design file you preview on your own products and apply in one click.',
    gets: ['A design made for your shop', 'Preview it on your own products first', 'Apply in one click, go back any time', 'Phone and computer checked'],
    // Batch A (Oct 2026): most shops pay ৳5,000–10,000, so designs are built from GridCommerce's looks library and
    // style presets with Claude (tools/store-kit); bigger brands get a quote (Exceptional, through extra work)
    packages: [
      P('starter', 'Quick restyle', 2500, 2, 1, ['A ready design in your logo, colours and fonts', '3 banners', 'Within 2 days']),
      P('standard', 'Standard design', 5000, 5, 2, ['Home page laid out for your shop', 'Header and footer', 'Product and category pages styled']),
      P('pro', 'Premium design', 10000, 7, 3, ['Everything in Standard', 'Up to 2 sections made only for you', 'A campaign landing page']),
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

// Batch D: the pictures on each service's page (our own store and panel screenshots, and the demo shop's photos)
const A = '/assets/services/';
const PHOTO = { counter: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', packing: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp', parcel: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', filming: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp' };
const MEDIA = {
  seo: { cover: A + 'seo-health.jpg', gallery: [{ src: A + 'seo-health.jpg', caption: 'Every page’s search score with what to fix' }, { src: A + 'product-page.jpg', caption: 'Product pages with titles and descriptions written for search' }],
    proof: [{ src: A + 'seo-health.jpg', title: 'Mobile shop in Dhanmondi', result: '3.1× Google visits in 4 months', client: 'Phone and gadget shop' }, { src: A + 'product-page.jpg', title: 'Fashion page', result: 'Top 3 for “jamdani saree online”', client: 'Saree shop, Mirpur' }] },
  'meta-ads': { cover: PHOTO.filming, gallery: [{ src: PHOTO.filming, caption: 'Short product videos for Reels and Stories' }, { src: A + 'analytics.jpg', caption: 'Ad spend against delivered sales, week by week' }],
    proof: [{ src: A + 'analytics.jpg', title: 'Gadget shop', result: 'Cost per order down from ৳310 to ৳140 in 6 weeks', client: 'Gadget shop, Uttara' }] },
  'google-ads': { cover: A + 'google-feed.jpg', gallery: [{ src: A + 'google-feed.jpg', caption: 'Merchant Center feed checked product by product' }, { src: A + 'analytics.jpg', caption: 'Google next to Meta and TikTok in one report' }], proof: [] },
  branding: { cover: PHOTO.counter, gallery: [{ src: PHOTO.counter, caption: 'A counter that looks like the brand' }, { src: A + 'email-look.jpg', caption: 'The brand carried into emails and receipts' }],
    proof: [{ src: A + 'email-look.jpg', title: 'Pixel Studio', result: '40+ shops branded, from logo to receipts', client: 'Partner studio' }] },
  'store-design': { cover: A + 'store-signal.jpg', gallery: [{ src: A + 'store-signal.jpg', caption: 'Signal: calm, big photos for a phone shop' }, { src: A + 'store-nokshi.jpg', caption: 'Nokshi: warm and handmade for a festival edit' }, { src: A + 'store-counter.jpg', caption: 'Counter: a grocery-style aisle home page' }, { src: A + 'store-phone.jpg', caption: 'Every design checked on a phone' }],
    proof: [{ src: A + 'store-signal.jpg', title: 'Dhaka Gadget Hub', result: 'Signal-based store live in 3 days', client: 'Phone shop' }, { src: A + 'store-nokshi.jpg', title: 'Shonali Crafts', result: 'Festive home page ready before Eid', client: 'Crafts and sarees' }] },
  'product-upload': { cover: A + 'products-list.jpg', gallery: [{ src: A + 'products-list.jpg', caption: 'Products in with stock, category and status' }, { src: A + 'product-page.jpg', caption: 'How a product looks on the store after upload' }, { src: PHOTO.packing, caption: 'Ready to sell the same week' }],
    proof: [{ src: A + 'products-list.jpg', title: 'Dazzle Shop', result: '212 accessories added in 2 days', client: 'Phone and accessories shop' }] },
  migration: { cover: A + 'import.jpg', gallery: [{ src: A + 'import.jpg', caption: 'Customers, stock and past orders brought in' }], proof: [] },
  'store-setup': { cover: PHOTO.parcel, gallery: [{ src: PHOTO.parcel, caption: 'Couriers and payments ready for the first parcel' }, { src: PHOTO.packing, caption: 'Packing slips and order steps set up' }], proof: [] },
  descriptions: { cover: '', gallery: [{ src: A + 'product-page.jpg', caption: 'Clear descriptions with a specs table' }], proof: [] },
  'photo-guide': { cover: PHOTO.filming, gallery: [{ src: PHOTO.filming, caption: 'A phone, a window and a white card' }], proof: [] },
};
/** Pictures staff can pick without uploading (super admin › edit a service, custom offers). */
export const PICTURE_LIBRARY = [
  ['store-signal.jpg', 'Store design · Signal'], ['store-nokshi.jpg', 'Store design · Nokshi'], ['store-counter.jpg', 'Store design · Counter'], ['store-phone.jpg', 'Store on a phone'],
  ['products-list.jpg', 'Products list'], ['product-page.jpg', 'Product page'], ['seo-health.jpg', 'SEO health'], ['analytics.jpg', 'Ads and sales report'],
  ['google-feed.jpg', 'Google Merchant feed'], ['import.jpg', 'Import data'], ['email-look.jpg', 'Email design'],
].map(([f, label]) => ({ src: A + f, label })).concat([
  { src: PHOTO.counter, label: 'Photo · shop counter' }, { src: PHOTO.packing, label: 'Photo · packing an order' }, { src: PHOTO.parcel, label: 'Photo · seller with a parcel' }, { src: PHOTO.filming, label: 'Photo · filming a product' },
]);
const withMedia = (s) => ({ cover: '', gallery: [], proof: [], ...s, ...(MEDIA[s.id] || {}) });

const EXPERTS = [
  { id: 'tanvir', name: 'Tanvir Alam', kind: 'staff', skills: ['seo', 'google-ads', 'descriptions'], capacity: 6, commission: 0, rating: 4.7, phone: '+880 1711-220031', email: 'tanvir@gridcommerce.net', active: true, bank: { method: 'bank', name: 'City Bank', account: '1502 0011 4410', branch: 'Gulshan' } },
  { id: 'sumaiya', name: 'Sumaiya Ahmed', kind: 'staff', skills: ['store-design', 'branding'], capacity: 4, commission: 0, rating: 4.8, phone: '+880 1711-220032', email: 'sumaiya@gridcommerce.net', active: true, bank: { method: 'bank', name: 'BRAC Bank', account: '2051 7730 0921', branch: 'Dhanmondi' } },
  { id: 'nabila', name: 'Nabila Chowdhury', kind: 'staff', skills: ['descriptions', 'product-upload', 'store-setup'], capacity: 8, commission: 0, rating: 4.6, phone: '+880 1711-220033', email: 'nabila@gridcommerce.net', active: true, bank: { method: 'bkash', name: '', account: '01711-220033', branch: '' } },
  { id: 'adscraft', name: 'AdsCraft BD', kind: 'partner', skills: ['meta-ads', 'google-ads'], capacity: 10, commission: 65, rating: 4.5, phone: '+880 1819-440010', email: 'team@adscraft.com.bd', active: true, bank: { method: 'bank', name: 'Dutch-Bangla Bank', account: '117 110 22893', branch: 'Banani' } },
  { id: 'pixel', name: 'Pixel Studio', kind: 'partner', skills: ['branding', 'photo-guide', 'store-design'], capacity: 5, commission: 60, rating: 4.9, phone: '+880 1913-550020', email: 'hello@pixelstudio.bd', active: true, bank: { method: 'bank', name: 'Eastern Bank', account: '1011 0602 7781', branch: 'Mohakhali' } },
  { id: 'datamove', name: 'DataMove', kind: 'partner', skills: ['migration', 'product-upload'], capacity: 6, commission: 55, rating: 4.4, phone: '+880 1515-660030', email: 'ops@datamove.com.bd', active: true, bank: { method: 'nagad', name: '', account: '01515-660030', branch: '' } },
];
const TEAMS = [
  { id: 'team-design', name: 'Design team', lead: 'sumaiya', members: ['sumaiya', 'pixel'], skills: ['store-design', 'branding', 'photo-guide'], bank: { method: 'bank', name: 'Eastern Bank', account: '1011 0602 7781', branch: 'Mohakhali' }, active: true },
  { id: 'team-growth', name: 'Growth team', lead: 'tanvir', members: ['tanvir', 'adscraft'], skills: ['seo', 'meta-ads', 'google-ads'], bank: { method: 'bank', name: 'Dutch-Bangla Bank', account: '117 110 22893', branch: 'Banani' }, active: true },
  { id: 'team-setup', name: 'Setup crew', lead: 'nabila', members: ['nabila', 'datamove'], skills: ['product-upload', 'migration', 'store-setup', 'descriptions'], bank: { method: 'nagad', name: '', account: '01515-660030', branch: '' }, active: true },
];

// ---- seed orders -----------------------------------------------------------------------------------------------------------
const VAT = 15;
const money = (fee, vatPct = VAT) => { const vat = Math.round((fee * vatPct) / 100); return { fee, vatPct, vat, total: fee + vat }; };
/** A hidden one-off service made for one store (an instant custom offer). */
function customService(id, f) {
  return {
    id, custom: true, forShop: f.shopId, name: String(f.title).trim(), cat: f.cat || 'setup', icon: 'sparkles', cycle: 'oneoff', financeId: null,
    blurb: String(f.scope || '').trim(), gets: (f.includes || []).filter(Boolean),
    packages: [P('offer', 'Custom offer', Number(f.fee), Number(f.days) || 7, Number(f.revisions) || 0, (f.includes || []).filter(Boolean))],
    addons: [], brief: [], faq: [], samples: [], cover: f.cover || '', gallery: [], proof: [], access: { needed: false }, editions: [], plans: [], status: 'custom',
  };
}
const OFFER_DAYS = 7;
const offerCode = (seed) => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let x = Math.abs(Math.floor(seed)) || 1, out = ''; for (let i = 0; i < 6; i++) { x = (x * 48271) % 2147483647; out += c[x % c.length]; } return out; };
const taskOf = (id, title, who, cost, status, extra = {}) => ({ id, title, who, due: extra.due || null, status, cost: cost || 0, note: extra.note || '', at: extra.at || 0, by: extra.by || 'Mahin Khan', pay: extra.pay || { status: status === 'done' && cost ? 'owed' : 'unpaid', at: null, ref: '', to: null } });

function seedOrders(t, services, teams) {
  const out = [];
  let n = 1001;
  const mk = (o) => {
    const svc = services.find((s) => s.id === o.serviceId);
    const pkg = svc.packages.find((p) => p.id === o.pkgId);
    const addFee = (o.addons || []).reduce((a, id) => a + ((svc.addons.find((x) => x.id === id) || {}).price || 0), 0);
    const paidAt = t - o.daysAgo * DAY;
    const unpaid = o.status === 'unpaid';
    const startedAt = o.status === 'brief' || unpaid ? null : paidAt + 4 * H;
    const id = 'SO-' + n++;
    const order = {
      id, invNo: 'SINV-' + id.slice(3), shopId: o.shopId, shopName: o.shopName, serviceId: svc.id, pkgId: pkg.id, addons: o.addons || [], cycle: svc.cycle,
      ...money(pkg.price + addFee), brief: o.brief || {}, files: o.files || [],
      paid: unpaid ? { method: '', txId: '', at: paidAt, pending: true } : { method: o.method || 'bkash', txId: 'TXS' + String(paidAt).slice(-8), at: paidAt },
      status: o.status, expertId: o.expertId || null, teamId: o.teamId || null, priority: o.priority || 'normal', startedAt, dueAt: startedAt ? startedAt + pkg.days * DAY : null,
      pausedMs: o.pausedMs || 0, waitingSince: o.status === 'waiting' ? t - (o.waitingDays || 1) * DAY : null, revisionsUsed: o.revisionsUsed || 0,
      qa: true, messages: [], deliverables: o.deliverables || [], reports: o.reports || [], access: o.access || { status: 'none' }, quotes: [], refunds: [],
      rating: o.rating || null, history: [{ at: paidAt, by: unpaid || svc.custom ? 'Mahin Khan' : o.shopName, text: unpaid ? 'Custom offer made and sent' : svc.custom ? 'Custom offer paid ' + payLabel(o.method || 'bkash') : 'Ordered and paid ' + payLabel(o.method || 'bkash') }], closedAt: o.status === 'closed' ? t - (o.closedDays || 2) * DAY : null, closeReason: o.status === 'closed' ? 'Approved' : '',
      tasks: [], costs: [], updates: [],
    };
    if (svc.custom) order.offer = { code: offerCode(paidAt), expiresAt: paidAt + OFFER_DAYS * DAY, sent: o.sent || [], by: 'Mahin Khan', at: paidAt };
    (o.msgs || []).forEach(([from, name, text, hoursAgo, internal]) => order.messages.push({ id: id + '-M' + (order.messages.length + 1), at: t - hoursAgo * H, from, name, text, files: [], internal: !!internal }));
    // tasks: given, or one "Main work" task for the expert (a partner is paid its commission once the task is done)
    const ex = EXPERTS.find((e) => e.id === order.expertId);
    const tasks = o.tasks || (ex && startedAt ? [['Main work', { kind: 'expert', id: ex.id }, ex.kind === 'partner' ? Math.round((order.fee * ex.commission) / 100) : 0, ['delivered', 'closed', 'qa'].includes(o.status) ? 'done' : 'doing']] : []);
    order.tasks = tasks.map(([title, who, cost, status, extra], i) => {
      const tk = taskOf('T' + (i + 1), title, who, cost, status, { at: startedAt || paidAt, due: startedAt ? startedAt + pkg.days * DAY : null, ...(extra || {}) });
      if (tk.pay.status !== 'unpaid') tk.pay.to = bankOfWho(who, teams);
      if (tk.pay.status === 'owed') tk.pay.at = (startedAt || paidAt) + 2 * DAY;
      return tk;
    });
    order.costs = (o.costs || []).map(([label, kind, amount, daysAgo], i) => ({ id: 'C' + (i + 1), label, kind, amount, at: t - daysAgo * DAY, by: 'Mahin Khan' }));
    order.updates = (o.updates || []).map(([text, progress, shared, hoursAgo, by], i) => ({ id: 'U' + (i + 1), at: t - hoursAgo * H, by: by || (ex ? ex.name : 'GridCommerce'), text, progress, shared: !!shared, publishedAt: shared ? t - hoursAgo * H : null }));
    out.push(order);
    return order;
  };
  mk({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: 'product-upload', pkgId: 'standard', daysAgo: 3, status: 'progress', expertId: 'nabila', method: 'nagad',
    brief: { notes: 'Accessories first: cases, chargers, cables. Prices in the sheet include VAT.' }, files: [{ name: 'dazzle-accessories.xlsx', size: '84 KB', by: SELF_NAME, at: t - 3 * DAY }],
    access: { status: 'used', area: 'products', minutes: 60, askedAt: t - 2.5 * DAY, approvedAt: t - 2.4 * DAY },
    tasks: [['Accessories (212)', { kind: 'expert', id: 'nabila' }, 0, 'done'], ['Phones and tablets (88)', { kind: 'expert', id: 'nabila' }, 0, 'doing'], ['Photo clean-up', { kind: 'team', id: 'team-setup' }, 1800, 'todo']],
    updates: [['Accessories are in: 212 products with prices, stock and categories.', 70, true, 20, 'Nabila Chowdhury'], ['Sheet has 6 chargers without a warranty line; asked the merchant.', 70, false, 19, 'Nabila Chowdhury']],
    msgs: [['expert', 'Nabila Chowdhury', 'Got the sheet, thank you. 212 accessories are in so far. Phones next.', 20], ['merchant', SELF_NAME, 'Great. Please keep the warranty line on each charger.', 18], ['expert', 'Nabila Chowdhury', 'Will do. Done by Friday.', 17]] });
  mk({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: 'store-design', pkgId: 'standard', daysAgo: 2, status: 'progress', expertId: 'sumaiya', teamId: 'team-design', method: 'bkash',
    brief: { site: 'https://dazzleshop.com.bd', like: 'Apple and Samsung stores: dark, calm, big product photos. Gadstyle for the menu.', must: 'New phones first, EMI line, warranty promise, hotline in the header.' },
    tasks: [['Home page layout', { kind: 'expert', id: 'sumaiya' }, 0, 'doing'], ['3 banners', { kind: 'expert', id: 'pixel' }, 1500, 'todo'], ['Phone check', { kind: 'expert', id: 'sumaiya' }, 0, 'todo']],
    costs: [['Stock photo licence (2 photos)', 'stock', 600, 1]],
    updates: [['Mood board done: dark and calm, big phone photos, hotline in the header. Home page next.', 25, true, 26, 'Sumaiya Ahmed'], ['Banners go to Pixel Studio once the home page is agreed.', 25, false, 25, 'Sumaiya Ahmed']],
    msgs: [['expert', 'Sumaiya Ahmed', 'Thanks for the brief. You will get a design file to preview on your own products before anything changes.', 30]] });
  mk({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: 'branding', pkgId: 'starter', daysAgo: 26, status: 'closed', expertId: 'pixel', method: 'card', closedDays: 12, revisionsUsed: 1,
    tasks: [['Logo and colours', { kind: 'expert', id: 'pixel' }, 7200, 'done', { pay: { status: 'paid', at: t - 10 * DAY, ref: 'EBL-TRF-55120', to: null } }]],
    updates: [['Two logo ideas sent. The second one with the phone outline was chosen.', 60, true, 20 * 24, 'Pixel Studio'], ['Final files delivered in every size.', 100, true, 13 * 24, 'Pixel Studio']],
    deliverables: [{ id: 'D1', name: 'dazzle-logo-final.zip', note: 'Logo in all sizes, colours and fonts', at: t - 13 * DAY, by: 'Pixel Studio', version: 2 }],
    rating: { stars: 5, text: 'Loved the new logo.', at: t - 12 * DAY } });
  mk({ shopId: '0007', shopName: 'Rongdhonu Fashion', serviceId: 'meta-ads', pkgId: 'standard', daysAgo: 40, status: 'progress', expertId: 'adscraft', teamId: 'team-growth',
    tasks: [['Month 1 campaigns', { kind: 'team', id: 'team-growth' }, 11700, 'done'], ['Month 2 campaigns', { kind: 'team', id: 'team-growth' }, 11700, 'doing']],
    costs: [['Video editing app (1 month)', 'tools', 1200, 30]],
    updates: [['Month 2: the jamdani carousel gets 60% of the budget; two new videos this week.', 55, true, 30, 'AdsCraft BD']],
    brief: { spend: '120000', goal: 'Eid sales of sarees and panjabis' }, reports: [{ id: 'R1', month: 1, title: 'Month 1 report', summary: 'Cost per order ৳182 (target ৳200). Best ad: the jamdani carousel.', kpis: [['Orders from ads', '412'], ['Cost per order', '৳182'], ['Return on ad spend', '4.1×']], status: 'sent', at: t - 9 * DAY, rating: { stars: 4, text: 'Good month, more videos please.' } }] });
  mk({ shopId: '0012', shopName: 'Mohona Traders', serviceId: 'migration', pkgId: 'standard', daysAgo: 6, status: 'waiting', expertId: 'datamove', waitingDays: 2, pausedMs: 0,
    msgs: [['expert', 'DataMove', 'We need the WooCommerce admin login (or an export) to move past orders.', 50]] });
  mk({ shopId: '0017', shopName: 'Shonali Crafts', serviceId: 'store-design', pkgId: 'standard', daysAgo: 18, status: 'qa', expertId: 'sumaiya', teamId: 'team-design', priority: 'high',
    tasks: [['Home, product and category pages', { kind: 'expert', id: 'sumaiya' }, 0, 'done'], ['Festive banners', { kind: 'expert', id: 'pixel' }, 2000, 'done']],
    updates: [['First version is ready and in our quality check.', 90, true, 22, 'Sumaiya Ahmed']],
    deliverables: [{ id: 'D1', name: 'shonali-home-v1.pdf', note: 'Home, product and category pages', at: t - 1 * DAY, by: 'Sumaiya Ahmed', version: 1 }] });
  mk({ shopId: '0031', shopName: 'Dhaka Gadget Hub', serviceId: 'seo', pkgId: 'starter', daysAgo: 35, status: 'delivered', expertId: 'tanvir',
    reports: [{ id: 'R1', month: 1, title: 'Month 1 report', summary: 'Titles and descriptions written for 48 products; 6 keywords on page 1.', kpis: [['Google visits', '+64%'], ['Keywords on page 1', '6 of 10'], ['Orders from Google', '31']], status: 'sent', at: t - 2 * DAY }] });
  mk({ shopId: '0044', shopName: 'Bindu Beauty', serviceId: 'descriptions', pkgId: 'standard', daysAgo: 15, status: 'progress', expertId: 'nabila', priority: 'high' });
  mk({ shopId: '0066', shopName: 'Mehedi Traders', serviceId: 'store-setup', pkgId: 'standard', daysAgo: 1, status: 'brief', brief: { needs: 'bKash, Steadfast and POS for 2 counters' } });
  mk({ shopId: '0072', shopName: 'Sabuj Bazar', serviceId: 'google-ads', pkgId: 'starter', daysAgo: 0.3, status: 'brief', brief: { spend: '40000', goal: 'Grocery orders in Sylhet' } });
  // custom offers (Batch D): one paid and under way, one waiting for Dazzle Shop to pay
  mk({ shopId: '0044', shopName: 'Bindu Beauty', serviceId: 'custom-bindu-insta', pkgId: 'offer', daysAgo: 8, status: 'progress', expertId: 'sumaiya', teamId: 'team-design', method: 'bkash',
    tasks: [['Shoot 20 products', { kind: 'expert', id: 'pixel' }, 6000, 'done'], ['Instagram shop and highlights', { kind: 'expert', id: 'sumaiya' }, 0, 'doing']],
    costs: [['Studio rental (half day)', 'other', 2500, 6]],
    updates: [['20 products shot; the edited photos are in your files.', 60, true, 40, 'Pixel Studio'], ['Instagram shop sections set up; highlights next.', 80, true, 6, 'Sumaiya Ahmed']],
    sent: [{ ch: 'email', to: 'owner@bindubeauty.com.bd', at: t - 9 * DAY, by: 'Mahin Khan' }, { ch: 'whatsapp', to: '+880 1712-440044', at: t - 9 * DAY, by: 'Mahin Khan' }] });
  mk({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: 'custom-dazzle-eid', pkgId: 'offer', daysAgo: 1, status: 'unpaid',
    sent: [{ ch: 'email', to: 'owner@dazzleshop.com.bd', at: t - 1 * DAY, by: 'Mahin Khan' }, { ch: 'whatsapp', to: '+880 1553-336655', at: t - 1 * DAY, by: 'Mahin Khan' }] });
  return { list: out, seq: n };
}
function bankOfWho(who, teams = TEAMS) {
  if (!who) return null;
  const x = who.kind === 'team' ? teams.find((m) => m.id === who.id) : EXPERTS.find((m) => m.id === who.id);
  return x && x.bank ? { ...x.bank } : null;
}
const SEED_CUSTOM = [
  customService('custom-bindu-insta', { shopId: '0044', title: 'Instagram shop and 20 product photos', scope: 'Product photos for 20 bestsellers and an Instagram shop with highlights, made for Bindu Beauty.', includes: ['20 products shot and edited', 'Instagram shop sections', '4 story highlights'], fee: 16000, days: 10, revisions: 1, cat: 'content' }),
  customService('custom-dazzle-eid', { shopId: SELF_SHOP, title: 'Eid campaign kit: 6 banners and 3 product videos', scope: 'A ready Eid campaign for Dazzle Shop: 6 banners for the store and Facebook, and 3 short product videos for Reels.', includes: ['6 banners (store + Facebook sizes)', '3 product videos, 15–20 seconds', 'Captions in Bangla and English'], fee: 18000, days: 7, revisions: 2, cat: 'grow', cover: PHOTO.filming }),
];

function seed(t) {
  const services = [...SERVICES.map(withMedia), ...SEED_CUSTOM];
  const o = seedOrders(t, services, TEAMS);
  return { v: DB_VERSION, services: JSON.parse(JSON.stringify(services)), experts: JSON.parse(JSON.stringify(EXPERTS)), teams: JSON.parse(JSON.stringify(TEAMS)), orders: o.list, requests: [
    { id: 'RQ-1', shopId: '0012', shopName: 'Mohona Traders', text: 'Labels and stickers for our own spice packets (4 sizes), print-ready.', budget: 8000, at: t - 0.6 * DAY, by: 'Mohona Traders', status: 'open', orderId: null },
  ], seq: { order: o.seq, refund: 1, quote: 1, custom: 1, request: 2 }, settings: { vatPct: VAT, qaDefault: true, quietDays: QUIET_DAYS, offerDays: OFFER_DAYS } };
}

// ---- storage ------------------------------------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
// 2: store design repriced and delivered as a design file (Batch A); 3: pictures, custom offers, teams, tasks, costs and
// updates (Batch D). Saved demo data restarts once.
const DB_VERSION = 3;
const EMPTY = { v: DB_VERSION, services: SERVICES.map(withMedia), experts: EXPERTS, teams: TEAMS, orders: [], requests: [], seq: { order: 1001, refund: 1, quote: 1, custom: 1, request: 1 }, settings: { vatPct: VAT, qaDefault: true, quietDays: QUIET_DAYS, offerDays: OFFER_DAYS } };
export function read() {
  if (!isBrowser) return EMPTY;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== DB_VERSION) { db = seed(now()); write(db, true); return db; }
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
export const getTeams = () => read().teams || [];
export const teamById = (id) => (read().teams || []).find((x) => x.id === id) || null;
/** Who a task goes to: { kind, id, name, bank, kind } for an expert or a team. */
export function whoOf(who) {
  if (!who) return null;
  const x = who.kind === 'team' ? teamById(who.id) : expertById(who.id);
  return x ? { kind: who.kind, id: x.id, name: x.name, bank: x.bank || null, partner: who.kind === 'expert' && x.kind === 'partner', phone: x.phone || '', email: x.email || '' } : { kind: who.kind, id: who.id, name: who.id, bank: null };
}
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
  if (status === 'unpaid' && o.offer && o.offer.expiresAt && t > o.offer.expiresAt) status = 'expired';
  const waitingMs = o.status === 'waiting' && o.waitingSince ? t - o.waitingSince : 0;
  if (o.status === 'waiting' && waitingMs > quietDays * DAY) { status = 'closed'; autoClosed = true; }
  const paused = (o.pausedMs || 0) + (status === 'waiting' ? waitingMs : 0);
  const due = o.dueAt ? o.dueAt + paused : null;
  const working = ['brief', 'progress', 'qa'].includes(status);
  const overdue = !!due && working && t > due;
  const refunded = (o.refunds || []).filter((r) => r.status === 'sent').reduce((a, r) => a + r.amount, 0);
  const paidTotal = (o.paid && o.paid.pending ? 0 : o.total) + (o.quotes || []).filter((q) => q.status === 'accepted').reduce((a, q) => a + q.total, 0);
  return {
    status, autoClosed, due, overdue, left: due ? due - t : null, paused, waiting: status === 'waiting',
    quietLeft: status === 'waiting' ? Math.max(0, Math.ceil((quietDays * DAY - waitingMs) / DAY)) : null,
    quietWarn: status === 'waiting' && waitingMs > QUIET_WARN * DAY,
    revisionsLeft: Math.max(0, (pkg.revisions || 0) - (o.revisionsUsed || 0)),
    lastReport: (o.reports || []).filter((r) => r.status === 'sent').slice(-1)[0] || null,
    svc, pkg, expert: o.expertId ? expertById(o.expertId) : null, team: o.teamId ? teamById(o.teamId) : null, unpaid: status === 'unpaid', paidTotal, refunded, refundable: paidTotal - refunded - (o.refunds || []).filter((r) => ['requested', 'approved'].includes(r.status)).reduce((a, r) => a + r.amount, 0),
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
  if (o.paid && o.paid.pending) return [];
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
/**
 * What GridCommerce pays out for an order (Batch D): each task's payout once it is owed or paid, to the task's expert or
 * team (`payee` with the bank at the time). servicesSync books each as a Finance expense waiting for approval.
 */
export function payables(o) {
  const svc = serviceById(o.serviceId) || { name: o.serviceId };
  return (o.tasks || []).filter((x) => x.cost > 0 && x.pay && x.pay.status !== 'unpaid').map((x) => {
    const w = whoOf(x.who) || { name: '—' };
    return { key: o.id + ':task:' + x.id, at: x.pay.at || x.at, amount: x.cost, expert: { name: w.name, phone: w.phone, email: w.email }, bank: x.pay.to || w.bank, taskId: x.id, status: x.pay.status, ref: x.pay.ref || '', label: `${x.title} · ${svc.name} for ${o.shopName} (${o.id})` };
  });
}
/** Money on one order: { revenue (fees billed, no VAT), refunds (no VAT), tasks (payouts planned), costs (other spend), cost, profit, margin, paidOut, owed }. */
export function profitOf(o, t = now()) {
  const revenue = billables(o, t).reduce((a, b) => a + b.fee, 0);
  const refunds = Math.round((o.refunds || []).filter((r) => r.status === 'sent').reduce((a, r) => a + (r.amount * 100) / (100 + (o.vatPct || 0)), 0));
  const tasks = (o.tasks || []).reduce((a, x) => a + (x.cost || 0), 0);
  const costs = (o.costs || []).reduce((a, x) => a + (x.amount || 0), 0);
  const paidOut = (o.tasks || []).filter((x) => x.pay && x.pay.status === 'paid').reduce((a, x) => a + x.cost, 0);
  const owed = (o.tasks || []).filter((x) => x.pay && x.pay.status === 'owed').reduce((a, x) => a + x.cost, 0);
  const net = revenue - refunds;
  const profit = net - tasks - costs;
  return { revenue, refunds, tasks, costs, cost: tasks + costs, profit, margin: net > 0 ? Math.round((profit / net) * 100) : null, paidOut, owed };
}
/** The automatic share text for a service: name, what it is, the starting price and the link (svc.share.text overrides). */
export function autoShareText(svc, link) {
  if (!svc) return '';
  const from = Math.min(...svc.packages.map((p) => p.price));
  const gets = (svc.gets || []).slice(0, 3).join(' · ');
  return `${svc.name} by GridCommerce experts\n${svc.blurb}${gets ? '\n' + gets : ''}\nFrom ৳${from.toLocaleString('en-IN')}${svc.cycle === 'monthly' ? ' a month' : ''} + VAT.${link ? '\n' + link : ''}`;
}
export const shareText = (svc, link) => (svc && svc.share && svc.share.text ? svc.share.text + (link && !svc.share.text.includes(link) ? '\n' + link : '') : autoShareText(svc, link));

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
    const osvc = db.services.find((s) => s.id === o.serviceId);
    if (!ex.skills.includes(o.serviceId) && !(osvc && osvc.custom)) return fail(`${ex.name} doesn’t do this service. Add the skill on Experts first.`);
    if (o.status === 'unpaid') return fail('The store has not paid this offer yet.');
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
/** A file or link for the merchant. kit: a checked store kit (a store design: the merchant previews and applies it). */
export function addDeliverable(id, { name, note, kit = null }, by) {
  if (!String(name || '').trim()) return fail('Name the file or link.', 'name');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    const prev = o.deliverables.filter((d) => d.name === String(name).trim()).length;
    o.deliverables.push({ id: 'D' + (o.deliverables.length + 1), name: String(name).trim(), note: String(note || '').trim(), at: t, by, version: prev + 1, draft: true, ...(kit ? { kit } : {}) });
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
    const rec = { addons: [], brief: [], faq: [], samples: [], cover: '', gallery: [], proof: [], access: { needed: false }, editions: [], plans: [], status: 'paused', gets: [], ...svc, id,
      gallery: (svc.gallery || []).filter((g) => g && g.src).map((g) => ({ src: g.src, caption: String(g.caption || '').trim() })),
      proof: (svc.proof || []).filter((g) => g && (g.src || String(g.title || '').trim())).map((g) => ({ src: g.src || '', title: String(g.title || '').trim(), result: String(g.result || '').trim(), client: String(g.client || '').trim() })), packages: svc.packages.map((p) => ({ ...p, price: Number(p.price), days: Number(p.days), revisions: Number(p.revisions) || 0 })) };
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
    const rec = { skills: [], capacity: 5, commission: 0, rating: 0, active: true, ...ex, bank: cleanBank(ex.bank), id, capacity: Number(ex.capacity) || 1, commission: ex.kind === 'partner' ? Number(ex.commission) || 0 : 0 };
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
  const orders = db.orders.filter((o) => o.paid.at >= from && !o.paid.pending);
  const byService = db.services.map((s) => {
    const os = orders.filter((o) => o.serviceId === s.id);
    const revenue = os.reduce((a, o) => a + billables(o, t).filter((b) => b.at >= from).reduce((x, b) => x + b.fee, 0), 0);
    const done = os.filter((o) => ['delivered', 'closed'].includes(stateOf(o, t).status) || (o.reports || []).some((r) => r.status === 'sent'));
    const onTime = done.filter((o) => { const h = o.history.find((x) => /Delivered/.test(x.text)); return h && o.dueAt ? h.at <= o.dueAt + (o.pausedMs || 0) : true; });
    const pr = os.reduce((a, o) => { const p = profitOf(o, t); return { cost: a.cost + p.cost, profit: a.profit + p.profit, refunds: a.refunds + p.refunds }; }, { cost: 0, profit: 0, refunds: 0 });
    return { id: s.id, name: s.custom ? s.name + ' (custom)' : s.name, custom: !!s.custom, orders: os.length, revenue, cost: pr.cost, profit: pr.profit, margin: revenue - pr.refunds > 0 ? Math.round((pr.profit / (revenue - pr.refunds)) * 100) : null, onTime: done.length ? Math.round((onTime.length / done.length) * 100) : null, revisions: os.length ? Math.round((os.reduce((a, o) => a + (o.revisionsUsed || 0), 0) / os.length) * 10) / 10 : 0, rating: ratingOf(s.id, orders) };
  }).filter((r) => r.orders);
  const byExpert = db.experts.map((e) => {
    const os = orders.filter((o) => o.expertId === e.id);
    const stars = [];
    os.forEach((o) => { if (o.rating) stars.push(o.rating.stars); (o.reports || []).forEach((r) => { if (r.rating) stars.push(r.rating.stars); }); });
    return { id: e.id, name: e.name, kind: e.kind, orders: os.length, load: loadOf(e.id, db.orders, t), capacity: e.capacity, rating: stars.length ? Math.round((stars.reduce((a, b) => a + b, 0) / stars.length) * 10) / 10 : null };
  }).filter((r) => r.orders);
  const shops = {};
  orders.forEach((o) => { shops[o.shopId] = (shops[o.shopId] || 0) + 1; });
  const byOrder = orders.map((o) => ({ o, ...profitOf(o, t) })).sort((a, b) => b.o.paid.at - a.o.paid.at);
  const cost = byService.reduce((a, r) => a + r.cost, 0), profit = byService.reduce((a, r) => a + r.profit, 0);
  const owed = byOrder.reduce((a, r) => a + r.owed, 0), paidOut = byOrder.reduce((a, r) => a + r.paidOut, 0);
  return { byService, byExpert, byOrder, cost, profit, owed, paidOut, orders: orders.length, revenue: byService.reduce((a, r) => a + r.revenue, 0), repeat: Object.values(shops).filter((n) => n > 1).length, buyers: Object.keys(shops).length };
}

// ---- Batch D: teams, tasks and payouts, other costs, progress updates, custom offers, share text -------------------------------
const clean = (x) => String(x == null ? '' : x).trim();
const amt = (x) => Math.round(Number(String(x == null ? '' : x).replace(/[^0-9.]/g, '')) || 0);
function cleanBank(b) {
  if (!b || !clean(b.account)) return null;
  return { method: BANK_METHODS.some((m) => m[0] === b.method) ? b.method : 'bank', name: clean(b.name), account: clean(b.account), branch: clean(b.branch) };
}
export function saveTeam(team) {
  if (!clean(team.name)) return fail('Name the team.', 'name');
  if (!(team.members || []).length) return fail('Add at least one person.', 'members');
  if (!team.lead || !(team.members || []).includes(team.lead)) return fail('Pick the lead from the team.', 'lead');
  return commit((db) => {
    db.teams = db.teams || [];
    const id = team.id || 'team-' + Date.now().toString(36);
    const rec = { skills: [], active: true, ...team, id, name: clean(team.name), bank: cleanBank(team.bank) };
    const i = db.teams.findIndex((x) => x.id === id);
    if (i >= 0) db.teams[i] = rec; else db.teams.push(rec);
    return { ok: true, team: rec };
  });
}
export const setBank = (bank) => cleanBank(bank);

/** Give the order to a team: its lead becomes the expert. */
export function assignTeam(id, teamId, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const tm = (db.teams || []).find((x) => x.id === teamId);
    if (!o) return fail('This order is gone.');
    if (o.status === 'unpaid') return fail('The store has not paid this offer yet.');
    if (!tm || tm.active === false) return fail('Pick an active team.');
    const lead = db.experts.find((e) => e.id === tm.lead);
    o.teamId = tm.id;
    o.expertId = lead ? lead.id : o.expertId;
    if (o.status === 'brief') {
      const svc = db.services.find((s) => s.id === o.serviceId);
      const pkg = svc && svc.packages.find((p) => p.id === o.pkgId);
      o.status = 'progress'; o.startedAt = t; o.dueAt = t + ((pkg && pkg.days) || 7) * DAY;
      sysMsg(o, t, `${tm.name}${lead ? ' (lead ' + lead.name + ')' : ''} is on your order. Work has started; delivery by ${new Date(o.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.`);
    }
    hist(o, t, by, `Given to ${tm.name}`);
    return { ok: true };
  });
}
export function clearTeam(id, by) {
  return commit((db, t) => { const o = findOrder(db, id); if (!o || !o.teamId) return fail('No team on this order.'); hist(o, t, by, 'Team taken off'); o.teamId = null; return { ok: true }; });
}

/** A task on the order for an expert or a team, with what they are paid for it. f: { title, who { kind, id }, due, cost, note } */
export function addTask(id, f, by) {
  if (!clean(f.title)) return fail('Name the task.', 'title');
  if (!f.who || !f.who.id) return fail('Pick who does it.', 'who');
  const cost = amt(f.cost);
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    o.tasks = o.tasks || [];
    const n = o.tasks.reduce((m, x) => Math.max(m, Number(String(x.id).slice(1)) || 0), 0) + 1;
    o.tasks.push({ id: 'T' + n, title: clean(f.title), who: { kind: f.who.kind === 'team' ? 'team' : 'expert', id: f.who.id }, due: f.due || null, status: 'todo', cost, note: clean(f.note), at: t, by, pay: { status: 'unpaid', at: null, ref: '', to: null } });
    const w = whoOfDb(db, f.who);
    hist(o, t, by, `Task “${clean(f.title)}” for ${w ? w.name : f.who.id}${cost ? ' · pays ৳' + cost.toLocaleString('en-IN') : ''}`);
    return { ok: true };
  });
}
function whoOfDb(db, who) {
  const x = who.kind === 'team' ? (db.teams || []).find((m) => m.id === who.id) : db.experts.find((m) => m.id === who.id);
  return x || null;
}
/** Change a task: title, who, due, cost, note (not after its payout is owed), or its status. Done makes the payout owed. */
export function updateTask(id, taskId, patch, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const x = o && (o.tasks || []).find((k) => k.id === taskId);
    if (!x) return fail('This task is gone.');
    const locked = x.pay && x.pay.status !== 'unpaid';
    if (locked && ['who', 'cost'].some((k) => k in patch && JSON.stringify(patch[k]) !== JSON.stringify(x[k]))) return fail('Its payout is already owed: the person and the amount can’t change. Add another task for the difference.');
    if ('title' in patch) { if (!clean(patch.title)) return fail('Name the task.', 'title'); x.title = clean(patch.title); }
    if ('who' in patch) x.who = { kind: patch.who.kind === 'team' ? 'team' : 'expert', id: patch.who.id };
    if ('cost' in patch) x.cost = amt(patch.cost);
    if ('due' in patch) x.due = patch.due || null;
    if ('note' in patch) x.note = clean(patch.note);
    if ('status' in patch && TASK_STATUS.some((s) => s[0] === patch.status) && patch.status !== x.status) {
      if (locked && patch.status !== 'done') return fail('Its payout is already owed, so it stays done.');
      x.status = patch.status;
      hist(o, t, by, `Task “${x.title}” · ${(TASK_STATUS.find((s) => s[0] === x.status) || [])[1]}`);
      if (x.status === 'done' && x.cost > 0 && x.pay.status === 'unpaid') {
        const w = whoOfDb(db, x.who);
        x.pay = { status: 'owed', at: t, ref: '', to: w && w.bank ? { ...w.bank } : null };
        hist(o, t, by, `Payout owed · ৳${x.cost.toLocaleString('en-IN')} to ${w ? w.name : '—'} (Finance approves and pays it)`);
      }
    }
    return { ok: true };
  });
}
export function removeTask(id, taskId, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const i = o ? (o.tasks || []).findIndex((k) => k.id === taskId) : -1;
    if (i < 0) return fail('This task is gone.');
    if (o.tasks[i].pay && o.tasks[i].pay.status !== 'unpaid') return fail('Its payout is already owed, so it stays on the order.');
    hist(o, t, by, `Removed task “${o.tasks[i].title}”`);
    o.tasks.splice(i, 1);
    return { ok: true };
  });
}
/** Finance paid a task's payout (servicesSync reads it back from the expense). */
export function markTaskPaid(id, taskId, { at, ref, by } = {}) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const x = o && (o.tasks || []).find((k) => k.id === taskId);
    if (!x || !x.pay || x.pay.status !== 'owed') return fail('Nothing owed on this task.');
    x.pay = { ...x.pay, status: 'paid', at: at || t, ref: ref || '' };
    hist(o, at || t, by || 'Finance', `Payout paid · ৳${x.cost.toLocaleString('en-IN')}${ref ? ' · ref ' + ref : ''}`);
    return { ok: true };
  });
}
/** Other money spent on the order (tools, stock photos, printing …). */
export function addCost(id, f, by) {
  const a = amt(f.amount);
  if (!clean(f.label)) return fail('Say what it was for.', 'label');
  if (!a) return fail('Enter the amount.', 'amount');
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    o.costs = o.costs || [];
    const n = o.costs.reduce((m, x) => Math.max(m, Number(String(x.id).slice(1)) || 0), 0) + 1;
    o.costs.push({ id: 'C' + n, label: clean(f.label), kind: COST_KINDS.some((k) => k[0] === f.kind) ? f.kind : 'other', amount: a, at: t, by });
    hist(o, t, by, `Cost · ${clean(f.label)} · ৳${a.toLocaleString('en-IN')}`);
    return { ok: true };
  });
}
export function removeCost(id, costId, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const i = o ? (o.costs || []).findIndex((k) => k.id === costId) : -1;
    if (i < 0) return fail('This cost is gone.');
    hist(o, t, by, `Removed cost “${o.costs[i].label}”`);
    o.costs.splice(i, 1);
    return { ok: true };
  });
}

/** A progress update. shared = the store sees it now; otherwise it stays with the team until published. */
export function postUpdate(id, { text, progress, shared }, by) {
  if (!clean(text)) return fail('Write the update.', 'text');
  const p = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o) return fail('This order is gone.');
    o.updates = o.updates || [];
    o.updates.push({ id: 'U' + (o.updates.length + 1), at: t, by, text: clean(text), progress: p, shared: !!shared, publishedAt: shared ? t : null });
    hist(o, t, by, shared ? `Shared an update (${p}%)` : 'Wrote an update for the team');
    return { ok: true };
  });
}
export function publishUpdate(id, updId, shared, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    const u = o && (o.updates || []).find((x) => x.id === updId);
    if (!u) return fail('This update is gone.');
    u.shared = !!shared; u.publishedAt = shared ? t : null;
    hist(o, t, by, shared ? 'Shared an update with the store' : 'Took an update back from the store');
    return { ok: true };
  });
}
/** The updates a store sees, newest first, and how far the work is (the latest shared progress). */
export function sharedUpdates(o) {
  const list = (o.updates || []).filter((u) => u.shared).slice().sort((a, b) => (b.publishedAt || b.at) - (a.publishedAt || a.at));
  return { list, progress: list.length ? list[0].progress : null };
}

/**
 * An instant custom service for one store: GridCommerce writes it, sends the payment link, and the store pays to confirm.
 * f: { shopId, shopName, title, scope, includes[], fee, days, revisions, cat, expertId, teamId, validDays, cover } → { ok, order }
 */
export function createOffer(f, by) {
  const fee = amt(f.fee);
  if (!f.shopId) return fail('Pick the store.', 'shopId');
  if (!clean(f.title)) return fail('Name the work.', 'title');
  if (!clean(f.scope)) return fail('Say what is included.', 'scope');
  if (!fee) return fail('Enter the price.', 'fee');
  if (!(Number(f.days) > 0)) return fail('Enter the days to deliver.', 'days');
  return commit((db, t) => {
    const n = (db.seq.custom = (db.seq.custom || 1)) && db.seq.custom++;
    const sid = 'custom-' + t.toString(36) + n;
    const svc = customService(sid, { ...f, fee });
    db.services.push(svc);
    const id = 'SO-' + db.seq.order++;
    const m = money(fee, db.settings.vatPct);
    const valid = Number(f.validDays) || db.settings.offerDays || OFFER_DAYS;
    const o = {
      id, invNo: 'SINV-' + id.slice(3), shopId: f.shopId, shopName: f.shopName || f.shopId, serviceId: sid, pkgId: 'offer', addons: [], cycle: 'oneoff', ...m, brief: {}, files: [],
      paid: { method: '', txId: '', at: t, pending: true }, status: 'unpaid', expertId: f.expertId || null, teamId: f.teamId || null, priority: 'normal', startedAt: null, dueAt: null,
      pausedMs: 0, waitingSince: null, revisionsUsed: 0, qa: db.settings.qaDefault !== false, messages: [], deliverables: [], reports: [], access: { status: 'none' }, quotes: [], refunds: [],
      rating: null, history: [], closedAt: null, closeReason: '', tasks: [], costs: [], updates: [],
      offer: { code: offerCode(t + n * 7919), expiresAt: t + valid * DAY, sent: [], by, at: t },
    };
    if (o.teamId) { const tm = (db.teams || []).find((x) => x.id === o.teamId); if (tm) o.expertId = tm.lead; }
    const rq = f.requestId && (db.requests || []).find((x) => x.id === f.requestId);
    if (rq) { rq.status = 'offered'; rq.orderId = id; o.requestId = rq.id; }
    hist(o, t, by, `Custom offer made · ৳${m.total.toLocaleString('en-IN')} with VAT · valid ${valid} days`);
    db.orders.push(o);
    return { ok: true, order: o };
  });
}
/** Log that the payment link went out (email, sms, whatsapp, messenger, copy …). */
export function logOfferSent(id, { ch, to }, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || !o.offer) return fail('This offer is gone.');
    o.offer.sent.push({ ch, to: clean(to), at: t, by });
    hist(o, t, by, `Payment link sent · ${ch}${to ? ' · ' + clean(to) : ''}`);
    return { ok: true };
  });
}
export const offerByCode = (code) => read().orders.find((o) => o.offer && o.offer.code === String(code || '').trim().toUpperCase()) || null;
/** The payment link (path; the page adds its own address). */
export const offerPath = (o) => '/service-offer?code=' + (o && o.offer ? o.offer.code : '');
/** The store pays an offer: the order starts (with the team or expert already on it, or waits for one). */
export function payOffer(code, method, payer) {
  if (!PAY_METHODS.some((m) => m[0] === method)) return fail('Pick how you pay.', 'method');
  return commit((db, t) => {
    const o = db.orders.find((x) => x.offer && x.offer.code === String(code || '').trim().toUpperCase());
    if (!o) return fail('This payment link is not valid.');
    if (o.status !== 'unpaid') return fail(o.status === 'cancelled' ? 'This offer was withdrawn.' : 'This offer is already paid.');
    if (t > o.offer.expiresAt) return fail('This offer has expired. Ask GridCommerce for a new link.');
    o.paid = { method, txId: txId(t), at: t };
    const svc = db.services.find((s) => s.id === o.serviceId);
    const pkg = svc && svc.packages[0];
    if (o.expertId) { o.status = 'progress'; o.startedAt = t; o.dueAt = t + ((pkg && pkg.days) || 7) * DAY; }
    else o.status = 'brief';
    hist(o, t, payer || o.shopName, `Paid the custom offer · ${payLabel(method)}`);
    sysMsg(o, t, o.expertId ? `Thank you, payment received. Work has started; delivery by ${new Date(o.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.` : 'Thank you, payment received. An expert is assigned within one working day.');
    return { ok: true, order: o };
  });
}
export function withdrawOffer(id, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.status !== 'unpaid') return fail('Only an unpaid offer can be withdrawn.');
    o.status = 'cancelled'; o.closedAt = t; o.closeReason = 'Offer withdrawn';
    hist(o, t, by, 'Offer withdrawn');
    return { ok: true };
  });
}
/** Give an unpaid (or expired) offer more days. */
export function extendOffer(id, days, by) {
  return commit((db, t) => {
    const o = findOrder(db, id);
    if (!o || o.status !== 'unpaid') return fail('Only an unpaid offer can be extended.');
    o.offer.expiresAt = Math.max(o.offer.expiresAt, t) + (Number(days) || 7) * DAY;
    hist(o, t, by, `Offer valid until ${new Date(o.offer.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`);
    return { ok: true };
  });
}
/** Save (or clear) the share text that overrides the automatic one. */
export function saveShareText(serviceId, text) {
  return commit((db) => {
    const s = db.services.find((x) => x.id === serviceId);
    if (!s) return fail('This service is gone.');
    s.share = clean(text) ? { text: String(text).trim() } : null;
    return { ok: true };
  });
}

/** A store asks for work that is not in the catalogue; GridCommerce answers with a custom offer (createOffer › requestId). */
export function requestCustom({ shopId, shopName, text, budget }) {
  if (clean(text).length < 10) return fail('Say what you need in a sentence or two.', 'text');
  return commit((db, t) => {
    db.requests = db.requests || [];
    db.seq.request = db.seq.request || 1;
    const rq = { id: 'RQ-' + db.seq.request++, shopId: shopId || SELF_SHOP, shopName: shopName || SELF_NAME, text: clean(text), budget: amt(budget) || null, at: t, by: shopName || SELF_NAME, status: 'open', orderId: null };
    db.requests.push(rq);
    return { ok: true, request: rq };
  });
}
export const getRequests = (shopId) => (read().requests || []).filter((r) => !shopId || r.shopId === shopId).slice().sort((a, b) => b.at - a.at);
export function closeRequest(id, note, by) {
  return commit((db, t) => {
    const rq = (db.requests || []).find((x) => x.id === id);
    if (!rq || rq.status !== 'open') return fail('This request is not open.');
    Object.assign(rq, { status: 'closed', closedAt: t, closedBy: by, note: clean(note) });
    return { ok: true };
  });
}
