// landingParts — what a landing page is made of (the landing page builder and /lp draw the same parts):
//   PARTS            the part library: { type, label, icon, group, fields } (fields as the section editor reads them:
//                    [key, label, type, default, choices, when, sub-fields])
//   newPart(type, patch) · partsFor(template, facts, lang) · factsOf(product) · ensureParts(page, product)
//   PAGE_STYLE       the page's look: accent colour, theme, font, corners; sticky order bar on phones
//   aiBuild(brief, facts) → { parts, style, title, offerLine, steps, run }   the AI builder (writes a whole page)
//   aiRewrite(text, how) · headlineIdeas(facts, lang)                       the AI writer on a single text
// The AI is GridAI's marketing agent, simulated over the product's real data (name, price, discount, key features,
// photos, reviews, stock, warranty) and the shop's delivery charges; each run is metered in GridAI › Usage like any
// other AI call. Copy is short and plain (the shop's voice), in English, Bangla or both.

import { templateFor, fieldsOf, fieldValue } from './productTemplates';
import { summaryOf, reviewsOf } from './productReviews';
import { formatBDT } from './format';
import { deliveryRates } from './deliveryRates';
import { meter } from './gridai/usage';
import { tierOf, modelFor, costOf } from './gridai/models';

const uid = (p = 'lp') => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const tk = (n) => formatBDT(Math.round(Number(n) || 0));
export const ICON_CHOICES = ['truck', 'banknote', 'shield-check', 'rotate-ccw', 'badge-check', 'battery-full', 'zap', 'smartphone', 'camera', 'bluetooth', 'droplets', 'cpu', 'hard-drive', 'headphones', 'watch', 'sparkles', 'star', 'heart', 'gift', 'clock', 'thumbs-up', 'wrench', 'package', 'leaf'];

// ---- the part library ------------------------------------------------------------------------------------------------
const STARS = [['5', '5 stars'], ['4', '4 stars']];
export const PARTS = [
  { type: 'announce', label: 'Announcement bar', icon: 'megaphone', group: 'top',
    fields: [['text', 'Text', 'text', 'Free delivery inside Dhaka · Cash on delivery'], ['tone', 'Colours', 'choice', 'accent', [['accent', 'Accent'], ['dark', 'Dark'], ['sale', 'Sale red']]], ['timer', 'Show a countdown', 'bool', false], ['hours', 'Countdown hours', 'choice', '24', [['6', '6 hours'], ['12', '12 hours'], ['24', '24 hours'], ['48', '2 days'], ['72', '3 days']], (s) => s.timer]] },
  { type: 'hero', label: 'Hero', icon: 'layout-panel-top', group: 'top',
    fields: [['layout', 'Layout', 'choice', 'split', [['split', 'Photo beside the words'], ['center', 'Centred, photo below'], ['photo', 'Big photo first']]], ['badge', 'Small badge', 'text', ''], ['title', 'Headline', 'text', ''], ['sub', 'Line under it', 'area', ''], ['offer', 'Offer line', 'text', ''],
      ['image', 'Picture (empty = the product photo)', 'image', ''], ['button', 'Button', 'text', 'Order now · cash on delivery'], ['showPrice', 'Show the price', 'bool', true], ['showRating', 'Show the rating', 'bool', true], ['chips', 'Show COD · delivery · warranty', 'bool', true]] },
  { type: 'countdown', label: 'Countdown', icon: 'timer', group: 'sell',
    fields: [['title', 'Title', 'text', 'Offer ends in'], ['hours', 'Ends after', 'choice', '24', [['6', '6 hours'], ['12', '12 hours'], ['24', '24 hours'], ['48', '2 days'], ['72', '3 days']]], ['note', 'Note under it', 'text', 'The price goes back up when the timer ends.']] },
  { type: 'benefits', label: 'Benefits', icon: 'list-checks', group: 'tell',
    fields: [['title', 'Title', 'text', 'Why you will love it'], ['layout', 'Look', 'choice', 'cards', [['cards', 'Cards'], ['list', 'Check list'], ['badges', 'Small badges in a row']]], ['items', 'Benefits', 'list', [], null, null, [['icon', 'Icon', 'icon'], ['title', 'Benefit', 'text'], ['text', 'Short line', 'text']]]] },
  { type: 'problem', label: 'Problem and answer', icon: 'lightbulb', group: 'tell',
    fields: [['title', 'Title', 'text', ''], ['text', 'Text', 'area', ''], ['points', 'Points', 'list', [], null, null, [['title', 'Point', 'text']]], ['image', 'Picture (empty = the product photo)', 'image', ''], ['side', 'Picture on the', 'choice', 'right', [['right', 'Right'], ['left', 'Left']]]] },
  { type: 'gallery', label: 'Photo gallery', icon: 'images', group: 'show',
    fields: [['title', 'Title', 'text', 'Take a closer look'], ['items', 'Extra photos (the product photos come first)', 'list', [], null, null, [['image', 'Photo', 'image'], ['caption', 'Caption', 'text']]]] },
  { type: 'video', label: 'Video', icon: 'play-circle', group: 'show',
    fields: [['title', 'Title', 'text', 'See it in action'], ['url', 'YouTube link', 'text', ''], ['text', 'Line under it', 'text', '']] },
  { type: 'specs', label: 'Specifications', icon: 'table-properties', group: 'tell',
    fields: [['title', 'Title', 'text', 'Specifications'], ['rows', 'Rows ("Label: value", one per line; empty = from the product)', 'area', '']] },
  { type: 'compare', label: 'Us vs others', icon: 'columns-2', group: 'sell',
    fields: [['title', 'Title', 'text', 'Why buy it from us'], ['us', 'Our column', 'text', 'Dazzle Shop'], ['them', 'Their column', 'text', 'Others'], ['rows', 'Rows (one per line; "!" at the start = they have it too)', 'area', 'Official warranty card\nCash on delivery, check before you pay\n7-day easy return\nRepair help at our shops']] },
  { type: 'reviews', label: 'Reviews', icon: 'star', group: 'trust',
    fields: [['title', 'Title', 'text', 'What buyers say'], ['source', 'Reviews from', 'choice', 'product', [['product', 'The product’s published reviews'], ['own', 'My own list']]], ['count', 'How many', 'number', 3],
      ['items', 'Reviews', 'list', [], null, (s) => s.source === 'own', [['name', 'Name', 'text'], ['text', 'What they said', 'area'], ['stars', 'Stars', 'choice', STARS]]]] },
  { type: 'guarantee', label: 'Guarantee', icon: 'shield-check', group: 'trust',
    fields: [['title', 'Title', 'text', 'Buy without worry'], ['text', 'Text', 'area', 'Open the parcel in front of the rider. If it isn’t right, don’t pay. Changed your mind later? Return it within 7 days.']] },
  { type: 'order', label: 'Order form', icon: 'shopping-bag', group: 'sell',
    fields: [['title', 'Title', 'text', 'Order now, pay when it arrives'], ['sub', 'Line under it', 'text', 'Fill in the form. We call you to confirm before it ships.'], ['button', 'Button', 'text', 'Confirm order'],
      ['tiers', 'Quantity offers', 'list', [], null, null, [['label', 'Name (e.g. 1 piece)', 'text'], ['qty', 'How many', 'text'], ['price', 'Price for all (৳)', 'text'], ['tag', 'Tag (e.g. Best value)', 'text']]],
      ['variants', 'Let them pick a variant', 'bool', true], ['note', 'Note box', 'bool', true], ['freeAt', 'Free delivery from (৳, 0 = never)', 'text', '0'], ['thanks', 'After ordering', 'area', 'Thank you! We will call you within a few hours to confirm your order.']] },
  { type: 'faq', label: 'Questions', icon: 'circle-help', group: 'trust',
    fields: [['title', 'Title', 'text', 'Questions'], ['items', 'Questions', 'faq', []]] },
  { type: 'cta', label: 'Call to action', icon: 'mouse-pointer-click', group: 'sell',
    fields: [['title', 'Title', 'text', 'Ready to order?'], ['text', 'Line under it', 'text', 'Cash on delivery all over Bangladesh.'], ['button', 'Button', 'text', 'Order now']] },
  { type: 'contact', label: 'Call and WhatsApp', icon: 'phone', group: 'trust',
    fields: [['title', 'Title', 'text', 'Need help choosing?'], ['text', 'Line under it', 'text', 'Call or message us. We reply within minutes.'], ['call', 'Call button', 'bool', true], ['whatsapp', 'WhatsApp button', 'bool', true]] },
];
export const PART_GROUPS = [['top', 'Top'], ['sell', 'Sell'], ['tell', 'Tell'], ['show', 'Show'], ['trust', 'Trust']];
export const partType = (type) => PARTS.find((p) => p.type === type) || null;

export function newPart(type, patch = {}) {
  const t = partType(type);
  const out = { id: uid('pt'), type, hidden: false };
  (t ? t.fields : []).forEach(([k, , , d]) => { out[k] = Array.isArray(d) ? d.slice() : d; });
  return { ...out, ...patch };
}

// ---- the page's look ------------------------------------------------------------------------------------------------
export const PAGE_STYLE = {
  accent: '#e11d48', theme: 'light', font: 'jakarta', corners: 'round', sticky: true,
};
export const THEMES = [['light', 'Light'], ['warm', 'Warm cream'], ['dark', 'Dark']];
export const FONTS = [['jakarta', 'Plus Jakarta Sans'], ['sora', 'Sora + Figtree'], ['bricolage', 'Bricolage + DM Sans'], ['fraunces', 'Fraunces + Figtree'], ['dmserif', 'DM Serif + Jost'], ['bangla', 'Hind Siliguri (Bangla)']];
export const CORNERS = [['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']];
export const ACCENTS = ['#e11d48', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#0f172a'];

// ---- the product, as facts ------------------------------------------------------------------------------------------
export function factsOf(p) {
  if (!p) return null;
  const mrp = Number(p.mrp) > Number(p.price) ? Number(p.mrp) : 0;
  const pct = mrp ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
  let keys = [];
  try { const t = templateFor(p); keys = fieldsOf(t.id).filter((f) => f.key).map((f) => { const v = fieldValue(p, f).value; return v === '' || v == null ? null : [f.l, (f.t === 'yes' ? (v === true || v === 'Yes' ? 'Yes' : 'No') : String(v)) + (f.u ? ' ' + f.u : '')]; }).filter(Boolean).slice(0, 6); } catch { keys = []; }
  let rating = { avg: 0, count: 0 };
  try { rating = summaryOf(p); } catch { rating = { avg: 0, count: 0 }; }
  const photos = (p.media || []).filter((m) => m.src && (m.kind || 'image') === 'image').map((m) => m.src);
  const stock = (p.variants || []).length ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0) : Number(p.inv) || 0;
  const short = String(p.name).replace(/\s+\d+\/\d+\s*GB.*$/i, '').replace(/\s+with\s+.*$/i, '').trim();
  return { id: p.id, sku: p.sku, name: p.name, short, brand: p.brand || '', cat: String(p.cat || '').split(' › ').pop(), topCat: String(p.cat || '').split(' › ')[0], price: Number(p.price) || 0, mrp, pct, save: mrp ? mrp - p.price : 0,
    keys, rating, photos, stock, variants: (p.variants || []).map((v) => v.name).filter(Boolean), warranty: p.warranty || '', desc: String(p.short || '').replace(/<[^>]+>/g, ' ').trim() };
}

// ---- words in both languages ----------------------------------------------------------------------------------------
const W = {
  en: {
    cod: 'Cash on delivery', codT: 'Pay when it arrives', del: 'Fast delivery', delT: '1–2 days inside Dhaka', war: 'Official warranty', warT: 'Brand warranty card in the box', ret: '7-day return', retT: 'If anything is wrong',
    orderBtn: 'Order now · cash on delivery', formT: 'Order now, pay when it arrives', formS: 'Fill in the form. We call you to confirm before it ships.', confirm: 'Confirm order',
    why: 'Why you will love it', specs: 'Specifications', reviews: 'What buyers say', faqT: 'Questions', look: 'Take a closer look', worry: 'Buy without worry', ready: 'Ready to order?', help: 'Need help choosing?', ends: 'Offer ends in',
    one: '1 piece', two: '2 pieces', three: '3 pieces', best: 'Best value', popular: 'Most popular',
    q1: (f) => `Is ${f.short} original?`, a1: (f) => `Yes. ${f.brand ? f.brand + ' official product, ' : ''}sealed, with the official warranty card.`,
    q2: 'How long does delivery take?', a2: (d) => `1–2 days inside Dhaka (${d.in}), 3–5 days outside Dhaka (${d.out}).`,
    q3: 'Can I check before I pay?', a3: 'Yes. Open the parcel in front of the rider and pay only if it is right.',
    q4: 'What if it has a problem?', a4: (f) => `Return it within 7 days${f.warranty ? ', and the ' + f.warranty + ' warranty covers faults after that' : ''}.`,
  },
  bn: {
    cod: 'ক্যাশ অন ডেলিভারি', codT: 'হাতে পেয়ে টাকা দিন', del: 'দ্রুত ডেলিভারি', delT: 'ঢাকায় ১–২ দিনে', war: 'অফিসিয়াল ওয়ারেন্টি', warT: 'বক্সে ব্র্যান্ডের ওয়ারেন্টি কার্ড', ret: '৭ দিনে রিটার্ন', retT: 'কোনো সমস্যা হলে',
    orderBtn: 'এখনই অর্ডার করুন · ক্যাশ অন ডেলিভারি', formT: 'এখনই অর্ডার করুন, পণ্য হাতে পেয়ে টাকা দিন', formS: 'ফর্মটি পূরণ করুন। পাঠানোর আগে আমরা ফোন করে নিশ্চিত করব।', confirm: 'অর্ডার নিশ্চিত করুন',
    why: 'কেন এটি আপনার ভালো লাগবে', specs: 'স্পেসিফিকেশন', reviews: 'ক্রেতারা যা বলছেন', faqT: 'প্রশ্ন ও উত্তর', look: 'কাছ থেকে দেখুন', worry: 'নিশ্চিন্তে কিনুন', ready: 'অর্ডার করতে প্রস্তুত?', help: 'বাছাইয়ে সাহায্য লাগবে?', ends: 'অফার শেষ হবে',
    one: '১টি', two: '২টি', three: '৩টি', best: 'সবচেয়ে সাশ্রয়ী', popular: 'সবচেয়ে জনপ্রিয়',
    q1: (f) => `${f.short} কি অরিজিনাল?`, a1: () => 'হ্যাঁ। সিল করা অরিজিনাল পণ্য, সাথে অফিসিয়াল ওয়ারেন্টি কার্ড।',
    q2: 'ডেলিভারিতে কত দিন লাগে?', a2: (d) => `ঢাকার ভেতরে ১–২ দিন (${d.in}), ঢাকার বাইরে ৩–৫ দিন (${d.out})।`,
    q3: 'টাকা দেওয়ার আগে কি দেখে নিতে পারব?', a3: 'হ্যাঁ। রাইডারের সামনে পার্সেল খুলে দেখে তারপর টাকা দিন।',
    q4: 'সমস্যা হলে কী হবে?', a4: () => '৭ দিনের মধ্যে রিটার্ন করতে পারবেন, এরপর ওয়ারেন্টিতে মেরামত।',
  },
};
const ICON_OF = [[/battery|mah|backup/i, 'battery-full'], [/charg|watt|fast/i, 'zap'], [/display|screen|inch/i, 'smartphone'], [/camera|mp\b/i, 'camera'], [/bluetooth|connect|wireless/i, 'bluetooth'], [/water|ip6|ip5/i, 'droplets'], [/ram|chip|processor|cpu/i, 'cpu'], [/storage|rom|gb\b/i, 'hard-drive'], [/sound|audio|anc|noise|driver/i, 'headphones'], [/warranty/i, 'shield-check']];
const iconFor = (text) => (ICON_OF.find(([re]) => re.test(text)) || [null, 'badge-check'])[1];
const delivery = () => { let r = []; try { r = deliveryRates({ pickup: false }); } catch { r = []; } const f = (id, d) => tk((r.find((x) => x.id === id) || { fee: d }).fee); return { in: f('dhaka', 70), out: f('outside', 150) }; };

/** Quantity offers: 1 at the price, 2 at 5% off, 3 at 8% off (rounded to tens). */
const tiersFor = (f, w) => [
  { id: uid('it'), label: w.one, qty: '1', price: String(f.price), tag: '' },
  { id: uid('it'), label: w.two, qty: '2', price: String(Math.round((f.price * 2 * 0.95) / 10) * 10), tag: w.popular },
  { id: uid('it'), label: w.three, qty: '3', price: String(Math.round((f.price * 3 * 0.92) / 10) * 10), tag: w.best },
];
const shopPromises = (w) => [
  { id: uid('it'), icon: 'banknote', title: w.cod, text: w.codT }, { id: uid('it'), icon: 'truck', title: w.del, text: w.delT },
  { id: uid('it'), icon: 'shield-check', title: w.war, text: w.warT }, { id: uid('it'), icon: 'rotate-ccw', title: w.ret, text: w.retT },
];
const faqFor = (f, w) => { const d = delivery(); return [{ q: w.q1(f), a: w.a1(f) }, { q: w.q2, a: w.a2(d) }, { q: w.q3, a: w.a3 }, { q: w.q4, a: w.a4(f) }]; };

/** A page's starting parts for a template, filled from the product. */
export function partsFor(template = 'cod', f, lang = 'en') {
  const w = W[lang === 'bn' ? 'bn' : 'en'];
  const fx = f || { name: 'Your product', short: 'Your product', price: 0, keys: [], photos: [], variants: [] };
  const benefits = (fx.keys.length ? fx.keys.slice(0, 4).map(([k, v]) => ({ id: uid('it'), icon: iconFor(k + ' ' + v), title: v, text: k })) : shopPromises(w));
  const P = {
    announce: () => newPart('announce', { text: fx.pct ? `${fx.pct}% off · ${w.cod}` : `${w.cod} · ${w.delT}` }),
    hero: () => newPart('hero', { title: fx.name, sub: fx.keys.slice(0, 3).map(([, v]) => v).join(' · ') || fx.desc.slice(0, 120), offer: fx.save ? `Save ${tk(fx.save)} today` : '', badge: fx.brand ? fx.brand + ' · official' : '', button: w.orderBtn }),
    countdown: () => newPart('countdown', { title: w.ends }),
    benefits: () => newPart('benefits', { title: w.why, items: benefits }),
    problem: () => newPart('problem', { title: `Made for everyday ${fx.topCat ? fx.topCat.toLowerCase() : 'use'}`, text: fx.desc || `${fx.name} does what you need, every day, without fuss.`, points: fx.keys.slice(0, 3).map(([k, v]) => ({ id: uid('it'), title: `${k}: ${v}` })) }),
    gallery: () => newPart('gallery', { title: w.look }),
    video: () => newPart('video', {}),
    specs: () => newPart('specs', { title: w.specs }),
    compare: () => newPart('compare', {}),
    reviews: () => newPart('reviews', { title: w.reviews }),
    guarantee: () => newPart('guarantee', { title: w.worry }),
    order: () => newPart('order', { title: w.formT, sub: w.formS, button: w.confirm, tiers: fx.price ? tiersFor(fx, w) : [] }),
    faq: () => newPart('faq', { title: w.faqT, items: faqFor(fx, w) }),
    cta: () => newPart('cta', { title: w.ready, button: w.orderBtn }),
    contact: () => newPart('contact', { title: w.help }),
    promises: () => newPart('benefits', { title: w.worry, layout: 'badges', items: shopPromises(w) }),
  };
  const PLANS = {
    cod: ['announce', 'hero', 'promises', 'benefits', 'order', 'reviews', 'faq', 'contact'],
    long: ['announce', 'hero', 'countdown', 'problem', 'benefits', 'gallery', 'specs', 'compare', 'reviews', 'order', 'guarantee', 'faq', 'cta', 'contact'],
    video: ['announce', 'hero', 'video', 'benefits', 'order', 'reviews', 'faq'],
    blank: ['hero', 'benefits', 'order'],
  };
  return (PLANS[template] || PLANS.cod).map((k) => P[k]());
}
/** A saved page without parts (made before the builder worked) gets its template's parts, from its product. */
export function ensureParts(page, product) {
  if (!page || (page.parts && page.parts.length)) return page;
  const f = factsOf(product);
  const parts = partsFor(page.template || 'cod', f, page.lang === 'bn' ? 'bn' : 'en');
  const hero = parts.find((x) => x.type === 'hero');
  if (hero && page.title) hero.title = page.title;
  if (hero && page.offerLine) hero.offer = page.offerLine;
  return { ...page, parts, style: { ...PAGE_STYLE, ...(page.style || {}) } };
}

// ---- the AI builder ---------------------------------------------------------------------------------------------------
export const AI_TONES = [['friendly', 'Friendly'], ['premium', 'Premium'], ['urgent', 'Urgent, sale'], ['simple', 'Simple and clear']];
export const AI_GOALS = [['cod', 'Cash-on-delivery orders'], ['preorder', 'Pre-orders'], ['launch', 'A new product launch'], ['clearance', 'Clear the stock']];
export const AI_LANGS = [['en', 'English'], ['bn', 'Bangla'], ['both', 'English with Bangla lines']];
export const AI_LENGTHS = [['short', 'Short: order form near the top'], ['long', 'Long: the full story']];

const HEAD = {
  friendly: (f, b) => [`Meet ${f.short}`, `${f.short}, made easy`, `Your new favourite ${f.cat ? f.cat.toLowerCase().replace(/s$/, '') : 'gadget'}`][b % 3],
  premium: (f, b) => [`${f.short}. Made to last.`, `The ${f.short}, done properly`, `${f.short}: quietly brilliant`][b % 3],
  urgent: (f, b) => [f.pct ? `${f.short} — ${f.pct}% off today` : `${f.short} at its lowest price`, `Last stock: ${f.short}`, `${f.short}. Today’s price ends at midnight`][b % 3],
  simple: (f, b) => [f.name, `${f.short} with official warranty`, `Buy ${f.short} with cash on delivery`][b % 3],
};
const HEAD_BN = {
  friendly: (f) => `পরিচয় করিয়ে দিই ${f.short}`, premium: (f) => `${f.short} — টেকসই, নির্ভরযোগ্য`, urgent: (f) => (f.pct ? `${f.short} — আজ ${f.pct}% ছাড়` : `${f.short} — সবচেয়ে কম দামে`), simple: (f) => `${f.short} কিনুন ক্যাশ অন ডেলিভারিতে`,
};
const SUB_BN = 'অরিজিনাল পণ্য · অফিসিয়াল ওয়ারেন্টি · সারা বাংলাদেশে ক্যাশ অন ডেলিভারি';

/** Three headline ideas for the product (the AI writer's "More ideas"). */
export function headlineIdeas(f, lang = 'en', tone = 'friendly') {
  if (!f) return [];
  if (lang === 'bn') return ['friendly', 'premium', 'urgent'].map((t) => HEAD_BN[t](f));
  return [0, 1, 2].map((b) => (HEAD[tone] || HEAD.friendly)(f, b));
}

/** Rewrite one text: shorter · stronger · urgent · friendly · plain. */
export function aiRewrite(text, how) {
  const t = String(text || '').trim();
  if (!t) return t;
  const firstSentence = t.split(/(?<=[.!?।])\s+/)[0];
  if (how === 'shorter') { const words = firstSentence.split(/\s+/); return words.length > 9 ? words.slice(0, 9).join(' ').replace(/[,;:]$/, '') + (/[.!?।]$/.test(firstSentence) ? '' : '') : firstSentence; }
  if (how === 'urgent') return /today|now|আজ|এখনই/i.test(t) ? t : t.replace(/[.!।]?$/, '') + ' — today only, while stock lasts.';
  if (how === 'friendly') return /^(you|your|meet|আপনার)/i.test(t) ? t : 'You’ll love this: ' + t.charAt(0).toLowerCase() + t.slice(1);
  if (how === 'stronger') return t.replace(/\b(very|really|quite|just)\s+/gi, '').replace(/\bgood\b/gi, 'excellent').replace(/\bnice\b/gi, 'beautiful').replace(/[.!]?$/, '.');
  if (how === 'plain') return t.replace(/[!]+/g, '.').replace(/\s+—\s+/g, '. ').replace(/\s{2,}/g, ' ');
  return t;
}

/** Writes a whole page from a short brief. brief: { tone, goal, lang, length, audience, offer, notes }. */
export function aiBuild(brief, f) {
  const t0 = Date.now();
  const b = { tone: 'friendly', goal: 'cod', lang: 'en', length: 'short', audience: '', offer: '', notes: '', ...brief };
  const lang = b.lang === 'bn' ? 'bn' : 'en';
  const w = W[lang];
  const parts = partsFor(b.length === 'long' ? 'long' : 'cod', f, lang);
  const get = (type) => parts.find((x) => x.type === type);
  const steps = [];
  steps.push({ label: 'Read the product', detail: `${f.name} · ${tk(f.price)}${f.pct ? ' (' + f.pct + '% off)' : ''} · ${f.keys.length} key features · ${f.photos.length} photos · ${f.rating.count} reviews` });
  // headline and the line under it
  const hero = get('hero');
  hero.title = lang === 'bn' ? (HEAD_BN[b.tone] || HEAD_BN.friendly)(f) : (HEAD[b.tone] || HEAD.friendly)(f, 0);
  const forWho = b.audience.trim() ? (lang === 'bn' ? ` ${b.audience.trim()}-এর জন্য।` : `. Made for ${b.audience.trim()}.`) : '';
  hero.sub = (lang === 'bn' ? SUB_BN : (f.keys.slice(0, 3).map(([, v]) => v).join(' · ') || 'Original, with official warranty')) + forWho;
  if (b.lang === 'both') hero.sub += '\n' + SUB_BN;
  hero.offer = b.offer.trim() || (f.save ? (lang === 'bn' ? `আজ ${tk(f.save)} সাশ্রয়` : `Save ${tk(f.save)} today`) : '');
  hero.layout = b.tone === 'premium' ? 'photo' : 'split';
  if (b.goal === 'preorder') { hero.badge = lang === 'bn' ? 'প্রি-অর্ডার চলছে' : 'Pre-order now'; hero.button = lang === 'bn' ? 'প্রি-অর্ডার করুন' : 'Pre-order now · pay on delivery'; }
  if (b.goal === 'launch') hero.badge = lang === 'bn' ? 'নতুন এসেছে' : 'Just launched';
  if (b.goal === 'clearance') hero.badge = lang === 'bn' ? `মাত্র ${Math.max(1, f.stock)}টি বাকি` : `Only ${Math.max(1, f.stock)} left`;
  steps.push({ label: 'Wrote the headline', detail: `“${hero.title}” · ${AI_TONES.find((x) => x[0] === b.tone)[1].toLowerCase()} tone` });
  // urgency
  const ann = get('announce');
  if (ann) { ann.text = hero.offer || ann.text; ann.timer = b.tone === 'urgent' || b.goal === 'clearance'; ann.tone = b.tone === 'urgent' ? 'sale' : b.tone === 'premium' ? 'dark' : 'accent'; }
  if ((b.tone === 'urgent' || b.goal === 'clearance') && !get('countdown')) parts.splice(2, 0, newPart('countdown', { title: w.ends }));
  // the order form: quantity offers unless it is a pre-order
  const order = get('order');
  if (b.goal === 'preorder') { order.tiers = []; order.sub = lang === 'bn' ? 'স্টক এলে প্রথমেই আপনার কাছে পাঠানো হবে।' : 'You are first in line: we ship as soon as stock lands.'; }
  steps.push({ label: 'Planned the page', detail: parts.map((x) => (partType(x.type) || {}).label).join(' → ') });
  if (b.notes.trim()) { const faq = get('faq'); if (faq) faq.items = [...faq.items, { q: lang === 'bn' ? 'আরও কিছু জানতে চান?' : 'Anything else?', a: b.notes.trim() }]; }
  steps.push({ label: 'Checked it', detail: 'Prices and stock from the catalogue · delivery charges from Settings › Delivery · no claims the product data doesn’t support' });
  // the page's look follows the tone
  const style = { ...PAGE_STYLE, accent: b.tone === 'premium' ? '#0f172a' : b.tone === 'urgent' ? '#e11d48' : b.tone === 'simple' ? '#2563eb' : '#ea580c', theme: b.tone === 'premium' ? 'warm' : 'light', font: lang === 'bn' ? 'bangla' : b.tone === 'premium' ? 'fraunces' : 'jakarta', corners: b.tone === 'premium' ? 'soft' : 'round' };
  // metered like every GridAI call (GridAI › Usage)
  let run = null;
  try {
    const tier = tierOf('copilot');
    const model = modelFor(tier);
    const text = JSON.stringify(parts);
    const tokensIn = 1400 + f.keys.length * 40 + (b.audience.length + b.offer.length + b.notes.length) / 3;
    const tokensOut = Math.round(text.length / 4.2);
    run = meter({ id: 'run-' + Date.now().toString(36), at: Date.now(), surface: 'landing', agent: 'marketing', channel: 'landing page', intent: 'landing page', tier, model: model.name, tokensIn: Math.round(tokensIn), tokensOut, cost: Math.round(costOf(model, tokensIn, tokensOut) * 100) / 100, ms: Math.max(900, Date.now() - t0), outcome: 'suggest' });
  } catch { run = null; }
  return { parts, style, title: hero.title, offerLine: hero.offer, steps, run };
}

/** The product's published reviews (4–5 stars with words), for the Reviews part. */
export function productReviews(p, n = 3) {
  if (!p) return [];
  try { return reviewsOf(p).filter((r) => r.status === 'published' && r.stars >= 4 && String(r.text || '').length > 10).slice(0, n); } catch { return []; }
}
