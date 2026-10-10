'use client';
// The super admin's softphone, copied from the merchant panel's components/inbox/Dialer.jsx (same keypad look) and
// fed by lib/admin/inbox: call from one of GridCommerce's numbers (LINES), recent numbers, contacts (leads, merchants,
// affiliates, partners). DialerFlow runs one call in the sheet: dial → ringing / connected (mute, hold, end) → outcome
// and note (follow-up date when a callback is needed) → logCall.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { LINES, OUTCOMES, KINDS, digits, logCall } from '@/lib/admin/inbox';
import { Avatar, Seg, SearchBox } from './inboxParts';
import { fmtDur } from './inboxThread';

const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
export const fmtPhone = (p) => { const d = digits(p); return /^01\d{9}$/.test(d) ? d.slice(0, 5) + '-' + d.slice(5) : p || ''; };
export const dateToMs = (v) => (v ? Date.parse(v + 'T11:00:00+06:00') : null);
export const msToDate = (ms) => (ms ? new Date(ms + 6 * 3600e3).toISOString().slice(0, 10) : '');

function Keypad({ number, setNumber, line, setLine, people, recent, onCall, now }) {
  const [tab, setTab] = useState('keypad');
  const [q, setQ] = useState('');
  const d = digits(number);
  const match = d.length >= 4 ? people.find((p) => digits(p.phone).startsWith(d)) : null;
  const call = (phone, person) => {
    const x = digits(phone);
    if (!/^(01[3-9]\d{8}|09\d{8,9})$/.test(x)) { toast('Enter an 11-digit number, for example 01712345678', { tone: 'error' }); return; }
    onCall(x, person || people.find((p) => digits(p.phone) === x) || null);
  };
  const found = people.filter((p) => !q || (p.name + ' ' + p.company + ' ' + p.phone).toLowerCase().includes(q.toLowerCase())).slice(0, 10);
  return (
    <div className="dl">
      <Seg label="Dialer" value={tab} onChange={setTab} items={[['keypad', 'Keypad', null, 'grid-3x3'], ['recent', 'Recent', null, 'history'], ['people', 'Contacts', null, 'users']]} />
      {tab === 'keypad' ? (
        <form className="dl-pad" onSubmit={(e) => { e.preventDefault(); call(number, match); }}>
          <div className="dl-num">
            <input className="dl-input ib-data" type="tel" inputMode="tel" autoComplete="off" aria-label="Number to call" placeholder="01XXXXXXXXX" value={number} onChange={(e) => setNumber(e.target.value.replace(/[^0-9+*#-]/g, ''))} />
            {number ? <button type="button" className="gc-iconbtn" aria-label="Delete last digit" onClick={() => setNumber(number.slice(0, -1))}><Icon name="delete" width="18" height="18" /></button> : null}
          </div>
          <p className="dl-match">{match ? <><Icon name="user-round-check" width="14" height="14" aria-hidden="true" />{match.name} · {match.company}</> : d.length >= 4 ? 'Not in your contacts' : 'Type a number or pick a contact'}</p>
          <div className="dl-keys">
            {KEYS.map(([k, sub]) => <button key={k} type="button" onClick={() => setNumber(number + k)} aria-label={k}><span>{k}</span>{sub ? <small>{sub}</small> : null}</button>)}
          </div>
          <label className="gc-label dl-lab" htmlFor="dl-line">Call from</label>
          <select id="dl-line" className="gc-input gc-select" value={line} onChange={(e) => setLine(e.target.value)}>{LINES.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.number}</option>)}</select>
          <button type="submit" className="gc-btn gc-btn--solid gc-btn--success gc-btn--block dl-call" disabled={!d}><Icon name="phone" width="18" height="18" aria-hidden="true" />Call{match ? ' ' + match.name.split(' ')[0] : ''}</button>
        </form>
      ) : null}
      {tab === 'recent' ? (
        recent.length ? (
          <ul className="dl-list">
            {recent.map((c) => (
              <li key={c.id}>
                <span className={'dl-dir dl-dir--' + c.dir}><Icon name={c.dir === 'in' ? 'phone-incoming' : c.dir === 'out' ? 'phone-outgoing' : 'phone-missed'} width="16" height="16" aria-hidden="true" /></span>
                <span className="dl-list__text"><b>{c.name || fmtPhone(c.phone)}</b><span className="ib-sub">{c.company || fmtPhone(c.phone)} · {c.when}</span></span>
                <button type="button" className="gc-iconbtn dl-go" aria-label={'Call ' + (c.name || c.phone)} onClick={() => call(c.phone, people.find((p) => digits(p.phone) === digits(c.phone)))}><Icon name="phone" width="16" height="16" /></button>
              </li>
            ))}
          </ul>
        ) : <p className="dl-empty">No calls yet.</p>
      ) : null}
      {tab === 'people' ? (
        <>
          <SearchBox value={q} onChange={setQ} placeholder="Search name, business or number" />
          {found.length ? (
            <ul className="dl-list">
              {found.map((p) => (
                <li key={p.key}>
                  <Avatar name={p.name} size={32} />
                  <span className="dl-list__text"><b>{p.name}</b><span className="ib-sub"><span className="ib-data">{fmtPhone(p.phone)}</span> · {KINDS[p.kind].label} · {p.company}</span></span>
                  <button type="button" className="gc-iconbtn dl-go" aria-label={'Call ' + p.name} onClick={() => call(p.phone, p)}><Icon name="phone" width="16" height="16" /></button>
                </li>
              ))}
            </ul>
          ) : <p className="dl-empty">No contact matches “{q}”.</p>}
        </>
      ) : null}
    </div>
  );
}

/** One call in the dialer sheet. `start` = { number, name?, from? } fills the keypad (a callback). onPhase(phase) tells
 *  the page whether a call is on (so the sheet can't close mid-call); onDone() after the call is logged. */
export function DialerFlow({ start, people, recent, onPhase, onDone, now }) {
  const [number, setNumber] = useState(start && start.number ? fmtPhone(start.number) : '');
  const [line, setLine] = useState(start && start.line ? start.line : 'sales');
  const [live, setLive] = useState(null);       // { phone, person, state, at, liveAt, muted, hold }
  const [out, setOut] = useState(null);         // the outcome form
  const [err, setErr] = useState('');
  const [, tick] = useState(0);
  const timer = useRef(0);
  useEffect(() => { onPhase(live ? 'call' : out ? 'outcome' : 'dial'); }, [live, out]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => tick((x) => x + 1), 500);
    return () => window.clearInterval(id);
  }, [live]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const dial = (phone, person) => {
    setLive({ phone, person, state: 'ringing', at: Date.now(), liveAt: 0, muted: false, hold: false });
    // demo: about one call in six is not picked up
    const answered = digits(phone).slice(-1) !== '7';
    timer.current = window.setTimeout(() => setLive((l) => (l ? (answered ? { ...l, state: 'live', liveAt: Date.now() } : { ...l, state: 'noanswer' }) : l)), answered ? 2200 : 6000);
  };
  const end = () => {
    window.clearTimeout(timer.current);
    const dur = live.liveAt ? Math.max(1, Math.round((Date.now() - live.liveAt) / 1000)) : 0;
    const p = live.person;
    setOut({ phone: live.phone, person: p, dur, outcome: dur ? (p && p.kind === 'lead' ? 'Interested' : 'Resolved') : 'No answer', note: '', follow: '' });
    setLive(null);
  };
  const save = (skip) => {
    const p = out.person;
    const res = logCall({
      dir: 'out', line, phone: fmtPhone(out.phone), name: p ? p.name : (start && start.name) || '', company: p ? p.company : '', kind: p ? p.kind : '', contactKey: p ? p.key : '', shopId: p ? p.shopId || '' : '',
      dur: out.dur, outcome: skip ? '' : out.outcome, note: skip ? '' : out.note, followUp: skip ? null : dateToMs(out.follow), from: start ? start.from : '',
    });
    if (!res.ok) { setErr(res.error); return; }
    toast(skip ? 'Call logged without an outcome' : `Call logged · ${out.outcome}`);
    onDone(res.id);
  };

  if (live) {
    const name = live.person ? live.person.name : (start && start.name) || fmtPhone(live.phone);
    const talk = live.liveAt ? fmtDur((Date.now() - live.liveAt) / 1000) : '0:00';
    const lineName = (LINES.find((l) => l.id === line) || LINES[0]);
    return (
      <div className="dl-live" data-state={live.hold ? 'hold' : live.state}>
        <Avatar name={name} size={72} />
        <p className="dl-live__name">{name}</p>
        <p className="ib-sub"><span className="ib-data">{fmtPhone(live.phone)}</span>{live.person ? ' · ' + live.person.company : ''}</p>
        <p className="dl-live__state" aria-live="polite">{live.state === 'ringing' ? `Calling from ${lineName.number}…` : live.state === 'noanswer' ? 'No answer' : live.hold ? `On hold · ${talk}` : `Connected · ${talk}`}{live.muted ? ' · muted' : ''}</p>
        <div className="dl-live__acts">
          <button type="button" className="dl-ctl" aria-pressed={live.muted} onClick={() => setLive({ ...live, muted: !live.muted })}><Icon name={live.muted ? 'mic-off' : 'mic'} width="18" height="18" aria-hidden="true" />{live.muted ? 'Unmute' : 'Mute'}</button>
          <button type="button" className="dl-ctl" aria-pressed={live.hold} disabled={live.state !== 'live'} onClick={() => setLive({ ...live, hold: !live.hold })}><Icon name={live.hold ? 'play' : 'pause'} width="18" height="18" aria-hidden="true" />{live.hold ? 'Resume' : 'Hold'}</button>
          <button type="button" className="dl-ctl dl-ctl--end" onClick={end}><Icon name="phone-off" width="18" height="18" aria-hidden="true" />End</button>
        </div>
      </div>
    );
  }
  if (out) {
    const name = out.person ? out.person.name : (start && start.name) || fmtPhone(out.phone);
    return (
      <form className="dl-out" onSubmit={(e) => { e.preventDefault(); save(false); }}>
        <div className="dl-sum"><Avatar name={name} size={32} /><span><b>{name}</b><span className="ib-sub"><span className="ib-data">{fmtPhone(out.phone)}</span> · {out.dur ? fmtDur(out.dur) : 'not connected'}</span></span></div>
        <div><label className="gc-label" htmlFor="dl-oc">Outcome</label><select id="dl-oc" className="gc-input gc-select" value={out.outcome} onChange={(e) => setOut({ ...out, outcome: e.target.value })}>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="dl-fu">Follow-up call{out.outcome === 'Callback needed' ? ' *' : ''}</label><input id="dl-fu" type="date" className="gc-input" value={out.follow} min={msToDate(now)} onChange={(e) => setOut({ ...out, follow: e.target.value })} /></div>
        <div><label className="gc-label" htmlFor="dl-note">Note</label><textarea id="dl-note" className="gc-input" rows="3" value={out.note} onChange={(e) => setOut({ ...out, note: e.target.value })} placeholder="What was agreed, for the next person who calls" /></div>
        {err ? <p className="ib-err" role="alert">{err}</p> : null}
        <div className="dl-foot"><button type="button" className="gc-btn gc-btn--neutral" onClick={() => save(true)}>Skip</button><button type="submit" className="gc-btn gc-btn--solid">Save call</button></div>
      </form>
    );
  }
  return <Keypad number={number} setNumber={setNumber} line={line} setLine={setLine} people={people} recent={recent} onCall={dial} now={now} />;
}

export const DIALER_CSS = `
.dl{display:flex;flex-direction:column;gap:var(--space-3)}
.dl>.ib-seg{align-self:stretch}
.dl>.ib-seg button{flex:1;justify-content:center}
.dl-pad{display:flex;flex-direction:column;gap:var(--space-2)}
.dl-num{display:flex;align-items:center;gap:var(--space-1);border-bottom:1px solid var(--border-subtle)}
.dl-input{flex:1;min-width:0;height:52px;border:0;background:none;font-size:var(--text-2xl);font-weight:var(--weight-medium);letter-spacing:.04em;color:var(--text-heading);text-align:center;outline:none}
.dl-input::placeholder{color:var(--border-strong)}
.dl-match{display:flex;align-items:center;justify-content:center;gap:var(--space-1-5);min-height:20px;margin:0;font-size:var(--text-xs);color:var(--text-muted);text-align:center}
.dl-match svg{color:var(--text-success)}
.dl-keys{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.dl-keys button{display:flex;flex-direction:column;align-items:center;justify-content:center;height:52px;border:0;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);cursor:pointer;transition:var(--transition-base)}
.dl-keys button:hover{background:var(--slate-200)}
.dl-keys button:active{transform:scale(.97)}
.dl-keys span{font-size:var(--text-lg);font-weight:var(--weight-medium);line-height:1.1}
.dl-keys small{font-size:var(--text-2xs);letter-spacing:.08em;color:var(--text-muted)}
.dl-lab{margin:var(--space-1) 0 0}
.dl-call{margin-top:var(--space-1)}
.dl-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.dl-list li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.dl-list li:last-child{border-bottom:0}
.dl-list__text{flex:1;min-width:0;display:flex;flex-direction:column}
.dl-list__text b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.dl-list__text .ib-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dl-go{color:var(--text-success);background:var(--fill-success-soft)}
.dl-go:hover{color:var(--text-success)}
.dl-dir{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.dl-dir--in{background:var(--fill-success-soft);color:var(--text-success)}
.dl-dir--out{background:var(--fill-info-soft);color:var(--text-info)}
.dl-dir--missed{background:var(--fill-error-soft);color:var(--text-danger)}
.dl-empty{margin:0;padding:var(--space-4) 0;text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.dl-live{display:flex;flex-direction:column;align-items:center;gap:var(--space-1);padding:var(--space-6) 0 var(--space-4);text-align:center}
.dl-live .ib-av{margin-bottom:var(--space-2)}
.dl-live__name{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dl-live__state{margin:var(--space-2) 0 var(--space-5);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-success);font-variant-numeric:tabular-nums}
.dl-live[data-state="ringing"] .dl-live__state{color:var(--text-info)}
.dl-live[data-state="hold"] .dl-live__state,.dl-live[data-state="noanswer"] .dl-live__state{color:var(--text-warning)}
.dl-live__acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);width:100%}
.dl-ctl{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:56px;padding:var(--space-2);border:0;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.dl-ctl[aria-pressed="true"]{background:var(--primary);color:var(--text-inverse)}
.dl-ctl:disabled{opacity:.45;cursor:not-allowed}
.dl-ctl--end{background:var(--fill-danger);color:var(--text-inverse)}
.dl-out{display:flex;flex-direction:column;gap:var(--space-3)}
.dl-out .gc-label{margin-bottom:6px}
.dl-out textarea.gc-input{height:auto;min-height:80px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.dl-sum{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-xl);background:var(--surface-page)}
.dl-sum>span{display:flex;flex-direction:column}
.dl-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dl-foot{display:flex;justify-content:flex-end;gap:var(--space-2)}
`;
