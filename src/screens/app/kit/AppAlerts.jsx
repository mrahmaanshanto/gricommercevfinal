'use client';
// AppAlerts — the app's live alerts while it is open (drawn by <AppScreen> inside the device, so every /m-* page has them).
// What it watches: the same list as Notifications (MNotifications.jsx › buildNotifications: new online orders, unread
// chats, payment proofs to review, payouts that arrived or are late, approvals waiting, low stock — each kind only for
// people whose role and edition have it). It reads the list again when the books change (gc:orders, gc:inbox, gc:ledger,
// gc:notify, gc:settle, gc:stock, storage) and every 20 s (the live online orders follow the clock, lib/liveOrders.js).
// Something new shows as:
//   - a banner at the top of the screen (tap opens it: the order, the chat, Payouts …; several of one kind are one banner
//     that opens the list), gone after 6 s or with ×
//   - a system notification when the browser allows them (Settings › Notifications › Allow)
//   - a short chime when Settings › Notifications › Sound is on
// Each kind follows this phone's choices (Settings › Notifications, settings/settingsData.js › getNotify).
// No repeats: what was announced (or already there the first time the app opened for this person) is remembered per
// person in this browser (gc.app.alerts.seen), so a reload says nothing new. Orders the team typed in themselves
// (Manual order) are not announced. Pages shown inside another (the /app-screens gallery) stay quiet.
// Front end only: a real app gets these as push messages from the server, also while it is closed.

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { appContext, canUse } from './appNav';
import { getNotify } from '../settings/settingsData';
import { findOrder } from '@/lib/orders';
import { hasSession } from './AppSession';

const SEEN_KEY = 'gc.app.alerts.seen';
const KEEP = 500;
const SHOW_MS = 6000;
const EVERY_MS = 20000;
const EVENTS = ['gc:orders', 'gc:inbox', 'gc:ledger', 'gc:notify', 'gc:settle', 'gc:stock', 'gc:app-settings', 'gc:session', 'storage'];
const ALL_ON = { orders: true, payouts: true, stock: true, messages: true, approvals: true, sound: false };
// the rows that are alerts (the to-do, meetings and ticket rows stay in Notifications)
const KINDS = {
  order: { many: (n) => `${n} new orders`, list: '/m-orders', icon: 'bag' },
  chat: { many: (n) => `${n} new messages`, list: '/m-inbox', icon: 'chat' },
  proof: { many: (n) => `${n} payments to review`, list: '/m-orders', icon: 'wallet' },
  'payout-in': { many: (n) => `${n} payouts arrived`, list: '/m-payouts', icon: 'cash' },
  'payout-late': { many: (n) => `${n} payouts are late`, list: '/m-payouts', icon: 'alert' },
  'payouts-late': { many: (n) => `${n} late payout alerts`, list: '/m-payouts', icon: 'alert' },
  approval: { many: (n) => `${n} requests to approve`, list: '/m-finance', icon: 'check' },
  low: { many: (n) => `${n} items running low`, list: '/m-stock', icon: 'box' },
};
const typeOf = (key) => String(key).split(':')[0];
// a low-stock row's key carries the pieces left: one alert when an item runs low, not one per sale
const normKey = (key) => String(key).replace(/^(low:[^:]+):\d+$/, '$1');

const readSeen = () => { try { return JSON.parse(window.localStorage.getItem(SEEN_KEY)) || {}; } catch { return {}; } };
const writeSeen = (v) => { try { window.localStorage.setItem(SEEN_KEY, JSON.stringify(v)); } catch { /* storage full or blocked */ } };

/** A short two-note chime (when the browser allows sound before a tap, else nothing). */
function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (f, at) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.22);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.24);
    };
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
    play(880, 0); play(1320, 0.14);
    window.setTimeout(() => { try { ctx.close(); } catch { /* ignore */ } }, 700);
  } catch { /* no audio */ }
}

/** The new rows grouped into banners: one row = itself, several of one type = one banner that opens the list. */
function toBanners(rows, ctx) {
  const by = new Map();
  rows.forEach((n) => { const t = typeOf(n.key); by.set(t, [...(by.get(t) || []), n]); });
  return [...by.entries()].map(([t, list]) => {
    const k = KINDS[t] || { many: (n) => `${n} new alerts`, list: '/m-notifications', icon: 'bell' };
    if (list.length === 1) { const n = list[0]; return { id: n.key, icon: n.icon || k.icon, title: n.title, sub: n.sub || '', href: n.href }; }
    const href = canUse(k.list, ctx) ? k.list : list[0].href;
    return { id: t + ':' + list.map((n) => n.key).join('|'), icon: k.icon, title: k.many(list.length), sub: list.slice(0, 2).map((n) => n.title).join(' · '), href };
  });
}

function systemAlert(b, open) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const n = new Notification(b.title, { body: b.sub, tag: 'gc-' + b.id, icon: '/assets/8c3babaf605936b39809e7960e7c846f.png' });
    n.onclick = () => { try { window.focus(); } catch { /* ignore */ } open(b); n.close(); };
  } catch { /* phones need a service worker for system notifications: the banner still shows */ }
}

/** The banner and the watcher. `Icon` is AppKit's line icon (passed in, so this file doesn't import AppKit). */
export function AppAlerts({ Icon }) {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const busy = useRef(false);
  const cur = queue[0] || null;

  const open = (b) => { setQueue((q) => q.filter((x) => x.id !== b.id)); if (b.href) router.push(b.href); };
  const close = (b) => setQueue((q) => q.filter((x) => x.id !== b.id));

  useEffect(() => {
    if (document.documentElement.hasAttribute('data-framed')) return undefined;
    let alive = true;
    let t = 0;
    const check = async () => {
      if (busy.current) return;
      // nobody signed in (sign-in / sign-up screens): no alerts — they would show the demo owner's business
      if (window.location.pathname.startsWith('/onb-') || !hasSession()) return;
      busy.current = true;
      try {
        const mod = await import('../MNotifications');
        if (!alive) return;
        const ctx = appContext();
        const uid = (ctx.user && ctx.user.id) || 'anon';
        const rows = mod.buildNotifications(ctx, { prefs: ALL_ON }).filter((n) => n.kind && KINDS[typeOf(n.key)]);
        const seen = readSeen();
        const mine = seen[uid];
        const now = Date.now();
        const keys = rows.map((n) => normKey(n.key));
        if (!mine) {
          // the first time the app opens for this person: what is already there is not news
          seen[uid] = { keys: Object.fromEntries(keys.map((k) => [k, now])) };
          writeSeen(seen);
          return;
        }
        const prefs = getNotify();
        const q = new URLSearchParams(window.location.search);
        const here = window.location.pathname;
        const fresh = rows.filter((n) => {
          if (mine.keys[normKey(n.key)]) return false;
          if (!prefs[n.kind]) return false;
          const type = typeOf(n.key);
          if (type === 'order') { const o = findOrder(n.key.slice(6)); if (o && o.channel === 'Manual order') return false; }
          if (type === 'chat' && here === '/m-chat' && n.key.split(':')[1] === q.get('id')) return false;
          // the order open on screen already shows its own new payment
          if (type === 'proof' && here === '/m-order-detail' && n.key.split(':')[1].replace(/^#/, '') === String(q.get('id') || '').replace(/^#/, '')) return false;
          return true;
        });
        // remember everything listed now; a low-stock row that is gone (restocked) may alert again later
        keys.forEach((k) => { mine.keys[k] = mine.keys[k] || now; });
        Object.keys(mine.keys).forEach((k) => { if (k.startsWith('low:') && !keys.includes(k)) delete mine.keys[k]; });
        const kept = Object.entries(mine.keys).sort((a, b) => b[1] - a[1]).slice(0, KEEP);
        seen[uid] = { keys: Object.fromEntries(kept) };
        writeSeen(seen);
        if (!fresh.length) return;
        const banners = toBanners(fresh, ctx);
        setQueue((cur0) => [...cur0, ...banners.filter((b) => !cur0.some((x) => x.id === b.id))]);
        banners.forEach((b) => systemAlert(b, open));
        if (prefs.sound) chime();
      } catch { /* a book could not be read: try again on the next change */ } finally {
        busy.current = false;
      }
    };
    const soon = () => { window.clearTimeout(t); t = window.setTimeout(check, 900); };
    const first = window.setTimeout(check, 1200);
    const iv = window.setInterval(check, EVERY_MS);
    EVENTS.forEach((e) => window.addEventListener(e, soon));
    return () => { alive = false; window.clearTimeout(first); window.clearTimeout(t); window.clearInterval(iv); EVENTS.forEach((e) => window.removeEventListener(e, soon)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // each banner shows for a few seconds, then the next one
  useEffect(() => {
    if (!cur) return undefined;
    const id = window.setTimeout(() => close(cur), SHOW_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur && cur.id]);

  if (!cur) return null;
  return (
    <div className="app-alert" role="status" aria-live="polite">
      <button type="button" className="app-alert__body" onClick={() => open(cur)}>
        <span className="app-alert__ico">{Icon ? <Icon name={cur.icon} size={20} /> : null}</span>
        <span className="app-alert__txt">
          <b className="ell">{cur.title}</b>
          {cur.sub ? <span className="ell">{cur.sub}</span> : null}
        </span>
      </button>
      {queue.length > 1 ? <span className="app-alert__more num" aria-label={`${queue.length - 1} more`}>+{queue.length - 1}</span> : null}
      <button type="button" className="app-alert__x" aria-label="Dismiss" onClick={() => close(cur)}>{Icon ? <Icon name="x" size={18} /> : '×'}</button>
    </div>
  );
}

export const ALERT_CSS = `
.app-alert{position:absolute;left:12px;right:12px;top:54px;z-index:12;display:flex;align-items:center;gap:4px;padding:6px 6px 6px 8px;border-radius:var(--radius-xl);background:rgba(255,255,255,.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 18px 40px -14px rgba(15,23,42,.45),0 0 0 1px rgba(15,23,42,.06);animation:app-alert-in .28s cubic-bezier(.2,.8,.2,1)}
.app-alert__body{flex:1;min-width:0;display:flex;align-items:center;gap:10px;min-height:48px;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.app-alert__ico{flex:none;width:36px;height:36px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--brand)}
.app-alert__txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.app-alert__txt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--ink)}
.app-alert__txt span{display:block;font-size:var(--text-xs);color:var(--muted)}
.app-alert__more{flex:none;padding:0 6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--muted)}
.app-alert__x{flex:none;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:0;border-radius:var(--radius-full);background:none;color:var(--muted);cursor:pointer}
.app-alert__body:focus-visible,.app-alert__x:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
@keyframes app-alert-in{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.app-alert{animation:none}}
`;
