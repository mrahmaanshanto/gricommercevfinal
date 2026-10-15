// storefront/completeHome — a home page with every kind of section. A theme's own home sections stay as they are, in
// their order; each kind it does not have is put in at its place in a shop's usual order (HOME_ORDER), with content that
// works for any shop, so the home shows everything the website can do and the tweak panel can restyle each part.
// A kind that needs the shop's own link to show anything (Video: a YouTube link) starts hidden.
//
//   completeHome(sections, { images, blocks }) → sections · HOME_ORDER

import { newSection, slide } from './layouts';
import { sfId } from './store';

export const HOME_ORDER = ['hero', 'trust', 'quicklinks', 'cattiles', 'countdown', 'deal', 'products', 'bannergrid', 'producttabs',
  'bento', 'offer', 'coupons', 'brands', 'reels', 'reviews', 'steps', 'cta', 'video', 'ytfeed', 'textimage', 'outlet', 'blog', 'faq',
  'newsletter', 'html', 'recent', 'seotext'];

const PHOTO = {
  watch: '/assets/products/smart-watch.webp', pods: '/assets/products/fastrack-fpods.webp', anc: '/assets/products/fastrack-fpods-anc.webp',
  cooler: '/assets/products/phone-cooler.webp', ups: '/assets/products/ske-mini-ups.webp',
};
const it = (fields) => ({ id: sfId('it'), ...fields });

/** Sample content per kind (images: the shop photos the presets use). */
function starter(type, img, blocks) {
  const S = (patch) => newSection(type, patch);
  switch (type) {
    case 'hero': return S({ variant: 'side1', height: 'M', autoplay: true,
      slides: [slide('Gadgets you use every day', 'Official warranty and cash on delivery across Bangladesh.', 'Shop new arrivals', '/search?q=', img(0), 'dark'),
        slide('Load-shedding? Stay online', 'Mini UPS for your router: up to 5 hours of Wi-Fi.', 'See power backup', '/category?handle=power-banks', img(1), 'dark')],
      side: [it({ title: 'Smart watches', text: 'Calls on your wrist', href: '/category?handle=wearables', image: PHOTO.watch })] });
    case 'trust': return S({ variant: 'chips', items: [
      it({ icon: 'truck', title: 'Delivery across Bangladesh', text: '1–2 days in Dhaka' }), it({ icon: 'banknote', title: 'Cash on delivery', text: 'Pay when it arrives' }),
      it({ icon: 'shield-check', title: 'Official warranty', text: 'On every device' }), it({ icon: 'rotate-ccw', title: '7-day return', text: 'If something is wrong' })] });
    case 'quicklinks': return S({ variant: 'cards', items: [
      it({ icon: 'package', title: 'Track your order', text: 'With your order number', href: '/track' }),
      it({ icon: 'smartphone', title: 'Find a phone', text: 'By budget and brand', href: '/search?q=phone' }),
      it({ icon: 'store', title: 'Visit a branch', text: 'Dhanmondi and Mirpur', href: '/page?handle=contact-us' }),
      it({ icon: 'message-circle', title: 'Ask on WhatsApp', text: 'Replies in minutes', href: 'https://wa.me/8801811843300' })] });
    case 'cattiles': return S({ variant: 'ring', title: 'Shop by category', count: 8 });
    case 'countdown': return S({ title: 'Flash sale' });
    case 'deal': return S({ variant: 'dark', title: 'Deals of the day', text: 'Prices drop until midnight, while stock lasts.', source: 'sale', count: 8 });
    case 'products': return S({ title: 'New arrivals', source: 'new', count: 8, layout: 'grid' });
    case 'bannergrid': return S({ variant: 'mosaic', banners: [
      it({ image: img(2), title: 'Sound that goes with you', text: 'Earbuds from ৳1,999', href: '/category?handle=audio' }),
      it({ image: img(0), title: 'Power for load-shedding', text: 'Mini UPS and power banks', href: '/category?handle=power-banks' }),
      it({ image: img(1), title: 'Cool phone, smooth games', text: 'Magnetic coolers', href: '/category?handle=accessories' })] });
    case 'producttabs': return S({ variant: 'chips', title: 'Shop by category', tabs: 5, count: 8, layout: 'carousel' });
    case 'bento': return S({ title: 'Best sellers', source: 'best' });
    case 'offer': return S({ title: 'Trade in your old phone', text: 'Bring it to a branch and get up to ৳8,000 off a new one.', button: 'Find a branch', href: '/page?handle=contact-us', image: img(3) });
    case 'coupons': return S({ variant: 'tickets', title: 'Offers for you', text: 'Copy a code and use it at checkout.', count: 4 });
    case 'brands': return S({ variant: 'strip', title: 'Official brands', count: 8 });
    case 'reels': return S({ variant: 'coverflow', title: 'Seen on our page', items: [
      it({ image: img(0), product: 'p-smart-watch' }), it({ image: img(2), product: 'p-fpods' }), it({ image: img(1), product: 'p-mini-ups' }),
      it({ image: img(3), product: 'p-fpods-anc' }), it({ image: img(0), product: 'p-phone-cooler' })] });
    case 'reviews': return S({ variant: 'cards', title: 'What customers say', count: 3 });
    case 'steps': return S({ variant: 'icons', title: 'Why shop with us', items: [
      it({ icon: 'badge-check', title: 'Straight from the brand', text: 'Every device comes sealed from the official importer.' }),
      it({ icon: 'wrench', title: 'Checked before it ships', text: 'We switch it on and test it before packing.' }),
      it({ icon: 'headset', title: 'Help after you buy', text: 'Warranty claims and repairs at our branches.' })] });
    case 'cta': return S({ variant: 'strip', label: '', title: 'Not sure what to buy?', text: 'Tell us your budget and we suggest the right one.', icon: 'message-circle', button: 'Chat with us', href: 'https://wa.me/8801811843300' });
    case 'video': return S({ title: 'Watch before you buy', url: '', hidden: true });
    case 'ytfeed': return S({ title: 'Dazzle Shop Reviews', subs: 'Unboxings and honest reviews', href: 'https://youtube.com/',
      items: ['Unboxing the new earbuds', 'Mini UPS: how long does it last?', 'Smart watch, one week later', 'Phone cooler for long games']
        .map((title, i) => it({ title, thumb: img(i), url: '' })) });
    case 'textimage': return S({ title: 'Try it at our branches', text: 'Hold the phone, test the earbuds and compare before you buy, at Dhanmondi and Mirpur.', image: img(3), side: 'right', button: 'Get directions', href: '/page?handle=contact-us' });
    case 'outlet': return S({ title: 'Visit our shops', photos: [0, 1, 2, 3].map((n) => it({ image: img(n) })) });
    case 'blog': return S({ title: 'Guides and news', count: 3 });
    case 'faq': return S({ variant: 'split', title: 'Questions', items: [
      it({ q: 'How long does delivery take?', a: '1–2 days inside Dhaka and 3–5 days outside Dhaka.', topic: 'Delivery' }),
      it({ q: 'Can I pay when it arrives?', a: 'Yes. Pay the rider in cash, or pay now by bKash, Nagad or card.', topic: 'Payment' }),
      it({ q: 'Is the warranty official?', a: 'Yes. Every device carries the brand’s official warranty, claimed at our branches.', topic: 'Warranty' }),
      it({ q: 'Can I return something?', a: 'Within 7 days if it is faulty or not as described.', topic: 'Returns' })] });
    case 'newsletter': return S({ title: 'Get offers first', text: 'New gadgets and flash sales by SMS or email.', button: 'Sign up' });
    case 'html': { const b = (blocks || []).find((x) => x.type === 'banner') || (blocks || []).find((x) => x.type === 'content'); return b ? S({ block: b.id }) : null; }
    case 'recent': return S({ title: 'Recently viewed', count: 6 });
    case 'seotext': return S({ variant: 'fold', title: 'Buy gadgets online in Bangladesh',
      text: 'Shop smart watches, earbuds, power backup and phone accessories with official warranty and cash on delivery anywhere in Bangladesh.\n\n## Delivery and payment\nOrders inside Dhaka arrive in 1–2 days and outside Dhaka in 3–5 days. Pay the rider in cash, or pay online by bKash, Nagad or card.\n\n## Warranty and returns\nEvery device carries the brand’s official warranty. If something is faulty, return it within 7 days.',
      tags: 'smart watch price in bd, earbuds, mini ups for router, phone cooler, power bank' });
    default: return null;
  }
}

// the shop's own campaign banners (pictures that carry their words) lead the home slider; a PC parts picture leads the
// banner grid. Added once: a banner already in the list, or one the merchant removed later, is left alone.
export const HOME_BANNERS = [
  { id: 'bn-s26', title: '', text: '', button: '', image: '/assets/banners/galaxy-s26-ultra.webp', alt: 'Galaxy S26 Ultra. 36 months EMI, 1 year service warranty', href: '/search?q=galaxy', tone: 'dark' },
  { id: 'bn-ip18', title: '', text: '', button: '', image: '/assets/banners/iphone-18-pro-series.webp', alt: 'iPhone 18 Pro series, in stock now', href: '/search?q=iphone', tone: 'dark' },
  { id: 'bn-macmini', title: '', text: '', button: '', image: '/assets/banners/mac-mini-m6.webp', alt: 'Mac mini M6, the mini reinvented. 36 months EMI', href: '/search?q=mac', tone: 'dark' },
];
const PC_TILE = { id: 'bn-pc', image: '/assets/banners/pc-parts.webp', title: 'PC parts and laptops', text: 'Build it or buy it ready, all in one place', href: '/search?q=laptop' };
export function withBanners(sections) {
  let heroDone = false; let gridDone = false;
  return (sections || []).map((s) => {
    if (s.type === 'hero' && !heroDone) {
      heroDone = true;
      const have = new Set((s.slides || []).map((x) => x.id));
      return HOME_BANNERS.some((b) => have.has(b.id)) ? s : { ...s, slides: [...HOME_BANNERS.map((b) => ({ ...b })), ...(s.slides || [])] };
    }
    if (s.type === 'bannergrid' && !gridDone) {
      gridDone = true;
      return (s.banners || []).some((b) => b.id === PC_TILE.id) ? s : { ...s, banners: [{ ...PC_TILE }, ...(s.banners || [])] };
    }
    return s;
  });
}

/** The theme's home sections plus every kind it lacks, each at its usual place. */
export function completeHome(sections, { images = [], blocks = [] } = {}) {
  const img = (i) => images.length ? images[i % images.length] : '';
  const out = (sections || []).slice();
  const has = new Set(out.map((s) => s.type));
  const rank = (type) => { const i = HOME_ORDER.indexOf(type); return i < 0 ? HOME_ORDER.length : i; };
  HOME_ORDER.forEach((type) => {
    if (has.has(type)) return;
    const s = starter(type, img, blocks);
    if (!s) return;
    // before the first section whose kind comes later in a shop's usual order (a theme may end with its trust strip)
    let at = out.findIndex((x) => x.type !== 'main' && rank(x.type) > rank(type));
    if (at < 0) at = out.length;
    out.splice(at, 0, s);
    has.add(type);
  });
  return withBanners(out);
}

// ---- the premium home (Signal, Oct 2026) ----------------------------------------------------------------------------------
// A running shop's home, not a catalogue of parts: about twenty sections in a buying order (offer → categories → what's
// new → one hero product → more ways in → proof → help → stay in touch). Every other kind stays in the layout, hidden,
// so the tweak panel's eye button brings any of them back. Each kept section keeps its id and the merchant's words;
// only its look and order are set. premiumHome(sections) → sections.
const SHOP_PHOTO = '/assets/99e39eac40a8abf8968649c253b23f9e.webp';
/** The plan (a function: section ids are made when it is used, never while the modules load). */
export const premiumPlan = () => [
  ['hero', { variant: 'side1', height: 'L', autoplay: true, hidden: false }],
  ['trust', { variant: 'line' }],
  ['cattiles', { variant: 'ring', title: 'Shop by category', sub: '', count: 6 }],
  ['countdown', { variant: 'panel', title: 'Flash sale' }],
  ['products', { title: 'New arrivals', sub: 'Just landed, with the official warranty', source: 'new', count: 10, layout: 'carousel' }],
  ['spotlight', { variant: 'dark', product: 'p-iphone-18p', title: '', text: 'The new Pro is in. Order it online or hold it first at our Dhanmondi and Mirpur shops.', points: [it({ title: 'Official Apple warranty' }), it({ title: 'Cash on delivery, or up to 36 months EMI on bank cards' }), it({ title: 'Delivery in 1–2 days inside Dhaka' })], image: '', button: 'Buy now' }],
  ['bannergrid', { variant: 'mosaic', title: '' }],
  ['producttabs', { variant: 'underline', title: 'Best sellers by category', tabs: 5, count: 8, layout: 'carousel' }],
  ['hotspot', { variant: 'card', title: 'Shop our counter', sub: 'Tap a number to see what’s on the shelf', image: SHOP_PHOTO }],
  ['brands', { variant: 'marquee', title: 'Official brands', count: 12 }],
  ['counters', { variant: 'band', title: '' }],
  ['reviews', { variant: 'cards', title: 'What customers say', count: 3 }],
  ['outlet', { variant: 'cards', title: 'Visit our shops', sub: 'Try before you buy. Repairs and warranty claims at both shops.' }],
  ['blog', { variant: 'minimal', title: 'Guides and news', count: 3 }],
  ['gallery', { variant: 'instagram', title: 'Follow @dazzleshopbd', sub: 'Unboxings, new arrivals and price drops', button: 'Follow on Instagram', href: 'https://instagram.com/dazzleshopbd' }],
  ['faq', { variant: 'accordion', title: 'Questions, answered' }],
  ['newsletter', { variant: 'dark', title: 'Price drops, first', text: 'One message a week about new phones and offers. No spam.', button: 'Join' }],
  ['recent', { variant: 'carousel' }],
  ['seotext', { variant: 'fold' }],
];
/** Content a premium section needs when the home doesn't have that kind yet (or has it empty). */
function premiumContent(type, s) {
  if (type === 'hero') {
    const main = HOME_BANNERS.map((b) => ({ ...b }));
    return { slides: main, side: [it({ image: '/assets/banners/pc-parts-2.webp', title: 'Build your PC', text: 'Parts, laptops and set-up help', href: '/search?q=laptop' })] };
  }
  if (type === 'bannergrid') {
    return { banners: [{ ...PC_TILE }, it({ image: PHOTO.watch, title: 'Calls on your wrist', text: 'Smart watches from ৳3,290', href: '/category?handle=wearables' }), it({ image: PHOTO.anc, title: 'Quiet, when you want it', text: 'ANC earbuds and more audio', href: '/category?handle=audio' })] };
  }
  if (type === 'hotspot' && !(s.pins || []).length) {
    return { pins: [it({ product: 'p-galaxy-tab-a11p', x: 66, y: 70 }), it({ product: 'p-redmi-turbo4p', x: 14, y: 30 }), it({ product: 'p-iphone-18p', x: 88, y: 22 }), it({ product: 'p-phone-cooler', x: 30, y: 62 })] };
  }
  if (type === 'counters' && !(s.items || []).length) {
    return { items: [it({ icon: 'smile', value: '25000', suffix: '+', label: 'happy customers' }), it({ icon: 'package', value: '1200', suffix: '+', label: 'products in stock' }), it({ icon: 'map-pin', value: '64', suffix: '', label: 'districts we deliver to' }), it({ icon: 'star', value: '4.8', suffix: '/5', label: 'average rating' })] };
  }
  if (type === 'gallery' && !(s.items || []).length) {
    return { items: [PHOTO.watch, '/assets/products/iphone-18-pro.webp', PHOTO.anc, '/assets/products/macbook-neo.webp', PHOTO.cooler, '/assets/products/redmi-turbo-4-pro.webp'].map((image) => it({ image, caption: '', href: 'https://instagram.com/dazzleshopbd' })) };
  }
  if (type === 'trust' && !(s.items || []).length) {
    return { items: [it({ icon: 'truck', title: 'Delivery across Bangladesh', text: '1–2 days in Dhaka' }), it({ icon: 'banknote', title: 'Cash on delivery', text: 'Pay when it arrives' }), it({ icon: 'shield-check', title: 'Official warranty', text: 'On every device' }), it({ icon: 'rotate-ccw', title: '7-day return', text: 'If something is wrong' })] };
  }
  if (type === 'faq' && !(s.items || []).length) {
    return { items: [
      { q: 'Are your phones official?', a: 'Yes. Every phone comes from the brand’s official importer, sealed, with the official warranty card.' },
      { q: 'How long does delivery take?', a: '1–2 days inside Dhaka and 3–5 days elsewhere in Bangladesh.' },
      { q: 'Can I pay on delivery?', a: 'Yes. Check the parcel in front of the rider, then pay in cash. bKash, Nagad and cards work too.' },
      { q: 'Where do I claim the warranty?', a: 'At our Dhanmondi or Mirpur shop, or the brand’s service centre. Bring the receipt or the order number.' }] };
  }
  return {};
}
export function premiumHome(sections) {
  const pool = (sections || []).slice();
  const out = [];
  premiumPlan().forEach(([type, patch]) => {
    const i = pool.findIndex((s) => s.type === type);
    const base = i >= 0 ? pool.splice(i, 1)[0] : newSection(type);
    const fill = premiumContent(type, base);
    out.push({ ...base, ...patch, ...fill, hidden: false });
  });
  // a theme's own main section stays where the layout needs it; every other kind waits, hidden
  pool.forEach((s) => out.push(s.type === 'main' ? s : { ...s, hidden: true }));
  return out;
}
