// storefront/words — the store's own fixed words (button labels, headings, notes) that the merchant can change in the
// tweak panel (Words and labels) or by clicking the words on the page while tweaking. Saved with the theme
// (values.words, draft → publish), so a change is previewed before customers see it. `{n}` in a word is a number the page
// fills in. w(key, vars) reads the word (the merchant's, else the default); storeChrome sets the current theme's words
// with setStoreWords on every load. A word left empty goes back to the default.

export const WORD_GROUPS = [
  { id: 'buy', label: 'Buying buttons' },
  { id: 'stock', label: 'Stock and offers' },
  { id: 'product', label: 'Product page' },
  { id: 'cart', label: 'Cart' },
  { id: 'sections', label: 'Section links' },
  { id: 'contact', label: 'About and contact pages' },
  { id: 'account', label: 'Wishlist, compare and account' },
];

export const WORDS = [
  ['addToCart', 'buy', 'Add to cart'],
  ['buyNow', 'buy', 'Buy now'],
  ['soldOut', 'buy', 'Sold out'],
  ['outOfStock', 'stock', 'Out of stock'],
  ['inStock', 'stock', 'In stock'],
  ['preOrder', 'stock', 'Pre-order'],
  ['onlyLeft', 'stock', 'Only {n} left'],
  ['hurryLeft', 'stock', 'Hurry, only {n} left'],
  ['soldSoFar', 'stock', '{n} sold so far'],
  ['fbtTitle', 'product', 'Frequently bought together'],
  ['goesWell', 'product', 'Goes well with'],
  ['orderWhatsApp', 'product', 'Order on WhatsApp'],
  ['callOrder', 'product', 'Call for order'],
  ['tabDescription', 'product', 'Description'],
  ['tabSpecs', 'product', 'Specification'],
  ['tabReviews', 'product', 'Reviews'],
  ['cartTitle', 'cart', 'Your cart'],
  ['cartEmpty', 'cart', 'Your cart is empty.'],
  ['checkout', 'cart', 'Checkout'],
  ['viewAll', 'sections', 'View all'],
  ['visitShops', 'contact', 'Visit our shops'],
  ['visitShopsLead', 'contact', 'Try a phone in your hand before you buy. Repairs and warranty claims at every shop.'],
  ['customersSay', 'contact', 'What customers say'],
  ['followUs', 'contact', 'Follow us'],
  ['followLead', 'contact', 'New arrivals, price drops and unboxing videos first.'],
  ['sendMessage', 'contact', 'Send us a message'],
  ['sendBtn', 'contact', 'Send message'],
  ['quickAnswers', 'contact', 'Quick answers'],
  ['qa1Title', 'contact', 'Where is my order?'],
  ['qa1Text', 'contact', 'Track it with your order number and mobile.'],
  ['qa2Title', 'contact', 'Returns and refunds'],
  ['qa2Text', 'contact', '7-day returns, refunds by bKash, Nagad or bank.'],
  ['qa3Title', 'contact', 'Delivery charges and times'],
  ['qa3Text', 'contact', 'Inside Dhaka and all over Bangladesh.'],
  ['qa4Title', 'contact', 'Warranty and repairs'],
  ['qa4Text', 'contact', 'Bring it to any shop with your receipt.'],
  ['aboutShopNow', 'contact', 'Shop now'],
  ['aboutVisit', 'contact', 'Visit a shop'],
  ['wishlistTitle', 'account', 'Wishlist'],
  ['wishlistEmpty', 'account', 'Tap the heart on any product to save it here.'],
  ['compareTitle', 'account', 'Compare products'],
  ['accountTitle', 'account', 'Sign in'],
  ['accountLead', 'account', 'With your mobile number. We send a one-time code, no password needed.'],
].map(([key, group, def]) => ({ key, group, def }));

const DEF = Object.fromEntries(WORDS.map((x) => [x.key, x.def]));
let current = {};
/** The theme's words (storeChrome calls this on every load). */
export function setStoreWords(words) { current = words && typeof words === 'object' ? words : {}; }
/** A word: the merchant's own, else the default; {n} and other {names} are filled from vars. */
export function w(key, vars) {
  const own = typeof current[key] === 'string' && current[key].trim() ? current[key] : '';
  let out = own || DEF[key] || key;
  if (vars) Object.keys(vars).forEach((k) => { out = out.split('{' + k + '}').join(String(vars[k])); });
  return out;
}
export const wordDefault = (key) => DEF[key] || '';
