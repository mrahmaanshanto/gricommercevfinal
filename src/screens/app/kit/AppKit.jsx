'use client';
// AppKit — the mobile app's building blocks. Every part renders the design boards' own markup and class names
// (src/screens/app/M*.jsx, design/templates/app/AppSystem.dc.html), so a new screen looks like the boards.
// Styles: ./appCss.js (APP_CSS = the boards' shared CSS + the kit's additions), injected once by <AppScreen>.
// The navigation map (tab bar, More hub, edition and role rules) is ./appNav.js.
//
// A screen, top to bottom (children of <AppScreen>, in this order):
//   <AppScreen name="MOrders">                 data-screen + .ph device, fake status bar .sb and home indicator .hi
//     <LargeHeader title="Orders" actions={…}/> or <AppBar title="Order #1" back="/m-orders" actions={…}/>
//     <Content top={47|103} bottom={0|98}>…</Content>   the scrolling body (.content). top 47 under a LargeHeader
//                                                (which goes INSIDE Content), 103 under an AppBar; bottom 98 above
//                                                an ActionBar, else 0 (the tab bar floats over the body)
//     <Fab …/>  <ActionBar>…</ActionBar>          bottom chrome (phone-app.css pins them on a phone); the tab bar is
//                                               drawn by <AppScreen> itself, the action bar sits just above it
//     <Sheet open …/>                           bottom sheets last (they cover the screen)
//   </AppScreen>
// Body content uses 20px side margins like the boards: Card / Section / Chips / Segmented / SearchField already do.
//
// ---- frame ----
// AppScreen  { name, css?, title?, statusTone? ('dark' | 'light'), tabs? (default true: draws <TabBar/>), children }  name = data-screen (scope a screen's
//            own css as [data-screen="<name>"] …); css = extra CSS string; title = aria-label of the device; it also
//            draws the live alert banner (./AppAlerts.jsx: new orders, chats, payments while the app is open)
// Content    { top=47, bottom=0, pad? (bool: 20px sides), gap? (px, makes it a flex column), style?, children }
// LargeHeader { title, eyebrow?, actions? (IconButtons), children? (under the title row) }  the boards' big-title
//            row (MOrders, MInbox, MMore); put it first inside <Content top={47}>
// AppBar     { title, back? (href, default '/m-more'; false = none), onBack?, actions? }  the centred-title bar
//            (MOrderDetail, MStock); use <Content top={103}>
// SearchBar  { value, onChange, placeholder, back?, autoFocus?, onSubmit? }  an AppBar whose title is a search field
// TabBar     { active? }  the floating pill: Home · Orders/Sales · Inbox · Stock · More (appNav.tabsFor) with live
//            counts; active defaults to the page's tab (appNav.tabOf(pathname))
// Fab        { href? | onClick?, label, icon='plus' }
// ActionBar  { children }  sticky bottom buttons (use <Button> children; the first flex:1, give the main one style={{flex:2}})
// Sheet      { open, onClose, title?, children, footer? (buttons), labelledBy? }  bottom sheet with scrim; Esc closes
//
// ---- content ----
// Card       { href?, onClick?, pad? (bool | css padding), style?, className?, children }  .card, margin 0 20px
// Section    { title, action? ({ label, href?, onClick? }) | node, style?, children? }  .sec heading row (children
//            follow the heading, e.g. a Card)
// ListRow    { href?, onClick?, icon? (ICONS name) | avatar? (node, e.g. <Avatar/>), title, sub?, end? (node),
//            pill? ({ tone, text, n }), chevron? (default true when href/onClick), compact?, ellipsis?=true }  .row
// Chips      { items: [{ key, label, n? }], value, onChange(key), style? }  .chips row of .chip buttons
// Segmented  { items: [{ key, label }], value, onChange(key), style? }  .seg control
// SearchField { value, onChange(text), placeholder, onScan? (adds the brand scan button), autoFocus?, style? }  .srch
// Pill       { tone: 'ok' | 'warn' | 'err' | 'nav' | 'grey' (or design tones success/warning/error/info/neutral),
//              shape? (true: the ok/warn/err shape mark), children }  .pill p-*
// OrderPill  { statusKey }  an order status in its tone (lib/orderStatus.js)
// Stat       { label, value, tone? ('err' | 'warn' | 'nav' | 'ok'), href?, onClick? }  a coloured figure tile (MStock)
// StatRow    { children, cols=3 }  grid of Stat tiles
// Tile       { href? | onClick?, icon, label }  icon tile (Home quick actions, More hub)
// TileGrid   { children, cols=4, card? (bool: inside a card like More) }
// Avatar     { text, size=44, tone? ({ bg, fg }), round? }  .av initials block
// IconButton { icon, label, href? | onClick?, soft?, dot?, badge? (number) }  .ib (36px round)
// Button     { kind: 'primary' | 'soft' | 'line' | 'danger', href? | onClick?, icon?, type?, disabled?, style?, children }
// Field      { label, help?, error?, children }  .field label + control
// TextInput  { value, onChange(text), placeholder?, type?, prefix?, multiline?, inputMode?, autoFocus?, focused? }  .inp
// Switch     { on, onChange(next), label }  .sw
// Stepper    { value, onChange(next), min=0, max?, label? }  .step − n +
// Note       { tone: 'info' | 'ok' | 'warn' | 'err', icon?, children }  .note
// EmptyState { icon?, title, action? ({ label, href? | onClick? }) }  one line + one action
// Skeleton   { rows=3, card=true }  loading rows (show until useAppData().ready)
// Icon       { name, size=22, stroke=1.8 }  the boards' line icons; names in ICONS
// LangSwitch { }  EN / বাংলা pill (calls setLocale; the whole page follows through translateDom)
//
// ---- data and helpers ----
// useAppData(events?, { every? })  → { ready, tick, ctx }  redraws on the merchant libs' events (gc:app, gc:orders,
//            gc:ledger, gc:inbox, gc:stock, gc:actions, gc:session, gc:edition, gc:locale, gc:hr, gc:tasks, storage,
//            focus, visibilitychange) plus `events`, and every `every` ms. ready is false on the server and the first
//            client render: read browser data only when ready (Netlify prerenders in UTC). ctx = appNav.appContext().
// refresh()  tell every useAppData to redraw (after an action that writes without an event)
// useQuery() → URLSearchParams after mount (null before)
// useLocale() → 'en' | 'bn' (follows setLocale)
// money(n) "৳1,42,330" · dateText(t, { time? }) "7 Sep 2026[, 8:48 PM]" · timeText(t) "8:48 PM" · ago(t) "2 min" ·
// "3 h" · "Yesterday" · "7 Sep" · initials(name) · toneOf(designTone) → board tone
// toast(message, opts) · confirmDialog(opts)  from src/runtime/ui (success feedback / destructive confirms)
// setLocale(locale) · getLocale()             from src/runtime/ui

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { APP_CSS } from './appCss';
import { tabsFor, tabCounts, tabOf, appContext } from './appNav';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { orderStatus } from '@/lib/orderStatus';
import { toast, confirmDialog, getLocale, setLocale } from '@/runtime/ui';
import { AppAlerts, ALERT_CSS } from './AppAlerts';

export { toast, confirmDialog, getLocale, setLocale, APP_CSS };

// ---- icons (lucide line icons, as drawn on the boards) ----------------------------------------------------
export const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  bag: <><path d="M6 2h12l1 4H5z" /><path d="M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" /><path d="M9 11h6M9 15h4" /></>,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>,
  layers: <><path d="m12 2 10 5-10 5L2 7Z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  scan: <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  filter: <path d="M3 6h18M7 12h10M10 18h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
  back: <path d="m15 18-6-6 6-6" />,
  chev: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  dots: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />,
  whatsapp: <><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4Z" /><path d="M9 10c0 3 2 5 5 5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2Z" /></>,
  ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2M13 17v2M13 11v2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /></>,
  zap: <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />,
  tag: <><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8H8M16 12H8M12 16H8" /></>,
  truck: <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>,
  store: <><path d="M3 9 5 3h14l2 6" /><path d="M4 9v11h16V9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M10 20v-5h4v5" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M8 16H3v5" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></>,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" /></>,
  alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  clipboard: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01" /></>,
  wallet: <><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></>,
  sparkles: <><path d="M9.9 15.5A2 2 0 0 0 8.5 14l-6.1-1.6a.5.5 0 0 1 0-1L8.5 9.9A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0L14 8.5a2 2 0 0 0 1.5 1.4l6.1 1.6a.5.5 0 0 1 0 1L15.5 14a2 2 0 0 0-1.4 1.4l-1.6 6.2a.5.5 0 0 1-1 0z" /><path d="M20 3v4M22 5h-4M4 17v2M5 18H3" /></>,
  megaphone: <><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  tasks: <><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
  arrows: <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />,
  cart: <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>,
  mobile: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
};

/** A line icon from the boards. */
export function Icon({ name, size = 22, stroke = 1.8, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      {ICONS[name] || ICONS.grid}
    </svg>
  );
}
const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>{ICONS.chev}</svg>
);

// ---- helpers ------------------------------------------------------------------------------------------------
export const money = (n) => (Number(n) < 0 ? '−' : '') + formatBDT(Math.abs(Math.round(Number(n) || 0)));
export const dateText = (t, { time = false } = {}) => (t ? formatDate(t) + (time ? ', ' + formatTime(t) : '') : '');
export const timeText = (t) => (t ? formatTime(t) : '');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Just now", "2 min", "3 h", "Yesterday", "7 Sep" (call after mount: it reads the clock). */
export function ago(t, now = Date.now()) {
  if (!t) return '';
  const m = Math.round((now - t) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min`;
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  if (t >= d0.getTime()) return `${Math.round(m / 60)} h`;
  if (t >= d0.getTime() - 86400000) return 'Yesterday';
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export const initials = (name) => String(name || '').trim().split(/\s+/).map((x) => x[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
const TONE = { success: 'ok', ok: 'ok', warning: 'warn', warn: 'warn', error: 'err', err: 'err', danger: 'err', info: 'nav', nav: 'nav', primary: 'nav', neutral: 'grey', grey: 'grey', slate: 'grey' };
/** A design tone (success / warning / error / info / neutral) as a board tone (ok / warn / err / nav / grey). */
export const toneOf = (t) => TONE[t] || 'grey';

// ---- data -----------------------------------------------------------------------------------------------------
const APP_EVENT = 'gc:app';
const BASE_EVENTS = [APP_EVENT, 'gc:orders', 'gc:ledger', 'gc:inbox', 'gc:stock', 'gc:actions', 'gc:session', 'gc:edition', 'gc:locale', 'gc:hr', 'gc:tasks', 'gc:settle', 'storage', 'focus'];
/** Tell every screen using useAppData to read its data again. */
export function refresh() { try { window.dispatchEvent(new CustomEvent(APP_EVENT)); } catch { /* ignore */ } }

/** Redraw when the shared books change. Read browser data only once `ready` is true. */
export function useAppData(events = [], { every } = {}) {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const key = (events || []).join('|');
  useEffect(() => {
    setReady(true);
    let t = 0;
    const again = () => { window.clearTimeout(t); t = window.setTimeout(() => setTick((n) => n + 1), 30); };
    const vis = () => { if (document.visibilityState === 'visible') again(); };
    const list = [...new Set([...BASE_EVENTS, ...(key ? key.split('|') : [])])];
    list.forEach((e) => window.addEventListener(e, again));
    document.addEventListener('visibilitychange', vis);
    const iv = every ? window.setInterval(again, every) : 0;
    return () => { window.clearTimeout(t); list.forEach((e) => window.removeEventListener(e, again)); document.removeEventListener('visibilitychange', vis); if (iv) window.clearInterval(iv); };
  }, [key, every]);
  const ctx = useMemo(() => (ready ? appContext() : null), [ready, tick]);
  return { ready, tick, ctx };
}

/** The page's query string, after mount (null before). */
export function useQuery() {
  const [q, setQ] = useState(null);
  useEffect(() => { setQ(new URLSearchParams(window.location.search)); }, []);
  return q;
}

/** The interface language ('en' | 'bn'), following setLocale. */
export function useLocale() {
  const [loc, setLoc] = useState('en');
  useEffect(() => {
    setLoc(getLocale());
    const on = () => setLoc(getLocale());
    window.addEventListener('gc:locale', on);
    return () => window.removeEventListener('gc:locale', on);
  }, []);
  return loc;
}

// ---- frame ------------------------------------------------------------------------------------------------------
function StatusBar({ tone = 'dark' }) {
  const c = tone === 'light' ? '#fff' : '#0f172a';
  const [clock, setClock] = useState('9:41');
  useEffect(() => {
    const set = () => { const d = new Date(); setClock(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`); };
    set();
    const iv = window.setInterval(set, 30000);
    return () => window.clearInterval(iv);
  }, []);
  return (
    <div className="sb" style={{ color: c }} aria-hidden="true">
      <span className="num">{clock}</span>
      <span className="r">
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <span style={{ fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)' }}>4G</span>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke={c} opacity=".4" /><rect x="2" y="2" width="17" height="9" rx="2" fill={c} /><path d="M25 4.5v4" stroke={c} strokeWidth="1.5" opacity=".5" /></svg>
      </span>
    </div>
  );
}

/** The device: data-screen wrapper, .ph, fake status bar and home indicator (hidden on a real phone). */
export function AppScreen({ name, css = '', title, statusTone = 'dark', tabs = true, children }) {
  // every screen carries the bottom tab bar (it finds its tab from the address); full-screen tools — a call in
  // progress, the camera scanner, a chat with its composer — pass tabs={false}
  return (
    <div className="dc-screen" data-screen={name}>
      <style dangerouslySetInnerHTML={{ __html: APP_CSS + ALERT_CSS + css }} />
      <div className="ph" aria-label={title}>
        <StatusBar tone={statusTone} />
        {children}
        {tabs ? <TabBar /> : null}
        {/* new orders, chats, payments … while the app is open (AppAlerts.jsx) */}
        <AppAlerts Icon={Icon} />
        <div className="hi" aria-hidden="true" />
      </div>
    </div>
  );
}

/** The scrolling body. */
export function Content({ top = 47, bottom = 0, pad = false, gap, style, children }) {
  const flex = gap != null ? { display: 'flex', flexDirection: 'column', gap: gap + 'px' } : null;
  const sides = pad ? { paddingLeft: '20px', paddingRight: '20px' } : null;
  return <div className="content" style={{ top: top + 'px', bottom: bottom + 'px', ...flex, ...sides, ...style }}>{children}</div>;
}

/** The boards' big-title row (inside Content). */
export function LargeHeader({ title, eyebrow, actions, children }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px 0 20px', minHeight: '42px' }}>
        <div style={{ flex: '1', minWidth: '0' }}>
          {eyebrow ? <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{eyebrow}</div> : null}
          <h1 style={{ margin: '0', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h1>
        </div>
        {actions}
      </div>
      {children}
    </>
  );
}

function BackButton({ back, onBack }) {
  if (back === false && !onBack) return <span style={{ width: '36px', flex: 'none' }} />;
  const icon = <Icon name="back" size={24} stroke={2} />;
  if (onBack) return <button type="button" className="ib" aria-label="Back" onClick={onBack}>{icon}</button>;
  return <Link href={back || '/m-more'} className="ib" aria-label="Back">{icon}</Link>;
}

/** The centred-title bar with back and actions (content top 103). */
export function AppBar({ title, back = '/m-more', onBack, actions }) {
  return (
    <header className="appbar">
      <BackButton back={back} onBack={onBack} />
      <h1 className="ell">{title}</h1>
      {actions || <span style={{ width: '36px', flex: 'none' }} />}
    </header>
  );
}

/** An AppBar whose title is a search field. */
export function SearchBar({ value, onChange, placeholder = 'Search', back = '/m-more', onBack, autoFocus = true, onSubmit }) {
  return (
    <header className="appbar" style={{ gap: '8px', paddingRight: '16px' }}>
      <BackButton back={back} onBack={onBack} />
      <form role="search" className="srch" style={{ flex: '1', margin: '0', height: '40px', padding: '0 12px' }} onSubmit={(e) => { e.preventDefault(); if (onSubmit) onSubmit(value); }}>
        <Icon name="search" size={18} />
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} autoFocus={autoFocus} />
        {value ? <button type="button" className="ib" style={{ width: '28px', height: '28px' }} aria-label="Clear" onClick={() => onChange('')}><Icon name="x" size={16} /></button> : null}
      </form>
    </header>
  );
}

/** The floating tab bar with live counts. */
export function TabBar({ active }) {
  const { ready, tick, ctx } = useAppData();
  const [here, setHere] = useState('');
  useEffect(() => { setHere(window.location.pathname); }, []);
  // before mount: the full edition's bar without counts (matches the server render)
  const tabs = useMemo(() => (ready && ctx ? tabsFor(ctx) : tabsFor({ ed: 'full', user: null, ids: new Set(['orders-all', 'inbox', 'stock-list']) })), [ready, ctx]);
  const counts = useMemo(() => (ready ? tabCounts() : {}), [ready, tick]);
  const on = active || (here ? tabOf(here) : '');
  return (
    <>
      <div className="tabfade" aria-hidden="true" />
      <nav className="tabs" aria-label="Main">
        {tabs.map((t) => {
          const n = t.count ? counts[t.count] || 0 : 0;
          const cur = t.key === on;
          return (
            <Link key={t.key} href={t.href} className={cur ? 'on' : ''} aria-current={cur ? 'page' : undefined}>
              <span className="tw">
                <Icon name={t.icon} size={21} stroke={cur ? 2.1 : 1.8} />
                {n > 0 ? <span className="cnt" aria-label={`${n} new`}>{n > 99 ? '99+' : n}</span> : null}
              </span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/** Floating action button. */
export function Fab({ href, onClick, label, icon = 'plus' }) {
  const body = <Icon name={icon} size={28} stroke={2.2} />;
  if (href) return <Link href={href} className="fab" aria-label={label}>{body}</Link>;
  return <button type="button" className="fab" aria-label={label} onClick={onClick}>{body}</button>;
}

/** Sticky bottom buttons. */
export function ActionBar({ children }) {
  return <div className="actbar">{children}</div>;
}

/** Bottom sheet with a scrim (place it last inside AppScreen). */
export function Sheet({ open, onClose, title, children, footer, labelledBy }) {
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, onClose]);
  if (!open) return null;
  const id = labelledBy || (title ? 'sheet-title' : undefined);
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={id}>
        <div className="grab" aria-hidden="true" />
        {title ? (
          <div className="sh-head">
            <h2 id={id}>{title}</h2>
            {onClose ? <button type="button" className="ib" aria-label="Close" onClick={onClose}><Icon name="x" size={20} /></button> : null}
          </div>
        ) : null}
        <div className="sh-body">{children}</div>
        {footer ? <div className="sh-foot">{footer}</div> : null}
      </div>
    </>
  );
}

// ---- content -------------------------------------------------------------------------------------------------
function Press({ href, onClick, className, style, children, label }) {
  if (href) return <Link href={href} className={className} style={style} aria-label={label}>{children}</Link>;
  if (onClick) return <button type="button" className={className} style={style} onClick={onClick} aria-label={label}>{children}</button>;
  return <div className={className} style={style}>{children}</div>;
}

/** .card with the boards' 20px side margins. */
export function Card({ href, onClick, pad, style, className = '', children }) {
  const padding = pad === true ? '16px' : pad || undefined;
  const st = { display: href || onClick ? 'block' : undefined, margin: '0 20px', padding, ...(onClick ? { width: 'calc(100% - 40px)', border: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' } : null), ...style };
  return <Press href={href} onClick={onClick} className={('card ' + className).trim()} style={st}>{children}</Press>;
}

/** Section heading row (.sec) with an optional link. */
export function Section({ title, action, style, children }) {
  let act = null;
  if (action && action.label) {
    act = action.href ? <Link href={action.href} className="tap">{action.label}</Link>
      : <button type="button" className="tap" onClick={action.onClick} style={{ border: 0, background: 'none', padding: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)', cursor: 'pointer' }}>{action.label}</button>;
  } else if (action) act = action;
  return (
    <>
      <div className="sec" style={style}>
        <h2>{title}</h2>
        {act}
      </div>
      {children}
    </>
  );
}

/** A list row (.row): icon or avatar, title and sub line, an end (amount, pill) and a chevron. */
export function ListRow({ href, onClick, icon, avatar, title, sub, end, pill, chevron, compact, ellipsis = true }) {
  const showChev = chevron != null ? chevron : !!(href || onClick);
  const st = compact ? { minHeight: '56px', padding: '9px 16px' } : undefined;
  const ell = ellipsis ? 't ell' : 't';
  return (
    <Press href={href} onClick={onClick} className="row" style={st}>
      {avatar || (icon ? <span className="ico"><Icon name={icon} /></span> : null)}
      <span className="m">
        <span className={ell} style={{ display: 'block' }}>{title}</span>
        {sub ? <span className={ellipsis ? 's ell' : 's'} style={{ display: 'block' }}>{sub}</span> : null}
      </span>
      {end}
      {pill ? <Pill tone={pill.tone}>{pill.n != null ? pill.n : pill.text}</Pill> : null}
      {showChev ? <Chevron /> : null}
    </Press>
  );
}

/** Filter chips (.chips). */
export function Chips({ items, value, onChange, style }) {
  return (
    <div className="chips" role="tablist" style={style}>
      {items.map((it) => (
        <button key={it.key} type="button" role="tab" aria-selected={it.key === value} className={'chip' + (it.key === value ? ' on' : '')} onClick={() => onChange(it.key)}>
          {it.label}{it.n != null ? <> <span className="n">{it.n}</span></> : null}
        </button>
      ))}
    </div>
  );
}

/** Segmented control (.seg). */
export function Segmented({ items, value, onChange, style }) {
  return (
    <div className="seg" role="tablist" style={style}>
      {items.map((it) => (
        <button key={it.key} type="button" role="tab" aria-selected={it.key === value} className={it.key === value ? 'on' : ''} onClick={() => onChange(it.key)}>{it.label}</button>
      ))}
    </div>
  );
}

/** The boards' search box (.srch). */
export function SearchField({ value, onChange, placeholder = 'Search', onScan, autoFocus, style }) {
  return (
    <label className="srch" style={style}>
      <Icon name="search" size={20} />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} autoFocus={autoFocus} />
      {onScan ? <button type="button" className="sc" aria-label="Scan a barcode" onClick={onScan}><Icon name="scan" size={20} /></button> : null}
    </label>
  );
}

/** Status pill in the boards' colours. */
export function Pill({ tone = 'grey', shape, children, style }) {
  const t = toneOf(tone);
  const mark = shape && ['ok', 'warn', 'err'].includes(t) ? <span className={'sh ' + t} aria-hidden="true" /> : null;
  return <span className={'pill p-' + t} style={style}>{mark}{children}</span>;
}

/** An order status as a pill (lib/orderStatus.js labels and tones). */
export function OrderPill({ statusKey }) {
  const s = orderStatus(statusKey);
  return <Pill tone={s ? s.tone : 'neutral'}>{s ? s.label : statusKey}</Pill>;
}

const STAT_TONE = {
  err: ['var(--errbg)', 'var(--err)', '#8a3510'],
  warn: ['var(--warnbg)', 'var(--warn)', '#7a3e05'],
  nav: ['var(--soft)', 'var(--brand)', '#1e3a6e'],
  ok: ['var(--okbg)', 'var(--ok)', '#0b5c40'],
  grey: ['#eef1f5', 'var(--ink)', 'var(--body)'],
};
/** A coloured figure tile (MStock's Out of stock / Low stock / Expiring). */
export function Stat({ label, value, tone = 'nav', href, onClick }) {
  const [bg, fg, sub] = STAT_TONE[toneOf(tone)] || STAT_TONE.nav;
  const st = { display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-xl)', background: bg, border: 0, textAlign: 'left', font: 'inherit', cursor: href || onClick ? 'pointer' : undefined };
  return (
    <Press href={href} onClick={onClick} style={st}>
      <div className="num" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: fg }}>{value}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: sub }}>{label}</div>
    </Press>
  );
}
export function StatRow({ cols = 3, children, style }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '8px', ...style }}>{children}</div>;
}

/** Icon tile (.tile). */
export function Tile({ href, onClick, icon, label }) {
  return <Press href={href} onClick={onClick} className="tile"><span className="ico"><Icon name={icon} size={24} /></span>{label}</Press>;
}
/** A grid of tiles: Home's quick actions (cols 4) or More's hub (card, cols 3). */
export function TileGrid({ cols = 4, card = false, style, children }) {
  const st = card
    ? { margin: '14px 20px 0', padding: '18px 12px', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '18px 8px', ...style }
    : { display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '8px', padding: '22px 20px 0', ...style };
  return <div className={card ? 'card' : undefined} style={st}>{children}</div>;
}

/** Initials block (.av). */
export function Avatar({ text, size = 44, tone, round }) {
  const t = tone || { bg: 'linear-gradient(145deg,#2eaee4,#003087)', fg: '#fff' };
  return <span className="av" style={{ width: size + 'px', height: size + 'px', background: t.bg, color: t.fg, borderRadius: round ? 'var(--radius-full)' : undefined, fontSize: size < 44 ? 'var(--text-sm)' : undefined }}>{text}</span>;
}

/** Round icon button (.ib). */
export function IconButton({ icon, label, href, onClick, soft, dot, badge }) {
  const cls = 'ib' + (soft ? ' soft' : '');
  const inner = (
    <>
      <Icon name={icon} />
      {dot ? <span className="dot" /> : null}
      {badge ? <span className="cnt" style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '18px', height: '18px', padding: '0 5px', fontSize: 'var(--text-2xs)', border: '2px solid #fff' }}>{badge > 99 ? '99+' : badge}</span> : null}
    </>
  );
  if (href) return <Link href={href} className={cls} aria-label={label}>{inner}</Link>;
  return <button type="button" className={cls} aria-label={label} onClick={onClick}>{inner}</button>;
}

const BTN = { primary: 'btnp', soft: 'btns', line: 'btnl', danger: 'btnd' };
/** Button in the boards' styles. */
export function Button({ kind = 'primary', href, onClick, icon, type = 'button', disabled, style, children }) {
  const cls = 'btn ' + (BTN[kind] || BTN.primary);
  const inner = <>{icon ? <Icon name={icon} size={20} stroke={2} /> : null}{children}</>;
  if (href && !disabled) return <Link href={href} className={cls} style={style}>{inner}</Link>;
  return <button type={type} className={cls} style={style} onClick={onClick} disabled={disabled}>{inner}</button>;
}

/** Label + control (.field). */
export function Field({ label, help, error, children }) {
  return (
    <label className="field">
      {label ? <span className="lab">{label}</span> : null}
      {children}
      {error ? <span className="err" role="alert">{error}</span> : help ? <span className="help">{help}</span> : null}
    </label>
  );
}

/** Text input in the boards' .inp box. */
export function TextInput({ value, onChange, placeholder, type = 'text', prefix, multiline, inputMode, autoFocus, focused, name }) {
  const cls = 'inp' + (multiline ? ' ta' : '') + (focused ? ' f' : '');
  return (
    <span className={cls}>
      {prefix ? <span className="pre">{prefix}</span> : null}
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} name={name} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} autoFocus={autoFocus} name={name} />}
    </span>
  );
}

/** Toggle (.sw). */
export function Switch({ on, onChange, label }) {
  return <button type="button" className={'sw' + (on ? ' on' : '')} role="switch" aria-checked={!!on} aria-label={label} onClick={() => onChange(!on)} />;
}

/** − n + quantity stepper (.step). */
export function Stepper({ value, onChange, min = 0, max, label = 'Quantity' }) {
  const n = Number(value) || 0;
  return (
    <span className="step" role="group" aria-label={label}>
      <button type="button" aria-label="Less" disabled={n <= min} onClick={() => onChange(Math.max(min, n - 1))}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg></button>
      <b className="num">{n}</b>
      <button type="button" aria-label="More" disabled={max != null && n >= max} onClick={() => onChange(max != null ? Math.min(max, n + 1) : n + 1)}><Icon name="plus" size={18} stroke={2.2} /></button>
    </span>
  );
}

const NOTE_TONE = { info: ['var(--soft)', 'var(--ink)'], ok: ['var(--okbg)', '#0b5c40'], warn: ['var(--warnbg)', '#7a3e05'], err: ['var(--errbg)', '#8a3510'] };
/** A tinted note (.note). */
export function Note({ tone = 'info', icon, children, style }) {
  const [bg, fg] = NOTE_TONE[tone] || NOTE_TONE.info;
  return <div className="note" style={{ background: bg, color: fg, padding: '12px 14px', ...style }}>{icon ? <Icon name={icon} size={20} /> : null}<div style={{ minWidth: 0 }}>{children}</div></div>;
}

/** One line plus one action. */
export function EmptyState({ icon = 'check', title, action }) {
  return (
    <div className="empty">
      <span className="ico"><Icon name={icon} size={24} /></span>
      <span>{title}</span>
      {action ? <Button kind="soft" href={action.href} onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}

/** Loading rows. */
export function Skeleton({ rows = 3, card = true }) {
  const list = Array.from({ length: rows }, (_, i) => (
    <div key={i} className="row" aria-hidden="true">
      <span className="skel" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-xl)', flex: 'none' }} />
      <span className="m"><span className="skel" style={{ width: '60%', height: '12px' }} /><span className="skel" style={{ width: '40%', height: '10px', marginTop: '8px' }} /></span>
    </div>
  ));
  return card ? <div className="card" style={{ margin: '0 20px' }} role="status" aria-label="Loading">{list}</div> : <div role="status" aria-label="Loading">{list}</div>;
}


/** EN / বাংলা switch (the onboarding board's pill, on a light background). */
export function LangSwitch({ style }) {
  const loc = useLocale();
  const one = (code, text) => (
    <button type="button" lang={code === 'bn' ? 'bn' : undefined} className={code === 'bn' ? 'bn' : undefined} aria-pressed={loc === code}
      onClick={() => setLocale(code)}
      style={{ height: '28px', padding: '0 10px', border: 0, borderRadius: 'var(--radius-full)', background: loc === code ? 'var(--card)' : 'transparent', color: loc === code ? 'var(--brand)' : 'var(--body)', boxShadow: loc === code ? '0 1px 3px rgba(15,23,42,.1)' : 'none', fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>{text}</button>
  );
  return (
    <span role="group" aria-label="Language" data-no-translate="" style={{ display: 'inline-flex', flex: 'none', padding: '3px', borderRadius: 'var(--radius-full)', background: '#e9eef5', ...style }}>
      {one('en', 'EN')}{one('bn', 'বাংলা')}
    </span>
  );
}
