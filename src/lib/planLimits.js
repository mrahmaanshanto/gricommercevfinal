// planLimits — what the shop's plan allows and how much of it is used (Nayeem's brief #16, "Usage & Limits": plan meters,
// not the AI provider spend on AI Usage). Subscription & billing shows the meters.
//
//   LIMITS — per plan id (lib/plans.js): orders a month, products, staff seats, SMS + WhatsApp messages a month,
//            storage (MB), places (branches and warehouses), custom domains. null = no limit.
//   usageMeters(now) → [{ id, label, used, limit, unit, pct, state: 'ok'|'near'|'reached'|'none', note, href }]
//
// The limits belong in the plan catalogue (lib/plans.js, owned by the platform); they are kept here until it has them.
// Usage is counted from the shared books; storage is an estimate from the catalogue's photos. Front end only.

import { currentPlanId, PLANS } from './plans';
import { getOrders } from './orders';
import { getCatalog } from './stock';
import { USERS } from './team';
import { getPlaces } from './locations';
import { usageThisMonth } from './platformUsage';
import { getDomains } from './domains';
import { clockNow } from './settlements';

export const LIMITS = {
  starter: { orders: 500, products: 250, seats: 3, messages: 1000, storage: 2048, places: 1, domains: 0 },
  growth: { orders: 3000, products: 2000, seats: 10, messages: 3000, storage: 10240, places: 5, domains: 1 },
  business: { orders: 10000, products: 10000, seats: 15, messages: 8000, storage: 51200, places: 20, domains: 5 },
};
const AT_LIMIT = {
  orders: 'New orders still come in. We’ll ask you to upgrade.',
  products: 'You can’t add products until you upgrade or archive some.',
  seats: 'Add a seat or upgrade to invite more staff.',
  messages: 'Further messages are paid from your credits.',
  storage: 'New photos and files can’t be uploaded.',
  places: 'Upgrade to add another branch or warehouse.',
  domains: 'Upgrade to connect another domain.',
};

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const monthStart = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); };
const MB = (n) => (n >= 1024 ? (Math.round((n / 1024) * 10) / 10) + ' GB' : Math.round(n) + ' MB');

/** The plan's limits (the smallest plan's when the plan is unknown). */
export const limitsOf = (plan = currentPlanId()) => LIMITS[plan] || LIMITS.starter;

export function usageMeters(now = clockNow()) {
  const plan = currentPlanId();
  const lim = limitsOf(plan);
  const from = monthStart(now);
  const orders = safe(() => getOrders().filter((o) => o.at >= from && o.at <= now && o.status !== 'Cancelled').length, 0);
  const cat = safe(() => getCatalog(), []);
  const products = new Set(cat.map((p) => p.productId || p.name)).size;
  const seats = USERS.length;
  const use = safe(() => usageThisMonth(now), {});
  const messages = (use.sms || 0) + (use.whatsapp || 0);
  // photos: about 3 per product at ~350 KB, plus documents and the store theme
  const storage = Math.round(products * 3 * 0.35 + 640);
  const places = safe(() => getPlaces({ active: true }).filter((p) => !p.noSale || p.type === 'Warehouse').length, 1);
  const domains = safe(() => getDomains().length, 0);
  const row = (id, label, used, unit, href, fmt) => {
    const limit = lim[id];
    const pct = limit ? Math.min(1, used / limit) : limit === 0 ? (used ? 1 : 0) : 0;
    const state = limit == null ? 'none' : used >= limit ? 'reached' : pct >= 0.8 ? 'near' : 'ok';
    return { id, label, used, limit, unit, pct, state, usedText: fmt ? fmt(used) : used.toLocaleString('en-IN'), limitText: limit == null ? 'No limit' : fmt ? fmt(limit) : limit.toLocaleString('en-IN'), note: state === 'reached' ? AT_LIMIT[id] : '', href };
  };
  return {
    plan, planName: (PLANS[plan] || {}).name || plan,
    meters: [
      row('orders', 'Orders this month', orders, 'orders', '/merchant-orders'),
      row('products', 'Products', products, 'products', '/all-products'),
      row('seats', 'Staff seats', seats, 'seats', '/set-profile'),
      row('messages', 'SMS & WhatsApp this month', messages, 'messages', '/credit-wallet'),
      row('storage', 'Storage', storage, 'MB', '/set-media', MB),
      row('places', 'Branches & warehouses', places, 'places', '/warehouses'),
      row('domains', 'Custom domains', domains, 'domains', '/set-domains'),
    ],
  };
}
