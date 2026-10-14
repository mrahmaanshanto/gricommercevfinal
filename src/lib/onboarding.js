// onboarding — keeps what the merchant answered at sign-up (/merchant-onboarding) and uses it after:
//   shop name, support phone and address → Settings › General (businessProfile: top bar, invoices, receipts)
//   shop link → the GridCommerce address (Settings › Domains)
//   how you sell → the edition the menu shows (on the full site, a preview; an edition's own site can't change)
//   the person → the owner's account (My account: name and phone), signed in as the owner
//   then Home shows the "Getting started" checklist (the first-run view, screens/merchant-overview/HomeExtras.jsx)
//   start: 'demo' (learn with the sample shop) | 'own' (start with your own data: the checklist leads with imports)
//
//   editionFor(where) · saveOnboarding(answers) → { edition, problems } · setStart(start) · onboardingOf() · startFirstRun()
// Front end only (gc.onboarding). A true empty shop needs the server (a new shop with no rows); in this preview the
// sample shop's data stays, and the page says so.

import { readSettings, writeSettings } from './settingsStore';
import { setSubdomain } from './domains';
import { LOCKED, previewEdition, currentEditionId } from './edition';
import { signInAs, userBy } from './team';
import { saveProfile } from './myAccount';
import { getSavedProducts } from './products';
import { POS_KEYS } from './posStore';

export const ONBOARD_KEY = 'gc.onboarding';
export const FIRST_KEY = 'gc.home.firstrun';
export const READY_KEY = 'gc.home.readiness';
const ONLINE = ['Facebook page', 'Instagram', 'WhatsApp', 'Marketplace'];

const ssr = () => typeof window === 'undefined';
const raw = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };

/** The edition for the answer to "How do you sell today?": a shop and online → Retail + Online, a shop only → Retail,
 *  online only → Online. Not selling yet (or nothing picked) → Retail + Online, so nothing is hidden. */
export function editionFor(where = []) {
  const shop = where.includes('Physical shop');
  const online = where.some((w) => ONLINE.includes(w));
  if (shop && !online) return 'retail-wholesale';
  if (online && !shop) return 'online';
  return 'retail-online';
}

/** The demo's first-run view: Home shows the checklist; a step counts once it is done after this moment. */
export function startFirstRun() {
  if (ssr()) return;
  let products = 0;
  try { products = getSavedProducts().length; } catch { products = 0; }
  try {
    window.localStorage.removeItem(READY_KEY);
    window.localStorage.setItem(FIRST_KEY, JSON.stringify({ at: Date.now(), products, counters: raw(POS_KEYS.counters), staff: raw('gc.hr.staff') }));
  } catch { /* storage blocked */ }
}

/**
 * Save the answers. { name, phone (10 digits after 0), biz, cat, address, where, size, pay, slug, retail }.
 * Returns { edition, problems: [text] } — a problem is something that couldn't be kept (shown on the last step).
 */
export function saveOnboarding(a) {
  const problems = [];
  if (ssr()) return { edition: currentEditionId(), problems };
  const phone = a.phone ? '0' + String(a.phone).replace(/\D/g, '').replace(/^0+/, '') : '';
  // the shop's details: Settings › General
  const general = { store_name: String(a.biz || '').trim() };
  if (phone) general.support_phone = '+88' + phone;
  if (String(a.address || '').trim()) general.store_address = String(a.address).trim();
  const w = writeSettings('general', general, { baseVersion: readSettings('general').version, by: a.name || 'Owner', force: true });
  if (!w || !w.ok) problems.push('Your shop details couldn’t be saved. Add them in Settings › General.');
  // the shop link
  const err = a.slug ? setSubdomain(a.slug) : '';
  if (err) problems.push('Shop link: ' + err + ' Change it in Settings › Domains.');
  // how you sell → the menu (an edition's own site keeps its edition)
  const edition = LOCKED ? currentEditionId() : a.retail ? 'retail-wholesale' : editionFor(a.where || []);
  if (!LOCKED) previewEdition(edition);
  // the person is the owner
  signInAs('ceo');
  const owner = userBy('ceo');
  try {
    const r = saveProfile('ceo', { name: a.name, phone, email: (owner && owner.email) || 'owner@shop.com' });
    if (!r.ok) problems.push('Your name and phone couldn’t be saved. Add them in My account.');
  } catch { problems.push('Your name and phone couldn’t be saved. Add them in My account.'); }
  try {
    window.localStorage.setItem(ONBOARD_KEY, JSON.stringify({ at: Date.now(), name: a.name, biz: a.biz, cat: a.cat, address: a.address || '', where: a.where || [], size: a.size || '', pay: a.pay || [], slug: a.slug, edition, start: 'demo' }));
  } catch { /* ignore */ }
  startFirstRun();
  return { edition, problems };
}
/** 'demo' (learn with the sample shop) or 'own' (bring your own data first). */
export function setStart(start) {
  const o = onboardingOf();
  if (!o) return;
  try { window.localStorage.setItem(ONBOARD_KEY, JSON.stringify({ ...o, start: start === 'own' ? 'own' : 'demo' })); } catch { /* ignore */ }
}
/** What was answered at sign-up, or null. */
export function onboardingOf() {
  if (ssr()) return null;
  try { return JSON.parse(window.localStorage.getItem(ONBOARD_KEY)) || null; } catch { return null; }
}
