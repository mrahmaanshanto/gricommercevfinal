// moduleSetup — a short setup checklist for each area of the menu (components/ModuleSetup.jsx shows it on the area's
// main page until every step is done, then folds into one "set up" line). Each step reads the lib that owns it, so a
// step ticks itself the moment the merchant does it anywhere in the app.
//   AREA_SETUP   { [area id or page key]: { title, steps: [{ id, module, label, href, done() }] } }
//   setupFor(area, ed) → { title, steps: [...{ ok }], done, total } for the edition's modules, or null
// A step that cannot be read counts as done (no false alarms). Browser only.

import { hasModule, currentEditionId } from './edition';
import { getAllPartners } from './settlements';
import { getCounters } from './posStore';
import { devicesAt } from './hardware';
import { allProducts } from './products';
import { getBrands } from './brands';
import { getPlaces } from './locations';
import { getStockSetup } from './stockSetup';
import { getMoves } from './stock';
import { getSuppliers, getBills } from './supplierBills';
import { statusOf, connectedInbox } from './connections';
import { OWN_ACCOUNTS } from './ledger';
import { loadSnapshot } from './hr';
import { getSources } from './gridai/knowledge';
import { getProfile } from './gridai/profile';
import { getOffers } from './smartOffers';
import { getOffers as getPromotions } from './promotions';
import { getCreditRules } from './creditRules';
import { getCustomers } from './customers';

const safe = (fn) => { try { return !!fn(); } catch { return true; } };
const partners = (kind) => getAllPartners().filter((p) => p.kind === kind);
const connected = (id) => statusOf(id).state !== 'off';

export const AREA_SETUP = {
  'area-products': { title: 'Products', steps: [
    { id: 'products', module: 'catalog', label: 'Add your products', href: '/add-product', done: () => allProducts().some((p) => p.st === 'active') },
    { id: 'brands', module: 'catalog', label: 'Add the brands you sell', href: '/brands', done: () => getBrands().length > 0 },
  ] },
  'area-inventory': { title: 'Inventory', steps: [
    { id: 'shape', module: 'catalog', label: 'Choose one place or many', href: '/stock-setup', done: () => getStockSetup().saved || getPlaces().length > 0 },
    { id: 'places', module: 'places', label: 'Check your warehouse and branches', href: '/warehouses', done: () => getPlaces({ active: true }).some((p) => p.type === 'Warehouse' && !p.noSale) },
    { id: 'opening', module: 'catalog', label: 'Enter your opening stock', href: '/stock', done: () => getMoves().some((m) => m.kind === 'opening') || allProducts().some((p) => (p.inv || 0) > 0) },
  ] },
  'area-orders': { title: 'Orders', steps: [
    { id: 'courier', module: 'online', label: 'Connect a courier', href: '/connections?group=delivery', done: () => partners('Courier').length > 0 },
    { id: 'sms', module: 'online', label: 'Turn on order messages (SMS)', href: '/connections?group=messages', done: () => connected('sms') },
    { id: 'payment', module: 'online', label: 'Connect an online payment', href: '/connections?group=payments', done: () => partners('Gateway').some((p) => p.id !== 'card') },
  ] },
  'area-payments': { title: 'Payments', steps: [
    { id: 'bank', module: 'money', label: 'Add your bank accounts', href: '/account-setup?tab=accounts', done: () => OWN_ACCOUNTS().some((a) => a.type === 'Bank') },
    { id: 'gateway', module: 'commerce', label: 'Connect a payment', href: '/connections?group=payments', done: () => partners('Gateway').length > 0 },
  ] },
  'area-customers': { title: 'Customers', steps: [
    { id: 'customers', module: 'core', label: 'Add or import your customers', href: '/all-customers', done: () => getCustomers().length > 0 },
    { id: 'credit', module: 'core', label: 'Decide on selling on due', href: '/customer-settings#credit', done: () => { const r = getCreditRules(); return r.allowRetailDue || window.localStorage.getItem('gc.credit.rules') != null; } },
    { id: 'meet', module: 'comms', label: 'Connect Zoom or Google Meet for meetings', href: '/connections?group=meetings', done: () => connected('zoom') || connected('google-meet') },
  ] },
  'area-pos': { title: 'POS', steps: [
    { id: 'counter', module: 'pos', label: 'Set up a counter', href: '/pos-manage', done: () => getCounters().some((c) => c.active !== false) },
    { id: 'printer', module: 'pos', label: 'Connect a receipt printer', href: '/pos-manage', done: () => getCounters().some((c) => devicesAt(c).some((d) => d.kind === 'printer' && d.state === 'ok')) },
    { id: 'card', module: 'pos', label: 'Add the card machine', href: '/connections?group=payments', done: () => partners('Gateway').some((p) => p.id === 'card') },
  ] },
  'area-inbox': { title: 'Inbox', steps: [
    { id: 'chat', module: 'comms', label: 'Connect a chat channel', href: '/connections?group=social', done: () => connectedInbox('chat').length > 0 },
    { id: 'sms', module: 'comms', label: 'Connect an SMS gateway', href: '/connections?group=messages', done: () => connected('sms') },
  ] },
  'area-gridai': { title: 'Grid AI', steps: [
    { id: 'kb', module: 'comms', label: 'Teach Grid AI about your shop', href: '/ai-knowledge', done: () => getSources().length > 0 },
    { id: 'voice', module: 'comms', label: 'Set how Grid AI talks', href: '/ai-behaviour', done: () => !!getProfile() },
  ] },
  'area-marketing': { title: 'Marketing', steps: [
    { id: 'offer', module: 'marketing', label: 'Create your first offer', href: '/coupons', done: () => getPromotions().length > 0 },
    { id: 'smart', module: 'online', label: 'Turn on a smart offer', href: '/smart-offers', done: () => getOffers().some((o) => o.on !== false) },
    { id: 'gbp', module: 'marketing', label: 'Connect Google Business Profile', href: '/connections?group=social', done: () => connected('gbp') },
  ] },
  'area-hr': { title: 'Staff & HR', steps: [
    { id: 'staff', module: 'hr', label: 'Add your staff', href: '/staff-create', done: () => (loadSnapshot().staff || []).length > 0 },
    { id: 'device', module: 'hr', label: 'Connect an attendance machine', href: '/attendance-devices', done: () => (loadSnapshot().devices || []).length > 0 },
  ] },
  // not a menu area: the Purchases page (Inventory › Purchases)
  purchases: { title: 'Purchases', steps: [
    { id: 'supplier', module: 'catalog', label: 'Add a supplier', href: '/suppliers', done: () => getSuppliers().length > 0 },
    { id: 'purchase', module: 'catalog', label: 'Record your first purchase', href: '/buy-goods', done: () => getBills().length > 0 },
  ] },
};

/** The checklist of one area for the edition: { title, steps (with ok), done, total }, or null when nothing applies. */
export function setupFor(area, ed = currentEditionId()) {
  if (typeof window === 'undefined') return null;
  const a = AREA_SETUP[area];
  if (!a) return null;
  const steps = a.steps.filter((s) => hasModule(s.module, ed)).map((s) => ({ ...s, ok: safe(s.done) }));
  if (!steps.length) return null;
  return { title: a.title, steps, done: steps.filter((s) => s.ok).length, total: steps.length };
}
export const SETUP_REFRESH = ['focus', 'storage', 'gc:connections', 'gc:ledger', 'gc:pos', 'gc:brands', 'gc:credit-rules'];
