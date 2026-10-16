// platform/partners — Grid Partners (Batch E, Oct 2026): models, influencers and video content creators that stores can
// hire. GridCommerce does not handle the money: it is the place where creators and stores find each other. Shared by four
// sides through this one store (browser storage gc.partners, event gc:partners): the creators' own app (/grid-partners,
// /grid-partners/join, /gp-sign-in, /gp, /gp-profile, /gp-requests), the public profile (/p?h=<handle>), the merchant
// panel's Services › Grid Partners (/partners, /partner?h=, /partner-requests) and the super admin's Grid Partners area.
// Who may use it on the store side: lib/platform/marketAccess.js (module 'partners').
//
//   Partners  { id, handle (unique, latin, the public link), type 'model' | 'influencer' | 'creator', name, photo, cover,
//             city, niches[], languages[], platforms [{ net 'facebook' | 'instagram' | 'tiktok' | 'youtube', handle,
//             followers, url }], bio, samples [{ src, kind 'photo' | 'video', link, caption }], packages [{ id, name,
//             price (৳, the partner's own rate), includes[] }], budgetFrom, budgetTo, availability 'open' | 'busy' | 'away',
//             phone, email, phoneVerified, idChecked, status 'applied' | 'approved' | 'rejected' | 'suspended', reason,
//             verified (blue tick), featured, joinedAt, appliedAt, reviewedAt, reviewedBy, stats { views, requests,
//             accepted }, history[] }
//   Requests  { id 'PR-1001', shopId, shopName, shopContact { name, phone, email }, partnerId, packageId | null, brief,
//             budget, wantedBy ('YYYY-MM-DD'), status 'sent' | 'accepted' | 'declined' | 'done' | 'cancelled',
//             messages [{ from 'shop' | 'partner' | 'system', text, at }], contactShared (true once accepted),
//             rating { stars, text, at } (the store rates after done), at, acceptedAt, doneAt, cancelledBy, reason }
//   Settings  standards { minFollowers { model, influencer, creator }, minSamples, phoneVerified, idChecked, rateCard },
//             niches[], cities[]
//
// Contact details (phone, email) are never shown on the public profile or to a store before the partner accepts that
// store's request: contactOf(request) gives them only then. checkStandards(partner) → [{ key, label, ok, detail }] is the
// application review's checklist; canApprove(partner) says whether every standard is met.
// Front end only: the server must hold these rules (approval, contact sharing, unique handles, the phone code).

export const PT_KEY = 'gc.partners';
export const PT_EVENT = 'gc:partners';
export const PT_SESSION = 'gc.partner.session';
const DB_VERSION = 1;
const DAY = 864e5, H = 3600e3;
const isBrowser = typeof window !== 'undefined';

export const TYPES = {
  model: { label: 'Model', plural: 'Models', icon: 'camera' },
  influencer: { label: 'Influencer', plural: 'Influencers', icon: 'megaphone' },
  creator: { label: 'Video creator', plural: 'Video creators', icon: 'clapperboard' },
};
export const typeLabel = (t) => (TYPES[t] || { label: t }).label;
export const NETS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
export const netLabel = (n) => NETS[n] || n;
export const AVAIL = { open: { label: 'Taking work', tone: 'success' }, busy: { label: 'Busy', tone: 'warning' }, away: { label: 'Away', tone: 'neutral' } };
export const PSTATUS = {
  applied: { label: 'Waiting for review', tone: 'warning' }, approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'error' }, suspended: { label: 'Suspended', tone: 'neutral' },
};
export const RSTATUS = {
  sent: { label: 'Waiting for reply', partner: 'New', tone: 'warning' }, accepted: { label: 'Accepted', tone: 'success' },
  declined: { label: 'Declined', tone: 'neutral' }, done: { label: 'Done', tone: 'info' }, cancelled: { label: 'Cancelled', tone: 'neutral' },
};
export const LANGS = ['Bangla', 'English', 'Hindi', 'Sylheti', 'Chatgaiya'];
export const DEFAULT_NICHES = ['Fashion', 'Beauty', 'Tech', 'Gadgets', 'Food', 'Lifestyle', 'Travel', 'Fitness', 'Home', 'Kids and family'];
export const DEFAULT_CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Cumilla'];
export const DEMO_CODE = '1234';
/** Dazzle Shop (the merchant panel's own store, #0090): what partners see once they accept its request. */
export const SELF_SHOP = '0090';
export const SELF_NAME = 'Dazzle Shop';
export const SELF_CONTACT = { name: 'Mehedi Rahman', phone: '+880 1711-000001', email: 'mehedi@dazzleshop.com.bd' };

export function now() {
  if (!isBrowser) return 0;
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}

// ---- words -----------------------------------------------------------------------------------------------------------
/** 184000 → "184K", 1250000 → "1.3M", 950 → "950" */
export function followersText(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(v);
}
export const tk = (n) => '৳' + Math.round(Number(n) || 0).toLocaleString('en-IN');
/** The platform with the most followers (or null). */
export function topPlatform(p) {
  const list = ((p && p.platforms) || []).filter((x) => Number(x.followers) > 0);
  return list.length ? list.slice().sort((a, b) => b.followers - a.followers)[0] : null;
}
export const totalFollowers = (p) => ((p && p.platforms) || []).reduce((a, x) => a + (Number(x.followers) || 0), 0);
export const fromPrice = (p) => { const ps = ((p && p.packages) || []).map((x) => Number(x.price) || 0).filter((x) => x > 0); return ps.length ? Math.min(...ps) : 0; };
/** "Fashion and lifestyle model in Dhaka" */
export function oneLine(p) {
  const n = (p.niches || []).slice(0, 2).map((x) => x.toLowerCase());
  return `${n.length ? n.join(' and ').replace(/^./, (c) => c.toUpperCase()) + ' ' : ''}${typeLabel(p.type).toLowerCase()}${p.city ? ' in ' + p.city : ''}`;
}
/** Latin letters, numbers and dashes, 3–30 long. */
export function toHandle(text) {
  return String(text || '').toLowerCase().normalize('NFKD').replace(/[^\x00-\x7f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
}
export function publicPath(handle) { return '/p?h=' + encodeURIComponent(handle || ''); }
export function publicLink(handle) {
  const origin = isBrowser ? window.location.origin : 'https://gridcommerce.net';
  return origin + publicPath(handle);
}
export function shareText(p) {
  const top = topPlatform(p);
  return `Hire me on Grid Partners: ${p.name}, ${oneLine(p)}${top ? ` · ${followersText(top.followers)} on ${netLabel(top.net)}` : ''}.`;
}

// ---- seed ------------------------------------------------------------------------------------------------------------
const A = '/assets/';
const PH = {
  ringlight: A + 'dec2496b57e91a856eaa9f8fd17d9124.webp',     // woman filming skincare with a ring light
  phoneshop: A + '99e39eac40a8abf8968649c253b23f9e.webp',     // man in a phone shop with a tablet
  saree: A + 'cfbbbbd758347fbb3f71590345d24674.webp',         // woman in a saree with a parcel, clothes shop
  curly: A + '48a47ed6468079a61846b91934211c40.png',          // studio portrait, floral shirt
  denim: A + '9f66d32bb99031029a6fbcfd91e221f2.png',          // street portrait, denim jacket
  suit: A + '937ca529653ad58861f011f257ebc4df.webp',          // man in a suit, city at dusk
  packing: A + '901f735d539a8b71fb8e8162bb755ec3.webp',       // young man scanning parcels in a store room
};
const PR = (id) => A + 'products/' + id + '.jpg';
const pl = (net, handle, followers) => ({ net, handle, followers, url: ({ facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/@', youtube: 'https://youtube.com/@' })[net] + handle });
const ph = (src, caption) => ({ kind: 'photo', src, link: '', caption });
const vd = (link, caption, src = '') => ({ kind: 'video', src, link, caption });
const pk = (id, name, price, includes) => ({ id, name, price, includes });

function partnersSeed(t) {
  const P = (x) => ({
    photo: '', cover: '', languages: ['Bangla', 'English'], budgetFrom: 0, budgetTo: 0, availability: 'open', phoneVerified: true, idChecked: true,
    status: 'approved', reason: '', verified: false, featured: false, appliedAt: t - (x.days || 60) * DAY - 3 * DAY, joinedAt: t - (x.days || 60) * DAY,
    reviewedAt: t - (x.days || 60) * DAY, reviewedBy: 'Mahin Khan', stats: { views: 0, requests: 0, accepted: 0 }, history: [], ...x,
  });
  return [
    P({ id: 'pt-nadia', handle: 'nadia-glow', type: 'creator', name: 'Nadia Islam', photo: PH.ringlight, cover: PH.ringlight, city: 'Dhaka',
      niches: ['Beauty', 'Lifestyle'], bio: 'I make honest skincare and make-up videos for Reels and TikTok: routines, first impressions and get-ready-with-me. Shot and edited by me, with Bangla voice-over and captions.',
      platforms: [pl('tiktok', 'nadia.glow', 184000), pl('instagram', 'nadia.glow', 62400), pl('youtube', 'nadiaglow', 21300)],
      samples: [ph(PH.ringlight, 'Night skincare routine for a Korean beauty brand'), vd('https://www.tiktok.com/@nadia.glow/video/1', 'Get ready with me: Eid look in 60 seconds'), vd('https://youtube.com/watch?v=nadia2', 'Serum first impressions (10 min review)'), ph(PR('p-pouch-gift'), 'Gift pouch flat-lay for a beauty box')],
      packages: [pk('reel', 'One Reel or TikTok', 8000, ['30–60 second video', 'Posted on TikTok and Instagram', 'Raw file for your ads']), pk('bundle', '3 Reels and stories', 20000, ['3 videos over 2 weeks', '6 stories with your link', 'Usage rights for 3 months']), pk('yt', 'YouTube review', 25000, ['8–12 minute review', 'Link in the description', 'Pinned comment'])],
      budgetFrom: 8000, budgetTo: 40000, verified: true, featured: true, days: 140, phone: '+880 1712-448301', email: 'nadia.glow@gmail.com', stats: { views: 1840, requests: 23, accepted: 17 } }),
    P({ id: 'pt-rafi', handle: 'rafi-tech', type: 'creator', name: 'Rafiul Karim', photo: PH.phoneshop, cover: PH.phoneshop, city: 'Dhaka',
      niches: ['Tech', 'Gadgets'], bio: 'Rafi Tech Review: phones, earbuds and smart gadgets explained in plain Bangla. Unboxings, full reviews and live Q&A from shops across Dhaka.',
      platforms: [pl('youtube', 'rafitechreview', 312000), pl('facebook', 'rafitechreview', 540000), pl('tiktok', 'rafitech', 96000)],
      samples: [ph(PR('p-iphone-15p'), 'iPhone 15 Pro unboxing thumbnail'), ph(PR('p-earbuds-pro'), 'Earbuds Pro: 7 days later'), vd('https://youtube.com/watch?v=rafi1', 'Best phones under ৳25,000 (with a Mirpur shop)'), vd('https://facebook.com/rafitechreview/videos/2', 'Live: phone questions from viewers')],
      packages: [pk('short', 'Unboxing short', 12000, ['60 second unboxing', 'Facebook, TikTok and YouTube Shorts', 'Your shop named and tagged']), pk('full', 'Full review video', 35000, ['10–15 minute review', 'Filmed at your shop if you like', 'Link and address in the description']), pk('live', 'Live from your shop', 18000, ['45 minute Facebook live', 'Answers viewers’ questions', 'Offer code read out'])],
      budgetFrom: 12000, budgetTo: 60000, verified: true, featured: true, days: 210, phone: '+880 1819-226734', email: 'rafi@rafitech.com.bd', stats: { views: 2630, requests: 31, accepted: 22 } }),
    P({ id: 'pt-sadia', handle: 'sadia-afrin', type: 'model', name: 'Sadia Afrin', photo: PH.saree, cover: PH.saree, city: 'Dhaka',
      niches: ['Fashion', 'Lifestyle'], bio: 'Fashion model for sarees, salwar kameez and modest wear. Catalogue, lookbook and on-location shoots; I bring my own make-up artist on request.',
      platforms: [pl('instagram', 'sadia.afrin.official', 38200), pl('facebook', 'sadiaafrinmodel', 22100)],
      samples: [ph(PH.saree, 'Eid saree catalogue for an online boutique'), vd('https://instagram.com/reel/sadia1', 'Lookbook reel: 6 sarees, 1 minute'), vd('https://instagram.com/reel/sadia2', 'Unboxing a boutique parcel')],
      packages: [pk('half', 'Half-day shoot (4 hours)', 15000, ['Up to 15 looks', 'Studio or your shop', 'You get the photographer’s files']), pk('full', 'Full-day shoot (8 hours)', 26000, ['Up to 30 looks', 'One location change', 'One reel posted on my Instagram'])],
      budgetFrom: 15000, budgetTo: 30000, verified: true, days: 95, phone: '+880 1715-903318', email: 'sadia.afrin.model@gmail.com', stats: { views: 940, requests: 12, accepted: 9 } }),
    P({ id: 'pt-tasnim', handle: 'tasnim-chowdhury', type: 'model', name: 'Tasnim Chowdhury', photo: PH.curly, cover: PH.curly, city: 'Chattogram',
      niches: ['Fashion', 'Beauty'], bio: 'Studio and outdoor model in Chattogram. Western wear, prints and jewellery; comfortable in front of video too.',
      platforms: [pl('instagram', 'tasnim.ctg', 27400), pl('tiktok', 'tasnimctg', 15200)],
      samples: [ph(PH.curly, 'Print shirt campaign, studio'), vd('https://tiktok.com/@tasnimctg/video/3', 'Jewellery try-on'), vd('https://instagram.com/reel/tasnim2', 'Outdoor shoot at Patenga')],
      packages: [pk('half', 'Half-day shoot', 10000, ['Up to 12 looks', 'Studio in Chattogram']), pk('reel', 'Shoot and a reel', 16000, ['Half-day shoot', 'One reel on my Instagram'])],
      budgetFrom: 10000, budgetTo: 20000, days: 60, phone: '+880 1816-552047', email: 'tasnim.chowdhury.ctg@gmail.com', stats: { views: 410, requests: 5, accepted: 3 } }),
    P({ id: 'pt-ayesha', handle: 'ayesha-siddika', type: 'influencer', name: 'Ayesha Siddika', photo: PH.denim, cover: PH.denim, city: 'Dhaka',
      niches: ['Fashion', 'Lifestyle', 'Travel'], bio: 'Everyday fashion, cafés and weekend trips. My followers are mostly women 18–30 in Dhaka and Chattogram who shop online.',
      platforms: [pl('instagram', 'ayesha.siddika', 128000), pl('facebook', 'ayeshasiddikaofficial', 210000), pl('tiktok', 'ayesha.sid', 75000)],
      samples: [ph(PH.denim, 'Denim edit for a Banani label'), vd('https://instagram.com/reel/ayesha1', 'Three ways to wear one kurti'), vd('https://facebook.com/ayeshasiddikaofficial/videos/3', 'Cox’s Bazar packing list')],
      packages: [pk('post', 'Instagram post and 3 stories', 15000, ['1 feed post', '3 stories with your link', 'Stays up for good']), pk('fb', 'Facebook post', 10000, ['1 post with your page tagged']), pk('month', 'Campaign month', 48000, ['4 posts and 8 stories', 'Monthly result report'])],
      budgetFrom: 10000, budgetTo: 50000, verified: true, featured: true, days: 120, phone: '+880 1711-670925', email: 'hello@ayeshasiddika.com', stats: { views: 2210, requests: 27, accepted: 19 } }),
    P({ id: 'pt-kamal', handle: 'kamal-hossain', type: 'model', name: 'Kamal Hossain', photo: PH.suit, cover: PH.suit, city: 'Dhaka',
      niches: ['Fashion', 'Lifestyle'], bio: 'Mature model for suits, panjabi, watches and corporate shoots. 12 years in front of the camera.',
      platforms: [pl('facebook', 'kamalhossainmodel', 14300), pl('instagram', 'kamal.h.model', 9100)],
      samples: [ph(PH.suit, 'Suit campaign at dusk, Gulshan'), vd('https://youtube.com/watch?v=kamal1', 'Watch brand film (30 seconds)'), vd('https://facebook.com/kamalhossainmodel/videos/2', 'Panjabi lookbook')],
      packages: [pk('half', 'Half-day shoot', 18000, ['Up to 10 looks', 'Studio or on location'])],
      budgetFrom: 18000, budgetTo: 35000, availability: 'busy', days: 75, phone: '+880 1713-118220', email: 'kamal.h.model@gmail.com', stats: { views: 320, requests: 4, accepted: 3 } }),
    P({ id: 'pt-shahriar', handle: 'sylhet-foodie', type: 'influencer', name: 'Shahriar Ahmed', city: 'Sylhet',
      niches: ['Food', 'Travel'], languages: ['Bangla', 'Sylheti', 'English'], bio: 'Sylhet Foodie: honest food reviews from Sylhet’s restaurants, tea gardens and street stalls.',
      platforms: [pl('facebook', 'sylhetfoodie', 410000), pl('youtube', 'sylhetfoodie', 88000)],
      samples: [vd('https://facebook.com/sylhetfoodie/videos/1', 'Best shatkora beef in Zindabazar'), vd('https://youtube.com/watch?v=sf2', 'Tea garden café tour'), vd('https://facebook.com/sylhetfoodie/videos/3', 'Opening day at a new bakery')],
      packages: [pk('video', 'Food review video', 14000, ['3–5 minute video', 'Posted on Facebook and YouTube']), pk('post', 'Facebook post and story', 7000, ['Photo post', 'Story with location'])],
      budgetFrom: 7000, budgetTo: 25000, verified: true, days: 180, phone: '+880 1716-334590', email: 'sylhetfoodie@gmail.com', stats: { views: 1270, requests: 14, accepted: 11 } }),
    P({ id: 'pt-mithila', handle: 'mitus-kitchen', type: 'creator', name: 'Mithila Rahman', city: 'Chattogram',
      niches: ['Food', 'Home'], bio: 'Mitu’s Kitchen: home recipes with everyday kitchen tools. I show your product in a real recipe, start to finish.',
      platforms: [pl('youtube', 'mituskitchen', 145000), pl('facebook', 'mituskitchenbd', 260000)],
      samples: [vd('https://youtube.com/watch?v=mitu1', 'Beef kala bhuna in a non-stick pan'), vd('https://youtube.com/watch?v=mitu2', 'Five-minute breakfast with an air fryer'), vd('https://facebook.com/mituskitchenbd/videos/3', 'Eid dessert table')],
      packages: [pk('recipe', 'Recipe video with your product', 16000, ['6–10 minute recipe', 'Product shown and named', 'Link in the description'])],
      budgetFrom: 16000, budgetTo: 30000, days: 160, phone: '+880 1819-772615', email: 'mituskitchenbd@gmail.com', stats: { views: 880, requests: 9, accepted: 7 } }),
    P({ id: 'pt-imran', handle: 'imran-fit', type: 'influencer', name: 'Imran Hossain', city: 'Dhaka',
      niches: ['Fitness', 'Lifestyle'], bio: 'Home workouts, healthy food on a budget and gym gear that lasts.',
      platforms: [pl('instagram', 'imran.fit.bd', 54000), pl('tiktok', 'imranfitbd', 41000)],
      samples: [vd('https://instagram.com/reel/imran1', '15 minute home workout'), vd('https://tiktok.com/@imranfitbd/video/2', 'Smart band after 30 days'), ph(PR('cat-WR-BND-08'), 'Smart band product shot')],
      packages: [pk('reel', 'Reel with your product', 9000, ['30–45 second reel', 'Posted on Instagram and TikTok'])],
      budgetFrom: 9000, budgetTo: 20000, availability: 'away', days: 50, phone: '+880 1715-660412', email: 'imran.fit.bd@gmail.com', stats: { views: 530, requests: 6, accepted: 4 } }),
    P({ id: 'pt-arif', handle: 'arif-makes', type: 'creator', name: 'Arif Mahmud', city: 'Dhaka',
      niches: ['Tech', 'Lifestyle'], bio: 'Short videos for online shops: behind the scenes, how we pack, product demos. Phone-shot, fast, ready for ads.',
      platforms: [pl('tiktok', 'arif.makes', 22000), pl('instagram', 'arif.makes', 8300)],
      samples: [ph(PH.packing, 'How we pack: behind-the-scenes for an online shop'), ph(PR('p-charger-20'), 'Charger demo thumbnail'), vd('https://tiktok.com/@arif.makes/video/3', 'Power bank drop test')],
      packages: [pk('three', '3 short videos', 9000, ['3 videos, 15–30 seconds', 'Vertical, ready for ads', 'Two changes']), pk('ten', '10 short videos', 25000, ['10 videos', 'Filmed in one visit to your shop'])],
      budgetFrom: 9000, budgetTo: 25000, days: 30, phone: '+880 1610-447120', email: 'arif.makes@gmail.com', stats: { views: 260, requests: 3, accepted: 2 } }),
    // waiting for review
    P({ id: 'pt-lamia', handle: 'lamia-haque', type: 'influencer', name: 'Lamia Haque', city: 'Sylhet', status: 'applied', reviewedAt: null, reviewedBy: '',
      niches: ['Beauty', 'Fashion'], bio: 'Make-up looks for brides and parties, and honest product reviews. Based in Sylhet.',
      platforms: [pl('instagram', 'lamia.beauty', 24300), pl('tiktok', 'lamiabeauty', 31800)],
      samples: [vd('https://tiktok.com/@lamiabeauty/video/1', 'Bridal look in 5 steps'), vd('https://instagram.com/reel/lamia2', 'Lipstick swatches: 8 shades'), vd('https://instagram.com/reel/lamia3', 'Party look under ৳2,000'), vd('https://tiktok.com/@lamiabeauty/video/4', 'Foundation for humid weather')],
      packages: [pk('reel', 'Reel and 2 stories', 7000, ['1 reel', '2 stories with your link'])],
      budgetFrom: 7000, budgetTo: 15000, joinedAt: null, appliedAt: t - 1.2 * DAY, phone: '+880 1716-209941', email: 'lamia.beauty@gmail.com' }),
    P({ id: 'pt-jannat', handle: 'jannat-vlogs', type: 'creator', name: 'Jannatul Ferdous', city: 'Dhaka', status: 'applied', reviewedAt: null, reviewedBy: '',
      niches: ['Lifestyle', 'Travel'], bio: 'Jannat Vlogs: day-in-my-life videos, small trips and shop visits around Dhaka.',
      platforms: [pl('youtube', 'jannatvlogs', 18400), pl('facebook', 'jannatvlogsbd', 12600)],
      samples: [vd('https://youtube.com/watch?v=jv1', 'A day at Hatirjheel'), vd('https://youtube.com/watch?v=jv2', 'Shopping haul from Bashundhara City'), vd('https://youtube.com/watch?v=jv3', 'Weekend in Srimangal')],
      packages: [pk('vlog', 'Shop visit vlog', 12000, ['8–12 minute vlog', 'Your shop named and shown'])],
      budgetFrom: 12000, budgetTo: 20000, joinedAt: null, appliedAt: t - 0.4 * DAY, phone: '+880 1913-560238', email: 'jannatvlogs@gmail.com' }),
    P({ id: 'pt-nafis', handle: 'nafis-gadgets', type: 'influencer', name: 'Nafis Iqbal', city: 'Chattogram', status: 'applied', reviewedAt: null, reviewedBy: '',
      niches: ['Gadgets', 'Tech'], bio: 'New gadget pages in Chattogram. Short reviews of earbuds and phone accessories.',
      platforms: [pl('instagram', 'nafis.gadgets', 1900)],
      samples: [vd('https://instagram.com/reel/nafis1', 'Earbuds under ৳1,500'), vd('https://instagram.com/reel/nafis2', 'Car phone holder test')],
      packages: [pk('reel', 'Reel review', 3000, ['1 reel on Instagram'])],
      budgetFrom: 3000, budgetTo: 6000, phoneVerified: true, idChecked: true, joinedAt: null, appliedAt: t - 2.5 * DAY, phone: '+880 1835-110274', email: 'nafis.iqbal.ctg@gmail.com' }),
    // suspended
    P({ id: 'pt-rubel', handle: 'rubel-life', type: 'influencer', name: 'Rubel Mia', city: 'Dhaka', status: 'suspended', reason: 'Bought followers: most of the audience did not look real when we checked on 2 October.',
      niches: ['Lifestyle'], bio: 'Lifestyle and comedy shorts.',
      platforms: [pl('facebook', 'rubellife', 95000)],
      samples: [vd('https://facebook.com/rubellife/videos/1', 'Comedy short'), vd('https://facebook.com/rubellife/videos/2', 'Market day vlog'), vd('https://facebook.com/rubellife/videos/3', 'Phone case review')],
      packages: [pk('post', 'Facebook video', 6000, ['1 video post'])],
      budgetFrom: 6000, budgetTo: 10000, days: 100, phone: '+880 1717-883301', email: 'rubel.life@gmail.com', stats: { views: 610, requests: 4, accepted: 2 } }),
  ];
}

function requestsSeed(t) {
  const M = (from, text, hoursAgo) => ({ from, text, at: t - hoursAgo * H });
  const R = (x) => ({ packageId: null, budget: 0, wantedBy: '', messages: [], contactShared: false, rating: null, acceptedAt: null, doneAt: null, cancelledBy: '', reason: '', ...x });
  const dateIn = (days) => new Date(t + days * DAY).toISOString().slice(0, 10);
  const other = (name) => ({ name, phone: '+880 1700-000000', email: 'hello@example.com' });
  return [
    R({ id: 'PR-1001', shopId: SELF_SHOP, shopName: SELF_NAME, shopContact: { ...SELF_CONTACT }, partnerId: 'pt-rafi', packageId: 'full', budget: 35000, wantedBy: dateIn(9), at: t - 6 * DAY,
      brief: 'A full review of the Redmi Note 13 we sell, filmed at our Dhanmondi branch. Please mention our 6-month warranty and free delivery inside Dhaka.', status: 'accepted', contactShared: true, acceptedAt: t - 5 * DAY,
      messages: [M('shop', 'A full review of the Redmi Note 13 we sell, filmed at our Dhanmondi branch. Please mention our 6-month warranty and free delivery inside Dhaka.', 144), M('partner', 'Happy to do it. I can film next Tuesday afternoon at Dhanmondi.', 122), M('system', 'Rafiul Karim accepted. You can now see each other’s phone and email.', 122), M('shop', 'Tuesday works. Ask for Mehedi at the counter.', 118)] }),
    R({ id: 'PR-1002', shopId: SELF_SHOP, shopName: SELF_NAME, shopContact: { ...SELF_CONTACT }, partnerId: 'pt-ayesha', packageId: 'post', budget: 15000, wantedBy: dateIn(14), at: t - 20 * H,
      brief: 'One Instagram post and stories with our new phone cases and ring holders. We can send the products to you.', status: 'sent',
      messages: [M('shop', 'One Instagram post and stories with our new phone cases and ring holders. We can send the products to you.', 20)] }),
    R({ id: 'PR-1003', shopId: SELF_SHOP, shopName: SELF_NAME, shopContact: { ...SELF_CONTACT }, partnerId: 'pt-arif', packageId: 'three', budget: 9000, wantedBy: dateIn(-12), at: t - 30 * DAY,
      brief: 'Three short videos of our power banks and chargers for Facebook ads.', status: 'done', contactShared: true, acceptedAt: t - 29 * DAY, doneAt: t - 18 * DAY,
      rating: { stars: 5, text: 'Quick, friendly and the videos worked well in our ads.', at: t - 18 * DAY },
      messages: [M('shop', 'Three short videos of our power banks and chargers for Facebook ads.', 720), M('partner', 'Sure. I will come to the Mirpur branch on Saturday.', 700), M('system', 'Arif Mahmud accepted. You can now see each other’s phone and email.', 700), M('partner', 'All three videos are in your email.', 440), M('system', 'Dazzle Shop marked this done.', 432)] }),
    R({ id: 'PR-1004', shopId: '0007', shopName: 'Rongdhonu Fashion', shopContact: other('Rongdhonu Fashion'), partnerId: 'pt-sadia', packageId: 'full', budget: 26000, wantedBy: dateIn(5), at: t - 4 * DAY,
      brief: 'Full-day catalogue shoot for our Puja collection: 25 sarees.', status: 'accepted', contactShared: true, acceptedAt: t - 3.5 * DAY,
      messages: [M('shop', 'Full-day catalogue shoot for our Puja collection: 25 sarees.', 96), M('partner', 'Yes, I am free that day.', 84), M('system', 'Sadia Afrin accepted. You can now see each other’s phone and email.', 84)] }),
    R({ id: 'PR-1005', shopId: '0044', shopName: 'Bindu Beauty', shopContact: other('Bindu Beauty'), partnerId: 'pt-nadia', packageId: 'bundle', budget: 18000, wantedBy: dateIn(3), at: t - 3 * DAY,
      brief: 'Three reels for our sunscreen launch.', status: 'declined',
      messages: [M('shop', 'Three reels for our sunscreen launch.', 72), M('partner', 'Thank you! I am fully booked until November. Please ask me again then.', 60)] }),
    R({ id: 'PR-1006', shopId: '0072', shopName: 'Sabuj Bazar', shopContact: other('Sabuj Bazar'), partnerId: 'pt-shahriar', packageId: 'video', budget: 14000, wantedBy: dateIn(10), at: t - 9 * H,
      brief: 'A video at our new grocery shop in Amberkhana: fresh fish and local sweets.', status: 'sent',
      messages: [M('shop', 'A video at our new grocery shop in Amberkhana: fresh fish and local sweets.', 9)] }),
    R({ id: 'PR-1008', shopId: '0012', shopName: 'Mohona Traders', shopContact: other('Mohona Traders'), partnerId: 'pt-nadia', packageId: 'reel', budget: 8000, wantedBy: dateIn(7), at: t - 5 * H,
      brief: 'One TikTok with our new aloe vera gel. We will send 2 bottles to you.', status: 'sent',
      messages: [M('shop', 'One TikTok with our new aloe vera gel. We will send 2 bottles to you.', 5)] }),
    R({ id: 'PR-1007', shopId: '0031', shopName: 'Dhaka Gadget Hub', shopContact: other('Dhaka Gadget Hub'), partnerId: 'pt-rubel', packageId: 'post', budget: 6000, wantedBy: dateIn(-20), at: t - 25 * DAY,
      brief: 'One video about our phone cases.', status: 'cancelled', cancelledBy: 'GridCommerce', reason: 'The partner was suspended.',
      messages: [M('shop', 'One video about our phone cases.', 600), M('system', 'GridCommerce cancelled this request: the partner was suspended.', 400)] }),
  ];
}

const SETTINGS = () => ({
  standards: { minFollowers: { model: 1000, influencer: 5000, creator: 3000 }, minSamples: 3, phoneVerified: true, idChecked: true, rateCard: true },
  niches: DEFAULT_NICHES.slice(), cities: DEFAULT_CITIES.slice(),
});
function seed(t) {
  return { v: DB_VERSION, partners: partnersSeed(t), requests: requestsSeed(t), settings: SETTINGS(), seq: { request: 1009, partner: 1 } };
}

// ---- storage ---------------------------------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
let EMPTY = null;
const empty = () => { if (!EMPTY) EMPTY = { ...seed(0), requests: [] }; return EMPTY; };
export function read() {
  if (!isBrowser) return empty();
  let raw = null;
  try { raw = window.localStorage.getItem(PT_KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== DB_VERSION) { db = seed(now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(PT_KEY, raw); cache = { raw, db }; if (!quiet) window.dispatchEvent(new CustomEvent(PT_EVENT)); } catch { /* ignore */ }
}
export function commit(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}
const fail = (error, field) => ({ ok: false, error, field });
const clean = (x) => String(x == null ? '' : x).trim();
const amt = (x) => Math.round(Number(String(x == null ? '' : x).replace(/[^0-9.]/g, '')) || 0);
const hist = (p, t, by, text) => { p.history = [{ at: t, by: by || 'Staff', text }, ...(p.history || [])].slice(0, 40); };

// ---- reading -----------------------------------------------------------------------------------------------------------
export const settings = () => ({ ...SETTINGS(), ...(read().settings || {}) });
export const getPartners = (status) => read().partners.filter((p) => !status || p.status === status);
export const partnerById = (id) => read().partners.find((p) => p.id === id) || null;
export const partnerByHandle = (h) => { const k = String(h || '').toLowerCase(); return read().partners.find((p) => p.handle === k) || null; };
/** The partner stores and the public may see: approved only. */
export const publicPartner = (h) => { const p = partnerByHandle(h); return p && p.status === 'approved' ? p : null; };
export const livePartners = () => getPartners('approved');
export const getRequests = ({ shopId, partnerId } = {}) => read().requests.filter((r) => (!shopId || r.shopId === shopId) && (!partnerId || r.partnerId === partnerId)).slice().sort((a, b) => lastAt(b) - lastAt(a));
export const requestById = (id) => read().requests.find((r) => r.id === id) || null;
export const lastAt = (r) => Math.max(r.at || 0, ...(r.messages || []).map((m) => m.at || 0));
export const lastMessage = (r) => { const m = (r.messages || []).slice().reverse().find((x) => x.from !== 'system') || (r.messages || [])[r.messages.length - 1]; return m || null; };
export const packageOf = (p, id) => ((p && p.packages) || []).find((x) => x.id === id) || null;
/** { avg, count, list[{ shop, stars, text, at }] } from stores' ratings of done requests. */
export function ratingOf(partnerId) {
  const list = read().requests.filter((r) => r.partnerId === partnerId && r.rating && r.rating.stars).map((r) => ({ shop: r.shopName, stars: r.rating.stars, text: r.rating.text, at: r.rating.at }));
  return { avg: list.length ? list.reduce((a, x) => a + x.stars, 0) / list.length : 0, count: list.length, list: list.sort((a, b) => b.at - a.at) };
}
/** Phone and email for each side — only once the partner has accepted. */
export function contactOf(r) {
  if (!r || !r.contactShared || !['accepted', 'done'].includes(r.status)) return null;
  const p = partnerById(r.partnerId);
  return { partner: p ? { name: p.name, phone: p.phone, email: p.email } : null, shop: { name: (r.shopContact && r.shopContact.name) || r.shopName, phone: (r.shopContact && r.shopContact.phone) || '', email: (r.shopContact && r.shopContact.email) || '' } };
}

// ---- standards -------------------------------------------------------------------------------------------------------
/** The minimum standards for approval: [{ key, label, ok, detail }]. */
export function checkStandards(p, st) {
  const s = (st || settings()).standards;
  const min = Number((s.minFollowers || {})[p.type]) || 0;
  const top = topPlatform(p);
  const n = (p.samples || []).filter((x) => x.src || x.link).length;
  const priced = (p.packages || []).filter((x) => clean(x.name) && Number(x.price) > 0).length;
  const out = [
    { key: 'followers', label: `At least ${min.toLocaleString('en-IN')} followers on one platform`, ok: !!top && top.followers >= min, detail: top ? `${followersText(top.followers)} on ${netLabel(top.net)}` : 'No platform added' },
    { key: 'samples', label: `At least ${s.minSamples} samples of work`, ok: n >= (Number(s.minSamples) || 0), detail: `${n} sample${n === 1 ? '' : 's'}` },
  ];
  if (s.phoneVerified) out.push({ key: 'phone', label: 'Phone number checked with a code', ok: !!p.phoneVerified, detail: p.phoneVerified ? p.phone : 'Not checked' });
  if (s.idChecked) out.push({ key: 'id', label: 'ID checked (national ID or passport)', ok: !!p.idChecked, detail: p.idChecked ? 'Declared and checked' : 'Not checked' });
  if (s.rateCard) out.push({ key: 'rates', label: 'A rate card with at least one priced package', ok: priced > 0, detail: priced ? `${priced} package${priced === 1 ? '' : 's'}, from ${tk(fromPrice(p))}` : 'No prices' });
  return out;
}
export const canApprove = (p) => checkStandards(p).every((x) => x.ok);
export const standardsPassed = (p) => { const c = checkStandards(p); return { n: c.filter((x) => x.ok).length, of: c.length }; };

/** How complete a profile is: { pct, missing[] } (for the partner's Home). */
export function completeness(p) {
  const items = [
    ['Profile photo', !!p.photo], ['Cover picture', !!p.cover], ['About you (40+ letters)', clean(p.bio).length >= 40], ['At least 2 niches', (p.niches || []).length >= 2],
    ['A platform with followers', !!topPlatform(p)], ['3 or more samples', (p.samples || []).length >= 3], ['A priced package', fromPrice(p) > 0], ['Your budget range', !!p.budgetFrom],
  ];
  return { pct: Math.round((items.filter((x) => x[1]).length / items.length) * 100), missing: items.filter((x) => !x[1]).map((x) => x[0]) };
}

// ---- checking and saving a profile ----------------------------------------------------------------------------------------
export function handleProblem(handle, exceptId) {
  const h = String(handle || '');
  if (h.length < 3) return 'Use at least 3 letters for your link.';
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(h)) return 'Use small English letters, numbers and dashes only.';
  if (read().partners.some((p) => p.handle === h && p.id !== exceptId)) return 'That link is taken. Try another.';
  return '';
}
function cleanProfile(f, st) {
  const x = {};
  const has = (k) => k in f;
  if (has('name')) x.name = clean(f.name);
  if (has('handle')) x.handle = toHandle(f.handle);
  if (has('type')) x.type = TYPES[f.type] ? f.type : 'influencer';
  if (has('city')) x.city = clean(f.city);
  if (has('niches')) x.niches = [...new Set((f.niches || []).map(clean).filter(Boolean))].slice(0, 6);
  if (has('languages')) x.languages = [...new Set((f.languages || []).map(clean).filter(Boolean))];
  if (has('bio')) x.bio = clean(f.bio).slice(0, 600);
  if (has('photo')) x.photo = f.photo || '';
  if (has('cover')) x.cover = f.cover || '';
  if (has('platforms')) x.platforms = (f.platforms || []).filter((p) => NETS[p.net] && (clean(p.handle) || amt(p.followers))).map((p) => ({ net: p.net, handle: clean(p.handle).replace(/^@/, ''), followers: amt(p.followers), url: clean(p.url) }));
  if (has('samples')) x.samples = (f.samples || []).filter((s) => s.src || clean(s.link)).slice(0, 12).map((s) => ({ kind: s.kind === 'video' ? 'video' : 'photo', src: s.src || '', link: clean(s.link), caption: clean(s.caption) }));
  if (has('packages')) x.packages = (f.packages || []).filter((p) => clean(p.name) || amt(p.price)).slice(0, 6).map((p, i) => ({ id: p.id || 'pkg' + (i + 1) + Math.random().toString(36).slice(2, 5), name: clean(p.name), price: amt(p.price), includes: (Array.isArray(p.includes) ? p.includes : String(p.includes || '').split('\n')).map(clean).filter(Boolean) }));
  if (has('budgetFrom')) x.budgetFrom = amt(f.budgetFrom);
  if (has('budgetTo')) x.budgetTo = amt(f.budgetTo);
  if (has('availability')) x.availability = AVAIL[f.availability] ? f.availability : 'open';
  if (has('phone')) x.phone = clean(f.phone);
  if (has('email')) x.email = clean(f.email);
  if (has('idChecked')) x.idChecked = !!f.idChecked;
  void st;
  return x;
}
function profileProblem(x, id) {
  if ('name' in x && x.name.length < 2) return fail('Write your name.', 'name');
  if ('handle' in x) { const h = handleProblem(x.handle, id); if (h) return fail(h, 'handle'); }
  if ('city' in x && !x.city) return fail('Pick your city.', 'city');
  if ('niches' in x && !x.niches.length) return fail('Pick at least one niche.', 'niches');
  if ('platforms' in x && !x.platforms.length) return fail('Add at least one platform with followers.', 'platforms');
  if ('packages' in x && x.packages.some((p) => !p.name || !p.price)) return fail('Each package needs a name and a price.', 'packages');
  if ('budgetTo' in x && x.budgetTo && x.budgetFrom && x.budgetTo < x.budgetFrom) return fail('The top of your budget is below the start.', 'budget');
  if ('phone' in x && x.phone.replace(/\D/g, '').length < 11) return fail('Write a full mobile number.', 'phone');
  if ('email' in x && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.email)) return fail('Write a working email.', 'email');
  return null;
}

/** A creator applies (/grid-partners/join): → status 'applied', signed in. f.phoneVerified must come from verifyCode. */
export function applyAsPartner(f) {
  const x = cleanProfile({ niches: [], languages: ['Bangla'], platforms: [], samples: [], packages: [], ...f });
  const bad = profileProblem(x, null);
  if (bad) return bad;
  if (!f.phoneVerified) return fail('Check your phone number with the code first.', 'phone');
  if (!f.idChecked) return fail('Confirm that you will show your ID.', 'id');
  return commit((db, t) => {
    const id = 'pt-' + x.handle;
    if (db.partners.some((p) => p.id === id)) return fail('That link is taken. Try another.', 'handle');
    const p = { id, ...x, verified: false, featured: false, phoneVerified: true, idChecked: true, status: 'applied', reason: '', appliedAt: t, joinedAt: null, reviewedAt: null, reviewedBy: '', stats: { views: 0, requests: 0, accepted: 0 }, availability: x.availability || 'open', history: [] };
    hist(p, t, p.name, 'Applied');
    db.partners.push(p);
    return { ok: true, partner: p };
  });
}
/** The partner (or staff) edits a profile. Name and photo of an approved profile go live at once. */
export function savePartner(id, f, by) {
  const x = cleanProfile(f);
  const bad = profileProblem(x, id);
  if (bad) return bad;
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p) return fail('This profile is not here.');
    if ('phone' in x && x.phone !== p.phone) { x.phoneVerified = !!f.phoneVerified; if (!x.phoneVerified) return fail('Check the new phone number with the code.', 'phone'); }
    Object.assign(p, x);
    hist(p, t, by || p.name, 'Profile changed');
    return { ok: true, partner: p };
  });
}
/** A rejected partner sends the profile again. */
export function resubmit(id) {
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p || p.status !== 'rejected') return fail('Only a rejected profile can be sent again.');
    p.status = 'applied'; p.appliedAt = t; hist(p, t, p.name, 'Sent again for review');
    return { ok: true };
  });
}

// ---- staff ---------------------------------------------------------------------------------------------------------------
export function approvePartner(id, by) {
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p) return fail('This profile is not here.');
    if (!checkStandards(p, db.settings).every((x) => x.ok)) return fail('Not every minimum standard is met.');
    p.status = 'approved'; p.reason = ''; p.reviewedAt = t; p.reviewedBy = by || 'Staff'; p.joinedAt = p.joinedAt || t;
    hist(p, t, by, 'Approved');
    return { ok: true };
  });
}
export function rejectPartner(id, reason, by) {
  const why = clean(reason);
  if (!why) return fail('Write why: the creator sees it.', 'reason');
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p) return fail('This profile is not here.');
    p.status = 'rejected'; p.reason = why; p.reviewedAt = t; p.reviewedBy = by || 'Staff';
    hist(p, t, by, 'Rejected: ' + why);
    return { ok: true };
  });
}
export function suspendPartner(id, reason, by) {
  const why = clean(reason);
  if (!why) return fail('Write why: the partner sees it.', 'reason');
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p) return fail('This profile is not here.');
    p.status = 'suspended'; p.reason = why; p.featured = false;
    hist(p, t, by, 'Suspended: ' + why);
    return { ok: true };
  });
}
export function restorePartner(id, by) {
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p || p.status !== 'suspended') return fail('Only a suspended partner can be restored.');
    p.status = 'approved'; p.reason = '';
    hist(p, t, by, 'Restored');
    return { ok: true };
  });
}
export function setFlag(id, key, on, by) {
  if (!['verified', 'featured'].includes(key)) return fail('Unknown switch.');
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === id);
    if (!p) return fail('This profile is not here.');
    p[key] = !!on;
    hist(p, t, by, `${key === 'verified' ? 'Blue tick' : 'Featured'} ${on ? 'on' : 'off'}`);
    return { ok: true };
  });
}
export function saveSettings(patch) {
  return commit((db) => {
    const s = { ...SETTINGS(), ...(db.settings || {}) };
    if (patch.standards) {
      const p = patch.standards;
      s.standards = { ...s.standards, ...p, minFollowers: { ...s.standards.minFollowers, ...Object.fromEntries(Object.entries(p.minFollowers || {}).map(([k, v]) => [k, amt(v)])) }, minSamples: 'minSamples' in p ? Math.max(0, amt(p.minSamples)) : s.standards.minSamples };
    }
    if (patch.niches) s.niches = [...new Set(patch.niches.map(clean).filter(Boolean))];
    if (patch.cities) s.cities = [...new Set(patch.cities.map(clean).filter(Boolean))];
    db.settings = s;
    return { ok: true };
  });
}

/** Count a public or store view once per browser tab session. */
export function addView(id) {
  if (!isBrowser) return;
  const k = 'gc.partners.seen.' + id;
  try { if (window.sessionStorage.getItem(k)) return; window.sessionStorage.setItem(k, '1'); } catch { return; }
  commit((db) => { const p = db.partners.find((y) => y.id === id); if (p) p.stats = { ...(p.stats || {}), views: ((p.stats && p.stats.views) || 0) + 1 }; return { ok: true }; });
}

// ---- requests ------------------------------------------------------------------------------------------------------------
/** A store asks a partner for a quote. f = { shopId, shopName, shopContact, partnerId, packageId, brief, budget, wantedBy } */
export function sendRequest(f) {
  const brief = clean(f.brief);
  if (brief.length < 10) return fail('Say what you need in a sentence or two.', 'brief');
  const budget = amt(f.budget);
  if (!budget && !f.packageId) return fail('Pick a package or write your budget.', 'budget');
  if (f.wantedBy && f.wantedBy < new Date(now()).toISOString().slice(0, 10)) return fail('Pick a date from today on.', 'wantedBy');
  return commit((db, t) => {
    const p = db.partners.find((y) => y.id === f.partnerId);
    if (!p || p.status !== 'approved') return fail('This partner is not taking requests.');
    if (db.requests.some((r) => r.shopId === f.shopId && r.partnerId === p.id && r.status === 'sent')) return fail('You already have a request waiting with this partner.');
    const pkg = (p.packages || []).find((x) => x.id === f.packageId) || null;
    const id = 'PR-' + db.seq.request++;
    const r = { id, shopId: f.shopId, shopName: f.shopName, shopContact: { ...(f.shopContact || {}) }, partnerId: p.id, packageId: pkg ? pkg.id : null, brief, budget: budget || (pkg ? pkg.price : 0), wantedBy: f.wantedBy || '', status: 'sent', messages: [{ from: 'shop', text: brief, at: t }], contactShared: false, rating: null, at: t, acceptedAt: null, doneAt: null, cancelledBy: '', reason: '' };
    db.requests.push(r);
    p.stats = { ...(p.stats || {}), requests: ((p.stats && p.stats.requests) || 0) + 1 };
    return { ok: true, request: r };
  });
}
function onReq(id, fn) {
  return commit((db, t) => {
    const r = db.requests.find((x) => x.id === id);
    if (!r) return fail('This request is not here.');
    return fn(r, db, t);
  });
}
export function acceptRequest(id, note) {
  return onReq(id, (r, db, t) => {
    if (r.status !== 'sent') return fail('This request was already answered.');
    const p = db.partners.find((y) => y.id === r.partnerId);
    r.status = 'accepted'; r.contactShared = true; r.acceptedAt = t;
    if (clean(note)) r.messages.push({ from: 'partner', text: clean(note), at: t });
    r.messages.push({ from: 'system', text: `${p ? p.name : 'The partner'} accepted. You can now see each other’s phone and email.`, at: t + 1 });
    if (p) p.stats = { ...(p.stats || {}), accepted: ((p.stats && p.stats.accepted) || 0) + 1 };
    return { ok: true };
  });
}
export function declineRequest(id, note) {
  return onReq(id, (r, db, t) => {
    if (r.status !== 'sent') return fail('This request was already answered.');
    r.status = 'declined';
    r.messages.push(clean(note) ? { from: 'partner', text: clean(note), at: t } : { from: 'system', text: 'The partner declined.', at: t });
    return { ok: true };
  });
}
export function messageRequest(id, from, text) {
  const x = clean(text);
  if (!x) return fail('Write a message.');
  return onReq(id, (r, db, t) => {
    if (['cancelled', 'declined'].includes(r.status)) return fail('This request is closed.');
    r.messages.push({ from: from === 'partner' ? 'partner' : 'shop', text: x, at: t });
    return { ok: true };
  });
}
export function markDone(id) {
  return onReq(id, (r, db, t) => {
    if (r.status !== 'accepted') return fail('Only accepted work can be marked done.');
    r.status = 'done'; r.doneAt = t;
    r.messages.push({ from: 'system', text: `${r.shopName} marked this done.`, at: t });
    return { ok: true };
  });
}
export function rateRequest(id, stars, text) {
  const s = Math.round(Number(stars) || 0);
  if (s < 1 || s > 5) return fail('Pick 1 to 5 stars.');
  return onReq(id, (r, db, t) => {
    if (r.status !== 'done') return fail('Rate the work once it is done.');
    r.rating = { stars: s, text: clean(text), at: t };
    return { ok: true };
  });
}
/** The store withdraws a waiting request, or GridCommerce cancels any open one (with a reason). */
export function cancelRequest(id, reason, by) {
  const why = clean(reason);
  const staff = by && by !== 'shop';
  if (staff && !why) return fail('Write why: both sides see it.', 'reason');
  return onReq(id, (r, db, t) => {
    if (!['sent', 'accepted'].includes(r.status)) return fail('This request is already closed.');
    if (!staff && r.status !== 'sent') return fail('Accepted work can’t be withdrawn here. Talk to the partner.');
    r.status = 'cancelled'; r.cancelledBy = staff ? 'GridCommerce' : r.shopName; r.reason = why;
    r.messages.push({ from: 'system', text: staff ? `GridCommerce cancelled this request: ${why}` : `${r.shopName} withdrew the request.${why ? ' ' + why : ''}`, at: t });
    return { ok: true };
  });
}

// ---- phone code (demo) ------------------------------------------------------------------------------------------------------
/** Demo: "sends" a code to the phone. The code is always DEMO_CODE (1234). */
export function sendCode(phone) {
  if (String(phone || '').replace(/\D/g, '').length < 11) return fail('Write a full mobile number.', 'phone');
  return { ok: true, hint: 'Demo: the code is ' + DEMO_CODE };
}
export const verifyCode = (code) => (String(code || '').trim() === DEMO_CODE ? { ok: true } : fail('That code is not right. Demo code: ' + DEMO_CODE, 'code'));

// ---- partner session ---------------------------------------------------------------------------------------------------------
export function partnerSignIn(id) {
  if (!partnerById(id)) return fail('This profile is not on Grid Partners.');
  try { window.localStorage.setItem(PT_SESSION, JSON.stringify({ id, at: now() })); window.dispatchEvent(new CustomEvent(PT_EVENT)); } catch { /* ignore */ }
  return { ok: true };
}
export function partnerSignOut() {
  try { window.localStorage.removeItem(PT_SESSION); window.dispatchEvent(new CustomEvent(PT_EVENT)); } catch { /* ignore */ }
}
export function currentPartner() {
  if (!isBrowser) return null;
  try { const s = JSON.parse(window.localStorage.getItem(PT_SESSION) || 'null'); return s && s.id ? partnerById(s.id) : null; } catch { return null; }
}
