'use client';
// Communications (super admin) — the parts the five pages share: the data hook (comms store + platform data, moving
// what is due), the CSS, money and number text, the skeleton and error card, a list row, the message preview (a phone
// bubble for SMS, an email card), the {{variable}} chips, the Send SMS / Compose email sheet and the message detail sheet.
// UI copied from the merchant panel's Messaging campaigns (mc-bubble, Before sending) and Order notifications (chips,
// character count, preview, test send); the data is lib/admin/comms.js, never the merchant libs.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip, EmptyState } from '@/components/ui';
import { KV, Menu } from '@/components/ui/IndexKit';
import { useAdminStore } from '@/lib/admin/store';
import { formatBDT } from '@/lib/format';
import {
  comms, runDue, VARIABLES, CH_LABEL, STATUS_TONE, KIND_LABEL, contacts, audiences, templateBy, primaryProvider,
  smsParts, fill, varsFor, validPhone, validEmail, normPhone, sendMessage, retryMessages, messageText, whenText, cancelSend, sendScheduledNow,
} from '@/lib/admin/comms';
import { usePlatform } from '../AdminShell';

// ---- data ---------------------------------------------------------------------------------------------------------------
/** { data, t, live, db }: the comms store and the platform data, both loaded after mount; moves what is due. */
export function useComms() {
  const { data, t, live } = useAdminStore(comms);
  const p = usePlatform();
  useEffect(() => {
    if (!live) return undefined;
    runDue();
    const id = window.setInterval(() => runDue(), 15000);
    return () => window.clearInterval(id);
  }, [live]);
  return { data, t, live: live && p.live, db: p.db };
}

/** Read ?key= after mount and keep it in the address. */
export function useQueryState(key, allowed, fallback) {
  const [v, setV] = useState(fallback);
  useEffect(() => {
    const x = new URLSearchParams(window.location.search).get(key);
    if (x && (!allowed || allowed.includes(x))) setV(x);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (nv) => {
    setV(nv);
    const p = new URLSearchParams(window.location.search);
    if (nv && nv !== fallback) p.set(key, nv); else p.delete(key);
    ['status', 'q'].forEach((k) => { if (k !== key && key === 'tab') p.delete(k); });
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  };
  return [v, set];
}
export const queryParam = (k) => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(k));

// ---- text ------------------------------------------------------------------------------------------------------------------
export const money = (n) => formatBDT(Math.round(Number(n) || 0));
export const money2 = (n) => formatBDT(Number(n) || 0, { decimals: n && n < 10 && n % 1 ? 2 : 0 });
export const num = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');
export const pct = (x, d = 1) => (x == null ? '—' : x.toFixed(d).replace(/\.0$/, '') + '%');
export const plural = (n, one, many) => num(n) + ' ' + (n === 1 ? one : many || one + 's');
export const short = (n) => (n >= 1e5 ? (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(Math.round(n)));
export const delta = (a, b) => (b ? ((a - b) / b) * 100 : null);
export const deltaText = (x) => (x == null || !isFinite(x) ? null : (x >= 0 ? '▲ ' : '▼ ') + Math.abs(x).toFixed(0) + '%');
export { whenText };
/** A <input type=datetime-local> value for a time (local clock). */
export function toLocalInput(ms) {
  if (!ms) return '';
  const d = new Date(ms); const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export const statusTone = (s) => STATUS_TONE[s] || 'neutral';

// ---- CSS -----------------------------------------------------------------------------------------------------------------
export const COMMS_CSS = `
.cm-skel{height:300px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:cm-sk 1.4s ease infinite}
.cm-skel--strip{height:72px}
@keyframes cm-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.cm-skel{animation:none}}
.cm-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.cm-sub{display:block;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.cm-cut{display:block;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading)}
.cm-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.cm-addr{font-family:var(--font-data)}
.cm-filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.cm-filters .ix-search{flex:1 1 240px;max-width:340px}
.cm-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.cm-rows{display:flex;flex-direction:column}
.cm-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.cm-row:first-child{border-top:0}
a.cm-row:hover b{color:var(--primary)}
.cm-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.cm-row__main b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.cm-row__main small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.cm-row__end{flex:none;display:flex;align-items:center;gap:var(--space-2)}
.cm-dot{flex:none;width:8px;height:8px;border-radius:var(--radius-full);background:var(--success)}
.cm-dot.is-warn{background:var(--warning)}
.cm-dot.is-off{background:var(--border-strong)}
.cm-dot.is-err{background:var(--error)}
.cm-empty{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.cm-form{display:flex;flex-direction:column;gap:var(--space-4)}
.cm-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.cm-field .gc-label{margin:0;display:flex;align-items:center;gap:4px}
.cm-field .gc-help{margin:0}
.cm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.cm-count{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.cm-count b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.cm-count .is-warn{color:var(--text-warning)}
.cm-vars{display:flex;flex-wrap:wrap;gap:6px}
.cm-vars button{height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.cm-vars button:hover{border-color:var(--primary);color:var(--primary)}
.cm-vars button.is-used{border-color:var(--fill-primary-soft);background:var(--fill-primary-soft);color:var(--primary)}
.cm-vars button:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.cm-phone{display:flex;flex-direction:column;gap:var(--space-2);max-width:340px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-2xl);background:var(--surface-page)}
.cm-phone__head{display:flex;align-items:center;gap:var(--space-2);padding-bottom:var(--space-2);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.cm-phone__head b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.cm-bubble{align-self:flex-start;max-width:92%;padding:10px 12px;border-radius:var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm);background:var(--surface-card);box-shadow:var(--shadow-xs);font-size:var(--text-sm);line-height:1.5;color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.cm-bubble.is-bn,.cm-mail.is-bn .cm-mail__body,.cm-mail.is-bn .cm-mail__subj{font-family:var(--font-bn)}
.cm-phone__time{font-size:var(--text-2xs);color:var(--text-muted)}
.cm-mail{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);overflow:hidden}
.cm-mail__head{display:flex;flex-direction:column;gap:2px;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.cm-mail__subj{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.cm-mail__body{padding:var(--space-4);font-size:var(--text-sm);line-height:1.6;color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
.cm-mail__brand{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.cm-unfilled{padding:0 2px;border-radius:var(--radius-sm);background:var(--fill-warning-soft);color:var(--text-warning)}
.cm-who{display:flex;flex-direction:column;gap:var(--space-2)}
.cm-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.cm-list li{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.cm-list li:first-child{border-top:0}
.cm-list b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cm-list small{font-size:var(--text-xs);color:var(--text-muted);white-space:pre-wrap;overflow-wrap:anywhere}
.cm-total{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.cm-total .ix-sum{font-size:var(--text-sm)}
.cm-acts{width:1%;white-space:nowrap;text-align:right}
.cm-steps{display:flex;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.cm-steps b{color:var(--text-heading);font-weight:var(--weight-medium)}
@media (max-width:640px){.cm-two{grid-template-columns:minmax(0,1fr)}.cm-filters{padding:6px}.cm-filters .ix-search{max-width:none}}
`;

// ---- small parts -------------------------------------------------------------------------------------------------------------
export function Skel({ label, strip = true }) {
  return <div className="ix-page" aria-busy="true" aria-label={label}>{strip ? <div className="cm-skel cm-skel--strip" /> : null}<div className="cm-skel" /></div>;
}
export function LoadError({ text = 'This page could not be worked out.', onRetry }) {
  return (
    <section className="ix-card"><div className="cm-err" role="alert">
      <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
      <p style={{ margin: 0 }}>{text}</p>
      {onRetry ? <button type="button" className="ix-btn" onClick={onRetry}>Try again</button> : null}
    </div></section>
  );
}
export function Card({ title, link, action, children, label, flush }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      <div className="ix-card__head"><h2>{title}</h2>{action || (link ? <Link href={link.href}>{link.label}</Link> : null)}</div>
      <div className={flush ? '' : 'cm-body'}>{children}</div>
    </section>
  );
}
export function Row({ title, sub, end, href, onClick, dot }) {
  const inner = <>{dot ? <span className={'cm-dot' + (dot === 'ok' ? '' : ' is-' + dot)} aria-hidden="true" /> : null}<span className="cm-row__main"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>{end ? <span className="cm-row__end">{end}</span> : null}</>;
  if (href) return <Link className="cm-row" href={href}>{inner}</Link>;
  if (onClick) return <button type="button" className="cm-row" style={{ width: '100%', border: 0, borderTop: '1px solid var(--border-subtle)', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }} onClick={onClick}>{inner}</button>;
  return <div className="cm-row">{inner}</div>;
}
export function Status({ s }) { return <StatusBadge tone={statusTone(s)}>{s}</StatusBadge>; }

/** Unfilled {{variables}} stay visible (highlighted) in a preview. */
function Marked({ text }) {
  const parts = String(text || '').split(/(\{\{\s*[a-z_]+\s*\}\})/g);
  return <>{parts.map((p, i) => (/^\{\{/.test(p) ? <span key={i} className="cm-unfilled">{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}
/** SMS as a phone bubble; email as a card. */
export function Preview({ ch, subject, body, vars, lang, from, to, time = 'now' }) {
  const filled = fill(body, vars);
  const bn = lang === 'bn';
  if (ch === 'sms') {
    return (
      <div className="cm-phone" aria-label="SMS preview">
        <div className="cm-phone__head"><Icon name="message-square" width="14" height="14" aria-hidden="true" /><b>{from || 'GridCommerce'}</b><span>· {time}</span></div>
        <div className={'cm-bubble' + (bn ? ' is-bn' : '')}>{filled ? <Marked text={filled} /> : <span className="ix-muted">Your message shows here.</span>}</div>
      </div>
    );
  }
  return (
    <div className={'cm-mail' + (bn ? ' is-bn' : '')} aria-label="Email preview">
      <div className="cm-mail__head">
        <span className="cm-mail__subj">{subject ? <Marked text={fill(subject, vars)} /> : 'No subject yet'}</span>
        <span>From {from || 'GridCommerce <hello@gridcommerce.com.bd>'}{to ? ' · to ' + to : ''}</span>
      </div>
      <div className="cm-mail__body">{filled ? <Marked text={filled} /> : <span className="ix-muted">Your email shows here.</span>}</div>
      <div className="cm-mail__brand"><Icon name="store" width="14" height="14" aria-hidden="true" />GridCommerce · House 12, Road 7, Dhanmondi, Dhaka · Unsubscribe</div>
    </div>
  );
}

/** The {{variable}} chips: a tap puts the variable at the cursor of the field last used. */
export function VarChips({ onPick, used = [] }) {
  return (
    <div className="cm-vars" role="group" aria-label="Variables">
      {VARIABLES.map(([k, label]) => <button key={k} type="button" title={label} className={used.includes(k) ? 'is-used' : ''} onClick={() => onPick(k)}>{`{{${k}}}`}</button>)}
    </div>
  );
}
/** Insert a {{variable}} at the cursor of a textarea / input ref; returns the new value. */
export function insertAt(el, cur, k) {
  const tok = `{{${k}}}`;
  const a = el && el.selectionStart != null ? el.selectionStart : cur.length;
  const b = el && el.selectionEnd != null ? el.selectionEnd : a;
  const next = cur.slice(0, a) + tok + cur.slice(b);
  setTimeout(() => { if (el) { el.focus(); el.setSelectionRange(a + tok.length, a + tok.length); } }, 0);
  return next;
}
export function SmsCount({ text }) {
  const p = smsParts(text);
  return (
    <span className="cm-count" aria-live="polite">
      <span><b>{p.chars}</b> characters · <b>{p.parts}</b> SMS{p.unicode ? ' (Bangla, 70 a part)' : ' (160 a part)'}</span>
      {p.parts > 2 ? <span className="is-warn">Long: each part is charged</span> : null}
    </span>
  );
}

// ---- Send SMS / Compose email ----------------------------------------------------------------------------------------------
/** preset: { mode: 'one'|'list'|'audience', addr, name, audience, tpl } */
export function ComposeSheet({ open, ...props }) {
  // mounted only while open, so every opening starts from the preset
  return open && props.data ? <Compose {...props} /> : null;
}
function Compose({ ch, onClose, data, t, preset }) {
  const tpls = useMemo(() => data.templates.filter((x) => x.ch === ch && x.status === 'Active'), [data, ch]);
  const [s, setS] = useState(() => {
    const p = preset || {};
    const tpl = templateBy(data, p.tpl) || tpls[0];
    return { mode: p.mode || 'one', addr: p.addr || '', name: p.name || '', list: p.list || '', audience: p.audience || 'trials-ending', tpl: tpl ? tpl.id : '', lang: 'en', subject: tpl && ch === 'email' ? tpl.en.subject : '', body: tpl ? tpl.en.body : '', when: 'now', at: null };
  });
  const [step, setStep] = useState('edit');
  const [err, setErr] = useState({});
  const bodyRef = useRef(null);
  const subjRef = useRef(null);
  const [field, setField] = useState('body');
  const auds = useMemo(() => audiences(t), []); // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo(() => contacts(), []);
  const set = (patch) => { setS((x) => ({ ...x, ...patch })); setErr({}); };
  const pickTpl = (id, lang = s.lang) => {
    const x = templateBy(data, id);
    if (!x) { set({ tpl: '' }); return; }
    const side = x[lang] && x[lang].body ? x[lang] : x.en;
    set({ tpl: id, lang, body: side.body, subject: ch === 'email' ? side.subject || '' : '' });
  };
  const okAddr = (a) => (ch === 'sms' ? validPhone(a) : validEmail(a));
  const match = (a) => {
    const key = ch === 'sms' ? normPhone(a).replace(/\D/g, '') : String(a).trim().toLowerCase();
    return all.find((c) => (ch === 'sms' ? c.phone.replace(/\D/g, '') === key : c.email.toLowerCase() === key)) || null;
  };
  // who gets it
  let recipients = [];
  let bad = [];
  if (s.mode === 'one') {
    const a = s.addr.trim();
    if (a) { const c = match(a); if (c) recipients = [c]; else if (okAddr(a)) recipients = [{ k: 'x', addr: ch === 'sms' ? normPhone(a) : a, name: s.name.trim() }]; else bad = [a]; }
  } else if (s.mode === 'list') {
    const seen = new Set();
    String(s.list).split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean).forEach((a) => {
      const k = ch === 'sms' ? normPhone(a) : a.toLowerCase();
      if (seen.has(k)) return; seen.add(k);
      const c = match(a);
      if (c) recipients.push(c); else if (okAddr(a)) recipients.push({ k: 'x', addr: k, name: '' }); else bad.push(a);
    });
  } else {
    const au = auds.find((x) => x.key === s.audience);
    recipients = au ? au.list : [];
  }
  const n = recipients.length;
  const first = recipients[0];
  const vars = varsFor(first && first.k !== 'x' ? first : { name: first ? first.name : '' }, t);
  const prov = primaryProvider(data, ch);
  const parts = ch === 'sms' ? smsParts(fill(s.body, vars)).parts : 1;
  const cost = prov ? n * parts * prov.rate : 0;
  const later = s.when === 'later';
  const addrOf = (c) => (c.k === 'x' ? c.addr : ch === 'sms' ? c.phone : c.email);

  const check = () => {
    const e = {};
    if (!n) e.to = s.mode === 'one' ? (s.addr.trim() ? (ch === 'sms' ? 'That isn’t a Bangladesh mobile number (01XXXXXXXXX).' : 'That email address doesn’t look right.') : (ch === 'sms' ? 'Add a number.' : 'Add an email address.')) : s.mode === 'list' ? 'Add at least one valid ' + (ch === 'sms' ? 'number.' : 'address.') : 'Nobody is in this audience right now.';
    if (ch === 'email' && !s.subject.trim()) e.subject = 'Add a subject.';
    if (!s.body.trim()) e.body = 'Write the message.';
    if (later && (!s.at || s.at <= comms.now() + 60e3)) e.at = 'Pick a time in the future.';
    if (!prov) e.to = `No ${CH_LABEL[ch]} provider is on.`;
    setErr(e);
    return !Object.keys(e).length;
  };
  const go = () => {
    if (!check()) return;
    const res = sendMessage({ ch, recipients, tpl: s.tpl || null, lang: s.lang, subject: s.subject, body: s.body, at: later ? s.at : null, name: s.mode === 'audience' ? (auds.find((x) => x.key === s.audience) || {}).label : undefined });
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    onClose();
    if (res.scheduled) toast(`${plural(res.count, ch === 'sms' ? 'SMS' : 'email', ch === 'sms' ? 'SMS' : 'emails')} scheduled for ${whenText(s.at, t)}`);
    else if (res.failed) toast(`Sent to ${plural(res.sent, 'recipient')}. ${res.failed} failed: ${ch === 'sms' ? 'invalid number' : 'invalid address'}.`, { tone: res.sent ? undefined : 'error' });
    else toast(`${ch === 'sms' ? 'SMS' : 'Email'} sent to ${n === 1 ? (first.name || addrOf(first)) : plural(n, 'recipient')} via ${res.provider}`);
  };
  const next = () => { if (n > 1) { if (check()) setStep('preview'); } else go(); };
  const insert = (k) => {
    if (field === 'subject' && ch === 'email') set({ subject: insertAt(subjRef.current, s.subject, k) });
    else set({ body: insertAt(bodyRef.current, s.body, k) });
  };
  const title = ch === 'sms' ? 'Send SMS' : 'Compose email';
  const what = ch === 'sms' ? 'SMS' : 'email';
  const goLabel = later ? `Schedule ${n > 1 ? 'for ' + num(n) : ''}`.trim() : n > 1 ? `Send to ${num(n)}` : 'Send';

  return (
    <Sheet open title={step === 'preview' ? `Check before sending · ${plural(n, 'recipient')}` : title} onClose={onClose}
      footer={step === 'preview' ? (<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setStep('edit')}>Back</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={go}>{goLabel}</button>
      </>) : (<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={next}>{n > 1 ? 'Preview' : later ? 'Schedule' : 'Send'}</button>
      </>)}>
      {step === 'preview' ? (
        <div className="cm-form">
          <div className="cm-total">
            <dl className="ix-sum">
              <dt>Recipients</dt><dd>{num(n)}</dd>
              {ch === 'sms' ? <><dt>SMS each</dt><dd>{parts}</dd></> : null}
              <dt>Provider</dt><dd>{prov ? prov.name : '—'}</dd>
              <dt>When</dt><dd>{later ? whenText(s.at, t) : 'Now'}</dd>
              <dt className="is-total">Cost</dt><dd className="is-total">{money2(cost)}</dd>
            </dl>
          </div>
          <div className="cm-field">
            <span className="gc-label">First {Math.min(5, n)} of {num(n)}</span>
            <ul className="cm-list">
              {recipients.slice(0, 5).map((c, i) => {
                const v = varsFor(c.k === 'x' ? { name: c.name } : c, t);
                return <li key={i}><b>{c.name || addrOf(c)}{c.org ? ' · ' + c.org : ''}</b><small className="cm-addr">{addrOf(c)}</small><small>{ch === 'email' ? fill(s.subject, v) + ' — ' : ''}{fill(s.body, v).slice(0, 160)}{fill(s.body, v).length > 160 ? '…' : ''}</small></li>;
              })}
            </ul>
          </div>
          {bad.length ? <p className="gc-help" style={{ margin: 0 }}>{plural(bad.length, 'entry', 'entries')} left out: {bad.slice(0, 4).join(', ')}{bad.length > 4 ? ' …' : ''}</p> : null}
        </div>
      ) : (
        <div className="cm-form">
          <div className="cm-field">
            <span className="gc-label">To</span>
            <div className="ix-chips" role="group" aria-label="Who gets it">
              {[['one', ch === 'sms' ? 'One number' : 'One address'], ['list', 'A list'], ['audience', 'Saved audience']].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={s.mode === k} onClick={() => set({ mode: k })}>{l}</button>)}
            </div>
          </div>
          {s.mode === 'one' ? (
            <div className="cm-two">
              <div className="cm-field">
                <label className="gc-label" htmlFor="cm-to">{ch === 'sms' ? 'Mobile number' : 'Email address'}</label>
                <input id="cm-to" className={'gc-input cm-addr' + (err.to ? ' gc-input--error' : '')} list="cm-contacts" data-autofocus inputMode={ch === 'sms' ? 'tel' : 'email'} placeholder={ch === 'sms' ? '01XXX-XXXXXX' : 'name@example.com'} value={s.addr} aria-invalid={err.to ? true : undefined} onChange={(e) => set({ addr: e.target.value })} />
                <datalist id="cm-contacts">{all.map((c) => <option key={c.k + c.id} value={ch === 'sms' ? c.phone : c.email}>{c.name} · {c.org}</option>)}</datalist>
              </div>
              <div className="cm-field">
                <label className="gc-label" htmlFor="cm-name">Name</label>
                <input id="cm-name" className="gc-input" value={first && first.k !== 'x' ? first.name : s.name} disabled={!!(first && first.k !== 'x')} onChange={(e) => set({ name: e.target.value })} placeholder="Optional" />
              </div>
            </div>
          ) : s.mode === 'list' ? (
            <div className="cm-field">
              <label className="gc-label" htmlFor="cm-list">{ch === 'sms' ? 'Numbers' : 'Addresses'}</label>
              <textarea id="cm-list" className={'gc-input cm-addr' + (err.to ? ' gc-input--error' : '')} rows={4} placeholder={ch === 'sms' ? 'One per line, or separated by commas' : 'One per line, or separated by commas'} value={s.list} onChange={(e) => set({ list: e.target.value })} />
              <span className="cm-count"><span><b>{num(n)}</b> valid{bad.length ? <> · <span className="is-warn">{bad.length} not valid</span></> : null}</span></span>
            </div>
          ) : (
            <div className="cm-field">
              <label className="gc-label" htmlFor="cm-aud">Audience</label>
              <select id="cm-aud" className="gc-input gc-select" value={s.audience} onChange={(e) => set({ audience: e.target.value })}>
                {auds.map((a) => <option key={a.key} value={a.key}>{a.label} ({a.list.length})</option>)}
              </select>
              <p className="gc-help">{(auds.find((a) => a.key === s.audience) || {}).note}</p>
            </div>
          )}
          {err.to ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err.to}</p> : null}

          <div className="cm-two">
            <div className="cm-field">
              <label className="gc-label" htmlFor="cm-tpl">Template</label>
              <select id="cm-tpl" className="gc-input gc-select" value={s.tpl} onChange={(e) => pickTpl(e.target.value)}>
                <option value="">No template</option>
                {tpls.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
            <div className="cm-field">
              <span className="gc-label">Language</span>
              <div className="ix-chips" role="group" aria-label="Language">
                {[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={s.lang === k} onClick={() => (s.tpl ? pickTpl(s.tpl, k) : set({ lang: k }))}>{l}</button>)}
              </div>
            </div>
          </div>
          {ch === 'email' ? (
            <div className="cm-field">
              <label className="gc-label" htmlFor="cm-subj">Subject</label>
              <input id="cm-subj" ref={subjRef} className={'gc-input' + (err.subject ? ' gc-input--error' : '')} value={s.subject} onFocus={() => setField('subject')} onChange={(e) => set({ subject: e.target.value })} />
              {err.subject ? <p className="gc-help gc-help--error" role="alert">{err.subject}</p> : null}
            </div>
          ) : null}
          <div className="cm-field">
            <label className="gc-label" htmlFor="cm-body">{ch === 'sms' ? 'Message' : 'Email'}</label>
            <textarea id="cm-body" ref={bodyRef} className={'gc-input' + (err.body ? ' gc-input--error' : '')} rows={ch === 'sms' ? 4 : 8} value={s.body} onFocus={() => setField('body')} onChange={(e) => set({ body: e.target.value })} />
            {err.body ? <p className="gc-help gc-help--error" role="alert">{err.body}</p> : ch === 'sms' ? <SmsCount text={fill(s.body, vars)} /> : null}
          </div>
          <VarChips onPick={insert} />
          <div className="cm-field">
            <span className="gc-label">Preview{first ? ` · ${first.name || addrOf(first)}` : ''}</span>
            <Preview ch={ch} subject={s.subject} body={s.body} vars={vars} lang={s.lang} from={ch === 'sms' ? prov && prov.sender : undefined} />
          </div>
          <div className="cm-field">
            <span className="gc-label">When</span>
            <div className="ix-chips" role="group" aria-label="When">
              <button type="button" className="ix-chip" aria-pressed={!later} onClick={() => set({ when: 'now' })}>Send now</button>
              <button type="button" className="ix-chip" aria-pressed={later} onClick={() => set({ when: 'later', at: s.at || comms.now() + 3 * 3600e3 })}>At a time</button>
            </div>
            {later ? <input type="datetime-local" aria-label="Date and time" className={'gc-input' + (err.at ? ' gc-input--error' : '')} value={toLocalInput(s.at)} onChange={(e) => set({ at: new Date(e.target.value).getTime() || null })} /> : null}
            {err.at ? <p className="gc-help gc-help--error" role="alert">{err.at}</p> : null}
          </div>
          <div className="cm-total">
            <dl className="ix-sum">
              <dt>{plural(n, 'recipient')}{ch === 'sms' ? ` × ${parts} SMS` : ''}</dt><dd>{money2(cost)}</dd>
            </dl>
            <span className="cm-count"><span>{prov ? `${prov.name} · ${money2(prov.rate)} per ${what}` : `No ${what} provider is on`}{prov ? ` · balance ${money(prov.balance)}` : ''}</span>
              <InfoTip text={ch === 'sms' ? 'Charged per SMS part. Bangla text uses 70 characters a part, English 160.' : 'Charged per email by the provider.'} /></span>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ---- one message ----------------------------------------------------------------------------------------------------------
export function MessageSheet({ m, data, t, onClose }) {
  if (!m) return <Sheet open={false} title="" onClose={onClose} />;
  const txt = messageText(data, m, t);
  const tpl = templateBy(data, m.tpl);
  const prov = data.providers.find((p) => p.id === m.prov);
  const failed = m.st === 'Failed' || m.st === 'Bounced';
  const retry = () => {
    const r = retryMessages([m.id]);
    onClose();
    toast(r.sent ? 'Sent again' : `It fails again: ${String(m.err || 'bad address').toLowerCase()}. Fix the ${m.ch === 'sms' ? 'number' : 'address'} first.`, { tone: r.sent ? undefined : 'error' });
  };
  const contactHref = m.contact ? (m.contact.k === 'merchant' ? '/admin/merchant?id=' + m.contact.id + '&tab=messaging' : '/admin/leads') : null;
  return (
    <Sheet open title={m.ch === 'sms' ? 'SMS' : 'Email'} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        {failed ? <button type="button" className="gc-btn gc-btn--solid" onClick={retry}>Send again</button> : null}
      </>}>
      <div className="cm-form">
        <KV rows={[
          ['To', contactHref ? <Link href={contactHref}>{m.name}{m.org ? ' · ' + m.org : ''}</Link> : m.name || m.addr],
          [m.ch === 'sms' ? 'Number' : 'Address', <span className="cm-addr" key="a">{m.addr}</span>],
          ['Status', <span key="s"><Status s={m.st} />{m.err ? <span className="cm-sub" style={{ whiteSpace: 'normal' }}>{m.err}</span> : null}</span>],
          ['Sent', whenText(m.at, t)],
          m.oa ? ['Opened', whenText(m.oa, t)] : null,
          m.ca ? ['Clicked', whenText(m.ca, t)] : null,
          ['From', `${KIND_LABEL[m.kind] || m.kind}${m.auto ? ' · ' + ((data.automations.find((a) => a.id === m.auto) || {}).name || m.auto) : ''}${m.by && m.by !== 'Automation' ? ' · ' + m.by : ''}`],
          ['Template', tpl ? <Link key="t" href={'/admin/templates/edit?id=' + tpl.id}>{tpl.name}</Link> : 'None'],
          ['Provider', prov ? prov.name : m.prov],
          m.ch === 'sms' ? ['Parts', String(m.seg || 1)] : null,
          ['Cost', money2(m.cost)],
          ['ID', <span key="i" className="cm-id">{m.id}</span>],
        ]} />
        <Preview ch={m.ch} subject={txt.subject} body={txt.body} vars={{}} lang={m.lang} to={m.addr} time={whenText(m.at, t)} />
      </div>
    </Sheet>
  );
}

/** A message list's rows on phones and desktop: name, address, template, status, when, cost. */
export function MessageTable({ rows, data, t, onOpen, label, showChannel }) {
  return (
    <>
      <ul className="ix-plist" aria-label={label}>
        {rows.map((m) => (
          <li key={m.id}><button type="button" className="ix-pitem" onClick={() => onOpen(m)}>
            <span className="ix-pitem__top"><b>{m.name}</b><Status s={m.st} /></span>
            <span className="ix-pitem__mid">{m.org ? m.org + ' · ' : ''}{(templateBy(data, m.tpl) || {}).name || (m.subject || 'Custom message')}</span>
            <span className="ix-pitem__mid">{whenText(m.at, t)} · {KIND_LABEL[m.kind]}{m.err ? ' · ' + m.err : ''}</span>
          </button></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">{label}</caption>
          <thead><tr>
            <th scope="col">Sent</th><th scope="col">To</th>{showChannel ? <th scope="col">Channel</th> : null}<th scope="col">Message</th><th scope="col">Status</th><th scope="col" className="ix-num">Cost</th>
          </tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} tabIndex={0} onClick={() => onOpen(m)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(m); }}>
                <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>{whenText(m.at, t)}</td>
                <td><span className="cm-row__main" style={{ maxWidth: 220 }}><b>{m.name}</b><small>{m.org ? m.org + ' · ' : ''}<span className="cm-addr">{m.addr}</span></small></span></td>
                {showChannel ? <td>{CH_LABEL[m.ch]}</td> : null}
                <td><span className="cm-cut">{(templateBy(data, m.tpl) || {}).name || m.subject || 'Custom message'}</span><span className="cm-sub">{KIND_LABEL[m.kind]}{m.by && m.by !== 'Automation' ? ' · ' + m.by : ''}</span></td>
                <td><Status s={m.st} />{m.err ? <span className="cm-sub" title={m.err} style={{ maxWidth: 180 }}>{m.err}</span> : null}</td>
                <td className="ix-num"><span className="cm-fig">{m.cost ? money2(m.cost) : '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---- scheduled sends (SMS and Email) -----------------------------------------------------------------------------------
export function ScheduledPanel({ ch, rows, data, t, prov, onCompose }) {
  const what = ch === 'sms' ? 'SMS' : 'emails';
  const now = async (s) => {
    const ok = await confirmDialog({ title: `Send “${s.name}” now?`, body: `${plural(s.count, 'recipient')} get it now instead of ${whenText(s.at, t)}.`, confirmLabel: 'Send now' });
    if (!ok) return;
    const r = sendScheduledNow(s.id);
    toast(r.ok ? `Sent to ${plural(r.sent, 'recipient')}${r.failed ? ` · ${r.failed} failed` : ''}` : r.error, r.ok ? undefined : { tone: 'error' });
  };
  const cancel = async (s) => {
    const ok = await confirmDialog({ title: `Cancel “${s.name}”?`, body: `Nobody gets it. You can send it again from ${ch === 'sms' ? 'Send SMS' : 'Compose'}.`, confirmLabel: 'Cancel send', tone: 'danger' });
    if (!ok) return;
    const r = cancelSend(s.id);
    toast(r.ok ? 'Scheduled send cancelled' : r.error, r.ok ? undefined : { tone: 'error' });
  };
  return rows.length ? (
    <>
      <ul className="ix-plist" aria-label={`Scheduled ${what}`}>
        {rows.map((s) => (
          <li key={s.id}><div className="ix-pitem">
            <span className="ix-pitem__top"><b>{s.name}</b><StatusBadge tone="primary">{whenText(s.at, t)}</StatusBadge></span>
            <span className="ix-pitem__mid">{plural(s.count, 'recipient')} · {(templateBy(data, s.tpl) || {}).name || 'Custom'} · {s.by}</span>
            <span className="ix-pitem__tags"><button type="button" className="ix-btn ix-btn--sm" onClick={() => now(s)}>Send now</button><button type="button" className="ix-btn ix-btn--sm" onClick={() => cancel(s)}>Cancel</button></span>
          </div></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep ix-table--static">
          <caption className="sr-only">Scheduled {what}</caption>
          <thead><tr><th scope="col">Send</th><th scope="col">Goes out</th><th scope="col" className="ix-num">Recipients</th><th scope="col" className="ix-num">Cost, about</th><th scope="col">By</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td><span className="cm-row__main"><b>{s.name}</b><small>{(templateBy(data, s.tpl) || {}).name || 'Custom message'}</small></span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{whenText(s.at, t)}</td>
                <td className="ix-num"><span className="cm-fig">{num(s.count)}</span></td>
                <td className="ix-num"><span className="cm-fig">{prov ? money2(s.count * (ch === 'sms' ? 2 : 1) * prov.rate) : '—'}</span></td>
                <td className="ix-muted">{s.by}</td>
                <td className="cm-acts"><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Send now', onClick: () => now(s) }, { label: 'Cancel send', onClick: () => cancel(s), tone: 'danger' }]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>{plural(rows.length, 'scheduled send')} · {plural(rows.reduce((a, s) => a + s.count, 0), ch === 'sms' ? 'SMS' : 'email', ch === 'sms' ? 'SMS' : 'emails')}</span></div>
    </>
  ) : <div className="ix-empty"><EmptyState icon="calendar-clock" title="Nothing scheduled." actionLabel={ch === 'sms' ? 'Send SMS' : 'Compose email'} onAction={onCompose} /></div>;
}
