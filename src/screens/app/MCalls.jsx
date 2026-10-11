'use client';
// Merchant app · Calls (/m-calls). The design board's layout (design/templates/app/MCalls.dc.html) with the shop's
// own call desk (lib/inbox.js calls, lib/callTasks.js), the same data as the web Calls page (/merchant-calls):
//   availability   Available / Break (inbox.setMyStatus; "On a call" while one is on)
//   ringing        the caller waiting (demo queue, once a visit, as the web): Decline → callback queue, Answer → the call
//                  screen; while a call is on, the card says so and returns to it
//   Call back      missed calls and voicemails not called back, "Callback needed" outcomes and the call tasks other
//                  areas asked for (Recovery, Accounts, Orders) — the green button calls
//   Recent         the latest calls with their outcome; See all opens the whole log with direction chips
//   a call         tap: when, length, line, who took it, reason, result, order, transcript; Call back, Log the
//                  outcome, Mark callback done, Open chat, Create order
//   dial pad       the green button: keypad or a customer, and the line to call from (web components/inbox/Dialer.jsx)
// Settings (the gear) are /m-call-settings. Everything is read after mount and again on gc:inbox.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppScreen, AppBar, Content, Card, Chips, Sheet, Button, IconButton, EmptyState, Skeleton, Note,
  useAppData, toast, dateText,
} from './kit/AppKit';
import {
  ME, AGENT_STATUS, CALL_DIRS, LINES, getCalls, getConvs, getMyStatus, setMyStatus, patchCall, staffName, fmtDur, whenText, ago,
} from '@/lib/inbox';
import { openCallTasks, CALL_TASK_EVENT, startCallTask } from '@/lib/callTasks';
import { getOrders } from '@/lib/orders';
import { Face, XIcon, DialPadGlyph, NoAccess, useNow } from './messages/msgParts';
import { CallRow, OutcomePill, OutcomeSheet, DialSheet } from './messages/CallParts';
import {
  access, isDue, fmtPhone, factsOf, convOfPhone, callBook, getRinging, dropRinging, declineCall, startCall, liveNow, getLiveCall,
} from './messages/msgData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const DIR_CHIPS = [['all', 'All'], ['missed', 'Missed'], ['in', 'Incoming'], ['out', 'Outgoing'], ['voicemail', 'Voicemail']];
const PHONE = 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z';
const PhoneGlyph = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PHONE} /></svg>;

export default function MCallsScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData([CALL_TASK_EVENT], { every: 15000 });
  const now = useNow(1000);
  const [all, setAll] = useState(false);
  const [dir, setDir] = useState('all');
  const [dial, setDial] = useState(false);
  const [open, setOpen] = useState(null);       // a call row
  const [task, setTask] = useState(null);       // a call task
  const [outcome, setOutcome] = useState(null); // editing a call's outcome
  const [playing, setPlaying] = useState(0);
  const [allDue, setAllDue] = useState(false);

  const data = useMemo(() => {
    if (!ready) return null;
    const calls = safe(() => getCalls(), []);
    const convs = safe(() => getConvs(), []);
    const orders = safe(() => getOrders(), []);
    const book = callBook(convs);
    const nameOf = (c) => c.name || (book.find((p) => p.phone && String(p.phone).replace(/\D/g, '').endsWith(String(c.phone).replace(/\D/g, '').slice(-10))) || {}).name || '';
    return {
      calls, convs, orders, book, nameOf,
      due: calls.filter(isDue).sort((a, b) => a.at - b.at),
      tasks: safe(() => openCallTasks(), []),
      status: safe(() => getMyStatus(), 'available'),
      ringing: safe(() => getRinging(), []),
    };
  }, [ready, tick]);
  const live = ready ? liveNow(now || Date.now()) : null;

  if (ctx && !access('/m-calls', ctx)) {
    return (
      <AppScreen name="MCalls" title="Calls">
        <AppBar title="Calls" back="/m-more" />
        <Content top={103}><NoAccess title="Calls aren’t part of your access in this edition." /></Content>
      </AppScreen>
    );
  }

  const t = now || Date.now();
  const status = live ? 'on-call' : data ? data.status : 'available';
  const setStatus = (s) => { setMyStatus(s); toast(`You are ${AGENT_STATUS[s][0].toLowerCase()}`); };
  const go = (call) => {
    if (!startCall(call)) { toast('Finish the call you are on first', { tone: 'error' }); router.push('/m-call-active'); return; }
    router.push('/m-call-active');
  };
  const callBack = (c) => { setOpen(null); go({ phone: c.phone, name: data.nameOf(c), dir: 'out', from: isDue(c) ? c.id : '', reason: c.reason || '', line: c.line || 'support', back: '/m-calls' }); };
  const callTask = (k) => { setTask(null); startCallTask(k.id, staffName(ME)); go({ phone: k.customer.phone, name: k.customer.name, dir: 'out', task: k.id, reason: k.source === 'Accounts' ? 'Payment' : k.source === 'Orders' ? 'Delivery' : 'Other', note: k.reason, back: '/m-calls' }); };
  const answer = (w) => {
    if (getLiveCall()) { toast('Finish the call you are on first', { tone: 'error' }); return; }
    startCall({ phone: w.phone, name: w.name, dir: 'in', reason: w.ivr, wait: Math.max(0, Math.round((Date.now() - w.since) / 1000)), start: w.since, back: '/m-calls' });
    dropRinging(w.id);
    router.push('/m-call-active');
  };
  const decline = (w) => { declineCall(w); toast(`${w.name} sent to the callback queue`); };
  const markDone = (c) => {
    patchCall(c.id, { callback: 'done', doneAt: Date.now() });
    setOpen(null);
    toast(`Callback for ${data.nameOf(c) || fmtPhone(c.phone)} done`, { undo: () => patchCall(c.id, { callback: c.callback || 'due', doneAt: null }) });
  };
  const saveEdit = (o, skip) => {
    const c = outcome;
    if (!skip) patchCall(c.id, { reason: o.reason, result: o.result, followUp: o.followUp, order: o.order, note: (o.note || '').trim(), callback: o.result === 'Callback needed' ? 'due' : c.callback === 'due' && c.dir !== 'missed' && c.dir !== 'voicemail' ? '' : c.callback });
    setOutcome(null);
    if (!skip) toast(`Call saved · ${o.result}`);
  };

  const ringer = data && !live ? data.ringing[0] : null;
  const ringPerson = ringer ? factsOf(ringer.phone, data.orders) : null;
  const ringConv = ringer ? convOfPhone(ringer.phone, data.convs) : null;
  const waiting = data ? data.due.length + data.tasks.length : 0;
  const log = data ? data.calls.filter((c) => dir === 'all' || c.dir === dir) : [];
  const shown = all ? log : log.slice(0, 5);
  const openConv = open ? convOfPhone(open.phone, data.convs) : null;
  const openOrders = open ? factsOf(open.phone, data.orders).orders : [];
  const canOrder = ctx ? access('/m-new-order', ctx) : false;

  return (
    <AppScreen name="MCalls" title="Calls">
      <AppBar title="Calls" back="/m-more" actions={<IconButton icon="gear" label="Call settings" href="/m-call-settings" />} />
      <Content top={103}>
        {/* availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 20px 0', padding: '6px 6px 6px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--card)', boxShadow: '0 1px 2px rgba(15,23,42,.05)' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: 'var(--radius-full)', background: status === 'available' ? '#10b981' : status === 'on-call' ? '#0a4bb5' : status === 'break' ? '#f59e0b' : '#94a3b8', flex: 'none' }} />
          <span style={{ flex: '1', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{status === 'available' ? 'You are available' : status === 'on-call' ? 'You are on a call' : status === 'break' ? 'You are on a break' : 'You are offline'}</span>
          <span className="seg" role="tablist" aria-label="Your status" style={{ margin: '0', padding: '3px', width: '170px' }}>
            {[['available', 'Available'], ['break', 'Break']].map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={status === k} className={status === k ? 'on' : ''} style={{ height: '32px', fontSize: 'var(--text-xs-plus)' }} disabled={!!live} onClick={() => setStatus(k)}>{l}</button>
            ))}
          </span>
        </div>

        {/* on a call / ringing now */}
        {live ? (
          <div className="card" style={{ margin: '16px 20px 0', padding: '16px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs-plus)', opacity: '.85' }}><span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,.25)' }} />{live.state === 'ringing' ? 'Calling…' : 'On a call · ' + fmtDur(Math.round((t - live.liveAt) / 1000))}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <Face name={live.name || live.phone} size={48} />
              <div style={{ flex: '1', minWidth: '0' }}>
                <div className="ell" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{live.name || fmtPhone(live.phone)}</div>
                <div className="num" style={{ fontSize: 'var(--text-xs-plus)', opacity: '.8' }}>{fmtPhone(live.phone)}</div>
              </div>
            </div>
            <Link href="/m-call-active" className="btn" style={{ width: '100%', marginTop: '14px', height: '46px', fontSize: 'var(--text-sm-plus)', background: 'var(--fill-success)', color: '#fff' }}><PhoneGlyph />Back to the call</Link>
          </div>
        ) : ringer ? (
          <div className="card" style={{ margin: '16px 20px 0', padding: '16px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs-plus)', opacity: '.85' }}><span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#7fd4f5', boxShadow: '0 0 0 4px rgba(127,212,245,.25)' }} />Ringing now · via welcome menu “{ringer.ivr}”</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <Face name={ringer.name} avatar={ringConv ? ringConv.avatar : ''} pos={ringConv ? ringConv.pos : ''} size={48} />
              <div style={{ flex: '1', minWidth: '0' }}>
                <div className="ell" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{ringer.name || fmtPhone(ringer.phone)}</div>
                <div className="num ell" style={{ fontSize: 'var(--text-xs-plus)', opacity: '.8' }}>{[fmtPhone(ringer.phone), ringPerson.count ? `${ringPerson.count} order${ringPerson.count === 1 ? '' : 's'}` : 'New caller', ringConv && (ringConv.tags || []).includes('VIP') ? 'VIP' : ''].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="button" className="btn" onClick={() => decline(ringer)} style={{ flex: '1', height: '46px', fontSize: 'var(--text-sm-plus)', background: 'rgba(255,255,255,.14)', color: '#fff' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>Decline</button>
              <button type="button" className="btn" onClick={() => answer(ringer)} style={{ flex: '2', height: '46px', fontSize: 'var(--text-sm-plus)', background: 'var(--fill-success)', color: '#fff' }}><PhoneGlyph />Answer</button>
            </div>
          </div>
        ) : null}

        {/* call back */}
        <div className="sec">
          <h2>Call back</h2>
          {data && waiting > 5
            ? <button type="button" className="tap" onClick={() => setAllDue(!allDue)} style={{ border: 0, background: 'none', padding: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)', cursor: 'pointer' }}>{allDue ? 'Show less' : `See all ${waiting}`}</button>
            : <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{data ? (waiting ? `${waiting} waiting` : 'None waiting') : ''}</span>}
        </div>
        {!data ? <Skeleton rows={2} /> : waiting ? (
          <div className="card" style={{ margin: '0 20px' }}>
            {(allDue ? data.due : data.due.slice(0, 5)).map((c) => {
              const name = data.nameOf(c);
              const conv = convOfPhone(c.phone, data.convs);
              return (
                <div key={c.id} className="lrow">
                  <button type="button" onClick={() => setOpen(c)} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '0', padding: 0, border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
                    <Face name={name || c.phone} avatar={conv ? conv.avatar : ''} pos={conv ? conv.pos : ''} ch={conv ? conv.ch : ''} size={44} />
                    <span style={{ flex: '1', minWidth: '0' }}>
                      <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{name || fmtPhone(c.phone)}</span>
                      <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{c.result === 'Callback needed' ? `Callback needed${c.followUp ? ' · ' + dateText(/^\d{4}-\d{2}-\d{2}$/.test(c.followUp) ? c.followUp + 'T10:00:00' : c.followUp) : ''}` : `${CALL_DIRS[c.dir].label} · ${ago(c.at, t) === 'now' ? 'just now' : /\d[mh]$/.test(ago(c.at, t)) ? ago(c.at, t).replace(/m$/, ' min').replace(/h$/, ' h') + ' ago' : ago(c.at, t)}`}</span>
                    </span>
                  </button>
                  <button type="button" className="ib" aria-label={`Call ${name || fmtPhone(c.phone)}`} onClick={() => callBack(c)} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--okbg)', color: 'var(--ok)' }}><PhoneGlyph /></button>
                </div>
              );
            })}
            {(allDue ? data.tasks : data.tasks.slice(0, Math.max(0, 5 - data.due.length))).map((k) => (
              <div key={k.id} className="lrow">
                <button type="button" onClick={() => setTask(k)} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '0', padding: 0, border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
                  <Face name={k.customer.name || k.customer.phone} size={44} />
                  <span style={{ flex: '1', minWidth: '0' }}>
                    <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{k.customer.name || fmtPhone(k.customer.phone)}</span>
                    <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{k.reason}</span>
                  </span>
                </button>
                <button type="button" className="ib" aria-label={`Call ${k.customer.name || fmtPhone(k.customer.phone)}`} onClick={() => callTask(k)} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--okbg)', color: 'var(--ok)' }}><PhoneGlyph /></button>
              </div>
            ))}
          </div>
        ) : <Card><EmptyState icon="check" title="No one to call back" /></Card>}

        {/* recent */}
        <div className="sec">
          <h2>{all ? 'Call log' : 'Recent'}</h2>
          <button type="button" className="tap" onClick={() => { setAll(!all); setDir('all'); }} style={{ border: 0, background: 'none', padding: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)', cursor: 'pointer' }}>{all ? 'Show less' : 'See all'}</button>
        </div>
        {all ? <Chips items={DIR_CHIPS.map(([k, l]) => ({ key: k, label: l, n: data ? data.calls.filter((c) => k === 'all' || c.dir === k).length : undefined }))} value={dir} onChange={setDir} style={{ marginBottom: '12px' }} /> : null}
        {!data ? <Skeleton rows={4} /> : shown.length ? (
          <div className="card" style={{ margin: '0 20px' }}>
            {shown.map((c) => <CallRow key={c.id} c={c} name={data.nameOf(c)} now={t} onOpen={() => { setOpen(c); setPlaying(0); }} />)}
          </div>
        ) : <Card><EmptyState icon="phone" title="No calls here yet" /></Card>}
      </Content>

      <button type="button" className="fab" aria-label="Open dial pad" onClick={() => setDial(true)} style={{ bottom: '44px', border: 0, background: '#10b981', boxShadow: '0 12px 24px -8px rgba(16,185,129,.6)', cursor: 'pointer' }}>
        <DialPadGlyph />
      </button>

      <DialSheet open={dial} onClose={() => setDial(false)} book={data ? data.book : []}
        onCall={(phone, name, line) => { setDial(false); go({ phone, name, dir: 'out', line, back: '/m-calls' }); }} />

      {/* one call */}
      <Sheet open={!!open && !outcome} onClose={() => setOpen(null)} title={open ? data.nameOf(open) || fmtPhone(open.phone) : ''}
        footer={open ? <>
          {isDue(open) ? <Button kind="line" onClick={() => markDone(open)}>Mark done</Button> : <Button kind="line" onClick={() => setOutcome(open)}>{open.result ? 'Edit outcome' : 'Log outcome'}</Button>}
          <Button kind="primary" style={{ flex: 2 }} onClick={() => callBack(open)}><PhoneGlyph />{isDue(open) ? 'Call back' : 'Call'}</Button>
        </> : null}>
        {open ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span className="num" style={{ fontSize: 'var(--text-sm)', color: 'var(--body)' }}>{fmtPhone(open.phone)}</span>
              <OutcomePill c={open} />
            </div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              {[
                ['Call', `${CALL_DIRS[open.dir].label} · ${whenText(open.at, t)}`],
                open.dur ? ['Length', fmtDur(open.dur)] : null,
                open.wait ? ['Waited', fmtDur(open.wait)] : null,
                ['Line', (LINES.find((l) => l[0] === open.line) || ['', 'Support'])[1]],
                open.agent ? ['Taken by', staffName(open.agent)] : null,
                open.reason ? ['About', open.reason] : null,
                open.followUp ? ['Call back on', dateText(/^\d{4}-\d{2}-\d{2}$/.test(open.followUp) ? open.followUp + 'T10:00:00' : open.followUp)] : null,
                open.note ? ['Note', open.note] : null,
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} className="lrow" style={{ padding: '10px 14px', alignItems: 'flex-start' }}>
                  <span style={{ width: '96px', flex: 'none', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{k}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }}>{v}</span>
                </div>
              ))}
              {open.order ? (
                <Link href={'/m-order-detail?id=' + encodeURIComponent(open.order)} className="lrow" style={{ padding: '10px 14px' }}>
                  <span style={{ width: '96px', flex: 'none', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Order</span>
                  <span className="mono" style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--brand)' }}>{open.order}</span>
                </Link>
              ) : null}
            </div>
            {open.rec && open.dur ? (
              <div className="card" style={{ marginTop: '12px', padding: '12px 14px', boxShadow: 'none', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Recording dur={open.dur} playing={playing} setPlaying={setPlaying} />
                </div>
                {open.transcript ? <p style={{ margin: '10px 0 0', fontSize: 'var(--text-sm)', lineHeight: '20px', color: 'var(--body)' }}>{open.transcript}</p> : null}
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {openConv ? <Button kind="soft" href={'/m-chat?id=' + encodeURIComponent(openConv.id)} icon="chat">Open chat</Button> : null}
              {canOrder ? <Button kind="soft" href={`/m-new-order?phone=${encodeURIComponent(open.phone)}&name=${encodeURIComponent(data.nameOf(open))}`} icon="bag">Create order</Button> : null}
              {isDue(open) ? <Button kind="soft" onClick={() => setOutcome(open)} icon="edit">Log outcome</Button> : null}
            </div>
            {openOrders.length && !open.order ? <Note tone="info" icon="bag" style={{ marginTop: '12px' }}>{openOrders.length} order{openOrders.length === 1 ? '' : 's'} · latest {openOrders[0].id} ({openOrders[0].status})</Note> : null}
          </>
        ) : null}
      </Sheet>

      {/* a call task */}
      <Sheet open={!!task} onClose={() => setTask(null)} title={task ? task.customer.name || fmtPhone(task.customer.phone) : ''}
        footer={task ? <Button kind="primary" style={{ flex: 2 }} onClick={() => callTask(task)}><PhoneGlyph />Call</Button> : null}>
        {task ? (
          <>
            <div className="num" style={{ fontSize: 'var(--text-sm)', color: 'var(--body)', marginBottom: '10px' }}>{fmtPhone(task.customer.phone)}</div>
            <Note tone="info" icon="clipboard">{task.reason}{task.amount ? ' · ৳' + Number(task.amount).toLocaleString('en-IN') : ''}</Note>
            <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', marginTop: '10px' }}>Asked by {task.source}{task.attempts ? ` · tried ${task.attempts} time${task.attempts === 1 ? '' : 's'}` : ''}</div>
          </>
        ) : null}
      </Sheet>

      <OutcomeSheet open={!!outcome} call={outcome} dur={outcome ? outcome.dur : 0} orders={outcome ? factsOf(outcome.phone, data.orders).orders : []}
        title={outcome && outcome.result ? 'Edit the outcome' : 'Log the outcome'} onSave={saveEdit} onClose={() => setOutcome(null)} />
    </AppScreen>
  );
}

/** Recording playback (demo: the bar moves; the web plays the same way). */
function Recording({ dur, playing, setPlaying }) {
  const [pos, setPos] = useState(0);
  React.useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => setPos((p) => { if (p + 0.5 >= dur) { setPlaying(0); return 0; } return p + 0.5; }), 500);
    return () => window.clearInterval(id);
  }, [playing, dur, setPlaying]);
  return (
    <>
      <button type="button" className="ib" aria-label={playing ? 'Pause the recording' : 'Play the recording'} onClick={() => setPlaying(playing ? 0 : 1)} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--brand)', color: '#fff', flex: 'none' }}>
        <XIcon name={playing ? 'pause' : 'play'} size={16} fill="currentColor" stroke={0} />
      </button>
      <span className="bar" style={{ flex: 1 }}><i style={{ width: Math.round((pos / dur) * 100) + '%', background: 'var(--brand)' }} /></span>
      <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', flex: 'none' }}>{fmtDur(pos || dur)}</span>
    </>
  );
}
