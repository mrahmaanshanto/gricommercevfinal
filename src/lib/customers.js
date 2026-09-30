// customers — the customer book shared by the Customers page, the POS register and Invoices.
// A customer buys Online, Retail, Wholesale, or any mix. A wholesale customer is given a price list
// when the account is created; New sale loads those prices on its own when that customer is chosen.
// Front end only: added customers are kept in this browser.

export const CUSTOMER_KEY = 'gc.customers';
export const CUSTOMER_TYPES = ['Online', 'Retail', 'Wholesale'];
// wholesale price lists: a percentage below the retail price
export const PRICE_TIERS = {
  A: { id: 'A', label: 'Wholesale A · shops', off: 10 },
  B: { id: 'B', label: 'Wholesale B · distributors', off: 15 },
};

const SEED = [
  { name: 'Jamal Telecom', phone: '01819447210', address: '12/3 Bazar Road, Kalshi, Mirpur-12, Dhaka', types: ['Wholesale'], tier: 'A' , creditLimit: 100000 },
  { name: 'Habib Telecom', phone: '01715332908', address: '45 Station Road, Tongi, Gazipur', types: ['Wholesale'], tier: 'A' , creditLimit: 80000 },
  { name: 'Maa Fatema Mobile', phone: '01912804551', address: 'Shop 8, Mohammadpur Town Hall Market, Dhaka', types: ['Retail', 'Wholesale'], tier: 'A' , creditLimit: 60000 },
  { name: 'Bismillah Mobile Corner', phone: '01674210987', address: '22 College Road, Savar, Dhaka', types: ['Wholesale'], tier: 'B' , creditLimit: 50000 },
  { name: 'New Madina Telecom', phone: '01845667302', address: 'Bhairab Bazar, Kishoreganj', types: ['Wholesale'], tier: 'B' , creditLimit: 75000 },
  { name: 'Shirin Akter', phone: '01811843300', address: 'House 9, Road 4, Dhanmondi, Dhaka', types: ['Online', 'Retail'] },
  { name: 'Nusrat Jahan', phone: '01553336655', address: 'House 14, Road 7, Sector 4, Uttara, Dhaka', types: ['Online'] },
];

const EDITS = 'gc.customers.edits';   // phone -> changes to a customer (type, price list, credit limit, merged into)
export const phoneDigits = (text) => String(text || '').replace(/[^0-9]/g, '').replace(/^88/, '');

function saved() {
  try { return JSON.parse(window.localStorage.getItem(CUSTOMER_KEY)) || []; } catch { return []; }
}
/** Every customer, the ones added in this browser first. */
export function getCustomers() {
  if (typeof window === 'undefined') return SEED;
  const edits = readEdits();
  return [...saved(), ...SEED].map((c) => ({ creditLimit: 0, ...c, ...(edits[c.phone] || {}) })).filter((c) => !c.mergedInto);
}
function readEdits() { try { return JSON.parse(window.localStorage.getItem(EDITS)) || {}; } catch { return {}; } }
/** Change a customer: name, address, types, price list (tier), credit limit. */
export function updateCustomer(phone, patch) {
  const edits = readEdits();
  edits[phoneDigits(phone)] = { ...(edits[phoneDigits(phone)] || {}), ...patch };
  try { window.localStorage.setItem(EDITS, JSON.stringify(edits)); } catch { /* ignore */ }
}
/** Merge a duplicate into the customer that is kept; the duplicate disappears from every list. */
export function mergeCustomers(keepPhone, dropPhone) {
  updateCustomer(dropPhone, { mergedInto: phoneDigits(keepPhone) });
}
export function addCustomer(customer) {
  const row = { ...customer, phone: phoneDigits(customer.phone) };
  try { window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify([row, ...saved().filter((c) => c.phone !== row.phone)])); } catch { /* ignore */ }
  return row;
}
export const findCustomer = (list, phone) => { const d = phoneDigits(phone); return d ? list.find((c) => c.phone === d) || null : null; };

/** Where a customer was first entered, shown on the customer (addedFrom). */
export const ADDED_FROM = { order: 'Online order', link: 'Order link', pos: 'POS' };
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
/**
 * Keep a customer met at an order, an order link or the POS in the customer book, once.
 * The mobile number is matched first: a known customer is not added again (a buying type they did
 * not have yet is added to them). Returns the customer, or null when the number is not a mobile number.
 * { name, phone, address, types, addedFrom }
 */
export function saveCustomerOnce({ name, phone, address, types, addedFrom }) {
  const d = phoneDigits(phone);
  if (!/^01[3-9]\d{8}$/.test(d)) return null;
  const want = (types && types.length ? types : ['Retail']).filter((t) => CUSTOMER_TYPES.includes(t));
  const known = findCustomer(getCustomers(), d);
  if (known) {
    const missing = want.filter((t) => !(known.types || []).includes(t));
    if (missing.length) updateCustomer(d, { types: [...(known.types || []), ...missing] });
    return known;
  }
  return addCustomer({ name: String(name || '').trim() || 'Customer · ' + d, phone: d, address: String(address || '').trim(), types: want, creditLimit: 0, signup: today(), addedFrom, src: addedFrom });
}
/** The wholesale price list of a customer, or null when the customer does not buy wholesale. */
export const tierOf = (customer) => (customer && customer.types && customer.types.includes('Wholesale') ? PRICE_TIERS[customer.tier] || PRICE_TIERS.A : null);
export const tierPrice = (price, tier) => (tier ? Math.round(price * (100 - tier.off) / 100) : price);
