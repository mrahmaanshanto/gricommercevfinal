// shopOnboarding — a new owner creating a shop (the phone app's sign-up, /onb-*; the web onboarding can use the same
// calls): the answers given step by step, the demo SMS code, the shop-link check, and the one call that saves the shop.
//
//   getDraft() · saveDraft(patch) · clearDraft()     the answers so far (kept in this browser, gc.onb.draft)
//   normPhone(text) → '01XXXXXXXXX' or ''             BD mobile check (11 digits, 013–019; +880 / 880 allowed)
//   showPhone('01712345678') → '01712-345678'
//   sendCode(phone) → code · codeOf() · codeAge() · checkCode(text)   the demo SMS code (shown on screen: no SMS leaves
//                                                    the browser; a real shop's server sends it and checks it)
//   accountByPhone(phone) → the account using this number (team.js allUsers: demo people and invited ones, with My
//                           account changes) or null
//   KINDS · SELL (online / shop / both → edition) · FIND · PAY      the choices on the steps
//   slugOf(name) · checkHandle(handle) → { ok, reason, suggestions }   the shop link (<handle>.gridcommerce.com.bd)
//   createShop(answers) → { ok, error, problems }   saves everything where the panel reads it, through the web
//       sign-up's save (lib/onboarding.js › saveOnboarding: Settings › General store name and support phone, the shop
//       link, the edition, the owner account 'ceo' with the name and mobile, signed in, Home's first-run view), plus:
//       the edition named by "How you sell" (previewEdition; an edition's own site keeps its edition)
//       Settings › Stock setup  saveStockSetup({ buying, homeId }) for that edition
//       Settings › General      shop_kind (what the shop sells)
//       the record              gc.onboarding (the web's fields + from 'app', phone, shop, kind, sell, handle, find,
//                               buying, product)
//   getOnboarding() → that record or null · noteFirstProduct(product)
//
// Front end only. A real sign-up creates the shop and the owner's login on the server, sends the SMS code and keeps the
// shop link unique across every shop; here the "taken" links are a fixed demo list.

import { isBdPhone, withAccount } from './myAccount';
import { allUsers, signInAs } from './team';
import { EDITIONS, LOCKED, currentEditionId, previewEdition } from './edition';
import { saveStockSetup, DEFAULT_HOME_ID } from './stockSetup';
import { SUBDOMAIN_BASE } from './domains';
import { writeSettings } from './settingsStore';
import { saveOnboarding, onboardingOf } from './onboarding';

const DRAFT_KEY = 'gc.onb.draft';
const DONE_KEY = 'gc.onboarding';
export const ONB_EVENT = 'gc:onboarding';
export const OWNER_ID = 'ceo';            // the demo shop's owner account
export const CODE_WAIT = 30;              // seconds before "Resend code"
export { SUBDOMAIN_BASE };

const ssr = () => typeof window === 'undefined';
const readJson = (k) => { if (ssr()) return null; try { const v = JSON.parse(window.localStorage.getItem(k)); return v && typeof v === 'object' ? v : null; } catch { return null; } };
const writeJson = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(ONB_EVENT)); } catch { /* full or blocked */ } };

// ---- the answers so far ----------------------------------------------------------------------------------
export const getDraft = () => readJson(DRAFT_KEY) || {};
export function saveDraft(patch) { const next = { ...getDraft(), ...patch }; writeJson(DRAFT_KEY, next); return next; }
export function clearDraft() { try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }

// ---- phone and the demo code ----------------------------------------------------------------------------
/** A Bangladesh mobile number as 01XXXXXXXXX, or '' when it isn't one. */
export function normPhone(text) {
  let d = String(text || '').replace(/[^\d]/g, '');
  if (d.startsWith('880')) d = d.slice(2);
  else if (d.length === 10 && d.startsWith('1')) d = '0' + d;
  return isBdPhone(d) && /^01[3-9]\d{8}$/.test(d) ? d : '';
}
export const showPhone = (p) => (p && p.length === 11 ? p.slice(0, 5) + '-' + p.slice(5) : p || '');
const digits = (s) => String(s || '').replace(/[^\dX]/gi, '');

/** Make a new 6-digit code for this number (the demo shows it on screen). */
export function sendCode(phone, scope = 'signup') {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  saveDraft({ [scope + 'Phone']: phone, [scope + 'Code']: code, [scope + 'CodeAt']: Date.now(), [scope + 'Tries']: 0 });
  return code;
}
export const codeOf = (scope = 'signup') => getDraft()[scope + 'Code'] || '';
/** Seconds since the code was sent. */
export const codeAge = (scope = 'signup', now = Date.now()) => Math.floor((now - (getDraft()[scope + 'CodeAt'] || 0)) / 1000);
/** → '' when right, else what to tell the person. */
export function checkCode(text, scope = 'signup') {
  const d = getDraft();
  const want = d[scope + 'Code'];
  if (!want) return 'Send a code first.';
  const got = String(text || '').replace(/\D/g, '');
  if (got.length < 6) return 'Enter all 6 digits.';
  if (Date.now() - (d[scope + 'CodeAt'] || 0) > 10 * 60 * 1000) return 'This code has expired. Send a new one.';
  if (got !== want) {
    const tries = (d[scope + 'Tries'] || 0) + 1;
    saveDraft({ [scope + 'Tries']: tries });
    return tries >= 5 ? 'Too many wrong tries. Send a new code.' : 'That code is not right. Check the SMS and try again.';
  }
  saveDraft({ [scope + 'Verified']: d[scope + 'Phone'], [scope + 'Code']: '', [scope + 'Tries']: 0 });
  return '';
}

/** The demo account using this mobile number (with its own My account changes), or null. */
export function accountByPhone(phone) {
  const want = normPhone(phone);
  if (!want) return null;
  return allUsers().map((u) => withAccount(u)).find((u) => u && digits(u.phone) === want) || null;
}

// ---- the choices ---------------------------------------------------------------------------------------------
export const KINDS = [
  { key: 'fashion', label: 'Fashion & clothing', icon: 'tag' },
  { key: 'beauty', label: 'Beauty & skincare', icon: 'sparkles' },
  { key: 'phones', label: 'Phones & electronics', icon: 'mobile' },
  { key: 'food', label: 'Food & grocery', icon: 'cart' },
  { key: 'home', label: 'Home & living', icon: 'home' },
  { key: 'other', label: 'Something else', icon: 'grid' },
];
/** How the shop sells → the edition (lib/edition.js). */
export const SELL = [
  { key: 'online', label: 'Online only', sub: 'Facebook, Instagram, WhatsApp or a website', edition: 'online', icon: 'globe' },
  { key: 'shop', label: 'In a shop only', sub: 'Customers buy at the counter', edition: 'retail-wholesale', icon: 'store' },
  { key: 'both', label: 'Online and in a shop', sub: 'One stock for both', edition: 'retail-online', icon: 'layers' },
];
export const FIND = ['Facebook page', 'Instagram', 'WhatsApp', 'Website', 'Marketplace'];
export const PAY = ['Cash on delivery', 'bKash', 'Nagad', 'Card'];
export const sellOf = (key) => SELL.find((s) => s.key === key) || null;
/** On an edition's own site the edition is fixed: the answer that matches it. */
export function lockedSell() {
  if (!LOCKED) return null;
  const ed = currentEditionId();
  return SELL.find((s) => s.edition === ed) || { key: 'site', label: EDITIONS[ed].name, sub: '', edition: ed, icon: 'store' };
}

// ---- shop link -------------------------------------------------------------------------------------------------
// links other shops already use (demo list; a real check asks the server)
const TAKEN = ['dazzleshop', 'dhakafashion', 'styleshop', 'gadgethouse', 'beautybox', 'bdmart', 'fashionbd', 'deshishop', 'shop', 'www', 'admin', 'api', 'mail', 'help', 'support', 'gridcommerce'];
export function slugOf(name) {
  return String(name || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32).replace(/-+$/, '');
}
const isTaken = (h) => TAKEN.includes(h);
/** → { ok, reason, suggestions } */
export function checkHandle(input) {
  const h = String(input || '').trim().toLowerCase();
  if (h.length < 3) return { ok: false, reason: 'Use at least 3 letters or numbers.', suggestions: [] };
  if (!/^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])$/.test(h)) return { ok: false, reason: 'Use only letters, numbers and dashes, not at the start or end.', suggestions: [] };
  if (isTaken(h)) {
    const base = h.slice(0, 26);
    const suggestions = [base + '-bd', base + 'shop', base + '-dhaka', base + '24'].filter((x) => !isTaken(x)).slice(0, 3);
    return { ok: false, reason: 'Another shop uses this link.', suggestions };
  }
  return { ok: true, reason: '', suggestions: [] };
}

// ---- save the shop ---------------------------------------------------------------------------------------------
export const getOnboarding = () => readJson(DONE_KEY);

/** Save every answer where the panel reads it and sign the owner in. → { ok, error, problems }
 *  The common part is the web sign-up's save (lib/onboarding.js › saveOnboarding: Settings › General, the shop link,
 *  the edition, the owner's account and sign-in, the gc.onboarding record and Home's "Getting started" view); the app
 *  adds the edition from "How you sell", Stock setup, the shop type and its own answers to the same record. */
export function createShop(a) {
  const phone = normPhone(a.phone);
  if (!phone) return { ok: false, error: 'Verify your mobile number first.', step: '/onb-phone' };
  if (!String(a.name || '').trim()) return { ok: false, error: 'Enter your name.', step: '/onb-phone' };
  if (!String(a.shop || '').trim()) return { ok: false, error: 'Enter your business name.', step: '/onb-store' };
  const sell = LOCKED ? lockedSell() : sellOf(a.sell);
  if (!sell) return { ok: false, error: 'Choose how you sell.', step: '/onb-channels' };
  const link = checkHandle(a.handle);
  if (!link.ok) return { ok: false, error: link.reason, step: '/onb-link' };
  const name = String(a.name).trim(), shop = String(a.shop).trim();
  const kind = (KINDS.find((k) => k.key === a.kind) || {}).label || '';
  const hasShop = sell.key === 'shop' || sell.key === 'both';
  const where = [...(a.find || []), ...(hasShop ? ['Physical shop'] : [])];

  const out = saveOnboarding({ name, phone, biz: shop, cat: kind, where, pay: a.pay || [], slug: a.handle, retail: sell.key === 'shop' });
  const problems = (out && out.problems) || [];
  // "How you sell" names the edition exactly (the web reads it from the channels ticked)
  const ed = LOCKED ? currentEditionId() : sell.edition;
  if (!LOCKED && out && out.edition !== ed) previewEdition(ed);
  if (kind) writeSettings('general', { shop_kind: kind }, { by: name, force: true });
  saveStockSetup({ homeId: DEFAULT_HOME_ID, buying: a.buying || 'direct' }, ed);
  if (!signInAs(OWNER_ID)) problems.push('The owner account is switched off.');
  writeJson(DONE_KEY, { ...(onboardingOf() || {}), edition: ed, from: 'app', phone, shop, kind, sell: sell.key, handle: a.handle, find: a.find || [], buying: a.buying || 'direct', product: null });
  return { ok: true, error: '', problems };
}

/** The first product added during sign-up (Done shows it as finished). */
export function noteFirstProduct(p) {
  const rec = getOnboarding();
  if (rec) writeJson(DONE_KEY, { ...rec, product: { id: p.id, name: p.name } });
}
