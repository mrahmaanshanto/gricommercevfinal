// socialPosts — the shop's social posts, one list for the web and the app: the web's Post calendar
// (src/screens/communication/Calendar.jsx) and Create post (Composer.jsx), and the app's /m-social and /m-post-new all
// read and write it, so a post made or moved on one shows on the other. Front end only: kept in this browser.
//   PLATS                 the places a post can go (the web composer's PLAT list), each tied to its connection
//   platState(key)        { state: 'connected' | 'attention' | 'off', account, note } from lib/connections.js › statusOf
//   getPosts()            every post, with scheduled posts whose time has passed published (or failed) — the publish
//                         simulation, run against the clock (settlements.clockNow) each time the list is read
//   seedPosts()           the demo posts as on a first visit (what a server render shows; pure)
//   postBy(id) · savePost(post) · removePost(id) · duplicatePost(id, days) · reschedule(id, at)
//   publishNow(id)        posts at once: auto places get 'ok', reminder places 'reminder'; refused while a check fails
//   retryPost(id)         tries the failed places again (they fail again until the cause is fixed)
//   dropFailed(id)        takes the failed places off the post (it counts as published on the rest)
//   checksFor(post)       per place: { key, name, tone ('bad'|'warn'|'info'|'ok'), msg } — the web composer's checks
//   STATUS                status → [label, board tone]   SOCIAL_EVENT fires on every change
// Post: { id, title, text, plats: [keys], status: 'sched'|'remind'|'done'|'failed'|'draft', at (ms | null),
//         media: [{ kind: 'photo'|'video', name, src? }], tags: [..], link, results: { key: 'ok'|'failed'|'reminder' },
//         errors: { key: reason }, createdAt, publishedAt, note? (drafts tray line), suggest? ([y, m, d, hour] the
//         drafts tray offers) }. A draft with `at` sits on the calendar; without, it waits in the drafts tray.
// Publishing is simulated: no network calls.

import { statusOf } from './connections';
import { clockNow } from './settlements';

export const SOCIAL_KEY = 'gc.social.posts';
export const SOCIAL_EVENT = 'gc:social';

// key, name, short name, ChannelIcon key, connection id, auto (false: a reminder to post by hand), supports
export const PLATS = [
  ['fb', 'Facebook Page', 'Facebook', 'facebook', 'facebook', true, 'Text, photos, videos, links'],
  ['ig', 'Instagram', 'Instagram', 'instagram', 'instagram', true, 'Photos, carousels, Reels'],
  ['wa', 'WhatsApp broadcast', 'WhatsApp', 'whatsapp', 'whatsapp', true, 'Template message with photo'],
  ['tt', 'TikTok', 'TikTok', 'tiktok', 'tiktok', true, 'Videos, photo posts'],
  ['yt', 'YouTube', 'YouTube', 'youtube', 'youtube', true, 'Videos and Shorts'],
  ['x', 'X', 'X', 'x', 'x', true, 'Text up to 280 characters, photos'],
  ['pin', 'Pinterest', 'Pinterest', 'pinterest', 'pinterest', true, 'Pins with photo and link'],
  ['li', 'LinkedIn page', 'LinkedIn', 'linkedin', 'linkedin', true, 'Text, photos, links'],
  ['wac', 'WhatsApp Channel', 'WA Channel', 'whatsapp', 'whatsapp', false, 'Reminder with the text ready to copy'],
  ['fbg', 'Facebook groups', 'FB groups', 'facebook', 'facebook', false, 'Reminder with the text ready to copy'],
].map(([key, name, short, ch, app, auto, supports]) => ({ key, name, short, ch, app, auto, supports }));
export const platBy = (k) => PLATS.find((p) => p.key === k) || null;

export const STATUS = {
  sched: ['Scheduled', 'nav'], remind: ['Reminder', 'nav'], done: ['Published', 'ok'], failed: ['Failed', 'err'], draft: ['Draft', 'grey'],
};
export const LIM = { x: 280, ig: 2200, li: 3000, pin: 500 };
export const SUGGESTED_TAGS = ['#DazzleShop', '#PujaOffer', '#DhakaShopping', '#PhoneAccessoriesBD', '#FastCharger', '#পূজার_অফার', '#OnlineShoppingBD', '#Discount'];

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const now = () => safe(() => clockNow(), Date.now());

/** A place's connection: { state, account, note }. Manual places (channel, groups) follow their app. */
export function platState(key) {
  const p = platBy(key);
  if (!p) return { state: 'off' };
  return safe(() => statusOf(p.app), { state: 'off' });
}

// ---- seed: the web calendar's demo posts and drafts ---------------------------------------------------------
const T = (y, m, d, h) => new Date(y, m, d, h, 0).getTime();
const PUJA = 'Puja is here.\nGet 10% off every charger and cable with code PUJA10, until 20 October.\nFree delivery inside Dhaka on orders over ৳1,500.';
const PHOTO = (name) => ({ kind: 'photo', name });
const VIDEO = (name) => ({ kind: 'video', name });
// id, [y, m, d, h], title, places, status, text, media
const SEED_POSTS = [
  ['s1', [2026, 8, 24, 20], 'Weekend deal: bumper cases', ['fb', 'ig'], 'done', 'Weekend deal: 20% off every bumper case, Friday and Saturday only.', [PHOTO('Bumper cases.jpg')]],
  ['s2', [2026, 8, 27, 20], 'Customer review video', ['tt', 'ig'], 'done', 'What our customers say about the Anker 20W charger.', [VIDEO('Review.mp4')]],
  ['s3', [2026, 8, 29, 21], 'Puja collection teaser', ['fb', 'ig', 'tt'], 'sched', 'Something new is coming for Puja. Stay tuned.', [VIDEO('Teaser.mp4')]],
  ['a', [2026, 9, 1, 20], 'Puja offer: 10% off chargers', ['fb', 'ig', 'wa', 'tt', 'wac'], 'sched', PUJA, [VIDEO('Puja offer.mp4'), PHOTO('Puja banner.jpg')]],
  ['b', [2026, 9, 3, 20], 'Case drop test video', ['tt', 'yt', 'ig'], 'sched', 'We dropped it 20 times. The case held. Watch the full test.', [VIDEO('Drop test.mp4')]],
  ['c', [2026, 9, 5, 10], 'PUJA10 reminder', ['wa'], 'sched', 'Reminder: PUJA10 gives 10% off chargers and cables until 20 October.', [PHOTO('PUJA10.jpg')]],
  ['d', [2026, 9, 8, 10], 'Blog: Puja offers', ['fb', 'li'], 'sched', 'Our Puja offers in one place: chargers, cables, cases and more.', [PHOTO('Blog cover.jpg')], 'https://dazzleshop.com.bd/blog/puja-offers'],
  ['e', [2026, 9, 8, 19], 'Offer post for the channel', ['wac'], 'remind', PUJA, []],
  ['f', [2026, 9, 10, 18], 'Share in Dhaka gadget groups', ['fbg'], 'remind', PUJA, []],
  ['h', [2026, 9, 15, 20], 'Reel: 3 ways to protect a phone', ['ig', 'tt', 'yt'], 'sched', '3 ways to keep your phone safe this Puja. Number 2 surprised us.', [VIDEO('Protect your phone.mp4')]],
  ['j', [2026, 9, 20, 21], 'Offer ends tonight', ['fb', 'wa', 'wac', 'fbg'], 'sched', 'Last chance: PUJA10 ends tonight at midnight.', [PHOTO('Ends tonight.jpg')]],
  ['k', [2026, 9, 22, 20], 'iPhone 16 pre-order opens', ['fb', 'ig', 'li'], 'sched', 'iPhone 16 pre-orders are open. Book yours with ৳5,000 advance.', [PHOTO('iPhone 16.jpg')]],
  ['m', [2026, 9, 28, 20], 'Weekend deal preview', ['fb', 'ig', 'tt'], 'sched', 'This weekend: power banks at their lowest price of the year.', [VIDEO('Weekend deal.mp4')]],
  ['n', [2026, 9, 30, 19], 'Month-end best sellers', ['fb', 'ig', 'li'], 'sched', 'October’s best sellers, all in stock at Dhanmondi and Mirpur.', [PHOTO('Best sellers.jpg')]],
];
// the web calendar's drafts tray: id, title, places, text, media, tray line, day it offers [y, m, d, hour]
const SEED_DRAFTS = [
  ['g', 'New MagSafe cases', ['ig', 'pin', 'fb'], 'New MagSafe cases are in. Six colours, one snap.', [PHOTO('MagSafe cases.jpg')], 'Photo ready · no date', [2026, 9, 12, 21]],
  ['i', 'Last days of PUJA10', ['fb', 'ig', 'wa', 'x'], 'Only a few days left for PUJA10. 10% off chargers and cables.', [PHOTO('PUJA10.jpg')], 'Needs X connected', [2026, 9, 18, 11]],
  ['l', 'Customer reviews roundup', ['fb', 'ig'], 'Five reviews that made our week.', [], 'Text only', [2026, 9, 25, 20]],
];
function seed() {
  const created = T(2026, 8, 20, 10);
  return [
    ...SEED_POSTS.map(([id, d, title, plats, status, text, media, link = '']) => ({ id, title, text, plats, status, at: T(...d), media, tags: ['#DazzleShop', '#PujaOffer'], link, results: {}, errors: {}, createdAt: created })),
    ...SEED_DRAFTS.map(([id, title, plats, text, media, note, suggest]) => ({ id, title, text, plats, status: 'draft', at: null, media, tags: ['#DazzleShop'], link: '', results: {}, errors: {}, createdAt: created, note, suggest })),
  ];
}
/** The demo posts as on a first visit (pure: what a server render and the first client render show). */
export const seedPosts = () => seed();

// ---- storage -----------------------------------------------------------------------------------------------
const ssr = () => typeof window === 'undefined';
function readAll() {
  if (ssr()) return seed();
  try {
    const s = JSON.parse(window.localStorage.getItem(SOCIAL_KEY));
    if (s && s.v === 1 && Array.isArray(s.posts)) return s.posts;
  } catch { /* ignore */ }
  return seed();
}
function writeAll(posts) {
  if (ssr()) return;
  try {
    window.localStorage.setItem(SOCIAL_KEY, JSON.stringify({ v: 1, posts }));
  } catch {
    // photos are kept as small data URLs; if the browser is full, keep the posts without their pictures
    try { window.localStorage.setItem(SOCIAL_KEY, JSON.stringify({ v: 1, posts: posts.map((p) => ({ ...p, media: (p.media || []).map(({ src, ...m }) => m) })) })); } catch { /* ignore */ }
  }
  try { window.dispatchEvent(new CustomEvent(SOCIAL_EVENT)); } catch { /* ignore */ }
}

// ---- checks (the web composer's rules) --------------------------------------------------------------------
/** The length a place counts: text, hashtags and link. */
export function lengthOf(post) {
  const tags = post.tags || [];
  const full = (post.text || '') + (tags.length ? '\n\n' + tags.join(' ') : '');
  return Array.from(full).length + (post.link ? post.link.length + 1 : 0);
}
function issue(post, key, st) {
  const p = platBy(key);
  const media = post.media || [];
  const hasVideo = media.some((m) => m.kind === 'video');
  const hasPhoto = media.some((m) => m.kind === 'photo');
  const len = lengthOf(post);
  if (st.state === 'off') return ['bad', 'Not connected. Connect it, or it is skipped.'];
  if (key === 'x' && len > 280) return ['bad', `Too long by ${len - 280} characters. Use AI rewrite: Shorter.`];
  if (key === 'ig' && (post.tags || []).length > 30) return ['bad', 'Instagram allows up to 30 hashtags.'];
  if ((key === 'tt' || key === 'yt') && !hasVideo) return ['bad', `${p.name} needs a video. Add one under Media.`];
  if (key === 'ig' && !media.length) return ['bad', 'Instagram needs a photo or video.'];
  if (key === 'pin' && (!hasPhoto || !post.link)) return ['bad', 'Pinterest needs a photo and a link.'];
  if (LIM[key] && len > LIM[key]) return ['bad', `Too long by ${len - LIM[key]} characters.`];
  if (st.state === 'attention') return ['warn', 'Sign-in expires soon. It will post, but reconnect soon.'];
  if (!p.auto) return ['info', 'A reminder with this text goes to the store phone at the set time.'];
  if (key === 'wa') return ['info', 'Goes to customers who opted in · ৳1.10 a message from the wallet.'];
  return ['ok', 'Ready.'];
}
/** Per place: { key, name, ch, tone, msg, count (for places with a limit), over }. */
export function checksFor(post) {
  const len = lengthOf(post);
  return (post.plats || []).map((k) => {
    const p = platBy(k);
    if (!p) return null;
    const [tone, msg] = issue(post, k, platState(k));
    return { key: k, name: p.name, ch: p.ch, tone, msg, count: LIM[k] ? `${len.toLocaleString('en-IN')} / ${LIM[k].toLocaleString('en-IN')}` : '', over: !!(LIM[k] && len > LIM[k]) };
  }).filter(Boolean);
}

// ---- publishing (simulated) --------------------------------------------------------------------------------
/** What happens at each place when the post goes out. */
function publishResults(post, only) {
  const results = { ...(post.results || {}) };
  const errors = { ...(post.errors || {}) };
  (post.plats || []).forEach((k) => {
    if (only && !only.includes(k)) return;
    const p = platBy(k);
    if (!p) return;
    if (!p.auto) { results[k] = 'reminder'; delete errors[k]; return; }
    const [tone, msg] = issue(post, k, platState(k));
    if (tone === 'bad') { results[k] = 'failed'; errors[k] = msg.replace(' Connect it, or it is skipped.', ''); } else { results[k] = 'ok'; delete errors[k]; }
  });
  const failed = Object.values(results).some((r) => r === 'failed');
  return { results, errors, status: failed ? 'failed' : 'done' };
}
/** Scheduled posts whose minute has come go out. Returns the list (and saves it when something changed). */
function settle(list, t) {
  let changed = false;
  const out = list.map((p) => {
    if ((p.status !== 'sched' && p.status !== 'remind') || !p.at || p.at > t) return p;
    changed = true;
    return { ...p, ...publishResults(p), publishedAt: p.at };
  });
  if (changed) writeAll(out);
  return out;
}

export function getPosts() {
  const list = readAll();
  return ssr() ? list : settle(list, now());
}
export const postBy = (id) => getPosts().find((p) => p.id === id) || null;

const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const titleOf = (text) => { const first = String(text || '').split('\n').find((l) => l.trim()) || 'Untitled post'; const a = Array.from(first.trim()); return a.length > 48 ? a.slice(0, 46).join('') + '…' : a.join(''); };
/** Add (no id) or change a post. A scheduled post with only reminder places is a 'remind'. */
export function savePost(post) {
  const list = getPosts();
  const before = post.id ? list.find((p) => p.id === post.id) : null;
  const merged = { tags: [], media: [], link: '', results: {}, errors: {}, status: 'draft', ...(before || {}), ...post };
  const autoAny = (merged.plats || []).some((k) => (platBy(k) || {}).auto);
  if ((merged.status === 'sched' || merged.status === 'remind') && merged.at) merged.status = autoAny ? 'sched' : 'remind';
  merged.title = (post.text !== undefined && !post.title ? '' : merged.title) || titleOf(merged.text);
  if (!before) {
    const made = { ...merged, id: newId(), createdAt: now() };
    writeAll([made, ...list]);
    return getPosts().find((p) => p.id === made.id) || made;
  }
  writeAll(list.map((p) => (p.id === merged.id ? merged : p)));
  return getPosts().find((p) => p.id === merged.id) || merged;
}
export function removePost(id) { writeAll(getPosts().filter((p) => p.id !== id)); }
/** A copy as a draft, `days` later at the same time (the web's Duplicate: one week later). */
export function duplicatePost(id, days = 7) {
  const p = postBy(id);
  if (!p) return null;
  const at = p.at ? p.at + days * 864e5 : null;
  return savePost({ ...p, id: undefined, title: p.title + ' (repeat)', status: 'draft', at, results: {}, errors: {}, publishedAt: undefined });
}
export function reschedule(id, at) {
  const p = postBy(id);
  if (!p) return null;
  return savePost({ id, at, status: 'sched', plats: p.plats, results: {}, errors: {}, publishedAt: undefined });
}
/** Post at once. { ok, post, bad: [checks] } — refused while a place has a problem (as on the web). */
export function publishNow(id) {
  const p = postBy(id);
  if (!p) return { ok: false, bad: [] };
  const bad = checksFor(p).filter((c) => c.tone === 'bad');
  if (!p.plats.length) return { ok: false, bad: [], empty: true };
  if (bad.length) return { ok: false, bad, post: p };
  const t = now();
  const next = savePost({ id, at: t, status: 'done', ...publishResults({ ...p, results: {}, errors: {} }), publishedAt: t });
  return { ok: next.status === 'done', post: next, bad: [] };
}
/** Try the failed places again. */
export function retryPost(id) {
  const p = postBy(id);
  if (!p) return null;
  const failed = Object.keys(p.results || {}).filter((k) => p.results[k] === 'failed');
  const r = publishResults(p, failed);
  return savePost({ id, ...r, publishedAt: now() });
}
/** Take the failed places off the post: it stands as published on the rest. */
export function dropFailed(id) {
  const p = postBy(id);
  if (!p) return null;
  const keep = p.plats.filter((k) => (p.results || {})[k] !== 'failed');
  const results = Object.fromEntries(Object.entries(p.results || {}).filter(([k]) => keep.includes(k)));
  return savePost({ id, plats: keep, results, errors: {}, status: keep.length ? 'done' : 'draft' });
}

/** Counts per view. */
export function countsOf(list) {
  return {
    scheduled: list.filter((p) => p.status === 'sched' || p.status === 'remind').length,
    published: list.filter((p) => p.status === 'done').length,
    drafts: list.filter((p) => p.status === 'draft').length,
    failed: list.filter((p) => p.status === 'failed').length,
  };
}

// ---- GridAI writing (the web composer's writer, same texts) -----------------------------------------------
export const BASE_TEXT = {
  en: PUJA,
  bn: 'পূজা এসে গেছে!\nPUJA10 কোডে সব চার্জার ও ক্যাবলে ১০% ছাড়, ২০ অক্টোবর পর্যন্ত।\nঢাকার ভেতরে ৳১,৫০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি।',
  mix: 'Puja offer cholche!\nPUJA10 code diye shob charger ar cable e 10% off, 20 October porjonto.\nDhakar bhitore ৳1,500+ order e free delivery.',
};
export const TONES = [['friendly', 'Friendly'], ['urgent', 'Urgent'], ['premium', 'Premium'], ['fun', 'Playful']];
const GEN = {
  friendly: {
    en: ['Puja is almost here, and so is our gift to you.\nUse PUJA10 for 10% off chargers and cables until 20 October.', 'Getting ready for Puja? Charge up for less.\n10% off every charger and cable with PUJA10. Free delivery in Dhaka over ৳1,500.', 'Puja plans sorted? Your phone is next.\nPUJA10 takes 10% off chargers and cables, this month only.'],
    bn: ['পূজা আসছে, আর আপনার জন্য আছে ছোট্ট উপহার।\nPUJA10 কোডে চার্জার ও ক্যাবলে ১০% ছাড়, ২০ অক্টোবর পর্যন্ত।', 'পূজার প্রস্তুতি চলছে? ফোনের চার্জ নিয়ে আর চিন্তা নয়।\nPUJA10 কোডে ১০% ছাড়, ঢাকায় ৳১,৫০০+ অর্ডারে ফ্রি ডেলিভারি।', 'পূজার কেনাকাটায় ফোনটাও বাদ যাবে কেন?\nসব চার্জার ও ক্যাবলে ১০% ছাড়, কোড PUJA10।'],
    mix: ['Puja ashche, tai ekta choto gift!\nPUJA10 code e charger ar cable e 10% off.', 'Puja shopping cholche? Phone er charger ta update koren.\n10% off with PUJA10, Dhakay ৳1,500+ e free delivery.', 'Puja te phone o chai notun look!\nPUJA10 code e 10% off, 20 October porjonto.'],
  },
  urgent: {
    en: ['Only until 20 October: 10% off every charger and cable.\nCode PUJA10. Stock is moving fast.', 'Last call for Puja deals.\nPUJA10 = 10% off chargers and cables. Ends 20 October.', 'Do not miss it: PUJA10 saves 10% on chargers and cables.\nOrder today, delivered before Puja.'],
    bn: ['শুধু ২০ অক্টোবর পর্যন্ত!\nPUJA10 কোডে সব চার্জার ও ক্যাবলে ১০% ছাড়।', 'পূজার অফার শেষ হচ্ছে শিগগিরই।\nএখনই অর্ডার করুন, কোড PUJA10।', 'স্টক সীমিত! PUJA10 কোডে ১০% ছাড়।\nআজ অর্ডার করলে পূজার আগেই ডেলিভারি।'],
    mix: ['Shudhu 20 October porjonto!\nPUJA10 code e 10% off.', 'Offer shesh hocche!\nAjkei order koren, code PUJA10.', 'Stock limited! PUJA10 e 10% off, Puja r agei delivery.'],
  },
  premium: {
    en: ['Power, beautifully made.\nThis Puja, 10% off our charger and cable collection with PUJA10.', 'Chargers built to last, now 10% less.\nUse PUJA10 until 20 October.', 'Crafted for every day, priced for the festival.\nPUJA10 · 10% off chargers and cables.'],
    bn: ['মানসম্পন্ন চার্জার, এবার পূজায় আরও সাশ্রয়ী।\nPUJA10 কোডে ১০% ছাড়।', 'দীর্ঘস্থায়ী চার্জার ও ক্যাবল, এখন ১০% কমে।\nকোড PUJA10।', 'প্রতিদিনের জন্য তৈরি, উৎসবের দামে।\nPUJA10 · ১০% ছাড়।'],
    mix: ['Quality charger, ebar Puja te aro affordable.\nPUJA10 e 10% off.', 'Long-lasting charger ar cable, ekhon 10% kom e.\nCode PUJA10.', 'Everyday quality, festival price.\nPUJA10 · 10% off.'],
  },
  fun: {
    en: ['Your phone wants a Puja gift too.\n10% off chargers and cables with PUJA10.', 'Battery at 1%? Not this Puja.\nPUJA10 gets you 10% off.', 'New outfit: done. New charger: PUJA10.\n10% off until 20 October.'],
    bn: ['ফোনটাও পূজায় উপহার চায়!\nPUJA10 কোডে ১০% ছাড়।', 'ব্যাটারি ১%? এই পূজায় আর না।\nPUJA10 কোডে ১০% ছাড়।', 'নতুন জামা হলো, এবার নতুন চার্জার।\nPUJA10 কোডে ১০% ছাড়।'],
    mix: ['Phone tao Puja gift chay!\nPUJA10 e 10% off.', 'Battery 1%? Ei Puja te ar na!\nPUJA10 e 10% off.', 'Notun jama done, ebar notun charger.\nPUJA10 e 10% off.'],
  },
};
const LONG_LINE = { en: '\nFree delivery inside Dhaka on orders over ৳1,500.', bn: '\nঢাকার ভেতরে ৳১,৫০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি।', mix: '\nDhakay ৳1,500+ order e free delivery.' };
/** Three versions for a tone, language ('en'|'bn'|'mix') and length ('sm'|'md'|'lg'). */
export function generate(tone, lang, len) {
  return ((GEN[tone] || GEN.friendly)[lang] || GEN.friendly.en).map((t) => (len === 'sm' ? t.split('\n')[0] : len === 'lg' ? t + LONG_LINE[lang] : t));
}
/** The rewrite buttons: [label, (text) => text, language it leaves the text in or null]. */
export const REWRITES = [
  ['Shorter', (t) => t.split('\n').slice(0, 2).join('\n'), null],
  ['More exciting', (t) => t.replace(/^([^\n]*?)\.?(\n|$)/, '$1!$2').replace('Get ', 'Grab '), null],
  ['Add emojis', (t) => { const ls = t.split('\n'); return ['🎉 ' + ls[0]].concat(ls.slice(1).map((l, i) => (l ? (i === 0 ? '🔌 ' : '🚚 ') + l : l))).join('\n'); }, null],
  ['Fix grammar', (t) => t.replace(/\s+([.,!])/g, '$1').replace(/ {2,}/g, ' '), null],
  ['To Bangla', () => BASE_TEXT.bn, 'bn'],
  ['To Benglish', () => BASE_TEXT.mix, 'mix'],
  ['Add a call to action', (t) => t + '\nOrder now: link in bio.', null],
  ['Fit X (280)', (t) => Array.from(t.split('\n')[0] + ' Code PUJA10.').slice(0, 200).join(''), null],
];
