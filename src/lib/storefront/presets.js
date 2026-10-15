// storefront/presets — the one-click demos (A6): Signal (electronics, matches Dazzle Shop), Nokshi (fashion),
// Counter (grocery / retail) and the eight theme-pack looks (presetsPack.js: GhorPure, NovaByte, NaturaNest, Haatly,
// Rupkotha, GlowMuse, Voltiva, GizmoLane), from the super admin's theme families. Each preset sets theme settings, 3–4 ready headers,
// layouts made of sections, HTML blocks, the menus (with a mega menu) and a sample page.
//
//   PRESETS · presetBy(id) · PARTS · STORE_IMAGES
//   seedData(now, id = 'signal') — a whole storefront store made from a preset, published (first open)
//   whatWillChange(id, parts) → [{ part, label, replaces[], adds[] }] — shown before an import
//   importPreset(id, parts) — makes a restore point first, then replaces the chosen parts; products, customers and
//                             orders are never touched. parts: { theme, header, layouts, blocks, menus, pages }
//   resetThemeToPreset() — the current preset's theme settings back into the draft (Customize › Reset to preset)
// Pictures are the shop's own (public/assets). Front end only.

import { newDoc, read, update, makeRestorePoint, SF_VERSION, sfId } from './store';
import { brandDefaults, DEFAULTS as THEME_DEFAULTS } from './theme';
import { headerFromSpec } from './headers';
import { newSection, slide, layoutFromSpec } from './layouts';
import { newBlock } from '../blog';
import { getMenus, setMenus, STORE_MENUS_EVENT } from '../storeMenus';
import { getPages, savePage } from '../storePages';
import { PACK, isPack, packTheme, packHeaders, packLayouts, packMenu, PACK_DEFAULT_HEADER } from './presetsPack';
import { premiumHome, completeHome } from './completeHome';

/** The premium look's global settings (theme values a store saved before version 5 is given once). */
export const PREMIUM_LOOK = { fontPair: 'jakarta', titleStyle: 'underline', cardStyle: 'classic', cardHover: 'second', cardRating: true, saleBadge: 'percent', badgeStyle: 'pill', shadow: 'soft', motion: 'lively', btnHover: 'lift', fieldStyle: 'filled', iconStyle: 'circle', iconColour: 'primary', socialStyle: 'round', sectionCard: 'page', spacing: 'comfortable', corners: 'soft', bg: '#f6f7fb', surface: '#ffffff', headerTone: 'light', footerLayout: 'columns', footerTone: 'dark', cardWish: true, cardQuickView: true, stockBar: true, soldCount: true, saleTimer: true, boughtTogether: true, trust: true };
export const STORE_IMAGES = [
  { src: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', label: 'Phone accessories counter' },
  { src: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp', label: 'Packing an online order' },
  { src: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', label: 'Online seller with a parcel' },
  { src: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp', label: 'Seller filming a product' },
];
const [IMG_SHOP, IMG_PACK, IMG_STYLE, IMG_CREATOR] = STORE_IMAGES.map((x) => x.src);

export const PARTS = [
  { key: 'theme', label: 'Theme settings', hint: 'Colours, fonts, product card, product and category pages, footer, extras' },
  { key: 'header', label: 'Headers', hint: 'The preset’s ready headers; its main one becomes the default' },
  { key: 'layouts', label: 'Layouts', hint: 'Home, product, category, page, cart, search and page-not-found layouts' },
  { key: 'blocks', label: 'HTML blocks', hint: 'Delivery info, size guide, warranty info, Eid banner, footer' },
  { key: 'menus', label: 'Menus', hint: 'Header menu with a mega menu, footer menus' },
  { key: 'pages', label: 'Sample pages', hint: 'One ready page (added, or replaced when the address is the same)' },
];

export const PRESETS = [
  { id: 'signal', name: 'Signal', family: 'signal', label: 'Electronics', tagline: 'Specification tables that stay readable on a phone.', accent: '#0070a0', image: IMG_SHOP },
  { id: 'nokshi', name: 'Nokshi', family: 'nokshi', label: 'Clothing and fashion', tagline: 'Large imagery for products people want to look at.', accent: '#7c3aed', image: IMG_STYLE },
  { id: 'counter', name: 'Counter', family: 'counter', label: 'Grocery and retail', tagline: 'Dense catalogue browsing for shops with a lot of lines.', accent: '#15803d', image: IMG_PACK },
  // the eight ready themes from the owner's reference stores (presetsPack.js)
  ...PACK.map((x) => ({ ...x, image: x.logo })),
];
export const presetBy = (id) => PRESETS.find((p) => p.id === id) || PRESETS[0];

// ---- content helpers --------------------------------------------------------------------------------------------------
const P = (text) => ({ ...newBlock('p'), text });
const H2 = (text) => ({ ...newBlock('h2'), text });
const L = (items) => ({ ...newBlock('list'), items, ordered: false });
const T = (rows) => ({ ...newBlock('table'), header: true, rows });
const IMG = (src, alt, caption = '') => ({ ...newBlock('image'), src, alt, caption });
const BTN = (label, url) => ({ ...newBlock('cta'), label, url, style: 'solid' });
const blk = (id, name, type, blocks, now) => ({ id, name, type, blocks, updatedAt: now });

function blocksFor(id, now) {
  const pre = 'blk-' + id + '-';
  const common = [
    blk(pre + 'delivery', 'Delivery info', 'content', [H2('Delivery'), L(['Inside Dhaka: 1–2 days, ৳70', 'Outside Dhaka: 3–5 days, ৳150', 'Cash on delivery all over Bangladesh']), P('Open the parcel in front of the rider. If something is wrong, give it back right there.')], now),
    blk(pre + 'eid', 'Eid banner', 'banner', [IMG(id === 'nokshi' ? IMG_STYLE : IMG_PACK, 'Eid offer'), H2('Eid offer: gifts on orders over ৳3,000'), BTN('See the offers', '/offers')], now),
  ];
  if (id === 'signal') return [
    ...common,
    blk(pre + 'warranty', 'Warranty info', 'tab', [H2('Warranty'), P('Every phone comes with the brand’s official warranty. Accessories have a 6-month shop warranty.'), L(['Keep your invoice or order number', 'Bring it to Dhanmondi or Mirpur branch', 'We tell you the cost before any paid repair'])], now),
    blk(pre + 'size', 'Size guide', 'tab', [H2('Which case fits?'), T([['Phone', 'Case size'], ['Galaxy A15 / A25', '6.5 in'], ['Redmi Note 13', '6.67 in'], ['iPhone 15', '6.1 in']])], now),
    blk(pre + 'deals', 'Phone deals', 'mega', [H2('This week'), P('Up to ৳5,000 off selected 5G phones. EMI from 3 months on bank cards.'), BTN('See phone deals', '/offers')], now),
    blk(pre + 'footer', 'Footer', 'footer', [P('**Dazzle Shop** · official phones, accessories and repairs · Dhanmondi and Mirpur'), P('Call 01811-843300 · hello@dazzleshop.com.bd')], now),
  ];
  if (id === 'nokshi') return [
    ...common,
    blk(pre + 'size', 'Size guide', 'tab', [H2('Size guide'), T([['Size', 'Chest (in)', 'Length (in)'], ['S', '36', '40'], ['M', '38', '41'], ['L', '40', '42'], ['XL', '42', '43']]), P('Between two sizes? Take the larger one.')], now),
    blk(pre + 'warranty', 'Warranty info', 'tab', [H2('Exchange'), P('Exchange within 7 days if the tag is on and the piece is unworn.')], now),
    blk(pre + 'deals', 'New season', 'mega', [IMG(IMG_STYLE, 'New season'), P('The festive edit is in. Hand-finished pieces, limited runs.')], now),
    blk(pre + 'footer', 'Footer', 'footer', [P('Made with care in Bangladesh. Exchange within 7 days.'), P('Call 01811-843300')], now),
  ];
  return [
    ...common,
    blk(pre + 'size', 'Size guide', 'tab', [H2('Pack sizes'), T([['Pack', 'Pieces'], ['Small', '1'], ['Family', '3'], ['Value', '6']])], now),
    blk(pre + 'warranty', 'Warranty info', 'tab', [H2('Fresh or your money back'), P('Not happy with an item? Tell the rider or call us the same day.')], now),
    blk(pre + 'deals', 'Today’s deals', 'mega', [H2('Today’s deals'), P('New prices every morning at 9.'), BTN('See deals', '/offers')], now),
    blk(pre + 'footer', 'Footer', 'footer', [P('Delivery in 2 hours inside Dhaka · Cash on delivery'), P('Call 01811-843300')], now),
  ];
}

// ---- theme settings -----------------------------------------------------------------------------------------------
function themeFor(id) {
  if (isPack(id)) return packTheme(id, THEME_DEFAULTS);
  const brand = brandDefaults();
  if (id === 'nokshi') return { ...THEME_DEFAULTS, primary: '#6d28d9', accent: '#db2777', text: '#1f1630', bg: '#fbf8f4', surface: '#ffffff', sale: '#be123c', productLayout: 'centered', aboutStyle: 'magazine', contactStyle: 'split', policyStyle: 'document', blogStyle: 'masonry', postStyle: 'magazine', headerTone: 'light', fontPair: 'bodoni', baseSize: 'M', headCase: 'upper', width: 'boxed', corners: 'sharp', buttons: 'outline', spacing: 'comfortable', cardRatio: 'portrait', cardHover: 'second', cardRating: true, cardStock: false, cardQuick: false, saleBadge: 'text', gallery: 'grid', showWarranty: false, showEmi: false, specsTable: false, reviewsPos: 'below', tabBlock: 'blk-nokshi-size', colsDesktop: '3', colsPhone: '2', filters: 'drawer', sortDefault: 'newest', paging: 'infinite', freeShipAt: 2500, footerSource: 'layout', footerLayout: 'centered', footerTone: 'light', chat: 'messenger', chatTo: 'dazzleshopbd', announceText: 'Free delivery on orders over ৳2,500', announceTone: 'primary', cookie: true };
  if (id === 'counter') return { ...THEME_DEFAULTS, primary: '#15803d', accent: '#f59e0b', text: '#14281d', bg: '#f4f7f2', surface: '#ffffff', sale: '#dc2626', productLayout: 'compact', aboutStyle: 'split', contactStyle: 'cards', policyStyle: 'accordion', blogStyle: 'list', postStyle: 'classic', headerTone: 'brand', fontPair: 'lexend', baseSize: 'M', headCase: 'normal', width: 'full', corners: 'round', buttons: 'solid', spacing: 'compact', cardRatio: 'square', cardHover: 'none', cardRating: false, cardStock: true, cardQuick: true, saleBadge: 'percent', gallery: 'side', showWarranty: false, showEmi: false, specsTable: false, reviewsPos: 'tab', tabBlock: '', colsDesktop: '5', colsPhone: '2', filters: 'top', sortDefault: 'best', perPage: '36', paging: 'infinite', freeShipAt: 1000, footerLayout: 'simple', footerTone: 'dark', chat: 'whatsapp', announceText: 'Delivery in 2 hours inside Dhaka', announceTone: 'dark' };
  return { ...THEME_DEFAULTS, ...PREMIUM_LOOK, primary: brand.primary, accent: brand.accent, text: '#0f172a', bg: '#f6f7fb', surface: '#ffffff', sale: '#dc2626', productLayout: 'classic', aboutStyle: 'story', contactStyle: 'cards', policyStyle: 'sidebar', blogStyle: 'grid', postStyle: 'classic', headerTone: 'light', fontPair: 'jakarta', width: 'boxed', corners: 'soft', buttons: 'solid', spacing: 'comfortable', showEmi: true, emiMonths: '6', reviewsPos: 'tab', tabBlock: 'blk-signal-warranty', colsDesktop: '4', filters: 'left', freeShipAt: 5000, footerLayout: 'columns', footerTone: 'dark', announceTone: 'primary' };
}

// ---- headers ------------------------------------------------------------------------------------------------------
// row spec: [height, tone, sticky, left[], center[], right[]]; an element: 'type' or ['type', { settings }]
function headersFor(id, now) {
  const H = (hid, name, spec) => ({ id: 'hdr-' + id + '-' + hid, name, doc: newDoc(headerFromSpec(spec), true, now), updatedAt: now });
  const phone = ['phone', { label: 'Hotline', number: '01811-843300' }];
  if (isPack(id)) return packHeaders(id, H);
  if (id === 'nokshi') return [
    H('centered', 'Nokshi · Centred logo', {
      desktop: { top: [34, 'accent', false, [], [['text', { text: 'Exchange within 7 days · hand-finished pieces' }]], ['lang']], main: [80, 'theme', true, [['search', { cats: false, size: 'S', placeholder: 'Search the collection' }]], [['logo', { size: 'L' }]], ['account', 'wishlist', 'cart']], bottom: [46, 'theme', false, [], ['menu'], []] },
      mobile: { main: [58, 'theme', true, [], [['logo', { size: 'M' }]], ['cart']], drawer: ['search', 'menu', 'account', 'lang', 'social'], navItems: ['home', 'cats', 'wishlist', 'cart', 'account'] },
    }),
    H('minimal', 'Nokshi · Minimal', {
      desktop: { main: [72, 'theme', true, ['logo'], ['menu'], [['search', { cats: false, size: 'S' }], 'cart']] },
      mobile: { main: [56, 'theme', true, ['logo'], [], ['cart']], drawer: ['search', 'menu', 'account'], bottomNav: false },
    }),
    H('lookbook', 'Nokshi · Lookbook', {
      desktop: { main: [76, 'brand', true, ['menu'], [['logo', { size: 'L' }]], ['wishlist', 'cart']] },
      mobile: { main: [58, 'brand', true, [], ['logo'], ['cart']], drawer: ['menu', 'search', 'account', 'social'] },
    }),
  ];
  if (id === 'counter') return [
    H('shop', 'Counter · Shop', {
      desktop: { top: [34, 'dark', false, [['text', { text: 'Delivery in 2 hours inside Dhaka' }]], [], [phone, 'lang']], main: [72, 'theme', true, ['logo'], [['search', { cats: true, size: 'L', placeholder: 'Search 2,000+ items' }]], ['account', ['cart', { total: true }]]], bottom: [44, 'light', false, ['catmenu'], ['menu'], []] },
      mobile: { main: [56, 'theme', true, ['logo'], [], [['cart', { total: true }]]], bottom: [52, 'theme', true, [], [['search', { cats: false, size: 'L' }]], []], drawer: ['catmenu', 'menu', 'account', 'phone', 'lang'], navItems: ['home', 'cats', 'search', 'cart', 'account'] },
    }),
    H('simple', 'Counter · Simple', {
      desktop: { main: [68, 'theme', true, ['logo', 'catmenu'], [['search', { cats: false, size: 'M' }]], ['cart']] },
      mobile: { main: [56, 'theme', true, ['logo'], [], ['search', 'cart']], drawer: ['catmenu', 'menu', 'account'] },
    }),
    H('quick', 'Counter · Quick order', {
      desktop: { top: [34, 'accent', false, [], [['text', { text: 'Order before 6 PM for same-day delivery' }]], []], main: [68, 'theme', true, ['logo'], [['search', { cats: true, size: 'L' }]], [['whatsapp', { label: 'Order on WhatsApp', number: '8801811843300' }], 'cart']] },
      mobile: { main: [56, 'theme', true, ['logo'], [], ['whatsapp', 'cart']], drawer: ['search', 'catmenu', 'menu'] },
    }),
  ];
  return [
    H('classic', 'Signal · Classic', {
      desktop: { top: [36, 'dark', false, [['text', { text: 'Official warranty on every phone' }]], [], [phone, 'divider', 'lang']], main: [76, 'theme', true, ['logo'], [['search', { cats: true, size: 'L' }]], ['account', 'wishlist', 'compare', 'cart']], bottom: [48, 'theme', false, ['catmenu'], ['menu'], [['button', { label: 'Today’s offers', href: '/offers', style: 'outline' }]]] },
      mobile: { main: [58, 'theme', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'catmenu', 'menu', 'account', 'lang', 'phone', 'social'], navItems: ['home', 'cats', 'cart', 'account'] },
    }),
    H('compact', 'Signal · Compact', {
      desktop: { main: [68, 'theme', true, ['logo'], ['menu'], [['search', { cats: false, size: 'S' }], 'account', 'cart']] },
      mobile: { main: [56, 'theme', true, ['logo'], [], ['cart']], drawer: ['search', 'menu', 'account', 'lang'] },
    }),
    H('campaign', 'Signal · Campaign', {
      desktop: { top: [36, 'brand', false, [], [['text', { text: 'Flash sale: up to 20% off chargers and earbuds' }]], []], main: [72, 'theme', true, ['logo'], ['menu'], [['whatsapp', { label: 'WhatsApp', number: '8801811843300' }], 'cart']] },
      mobile: { top: [32, 'brand', false, [], [['text', { text: 'Flash sale today' }]], []], main: [56, 'theme', true, ['logo'], [], ['whatsapp', 'cart']], drawer: ['search', 'menu', 'phone'] },
    }),
    H('centered', 'Signal · Centred logo', {
      desktop: { main: [80, 'theme', true, ['menu'], [['logo', { size: 'L' }]], [['search', { cats: false, size: 'S' }], 'account', 'cart']] },
      mobile: { main: [58, 'theme', true, [], ['logo'], ['cart']], drawer: ['search', 'menu', 'account', 'lang'] },
    }),
  ];
}
const defaultHeaderOf = (id) => (isPack(id) ? PACK_DEFAULT_HEADER(id) : { signal: 'hdr-signal-classic', nokshi: 'hdr-nokshi-centered', counter: 'hdr-counter-shop' }[id] || 'hdr-signal-classic');

// ---- layouts ------------------------------------------------------------------------------------------------------
function layoutsFor(id, now) {
  const S = newSection;
  const lay = (lid, kind, name, sections, extra = {}) => layoutFromSpec({ id: 'lay-' + id + '-' + lid, kind, name, sections, ...extra }, now);
  const tail = [
    lay('page', 'page', 'Page', [S('main'), S('trust')]),
    lay('cart', 'cart', 'Cart', [S('main'), S('products', { title: 'Add to your order', source: 'best', count: 4 })]),
    lay('search', 'search', 'Search', [S('main'), S('recent')]),
    lay('404', '404', 'Page not found', [S('main'), S('products', { title: 'Popular right now', source: 'best', count: 4 })]),
  ];
  if (isPack(id)) return packLayouts(id, { S, lay, slide, tail, img: [IMG_SHOP, IMG_PACK, IMG_STYLE, IMG_CREATOR] });
  if (id === 'nokshi') return [
    lay('home', 'home', 'Home', [
      S('hero', { height: 'L', slides: [slide('The festive edit', 'Hand-finished pieces in small runs.', 'Shop new arrivals', '/category?handle=accessories', IMG_STYLE, 'dark'), slide('Free delivery over ৳2,500', 'Exchange within 7 days.', 'See offers', '/offers', '', 'primary')] }),
      S('cattiles', { title: 'Shop the edit', style: 'circles', count: 6 }),
      S('products', { title: 'New this week', source: 'new', count: 6, layout: 'grid' }),
      S('textimage', { title: 'Made to be looked at', text: 'Every piece is photographed in daylight so the colour you see is the colour you get.', image: IMG_CREATOR, side: 'left', button: 'Read our story', href: '/page?handle=about-us' }),
      S('products', { title: 'On sale', source: 'sale', count: 8, layout: 'carousel' }),
      S('reviews', { title: 'Loved by customers', count: 3 }),
      S('html', { block: 'blk-nokshi-eid' }),
      S('newsletter', { title: 'First look at new drops', text: 'One message a week. No spam.', button: 'Join' }),
    ]),
    lay('product', 'product', 'Product page', [S('main'), S('products', { title: 'Complete the look', source: 'related', count: 4 }), S('recent')]),
    lay('category', 'category', 'Category page', [S('main'), S('newsletter', { title: 'Get new drops first', text: 'One message a week.', button: 'Join' })]),
    ...tail,
  ];
  if (id === 'counter') return [
    lay('home', 'home', 'Home', [
      S('cattiles', { title: 'Shop by aisle', style: 'tiles', count: 10 }),
      S('countdown', { title: 'Today’s flash sale' }),
      S('products', { title: 'Best sellers', source: 'best', count: 10, layout: 'grid' }),
      S('offer', { title: 'Free delivery over ৳1,000', text: 'Inside Dhaka, every day.', button: 'Start shopping', href: '/search?q=', image: IMG_PACK }),
      S('products', { title: 'Accessories', source: 'category', cat: 'Accessories', count: 10, layout: 'carousel' }),
      S('products', { title: 'Just in', source: 'new', count: 10, layout: 'grid' }),
      S('brands', { title: 'Brands we stock', count: 10 }),
      S('trust'),
    ]),
    lay('product', 'product', 'Product page', [S('main'), S('products', { title: 'Often bought together', source: 'related', count: 5 })]),
    lay('category', 'category', 'Category page', [S('main')]),
    ...tail,
  ];
  return [
    lay('home', 'home', 'Home', [
      S('hero', { height: 'M', slides: [slide('Official phones with real warranty', 'Galaxy, Redmi, Realme and iPhone · EMI from 3 months.', 'Shop phones', '/category?handle=phones', IMG_SHOP, 'dark'), slide('Chargers and earbuds on sale', 'Up to 20% off this week.', 'See offers', '/offers', '', 'primary')] }),
      S('cattiles', { title: 'Shop by category', style: 'tiles', count: 6 }),
      S('products', { title: 'New arrivals', source: 'new', count: 8, layout: 'grid' }),
      S('countdown', { title: 'Flash sale' }),
      S('products', { title: 'Best sellers', source: 'best', count: 8, layout: 'carousel' }),
      S('offer', { title: 'Trade in your old phone', text: 'Bring it to Dhanmondi or Mirpur and get up to ৳8,000 off a new one.', button: 'Find a branch', href: '/page?handle=contact-us', image: IMG_SHOP }),
      S('brands', { title: 'Official brands', count: 8 }),
      S('reviews', { title: 'What customers say', count: 3 }),
      S('blog', { title: 'Guides and news', count: 3 }),
      S('trust'),
    ]),
    lay('product', 'product', 'Product page', [S('main'), S('products', { title: 'You may also like', source: 'related', count: 4 }), S('recent')]),
    lay('category', 'category', 'Category page', [S('main')]),
    lay('phones', 'category', 'Phones category', [S('html', { block: 'blk-signal-deals' }), S('main'), S('faq', { title: 'Buying a phone', items: [{ q: 'Is the warranty official?', a: 'Yes. Every phone is the official Bangladesh version with the brand’s warranty.' }, { q: 'Can I pay in instalments?', a: 'Yes, EMI from 3 to 12 months on most bank credit cards.' }] })], { cond: { type: 'category', ref: 'Phones' } }),
    ...tail,
  ];
}

// ---- menus --------------------------------------------------------------------------------------------------------
const mi = (label, link, children = [], mega = null) => ({ id: sfId('mi'), label, link, children, ...(mega ? { mega } : {}) });
const cat = (ref) => ({ type: 'category', ref });
const pg = (ref) => ({ type: 'page', ref });
// every theme's header menu ends with the blog (unless the theme lists it itself)
function menusFor(id) {
  const list = themeMenus(id);
  const has = (items) => (items || []).some((it) => (it.link && it.link.type === 'blog') || has(it.children));
  return list.map((m) => (m.place === 'header' && !has(m.items) ? { ...m, items: [...m.items, mi('Blog', { type: 'blog', ref: '' })] } : m));
}
function themeMenus(id) {
  const col = (kind, extra) => ({ id: sfId('col'), kind, ...extra });
  const phonesMega = { on: true, width: 'container', px: 960, cols: [col('cats', { title: 'Phones', ref: 'Phones' }), col('links', { title: 'Popular' }), col('block', { title: '', block: 'blk-' + id + '-deals' }), col('image', { title: 'Trade in', src: IMG_SHOP, href: '/page?handle=contact-us' })], promo: null };
  const accMega = { on: true, width: 'full', px: 1200, cols: [col('cats', { title: 'Accessories', ref: 'Accessories' }), col('cats', { title: 'Audio', ref: 'Audio' }), col('image', { title: 'Delivery all over Bangladesh', src: IMG_PACK, href: '/offers' })], promo: null };
  const footer = [
    { id: 'footer', name: 'Footer menu', place: 'footer', fixed: true, items: [
      mi('Shop', { type: 'home' }, [mi('Phones', cat('Phones')), mi('Accessories', cat('Accessories')), mi('Offers', { type: 'offers' }), mi('Blog', { type: 'blog', ref: '' })]),
      mi('Company', pg('pg-about'), [mi('About us', pg('pg-about')), mi('Contact us', pg('pg-contact'))]),
    ] },
    { id: 'care', name: 'Customer care', place: 'footer', fixed: false, items: [mi('Shipping & delivery', pg('pg-shipping')), mi('Return & refund', pg('pg-returns')), mi('Privacy policy', pg('pg-privacy')), mi('WhatsApp us', { type: 'url', url: 'https://wa.me/8801811843300' })] },
  ];
  const packItems = packMenu(id, { mi, cat, pg, accMega, phonesMega });
  if (packItems) return [{ id: 'main', name: 'Main menu', place: 'header', fixed: true, items: packItems }, ...footer];
  if (id === 'nokshi') return [
    { id: 'main', name: 'Main menu', place: 'header', fixed: true, items: [
      mi('New in', { type: 'home' }),
      mi('Accessories', cat('Accessories'), [mi('Cases & covers', cat('Accessories › Cases & covers')), mi('Holders & stands', cat('Accessories › Holders & stands'))], { ...accMega, cols: [col('cats', { title: 'Accessories', ref: 'Accessories' }), col('block', { block: 'blk-nokshi-deals' }), col('image', { title: 'The festive edit', src: IMG_STYLE, href: '/offers' })] }),
      mi('Wearables', cat('Wearables')),
      mi('Sale', { type: 'offers' }),
      mi('Our story', pg('pg-about')),
    ] },
    ...footer,
  ];
  if (id === 'counter') return [
    { id: 'main', name: 'Main menu', place: 'header', fixed: true, items: [
      mi('Home', { type: 'home' }),
      mi('All aisles', cat('Accessories'), [mi('Chargers & cables', cat('Accessories › Chargers & cables')), mi('Batteries', cat('Accessories › Batteries')), mi('Power banks', cat('Power banks'))], { ...accMega, cols: [col('cats', { title: 'Accessories', ref: 'Accessories' }), col('cats', { title: 'Audio', ref: 'Audio' }), col('links', { title: 'Quick picks' }), col('block', { block: 'blk-counter-deals' })] }),
      mi('Deals', { type: 'offers' }),
      mi('Delivery areas', { type: 'url', url: '/page?handle=delivery-areas' }),
    ] },
    ...footer,
  ];
  return [
    { id: 'main', name: 'Main menu', place: 'header', fixed: true, items: [
      mi('Home', { type: 'home' }),
      mi('Phones', cat('Phones'), [mi('Smartphones', cat('Phones › Smartphones')), mi('Feature phones', cat('Phones › Feature phones'))], phonesMega),
      mi('Accessories', cat('Accessories'), [mi('Cases & covers', cat('Accessories › Cases & covers')), mi('Chargers & cables', cat('Accessories › Chargers & cables')), mi('Holders & stands', cat('Accessories › Holders & stands'))], accMega),
      mi('Audio', cat('Audio')),
      mi('Offers', { type: 'offers' }),
    ] },
    ...footer,
  ];
}

// ---- sample pages ---------------------------------------------------------------------------------------------------
function pagesFor(id) {
  if (id === 'nokshi') return [{ handle: 'size-guide', title: 'Size guide', blocks: [P('Measure a piece you love and compare it with the table.'), T([['Size', 'Chest (in)', 'Length (in)'], ['S', '36', '40'], ['M', '38', '41'], ['L', '40', '42'], ['XL', '42', '43']]), P('Between two sizes? Take the larger one. Exchange within 7 days.')] }];
  if (id === 'counter') return [{ handle: 'delivery-areas', title: 'Delivery areas', blocks: [P('We deliver every day from 9 AM to 9 PM.'), T([['Area', 'Time', 'Charge'], ['Inside Dhaka', '2 hours', '৳60'], ['Savar, Gazipur, Narayanganj', 'Same day', '৳100'], ['Outside Dhaka', '2–3 days', '৳150']]), P('Free delivery inside Dhaka on orders over ৳1,000.')] }];
  return [{ handle: 'emi-plans', title: 'EMI plans', blocks: [P('Pay for a phone in monthly parts with a bank credit card. No extra charge for 3 and 6 months.'), T([['Months', 'Extra charge', 'Banks'], ['3', 'None', 'City, BRAC, EBL, Dutch-Bangla'], ['6', 'None', 'City, BRAC, EBL'], ['12', '6%', 'City, BRAC']]), P('Choose EMI at checkout or ask at a branch.')] }];
}

// ---- the whole store from a preset ----------------------------------------------------------------------------------
/** A storefront store made from a preset (all parts published). */
export function seedData(now = Date.now(), id = 'signal') {
  const p = presetBy(id);
  const blocks = blocksFor(p.id, now);
  return {
    v: SF_VERSION, preset: p.id,
    theme: newDoc(themeFor(p.id), true, now),
    headers: headersFor(p.id, now), defaultHeader: defaultHeaderOf(p.id),
    blocks, layouts: p.id === 'signal' ? premiumHomes(fullHomes(layoutsFor(p.id, now), blocks)) : fullHomes(layoutsFor(p.id, now), blocks), restore: [],
  };
}

// every home layout carries every kind of section (completeHome.js): the theme's own first, the rest at their place
const HOME_IMAGES = [IMG_SHOP, IMG_PACK, IMG_STYLE, IMG_CREATOR];
const fillHome = (doc, blocks) => (doc ? { ...doc, sections: completeHome(doc.sections, { images: HOME_IMAGES, blocks }) } : doc);
function fullHomes(layouts, blocks) {
  return layouts.map((l) => {
    if (l.kind !== 'home' || !l.doc) return l;
    const draft = fillHome(l.doc.draft, blocks);
    // a published home that matched its draft gets the same new sections (same ids), so nothing shows as unpublished
    const same = l.doc.live && JSON.stringify(l.doc.live) === JSON.stringify(l.doc.draft);
    return { ...l, doc: { ...l.doc, draft, live: same ? JSON.parse(JSON.stringify(draft)) : fillHome(l.doc.live, blocks) } };
  });
}
/** Signal's home as the premium running shop (completeHome.js › premiumHome); draft and live get the same sections. */
function premiumHomes(layouts) {
  return layouts.map((l) => {
    if (l.kind !== 'home' || !l.doc) return l;
    const draft = { ...l.doc.draft, sections: premiumHome((l.doc.draft || {}).sections) };
    return { ...l, doc: { ...l.doc, draft, live: JSON.parse(JSON.stringify(draft)) } };
  });
}
// the fonts each look shipped with before the per-theme pairs (Oct 2026)
const OLD_FONT = { signal: 'poppins', nokshi: 'elegant', counter: 'friendly', naturanest: 'friendly' };
/** A store saved before version 3: the home gets the sections it lacks and the shop's banners (completeHome.js); a store
 *  from version 1 still on its look's old font gets the new pair. */
export function upgradeData(data) {
  const d = JSON.parse(JSON.stringify(data));
  const id = d.preset || 'signal';
  const was = OLD_FONT[id] || 'inter';
  const want = themeFor(id).fontPair;
  if (d.v === 1) ['draft', 'live'].forEach((k) => { const t = d.theme && d.theme[k]; if (t && (t.fontPair || 'poppins') === was && want) t.fontPair = want; });
  if (d.v < 3) d.layouts = fullHomes(d.layouts || [], d.blocks || []);
  // version 5: Signal's home becomes the premium running shop, with its global settings (once)
  if (d.v < 5 && id === 'signal') {
    d.layouts = premiumHomes(fullHomes(d.layouts || [], d.blocks || []));
    ['draft', 'live'].forEach((k) => { if (d.theme && d.theme[k]) d.theme[k] = { ...d.theme[k], ...PREMIUM_LOOK }; });
  }
  d.v = SF_VERSION;
  return d;
}

/** What an import would change, part by part. */
export function whatWillChange(id, parts = {}) {
  const p = presetBy(id);
  const d = read();
  const out = [];
  if (parts.theme) out.push({ part: 'theme', label: 'Theme settings', replaces: ['Your colours, fonts and page options' + (d.preset ? ` (now from ${presetBy(d.preset).name})` : '')], adds: [] });
  if (parts.header) {
    const ids = new Set(headersFor(p.id, 0).map((h) => h.id));
    const names = headersFor(p.id, 0).map((h) => h.name);
    out.push({ part: 'header', label: 'Headers', replaces: (d.headers || []).filter((h) => ids.has(h.id)).map((h) => h.name), adds: names.filter((n) => !(d.headers || []).some((h) => h.name === n)), note: `${names[0]} becomes the default header` });
  }
  if (parts.layouts) out.push({ part: 'layouts', label: 'Layouts', replaces: (d.layouts || []).map((l) => l.name), adds: layoutsFor(p.id, 0).map((l) => l.name) });
  if (parts.blocks) {
    const bl = blocksFor(p.id, 0);
    out.push({ part: 'blocks', label: 'HTML blocks', replaces: (d.blocks || []).filter((b) => bl.some((x) => x.id === b.id)).map((b) => b.name), adds: bl.filter((x) => !(d.blocks || []).some((b) => b.id === x.id)).map((b) => b.name) });
  }
  if (parts.menus) { let ms = []; try { ms = getMenus(); } catch { ms = []; } out.push({ part: 'menus', label: 'Menus', replaces: ms.map((m) => m.name), adds: [] }); }
  if (parts.pages) {
    let pages = []; try { pages = getPages(); } catch { pages = []; }
    const sp = pagesFor(p.id);
    out.push({ part: 'pages', label: 'Sample pages', replaces: sp.filter((x) => pages.some((pg2) => pg2.handle === x.handle)).map((x) => x.title), adds: sp.filter((x) => !pages.some((pg2) => pg2.handle === x.handle)).map((x) => x.title) });
  }
  return out;
}

/** Import a preset's chosen parts (a restore point is made first). Returns { ok, point, parts: [labels] }. */
export function importPreset(id, parts = {}) {
  const p = presetBy(id);
  const picked = PARTS.filter((x) => parts[x.key]);
  if (!picked.length) return { ok: false, error: 'Choose at least one part to import.' };
  const point = makeRestorePoint(`Before importing ${p.name}`, { content: !!(parts.menus || parts.pages), kind: 'import' });
  const now = Date.now();
  update((d) => {
    const bl = blocksFor(p.id, now);
    if (parts.theme) d.theme = newDoc(themeFor(p.id), true, now);
    if (parts.header) {
      const hs = headersFor(p.id, now);
      d.headers = [...hs, ...(d.headers || []).filter((h) => !hs.some((x) => x.id === h.id))];
      d.defaultHeader = defaultHeaderOf(p.id);
    }
    if (parts.layouts) d.layouts = fullHomes(layoutsFor(p.id, now), d.blocks || blocksFor(p.id, now));
    // blocks: the chosen ones, plus any block the imported parts point at that the shop does not have yet
    const want = parts.blocks ? bl : bl.filter((b) => (parts.theme || parts.layouts || parts.header || parts.menus) && !(d.blocks || []).some((x) => x.id === b.id));
    d.blocks = [...want, ...(d.blocks || []).filter((b) => !want.some((x) => x.id === b.id))];
    d.preset = p.id;
  });
  if (parts.menus) setMenus(menusFor(p.id));
  if (parts.pages) {
    let pages = []; try { pages = getPages(); } catch { pages = []; }
    pagesFor(p.id).forEach((sp) => {
      const have = pages.find((x) => x.handle === sp.handle);
      const nowIso = new Date().toISOString();
      savePage({ ...(have || { id: 'pg-' + sp.handle, template: 'blank', createdAt: nowIso, noindex: false, seo: { title: '', description: '' } }), handle: sp.handle, title: sp.title, blocks: sp.blocks, status: 'published' });
    });
  }
  try { if (parts.menus) window.dispatchEvent(new CustomEvent(STORE_MENUS_EVENT)); } catch { /* ignore */ }
  return { ok: true, point, parts: picked.map((x) => x.label) };
}

/** Customize › Reset to preset: the preset's settings into the draft (Publish to make them live). */
export function resetThemeToPreset() {
  const d = read();
  const values = themeFor(d.preset || 'signal');
  update((x, now) => { x.theme = { ...x.theme, draft: values, draftAt: now }; });
  return values;
}
/** A preset's menus (a preset's live preview shows them instead of the shop's). */
export const presetMenus = (id) => menusFor(presetBy(id).id);
/** The preset's theme settings (for "Reset to preset" previews). */
export const presetThemeValues = (id) => themeFor(id);
