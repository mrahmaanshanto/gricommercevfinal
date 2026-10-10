'use client';
// Communications › providers: SMS (SSL Wireless, Alpha SMS) on the SMS page's Provider tab, email (Amazon SES, Mailgun)
// on the Email page's Provider settings. Each provider: main or backup, on / off, balance with its low mark, cost per
// message, delivery over 30 days, sender, speed and the last check; actions make it the main one, top it up, test it
// or turn it off (the main one hands over to the backup). Data: lib/admin/comms.js (providerRows, setPrimary,
// setProviderOn, topUp, testProvider).

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { providerRows, setPrimary, setProviderOn, topUp, testProvider } from '@/lib/admin/comms';
import { money, money2, num, pct, whenText } from './commsShared';

export const PROVIDER_CSS = `
.pv-list{display:flex;flex-direction:column}
.pv{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border-top:1px solid var(--border-subtle)}
.pv:first-child{border-top:0}
.pv__head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pv__logo{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.pv__name{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}
.pv__name b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pv__name small{font-size:var(--text-xs);color:var(--text-muted)}
.pv__facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2)}
.pv__facts div{display:flex;flex-direction:column;gap:2px;min-width:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.pv__facts span{font-size:var(--text-xs);color:var(--text-muted)}
.pv__facts b{overflow:hidden;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.pv__facts b.is-bad{color:var(--text-danger)}
.pv__acts{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pv__sw{display:inline-flex;align-items:center;gap:var(--space-2);margin-left:auto;font-size:var(--text-sm);color:var(--text-body)}
.pv__amt{display:flex;flex-wrap:wrap;gap:6px}
@media (max-width:900px){.pv__facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.pv{padding:var(--space-3)}.pv__sw{margin-left:0}}
`;

export function ProvidersPanel({ ch, data, t }) {
  const [top, setTop] = useState(null);   // { id, amount, ref, error }
  const rows = providerRows(data, t).filter((p) => p.ch === ch);
  const unit = ch === 'sms' ? 'SMS' : 'email';

  const makeMain = (p) => { const r = setPrimary(p.id); toast(r.ok ? `${p.name} is now the main ${unit} provider` : r.error, r.ok ? undefined : { tone: 'error' }); };
  const toggle = async (p) => {
    if (p.on && p.primary) {
      const ok = await confirmDialog({ title: `Turn off ${p.name}?`, body: `It is the main ${unit} provider. New ${unit === 'SMS' ? 'SMS' : 'emails'} go through the backup until you turn it back on.`, confirmLabel: 'Turn off', tone: 'danger' });
      if (!ok) return;
    }
    const r = setProviderOn(p.id, !p.on);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(r.moved ? `${p.name} is off. ${r.moved} is now the main provider.` : `${p.name} is ${p.on ? 'off' : 'on'}`);
  };
  const test = (p) => { const r = testProvider(p.id); toast(r.ok ? `${p.name} answered in ${r.ms} ms` : r.error, r.ok ? undefined : { tone: 'error' }); };
  const doTop = () => {
    const r = topUp(top.id, top.amount, top.ref);
    if (!r.ok) { setTop({ ...top, error: r.error }); return; }
    const p = rows.find((x) => x.id === top.id);
    setTop(null);
    toast(`${p.name} topped up · balance ${money(r.balance)}`);
  };
  const topP = top ? rows.find((x) => x.id === top.id) : null;

  return (
    <>
      <div className="pv-list">
        {rows.map((p) => (
          <article key={p.id} className="pv" aria-label={p.name}>
            <div className="pv__head">
              <span className="pv__logo" aria-hidden="true"><Icon name={ch === 'sms' ? 'radio-tower' : 'mail'} width="18" height="18" /></span>
              <span className="pv__name"><b>{p.name}</b><small>{p.kind} · {p.sender}</small></span>
              {p.primary && p.on ? <StatusBadge tone="primary">Main</StatusBadge> : p.on ? <StatusBadge tone="neutral">Backup</StatusBadge> : null}
              <StatusBadge tone={p.tone}>{p.status}</StatusBadge>
            </div>
            <div className="pv__facts">
              <div><span>Balance</span><b className={p.balance < p.low ? 'is-bad' : ''}>{money(p.balance)}</b></div>
              <div><span>Cost per {unit}</span><b>{money2(p.rate)}</b></div>
              <div><span>Delivered, 30 days</span><b>{pct(p.delivery)}</b></div>
              <div><span>Sent, 30 days</span><b>{num(p.sent)}</b></div>
            </div>
            {p.balance < p.low && p.on ? (
              <div className="gc-alert gc-alert--soft gc-alert--warning" role="status" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                <Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />
                <span>Below the {money(p.low)} mark. {p.primary ? `Sends stop when it reaches ৳0.` : 'If the main provider stops, this one takes over and runs out fast.'}</span>
              </div>
            ) : null}
            <div className="pv__acts">
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => setTop({ id: p.id, amount: '', ref: '' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Top up</button>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => test(p)}><Icon name="activity" width="16" height="16" aria-hidden="true" />Test connection</button>
              {!p.primary && p.on ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => makeMain(p)}>Make main</button> : null}
              <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Checked {whenText(p.checkedAt, t)} · about {p.latency} s to deliver</span>
              <span className="pv__sw">
                <span>{p.on ? 'On' : 'Off'}</span>
                <button type="button" role="switch" aria-checked={p.on} aria-label={(p.on ? 'Turn off ' : 'Turn on ') + p.name} className="gc-switch" onClick={() => toggle(p)}><span className="gc-switch__knob" /></button>
              </span>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={!!top} title={topP ? 'Top up ' + topP.name : ''} onClose={() => setTop(null)}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setTop(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={doTop}>Add to balance</button></>}>
        {top && topP ? (
          <div className="cm-form">
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Balance now <b className="cm-fig">{money(topP.balance)}</b> · about {num(topP.balance / topP.rate)} {unit === 'SMS' ? 'SMS' : 'emails'} left</p>
            <div className="cm-field">
              <label className="gc-label" htmlFor="pv-amt">Amount paid to {topP.name} <InfoTip text="Record what was paid to the provider (bank transfer or bKash merchant). The provider adds it to the account; this keeps our balance in step." /></label>
              <input id="pv-amt" data-autofocus inputMode="numeric" className={'gc-input cm-fig' + (top.error ? ' gc-input--error' : '')} placeholder="৳ 5,000" value={top.amount} onChange={(e) => setTop({ ...top, amount: e.target.value.replace(/[^0-9]/g, ''), error: '' })} />
              <div className="pv__amt">{[2000, 5000, 10000, 20000].map((a) => <button key={a} type="button" className="ix-chip" aria-pressed={Number(top.amount) === a} onClick={() => setTop({ ...top, amount: String(a), error: '' })}>{money(a)}</button>)}</div>
              {top.error ? <p className="gc-help gc-help--error" role="alert">{top.error}</p> : null}
            </div>
            <div className="cm-field">
              <label className="gc-label" htmlFor="pv-ref">Payment reference</label>
              <input id="pv-ref" className="gc-input cm-fig" placeholder="Bank ref or bKash TrxID" value={top.ref} onChange={(e) => setTop({ ...top, ref: e.target.value })} />
            </div>
            {top.amount ? <p className="gc-help" style={{ margin: 0 }}>New balance {money(topP.balance + Number(top.amount))}, about {num((topP.balance + Number(top.amount)) / topP.rate)} {unit === 'SMS' ? 'SMS' : 'emails'}.</p> : null}
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
