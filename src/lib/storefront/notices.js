// storefront/notices — Online Store › Store notices (/store-notices, Batch A step 2): any number of short messages above,
// under or inside the header, or as a floating bar on phones. Each has its text in English and Bangla (or the live offer
// line from Marketing), a button, a coupon code with Copy, a countdown to its end, colours, who sees it (pages,
// categories, products, devices), start and end times, and whether a visitor can close it. Two notices in one place take
// turns. Kept in the storefront store (`notices`), so they travel in a store kit.
//
//   getNotices() · saveNotices(list) · saveNotice(n) · deleteNotice(id) · moveNotice(id, dir) · newNotice(patch)
//   noticeProblem(n) → '' | what to fix · noticeState(n, now) → 'off' | 'scheduled' | 'live' | 'ended' · STATE
//   liveNotices({ kind, product, category, now }) → the notices a page shows, by place (customer pages)
//   noticeFromOffer(offer) → the fields to fill from a website offer (lib/storeOffers.js websiteOffers)
//   closedNotices() · closeNotice(id) — what this visitor has closed (this browser)
//   themeNotices(values) — the old one-line announcement (theme settings) as a notice
// Before a shop saves its first notice, the old announcement from the theme settings shows as one (so nothing that
// customers saw disappears). Front end only.

import { read, update, sfId, previewValue, isPreview } from './store';
import { DEFAULTS } from './schema.js';
import { showMatches, inWindow } from './show.js';
import { urlProblem } from './kit.js';

export const CLOSED_KEY = 'gc.store.notices.closed';
export const STATE = {
  live: { label: 'Showing', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  ended: { label: 'Ended', tone: 'neutral' },
  off: { label: 'Off', tone: 'neutral' },
};

const TONE_FROM_THEME = { accent: 'accent', primary: 'primary', dark: 'dark' };
/** The theme's one-line announcement as a notice ([] when it is off). */
export function themeNotices(values) {
  const v = { ...DEFAULTS, ...(values || {}) };
  if (!v.announce) return [];
  return [{ id: 'theme-announce', on: true, text: v.announceText || '', textBn: '', from: v.announceText ? '' : 'offers', button: '', link: '', code: '', countdown: false, tone: TONE_FROM_THEME[v.announceTone] || 'accent', place: 'top', show: { pages: 'all', devices: 'all' }, start: '', end: '', dismiss: false }];
}

/** The shop's notices (the editor's unsaved copy in a preview frame). */
export function getNotices() {
  const ov = previewValue('notices');
  if (ov !== undefined) return ov;
  const d = read();
  if (Array.isArray(d.notices)) return d.notices;
  const theme = d.theme ? (isPreview() ? d.theme.draft : d.theme.live || d.theme.draft) : null;
  return themeNotices(theme);
}
export function saveNotices(list) { update((d) => { d.notices = list; }); }
export function saveNotice(n) {
  const list = getNotices().slice();
  const i = list.findIndex((x) => x.id === n.id);
  if (i >= 0) list[i] = n; else list.push(n);
  saveNotices(list);
  return n;
}
export function deleteNotice(id) { saveNotices(getNotices().filter((x) => x.id !== id)); }
export function moveNotice(id, dir) {
  const list = getNotices().slice();
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  saveNotices(list);
}
export const newNotice = (patch = {}) => ({ id: sfId('ntc'), on: true, text: '', textBn: '', from: '', button: '', link: '', code: '', countdown: false, tone: 'accent', place: 'top', show: { pages: 'all', devices: 'all' }, start: '', end: '', dismiss: false, ...patch });

/** '' when the notice can be saved, else what to fix (plain words). */
export function noticeProblem(n) {
  if (!n.from && !String(n.text || '').trim()) return 'Write the notice.';
  if (String(n.text || '').length > 140 || String(n.textBn || '').length > 140) return 'Keep the notice under 140 characters.';
  if (n.link && urlProblem(n.link)) return 'The link must start with /, https://, mailto: or tel:.';
  if (n.button && !n.link) return 'The button needs a link.';
  if (n.countdown && !n.end) return 'A countdown needs an end time.';
  if (n.start && n.end && Date.parse(n.end) <= Date.parse(n.start)) return 'The end is before the start.';
  const s = n.show || {};
  if (Array.isArray(s.pages) && !s.pages.length) return 'Choose at least one kind of page, or Every page.';
  return '';
}

export function noticeState(n, now = Date.now()) {
  if (!n.on) return 'off';
  if (n.end && now >= Date.parse(n.end)) return 'ended';
  if (n.start && now < Date.parse(n.start)) return 'scheduled';
  return 'live';
}

/** What this visitor closed: { id: true }. */
export function closedNotices() { try { return JSON.parse(window.localStorage.getItem(CLOSED_KEY) || '{}') || {}; } catch { return {}; } }
export function closeNotice(id) { try { const c = closedNotices(); c[id] = true; window.localStorage.setItem(CLOSED_KEY, JSON.stringify(c)); } catch { /* ignore */ } }

/** The notices a customer page shows, grouped by place: { top: [], 'below-header': [], header: [], 'phone-bar': [] }. */
export function liveNotices({ kind = '', product = '', category = '', now = Date.now() } = {}) {
  const closed = closedNotices();
  const out = { top: [], 'below-header': [], header: [], 'phone-bar': [] };
  getNotices().forEach((n) => {
    if (!n || !n.on || !inWindow(n, now)) return;
    if (n.dismiss && closed[n.id] && !isPreview()) return;
    if (!showMatches(n.show, { kind, product, category })) return;
    (out[n.place] || out.top).push(n);
  });
  return out;
}

/** The fields a notice takes from a website offer (Marketing): its name, code, end and the offer's page. */
export function noticeFromOffer(o) {
  if (!o) return {};
  const text = o.code ? `${o.title}: ${o.big}` : `${o.title}: ${o.big.toLowerCase()}`;
  return { text: text.slice(0, 140), code: o.code || '', end: o.end ? new Date(o.end).toISOString() : '', countdown: !!o.end, button: 'See the offer', link: '/offer-detail?id=' + encodeURIComponent(o.id), tone: o.kind === 'flash' ? 'sale' : 'accent' };
}
