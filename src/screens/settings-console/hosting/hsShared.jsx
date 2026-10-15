'use client';
// hsShared — parts shared by the Hosting tabs (Settings › Hosting, SetHosting.jsx): the CSS, a card, a switch row, a
// state badge for DNS / email records, copy-to-clipboard, a file download and the domain picker.

import React from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';

export const HS_CSS = `
.hs-tabs{margin-bottom:var(--space-3)}
.hs-card{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.hs-card+.hs-card{margin-top:var(--space-3)}
.hs-card h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hs-card__head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hs-card__head h2{flex:1;min-width:0}
.hs-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.hs-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.hs-row:first-child{border-top:0}
.hs-row__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:var(--text-sm);color:var(--text-heading)}
.hs-row__text small{font-size:var(--text-xs);color:var(--text-muted)}
.hs-row select,.hs-row .gc-input{width:auto;min-width:150px;max-width:240px}
.hs-code{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-heading);overflow-wrap:anywhere}
.hs-code span{flex:1;min-width:0}
.hs-code button{flex:none;border:0;background:none;padding:0;font:inherit;font-family:var(--font-sans);font-weight:var(--weight-medium);color:var(--text-link);cursor:pointer}
.hs-list{display:flex;flex-direction:column}
.hs-rec{display:grid;grid-template-columns:64px minmax(90px,150px) minmax(0,1fr) 72px 96px auto;align-items:center;gap:var(--space-2);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-xs)}
.hs-rec--head{min-height:32px;border-top:0;color:var(--text-muted);font-weight:var(--weight-medium)}
.hs-rec b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hs-rec__name,.hs-rec__val{font-family:var(--font-data);color:var(--text-heading);overflow-wrap:anywhere;min-width:0}
.hs-rec__val small{display:block;font-family:var(--font-sans);color:var(--text-muted)}
.hs-rec__acts{display:flex;justify-content:flex-end;gap:4px}
.hs-tag{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.hs-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.hs-opt{display:flex;flex-direction:column;gap:4px;min-width:0;white-space:normal;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer;color:var(--text-body)}
.hs-card .hs-opt,.hs-card .hs-opt small{white-space:normal}
.hs-opt b{display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hs-opt small{font-size:var(--text-xs);color:var(--text-muted)}
.hs-opt[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.hs-seg{display:inline-flex;flex-wrap:wrap;gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.hs-seg button{min-height:28px;padding:0 12px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.hs-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.hs-form{display:flex;flex-direction:column;gap:var(--space-3)}
.hs-form .gc-label{margin-bottom:4px}
.hs-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.hs-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.hs-acts{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hs-attn{display:flex;align-items:center;gap:var(--space-2);min-height:40px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.hs-attn:first-child{border-top:0}
.hs-attn span{flex:1;min-width:0}
.hs-dot{flex:none;width:8px;height:8px;border-radius:var(--radius-full);background:var(--text-muted)}
.hs-dot--error{background:var(--text-danger)}.hs-dot--warning{background:var(--text-warning)}.hs-dot--info{background:var(--primary)}
.hs-chips{display:flex;flex-wrap:wrap;gap:6px}
.hs-chip{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.hs-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.hs-bar{height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.hs-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--viz-1)}
.hs-big{font-family:var(--font-data);font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hs-figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.hs-fig{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.hs-fig small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .hs-rec{grid-template-columns:56px minmax(0,1fr) auto;row-gap:2px}
  .hs-rec--head{display:none}
  .hs-rec__val{grid-column:1/-1}
  .hs-rec__ttl{display:none}
  .hs-rec__state{grid-column:2}
  .hs-opts,.hs-two{grid-template-columns:minmax(0,1fr)}
  .hs-card__head h2{flex:1 1 100%}
  .hs-figs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hs-row{flex-wrap:wrap}
  .hs-row select,.hs-row .gc-input{max-width:none;flex:1 1 100%}
  .hs-seg button{min-height:36px}
  .hs-chip{min-height:36px}
}
`;

export const copy = (text) => {
  try { navigator.clipboard.writeText(text).then(() => toast('Copied'), () => toast('Couldn’t copy. Select the text instead.', { tone: 'error' })); } catch { toast('Couldn’t copy. Select the text instead.', { tone: 'error' }); }
};
/** Save text as a file (the merchant's own data). */
export function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
/** Say what a lib call did: its error as a toast, or `msg`. → true when it worked. */
export const done = (res, msg) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (msg) toast(msg); return true; };

export function Card({ title, sub, actions, children, id }) {
  return (
    <section className="ix-card hs-card" aria-labelledby={id} id={id ? id + '-card' : undefined}>
      {title ? <div className="hs-card__head"><h2 id={id}>{title}</h2>{actions}</div> : null}
      {sub ? <p className="hs-sub">{sub}</p> : null}
      {children}
    </section>
  );
}
export function Switch({ on, onChange, label, disabled }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" disabled={disabled} onClick={() => onChange(!on)}><span className="gc-switch__knob" /></button>;
}
export function SwitchRow({ label, help, on, onChange, disabled }) {
  return (
    <div className="hs-row">
      <span className="hs-row__text">{label}{help ? <small>{help}</small> : null}</span>
      <Switch on={on} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}
const STATE = {
  ok: ['Working', 'success'], live: ['Live', 'success'], updating: ['Updating', 'info'], checking: ['Checking', 'info'], missing: ['Not found', 'error'],
  wrong: ['Wrong value', 'error'], unknown: ['Not checked', 'neutral'], 'needs-value': ['Paste the key', 'warning'], active: ['Active', 'success'],
  pending: ['Waiting', 'warning'], waiting: ['Waiting for the registrar', 'warning'], issuing: ['Being issued', 'info'], soon: ['Ends soon', 'warning'], expired: ['Expired', 'error'],
};
export function StateBadge({ state }) {
  const s = STATE[state] || [state, 'neutral'];
  return <StatusBadge tone={s[1]}>{s[0]}</StatusBadge>;
}
export function Code({ text, label }) {
  return <div className="hs-code"><span>{text}</span><button type="button" aria-label={'Copy ' + (label || 'value')} onClick={() => copy(text)}>Copy</button></div>;
}
/** The custom domain a tab works on. */
export function DomainPicker({ domains, host, onChange }) {
  if (domains.length < 2) return null;
  return (
    <div className="hs-row" style={{ borderTop: 0, paddingTop: 0 }}>
      <span className="hs-row__text">Domain</span>
      <select className="gc-input gc-select" aria-label="Domain" value={host} onChange={(e) => onChange(e.target.value)}>
        {domains.map((d) => <option key={d.host} value={d.host}>{d.host}</option>)}
      </select>
    </div>
  );
}
export function NoDomain({ onDomains }) {
  return (
    <Card>
      <p className="hs-sub" style={{ fontSize: 'var(--text-sm)' }}>Connect your own domain first. DNS, email and certificates are set up for it.</p>
      <div><button type="button" className="ix-btn ix-btn--primary" onClick={onDomains}><Icon name="globe" width="16" height="16" aria-hidden="true" />Connect a domain</button></div>
    </Card>
  );
}
export const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtWhen = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
export const fmtSize = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB');
