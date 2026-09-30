'use client';
// MerchantCalls — the shop's phone desk: who is calling now, the live call (mute, hold, keypad,
// transfer, notes, create order, end), the outcome form after every call (reason, result, follow-up),
// the call log with filters, the callback queue for missed calls and voicemail, recordings with
// transcripts, today's numbers and who in the team is available.
// The dialer sits beside the log on desktop and opens as a bottom sheet on phones and tablets.
// Front end only: calls are kept in this browser (src/lib/inbox.js); names come from the customer
// book and the inbox, orders from src/lib/orders.js by phone number.
// URL: ?dial=01XXXXXXXXX&name=… puts the number in the dialer (the Inbox "Call" buttons use it).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState, Dialog, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getOrders, orderHref } from '@/lib/orders';
import { getCustomers } from '@/lib/customers';
import {
  ME, STAFF, CALL_DIRS, CALL_REASONS, CALL_RESULTS, RESULT_TONE, LINES, AGENT_STATUS, getCalls, addCall, patchCall, getConvs,
  getMyStatus, setMyStatus, staffName, ago, whenText, fmtDur, isToday, samePhone, phoneDigits,
} from '@/lib/inbox';
import { useInbox, useNow, useMedia, Avatar, StaffAvatar, SlaChip, Menu, MenuItem, Sheet, SearchBox, PARTS_CSS } from '@/components/inbox/parts';
import { Dialer, fmtPhone, DIALER_CSS } from '@/components/inbox/Dialer';

const LOG_TABS = [['all', 'All'], ['in', 'Incoming'], ['out', 'Outgoing'], ['missed', 'Missed'], ['voicemail', 'Voicemail']];
const PERIODS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['all', 'All time']];
const DAY = 24 * 3600 * 1000;
const CALL_LISTS = [
  { id: 'abandoned', icon: 'shopping-cart', title: 'Abandoned checkouts', meta: '6 customers · ৳38,200 at risk', phone: '01822771190', name: 'Tanvir Hasan' },
  { id: 'delivery', icon: 'truck', title: 'Delivery confirmation', meta: '3 customers · courier retry today', phone: '01711902244', name: 'Mostafizur Rahman' },
];
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
  const startCall = (phone, name, from = '') => {
    if (live) { toast('Finish the call you are on first', { tone: 'error' }); return; }
    const id = Date.now();
    setDialSheet(false);
    setLive({ id, phone, name: name || (personOf(phone) || {}).name || '', dir: 'out', line, state: 'ringing', start: Date.now(), liveAt: 0, wait: 0, from, muted: false, hold: false, pad: false, tones: '', note: '' });
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

  return (
    <div className="dc-screen ds cl" data-screen="MerchantCalls">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="calls" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)' }}>
          <Topbar crumb="Management" page="Calls" />
          <div className="gc-shell__content cl-content">
            <PageHeader
              title="Calls"
              description="Calls in and out of the shop’s numbers: answer, call back, log what happened and listen again."
              actions={<>
                <Menu label="My status" button={({ toggle, open: o }) => (
                  <button type="button" className="gc-btn gc-btn--neutral" aria-expanded={o} onClick={toggle}><span className={'ib-dot ib-dot--' + AGENT_STATUS[statusNow][1]} />{AGENT_STATUS[statusNow][0]}<Icon name="chevron-down" width="16" height="16" aria-hidden="true" /></button>
                )}>
                  {(close) => <><p className="ib-menu__head">Your phone status</p>{['available', 'break', 'offline'].map((s) => <MenuItem key={s} checked={status === s} onClick={() => { changeStatus(s); close(); }}><span className={'ib-dot ib-dot--' + AGENT_STATUS[s][1]} /> {AGENT_STATUS[s][0]}</MenuItem>)}</>}
                </Menu>
                <button type="button" className="gc-btn gc-btn--solid cl-dialbtn" onClick={() => setDialSheet(true)}><Icon name="grid-3x3" width="18" height="18" aria-hidden="true" />Dialer</button>
              </>}
            />

            {queue.length && !live ? (
              <section className="cl-ring" aria-label="Calls waiting">
                {queue.map((w, i) => (
                  <div key={w.id} className="cl-ring__row">
                    <span className="cl-pulse"><Avatar name={w.name} size={40} /></span>
                    <span className="cl-ring__text"><b>{w.name}</b><span className="ib-sub"><span className="ib-data">{fmtPhone(w.phone)}</span> · {w.ivr} · {i === 0 ? 'ringing' : 'waiting'} <Since at={w.since} /></span></span>
                    <span className="cl-ring__acts">
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => decline(w)}>Decline</button>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--success" onClick={() => answer(w)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Answer</button>
                    </span>
                  </div>
                ))}
              </section>
            ) : null}

            {live ? <LiveCall live={live} setLive={setLive} onEnd={end} onTransfer={transfer} orders={ordersOf(live.phone)} person={personOf(live.phone)} /> : null}

            <div className="gc-kpis gc-kpis--tight">
              <Kpi icon="phone" tone="primary" label="Calls today" value={calls ? today.length : '—'} note={`${inToday.length} in · ${today.filter((c) => c.dir === 'out').length} out`} />
              <Kpi icon="phone-incoming" tone="success" label="Answered" value={calls ? rate + '%' : '—'} note="of incoming today" />
              <Kpi icon="timer" tone="info" label="Average wait" value={calls ? wait + 's' : '—'} note="before answer" />
              <Kpi icon="phone-missed" tone="error" label="Missed today" value={calls ? missedToday.length : '—'} note="incl. voicemail" />
              <Kpi icon="phone-call" tone="warning" label="Callbacks due" value={calls ? due.length : '—'} note="waiting on us" />
            </div>

            <div className="cl-grid">
              <section className="gc-card cl-card" aria-label="Calls">
                <div className="cl-tabs" role="tablist" aria-label="Calls">
                  {[['log', 'Call log', log.length], ['callbacks', 'Callbacks', due.length], ['recordings', 'Recordings', recs.length]].map(([id, l, n]) => (
                    <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{l}<b>{calls ? n : ''}</b></button>
                  ))}
                </div>

                {tab === 'log' ? (
                  <>
                    <div className="cl-toolbar">
                      <div className="ib-scroll-x cl-dirs" role="group" aria-label="Direction">
                        {LOG_TABS.map(([v, l]) => <button key={v} type="button" className="ib-chip" aria-pressed={dir === v} onClick={() => setDir(v)}>{v !== 'all' ? <Icon name={CALL_DIRS[v].icon} width="14" height="14" aria-hidden="true" /> : null}{l}<b>{base.filter((c) => v === 'all' || c.dir === v).length}</b></button>)}
                      </div>
                      <div className="cl-toolbar__row">
                        <SearchBox value={q} onChange={setQ} placeholder="Search name, number, order" />
                        <select className="gc-input gc-select cl-fit" aria-label="Agent" value={agent} onChange={(e) => setAgent(e.target.value)}><option value="">All agents</option>{STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <select className="gc-input gc-select cl-fit" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>{PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                        <button type="button" className="gc-btn gc-btn--neutral cl-icononly" onClick={exportCsv} disabled={!log.length} aria-label="Export the calls shown as CSV" title="Export CSV"><Icon name="download" width="18" height="18" aria-hidden="true" /><span className="cl-lbl">Export</span></button>
                      </div>
                    </div>
                    {!calls ? <p className="cl-loading">Loading calls…</p> : log.length ? (
                      <div className="cl-log" role="table" aria-label="Call log">
                        <div className="cl-row cl-row--head" role="row"><span role="columnheader" className="cl-c-icon"><span className="sr-only">Type</span></span><span role="columnheader" className="cl-c-who">Caller</span><span role="columnheader" className="cl-c-when">When</span><span role="columnheader" className="cl-c-out">Outcome</span><span role="columnheader" className="cl-c-agent">Handled by</span><span role="columnheader" className="cl-c-act"><span className="sr-only">Actions</span></span></div>
                        {log.map((c) => {
                          const d = CALL_DIRS[c.dir];
                          const name = nameOf(c);
                          return (
                            <div key={c.id} className="cl-row" role="row">
                              <span role="cell" className="cl-c-icon"><span className={'dl-dir dl-dir--' + c.dir} title={d.label}><Icon name={d.icon} width="16" height="16" aria-hidden="true" /><span className="sr-only">{d.label}</span></span></span>
                              <span role="cell" className="cl-c-who"><b>{name || 'Unknown caller'}</b><span className="ib-sub ib-data">{fmtPhone(c.phone)}</span></span>
                              <span role="cell" className="cl-c-when"><span>{whenText(c.at, t)}</span><span className="ib-sub">{c.dur ? fmtDur(c.dur) : d.label}{c.wait && c.dir !== 'out' ? ` · waited ${c.wait}s` : ''}</span></span>
                              <span role="cell" className="cl-c-out">
                                {c.result ? <span className={'gc-badge gc-badge--' + (RESULT_TONE[c.result] || 'slate')}>{c.result}</span> : isDue(c) ? <span className="gc-badge gc-badge--warning">Callback due</span> : c.callback === 'done' ? <span className="gc-badge gc-badge--success">Called back</span> : <span className="ib-sub">No outcome</span>}
                                <span className="ib-sub">{[c.reason, c.followUp ? 'follow up ' + followText(c.followUp) : ''].filter(Boolean).join(' · ')}</span>
                              </span>
                              <span role="cell" className="cl-c-agent">
                                <span className="cl-agent"><StaffAvatar id={c.agent} size={22} /><span>{c.agent ? staffName(c.agent).split(' ')[0] : 'Nobody'}</span></span>
                                {c.order ? <Link className="ib-link ib-data cl-order" href={orderHref(c.order, 'calls')}>{c.order}</Link> : null}
                              </span>
                              <span role="cell" className="cl-c-act">
                                {c.rec && c.dur ? <button type="button" className="gc-iconbtn" aria-label={`Play the recording of the call with ${name || c.phone}`} title="Play recording" onClick={() => { setTab('recordings'); setPlaying({ id: c.id, pos: 0 }); }}><Icon name="audio-lines" width="18" height="18" /></button> : null}
                                <button type="button" className="gc-iconbtn dl-go" aria-label={`Call ${name || c.phone}`} title="Call" onClick={() => startCall(c.phone, name, isDue(c) ? c.id : '')}><Icon name="phone" width="16" height="16" /></button>
                                <Menu label="More" button={({ toggle, open: o }) => <button type="button" className="gc-iconbtn" aria-expanded={o} onClick={toggle} aria-label={`More for call ${c.id}`}><Icon name="more-vertical" width="18" height="18" /></button>}>
                                  {(close) => (
                                    <>
                                      <Link className="gc-dropdown__item" role="menuitem" href={`/merchant-inbox?phone=${c.phone}`}><Icon name="messages-square" width="16" height="16" aria-hidden="true" />Open their chats</Link>
                                      <Link className="gc-dropdown__item" role="menuitem" href={`/new-order?phone=${c.phone}&name=${encodeURIComponent(name)}`}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Create an order</Link>
                                      <MenuItem icon="notebook-pen" onClick={() => { close(); setOutcome({ ...c, name, edit: c.id, followUp: c.followUp || '', reason: c.reason || CALL_REASONS[0], result: c.result || CALL_RESULTS[0] }); }}>{c.result ? 'Edit the outcome' : 'Log the outcome'}</MenuItem>
                                      {isDue(c) ? <MenuItem icon="check" onClick={() => { markDone(c); close(); }}>Mark callback done</MenuItem> : null}
                                    </>
                                  )}
                                </Menu>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : <EmptyState icon="phone-off" title="No calls match" body="Try another period, direction or agent, or clear the search." actionLabel="Show all calls" onAction={() => { setDir('all'); setQ(''); setAgent(''); setPeriod('all'); }} />}
                  </>
                ) : null}

                {tab === 'callbacks' ? (
                  <div className="cl-pad">
                    {due.length ? (
                      <ul className="cl-cbs">
                        {due.map((c) => {
                          const name = nameOf(c);
                          const mins = Math.round((t - c.at) / 60000);
                          return (
                            <li key={c.id} className="cl-cb">
                              <span className={'dl-dir dl-dir--' + c.dir}><Icon name={CALL_DIRS[c.dir].icon} width="16" height="16" aria-hidden="true" /></span>
                              <span className="cl-cb__text">
                                <span className="cl-cb__top"><b>{name || 'Unknown caller'}</b><span className="ib-sub ib-data">{fmtPhone(c.phone)}</span>{c.result === 'Callback needed' ? <span className="gc-badge gc-badge--info">Follow up {followText(c.followUp) || 'soon'}</span> : <SlaChip minutes={mins} />}</span>
                                <span className="ib-sub">{c.result === 'Callback needed' ? `${c.reason} · promised by ${staffName(c.agent)}` : `${CALL_DIRS[c.dir].label} ${agoText(c.at, t)} · waited ${c.wait || 0}s${c.reason ? ' · ' + c.reason : ''}`}</span>
                                {c.transcript && c.dir === 'voicemail' ? <span className="cl-quote">“{c.transcript.replace(/^[^:]+:\s*/, '')}”</span> : null}
                              </span>
                              <span className="cl-cb__acts">
                                <Menu label="Assign" button={({ toggle, open: o }) => <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral cl-assign" aria-expanded={o} onClick={toggle} aria-label={c.agent ? `Assigned to ${staffName(c.agent)}. Change` : 'Assign'}><StaffAvatar id={c.agent} size={22} /><Icon name="chevron-down" width="14" height="14" aria-hidden="true" /></button>}>
                                  {(close) => <><p className="ib-menu__head">Who calls back</p>{STAFF.map((s) => <MenuItem key={s.id} checked={c.agent === s.id} onClick={() => { patchCall(c.id, { agent: s.id }); toast(`${staffName(s.id)} will call back`); close(); }} hint={AGENT_STATUS[s.id === ME ? status : s.phone][0]}>{s.name}</MenuItem>)}</>}
                                </Menu>
                                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => markDone(c)}>Done</button>
                                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--success" onClick={() => startCall(c.phone, name, c.id)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call back</button>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : <EmptyState icon="phone-call" title="No callbacks waiting" body="Missed calls, voicemail and promised follow-ups show here until someone calls back." />}
                    <h3 className="ib-h3 cl-sub">Call lists</h3>
                    <ul className="cl-cbs">
                      {CALL_LISTS.map((l) => (
                        <li key={l.id} className="cl-cb">
                          <span className="cl-list__icon"><Icon name={l.icon} width="18" height="18" aria-hidden="true" /></span>
                          <span className="cl-cb__text"><b>{l.title}</b><span className="ib-sub">{l.meta}</span></span>
                          <span className="cl-cb__acts"><button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => { startCall(l.phone, l.name); toast(`${l.title}: calling 1 of ${l.meta.split(' ')[0]}`, { tone: 'info' }); }}>Start calling</button></span>
                        </li>
                      ))}
                    </ul>
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
                              <button type="button" className="cl-play" onClick={() => setPlaying(on ? null : { id: c.id, pos: 0 })} aria-label={(on ? 'Pause' : 'Play') + ` the recording with ${nameOf(c) || c.phone}`}><Icon name={on ? 'pause' : 'play'} width="18" height="18" /></button>
                              <div className="cl-rec__body">
                                <div className="cl-rec__top"><b>{nameOf(c) || fmtPhone(c.phone)}</b><span className="ib-sub">{CALL_DIRS[c.dir].label} · {whenText(c.at, t)} · {c.agent ? staffName(c.agent) : 'Voicemail box'}</span>{c.order ? <Link className="ib-link ib-data" href={orderHref(c.order, 'calls')}>{c.order}</Link> : null}</div>
                                <div className="cl-track"><span className="gc-progress"><span className="gc-progress__fill" style={{ width: (c.dur ? (pos / c.dur) * 100 : 0) + '%' }} /></span><span className="ib-sub ib-data">{fmtDur(pos)} / {fmtDur(c.dur)}</span></div>
                                {c.transcript ? (
                                  <p className={'cl-transcript' + (full ? ' is-full' : '')}>{c.transcript}</p>
                                ) : null}
                                {c.transcript && c.transcript.length > 110 ? <button type="button" className="gc-btn gc-btn--xs gc-btn--flat cl-more" aria-expanded={full} onClick={() => setOpen((x) => (full ? x.filter((y) => y !== c.id) : [...x, c.id]))}>{full ? 'Show less' : 'Show the transcript'}</button> : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : <EmptyState icon="audio-lines" title="No recordings yet" body="Answered calls are recorded and listed here with a transcript." />}
                  </div>
                ) : null}
              </section>

              <div className="cl-side">
                {!small ? <section className="gc-card cl-box" aria-label="Dialer"><h2 className="ib-h2">Dialer</h2>{dialer}</section> : null}
                <section className="gc-card cl-box" aria-label="Team availability">
                  <div className="cl-box__head"><h2 className="ib-h2">Team on the phones</h2><span className="ib-sub">{STAFF.filter((s) => (s.id === ME ? statusNow : s.phone) === 'available').length} available</span></div>
                  <ul className="cl-agents">
                    {STAFF.map((s) => {
                      const st = s.id === ME ? statusNow : s.phone;
                      return (
                        <li key={s.id}>
                          <span className="cl-agent__av"><StaffAvatar id={s.id} size={32} /><span className={'ib-dot ib-dot--' + AGENT_STATUS[st][1]} /></span>
                          <span className="cl-agent__text"><b>{s.name}{s.id === ME ? ' (you)' : ''}</b><span className="ib-sub">{s.role} · {today.filter((c) => c.agent === s.id).length} calls today</span></span>
                          <span className={'gc-badge gc-badge--' + AGENT_STATUS[st][1]}>{AGENT_STATUS[st][0]}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {!queue.length ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral gc-btn--block" onClick={simulate}><Icon name="phone-incoming" width="16" height="16" aria-hidden="true" />Simulate an incoming call</button> : null}
                </section>
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
            <div className="cl-sum"><Avatar name={outcome.name || outcome.phone} size={40} /><span><b>{outcome.name || fmtPhone(outcome.phone)}</b><span className="ib-sub">{CALL_DIRS[outcome.dir].label} · {outcome.dur ? fmtDur(outcome.dur) : 'not connected'}{outcome.edit ? '' : ' · just now'}</span></span></div>
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

function Kpi({ icon, tone, label, value, note }) {
  const bg = { primary: 'var(--fill-primary-soft)', success: 'var(--fill-success-soft)', info: 'var(--fill-info-soft)', error: 'var(--fill-error-soft)', warning: 'var(--fill-warning-soft)' }[tone];
  const fg = { primary: 'var(--primary)', success: 'var(--text-success)', info: 'var(--text-info)', error: 'var(--text-danger)', warning: 'var(--text-warning)' }[tone];
  return <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">{label}</p><p className="gc-kpi__value">{value}<small>{note}</small></p></div></div>;
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
    <section className="gc-card cl-live" data-state={live.hold ? 'hold' : live.state} aria-label={`Call with ${name}`}>
      <div className="cl-live__head">
        <Avatar name={name} avatar={person && person.avatar} pos={person && person.pos} size={56} />
        <div className="cl-live__who">
          <h2 className="cl-live__name">{name}</h2>
          <p className="ib-sub"><span className="ib-data">{fmtPhone(live.phone)}</span>{person && person.meta ? ' · ' + person.meta : ''}</p>
          <p className="cl-live__state" aria-live="polite"><span className="cl-rec-dot" aria-hidden="true" />{stateText}{live.muted ? ' · muted' : ''}</p>
        </div>
        <span className="cl-wave" aria-hidden="true">{[10, 18, 26, 14, 22, 12, 20].map((h, i) => <i key={i} style={{ height: h, animationDelay: i * 0.12 + 's' }} />)}</span>
      </div>
      <div className="cl-live__controls">
        <button type="button" className="cl-ctl" aria-pressed={live.muted} onClick={() => up({ muted: !live.muted })}><Icon name={live.muted ? 'mic-off' : 'mic'} width="20" height="20" aria-hidden="true" />{live.muted ? 'Unmute' : 'Mute'}</button>
        <button type="button" className="cl-ctl" aria-pressed={live.hold} disabled={live.state !== 'live'} onClick={() => up({ hold: !live.hold })}><Icon name={live.hold ? 'play' : 'pause'} width="20" height="20" aria-hidden="true" />{live.hold ? 'Resume' : 'Hold'}</button>
        <button type="button" className="cl-ctl" aria-pressed={live.pad} onClick={() => up({ pad: !live.pad })}><Icon name="grid-3x3" width="20" height="20" aria-hidden="true" />Keypad</button>
        <Menu label="Transfer to" up button={({ toggle, open }) => <button type="button" className="cl-ctl" aria-expanded={open} disabled={live.state !== 'live'} onClick={toggle}><Icon name="arrow-right-left" width="20" height="20" aria-hidden="true" />Transfer</button>}>
          {(close) => <><p className="ib-menu__head">Transfer to</p>{STAFF.filter((s) => s.id !== ME).map((s) => <MenuItem key={s.id} onClick={() => { close(); if (s.phone !== 'available') { toast(`${s.name} is ${AGENT_STATUS[s.phone][0].toLowerCase()} — pick someone available`, { tone: 'error' }); return; } onTransfer(s.id); }} hint={AGENT_STATUS[s.phone][0]}>{s.name}</MenuItem>)}</>}
        </Menu>
        <Link className="cl-ctl" href={'/new-order' + q}><Icon name="shopping-bag" width="20" height="20" aria-hidden="true" />Order</Link>
        <button type="button" className="cl-ctl cl-ctl--end" onClick={onEnd}><Icon name="phone-off" width="20" height="20" aria-hidden="true" />End</button>
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
            <>
              <span className="cl-fact"><b>{orders.length}</b> order{orders.length === 1 ? '' : 's'} · latest <Link className="ib-link ib-data" href={orderHref(orders[0].id, 'calls')}>{orders[0].id}</Link> <StatusBadge tone={orderTone(orders[0])}>{orders[0].status}</StatusBadge></span>
            </>
          ) : <span className="ib-sub">{person ? 'No orders from this number yet.' : 'Not in your customers yet.'}</span>}
          <Link className="ib-link cl-fact" href={`/merchant-inbox?phone=${live.phone}`}>Open their chats</Link>
        </div>
      </div>
    </section>
  );
}

const CSS = PARTS_CSS + DIALER_CSS + `
.cl-content{display:flex;flex-direction:column;gap:var(--space-5)}
.cl .ib-form{display:flex;flex-direction:column;gap:var(--space-4)}
.cl .ib-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.cl-dialbtn{display:none}
.cl-ring{display:flex;flex-direction:column;overflow:hidden;border:1px solid color-mix(in srgb,var(--success) 40%,transparent);border-radius:var(--radius-xl);background:var(--fill-success-soft)}
.cl-ring__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.cl-ring__row+.cl-ring__row{border-top:1px solid color-mix(in srgb,var(--success) 25%,transparent)}
.cl-pulse{position:relative;display:inline-flex;border-radius:var(--radius-full)}
.cl-pulse::after{content:"";position:absolute;inset:-4px;border:2px solid var(--success);border-radius:var(--radius-full);animation:cl-pulse 1.6s ease-out infinite}
@keyframes cl-pulse{0%{opacity:.8;transform:scale(.9)}100%{opacity:0;transform:scale(1.35)}}
.cl-ring__text{flex:1 1 200px;min-width:0;display:flex;flex-direction:column}
.cl-ring__text b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cl-ring__acts{display:flex;gap:var(--space-2);margin-left:auto}
.cl-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,360px);gap:var(--space-5);align-items:start}
.cl-card{container-type:inline-size}
.cl-tabs{display:flex;overflow-x:auto;padding:0 var(--space-3);border-bottom:1px solid var(--border-subtle);scrollbar-width:none}
.cl-tabs b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cl-tabs .gc-tab--active b{color:var(--primary)}
.cl-toolbar{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.cl-toolbar__row{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cl-toolbar__row .ib-search{flex:1 1 220px}
.cl-fit{width:auto;flex:0 1 auto;min-width:0}
.cl-loading{margin:0;padding:var(--space-8);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.cl-log{display:flex;flex-direction:column;border-top:1px solid var(--border-subtle)}
.cl-row{display:grid;grid-template-columns:32px minmax(140px,1.3fr) minmax(120px,1fr) minmax(130px,1.2fr) minmax(110px,.9fr) auto;grid-template-areas:"icon who when out agent act";align-items:center;gap:var(--space-2) var(--space-4);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.cl-row:last-child{border-bottom:0}
.cl-row:not(.cl-row--head):hover{background:var(--surface-page)}
.cl-row--head{padding-top:var(--space-2);padding-bottom:var(--space-2);background:var(--surface-page);font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted)}
.cl-c-icon{grid-area:icon}.cl-c-who{grid-area:who}.cl-c-when{grid-area:when}.cl-c-out{grid-area:out}.cl-c-agent{grid-area:agent}.cl-c-act{grid-area:act}
.cl-c-who,.cl-c-when,.cl-c-out,.cl-c-agent{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.cl-c-who b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-c-out .ib-sub,.cl-c-when .ib-sub{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-c-act{display:flex;align-items:center;justify-content:flex-end;gap:2px}
.cl-agent{display:inline-flex;align-items:center;gap:var(--space-1-5)}
.cl-order{font-size:var(--text-xs)}
@container (max-width:680px){
  .cl-row{grid-template-columns:32px minmax(0,1fr) auto;grid-template-areas:"icon who when" ". out out" ". agent act";padding:var(--space-3) var(--space-4);row-gap:var(--space-1-5)}
  .cl-row--head{display:none}
  .cl-c-when{align-items:flex-end;text-align:right}
  .cl-c-out{flex-direction:row;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
  .cl-c-agent{flex-direction:row;align-items:center;gap:var(--space-3)}
  .cl-toolbar{padding:var(--space-3) var(--space-4)}
  .cl-lbl{display:none}
  .cl-icononly{width:44px;padding:0}
}
.cl-pad{padding:var(--space-4) var(--space-5) var(--space-5)}
.cl-sub{margin:var(--space-5) 0 var(--space-2)}
.cl-cbs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2)}
.cl-cb{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.cl-cb__text{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px}
.cl-cb__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-cb__top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5) var(--space-2)}
.cl-quote{margin-top:2px;font-size:var(--text-sm);color:var(--text-body);font-style:italic;overflow-wrap:anywhere}
.cl-cb__acts{display:flex;align-items:center;gap:var(--space-2);margin-left:auto}
.cl-assign{gap:4px;padding:0 var(--space-2)}
.cl-list__icon{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.cl-recs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2)}
.cl-rec{display:flex;gap:var(--space-3);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.cl-rec.is-on{border-color:color-mix(in srgb,var(--primary) 45%,transparent);background:var(--fill-primary-soft)}
.cl-play{display:grid;place-items:center;flex:none;width:40px;height:40px;border:0;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);cursor:pointer}
.cl-play:hover{background:var(--primary-focus)}
.cl-rec__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-1-5)}
.cl-rec__top{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-1) var(--space-2)}
.cl-rec__top b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-track{display:flex;align-items:center;gap:var(--space-3)}
.cl-track .gc-progress{flex:1;height:6px}
.cl-transcript{margin:0;font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cl-transcript.is-full{display:block}
.cl-more{align-self:flex-start;margin-left:calc(var(--space-2) * -1)}
.cl-side{display:flex;flex-direction:column;gap:var(--space-5);position:sticky;top:84px}
.cl-box{gap:var(--space-4);padding:var(--space-5)}
.cl-box__head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2)}
.cl-agents{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-3)}
.cl-agents li{display:flex;align-items:center;gap:var(--space-3)}
.cl-agent__av{position:relative;display:inline-flex}
.cl-agent__av .ib-dot{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;box-shadow:0 0 0 2px var(--surface-card)}
.cl-agent__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cl-agent__text b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-sheetpad{padding:var(--space-4) var(--space-5) var(--space-6)}
.cl-sum{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-xl);background:var(--surface-page)}
.cl-sum>span{display:flex;flex-direction:column}
.cl-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
/* live call */
.cl-live{gap:var(--space-4);padding:var(--space-5);border:1px solid color-mix(in srgb,var(--primary) 30%,transparent)}
.cl-live__head{display:flex;align-items:center;gap:var(--space-4)}
.cl-live__who{flex:1;min-width:0}
.cl-live__name{margin:0;font-size:var(--text-xl);line-height:var(--text-xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-live__who .ib-sub{margin:0}
.cl-live__state{display:flex;align-items:center;gap:var(--space-2);margin:var(--space-1) 0 0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-success);font-variant-numeric:tabular-nums}
.cl-live[data-state="ringing"] .cl-live__state{color:var(--text-info)}
.cl-live[data-state="hold"] .cl-live__state{color:var(--text-warning)}
.cl-rec-dot{width:8px;height:8px;border-radius:var(--radius-full);background:var(--error);animation:cl-blink 1.2s ease-in-out infinite}
@keyframes cl-blink{50%{opacity:.3}}
.cl-wave{display:flex;align-items:center;gap:3px;height:32px;flex:none}
.cl-wave i{display:block;width:4px;border-radius:var(--radius-full);background:var(--success);animation:cl-wave 1s ease-in-out infinite alternate}
.cl-live[data-state="ringing"] .cl-wave i,.cl-live[data-state="hold"] .cl-wave i{animation:none;opacity:.35}
@keyframes cl-wave{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.cl-wave i,.cl-rec-dot,.cl-pulse::after{animation:none}}
.cl-live__controls{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--space-2)}
.cl-live__controls .ib-menu{display:flex}
.cl-live__controls .ib-menu>.cl-ctl{flex:1}
.cl-ctl{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:64px;padding:var(--space-2);border:0;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);font-size:var(--text-xs);font-weight:var(--weight-medium);text-decoration:none;cursor:pointer;transition:var(--transition-base)}
.cl-ctl:hover{background:var(--slate-200)}
.cl-ctl[aria-pressed="true"]{background:var(--primary);color:var(--text-inverse)}
.cl-ctl:disabled{opacity:.45;cursor:not-allowed}
.cl-ctl--end{background:var(--fill-danger);color:var(--text-inverse)}
.cl-ctl--end:hover{background:var(--error-focus)}
.cl-dtmf{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.cl-dtmf__tones{flex:1 1 140px;font-size:var(--text-sm);color:var(--text-body)}
.cl-dtmf__keys{display:grid;grid-template-columns:repeat(6,40px);gap:var(--space-1-5)}
.cl-dtmf__keys button{height:36px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card);font-size:var(--text-sm-plus);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.cl-live__foot{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--space-4)}
.cl-live__notes .gc-input{min-height:64px}
.cl-live__facts{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2)}
.cl-live__facts .gc-label{margin:0}
.cl-fact{display:inline-flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5);font-size:var(--text-sm);color:var(--text-body)}
.cl-fact b{font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1279px){.cl-grid{grid-template-columns:minmax(0,1fr) minmax(280px,320px)}}
@media (max-width:1023px){
  .cl-grid{grid-template-columns:minmax(0,1fr)}
  .cl-side{position:static}
  .cl-dialbtn{display:inline-flex}
  .cl-live__foot{grid-template-columns:minmax(0,1fr)}
}
/* phones: the live call takes the whole screen, like a phone call */
@media (max-width:767px){
  .cl .ib-two{grid-template-columns:minmax(0,1fr)}
  .cl-live{position:fixed;inset:0;z-index:calc(var(--z-drawer) + 2);overflow-y:auto;border:0;border-radius:0;padding:var(--space-8) var(--space-5) var(--space-6)}
  .cl-live__head{flex-direction:column;text-align:center}
  .cl-live__state{justify-content:center}
  .cl-live__name{white-space:normal}
  .cl-live__controls{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
  .cl-ctl{min-height:72px}
  .cl-dtmf__keys{grid-template-columns:repeat(4,minmax(0,1fr));width:100%}
  .cl-ring__acts{width:100%}
  .cl-ring__acts .gc-btn{flex:1}
  .cl-cb__acts{width:100%}
  .cl-cb__acts .gc-btn--success{flex:1}
  .cl-pad{padding:var(--space-3) var(--space-4) var(--space-4)}
  .cl-rec{padding:var(--space-3)}
  .gc-pagehead__actions>.ib-menu{flex:1}
  .gc-pagehead__actions>.ib-menu>.gc-btn,.cl-dialbtn{flex:1}
}
`;
