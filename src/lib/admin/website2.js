// admin/website2 — the super admin's Website area, part 2: the media library, campaign landing pages, the site's forms
// and what people sent through them (Overview, Media, Landing pages, Forms). Front end only: browser store `website2`
// (lib/admin/store.js). Nothing here touches gridcommerce.net: publishing, uploads and "send to CRM" change this demo's
// data only (a server would do it; see the comments on each action).
//
// What it is built from (the website repo, ~/Documents/gricommercev1, read-only):
//   media     the real files in its public/ folder (path, bytes, pixel size), alt text from src/data/screenshots.ts and
//             docs/ASSETS.md (where each file is used); a few uploads that are only in the library (downloads, videos)
//   forms     src/services/*.service.ts: signup (Trial signup), lead (Demo request, Free migration request, Newsletter),
//             contact (Contact) — field names and choices as the site's Signup.tsx / Contact.tsx have them; plus the
//             Lead magnet download form the landing pages use
//   pages     the site's routes (SITE_ROUTES, a fallback when lib/admin/website.js › websitePages() is not there)
//
//   webStore                         the store (useAdminStore(webStore) → { data, t, live })
//   media: addMedia · setAlt · replaceMedia · moveMedia · deleteMedia · mediaCounts · assetUrl · fmtBytes
//   landing pages: addLanding · setCampaign · setUtm · setLpForm · submitForReview · approve · sendBack · publish ·
//                  archive · restore · lpUrl · lpResults · lpDaily · lpCounts
//   forms: updateForm · setFormStatus · fixForm · formStats
//   submissions: sendToCrm · markSpam · notSpam · closeSubmissions · reopen · subCounts
//   overview(data, t, pages)          the Overview's figures, attention rows and latest submissions
// Change functions return { ok, error?, … } and log who did it (`by`: the signed-in staff member's name).

import { createStore } from '@/lib/admin/store';
import { DAY, rng, startOfDay, dm, dmy, hm } from '@/lib/platform/util';

export const SITE = 'https://gridcommerce.net';
export const SITE_HOST = 'gridcommerce.net';
export const assetUrl = (path) => SITE + '/' + String(path || '').replace(/^\/+/, '');

/** The people who edit and approve the website (GridCommerce staff; the first three edit, Mahin and Farhana approve). */
export const WEB_TEAM = [
  { name: 'Ayesha Siddiqua', title: 'Content lead' },
  { name: 'Tanvir Ahmed', title: 'Web designer' },
  { name: 'Tania Sultana', title: 'Sales' },
  { name: 'Mahin Khan', title: 'Admin' },
  { name: 'Farhana Akter', title: 'Support lead' },
];

/** The site's routes (src/app of the website), for the Overview when the Pages module is not there. */
export const SITE_ROUTES = [
  ['/', 'Home', 'Published'], ['/pricing', 'Pricing', 'Published'], ['/features', 'Features', 'Published'],
  ['/features/orders', 'Orders', 'Published'], ['/features/pos', 'Point of sale', 'Published'], ['/features/inventory', 'Inventory', 'Published'],
  ['/features/courier', 'Courier and COD', 'Published'], ['/features/omnichannel', 'Omnichannel inbox', 'Published'],
  ['/features/customers', 'Customers', 'Published'], ['/features/landing-pages', 'Landing pages', 'Published'],
  ['/features/storefront', 'Storefront', 'Published'], ['/features/analytics', 'Analytics', 'Published'],
  ['/features/automation', 'Automation', 'Published'], ['/features/payments', 'Payments', 'Published'],
  ['/features/warehouse', 'Warehouse', 'Published'], ['/features/offers-loyalty', 'Offers and loyalty', 'Published'],
  ['/features/cash-and-expenses', 'Cash and expenses', 'Published'], ['/features/staff-permissions', 'Staff and permissions', 'Published'],
  ['/features/sales-channels', 'Sales channels', 'Published'], ['/features/ai-product-creation', 'AI product creation', 'In review'],
  ['/features/cart-recovery', 'Cart recovery', 'Draft'], ['/features/reviews', 'Reviews', 'Draft'],
  ['/solutions/online-commerce', 'Online commerce', 'Published'], ['/solutions/retail-commerce', 'Retail commerce', 'Published'],
  ['/solutions/wholesale-commerce', 'Wholesale commerce', 'Published'], ['/customers', 'Customer stories', 'Published'],
  ['/migration', 'Free migration', 'Published'], ['/themes', 'Themes', 'Published'], ['/compare', 'Compare', 'In review'],
  ['/about', 'About', 'Published'], ['/contact', 'Contact', 'Published'], ['/blog', 'Blog', 'Published'],
  ['/help', 'Help centre', 'Published'], ['/status', 'Status', 'Published'], ['/signup', 'Start free', 'Published'],
  ['/login', 'Log in', 'Published'], ['/privacy', 'Privacy', 'Published'], ['/terms', 'Terms', 'Published'],
  ['/refund-policy', 'Refund policy', 'Published'], ['/data-policy', 'Data policy', 'Published'],
].map(([path, title, status]) => ({ path, title, status, type: path.startsWith('/features') ? 'Feature' : path.startsWith('/solutions') ? 'Solution' : 'Page' }));

// ---- formatting ---------------------------------------------------------------------------------------------------
export function fmtBytes(n) {
  const b = Number(n) || 0;
  if (b >= 1048576) return (b / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
  if (b >= 1024) return Math.round(b / 1024) + ' KB';
  return b + ' B';
}
export const pct = (x) => (x == null || !isFinite(x) ? '—' : (x * 100 >= 10 ? Math.round(x * 100) : (x * 100).toFixed(1).replace(/\.0$/, '')) + '%');

// ---- media --------------------------------------------------------------------------------------------------------
export const MEDIA_TYPES = [['image', 'Images'], ['icon', 'Icons & logos'], ['video', 'Video'], ['document', 'Documents']];

// path, bytes, width, height — the website's public/ folder as it is on 8 Oct 2026
const RAW = `
apps/app-store.webp 6188 358 120
apps/google-play.webp 6536 405 120
apps/qr-site.svg 1611 29 29
brand/gridcommerce-logo-white.png 60470 1059 215
brand/gridcommerce-logo.jpeg 53627 1600 979
brand/gridcommerce-logo.png 170326 1059 215
brand/gridcommerce-mark-white.png 9413 159 210
brand/gridcommerce-mark.png 32805 159 210
brand/gridcommerce-wordmark-white.png 69090 1061 210
brand/gridcommerce-wordmark.png 131912 1061 210
brand/icon.png 44159 256 256
brand/v2/apple-icon.png 13433 180 180
brand/v2/gridcommerce-logo-reverse.png 53821 1200 183
brand/v2/gridcommerce-logo.png 66857 1200 183
brand/v2/gridcommerce-mark.png 47752 240 306
brand/v2/gridcommerce-pattern.webp 243282 1000 1200
brand/v2/icon.png 89995 512 512
hero-lanes/handbag-1.webp 12216 488 488
hero-lanes/honey.webp 6338 488 488
hero-lanes/lentils.webp 72010 488 488
hero-lanes/mug.webp 12790 488 488
hero-lanes/phone-accessory.webp 1746 488 488
hero-lanes/saree-1.webp 66348 488 488
hero-lanes/saree-2.webp 40066 488 488
hero-lanes/skincare.webp 3382 488 488
hero-lanes/sneakers-1.webp 9596 488 488
hero-lanes/sunglasses.webp 3578 488 488
hero-lanes/three-piece.webp 45072 488 488
hero-lanes/watch-1.webp 12472 488 488
integrations/aamarpay.png 4580 282 57
integrations/bank-transfer.png 12684 256 242
integrations/bkash.png 25593 256 162
integrations/carrybee-dark-background.png 32889 480 162
integrations/carrybee.png 15525 512 173
integrations/dbbl.png 28152 256 156
integrations/ecourier-white.png 23892 480 80
integrations/ecourier.png 32556 480 116
integrations/email.png 15394 256 191
integrations/eps.png 3133 173 58
integrations/facebook-page.png 11430 256 256
integrations/google-ads.png 15128 256 229
integrations/google-analytics.png 9160 231 256
integrations/google-business.png 15393 160 160
integrations/instagram.png 46611 256 256
integrations/linkedin.png 4881 160 160
integrations/mastercard.png 11691 256 158
integrations/messenger.png 45435 256 256
integrations/meta-ads.png 22420 480 96
integrations/nagad.png 41293 480 168
integrations/paperfly.png 31440 480 113
integrations/pathao-white.png 24344 480 135
integrations/pathao.png 29108 480 136
integrations/paystation.png 23842 360 193
integrations/redx.png 13742 480 120
integrations/rocket.png 27512 256 161
integrations/sa-paribahan.png 50846 256 256
integrations/shopify.webp 10654 300 86
integrations/sms-gateway.png 15286 256 217
integrations/sslcommerz.png 3336 462 100
integrations/steadfast.png 28224 480 99
integrations/tiktok-ads.png 8636 256 256
integrations/tiktok-shop.png 8636 256 256
integrations/upay.png 18173 185 256
integrations/visa.png 22768 480 156
integrations/website-chat.png 12835 256 239
integrations/whatsapp-business.png 37292 256 256
integrations/wordpress.webp 20106 300 190
integrations/x.png 5110 160 160
integrations/youtube.png 4061 160 160
merchants/courier-cod-handover.webp 157386 1600 1200
merchants/courier-sorting-hub.webp 258528 1600 1200
merchants/hero-businessman-stockroom.webp 125778 1600 1200
merchants/merchant-boutique-owner.webp 190588 896 1120
merchants/merchant-boutique.webp 96434 1400 1050
merchants/merchant-cosmetics.webp 136818 1400 1050
merchants/merchant-electronics.webp 142886 1400 1050
merchants/merchant-grocery.webp 141630 1400 1050
merchants/merchant-home-business.webp 84282 1400 1050
merchants/merchant-packing-orders.webp 127836 1600 1200
merchants/merchant-product-photography-v2.webp 128512 1600 1200
merchants/merchant-rider.webp 92284 1400 1050
merchants/merchant-skincare-live.webp 123014 896 1120
merchants/merchant-warehouse-scan.webp 112170 896 1120
merchants/retail-counter-pos-v2.webp 208210 1600 1200
merchants/rider-loading-parcels.webp 122638 1600 900
merchants/wholesale-market-cartons.webp 194314 1600 1200
modules/analytics/hero.webp 206712 2880 1800
modules/analytics/phone.webp 113976 1170 2532
modules/analytics/s1.webp 127340 2252 1496
modules/analytics/s2.webp 76270 2148 980
modules/analytics/s3.webp 162124 2148 1482
modules/analytics/s4.webp 93216 2128 1510
modules/analytics/s5.webp 44822 1040 884
modules/automation/hero.webp 200162 2880 1800
modules/automation/phone.webp 95062 1170 2532
modules/automation/s1.webp 119882 2132 1090
modules/automation/s2.webp 116750 2210 1520
modules/automation/s3.webp 136964 2100 1330
modules/automation/s4.webp 91000 2100 1090
modules/automation/s5.webp 33760 2100 590
modules/cash-and-expenses/hero.webp 263744 2880 1800
modules/cash-and-expenses/phone.webp 97770 1170 2532
modules/cash-and-expenses/s1.webp 108424 1828 1010
modules/cash-and-expenses/s2.webp 90972 1828 968
modules/cash-and-expenses/s3.webp 78982 1828 1024
modules/cash-and-expenses/s4.webp 124900 2148 1140
modules/cash-and-expenses/s5.webp 89222 2128 1294
modules/courier/hero.webp 216526 2880 1800
modules/courier/phone.webp 97770 1170 2532
modules/courier/s1.webp 61108 2236 984
modules/courier/s2.webp 64220 2236 692
modules/courier/s3.webp 148898 2236 1560
modules/courier/s4.webp 67132 1280 1056
modules/courier/s5.webp 87302 1712 1340
modules/customers/hero.webp 206288 2880 1800
modules/customers/phone.webp 100634 1170 2532
modules/customers/s1.webp 104202 2252 1084
modules/customers/s2-phone.webp 88236 1170 2532
modules/customers/s2.webp 137664 2148 1236
modules/customers/s3.webp 38418 1440 800
modules/customers/s4.webp 71352 2252 880
modules/customers/s5.webp 141214 2252 1156
modules/inventory/hero.webp 206894 2880 1800
modules/inventory/phone.webp 113404 1170 2532
modules/inventory/s1.webp 105008 1860 916
modules/inventory/s2-phone.webp 92160 1170 2532
modules/inventory/s2.webp 104036 1448 1620
modules/inventory/s3-phone.webp 93160 1170 2532
modules/inventory/s3.webp 134054 2204 1480
modules/inventory/s4-phone.webp 107310 1170 2532
modules/inventory/s4.webp 128982 2204 1200
modules/inventory/s5-phone.webp 58080 1170 2532
modules/inventory/s5.webp 136448 2204 1334
modules/offers-loyalty/hero.webp 216798 2880 1800
modules/offers-loyalty/s1.webp 105452 2100 1400
modules/offers-loyalty/s2.webp 54282 2210 650
modules/offers-loyalty/s3.webp 142232 2210 1490
modules/offers-loyalty/s4.webp 108226 2210 1010
modules/offers-loyalty/s5.webp 79690 2220 840
modules/omnichannel/hero.webp 253402 2880 1800
modules/omnichannel/phone.webp 131268 1170 2532
modules/omnichannel/s1-phone.webp 100634 1170 2532
modules/omnichannel/s1.webp 108996 1650 1492
modules/omnichannel/s2.webp 108928 1650 1410
modules/omnichannel/s3.webp 75594 1398 1284
modules/omnichannel/s4.webp 57344 880 1800
modules/omnichannel/s5-phone.webp 76892 1170 2532
modules/omnichannel/s5.webp 150700 2236 1592
modules/orders/hero.webp 259274 2880 1800
modules/orders/phone.webp 95284 1170 2532
modules/orders/s1.webp 108292 2000 980
modules/orders/s2-phone.webp 88236 1170 2532
modules/orders/s2.webp 73098 2236 952
modules/orders/s3.webp 27156 756 750
modules/orders/s4-phone.webp 77400 1170 2532
modules/orders/s4.webp 25916 960 672
modules/orders/s5.webp 137800 2236 1436
modules/pos/hero.webp 236130 2880 1800
modules/pos/s1.webp 97570 1614 1090
modules/pos/s2.webp 107462 1840 1552
modules/pos/s3.webp 93922 2204 1160
modules/pos/s4.webp 60494 1520 1032
modules/pos/s5.webp 126230 2204 1610
modules/sales-channels/hero.webp 208036 2880 1800
modules/sales-channels/s1.webp 101432 2204 1150
modules/sales-channels/s2.webp 102728 2204 1150
modules/sales-channels/s3.webp 97726 1366 1648
modules/sales-channels/s4.webp 130612 2204 1066
modules/sales-channels/s5.webp 72736 2080 1394
modules/staff-permissions/hero.webp 184366 2880 1800
modules/staff-permissions/s1.webp 71830 2220 668
modules/staff-permissions/s2.webp 77710 1470 1220
modules/staff-permissions/s3.webp 127258 1600 870
modules/staff-permissions/s4.webp 167900 2210 1280
modules/staff-permissions/s5.webp 61424 2240 680
modules/storefront/hero.webp 256838 2880 1800
modules/storefront/s1.webp 110538 1502 1380
modules/storefront/s2.webp 41838 1728 1024
modules/storefront/s3.webp 51548 2064 940
modules/storefront/s4.webp 72044 2656 896
modules/storefront/s5.webp 182776 2236 1442
modules/warehouse/hero.webp 169564 2880 1800
modules/warehouse/phone.webp 97898 1170 2532
modules/warehouse/s1-phone.webp 79898 1170 2532
modules/warehouse/s1.webp 46460 2204 620
modules/warehouse/s2.webp 64392 2204 950
modules/warehouse/s3.webp 90028 2080 1254
modules/warehouse/s4.webp 126716 2204 1280
modules/warehouse/s5.webp 74714 880 1800
product-screens/customers-mobile.webp 27722 1100 538
product-screens/customers.webp 105196 2400 1173
product-screens/dashboard-mobile.webp 29456 1100 543
product-screens/dashboard.webp 115678 2400 1184
product-screens/landing-pages-mobile.webp 46274 864 1126
product-screens/landing-pages.webp 175494 2400 1186
product-screens/omnichannel-mobile.webp 41942 1100 727
product-screens/omnichannel.webp 176962 2400 1189
product-screens/orders-mobile.webp 22076 1100 397
product-screens/orders.webp 88960 2400 951
product-screens/pos-mobile.webp 49324 1100 702
product-screens/pos.webp 136502 2400 1090
product/abandoned-carts-m.webp 63748 780 1560
product/abandoned-carts.webp 118726 1920 1200
product/analytics-hub-m.webp 57328 780 1560
product/analytics-hub.webp 94696 1920 1200
product/courier-statement-m.webp 51606 780 1560
product/courier-statement.webp 98054 1920 1200
product/customer-profile-m.webp 63802 780 1560
product/customer-profile.webp 107668 1920 1200
product/daily-summary-m.webp 41768 780 1560
product/daily-summary.webp 76740 1920 1200
product/landing-page-builder-m.webp 45056 780 1560
product/landing-page-builder.webp 114896 1920 1200
product/merchant-inbox-m.webp 63102 780 1560
product/merchant-inbox.webp 101028 1920 1200
product/merchant-overview-m.webp 54404 780 1560
product/merchant-overview.webp 78608 1920 1200
product/order-detail-m.webp 46144 780 1560
product/order-detail.webp 87304 1920 1200
product/sales-profit-m.webp 51268 780 1560
product/sales-profit.webp 79634 1920 1200
product/settlements-m.webp 62580 780 1560
product/settlements.webp 88354 1920 1200
product/stock-activity-m.webp 75006 780 1560
product/stock-activity.webp 116144 1920 1200
product/stock-m.webp 69042 780 1560
product/stock.webp 90662 1920 1200
product/woo-sync-m.webp 57778 780 1560
product/woo-sync.webp 111506 1920 1200
themes/ameer-1.webp 36452 600 721
themes/ameer-2.webp 59068 600 1786
themes/blakora-1.webp 50952 600 930
themes/blakora-2.webp 35982 600 930
themes/delyo-1.webp 33652 600 765
themes/delyo-2.webp 57048 600 1295
themes/onskn-1.webp 29704 600 753
themes/onskn-2.webp 46072 600 1245
themes/visora-1.webp 28132 600 840
themes/visora-2.webp 33880 600 1059
`;

const FOLDER_OF = [
  [/^brand\/v2\//, 'Brand'], [/^brand\//, 'Brand (retired)'], [/^product-screens\//, 'Product screenshots'],
  [/^product\//, 'Product tours'], [/^merchants\//, 'Photography'], [/^integrations\//, 'Integration logos'],
  [/^apps\//, 'App badges'], [/^themes\//, 'Theme previews'], [/^hero-lanes\//, 'Homepage hero'], [/^modules\//, 'Feature pages'],
  [/^downloads\//, 'Downloads'], [/^video\//, 'Video'],
];
export const FOLDERS = FOLDER_OF.map(([, f]) => f).concat('Uploads');
const folderOf = (path) => (FOLDER_OF.find(([re]) => re.test(path)) || [null, 'Uploads'])[1];

const MODULE_NAME = {
  customers: 'Customers', 'staff-permissions': 'Staff and permissions', storefront: 'Storefront', courier: 'Courier and COD',
  'sales-channels': 'Sales channels', pos: 'Point of sale', omnichannel: 'Omnichannel inbox', inventory: 'Inventory',
  automation: 'Automation', orders: 'Orders', 'cash-and-expenses': 'Cash and expenses', warehouse: 'Warehouse',
  analytics: 'Analytics', 'offers-loyalty': 'Offers and loyalty',
};
const LOGO_NAME = {
  email: 'Email', eps: 'EPS', bkash: 'bKash', nagad: 'Nagad', pathao: 'Pathao', aamarpay: 'aamarPay', 'sms-gateway': 'SMS gateway',
  'sa-paribahan': 'SA Paribahan', instagram: 'Instagram', x: 'X', 'whatsapp-business': 'WhatsApp Business', carrybee: 'Carrybee',
  'google-business': 'Google Business Profile', 'meta-ads': 'Meta Ads', paystation: 'PayStation', 'google-analytics': 'Google Analytics',
  steadfast: 'Steadfast', 'bank-transfer': 'Bank transfer', shopify: 'Shopify', visa: 'Visa', 'google-ads': 'Google Ads', upay: 'Upay',
  'website-chat': 'Website chat', rocket: 'Rocket', messenger: 'Messenger', wordpress: 'WordPress', linkedin: 'LinkedIn',
  paperfly: 'Paperfly', 'tiktok-shop': 'TikTok Shop', ecourier: 'eCourier', sslcommerz: 'SSLCOMMERZ', youtube: 'YouTube',
  mastercard: 'Mastercard', redx: 'REDX', 'tiktok-ads': 'TikTok Ads', dbbl: 'DBBL', 'facebook-page': 'Facebook Page',
};
const PAY_LOGOS = /bkash|nagad|rocket|upay|sslcommerz|aamarpay|eps|paystation|visa|mastercard|dbbl|bank-transfer/;
const COURIER_LOGOS = /pathao|steadfast|redx|paperfly|ecourier|carrybee|sa-paribahan/;
const SCREEN_ALT = {
  orders: ['GridCommerce orders workspace showing awaiting action, in courier hands, delivery success and cash to collect, with status tabs and courier filters', 'অর্ডার ওয়ার্কস্পেস: অপেক্ষমাণ, কুরিয়ারে থাকা, ডেলিভারি আর সংগ্রহের টাকা'],
  omnichannel: ['GridCommerce shared inbox with Instagram, Facebook, WhatsApp and TikTok conversations, a linked order and the customer profile beside the thread', ''],
  pos: ['GridCommerce point of sale with warehouse and counter selection, product grid showing live stock, and a barcode scanner panel', 'গ্রিডকমার্স পয়েন্ট অব সেল: কাউন্টার, লাইভ স্টক আর বারকোড স্ক্যানার'],
  'landing-pages': ['GridCommerce landing page builder with a drag and drop part list, a Bangla mobile preview and the price and offer settings panel', ''],
  dashboard: ['GridCommerce dashboard overview showing revenue, profit, orders and purchases with a sales summary chart and fulfilment pipeline', ''],
  customers: ['GridCommerce customer list with total customers, repeat rate and lifetime value, segmented into repeat, VIP, at risk and COD only', 'কাস্টমার তালিকা: মোট কাস্টমার, রিপিট রেট আর লাইফটাইম ভ্যালু'],
};
const SCREEN_USE = { orders: ['/', '/features/orders'], omnichannel: ['/', '/features/omnichannel'], pos: ['/', '/features/pos'], 'landing-pages': ['/', '/features/landing-pages'], dashboard: [], customers: ['/', '/features/customers'] };
const PHOTO = {
  'merchant-boutique': [['/', '/customers'], 'A boutique owner folding a three-piece set behind her counter', 'দোকানের কাউন্টারে থ্রি-পিস ভাঁজ করছেন একজন বুটিক মালিক'],
  'merchant-electronics': [['/', '/customers'], 'An electronics shop owner checking a phone box against an order on his tablet', ''],
  'merchant-home-business': [['/', '/customers', '/about', '/blog'], 'A home business packing handmade orders at a kitchen table', 'রান্নাঘরের টেবিলে হাতে বানানো পণ্যের অর্ডার প্যাক করা হচ্ছে'],
  'merchant-cosmetics': [['/', '/customers', '/blog'], 'A cosmetics seller arranging skincare bottles for a live sale', ''],
  'merchant-grocery': [['/', '/migration'], 'A grocery shopkeeper with a ledger book beside his shelves', 'তাকের পাশে খাতা হাতে একজন মুদি দোকানি'],
  'merchant-rider': [['/', '/features/courier'], 'A courier rider handing over a parcel at a customer door', ''],
  'hero-businessman-stockroom': [['/'], 'A business owner in his stockroom checking stock on a phone', 'স্টকরুমে ফোনে স্টক দেখছেন একজন ব্যবসায়ী'],
  'courier-sorting-hub': [['/features/courier', '/blog'], 'Parcels being sorted by area at a courier hub in Dhaka', ''],
  'courier-cod-handover': [['/features/courier', '/blog'], 'A rider collecting cash on delivery from a customer', 'ডেলিভারির সময় ক্যাশ অন ডেলিভারি সংগ্রহ'],
  'merchant-packing-orders': [['/', '/solutions/online-commerce', '/customers'], 'A small team packing online orders with printed slips', ''],
  'retail-counter-pos-v2': [['/solutions/retail-commerce', '/customers', '/blog'], 'A cashier scanning a barcode at a retail counter', 'রিটেইল কাউন্টারে বারকোড স্ক্যান করছেন ক্যাশিয়ার'],
  'wholesale-market-cartons': [['/solutions/wholesale-commerce', '/customers', '/migration'], 'Stacked cartons in a wholesale market lane', ''],
  'merchant-product-photography-v2': [['/features/ai-product-creation', '/customers', '/blog'], 'A seller photographing a product on a white sheet with a phone', ''],
  'rider-loading-parcels': [['*'], 'A rider loading parcels onto a motorbike before the evening run', 'সন্ধ্যার ডেলিভারির আগে মোটরসাইকেলে পার্সেল তুলছেন রাইডার'],
  'merchant-boutique-owner': [[], '', ''], 'merchant-skincare-live': [[], '', ''], 'merchant-warehouse-scan': [[], '', ''],
};
const THEME = { visora: 'Visora', onskn: 'Onskn', blakora: 'Blakora', delyo: 'Delyo', ameer: 'Ameer' };

/** Where a file is used and its alt text, from the website's code and docs/ASSETS.md. */
function describe(path) {
  const [dir, sub] = path.split('/');
  const file = path.split('/').pop();
  const base = file.replace(/\.[a-z0-9]+$/i, '');
  const ext = (file.split('.').pop() || '').toLowerCase();
  let type = 'image', used = [], en = '', bn = '', decorative = false;
  if (dir === 'brand' && sub === 'v2') {
    type = /logo/.test(base) ? 'image' : 'icon';
    const map = {
      'gridcommerce-logo': [['*'], 'GridCommerce', 'গ্রিডকমার্স'], 'gridcommerce-logo-reverse': [['*'], 'GridCommerce', 'গ্রিডকমার্স'],
      'gridcommerce-mark': [['/signup', '/login'], 'GridCommerce', 'গ্রিডকমার্স'], 'gridcommerce-pattern': [['*'], '', ''],
      icon: [['*'], 'GridCommerce', ''], 'apple-icon': [['*'], 'GridCommerce', ''],
    };
    [used, en, bn] = map[base] || [[], '', ''];
    if (base === 'gridcommerce-pattern') decorative = true;
  } else if (dir === 'brand') {
    type = /-mark|^icon/.test(base) ? 'icon' : 'image';
    en = 'GridCommerce logo (first design)';
  } else if (dir === 'product-screens') {
    const key = base.replace(/-mobile$/, '');
    [en, bn] = SCREEN_ALT[key] || ['', ''];
    used = SCREEN_USE[key] || [];
  } else if (dir === 'product') {
    used = [];
  } else if (dir === 'merchants') {
    const p = PHOTO[base] || [[], '', ''];
    [used, en, bn] = p;
  } else if (dir === 'integrations') {
    type = 'icon';
    const key = base.replace(/-(white|dark-background)$/, '');
    const name = LOGO_NAME[key] || key;
    en = name + ' logo'; bn = name + ' লোগো';
    used = /-white$/.test(base) ? [] : PAY_LOGOS.test(key) ? ['/', '/features/payments'] : COURIER_LOGOS.test(key) ? ['/', '/features/courier'] : ['/', '/features/sales-channels'];
  } else if (dir === 'apps') {
    type = 'icon';
    used = ['*'];
    en = base === 'app-store' ? 'Download on the App Store' : base === 'google-play' ? 'Get it on Google Play' : 'QR code that opens gridcommerce.net on a phone';
    bn = base === 'app-store' ? 'অ্যাপ স্টোর থেকে ডাউনলোড করুন' : base === 'google-play' ? 'গুগল প্লে থেকে নিন' : '';
  } else if (dir === 'themes') {
    const [name, n] = base.split('-');
    en = `${THEME[name] || name} storefront theme, preview ${n}`;
    bn = `${THEME[name] || name} স্টোরফ্রন্ট থিম, প্রিভিউ ${n}`;
    used = base === 'delyo-1' ? ['/themes', '/features/storefront'] : ['/themes'];
  } else if (dir === 'hero-lanes') {
    used = ['/']; decorative = true;
  } else if (dir === 'modules') {
    const m = MODULE_NAME[sub] || sub;
    used = ['/features/' + sub];
    const part = base === 'hero' ? 'overview' : base === 'phone' ? 'on a phone' : base.replace(/^s(\d)(-phone)?$/, (x, d, ph) => 'section ' + d + (ph ? ' on a phone' : ''));
    en = `GridCommerce ${m}: ${part}`;
    bn = base === 'hero' ? `গ্রিডকমার্স ${m}` : '';
  }
  if (ext === 'pdf' || ext === 'xlsx' || ext === 'docx') type = 'document';
  if (ext === 'mp4' || ext === 'webm' || ext === 'mov') type = 'video';
  return { type, used, en, bn, decorative };
}

// uploads that are only in the library (the landing pages' downloads and videos), not in the site's public/ folder
const UPLOADS = [
  ['downloads/eid-sale-toolkit-for-facebook-sellers.pdf', 2516582, 0, 0, ['/lp/eid-sale-toolkit'], 'Eid sale toolkit for Facebook sellers (PDF)'],
  ['downloads/excel-to-gridcommerce-migration-checklist.pdf', 884736, 0, 0, ['/lp/free-migration-from-excel'], 'Excel to GridCommerce migration checklist (PDF)'],
  ['downloads/cod-reconciliation-sheet.xlsx', 61440, 0, 0, [], ''],
  ['downloads/gridcommerce-pricing-2026.pdf', 412672, 0, 0, ['/pricing'], 'GridCommerce pricing 2026 (PDF)'],
  ['video/pos-for-mobile-shops-walkthrough.mp4', 19503923, 1920, 1080, ['/lp/pos-for-mobile-shops'], 'Walkthrough: selling a phone with IMEI and warranty at the GridCommerce counter'],
  ['video/eid-toolkit-intro-30s.mp4', 7340032, 1080, 1350, ['/lp/eid-sale-toolkit'], ''],
  ['video/gridcommerce-overview-90s.mp4', 31876710, 1920, 1080, [], 'GridCommerce in 90 seconds'],
];

const MIME = { webp: 'WebP', png: 'PNG', jpeg: 'JPEG', jpg: 'JPEG', svg: 'SVG', pdf: 'PDF', xlsx: 'Excel', mp4: 'MP4', webm: 'WebM', gif: 'GIF', mov: 'MOV', docx: 'Word' };
export const formatOf = (name) => MIME[(String(name).split('.').pop() || '').toLowerCase()] || (String(name).split('.').pop() || 'File').toUpperCase();

function seedMedia(now) {
  const r = rng('website2-media');
  const team = ['Ayesha Siddiqua', 'Tanvir Ahmed', 'Tanvir Ahmed', 'Ayesha Siddiqua', 'Mahin Khan'];
  const rows = RAW.trim().split('\n').map((line) => line.trim().split(/\s+/)).filter((x) => x.length === 4)
    .map(([path, size, w, h]) => [path, Number(size), Number(w), Number(h), null, null]);
  const all = rows.concat(UPLOADS);
  // the few module images whose alt text was never written (shown as "missing alt text")
  const NO_ALT = new Set(['modules/automation/s5.webp', 'modules/warehouse/s1-phone.webp', 'modules/analytics/s4.webp', 'modules/offers-loyalty/s5.webp', 'modules/courier/phone.webp', 'modules/storefront/s5.webp', 'video/eid-toolkit-intro-30s.mp4']);
  return all.map(([path, size, w, h, useUp, altUp], i) => {
    const d = describe(path);
    const old = /^brand\/[^/]+$/.test(path) || /^product\//.test(path);
    const ageDays = /^downloads|^video/.test(path) ? r.int(3, 40) : /^modules/.test(path) ? r.int(20, 60) : /^brand\/v2/.test(path) ? r.int(90, 110) : old ? r.int(150, 220) : r.int(25, 140);
    const en = altUp != null ? altUp : NO_ALT.has(path) ? '' : d.en;
    return {
      id: 'M-' + String(1001 + i),
      path,
      name: path.split('/').length > 2 ? path.split('/').slice(1).join('/') : path.split('/').pop(),   // modules/pos/s1.webp → pos/s1.webp
      folder: folderOf(path),
      type: d.type,
      format: formatOf(path),
      size,
      w: w || null,
      h: h || null,
      alt: { en, bn: NO_ALT.has(path) ? '' : d.bn },
      decorative: d.decorative,
      usedOn: useUp || d.used,
      source: useUp ? 'upload' : 'site',
      uploadedAt: startOfDay(now) - ageDays * DAY + r.int(9, 18) * 3600e3,
      uploadedBy: r.pick(team),
    };
  });
}

/** Counts for the media tabs and the Overview. */
export function mediaCounts(media) {
  const c = { all: media.length, image: 0, icon: 0, video: 0, document: 0, unused: 0, noAlt: 0, bytes: 0 };
  for (const m of media) {
    c[m.type] = (c[m.type] || 0) + 1;
    c.bytes += m.size || 0;
    if (!m.usedOn.length) c.unused++;
    if (needsAlt(m)) c.noAlt++;
  }
  return c;
}
/** An image or video on a live page with no English alt text (decorative files are skipped). */
export const needsAlt = (m) => (m.type === 'image' || m.type === 'video') && !m.decorative && m.usedOn.length > 0 && !String(m.alt.en || '').trim();
export const usedLabel = (p) => (p === '*' ? 'Every page' : p);

// ---- forms --------------------------------------------------------------------------------------------------------
export const FIELD_TYPES = [['text', 'Text'], ['email', 'Email'], ['tel', 'Phone'], ['select', 'Choice'], ['textarea', 'Long text'], ['url', 'Web address'], ['checkbox', 'Tick box']];
export const DESTINATIONS = ['Leads in CRM', 'Support inbox', 'Email list'];
export const FORM_STATUS = ['Live', 'Paused', 'Draft'];
export const CAPTCHA = [['off', 'Off'], ['turnstile', 'Cloudflare Turnstile (invisible)'], ['recaptcha', 'Google reCAPTCHA v3']];
export const RATE_LIMITS = [[0, 'No limit'], [3, '3 a hour from one device'], [5, '5 a hour from one device'], [10, '10 a hour from one device']];

const F = (key, label, type, required, options) => ({ key, label, type, required: !!required, ...(options ? { options } : {}) });
const BUSINESS_TYPES = ['Online only', 'A shop or counter', 'Wholesale', 'A mix of these'];
const CATEGORIES = ['Clothing and fashion', 'Electronics', 'Beauty and cosmetics', 'Home and living', 'Food and grocery', 'Something else'];
const TOPICS = ['Sales — I want to start selling', 'Book a demo', 'Support — I already use GridCommerce', 'Partnership', 'Something else'];
const MONTHLY = ['Under 100', '100–500', '500–2,000', '2,000+'];
const PLATFORMS = ['Excel or Google Sheets', 'Facebook page only', 'Shopify', 'WooCommerce', 'Another software'];

function seedForms(now) {
  const spam = (captcha, rate, extra = {}) => ({ honeypot: true, captcha, rateLimit: rate, blockDisposable: true, blockLinks: false, ...extra });
  return [
    { id: 'trial', name: 'Trial signup', service: 'signup.service › createWorkspace', status: 'Live', destination: 'Leads in CRM', placements: ['/signup', '/lp/start-free-14-days', '/lp/pos-for-mobile-shops'], submitLabel: 'Create workspace', success: 'Your workspace is being prepared. We will text you the link.',
      fields: [F('businessName', 'Business name', 'text', 1), F('ownerName', 'Your name', 'text', 1), F('businessType', 'How do you sell today?', 'select', 1, BUSINESS_TYPES),
        F('phone', 'Phone', 'tel', 1), F('email', 'Email', 'email', 1), F('preferredLanguage', 'Preferred language', 'select', 0, ['English', 'বাংলা']),
        F('storeName', 'Store name', 'text', 1), F('subdomain', 'Store address', 'text', 1), F('category', 'What do you sell?', 'select', 1, CATEGORIES)],
      notify: { staff: ['Tania Sultana', 'Rakib Hasan'], email: true, sms: false, daily: true }, spam: spam('turnstile', 3), views: 0, health: { ok: true } },
    { id: 'demo', name: 'Demo request', service: 'lead.service › submitDemoRequest', status: 'Live', destination: 'Leads in CRM', placements: ['/pricing', '/features', '/lp/pos-for-mobile-shops', '/lp/facebook-live-sellers'], submitLabel: 'Book my demo', success: 'Thanks. Our sales team will call you within one working day.',
      fields: [F('name', 'Your name', 'text', 1), F('businessName', 'Business name', 'text', 1), F('phone', 'Phone', 'tel', 1), F('email', 'Email', 'email', 0),
        F('monthlyOrders', 'Orders a month', 'select', 0, MONTHLY), F('message', 'Anything we should know?', 'textarea', 0)],
      notify: { staff: ['Tania Sultana'], email: true, sms: true, daily: false }, spam: spam('turnstile', 5), views: 0, health: { ok: true } },
    { id: 'contact', name: 'Contact', service: 'contact.service › submitContact', status: 'Live', destination: 'Support inbox', placements: ['/contact'], submitLabel: 'Send message', success: 'Message received. We reply within one working day.',
      fields: [F('topic', 'What is it about?', 'select', 1, TOPICS), F('name', 'Your name', 'text', 1), F('businessName', 'Business name', 'text', 0),
        F('email', 'Email', 'email', 1), F('phone', 'Phone', 'tel', 1), F('message', 'Message', 'textarea', 1)],
      notify: { staff: ['Farhana Akter'], email: true, sms: false, daily: false }, spam: spam('turnstile', 5, { blockLinks: true }), views: 0, health: { ok: true } },
    { id: 'magnet', name: 'Lead magnet (download)', service: 'lead.service (download)', status: 'Live', destination: 'Email list', placements: ['/lp/eid-sale-toolkit', '/lp/free-migration-from-excel', '/blog'], submitLabel: 'Send me the toolkit', success: 'Check your email: the download link is on its way.',
      fields: [F('name', 'Your name', 'text', 1), F('phone', 'Phone', 'tel', 1), F('email', 'Email', 'email', 1), F('businessType', 'How do you sell today?', 'select', 0, BUSINESS_TYPES)],
      download: 'downloads/eid-sale-toolkit-for-facebook-sellers.pdf',
      notify: { staff: ['Ayesha Siddiqua'], email: false, sms: false, daily: true }, spam: spam('off', 10), views: 0,
      health: { ok: false, since: now - 2 * DAY - 5 * 3600e3, error: 'The download email is bouncing: downloads@gridcommerce.net is not verified with the email provider, so people get no link.' } },
    { id: 'newsletter', name: 'Newsletter', service: 'lead.service › subscribeNewsletter', status: 'Live', destination: 'Email list', placements: ['*'], submitLabel: 'Subscribe', success: 'You are on the list.',
      fields: [F('email', 'Email', 'email', 1)],
      notify: { staff: [], email: false, sms: false, daily: false }, spam: spam('off', 3), views: 0, health: { ok: true } },
    { id: 'migration', name: 'Free migration request', service: 'lead.service › submitMigrationRequest', status: 'Live', destination: 'Leads in CRM', placements: ['/migration', '/lp/free-migration-from-excel'], submitLabel: 'Move my business', success: 'We will call you to plan the move.',
      fields: [F('name', 'Your name', 'text', 1), F('businessName', 'Business name', 'text', 1), F('phone', 'Phone', 'tel', 1),
        F('currentPlatform', 'What do you use now?', 'select', 1, PLATFORMS), F('storeUrl', 'Store or page link', 'url', 0), F('message', 'Anything we should know?', 'textarea', 0)],
      notify: { staff: ['Rakib Hasan', 'Tania Sultana'], email: true, sms: false, daily: false }, spam: spam('turnstile', 5), views: 0, health: { ok: true } },
  ];
}

// ---- landing pages ------------------------------------------------------------------------------------------------
export const LP_STATUSES = ['Draft', 'In review', 'Approved', 'Published', 'Archived'];
export const LP_TONE = { Draft: 'neutral', 'In review': 'warning', Approved: 'primary', Published: 'success', Archived: 'neutral' };
export const TEMPLATES = ['Lead magnet', 'Product demo', 'Offer', 'Problem and solution', 'Free trial', 'Webinar'];
export const UTM_SOURCES = ['facebook', 'google', 'instagram', 'youtube', 'tiktok', 'linkedin', 'newsletter', 'sms', 'partner'];
export const UTM_MEDIUMS = ['cpc', 'paid_social', 'social', 'email', 'sms', 'referral', 'video'];

const S = {
  hero: (title, body, cta, image, bn) => ({ kind: 'hero', title, body, cta, image, bn: !!bn }),
  benefits: (items) => ({ kind: 'benefits', items }),
  proof: (quote, by, stat, statLabel) => ({ kind: 'proof', quote, by, stat, statLabel }),
  steps: (items) => ({ kind: 'steps', items }),
  offer: (title, price, note) => ({ kind: 'offer', title, price, note }),
  logos: (items) => ({ kind: 'logos', items }),
  form: (title) => ({ kind: 'form', title }),
  faq: (items) => ({ kind: 'faq', items }),
};

function seedLandings(now) {
  const d = (n, h = 11) => startOfDay(now) - n * DAY + h * 3600e3;
  const L = (o) => ({ utm: { source: 'facebook', medium: 'paid_social', campaign: '', content: '' }, history: [], ...o });
  return [
    L({ id: 'LP-101', title: 'Eid sale toolkit for Facebook sellers', slug: 'eid-sale-toolkit', template: 'Lead magnet', campaign: 'Eid sale season 2027 · Facebook sellers', formId: 'magnet', lang: 'bn',
      status: 'Published', editor: 'Ayesha Siddiqua', approver: 'Mahin Khan', createdAt: d(41), submittedAt: d(36), approvedAt: d(35), publishedAt: d(34, 10), updatedAt: d(9), visits: 6840,
      utm: { source: 'facebook', medium: 'paid_social', campaign: 'eid-toolkit-2027', content: 'carousel-a' },
      sections: [S.hero('ঈদের সেল, এবার গোছানো', 'ফেসবুক সেলারদের জন্য ফ্রি টুলকিট: অফার প্ল্যান, পোস্টের ক্যালেন্ডার, COD কনফার্ম করার স্ক্রিপ্ট আর স্টক চেকলিস্ট।', 'ফ্রি টুলকিট নিন', 'merchants/merchant-boutique.webp', true),
        S.benefits([['calendar-days', '৩০ দিনের পোস্ট প্ল্যান', 'ঈদের আগের চার সপ্তাহ কী পোস্ট করবেন'], ['phone-call', 'COD কনফার্ম স্ক্রিপ্ট', 'ফেক অর্ডার কমান'], ['package', 'স্টক চেকলিস্ট', 'শেষ সপ্তাহে স্টক আউট নয়']]),
        S.proof('গত ঈদে রিটার্ন অর্ধেক হয়েছে, শুধু কনফার্ম কলের জন্য।', 'নুসরাত জাহান, Nusrat’s Closet, মিরপুর', '42%', 'কম রিটার্ন'), S.form('টুলকিট পাঠাব কোথায়?'),
        S.faq([['টুলকিট কি ফ্রি?', 'হ্যাঁ, পুরোপুরি ফ্রি। ইমেইলে PDF লিংক যাবে।'], ['GridCommerce না থাকলেও কাজে লাগবে?', 'হ্যাঁ, টুলকিট যেকোনো ফেসবুক পেজের জন্য।']])],
      history: [{ at: d(41), by: 'Ayesha Siddiqua', text: 'Created from the Lead magnet template' }, { at: d(36), by: 'Ayesha Siddiqua', text: 'Sent for review' }, { at: d(35), by: 'Mahin Khan', text: 'Approved' }, { at: d(34, 10), by: 'Mahin Khan', text: 'Published' }, { at: d(9), by: 'Ayesha Siddiqua', text: 'UTM content set to carousel-a' }] }),
    L({ id: 'LP-102', title: 'POS for mobile shops', slug: 'pos-for-mobile-shops', template: 'Product demo', campaign: 'Retail POS · Dhaka mobile markets', formId: 'demo', lang: 'en',
      status: 'Published', editor: 'Tanvir Ahmed', approver: 'Mahin Khan', createdAt: d(58), submittedAt: d(55), approvedAt: d(54), publishedAt: d(53), updatedAt: d(12), visits: 4215,
      utm: { source: 'google', medium: 'cpc', campaign: 'pos-mobile-shops', content: '' },
      sections: [S.hero('A counter that knows every IMEI', 'Sell phones and accessories with IMEI, warranty and bKash in one screen. Built for shops in Bashundhara City, Motalib Plaza and Jamuna Future Park.', 'Book a demo', 'merchants/merchant-electronics.webp'),
        S.benefits([['scan-barcode', 'IMEI on every sale', 'Scan once, find it on the receipt and the warranty'], ['shield-check', 'Warranty that tracks itself', 'Days left on every customer profile'], ['wallet', 'Cash, bKash and card', 'Split one bill, close the day in two minutes']]),
        S.logos(['bkash', 'nagad', 'visa', 'mastercard']), S.proof('We stopped writing IMEIs in a khata the first week.', 'Arif Hossain, Gadget Corner, Motalib Plaza', '2 min', 'to close the counter'),
        S.form('See it on your own products'), S.faq([['Does it work offline?', 'Yes. Sales are kept on the counter and sent when the internet is back.'], ['Can I use my barcode scanner?', 'Any USB or Bluetooth scanner works.']])],
      history: [{ at: d(58), by: 'Tanvir Ahmed', text: 'Created from the Product demo template' }, { at: d(55), by: 'Tanvir Ahmed', text: 'Sent for review' }, { at: d(54), by: 'Mahin Khan', text: 'Approved' }, { at: d(53), by: 'Mahin Khan', text: 'Published' }] }),
    L({ id: 'LP-103', title: 'Free migration from Excel', slug: 'free-migration-from-excel', template: 'Offer', campaign: 'Switch from Excel · Q4 2026', formId: 'migration', lang: 'en',
      status: 'Published', editor: 'Ayesha Siddiqua', approver: 'Farhana Akter', createdAt: d(30), submittedAt: d(27), approvedAt: d(26), publishedAt: d(25), updatedAt: d(4), visits: 2970,
      utm: { source: 'facebook', medium: 'paid_social', campaign: 'excel-migration-q4', content: 'video-15s' },
      sections: [S.hero('Your Excel sheet, moved for free', 'Send us your product and customer sheets. We set up GridCommerce with your stock, prices and customers in 48 hours.', 'Plan my move', 'merchants/merchant-grocery.webp'),
        S.steps([['Send your sheets', 'Products, stock and customers as they are'], ['We clean and import', 'Duplicates merged, prices checked'], ['Start selling', 'Your team gets a 30 minute walkthrough']]),
        S.offer('Free for the first 500 shops', '৳0', 'Usually ৳4,500. Ends 31 December 2026.'), S.form('Tell us what you use now'),
        S.faq([['Is my data safe?', 'Your files are deleted after the import.'], ['What if my sheet is messy?', 'That is normal. We call you before anything is imported.']])],
      history: [{ at: d(30), by: 'Ayesha Siddiqua', text: 'Created from the Offer template' }, { at: d(27), by: 'Ayesha Siddiqua', text: 'Sent for review' }, { at: d(26), by: 'Farhana Akter', text: 'Approved' }, { at: d(25), by: 'Farhana Akter', text: 'Published' }, { at: d(4), by: 'Ayesha Siddiqua', text: 'Form changed to Free migration request' }] }),
    L({ id: 'LP-104', title: 'Wholesale dues, collected on time', slug: 'wholesale-dues', template: 'Problem and solution', campaign: 'Wholesale dues tracker', formId: 'demo', lang: 'en',
      status: 'In review', editor: 'Mahin Khan', approver: '', createdAt: d(6), submittedAt: d(1, 16), approvedAt: null, publishedAt: null, updatedAt: d(1, 16), visits: 0,
      utm: { source: 'linkedin', medium: 'paid_social', campaign: 'wholesale-dues', content: '' },
      sections: [S.hero('Know who owes you, before month end', 'Credit limits, due dates and SMS reminders for every retailer you supply. No more chasing dues in a notebook.', 'Book a demo', 'merchants/wholesale-market-cartons.webp'),
        S.benefits([['receipt', 'Every due in one list', 'By retailer, by age, by salesman'], ['message-square-text', 'Reminders that go out on their own', 'SMS three days before and on the due date'], ['shield-alert', 'Credit limits', 'Stop a sale when a shop is over its limit']]),
        S.form('Show me on my retailers'), S.faq([['Can retailers pay by bKash?', 'Yes, payments match the due automatically.']])],
      history: [{ at: d(6), by: 'Mahin Khan', text: 'Created from the Problem and solution template' }, { at: d(1, 16), by: 'Mahin Khan', text: 'Sent for review' }] }),
    L({ id: 'LP-105', title: 'Courier COD, reconciled', slug: 'cod-reconciliation', template: 'Problem and solution', campaign: 'Courier COD · Q4 2026', formId: 'trial', lang: 'en',
      status: 'Draft', editor: 'Tanvir Ahmed', approver: '', createdAt: d(3), submittedAt: null, approvedAt: null, publishedAt: null, updatedAt: d(0, 10), visits: 0,
      utm: { source: 'facebook', medium: 'paid_social', campaign: 'cod-reconcile', content: '' },
      sections: [S.hero('Every taka the courier owes you', 'Pathao, Steadfast and REDX payouts matched to your orders. See what is short before it is too late to claim.', 'Start free', 'merchants/courier-cod-handover.webp'),
        S.logos(['pathao', 'steadfast', 'redx', 'paperfly']), S.form('Start your free 14 days')],
      history: [{ at: d(3), by: 'Tanvir Ahmed', text: 'Created from the Problem and solution template' }] }),
    L({ id: 'LP-106', title: 'Facebook live sellers: one inbox', slug: 'facebook-live-sellers', template: 'Product demo', campaign: 'Live sellers · Messenger and comments', formId: 'demo', lang: 'bn',
      status: 'Approved', editor: 'Ayesha Siddiqua', approver: 'Mahin Khan', createdAt: d(9), submittedAt: d(4), approvedAt: d(2, 15), publishedAt: null, updatedAt: d(2, 15), visits: 0,
      utm: { source: 'facebook', medium: 'paid_social', campaign: 'live-sellers', content: '' },
      sections: [S.hero('লাইভের সব কমেন্ট, এক জায়গায়', 'কমেন্ট, মেসেঞ্জার আর হোয়াটসঅ্যাপের অর্ডার এক ইনবক্সে। "দাম কত?" এর উত্তর এক ট্যাপে।', 'ডেমো বুক করুন', 'merchants/merchant-skincare-live.webp', true),
        S.benefits([['messages-square', 'এক ইনবক্স', 'কমেন্ট, মেসেঞ্জার, হোয়াটসঅ্যাপ'], ['zap', 'সেভ করা উত্তর', 'দাম, ডেলিভারি চার্জ, সাইজ'], ['receipt', 'চ্যাট থেকে অর্ডার', 'কাস্টমার আর ঠিকানা আগেই ভরা']]),
        S.form('ডেমোর জন্য নম্বর দিন')],
      history: [{ at: d(9), by: 'Ayesha Siddiqua', text: 'Created from the Product demo template' }, { at: d(4), by: 'Ayesha Siddiqua', text: 'Sent for review' }, { at: d(2, 15), by: 'Mahin Khan', text: 'Approved' }] }),
    L({ id: 'LP-107', title: 'Pohela Boishakh: 3 months for the price of 2', slug: 'boishakh-offer', template: 'Offer', campaign: 'Pohela Boishakh 1433', formId: 'trial', lang: 'bn',
      status: 'Archived', editor: 'Ayesha Siddiqua', approver: 'Mahin Khan', createdAt: d(190), submittedAt: d(186), approvedAt: d(185), publishedAt: d(184), updatedAt: d(160), visits: 0, lifetimeVisits: 9120, lifetimeSubs: 388,
      utm: { source: 'facebook', medium: 'paid_social', campaign: 'boishakh-1433', content: '' },
      sections: [S.hero('শুভ নববর্ষ! ৩ মাস, দাম ২ মাসের', 'বৈশাখের অফার: যেকোনো প্ল্যানে প্রথম তিন মাস, দাম দুই মাসের।', 'অফার নিন', 'merchants/merchant-boutique-owner.webp', true), S.offer('অফার শেষ ৩০ বৈশাখ', '৳1,990', 'প্রতি মাসে, প্রথম ৩ মাস'), S.form('অফারটি নিন')],
      history: [{ at: d(190), by: 'Ayesha Siddiqua', text: 'Created from the Offer template' }, { at: d(184), by: 'Mahin Khan', text: 'Published' }, { at: d(160), by: 'Mahin Khan', text: 'Archived: offer ended' }] }),
    L({ id: 'LP-108', title: 'Start free for 14 days', slug: 'start-free-14-days', template: 'Free trial', campaign: 'Always on · Google search', formId: 'trial', lang: 'en',
      status: 'Published', editor: 'Tanvir Ahmed', approver: 'Mahin Khan', createdAt: d(120), submittedAt: d(118), approvedAt: d(118, 15), publishedAt: d(117), updatedAt: d(20), visits: 8930,
      utm: { source: 'google', medium: 'cpc', campaign: 'brand-search', content: '' },
      sections: [S.hero('Run your whole business from one place', 'Orders, stock, courier and cash for online, retail and wholesale. Free for 14 days, no card needed.', 'Start free', 'merchants/hero-businessman-stockroom.webp'),
        S.logos(['bkash', 'pathao', 'steadfast', 'facebook-page']), S.benefits([['receipt', 'Orders from every channel', 'Facebook, website and counter'], ['package', 'Stock that is always right', 'Every sale moves it'], ['truck', 'Courier in one click', 'Pathao, Steadfast, REDX']]),
        S.form('Create your workspace')],
      history: [{ at: d(120), by: 'Tanvir Ahmed', text: 'Created from the Free trial template' }, { at: d(117), by: 'Mahin Khan', text: 'Published' }] }),
    L({ id: 'LP-109', title: 'Grocery shops: stock without a khata', slug: 'grocery-stock', template: 'Problem and solution', campaign: 'Retail POS · grocery', formId: 'demo', lang: 'en',
      status: 'Draft', editor: 'Ayesha Siddiqua', approver: '', createdAt: d(1, 12), submittedAt: null, approvedAt: null, publishedAt: null, updatedAt: d(1, 12), visits: 0, formId2: null,
      utm: { source: 'facebook', medium: 'paid_social', campaign: '', content: '' },
      sections: [S.hero('Stock without a khata', 'Loose items by weight, expiry dates and supplier dues for neighbourhood grocery shops.', 'Book a demo', 'merchants/merchant-grocery.webp'), S.form('Book a 20 minute demo')],
      history: [{ at: d(1, 12), by: 'Ayesha Siddiqua', text: 'Created from the Problem and solution template' }] }),
    L({ id: 'LP-110', title: 'Cosmetics brands: your own online store', slug: 'cosmetics-online-store', template: 'Product demo', campaign: 'Storefront · beauty brands', formId: 'trial', lang: 'en',
      status: 'In review', editor: 'Tanvir Ahmed', approver: '', createdAt: d(8), submittedAt: d(2, 11), approvedAt: null, publishedAt: null, updatedAt: d(2, 11), visits: 0,
      utm: { source: 'instagram', medium: 'paid_social', campaign: 'beauty-storefront', content: '' },
      sections: [S.hero('A store as good as your products', 'Five storefront themes made for beauty brands, with reviews, bundles and bKash checkout.', 'Start free', 'themes/onskn-1.webp'),
        S.benefits([['palette', 'Themes for beauty', 'Onskn, Visora and Delyo'], ['star', 'Reviews with photos', 'Collected after delivery'], ['gift', 'Bundles and offers', 'Build a routine, sell the set']]),
        S.form('Open your store')],
      history: [{ at: d(8), by: 'Tanvir Ahmed', text: 'Created from the Product demo template' }, { at: d(2, 11), by: 'Tanvir Ahmed', text: 'Sent for review' }] }),
  ];
}

// ---- submissions and traffic --------------------------------------------------------------------------------------
const FIRST = ['Rahim', 'Karim', 'Nusrat', 'Sumaiya', 'Arif', 'Tanjila', 'Fahim', 'Mehedi', 'Sabrina', 'Imran', 'Shirin', 'Rakibul', 'Jannatul', 'Shakil', 'Farzana',
  'Mahbub', 'Riya', 'Sohel', 'Afroza', 'Tareq', 'Lamia', 'Nayeem', 'Moushumi', 'Habib', 'Sadia', 'Zahid', 'Rumana', 'Kamrul', 'Taslima', 'Asif', 'Nabila', 'Rezaul', 'Munira', 'Shahin', 'Ishrat'];
const LAST = ['Hossain', 'Rahman', 'Islam', 'Ahmed', 'Akter', 'Chowdhury', 'Khan', 'Sarker', 'Uddin', 'Begum', 'Talukder', 'Mia', 'Haque', 'Siddique', 'Bhuiyan', 'Molla', 'Sultana', 'Kabir', 'Jahan', 'Das'];
const BIZ_A = ['Rahman', 'Dhaka', 'Chattogram', 'Sylhet', 'Nusrat’s', 'Bismillah', 'Ma', 'Shapla', 'Green', 'Royal', 'Desh', 'Padma', 'Nabil', 'Moon', 'Star', 'Khulna', 'Rajshahi', 'Aarong Lane', 'Gulshan', 'Mirpur'];
const BIZ_B = ['Fashion House', 'Gadget Point', 'Closet', 'Telecom', 'Beauty Corner', 'Store', 'Traders', 'Mart', 'Enterprise', 'Boutique', 'Organic Foods', 'Mobile Zone', 'Shoes', 'Crafts', 'Electronics', 'Cosmetics', 'Super Shop', 'Book House', 'Saree Ghor', 'Gift Shop'];
const DOMAINS = ['gmail.com', 'gmail.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
const SPAMMERS = [['SEO Expert', 'Rank #1 Agency', 'seo.rank.pro@mail.ru', 'We can bring your website to first page of Google. Visit http://cheap-seo-links.top'],
  ['Crypto Bonus', '', 'bonus@tempmail.dev', 'Claim free USDT now http://bit.ly/x9x'], ['Web Design Offer', 'Pixel Studio', 'offers@pixelstudio-mail.xyz', 'We build websites for $99'],
  ['Loan Approval', '', 'fastloan@mailinator.com', 'Instant loan approval, no documents']];
const BLOG_POSTS = ['/blog/cod-returns-cut', '/blog/eid-stock-planning', '/blog/facebook-page-to-website', '/blog/courier-charges-explained'];
export const SUB_STATUSES = ['New', 'Sent to CRM', 'Spam', 'Closed'];
export const SUB_TONE = { New: 'primary', 'Sent to CRM': 'success', Spam: 'error', Closed: 'neutral' };
export const FORM_TONE = { Live: 'success', Paused: 'warning', Draft: 'neutral' };

function phone(r) { return '01' + r.pick(['3', '7', '8', '9', '6', '5', '4']) + String(r.int(10000000, 99999999)); }

function seedSubmissions(now, forms, lps) {
  const r = rng('website2-subs');
  const N = 404;
  const weights = [['trial', 30], ['demo', 15], ['contact', 14], ['magnet', 16], ['newsletter', 18], ['migration', 7]];
  const total = weights.reduce((a, [, w]) => a + w, 0);
  const pickForm = () => { let x = r() * total; for (const [k, w] of weights) { x -= w; if (x < 0) return k; } return 'trial'; };
  const live = lps.filter((l) => l.status === 'Published');
  const out = [];
  for (let i = 0; i < N; i++) {
    // more recent days get a few more (the site is growing)
    const age = Math.floor(Math.pow(r(), 1.25) * 60 * DAY);
    const at = now - age;
    const formId = pickForm();
    const form = forms.find((f) => f.id === formId);
    const lp = live.filter((l) => l.formId === formId && l.publishedAt && l.publishedAt < at);
    const onLp = lp.length && r() < 0.6 ? r.pick(lp) : null;
    let page = onLp ? '/lp/' + onLp.slug
      : formId === 'trial' ? '/signup' : formId === 'demo' ? r.pick(['/pricing', '/features', '/contact?topic=demo']) : formId === 'contact' ? '/contact'
        : formId === 'magnet' ? '/blog' : formId === 'newsletter' ? r.pick(['/', '/blog', ...BLOG_POSTS, '/pricing']) : '/migration';
    let utm = onLp ? { source: onLp.utm.source, medium: onLp.utm.medium, campaign: onLp.utm.campaign }
      : r.chance(0.42) ? { source: '', medium: '', campaign: '' }
        : r.pick([{ source: 'google', medium: 'cpc', campaign: 'brand-search' }, { source: 'google', medium: 'organic', campaign: '' }, { source: 'facebook', medium: 'paid_social', campaign: 'always-on-retargeting' },
          { source: 'facebook', medium: 'social', campaign: '' }, { source: 'youtube', medium: 'video', campaign: 'product-tour' }, { source: 'newsletter', medium: 'email', campaign: 'october-tips' },
          { source: 'linkedin', medium: 'social', campaign: '' }, { source: 'instagram', medium: 'social', campaign: '' }]);
    const spam = r.chance(0.06) && formId !== 'trial';
    const fn = r.pick(FIRST), ln = r.pick(LAST);
    let name = fn + ' ' + ln;
    let business = r.pick(BIZ_A) + ' ' + r.pick(BIZ_B);
    let email = (fn + '.' + ln).toLowerCase() + (r.chance(0.5) ? r.int(1, 99) : '') + '@' + r.pick(DOMAINS);
    let message = '';
    const answers = {};
    if (spam) {
      const s = r.pick(SPAMMERS);
      [name, business, email, message] = s;
      page = formId === 'newsletter' ? '/' : page;
      utm = { source: '', medium: '', campaign: '' };
    }
    const ph = spam ? '' : phone(r);
    if (formId === 'trial') {
      answers.businessType = r.pick(BUSINESS_TYPES); answers.category = r.pick(CATEGORIES); answers.preferredLanguage = r.chance(0.6) ? 'বাংলা' : 'English';
      answers.storeName = business; answers.subdomain = business.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
    } else if (formId === 'demo') {
      answers.monthlyOrders = r.pick(MONTHLY);
      message = spam ? message : r.pick(['', '', 'We have two branches, want to see stock transfer.', 'Need POS with IMEI for our phone shop.', 'Call after 4 pm please.', 'Interested in courier integration with Pathao.']);
    } else if (formId === 'contact') {
      answers.topic = spam ? 'Something else' : r.pick(TOPICS);
      message = spam ? message : r.pick(['What is the price for 3 users?', 'My bKash payment is not showing on the order.', 'Do you integrate with Steadfast?', 'We are a courier company and want to partner.', 'Can I move from Shopify?', 'Need an invoice for last month.']);
    } else if (formId === 'magnet') {
      answers.businessType = r.pick(BUSINESS_TYPES);
    } else if (formId === 'migration') {
      answers.currentPlatform = r.pick(PLATFORMS); answers.storeUrl = r.chance(0.5) ? 'facebook.com/' + business.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      message = r.pick(['', 'About 1,200 products in Excel.', 'We have customer list in Google Sheets.', '']);
    }
    // status by age and destination
    const hours = age / 3600e3;
    let status;
    if (spam) status = hours < 30 && r.chance(0.5) ? 'New' : 'Spam';
    else if (hours < 20) status = r.chance(0.82) ? 'New' : form.destination === 'Leads in CRM' ? 'Sent to CRM' : 'Closed';
    else if (hours < 72) status = r.chance(0.3) ? 'New' : form.destination === 'Leads in CRM' ? 'Sent to CRM' : 'Closed';
    else status = form.destination === 'Leads in CRM' ? (r.chance(0.9) ? 'Sent to CRM' : 'Closed') : form.id === 'contact' && answers.topic && /^Sales|demo/i.test(answers.topic) && r.chance(0.6) ? 'Sent to CRM' : 'Closed';
    out.push({
      id: '', at, formId, name, business: formId === 'newsletter' ? '' : business, phone: formId === 'newsletter' ? '' : ph, email: formId === 'demo' && !spam && r.chance(0.3) ? '' : email,
      page, utm, message, answers, status, district: spam ? '' : r.pick(['Dhaka', 'Dhaka', 'Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 'Khulna', 'Rajshahi', 'Cumilla', 'Bogura', 'Rangpur']),
      leadRef: status === 'Sent to CRM' ? 'L-' + r.int(3100, 3999) : '', history: [],
    });
  }
  out.sort((a, b) => a.at - b.at);
  out.forEach((s, i) => {
    s.id = 'WS-' + (24001 + i);
    s.history.push({ at: s.at, by: 'Website', text: 'Sent from ' + s.page });
    if (s.status === 'Sent to CRM') s.history.push({ at: s.at + 40 * 6e4, by: 'Tania Sultana', text: 'Sent to Leads in CRM as ' + s.leadRef });
    if (s.status === 'Spam') s.history.push({ at: s.at + 6e4, by: 'Spam filter', text: 'Marked as spam' });
    if (s.status === 'Closed') s.history.push({ at: s.at + 3600e3, by: 'Website', text: s.formId === 'newsletter' || s.formId === 'magnet' ? 'Added to the email list' : 'Closed' });
  });
  return out.reverse();   // newest first
}

function seedTraffic(now) {
  const r = rng('website2-traffic');
  const out = [];
  for (let i = 59; i >= 0; i--) {
    const day = startOfDay(now) - i * DAY;
    const wd = new Date(day + 6 * 3600e3).getUTCDay();   // Friday (5) is the quiet day in Bangladesh
    const base = 2200 + (59 - i) * 14 + (wd === 5 ? -520 : wd === 6 ? -160 : 0);
    out.push({ day, visits: Math.round(base * (0.88 + r() * 0.24)) });
  }
  return out;
}

function seed(now) {
  const forms = seedForms(now);
  const landings = seedLandings(now);
  const submissions = seedSubmissions(now, forms, landings);
  const traffic = seedTraffic(now);
  // form views over the 60 days, so a form's conversion reads like the real site (trial 4–6 %, newsletter 1–2 %)
  const rate = { trial: 0.052, demo: 0.081, contact: 0.12, magnet: 0.21, newsletter: 0.016, migration: 0.094 };
  for (const f of forms) f.views = Math.round(submissions.filter((s) => s.formId === f.id).length / rate[f.id]);
  for (const f of forms) f.blocked = Math.round(f.views * (f.spam.captcha === 'off' ? 0.004 : 0.011));
  // a landing page's visits follow its submissions (lead magnets convert best, the always-on trial page least)
  const lpRate = { 'LP-101': 0.118, 'LP-102': 0.046, 'LP-103': 0.071, 'LP-108': 0.038 };
  for (const l of landings) {
    if (l.status !== 'Published') continue;
    const n = submissions.filter((x) => x.page === '/lp/' + l.slug && x.status !== 'Spam').length;
    l.visits = Math.max(n * 12, Math.round(n / (lpRate[l.id] || 0.05)));
  }
  return { media: seedMedia(now), forms, landings, submissions, traffic, log: [] };
}

export const webStore = createStore({ key: 'website2', version: 1, seed });

// ---- helpers --------------------------------------------------------------------------------------------------------
const err = (error, field) => ({ ok: false, error, ...(field ? { field } : {}) });
const log = (data, now, by, text) => { data.log.unshift({ at: now, by, text }); if (data.log.length > 200) data.log.length = 200; };
const findLp = (data, id) => data.landings.find((l) => l.id === id);
const lpLog = (lp, now, by, text) => { lp.history.push({ at: now, by, text }); lp.updatedAt = now; };

// ---- media actions ------------------------------------------------------------------------------------------------
/** Add an uploaded file (front end only: only its name, size and pixel size are kept; a server would store the file). */
export function addMedia({ name, size, type, w, h, folder }, by) {
  const clean = String(name || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '');
  if (!clean) return err('The file has no name.');
  if (!size) return err('The file is empty.');
  if (size > 25 * 1048576) return err(clean + ' is larger than 25 MB.');
  return webStore.commit((data, now) => {
    const dir = !folder || folder === 'Uploads' ? 'uploads/' : 'uploads/' + folder.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '/';
    let path = dir + clean;
    let n = 1;
    while (data.media.some((m) => m.path === path)) { n++; path = dir + clean.replace(/(\.[a-z0-9]+)?$/, '-' + n + '$1'); }
    const ext = (clean.split('.').pop() || '').toLowerCase();
    const kind = type || (/^(mp4|webm|mov)$/.test(ext) ? 'video' : /^(pdf|xlsx|docx|csv)$/.test(ext) ? 'document' : /^(svg|ico)$/.test(ext) ? 'icon' : 'image');
    const uid = 'M-' + (Math.max(1000, ...data.media.map((m) => Number(m.id.slice(2)) || 0)) + 1);
    const row = { id: uid, path, name: path.split('/').pop(), folder: folder || 'Uploads', type: kind, format: formatOf(clean), size, w: w || null, h: h || null, alt: { en: '', bn: '' }, decorative: false, usedOn: [], source: 'upload', uploadedAt: now, uploadedBy: by, local: true };
    data.media.unshift(row);
    log(data, now, by, 'Uploaded ' + row.name);
    return { ok: true, id: row.id, row };
  });
}
export function setAlt(id, { en, bn, decorative }, by) {
  return webStore.commit((data, now) => {
    const m = data.media.find((x) => x.id === id);
    if (!m) return err('This file is no longer in the library.');
    m.alt = { en: String(en || '').trim().slice(0, 250), bn: String(bn || '').trim().slice(0, 250) };
    if (decorative != null) m.decorative = !!decorative;
    log(data, now, by, 'Alt text saved for ' + m.name);
    return { ok: true };
  });
}
/** Replace a file's content, keeping its address (pages that use it show the new one). */
export function replaceMedia(id, { name, size, w, h }, by) {
  return webStore.commit((data, now) => {
    const m = data.media.find((x) => x.id === id);
    if (!m) return err('This file is no longer in the library.');
    if (!size) return err('The new file is empty.');
    const a = (String(name).split('.').pop() || '').toLowerCase(), b = (m.name.split('.').pop() || '').toLowerCase();
    if (a !== b) return err(`Pick a .${b} file: the address ends in .${b}, so a .${a} file would break the pages that use it.`);
    m.size = size; if (w) m.w = w; if (h) m.h = h;
    m.uploadedAt = now; m.uploadedBy = by; m.replaced = (m.replaced || 0) + 1;
    log(data, now, by, 'Replaced ' + m.name + ' with ' + name);
    return { ok: true };
  });
}
export function moveMedia(id, folder, by) {
  return webStore.commit((data, now) => {
    const m = data.media.find((x) => x.id === id);
    if (!m) return err('This file is no longer in the library.');
    m.folder = folder;
    log(data, now, by, `Moved ${m.name} to ${folder}`);
    return { ok: true };
  });
}
/** Delete a file the site does not use. */
export function deleteMedia(id, by) {
  return webStore.commit((data, now) => {
    const m = data.media.find((x) => x.id === id);
    if (!m) return err('This file is no longer in the library.');
    if (m.usedOn.length) return err(`Used on ${m.usedOn.length === 1 ? usedLabel(m.usedOn[0]) : m.usedOn.length + ' pages'}: take it off ${m.usedOn.length === 1 ? 'that page' : 'those pages'} first.`);
    data.media = data.media.filter((x) => x.id !== id);
    log(data, now, by, 'Deleted ' + m.name);
    return { ok: true, name: m.name };
  });
}

// ---- landing pages ------------------------------------------------------------------------------------------------
export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
export function lpUrl(lp, utm = lp.utm) {
  const p = [];
  if (utm.source) p.push('utm_source=' + encodeURIComponent(utm.source));
  if (utm.medium) p.push('utm_medium=' + encodeURIComponent(utm.medium));
  if (utm.campaign) p.push('utm_campaign=' + encodeURIComponent(utm.campaign));
  if (utm.content) p.push('utm_content=' + encodeURIComponent(utm.content));
  return SITE + '/lp/' + lp.slug + (p.length ? '?' + p.join('&') : '');
}
export const lpPath = (lp) => '/lp/' + lp.slug;

/** Visits, submissions (from the submissions list, last 60 days) and conversion. */
export function lpResults(data, lp) {
  const subs = data.submissions.filter((s) => s.page === lpPath(lp) && s.status !== 'Spam').length;
  const visits = lp.visits || 0;
  if (lp.status === 'Archived' && lp.lifetimeVisits) return { visits: lp.lifetimeVisits, subs: lp.lifetimeSubs || 0, rate: lp.lifetimeSubs / lp.lifetimeVisits, lifetime: true };
  return { visits, subs, rate: visits ? subs / visits : null };
}
/** Daily visits for the last `days` days (a deterministic spread of the 60-day total). */
export function lpDaily(lp, t, days = 30) {
  const out = [];
  if (!lp.publishedAt || lp.status !== 'Published') return out;
  const r = rng('lp-daily-' + lp.id);
  const live = Math.max(1, Math.min(60, Math.round((t - lp.publishedAt) / DAY)));
  const per = (lp.visits || 0) / live;
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(t) - i * DAY;
    const on = day >= startOfDay(lp.publishedAt);
    out.push({ day, label: dm(day), visits: on ? Math.round(per * (0.7 + r() * 0.6)) : 0 });
  }
  return out;
}
export function lpCounts(list) {
  const c = { all: list.length };
  for (const s of LP_STATUSES) c[s] = 0;
  for (const l of list) c[l.status]++;
  return c;
}

export function addLanding({ title, slug, template, campaign, formId, lang }, by) {
  const t = String(title || '').trim();
  const s = slugify(slug || t);
  if (!t) return err('Give the page a title.', 'title');
  if (!s) return err('Give the page an address.', 'slug');
  if (!TEMPLATES.includes(template)) return err('Pick a template.', 'template');
  return webStore.commit((data, now) => {
    if (data.landings.some((l) => l.slug === s)) return err(`gridcommerce.net/lp/${s} is taken. Pick another address.`, 'slug');
    const id = 'LP-' + (Math.max(100, ...data.landings.map((l) => Number(l.id.slice(3)) || 0)) + 1);
    const cta = template === 'Lead magnet' ? 'Get the free guide' : template === 'Free trial' ? 'Start free' : template === 'Offer' ? 'Claim the offer' : template === 'Webinar' ? 'Save my seat' : 'Book a demo';
    const lp = {
      id, title: t, slug: s, template, campaign: String(campaign || '').trim(), formId: formId || '', lang: lang === 'bn' ? 'bn' : 'en',
      status: 'Draft', editor: by, approver: '', createdAt: now, submittedAt: null, approvedAt: null, publishedAt: null, updatedAt: now, visits: 0,
      utm: { source: 'facebook', medium: 'paid_social', campaign: slugify(campaign || t).slice(0, 40), content: '' },
      sections: [S.hero(t, 'Write the one-line promise here: who it is for and what they get.', cta, 'merchants/merchant-packing-orders.webp'),
        S.benefits([['check', 'First benefit', 'Say it in one line'], ['check', 'Second benefit', 'Say it in one line'], ['check', 'Third benefit', 'Say it in one line']]), S.form('Your details')],
      history: [{ at: now, by, text: `Created from the ${template} template` }],
    };
    data.landings.unshift(lp);
    log(data, now, by, 'Created landing page ' + t);
    return { ok: true, id };
  });
}
export function setCampaign(id, campaign, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    const c = String(campaign || '').trim();
    if (c === lp.campaign) return { ok: true, same: true };
    lp.campaign = c;
    lpLog(lp, now, by, c ? 'Campaign set to ' + c : 'Campaign removed');
    return { ok: true };
  });
}
export function setUtm(id, utm, by) {
  const clean = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_.-]/g, '');
  const u = { source: clean(utm.source), medium: clean(utm.medium), campaign: clean(utm.campaign), content: clean(utm.content) };
  if (!u.source) return err('Give a source (where the click comes from, e.g. facebook).', 'source');
  if (!u.medium) return err('Give a medium (e.g. paid_social, cpc, email).', 'medium');
  if (!u.campaign) return err('Give a campaign name, so the visits group in Analytics.', 'campaign');
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    lp.utm = u;
    lpLog(lp, now, by, `UTM set to ${u.source} / ${u.medium} / ${u.campaign}${u.content ? ' / ' + u.content : ''}`);
    return { ok: true, utm: u };
  });
}
export function setLpForm(id, formId, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    const f = data.forms.find((x) => x.id === formId);
    if (formId && !f) return err('That form is gone.');
    lp.formId = formId || '';
    lpLog(lp, now, by, f ? 'Form changed to ' + f.name : 'Form removed');
    return { ok: true };
  });
}
export function submitForReview(id, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    if (lp.status !== 'Draft') return err('Only a draft can be sent for review.');
    if (!lp.formId) return err('Attach a form first: a landing page without one collects nothing.');
    if (!lp.campaign) return err('Assign a campaign first, so its visits are counted.');
    lp.status = 'In review'; lp.submittedAt = now; lp.approver = ''; lp.editor = lp.editor || by;
    lpLog(lp, now, by, 'Sent for review');
    return { ok: true };
  });
}
/** Approve a page in review. The person who edited it cannot approve it. */
export function approve(id, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    if (lp.status !== 'In review') return err('Only a page in review can be approved.');
    if (lp.editor === by) return err(`You edited this page, so someone else has to approve it (${lp.editor} is the editor).`);
    lp.status = 'Approved'; lp.approvedAt = now; lp.approver = by;
    lpLog(lp, now, by, 'Approved');
    return { ok: true };
  });
}
export function sendBack(id, reason, by) {
  const why = String(reason || '').trim();
  if (why.length < 4) return err('Say what has to change.', 'reason');
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    if (lp.status !== 'In review' && lp.status !== 'Approved') return err('Only a page in review or approved can be sent back.');
    lp.status = 'Draft'; lp.approver = ''; lp.approvedAt = null;
    lpLog(lp, now, by, 'Sent back to draft: ' + why);
    return { ok: true };
  });
}
/** Publish an approved page (demo: the live site is not changed; a server would deploy /lp/<slug>). */
export function publish(id, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    if (lp.status !== 'Approved') return err('Approve the page before publishing it.');
    lp.status = 'Published'; lp.publishedAt = now;
    lpLog(lp, now, by, 'Published');
    return { ok: true };
  });
}
export function archive(id, reason, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    if (lp.status === 'Archived') return err('Already archived.');
    const r = lpResults(data, lp);
    lp.lifetimeVisits = r.visits; lp.lifetimeSubs = r.subs;
    const was = lp.status;
    lp.status = 'Archived';
    lpLog(lp, now, by, (was === 'Published' ? 'Taken off the site and archived' : 'Archived') + (reason ? ': ' + reason : ''));
    return { ok: true, was };
  });
}
export function restore(id, by) {
  return webStore.commit((data, now) => {
    const lp = findLp(data, id);
    if (!lp) return err('This landing page is gone.');
    if (lp.status !== 'Archived') return err('Only an archived page can be restored.');
    lp.status = 'Draft'; lp.approver = ''; lp.approvedAt = null;
    lpLog(lp, now, by, 'Restored as a draft');
    return { ok: true };
  });
}

// ---- forms --------------------------------------------------------------------------------------------------------
/** A form's figures: submissions in the last 30 days (spam left out), the 60-day conversion and the spam count. */
export function formStats(data, form, t) {
  const subs = data.submissions.filter((s) => s.formId === form.id);
  const real = subs.filter((s) => s.status !== 'Spam');
  const d30 = real.filter((s) => s.at >= t - 30 * DAY).length;
  const fresh = subs.filter((s) => s.status === 'New').length;
  return { total: real.length, d30, fresh, spam: subs.length - real.length + (form.blocked || 0), rate: form.views ? real.length / form.views : null, last: subs.length ? Math.max(...subs.map((s) => s.at)) : null };
}
export function updateForm(id, patch, by) {
  const name = String(patch.name || '').trim();
  if (!name) return err('Give the form a name.', 'name');
  const fields = (patch.fields || []).map((f) => ({ ...f, label: String(f.label || '').trim() }));
  if (!fields.length) return err('A form needs at least one field.', 'fields');
  if (fields.some((f) => !f.label)) return err('Every field needs a label.', 'fields');
  if (!fields.some((f) => (f.type === 'email' || f.type === 'tel') && f.required)) return err('Make an email or phone field required, or nobody can be contacted back.', 'fields');
  if (!DESTINATIONS.includes(patch.destination)) return err('Pick where submissions go.', 'destination');
  return webStore.commit((data, now) => {
    const f = data.forms.find((x) => x.id === id);
    if (!f) return err('This form is gone.');
    f.name = name;
    f.fields = fields.map((x, i) => ({ key: x.key || slugify(x.label).replace(/-/g, '_') + '_' + i, label: x.label, type: x.type, required: !!x.required, ...(x.type === 'select' ? { options: (x.options && x.options.length ? x.options : ['Option 1', 'Option 2']) } : {}) }));
    f.destination = patch.destination;
    f.notify = { ...f.notify, ...patch.notify };
    f.spam = { ...f.spam, ...patch.spam };
    if (patch.success != null) f.success = String(patch.success).trim();
    if (patch.submitLabel != null) f.submitLabel = String(patch.submitLabel).trim() || f.submitLabel;
    f.updatedAt = now; f.updatedBy = by;
    log(data, now, by, 'Saved form ' + f.name);
    return { ok: true };
  });
}
export function setFormStatus(id, status, by) {
  if (!FORM_STATUS.includes(status)) return err('Pick a status.');
  return webStore.commit((data, now) => {
    const f = data.forms.find((x) => x.id === id);
    if (!f) return err('This form is gone.');
    f.status = status;
    log(data, now, by, `${f.name} set to ${status}`);
    return { ok: true };
  });
}
/** Mark a failing form as fixed (demo: a server would send a test submission and check it arrives). */
export function fixForm(id, by) {
  return webStore.commit((data, now) => {
    const f = data.forms.find((x) => x.id === id);
    if (!f) return err('This form is gone.');
    f.health = { ok: true, checkedAt: now };
    log(data, now, by, `${f.name}: test submission went through`);
    return { ok: true };
  });
}

// ---- submissions --------------------------------------------------------------------------------------------------
function eachSub(ids, fn) {
  return webStore.commit((data, now) => {
    const set = new Set(ids);
    let n = 0; const skipped = [];
    for (const s of data.submissions) {
      if (!set.has(s.id)) continue;
      const r = fn(s, now, data);
      if (r === true) n++; else if (r) skipped.push(r);
    }
    return { ok: true, n, skipped };
  });
}
/** Send to Leads in CRM (demo: marks them and gives a lead number; the CRM itself is not touched). */
export function sendToCrm(ids, by) {
  return eachSub(ids, (s, now, data) => {
    if (s.status === 'Spam') return 'spam';
    if (s.status === 'Sent to CRM') return 'already';
    s.status = 'Sent to CRM';
    s.leadRef = 'L-' + (4000 + data.submissions.filter((x) => x.leadRef).length + 1);
    s.history.push({ at: now, by, text: 'Sent to Leads in CRM as ' + s.leadRef });
    return true;
  });
}
export function markSpam(ids, by) {
  return eachSub(ids, (s, now) => {
    if (s.status === 'Spam') return 'already';
    s.status = 'Spam';
    s.history.push({ at: now, by, text: 'Marked as spam' });
    return true;
  });
}
export function notSpam(ids, by) {
  return eachSub(ids, (s, now) => {
    if (s.status !== 'Spam') return 'already';
    s.status = 'New';
    s.history.push({ at: now, by, text: 'Not spam: back to New' });
    return true;
  });
}
export function closeSubmissions(ids, by) {
  return eachSub(ids, (s, now) => {
    if (s.status === 'Closed') return 'already';
    s.status = 'Closed';
    s.history.push({ at: now, by, text: 'Closed' });
    return true;
  });
}
export function reopen(ids, by) {
  return eachSub(ids, (s, now) => {
    if (s.status === 'New') return 'already';
    s.status = 'New';
    s.history.push({ at: now, by, text: 'Reopened' });
    return true;
  });
}
export function subCounts(list) {
  const c = { all: list.length };
  for (const s of SUB_STATUSES) c[s] = 0;
  for (const s of list) c[s.status]++;
  return c;
}

// ---- overview -----------------------------------------------------------------------------------------------------
/**
 * The Overview's figures, attention rows and latest submissions.
 *   pages: the site's pages ([{ path, title, status }], from lib/admin/website.js › websitePages() or SITE_ROUTES)
 */
export function overview(data, t, pages) {
  const list = Array.isArray(pages) && pages.length ? pages : SITE_ROUTES;
  const isPub = (s) => /publish|live/i.test(String(s || ''));
  const isReview = (s) => /review/i.test(String(s || ''));
  const published = list.filter((p) => isPub(p.status)).length;
  const pagesInReview = list.filter((p) => isReview(p.status));
  const lpLive = data.landings.filter((l) => l.status === 'Published');
  const lpReview = data.landings.filter((l) => l.status === 'In review');
  const lpApproved = data.landings.filter((l) => l.status === 'Approved');
  const day0 = startOfDay(t);
  const last30 = data.traffic.filter((d) => d.day > day0 - 30 * DAY);
  const prev30 = data.traffic.filter((d) => d.day <= day0 - 30 * DAY && d.day > day0 - 60 * DAY);
  const visits = last30.reduce((a, d) => a + d.visits, 0);
  const visitsPrev = prev30.reduce((a, d) => a + d.visits, 0);
  const real = data.submissions.filter((s) => s.status !== 'Spam');
  const sub30 = real.filter((s) => s.at >= t - 30 * DAY);
  const trial30 = sub30.filter((s) => s.formId === 'trial').length;
  const fresh = data.submissions.filter((s) => s.status === 'New');
  const stale = fresh.filter((s) => t - s.at > 24 * 3600e3 && s.formId !== 'newsletter');
  const failing = data.forms.filter((f) => f.health && !f.health.ok);
  const noAlt = data.media.filter(needsAlt);

  const attention = [];
  for (const f of failing) attention.push({ key: 'form-' + f.id, tone: 'error', icon: 'circle-alert', title: f.name + ' form is failing', sub: f.health.error, href: '/admin/website/forms?form=' + f.id });
  if (lpReview.length || pagesInReview.length) {
    const n = lpReview.length + pagesInReview.length;
    attention.push({ key: 'review', tone: 'warning', icon: 'file-clock', title: `${n} ${n === 1 ? 'page waits' : 'pages wait'} for review`,
      sub: [...lpReview.map((l) => l.title), ...pagesInReview.map((p) => p.title)].slice(0, 3).join(' · '),
      href: lpReview.length ? '/admin/website/landing-pages?view=In%20review' : '/admin/website/pages' });
  }
  if (lpApproved.length) attention.push({ key: 'approved', tone: 'warning', icon: 'rocket', title: `${lpApproved.length} approved ${lpApproved.length === 1 ? 'landing page is' : 'landing pages are'} not published`, sub: lpApproved.map((l) => l.title).join(' · '), href: '/admin/website/landing-pages?view=Approved' });
  if (stale.length) attention.push({ key: 'stale', tone: 'warning', icon: 'inbox', title: `${stale.length} ${stale.length === 1 ? 'submission' : 'submissions'} waiting more than a day`, sub: 'New and not yet sent to the CRM or closed', href: '/admin/website/forms?tab=submissions&status=New' });
  if (noAlt.length) attention.push({ key: 'alt', tone: 'warning', icon: 'image-off', title: `${noAlt.length} ${noAlt.length === 1 ? 'image has' : 'images have'} no alt text`, sub: 'Used on live pages: screen readers and Google read nothing', href: '/admin/website/media?show=noalt' });

  const series = last30.map((d) => ({ label: dm(d.day), title: dmy(d.day), values: [d.visits], subs: real.filter((s) => s.at >= d.day && s.at < d.day + DAY).length }));
  return {
    figs: { published, inReview: lpReview.length + pagesInReview.length, lpLive: lpLive.length, visits, visitsPrev, visitsSpark: last30.map((d) => d.visits), trial30, sub30: sub30.length, fresh: fresh.length },
    attention: attention.slice(0, 5),
    latest: data.submissions.filter((s) => s.status !== 'Spam').slice(0, 6),
    series,
    pagesTotal: list.length,
  };
}

export { dm, dmy, hm };
