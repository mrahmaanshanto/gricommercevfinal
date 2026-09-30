// blog — the storefront blog: posts (built from content blocks), categories (one level of nesting)
// and authors with roles. Read by /blog-posts, /blog-editor, /blog-categories, /blog-authors and
// /author-profile.
//   post      { id, title, slug, excerpt, blocks[], cover { src, tone, icon, alt }, categoryIds[], tags[],
//               authorId, status draft|scheduled|published|archived, publishAt, updatedAt, createdAt,
//               visibility public|unlisted|private, seo {…}, featured, allowComments, readingTime,
//               views, viewsMonth, comments, relatedProductSkus[], autoPublishedAt }
//             A scheduled post goes live by itself: whenever posts are read, one whose publishAt has passed
//             becomes published and gets autoPublishedAt (saved at once).
//   block     { id, type, … } — p, h2, h3, list, quote, image, product, cta, divider, embed, table, faq.
//             Paragraph text is markdown-lite: **bold**, *italic*, [link text](url).
//   category  { id, name, slug, description, parentId, color, seo { metaTitle, metaDescription } }
//   author    { id, name, slug, role Admin|Editor|Author|Contributor, email, phone, avatar { initials, color },
//               bio, expertise[], socials { facebook, instagram, linkedin, x, website }, active, joinedAt }
// Front end only: everything lives in this browser (localStorage), seeded with demo content.
// Every write fires a 'gc:blog' window event so open screens re-read.

const KEY = 'gc.blog.v1';
const AUTOSAVE = 'gc.blog.autosave';
export const SITE = 'gridshop.com.bd';
export const BLOG_BASE = SITE + '/blog/';

// ---- colours: token pairs only (soft fill + text) and a gradient for cover placeholders ----------
export const TONES = {
  navy: { label: 'Navy', bg: 'var(--fill-primary-soft)', fg: 'var(--primary)', grad: 'linear-gradient(135deg,var(--primary-700),var(--accent-500))' },
  sky: { label: 'Sky', bg: 'var(--fill-info-soft)', fg: 'var(--text-info)', grad: 'linear-gradient(135deg,var(--accent-400),var(--primary-500))' },
  green: { label: 'Green', bg: 'var(--fill-success-soft)', fg: 'var(--text-success)', grad: 'linear-gradient(135deg,var(--success),var(--accent-700))' },
  amber: { label: 'Amber', bg: 'var(--fill-warning-soft)', fg: 'var(--text-warning)', grad: 'linear-gradient(135deg,var(--warning),var(--error))' },
  rose: { label: 'Rose', bg: 'var(--fill-error-soft)', fg: 'var(--text-danger)', grad: 'linear-gradient(135deg,var(--error),var(--secondary))' },
  violet: { label: 'Violet', bg: 'var(--fill-secondary-soft)', fg: 'var(--secondary)', grad: 'linear-gradient(135deg,var(--secondary),var(--primary-600))' },
  slate: { label: 'Slate', bg: 'var(--surface-subtle)', fg: 'var(--text-body)', grad: 'linear-gradient(135deg,var(--slate-600),var(--navy-800))' },
};
export const toneOf = (key) => TONES[key] || TONES.navy;

// ---- images the shop already has (public/assets) --------------------------------------------------
export const GALLERY = [
  { id: 'skincare', src: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp', label: 'Skin care products on a desk' },
  { id: 'phones', src: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', label: 'Phone accessories shop counter' },
  { id: 'boutique', src: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', label: 'Boutique with sarees and kurtis' },
  { id: 'packing', src: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp', label: 'Packing an online order' },
  { id: 'tee', src: '/assets/25e820cfa3e50978f934abe93e0c3db7.png', label: 'Model in a lilac cotton tee' },
  { id: 'denim', src: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', label: 'Model in a denim jacket' },
  { id: 'print', src: '/assets/48a47ed6468079a61846b91934211c40.png', label: 'Model in a printed shirt' },
];
export const COVER_ICONS = ['newspaper', 'shirt', 'sparkles', 'smartphone', 'utensils', 'tag', 'gift', 'store'];

// ---- statuses and roles --------------------------------------------------------------------------
export const STATUSES = {
  draft: { label: 'Draft', tone: 'neutral', icon: 'pencil-line' },
  scheduled: { label: 'Scheduled', tone: 'info', icon: 'clock' },
  published: { label: 'Published', tone: 'success', icon: 'check' },
  archived: { label: 'Archived', tone: 'warning', icon: 'archive' },
};
export const VISIBILITY = { public: 'Public', unlisted: 'Unlisted · link only', private: 'Private · staff only' };
export const ROLES = {
  Admin: 'Everything: all posts, categories, authors and blog settings.',
  Editor: 'Writes, edits and publishes anyone’s posts. Manages categories.',
  Author: 'Writes and publishes their own posts.',
  Contributor: 'Writes drafts. An editor reviews and publishes them.',
};
export const ROLE_TONE = { Admin: 'primary', Editor: 'info', Author: 'success', Contributor: 'slate' };

// ---- block types -----------------------------------------------------------------------------
export const BLOCK_TYPES = [
  { type: 'p', label: 'Paragraph', icon: 'pilcrow' },
  { type: 'h2', label: 'Heading H2', icon: 'heading-2' },
  { type: 'h3', label: 'Heading H3', icon: 'heading-3' },
  { type: 'list', label: 'List', icon: 'list' },
  { type: 'quote', label: 'Quote', icon: 'quote' },
  { type: 'image', label: 'Image', icon: 'image' },
  { type: 'product', label: 'Product card', icon: 'shopping-bag' },
  { type: 'cta', label: 'Button', icon: 'mouse-pointer-click' },
  { type: 'divider', label: 'Divider', icon: 'minus' },
  { type: 'embed', label: 'YouTube video', icon: 'youtube' },
  { type: 'table', label: 'Table', icon: 'table' },
  { type: 'faq', label: 'FAQ', icon: 'circle-help' },
];
export const blockLabel = (type) => (BLOCK_TYPES.find((b) => b.type === type) || { label: type }).label;

let seq = 0;
export const uid = (prefix = 'b') => prefix + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 5);

export function newBlock(type) {
  const id = uid('b');
  switch (type) {
    case 'h2': case 'h3': return { id, type, text: '' };
    case 'list': return { id, type, ordered: false, items: [''] };
    case 'quote': return { id, type, text: '', cite: '' };
    case 'image': return { id, type, src: GALLERY[0].src, alt: '', caption: '' };
    case 'product': return { id, type, sku: '' };
    case 'cta': return { id, type, label: 'Shop now', url: '/', style: 'solid' };
    case 'divider': return { id, type };
    case 'embed': return { id, type, url: '' };
    case 'table': return { id, type, header: true, rows: [['', ''], ['', '']] };
    case 'faq': return { id, type, items: [{ q: '', a: '' }] };
    default: return { id, type: 'p', text: '' };
  }
}
/** A copy of a block with a new id (for Duplicate). */
export const cloneBlock = (b) => ({ ...JSON.parse(JSON.stringify(b)), id: uid('b') });

// ---- text helpers ---------------------------------------------------------------------------
/** Markdown-lite to plain text. */
export const plain = (s) => String(s || '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
export function blockText(b) {
  if (!b) return '';
  switch (b.type) {
    case 'p': case 'h2': case 'h3': return plain(b.text);
    case 'list': return (b.items || []).map(plain).join('. ');
    case 'quote': return plain(b.text);
    case 'image': return b.caption || '';
    case 'cta': return b.label || '';
    case 'table': return (b.rows || []).map((r) => r.join(' ')).join(' ');
    case 'faq': return (b.items || []).map((x) => `${x.q} ${x.a}`).join(' ');
    default: return '';
  }
}
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean);
export const wordCount = (blocks) => words((blocks || []).map(blockText).join(' ')).length;
/** Minutes to read at 200 words a minute, at least 1. */
export const readingTime = (blocks) => Math.max(1, Math.ceil(wordCount(blocks) / 200));
export const hasBangla = (s) => /[ঀ-৿]/.test(String(s || ''));

/** "Eid wardrobe: 7 looks!" -> "eid-wardrobe-7-looks". Bangla-only text falls back to "post". */
export function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');
}
/** A slug not used by any other item in `list` ({ id, slug }): adds -2, -3 … when needed. */
export function uniqueSlug(base, list, selfId) {
  const root = slugify(base) || 'post';
  const taken = new Set((list || []).filter((x) => x.id !== selfId).map((x) => x.slug));
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}
export const slugTaken = (slug, list, selfId) => (list || []).some((x) => x.id !== selfId && x.slug === slug);

export const initials = (name) => words(name).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

// ---- seed ---------------------------------------------------------------------------------
const P = (text) => ({ type: 'p', text });
const H = (text, level = 2) => ({ type: level === 3 ? 'h3' : 'h2', text });
const L = (items, ordered = false) => ({ type: 'list', ordered, items });
const img = (g, alt, caption) => ({ type: 'image', src: GALLERY.find((x) => x.id === g).src, alt, caption });
const withIds = (pid, blocks) => blocks.map((b, i) => ({ id: `${pid}b${i + 1}`, ...b }));
const SEO = (metaTitle, metaDescription, focusKeyword, keywords = [], extra = {}) => ({ metaTitle, metaDescription, focusKeyword, keywords, canonical: '', noindex: false, ogTitle: '', ogDescription: '', ogImage: '', ...extra });
const cover = (g, alt, tone = 'navy', icon = 'newspaper') => ({ src: g ? GALLERY.find((x) => x.id === g).src : '', tone, icon, alt });

const SEED_CATEGORIES = [
  { id: 'c-fashion', name: 'Fashion', slug: 'fashion', parentId: '', color: 'rose', description: 'Clothes, fits and styling for everyday Dhaka life.', seo: { metaTitle: 'Fashion tips and style guides | GridShop blog', metaDescription: 'Style guides, fit advice and outfit ideas for Bangladesh weather, from GridShop.' } },
  { id: 'c-eid', name: 'Eid & festive wear', slug: 'eid-festive-wear', parentId: 'c-fashion', color: 'amber', description: 'Outfits and gifting for Eid, Puja and Pohela Boishakh.', seo: { metaTitle: '', metaDescription: '' } },
  { id: 'c-skin', name: 'Skin care', slug: 'skin-care', parentId: '', color: 'violet', description: 'Routines and product advice for humid weather.', seo: { metaTitle: 'Skin care routines for humid weather | GridShop', metaDescription: 'Simple skin care routines, sunscreen advice and product guides made for Bangladesh humidity.' } },
  { id: 'c-gadgets', name: 'Gadgets', slug: 'gadgets', parentId: '', color: 'sky', description: 'Phones, earbuds and home electronics, explained without jargon.', seo: { metaTitle: 'Gadget buying guides | GridShop blog', metaDescription: '' } },
  { id: 'c-phone', name: 'Phone care', slug: 'phone-care', parentId: 'c-gadgets', color: 'navy', description: 'Cases, screen protection, chargers and battery health.', seo: { metaTitle: '', metaDescription: '' } },
  { id: 'c-recipes', name: 'Recipes', slug: 'recipes', parentId: '', color: 'green', description: 'Home cooking with pantry staples from the shop.', seo: { metaTitle: 'Easy Bangladeshi recipes | GridShop kitchen', metaDescription: 'Weeknight Bangladeshi recipes with everyday pantry staples: khichuri, biryani, bhorta and more.' } },
];

const SEED_AUTHORS = [
  { id: 'a-shanto', name: 'Shanto Islam', slug: 'shanto-islam', role: 'Admin', email: 'shanto@gridshop.com.bd', phone: '01711-482930', avatar: { initials: 'SI', color: 'navy' }, bio: 'Runs GridShop from Dhanmondi. Writes about store news, offers and how we pick what we sell.', expertise: ['Store news', 'Offers', 'Retail'], socials: { facebook: 'facebook.com/shanto.gridshop', instagram: '', linkedin: 'linkedin.com/in/shantoislam', x: '', website: 'gridshop.com.bd' }, active: true, joinedAt: '2024-02-01T10:00:00+06:00' },
  { id: 'a-shila', name: 'Shila Rahman', slug: 'shila-rahman', role: 'Editor', email: 'shila@gridshop.com.bd', phone: '01819-305271', avatar: { initials: 'SR', color: 'rose' }, bio: 'Fashion and skin care editor. Tests every product on Dhaka’s hottest days before she recommends it.', expertise: ['Fashion', 'Skin care', 'Styling'], socials: { facebook: 'facebook.com/shila.writes', instagram: 'instagram.com/shila.style', linkedin: '', x: 'x.com/shilarahman', website: '' }, active: true, joinedAt: '2024-06-15T10:00:00+06:00' },
  { id: 'a-nusrat', name: 'Nusrat Jahan', slug: 'nusrat-jahan', role: 'Author', email: 'nusrat.jahan@gmail.com', phone: '01912-660418', avatar: { initials: 'NJ', color: 'green' }, bio: 'Home cook from Chattogram. Shares family recipes that use what is already in the pantry.', expertise: ['Recipes', 'Grocery', 'Meal planning'], socials: { facebook: 'facebook.com/nusratskitchen', instagram: 'instagram.com/nusratskitchen', linkedin: '', x: '', website: '' }, active: true, joinedAt: '2025-01-10T10:00:00+06:00' },
  { id: 'a-tanvir', name: 'Tanvir Hasan', slug: 'tanvir-hasan', role: 'Contributor', email: 'tanvir.h@outlook.com', phone: '01552-190847', avatar: { initials: 'TH', color: 'sky' }, bio: 'Phone repair technician at Multiplan. Explains gadgets in plain words.', expertise: ['Phones', 'Accessories', 'Repairs'], socials: { facebook: '', instagram: '', linkedin: 'linkedin.com/in/tanvirhasan', x: 'x.com/tanvirfixes', website: '' }, active: true, joinedAt: '2025-08-01T10:00:00+06:00' },
];

// Full article bodies for six seed posts (350–700 words each). They replace the short `blocks` below.
const BODIES = {
  'p-case': [
    P('A **phone case** has one job: keep your phone in one piece. In Dhaka that job is hard. Phones slip out of pockets on rickshaws, fall on tiled floors and bake on dashboards in the summer sun. We repair hundreds of cracked phones a month at Multiplan. Most of them had no case, or the wrong one.'),
    P('This guide explains the three main case materials, how to check the fit, and when to replace a case. It takes five minutes to read and can save you a ৳6,000 screen repair.'),
    H('Three materials cover most needs'),
    P('Almost every case sold in Bangladesh is made of silicone, TPU or a hard armour shell. Each one suits a different kind of day.'),
    L(['**Silicone** is soft and grippy. It rarely slips out of your hand, but it collects dust and lint in a bag.', '**TPU** is thin, clear and flexible. It shows off the phone colour and absorbs small drops well.', '**Armour** cases pair a hard shell with a soft inner layer. They are bulky, but they survive falls from a bike.']),
    P('If you ride a bike or work on a building site, pick armour. If the phone lives in a handbag, TPU is enough. Silicone is a good middle ground for students.'),
    img('phones', 'Rows of phone cases on the wall behind the GridShop counter', 'Try a case on your own phone at any branch before you buy.'),
    H('Match the case to the exact model'),
    P('A case made for one model will not fit another, even from the same brand. A 16 Pro Max case will not fit a 16 Pro. The camera cut-out, the buttons and the corner curve all differ by a millimetre or two.'),
    P('Check the model name in *Settings › About phone* before you order. When you buy online, write the model in the order note. Our team checks it before packing.'),
    H('Five signs of a good case'),
    L(['Raised edges around the screen and camera, at least 1 mm high.', 'Firm buttons that click easily through the case.', 'Air-cushion corners, because most phones land on a corner.', 'A snug fit with no gap at the top or bottom.', 'Room for a screen protector without the edges lifting it.'], true),
    P('The raised edge matters most. When a phone falls face down, the edge touches the floor first and the glass stays clear. Pair a good case with a screen protector. We compare the options in [tempered glass or film](/blog/tempered-glass-vs-film).'),
    H('Heat, charging and wear'),
    P('Thick cases trap heat. On a hot day in traffic, a phone in a thick case can get warm enough to slow down or pause charging. Take the case off while you charge in the car. Cases under 3 mm work with wireless chargers. Armour cases with metal plates for car mounts can block it.'),
    P('Clear TPU cases turn yellow in sunlight after six to nine months. That is only cosmetic. But a yellow case often means the edges are worn too. Replace it when the corners feel soft or the case slides around the phone.'),
    { type: 'product', sku: 'EL-PHN-128' },
    P('Buying a new phone? Read [what to check in budget Android phones](/blog/budget-android-phones-under-15000) first, then add a case to the same order. It ships in the same parcel at no extra delivery charge.'),
    { type: 'faq', items: [{ q: 'Does a thick case slow down wireless charging?', a: 'Cases under 3 mm charge normally. Armour cases with metal plates can block it.' }, { q: 'How often should I replace a clear case?', a: 'When it turns yellow or the corners go soft, usually after 6 to 9 months in the sun.' }] },
  ],
  'p-sunscreen': [
    P('The UV index in Dhaka stays above 8 for most of the year. A good **sunscreen** is the one skin care step you should never skip. It prevents dark spots, early lines and sunburn, even on cloudy monsoon days.'),
    P('Many people stop after a week because sunscreen feels sticky in the humidity. The fix is usually the texture and the amount, not the brand. Here is how to get it right.'),
    H('Why SPF 50 matters here'),
    P('SPF measures protection from UVB, the rays that burn. SPF 30 blocks about 97 percent of them. SPF 50 blocks about 98 percent. The gap sounds small. But in strong sun, and when most people apply too little, the higher number gives a useful safety margin.'),
    P('Look for "broad spectrum" or PA+++ on the tube as well. That means it also blocks UVA, the rays behind pigmentation and ageing.'),
    H('How much to use'),
    P('Use two finger-lengths for the face and neck. Squeeze a line along your index and middle fingers, from palm to tip. Most people use half of that, which roughly halves the protection.'),
    { type: 'quote', text: 'রোদে বের হওয়ার ১৫ মিনিট আগে সানস্ক্রিন লাগান, আর প্রতি দুই ঘণ্টা পর আবার লাগান।', cite: 'Shila Rahman' },
    P('Reapply every two hours outdoors, and after sweating or washing your face. Indoors near a window, once at lunch is enough.'),
    img('skincare', 'Sunscreen tube, toner and serum bottles arranged on a desk', 'Keep a small tube in your bag for the afternoon top-up.'),
    H('Pick a texture that survives the heat'),
    L(['Gel or fluid textures for oily and acne-prone skin.', 'Light creams for normal skin.', 'Richer creams for dry skin in winter.', 'Tinted sunscreen if you skip foundation.']),
    P('Apply sunscreen as the last step of your morning routine, after moisturiser. Wait five minutes before makeup so it sets and does not pill.'),
    H('Common mistakes'),
    L(['Relying on the SPF in foundation. You would need seven layers to get the label protection.', 'Forgetting the ears, the neck and the back of the hands.', 'Skipping it on rainy days. UVA passes through clouds.', 'Using last year’s tube. Check the expiry date and the smell.'], true),
    { type: 'product', sku: 'SK-SUN-50' },
    P('Pair it with a light toner in the morning. See our [evening routine under ৳3,000](/blog/evening-skincare-routine) for the rest of the day. সানস্ক্রিন প্রতিদিন, সারা বছর।'),
  ],
  'p-khichuri': [
    P('বৃষ্টির দিনে গরম খিচুড়ি আর ডিম ভাজা — এর চেয়ে ভালো কিছু হয় না। This **khichuri recipe** feeds four in 40 minutes.'),
    P('This is bhuna khichuri, the drier kind where every grain stays separate. My grandmother in Chattogram made it whenever the first monsoon rain hit the tin roof. It needs one pot and pantry staples you probably have already.'),
    H('Ingredients for four'),
    L(['2 cups miniket or chinigura rice, washed and drained', '1 cup boot dal (split chickpeas) or moong dal', '3 tbsp mustard oil and 1 tbsp ghee', '2 medium onions, thinly sliced', '1 tbsp ginger paste and 1 tsp garlic paste', '1 tsp each of turmeric, cumin and chilli powder', '2 bay leaves, 3 cardamom pods and a small cinnamon stick', '4 cups hot water and salt to taste']),
    img('packing', 'Rice, dal and mustard oil being packed for a GridShop grocery order', 'Order the rice, dal and oil together and they arrive in one parcel.'),
    H('Method'),
    L(['Dry-roast the dal in the pot for 4 minutes, until it smells nutty. Tip it out.', 'Heat the mustard oil until it smokes lightly, then lower the heat.', 'Add the whole spices, then the onions. Fry until deep golden.', 'Stir in the ginger, garlic and ground spices with a splash of water.', 'Add the rice and roasted dal. Fry for 3 minutes so every grain is coated.', 'Pour in the hot water and salt. Bring it to a boil.', 'Cover and cook on the lowest heat for 20 minutes. Do not stir.', 'Rest for 5 minutes, then add the ghee and fluff it gently.'], true),
    H('What to serve with it'),
    P('Khichuri is best with something fried and something sharp. Try egg bhaji, begun bhaja, beef bhuna or a simple aloo bhorta. A spoon of achar on the side cuts through the ghee.'),
    P('For a rainy weekend, make it a spread: khichuri, fried hilsa, green chillies and sliced onion. On weeknights, keep it simple with an omelette.'),
    H('Tips for the right texture'),
    L(['Use 2 cups of water per cup of rice for bhuna khichuri. Use 3 for the soft, soupy kind.', 'Roasting the dal stops it turning to mush.', 'Old rice takes more water than new-season rice. Add a splash more if needed.']),
    { type: 'product', sku: 'GR-RICE-5' },
    P('Short on time? Try our [rice cooker biryani](/blog/rice-cooker-biryani) for another one-pot dinner. বৃষ্টির দিনে খিচুড়ি আর গল্প — এটাই আসল আনন্দ।'),
    { type: 'faq', items: [{ q: 'Can I use moong dal?', a: 'Yes. Roast it the same way and cut the water by half a cup.' }, { q: 'Can I make it in a rice cooker?', a: 'Fry the onions and spices in a pan first, then cook everything on the rice setting.' }] },
  ],
  'p-eid': [
    P('An **oversized tee** in heavy cotton is the most useful thing in an Eid suitcase. It works for the morning walk to prayers, the afternoon family visits and the late café with cousins. Here are seven ways to wear one black tee over the holidays.'),
    img('tee', 'Model in a relaxed lilac cotton tee against a white wall', 'Size up once for the relaxed fit.'),
    H('Pick the right tee first'),
    P('A cheap tee loses its shape after two washes. A good one gets softer and keeps its drape. Check the label for the weight of the cotton, and hold it up to the light: you should not see through it.'),
    L(['Heavy cotton, 220 gsm or more, so it hangs well and does not cling.', 'Dropped shoulders and a boxy body.', 'A neck rib that lies flat after washing.', 'Black, white or olive, because they go with everything.']),
    H('1. With denim and white sneakers'),
    P('The classic. Roll the sleeves once and tuck the front corner into straight-leg jeans. White sneakers keep it clean enough for the relatives.'),
    H('2. Under an open koti'),
    P('Layer a printed koti over the tee for family visits. It looks festive without the heat of a full panjabi. You can take it off when lunch runs long.'),
    H('3. With a long skirt or palazzo'),
    P('For a relaxed look, knot the tee at the waist over a flowing skirt or wide palazzo. Add juttis and a light dupatta.'),
    H('4 to 7. Quick ideas'),
    L(['Tee, cargo trousers and loafers for the road trip home.', 'Tee under a denim jacket for cold shopping malls.', 'Tee with a pleated skirt and sandals for the Eid mela.', 'Tee with wide wrap trousers for the evening adda.'], true),
    P('Keep accessories light. One watch or a thin chain is enough, because the tee already does the talking. Iron it inside out the night before so the print and the colour stay sharp.'),
    P('Packing for the trip home? Roll the tee instead of folding it. Rolled cotton creases less in a bag, and one tee takes the space of a pair of socks. Bring a second one in white for the day you spill the shemai.'),
    { type: 'product', sku: 'CL-TEE-BM' },
    P('Buying jeans to go with it? Read the [denim fit guide](/blog/denim-fit-guide) before you order, so the size is right the first time.'),
    { type: 'cta', label: 'Shop the Eid edit', url: '/collections/eid', style: 'solid' },
  ],
  'p-denim': [
    P('Most returns on jeans are about size. Two measurements fix that: waist and inseam. Measure once at home and order the right pair online the first time.'),
    H('What you need'),
    L(['A soft measuring tape.', 'A pair of jeans that already fits you well.', 'Two minutes and a mirror.']),
    H('Measure at home'),
    L(['Waist: around your navel, with the tape snug but not tight.', 'Inseam: from the crotch seam to the ankle, on the pair that fits.', 'Hip: around the widest part, with your feet together.'], true),
    P('Write the numbers down in inches. Our size table uses inches because the labels do. Measure in the evening if you can, when your body is at its fullest after a day of walking and eating.'),
    img('denim', 'Model wearing a blue denim jacket on a city street', 'The same idea works for denim jackets: measure the chest.'),
    H('Read the size table'),
    { type: 'table', header: true, rows: [['Size', 'Waist (in)', 'Hip (in)', 'Inseam (in)'], ['28', '28–29', '35–36', '30'], ['30', '30–31', '37–38', '30'], ['32', '32–33', '39–40', '31'], ['34', '34–35', '41–42', '32'], ['36', '36–37', '43–44', '32']] },
    P('Between two sizes? Pick the larger one for straight and relaxed fits. Pick the smaller one for stretch skinny jeans, because stretch denim loosens by half a size with wear.'),
    H('Fits explained'),
    L(['**Skinny**: tight from hip to ankle.', '**Slim**: close, with a little room at the thigh.', '**Straight**: the same width from knee to ankle.', '**Relaxed**: roomy through the seat and thigh.']),
    P('Denim shrinks about 2 percent in the first hot wash. Wash it inside out in cold water and hang it to dry. That keeps the colour and the length.'),
    { type: 'product', sku: 'CL-JNS-32' },
    H('Length and alterations'),
    P('Most jeans come with a 30 to 32 inch inseam. If yours are too long, any tailor near you can shorten them for about ৳100. Ask them to keep the original hem, so the faded edge stays on the new length. Do not cut stretch jeans shorter than your ankle bone, because they ride up when you sit.'),
    H('Returns and exchanges'),
    P('Wrong size after all? Exchange unworn jeans with the tags on within seven days, at any branch or by courier. We check the size table with you before the new pair ships, so the second try fits.'),
    P('Styling the new pair for Eid? See [seven looks with one oversized tee](/blog/eid-looks-oversized-tee).'),
  ],
  'p-phones': [
    P('At under ৳15,000 you can get a phone that lasts three years, if you check four things first. Shop staff will talk about camera megapixels. Those matter less than you think.'),
    H('The four things that matter'),
    L(['6 GB RAM, not 4. Facebook, bKash and the camera all need the room.', '128 GB storage. 64 GB fills up within a year of photos and WhatsApp videos.', 'A 5,000 mAh battery for a full day on mobile data.', 'At least two years of security updates from the brand.'], true),
    P('Updates are the one most people forget. A phone without updates still works, but banking apps may stop supporting it. Check the brand website for its update promise before you buy. Two years of updates usually means three years of comfortable use for most people.'),
    H('What you can skip'),
    P('A 108 megapixel camera on a budget phone takes the same photos as a good 50 megapixel one. The sensor and the software matter more. Fast 65 W charging is nice, but 18 W is fine if you charge overnight. A curved screen looks good in the shop and cracks more easily.'),
    img('phones', 'Customer choosing a phone at the GridShop counter', 'Ask to hold two or three phones before you decide.'),
    H('Check before you pay'),
    L(['Dial *#06# and match the IMEI with the box.', 'Make sure the phone is BTRC registered.', 'Test both SIM slots, the charger and the speaker.', 'Keep the receipt and the warranty card together.']),
    P('Buying online? We test every phone before it ships and send the IMEI in your order SMS. You can check it the moment the parcel arrives. If anything is wrong, return it within seven days.'),
    H('Warranty in plain words'),
    P('Most brands give one year of warranty on the phone and six months on the battery and charger. Water damage and a cracked screen are not covered. Keep the box, because some service centres ask for it. Register the phone on the brand app on the first day, so the warranty starts from the purchase date and not the shipping date.'),
    { type: 'product', sku: 'EL-PHN-128' },
    P('Protect it from day one. Read [how to choose a phone case that lasts](/blog/choose-phone-case) and add a case to the same order.'),
  ],
};

const post = (id, o) => {
  const blocks = withIds(id, BODIES[id] || o.blocks);
  return {
    id, excerpt: '', tags: [], status: 'published', visibility: 'public', featured: false, allowComments: true, comments: 0, views: 0, viewsMonth: 0,
    relatedProductSkus: [], createdAt: o.publishAt || o.updatedAt, ...o, blocks, readingTime: readingTime(blocks),
  };
};

const SEED_POSTS = [
  post('p-case', {
    title: 'How to choose a phone case that lasts', slug: 'choose-phone-case',
    excerpt: 'Silicone, TPU or armour: which phone case survives Dhaka streets, and how to match it to your phone.',
    cover: cover('phones', 'Phone cases on display at a shop counter', 'sky', 'smartphone'), categoryIds: ['c-phone'], tags: ['phone case', 'buying guide'], authorId: 'a-tanvir',
    publishAt: '2026-09-14T10:00:00+06:00', updatedAt: '2026-09-30T16:20:00+06:00', views: 4820, viewsMonth: 1310, comments: 12, featured: true,
    relatedProductSkus: ['EL-PHN-128', 'EL-EAR-PRO'],
    seo: SEO('How to choose a phone case that lasts | GridShop', 'Silicone, TPU or armour? A plain guide to choosing a phone case that survives drops, dust and Dhaka traffic, and fits your exact model.', 'phone case', ['phone cover', 'armor case', 'TPU case']),
    blocks: [
      P('A **phone case** has one job: keep the phone in one piece. In Dhaka traffic and on crowded buses, drops happen daily.'),
      H('Three materials cover most needs'),
      L(['**Silicone** grips well but collects dust.', '**TPU** is clear, thin and flexible.', '**Armour** cases with a kickstand take the hardest falls.']),
      img('phones', 'Rows of phone cases at the GridShop counter', 'Try a case on your phone at any branch before you buy.'),
      H('Match the case to the exact model'),
      P('A 16 Pro Max case will not fit a 16 Pro. Check the model name in *Settings › About phone* and bring it to the counter, or [browse cases by model](/collections/phone-cases).'),
      { type: 'product', sku: 'EL-PHN-128' },
      { type: 'faq', items: [{ q: 'Does a thick case slow down wireless charging?', a: 'Cases under 3 mm charge normally. Armour cases with metal plates can block it.' }, { q: 'How often should I replace a clear case?', a: 'When it turns yellow, usually after 6 to 9 months in the sun.' }] },
    ],
  }),
  post('p-puja', {
    title: 'Puja offers: 10% off chargers and earbuds', slug: 'puja-offers-2026', status: 'scheduled',
    excerpt: 'Use code PUJA10 for 10% off every charger, cable and pair of earbuds until 20 October.',
    cover: cover('', 'Puja offer banner with gift icon', 'amber', 'gift'), categoryIds: ['c-gadgets'], tags: ['offers', 'puja'], authorId: 'a-shanto',
    publishAt: '2026-10-08T10:00:00+06:00', updatedAt: '2026-09-29T12:10:00+06:00',
    relatedProductSkus: ['EL-EAR-PRO'],
    seo: SEO('Puja offers 2026: 10% off chargers and earbuds | GridShop', 'Puja offers at GridShop: use code PUJA10 for 10% off chargers, cables and earbuds, online and in every branch until 20 October.', 'puja offers', ['durga puja sale', 'earbuds discount']),
    blocks: [
      P('Shubho Durga Puja! From 8 to 20 October, use code **PUJA10** at checkout for 10% off every charger, cable and pair of earbuds.'),
      P('The offer works online and at our Dhanmondi, Mirpur and Gulshan-1 branches. শুভ শারদীয়া!'),
      { type: 'product', sku: 'EL-EAR-PRO' },
      { type: 'cta', label: 'Shop the Puja offers', url: '/collections/puja-offers', style: 'solid' },
    ],
  }),
  post('p-glass', {
    title: 'Tempered glass or film: what actually protects the screen', slug: 'tempered-glass-vs-film', status: 'draft',
    excerpt: '', cover: cover('', '', 'navy', 'smartphone'), categoryIds: ['c-phone'], tags: ['screen protector'], authorId: 'a-tanvir',
    publishAt: null, updatedAt: '2026-09-30T19:40:00+06:00',
    seo: SEO('', '', 'screen protector'),
    blocks: [
      P('Draft: compare 9H tempered glass with PET film for scratches and drops. Add photos from the Multiplan test.'),
      { type: 'table', header: true, rows: [['', 'Tempered glass', 'PET film'], ['Drop protection', 'Good', 'Poor'], ['Scratch protection', 'Very good', 'Good'], ['Price', '৳350–৳600', '৳150–৳250']] },
    ],
  }),
  post('p-sunscreen', {
    title: 'Sunscreen in Dhaka humidity: SPF 50 made simple', slug: 'sunscreen-spf-50-humidity',
    excerpt: 'Why SPF 50 matters in Bangladesh, how much to use, and a sunscreen that does not feel greasy in the heat.',
    cover: cover('skincare', 'Sunscreen and skin care bottles on a desk', 'violet', 'sparkles'), categoryIds: ['c-skin'], tags: ['sunscreen', 'spf', 'summer'], authorId: 'a-shila',
    publishAt: '2026-09-22T09:00:00+06:00', updatedAt: '2026-09-22T09:00:00+06:00', views: 6240, viewsMonth: 3980, comments: 21, featured: true,
    relatedProductSkus: ['SK-SUN-50', 'SK-TON-150'],
    seo: SEO('Sunscreen in Dhaka humidity: SPF 50 made simple', 'Which sunscreen works in Dhaka humidity? How much SPF 50 to use, when to reapply, and a light sunscreen that does not feel greasy.', 'sunscreen', ['spf 50', 'sunscreen for oily skin', 'সানস্ক্রিন']),
    blocks: [
      P('The UV index in Dhaka stays above 8 for most of the year. A good **sunscreen** is the one skin care step you should never skip.'),
      H('How much to use'),
      P('Two finger-lengths for the face and neck. Most people use half of that, which halves the protection.'),
      { type: 'quote', text: 'রোদে বের হওয়ার ১৫ মিনিট আগে সানস্ক্রিন লাগান, আর প্রতি দুই ঘণ্টা পর আবার লাগান।', cite: 'Shila Rahman' },
      H('Pick a texture that survives the heat'),
      L(['Gel or fluid textures for oily skin.', 'Cream textures for dry skin in winter.', 'Tinted sunscreen if you skip foundation.']),
      { type: 'product', sku: 'SK-SUN-50' },
      P('Pair it with a light toner in the morning. See our [evening routine under ৳3,000](/blog/evening-skincare-routine) for the rest.'),
    ],
  }),
  post('p-routine', {
    title: 'A 5-step evening skincare routine under ৳3,000', slug: 'evening-skincare-routine',
    excerpt: 'Five steps, four products and ten minutes before bed. Everything costs under ৳3,000 in total.',
    cover: cover('', 'Evening skincare routine flat lay', 'violet', 'sparkles'), categoryIds: ['c-skin'], tags: ['routine', 'budget'], authorId: 'a-shila',
    publishAt: '2026-09-05T20:00:00+06:00', updatedAt: '2026-09-06T11:00:00+06:00', views: 3110, viewsMonth: 920, comments: 8,
    relatedProductSkus: ['SK-TON-150', 'SK-SHA-340'],
    seo: SEO('Evening skincare routine under ৳3,000 | GridShop', 'A simple 5-step evening skincare routine for humid weather that costs under ৳3,000: cleanse, tone, treat, moisturise and protect.', 'evening skincare routine', ['night routine', 'budget skincare']),
    blocks: [
      P('A good **evening skincare routine** does not need ten bottles. It needs the right order.'),
      L(['Cleanse off sunscreen and dust.', 'Tone with a hydrating toner.', 'Treat: one active, not three.', 'Moisturise with a light gel.', 'Wash your pillow cover twice a week.'], true),
      { type: 'product', sku: 'SK-TON-150' },
    ],
  }),
  post('p-eid', {
    title: 'Eid wardrobe: 7 looks with one oversized tee', slug: 'eid-looks-oversized-tee',
    excerpt: 'One black oversized tee, seven outfits for Eid visits, cafés and the long drive home.',
    cover: cover('boutique', 'Boutique rail with sarees and kurtis for Eid', 'amber', 'shirt'), categoryIds: ['c-fashion', 'c-eid'], tags: ['eid', 'outfits', 'oversized'], authorId: 'a-shila',
    publishAt: '2026-09-09T11:00:00+06:00', updatedAt: '2026-09-12T15:30:00+06:00', views: 5360, viewsMonth: 1840, comments: 16,
    relatedProductSkus: ['CL-TEE-BM', 'CL-JNS-32', 'CL-SNK-42'],
    seo: SEO('Eid wardrobe: 7 looks with one oversized tee', 'Seven easy Eid outfits built around one black cotton tee: with denim, a koti or sneakers.', 'oversized tee', ['eid outfits', 'eid fashion']),
    blocks: [
      P('An **oversized tee** in heavy cotton is the most useful thing in an Eid suitcase. Here are seven ways to wear one.'),
      img('tee', 'Model wearing a relaxed cotton tee', 'Size up once for the relaxed fit.'),
      H('With denim and white sneakers'),
      P('The classic. Roll the sleeves once and tuck the front corner.'),
      { type: 'product', sku: 'CL-TEE-BM' },
      H('Under an open koti'),
      P('Layer a printed koti over the tee for family visits. It looks festive without the heat of a full panjabi.'),
      { type: 'cta', label: 'Shop the Eid edit', url: '/collections/eid', style: 'solid' },
    ],
  }),
  post('p-denim', {
    title: 'Denim fit guide: find your size without a trial room', slug: 'denim-fit-guide',
    excerpt: 'Measure once at home and order the right jeans online the first time.',
    cover: cover('denim', 'Model in a denim jacket on a city street', 'sky', 'shirt'), categoryIds: ['c-fashion'], tags: ['denim', 'size guide'], authorId: 'a-shila',
    publishAt: '2026-09-18T10:30:00+06:00', updatedAt: '2026-09-18T10:30:00+06:00', views: 2780, viewsMonth: 1450, comments: 5,
    relatedProductSkus: ['CL-JNS-32'],
    seo: SEO('Denim fit guide: find your jeans size online', 'How to measure your waist and inseam at home and pick the right denim jeans size online, with a size table for GridShop jeans.', 'denim size', ['jeans size guide']),
    blocks: [
      P('Most returns on jeans are about size. Two measurements fix that: waist and inseam.'),
      H('Measure at home'),
      L(['Waist: around your navel, tape snug but not tight.', 'Inseam: from the crotch seam to the ankle on a pair that fits.'], true),
      { type: 'table', header: true, rows: [['Size', 'Waist (in)', 'Inseam (in)'], ['30', '30–31', '30'], ['32', '32–33', '31'], ['34', '34–35', '32']] },
      { type: 'product', sku: 'CL-JNS-32' },
    ],
  }),
  post('p-khichuri', {
    title: 'Khichuri for rainy days: a one-pot family recipe', slug: 'khichuri-rainy-day-recipe',
    excerpt: 'Bhuna khichuri with miniket rice, boot dal and mustard oil, ready in 40 minutes.',
    cover: cover('', 'Bowl of bhuna khichuri with fried egg', 'green', 'utensils'), categoryIds: ['c-recipes'], tags: ['khichuri', 'monsoon', 'one pot'], authorId: 'a-nusrat',
    publishAt: '2026-09-26T12:00:00+06:00', updatedAt: '2026-09-26T12:00:00+06:00', views: 7150, viewsMonth: 5920, comments: 34, featured: true,
    relatedProductSkus: ['GR-RICE-5', 'GR-DAL-1', 'GR-MUS-1'],
    seo: SEO('Khichuri recipe for rainy days: one-pot bhuna khichuri', 'An easy one-pot bhuna khichuri recipe with miniket rice, boot dal and mustard oil. Ready in 40 minutes and perfect for a rainy day.', 'khichuri recipe', ['bhuna khichuri', 'খিচুড়ি']),
    blocks: [
      P('বৃষ্টির দিনে গরম খিচুড়ি আর ডিম ভাজা — এর চেয়ে ভালো কিছু হয় না। This **khichuri recipe** feeds four in 40 minutes.'),
      H('Ingredients'),
      L(['2 cups miniket rice', '1 cup boot dal, dry-roasted', '3 tbsp mustard oil', 'Onion, ginger, garlic, turmeric, cumin', '4 cups hot water']),
      H('Method'),
      L(['Roast the dal until it smells nutty.', 'Fry onion in mustard oil until golden, add the spices.', 'Add rice and dal, fry for 3 minutes.', 'Pour in hot water, cover and cook on low for 20 minutes.'], true),
      { type: 'product', sku: 'GR-RICE-5' },
      { type: 'faq', items: [{ q: 'Can I use moong dal?', a: 'Yes. Roast it the same way and cut the water by half a cup.' }] },
    ],
  }),
  post('p-biryani', {
    title: 'Rice cooker biryani in 45 minutes', slug: 'rice-cooker-biryani', status: 'scheduled',
    excerpt: 'Weeknight chicken biryani made start to finish in a 1.8 litre rice cooker.',
    cover: cover('', 'Chicken biryani in a rice cooker', 'amber', 'utensils'), categoryIds: ['c-recipes'], tags: ['biryani', 'rice cooker'], authorId: 'a-nusrat',
    publishAt: '2026-10-05T18:00:00+06:00', updatedAt: '2026-09-30T21:15:00+06:00',
    relatedProductSkus: ['HM-RCK-18', 'GR-RICE-5'],
    seo: SEO('Rice cooker biryani recipe in 45 minutes', 'Make chicken biryani in a rice cooker in 45 minutes: marinate, layer and press cook. A weeknight recipe with everyday spices.', 'rice cooker biryani'),
    blocks: [
      P('No handi, no dum, no stress. This **rice cooker biryani** layers marinated chicken and rice and lets the cooker do the rest.'),
      H('What you need'),
      L(['500 g chicken, marinated in yogurt and biryani masala', '2 cups rice, soaked for 20 minutes', 'Fried onions, saffron milk, ghee']),
      { type: 'embed', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { type: 'product', sku: 'HM-RCK-18' },
    ],
  }),
  post('p-phones', {
    title: 'Budget Android phones under ৳15,000: what to check', slug: 'budget-android-phones-under-15000',
    excerpt: 'RAM, storage, battery and update support: the four things that matter at this price.',
    cover: cover('', 'Budget Android phone on a desk', 'navy', 'smartphone'), categoryIds: ['c-gadgets'], tags: ['android', 'budget', 'buying guide'], authorId: 'a-tanvir',
    publishAt: '2026-09-29T17:00:00+06:00', updatedAt: '2026-09-29T17:00:00+06:00', views: 1980, viewsMonth: 1980, comments: 6,
    relatedProductSkus: ['EL-PHN-128'],
    seo: SEO('Budget Android phones under ৳15,000', 'What to check before buying a budget Android phone under ৳15,000 in Bangladesh.', ''),
    blocks: [
      P('At under ৳15,000 you can get a phone that lasts three years, if you check four things first.'),
      L(['6 GB RAM, not 4.', '128 GB storage.', '5,000 mAh battery.', 'Two years of security updates.'], true),
      { type: 'product', sku: 'EL-PHN-128' },
    ],
  }),
  post('p-winter', {
    title: 'Winter lip care basics', slug: 'winter-lip-care', status: 'archived',
    excerpt: 'Last winter’s guide to cracked lips. Archived until the new season.',
    cover: cover('', 'Lip balm on a winter scarf', 'rose', 'sparkles'), categoryIds: ['c-skin'], tags: ['winter'], authorId: 'a-shila',
    publishAt: '2025-12-02T10:00:00+06:00', updatedAt: '2026-03-01T10:00:00+06:00', views: 2240, viewsMonth: 40, comments: 3,
    seo: SEO('Winter lip care basics', 'Simple winter lip care: exfoliate once a week, balm at night and drink more water than you think.', 'lip care'),
    blocks: [P('Cracked lips come from dry air and licking them. Balm at night and drink water.')],
  }),
];

const seed = () => JSON.parse(JSON.stringify({ posts: SEED_POSTS, categories: SEED_CATEGORIES, authors: SEED_AUTHORS }));

// ---- storage ------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
/** Scheduled posts whose publishAt has passed become published (autoPublishedAt = publishAt). Null when none are due. */
function autoPublish(db) {
  const now = Date.now();
  let changed = false;
  const posts = db.posts.map((p) => {
    if (p.status !== 'scheduled' || !p.publishAt || new Date(p.publishAt).getTime() > now) return p;
    changed = true;
    return { ...p, status: 'published', autoPublishedAt: p.publishAt };
  });
  return changed ? { ...db, posts } : null;
}
function read() {
  if (typeof window === 'undefined') return seed();
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  let db = null;
  if (raw === cache.raw && cache.db) db = cache.db;
  else {
    try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
    if (!db || !Array.isArray(db.posts)) db = seed();
  }
  // scheduled posts whose time has come go live, and that is saved
  const due = autoPublish(db);
  if (due) {
    db = due;
    try { raw = JSON.stringify(db); window.localStorage.setItem(KEY, raw); } catch { /* ignore */ }
    window.setTimeout(() => { try { window.dispatchEvent(new CustomEvent('gc:blog')); } catch { /* ignore */ } }, 0);
  }
  cache = { raw, db };
  return db;
}
function write(db) {
  try {
    const raw = JSON.stringify(db);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, db };
    window.dispatchEvent(new CustomEvent('gc:blog'));
  } catch { /* ignore */ }
  return db;
}
/** The whole blog: { posts, categories, authors }. Seed data until something is saved. */
export const getBlog = () => read();
export const getPosts = () => read().posts;
export const getPost = (id) => read().posts.find((p) => p.id === id) || null;
export const getCategories = () => read().categories;
export const getAuthors = () => read().authors;
export const getAuthor = (id) => read().authors.find((a) => a.id === id) || null;
/** Put the demo content back (drops every change made in this browser). */
export function resetBlog() { try { window.localStorage.removeItem(KEY); window.localStorage.removeItem(AUTOSAVE); } catch { /* ignore */ } cache = { raw: undefined, db: null }; write(seed()); }

// ---- posts ------------------------------------------------------------------------------------
export function blankPost(authorId) {
  const db = read();
  const author = authorId && db.authors.some((a) => a.id === authorId && a.active) ? authorId : (db.authors.find((a) => a.active) || db.authors[0] || {}).id || '';
  return {
    id: uid('p-'), title: '', slug: '', excerpt: '', blocks: [{ ...newBlock('p') }],
    cover: { src: '', tone: 'navy', icon: 'newspaper', alt: '' }, categoryIds: [], tags: [], authorId: author,
    status: 'draft', publishAt: null, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(), visibility: 'public',
    seo: SEO('', '', ''), featured: false, allowComments: true, readingTime: 1, views: 0, viewsMonth: 0, comments: 0, relatedProductSkus: [],
  };
}
/** Insert or replace a post. Sets updatedAt and readingTime. Returns the saved post. */
export function savePost(p) {
  const db = read();
  const saved = { ...p, readingTime: readingTime(p.blocks), updatedAt: new Date().toISOString() };
  const i = db.posts.findIndex((x) => x.id === p.id);
  const posts = db.posts.slice();
  if (i >= 0) posts[i] = saved; else posts.unshift(saved);
  write({ ...db, posts });
  return saved;
}
/** Change several posts at once: patch is an object or a function (post) => partial. */
export function updatePosts(ids, patch) {
  const db = read();
  const set = new Set(ids);
  const now = new Date().toISOString();
  write({ ...db, posts: db.posts.map((p) => (set.has(p.id) ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch), updatedAt: now } : p)) });
}
export function deletePosts(ids) {
  const db = read();
  const set = new Set(ids);
  write({ ...db, posts: db.posts.filter((p) => !set.has(p.id)) });
  ids.forEach(clearAutosave);
}

/** What stops a post going live: [{ field, message }]. Empty when it can be published. */
export function publishProblems(p, { scheduling = false } = {}) {
  const out = [];
  if (!String(p.title || '').trim()) out.push({ field: 'bl-title', message: 'Add a title.' });
  if (!(p.categoryIds || []).length) out.push({ field: 'bl-cats', message: 'Choose at least one category.' });
  if (!String((p.seo || {}).metaDescription || '').trim()) out.push({ field: 'bl-meta-desc', message: 'Write a meta description for search results.' });
  if (!String((p.cover || {}).alt || '').trim()) out.push({ field: 'bl-cover-alt', message: 'Describe the cover image (alt text).' });
  if (scheduling && (!p.publishAt || new Date(p.publishAt).getTime() <= Date.now())) out.push({ field: 'bl-publish-at', message: 'Pick a date and time in the future to schedule.' });
  return out;
}

// ---- autosave (a working copy kept on this device) --------------------------------------------
const readAuto = () => { try { return JSON.parse(window.localStorage.getItem(AUTOSAVE)) || {}; } catch { return {}; } };
export const getAutosave = (id) => (typeof window === 'undefined' ? null : readAuto()[id] || null);
export function setAutosave(p) {
  const all = readAuto();
  const at = new Date().toISOString();
  all[p.id] = { post: p, at };
  try { window.localStorage.setItem(AUTOSAVE, JSON.stringify(all)); } catch { /* ignore */ }
  return at;
}
export function clearAutosave(id) {
  const all = readAuto();
  if (!all[id]) return;
  delete all[id];
  try { window.localStorage.setItem(AUTOSAVE, JSON.stringify(all)); } catch { /* ignore */ }
}

// ---- categories -------------------------------------------------------------------------------
/** Categories in tree order: each parent followed by its children. Adds `depth`. */
export function categoryTree(list = getCategories()) {
  const out = [];
  const byParent = (pid) => list.filter((c) => (c.parentId || '') === pid).sort((a, b) => a.name.localeCompare(b.name));
  const walk = (pid, depth) => byParent(pid).forEach((c) => { out.push({ ...c, depth }); if (depth < 4) walk(c.id, depth + 1); });
  walk('', 0);
  // orphans (parent deleted elsewhere) still show
  list.forEach((c) => { if (!out.some((x) => x.id === c.id)) out.push({ ...c, depth: 0 }); });
  return out;
}
export function saveCategory(c) {
  const db = read();
  const cats = db.categories.slice();
  const row = { description: '', parentId: '', color: 'navy', seo: { metaTitle: '', metaDescription: '' }, ...c, id: c.id || uid('c-') };
  row.slug = uniqueSlug(row.slug || row.name, cats, row.id);
  const i = cats.findIndex((x) => x.id === row.id);
  if (i >= 0) cats[i] = row; else cats.push(row);
  write({ ...db, categories: cats });
  return row;
}
/** Delete a category. Its posts move to `moveTo` (a category id) or just lose it (''). Children move up to its parent. */
export function deleteCategory(id, moveTo = '') {
  const db = read();
  const gone = db.categories.find((c) => c.id === id);
  if (!gone) return;
  const categories = db.categories.filter((c) => c.id !== id).map((c) => (c.parentId === id ? { ...c, parentId: gone.parentId || '' } : c));
  const posts = db.posts.map((p) => {
    if (!(p.categoryIds || []).includes(id)) return p;
    const ids = p.categoryIds.filter((x) => x !== id);
    if (moveTo && !ids.includes(moveTo)) ids.push(moveTo);
    return { ...p, categoryIds: ids };
  });
  write({ ...db, categories, posts });
}

// ---- authors ----------------------------------------------------------------------------------
export function saveAuthor(a) {
  const db = read();
  const authors = db.authors.slice();
  const row = { role: 'Author', email: '', phone: '', bio: '', expertise: [], socials: { facebook: '', instagram: '', linkedin: '', x: '', website: '' }, active: true, joinedAt: new Date().toISOString(), ...a, id: a.id || uid('a-') };
  row.slug = uniqueSlug(row.name, authors, row.id);
  row.avatar = { color: 'navy', ...(row.avatar || {}), initials: initials(row.name) };
  const i = authors.findIndex((x) => x.id === row.id);
  if (i >= 0) authors[i] = row; else authors.push(row);
  write({ ...db, authors });
  return row;
}
/** Switch an author on or off. When switching off, `reassignTo` (an author id) takes over their posts. */
export function setAuthorActive(id, active, reassignTo = '') {
  const db = read();
  const authors = db.authors.map((a) => (a.id === id ? { ...a, active } : a));
  const posts = !active && reassignTo ? db.posts.map((p) => (p.authorId === id ? { ...p, authorId: reassignTo } : p)) : db.posts;
  write({ ...db, authors, posts });
}

// ---- stats ------------------------------------------------------------------------------------
/** { posts, published, views, avgRead, lastPost } for one author. */
export function authorStats(authorId, posts = getPosts()) {
  const mine = posts.filter((p) => p.authorId === authorId);
  const published = mine.filter((p) => p.status === 'published');
  const last = published.slice().sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt))[0] || null;
  return {
    posts: mine.length, published: published.length,
    views: mine.reduce((s, p) => s + (p.views || 0), 0),
    avgRead: mine.length ? Math.round(mine.reduce((s, p) => s + (p.readingTime || 1), 0) / mine.length * 10) / 10 : 0,
    lastPost: last,
  };
}
/** The date a list shows for a post: publish date when it has one, else last saved. */
export const postDate = (p) => (p.status === 'published' || p.status === 'scheduled' || p.status === 'archived') && p.publishAt ? p.publishAt : p.updatedAt;

// ---- SEO --------------------------------------------------------------------------------------
const lower = (s) => String(s || '').toLowerCase();
const INTERNAL = new RegExp('\\]\\((/|https?://(www\\.)?' + SITE.replace('.', '\\.') + ')', 'i');
/**
 * The SEO checklist for a post: [{ id, label, ok, tip }]. Scores what a search engine and a reader see:
 * keyword placement, lengths, image alt text, headings, internal links and sentence length.
 */
export function seoChecks(p) {
  const seo = p.seo || {};
  const kw = lower(seo.focusKeyword).trim();
  const title = seo.metaTitle || p.title || '';
  const desc = seo.metaDescription || '';
  const first = (p.blocks || []).find((b) => b.type === 'p');
  const text = (p.blocks || []).filter((b) => b.type === 'p' || b.type === 'list' || b.type === 'quote').map(blockText).join(' ');
  const sentences = text.split(/[.!?।]+/).map((s) => words(s).length).filter((n) => n > 0);
  const avg = sentences.length ? sentences.reduce((a, b) => a + b, 0) / sentences.length : 0;
  const imgs = (p.blocks || []).filter((b) => b.type === 'image');
  const wc = wordCount(p.blocks);
  const internal = (p.blocks || []).some((b) => (b.type === 'p' || b.type === 'list') && INTERNAL.test(b.type === 'p' ? b.text : (b.items || []).join(' ')))
    || (p.blocks || []).some((b) => b.type === 'product' && b.sku)
    || (p.blocks || []).some((b) => b.type === 'cta' && /^\/|gridshop\.com\.bd/i.test(b.url || ''));
  const kwSlug = slugify(kw);
  return [
    { id: 'kw', label: 'Focus keyword is set', ok: !!kw, tip: 'Pick the phrase people type into Google to find this post.' },
    { id: 'kw-title', label: 'Keyword in the SEO title', ok: !!kw && lower(title).includes(kw), tip: 'Put the keyword near the start of the title.' },
    { id: 'kw-first', label: 'Keyword in the first paragraph', ok: !!kw && !!first && lower(plain(first.text)).includes(kw), tip: 'Mention the keyword in the opening lines.' },
    { id: 'kw-meta', label: 'Keyword in the meta description', ok: !!kw && lower(desc).includes(kw), tip: 'Use the keyword once in the description.' },
    { id: 'kw-slug', label: 'Keyword in the address (slug)', ok: !!kwSlug && String(p.slug || '').includes(kwSlug), tip: 'Keep the address short and include the keyword.' },
    { id: 'title-len', label: 'SEO title is 50–60 characters', ok: title.length >= 50 && title.length <= 60, tip: `Now ${title.length}. Google cuts titles after about 60.` },
    { id: 'desc-len', label: 'Meta description is 120–160 characters', ok: desc.length >= 120 && desc.length <= 160, tip: `Now ${desc.length}. Shorter looks thin, longer gets cut.` },
    { id: 'length', label: 'At least 300 words', ok: wc >= 300, tip: `Now ${wc} words. Longer guides rank better.` },
    { id: 'alt', label: 'Images have alt text', ok: !!String((p.cover || {}).alt || '').trim() && imgs.every((b) => String(b.alt || '').trim()), tip: 'Describe the cover and every image for screen readers and Google Images.' },
    { id: 'headings', label: 'Uses subheadings', ok: (p.blocks || []).some((b) => b.type === 'h2' || b.type === 'h3'), tip: 'Break the post up with H2 and H3 headings.' },
    { id: 'internal', label: 'Links to the shop', ok: internal, tip: 'Link to a product, a collection or another post.' },
    { id: 'readable', label: 'Short sentences (under 20 words on average)', ok: sentences.length > 0 && avg <= 20, tip: sentences.length ? `Average ${Math.round(avg)} words a sentence.` : 'Write some paragraphs first.' },
  ];
}
/** { score 0–100, tone success|warning|error, label } */
export function seoScore(p) {
  const list = seoChecks(p);
  const score = Math.round(list.filter((c) => c.ok).length / list.length * 100);
  const tone = score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error';
  return { score, tone, label: tone === 'success' ? 'Good' : tone === 'warning' ? 'Needs work' : 'Poor', checks: list };
}

// ---- embeds -----------------------------------------------------------------------------------
/** The YouTube video id in a watch, share, shorts or embed URL, or ''. */
export function youtubeId(url) {
  const m = String(url || '').match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
