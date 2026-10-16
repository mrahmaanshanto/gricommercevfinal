// storefront/kitDraft — "Build with GridAI" (Batch A step 4): a first store design drafted from a short brief, as a
// store kit (kit.js) the shop previews on its own products and imports like any design file. Simulated: no model is
// called; the rules below are the same choices tools/store-kit/SKILL.md asks a designer to make (closest sample →
// mood → colours and fonts → header → home page words), so the draft is a sensible start, not a finished design.
// A server version would send the brief and the library to the AI and check its kit with checkKit the same way.
//
//   SELLS · MOODS · draftKit(brief, variant = 0) → { ok, kit, why: [plain lines], errors }
//   brief = { sells, mood, primary ('#rrggbb' or ''), lang 'en' | 'bn', first (what to sell first), promise (the line
//             customers should see on every page), emi, hotline }
// Pure (no browser, no imports beyond the kits and kit.js), so tools can call it too.

import { checkKit } from './kit.js';
import SIGNAL from './kits/signal.gcstore.json';
import NOKSHI from './kits/nokshi.gcstore.json';
import COUNTER from './kits/counter.gcstore.json';

export const SELLS = [
  { id: 'phones', label: 'Phones and electronics', base: 'signal', ratio: 'square' },
  { id: 'fashion', label: 'Clothing and fashion', base: 'nokshi', ratio: 'portrait' },
  { id: 'beauty', label: 'Beauty and care', base: 'nokshi', ratio: 'square' },
  { id: 'grocery', label: 'Grocery and daily needs', base: 'counter', ratio: 'square' },
  { id: 'home', label: 'Home and furniture', base: 'counter', ratio: 'portrait' },
  { id: 'other', label: 'Something else', base: 'counter', ratio: 'square' },
];
export const MOODS = [
  { id: 'calm', label: 'Calm and premium', font: 'inter', corners: 'soft', buttons: 'solid', headCase: 'normal', headerTone: 'light' },
  { id: 'bold', label: 'Bold and busy (bazaar)', font: 'poppins', corners: 'sharp', buttons: 'solid', headCase: 'upper', headerTone: 'brand' },
  { id: 'playful', label: 'Friendly and playful', font: 'friendly', corners: 'round', buttons: 'solid', headCase: 'normal', headerTone: 'light' },
  { id: 'classic', label: 'Classic and elegant', font: 'elegant', corners: 'sharp', buttons: 'outline', headCase: 'normal', headerTone: 'light' },
];
const BASES = { signal: SIGNAL, nokshi: NOKSHI, counter: COUNTER };
const BASE_NAME = { signal: 'Signal', nokshi: 'Nokshi', counter: 'Counter' };
const IMG = { signal: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', nokshi: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', counter: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp' };
// home section titles in Bangla, for Bangla-first shops (the rest keep the sample's words)
const BN = {
  'Best sellers': 'সবচেয়ে বেশি বিক্রি', 'New this week': 'এই সপ্তাহে নতুন', 'Just in': 'নতুন এসেছে', 'On sale': 'ছাড়ে',
  'Shop by aisle': 'ক্যাটাগরি দেখুন', 'Shop the edit': 'ক্যাটাগরি দেখুন', 'Today’s flash sale': 'আজকের ফ্ল্যাশ সেল',
  'Loved by customers': 'ক্রেতারা যা বলছেন', 'Guides and news': 'গাইড ও খবর', 'Brands we stock': 'আমাদের ব্র্যান্ড',
  'Accessories': 'এক্সেসরিজ', 'First look at new drops': 'নতুন পণ্যের খবর আগে পান', 'Trade in your old phone': 'পুরনো ফোন বদলে নিন',
};
const ACCENTS = ['#f59e0b', '#06b6d4', '#db2777', '#16a34a', '#7c3aed'];

// ---- colour helpers ------------------------------------------------------------------------------------------------
const HEX = /^#[0-9a-f]{6}$/i;
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const darken = (h, k) => { const [r, g, b] = rgb(h); return hex(r * k, g * k, b * k); };
/** A primary that white text stays readable on (contrast 4.5 or more), darkening a light colour step by step. */
function readable(h) {
  let c = h;
  for (let i = 0; i < 12 && (1.05 / (lum(c) + 0.05)) < 4.5; i++) c = darken(c, 0.88);
  return c;
}
const clone = (x) => JSON.parse(JSON.stringify(x));
const clean = (s, n) => String(s || '').replace(/[<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);

/** A store kit drafted from the brief. variant (0, 1, 2 …) gives another header and accent for "Try another". */
export function draftKit(brief = {}, variant = 0) {
  const sells = SELLS.find((s) => s.id === brief.sells) || SELLS[SELLS.length - 1];
  const mood = MOODS.find((m) => m.id === brief.mood) || MOODS[0];
  const bn = brief.lang === 'bn';
  const k = clone(BASES[sells.base]);
  const why = [];
  why.push(`Started from ${BASE_NAME[sells.base]}, the closest ready design for ${sells.label.toLowerCase()}.`);

  // colours
  const t = { ...(k.theme || {}) };
  let accentFromBrief = '';
  if (HEX.test(brief.primary || '') && lum(brief.primary) > 0.4) {
    // a light colour (yellow, mint, pink) reads badly as text on white: it becomes the second colour
    accentFromBrief = brief.primary;
    t.primary = '{{brand_primary}}';
    why.push('Your colour is light, so it is the second colour (badges and highlights); your brand colour stays the main one so text stays readable.');
  } else if (HEX.test(brief.primary || '')) {
    const p = readable(brief.primary);
    t.primary = p;
    why.push(p.toLowerCase() === brief.primary.toLowerCase() ? 'Your colour is the main colour (buttons, header, links).' : 'Your colour was made a little darker so white text on it stays readable.');
  } else {
    t.primary = '{{brand_primary}}';
    why.push('Your brand colour (Settings › General) is the main colour.');
  }
  t.accent = accentFromBrief || ACCENTS[(variant + ['calm', 'bold', 'playful', 'classic'].indexOf(mood.id)) % ACCENTS.length];
  // type and shape from the mood
  t.fontPair = bn ? 'bangla' : mood.font;
  t.corners = mood.corners;
  t.buttons = mood.buttons;
  t.headCase = bn ? 'normal' : mood.headCase;
  t.headerTone = mood.headerTone;
  t.cardRatio = sells.ratio;
  if (brief.emi && sells.base === 'signal') t.showEmi = true;
  if (!brief.emi && t.showEmi) delete t.showEmi;
  k.theme = t;
  why.push(`${mood.label}: ${bn ? 'a Bangla-first font' : 'its font'}, ${mood.corners} corners, ${mood.buttons} buttons${mood.headerTone === 'brand' ? ', a header in your colour' : ''}.`);
  why.push(sells.ratio === 'portrait' ? 'Tall product photos, for things people want to look at.' : 'Square product photos, so more fit on a phone.');

  // header: one main header; "Try another" moves to the next
  const heads = k.headers || [];
  if (heads.length) {
    const pick = heads[variant % heads.length];
    heads.forEach((h) => { h.default = h === pick; });
    why.push(`Header: ${pick.name}${brief.hotline ? ' (your hotline stays in it)' : ''}.`);
  }

  // home page words
  const home = (k.layouts || []).find((l) => l.kind === 'home');
  const first = clean(brief.first, 60);
  const promise = clean(brief.promise, 90);
  if (home) {
    let hero = home.sections.find((s) => s.type === 'hero');
    if (!hero && (first || promise)) {
      hero = { type: 'hero', slides: [{ title: '', text: '', button: '', href: '/offers', image: IMG[sells.base], tone: 'dark' }] };
      home.sections.unshift(hero);
    }
    if (hero && hero.slides && hero.slides[0]) {
      const s0 = hero.slides[0];
      if (first) { s0.title = first; s0.button = bn ? 'এখনই কিনুন' : 'Shop now'; }
      if (promise) s0.text = promise;
      if (bn && !first) s0.button = 'এখনই কিনুন';
      if (bn) hero.slides.slice(1).forEach((s) => { if (s.button === 'See offers') s.button = 'অফার দেখুন'; });
      if (first) why.push(`The first screen sells “${first}”.`);
      if (variant) { const looks = [['split', 'text beside the picture'], ['card', 'text in a box'], ['center', 'centred text']]; const [lk, lw] = looks[(variant - 1) % looks.length]; hero.look = lk; why.push(`Home banner: ${lw}.`); }
    }
    if (bn) {
      let n = 0;
      home.sections.forEach((s) => { if (s.title && BN[s.title]) { s.title = BN[s.title]; n++; } });
      if (n) why.push(`${n} home page titles are in Bangla.`);
    }
  }
  // the line on every page
  if (promise) {
    k.notices = [{ id: 'today', text: promise, tone: mood.id === 'bold' ? 'dark' : 'primary', place: 'top' }];
    why.push('Your promise is the notice at the top of every page.');
  }
  why.push('Products, customers and orders are not touched. Change anything later in Customize, Header builder and Layouts.');

  const today = new Date().toISOString().slice(0, 10);
  k.meta = {
    id: 'gridai-draft', name: `GridAI draft ${variant + 1}`, description: `${mood.label} design for ${sells.label.toLowerCase()}, drafted by GridAI from your answers.`,
    for: sells.label, version: '0.' + (variant + 1), author: 'GridAI', made: today,
  };
  const r = checkKit(k);
  return { ok: r.ok, kit: r.kit, why, errors: r.errors || [] };
}
