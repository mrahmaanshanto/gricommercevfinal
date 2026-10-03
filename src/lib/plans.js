// plans — what the shop pays for (brief #21: entitlements are separate from the edition). The edition (lib/edition.js)
// says which modules the shop uses; the plan says which of those are paid for. A module the edition uses but the plan
// lacks shows in the menu as locked with "Upgrade" (to people who manage billing) and never as a working page:
// components/RoleGuard.jsx covers its pages with an upgrade note.
//
//   PLANS · PLAN_IDS · PLAN_EVENT
//   currentPlanId() · currentPlan() · setPlan(id)      kept in this browser (gc.plan); ?plan=<id> on any page sets it
//   entitled(module, plan)  · plansWith(module)  · lockedModules(ed, plan)  · upgradeHref(module)
//
// Front end only: a real build reads the subscription from the server. When the plan cannot be read safely the menu
// fails closed (an unknown plan id counts as the smallest plan). Leaf module: no imports, so scripts/test-nav.mjs can
// load it in Node.

export const PLAN_KEY = 'gc.plan';
export const PLAN_EVENT = 'gc:plan';

const STARTER = ['core', 'catalog', 'commerce', 'money', 'reports', 'online', 'pos', 'comms'];
const GROWTH = [...STARTER, 'places', 'purchasing', 'marketing', 'wholesale', 'channels', 'automation'];

export const PLANS = {
  starter: { name: 'Starter', modules: STARTER },
  growth: { name: 'Growth', modules: GROWTH },
  // every module, Staff & HR included (the demo shop's plan)
  business: { name: 'Business', modules: '*' },
};
export const PLAN_IDS = Object.keys(PLANS);
export const DEFAULT_PLAN = 'business';
const SMALLEST = 'starter';

const ssr = () => typeof window === 'undefined';

/** The shop's plan: ?plan=<id> (kept), else the saved one, else the default. An unknown saved value fails closed. */
export function currentPlanId() {
  if (ssr()) return DEFAULT_PLAN;
  try {
    const q = new URLSearchParams(window.location.search).get('plan');
    if (q && PLANS[q]) { window.localStorage.setItem(PLAN_KEY, q); return q; }
    const v = window.localStorage.getItem(PLAN_KEY);
    if (v == null) return DEFAULT_PLAN;
    return PLANS[v] ? v : SMALLEST;
  } catch { return DEFAULT_PLAN; }
}
export const currentPlan = () => ({ id: currentPlanId(), ...PLANS[currentPlanId()] });

/** Change the plan (Subscription & billing, or the demo). */
export function setPlan(id) {
  if (!PLANS[id] || ssr()) return;
  try { window.localStorage.setItem(PLAN_KEY, id); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail: id }));
}

/** Does the plan pay for this module? 'core' is in every plan; an unknown plan fails closed. */
export function entitled(module, plan = currentPlanId()) {
  if (!module || module === 'core') return true;
  const p = PLANS[plan] || PLANS[SMALLEST];
  return p.modules === '*' || p.modules.includes(module);
}
/** The plans that include a module, smallest first ("Comes with Growth and Business"). */
export const plansWith = (module) => PLAN_IDS.filter((id) => entitled(module, id));
/** Modules the edition uses that the plan lacks. */
export const lockedModules = (modules, plan = currentPlanId()) => (modules || []).filter((m) => !entitled(m, plan));
/** Where an "Upgrade" link goes. */
export const upgradeHref = (module) => '/subscription' + (module ? '?upgrade=' + encodeURIComponent(module) : '');
