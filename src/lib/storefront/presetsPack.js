// storefront/presetsPack — the eight ready themes made from the owner's reference stores (docs/theme-research-oct-2026.md).
// Each takes a reference store's layout, sections and styles, with its own name, its own logo (public/assets/themes) and
// colours from that logo; the products are always the shop's own. presets.js lists them with Signal, Nokshi and Counter
// and asks this file for their theme settings, headers, layouts and main menu.
//
//   PACK · packTheme(id, base) · packHeaders(id, H) · packLayouts(id, kit) · packMenu(id, kit) · PACK_DEFAULT_HEADER
// Product pictures come from the shop; banners use the shop's own photos until the merchant uploads theirs (Files).

const L = (id) => '/assets/themes/' + id + '-logo.png';
const LL = (id) => '/assets/themes/' + id + '-logo-light.png';

export const PACK = [
  { id: 'ghorpure', name: 'GhorPure', family: 'ghorpure', label: 'Organic food and groceries', tagline: 'Warm grocery store: dark menu bar, horizontal best-seller cards, rows per category.', accent: '#c47a12' },
  { id: 'novabyte', name: 'NovaByte', family: 'novabyte', label: 'Computers and electronics', tagline: 'Big catalogue: dark header, icon category grid, deal panel with a countdown, key specs on cards.', accent: '#0b5cf0' },
  { id: 'naturanest', name: 'NaturaNest', family: 'naturanest', label: 'Natural products and wellness', tagline: 'Green and cream bands, gold Buy now buttons, best sellers with one big card.', accent: '#2f5d1e' },
  { id: 'haatly', name: 'Haatly', family: 'haatly', label: 'Trending lifestyle products', tagline: 'Bright and simple: edge-to-edge carousels, outline buttons, a flash-sale button in the menu.', accent: '#f05a3c' },
  { id: 'rupkotha', name: 'Rupkotha', family: 'rupkotha', label: 'Beauty, makeup and skincare', tagline: 'Banner-led beauty store: colour pill menu items, poster tiles, a big numbers band.', accent: '#7a1747' },
  { id: 'glowmuse', name: 'GlowMuse', family: 'glowmuse', label: 'Cosmetics and premium skincare', tagline: 'Clean beauty: chip menu, ringed categories, coupons, brand offers, a map of the shops.', accent: '#5b3a8c' },
  { id: 'voltiva', name: 'Voltiva', family: 'voltiva', label: 'Mobile accessories and gadgets', tagline: 'Black header, sections on white cards with pill titles, a must-have deal panel.', accent: '#0e9f9f' },
  { id: 'gizmolane', name: 'GizmoLane', family: 'gizmolane', label: 'Gadgets and lifestyle tech', tagline: 'Light grey page with white panels, coupons with Copy, a dark flash-deal panel.', accent: '#f26b1d' },
].map((p) => ({ ...p, logo: L(p.id), logoLight: LL(p.id), pack: true }));
export const isPack = (id) => PACK.some((p) => p.id === id);

/** Theme settings (on top of the defaults). */
export function packTheme(id, base) {
  const T = (x) => ({ ...base, ...x });
  switch (id) {
    case 'ghorpure': return T({ productLayout: 'classic', gallery: 'side', aboutStyle: 'story', contactStyle: 'cards', policyStyle: 'document', blogStyle: 'grid', postStyle: 'classic', checkoutStyle: 'grocery', checkoutMode: 'page', checkoutBump: false, advanceAmount: 200, productStyle: 'grocery', detailsStyle: 'pills', primary: '#c47a12', accent: '#2f6b1f', text: '#252a34', bg: '#f7f4ee', surface: '#ffffff', sale: '#e4572e', headerTone: 'light', fontPair: 'fraunces', width: 'boxed', corners: 'soft', buttons: 'solid', spacing: 'comfortable', cardStyle: 'bordered', cardButton: 'add', cardRatio: 'square', cardRating: false, titleStyle: 'underline', sectionCard: 'page', colsDesktop: '5', colsPhone: '2', filters: 'left', reviewsPos: 'tab', freeShipAt: 2000, footerLayout: 'brand', footerTone: 'light', footerApp: true, footerMarks: true, chat: 'messenger', chatTo: 'dazzleshopbd', chatStyle: 'round', floatCart: true, backTop: true, announce: false });
    case 'novabyte': return T({ productLayout: 'compact', gallery: 'below', aboutStyle: 'split', contactStyle: 'map', policyStyle: 'sidebar', blogStyle: 'list', postStyle: 'sidebar', checkoutStyle: 'specs', checkoutMode: 'page', checkoutBump: false, advanceAmount: 200, productStyle: 'specs', detailsStyle: 'pills', primary: '#1d4ed8', accent: '#f97316', text: '#111827', bg: '#f2f4f8', surface: '#ffffff', sale: '#dc2626', headerTone: 'dark', fontPair: 'archivo', width: 'boxed', corners: 'soft', buttons: 'solid', spacing: 'comfortable', cardStyle: 'spec', cardButton: 'buy', cardRatio: 'square', titleStyle: 'subtitle', sectionCard: 'page', colsDesktop: '5', colsPhone: '2', filters: 'left', specsTable: true, showEmi: true, emiMonths: '12', reviewsPos: 'tab', freeShipAt: 0, footerLayout: 'support', footerTone: 'dark', footerApp: true, chat: 'none', floatCart: true, backTop: false, announce: true, announceText: 'All our branches are open today, 10 AM – 9 PM · EMI up to 12 months', announceTone: 'primary' });
    case 'naturanest': return T({ productLayout: 'wide', gallery: 'below', aboutStyle: 'story', contactStyle: 'split', policyStyle: 'accordion', blogStyle: 'featured', postStyle: 'wide', checkoutStyle: 'quick', checkoutMode: 'popup', checkoutBump: true, advanceAmount: 200, productStyle: 'variants', detailsStyle: 'tabs', primary: '#2f5d1e', accent: '#d4a227', text: '#1f2a17', bg: '#fbf7ef', surface: '#ffffff', sale: '#c2410c', headerTone: 'brand', fontPair: 'youngserif', width: 'boxed', corners: 'soft', buttons: 'solid', spacing: 'comfortable', cardStyle: 'solid', cardButton: 'buy', cardRatio: 'square', cardRating: false, titleStyle: 'center', sectionCard: 'page', colsDesktop: '5', colsPhone: '2', filters: 'drawer', reviewsPos: 'below', freeShipAt: 2500, footerLayout: 'brand', footerTone: 'light', footerApp: false, chat: 'messenger', chatTo: 'dazzleshopbd', chatStyle: 'round', floatCart: true, backTop: true, announce: false });
    case 'haatly': return T({ productLayout: 'sticky', gallery: 'stack', aboutStyle: 'team', contactStyle: 'cards', policyStyle: 'numbered', blogStyle: 'masonry', postStyle: 'magazine', checkoutStyle: 'grocery', checkoutMode: 'page', checkoutBump: true, advanceAmount: 200, productStyle: 'accordion', detailsStyle: 'accordion', primary: '#f05a3c', accent: '#111827', text: '#111827', bg: '#ffffff', surface: '#ffffff', sale: '#f05a3c', headerTone: 'light', fontPair: 'bricolage', width: 'boxed', corners: 'soft', buttons: 'solid', spacing: 'comfortable', cardStyle: 'outline', cardButton: 'add', cardRatio: 'portrait', cardRating: false, titleStyle: 'center', sectionCard: 'page', colsDesktop: '5', colsPhone: '2', filters: 'left', reviewsPos: 'below', freeShipAt: 3000, footerLayout: 'brand', footerTone: 'light', footerApp: true, chat: 'messenger', chatTo: 'dazzleshopbd', chatStyle: 'greeting', chatGreeting: 'Hi! Need help choosing?', floatCart: true, backTop: true, announce: false });
    case 'rupkotha': return T({ productLayout: 'panel', gallery: 'below', aboutStyle: 'magazine', contactStyle: 'split', policyStyle: 'card', blogStyle: 'featured', postStyle: 'magazine', checkoutStyle: 'compact', checkoutMode: 'page', checkoutBump: false, advanceAmount: 200, productStyle: 'beauty', detailsStyle: 'tabs', primary: '#7a1747', accent: '#e0457b', text: '#1f1320', bg: '#ffffff', surface: '#ffffff', sale: '#e0457b', headerTone: 'light', fontPair: 'dmserif', headCase: 'upper', width: 'boxed', corners: 'soft', buttons: 'solid', spacing: 'comfortable', cardStyle: 'centered', cardButton: 'add', cardRatio: 'square', cardRating: true, titleStyle: 'caps', sectionCard: 'page', colsDesktop: '4', colsPhone: '2', filters: 'left', reviewsPos: 'tab', freeShipAt: 1199, footerLayout: 'caps', footerTone: 'dark', footerMarks: true, chat: 'messenger', chatTo: 'dazzleshopbd', chatStyle: 'round', floatCart: true, backTop: true, announce: false });
    case 'glowmuse': return T({ productLayout: 'sticky', gallery: 'stack', aboutStyle: 'magazine', contactStyle: 'split', policyStyle: 'document', blogStyle: 'masonry', postStyle: 'wide', checkoutStyle: 'signin', checkoutMode: 'page', checkoutBump: false, advanceAmount: 200, productStyle: 'sale', detailsStyle: 'tabs', primary: '#5b3a8c', accent: '#8b6cf0', text: '#111827', bg: '#ffffff', surface: '#ffffff', sale: '#e11d74', headerTone: 'light', fontPair: 'instrument', width: 'boxed', corners: 'round', buttons: 'pill', spacing: 'comfortable', cardStyle: 'minimal', cardButton: 'add', cardRatio: 'square', titleStyle: 'bold', sectionCard: 'page', colsDesktop: '5', colsPhone: '2', filters: 'left', reviewsPos: 'below', freeShipAt: 1199, footerLayout: 'columns', footerTone: 'light', footerApp: true, chat: 'whatsapp', chatTo: '8801811843300', chatStyle: 'round', floatCart: false, backTop: true, announce: false });
    case 'voltiva': return T({ productLayout: 'right', gallery: 'below', aboutStyle: 'team', contactStyle: 'map', policyStyle: 'sidebar', blogStyle: 'grid', postStyle: 'sidebar', checkoutStyle: 'advance', checkoutMode: 'page', checkoutBump: false, advanceAmount: 200, productStyle: 'gadget', detailsStyle: 'pills', primary: '#0e9f9f', accent: '#ef4444', text: '#111827', bg: '#f3f4f6', surface: '#ffffff', sale: '#ef4444', headerTone: 'dark', fontPair: 'unbounded', width: 'boxed', corners: 'round', buttons: 'solid', spacing: 'comfortable', cardStyle: 'pill', cardButton: 'add', cardRatio: 'square', cardRating: true, titleStyle: 'pill', sectionCard: 'card', colsDesktop: '6', colsPhone: '2', filters: 'left', reviewsPos: 'tab', freeShipAt: 0, footerLayout: 'watermark', footerTone: 'dark', footerApp: false, chat: 'messenger', chatTo: 'dazzleshopbd', chatStyle: 'pill', chatGreeting: 'Chat with us', floatCart: false, backTop: true, announce: false });
    case 'gizmolane': return T({ productLayout: 'classic', gallery: 'side', aboutStyle: 'split', contactStyle: 'map', policyStyle: 'numbered', blogStyle: 'list', postStyle: 'centered', checkoutStyle: 'steps', checkoutMode: 'page', checkoutBump: false, advanceAmount: 200, productStyle: 'nudge', detailsStyle: 'accordion', primary: '#f26b1d', accent: '#0f2a4a', text: '#0f172a', bg: '#f3f5f8', surface: '#ffffff', sale: '#f26b1d', headerTone: 'light', fontPair: 'sora', width: 'boxed', corners: 'round', buttons: 'solid', spacing: 'comfortable', cardStyle: 'clean', cardButton: 'add', cardRatio: 'square', titleStyle: 'underline', sectionCard: 'card', colsDesktop: '6', colsPhone: '2', filters: 'left', reviewsPos: 'tab', freeShipAt: 5000, footerLayout: 'brand', footerTone: 'dark', footerApp: true, chat: 'whatsapp', chatTo: '8801811843300', chatStyle: 'greeting', chatGreeting: 'Sir, how can we help you?', floatCart: false, backTop: true, announce: false });
    default: return { ...base };
  }
}

/** Ready headers: H(hid, name, spec) as in presets.js (row spec [height, tone, sticky, left, centre, right]). */
export function packHeaders(id, H) {
  const phone = ['phone', { label: '', number: '01811-843300' }];
  const track = ['iconlink', { icon: 'truck', label: 'Track order', href: '/track', look: 'below' }];
  switch (id) {
    case 'ghorpure': return [
      H('main', 'GhorPure · Store', {
        desktop: { main: [80, 'light', true, [['logo', { size: 'L' }]], [['search', { cats: false, size: 'L', look: 'soft', placeholder: 'Search in…' }]], [track, ['account', { label: 'below' }], ['wishlist', { label: 'below' }], ['cart', { label: 'below' }]]], bottom: [48, 'dark', true, [], [['menu', { look: 'plain', weight: 'bold' }]], []] },
        mobile: { main: [58, 'light', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'menu', 'account', 'phone'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'novabyte': return [
      H('main', 'NovaByte · Catalogue', {
        desktop: { main: [80, 'dark', false, [['logo', { size: 'L' }]], [['search', { cats: false, size: 'L', look: 'box', placeholder: 'Search' }]], [['iconlink', { icon: 'gift', label: 'Offers', sub: 'Latest offers', href: '/offers', look: 'two' }], ['iconlink', { icon: 'zap', label: 'Flash hour', sub: 'Special deals', href: '/offers', look: 'two' }], ['account', { label: 'two', sub: 'Register or log in' }], ['button', { label: 'Phone finder', href: '/search?q=phone', style: 'solid' }]]], bottom: [46, 'light', true, [], [['menu', { look: 'plain' }]], []] },
        mobile: { main: [58, 'dark', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'catmenu', 'menu', 'account', 'phone'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'naturanest': return [
      H('main', 'NaturaNest · Store', {
        desktop: { main: [72, 'brand', true, [['logo', { size: 'L' }]], [['search', { cats: false, size: 'L', look: 'button', placeholder: 'Search in NaturaNest…' }]], [['iconlink', { icon: 'truck', label: 'Order track', href: '/track', look: 'below' }], ['cart', { label: 'below' }]]], bottom: [44, 'dark', true, [], [['menu', { look: 'plain', weight: 'bold' }]], []] },
        mobile: { main: [58, 'brand', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'menu', 'phone'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'haatly': return [
      H('main', 'Haatly · Store', {
        desktop: { main: [76, 'light', true, [['logo', { size: 'L' }]], [['search', { cats: false, size: 'L', look: 'button', placeholder: 'Search in Haatly…' }]], [phone, ['wishlist', { label: 'none' }], 'cart', ['button', { label: 'Login / Register', href: '#', style: 'pill', icon: 'user' }]]], bottom: [46, 'brand', true, [['menu', { look: 'plain', weight: 'bold' }]], [], [['button', { label: 'FLASH SALE', href: '/offers', style: 'outline', icon: 'zap' }]]] },
        mobile: { main: [58, 'light', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'menu', 'account', 'phone'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'rupkotha': return [
      H('main', 'Rupkotha · Store', {
        desktop: { main: [64, 'light', true, [['logo', { size: 'M' }], ['iconlink', { icon: 'badge-check', label: 'BRANDS', href: '/search?q=', look: 'beside' }]], [['search', { cats: false, size: 'M', look: 'pill', placeholder: 'Search for products…' }]], [['button', { label: 'WISHLIST', href: '#', style: 'pill' }], ['button', { label: 'LOGIN', href: '#', style: 'outline' }], ['cart', { label: 'beside' }]]], bottom: [48, 'light', true, [], [['menu', { look: 'plain', pills: 5 }]], []] },
        mobile: { main: [58, 'light', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'menu', 'account'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'glowmuse': return [
      H('main', 'GlowMuse · Store', {
        desktop: { main: [68, 'light', true, [['logo', { size: 'M' }]], [['search', { cats: false, size: 'M', look: 'soft', placeholder: 'What are you looking for?' }]], ['account', 'cart']], bottom: [52, 'light', true, [['menu', { look: 'chips' }]], [], []] },
        mobile: { main: [58, 'light', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'menu', 'account'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'voltiva': return [
      H('main', 'Voltiva · Store', {
        desktop: { top: [34, 'light', false, [['social', { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', youtube: 'https://youtube.com/' }]], [], [phone, ['iconlink', { icon: 'mail', label: 'support@voltiva.com.bd', href: 'mailto:support@voltiva.com.bd', look: 'beside' }], ['iconlink', { icon: 'truck', label: 'TRACK ORDER', href: '/track', look: 'beside' }]]], main: [72, 'dark', true, [['logo', { size: 'L' }]], [['search', { cats: false, size: 'M', look: 'button', placeholder: 'Search for products' }]], [['button', { label: 'Power deals', href: '/offers', style: 'gradient', icon: 'flame' }], 'cart', ['iconlink', { icon: 'package', label: 'Pre-order', sub: 'Order today', href: '/search?q=', look: 'two' }], ['account', { label: 'two', sub: 'Register or log in' }]]], bottom: [46, 'light', true, ['catmenu'], [['menu', { look: 'caps' }]], []] },
        mobile: { main: [58, 'dark', true, [], ['logo'], ['account']], bottom: [52, 'light', true, [], [['search', { cats: false, size: 'L', look: 'button' }]], []], drawer: ['catmenu', 'menu', 'account', 'phone'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    case 'gizmolane': return [
      H('main', 'GizmoLane · Store', {
        desktop: { top: [34, 'dark', false, [['social', { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', youtube: 'https://youtube.com/' }]], [], [['iconlink', { icon: 'smartphone', label: 'Mobile app', href: '#', look: 'beside' }], ['iconlink', { icon: 'headset', label: 'Customer service', href: '/page?handle=contact-us', look: 'beside' }], ['iconlink', { icon: 'truck', label: 'Track order', href: '/track', look: 'beside' }]]], main: [76, 'light', true, [['logo', { size: 'L' }]], [['search', { cats: false, size: 'L', look: 'pill', placeholder: 'Search for products' }]], ['account', 'cart']], bottom: [46, 'light', true, ['catmenu'], [['menu', { look: 'plain' }]], []] },
        mobile: { main: [58, 'light', true, ['logo'], [], ['search', 'cart']], drawer: ['search', 'catmenu', 'menu', 'account'], navItems: ['home', 'cats', 'cart', 'account'] },
      }),
    ];
    default: return [];
  }
}
export const PACK_DEFAULT_HEADER = (id) => 'hdr-' + id + '-main';

/** Layouts. kit = { S (newSection), lay(lid, kind, name, sections, extra), slide, tail, img: [shop, pack, style, creator] }. */
export function packLayouts(id, kit) {
  const { S, lay, slide, tail, img } = kit;
  const [SHOP, PACKING, STYLE, CREATOR] = img;
  const banners = (list) => list.map(([image, title, text, href]) => ({ id: 'bn-' + Math.random().toString(36).slice(2, 8), image, title, text, href }));
  const side = (list) => banners(list);
  const productPage = (extra = []) => lay('product', 'product', 'Product page', [S('main'), ...extra, S('products', { title: 'You may also like', source: 'related', count: 5, layout: 'carousel' }), S('recent')]);
  const catPage = (extra = []) => lay('category', 'category', 'Category page', [...extra, S('main')]);
  switch (id) {
    case 'ghorpure': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'side1', height: 'M', autoplay: true, slides: [slide('All offers in one place', 'Fresh deals every week.', 'Shop the offers', '/offers', SHOP, 'dark'), slide('Straight from the source', 'Packed fresh, delivered fast.', 'Shop now', '/store', PACKING, 'dark')], side: side([[CREATOR, 'Ask an expert', 'Free advice before you buy', '/page?handle=contact-us']]) }),
        S('cattiles', { variant: 'carousel', title: 'Featured categories', count: 8 }),
        S('products', { title: 'Top selling products', source: 'best', count: 4, layout: 'two', card: 'horizontal' }),
        S('brands', { variant: 'carousel', title: 'Our brands', count: 8 }),
        S('products', { title: 'Accessories', source: 'category', cat: 'Accessories', count: 10, layout: 'carousel' }),
        S('products', { title: 'Audio', source: 'category', cat: 'Audio', count: 10, layout: 'carousel' }),
        S('products', { title: 'Phones', source: 'category', cat: 'Phones', count: 10, layout: 'carousel' }),
        S('products', { title: 'Just for you', source: 'new', count: 10, layout: 'grid' }),
        S('reviews', { variant: 'avatar', title: 'What our customers say', count: 3 }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'novabyte': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'banners', height: 'L', autoplay: true, slides: [slide('The big tech week', 'Up to ৳30,000 off and EMI up to 12 months.', 'See the deals', '/offers', SHOP, 'dark'), slide('Phones with official warranty', 'Galaxy, Redmi, Realme and iPhone.', 'Shop phones', '/category?handle=phones', CREATOR, 'dark')], side: side([[PACKING, 'Tell us what you think', 'Share a complaint or an idea', '/page?handle=contact-us'], [STYLE, 'We are hiring', 'Build your career with us', '/page?handle=about-us']]) }),
        S('quicklinks', { variant: 'cards', items: [{ icon: 'smartphone', title: 'Phone finder', text: 'Find your phone easily', href: '/search?q=phone' }, { icon: 'message-circle', title: 'Raise a complaint', text: 'Share your experience', href: '/page?handle=contact-us' }, { icon: 'calculator', title: 'EMI calculator', text: 'See the monthly cost', href: '/page?handle=emi-plans' }, { icon: 'wrench', title: 'Service centre', text: 'Repair your device', href: '/page?handle=contact-us' }] }),
        S('cattiles', { variant: 'icongrid', title: 'Featured category', sub: 'Get your desired product from a featured category!', count: 12 }),
        S('cta', { variant: 'strip', icon: 'map-pin', title: '2 shops in Dhaka', text: 'Visit a branch and try before you buy.', button: 'Find our shop', href: '/page?handle=contact-us' }),
        S('deal', { variant: 'tinted', title: 'Mega deal week', text: 'Enjoy big discounts on the products you want!', source: 'sale', count: 10, image: SHOP }),
        S('products', { title: 'New arrivals', sub: 'Fresh in this week', source: 'new', count: 10, layout: 'grid' }),
        S('seotext', { variant: 'fold', title: 'Your trusted phone and gadget shop in Bangladesh', text: 'We sell official phones, laptops and accessories with real warranty and cash on delivery all over Bangladesh.\n\n## Best price, after-sales service and fast delivery\nEvery product comes with the brand’s official warranty, and our service centre handles repairs and claims.\n\n## EMI on bank cards\nPay in 3 to 12 months on most bank credit cards.', tags: '' }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'naturanest': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'side1', height: 'M', autoplay: true, slides: [slide('Pure, lab-tested, delivered fresh', 'Grade A quality in a reusable jar.', 'Shop now', '/store', PACKING, 'dark')], side: side([[CREATOR, 'Talk to an expert', 'Free, private advice', '/page?handle=contact-us']]) }),
        S('trust', { variant: 'columns', items: [{ icon: 'flask-conical', title: 'Every batch lab tested', text: '' }, { icon: 'truck', title: '24–48 hour delivery in Dhaka', text: '' }, { icon: 'rotate-ccw', title: '7-day easy return', text: '' }] }),
        S('bento', { title: 'Best selling products', source: 'best', tone: 'soft' }),
        S('bannergrid', { variant: 'two', banners: banners([[SHOP, 'Everyday wellness', 'For the whole family', '/store'], [PACKING, 'Gift boxes', 'Ready to send', '/offers']]) }),
        S('products', { title: 'Accessories', source: 'category', cat: 'Accessories', count: 10, layout: 'carousel', tone: 'soft' }),
        S('products', { title: 'Audio', source: 'category', cat: 'Audio', count: 6, layout: 'three', card: 'horizontal' }),
        S('products', { title: 'Wearables', source: 'category', cat: 'Wearables', count: 10, layout: 'carousel', tone: 'soft' }),
        S('producttabs', { variant: 'chips', title: 'All products', tabs: 8, count: 10, layout: 'grid' }),
        S('steps', { variant: 'numbered', title: 'Why NaturaNest', sub: 'Every step that keeps it pure — from the source to your door', items: [{ title: 'Straight from the source', text: 'Bought directly from farmers and collectors.' }, { title: 'Every batch tested', text: 'Purity and moisture results on every product page.' }, { title: 'Halal process', text: 'From ingredients to packing, the whole process is halal.' }] }),
        S('cta', { variant: 'card', label: 'FREE CONSULTATION', title: 'Talk to an expert', text: 'Get free advice before you buy.', icon: 'message-circle', button: 'Get advice', href: 'https://wa.me/8801811843300' }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'haatly': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'full', height: 'L', autoplay: true, slides: [slide('Bangladesh’s trend-driven store', 'New trending products every week.', 'Shop trending', '/store', SHOP, 'dark'), slide('Free delivery over ৳3,000', 'Cash on delivery everywhere.', 'Start shopping', '/store', PACKING, 'dark')] }),
        S('products', { title: 'Trending now', source: 'best', count: 12, layout: 'peek' }),
        S('products', { title: 'Accessories', source: 'category', cat: 'Accessories', count: 12, layout: 'peek' }),
        S('products', { title: 'Audio and gadgets', source: 'category', cat: 'Audio', count: 12, layout: 'peek' }),
        S('products', { title: 'Just for you', source: 'new', count: 10, layout: 'grid' }),
        S('reviews', { variant: 'avatar', title: 'Reviews from our customers', count: 3 }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'rupkotha': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'full', height: 'L', autoplay: true, slides: [slide('The big beauty bargain', 'Up to 35% off · free shipping over ৳1,199', 'Shop the sale', '/offers', STYLE, 'dark'), slide('New season, new glow', 'Fresh arrivals every week.', 'Shop new', '/store', CREATOR, 'dark')], box: { width: 'full' } }),
        S('bannergrid', { variant: 'strip', banners: banners([[PACKING, 'Win a gift with every order this week', 'Highest purchaser wins a grand prize', '/offers']]) }),
        S('bannergrid', { variant: 'three2', title: 'Top brands and offers', banners: banners([[SHOP, 'Deals you cannot miss', 'Up to 31% off', '/offers'], [PACKING, 'Free delivery', 'On orders over ৳999', '/offers'], [STYLE, 'Now in Bangladesh', 'New brand', '/store'], [CREATOR, 'Hair care week', '', '/store'], [SHOP, 'Up to 33% off', 'Serums and essences', '/offers'], [PACKING, 'Soft skin', 'Body care', '/store']]) }),
        S('bannergrid', { variant: 'four', title: 'Limited time offers', banners: banners([[STYLE, 'BOGO', 'Double the fun', '/offers'], [CREATOR, 'Combo', 'Perfect match', '/offers'], [SHOP, 'Exclusive offers', '', '/offers'], [PACKING, 'Clearance sale', '', '/offers']]) }),
        S('cattiles', { variant: 'poster', title: 'Shop by category', count: 8 }),
        S('cattiles', { variant: 'cards', title: 'Shop by concern', count: 5 }),
        S('products', { title: 'Best sellers', source: 'best', count: 8, layout: 'grid' }),
        S('trust', { variant: 'stats', box: { width: 'full' } }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'glowmuse': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'boxed', height: 'M', autoplay: true, slides: [slide('Festive sale · up to 51% off', 'Surprise free delivery on every order.', 'Shop the sale', '/offers', STYLE, 'dark')] }),
        S('cattiles', { variant: 'ring', title: 'Top categories', count: 6 }),
        S('bannergrid', { variant: 'portrait3', title: 'Trending', banners: banners([[STYLE, 'K-beauty must haves', '', '/store'], [CREATOR, 'Bright, calm, glowing', '', '/store'], [SHOP, 'Five-taka makeover', 'Minimum purchase ৳2,499', '/offers']]) }),
        S('coupons', { variant: 'tickets', title: 'Offers to say yes', count: 4 }),
        S('products', { title: 'Combo offers', source: 'sale', count: 10, layout: 'carousel' }),
        S('bannergrid', { variant: 'strip', banners: banners([[PACKING, 'Viral products, unbelievable discounts', 'Order now', '/offers']]) }),
        S('brands', { variant: 'offers', title: 'Best offer brands', count: 5 }),
        S('cattiles', { variant: 'spotlight', title: 'Top 3 of beauty' }),
        S('products', { title: 'Flash sale', source: 'sale', count: 10, layout: 'carousel' }),
        S('reviews', { variant: 'verified', title: 'Customer reviews', count: 4 }),
        S('brands', { variant: 'grid', title: 'Our brands', count: 12 }),
        S('outlet', { title: 'Visit our shops', photos: [SHOP, PACKING, STYLE, CREATOR].map((image, i) => ({ id: 'ph' + i, image })) }),
        S('seotext', { variant: 'fold', title: 'Buy original beauty products online in Bangladesh', text: 'Shop authentic makeup, skincare and hair care with cash on delivery all over Bangladesh.\n\n## 100% authentic products\nEvery product comes straight from the brand or its official importer.', tags: 'Serum, Sunscreen, Cleanser, Lip care, Hair oil, Face wash' }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'voltiva': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'boxed', height: 'M', autoplay: true, slides: [slide('Welcome to the world of smart gadgets', 'Chargers, earbuds, watches and more.', 'Shop now', '/store', SHOP, 'dark')] }),
        S('cattiles', { variant: 'icongrid', title: 'Featured categories', count: 12 }),
        S('deal', { variant: 'gradient', title: 'This week’s must-have', text: 'Trending gadgets, carefully chosen for you.', source: 'best', count: 10, button: 'Go shopping', href: '/store' }),
        S('trust', { variant: 'dark', items: [{ icon: 'shield-check', title: 'Authentic products', text: 'From original brands' }, { icon: 'truck', title: 'Super fast delivery', text: 'Fast and reliable' }, { icon: 'credit-card', title: 'Secure payment', text: 'Verified gateways' }, { icon: 'headset', title: '24×7 support', text: 'Contact our support' }] }),
        S('producttabs', { variant: 'chips', title: 'Featured products', tabs: 8, count: 10, layout: 'carousel' }),
        S('products', { title: 'Best selling products', source: 'best', count: 12, layout: 'carousel' }),
        S('brands', { variant: 'grid', title: 'Shop by brands', count: 12 }),
        S('ytfeed', { title: 'Voltiva reviews', subs: '669 subscribers · 109 videos', href: 'https://youtube.com/', items: [] }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    case 'gizmolane': return [
      lay('home', 'home', 'Home', [
        S('hero', { variant: 'boxed', height: 'M', autoplay: true, slides: [slide('Bags and luggage for office and travel', 'The perfect collection for every day.', 'Shop now', '/store', PACKING, 'dark'), slide('Gadgets that just work', 'Checked before they ship.', 'Shop gadgets', '/store', SHOP, 'dark')] }),
        S('trust', { variant: 'chips', items: [{ icon: 'truck', title: 'Fast delivery', text: 'Across Bangladesh' }, { icon: 'credit-card', title: 'Easy payment', text: 'COD / online pay' }, { icon: 'zap', title: 'Smart gadgets', text: 'Daily tech picks' }, { icon: 'badge-check', title: 'Quality checked', text: 'Practical and reliable' }] }),
        S('cattiles', { variant: 'topline', title: 'Shop by category', count: 12 }),
        S('coupons', { variant: 'panel', title: 'New user offers', text: 'Special coupons just for you!', count: 5 }),
        S('products', { title: 'Latest gadgets', source: 'new', count: 12, layout: 'grid' }),
        S('deal', { variant: 'dark', title: 'Today’s top picks', text: 'Fresh picks, deep discounts — while stock lasts.', source: 'sale', count: 10, button: 'Shop the deal', href: '/offers' }),
        S('products', { title: 'Best TWS and audio picks', source: 'category', cat: 'Audio', count: 12, layout: 'carousel' }),
        S('products', { title: 'Smart watch and wearables', source: 'category', cat: 'Wearables', count: 12, layout: 'carousel' }),
      ]),
      productPage(), catPage(), ...tail,
    ];
    default: return [];
  }
}

/** The main menu for a pack theme (null = the standard one). kit = { mi, cat, pg, accMega, phonesMega }. */
export function packMenu(id, kit) {
  const { mi, cat, pg, accMega, phonesMega } = kit;
  const many = [
    mi('Phones', cat('Phones'), [mi('Smartphones', cat('Phones › Smartphones')), mi('Feature phones', cat('Phones › Feature phones'))], phonesMega),
    mi('Accessories', cat('Accessories'), [mi('Cases & covers', cat('Accessories › Cases & covers')), mi('Chargers & cables', cat('Accessories › Chargers & cables'))], accMega),
    mi('Audio', cat('Audio')),
    mi('Wearables', cat('Wearables')),
    mi('Power banks', cat('Power banks')),
  ];
  if (id === 'rupkotha') return [...many, mi('Combo', { type: 'offers' }), mi('New in', { type: 'home' }), mi('Gifts', { type: 'offers' }), mi('Clearance sale', { type: 'offers' }), mi('Repairs', pg('pg-contact'))];
  if (id === 'glowmuse') return [mi('Festive sale', { type: 'offers' }), mi('Combo', { type: 'offers' }), mi('New', { type: 'home' }), ...many, mi('Best selling', { type: 'offers' })];
  if (id === 'novabyte') return [...many, mi('Repairs', pg('pg-contact')), mi('Offers', { type: 'offers' })];
  if (isPack(id)) return [mi('Home', { type: 'home' }), ...many, mi('Offers', { type: 'offers' })];
  return null;
}
