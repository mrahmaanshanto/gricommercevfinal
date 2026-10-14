'use client';
// Email (/email-inbox, Inbox › Email) — the shop's email in one list: mail to info@, sales@, support@ and orders@
// (lib/emailInbox.js), one row per conversation (thread) with everyone in it and the message count. Views Inbox (unread
// count) · Assigned to me · Starred · Sent · Archived · Spam, an address filter and search. On a wide screen the thread
// opens beside the list; on smaller ones in a side panel. The thread shows every message in order: older ones fold to
// one line ("n earlier messages"), each open message shows From, To, Cc (Bcc on the shop's own), its quoted or forwarded
// mail behind "…", and Reply · Reply all · Forward for that message. The writing box at the foot does Reply, Reply all,
// Forward (To / Cc / Bcc, the forwarded mail quoted) or a Note for the team. Assign, star, archive, spam, delete (undo);
// Compose (From, To, Cc, Bcc, Subject). The sender is matched to a customer and order numbers open the order. Until
// Business email (Settings › Business email) is set up, a line says the mail is sample mail.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { getDirectory, resolveCustomer } from '@/lib/customers';
import { currentUser, allUsers } from '@/lib/team';
import {
  getThreads, markRead, star, moveTo, assign, addNote, respond, compose, ordersIn, otherOf, peopleOf, lastOf, lastAt,
  recipientsFor, hasOthers, subjectFor, showAddr, mailDomain, addrOf, SHARED, EVENT,
} from '@/lib/emailInbox';
import { TeamPage } from '@/screens/team/teamShared';

const SOON = 'Attachments open from the mail provider once it is connected.';
const KIND_LABEL = { reply: 'Reply', replyAll: 'Reply all', forward: 'Forward', note: 'Note' };
const initials = (s) => String(s || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const when = (t, now) => (t >= dayStart(now)
  ? new Date(t).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
  : new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
const full = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
const kb = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.round(n / 1e3) + ' KB');
const snippet = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 140);
const joinList = (l) => (l || []).map(showAddr).join(', ');
const NO_FILTERS = { date: '', on: '', from: '', to: '', status: '', files: '', who: '', sender: '', order: '', sort: 'new' };
const DATES = [['', 'Any date'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['month', 'This month'], ['lastmonth', 'Last month'], ['on', 'On a date…'], ['range', 'Between dates…']];
const PER = [10, 25, 50, 100];
const isoDay = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fromIso = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
/** The [start, end) window a date filter means, or null for any date. */
function windowOf(f, now) {
  const today = dayStart(now), D = 864e5;
  const d = new Date(now);
  if (f.date === 'today') return [today, today + D];
  if (f.date === 'yesterday') return [today - D, today];
  if (f.date === '7') return [today - 6 * D, today + D];
  if (f.date === '30') return [today - 29 * D, today + D];
  if (f.date === 'month') return [new Date(d.getFullYear(), d.getMonth(), 1).getTime(), today + D];
  if (f.date === 'lastmonth') return [new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), new Date(d.getFullYear(), d.getMonth(), 1).getTime()];
  if (f.date === 'on' && f.on) return [fromIso(f.on), fromIso(f.on) + D];
  if (f.date === 'range' && (f.from || f.to)) return [f.from ? fromIso(f.from) : 0, f.to ? fromIso(f.to) + D : Infinity];
  return null;
}
/** Page numbers to show: 1 … 4 5 6 … 12 */
function pageList(cur, total) {
  const keep = new Set([1, total, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= total));
  const out = [];
  [...keep].sort((a, b) => a - b).forEach((n, i, a) => { if (i && n - a[i - 1] > 1) out.push('…' + n); out.push(n); });
  return out;
}
const dayLabel = (t, now) => {
  const s = dayStart(t), today = dayStart(now);
  if (s === today) return 'Today';
  if (s === today - 864e5) return 'Yesterday';
  return new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: new Date(t).getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric' });
};
const blankBox = () => ({ kind: 'reply', replyTo: '', to: '', cc: '', bcc: '', showCc: false, showBcc: false, text: '', err: '', field: '' });

const CSS = `
.em-note{display:flex;align-items:center;gap:var(--space-2);margin:0 0 var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-xs);color:var(--text-body)}
.em-note a{margin-left:auto;color:var(--primary);font-weight:var(--weight-medium);white-space:nowrap}
.em-split{display:grid;grid-template-columns:minmax(300px,380px) minmax(0,1fr);min-height:560px}
.em-split>.em-list{border-right:1px solid var(--border-subtle)}
.em-list{display:flex;flex-direction:column;min-width:0}
.em-row{display:grid;grid-template-columns:36px minmax(0,1fr);gap:var(--space-3);width:100%;padding:var(--space-3) var(--space-4);border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer;position:relative}
.em-row:first-child{border-top:0}
.em-row:hover{background:var(--surface-subtle)}
.em-row[aria-current="true"]{background:var(--fill-primary-soft)}
.em-row:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.em-row.is-new::before{content:'';position:absolute;left:6px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:var(--radius-full);background:var(--primary)}
.em-av{display:grid;flex:none;place-items:center;width:36px;height:36px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.em-av--out{background:var(--surface-subtle);color:var(--text-body)}
.em-av--sm{width:28px;height:28px}
.em-l1{display:flex;align-items:baseline;gap:var(--space-2);min-width:0}
.em-l1 b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-regular);color:var(--text-heading)}
.em-l1 b small{font-size:var(--text-xs);color:var(--text-muted);font-weight:var(--weight-regular)}
.em-l1 time{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.em-row.is-new .em-l1 b,.em-row.is-new .em-subj{font-weight:var(--weight-semibold)}
.em-subj{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);color:var(--text-heading)}
.em-snip{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.em-tags{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.em-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-body);background:var(--surface-card);white-space:nowrap}
.em-star{color:var(--text-warning)}
.em-read{display:flex;flex-direction:column;min-width:0}
.em-blank{display:grid;place-items:center;flex:1;padding:var(--space-6);font-size:var(--text-sm);color:var(--text-muted)}
.em-rhead{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border-bottom:1px solid var(--border-subtle)}
.em-rhead h2{margin:0;font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.em-rhead h2 small{margin-left:8px;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.em-acts{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.em-acts select{width:auto;min-width:190px;max-width:240px;margin-left:auto}
.em-links{display:flex;flex-wrap:wrap;gap:6px}
.em-links a{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);text-decoration:none}
.em-links a:hover{background:var(--fill-primary-soft)}
.em-msgs{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4)}
.em-msg{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.em-msg--out{background:var(--surface-subtle)}
.em-msg.is-target{border-color:var(--primary)}
.em-fold{display:flex;align-items:center;gap:var(--space-2);width:100%;min-height:44px;padding:6px var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer;color:inherit}
.em-fold:hover{background:var(--surface-subtle)}
.em-fold b{flex:none;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.em-fold .em-fold__snip{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.em-fold time{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.em-more{align-self:center;display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 14px;border:1px dashed var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.em-mhead{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-3) var(--space-3) 0}
.em-mwho{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.em-mhead b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.em-mhead b small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.em-mhead small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.em-mhead small em{font-style:normal;color:var(--text-body)}
.em-mside{display:flex;flex:none;flex-direction:column;align-items:flex-end;gap:4px}
.em-mside time{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.em-mbtns{display:flex;gap:2px}
.em-mbtns .ix-btn{width:28px;height:28px;min-height:28px}
.em-kind{display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:var(--radius-full);background:var(--fill-info-soft);font-size:var(--text-xs);color:var(--text-info)}
.em-body{margin:0;padding:var(--space-3);font-size:var(--text-sm);line-height:1.6;color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
.em-dots{margin:0 var(--space-3) var(--space-2);min-width:32px;min-height:20px;padding:0 8px;border:0;border-radius:var(--radius-md);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-muted);cursor:pointer}
.em-quote{margin:0 var(--space-3) var(--space-3);padding:var(--space-2) var(--space-3);border-left:3px solid var(--border-strong);font-size:var(--text-xs);line-height:1.6;color:var(--text-muted);white-space:pre-wrap;overflow-wrap:anywhere}
.em-quote b{display:block;font-weight:var(--weight-medium);color:var(--text-body)}
.em-files{display:flex;flex-wrap:wrap;gap:6px;padding:0 var(--space-3) var(--space-3)}
.em-files button{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.em-files small{color:var(--text-muted)}
.em-notes{display:flex;flex-direction:column;gap:6px}
.em-n{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-body)}
.em-n small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.em-box{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border-top:1px solid var(--border-subtle)}
.em-seg{display:inline-flex;flex-wrap:wrap;gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle);align-self:flex-start}
.em-seg button{min-height:28px;padding:0 12px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.em-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.em-to{display:grid;grid-template-columns:44px minmax(0,1fr) auto;align-items:center;gap:var(--space-2)}
.em-to label{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.em-to .gc-input{min-width:0}
.em-ccbtns{display:flex;gap:2px}
.em-ccbtns button{min-height:28px;padding:0 8px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
.em-ccbtns button:hover{background:var(--fill-primary-soft)}
.em-re{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.em-re b{font-weight:var(--weight-medium);color:var(--text-body);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.em-re button{margin-left:auto;border:0;background:none;font:inherit;font-size:var(--text-xs);color:var(--primary);cursor:pointer}
.em-box textarea{min-height:110px}
.em-box--note textarea{background:var(--fill-warning-soft)}
.em-send{display:flex;align-items:center;gap:var(--space-2)}
.em-send small{font-size:var(--text-xs);color:var(--text-muted)}
.em-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.em-day{margin:0;padding:6px var(--space-4);border-top:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.em-day:first-child{border-top:0}
.em-fbtn{position:relative}
.em-fbtn b{position:absolute;top:-4px;right:-4px;display:grid;place-items:center;min-width:16px;height:16px;padding:0 4px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-on-dark);font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.ix-filter.em-date{padding-right:10px;background-image:none;cursor:text}
.em-clear{border:0;background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
.em-pager{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:8px var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.em-pager__nav{display:flex;align-items:center;gap:4px}
.em-pager__nav .ix-btn{min-width:32px}
.em-pager__nav .ix-btn[aria-current="page"]{background:var(--fill-primary-soft);border-color:var(--primary);color:var(--primary)}
.em-pager__gap{min-width:20px;text-align:center}
.em-pager__go{display:flex;align-items:center;gap:6px}
.em-pager__go input{width:56px;height:28px;padding:0 6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);font:inherit;font-size:var(--text-xs);text-align:center}
.em-pager select{height:28px;padding:0 6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body)}
.em-pager__mid{display:none}
.em-form{display:flex;flex-direction:column;gap:var(--space-3)}
.em-form textarea{min-height:180px}
.em-form .em-lab{display:flex;align-items:center;justify-content:space-between}
.gc-sheet .em-rhead,.gc-sheet .em-msgs,.gc-sheet .em-box{padding-left:0;padding-right:0}
.gc-sheet .em-rhead{padding-top:0}
@media (max-width:640px){
  .em-row{padding:var(--space-3)}
  .em-seg button,.em-ccbtns button{min-height:36px}
  .em-mbtns .ix-btn{width:36px;height:36px;min-height:36px}
  .em-acts select{margin-left:0;max-width:none;flex:1 1 100%}
  .em-mhead{flex-wrap:wrap}
  .em-mwho{flex-basis:calc(100% - 40px)}
  .em-mside{flex-direction:row;align-items:center;width:100%;justify-content:space-between}
  .em-fold .em-fold__snip{display:none}
  .em-fold b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .em-pager{justify-content:center}
  .em-pager__num,.em-pager__gap,.em-pager__go{display:none}
  .em-pager__mid{display:inline}
  .em-pager__nav .ix-btn{min-width:36px;min-height:36px}
  .em-pager select,.em-pager__go input{height:36px}
}
`;

export default function EmailInbox() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('inbox');
  const [box, setBox] = useState('');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState('');
  const [wide, setWide] = useState(true);
  const [w, setW] = useState(blankBox());          // the writing box under the thread
  const [openMsgs, setOpenMsgs] = useState({});    // message id → shown in full
  const [quotes, setQuotes] = useState({});        // message id → its quoted text shown
  const [allOpen, setAllOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [f, setF] = useState(NO_FILTERS);       // advanced filters
  const [showF, setShowF] = useState(false);
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(25);
  const [go, setGo] = useState('');
  const textRef = useRef(null);

  useEffect(() => {
    setReady(true);
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(EVENT, bump);
    const timer = window.setInterval(bump, 15000);   // a customer's answer arrives while the page is open
    const mq = window.matchMedia('(min-width: 1100px)');
    const on = () => setWide(mq.matches);
    on();
    if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on);
    const p = new URLSearchParams(window.location.search);
    if (p.get('id')) setOpenId(p.get('id'));
    if (p.get('new')) setForm({ box: 'info', to: p.get('to') || '', cc: '', bcc: '', showCc: false, showBcc: false, subject: '', text: '' });
    return () => { window.removeEventListener(EVENT, bump); window.clearInterval(timer); if (mq.removeEventListener) mq.removeEventListener('change', on); else mq.removeListener(on); };
  }, []);

  const now = Date.now();
  const me = ready ? (currentUser() || {}).name || 'Mehedi Rahman' : 'Mehedi Rahman';
  const all = useMemo(() => (ready ? getThreads() : []), [ready, tick]);
  const customers = useMemo(() => (ready ? getDirectory() : []), [ready]);
  const staff = useMemo(() => (ready ? [...new Set(allUsers().map((u) => u.name))] : []), [ready]);
  const dom = ready ? mailDomain() : { domain: '', live: true };

  const views = {
    inbox: (x) => x.folder === 'inbox',
    mine: (x) => x.folder === 'inbox' && x.assignee === me,
    starred: (x) => x.starred && x.folder !== 'trash',
    sent: (x) => x.folder !== 'trash' && x.folder !== 'spam' && x.messages.some((m) => m.out),
    archive: (x) => x.folder === 'archive',
    spam: (x) => x.folder === 'spam',
    trash: (x) => x.folder === 'trash',
  };
  const inBox = (x) => !box || x.box === box;
  const needle = q.trim().toLowerCase();
  const match = (x) => !needle || [x.subject, ...x.messages.flatMap((m) => [m.from.name, m.from.email, m.text, ...(m.to || []), ...(m.cc || [])])].join(' ').toLowerCase().includes(needle);
  const counts = {
    inbox: all.filter((x) => views.inbox(x) && inBox(x) && x.unread).length,
    mine: all.filter((x) => views.mine(x) && inBox(x)).length,
    trash: all.filter((x) => views.trash(x) && inBox(x)).length,
  };
  const TABS = [['inbox', 'Inbox'], ['mine', 'Assigned to me'], ['starred', 'Starred'], ['sent', 'Sent'], ['archive', 'Archived'], ['spam', 'Spam'], ...(counts.trash ? [['trash', 'Deleted']] : [])];
  const tabs = TABS.map(([k, l]) => ({ key: k, label: l, count: counts[k] || undefined, id: 'em-tab-' + k, on: tab === k, onClick: () => { setTab(k); setPage(1); } }));
  const win = windowOf(f, now);
  const isCustomer = (x) => { const o = otherOf(x); return !!(o.email && resolveCustomer(o.email, customers)); };
  const passes = (x) => (!win || x.messages.some((m) => m.at >= win[0] && m.at < win[1]))
    && (!f.status || (f.status === 'unread' ? x.unread : !x.unread))
    && (!f.files || (f.files === 'yes') === x.messages.some((m) => m.files && m.files.length))
    && (!f.who || (f.who === 'none' ? !x.assignee : f.who === 'me' ? x.assignee === me : x.assignee === f.who))
    && (!f.sender || (f.sender === 'customer') === isCustomer(x))
    && (!f.order || ordersIn(x).length > 0);
  const shownAll = all.filter((x) => views[tab](x) && inBox(x) && match(x) && passes(x));
  if (f.sort === 'old') shownAll.reverse();
  const pages = Math.max(1, Math.ceil(shownAll.length / per));
  const pg = Math.min(page, pages);
  const shown = shownAll.slice((pg - 1) * per, pg * per);
  const fCount = ['date', 'status', 'files', 'who', 'sender', 'order'].filter((k) => f[k]).length + (box ? 1 : 0) + (f.sort !== 'new' ? 1 : 0);
  const setFilter = (patch) => { setF({ ...f, ...patch }); setPage(1); };
  const clearFilters = () => { setF(NO_FILTERS); setBox(''); setPage(1); };
  const cur = all.find((x) => x.id === openId) || null;

  // a customer's answer that arrived while the thread is open is marked read and shown open
  useEffect(() => { if (cur && cur.unread && ready) markRead(cur.id); }, [cur && cur.id, cur && cur.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const startBox = (x, kind, msg) => {
    const target = msg || lastOf(x);
    if (kind === 'note') { setW({ ...blankBox(), kind, replyTo: target.id }); return; }
    const r = recipientsFor(x, target, kind);
    setW({ ...blankBox(), kind, replyTo: target.id, to: joinList(r.to), cc: joinList(r.cc), showCc: r.cc.length > 0 });
  };
  const open = (x) => {
    setOpenId(x.id); setOpenMsgs({}); setQuotes({}); setAllOpen(false);
    startBox(x, 'reply');
    if (x.unread) markRead(x.id);
  };
  const close = () => setOpenId('');
  const did = (res, msg) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (msg) toast(msg); return true; };
  const move = (x, folder, msg) => {
    const from = x.folder;
    if (did(moveTo(x.id, folder))) {
      toast(msg, { undo: () => moveTo(x.id, from) });
      if (views[tab] && !views[tab]({ ...x, folder })) close();
    }
  };
  const writeFor = (x, kind, msg) => {
    startBox(x, kind, msg);
    window.setTimeout(() => { if (textRef.current) { textRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' }); textRef.current.focus(); } }, 50);
  };
  const send = () => {
    if (!cur) return;
    if (w.kind === 'note') { if (did(addNote(cur.id, w.text, me), 'Note added for the team')) setW({ ...blankBox(), kind: 'note' }); return; }
    const res = respond(cur.id, { kind: w.kind, replyTo: w.replyTo, to: w.to, cc: w.cc, bcc: w.bcc, text: w.text, by: me });
    if (res.ok === false) { setW({ ...w, err: res.error, field: res.field || '' }); return; }
    const n = res.to.length + res.cc.length + res.bcc.length;
    toast((w.kind === 'forward' ? 'Forwarded' : 'Reply sent') + ' to ' + (n === 1 ? res.to[0] : n + ' people'));
    setW({ ...blankBox(), to: res.to.join(', '), cc: res.cc.join(', '), showCc: res.cc.length > 0 });
  };
  const sendNew = () => {
    const res = compose({ ...form, by: me });
    if (res.ok === false) { setForm({ ...form, err: res.error, field: res.field }); return; }
    toast('Email sent');
    setForm(null); setTab('sent');
  };

  const Row = ({ x }) => {
    const last = lastOf(x);
    const ppl = peopleOf(x);
    const out = tab === 'sent' && !x.messages.some((m) => !m.out);
    const o = otherOf(x);
    return (
      <button type="button" className={'em-row' + (x.unread ? ' is-new' : '')} aria-current={cur && cur.id === x.id ? 'true' : undefined} onClick={() => open(x)}
        aria-label={(x.unread ? 'Unread, ' : '') + ppl.join(', ') + ', ' + x.messages.length + (x.messages.length === 1 ? ' message, ' : ' messages, ') + x.subject}>
        <span className={'em-av' + (out ? ' em-av--out' : '')} aria-hidden="true">{initials(o.name)}</span>
        <span style={{ minWidth: 0 }}>
          <span className="em-l1"><b>{out ? 'To: ' + showAddr(o.email || o.name) : ppl.join(', ')}{x.messages.length > 1 ? <small> {x.messages.length}</small> : null}</b><time dateTime={new Date(lastAt(x)).toISOString()}>{when(lastAt(x), now)}</time></span>
          <span className="em-subj">{x.subject}</span>
          <span className="em-snip">{last.out ? (last.kind === 'forward' ? 'You forwarded: ' : 'You: ') : ''}{snippet(last.text || (last.quote ? last.quote.text : ''))}</span>
          <span className="em-tags">
            <span className="em-chip">{x.box}@</span>
            {x.starred ? <Icon name="star" width="14" height="14" className="em-star" aria-label="Starred" /> : null}
            {x.messages.some((m) => m.files && m.files.length) ? <Icon name="paperclip" width="14" height="14" aria-label="Has attachments" /> : null}
            {x.assignee ? <span>{x.assignee.split(' ')[0]}</span> : null}
          </span>
        </span>
      </button>
    );
  };

  const Message = ({ x, m, i }) => {
    const who = m.out ? m.by : m.from.name;
    const parent = m.replyTo ? x.messages.find((p) => p.id === m.replyTo) : null;
    const quote = m.quote || (parent ? { from: parent.out ? parent.by + ' <' + addrOf(x.box) + '>' : parent.from.name + ' <' + parent.from.email + '>', at: parent.at, text: parent.text } : null);
    const showQuote = m.kind === 'forward' || quotes[m.id];
    return (
      <article className={'em-msg' + (m.out ? ' em-msg--out' : '') + (w.replyTo === m.id && w.kind !== 'note' ? ' is-target' : '')} aria-label={'Message ' + (i + 1) + ' of ' + x.messages.length + ' from ' + who}>
        <div className="em-mhead">
          <span className={'em-av em-av--sm' + (m.out ? ' em-av--out' : '')} aria-hidden="true">{initials(who)}</span>
          <div className="em-mwho">
            <b>{who} <small>{m.out ? addrOf(x.box) : m.from.email}</small></b>
            <small>to <em>{(m.to || []).map(showAddr).join(', ') || addrOf(x.box)}</em></small>
            {(m.cc || []).length ? <small>cc <em>{m.cc.map(showAddr).join(', ')}</em></small> : null}
            {m.out && (m.bcc || []).length ? <small>bcc <em>{m.bcc.map(showAddr).join(', ')}</em></small> : null}
          </div>
          <div className="em-mside">
            <time dateTime={new Date(m.at).toISOString()}>{full(m.at)}</time>
            <span className="em-mbtns">
              {m.kind === 'forward' ? <span className="em-kind"><Icon name="forward" width="12" height="12" aria-hidden="true" />Forwarded</span> : null}
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Reply to ' + who} title="Reply" onClick={() => writeFor(x, 'reply', m)}><Icon name="reply" width="16" height="16" aria-hidden="true" /></button>
              {hasOthers(x, m) ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Reply to everyone on this message" title="Reply all" onClick={() => writeFor(x, 'replyAll', m)}><Icon name="reply-all" width="16" height="16" aria-hidden="true" /></button> : null}
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Forward this message" title="Forward" onClick={() => writeFor(x, 'forward', m)}><Icon name="forward" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </div>
        </div>
        {m.text ? <p className="em-body">{m.text}</p> : null}
        {quote && m.kind !== 'forward' ? <button type="button" className="em-dots" aria-expanded={!!quotes[m.id]} aria-label={quotes[m.id] ? 'Hide the quoted message' : 'Show the quoted message'} onClick={() => setQuotes({ ...quotes, [m.id]: !quotes[m.id] })}>•••</button> : null}
        {quote && showQuote ? (
          <div className="em-quote">
            <b>{m.kind === 'forward' ? 'Forwarded message' : 'On ' + full(quote.at) + ', ' + quote.from.split(' <')[0] + ' wrote:'}</b>
            {m.kind === 'forward' ? <span>From: {quote.from}{'\n'}Date: {full(quote.at)}{'\n'}Subject: {x.subject}{'\n\n'}</span> : null}
            {quote.text}
          </div>
        ) : null}
        {m.files && m.files.length ? (
          <div className="em-files">{m.files.map((f) => <button key={f.name} type="button" onClick={() => toast(SOON, { tone: 'info' })}><Icon name="paperclip" width="14" height="14" aria-hidden="true" />{f.name} <small>{kb(f.size)}</small></button>)}</div>
        ) : null}
      </article>
    );
  };

  const Fold = ({ m, onOpen }) => (
    <button type="button" className="em-fold" onClick={onOpen} aria-label={'Open the message from ' + (m.out ? m.by : m.from.name)}>
      <span className={'em-av em-av--sm' + (m.out ? ' em-av--out' : '')} aria-hidden="true">{initials(m.out ? m.by : m.from.name)}</span>
      <b>{m.out ? m.by : m.from.name}</b>
      <span className="em-fold__snip">{snippet(m.text || (m.quote ? m.quote.text : ''))}</span>
      <time dateTime={new Date(m.at).toISOString()}>{when(m.at, now)}</time>
    </button>
  );

  // the thread: the first message and the last two stay open; the ones between fold, and 2+ folded ones become one button
  const thread = (x) => {
    const n = x.messages.length;
    const keepOpen = (m, i) => allOpen || openMsgs[m.id] || i === n - 1 || n <= 2;
    const out = [];
    let hidden = [];
    const flush = () => {
      if (hidden.length === 1) { const m = hidden[0]; out.push(<Fold key={m.id} m={m} onOpen={() => setOpenMsgs({ ...openMsgs, [m.id]: true })} />); }
      else if (hidden.length > 1) out.push(<button key={'more' + hidden[0].id} type="button" className="em-more" onClick={() => setAllOpen(true)}><Icon name="chevrons-up-down" width="14" height="14" aria-hidden="true" />{hidden.length} earlier messages</button>);
      hidden = [];
    };
    x.messages.forEach((m, i) => {
      if (keepOpen(m, i)) { flush(); out.push(<Message key={m.id} x={x} m={m} i={i} />); }
      else if (i === 0 || i === n - 2) { flush(); out.push(<Fold key={m.id} m={m} onOpen={() => setOpenMsgs({ ...openMsgs, [m.id]: true })} />); }
      else hidden.push(m);
    });
    flush();
    return out;
  };

  const writer = (x) => {
    const target = x.messages.find((m) => m.id === w.replyTo) || lastOf(x);
    const set = (patch) => setW((cur0) => ({ ...cur0, ...patch, err: '', field: '' }));
    const isNote = w.kind === 'note';
    const notLast = target.id !== lastOf(x).id;
    return (
      <div className={'em-box' + (isNote ? ' em-box--note' : '')}>
        <div className="em-seg" role="group" aria-label="Write">
          {['reply', ...(hasOthers(x, target) ? ['replyAll'] : []), 'forward', 'note'].map((k) => <button key={k} type="button" aria-pressed={w.kind === k} onClick={() => startBox(x, k, target)}>{KIND_LABEL[k]}</button>)}
        </div>
        {!isNote ? (<>
          <div className="em-re">
            <Icon name={w.kind === 'forward' ? 'forward' : w.kind === 'replyAll' ? 'reply-all' : 'reply'} width="14" height="14" aria-hidden="true" />
            <b>{subjectFor(x.subject, w.kind)}{notLast ? ' · to ' + (target.out ? target.by : target.from.name) + '’s message of ' + full(target.at) : ''}</b>
            {notLast ? <button type="button" onClick={() => startBox(x, w.kind === 'forward' ? 'forward' : 'reply')}>Latest message</button> : null}
          </div>
          <div className="em-to">
            <label htmlFor="em-w-to">To</label>
            <input id="em-w-to" className="gc-input" type="text" inputMode="email" autoComplete="off" placeholder="name@example.com, …" aria-invalid={w.field === 'to' || undefined} value={w.to} onChange={(e) => set({ to: e.target.value })} />
            <span className="em-ccbtns">
              {!w.showCc ? <button type="button" onClick={() => set({ showCc: true })}>Cc</button> : null}
              {!w.showBcc ? <button type="button" onClick={() => set({ showBcc: true })}>Bcc</button> : null}
            </span>
          </div>
          {w.showCc ? <div className="em-to"><label htmlFor="em-w-cc">Cc</label><input id="em-w-cc" className="gc-input" type="text" inputMode="email" autoComplete="off" aria-invalid={w.field === 'cc' || undefined} value={w.cc} onChange={(e) => set({ cc: e.target.value })} /><span /></div> : null}
          {w.showBcc ? <div className="em-to"><label htmlFor="em-w-bcc">Bcc</label><input id="em-w-bcc" className="gc-input" type="text" inputMode="email" autoComplete="off" aria-invalid={w.field === 'bcc' || undefined} value={w.bcc} onChange={(e) => set({ bcc: e.target.value })} /><span /></div> : null}
        </>) : null}
        <textarea ref={textRef} className="gc-input" aria-label={isNote ? 'Note for the team' : 'Message'} aria-invalid={w.field === 'text' || undefined}
          placeholder={isNote ? 'Only your team sees notes' : w.kind === 'forward' ? 'Add a message (optional)' : 'Write your reply'} value={w.text} onChange={(e) => set({ text: e.target.value })} />
        {w.kind === 'forward' ? <p className="em-quote" style={{ margin: 0 }}><b>Forwarding</b>{(target.out ? target.by : target.from.name) + ' · ' + full(target.at) + (target.files && target.files.length ? ' · ' + target.files.length + (target.files.length === 1 ? ' attachment' : ' attachments') : '')}</p> : null}
        {w.err ? <p className="em-err" role="alert">{w.err}</p> : null}
        <div className="em-send">
          <button type="button" className="gc-btn gc-btn--solid" onClick={send}>{isNote ? 'Add note' : w.kind === 'forward' ? 'Forward' : 'Send'}</button>
          <small>{isNote ? 'Not sent to the customer' : 'From ' + addrOf(x.box) + (w.bcc.trim() ? ' · Bcc is hidden from the others' : '')}</small>
        </div>
      </div>
    );
  };

  const reader = (x) => {
    const o = otherOf(x);
    const cust = o.email ? resolveCustomer(o.email, customers) : null;
    const orders = ordersIn(x);
    return (
      <div className="em-read">
        <div className="em-rhead">
          {wide ? <h2>{x.subject}<small>{x.messages.length === 1 ? '1 message' : x.messages.length + ' messages'}</small></h2> : <small className="em-snip">{x.messages.length === 1 ? '1 message' : x.messages.length + ' messages'}</small>}
          <div className="em-acts">
            <span className="em-chip"><Icon name="mail" width="12" height="12" aria-hidden="true" />{addrOf(x.box)}</span>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-pressed={x.starred} aria-label={x.starred ? 'Remove star' : 'Star'} title={x.starred ? 'Remove star' : 'Star'} onClick={() => star(x.id)}><Icon name="star" width="16" height="16" className={x.starred ? 'em-star' : ''} aria-hidden="true" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Mark as unread" title="Mark as unread" onClick={() => { markRead(x.id, false); close(); toast('Marked as unread'); }}><Icon name="mail" width="16" height="16" aria-hidden="true" /></button>
            {x.folder === 'archive' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => move(x, 'inbox', 'Moved to Inbox')}>Move to Inbox</button>
              : <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Archive" title="Archive" onClick={() => move(x, 'archive', 'Archived')}><Icon name="archive" width="16" height="16" aria-hidden="true" /></button>}
            {x.folder === 'spam' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => move(x, 'inbox', 'Not spam: moved to Inbox')}>Not spam</button>
              : <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Mark as spam" title="Spam" onClick={() => move(x, 'spam', 'Moved to Spam')}><Icon name="shield-alert" width="16" height="16" aria-hidden="true" /></button>}
            {x.folder === 'trash' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => move(x, 'inbox', 'Moved to Inbox')}>Restore</button>
              : <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Delete" title="Delete" onClick={() => move(x, 'trash', 'Moved to Deleted')}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>}
            <select className="gc-input gc-select" aria-label="Assigned to" value={x.assignee} onChange={(e) => { assign(x.id, e.target.value); toast(e.target.value ? 'Assigned to ' + e.target.value : 'Unassigned'); }}>
              <option value="">Unassigned</option>
              {staff.map((s) => <option key={s} value={s}>{s === me ? s + ' (me)' : s}</option>)}
            </select>
          </div>
          {cust || orders.length ? (
            <div className="em-links">
              {cust ? <Link href={'/customer-crm?id=' + encodeURIComponent(cust.id)}><Icon name="user" width="14" height="14" aria-hidden="true" />Customer: {cust.name}{cust.orders ? ' · ' + cust.orders + ' orders' : ''}</Link> : null}
              {orders.map((no) => <Link key={no} href={'/order-detail?id=' + encodeURIComponent(no)}><Icon name="package" width="14" height="14" aria-hidden="true" />Order {no}</Link>)}
            </div>
          ) : null}
        </div>
        <div className="em-msgs">
          {thread(x)}
          {x.notes.length ? (
            <div className="em-notes" aria-label="Team notes">
              {x.notes.map((n, i) => <div key={i} className="em-n"><small>Note · {n.by} · {full(n.at)}</small>{n.text}</div>)}
            </div>
          ) : null}
        </div>
        {writer(x)}
      </div>
    );
  };

  const list = (
    <div className="em-list">
      {!ready ? null : shown.length === 0 ? (
        <div className="ix-empty"><EmptyState icon="mail" title={needle || fCount ? 'No email matches your search' : tab === 'inbox' ? 'Your inbox is empty' : 'Nothing here'} /></div>
      ) : (
        <div>{shown.map((x, i) => {
          const t = lastAt(x), head = i === 0 || dayStart(lastAt(shown[i - 1])) !== dayStart(t);
          return <React.Fragment key={x.id}>{head ? <h3 className="em-day">{dayLabel(t, now)}</h3> : null}<div><Row x={x} /></div></React.Fragment>;
        })}</div>
      )}
    </div>
  );

  const fset = (patch) => setForm((cur0) => ({ ...cur0, ...patch, err: '', field: '' }));
  return (
    <TeamPage screen="EmailInbox" active="inbox-email" crumb="Inbox" page="Email" title="Email" icon="mail" css={CSS}
      about="Email to the shop's addresses (info@, sales@, support@, orders@), one row per conversation. Open it to read every message in order; reply, reply to everyone or forward any message, with Cc and Bcc. Add a note for the team or assign it to someone. The sender is matched to a customer and order numbers open the order."
      more={[{ label: 'Business email settings', href: '/email' }]}
      primary={{ label: 'Compose', onClick: () => setForm({ box: 'info', to: '', cc: '', bcc: '', showCc: false, showBcc: false, subject: '', text: '' }) }}>
      {ready && !dom.live ? (
        <p className="em-note"><Icon name="info" width="14" height="14" aria-hidden="true" />Sample mail. Set up Business email to get mail at your own addresses.<Link href="/email">Set up</Link></p>
      ) : null}
      <section className="ix-card" aria-label="Email">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email" onDone={() => { setFind(false); setQ(''); }} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Email folders" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon em-fbtn" aria-expanded={showF || fCount > 0} aria-label={fCount ? 'Filters, ' + fCount + ' on' : 'Filters'} title="Filter" onClick={() => setShowF(!showF)}>
                <Icon name="list-filter" width="16" height="16" aria-hidden="true" />{fCount ? <b aria-hidden="true">{fCount}</b> : null}
              </button>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search email" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
        {showF || fCount ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select aria-label="Date" className={'ix-filter' + (f.date ? ' is-set' : '')} value={f.date} onChange={(e) => setFilter({ date: e.target.value, on: e.target.value === 'on' && !f.on ? isoDay(now) : f.on })}>
              {DATES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {f.date === 'on' ? <input type="date" className="ix-filter em-date is-set" aria-label="Emails on this date" value={f.on} max={isoDay(now)} onChange={(e) => setFilter({ on: e.target.value })} /> : null}
            {f.date === 'range' ? (<>
              <input type="date" className="ix-filter em-date is-set" aria-label="From date" value={f.from} max={f.to || isoDay(now)} onChange={(e) => setFilter({ from: e.target.value })} />
              <input type="date" className="ix-filter em-date is-set" aria-label="To date" value={f.to} min={f.from || undefined} max={isoDay(now)} onChange={(e) => setFilter({ to: e.target.value })} />
            </>) : null}
            <select aria-label="Address" className={'ix-filter' + (box ? ' is-set' : '')} value={box} onChange={(e) => { setBox(e.target.value); setPage(1); }}>
              <option value="">All addresses</option>
              {SHARED.map((a) => <option key={a.local} value={a.local}>{a.local}@</option>)}
            </select>
            <select aria-label="Read or unread" className={'ix-filter' + (f.status ? ' is-set' : '')} value={f.status} onChange={(e) => setFilter({ status: e.target.value })}>
              <option value="">Read and unread</option><option value="unread">Unread</option><option value="read">Read</option>
            </select>
            <select aria-label="Attachments" className={'ix-filter' + (f.files ? ' is-set' : '')} value={f.files} onChange={(e) => setFilter({ files: e.target.value })}>
              <option value="">Attachments</option><option value="yes">With attachments</option><option value="no">No attachments</option>
            </select>
            <select aria-label="Assigned to" className={'ix-filter' + (f.who ? ' is-set' : '')} value={f.who} onChange={(e) => setFilter({ who: e.target.value })}>
              <option value="">Anyone</option><option value="me">Assigned to me</option><option value="none">Unassigned</option>
              {staff.filter((x) => x !== me).map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select aria-label="Sender" className={'ix-filter' + (f.sender ? ' is-set' : '')} value={f.sender} onChange={(e) => setFilter({ sender: e.target.value })}>
              <option value="">Any sender</option><option value="customer">Customers</option><option value="other">Not customers</option>
            </select>
            <select aria-label="Orders" className={'ix-filter' + (f.order ? ' is-set' : '')} value={f.order} onChange={(e) => setFilter({ order: e.target.value })}>
              <option value="">Any email</option><option value="yes">Mentions an order</option>
            </select>
            <select aria-label="Sort" className={'ix-filter' + (f.sort !== 'new' ? ' is-set' : '')} value={f.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
              <option value="new">Newest first</option><option value="old">Oldest first</option>
            </select>
            {fCount ? <button type="button" className="em-clear" onClick={clearFilters}>Clear all</button> : null}
          </div>
        ) : null}
        {wide ? (
          <div className="em-split">
            {list}
            {cur ? reader(cur) : <div className="em-read"><p className="em-blank">Choose an email to read it here.</p></div>}
          </div>
        ) : list}
        <nav className="em-pager" aria-label="Pages">
          <span>{shownAll.length ? ((pg - 1) * per + 1) + '–' + Math.min(pg * per, shownAll.length) + ' of ' + shownAll.length : '0 conversations'}</span>
          <span className="em-pager__nav">
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="First page" disabled={pg === 1} onClick={() => setPage(1)}><Icon name="chevrons-left" width="16" height="16" aria-hidden="true" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Previous page" disabled={pg === 1} onClick={() => setPage(pg - 1)}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
            {pageList(pg, pages).map((n) => (typeof n === 'string'
              ? <span key={n} className="em-pager__gap" aria-hidden="true">…</span>
              : <button key={n} type="button" className="ix-btn ix-btn--sm em-pager__num" aria-label={'Page ' + n} aria-current={n === pg ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>))}
            <span className="em-pager__mid">{'Page ' + pg + ' of ' + pages}</span>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Next page" disabled={pg === pages} onClick={() => setPage(pg + 1)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Last page" disabled={pg === pages} onClick={() => setPage(pages)}><Icon name="chevrons-right" width="16" height="16" aria-hidden="true" /></button>
          </span>
          <span className="em-pager__go">
            <label htmlFor="em-go">Go to</label>
            <input id="em-go" inputMode="numeric" value={go} placeholder={String(pg)} onChange={(e) => setGo(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => { if (e.key === 'Enter' && go) { setPage(Math.min(pages, Math.max(1, Number(go)))); setGo(''); } }} />
            <select aria-label="Conversations a page" value={per} onChange={(e) => { setPer(Number(e.target.value)); setPage(1); }}>
              {PER.map((n) => <option key={n} value={n}>{n} a page</option>)}
            </select>
          </span>
        </nav>
      </section>

      {!wide ? (
        <Sheet open={!!cur} title={cur ? cur.subject : ''} onClose={close}>
          {cur ? reader(cur) : null}
        </Sheet>
      ) : null}

      <Sheet open={!!form} title="New email" onClose={() => setForm(null)}
        footer={form ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setForm(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={sendNew}>Send</button></> : null}>
        {form ? (
          <div className="em-form">
            <div><label className="gc-label" htmlFor="em-from">From</label>
              <select id="em-from" className="gc-input gc-select" value={form.box} onChange={(e) => fset({ box: e.target.value })}>
                {SHARED.map((a) => <option key={a.local} value={a.local}>{addrOf(a.local)}</option>)}
              </select></div>
            <div>
              <div className="em-lab"><label className="gc-label" htmlFor="em-to">To *</label>
                <span className="em-ccbtns">
                  {!form.showCc ? <button type="button" onClick={() => fset({ showCc: true })}>Cc</button> : null}
                  {!form.showBcc ? <button type="button" onClick={() => fset({ showBcc: true })}>Bcc</button> : null}
                </span></div>
              <input id="em-to" className="gc-input" type="text" inputMode="email" list="em-people" autoComplete="off" placeholder="name@example.com, …" aria-required="true" aria-invalid={form.field === 'to' || undefined} value={form.to} onChange={(e) => fset({ to: e.target.value })} />
              <datalist id="em-people">{customers.flatMap((c) => (c.emails || []).map((e) => [e.value, c.name])).slice(0, 80).map(([e, n]) => <option key={e} value={e}>{n}</option>)}</datalist>
            </div>
            {form.showCc ? <div><label className="gc-label" htmlFor="em-cc">Cc</label><input id="em-cc" className="gc-input" type="text" inputMode="email" autoComplete="off" aria-invalid={form.field === 'cc' || undefined} value={form.cc} onChange={(e) => fset({ cc: e.target.value })} /></div> : null}
            {form.showBcc ? <div><label className="gc-label" htmlFor="em-bcc">Bcc</label><input id="em-bcc" className="gc-input" type="text" inputMode="email" autoComplete="off" aria-invalid={form.field === 'bcc' || undefined} value={form.bcc} onChange={(e) => fset({ bcc: e.target.value })} />
              <p className="gc-help" style={{ margin: '4px 0 0' }}>People in Bcc get the email; the others don’t see them.</p></div> : null}
            <div><label className="gc-label" htmlFor="em-subject">Subject *</label>
              <input id="em-subject" className="gc-input" aria-required="true" aria-invalid={form.field === 'subject' || undefined} value={form.subject} onChange={(e) => fset({ subject: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="em-text">Message *</label>
              <textarea id="em-text" className="gc-input" aria-required="true" aria-invalid={form.field === 'text' || undefined} value={form.text} onChange={(e) => fset({ text: e.target.value })} /></div>
            {form.err ? <p className="em-err" role="alert">{form.err}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </TeamPage>
  );
}
