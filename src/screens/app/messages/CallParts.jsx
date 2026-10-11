'use client';
// CallParts — the app's call pieces, in the MCalls / MCallActive boards' markup:
//   CallRow { c, name, now, onOpen }        a call log row (.lrow): direction tile, name, when · length, outcome pill
//   OutcomeSheet { open, call, dur, orders, onSave(o, skip), onClose? }   reason, result, follow-up, order and note
//                                           after a call (the web Calls page's outcome dialog)
//   DialSheet { open, onClose, book, onCall(phone, name, line) }          keypad (or a customer) and the line to call from
//   dirOf(c)                                the direction's icon and colours

import React, { useEffect, useMemo, useState } from 'react';
import { Sheet, Button, Chips, Segmented, Field, TextInput, SearchField, Pill, ListRow, toast } from '../kit/AppKit';
import { CALL_DIRS, CALL_REASONS, CALL_RESULTS, RESULT_TONE, LINES, whenText, fmtDur, phoneDigits } from '@/lib/inbox';
import { XIcon, Face } from './msgParts';
import { isDue, fmtPhone, dialable } from './msgData';

const DIR = {
  in: ['incoming', 'var(--soft)', '#0f9f6e'],
  out: ['outgoing', 'var(--soft)', '#003087'],
  missed: ['missed', '#ffece5', '#c2410c'],
  voicemail: ['voicemail', '#fff4e0', '#b45309'],
};
export const dirOf = (c) => DIR[c.dir] || DIR.out;
const tone = (t) => ({ success: 'ok', warning: 'warn', error: 'err', info: 'nav', slate: 'grey' })[t] || 'grey';

/** The outcome pill of a call (as the web log shows it). */
export function OutcomePill({ c }) {
  if (c.result) return <Pill tone={tone(RESULT_TONE[c.result])}>{c.result}{c.result === 'Order created' && c.order ? ' ' + c.order : ''}</Pill>;
  if (isDue(c)) return <Pill tone="warn">Call back</Pill>;
  if (c.callback === 'done') return <Pill tone="ok">Called back</Pill>;
  return null;
}

export function CallRow({ c, name, now, onOpen }) {
  const [icon, bg, fg] = dirOf(c);
  const missed = c.dir === 'missed';
  const body = (
    <>
      <span className="ico" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: bg, color: fg }}>
        <XIcon name={icon} size={18} stroke={2} />
      </span>
      <span style={{ flex: '1', minWidth: '0' }}>
        <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: missed ? 'var(--weight-semibold)' : 'var(--weight-medium)', color: missed ? 'var(--err)' : 'var(--ink)' }}>{name || fmtPhone(c.phone)}</span>
        <span className="num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{whenText(c.at, now || Date.now())}{c.dur ? ' · ' + fmtDur(c.dur) : ''}</span>
      </span>
      <OutcomePill c={c} />
    </>
  );
  const label = (CALL_DIRS[c.dir] ? CALL_DIRS[c.dir].label + ' call: ' : '') + (name || fmtPhone(c.phone));
  return <button type="button" className="lrow" onClick={onOpen} aria-label={label} style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit', cursor: 'pointer' }}>{body}</button>;
}

/** After a call: what it was about and how it went. */
export function OutcomeSheet({ open, call, dur, orders = [], onSave, onClose, title = 'How did the call go?' }) {
  const [o, setO] = useState(null);
  useEffect(() => {
    if (!open || !call) return;
    setO({ reason: call.reason || (call.dir === 'in' ? 'Order status' : 'Delivery'), result: call.result || (dur ? 'Resolved' : 'No answer'), followUp: call.followUp || '', order: call.order || (orders[0] ? orders[0].id : ''), note: call.note || '' });
  }, [open, call && call.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open || !o) return null;
  const set = (k) => (v) => setO((x) => ({ ...x, [k]: v }));
  const save = () => {
    if (o.result === 'Callback needed' && !o.followUp) { toast('Pick the follow-up date for the callback', { tone: 'error' }); return; }
    onSave({ ...o, dur }, false);
  };
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  return (
    <Sheet open onClose={onClose} title={title}
      footer={<>
        <Button kind="line" onClick={() => onSave({ ...o, dur }, true)}>Skip</Button>
        <Button kind="primary" onClick={save} style={{ flex: 2 }}>Save</Button>
      </>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <Face name={call.name || call.phone} size={44} />
        <span style={{ minWidth: 0 }}>
          <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)' }}>{call.name || fmtPhone(call.phone)}</span>
          <span className="num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{fmtPhone(call.phone)} · {dur ? fmtDur(dur) : 'Not answered'}</span>
        </span>
      </div>
      <div className="lab" style={{ marginBottom: '8px' }}>What was it about?</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {CALL_REASONS.map((r) => <button key={r} type="button" className={'chip' + (o.reason === r ? ' on' : '')} aria-pressed={o.reason === r} onClick={() => set('reason')(r)}>{r}</button>)}
      </div>
      <div className="lab" style={{ marginBottom: '8px' }}>Result</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {CALL_RESULTS.map((r) => <button key={r} type="button" className={'chip' + (o.result === r ? ' on' : '')} aria-pressed={o.result === r} onClick={() => set('result')(r)}>{r}</button>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {o.result === 'Callback needed' ? (
          <Field label="Call back on">
            <span className="inp"><input type="date" value={o.followUp} min={tomorrow.slice(0, 10)} onChange={(e) => set('followUp')(e.target.value)} /></span>
          </Field>
        ) : null}
        {orders.length ? (
          <Field label="Order">
            <span className="inp">
              <select value={o.order} onChange={(e) => set('order')(e.target.value)}>
                <option value="">No order</option>
                {orders.slice(0, 8).map((x) => <option key={x.id} value={x.id}>{x.id} · {x.status}</option>)}
              </select>
            </span>
          </Field>
        ) : null}
        <Field label="Note">
          <TextInput multiline value={o.note} onChange={set('note')} placeholder="What was said or agreed" />
        </Field>
      </div>
    </Sheet>
  );
}

const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];

/** The dial pad: keypad or a customer, and the line to call from. */
export function DialSheet({ open, onClose, book = [], onCall, first = '' }) {
  const [tab, setTab] = useState('keypad');
  const [num, setNum] = useState('');
  const [q, setQ] = useState('');
  const [line, setLine] = useState('support');
  useEffect(() => { if (open) { setNum(phoneDigits(first)); setQ(''); setTab('keypad'); } }, [open, first]);
  const d = phoneDigits(num);
  const match = d.length >= 4 ? book.find((p) => phoneDigits(p.phone).startsWith(d)) : null;
  const found = useMemo(() => book.filter((p) => !q || (p.name + ' ' + p.phone).toLowerCase().includes(q.toLowerCase())).slice(0, 30), [book, q]);
  const call = (phone, name) => {
    if (!dialable(phone)) { toast('Enter an 11-digit mobile number, for example 01712345678', { tone: 'error' }); return; }
    onCall(phoneDigits(phone), name || (book.find((p) => phoneDigits(p.phone) === phoneDigits(phone)) || {}).name || '', line);
  };
  if (!open) return null;
  return (
    <Sheet open onClose={onClose} title="Dial pad">
      <Segmented items={[{ key: 'keypad', label: 'Keypad' }, { key: 'people', label: 'Customers' }]} value={tab} onChange={setTab} style={{ margin: '0 0 14px' }} />
      {tab === 'keypad' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '48px' }}>
            <input className="num" type="tel" inputMode="tel" aria-label="Phone number to call" placeholder="01XXXXXXXXX" value={num}
              onChange={(e) => setNum(e.target.value.replace(/[^0-9+*#]/g, ''))}
              style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', textAlign: 'center', font: 'inherit', fontFamily: 'var(--font-data)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink)', letterSpacing: '.02em' }} />
            {num ? <button type="button" className="ib" aria-label="Delete last digit" onClick={() => setNum(num.slice(0, -1))}><XIcon name="del" size={22} /></button> : null}
          </div>
          <div style={{ textAlign: 'center', fontSize: 'var(--text-xs-plus)', color: match ? 'var(--ok)' : 'var(--muted)', minHeight: '18px' }}>
            {match ? match.name : d.length >= 4 ? 'Not in your customers' : 'Type a number or pick a customer'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 18px', padding: '14px 18px 4px' }}>
            {KEYS.map(([k, sub]) => (
              <button key={k} type="button" aria-label={k} onClick={() => setNum(num + k)}
                style={{ height: '58px', border: 0, borderRadius: 'var(--radius-full)', background: 'var(--soft)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: 'inherit' }}>
                <span className="num" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-medium)', lineHeight: 1.1 }}>{k}</span>
                {sub ? <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--muted)', letterSpacing: '.08em' }}>{sub}</span> : null}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <SearchField value={q} onChange={setQ} placeholder="Search name or number" style={{ margin: '0 0 8px' }} />
          <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
            {found.length ? found.map((p) => (
              <ListRow key={p.phone} compact onClick={() => call(p.phone, p.name)} avatar={<Face name={p.name} avatar={p.avatar} pos={p.pos} size={40} />} title={p.name} sub={<span className="num">{fmtPhone(p.phone)}</span>} chevron={false}
                end={<span className="ib" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', background: 'var(--okbg)', color: 'var(--ok)' }}><XIcon name="outgoing" size={16} stroke={2} /></span>} />
            )) : <div className="empty">No one matches “{q}”.</div>}
          </div>
        </>
      )}
      <div className="lab" style={{ margin: '16px 0 8px' }}>Call from</div>
      <Chips items={LINES.map(([k, l]) => ({ key: k, label: l }))} value={line} onChange={setLine} style={{ padding: 0, flexWrap: 'wrap' }} />
      {tab === 'keypad' ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
          <button type="button" aria-label="Call" onClick={() => call(num, match && match.name)}
            style={{ width: '64px', height: '64px', border: 0, borderRadius: 'var(--radius-full)', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px -8px rgba(16,185,129,.6)', cursor: 'pointer' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
          </button>
        </div>
      ) : null}
    </Sheet>
  );
}
