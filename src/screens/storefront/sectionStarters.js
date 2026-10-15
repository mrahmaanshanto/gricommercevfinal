// The content a new section starts with (Online Store › Layouts › Add section, and the All sections page): a look that
// needs pictures or points gets sample ones, so it shows on the store at once. lookPatch adds what a look needs the first
// time it is picked (Hero › Slider and 2 banners gets two banners).

import { slide } from '@/lib/storefront/layouts';
import { sfId } from '@/lib/storefront/store';
import { STORE_IMAGES } from '@/lib/storefront/presets';
import { TRUST_DEFAULT } from './sections2';

const img = (i) => (STORE_IMAGES[i % STORE_IMAGES.length] || {}).src || '';
export const STARTER = {
  hero: () => ({ slides: [slide('Your headline', 'One short line about the offer.', 'Shop now', '/store')] }),
  trust: () => ({ items: TRUST_DEFAULT.map((x) => ({ ...x, id: sfId('it') })) }),
  bannergrid: () => ({ banners: [0, 1, 2, 3, 4, 0].map((n, i) => ({ id: sfId('bn'), image: img(n), title: ['New arrivals', 'Accessories', 'Order online', 'Visit a branch', 'Repairs', 'Gift ideas'][i], text: '', href: '/store' })) }),
  quicklinks: () => ({ items: [['smartphone', 'Phone finder', 'Find the right phone', '/search?q=phone'], ['message-circle', 'Raise a complaint', 'Tell us what went wrong', '/page?handle=contact'], ['calculator', 'EMI calculator', 'See the monthly cost', '/offers'], ['wrench', 'Repair centre', 'Fix your device', '/page?handle=contact']].map(([icon, title, text, href]) => ({ id: sfId('it'), icon, title, text, href })) }),
  steps: () => ({ items: [['badge-check', 'Straight from the brand', 'Every phone comes from the official importer, sealed.'], ['flask-conical', 'Checked before it ships', 'We switch every device on and test it before packing.'], ['shield-check', 'Warranty you can use', 'Official warranty, and we handle the claim for you.']].map(([icon, title, text]) => ({ id: sfId('it'), icon, title, text })) }),
  outlet: () => ({ photos: [0, 1, 2, 3].map((n) => ({ id: sfId('it'), image: img(n) })) }),
  seotext: () => ({ text: 'Dazzle Shop sells official smartphones, accessories and gadgets across Bangladesh with cash on delivery.\n\n## Official warranty on every phone\nEvery phone comes with the brand’s official warranty, and our branches handle the claim for you.\n\n## Delivery all over Bangladesh\n1–2 days inside Dhaka and 3–5 days outside Dhaka.', tags: 'Samsung, iPhone, Xiaomi, Earbuds, Power bank, Smart watch' }),
  deal: () => ({ image: img(0) }),
  reviews: () => ({}),
  hotspot: () => ({ image: img(0), pins: [{ id: sfId('pin'), product: 'p-smart-watch', x: 30, y: 38 }, { id: sfId('pin'), product: 'p-fpods', x: 58, y: 58 }, { id: sfId('pin'), product: 'p-phone-cooler', x: 76, y: 30 }] }),
  compare: () => ({ before: img(1), after: img(0), beforeLabel: 'Before', afterLabel: 'After', text: 'Drag the line to see the difference our screen protector and polish make.' }),
  testimonials: () => ({ items: [
    { id: sfId('it'), text: 'Got my Redmi in a day with the official warranty card. They even set up the phone for me.', name: 'Nadia Islam', role: 'Bought a phone, Dhanmondi', stars: '5', photo: '' },
    { id: sfId('it'), text: 'Fair price for the screen change and done in an hour. The Mirpur branch staff explained everything.', name: 'Rafiq Ahmed', role: 'Repair customer', stars: '5', photo: '' },
    { id: sfId('it'), text: 'Cash on delivery to Sylhet, the rider let me check the earbuds first. Will buy again.', name: 'Tasnim Akter', role: 'Online order, Sylhet', stars: '4', photo: '' }] }),
  team: () => ({ items: [
    { id: sfId('it'), photo: img(0), name: 'Rakib Hasan', role: 'Founder, Dhanmondi branch', text: 'Has been fixing and selling phones since 2014.' },
    { id: sfId('it'), photo: img(2), name: 'Nabila Rahman', role: 'Online orders', text: 'Makes sure every parcel leaves on time.' },
    { id: sfId('it'), photo: img(3), name: 'Sumaiya Khan', role: 'Videos and reviews', text: 'Tests every gadget before it goes on the website.' }] }),
  timeline: () => ({ items: [
    { id: sfId('it'), year: '2014', title: 'A small counter in Dhanmondi', text: 'Phone repairs and a few accessories.' },
    { id: sfId('it'), year: '2018', title: 'Official phones', text: 'We became a dealer for the big brands, with their warranty.' },
    { id: sfId('it'), year: '2021', title: 'Online, all over Bangladesh', text: 'Cash on delivery to every district.' },
    { id: sfId('it'), year: '2025', title: 'The Mirpur branch', text: 'A second shop with a repair desk.' }] }),
  counters: () => ({ items: [
    { id: sfId('it'), icon: 'smile', value: '25000', suffix: '+', label: 'happy customers' },
    { id: sfId('it'), icon: 'package', value: '1200', suffix: '+', label: 'products in stock' },
    { id: sfId('it'), icon: 'map-pin', value: '64', suffix: '', label: 'districts we deliver to' },
    { id: sfId('it'), icon: 'star', value: '4.8', suffix: '/5', label: 'average rating' }] }),
  pricelist: () => ({ items: [
    { id: sfId('it'), title: 'Screen replacement', text: 'Original panel, 3-month warranty', price: 'from ৳2,500', tag: 'Popular' },
    { id: sfId('it'), title: 'Battery replacement', text: 'Done while you wait', price: 'from ৳1,200', tag: '' },
    { id: sfId('it'), title: 'Charging port repair', text: '', price: '৳800', tag: '' },
    { id: sfId('it'), title: 'Software and setup', text: 'Data transfer and updates', price: '৳300', tag: '' },
    { id: sfId('it'), title: 'Screen protector fitting', text: 'Free with any protector', price: 'Free', tag: 'Free' }], button: 'Book a repair', href: '/page?handle=contact-us' }),
  marquee: () => ({}),
  gallery: () => ({ items: ['/assets/products/smart-watch.webp', img(0), '/assets/products/fastrack-fpods.webp', img(2), '/assets/products/phone-cooler.webp', img(3)].map((src) => ({ id: sfId('it'), image: src, caption: '', href: 'https://instagram.com/dazzleshopbd' })) }),
  table: () => ({ rows: 'Plan | Starter | Plus | Pro\nScreen size | 6.1 in | 6.5 in | 6.9 in\nStorage | 128 GB | 256 GB | 512 GB\nFast charging | no | yes | yes\nPrice | ৳21,999 | ৳36,999 | ৳52,999' }),
  iconlist: () => ({ items: [
    { id: sfId('it'), icon: 'badge-check', title: 'Official warranty card', text: 'From the brand, honoured everywhere' },
    { id: sfId('it'), icon: 'truck', title: 'Delivery in 1–2 days', text: 'Inside Dhaka' },
    { id: sfId('it'), icon: 'banknote', title: 'Cash on delivery', text: 'Check the parcel first' },
    { id: sfId('it'), icon: 'rotate-ccw', title: '7-day return', text: 'If something is wrong' }] }),
  social: () => ({}),
  spotlight: () => ({ product: 'p-smart-watch', text: 'Take calls on your wrist, track your steps and sleep, and get a week on one charge.', points: [{ id: sfId('it'), title: 'Bluetooth calling' }, { id: sfId('it'), title: '7-day battery' }, { id: sfId('it'), title: '1-year warranty' }] }),
  contact: () => ({}),
  faq: () => ({ items: [{ q: 'How long does delivery take?', a: '1–2 days in Dhaka, 3–5 days outside Dhaka.', topic: 'Delivery' }, { q: 'Can I pay on delivery?', a: 'Yes. Pay the rider in cash when the parcel arrives.', topic: 'Payment' }, { q: 'Is the warranty official?', a: 'Yes. Every phone comes with the brand’s official warranty.', topic: 'Warranty' }] }),
};
/** Content a look needs the first time it is picked (Hero › Slider and 2 banners gets two banners). */
export function lookPatch(s, look) {
  if (s.type === 'hero' && look === 'banners' && !(s.side || []).length) {
    return { side: [{ id: sfId('bn'), title: 'Accessories', text: 'Cases, chargers and more', href: '/search?q=charger', image: STORE_IMAGES[0] ? STORE_IMAGES[0].src : '' }, { id: sfId('bn'), title: 'Order online', text: 'Cash on delivery', href: '/store', image: STORE_IMAGES[1] ? STORE_IMAGES[1].src : '' }] };
  }
  return {};
}
