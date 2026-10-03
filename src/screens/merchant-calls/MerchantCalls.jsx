'use client';
// MerchantCalls — the shop's phone desk, laid out like a Shopify list (components/ui/IndexKit.jsx): title row,
// today's figures, then one card with the call log, callbacks and recordings (search and filters on the log), and
// beside it the dialer and who in the team is on the phones. Calling now (ringing, the live call: mute, hold,
// keypad, transfer, notes, create order, end) shows above the figures. A log row opens its outcome (reason, result,
// follow-up); the ⋯ menu on a row holds call back, play, chats, create order and mark done.
// The dialer sits beside the log on desktop and opens as a bottom sheet on phones and tablets.
// Front end only: calls are kept in this browser (src/lib/inbox.js); names come from the customer
// book and the inbox, orders from src/lib/orders.js by phone number.
// URL: ?dial=01XXXXXXXXX&name=… puts the number in the dialer (the Inbox "Call" buttons use it).
// Call tasks (src/lib/callTasks.js): other areas (Recovery, Accounts, Orders) ask for a call; the Call tasks tab is their
// queue. A task is checked again before it is shown (a cart that became an order is skipped); calling it and saving the
// outcome closes it ("No answer" / "Callback needed" keep it for another try). ?tab=tasks opens the queue.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, Dialog, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, Menu } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getOrders, orderHref } from '@/lib/orders';
import { getCustomers } from '@/lib/customers';
import {
  ME, STAFF, CALL_DIRS, CALL_REASONS, CALL_RESULTS, RESULT_TONE, LINES, AGENT_STATUS, getCalls, addCall, patchCall, getConvs,
  getMyStatus, setMyStatus, staffName, ago, whenText, fmtDur, isToday, samePhone, phoneDigits,
} from '@/lib/inbox';
import { useInbox, useNow, useMedia, Avatar, StaffAvatar, SlaChip, Menu as InboxMenu, MenuItem, Sheet, PARTS_CSS } from '@/components/inbox/parts';
import { Dialer, fmtPhone, DIALER_CSS } from '@/components/inbox/Dialer';
import { getCallTasks, startCallTask, completeCallTask, skipCallTask, revalidate, CALL_SOURCES, CALL_TASK_EVENT } from '@/lib/callTasks';

const LOG_TABS = [['all', 'All'], ['in', 'Incoming'], ['out', 'Outgoing'], ['missed', 'Missed'], ['voicemail', 'Voicemail']];
const PERIODS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['all', 'All time']];
const DAY = 24 * 3600 * 1000;
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
// a task is pointless once its reason is gone: the cart became an order, the order was delivered
function taskDone(task, orders) {
  const c = task.check || {};
  const mine = orders.filter((o) => samePhone(o.phone, task.customer.phone));
  if (c.kind === 'cart-ordered') { const o = mine.find((x) => x.at > task.at); return o ? `The cart became order ${o.id}` : ''; }
  if (c.kind === 'order-delivered') { const o = mine.find((x) => x.id === c.ref); return o && o.statusKey === 'delivered' ? `Order ${o.id} was delivered` : ''; }
  return '';
}
const agoText = (at, now) => { const a = ago(at, now); return /\d[mh]$/.test(a) ? a + ' ago' : a === 'now' ? 'just now' : a.toLowerCase() === 'yesterday' ? 'yesterday' : 'on ' + a; };
const secs = (from) => Math.max(0, Math.round((Date.now() - from) / 1000));
const followText = (v) => (!v ? '' : /^\d{4}-\d{2}-\d{2}$/.test(v) ? formatDate(v + 'T10:00:00') : v);
const orderTone = (o) => (ORDER_STATUSES.find((s) => s.key === o.statusKey) || { tone: 'neutral' }).tone;
const isDue = (c) => (((c.dir === 'missed' || c.dir === 'voicemail') && c.callback === 'due') || (c.result === 'Callback needed' && c.callback !== 'done'));

export default function MerchantCalls() {
  const calls = useInbox(getCalls);
  const convs = useInbox(getConvs) || [];
  const now = useNow(30000);
  const small = useMedia('(max-width:1023px)');
  const t = now || Date.now();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState('available');
  const [tab, setTab] = useState('log');
  const [dir, setDir] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [agent, setAgent] = useState('');
  const [period, setPeriod] = useState('7d');
  const [number, setNumber] = useState('');
  const [line, setLine] = useState('support');
  const [dialSheet, setDialSheet] = useState(false);
  const [queue, setQueue] = useState([]);
  const [live, setLive] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [playing, setPlaying] = useState(null);   // { id, pos }
  const [open, setOpen] = useState([]);           // transcripts shown in full
  const [tasks, setTasks] = useState(null);        // outbound call tasks (callTasks.js)

  useEffect(() => {
    const os = getOrders();
    revalidate((task) => taskDone(task, os));
    const readTasks = () => setTasks(getCallTasks());
    readTasks();
    window.addEventListener(CALL_TASK_EVENT, readTasks);
    if (new URLSearchParams(window.location.search).get('tab') === 'tasks') setTab('tasks');
    return () => window.removeEventListener(CALL_TASK_EVENT, readTasks);
  }, []);
  useEffect(() => {
    setOrders(getOrders());
    setCustomers(getCustomers());
    setStatus(getMyStatus());
    const n = Date.now();
    setQueue([
      { id: 'q1', phone: '01553336655', name: 'Nusrat Jahan', ivr: 'Order status', since: n - 42000 },
      { id: 'q2', phone: '01911220145', name: 'Arif Karim', ivr: 'Refund', since: n - 72000 },
    ]);
    const p = new URLSearchParams(window.location.search);
    const dial = p.get('dial');
    if (dial) {
      setNumber(phoneDigits(dial));
      if (window.matchMedia('(max-width:1023px)').matches) setDialSheet(true);
      toast(`${p.get('name') || fmtPhone(dial)} is ready in the dialer — press Call`, { tone: 'info' });
    }
  }, []);

  // recording playback (demo): the bar moves, nothing is heard
  useEffect(() => {
    if (!playing) return undefined;
    const c = (calls || []).find((x) => x.id === playing.id);
    const id = window.setInterval(() => setPlaying((p) => (!p ? p : p.pos + 0.5 >= (c ? c.dur : 0) ? null : { ...p, pos: p.pos + 0.5 })), 500);
    return () => window.clearInterval(id);
  }, [playing && playing.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const people = useMemo(() => {
    const seen = new Map();
    convs.forEach((c) => { if (c.phone && !seen.has(c.phone)) seen.set(c.phone, { name: c.name, phone: c.phone, avatar: c.avatar, pos: c.pos, meta: '' }); });
    customers.forEach((c) => { const x = seen.get(c.phone) || { phone: c.phone, avatar: '', pos: '' }; seen.set(c.phone, { ...x, name: c.name, meta: (c.types || []).join(' · ') }); });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [convs, customers]);
  const nameOf = (c) => c.name || (people.find((p) => samePhone(p.phone, c.phone)) || {}).name || '';
  const personOf = (phone) => people.find((p) => samePhone(p.phone, phone)) || null;
  const ordersOf = (phone) => orders.filter((o) => samePhone(o.phone, phone)).sort((a, b) => b.at - a.at);

  const all = calls || [];
  const today = all.filter((c) => isToday(c.at, t));
  const inToday = today.filter((c) => c.dir === 'in');
  const missedToday = today.filter((c) => c.dir === 'missed' || c.dir === 'voicemail');
  const rate = inToday.length + missedToday.length ? Math.round((inToday.length / (inToday.length + missedToday.length)) * 100) : 100;
  const wait = inToday.length ? Math.round(inToday.reduce((a, c) => a + (c.wait || 0), 0) / inToday.length) : 0;
  const due = all.filter(isDue).sort((a, b) => a.at - b.at);
  const recs = all.filter((c) => c.rec && c.dur);

  const inPeriod = (c) => (period === 'all' ? true : period === 'today' ? isToday(c.at, t) : period === 'yesterday' ? isToday(c.at + DAY, t) : c.at >= t - 7 * DAY);
  const needle = q.trim().toLowerCase();
  const base = all.filter((c) => inPeriod(c) && (!agent || c.agent === agent) && (!needle || [nameOf(c), c.phone, c.order, c.reason, c.result].join(' ').toLowerCase().includes(needle)));
  const log = base.filter((c) => dir === 'all' || c.dir === dir);

  // ---- calling ---------------------------------------------------------------------------------------
  const busy = !!live;
  const startCall = (phone, name, from = '', task = null) => {
    if (live) { toast('Finish the call you are on first', { tone: 'error' }); return; }
    const id = Date.now();
    setDialSheet(false);
    if (task) startCallTask(task.id, staffName(ME));
    setLive({ id, phone, name: name || (personOf(phone) || {}).name || '', dir: 'out', line, state: 'ringing', start: Date.now(), liveAt: 0, wait: 0, from, task: task ? task.id : '', reason: task ? (task.source === 'Accounts' ? 'Payment' : task.source === 'Orders' ? 'Delivery' : 'Other') : '', note: task ? task.reason : '', muted: false, hold: false, pad: false, tones: '' });
    window.setTimeout(() => setLive((l) => (l && l.id === id && l.state === 'ringing' ? { ...l, state: 'live', liveAt: Date.now() } : l)), 2200);
  };
  const answer = (w) => {
    if (live) { toast('Finish the call you are on first', { tone: 'error' }); return; }
    setQueue((list) => list.filter((x) => x.id !== w.id));
    setLive({ id: Date.now(), phone: w.phone, name: w.name, dir: 'in', line: 'support', state: 'live', start: w.since, liveAt: Date.now(), wait: secs(w.since), reason: w.ivr, from: '', muted: false, hold: false, pad: false, tones: '', note: '' });
  };
  const decline = (w) => {
    setQueue((list) => list.filter((x) => x.id !== w.id));
    addCall({ dir: 'missed', phone: w.phone, name: w.name, wait: secs(w.since), agent: '', callback: 'due', reason: w.ivr });
    toast(`${w.name} sent to the callback queue`);
  };
  const simulate = () => {
    const p = people[Math.floor(Math.random() * people.length)] || { phone: '01700000000', name: 'New caller' };
    setQueue((list) => [...list, { id: 'q' + Date.now(), phone: p.phone, name: p.name, ivr: CALL_REASONS[Math.floor(Math.random() * 4)], since: Date.now() }]);
    toast(`${p.name} is calling`, { tone: 'info' });
  };
  const end = () => {
    const dur = live.liveAt ? secs(live.liveAt) : 0;
    const os = ordersOf(live.phone);
    setOutcome({ ...live, dur, reason: live.reason || (live.dir === 'in' ? 'Order status' : 'Delivery'), result: dur ? 'Resolved' : 'No answer', followUp: '', order: os[0] ? os[0].id : '' });
    setLive(null);
  };
  const transfer = (to) => {
    const dur = live.liveAt ? secs(live.liveAt) : 0;
    addCall({ dir: live.dir, phone: live.phone, name: live.name, dur, wait: live.wait, agent: ME, line: live.line, reason: live.reason || '', result: 'Transferred', note: [live.note, `Transferred to ${staffName(to)}`].filter(Boolean).join(' · '), rec: dur > 0 });
    if (live.from) patchCall(live.from, { callback: 'done', doneAt: Date.now() });
    setLive(null);
    toast(`Call transferred to ${staffName(to)}`);
  };
  const saveOutcome = (skip) => {
    const o = outcome;
    if (!skip && o.result === 'Callback needed' && !o.followUp) { toast('Pick the follow-up date for the callback', { tone: 'error' }); return; }
    addCall({
      dir: o.dir, phone: o.phone, name: o.name, dur: o.dur, wait: o.wait, agent: ME, line: o.line,
      reason: skip ? '' : o.reason, result: skip ? '' : o.result, followUp: skip ? '' : o.followUp, order: skip ? '' : o.order, note: (o.note || '').trim(),
      rec: o.dur > 0, transcript: o.dur > 0 ? 'Transcript is being prepared — it appears here a few minutes after the call.' : '',
      callback: !skip && o.result === 'Callback needed' ? 'due' : '',
    });
    if (o.from) patchCall(o.from, { callback: 'done', doneAt: Date.now() });
    // a call task closes with the outcome; no answer or a callback keeps it for another try
    if (o.task) completeCallTask(o.task, { outcome: skip ? 'No answer' : o.result === 'Callback needed' ? 'Call back later' : o.result, note: (o.note || '').trim(), by: staffName(ME) });
    setOutcome(null);
    toast(skip ? 'Call saved without an outcome' : `Call saved · ${o.result}${o.followUp ? ' · follow up ' + followText(o.followUp) : ''}`);
  };
  const markDone = (c) => {
    patchCall(c.id, { callback: 'done', doneAt: Date.now() });
    toast(`Callback for ${nameOf(c) || fmtPhone(c.phone)} done`, { undo: () => patchCall(c.id, { callback: c.callback || 'due', doneAt: null }) });
  };
  const changeStatus = (s) => { setStatus(s); setMyStatus(s); toast(`You are ${AGENT_STATUS[s][0].toLowerCase()}`); };
  const exportCsv = () => {
    const rows = [['Call', 'Direction', 'Name', 'Phone', 'When', 'Duration', 'Wait (s)', 'Agent', 'Reason', 'Result', 'Order', 'Follow-up'], ...log.map((c) => [c.id, CALL_DIRS[c.dir].label, nameOf(c), c.phone, new Date(c.at).toISOString(), fmtDur(c.dur), c.wait || 0, c.agent ? staffName(c.agent) : '', c.reason, c.result, c.order, c.followUp])];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'call-log.csv';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`${log.length} calls exported`);
  };

  const dialer = <Dialer number={number} setNumber={setNumber} line={line} setLine={setLine} people={people} recent={all.filter((c, i) => all.findIndex((x) => x.phone === c.phone) === i).slice(0, 8).map((c) => ({ ...c, name: nameOf(c) }))} onCall={(p, n) => startCall(p, n)} now={t} busy={busy} />;
  const statusNow = live ? 'on-call' : status;
  // desktop keeps the dialer beside the log: "Dialer" puts the cursor in its number box; smaller screens open the sheet
  const openDialer = () => {
    if (small) { setDialSheet(true); return; }
    const el = document.querySelector('#cl-dialer input[type="tel"]');
    if (el) { el.focus(); el.scrollIntoView({ block: 'nearest' }); }
  };
  const editOutcome = (c) => setOutcome({ ...c, name: nameOf(c), edit: c.id, followUp: c.followUp || '', reason: c.reason || CALL_REASONS[0], result: c.result || CALL_RESULTS[0] });
  const callMenu = (c) => {
    const name = nameOf(c);
    return [
      { label: isDue(c) ? 'Call back' : 'Call', onClick: () => startCall(c.phone, name, isDue(c) ? c.id : '') },
      c.rec && c.dur ? { label: 'Play recording', onClick: () => { setTab('recordings'); setPlaying({ id: c.id, pos: 0 }); } } : null,
      { label: 'Open their chats', href: `/merchant-inbox?phone=${c.phone}` },
      { label: 'Create an order', href: `/new-order?phone=${c.phone}&name=${encodeURIComponent(name)}` },
      { label: c.result ? 'Edit the outcome' : 'Log the outcome', onClick: () => editOutcome(c) },
      isDue(c) ? { label: 'Mark callback done', onClick: () => markDone(c) } : null,
    ].filter(Boolean);
  };
  const outcomeBadge = (c) => (c.result ? <span className={'gc-badge gc-badge--' + (RESULT_TONE[c.result] || 'slate')}>{c.result}</span>
    : isDue(c) ? <span className="gc-badge gc-badge--warning">Callback due</span>
      : c.callback === 'done' ? <span className="gc-badge gc-badge--success">Called back</span> : <span className="ix-muted">No outcome</span>);
  const openTasks = (tasks || []).filter((x) => x.status === 'open');
  const readyTasks = openTasks.filter((x) => !(x.snoozeUntil > t));
  const taskGroups = Object.values(openTasks.reduce((a, x) => { const k = x.source + '|' + x.reason; a[k] = a[k] || { key: k, source: x.source, reason: x.reason, n: 0, amount: 0 }; a[k].n += 1; a[k].amount += x.amount || 0; return a; }, {}));
  const tabs = [['log', 'Call log', log.length], ['callbacks', 'Callbacks', due.length], ['tasks', 'Call tasks', readyTasks.length], ['recordings', 'Recordings', recs.length]];
  const logFilters = (dir !== 'all' ? 1 : 0) + (agent ? 1 : 0) + (period !== '7d' ? 1 : 0);
  const showFind = find || !!q || logFilters > 0;
  const clearLog = () => { setDir('all'); setQ(''); setAgent(''); setPeriod('7d'); };
  const periodName = PERIODS.find((p) => p[0] === period)[1];

  return (
    <div className="dc-screen ds cl" data-screen="MerchantCalls">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="calls" />
        <main className="gc-shell__main">
          <Topbar crumb="Management" page="Calls" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="phone" title="Calls"
                about="Calls in and out of the shop’s numbers: answer, call back, log what happened and listen again."
                secondary={[{ label: 'Export', onClick: exportCsv, disabled: !log.length }]}
                more={[!queue.length ? { label: 'Simulate an incoming call', onClick: simulate } : null, { label: 'AI calls', href: '/ai-calls' }].filter(Boolean)}
                primary={{ label: 'Dialer', icon: 'grid-3x3', onClick: openDialer }} />

              {queue.length && !live ? (
                <section className="cl-ring" aria-label="Calls waiting">
                  {queue.map((w, i) => (
                    <div key={w.id} className="cl-ring__row">
                      <span className="cl-pulse"><Avatar name={w.name} size={32} /></span>
                      <span className="cl-ring__text"><b>{w.name}</b><span className="ib-sub"><span className="ib-data">{fmtPhone(w.phone)}</span> · {w.ivr} · {i === 0 ? 'ringing' : 'waiting'} <Since at={w.since} /></span></span>
                      <span className="cl-ring__acts">
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => decline(w)}>Decline</button>
                        <button type="button" className="ix-btn ix-btn--sm cl-answer" onClick={() => answer(w)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Answer</button>
                      </span>
                    </div>
                  ))}
                </section>
              ) : null}

              {live ? <LiveCall live={live} setLive={setLive} onEnd={end} onTransfer={transfer} orders={ordersOf(live.phone)} person={personOf(live.phone)} /> : null}

              <MetricStrip label="Calls today" items={[
                { label: 'Calls today', value: calls ? String(today.length) : '—', sub: `${inToday.length} in · ${today.filter((c) => c.dir === 'out').length} out` },
                { label: 'Answered', value: calls ? rate + '%' : '—', sub: 'of incoming' },
                { label: 'Average wait', value: calls ? wait + 's' : '—' },
                { label: 'Missed today', value: calls ? String(missedToday.length) : '—', sub: 'incl. voicemail' },
              ]} />

              <div className="ix-record">
                <div className="ix-main">
                  <section className="ix-card cl-card" aria-label="Calls">
                    <div className="ix-bar">
                      {tab === 'log' && showFind ? (<>
                        <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, number, order" onDone={() => { setFind(false); clearLog(); }} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); clearLog(); }}>Cancel</button>
                      </>) : (<>
                        <IndexTabs label="Calls" tabs={tabs.map(([id, l, n]) => ({ key: id, label: l, count: calls ? n : null, id: 'cl-tab-' + id, on: tab === id, onClick: () => setTab(id) }))} />
                        {tab === 'log' ? <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span> : null}
                      </>)}
                    </div>

                    {tab === 'log' ? (<>
                      {showFind ? (
                        <div className="ix-filters" role="group" aria-label="Filters">
                          <select aria-label="Direction" className={'ix-filter' + (dir !== 'all' ? ' is-set' : '')} value={dir} onChange={(e) => setDir(e.target.value)}>
                            {LOG_TABS.map(([v, l]) => <option key={v} value={v}>{v === 'all' ? 'Direction' : l}</option>)}
                          </select>
                          <select aria-label="Agent" className={'ix-filter' + (agent ? ' is-set' : '')} value={agent} onChange={(e) => setAgent(e.target.value)}>
                            <option value="">Agent</option>{STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <select aria-label="Period" className={'ix-filter' + (period !== '7d' ? ' is-set' : '')} value={period} onChange={(e) => setPeriod(e.target.value)}>
                            {PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                          {q || logFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearLog}>Clear all</button> : null}
                        </div>
                      ) : null}
                      {!calls ? <p className="cl-loading">Loading calls…</p> : log.length ? (<>
                        <ul className="ix-plist" aria-label="Call log">
                          {log.map((c) => {
                            const d = CALL_DIRS[c.dir];
                            const name = nameOf(c);
                            return (
                              <li key={c.id} className="cl-pli">
                                <button type="button" className="ix-pitem" onClick={() => editOutcome(c)}>
                                  <span className="ix-pitem__top"><b><span className={'cl-dir cl-dir--' + c.dir}><Icon name={d.icon} width="16" height="16" aria-hidden="true" /></span>{name || 'Unknown caller'}</b><span className="ix-muted">{whenText(c.at, t)}</span></span>
                                  <span className="ix-pitem__mid">{d.label} · {c.dur ? fmtDur(c.dur) : 'not connected'}{c.agent ? ' · ' + staffName(c.agent).split(' ')[0] : ''}</span>
                                  <span className="ix-pitem__tags">{outcomeBadge(c)}</span>
                                </button>
                                <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={callMenu(c)} />
                              </li>
                            );
                          })}
                        </ul>
                        <div className="ix-table-wrap">
                          <table className="ix-table gc-table--keep">
                            <caption className="sr-only">Call log, {periodName}</caption>
                            <thead>
                              <tr>
                                <th scope="col"><span className="sr-only">Type</span></th>
                                <th scope="col">Caller</th>
                                <th scope="col">When</th>
                                <th scope="col" className="ix-num">Duration</th>
                                <th scope="col">Outcome</th>
                                <th scope="col">Handled by</th>
                                <th scope="col"><span className="sr-only">Actions</span></th>
                              </tr>
                            </thead>
                            <tbody>
                              {log.map((c) => {
                                const d = CALL_DIRS[c.dir];
                                const name = nameOf(c);
                                return (
                                  <tr key={c.id} onClick={(e) => { if (e.target.closest('a,button,input,select')) return; editOutcome(c); }}>
                                    <td className="cl-dircell"><span className={'cl-dir cl-dir--' + c.dir} title={d.label}><Icon name={d.icon} width="16" height="16" aria-hidden="true" /><span className="sr-only">{d.label}</span></span></td>
                                    <td><button type="button" className="ix-strong" onClick={() => editOutcome(c)}>{name || 'Unknown caller'}</button></td>
                                    <td className="ix-muted">{whenText(c.at, t)}</td>
                                    <td className="ix-num">{c.dur ? fmtDur(c.dur) : '—'}</td>
                                    <td>{outcomeBadge(c)}</td>
                                    <td className={c.agent ? '' : 'ix-muted'}>{c.agent ? staffName(c.agent).split(' ')[0] : 'Nobody'}</td>
                                    <td className="ix-num"><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={callMenu(c)} /></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="ix-foot"><span>{log.length} {log.length === 1 ? 'call' : 'calls'} · {periodName}</span></div>
                      </>) : <div className="ix-empty"><EmptyState icon="phone-off" title="No calls match" actionLabel="Show all calls" onAction={() => { setDir('all'); setQ(''); setAgent(''); setPeriod('all'); }} /></div>}
                    </>) : null}

                    {tab === 'callbacks' ? (
                      <div className="cl-pad">
                        {due.length ? (
                          <ul className="cl-cbs">
                            {due.map((c) => {
                              const name = nameOf(c);
                              const mins = Math.round((t - c.at) / 60000);
                              return (
                                <li key={c.id} className="cl-cb">
                                  <span className={'cl-dir cl-dir--' + c.dir}><Icon name={CALL_DIRS[c.dir].icon} width="16" height="16" aria-hidden="true" /></span>
                                  <span className="cl-cb__text">
                                    <span className="cl-cb__top"><b>{name || 'Unknown caller'}</b><span className="ib-sub ib-data">{fmtPhone(c.phone)}</span>{c.result === 'Callback needed' ? <span className="gc-badge gc-badge--info">Follow up {followText(c.followUp) || 'soon'}</span> : <SlaChip minutes={mins} />}</span>
                                    <span className="ib-sub">{c.result === 'Callback needed' ? `${c.reason} · promised by ${staffName(c.agent)}` : `${CALL_DIRS[c.dir].label} ${agoText(c.at, t)} · waited ${c.wait || 0}s${c.reason ? ' · ' + c.reason : ''}`}</span>
                                    {c.transcript && c.dir === 'voicemail' ? <span className="cl-quote">“{c.transcript.replace(/^[^:]+:\s*/, '')}”</span> : null}
                                  </span>
                                  <span className="cl-cb__acts">
                                    <InboxMenu label="Assign" button={({ toggle, open: o }) => <button type="button" className="ix-btn ix-btn--sm cl-assign" aria-expanded={o} onClick={toggle} aria-label={c.agent ? `Assigned to ${staffName(c.agent)}. Change` : 'Assign'}><StaffAvatar id={c.agent} size={20} /><Icon name="chevron-down" width="14" height="14" aria-hidden="true" /></button>}>
                                      {(close) => <><p className="ib-menu__head">Who calls back</p>{STAFF.map((s) => <MenuItem key={s.id} checked={c.agent === s.id} onClick={() => { patchCall(c.id, { agent: s.id }); toast(`${staffName(s.id)} will call back`); close(); }} hint={AGENT_STATUS[s.id === ME ? status : s.phone][0]}>{s.name}</MenuItem>)}</>}
                                    </InboxMenu>
                                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => markDone(c)}>Done</button>
                                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => startCall(c.phone, name, c.id)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call back</button>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : <EmptyState icon="phone-call" title="No callbacks waiting" />}
                        {taskGroups.length ? (<>
                          <h3 className="ix-section-title cl-sub">Call lists</h3>
                          <ul className="cl-cbs">
                            {taskGroups.map((l) => (
                              <li key={l.key} className="cl-cb">
                                <Icon name={CALL_SOURCES[l.source] || 'phone'} width="16" height="16" aria-hidden="true" className="cl-list__icon" />
                                <span className="cl-cb__text"><b>{l.reason}</b><span className="ib-sub">{l.n} {l.n === 1 ? 'customer' : 'customers'}{l.amount ? ' · ' + tk(l.amount) : ''} · from {l.source}</span></span>
                                <span className="cl-cb__acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setTab('tasks')}>Open</button></span>
                              </li>
                            ))}
                          </ul>
                        </>) : null}
                      </div>
                    ) : null}

                    {tab === 'tasks' ? (
                      <div className="cl-pad">
                        {!tasks ? <p className="cl-loading">Loading call tasks…</p> : openTasks.length ? (
                          <ul className="cl-cbs" aria-label="Call tasks">
                            {openTasks.map((x) => {
                              const later = x.snoozeUntil > t;
                              const late = !later && x.due < t;
                              return (
                                <li key={x.id} className="cl-cb">
                                  <Icon name={CALL_SOURCES[x.source] || 'phone'} width="16" height="16" aria-hidden="true" className="cl-list__icon" />
                                  <span className="cl-cb__text">
                                    <span className="cl-cb__top"><b>{x.customer.name}</b><span className="ib-sub ib-data">{fmtPhone(x.customer.phone)}</span>{x.priority === 'high' ? <span className="gc-badge gc-badge--error">High</span> : null}{later ? <span className="gc-badge gc-badge--info">Try again {whenText(x.snoozeUntil, t)}</span> : late ? <span className="gc-badge gc-badge--warning">Overdue</span> : null}</span>
                                    <span className="ib-sub">{x.reason}{x.amount ? ' · ' + tk(x.amount) : ''} · from {x.source}{x.attempts ? ` · ${x.attempts} ${x.attempts === 1 ? 'try' : 'tries'}` : ''}</span>
                                    {x.note || x.lastOutcome ? <span className="ib-sub">{[x.lastOutcome, x.note].filter(Boolean).join(' · ')}</span> : null}
                                  </span>
                                  <span className="cl-cb__acts">
                                    <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[
                                      { label: 'Open their chats', href: `/merchant-inbox?phone=${x.customer.phone}` },
                                      { label: 'Skip this task', onClick: () => { skipCallTask(x.id, `Skipped by ${staffName(ME)}`); toast('Task skipped', { undo: () => completeCallTask(x.id, { outcome: 'Call back later', retryInHours: 0 }) }); } },
                                    ]} />
                                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => startCall(x.customer.phone, x.customer.name, '', x)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</button>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : <EmptyState icon="list-checks" title="No call tasks" body="Tasks from Recovery, Accounts and Orders show here." />}
                        {(tasks || []).some((x) => x.status !== 'open') ? (<>
                          <h3 className="ix-section-title cl-sub">Done</h3>
                          <ul className="cl-cbs" aria-label="Done call tasks">
                            {(tasks || []).filter((x) => x.status !== 'open').slice(0, 5).map((x) => (
                              <li key={x.id} className="cl-cb">
                                <span className="cl-cb__text"><span className="cl-cb__top"><b>{x.customer.name}</b>{x.status === 'done' ? <span className="gc-badge gc-badge--success">{x.outcome}</span> : <span className="gc-badge gc-badge--slate">Skipped</span>}</span><span className="ib-sub">{x.reason} · {x.status === 'done' ? (x.by || '') : x.skipReason}</span></span>
                              </li>
                            ))}
                          </ul>
                        </>) : null}
                      </div>
                    ) : null}

                    {tab === 'recordings' ? (
                      <div className="cl-pad">
                        {recs.length ? (
                          <ul className="cl-recs">
                            {recs.map((c) => {
                              const on = playing && playing.id === c.id;
                              const pos = on ? playing.pos : 0;
                              const full = open.includes(c.id);
                              return (
                                <li key={c.id} className={'cl-rec' + (on ? ' is-on' : '')}>
                                  <button type="button" className="ix-btn ix-btn--icon cl-play" onClick={() => setPlaying(on ? null : { id: c.id, pos: 0 })} aria-label={(on ? 'Pause' : 'Play') + ` the recording with ${nameOf(c) || c.phone}`}><Icon name={on ? 'pause' : 'play'} width="16" height="16" /></button>
                                  <div className="cl-rec__body">
                                    <div className="cl-rec__top"><b>{nameOf(c) || fmtPhone(c.phone)}</b><span className="ib-sub">{CALL_DIRS[c.dir].label} · {whenText(c.at, t)} · {c.agent ? staffName(c.agent) : 'Voicemail box'}</span>{c.order ? <Link className="ib-link ib-data" href={orderHref(c.order, 'calls')}>{c.order}</Link> : null}</div>
                                    <div className="cl-track"><span className="gc-progress"><span className="gc-progress__fill" style={{ width: (c.dur ? (pos / c.dur) * 100 : 0) + '%' }} /></span><span className="ib-sub ib-data">{fmtDur(pos)} / {fmtDur(c.dur)}</span></div>
                                    {c.transcript ? <p className={'cl-transcript' + (full ? ' is-full' : '')}>{c.transcript}</p> : null}
                                    {c.transcript && c.transcript.length > 110 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain cl-more" aria-expanded={full} onClick={() => setOpen((x) => (full ? x.filter((y) => y !== c.id) : [...x, c.id]))}>{full ? 'Show less' : 'Show the transcript'}</button> : null}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : <EmptyState icon="audio-lines" title="No recordings yet" />}
                      </div>
                    ) : null}
                  </section>
                  <LearnMore topic="calls" />
                </div>

                <div className="ix-side cl-side">
                  {!small ? <section className="ix-card" id="cl-dialer" aria-label="Dialer"><header className="ix-card__head"><h2>Dialer</h2></header><div className="ix-card__body">{dialer}</div></section> : null}
                  <section className="ix-card" aria-label="Team availability">
                    <header className="ix-card__head">
                      <h2>Team on the phones</h2>
                      <InboxMenu label="My status" button={({ toggle, open: o }) => (
                        <button type="button" className="ix-btn ix-btn--sm" aria-expanded={o} onClick={toggle} aria-label={'Your status: ' + AGENT_STATUS[statusNow][0]}><span className={'ib-dot ib-dot--' + AGENT_STATUS[statusNow][1]} />{AGENT_STATUS[statusNow][0]}<Icon name="chevron-down" width="14" height="14" aria-hidden="true" /></button>
                      )}>
                        {(close) => <><p className="ib-menu__head">Your phone status</p>{['available', 'break', 'offline'].map((s) => <MenuItem key={s} checked={status === s} onClick={() => { changeStatus(s); close(); }}><span className={'ib-dot ib-dot--' + AGENT_STATUS[s][1]} /> {AGENT_STATUS[s][0]}</MenuItem>)}</>}
                      </InboxMenu>
                    </header>
                    <div className="ix-card__body">
                      <ul className="cl-agents">
                        {STAFF.map((s) => {
                          const st = s.id === ME ? statusNow : s.phone;
                          return (
                            <li key={s.id}>
                              <span className="cl-agent__av"><StaffAvatar id={s.id} size={28} /><span className={'ib-dot ib-dot--' + AGENT_STATUS[st][1]} /></span>
                              <span className="cl-agent__text"><b>{s.name}{s.id === ME ? ' (you)' : ''}</b><span className="ib-sub">{s.role} · {today.filter((c) => c.agent === s.id).length} calls today</span></span>
                              <span className="ix-muted cl-agent__st">{AGENT_STATUS[st][0]}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Sheet open={small && dialSheet} onClose={() => setDialSheet(false)} title="Dialer" variant="bottom"><div className="cl-sheetpad">{dialer}</div></Sheet>

      <Dialog open={!!outcome} title={outcome && outcome.edit ? 'Call outcome' : 'How did the call go?'} onClose={() => (outcome && outcome.edit ? setOutcome(null) : saveOutcome(true))} width={560}>
        {outcome ? (
          <form className="ib-form" onSubmit={(e) => {
            e.preventDefault();
            if (outcome.edit) {
              if (outcome.result === 'Callback needed' && !outcome.followUp) { toast('Pick the follow-up date for the callback', { tone: 'error' }); return; }
              patchCall(outcome.edit, { reason: outcome.reason, result: outcome.result, followUp: outcome.followUp, order: outcome.order, note: outcome.note, callback: outcome.result === 'Callback needed' ? 'due' : outcome.callback === 'due' && (outcome.dir === 'missed' || outcome.dir === 'voicemail') ? 'due' : outcome.callback });
              setOutcome(null); toast('Outcome saved'); return;
            }
            saveOutcome(false);
          }}>
            <div className="cl-sum"><Avatar name={outcome.name || outcome.phone} size={32} /><span><b>{outcome.name || fmtPhone(outcome.phone)}</b><span className="ib-sub"><span className="ib-data">{fmtPhone(outcome.phone)}</span> · {CALL_DIRS[outcome.dir].label} · {outcome.dur ? fmtDur(outcome.dur) : 'not connected'}{outcome.wait && outcome.dir !== 'out' ? ` · waited ${outcome.wait}s` : ''}{outcome.edit ? '' : ' · just now'}</span></span></div>
            <div className="ib-two">
              <div><label className="gc-label" htmlFor="oc-reason">Reason *</label><select id="oc-reason" className="gc-input gc-select" data-autofocus value={outcome.reason} onChange={(e) => setOutcome({ ...outcome, reason: e.target.value })}>{CALL_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="oc-result">Result *</label><select id="oc-result" className="gc-input gc-select" value={outcome.result} onChange={(e) => setOutcome({ ...outcome, result: e.target.value })}>{CALL_RESULTS.map((r) => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="ib-two">
              <div><label className="gc-label" htmlFor="oc-follow">Follow-up date{outcome.result === 'Callback needed' ? ' *' : ''}</label><input id="oc-follow" type="date" className="gc-input" value={outcome.followUp && /^\d{4}-/.test(outcome.followUp) ? outcome.followUp : ''} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setOutcome({ ...outcome, followUp: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="oc-order">Order</label><select id="oc-order" className="gc-input gc-select" value={outcome.order || ''} onChange={(e) => setOutcome({ ...outcome, order: e.target.value })}><option value="">No order</option>{ordersOf(outcome.phone).map((o) => <option key={o.id} value={o.id}>{o.id} · {o.status} · {o.total}</option>)}</select></div>
            </div>
            <div><label className="gc-label" htmlFor="oc-note">Note</label><textarea id="oc-note" className="gc-input" rows="3" value={outcome.note || ''} onChange={(e) => setOutcome({ ...outcome, note: e.target.value })} placeholder="What was agreed, for the next person who calls" /></div>
            {outcome.result === 'Callback needed' ? <p className="gc-help" style={{ margin: 0 }}>The call goes to the callback queue until someone calls back.</p> : null}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              {outcome.edit ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOutcome(null)}>Cancel</button> : <button type="button" className="gc-btn gc-btn--neutral" onClick={() => saveOutcome(true)}>Skip</button>}
              <button type="submit" className="gc-btn gc-btn--solid">Save outcome</button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}

/** "0:42" counting up from `at`. */
function Since({ at }) {
  const now = useNow(1000);
  return <span className="ib-data">{fmtDur(now ? (now - at) / 1000 : 0)}</span>;
}

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
function LiveCall({ live, setLive, onEnd, onTransfer, orders, person }) {
  const now = useNow(1000);
  const up = (patch) => setLive((l) => ({ ...l, ...patch }));
  const talk = live.state === 'live' && live.liveAt ? fmtDur(((now || Date.now()) - live.liveAt) / 1000) : '0:00';
  const lineName = (LINES.find((l) => l[0] === live.line) || LINES[0])[1];
  const stateText = live.state === 'ringing' ? `Calling… from ${lineName}` : live.hold ? `On hold · ${talk}` : `${live.dir === 'in' ? 'Incoming' : 'Outgoing'} · connected · ${talk}`;
  const name = live.name || (person && person.name) || fmtPhone(live.phone);
  const q = `?phone=${live.phone}&name=${encodeURIComponent(name)}`;
  return (
    <section className="ix-card cl-live" data-state={live.hold ? 'hold' : live.state} aria-label={`Call with ${name}`}>
      <div className="cl-live__head">
        <Avatar name={name} avatar={person && person.avatar} pos={person && person.pos} size={44} />
        <div className="cl-live__who">
          <h2 className="cl-live__name">{name}</h2>
          <p className="ib-sub"><span className="ib-data">{fmtPhone(live.phone)}</span>{person && person.meta ? ' · ' + person.meta : ''}</p>
          <p className="cl-live__state" aria-live="polite"><span className="cl-rec-dot" aria-hidden="true" />{stateText}{live.muted ? ' · muted' : ''}</p>
        </div>
        <span className="cl-wave" aria-hidden="true">{[10, 18, 26, 14, 22, 12, 20].map((h, i) => <i key={i} style={{ height: h, animationDelay: i * 0.12 + 's' }} />)}</span>
      </div>
      <div className="cl-live__controls">
        <button type="button" className="cl-ctl" aria-pressed={live.muted} onClick={() => up({ muted: !live.muted })}><Icon name={live.muted ? 'mic-off' : 'mic'} width="16" height="16" aria-hidden="true" />{live.muted ? 'Unmute' : 'Mute'}</button>
        <button type="button" className="cl-ctl" aria-pressed={live.hold} disabled={live.state !== 'live'} onClick={() => up({ hold: !live.hold })}><Icon name={live.hold ? 'play' : 'pause'} width="16" height="16" aria-hidden="true" />{live.hold ? 'Resume' : 'Hold'}</button>
        <button type="button" className="cl-ctl" aria-pressed={live.pad} onClick={() => up({ pad: !live.pad })}><Icon name="grid-3x3" width="16" height="16" aria-hidden="true" />Keypad</button>
        <InboxMenu label="Transfer to" up button={({ toggle, open }) => <button type="button" className="cl-ctl" aria-expanded={open} disabled={live.state !== 'live'} onClick={toggle}><Icon name="arrow-right-left" width="16" height="16" aria-hidden="true" />Transfer</button>}>
          {(close) => <><p className="ib-menu__head">Transfer to</p>{STAFF.filter((s) => s.id !== ME).map((s) => <MenuItem key={s.id} onClick={() => { close(); if (s.phone !== 'available') { toast(`${s.name} is ${AGENT_STATUS[s.phone][0].toLowerCase()} — pick someone available`, { tone: 'error' }); return; } onTransfer(s.id); }} hint={AGENT_STATUS[s.phone][0]}>{s.name}</MenuItem>)}</>}
        </InboxMenu>
        <Link className="cl-ctl" href={'/new-order' + q}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Order</Link>
        <button type="button" className="cl-ctl cl-ctl--end" onClick={onEnd}><Icon name="phone-off" width="16" height="16" aria-hidden="true" />End</button>
      </div>
      {live.pad ? (
        <div className="cl-dtmf">
          <span className="ib-data cl-dtmf__tones" aria-live="polite">{live.tones || 'Press keys for the menu'}</span>
          <div className="cl-dtmf__keys">{PAD.map((k) => <button key={k} type="button" onClick={() => up({ tones: (live.tones + k).slice(-16) })}>{k}</button>)}</div>
        </div>
      ) : null}
      <div className="cl-live__foot">
        <div className="cl-live__notes"><label className="gc-label" htmlFor="cl-note">Call notes</label><textarea id="cl-note" className="gc-input" rows="2" value={live.note} onChange={(e) => up({ note: e.target.value })} placeholder="Type while you talk — they go into the call log" /></div>
        <div className="cl-live__facts">
          <span className="gc-label">Customer</span>
          {orders.length ? (
            <span className="cl-fact"><b>{orders.length}</b> order{orders.length === 1 ? '' : 's'} · latest <Link className="ib-link ib-data" href={orderHref(orders[0].id, 'calls')}>{orders[0].id}</Link> <StatusBadge tone={orderTone(orders[0])}>{orders[0].status}</StatusBadge></span>
          ) : <span className="ib-sub">{person ? 'No orders from this number yet.' : 'Not in your customers yet.'}</span>}
          <Link className="ib-link cl-fact" href={`/merchant-inbox?phone=${live.phone}`}>Open their chats</Link>
        </div>
      </div>
    </section>
  );
}

const CSS = PARTS_CSS + DIALER_CSS + `
.cl .ib-form{display:flex;flex-direction:column;gap:var(--space-4)}
.cl .ib-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.cl .dl-dir{width:28px;height:28px}
/* calls ringing now */
.cl-ring{display:flex;flex-direction:column;overflow:hidden;border-radius:var(--radius-xl);background:var(--fill-success-soft);box-shadow:var(--shadow-card)}
.cl-ring__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:10px var(--space-4)}
.cl-ring__row+.cl-ring__row{border-top:1px solid color-mix(in srgb,var(--success) 25%,transparent)}
.cl-pulse{position:relative;display:inline-flex;border-radius:var(--radius-full)}
.cl-pulse::after{content:"";position:absolute;inset:-3px;border:2px solid var(--success);border-radius:var(--radius-full);animation:cl-pulse 1.6s ease-out infinite}
@keyframes cl-pulse{0%{opacity:.8;transform:scale(.9)}100%{opacity:0;transform:scale(1.35)}}
.cl-ring__text{flex:1 1 200px;min-width:0;display:flex;flex-direction:column}
.cl-ring__text b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cl-ring__acts{display:flex;gap:var(--space-2);margin-left:auto}
.cl-answer{border-color:var(--success);background:var(--success);color:var(--text-inverse)}
.cl-answer:hover{background:var(--success);color:var(--text-inverse);filter:brightness(.95)}
/* call log: a narrow card (the dialer beside it on a 1280px screen) shows the two-line list instead of the table */
.cl-card{container-type:inline-size}
@container (max-width:700px){
  .cl-card .ix-table-wrap{display:none}
  .cl-card .ix-plist{display:block}
}
.cl-loading{margin:0;padding:var(--space-8);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.cl-dircell{width:36px;padding-right:0!important}
.cl-dir{display:inline-flex;flex:none;align-items:center;vertical-align:middle;color:var(--text-body)}
.cl-dir--in{color:var(--text-success)}.cl-dir--out{color:var(--text-info)}.cl-dir--missed{color:var(--text-danger)}.cl-dir--voicemail{color:var(--text-warning)}
.ix-pitem__top .cl-dir{margin-right:6px}
.cl-pli{display:flex;align-items:center;gap:var(--space-1);padding-right:6px;border-bottom:1px solid var(--border-subtle)}
.ix-plist>li.cl-pli:last-child{border-bottom:0}
.cl-pli>.ix-pitem{flex:1;min-width:0;border-bottom:0}
/* callbacks and recordings */
.cl-pad{display:flex;flex-direction:column;padding:var(--space-3) var(--space-4) var(--space-4)}
.cl-sub{margin:var(--space-4) 0 var(--space-2)}
.cl-cbs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.cl-cb{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:10px 0;border-bottom:1px solid var(--border-subtle)}
.cl-cb:last-child{border-bottom:0}
.cl-cb__text{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px}
.cl-cb__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-cb__top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5) var(--space-2)}
.cl-quote{margin-top:2px;font-size:var(--text-sm);color:var(--text-body);font-style:italic;overflow-wrap:anywhere}
.cl-cb__acts{display:flex;align-items:center;gap:var(--space-2);margin-left:auto}
.cl-assign{gap:4px;padding:0 var(--space-2)}
.cl-list__icon{flex:none;color:var(--text-muted)}
.cl-recs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.cl-rec{display:flex;gap:var(--space-3);padding:10px 0;border-bottom:1px solid var(--border-subtle)}
.cl-rec:last-child{border-bottom:0}
.cl-rec.is-on .cl-play{border-color:var(--primary);background:var(--primary);color:var(--text-inverse)}
.cl-play{border-radius:var(--radius-full)}
.cl-rec__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-1-5)}
.cl-rec__top{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-1) var(--space-2)}
.cl-rec__top b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-track{display:flex;align-items:center;gap:var(--space-3)}
.cl-track .gc-progress{flex:1;height:6px}
.cl-transcript{margin:0;font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cl-transcript.is-full{display:block}
.cl-more{align-self:flex-start;margin-left:-10px}
/* the side: dialer and the team */
.cl-side{position:sticky;top:84px}
.cl-agents{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-3)}
.cl-agents li{display:flex;align-items:center;gap:var(--space-3)}
.cl-agent__av{position:relative;display:inline-flex}
.cl-agent__av .ib-dot{position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;box-shadow:0 0 0 2px var(--surface-card)}
.cl-agent__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cl-agent__text b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-agent__st{flex:none;font-size:var(--text-xs)}
.cl-sheetpad{padding:var(--space-4) var(--space-5) var(--space-6)}
.cl-sum{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-xl);background:var(--surface-page)}
.cl-sum>span{display:flex;flex-direction:column}
.cl-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
/* live call */
.cl-live{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);box-shadow:0 0 0 1px color-mix(in srgb,var(--primary) 30%,transparent),var(--shadow-card)}
.cl-live__head{display:flex;align-items:center;gap:var(--space-3)}
.cl-live__who{flex:1;min-width:0}
.cl-live__name{margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-live__who .ib-sub{margin:0}
.cl-live__state{display:flex;align-items:center;gap:var(--space-2);margin:2px 0 0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-success);font-variant-numeric:tabular-nums}
.cl-live[data-state="ringing"] .cl-live__state{color:var(--text-info)}
.cl-live[data-state="hold"] .cl-live__state{color:var(--text-warning)}
.cl-rec-dot{width:8px;height:8px;border-radius:var(--radius-full);background:var(--error);animation:cl-blink 1.2s ease-in-out infinite}
@keyframes cl-blink{50%{opacity:.3}}
.cl-wave{display:flex;align-items:center;gap:3px;height:28px;flex:none}
.cl-wave i{display:block;width:3px;border-radius:var(--radius-full);background:var(--success);animation:cl-wave 1s ease-in-out infinite alternate}
.cl-live[data-state="ringing"] .cl-wave i,.cl-live[data-state="hold"] .cl-wave i{animation:none;opacity:.35}
@keyframes cl-wave{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.cl-wave i,.cl-rec-dot,.cl-pulse::after{animation:none}}
.cl-live__controls{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--space-2)}
.cl-live__controls .ib-menu{display:flex}
.cl-live__controls .ib-menu>.cl-ctl{flex:1}
.cl-ctl{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:52px;padding:var(--space-2);border:0;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);font-size:var(--text-xs);font-weight:var(--weight-medium);text-decoration:none;cursor:pointer;transition:var(--transition-base)}
.cl-ctl:hover{background:var(--slate-200)}
.cl-ctl[aria-pressed="true"]{background:var(--primary);color:var(--text-inverse)}
.cl-ctl:disabled{opacity:.45;cursor:not-allowed}
.cl-ctl--end{background:var(--fill-danger);color:var(--text-inverse)}
.cl-ctl--end:hover{background:var(--error-focus)}
.cl-dtmf{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.cl-dtmf__tones{flex:1 1 140px;font-size:var(--text-sm);color:var(--text-body)}
.cl-dtmf__keys{display:grid;grid-template-columns:repeat(6,36px);gap:var(--space-1-5)}
.cl-dtmf__keys button{height:32px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.cl-live__foot{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--space-4)}
.cl-live__notes .gc-input{min-height:56px}
.cl-live__facts{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2)}
.cl-live__facts .gc-label{margin:0}
.cl-fact{display:inline-flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5);font-size:var(--text-sm);color:var(--text-body)}
.cl-fact b{font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1023px){
  .cl-side{position:static}
  .cl-live__foot{grid-template-columns:minmax(0,1fr)}
}
/* phones: the live call takes the whole screen, like a phone call */
@media (max-width:767px){
  .cl .ib-two{grid-template-columns:minmax(0,1fr)}
  .cl-live{position:fixed;inset:0;z-index:calc(var(--z-drawer) + 2);overflow-y:auto;border-radius:0;padding:var(--space-8) var(--space-5) var(--space-6)}
  .cl-live__head{flex-direction:column;text-align:center}
  .cl-live__state{justify-content:center}
  .cl-live__name{white-space:normal}
  .cl-live__controls{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
  .cl-ctl{min-height:64px}
  .cl-dtmf__keys{grid-template-columns:repeat(4,minmax(0,1fr));width:100%}
  .cl-ring__acts{width:100%}
  .cl-ring__acts .ix-btn{flex:1}
  .cl-cb__acts{width:100%}
  .cl-cb__acts .ix-btn--primary{flex:1}
}
@media (max-width:640px){
  .cl-pli .ix-menu .ix-btn{width:36px;height:36px}
}
`;
