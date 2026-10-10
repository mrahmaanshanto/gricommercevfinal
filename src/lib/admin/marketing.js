// admin/marketing — GridCommerce's own marketing to win merchants (not the merchants' marketing): marketing campaigns,
// the ad accounts (Meta Business, Google Ads, TikTok), ad campaigns → ad sets → ads, conversion tracking (Meta Pixel +
// Conversions API, Google tag) and UTM links. Front end only: localStorage `gc.admin.marketing` (createStore).
// Never reads a merchant lib (adSpend, attribution, channels …).
//
// Results follow the clock. Only the plan is stored (campaign dates and pauses, ad set budgets, each ad's rates); every
// day's spend, impressions, reach, clicks, leads, qualified leads, trials, paid stores and first-year revenue is worked
// out from a fixed seed per unit and day (records(data, t)), so a pause stops spend from that minute and today grows
// while the day goes on. A unit is one ad (Meta, Google, YouTube channels) or one non-ad channel of a campaign
// (Email, SMS, Events, Affiliate). Every ad campaign belongs to one marketing campaign, so a campaign's results are
// the sum of its units, and the Overview, Campaigns and Ads pages always agree.
//
// Reads: TEAM, GOALS, CHANNELS, …; mcStatus, adStatus, records, sum, totalsBy, campaignRows, campaignFacts, series,
//   adRows, accountRows, budgetRows, trackingRows, utmRows, attention, attribution, buildUrl, calendar.
// Changes (commit, return { ok, error? }): saveCampaign, launchCampaign, pauseCampaign, resumeCampaign, endCampaign,
//   deleteCampaign, setAdState, connectAccount, disconnectAccount, setBudget, testEvent, recheckEvent, saveUtm,
//   archiveUtm, restoreUtm.

import { createStore } from './store';
import { staff as currentStaff } from '@/lib/platform/store';
import { DAY, rng, hash, startOfDay, startOfMonth, addMonths, dm, dmy } from '@/lib/platform/util';

// ---- lists -------------------------------------------------------------------------------------------------------------
export const TEAM = [
  { id: 'nabila', name: 'Nabila Hossain', role: 'Marketing lead' },
  { id: 'arafat', name: 'Arafat Rahman', role: 'Performance marketer' },
  { id: 'sumaiya', name: 'Sumaiya Akter', role: 'Content and social' },
  { id: 'tanvir', name: 'Tanvir Ahmed', role: 'Events and partnerships' },
];
export const TEAM_NAMES = TEAM.map((p) => p.name);
export const GOALS = [['leads', 'Leads'], ['trials', 'Trials'], ['reactivation', 'Reactivation'], ['upsell', 'Upsell']];
export const goalLabel = (k) => (GOALS.find((g) => g[0] === k) || [k, k])[1];
export const CHANNELS = ['Meta', 'Google', 'YouTube', 'Email', 'SMS', 'Events', 'Affiliate'];
/** Channels run through an ad account (their results come from the ads). */
export const AD_CHANNELS = ['Meta', 'Google', 'YouTube'];
export const isAdChannel = (ch) => AD_CHANNELS.includes(ch);
/** One colour per channel across every page (the --viz order). */
export const CH_COLOR = { Meta: 'var(--viz-1)', Google: 'var(--viz-2)', YouTube: 'var(--viz-3)', Email: 'var(--viz-4)', SMS: 'var(--viz-5)', Events: 'var(--viz-6)', Affiliate: 'var(--viz-7)', Other: 'var(--viz-8)' };
export const STATUSES = ['Draft', 'Scheduled', 'Running', 'Paused', 'Ended'];
export const STATUS_TONE = { Draft: 'neutral', Scheduled: 'primary', Running: 'success', Active: 'success', Paused: 'warning', Ended: 'neutral' };
export const BIZ_TYPES = ['Any business', 'Online sellers', 'Retail shops', 'Retail + online', 'Pharmacy', 'Restaurants', 'Wholesale'];
export const DISTRICTS = ['All Bangladesh', 'Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla'];
export const SIZES = ['Any size', 'Starting out (under 100 orders a month)', 'Growing (100 to 1,000)', 'Established (over 1,000)'];

export const PLATFORMS = {
  meta: { key: 'meta', name: 'Meta', long: 'Meta Business', logo: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', color: 'var(--viz-1)' },
  google: { key: 'google', name: 'Google', long: 'Google Ads', logo: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', color: 'var(--viz-2)' },
  tiktok: { key: 'tiktok', name: 'TikTok', long: 'TikTok Ads', logo: '/assets/57bb10142b6017571910098da3778028.png', color: 'var(--viz-8)' },
};
export const PLATFORM_KEYS = ['meta', 'google', 'tiktok'];

/** The website's real pages (gridcommerce.net). */
export const SITE = 'https://gridcommerce.net';
export const PAGES = [
  ['/', 'Home'], ['/pricing', 'Pricing'], ['/features/orders', 'Features · Orders'], ['/features/pos', 'Features · POS'],
  ['/solutions/online-commerce', 'Solutions · Online commerce'], ['/solutions/retail-commerce', 'Solutions · Retail commerce'],
  ['/signup', 'Sign up'], ['/contact', 'Contact'], ['/migration', 'Migration'],
];
export const pageLabel = (p) => (PAGES.find((x) => x[0] === p) || [p, p])[1];
export const SOURCES = ['facebook', 'instagram', 'google', 'youtube', 'newsletter', 'sms', 'event', 'affiliate', 'partner', 'whatsapp', 'linkedin', 'email_signature'];
export const MEDIUMS = ['cpc', 'paid_social', 'video', 'email', 'sms', 'qr', 'referral', 'organic_social', 'display'];
/** The UTM source and medium a channel's link gets. */
export const CH_UTM = { Meta: ['facebook', 'paid_social'], Google: ['google', 'cpc'], YouTube: ['youtube', 'video'], Email: ['newsletter', 'email'], SMS: ['sms', 'sms'], Events: ['event', 'qr'], Affiliate: ['affiliate', 'referral'] };
const GOAL_PAGE = { leads: '/contact', trials: '/signup', reactivation: '/pricing', upsell: '/pricing' };

/** First-year value of a store that starts paying (average plan × 12): the revenue in ROAS. */
export const FIRST_YEAR = 30000;

// ---- how each channel performs (per unit and day) ---------------------------------------------------------------------
// cpm: cost per 1,000 impressions (for Email and SMS: per 1,000 delivered; Events: per 1,000 people reached);
// freq: impressions per person; ctr: clicks (or booth visits) per impression; lead: leads per click; qual: share of
// leads sales calls qualified; trial: trials per lead; paid: paid stores per trial.
const PROFILE = {
  Meta: { cpm: 190, freq: 1.7, ctr: 0.013, lead: 0.065, qual: 0.52, trial: 0.3, paid: 0.15 },
  Google: { cpm: 950, freq: 1.25, ctr: 0.042, lead: 0.09, qual: 0.7, trial: 0.34, paid: 0.2 },
  YouTube: { cpm: 120, freq: 1.5, ctr: 0.005, lead: 0.035, qual: 0.48, trial: 0.28, paid: 0.17 },
  Email: { cpm: 250, freq: 1, ctr: 0.028, lead: 0.07, qual: 0.6, trial: 0.35, paid: 0.25 },
  SMS: { cpm: 350, freq: 1, ctr: 0.016, lead: 0.09, qual: 0.55, trial: 0.3, paid: 0.22 },
  Events: { cpm: 20000, freq: 1, ctr: 0.12, lead: 0.25, qual: 0.62, trial: 0.32, paid: 0.24 },
  Affiliate: { cpm: 400, freq: 1.2, ctr: 0.03, lead: 0.1, qual: 0.68, trial: 0.4, paid: 0.3 },
  Other: { cpm: 0, freq: 1.1, ctr: 1, lead: 0.08, qual: 0.6, trial: 0.3, paid: 0.2 },
};

export const METRICS = ['spend', 'impressions', 'reach', 'clicks', 'leads', 'qualified', 'trials', 'paid', 'revenue'];
const zero = () => ({ spend: 0, impressions: 0, reach: 0, clicks: 0, leads: 0, qualified: 0, trials: 0, paid: 0, revenue: 0 });
/** Add b into a (a is changed and returned). */
function add(a, b) { for (const k of METRICS) a[k] += b[k] || 0; return a; }
/** Ratios for a total: CTR, CPL, CAC, ROAS, cost per trial, conversion rates. */
export function ratios(m) {
  return {
    ...m,
    ctr: m.impressions ? (m.clicks / m.impressions) * 100 : null,
    cpl: m.leads >= 0.5 ? m.spend / m.leads : null,
    cpt: m.trials >= 0.5 ? m.spend / m.trials : null,
    cac: m.paid >= 0.5 ? m.spend / m.paid : null,
    roas: m.spend ? m.revenue / m.spend : null,
    leadRate: m.clicks ? (m.leads / m.clicks) * 100 : null,
    trialRate: m.leads ? (m.trials / m.leads) * 100 : null,
    paidRate: m.trials ? (m.paid / m.trials) * 100 : null,
  };
}
export const sum = (recs) => ratios(recs.reduce((a, r) => add(a, r.m), zero()));

// ---- time spans --------------------------------------------------------------------------------------------------------
const openPause = (x) => (x.pauses || []).some((p) => p[1] == null);
/** The stretches of time x was running, up to t. x: { start, end?, endedAt?, pauses: [[from, to|null]] }. */
function spansOf(x, t) {
  if (!x || x.state === 'draft' || x.start == null) return [];
  const e = Math.min(x.end ?? Infinity, x.endedAt ?? Infinity, t);
  if (e <= x.start) return [];
  let out = [[x.start, e]];
  for (const [a, b0] of x.pauses || []) {
    const b = b0 ?? Infinity;
    out = out.flatMap(([p, q]) => {
      const r = [];
      if (a > p) r.push([p, Math.min(q, a)]);
      if (b < q) r.push([Math.max(p, b), q]);
      return r.filter(([u, v]) => v > u);
    });
  }
  return out;
}
function intersect(A, B) {
  const out = [];
  for (const [a, b] of A) for (const [c, d] of B) { const s = Math.max(a, c), e = Math.min(b, d); if (e > s) out.push([s, e]); }
  return out;
}
function coverOn(spans, d) {
  let ms = 0;
  for (const [a, b] of spans) { const s = Math.max(a, d), e = Math.min(b, d + DAY); if (e > s) ms += e - s; }
  return ms / DAY;
}

/** Draft · Scheduled · Running · Paused · Ended for a marketing campaign. */
export function mcStatus(c, t) {
  if (c.state === 'draft') return 'Draft';
  if (c.endedAt || (c.end && t >= c.end)) return 'Ended';
  if (openPause(c)) return 'Paused';
  if (t < c.start) return 'Scheduled';
  return 'Running';
}
/** Active · Scheduled · Paused · Ended for an ad campaign, ad set or ad. */
export function adStatus(x, t) {
  if (x.endedAt || (x.end && t >= x.end)) return 'Ended';
  if (openPause(x)) return 'Paused';
  if (x.start != null && t < x.start) return 'Scheduled';
  return 'Active';
}

// ---- seed ----------------------------------------------------------------------------------------------------------------
const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const shortCode = (seed, taken) => {
  const r = rng('utm:' + seed);
  const A = 'abcdefghjkmnpqrstuvwxyz23456789';
  for (;;) {
    let c = '';
    for (let i = 0; i < 4; i++) c += A[Math.floor(r() * A.length)];
    if (!taken.has(c)) { taken.add(c); return c; }
  }
};

function seed(now) {
  const d0 = startOfDay(now);
  const day = (n, h = 10) => d0 + n * DAY + h * 3600e3;
  const camps = [];
  const ads = [];
  const links = [];
  const taken = new Set();

  // marketing campaigns: [id, name, goal, channels, start, end, state, owner, audience [type, district, size], extra]
  const MC = [
    ['MC-101', 'Always-on: search and retargeting', 'leads', ['Google', 'Meta'], -150, 81, 'live', 'Arafat Rahman', ['Any business', 'All Bangladesh', 'Any size'], { slug: 'always-on' }],
    ['MC-102', 'Retail POS launch, Dhaka', 'trials', ['Meta', 'YouTube', 'Events'], -40, 20, 'live', 'Nabila Hossain', ['Retail shops', 'Dhaka', 'Growing (100 to 1,000)'], { plan: { Events: 120000 }, win: { Events: [-31, -29] } }],
    ['MC-103', 'Puja offer for online sellers', 'trials', ['Meta', 'Email', 'SMS'], -12, 10, 'live', 'Sumaiya Akter', ['Online sellers', 'All Bangladesh', 'Starting out (under 100 orders a month)'], { plan: { Email: 9000, SMS: 16000 }, tight: 0.45 }],
    ['MC-104', 'Win back cancelled stores', 'reactivation', ['Email', 'SMS'], -25, 35, 'live', 'Nabila Hossain', ['Any business', 'All Bangladesh', 'Any size'], { plan: { Email: 12000, SMS: 24000 } }],
    ['MC-105', 'Upgrade to Business plan', 'upsell', ['Email', 'Meta'], -35, 25, 'live', 'Arafat Rahman', ['Retail + online', 'All Bangladesh', 'Established (over 1,000)'], { plan: { Email: 8000 }, pausedAt: -5 }],
    ['MC-106', 'Facebook sellers to their own store', 'leads', ['Meta'], -88, -30, 'ended', 'Sumaiya Akter', ['Online sellers', 'All Bangladesh', 'Starting out (under 100 orders a month)'], {}],
    ['MC-107', 'Chattogram SME fair', 'leads', ['Events', 'SMS'], -64, -50, 'ended', 'Tanvir Ahmed', ['Retail shops', 'Chattogram', 'Any size'], { plan: { Events: 150000, SMS: 18000 }, win: { Events: [-60, -58] } }],
    ['MC-108', 'Agency partner push', 'trials', ['Affiliate', 'Email'], -45, 45, 'live', 'Tanvir Ahmed', ['Any business', 'All Bangladesh', 'Any size'], { plan: { Affiliate: 90000, Email: 10000 } }],
    ['MC-109', 'Winter fashion sellers', 'trials', ['Meta', 'Google', 'Email'], 9, 50, 'live', 'Sumaiya Akter', ['Online sellers', 'Dhaka', 'Growing (100 to 1,000)'], { plan: { Email: 10000 } }],
    ['MC-110', 'Pharmacy POS, Sylhet and Rajshahi', 'leads', ['Google', 'SMS'], 20, 60, 'draft', 'Arafat Rahman', ['Pharmacy', 'Sylhet', 'Any size'], { plan: { Google: 90000, SMS: 20000 } }],
    ['MC-111', 'YouTube how-to series', 'leads', ['YouTube'], -70, 50, 'live', 'Sumaiya Akter', ['Any business', 'All Bangladesh', 'Starting out (under 100 orders a month)'], {}],
    ['MC-112', 'Restaurant POS pilot, Gulshan', 'leads', ['Events', 'SMS'], -122, -96, 'ended', 'Tanvir Ahmed', ['Restaurants', 'Dhaka', 'Any size'], { plan: { Events: 80000, SMS: 12000 }, win: { Events: [-112, -110] } }],
  ];
  for (const [id, name, goal, channels, s, e, state, owner, [type, district, size], x] of MC) {
    const c = {
      id, name, goal, channels, start: day(s, 9), end: day(e, 23), state: state === 'draft' ? 'draft' : 'live', owner,
      audience: { type, district, size }, plan: {}, win: {}, pauses: [], slug: x.slug || slug(name), notes: '',
      createdAt: day(Math.min(s, 0) - 7, 11), log: [],
    };
    for (const ch of channels) {
      if (x.plan && x.plan[ch] != null) c.plan[ch] = x.plan[ch];
      if (x.win && x.win[ch]) c.win[ch] = [day(x.win[ch][0], 9), day(x.win[ch][1], 20)];
    }
    if (state === 'ended') c.endedAt = c.end;
    if (x.pausedAt != null) c.pauses.push([day(x.pausedAt, 16), null]);
    c.tight = x.tight || 1;
    c.log.push({ at: c.createdAt, by: owner, text: 'Created the campaign' });
    if (c.state !== 'draft') c.log.push({ at: Math.min(c.start, now), by: owner, text: c.start > now ? 'Scheduled the campaign' : 'Launched the campaign' });
    if (x.pausedAt != null) c.log.push({ at: day(x.pausedAt, 16), by: owner, text: 'Paused: the Business plan page is being rewritten' });
    if (state === 'ended') c.log.push({ at: c.end, by: owner, text: 'Ended the campaign' });
    c.log.reverse();
    camps.push(c);
  }

  // ad campaigns → ad sets → ads: [id, account, channel, mc, name, objective, start, end|null, sets [name, audience, budget/day, ads [name, creative]]]
  const AC = [
    ['AC-201', 'google-ads', 'Google', 'MC-101', 'Search: POS software', 'Leads', -150, null, [
      ['POS software, exact', 'pos software bd · billing software · shop software', 1300, [['RSA: Free 14-day trial', 'Search text'], ['RSA: Works without internet', 'Search text']]],
      ['Inventory software, phrase', 'inventory software · stock software', 900, [['RSA: Stock in every branch', 'Search text'], ['RSA: Bangla support, 7 days', 'Search text']]]]],
    ['AC-202', 'google-ads', 'Google', 'MC-101', 'Search: online store builder', 'Leads', -120, null, [
      ['Online shop builder', 'ecommerce website bd · online shop banano', 1000, [['RSA: Your shop online in a day', 'Search text'], ['RSA: bKash and COD built in', 'Search text']]],
      ['Competitor terms', 'Shopify alternative · WooCommerce bd', 600, [['RSA: Move your shop in a weekend', 'Search text']]]]],
    ['AC-203', 'meta-rt', 'Meta', 'MC-101', 'Retargeting: pricing page visitors', 'Sales', -100, null, [
      ['Pricing visitors, 30 days', 'Visited /pricing, no sign-up', 700, [['Carousel: three plans side by side', 'Carousel'], ['Video: 30-second tour', 'Video']]]]],
    ['AC-204', 'meta-acq', 'Meta', 'MC-102', 'POS launch: Dhaka retail', 'Leads', -40, 20, [
      ['Shop owners, Dhaka, 25 to 50', 'Interests: retail, small business · Dhaka', 1600, [['Reel: billing in 3 seconds', 'Reel'], ['Image: free barcode scanner', 'Image']]],
      ['Lookalike: retail merchants', 'Lookalike 1% of retail stores · Bangladesh', 1200, [['Video: a phone shop’s story', 'Video'], ['Carousel: POS, stock, dues', 'Carousel']]]]],
    ['AC-205', 'google-ads', 'YouTube', 'MC-102', 'POS launch: YouTube', 'Awareness', -38, 20, [
      ['In-market: business software', 'In-market audiences · Dhaka', 900, [['Bumper: count less, sell more', 'Video · 6 s'], ['In-stream: 30-second demo', 'Video · 30 s']]]]],
    ['AC-206', 'meta-acq', 'Meta', 'MC-103', 'Puja offer: online sellers', 'Leads', -12, 10, [
      ['Facebook page sellers', 'Page admins selling on Facebook · Bangladesh', 1800, [['Reel: from inbox to delivered', 'Reel'], ['Image: half price for 3 months', 'Image']]],
      ['Lookalike: online merchants', 'Lookalike 2% of online stores', 1400, [['Carousel: courier, COD, bKash', 'Carousel', 'tired'], ['Video: a seller’s first month', 'Video']]]]],
    ['AC-207', 'meta-rt', 'Meta', 'MC-105', 'Upgrade to Business: merchants', 'Sales', -35, 25, [
      ['Growth plan merchants', 'Custom audience: stores on Growth', 600, [['Image: branches and staff roles', 'Image'], ['Video: reports that save a day', 'Video']]]]],
    ['AC-208', 'meta-acq', 'Meta', 'MC-106', 'Facebook sellers: lead form', 'Leads', -88, -30, [
      ['Sellers, 18 to 40', 'Interests: online shopping, f-commerce', 1500, [['Lead form: free setup call', 'Instant form'], ['Reel: stop writing orders by hand', 'Reel']]]]],
    ['AC-209', 'google-ads', 'YouTube', 'MC-111', 'How-to series: YouTube', 'Awareness', -70, 50, [
      ['Small business owners', 'Topics: small business, ecommerce', 800, [['How to take COD orders', 'Video · 4 min'], ['How to count stock fast', 'Video · 3 min']]]]],
    ['AC-210', 'meta-acq', 'Meta', 'MC-109', 'Winter fashion: prospecting', 'Leads', 9, 50, [
      ['Fashion page owners', 'Interests: clothing, boutique · Dhaka', 1500, [['Reel: winter drop in one tap', 'Reel'], ['Image: stock in every size', 'Image']]]]],
    ['AC-211', 'google-ads', 'Google', 'MC-109', 'Winter fashion: search', 'Leads', 9, 50, [
      ['Clothing shop software', 'boutique software · clothing shop pos', 900, [['RSA: sizes and colours made easy', 'Search text']]]]],
  ];
  for (const [id, account, channel, mcId, name, objective, s, e, sets] of AC) {
    const mc = camps.find((c) => c.id === mcId);
    const ac = { id, account, channel, mcId, name, objective, start: Math.max(day(s, 9), mc.start), end: e == null ? null : day(e, 23), pauses: [], sets: [] };
    if (mc.endedAt) ac.endedAt = mc.endedAt;
    for (const p of mc.pauses) ac.pauses.push([...p]);
    sets.forEach(([sn, aud, budget, list], si) => {
      const set = { id: `${id}-S${si + 1}`, name: sn, audience: aud, budgetDay: budget, pauses: [], ads: [] };
      list.forEach(([an, creative, flag], ai) => {
        const r = rng('ad:' + id + si + ai);
        const ad = { id: `${id}-S${si + 1}-A${ai + 1}`, name: an, creative, pauses: [], k: { ctr: 0.75 + r() * 0.5, lead: 0.75 + r() * 0.5, cpm: 0.85 + r() * 0.3 } };
        if (flag === 'tired') ad.tired = { from: d0 - 8 * DAY, factor: 0.4 };
        set.ads.push(ad);
      });
      ac.sets.push(set);
    });
    ads.push(ac);
  }
  // an ad channel's planned budget = its ad sets' daily budgets over the campaign's days (MC-103 is planned tight on purpose)
  for (const c of camps) {
    for (const ch of c.channels) {
      if (!isAdChannel(ch) || c.plan[ch] != null) continue;
      const days = Math.max(1, Math.round((c.end - c.start) / DAY));
      const perDay = ads.filter((a) => a.mcId === c.id && a.channel === ch).reduce((x, a) => x + a.sets.reduce((y, st) => y + st.budgetDay, 0), 0);
      c.plan[ch] = Math.round((perDay * days * 1.04 * (c.tight || 1)) / 1000) * 1000;
    }
    delete c.tight;
  }

  // UTM links: one per campaign channel (as a new campaign makes them), a second creative for some, and a few of the team's own
  const mk = (o) => { const id = 'U-' + (301 + links.length); links.push({ id, term: '', content: '', archived: false, share: 1, ...o, code: shortCode(id + o.campaign + o.source, taken) }); };
  for (const c of camps) {
    c.channels.forEach((ch, i) => {
      const [source, medium] = CH_UTM[ch];
      mk({ name: `${c.name} · ${ch}`, page: c.id === 'MC-102' || c.id === 'MC-112' ? '/solutions/retail-commerce' : c.id === 'MC-106' ? '/solutions/online-commerce' : GOAL_PAGE[c.goal], source, medium, campaign: c.slug, mcId: c.id, channel: ch, by: c.owner, createdAt: c.createdAt + (i + 1) * 3600e3, archived: c.id === 'MC-112', content: ch === 'Meta' && c.id === 'MC-103' ? 'reel' : '' });
    });
  }
  mk({ name: 'Puja offer · Meta image ad', page: '/signup', source: 'facebook', medium: 'paid_social', campaign: 'puja-offer-for-online-sellers', content: 'image', mcId: 'MC-103', channel: 'Meta', share: 0.7, by: 'Sumaiya Akter', createdAt: day(-13, 15) });
  mk({ name: 'POS launch · Instagram reel', page: '/features/pos', source: 'instagram', medium: 'paid_social', campaign: 'retail-pos-launch-dhaka', content: 'reel', mcId: 'MC-102', channel: 'Meta', share: 0.45, by: 'Nabila Hossain', createdAt: day(-41, 12) });
  mk({ name: 'Search: POS keywords', page: '/features/pos', source: 'google', medium: 'cpc', campaign: 'always-on', term: 'pos software', mcId: 'MC-101', channel: 'Google', share: 0.8, by: 'Arafat Rahman', createdAt: day(-149, 12) });
  mk({ name: 'Email signature, sales team', page: '/pricing', source: 'email_signature', medium: 'email', campaign: 'sales-signature', by: 'Nabila Hossain', createdAt: day(-160, 12), own: 7 });
  mk({ name: 'Partner blog: BD Commerce Hub', page: '/solutions/online-commerce', source: 'partner', medium: 'referral', campaign: 'partner-blog', content: 'bdcommercehub', by: 'Tanvir Ahmed', createdAt: day(-75, 12), own: 16 });
  mk({ name: 'WhatsApp status, team', page: '/', source: 'whatsapp', medium: 'organic_social', campaign: 'team-status', by: 'Sumaiya Akter', createdAt: day(-20, 12), own: 9 });
  mk({ name: 'Migration guide flyer (QR)', page: '/migration', source: 'flyer', medium: 'qr', campaign: 'migration-guide', by: 'Tanvir Ahmed', createdAt: day(-55, 12), own: 4 });

  // the ad accounts (TikTok not connected)
  const accounts = [
    { id: 'meta-acq', platform: 'meta', business: 'GridCommerce Ltd (Meta Business)', name: 'GridCommerce: Acquisition', ref: 'act_3318 2290 4471', status: 'on', tokenUntil: now + 52 * DAY, by: 'Arafat Rahman', since: day(-400), sync: now - 12 * 60e3 },
    { id: 'meta-rt', platform: 'meta', business: 'GridCommerce Ltd (Meta Business)', name: 'GridCommerce: Retargeting', ref: 'act_5520 1187 0936', status: 'on', tokenUntil: now + 5 * DAY + 4 * 3600e3, by: 'Arafat Rahman', since: day(-210), sync: now - 12 * 60e3 },
    { id: 'google-ads', platform: 'google', business: 'GridCommerce (Google Ads manager)', name: 'GridCommerce Search and YouTube', ref: '731-204-5590', status: 'on', tokenUntil: now + 300 * DAY, by: 'Arafat Rahman', since: day(-520), sync: now - 25 * 60e3 },
    { id: 'tiktok-ads', platform: 'tiktok', business: 'TikTok for Business', name: 'TikTok Ads', ref: '', status: 'off', tokenUntil: null, by: '', since: null, sync: null },
  ];

  // conversion tracking: events per day (base) and their health
  const tracking = [
    { id: 'meta-pixel', platform: 'meta', name: 'Meta Pixel and Conversions API', ref: 'Pixel 7714 0398 2214', server: true, events: [
      { name: 'PageView', base: 4200, src: 'Browser and server', status: 'ok', match: 7.8 },
      { name: 'Lead', base: 46, src: 'Browser and server', status: 'ok', match: 8.4 },
      { name: 'StartTrial', base: 15, src: 'Browser and server', status: 'warn', match: 4.1, issue: 'Server events arrive without email or phone, so Meta matches fewer of them (match quality 4.1, was 7.9).', since: now - 3 * DAY },
      { name: 'Purchase', base: 3.2, src: 'Server', status: 'ok', match: 8.9 },
    ] },
    { id: 'google-tag', platform: 'google', name: 'Google tag and Ads conversions', ref: 'G-GC7Q2LM41K · AW-11284 0907', server: false, events: [
      { name: 'PageView', base: 4050, src: 'Browser', status: 'ok' },
      { name: 'Lead', base: 44, src: 'Browser', status: 'ok' },
      { name: 'StartTrial', base: 14, src: 'Browser', status: 'fail', issue: 'No StartTrial since the sign-up pages were redone: the tag is missing on /signup/welcome.', since: now - 2 * DAY - 5 * 3600e3 },
      { name: 'Purchase', base: 3, src: 'Browser', status: 'ok' },
    ] },
  ];

  return {
    rev: 1, campaigns: camps, adCampaigns: ads, accounts, tracking, links,
    budgets: { meta: 190000, google: 180000, tiktok: 0 },
  };
}

export const marketing = createStore({ key: 'marketing', version: 1, seed });

// ---- the daily records ---------------------------------------------------------------------------------------------------
const dayKey = (d) => Math.round(d / DAY);
const WINDOW = 200; // days of history worked out
const LEAD_SCALE = 0.2;
let MEMO = { key: '', recs: [] };

function unitDay(profile, k, spend, d, id, extra = 1) {
  const r = rng(id + ':' + dayKey(d));
  const noise = 0.85 + r() * 0.3;
  const cpm = profile.cpm * (k.cpm || 1) * (0.92 + r() * 0.16);
  const s = spend * noise;
  const impressions = cpm ? (s / cpm) * 1000 : 0;
  const clicks = impressions * profile.ctr * (k.ctr || 1) * (0.88 + r() * 0.24);
  // LEAD_SCALE keeps the funnel in step with the rest of the admin (about 40 new trials a month, as the platform has)
  const leads = clicks * profile.lead * (k.lead || 1) * extra * (0.8 + r() * 0.4) * LEAD_SCALE;
  const trials = leads * profile.trial * (0.85 + r() * 0.3);
  const paid = trials * profile.paid * (0.8 + r() * 0.4);
  return { spend: s, impressions, reach: impressions / profile.freq, clicks, leads, qualified: leads * profile.qual, trials, paid, revenue: paid * FIRST_YEAR };
}

/** Every unit's results per day for the last WINDOW days, up to t (today in part). Memoised per change and minute. */
export function records(data, t) {
  const key = (data.rev || 0) + '|' + Math.floor(t / 60e3) + '|' + data.campaigns.length + '|' + data.links.length;
  if (MEMO.key === key && MEMO.data === data) return MEMO.recs;
  const recs = [];
  const today = startOfDay(t);
  const from = today - (WINDOW - 1) * DAY;
  const mcSpans = new Map(data.campaigns.map((c) => [c.id, spansOf(c, t)]));
  // ads
  for (const ac of data.adCampaigns) {
    const mc = data.campaigns.find((c) => c.id === ac.mcId);
    const base = intersect(spansOf(ac, t), mcSpans.get(ac.mcId) || []);
    const acc = data.accounts.find((a) => a.id === ac.account);
    const platform = acc ? acc.platform : 'meta';
    for (const set of ac.sets) {
      const sSpans = intersect(base, spansOf({ start: ac.start, end: ac.end, endedAt: ac.endedAt, pauses: set.pauses }, t));
      const n = set.ads.length || 1;
      for (const ad of set.ads) {
        const spans = intersect(sSpans, spansOf({ start: ac.start, end: ac.end, endedAt: ac.endedAt, pauses: ad.pauses }, t));
        if (!spans.length) continue;
        for (let d = Math.max(from, startOfDay(spans[0][0])); d <= today; d += DAY) {
          const f = coverOn(spans, d);
          if (!f) continue;
          const extra = ad.tired && d >= ad.tired.from ? ad.tired.factor : 1;
          const m = unitDay(PROFILE[ac.channel], ad.k, (set.budgetDay / n) * f, d, ad.id, extra);
          recs.push({ day: d, mcId: ac.mcId, channel: ac.channel, platform, account: ac.account, ac: ac.id, set: set.id, ad: ad.id, goal: mc ? mc.goal : '', m });
        }
      }
    }
  }
  // non-ad channels of each campaign
  for (const c of data.campaigns) {
    const spans0 = mcSpans.get(c.id) || [];
    if (!spans0.length) continue;
    for (const ch of c.channels) {
      if (isAdChannel(ch)) continue;
      const win = c.win && c.win[ch];
      const spans = win ? intersect(spans0, [win]) : spans0;
      if (!spans.length) continue;
      const span = win ? win[1] - win[0] : Math.max(DAY, (c.end || t) - c.start);
      const perDay = ((c.plan[ch] || 0) * DAY) / span;
      for (let d = Math.max(from, startOfDay(spans[0][0])); d <= today; d += DAY) {
        const f = coverOn(spans, d);
        if (!f) continue;
        const m = unitDay(PROFILE[ch], {}, perDay * f, d, c.id + ch);
        recs.push({ day: d, mcId: c.id, channel: ch, platform: null, account: null, ac: null, set: null, ad: null, goal: c.goal, m });
      }
    }
  }
  MEMO = { key, data, recs };
  return recs;
}

/** Records in [from, to). */
export const inRange = (recs, from, to) => recs.filter((r) => r.day >= startOfDay(from) && r.day < to);
/** { key: totals } grouped by a record field (or a function). */
export function totalsBy(recs, by) {
  const out = {};
  const f = typeof by === 'function' ? by : (r) => r[by];
  for (const r of recs) { const k = f(r); if (k == null) continue; add(out[k] || (out[k] = zero()), r.m); }
  for (const k of Object.keys(out)) out[k] = ratios(out[k]);
  return out;
}

// ---- periods ---------------------------------------------------------------------------------------------------------------
export const PERIODS = [['month', 'This month'], ['30', 'Last 30 days'], ['90', 'Last 90 days']];
/** { from, to, prevFrom, prevTo, days, label } for a period key. */
export function periodRange(key, t) {
  const to = startOfDay(t) + DAY;
  if (key === 'month') {
    const from = startOfMonth(t);
    const days = Math.round((to - from) / DAY);
    const prevFrom = addMonths(from, -1, 1);
    return { from, to, prevFrom, prevTo: Math.min(from, prevFrom + days * DAY), days, label: 'This month' };
  }
  const days = Number(key) || 30;
  return { from: to - days * DAY, to, prevFrom: to - 2 * days * DAY, prevTo: to - days * DAY, days, label: `Last ${days} days` };
}
/** Per-day totals over [from, to): [{ day, label, title, ...totals }]. */
export function series(recs, from, to, filter) {
  const days = [];
  for (let d = startOfDay(from); d < to; d += DAY) days.push({ day: d, label: dm(d).replace(/^0/, ''), title: dmy(d), ...zero() });
  const at = new Map(days.map((x, i) => [x.day, i]));
  for (const r of recs) {
    if (filter && !filter(r)) continue;
    const i = at.get(r.day);
    if (i != null) add(days[i], r.m);
  }
  return days;
}

// ---- campaigns ---------------------------------------------------------------------------------------------------------------
export const campaignById = (data, id) => data.campaigns.find((c) => c.id === id) || null;
export const budgetOf = (c) => Object.values(c.plan || {}).reduce((a, v) => a + (Number(v) || 0), 0);

/** The campaign list: each campaign with its status, budget, spend and results so far. */
export function campaignRows(data, t) {
  const recs = records(data, t);
  const by = totalsBy(recs, 'mcId');
  return data.campaigns.map((c) => {
    const m = by[c.id] || ratios(zero());
    const budget = budgetOf(c);
    return { c, id: c.id, name: c.name, status: mcStatus(c, t), budget, spent: m.spend, m, used: budget ? m.spend / budget : 0 };
  }).sort((a, b) => (b.c.start || 0) - (a.c.start || 0));
}

/** One campaign's page: totals, by channel, per day, its ads and its links. */
export function campaignFacts(data, t, id) {
  const c = campaignById(data, id);
  if (!c) return null;
  const recs = records(data, t).filter((r) => r.mcId === id);
  const total = sum(recs);
  const byCh = totalsBy(recs, 'channel');
  const budget = budgetOf(c);
  const status = mcStatus(c, t);
  const from = c.start;
  const to = Math.min(startOfDay(t) + DAY, startOfDay(Math.min(c.end || t, c.endedAt || Infinity)) + DAY);
  const days = from && to > from ? series(recs, from, to) : [];
  const elapsed = c.start && t > c.start ? Math.min(1, (Math.min(t, c.endedAt || Infinity) - c.start) / Math.max(DAY, c.end - c.start)) : 0;
  return {
    c, status, total, budget, elapsed,
    channels: c.channels.map((ch) => ({ ch, plan: c.plan[ch] || 0, m: byCh[ch] || ratios(zero()), ad: isAdChannel(ch) })),
    days,
    ads: adRows(data, t, (ac) => ac.mcId === id),
    links: utmRows(data, t).filter((l) => l.mcId === id),
  };
}

// ---- ads ------------------------------------------------------------------------------------------------------------------------
/** Ad campaigns with their ad sets and ads, each with totals over [from, to) (default: all the window). */
export function adRows(data, t, filter, from = 0, to = Infinity) {
  const recs = records(data, t).filter((r) => r.ac && r.day >= from && r.day < to);
  const byAc = totalsBy(recs, 'ac');
  const bySet = totalsBy(recs, 'set');
  const byAd = totalsBy(recs, 'ad');
  const empty = ratios(zero());
  return data.adCampaigns.filter((ac) => !filter || filter(ac)).map((ac) => {
    const acc = data.accounts.find((a) => a.id === ac.account);
    const mc = campaignById(data, ac.mcId);
    return {
      ac, id: ac.id, name: ac.name, channel: ac.channel, platform: acc ? acc.platform : 'meta', account: acc, mc,
      status: mc && mcStatus(mc, t) === 'Draft' ? 'Draft' : adStatus(ac, t),
      budgetDay: ac.sets.reduce((a, s) => a + s.budgetDay, 0), m: byAc[ac.id] || empty,
      sets: ac.sets.map((s) => ({
        s, id: s.id, name: s.name, audience: s.audience, budgetDay: s.budgetDay, status: adStatus({ ...s, start: ac.start, end: ac.end, endedAt: ac.endedAt }, t), m: bySet[s.id] || empty,
        ads: s.ads.map((ad) => ({ ad, id: ad.id, name: ad.name, creative: ad.creative, status: adStatus({ ...ad, start: ac.start, end: ac.end, endedAt: ac.endedAt }, t), m: byAd[ad.id] || empty })),
      })),
    };
  }).sort((a, b) => (b.ac.start || 0) - (a.ac.start || 0));
}

/** The ad accounts with their state and this month's spend. */
export function accountRows(data, t) {
  const recs = inRange(records(data, t), startOfMonth(t), Infinity);
  const by = totalsBy(recs, 'account');
  return data.accounts.map((a) => {
    const left = a.tokenUntil ? Math.ceil((a.tokenUntil - t) / DAY) : null;
    const state = a.status !== 'on' ? 'off' : left != null && left <= 0 ? 'expired' : left != null && left <= 7 ? 'expiring' : 'ok';
    const label = { off: 'Not connected', expired: 'Sign-in expired', expiring: `Sign-in ends in ${left} day${left === 1 ? '' : 's'}`, ok: 'Connected' }[state];
    const sync = a.status === 'on' ? Math.max(a.sync || 0, t - ((Math.floor(t / 60e3) + a.id.length * 7) % 30) * 60e3) : null;
    return { a, id: a.id, platform: a.platform, state, label, left, sync, spend: by[a.id] ? by[a.id].spend : 0, campaigns: data.adCampaigns.filter((ac) => ac.account === a.id && adStatus(ac, t) === 'Active').length };
  });
}

/** Monthly budget per platform against this month's spend and the pace it is on. */
export function budgetRows(data, t) {
  const from = startOfMonth(t);
  const next = addMonths(from, 1, 1);
  const monthDays = Math.round((next - from) / DAY);
  const elapsed = Math.max(0.02, (t - from) / (next - from));
  const recs = inRange(records(data, t), from, Infinity).filter((r) => r.platform);
  const by = totalsBy(recs, 'platform');
  const last7 = totalsBy(inRange(recs, startOfDay(t) - 7 * DAY, startOfDay(t)), 'platform');
  return PLATFORM_KEYS.map((p) => {
    const budget = data.budgets[p] || 0;
    const spent = by[p] ? by[p].spend : 0;
    const perDay = last7[p] ? last7[p].spend / 7 : 0;
    const projected = spent + perDay * (1 - elapsed) * monthDays;
    const pace = budget ? projected / budget : null;
    const connected = data.accounts.some((a) => a.platform === p && a.status === 'on');
    return { p, platform: PLATFORMS[p], budget, spent, projected, pace, elapsed, used: budget ? spent / budget : 0, connected, perDay,
      state: !connected ? 'off' : !budget ? 'none' : pace > 1.08 ? 'over' : pace < 0.85 ? 'under' : 'ok' };
  });
}

// ---- tracking ------------------------------------------------------------------------------------------------------------------
/** Pixels and tags with each event's last 24 hours, last seen and health. */
export function trackingRows(data, t) {
  return data.tracking.map((px) => ({
    ...px,
    events: px.events.map((ev) => {
      const r = rng(px.id + ev.name + Math.floor(t / 3600e3));
      const failing = ev.status === 'fail';
      const count = failing ? 0 : Math.round(ev.base * (0.85 + r() * 0.3));
      const last = failing ? ev.since : t - Math.round((ev.base > 100 ? 0.3 : ev.base > 10 ? 18 : 140) * 60e3 * (0.4 + r()));
      return { ...ev, count, last, tone: failing ? 'error' : ev.status === 'warn' ? 'warning' : 'success', label: failing ? 'Not firing' : ev.status === 'warn' ? 'Needs a look' : 'Healthy' };
    }),
  }));
}

// ---- UTM links -----------------------------------------------------------------------------------------------------------------
export function buildUrl(l) {
  const p = new URLSearchParams();
  if (l.source) p.set('utm_source', l.source);
  if (l.medium) p.set('utm_medium', l.medium);
  if (l.campaign) p.set('utm_campaign', l.campaign);
  if (l.term) p.set('utm_term', l.term);
  if (l.content) p.set('utm_content', l.content);
  const q = p.toString().replace(/\+/g, '%20');
  return SITE + (l.page === '/' ? '/' : l.page || '/') + (q ? '?' + q : '');
}
export const shortUrl = (l) => 'gc.link/' + l.code;

/** Each link with clicks → leads → trials → paid (since it was made). A campaign link gets its share of that channel. */
export function utmRows(data, t) {
  const recs = records(data, t);
  const byMcCh = totalsBy(recs.filter((r) => r.mcId), (r) => r.mcId + '|' + r.channel);
  const shares = {};
  for (const l of data.links) if (l.mcId) shares[l.mcId + '|' + l.channel] = (shares[l.mcId + '|' + l.channel] || 0) + (l.share || 1);
  const today = startOfDay(t);
  return data.links.map((l) => {
    let m;
    if (l.mcId) {
      const k = l.mcId + '|' + l.channel;
      const tot = byMcCh[k];
      const f = tot ? (l.share || 1) / shares[k] : 0;
      m = tot ? { clicks: tot.clicks * f, leads: tot.leads * f, trials: tot.trials * f, paid: tot.paid * f } : { clicks: 0, leads: 0, trials: 0, paid: 0 };
    } else {
      m = { clicks: 0, leads: 0, trials: 0, paid: 0 };
      const P = PROFILE.Other;
      for (let d = Math.max(startOfDay(l.createdAt), today - (WINDOW - 1) * DAY); d <= today; d += DAY) {
        const f = coverOn([[l.createdAt, t]], d);
        if (!f) continue;
        const r = rng(l.id + ':' + dayKey(d));
        const clicks = (l.own || 3) * f * (0.6 + r() * 0.8);
        const leads = clicks * P.lead * (0.7 + r() * 0.6);
        const trials = leads * P.trial;
        m.clicks += clicks; m.leads += leads; m.trials += trials; m.paid += trials * P.paid;
      }
    }
    const mc = l.mcId ? campaignById(data, l.mcId) : null;
    return { ...l, l, url: buildUrl(l), short: shortUrl(l), m, mc, leadRate: m.clicks ? (m.leads / m.clicks) * 100 : null };
  }).sort((a, b) => b.createdAt - a.createdAt);
}

// ---- overview helpers ----------------------------------------------------------------------------------------------------
/** Campaigns that run on some day of the month that holds `t`: [{ c, status, from, to }] (days 1-based within the month). */
export function calendar(data, t, monthStart = startOfMonth(t)) {
  const next = addMonths(monthStart, 1, 1);
  const days = Math.round((next - monthStart) / DAY);
  const out = [];
  for (const c of data.campaigns) {
    if (!c.start || !c.end) continue;
    const end = Math.min(c.end, c.endedAt || Infinity);
    if (end < monthStart || c.start >= next) continue;
    const a = Math.max(c.start, monthStart), b = Math.min(end, next - 1);
    out.push({ c, status: mcStatus(c, t), from: Math.floor((a - monthStart) / DAY) + 1, to: Math.floor((b - monthStart) / DAY) + 1 });
  }
  return { monthStart, next, days, rows: out.sort((x, y) => x.from - y.from || y.to - x.to) };
}

/** First-touch and last-touch credit for leads by channel (last touch = the books; first touch moves credit up the funnel). */
const FIRST = { Meta: 1.3, YouTube: 1.7, Google: 0.8, Email: 0.55, SMS: 0.65, Events: 1.15, Affiliate: 1 };
export function attribution(recs) {
  const last = totalsBy(recs, 'channel');
  const raw = {};
  let a = 0, b = 0;
  for (const ch of CHANNELS) { const v = last[ch] ? last[ch].leads : 0; raw[ch] = v * FIRST[ch]; a += v; b += raw[ch]; }
  return CHANNELS.map((ch) => {
    const l = last[ch] || ratios(zero());
    const first = b ? (raw[ch] * a) / b : 0;
    return { ch, last: l.leads, first, trials: l.trials, paid: l.paid, spend: l.spend };
  }).filter((r) => r.last > 0.5 || r.first > 0.5);
}

/** Up to five things to fix, most urgent first: [{ key, tone: 'err'|'warn', title, sub, href }]. */
export function attention(data, t) {
  const out = [];
  const recs = records(data, t);
  const today = startOfDay(t);
  // tracking
  for (const px of data.tracking) for (const ev of px.events) {
    if (ev.status === 'fail') out.push({ key: px.id + ev.name, rank: 0, tone: 'err', title: `${ev.name} is not firing on the ${px.platform === 'google' ? 'Google tag' : 'Meta Pixel'}`, sub: ev.issue, href: '/admin/ads?tab=tracking' });
    else if (ev.status === 'warn') out.push({ key: px.id + ev.name, rank: 3, tone: 'warn', title: `${ev.name} match quality is low on the Meta Pixel`, sub: ev.issue, href: '/admin/ads?tab=tracking' });
  }
  // CPL rising on an ad set: last 7 days against the 7 before
  const last = totalsBy(inRange(recs, today - 7 * DAY, today), 'set');
  const prev = totalsBy(inRange(recs, today - 14 * DAY, today - 7 * DAY), 'set');
  for (const ac of data.adCampaigns) for (const s of ac.sets) {
    const a = last[s.id], b = prev[s.id];
    if (!a || !b || b.leads < 4 || !a.cpl || !b.cpl) continue;
    const up = (a.cpl - b.cpl) / b.cpl;
    if (up >= 0.3) out.push({ key: s.id, rank: 1, tone: 'warn', title: `Cost per lead up ${Math.round(up * 100)}% on ${ac.name}`, sub: `${s.name}: ৳${Math.round(a.cpl)} a lead this week, was ৳${Math.round(b.cpl)}`, href: '/admin/ads?tab=campaigns&open=' + ac.id });
  }
  // ad accounts
  for (const a of accountRows(data, t)) {
    if (a.state === 'expiring' || a.state === 'expired') out.push({ key: a.id, rank: 2, tone: a.state === 'expired' ? 'err' : 'warn', title: `${a.a.name}: ${a.label.toLowerCase()}`, sub: 'Reconnect it, or its spend and results stop coming in.', href: '/admin/ads?tab=accounts' });
  }
  // budgets: a platform pacing over, a running campaign close to its budget
  for (const b of budgetRows(data, t)) if (b.state === 'over') out.push({ key: 'pace' + b.p, rank: 4, tone: 'warn', title: `${b.platform.name} is pacing ${Math.round((b.pace - 1) * 100)}% over its monthly budget`, sub: `On course for ৳${Math.round(b.projected).toLocaleString('en-IN')} of ৳${b.budget.toLocaleString('en-IN')}`, href: '/admin/ads?tab=budget' });
  for (const r of campaignRows(data, t)) {
    if (r.status !== 'Running' || !r.budget) continue;
    const left = Math.max(0, Math.ceil((r.c.end - t) / DAY));
    if (r.used >= 0.85 && left > 2) out.push({ key: 'bud' + r.id, rank: 2, tone: r.used >= 1 ? 'err' : 'warn', title: `${r.name} has spent ${Math.round(r.used * 100)}% of its budget`, sub: `${left} days still to run`, href: '/admin/campaigns/view?id=' + r.id });
  }
  return out.sort((a, b) => a.rank - b.rank).slice(0, 5);
}

// ---- changes ----------------------------------------------------------------------------------------------------------------
const me = () => { try { return currentStaff().name; } catch { return 'Mahin Khan'; } };
const bump = (d) => { d.rev = (d.rev || 0) + 1; };
const logTo = (c, now, text) => { c.log = c.log || []; c.log.unshift({ at: now, by: me(), text }); };

/** Make or edit a campaign. f: { id?, name, goal, channels, budget, start, end, audience, owner, notes, launch } */
export function saveCampaign(f) {
  const name = String(f.name || '').trim();
  if (!name) return { ok: false, error: 'Give the campaign a name.', field: 'name' };
  if (!GOALS.some((g) => g[0] === f.goal)) return { ok: false, error: 'Pick a goal.', field: 'goal' };
  const channels = CHANNELS.filter((c) => (f.channels || []).includes(c));
  if (!channels.length) return { ok: false, error: 'Pick at least one channel.', field: 'channels' };
  const budget = Math.round(Number(f.budget));
  if (!(budget > 0)) return { ok: false, error: 'Enter a budget above ৳0.', field: 'budget' };
  if (!f.start || !f.end) return { ok: false, error: 'Pick the start and end dates.', field: 'start' };
  if (f.end <= f.start) return { ok: false, error: 'The end date must be after the start.', field: 'end' };
  if (!TEAM_NAMES.includes(f.owner)) return { ok: false, error: 'Pick who owns it.', field: 'owner' };
  return marketing.commit((d, now) => {
    if (d.campaigns.some((c) => c.id !== f.id && c.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: 'A campaign already has this name.', field: 'name' };
    let c = f.id ? d.campaigns.find((x) => x.id === f.id) : null;
    const isNew = !c;
    if (f.id && !c) return { ok: false, error: 'This campaign no longer exists.' };
    if (isNew) {
      const n = Math.max(100, ...d.campaigns.map((x) => Number(x.id.slice(3)) || 0)) + 1;
      let sl = slug(name) || 'campaign-' + n;
      if (d.campaigns.some((x) => x.slug === sl)) sl = sl + '-' + n;
      c = { id: 'MC-' + n, state: 'draft', pauses: [], win: {}, plan: {}, slug: sl, createdAt: now, log: [] };
      d.campaigns.push(c);
    }
    const old = { ...c.plan };
    const oldTotal = budgetOf(c);
    const started = !isNew && c.state !== 'draft' && c.start <= now;
    if (!isNew && c.state !== 'draft' && f.end <= now) return { ok: false, error: 'The end date has passed. Pick a later one, or end the campaign.', field: 'end' };
    Object.assign(c, { name, goal: f.goal, channels, start: started ? c.start : f.start, end: f.end, owner: f.owner, notes: String(f.notes || '').trim(), audience: { ...f.audience } });
    // split the budget: keep the old split for kept channels, even shares for new ones
    const plan = {};
    const kept = channels.filter((ch) => old[ch] != null);
    const fresh = channels.filter((ch) => old[ch] == null);
    const keptSum = kept.reduce((a, ch) => a + old[ch], 0);
    const share = budget / channels.length;
    let freshTotal = fresh.length * share;
    if (!kept.length || !keptSum) freshTotal = budget;
    const keptTotal = budget - freshTotal;
    for (const ch of kept) plan[ch] = Math.round(keptSum ? (old[ch] / keptSum) * keptTotal : 0);
    for (const ch of fresh) plan[ch] = Math.round(freshTotal / fresh.length);
    c.plan = plan;
    // a UTM link per channel that has none yet
    const taken = new Set(d.links.map((l) => l.code));
    for (const ch of channels) {
      if (d.links.some((l) => l.mcId === c.id && l.channel === ch)) continue;
      const [source, medium] = CH_UTM[ch];
      const id = 'U-' + (Math.max(300, ...d.links.map((l) => Number(l.id.slice(2)) || 0)) + 1);
      d.links.push({ id, name: `${name} · ${ch}`, page: GOAL_PAGE[f.goal], source, medium, campaign: c.slug, term: '', content: '', mcId: c.id, channel: ch, share: 1, by: me(), createdAt: now, archived: false, code: shortCode(id + c.slug + source, taken) });
    }
    if (isNew) logTo(c, now, 'Created the campaign');
    else logTo(c, now, oldTotal !== budget ? `Edited the campaign · budget ৳${oldTotal.toLocaleString('en-IN')} → ৳${budget.toLocaleString('en-IN')}` : 'Edited the campaign');
    if (f.launch && c.state === 'draft') {
      c.state = 'live';
      if (c.start < now) c.start = now;
      logTo(c, now, c.start > now + 60e3 ? 'Scheduled the campaign' : 'Launched the campaign');
    }
    bump(d);
    return { ok: true, id: c.id, created: isNew };
  });
}

/** Launch a draft (it starts at its start date, or now when that has passed). */
export function launchCampaign(id) {
  return marketing.commit((d, now) => {
    const c = d.campaigns.find((x) => x.id === id);
    if (!c) return { ok: false, error: 'This campaign no longer exists.' };
    if (c.state !== 'draft') return { ok: false, error: 'It is already launched.' };
    if (c.end <= now) return { ok: false, error: 'Its end date has passed. Edit the dates first.' };
    c.state = 'live';
    if (c.start < now) c.start = now;
    logTo(c, now, c.start > now + 60e3 ? 'Scheduled the campaign' : 'Launched the campaign');
    bump(d);
    return { ok: true, scheduled: c.start > now + 60e3 };
  });
}

/** Pause a running or scheduled campaign and its ads. */
export function pauseCampaign(id, reason) {
  return marketing.commit((d, now) => {
    const c = d.campaigns.find((x) => x.id === id);
    if (!c) return { ok: false, error: 'This campaign no longer exists.' };
    const st = mcStatus(c, now);
    if (st !== 'Running' && st !== 'Scheduled') return { ok: false, error: `A ${st.toLowerCase()} campaign can’t be paused.` };
    c.pauses.push([now, null]);
    for (const ac of d.adCampaigns) if (ac.mcId === id && !openPause(ac)) ac.pauses.push([now, null]);
    logTo(c, now, 'Paused' + (reason ? ': ' + reason : ''));
    bump(d);
    return { ok: true };
  });
}
export function resumeCampaign(id) {
  return marketing.commit((d, now) => {
    const c = d.campaigns.find((x) => x.id === id);
    if (!c) return { ok: false, error: 'This campaign no longer exists.' };
    if (mcStatus(c, now) !== 'Paused') return { ok: false, error: 'It isn’t paused.' };
    for (const p of c.pauses) if (p[1] == null) p[1] = now;
    for (const ac of d.adCampaigns) if (ac.mcId === id) for (const p of ac.pauses) if (p[1] == null) p[1] = now;
    logTo(c, now, 'Resumed');
    bump(d);
    return { ok: true };
  });
}
/** End now: spend stops and the ads end too. */
export function endCampaign(id) {
  return marketing.commit((d, now) => {
    const c = d.campaigns.find((x) => x.id === id);
    if (!c) return { ok: false, error: 'This campaign no longer exists.' };
    const st = mcStatus(c, now);
    if (st === 'Ended' || st === 'Draft') return { ok: false, error: st === 'Draft' ? 'A draft can be deleted instead.' : 'It has already ended.' };
    for (const p of c.pauses) if (p[1] == null) p[1] = now;
    c.endedAt = now;
    if (c.start > now) c.start = now;
    for (const ac of d.adCampaigns) if (ac.mcId === id && !ac.endedAt) ac.endedAt = now;
    logTo(c, now, 'Ended the campaign');
    bump(d);
    return { ok: true };
  });
}
/** Delete a draft (and its unused links). */
export function deleteCampaign(id) {
  return marketing.commit((d) => {
    const c = d.campaigns.find((x) => x.id === id);
    if (!c) return { ok: false, error: 'This campaign no longer exists.' };
    if (c.state !== 'draft') return { ok: false, error: 'Only a draft can be deleted. End the campaign instead.' };
    if (d.adCampaigns.some((ac) => ac.mcId === id)) return { ok: false, error: 'Ads are linked to it. End the campaign instead.' };
    d.campaigns = d.campaigns.filter((x) => x.id !== id);
    d.links = d.links.filter((l) => l.mcId !== id);
    bump(d);
    return { ok: true };
  });
}

/** Pause or resume an ad campaign, ad set or ad. level: 'campaign' | 'set' | 'ad'. */
export function setAdState(level, id, on) {
  return marketing.commit((d, now) => {
    let x = null, ac = null;
    for (const c of d.adCampaigns) {
      if (level === 'campaign' && c.id === id) { x = c; ac = c; }
      for (const s of c.sets) {
        if (level === 'set' && s.id === id) { x = s; ac = c; }
        for (const a of s.ads) if (level === 'ad' && a.id === id) { x = a; ac = c; }
      }
    }
    if (!x) return { ok: false, error: 'It no longer exists.' };
    if (ac.endedAt || (ac.end && now >= ac.end)) return { ok: false, error: 'This campaign has ended.' };
    const mc = d.campaigns.find((c) => c.id === ac.mcId);
    if (on && mc && mcStatus(mc, now) === 'Paused') return { ok: false, error: `Its marketing campaign “${mc.name}” is paused. Resume that first.` };
    if (on && mc && mcStatus(mc, now) === 'Draft') return { ok: false, error: `Its marketing campaign “${mc.name}” is a draft. Launch that first.` };
    if (on) { if (!openPause(x)) return { ok: false, error: 'It is already on.' }; for (const p of x.pauses) if (p[1] == null) p[1] = now; }
    else { if (openPause(x)) return { ok: false, error: 'It is already paused.' }; x.pauses.push([now, null]); }
    if (mc) logTo(mc, now, `${on ? 'Turned on' : 'Paused'} ${level === 'campaign' ? 'ad campaign' : level === 'set' ? 'ad set' : 'ad'} “${x.name}”`);
    bump(d);
    return { ok: true };
  });
}

/** Connect or reconnect an ad account (UI only: the sign-in is not real). */
export function connectAccount(id) {
  return marketing.commit((d, now) => {
    const a = d.accounts.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'No such account.' };
    const was = a.status;
    Object.assign(a, { status: 'on', tokenUntil: now + 60 * DAY, sync: now, by: me(), since: was === 'on' ? a.since : now });
    if (!a.ref) a.ref = a.platform === 'tiktok' ? '7291 4408 1163 0052' : a.ref;
    bump(d);
    return { ok: true, reconnected: was === 'on' };
  });
}
export function disconnectAccount(id) {
  return marketing.commit((d) => {
    const a = d.accounts.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'No such account.' };
    if (a.status !== 'on') return { ok: false, error: 'It isn’t connected.' };
    Object.assign(a, { status: 'off', tokenUntil: null, sync: null });
    bump(d);
    return { ok: true };
  });
}

/** A platform's monthly budget. */
export function setBudget(platform, amount) {
  const n = Math.round(Number(amount));
  if (!PLATFORMS[platform]) return { ok: false, error: 'No such platform.' };
  if (!(n >= 0)) return { ok: false, error: 'Enter an amount of ৳0 or more.' };
  return marketing.commit((d) => { d.budgets[platform] = n; bump(d); return { ok: true }; });
}

/** Send a test event (UI only). A later "Check again" finds it. */
export function testEvent(pixelId, name) {
  return marketing.commit((d, now) => {
    const px = d.tracking.find((x) => x.id === pixelId);
    const ev = px && px.events.find((e) => e.name === name);
    if (!ev) return { ok: false, error: 'No such event.' };
    ev.testedAt = now;
    bump(d);
    return { ok: true };
  });
}
/** Check an event again: a failing or weak event turns healthy once a test reached it in the last 15 minutes. */
export function recheckEvent(pixelId, name) {
  return marketing.commit((d, now) => {
    const px = d.tracking.find((x) => x.id === pixelId);
    const ev = px && px.events.find((e) => e.name === name);
    if (!ev) return { ok: false, error: 'No such event.' };
    if (ev.status === 'ok') return { ok: true, fixed: false, healthy: true };
    if (!ev.testedAt || now - ev.testedAt > 15 * 60e3) return { ok: false, error: ev.status === 'fail' ? `Still no ${ev.name}. Fix the tag, send a test event, then check again.` : `Match quality is still low. Send a test event with email and phone, then check again.` };
    ev.status = 'ok';
    ev.issue = '';
    if (ev.match != null) ev.match = 8.1;
    ev.fixedAt = now;
    bump(d);
    return { ok: true, fixed: true };
  });
}

const UTM_RE = /^[a-z0-9][a-z0-9_.-]*$/;
/** Make a UTM link. f: { name, page, source, medium, campaign, term, content, mcId } */
export function saveUtm(f) {
  const v = (k) => String(f[k] || '').trim();
  const name = v('name');
  if (!name) return { ok: false, error: 'Give the link a name.', field: 'name' };
  if (!PAGES.some((p) => p[0] === f.page)) return { ok: false, error: 'Pick the page it opens.', field: 'page' };
  for (const k of ['source', 'medium', 'campaign']) {
    if (!v(k)) return { ok: false, error: `Enter the ${k}.`, field: k };
    if (!UTM_RE.test(v(k))) return { ok: false, error: `Use lowercase letters, numbers, - or _ in the ${k}.`, field: k };
  }
  for (const k of ['term', 'content']) if (v(k) && !UTM_RE.test(v(k))) return { ok: false, error: `Use lowercase letters, numbers, - or _ in the ${k}.`, field: k };
  const link = { name, page: f.page, source: v('source'), medium: v('medium'), campaign: v('campaign'), term: v('term'), content: v('content') };
  const url = buildUrl(link);
  return marketing.commit((d, now) => {
    const dup = d.links.find((l) => buildUrl(l) === url);
    if (dup) return { ok: false, error: `This link already exists: ${shortUrl(dup)} (${dup.name}).`, field: 'source' };
    const mc = f.mcId ? d.campaigns.find((c) => c.id === f.mcId) : null;
    const channel = mc ? (Object.keys(CH_UTM).find((ch) => mc.channels.includes(ch) && CH_UTM[ch][0] === link.source) || (link.source === 'instagram' && mc.channels.includes('Meta') ? 'Meta' : null)) : null;
    const id = 'U-' + (Math.max(300, ...d.links.map((l) => Number(l.id.slice(2)) || 0)) + 1);
    const taken = new Set(d.links.map((l) => l.code));
    const row = { id, ...link, mcId: mc && channel ? mc.id : null, channel: mc && channel ? channel : null, share: 1, own: mc && channel ? undefined : 3, by: me(), createdAt: now, archived: false, code: shortCode(id + url, taken) };
    d.links.push(row);
    bump(d);
    return { ok: true, id, short: shortUrl(row), url };
  });
}
export function archiveUtm(id, on = true) {
  return marketing.commit((d) => {
    const l = d.links.find((x) => x.id === id);
    if (!l) return { ok: false, error: 'This link no longer exists.' };
    if (!!l.archived === on) return { ok: false, error: on ? 'It is already archived.' : 'It isn’t archived.' };
    l.archived = on;
    bump(d);
    return { ok: true };
  });
}
export const restoreUtm = (id) => archiveUtm(id, false);

export { slug as utmSlug, UTM_RE };
