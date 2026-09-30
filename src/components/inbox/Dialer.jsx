'use client';
// The softphone dialer: keypad, recent numbers and customer search, with the caller ID line.
// Used as a card beside the call log and as a bottom sheet on phones.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { LINES, CALL_DIRS, ago, phoneDigits } from '@/lib/inbox';
import { Avatar, Seg, SearchBox } from './parts';

const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
export const fmtPhone = (p) => { const d = phoneDigits(p); return /^01\d{9}$/.test(d) ? d.slice(0, 5) + '-' + d.slice(5) : p || ''; };

export function Dialer({ number, setNumber, line, setLine, people, recent, onCall, now, busy }) {
  const [tab, setTab] = useState('keypad');
  const [q, setQ] = useState('');
  const d = phoneDigits(number);
  const match = d.length >= 4 ? people.find((p) => phoneDigits(p.phone).startsWith(d)) : null;
  const call = (phone, name) => {
    const x = phoneDigits(phone);
    if (!/^(01[3-9]\d{8}|09\d{8,9})$/.test(x)) { toast('Enter an 11-digit mobile number, for example 01712345678', { tone: 'error' }); return; }
    if (busy) { toast('Finish the call you are on first', { tone: 'error' }); return; }
    onCall(x, name || (people.find((p) => phoneDigits(p.phone) === x) || {}).name || '');
  };
  const found = people.filter((p) => !q || (p.name + ' ' + p.phone).toLowerCase().includes(q.toLowerCase())).slice(0, 8);

  return (
    <div className="dl">
      <Seg label="Dialer" value={tab} onChange={setTab} items={[['keypad', 'Keypad', null, 'grid-3x3'], ['recent', 'Recent', null, 'history'], ['people', 'Customers', null, 'users']]} />
      {tab === 'keypad' ? (
        <form className="dl-pad" onSubmit={(e) => { e.preventDefault(); call(number, match && match.name); }}>
          <div className="dl-num">
            <input className="dl-input ib-data" type="tel" inputMode="tel" autoComplete="off" aria-label="Phone number to call" placeholder="01XXXXXXXXX" value={number} onChange={(e) => setNumber(e.target.value.replace(/[^0-9+*#]/g, ''))} />
            {number ? <button type="button" className="gc-iconbtn" aria-label="Delete last digit" onClick={() => setNumber(number.slice(0, -1))}><Icon name="delete" width="18" height="18" /></button> : null}
          </div>
          <p className="dl-match">{match ? <><Icon name="user-round-check" width="14" height="14" aria-hidden="true" />{match.name}{match.meta ? ' · ' + match.meta : ''}</> : d.length >= 4 ? 'Not in your customers' : 'Type a number or pick a customer'}</p>
          <div className="dl-keys">
            {KEYS.map(([k, sub]) => <button key={k} type="button" onClick={() => setNumber(number + k)} aria-label={k}><span>{k}</span>{sub ? <small>{sub}</small> : null}</button>)}
          </div>
          <label className="gc-label dl-lab" htmlFor="dl-line">Call from</label>
          <select id="dl-line" className="gc-input gc-select" value={line} onChange={(e) => setLine(e.target.value)}>{LINES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <button type="submit" className="gc-btn gc-btn--solid gc-btn--success gc-btn--block dl-call" disabled={!d}><Icon name="phone" width="18" height="18" aria-hidden="true" />Call{match ? ' ' + match.name.split(' ')[0] : ''}</button>
        </form>
      ) : null}
      {tab === 'recent' ? (
        recent.length ? (
          <ul className="dl-list">
            {recent.map((c) => (
              <li key={c.id}>
                <span className={'dl-dir dl-dir--' + c.dir}><Icon name={CALL_DIRS[c.dir].icon} width="16" height="16" aria-hidden="true" /></span>
                <span className="dl-list__text"><b>{c.name || fmtPhone(c.phone)}</b><span className="ib-sub">{CALL_DIRS[c.dir].label} · {ago(c.at, now)}</span></span>
                <button type="button" className="gc-iconbtn dl-go" aria-label={'Call ' + (c.name || c.phone)} onClick={() => call(c.phone, c.name)}><Icon name="phone" width="16" height="16" /></button>
              </li>
            ))}
          </ul>
        ) : <p className="dl-empty">No calls yet.</p>
      ) : null}
      {tab === 'people' ? (
        <>
          <SearchBox value={q} onChange={setQ} placeholder="Search name or number" />
          {found.length ? (
            <ul className="dl-list">
              {found.map((p) => (
                <li key={p.phone}>
                  <Avatar name={p.name} avatar={p.avatar} pos={p.pos} size={32} />
                  <span className="dl-list__text"><b>{p.name}</b><span className="ib-sub ib-data">{fmtPhone(p.phone)}{p.meta ? ' · ' + p.meta : ''}</span></span>
                  <button type="button" className="gc-iconbtn dl-go" aria-label={'Call ' + p.name} onClick={() => call(p.phone, p.name)}><Icon name="phone" width="16" height="16" /></button>
                </li>
              ))}
            </ul>
          ) : <p className="dl-empty">No customer matches “{q}”.</p>}
        </>
      ) : null}
    </div>
  );
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
.dl-go{color:var(--text-success);background:var(--fill-success-soft)}
.dl-go:hover{color:var(--text-success)}
.dl-dir{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.dl-dir--in{background:var(--fill-success-soft);color:var(--text-success)}
.dl-dir--out{background:var(--fill-info-soft);color:var(--text-info)}
.dl-dir--missed{background:var(--fill-error-soft);color:var(--text-danger)}
.dl-dir--voicemail{background:var(--fill-warning-soft);color:var(--text-warning)}
.dl-empty{margin:0;padding:var(--space-4) 0;text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
`;
