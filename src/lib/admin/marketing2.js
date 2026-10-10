// admin/marketing2 — GridCommerce's own marketing, part 2 (super admin › Marketing): Social media, Google Business,
// Promotions (offers to merchants on their subscription) and Affiliates. Front end only: createStore key `marketing2`
// (localStorage gc.admin.marketing2). Nothing is really posted or paid: publishing, replies and payouts are simulated.
// Never reads the merchant panel's libs (brands, smartOffers, promotions, loyalty, channels, googleBusiness …), nor
// lib/admin/marketing.js (Campaigns / Ads / UTM).
//
//   Social     data.social = { pages, posts, library }
//              PLATFORMS · postChecks(post, data) · socialSummary(data, t, days) · aiWrite(about, tone, lang) · aiRewrite(text, kind)
//              savePost · deletePost · duplicatePost · reschedulePost · unschedulePost · addAsset · removeAsset · setAssetTags
//   Google     data.gbp = { profile, photos, reviews, posts, qa }
//              GBP_SUPPORT (which parts the Google Business Profile APIs cover, which are ours or placeholders)
//              gbpPerformance(t, days) · ratingTrend(reviews, t, months) · aiReviewReply(review, n)
//              saveProfile · replyReview · removeReply · saveGbpPost · deleteGbpPost · addPhoto · removePhoto · answerQuestion
//   Promotions data.promos, data.redemptions
//              PROMO_TYPES · promoState(p, data, t) · promoSummary(p) · promoPreview(p, ladder, plan, billing) · promoRows(data, t)
//              savePromo · setPromoStatus(id, 'pause'|'resume'|'end', reason)
//   Affiliates data.affiliates, data.referrals, data.rules, data.commissions, data.payouts
//              affRow · affRows · affSummary · refRows · comStatus · comRows · payoutRows · calcCommission · planPrice
//              addAffiliate · saveAffiliate · approveAffiliate · rejectAffiliate · pauseAffiliate · resumeAffiliate ·
//              setAffiliateRule · addLink · addAffNote · sendMaterial · adjustCommission · saveRule · setRuleActive ·
//              requestPayout · approvePayout (Finance or an admin, never the requester) · rejectPayout · markPayoutPaid
//              (transaction ID used once)
// Every change commits and returns { ok, error?, id? }. Stores are linked by their platform id (db().shops), e.g. the
// affiliate sign-ups 0069, 0070, 0073 …

import { createStore } from './store';
import { db as platformDb, load as loadPlatform, staff as currentStaff } from '@/lib/platform/store';
import { DAY, MIN, rng, startOfDay, startOfMonth, addMonths, periodOf, dm, dmy, hm, taka } from '@/lib/platform/util';
import { PLAN_NAME, LADDERS, ADDONS, addonBy, ladderLabel } from '@/lib/platform/catalogue';
import { merchantList } from './merchants';

const H = 3600e3;
const me = () => currentStaff();
const clean = (s) => String(s == null ? '' : s).trim();
const nextId = (list, prefix, start) => {
  const n = list.reduce((m, x) => Math.max(m, Number(String(x.id).replace(/\D/g, '')) || 0), start);
  return prefix + (n + 1);
};

/** The marketing team (besides the platform's STAFF). */
export const MARKETING_TEAM = ['Sharmin Nahar', 'Arif Hossain', 'Tania Sultana', 'Mahin Khan'];

/** A plan's live price: monthly or yearly (৳). */
export function planPrice(ladder, plan, billing = 'monthly') {
  const L = platformDb().plans[ladder];
  if (!L) return 0;
  const ver = L.versions.find((v) => v.v === L.live) || L.versions[L.versions.length - 1];
  const p = ver.plans[plan];
  if (!p) return 0;
  return billing === 'yearly' ? p.yearly : p.price;
}
export const PLAN_KEYS = ['growth', 'business', 'enterprise'];

// =====================================================================================================================
// Social media
// =====================================================================================================================
/** GridCommerce's pages. needs: what a post must carry there; limit: characters. */
export const PLATFORMS = [
  { key: 'fb', name: 'Facebook', channel: 'facebook', limit: 63206, needs: null },
  { key: 'ig', name: 'Instagram', channel: 'instagram', limit: 2200, needs: 'media', tags: 30 },
  { key: 'li', name: 'LinkedIn', channel: 'linkedin', limit: 3000, needs: null },
  { key: 'yt', name: 'YouTube', channel: 'youtube', limit: 5000, needs: 'video' },
  { key: 'tt', name: 'TikTok', channel: 'tiktok', limit: 2200, needs: 'video' },
];
export const platformBy = (k) => PLATFORMS.find((p) => p.key === k) || null;
export const POST_STATUS = { published: ['Published', 'success'], scheduled: ['Scheduled', 'info'], draft: ['Draft', 'neutral'] };
export const TONES = [['friendly', 'Friendly'], ['expert', 'Expert'], ['urgent', 'Urgent'], ['story', 'Story']];
export const REWRITES = [['shorter', 'Shorter'], ['friendly', 'Friendlier'], ['formal', 'More formal'], ['emoji', 'Add emojis'], ['cta', 'Add a call to action']];
export const SUGGESTED_TAGS = ['#GridCommerce', '#BanglaEcommerce', '#FcommerceBD', '#SmallBusinessBD', '#POS', '#OnlineShopBD', '#DigitalBangladesh', '#SellOnline', '#CourierBD', '#GridAI'];

const LIBRARY = [
  ['MD-01', 'puja-offer-launch50.png', 'image', ['offer', 'puja'], '1.2 MB', '1080×1080'],
  ['MD-02', 'pos-offline-demo.mp4', 'video', ['product', 'pos'], '18.4 MB', '0:42'],
  ['MD-03', 'story-dhaka-gadget-hub.mp4', 'video', ['story', 'merchant'], '64.0 MB', '2:15'],
  ['MD-04', 'gridcommerce-logo-square.png', 'image', ['brand'], '0.3 MB', '1024×1024'],
  ['MD-05', 'webinar-sell-on-facebook.png', 'image', ['webinar', 'event'], '0.9 MB', '1200×628'],
  ['MD-06', 'gridai-bangla-descriptions.mp4', 'video', ['product', 'gridai'], '22.7 MB', '0:58'],
  ['MD-07', 'steadfast-setup-tutorial.mp4', 'video', ['tutorial', 'courier'], '41.3 MB', '3:05'],
  ['MD-08', 'pricing-2026-card.png', 'image', ['pricing'], '0.7 MB', '1080×1350'],
  ['MD-09', 'team-banani-office.jpg', 'image', ['team', 'brand'], '2.4 MB', '1600×1067'],
  ['MD-10', 'bkash-payment-links-1.png', 'image', ['product', 'payments'], '0.8 MB', '1080×1080'],
  ['MD-11', 'cod-returns-tips-carousel.png', 'image', ['tips'], '1.1 MB', '1080×1350'],
  ['MD-12', 'story-rongdhonu-fashion.mp4', 'video', ['story', 'merchant'], '51.8 MB', '1:48'],
  ['MD-13', 'hiring-support-executive.png', 'image', ['hiring'], '0.6 MB', '1200×628'],
  ['MD-14', 'live-qa-thursday.png', 'image', ['event'], '0.5 MB', '1080×1080'],
  ['MD-15', 'inventory-count-reel.mp4', 'video', ['tips', 'product'], '15.2 MB', '0:35'],
  ['MD-16', 'eid-support-hours.png', 'image', ['notice'], '0.4 MB', '1080×1080'],
];

// [day offset, hour, title, text, platforms, media, tags, link, draft?]
const POSTS = [
  [-58, 20, 'Merchant story: Dhaka Gadget Hub', 'Dhaka Gadget Hub went from 40 to 120 orders a day in six months.\nThey run orders, courier and stock from one panel now.', ['fb', 'ig', 'yt', 'li'], ['MD-03'], ['#GridCommerce', '#SmallBusinessBD'], 'https://gridcommerce.net/stories/dhaka-gadget-hub'],
  [-54, 19, 'Tutorial: connect Steadfast in 3 minutes', 'Connect Steadfast courier in three minutes.\nBook parcels, print slips and track COD from your order page.', ['yt', 'fb'], ['MD-07'], ['#CourierBD', '#GridCommerce'], 'https://gridcommerce.net/help/steadfast'],
  [-50, 21, 'POS works offline', 'Internet down at the shop? The GridCommerce POS keeps selling.\nSales sync the moment you are back online.', ['fb', 'ig', 'tt'], ['MD-02'], ['#POS', '#GridCommerce'], ''],
  [-46, 18, 'Tips: cut COD returns', '5 ways shops in Bangladesh cut COD returns:\n1. Confirm by call\n2. Take an advance on big orders\n3. Check the customer’s courier record\n4. Clear photos\n5. Fast delivery', ['fb', 'li', 'ig'], ['MD-11'], ['#FcommerceBD', '#CourierBD'], 'https://gridcommerce.net/blog/cod-returns'],
  [-42, 20, 'bKash payment links', 'Send a bKash payment link from the chat and the order marks itself paid.\nNo more screenshots.', ['fb', 'ig', 'li'], ['MD-10'], ['#GridCommerce', '#SellOnline'], 'https://gridcommerce.net/features/payment-links'],
  [-38, 20, 'Webinar: sell on Facebook', 'Free webinar this Saturday, 8 PM: selling on Facebook with GridCommerce.\nInbox, orders and courier in one place.', ['fb', 'li'], ['MD-05'], ['#FcommerceBD'], 'https://gridcommerce.net/webinar'],
  [-33, 21, 'GridAI writes in Bangla', 'GridAI writes product descriptions in Bangla and English.\nOne photo in, a full listing out.', ['fb', 'ig', 'tt', 'yt'], ['MD-06'], ['#GridAI', '#GridCommerce'], ''],
  [-29, 19, 'Merchant story: Rongdhonu Fashion', 'Rongdhonu Fashion sells on Facebook, Instagram and their own site, with one stock count.', ['fb', 'ig', 'yt'], ['MD-12'], ['#SmallBusinessBD', '#OnlineShopBD'], 'https://gridcommerce.net/stories/rongdhonu'],
  [-24, 11, 'We are hiring: support executive', 'Join our support team in Banani. Bangla and English, patient with merchants, quick learner.', ['li', 'fb'], ['MD-13'], ['#Hiring'], 'https://gridcommerce.net/careers'],
  [-20, 20, 'Pricing for 2026', 'Growth ৳1,000 · Business ৳2,500 · Enterprise ৳5,000 a month.\nPay yearly and save.', ['fb', 'ig', 'li'], ['MD-08'], ['#GridCommerce'], 'https://gridcommerce.net/pricing'],
  [-16, 20, 'Stock count in 10 minutes', 'Count stock with your phone camera. Every shelf, every branch, in one sheet.', ['tt', 'ig', 'yt'], ['MD-15'], ['#POS', '#SmallBusinessBD'], ''],
  [-12, 20, 'Puja offer: 50% off the first month', 'পূজার শুভেচ্ছা! নতুন স্টোরে প্রথম মাসে ৫০% ছাড়, কোড LAUNCH50।\nআজই শুরু করুন।', ['fb', 'ig'], ['MD-01'], ['#GridCommerce', '#BanglaEcommerce'], 'https://gridcommerce.net/start?code=LAUNCH50'],
  [-8, 20, 'Live Q&A this Thursday', 'Live Q&A with our product team, Thursday 8 PM on Facebook.\nBring your questions about orders, courier and POS.', ['fb', 'yt'], ['MD-14'], ['#GridCommerce'], ''],
  [-5, 19, 'Tips: Bangla product titles that sell', 'Short, clear Bangla titles get more clicks. Brand + product + one key detail.', ['fb', 'ig', 'li'], [], ['#BanglaEcommerce'], 'https://gridcommerce.net/blog/titles'],
  [-2, 20, 'POS offline, now on Android', 'The offline POS now runs on any Android phone. Sell at fairs, pop-ups and markets.', ['fb', 'ig', 'tt'], ['MD-02'], ['#POS'], ''],
  [2, 20, 'Webinar: Puja sales checklist', 'Free webinar: the Puja sales checklist. Stock, offers, courier cut-offs.', ['fb', 'li'], ['MD-05'], ['#FcommerceBD'], 'https://gridcommerce.net/webinar'],
  [4, 21, 'LAUNCH50 ends soon', 'Last days for LAUNCH50: 50% off your first month. Start your store today.', ['fb', 'ig', 'tt'], ['MD-01'], ['#GridCommerce'], 'https://gridcommerce.net/start?code=LAUNCH50'],
  [7, 19, 'Merchant story: Sylhet Tea House', 'Sylhet Tea House ships across Bangladesh from one small warehouse. Here is how.', ['fb', 'yt', 'li'], ['MD-03'], ['#SmallBusinessBD'], ''],
  [11, 20, 'GridAI replies to comments', 'GridAI drafts replies to Facebook comments in your shop’s voice. You approve, it posts.', ['fb', 'ig', 'tt', 'yt'], ['MD-06'], ['#GridAI'], ''],
  [15, 11, 'Office hours during Puja', 'Our support team is open every day of Puja, 10 AM to 6 PM.', ['fb', 'li'], ['MD-16'], [], ''],
  [21, 20, 'Tips: inventory before the winter rush', 'Three stock checks to do before winter: slow movers, reorder points, damaged goods.', ['fb', 'ig', 'li'], ['MD-11'], ['#SmallBusinessBD'], ''],
  [null, 20, 'Customer reviews roundup', 'What merchants say about GridCommerce this month.', ['fb', 'ig'], [], ['#GridCommerce'], '', true],
  [null, 20, 'Courier comparison 2026', 'Steadfast, Pathao, RedX, Paperfly: what each costs and how fast they pay COD.', ['fb', 'li'], [], ['#CourierBD'], '', true],
  [null, 20, 'Behind the scenes: our Banani office', 'Meet the people who answer your calls.', ['ig', 'tt', 'li'], ['MD-09'], ['#GridCommerce'], '', true],
];

function postStats(seed, platforms, pages, media, lib) {
  const r = rng('sp' + seed);
  const video = media.some((m) => (lib.find((x) => x.id === m) || {}).kind === 'video');
  const out = {};
  for (const k of platforms) {
    const pg = pages.find((p) => p.key === k);
    const boost = video && (k === 'tt' || k === 'yt' || k === 'ig') ? 1.8 : 1;
    const reach = Math.round(pg.followers * (0.05 + r() * 0.12) * boost);
    const reactions = Math.round(reach * (0.025 + r() * 0.05));
    out[k] = { reach, reactions, comments: Math.round(reactions * (0.06 + r() * 0.12)), shares: Math.round(reactions * (0.03 + r() * 0.09)), clicks: Math.round(reach * (0.004 + r() * 0.016)) };
  }
  return out;
}

function seedSocial(now) {
  const day0 = startOfDay(now);
  const pages = [
    { key: 'fb', handle: 'GridCommerce', url: 'https://facebook.com/gridcommercebd', followers: 48620, new30: 1840, unit: 'followers', status: 'ok' },
    { key: 'ig', handle: '@gridcommerce.bd', url: 'https://instagram.com/gridcommerce.bd', followers: 12480, new30: 620, unit: 'followers', status: 'ok' },
    { key: 'li', handle: 'Grid Technologies Limited', url: 'https://linkedin.com/company/grid-technologies-bd', followers: 6850, new30: 410, unit: 'followers', status: 'ok' },
    { key: 'yt', handle: 'GridCommerce Bangla', url: 'https://youtube.com/@gridcommercebangla', followers: 9240, new30: 530, unit: 'subscribers', status: 'ok' },
    { key: 'tt', handle: '@gridcommerce', url: 'https://tiktok.com/@gridcommerce', followers: 15310, new30: 2210, unit: 'followers', status: 'renew', note: 'Access ends in 5 days. Reconnect to keep posting.' },
  ];
  const library = LIBRARY.map(([id, name, kind, tags, size, dims], i) => ({ id, name, kind, tags, size, dims, addedAt: day0 - (70 - i * 4) * DAY, by: MARKETING_TEAM[i % 2] }));
  const posts = POSTS.map(([off, h, title, text, platforms, media, tags, link, draft], i) => {
    const id = 'SP-' + (1001 + i);
    const at = off == null ? null : day0 + off * DAY + h * H;
    const status = draft ? 'draft' : off < 0 ? 'published' : 'scheduled';
    return {
      id, title, text, platforms, media, tags, link, status, at, by: MARKETING_TEAM[i % 3], createdAt: (at || day0 - (3 + i % 5) * DAY) - 3 * DAY,
      stats: status === 'published' ? postStats(id, platforms, pages, media, library) : null,
    };
  });
  return { pages, posts, library };
}

const charCount = (post) => {
  const tags = (post.tags || []).join(' ');
  return Array.from(String(post.text || '') + (tags ? '\n\n' + tags : '')).length + (post.link ? post.link.length + 1 : 0);
};
export const postLength = charCount;

/** What each chosen platform says about a post: [{ key, name, level 'bad'|'warn'|'ok', text, count, limit }]. */
export function postChecks(post, data) {
  const lib = data.social.library;
  const kinds = (post.media || []).map((m) => (lib.find((x) => x.id === m) || {}).kind).filter(Boolean);
  const video = kinds.includes('video');
  const len = charCount(post);
  return (post.platforms || []).map((k) => {
    const p = platformBy(k);
    const pg = data.social.pages.find((x) => x.key === k) || {};
    const base = { key: k, name: p.name, channel: p.channel, count: len, limit: p.limit };
    if (pg.status === 'off') return { ...base, level: 'bad', text: 'Not connected. Connect it, or it is skipped.' };
    if (len > p.limit) return { ...base, level: 'bad', text: `Too long by ${len - p.limit} characters. Try AI rewrite › Shorter.` };
    if (p.tags && (post.tags || []).length > p.tags) return { ...base, level: 'bad', text: `${p.name} allows up to ${p.tags} hashtags.` };
    if (p.needs === 'video' && !video) return { ...base, level: 'bad', text: `${p.name} needs a video. Add one under Media.` };
    if (p.needs === 'media' && !kinds.length) return { ...base, level: 'bad', text: `${p.name} needs a photo or video.` };
    if (pg.status === 'renew') return { ...base, level: 'warn', text: pg.note || 'Access ends soon. It will post, but reconnect soon.' };
    if (k === 'li' && !post.link) return { ...base, level: 'ok', text: 'Ready. LinkedIn posts with a link get more clicks.' };
    return { ...base, level: 'ok', text: 'Ready.' };
  });
}

/** Reach, reactions, comments, shares and clicks per platform for posts published in the last `days`. */
export function socialSummary(data, t, days = 30) {
  const from = startOfDay(t) - (days - 1) * DAY;
  const posts = data.social.posts.filter((p) => p.status === 'published' && p.stats && p.at >= from && p.at <= t);
  const zero = () => ({ reach: 0, reactions: 0, comments: 0, shares: 0, clicks: 0, posts: 0 });
  const by = Object.fromEntries(PLATFORMS.map((p) => [p.key, zero()]));
  const total = zero();
  for (const p of posts) {
    for (const [k, s] of Object.entries(p.stats)) {
      if (!by[k]) continue;
      by[k].posts += 1;
      for (const f of ['reach', 'reactions', 'comments', 'shares', 'clicks']) { by[k][f] += s[f]; total[f] += s[f]; }
    }
  }
  total.posts = posts.length;
  const rate = (x) => (x.reach ? ((x.reactions + x.comments + x.shares) / x.reach) * 100 : null);
  const rows = PLATFORMS.map((p) => ({ ...p, ...by[p.key], rate: rate(by[p.key]) }));
  // weekly engagement by platform, oldest first
  const weeks = [];
  const nW = Math.max(1, Math.ceil(days / 7));
  for (let w = nW - 1; w >= 0; w--) {
    const end = startOfDay(t) + DAY - w * 7 * DAY;
    const start = end - 7 * DAY;
    const vals = PLATFORMS.map((pl) => posts.filter((p) => p.at >= start && p.at < end).reduce((a, p) => a + (p.stats[pl.key] ? p.stats[pl.key].reactions + p.stats[pl.key].comments + p.stats[pl.key].shares : 0), 0));
    weeks.push({ label: dm(start), title: 'Week of ' + dm(start), values: vals });
  }
  const top = posts.map((p) => {
    const s = Object.values(p.stats).reduce((a, x) => ({ reach: a.reach + x.reach, eng: a.eng + x.reactions + x.comments + x.shares, clicks: a.clicks + x.clicks }), { reach: 0, eng: 0, clicks: 0 });
    return { id: p.id, title: p.title, platforms: p.platforms, at: p.at, ...s };
  }).sort((a, b) => b.eng - a.eng).slice(0, 5);
  return { rows, total: { ...total, rate: rate(total) }, weeks, top };
}

// ---- GridAI writer (canned text; nothing leaves the browser) ----------------------------------------------------------
export function aiWrite(about, tone = 'friendly', lang = 'en') {
  const a = clean(about) || 'GridCommerce';
  const s = a.charAt(0).toUpperCase() + a.slice(1);
  if (lang === 'bn') {
    return [
      `${s} — এখন GridCommerce-এ।\nঅর্ডার, কুরিয়ার আর স্টক এক জায়গায়। আজই চেষ্টা করুন।`,
      `আপনার দোকানের জন্য নতুন খবর: ${a}।\nবিস্তারিত জানতে লিংকে ক্লিক করুন।`,
      `ছোট ব্যবসা, বড় স্বপ্ন। ${s}।\nGridCommerce আছে আপনার পাশে।`,
    ];
  }
  const T = {
    friendly: [`Good news for your shop: ${a}.\nTry it today and tell us what you think.`, `${s}, built for shops like yours.\nOrders, courier and stock in one place.`, `We made something for you: ${a}.\nIt takes two minutes to set up.`],
    expert: [`${s}. Here is how it saves time:\n• fewer manual steps\n• one record for every order\n• numbers you can trust`, `What changes with ${a}: less typing, fewer mistakes, faster delivery.`, `${s} — the details, and how merchants use it.`],
    urgent: [`Only this week: ${a}.\nDon’t miss it.`, `Last chance: ${a}. Ends soon.`, `${s} — act now, spots are limited.`],
    story: [`Last month a shop in Mirpur asked us for one thing. Today we ship it: ${a}.`, `It started with a merchant’s phone call. Now it is ${a}.`, `Behind every feature is a shop owner. This one: ${a}.`],
  };
  return T[tone] || T.friendly;
}
export function aiRewrite(text, kind) {
  const t = String(text || '');
  const lines = t.split('\n');
  if (kind === 'shorter') return lines.slice(0, 2).map((l) => (l.length > 140 ? l.slice(0, 137).replace(/\s+\S*$/, '') + '…' : l)).join('\n');
  if (kind === 'friendly') return lines.map((l, i) => (i === 0 ? l.replace(/\.?$/, ' 😊') : l)).join('\n');
  if (kind === 'formal') return t.replace(/!+/g, '.').replace(/[\u{1F300}-\u{1FAFF}]\s?/gu, '').replace(/\bDon’t\b/g, 'Do not').replace(/\bcan’t\b/g, 'cannot');
  if (kind === 'emoji') return ['🎉 ' + lines[0], ...lines.slice(1).map((l, i) => (l ? (i === 0 ? '👉 ' : '✅ ') + l : l))].join('\n');
  if (kind === 'cta') return /start|try|join|book|sign up/i.test(lines[lines.length - 1]) ? t : t + '\nStart free for 15 days: gridcommerce.net';
  return t;
}

// ---- social changes -----------------------------------------------------------------------------------------------
/** Save a post. input: { id?, title, text, platforms, media, tags, link, mode: 'draft'|'now'|'schedule', at } */
export function savePost(input) {
  return mk2.commit((d, now) => {
    const text = clean(input.text);
    const mode = input.mode || 'draft';
    const platforms = (input.platforms || []).filter((k) => platformBy(k));
    const link = clean(input.link);
    if (!text) return { ok: false, error: 'Write the post first.' };
    if (link && !/^https?:\/\/\S+\.\S+/.test(link)) return { ok: false, error: 'The link must start with https://' };
    const post = { title: clean(input.title) || text.split('\n')[0].slice(0, 60), text, platforms, media: input.media || [], tags: input.tags || [], link };
    if (mode !== 'draft') {
      if (!platforms.length) return { ok: false, error: 'Pick at least one page to post to.' };
      const bad = postChecks(post, d).filter((c) => c.level === 'bad');
      if (bad.length) return { ok: false, error: `${bad.map((c) => c.name).join(', ')}: ${bad[0].text}` };
    }
    if (mode === 'schedule' && !(input.at > now + 5 * MIN)) return { ok: false, error: 'Pick a time at least 5 minutes from now.' };
    const old = input.id ? d.social.posts.find((p) => p.id === input.id) : null;
    if (old && old.status === 'published') return { ok: false, error: 'This post is already published. Duplicate it to post again.' };
    const rec = old || { id: nextId(d.social.posts, 'SP-', 1000), by: me().name, createdAt: now, stats: null };
    Object.assign(rec, post, {
      status: mode === 'now' ? 'published' : mode === 'schedule' ? 'scheduled' : 'draft',
      at: mode === 'now' ? now : mode === 'schedule' ? input.at : (old && old.status === 'scheduled' ? null : rec.at || null),
      updatedAt: now,
    });
    if (mode === 'now') rec.stats = Object.fromEntries(platforms.map((k) => [k, { reach: 0, reactions: 0, comments: 0, shares: 0, clicks: 0 }]));
    if (!old) d.social.posts.push(rec);
    return { ok: true, id: rec.id, status: rec.status };
  });
}
export function deletePost(id) {
  return mk2.commit((d) => {
    const i = d.social.posts.findIndex((p) => p.id === id);
    if (i < 0) return { ok: false, error: 'That post is gone.' };
    d.social.posts.splice(i, 1);
    return { ok: true };
  });
}
export function duplicatePost(id) {
  return mk2.commit((d, now) => {
    const p = d.social.posts.find((x) => x.id === id);
    if (!p) return { ok: false, error: 'That post is gone.' };
    const copy = { ...p, id: nextId(d.social.posts, 'SP-', 1000), title: p.title + ' (copy)', status: 'draft', at: null, stats: null, by: me().name, createdAt: now, media: [...p.media], tags: [...p.tags], platforms: [...p.platforms] };
    d.social.posts.push(copy);
    return { ok: true, id: copy.id };
  });
}
export function reschedulePost(id, at) {
  return mk2.commit((d, now) => {
    const p = d.social.posts.find((x) => x.id === id);
    if (!p) return { ok: false, error: 'That post is gone.' };
    if (p.status === 'published') return { ok: false, error: 'A published post can’t be moved.' };
    if (!(at > now + 5 * MIN)) return { ok: false, error: 'Pick a time at least 5 minutes from now.' };
    p.at = at; p.status = 'scheduled'; p.updatedAt = now;
    return { ok: true };
  });
}
export function unschedulePost(id) {
  return mk2.commit((d, now) => {
    const p = d.social.posts.find((x) => x.id === id);
    if (!p || p.status !== 'scheduled') return { ok: false, error: 'Only a scheduled post can go back to draft.' };
    p.status = 'draft'; p.updatedAt = now;
    return { ok: true };
  });
}
const IMG = /\.(png|jpe?g|webp|gif)$/i;
const VID = /\.(mp4|mov|webm)$/i;
export function addAsset({ name, kind, tags }) {
  return mk2.commit((d, now) => {
    const n = clean(name).toLowerCase().replace(/\s+/g, '-');
    if (!n) return { ok: false, error: 'Give the file a name.' };
    const k = kind === 'video' ? 'video' : 'image';
    if (k === 'image' && !IMG.test(n)) return { ok: false, error: 'An image name ends in .png, .jpg, .webp or .gif.' };
    if (k === 'video' && !VID.test(n)) return { ok: false, error: 'A video name ends in .mp4, .mov or .webm.' };
    if (d.social.library.some((x) => x.name === n)) return { ok: false, error: 'A file with this name is already in the library.' };
    const r = rng('asset' + n);
    const rec = { id: nextId(d.social.library, 'MD-', 0).replace(/MD-(\d)$/, 'MD-0$1'), name: n, kind: k, tags: (tags || []).map((x) => clean(x).toLowerCase()).filter(Boolean), size: k === 'video' ? (r.int(80, 600) / 10).toFixed(1) + ' MB' : (r.int(3, 25) / 10).toFixed(1) + ' MB', dims: k === 'video' ? `0:${String(r.int(15, 59)).padStart(2, '0')}` : '1080×1080', addedAt: now, by: me().name };
    d.social.library.push(rec);
    return { ok: true, id: rec.id };
  });
}
export function removeAsset(id) {
  return mk2.commit((d) => {
    const i = d.social.library.findIndex((x) => x.id === id);
    if (i < 0) return { ok: false, error: 'That file is gone.' };
    const used = d.social.posts.filter((p) => p.status === 'scheduled' && p.media.includes(id));
    if (used.length) return { ok: false, error: `${used.length === 1 ? 'A scheduled post uses' : used.length + ' scheduled posts use'} this file. Change ${used.length === 1 ? 'it' : 'them'} first.` };
    d.social.library.splice(i, 1);
    return { ok: true };
  });
}
export function setAssetTags(id, tags) {
  return mk2.commit((d) => {
    const a = d.social.library.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'That file is gone.' };
    a.tags = [...new Set((tags || []).map((x) => clean(x).toLowerCase().replace(/^#/, '')).filter(Boolean))];
    return { ok: true };
  });
}

// =====================================================================================================================
// Google Business
// =====================================================================================================================
/** Which parts the Google Business Profile APIs cover ('google'), which are GridCommerce's own ('ours') and which are
 *  placeholders for later ('placeholder'). */
export const GBP_SUPPORT = {
  profile: 'google', hours: 'google', photos: 'google', reviews: 'google', reply: 'google', posts: 'google', performance: 'google', keywords: 'google',
  aiReply: 'ours', trend: 'ours', qa: 'placeholder',
};
export const SUPPORT_LABEL = { google: ['Google API', 'success'], ours: ['GridCommerce', 'neutral'], placeholder: ['Placeholder', 'warning'] };
export const GBP_CATEGORIES = ['Software company', 'Website designer', 'Business management consultant', 'Computer support and services', 'Internet marketing service', 'E-commerce service', 'Computer training school'];
export const WEEK = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const CTAS = [['', 'No button'], ['learn', 'Learn more'], ['signup', 'Sign up'], ['book', 'Book'], ['call', 'Call now'], ['offer', 'Get offer']];
export const GBP_POST_KINDS = [['update', 'Update'], ['offer', 'Offer'], ['event', 'Event']];
export const PHOTO_KINDS = ['Logo', 'Cover', 'Office', 'Team', 'At work', 'Event'];

const REVIEWS = [
  ['Rahim Uddin', 'Dhaka Gadget Hub', 5, 'Moved our whole shop to GridCommerce. Courier booking from the order page saves us two hours a day.', 6, true],
  ['Nusrat Jahan', 'Rongdhonu Fashion', 5, 'Support team answers on WhatsApp within minutes. Bangla support is a big plus.', 11, true],
  ['Kamal Hossain', 'Chittagong Spice Co', 4, 'Good software. The POS is fast. Wish the reports had more filters.', 15, true],
  ['Shirin Akter', '', 5, 'Attended the training at the Banani office. Very helpful team.', 19, false],
  ['Tanvir Ahmed', 'Tech Bazar BD', 3, 'Works well but setup took longer than expected. Courier connection needed help.', 23, false],
  ['Jahid Hasan', 'Sylhet Tea House', 5, 'Stock across two branches finally matches. Thank you GridCommerce.', 30, true],
  ['Farzana Yasmin', 'Yasmin Boutique', 5, 'Facebook inbox and orders in one place. My staff learned it in a day.', 37, true],
  ['Mizanur Rahman', '', 2, 'Called twice about a billing question before it was fixed.', 44, true],
  ['Ayesha Siddiqua', 'Ayesha Hijab Store', 5, 'GridAI writes my product descriptions in Bangla. Saves so much time.', 52, true],
  ['Sabbir Rahman', 'Sabbir Sports', 4, 'Solid product, fair price. The mobile app could be faster.', 60, true],
  ['Lubna Haque', 'Lubna Cosmetics', 5, 'bKash payment links changed how we take advance payments.', 71, true],
  ['Imran Hossain', 'Hossain Furniture', 4, 'Good for a furniture shop with custom orders. Invoices look professional.', 83, true],
  ['Moushumi Das', 'Das Sweets', 5, 'Our POS works even when the internet is down. Great for the shop.', 95, true],
  ['Rashed Karim', 'Karim Electronics', 3, 'Features are good. Training videos in Bangla would help.', 108, true],
  ['Taslima Begum', 'Taslima Jamdani', 5, 'We sell jamdani online now. The website builder is easy.', 122, true],
  ['Kamrul Islam', 'Kamrul Computers', 4, 'Warranty and IMEI tracking work well for our phone shop.', 137, true],
  ['Rubina Khatun', 'Rubina Pickles', 5, 'Small business like mine can afford it. Thank you.', 150, true],
  ['Shakil Ahmed', 'Shakil Shoe Gallery', 1, 'Had an outage during Eid sales. It was fixed but we lost orders.', 168, true],
  ['Sharmin Akter', 'Sharmin’s Kitchen', 5, 'The team helped me set up my menu and delivery zones.', 182, true],
  ['Mehedi Hasan', 'Mehedi Mobile Zone', 4, 'Good value. Courier COD reports are very clear.', 199, true],
  ['Nasrin Sultana', 'Nakshi Kantha House', 5, 'Beautiful storefront themes. Customers love our site.', 214, true],
  ['Arif Chowdhury', 'Chowdhury Traders', 4, 'Wholesale dues tracking is useful. Bit of a learning curve.', 228, true],
  ['Jannatul Ferdous', 'Ferdous Organic Foods', 5, 'Expiry tracking for our organic products is exactly what we needed.', 241, true],
  ['Rafiq Mia', 'Mia Hardware', 3, 'Okay for now. Need better supplier reports.', 255, true],
];
const REPLY = {
  5: (n) => `Thank you, ${n}! It means a lot to the whole team. We are always a WhatsApp message away.`,
  4: (n) => `Thanks for the kind words, ${n}. We have noted your suggestion and shared it with our product team.`,
  3: (n) => `Thank you for the honest review, ${n}. Our support team will call you this week to help with setup.`,
  2: (n) => `Sorry about the wait, ${n}. We have changed how billing questions are routed so this does not happen again.`,
  1: (n) => `${n}, we are truly sorry about the outage. We have added a second server region and credited your account.`,
};
const QA = [
  ['Does GridCommerce work without internet?', 'Yes. The POS keeps selling offline and syncs when you are back online.', 'Sabina Yasmin', 40],
  ['Is there a free trial?', 'Every plan has a 15-day free trial. No card needed.', 'Tareq Aziz', 65],
  ['Can I visit the office for a demo?', '', 'Mostafa Kamal', 4],
  ['Do you support Pathao and RedX courier?', '', 'Ruma Akter', 9],
];

function seedGbp(now) {
  const day0 = startOfDay(now);
  const profile = {
    name: 'Grid Technologies Limited', brand: 'GridCommerce', category: 'Software company',
    extra: ['E-commerce service', 'Website designer', 'Computer support and services'],
    description: 'GridCommerce by Grid Technologies Limited is commerce software made in Bangladesh: online store, Facebook and Instagram orders, POS, courier and COD, stock across branches, accounts and staff, in Bangla and English. Free 15-day trial, training at our Banani office and support on phone and WhatsApp seven days a week.',
    phone: '+880 9610-447744', website: 'https://gridcommerce.net', email: 'hello@gridcommerce.net',
    address: { line1: 'Level 7, House 42, Road 11', area: 'Banani', city: 'Dhaka', postcode: '1213' },
    hours: WEEK.map((day) => ({ day, closed: day === 'Friday', open: '09:30', close: day === 'Thursday' ? '17:00' : '18:30' })),
    opened: '2021-03-15', verified: true, updatedAt: day0 - 9 * DAY + 11 * H, updatedBy: 'Sharmin Nahar',
  };
  const photos = [
    ['PH-01', 'gridcommerce-logo.png', 'Logo', 1840], ['PH-02', 'cover-pos-and-phone.jpg', 'Cover', 5220], ['PH-03', 'banani-office-reception.jpg', 'Office', 960],
    ['PH-04', 'support-team-2026.jpg', 'Team', 1310], ['PH-05', 'merchant-training-session.jpg', 'At work', 740], ['PH-06', 'ecommerce-expo-dhaka.jpg', 'Event', 610],
    ['PH-07', 'office-meeting-room.jpg', 'Office', 380], ['PH-08', 'product-team-whiteboard.jpg', 'At work', 290],
  ].map(([id, name, kind, views], i) => ({ id, name, kind, views, addedAt: day0 - (200 - i * 20) * DAY }));
  const reviews = REVIEWS.map(([name, shop, stars, text, ago, replied], i) => {
    const at = day0 - ago * DAY + (9 + (i % 9)) * H;
    const first = name.split(' ')[0];
    return { id: 'RV-' + (301 + i), name, shop, stars, text, at, reply: replied ? REPLY[stars](first) : '', replyAt: replied ? at + (4 + (i % 20)) * H : null, replyBy: replied ? MARKETING_TEAM[i % 2] : null };
  });
  const posts = [
    ['update', 'Free 15-day trial on every plan. Online store, POS, courier and accounts, in Bangla.', 'signup', 'https://gridcommerce.net/start', 'published', -3, 412, 38],
    ['offer', 'LAUNCH50: 50% off your first month. New stores only, until the end of the year.', 'offer', 'https://gridcommerce.net/start?code=LAUNCH50', 'published', -12, 980, 121],
    ['event', 'Free training every Saturday at our Banani office, 11 AM. Bring your laptop.', 'book', 'https://gridcommerce.net/training', 'published', -26, 655, 47],
    ['update', 'Our POS now works offline on Android phones.', 'learn', 'https://gridcommerce.net/features/pos', 'published', -41, 534, 29],
    ['event', 'Webinar: the Puja sales checklist. Free, online.', 'signup', 'https://gridcommerce.net/webinar', 'scheduled', 2, 0, 0],
    ['update', 'Support is open every day of Puja, 10 AM to 6 PM.', 'call', '', 'scheduled', 5, 0, 0],
    ['offer', 'Pay yearly with ANNUAL20 and save 20%.', 'offer', 'https://gridcommerce.net/pricing', 'draft', -1, 0, 0],
  ].map(([kind, text, cta, link, st, off, views, clicks], i) => ({ id: 'GP-' + (51 + i), kind, text, cta, link, st, at: day0 + off * DAY + 11 * H, views, clicks, photo: ['PH-02', 'PH-01', 'PH-05', 'PH-02', 'PH-06', 'PH-03', 'PH-01'][i], by: MARKETING_TEAM[i % 2] }));
  const qa = QA.map(([q, a, by, ago], i) => ({ id: 'QA-' + (11 + i), q, a, by, at: day0 - ago * DAY, answeredAt: a ? day0 - (ago - 1) * DAY : null }));
  return { profile, photos, reviews, posts, qa };
}

/** Profile views (Search / Maps), searches and actions per day for the last `days`, plus the period before. */
export function gbpPerformance(t, days = 90) {
  const end = startOfDay(t);
  const series = [];
  for (let i = 2 * days - 1; i >= 0; i--) {
    const day = end - i * DAY;
    const k = Math.round(day / DAY);
    const r = rng('gbpday' + k);
    const wd = new Date(day + 6 * H).getUTCDay(); // 5 = Friday
    const week = wd === 5 ? 0.55 : wd === 6 ? 0.85 : 1;
    const growth = 1 + (2 * days - i) / (2 * days) * 0.35;
    const base = 120 * week * growth;
    const search = Math.round(base * (0.55 + r() * 0.3));
    const maps = Math.round(base * (0.25 + r() * 0.2));
    series.push({
      day, search, maps, views: search + maps,
      website: Math.round(base * (0.08 + r() * 0.06)), calls: Math.round(base * (0.025 + r() * 0.03)),
      directions: Math.round(base * (0.015 + r() * 0.02)), messages: Math.round(base * (0.01 + r() * 0.01)),
    });
  }
  const now = series.slice(days);
  const before = series.slice(0, days);
  const sum = (list, f) => list.reduce((a, x) => a + x[f], 0);
  const F = ['views', 'search', 'maps', 'website', 'calls', 'directions', 'messages'];
  const totals = Object.fromEntries(F.map((f) => [f, sum(now, f)]));
  const prev = Object.fromEntries(F.map((f) => [f, sum(before, f)]));
  const KW = [['gridcommerce', 0.21], ['pos software bangladesh', 0.12], ['ecommerce software bd', 0.09], ['grid technologies', 0.08], ['inventory software dhaka', 0.06], ['facebook shop software', 0.05], ['courier management software', 0.04], ['online store builder bangladesh', 0.035]];
  const keywords = KW.map(([q, share]) => ({ q, n: Math.round(totals.search * share) }));
  return { days: now, totals, prev, keywords };
}

/** Average rating and count per month for the last `months`. */
export function ratingTrend(reviews, t, months = 6) {
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const from = startOfMonth(addMonths(startOfMonth(t), -i));
    const to = startOfMonth(addMonths(from, 1));
    const list = reviews.filter((r) => r.at >= from && r.at < to);
    out.push({ from, label: dm(from).slice(3), avg: list.length ? list.reduce((a, r) => a + r.stars, 0) / list.length : null, n: list.length });
  }
  return out;
}

/** A canned AI reply draft by rating; n picks another wording. */
export function aiReviewReply(review, n = 0) {
  const f = review.name.split(' ')[0];
  const shop = review.shop ? ` and everyone at ${review.shop}` : '';
  const V = {
    good: [`Thank you, ${f}${shop}! We are glad GridCommerce helps your business. Message us on WhatsApp any time you need us.`, `${f}, thank you for the five stars! Your feedback keeps our team going.`, `Dear ${f}, thank you for trusting GridCommerce. We look forward to growing with you.`],
    mid: [`Thank you for the feedback, ${f}. We have shared your suggestion with our product team and will keep you posted.`, `Thanks, ${f}. We are working on exactly this and will let you know when it is ready.`, `${f}, thank you for the honest review. Our support team will call you this week.`],
    bad: [`${f}, we are sorry about this experience. Our support lead will call you today to put it right.`, `Dear ${f}, thank you for telling us. This should not have happened; please reply with your store ID so we can follow up.`, `${f}, we apologise. We have shared this with our team and will contact you shortly.`],
  };
  const set = review.stars >= 5 ? V.good : review.stars >= 3 ? V.mid : V.bad;
  return set[n % set.length];
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
export function saveProfile(fields) {
  return mk2.commit((d, now) => {
    const p = d.gbp.profile;
    const name = clean(fields.name);
    if (!name) return { ok: false, error: 'The business name is needed.', field: 'name' };
    if (name.length > 100) return { ok: false, error: 'Keep the name under 100 characters.', field: 'name' };
    const desc = clean(fields.description);
    if (desc.length > 750) return { ok: false, error: `Google allows 750 characters in the description; this has ${desc.length}.`, field: 'description' };
    const phone = clean(fields.phone);
    if (!/^\+?[\d\s-]{10,16}$/.test(phone)) return { ok: false, error: 'Use a phone number like +880 9610-447744.', field: 'phone' };
    const web = clean(fields.website);
    if (web && !/^https:\/\/\S+\.\S+/.test(web)) return { ok: false, error: 'The website must start with https://', field: 'website' };
    if (!clean(fields.address && fields.address.line1) || !clean(fields.address && fields.address.city)) return { ok: false, error: 'Fill in the street and the city.', field: 'line1' };
    for (const h of fields.hours || []) {
      if (h.closed) continue;
      if (!HHMM.test(h.open) || !HHMM.test(h.close) || h.close <= h.open) return { ok: false, error: `${h.day}: closing time must be after opening time.`, field: 'hours' };
    }
    if (!GBP_CATEGORIES.includes(fields.category)) return { ok: false, error: 'Pick a primary category.', field: 'category' };
    Object.assign(p, {
      name, description: desc, phone, website: web, category: fields.category,
      extra: (fields.extra || []).filter((c) => c !== fields.category && GBP_CATEGORIES.includes(c)).slice(0, 9),
      address: { line1: clean(fields.address.line1), area: clean(fields.address.area), city: clean(fields.address.city), postcode: clean(fields.address.postcode) },
      hours: (fields.hours || p.hours).map((h) => ({ ...h })), updatedAt: now, updatedBy: me().name,
    });
    return { ok: true };
  });
}
export function replyReview(id, text) {
  return mk2.commit((d, now) => {
    const r = d.gbp.reviews.find((x) => x.id === id);
    const s = clean(text);
    if (!r) return { ok: false, error: 'That review is gone.' };
    if (!s) return { ok: false, error: 'Write the reply first.' };
    if (s.length > 4096) return { ok: false, error: 'Google allows 4,096 characters in a reply.' };
    r.reply = s; r.replyAt = now; r.replyBy = me().name;
    return { ok: true };
  });
}
export function removeReply(id) {
  return mk2.commit((d) => {
    const r = d.gbp.reviews.find((x) => x.id === id);
    if (!r || !r.reply) return { ok: false, error: 'There is no reply to remove.' };
    r.reply = ''; r.replyAt = null; r.replyBy = null;
    return { ok: true };
  });
}
/** rec: { id?, kind, text, cta, link, photo, st: 'published'|'scheduled'|'draft', at } */
export function saveGbpPost(rec) {
  return mk2.commit((d, now) => {
    const text = clean(rec.text);
    if (!text) return { ok: false, error: 'Write the post first.' };
    if (text.length > 1500) return { ok: false, error: 'Google allows 1,500 characters in a post.' };
    if (rec.cta && rec.cta !== 'call' && !/^https?:\/\/\S+\.\S+/.test(clean(rec.link))) return { ok: false, error: 'The button needs a link starting with https://' };
    if (rec.st === 'scheduled' && !(rec.at > now + 5 * MIN)) return { ok: false, error: 'Pick a time at least 5 minutes from now.' };
    let p = rec.id ? d.gbp.posts.find((x) => x.id === rec.id) : null;
    if (!p) { p = { id: nextId(d.gbp.posts, 'GP-', 50), views: 0, clicks: 0, by: me().name }; d.gbp.posts.push(p); }
    Object.assign(p, { kind: rec.kind || 'update', text, cta: rec.cta || '', link: rec.cta && rec.cta !== 'call' ? clean(rec.link) : '', photo: rec.photo || null, st: rec.st, at: rec.st === 'scheduled' ? rec.at : now });
    return { ok: true, id: p.id };
  });
}
export function deleteGbpPost(id) {
  return mk2.commit((d) => {
    const i = d.gbp.posts.findIndex((x) => x.id === id);
    if (i < 0) return { ok: false, error: 'That post is gone.' };
    d.gbp.posts.splice(i, 1);
    return { ok: true };
  });
}
export function addPhoto({ name, kind }) {
  return mk2.commit((d, now) => {
    const n = clean(name).toLowerCase().replace(/\s+/g, '-');
    if (!IMG.test(n)) return { ok: false, error: 'Use an image name ending in .jpg, .png or .webp.' };
    if (d.gbp.photos.some((x) => x.name === n)) return { ok: false, error: 'A photo with this name is already on the profile.' };
    const rec = { id: nextId(d.gbp.photos, 'PH-', 0).replace(/PH-(\d)$/, 'PH-0$1'), name: n, kind: PHOTO_KINDS.includes(kind) ? kind : 'Office', views: 0, addedAt: now };
    d.gbp.photos.push(rec);
    return { ok: true, id: rec.id };
  });
}
export function removePhoto(id) {
  return mk2.commit((d) => {
    const ph = d.gbp.photos.find((x) => x.id === id);
    if (!ph) return { ok: false, error: 'That photo is gone.' };
    if (ph.kind === 'Logo' && d.gbp.photos.filter((x) => x.kind === 'Logo').length === 1) return { ok: false, error: 'The profile needs a logo. Add another logo first.' };
    d.gbp.photos = d.gbp.photos.filter((x) => x.id !== id);
    return { ok: true };
  });
}
export function answerQuestion(id, text) {
  return mk2.commit((d, now) => {
    const q = d.gbp.qa.find((x) => x.id === id);
    if (!q) return { ok: false, error: 'That question is gone.' };
    if (!clean(text)) return { ok: false, error: 'Write the answer first.' };
    q.a = clean(text); q.answeredAt = now;
    return { ok: true };
  });
}

// =====================================================================================================================
// Promotions — GridCommerce's offers to merchants on their subscription
// =====================================================================================================================
export const PROMO_TYPES = [['percent', 'Percent off'], ['fixed', 'Fixed amount off'], ['months', 'Free months'], ['addon', 'Free add-on']];
export const BILLINGS = [['any', 'Monthly or yearly'], ['monthly', 'Monthly only'], ['yearly', 'Yearly only']];
export const PROMO_ADDONS = ADDONS.filter((a) => a.kind === 'module');

function seedPromos(now, rows) {
  const day0 = startOfDay(now);
  const P = [
    { code: 'LAUNCH50', name: 'Launch offer · first month half price', type: 'percent', value: 50, bills: 1, newOnly: true, billing: 'monthly', ladders: [], plans: [], total: 300, perStore: 1, start: -100, end: 81, status: 'active', by: 'Tania Sultana' },
    { code: 'PUJA2026', name: 'Puja 2026 · ৳500 off the first bill', type: 'fixed', value: 500, bills: 1, newOnly: true, billing: 'any', ladders: ['online', 'retail'], plans: [], total: 150, perStore: 1, start: -10, end: 14, status: 'active', by: 'Sharmin Nahar' },
    { code: 'ANNUAL20', name: 'Yearly plans · 20% off', type: 'percent', value: 20, bills: 1, newOnly: false, billing: 'yearly', ladders: [], plans: ['business', 'enterprise'], total: 0, perStore: 1, start: -220, end: null, status: 'active', by: 'Nusrat Islam' },
    { code: 'EID2026', name: 'Eid ul-Adha 2026 · 30% off for 3 months', type: 'percent', value: 30, bills: 3, newOnly: true, billing: 'monthly', ladders: [], plans: [], total: 200, perStore: 1, start: -150, end: -118, status: 'active', by: 'Tania Sultana' },
    { code: 'WHOLESALE25', name: 'Wholesale starter · 25% off 2 months', type: 'percent', value: 25, bills: 2, newOnly: true, billing: 'monthly', ladders: ['wholesale'], plans: [], total: 6, perStore: 1, start: -75, end: 30, status: 'active', by: 'Tania Sultana' },
    { code: 'INBOX3', name: 'Inbox and automation free for 3 months', type: 'addon', value: 3, addon: 'G3', bills: 3, newOnly: false, billing: 'any', ladders: [], plans: ['business', 'enterprise'], total: 100, perStore: 1, start: -60, end: 45, status: 'paused', by: 'Mahin Khan', reason: 'Inbox servers at capacity until the upgrade on 20 Oct' },
    { code: 'BIJOY71', name: 'Victory Day · first 2 months free', type: 'months', value: 2, bills: 2, newOnly: true, billing: 'monthly', ladders: [], plans: ['growth', 'business'], total: 71, perStore: 1, start: 52, end: 70, status: 'active', by: 'Sharmin Nahar' },
    { code: 'TRAINING1000', name: 'Training attendees · ৳1,000 off', type: 'fixed', value: 1000, bills: 1, newOnly: true, billing: 'any', ladders: [], plans: [], total: 40, perStore: 1, start: -200, end: -20, status: 'ended', by: 'Tania Sultana', reason: 'Replaced by LAUNCH50' },
  ];
  const promos = P.map((p, i) => ({
    id: 'PR-' + (101 + i), code: p.code, name: p.name, type: p.type, value: p.value, addon: p.addon || null, bills: p.bills, newOnly: p.newOnly,
    billing: p.billing, ladders: p.ladders, plans: p.plans, limits: { total: p.total, perStore: p.perStore },
    start: day0 + p.start * DAY, end: p.end == null ? null : day0 + p.end * DAY + DAY - MIN, status: p.status, reason: p.reason || '',
    createdBy: p.by, createdAt: day0 + (p.start - 6) * DAY, history: [{ at: day0 + (p.start - 6) * DAY, by: p.by, text: 'Created' }].concat(p.reason ? [{ at: day0 + Math.min(-1, (p.end || 0) - 1) * DAY, by: p.by, text: (p.status === 'paused' ? 'Paused: ' : 'Ended: ') + p.reason }] : []),
  }));
  // redemptions by real stores
  const redemptions = [];
  const want = { LAUNCH50: 18, PUJA2026: 7, ANNUAL20: 9, EID2026: 14, WHOLESALE25: 6, INBOX3: 5, TRAINING1000: 11 };
  const r = rng('promo-red');
  const used = new Set();
  for (const p of promos) {
    const n = want[p.code] || 0;
    const fits = rows.filter((x) => (!p.ladders.length || p.ladders.includes(x.ladder)) && (!p.plans.length || p.plans.includes(x.plan)));
    for (let k = 0; k < n && fits.length; k++) {
      let row = fits[r.int(0, fits.length - 1)];
      for (let tries = 0; tries < 8 && used.has(p.code + row.id); tries++) row = fits[r.int(0, fits.length - 1)];
      if (used.has(p.code + row.id)) continue;
      used.add(p.code + row.id);
      const until = Math.min(p.end || now, now);
      const at = p.start + Math.floor(r() * Math.max(DAY, until - p.start));
      const billing = p.billing === 'any' ? (r.chance(0.2) ? 'yearly' : 'monthly') : p.billing;
      const list = planPrice(row.ladder, row.plan, billing) || 1000;
      const per = discountOn(p, list, row.ladder);
      // bills so far that carried the discount (a yearly bill counts once)
      const span = p.type === 'months' || p.type === 'addon' ? p.value : p.bills || 1;
      const bills = billing === 'yearly' ? 1 : Math.max(1, Math.min(span, 1 + Math.floor((now - at) / (30 * DAY))));
      const disc = per * bills;
      redemptions.push({ id: 'RD-' + (5001 + redemptions.length), promo: p.id, store: row.id, at, ladder: row.ladder, plan: row.plan, billing, list, bills, discount: disc, paid: p.type === 'addon' ? list * bills : Math.max(0, list * bills - disc) });
    }
  }
  redemptions.sort((a, b) => b.at - a.at);
  return { promos, redemptions };
}

/** The discount on one bill. */
function discountOn(p, list, ladder) {
  if (p.type === 'percent') return Math.round((list * p.value) / 100);
  if (p.type === 'fixed') return Math.min(list, p.value);
  if (p.type === 'months') return list;
  if (p.type === 'addon') { const a = addonBy(p.addon); return a ? a.price : 0; }
  return 0;
}

/** { key: 'active'|'scheduled'|'paused'|'ended', label, tone } */
export function promoState(p, data, t) {
  if (p.status === 'ended') return { key: 'ended', label: 'Ended', tone: 'neutral' };
  if (p.status === 'paused') return { key: 'paused', label: 'Paused', tone: 'warning' };
  if (p.start > t) return { key: 'scheduled', label: 'Scheduled', tone: 'info' };
  if (p.end && p.end < t) return { key: 'ended', label: 'Expired', tone: 'neutral' };
  const uses = data.redemptions.filter((x) => x.promo === p.id).length;
  if (p.limits.total && uses >= p.limits.total) return { key: 'ended', label: 'Used up', tone: 'neutral' };
  return { key: 'active', label: 'Active', tone: 'success' };
}

/** "50% off the first month · new stores · monthly" */
export function promoSummary(p) {
  const n = p.bills || 1;
  const span = n === 1 ? 'the first bill' : `${n} bills`;
  const what = p.type === 'percent' ? `${p.value}% off ${n === 1 ? 'the first bill' : 'for ' + n + ' months'}`
    : p.type === 'fixed' ? `${taka(p.value)} off ${span}`
      : p.type === 'months' ? `${p.value} month${p.value === 1 ? '' : 's'} free`
        : `${(addonBy(p.addon) || { name: p.addon }).name} free for ${p.value} month${p.value === 1 ? '' : 's'}`;
  const who = p.newOnly ? 'new stores' : 'any store';
  const bill = p.billing === 'any' ? '' : ` · ${p.billing}`;
  return `${what} · ${who}${bill}`;
}
/** What the packages say: "All packages" or "Online, Retail · Business". */
export function promoAppliesTo(p) {
  const l = p.ladders.length ? p.ladders.map(ladderLabel).join(', ') : 'All packages';
  const pl = p.plans.length ? p.plans.map((x) => PLAN_NAME[x]).join(', ') : 'every plan';
  return `${l} · ${pl}`;
}

/** What a store on ladder/plan/billing would pay with this promotion. */
export function promoPreview(p, ladder, plan, billing) {
  if (p.ladders.length && !p.ladders.includes(ladder)) return { error: `Not for ${ladderLabel(ladder)} packages.` };
  if (p.plans.length && !p.plans.includes(plan)) return { error: `Not for the ${PLAN_NAME[plan]} plan.` };
  if (p.billing !== 'any' && p.billing !== billing) return { error: `Only for ${p.billing} billing.` };
  const list = planPrice(ladder, plan, billing);
  const disc = discountOn(p, list, ladder);
  const bills = p.type === 'addon' ? p.value : p.type === 'months' ? p.value : p.bills || 1;
  const pay = p.type === 'addon' ? list : Math.max(0, list - disc);
  return { list, discount: disc, pay, bills, saved: disc * (billing === 'yearly' ? 1 : bills) };
}

/** Every promotion with its uses, discount given, revenue and state. */
export function promoRows(data, t) {
  return data.promos.map((p) => {
    const reds = data.redemptions.filter((x) => x.promo === p.id);
    const st = promoState(p, data, t);
    return { ...p, state: st, uses: reds.length, stores: new Set(reds.map((x) => x.store)).size, discount: reds.reduce((a, x) => a + x.discount, 0), revenue: reds.reduce((a, x) => a + x.paid, 0), reds };
  });
}

const CODE = /^[A-Z0-9]{3,20}$/;
/** Create or edit a promotion. input: { id?, code, name, type, value, addon, bills, newOnly, billing, ladders, plans, total, perStore, start, end } */
export function savePromo(input) {
  return mk2.commit((d, now) => {
    const code = clean(input.code).toUpperCase();
    if (!CODE.test(code)) return { ok: false, error: 'Use 3 to 20 capital letters or numbers for the code.', field: 'code' };
    if (d.promos.some((p) => p.code === code && p.id !== input.id)) return { ok: false, error: `${code} is already used by another promotion.`, field: 'code' };
    const name = clean(input.name) || code;
    const type = PROMO_TYPES.some(([k]) => k === input.type) ? input.type : 'percent';
    const value = Number(input.value);
    if (type === 'percent' && !(value >= 1 && value <= 100)) return { ok: false, error: 'A percent is between 1 and 100.', field: 'value' };
    if (type === 'fixed' && !(value >= 50 && value <= 50000)) return { ok: false, error: 'A fixed discount is between ৳50 and ৳50,000.', field: 'value' };
    if ((type === 'months' || type === 'addon') && !(Number.isInteger(value) && value >= 1 && value <= 12)) return { ok: false, error: 'Between 1 and 12 months.', field: 'value' };
    if (type === 'addon' && !addonBy(input.addon)) return { ok: false, error: 'Pick the add-on it gives.', field: 'addon' };
    const bills = type === 'percent' || type === 'fixed' ? Math.max(1, Math.min(12, Number(input.bills) || 1)) : value;
    const total = Math.max(0, Math.floor(Number(input.total) || 0));
    const perStore = Math.max(1, Math.floor(Number(input.perStore) || 1));
    if (!(input.start > 0)) return { ok: false, error: 'Pick a start date.', field: 'start' };
    if (input.end && input.end <= input.start) return { ok: false, error: 'The end date must be after the start date.', field: 'end' };
    const old = input.id ? d.promos.find((p) => p.id === input.id) : null;
    if (old && old.status === 'ended') return { ok: false, error: 'An ended promotion can’t be changed. Make a new one.' };
    const used = old ? d.redemptions.filter((x) => x.promo === old.id).length : 0;
    if (old && used && (old.type !== type || old.value !== value)) return { ok: false, error: `${used} stores already used this code, so its type and value stay. Make a new code instead.`, field: 'value' };
    if (total && used > total) return { ok: false, error: `It has been used ${used} times already; the limit can’t be lower.`, field: 'total' };
    const rec = old || { id: nextId(d.promos, 'PR-', 100), status: 'active', createdBy: me().name, createdAt: now, history: [], reason: '' };
    Object.assign(rec, {
      code, name, type, value, addon: type === 'addon' ? input.addon : null, bills, newOnly: !!input.newOnly,
      billing: ['any', 'monthly', 'yearly'].includes(input.billing) ? input.billing : 'any',
      ladders: (input.ladders || []).filter((l) => LADDERS.some((x) => x.id === l)), plans: (input.plans || []).filter((x) => PLAN_KEYS.includes(x)),
      limits: { total, perStore }, start: input.start, end: input.end || null,
    });
    rec.history.push({ at: now, by: me().name, text: old ? 'Edited' : 'Created' });
    if (!old) d.promos.push(rec);
    return { ok: true, id: rec.id };
  });
}
/** action: 'pause' | 'resume' | 'end' (pause and end need a reason). */
export function setPromoStatus(id, action, reason) {
  return mk2.commit((d, now) => {
    const p = d.promos.find((x) => x.id === id);
    if (!p) return { ok: false, error: 'That promotion is gone.' };
    if (p.status === 'ended') return { ok: false, error: 'This promotion has ended.' };
    const why = clean(reason);
    if ((action === 'pause' || action === 'end') && !why) return { ok: false, error: 'Say why, for the history.' };
    if (action === 'pause') { if (p.status === 'paused') return { ok: false, error: 'It is already paused.' }; p.status = 'paused'; }
    else if (action === 'resume') { if (p.status !== 'paused') return { ok: false, error: 'Only a paused promotion can resume.' }; p.status = 'active'; }
    else if (action === 'end') p.status = 'ended';
    else return { ok: false, error: 'Unknown action.' };
    p.reason = why;
    p.history.push({ at: now, by: me().name, text: (action === 'pause' ? 'Paused' : action === 'end' ? 'Ended' : 'Resumed') + (why ? ': ' + why : '') });
    return { ok: true };
  });
}

// =====================================================================================================================
// Affiliates
// =====================================================================================================================
export const AFF_STATUS = { Pending: 'warning', Active: 'success', Paused: 'neutral', Rejected: 'error' };
export const AFF_KINDS = ['Influencer', 'Agency', 'Trainer', 'Consultant', 'Community'];
export const RULE_KINDS = [['percent', 'Percent of the first payment'], ['fixed', 'Fixed amount per paid store'], ['recurring', 'Percent of each payment for N months'], ['campaign', 'Campaign: fixed amount with a promo code']];
export const PAY_METHODS = ['bKash', 'Nagad', 'Bank transfer'];
export const MATERIALS = ['GridCommerce brochure (Bangla).pdf', 'Pricing sheet Oct 2026.pdf', 'Demo video, 3 minutes.mp4', 'Facebook post pack, 10 images.zip', 'YouTube intro script.docx', 'Logo pack.zip', 'LAUNCH50 banner set.zip'];
export const COM_STATUS = { Held: 'neutral', Due: 'warning', 'In payout': 'info', Paid: 'success', Reversed: 'error' };
export const PAYOUT_STATUS = { Pending: 'warning', Approved: 'info', Paid: 'success', Rejected: 'error' };
export const HOLD_DAYS = 30;
export const MIN_PAYOUT = 500;

const AFFS = [
  // id, name, org, kind, district, code, rule, status, appliedAgo, channel, pay, stores
  ['AF-1001', 'Rafiqul Islam', 'Tech With Rafiq (YouTube)', 'Influencer', 'Dhaka', 'RAFIQ', 'CR-1', 'Active', 420, 'YouTube · 86k subscribers', ['bKash', '01711-245678'], ['0057', '0070', '0073']],
  ['AF-1002', 'Mahbub Alam', 'Digital Haat Agency', 'Agency', 'Rajshahi', 'DHAAT', 'CR-2', 'Active', 520, 'Agency · 40 shop clients', ['Bank transfer', 'BRAC Bank, Rajshahi · 1501204587001'], ['0025', '0069']],
  ['AF-1003', 'Nasima Akter', 'Bogura IT Training Centre', 'Trainer', 'Bogura', 'NASIMA', 'CR-3', 'Active', 300, 'Trainer · 120 students a term', ['Nagad', '01822-556677'], ['0053', '0002']],
  ['AF-1004', 'Sumon Barua', 'Barua E-com Consulting', 'Consultant', 'Chattogram', 'SUMON', 'CR-4', 'Active', 120, 'Consultant · Facebook shops', ['bKash', '01915-778899'], ['0032']],
  ['AF-1005', 'Kawsar Ahmed', 'Kawsar Tech Reviews', 'Influencer', 'Sylhet', 'KAWSAR', 'CR-1', 'Paused', 260, 'Facebook page · 52k followers', ['bKash', '01611-334455'], []],
  ['AF-1006', 'Mitu Chowdhury', 'Women Entrepreneurs BD (group)', 'Community', 'Dhaka', 'MITU', 'CR-5', 'Pending', 3, 'Facebook group · 210k members', ['bKash', '01755-901234'], []],
  ['AF-1007', 'Shahadat Karim', 'Freelance web developer', 'Consultant', 'Khulna', 'SHAHADAT', 'CR-4', 'Pending', 1, 'Fiverr and local clients', ['Bank transfer', 'Dutch-Bangla Bank, Khulna · 2091105566'], []],
  ['AF-1008', 'Abdul Wahid', 'Cheap Deals 247', 'Community', 'Dhaka', 'DEALS247', 'CR-4', 'Rejected', 40, 'Coupon website', ['bKash', '01999-111222'], []],
  ['AF-1009', 'Jannat Ara', 'Biz Bangla Podcast', 'Influencer', 'Dhaka', 'BIZBANGLA', 'CR-1', 'Active', 75, 'Podcast · 30k listeners', ['bKash', '01733-662211'], []],
  ['AF-1010', 'Tanjim Hasan', 'Gazipur Computer Point', 'Trainer', 'Gazipur', 'TANJIM', 'CR-3', 'Pending', 6, 'Computer shop and classes', ['Nagad', '01877-445566'], []],
];
// leads that signed up through an affiliate but never became paying stores: aff, business, owner, daysAgo, status
const NON_STORE = [
  ['AF-1001', 'Gadget Point Uttara', 'Rasel Mahmud', 9, 'Signed up'], ['AF-1001', 'Mobile Care Mirpur', 'Shahin Alam', 34, 'Trial ended'],
  ['AF-1001', 'Phone Ghor', 'Arifa Sultana', 61, 'Trial ended'], ['AF-1002', 'Rajshahi Mango House', 'Habibur Rahman', 18, 'Signed up'],
  ['AF-1002', 'Padma Fish Traders', 'Sirajul Islam', 47, 'Cancelled'], ['AF-1003', 'Bogura Doi Ghor', 'Monira Begum', 12, 'Signed up'],
  ['AF-1003', 'Mohasthan Crafts', 'Liton Das', 55, 'Trial ended'], ['AF-1004', 'Chattala Fashion', 'Pinky Barua', 22, 'Trial ended'],
  ['AF-1005', 'Sylhet Shoe Mart', 'Abdul Kadir', 140, 'Trial ended'], ['AF-1009', 'Nari Udyokta Shop', 'Sumaiya Islam', 8, 'Signed up'],
  ['AF-1009', 'Home Bakers Dhaka', 'Rumana Ahmed', 27, 'Trial ended'],
];

function seedRules(now) {
  const day0 = startOfDay(now);
  return [
    { id: 'CR-1', name: 'Standard · 20% for 6 months', kind: 'recurring', value: 20, months: 6, campaign: '', from: null, to: null, active: true },
    { id: 'CR-2', name: 'Agency · 25% for 12 months', kind: 'recurring', value: 25, months: 12, campaign: '', from: null, to: null, active: true },
    { id: 'CR-3', name: 'Trainer · 50% of the first payment', kind: 'percent', value: 50, months: 1, campaign: '', from: null, to: null, active: true },
    { id: 'CR-4', name: 'Flat ৳1,000 per paid store', kind: 'fixed', value: 1000, months: 1, campaign: '', from: null, to: null, active: true },
    { id: 'CR-5', name: 'Puja 2026 · ৳1,500 with PUJA2026', kind: 'campaign', value: 1500, months: 1, campaign: 'PUJA2026', from: day0 - 10 * DAY, to: day0 + 15 * DAY - MIN, active: true },
  ];
}

/** Commission a rule pays for one store on ladder/plan/billing: { payments: [{ n, base, amount }], total, first }. */
export function calcCommission(rule, ladder, plan, billing = 'monthly') {
  const price = planPrice(ladder, plan, billing);
  const payments = [];
  if (!rule || !price) return { price, payments, total: 0, first: 0 };
  if (rule.kind === 'percent') payments.push({ n: 1, base: price, amount: Math.round((price * rule.value) / 100) });
  else if (rule.kind === 'fixed' || rule.kind === 'campaign') payments.push({ n: 1, base: price, amount: rule.value });
  else if (rule.kind === 'recurring') {
    const count = billing === 'yearly' ? 1 : Math.max(1, rule.months || 1);
    for (let i = 1; i <= count; i++) payments.push({ n: i, base: price, amount: Math.round((price * rule.value) / 100) });
  }
  return { price, payments, total: payments.reduce((a, p) => a + p.amount, 0), first: payments.length ? payments[0].amount : 0 };
}
/** "20% of each payment for 6 months" */
export function ruleText(rule) {
  if (!rule) return '—';
  if (rule.kind === 'percent') return `${rule.value}% of the first payment`;
  if (rule.kind === 'fixed') return `${taka(rule.value)} per paid store`;
  if (rule.kind === 'recurring') return `${rule.value}% of each payment for ${rule.months} months`;
  return `${taka(rule.value)} per paid store with ${rule.campaign}${rule.to ? ' until ' + dm(rule.to) : ''}`;
}

const isPaidRow = (row) => !!row && (row.view === 'paying' || row.view === 'late') && row.monthly > 0;

function seedAffiliates(now, rows) {
  const day0 = startOfDay(now);
  const byId = Object.fromEntries(rows.map((x) => [x.id, x]));
  const shops = Object.fromEntries(platformDb().shops.map((s) => [s.id, s]));
  const rules = seedRules(now);
  const affiliates = [];
  const referrals = [];
  const commissions = [];
  const payouts = [];
  AFFS.forEach(([id, name, org, kind, district, code, rule, status, appliedAgo, channel, pay, stores], i) => {
    const r = rng('aff' + id);
    const op = ['017', '018', '019', '015', '016', '013'][i % 6];
    const appliedAt = day0 - appliedAgo * DAY + (10 + (i % 6)) * H;
    const a = {
      id, name, org, kind, district, code, rule, status, channel,
      phone: op + String(r.int(10, 99)) + '-' + String(r.int(100000, 999999)),
      email: name.toLowerCase().split(' ').join('.') + '@gmail.com',
      appliedAt, approvedAt: status === 'Active' || status === 'Paused' ? appliedAt + 2 * DAY : null, approvedBy: status === 'Active' || status === 'Paused' ? 'Tania Sultana' : null,
      rejectedReason: status === 'Rejected' ? 'Coupon-site traffic only; no real merchant audience' : '', pausedReason: status === 'Paused' ? 'No referrals in 4 months; asked to pause while he changes channel' : '',
      manager: i % 2 ? 'Tania Sultana' : 'Sharmin Nahar',
      pay: pay[0] === 'Bank transfer' ? { method: 'Bank transfer', number: '', bank: pay[1].split(' · ')[0], account: pay[1].split(' · ')[1], holder: name } : { method: pay[0], number: pay[1], bank: '', account: '', holder: name },
      links: [], materials: [], notes: [],
    };
    if (status === 'Active' || status === 'Paused') {
      const L = [['Main link', 'https://gridcommerce.net/'], ['Pricing page', 'https://gridcommerce.net/pricing'], ['Puja offer', 'https://gridcommerce.net/start']].slice(0, 1 + (i % 3));
      a.links = L.map(([label, url], k) => ({ id: id + '-L' + (k + 1), label, url: `${url}?ref=${code}&utm_source=affiliate&utm_medium=referral&utm_campaign=${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, clicks: r.int(120, 2400) >> k, createdAt: (a.approvedAt || appliedAt) + k * 20 * DAY }));
      a.materials = MATERIALS.filter((_, k) => (k + i) % 3 !== 0).slice(0, 4).map((m, k) => ({ name: m, sentAt: (a.approvedAt || appliedAt) + (k + 1) * DAY, by: a.manager }));
    }
    a.notes = [{ id: id + '-N1', at: appliedAt + 3 * H, by: 'Tania Sultana', text: status === 'Pending' ? `Applied through the website. ${channel}. Check the audience before approving.` : `Met at the e-commerce expo. ${channel}.` }];
    if (id === 'AF-1001') a.notes.push({ id: id + '-N2', at: day0 - 20 * DAY + 16 * H, by: 'Sharmin Nahar', text: 'Co-hosted our September webinar; ৳500 bonus agreed.' });
    affiliates.push(a);
    // real stores
    for (const sid of stores) {
      const shop = shops[sid];
      if (!shop) continue;
      const link = a.links[0] ? a.links[0].id : null;
      const ref = { id: 'RF-' + (2001 + referrals.length), aff: id, store: sid, business: shop.name, owner: (shop.owner && shop.owner.name) || shop.owner || '', at: null, status: null, link, code };
      referrals.push(ref);
      const row = byId[sid];
      if (!isPaidRow(row)) continue;
      const ru = rules.find((x) => x.id === rule);
      const firstPaid = startOfDay(shop.createdAt) + 15 * DAY;
      const count = ru.kind === 'recurring' ? ru.months : 1;
      for (let k = 0; k < count; k++) {
        const paidAt = addMonths(firstPaid, k) + 11 * H;
        if (paidAt > now) break;
        const base = row.monthly;
        const amount = ru.kind === 'recurring' || ru.kind === 'percent' ? Math.round((base * ru.value) / 100) : ru.value;
        commissions.push({ id: 'CM-' + (7001 + commissions.length), aff: id, ref: ref.id, store: sid, kind: 'earned', period: periodOf(paidAt), base, amount, rule: ru.id, at: paidAt, availableAt: paidAt + HOLD_DAYS * DAY, payout: null, reversed: false, note: k === 0 ? 'First payment' : `Payment ${k + 1} of ${count}`, by: 'System' });
      }
    }
  });
  for (const [aff, business, owner, ago, status] of NON_STORE) {
    const a = affiliates.find((x) => x.id === aff);
    referrals.push({ id: 'RF-' + (2001 + referrals.length), aff, store: null, business, owner, at: day0 - ago * DAY + 15 * H, status, link: a.links[0] ? a.links[0].id : null, code: a.code });
  }
  commissions.push({ id: 'CM-' + (7001 + commissions.length), aff: 'AF-1001', ref: null, store: null, kind: 'adjustment', period: periodOf(day0 - 19 * DAY), base: 0, amount: 500, rule: null, at: day0 - 19 * DAY + 12 * H, availableAt: day0 - 19 * DAY + 12 * H, payout: null, reversed: false, note: 'Webinar co-host bonus (September)', by: 'Sharmin Nahar' });

  // paid payouts: everything available more than 55 days ago, one payout per affiliate per month of availability
  const groups = new Map();
  for (const c of commissions) {
    if (c.availableAt > now - 55 * DAY) continue;
    const key = c.aff + '|' + periodOf(c.availableAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  const rp = rng('payouts');
  [...groups.entries()].sort((a, b) => a[1][0].availableAt - b[1][0].availableAt).forEach(([key, list]) => {
    const aff = affiliates.find((x) => x.id === key.split('|')[0]);
    const reqAt = startOfMonth(addMonths(startOfMonth(list[0].availableAt), 1)) + 4 * DAY + 11 * H;
    const id = 'PO-' + (301 + payouts.length);
    const method = aff.pay.method;
    payouts.push({ id, aff: aff.id, amount: list.reduce((a, c) => a + c.amount, 0), items: list.map((c) => c.id), status: 'Paid', requestedBy: 'Nusrat Islam', requestedAt: reqAt, approvedBy: 'Mahin Khan', approvedAt: reqAt + DAY, paidBy: 'Nusrat Islam', paidAt: reqAt + 2 * DAY, method, to: method === 'Bank transfer' ? aff.pay.account : aff.pay.number, txn: (method === 'Bank transfer' ? 'BT' : method === 'Nagad' ? 'NG' : 'BK') + String(rp.int(10000000, 99999999)) + String.fromCharCode(65 + rp.int(0, 25)), reason: '' });
    list.forEach((c) => { c.payout = id; });
  });
  // one waiting for approval, one approved and waiting to be paid
  const due = (aff) => commissions.filter((c) => c.aff === aff && !c.payout && !c.reversed && c.availableAt <= now);
  const open = (aff, status) => {
    const list = due(aff);
    if (!list.length) return;
    const id = 'PO-' + (301 + payouts.length);
    const a = affiliates.find((x) => x.id === aff);
    payouts.push({ id, aff, amount: list.reduce((s, c) => s + c.amount, 0), items: list.map((c) => c.id), status, requestedBy: status === 'Pending' ? 'Nusrat Islam' : 'Tania Sultana', requestedAt: day0 - (status === 'Pending' ? 1 : 3) * DAY + 10 * H, approvedBy: status === 'Approved' ? 'Nusrat Islam' : null, approvedAt: status === 'Approved' ? day0 - 2 * DAY + 15 * H : null, paidBy: null, paidAt: null, method: a.pay.method, to: a.pay.method === 'Bank transfer' ? a.pay.account : a.pay.number, txn: '', reason: '' });
    list.forEach((c) => { c.payout = id; });
  };
  open('AF-1002', 'Approved');
  open('AF-1001', 'Pending');
  return { affiliates, referrals, rules, commissions, payouts };
}

// ---- affiliate reading --------------------------------------------------------------------------------------------
/** Commission status: Held (inside the refund window) · Due · In payout · Paid · Reversed. */
export function comStatus(c, data, t) {
  if (c.reversed) return 'Reversed';
  if (c.payout) { const p = data.payouts.find((x) => x.id === c.payout); return p && p.status === 'Paid' ? 'Paid' : 'In payout'; }
  return t < c.availableAt ? 'Held' : 'Due';
}
/** Referrals as rows: real stores read their live state from the platform. */
export function refRows(data, t, aff) {
  const d = platformDb();
  const rows = Object.fromEntries(merchantList(d, t).rows.map((x) => [x.id, x]));
  const shops = Object.fromEntries(d.shops.map((s) => [s.id, s]));
  return data.referrals.filter((r) => !aff || r.aff === aff).map((r) => {
    if (!r.store) {
      const tone = r.status === 'Signed up' ? 'info' : 'neutral';
      return { ...r, statusLabel: r.status, tone, paid: false, plan: null, monthly: 0 };
    }
    const row = rows[r.store];
    const shop = shops[r.store];
    const paid = isPaidRow(row);
    const view = row ? row.view : 'closed';
    const label = paid ? 'Paid' : view === 'trial' ? 'Trial' : view === 'setup' ? 'Setting up' : view === 'suspended' ? 'Suspended' : view === 'closed' ? 'Closed' : 'Signed up';
    const tone = paid ? 'success' : view === 'trial' || view === 'setup' ? 'info' : view === 'suspended' ? 'error' : 'neutral';
    return { ...r, at: shop ? shop.createdAt : r.at, business: shop ? shop.name : r.business, statusLabel: label, tone, paid, plan: row ? row.packageName : null, monthly: row ? row.monthly : 0 };
  }).sort((a, b) => b.at - a.at);
}
export function comRows(data, t, aff) {
  return data.commissions.filter((c) => !aff || c.aff === aff).map((c) => ({ ...c, status: comStatus(c, data, t) })).sort((a, b) => b.at - a.at);
}
export function payoutRows(data, aff) {
  return data.payouts.filter((p) => !aff || p.aff === aff).map((p) => ({ ...p, affiliate: data.affiliates.find((a) => a.id === p.aff) })).sort((a, b) => b.requestedAt - a.requestedAt);
}
/** One affiliate with its figures. refs: the result of refRows(data, t) (pass it in when building many rows). */
export function affRow(a, data, t, refs) {
  const R = (refs || refRows(data, t, a.id)).filter((r) => r.aff === a.id);
  const C = data.commissions.filter((c) => c.aff === a.id && !c.reversed);
  const st = (c) => comStatus(c, data, t);
  const sum = (f) => C.filter(f).reduce((s, c) => s + c.amount, 0);
  return {
    ...a, ruleObj: data.rules.find((x) => x.id === a.rule) || null,
    referrals: R.length, conversions: R.filter((r) => r.paid).length,
    earned: sum(() => true), paid: sum((c) => st(c) === 'Paid'), due: sum((c) => st(c) === 'Due'), held: sum((c) => st(c) === 'Held'),
    inPayout: sum((c) => st(c) === 'In payout'), pending: sum((c) => st(c) !== 'Paid'),
    clicks: a.links.reduce((s, l) => s + l.clicks, 0),
  };
}
export function affRows(data, t) {
  const refs = refRows(data, t);
  return data.affiliates.map((a) => affRow(a, data, t, refs));
}
/** The dashboard line: active, pending approvals, referrals, paid conversions, commission pending. */
export function affSummary(data, t) {
  const rows = affRows(data, t);
  const refs = refRows(data, t);
  const from = startOfDay(t) - 29 * DAY;
  return {
    active: rows.filter((a) => a.status === 'Active').length,
    pending: rows.filter((a) => a.status === 'Pending').length,
    referrals: refs.length, referrals30: refs.filter((r) => r.at >= from).length,
    conversions: refs.filter((r) => r.paid).length,
    commissionPending: rows.reduce((s, a) => s + a.pending, 0),
    toApprove: data.payouts.filter((p) => p.status === 'Pending').length,
  };
}

// ---- affiliate changes --------------------------------------------------------------------------------------------
const PHONE = /^01[3-9]\d{2}-?\d{6}$/;
const aff = (d, id) => d.affiliates.find((a) => a.id === id);
function checkPay(pay) {
  if (!PAY_METHODS.includes(pay.method)) return 'Pick how they are paid.';
  if (pay.method === 'Bank transfer') { if (!clean(pay.bank) || !/^\d{8,18}$/.test(clean(pay.account).replace(/\D/g, ''))) return 'Give the bank and an account number (8 to 18 digits).'; }
  else if (!PHONE.test(clean(pay.number).replace(/\s/g, ''))) return `Give the ${pay.method} number, like 01711-245678.`;
  return '';
}
/** fields: { name, org, kind, district, phone, email, code, rule, channel, pay } — a new affiliate starts Pending. */
export function addAffiliate(fields) {
  return mk2.commit((d, now) => {
    const name = clean(fields.name);
    const code = clean(fields.code).toUpperCase();
    if (!name) return { ok: false, error: 'Give the affiliate’s name.', field: 'name' };
    if (!PHONE.test(clean(fields.phone).replace(/\s/g, ''))) return { ok: false, error: 'Use a mobile number like 01711-245678.', field: 'phone' };
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(clean(fields.email))) return { ok: false, error: 'Check the email address.', field: 'email' };
    if (!/^[A-Z0-9]{3,12}$/.test(code)) return { ok: false, error: 'The referral code is 3 to 12 capital letters or numbers.', field: 'code' };
    if (d.affiliates.some((a) => a.code === code)) return { ok: false, error: `${code} is taken. Try another code.`, field: 'code' };
    if (d.promos.some((p) => p.code === code)) return { ok: false, error: `${code} is a promotion code. Pick another.`, field: 'code' };
    if (!d.rules.some((r) => r.id === fields.rule && r.active)) return { ok: false, error: 'Pick a commission rule.', field: 'rule' };
    const payErr = checkPay(fields.pay || {});
    if (payErr) return { ok: false, error: payErr, field: 'pay' };
    const id = nextId(d.affiliates, 'AF-', 1000);
    d.affiliates.push({
      id, name, org: clean(fields.org), kind: AFF_KINDS.includes(fields.kind) ? fields.kind : 'Influencer', district: clean(fields.district) || 'Dhaka', code, rule: fields.rule,
      status: 'Pending', channel: clean(fields.channel), phone: clean(fields.phone), email: clean(fields.email), appliedAt: now, approvedAt: null, approvedBy: null,
      rejectedReason: '', pausedReason: '', manager: me().name, pay: { ...fields.pay, holder: clean(fields.pay.holder) || name }, links: [], materials: [],
      notes: [{ id: id + '-N1', at: now, by: me().name, text: 'Added by staff.' }],
    });
    return { ok: true, id };
  });
}
export function saveAffiliate(id, fields) {
  return mk2.commit((d) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (fields.name != null && !clean(fields.name)) return { ok: false, error: 'Give the affiliate’s name.', field: 'name' };
    if (fields.phone != null && !PHONE.test(clean(fields.phone).replace(/\s/g, ''))) return { ok: false, error: 'Use a mobile number like 01711-245678.', field: 'phone' };
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(clean(fields.email))) return { ok: false, error: 'Check the email address.', field: 'email' };
    if (fields.pay) { const e = checkPay(fields.pay); if (e) return { ok: false, error: e, field: 'pay' }; }
    for (const k of ['name', 'org', 'kind', 'district', 'phone', 'email', 'channel']) if (fields[k] != null) a[k] = clean(fields[k]);
    if (fields.pay) a.pay = { method: fields.pay.method, number: clean(fields.pay.number), bank: clean(fields.pay.bank), account: clean(fields.pay.account), holder: clean(fields.pay.holder) || a.name };
    return { ok: true };
  });
}
export function approveAffiliate(id) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (a.status !== 'Pending') return { ok: false, error: `${a.name} is ${a.status.toLowerCase()}, not waiting for approval.` };
    a.status = 'Active'; a.approvedAt = now; a.approvedBy = me().name;
    if (!a.links.length) a.links.push({ id: a.id + '-L1', label: 'Main link', url: `https://gridcommerce.net/?ref=${a.code}&utm_source=affiliate&utm_medium=referral&utm_campaign=main-link`, clicks: 0, createdAt: now });
    a.notes.push({ id: a.id + '-N' + (a.notes.length + 1), at: now, by: me().name, text: 'Approved. Referral link made.' });
    return { ok: true };
  });
}
export function rejectAffiliate(id, reason) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (a.status !== 'Pending') return { ok: false, error: 'Only a pending application can be rejected.' };
    if (!clean(reason)) return { ok: false, error: 'Say why, for the record.' };
    a.status = 'Rejected'; a.rejectedReason = clean(reason);
    a.notes.push({ id: a.id + '-N' + (a.notes.length + 1), at: now, by: me().name, text: 'Rejected: ' + clean(reason) });
    return { ok: true };
  });
}
export function pauseAffiliate(id, reason) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a || a.status !== 'Active') return { ok: false, error: 'Only an active affiliate can be paused.' };
    if (!clean(reason)) return { ok: false, error: 'Say why, for the record.' };
    a.status = 'Paused'; a.pausedReason = clean(reason);
    a.notes.push({ id: a.id + '-N' + (a.notes.length + 1), at: now, by: me().name, text: 'Paused: ' + clean(reason) + '. Links stop earning.' });
    return { ok: true };
  });
}
export function resumeAffiliate(id) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a || a.status !== 'Paused') return { ok: false, error: 'Only a paused affiliate can resume.' };
    a.status = 'Active'; a.pausedReason = '';
    a.notes.push({ id: a.id + '-N' + (a.notes.length + 1), at: now, by: me().name, text: 'Resumed.' });
    return { ok: true };
  });
}
export function setAffiliateRule(id, ruleId) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    const r = d.rules.find((x) => x.id === ruleId);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (!r || !r.active) return { ok: false, error: 'Pick an active rule.' };
    if (a.rule === ruleId) return { ok: false, error: 'They are already on this rule.' };
    a.rule = ruleId;
    a.notes.push({ id: a.id + '-N' + (a.notes.length + 1), at: now, by: me().name, text: `Commission rule changed to “${r.name}”. Applies to new referrals.` });
    return { ok: true };
  });
}
export function addLink(id, label, landing) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (a.status !== 'Active') return { ok: false, error: 'Links can only be made for an active affiliate.' };
    const l = clean(label);
    if (!l) return { ok: false, error: 'Name the link, e.g. “YouTube description”.' };
    const page = clean(landing) || 'https://gridcommerce.net/';
    if (!/^https:\/\/gridcommerce\.net(\/\S*)?$/.test(page)) return { ok: false, error: 'The page must be on https://gridcommerce.net' };
    const slug = l.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (a.links.some((x) => x.url.includes('utm_campaign=' + slug + '&') || x.url.endsWith('utm_campaign=' + slug))) return { ok: false, error: 'A link with this name already exists.' };
    const rec = { id: a.id + '-L' + (a.links.length + 1), label: l, url: `${page}${page.includes('?') ? '&' : '?'}ref=${a.code}&utm_source=affiliate&utm_medium=referral&utm_campaign=${slug}`, clicks: 0, createdAt: now };
    a.links.push(rec);
    return { ok: true, id: rec.id, url: rec.url };
  });
}
export function addAffNote(id, text) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (!clean(text)) return { ok: false, error: 'Write the note first.' };
    a.notes.push({ id: a.id + '-N' + (a.notes.length + 1) + '-' + now, at: now, by: me().name, text: clean(text) });
    return { ok: true };
  });
}
export function sendMaterial(id, name) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (!MATERIALS.includes(name)) return { ok: false, error: 'Pick a file.' };
    a.materials.push({ name, sentAt: now, by: me().name });
    return { ok: true };
  });
}
/** A manual adjustment (bonus or correction, + or −), available at once. */
export function adjustCommission(id, amount, reason) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    const n = Math.round(Number(amount));
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (!n || Math.abs(n) > 50000) return { ok: false, error: 'Give an amount between −৳50,000 and ৳50,000 (not zero).' };
    if (!clean(reason)) return { ok: false, error: 'Say why, for the record.' };
    if (n < 0) {
      const open = d.commissions.filter((c) => c.aff === id && !c.reversed && !c.payout).reduce((s, c) => s + c.amount, 0);
      if (open + n < 0) return { ok: false, error: `Only ${taka(open)} is unpaid, so the deduction can be at most that.` };
    }
    const rec = { id: nextId(d.commissions, 'CM-', 7000), aff: id, ref: null, store: null, kind: 'adjustment', period: periodOf(now), base: 0, amount: n, rule: null, at: now, availableAt: now, payout: null, reversed: false, note: clean(reason), by: me().name };
    d.commissions.push(rec);
    return { ok: true, id: rec.id };
  });
}
/** rule: { id?, name, kind, value, months, campaign, from, to } */
export function saveRule(input) {
  return mk2.commit((d) => {
    const name = clean(input.name);
    const kind = RULE_KINDS.some(([k]) => k === input.kind) ? input.kind : null;
    const value = Number(input.value);
    if (!name) return { ok: false, error: 'Name the rule.', field: 'name' };
    if (!kind) return { ok: false, error: 'Pick how it pays.', field: 'kind' };
    if ((kind === 'percent' || kind === 'recurring') && !(value >= 1 && value <= 60)) return { ok: false, error: 'A commission percent is between 1 and 60.', field: 'value' };
    if ((kind === 'fixed' || kind === 'campaign') && !(value >= 100 && value <= 20000)) return { ok: false, error: 'A fixed commission is between ৳100 and ৳20,000.', field: 'value' };
    const months = kind === 'recurring' ? Math.floor(Number(input.months)) : 1;
    if (kind === 'recurring' && !(months >= 2 && months <= 24)) return { ok: false, error: 'Between 2 and 24 months.', field: 'months' };
    const campaign = clean(input.campaign).toUpperCase();
    if (kind === 'campaign') {
      if (!d.promos.some((p) => p.code === campaign)) return { ok: false, error: 'Pick the promotion code the campaign uses.', field: 'campaign' };
      if (!(input.from > 0) || !(input.to > input.from)) return { ok: false, error: 'Give the campaign’s start and end dates.', field: 'from' };
    }
    let r = input.id ? d.rules.find((x) => x.id === input.id) : null;
    if (!r) { r = { id: nextId(d.rules, 'CR-', 0), active: true }; d.rules.push(r); }
    Object.assign(r, { name, kind, value, months, campaign: kind === 'campaign' ? campaign : '', from: kind === 'campaign' ? input.from : null, to: kind === 'campaign' ? input.to : null });
    return { ok: true, id: r.id };
  });
}
export function setRuleActive(id, on) {
  return mk2.commit((d) => {
    const r = d.rules.find((x) => x.id === id);
    if (!r) return { ok: false, error: 'That rule is gone.' };
    if (!on) {
      const users = d.affiliates.filter((a) => a.rule === id && (a.status === 'Active' || a.status === 'Pending'));
      if (users.length) return { ok: false, error: `${users.length} affiliate${users.length === 1 ? ' is' : 's are'} on this rule. Move them to another rule first.` };
    }
    r.active = !!on;
    return { ok: true };
  });
}
/** Bundle an affiliate's Due commissions into a payout waiting for approval. */
export function requestPayout(id) {
  return mk2.commit((d, now) => {
    const a = aff(d, id);
    if (!a) return { ok: false, error: 'That affiliate is gone.' };
    if (a.status === 'Rejected') return { ok: false, error: 'A rejected affiliate can’t be paid.' };
    if (d.payouts.some((p) => p.aff === id && (p.status === 'Pending' || p.status === 'Approved'))) return { ok: false, error: 'A payout for them is already open. Finish it first.' };
    const list = d.commissions.filter((c) => c.aff === id && !c.reversed && !c.payout && now >= c.availableAt);
    const amount = list.reduce((s, c) => s + c.amount, 0);
    if (!list.length || amount <= 0) return { ok: false, error: 'Nothing is due yet. Commission waits ' + HOLD_DAYS + ' days after the store pays.' };
    if (amount < MIN_PAYOUT) return { ok: false, error: `${taka(amount)} is due; payouts start at ${taka(MIN_PAYOUT)}.` };
    const err = checkPay(a.pay);
    if (err) return { ok: false, error: 'Payment details are missing: ' + err };
    const pid = nextId(d.payouts, 'PO-', 300);
    d.payouts.push({ id: pid, aff: id, amount, items: list.map((c) => c.id), status: 'Pending', requestedBy: me().name, requestedAt: now, approvedBy: null, approvedAt: null, paidBy: null, paidAt: null, method: a.pay.method, to: a.pay.method === 'Bank transfer' ? a.pay.account : a.pay.number, txn: '', reason: '' });
    list.forEach((c) => { c.payout = pid; });
    return { ok: true, id: pid, amount };
  });
}
export function approvePayout(id) {
  return mk2.commit((d, now) => {
    const p = d.payouts.find((x) => x.id === id);
    const s = me();
    if (!p) return { ok: false, error: 'That payout is gone.' };
    if (p.status !== 'Pending') return { ok: false, error: `This payout is ${p.status.toLowerCase()}.` };
    if (s.role !== 'finance' && s.role !== 'admin') return { ok: false, error: 'Only Finance or an admin can approve payouts.' };
    if (s.name === p.requestedBy) return { ok: false, error: 'You asked for this payout, so someone else must approve it.' };
    p.status = 'Approved'; p.approvedBy = s.name; p.approvedAt = now;
    return { ok: true };
  });
}
export function rejectPayout(id, reason) {
  return mk2.commit((d, now) => {
    const p = d.payouts.find((x) => x.id === id);
    if (!p) return { ok: false, error: 'That payout is gone.' };
    if (p.status !== 'Pending' && p.status !== 'Approved') return { ok: false, error: 'Only an open payout can be rejected.' };
    if (!clean(reason)) return { ok: false, error: 'Say why, for the record.' };
    p.status = 'Rejected'; p.reason = clean(reason); p.approvedBy = p.approvedBy || me().name; p.approvedAt = p.approvedAt || now;
    d.commissions.filter((c) => c.payout === id).forEach((c) => { c.payout = null; });
    return { ok: true };
  });
}
/** Mark an approved payout paid. The transaction ID can be used once. */
export function markPayoutPaid(id, { method, txn }) {
  return mk2.commit((d, now) => {
    const p = d.payouts.find((x) => x.id === id);
    if (!p) return { ok: false, error: 'That payout is gone.' };
    if (p.status !== 'Approved') return { ok: false, error: p.status === 'Pending' ? 'Approve it first.' : `This payout is ${p.status.toLowerCase()}.` };
    const tx = clean(txn).toUpperCase();
    if (!/^[A-Z0-9-]{8,24}$/.test(tx)) return { ok: false, error: 'Give the transaction ID from the bKash, Nagad or bank receipt (8 to 24 letters or numbers).', field: 'txn' };
    if (d.payouts.some((x) => x.txn && x.txn.toUpperCase() === tx)) return { ok: false, error: `${tx} is already recorded on another payout.`, field: 'txn' };
    if (method && !PAY_METHODS.includes(method)) return { ok: false, error: 'Pick how it was paid.' };
    p.status = 'Paid'; p.txn = tx; p.method = method || p.method; p.paidBy = me().name; p.paidAt = now;
    return { ok: true };
  });
}

// =====================================================================================================================
// the store
// =====================================================================================================================
export const mk2 = createStore({
  key: 'marketing2',
  version: 2,
  seed: (now) => {
    loadPlatform();
    const rows = merchantList(platformDb(), now).rows;
    return { social: seedSocial(now), gbp: seedGbp(now), ...seedPromos(now, rows), ...seedAffiliates(now, rows) };
  },
});

/** Short date helpers the screens share. */
export const when = (ms) => (ms ? `${dm(ms)} ${hm(ms)}` : '—');
export { dmy };
