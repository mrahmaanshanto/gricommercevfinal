'use client';
// Website (super admin) — the parts Pages, Content, Blog and SEO share: the CSS, the status badge, the publishing
// steps (Draft → In review → Approved → Published) with their buttons, an English + Bangla field editor, the length
// meter, the Google result and the social card previews, and small helpers. Data: lib/admin/website.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, InfoTip } from '@/components/ui';
import { dm, dmy, hm, daysBetween, yearOf, initials } from '@/lib/platform/util';
import { staffColor } from '@/lib/platform/catalogue';
import { staff as currentStaff } from '@/lib/platform/store';
import { useAdminStore } from '@/lib/admin/store';
import { website, TONE, PENDING, LIVE_HOST, saveField, discardField } from '@/lib/admin/website';
import { usePlatform } from '../AdminShell';

/** The website store plus the platform (for the signed-in staff member). `live` is false until both have loaded. */
export function useWeb() {
  const { live: plive } = usePlatform();
  const { data, t, live } = useAdminStore(website);
  return { data, t, live: plive && live, me: currentStaff().name };
}

/** "Today 10:02" · "Yesterday 18:40" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n < 0) return n === -1 ? 'Tomorrow ' + hm(ms) : dm(ms) + ' ' + hm(ms);
  if (n === 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  if (n < 7) return n + ' days ago';
  return yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms);
}
export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
export const pageUrl = (path) => LIVE_HOST + (path === '/' ? '' : path);
export const openLive = (path) => { window.open(pageUrl(path), '_blank', 'noopener'); };

export const StatusTag = ({ s }) => <StatusBadge tone={TONE[s] || 'neutral'}>{s}</StatusBadge>;

/** A person's initials in a small circle (staff colour, or the neutral one for the website team). */
export function Who({ name, size = 22 }) {
  return <span className="wb-av" style={{ width: size, height: size, background: staffColor(name) }} aria-hidden="true">{initials(name)}</span>;
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, tip, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}{tip ? <InfoTip text={tip} /> : null}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

/** Characters against the range search engines show in full. */
export function LenMeter({ len, range: [lo, hi] }) {
  const state = !len ? 'missing' : len < lo ? 'short' : len > hi ? 'long' : 'good';
  const pct = Math.min(100, Math.round((len / (hi * 1.25)) * 100));
  const text = { missing: 'Missing', short: 'Short', long: 'Too long', good: 'Good length' }[state];
  return (
    <div className={'wb-meter is-' + state}>
      <span className="wb-meter__bar" aria-hidden="true"><span style={{ width: pct + '%' }} /></span>
      <span className="wb-meter__text"><span>{text}</span><span className="wb-data">{len} / {lo}–{hi}</span></span>
    </div>
  );
}

const STEPS = ['Draft', 'In review', 'Approved', 'Published'];
/** The four publishing steps with the current one marked. */
export function Steps({ status }) {
  const at = STEPS.indexOf(status === 'Scheduled' ? 'Approved' : status);
  return (
    <ol className="wb-steps" aria-label="Publishing steps">
      {STEPS.map((s, i) => (
        <li key={s} className={i < at ? 'is-done' : i === at ? 'is-on' : ''} aria-current={i === at ? 'step' : undefined}>
          <span className="wb-steps__dot" aria-hidden="true">{i < at ? <Icon name="check" width="12" height="12" /> : i + 1}</span>
          <span>{s === 'Approved' && status === 'Scheduled' ? 'Scheduled' : s}</span>
        </li>
      ))}
    </ol>
  );
}

/** The workflow card: steps, who did what, the note when it was sent back, and the next action buttons.
 *  acts: { save?, submit, approve, sendBack, publish, discard? } — functions that return { ok, error? }. */
export function WorkflowCard({ status, editor, submittedBy, approvedBy, note, me, acts, extra, liveNote = 'The live site is not changed in this demo.' }) {
  const run = (fn, done) => () => {
    const r = fn();
    if (!r || !r.ok) { toast((r && r.error) || 'That didn’t work'); return; }
    toast(done(r));
  };
  const own = submittedBy === me || editor === me;
  return (
    <section className="ix-card" aria-label="Publishing">
      <div className="ix-card__head"><h2>Publishing</h2><StatusTag s={status} /></div>
      <div className="ix-card__body wb-flow">
        <Steps status={status} />
        <p className="wb-small">
          {status === 'Draft' ? <>Being edited by <b>{editor || '—'}</b>. Send it for review when it is ready.</> : null}
          {status === 'In review' ? <>Sent for review by <b>{submittedBy || editor}</b>. {own ? 'Someone else on the website team approves it.' : 'You can approve it or send it back.'}</> : null}
          {status === 'Approved' ? <>Approved by <b>{approvedBy || '—'}</b>. Ready to publish.</> : null}
          {status === 'Scheduled' ? <>Approved by <b>{approvedBy || '—'}</b>; it goes live on its publish date.</> : null}
          {status === 'Published' ? <>Live. Last change by <b>{editor || '—'}</b>.</> : null}
        </p>
        {note && status === 'Draft' ? <p className="wb-note"><Icon name="corner-down-left" width="14" height="14" aria-hidden="true" /><span>Sent back: {note}</span></p> : null}
        {extra}
        <div className="wb-flow__acts">
          {status === 'Draft' && acts.submit ? <button type="button" className="ix-btn ix-btn--primary" onClick={run(acts.submit, () => 'Sent for review')}><Icon name="send" width="16" height="16" aria-hidden="true" />Submit for review</button> : null}
          {status === 'In review' && acts.approve ? <button type="button" className="ix-btn ix-btn--primary" disabled={own} title={own ? 'Someone other than the editor approves' : undefined} onClick={run(acts.approve, () => 'Approved')}><Icon name="badge-check" width="16" height="16" aria-hidden="true" />Approve</button> : null}
          {(status === 'In review' || status === 'Approved') && acts.sendBack ? <button type="button" className="ix-btn" onClick={acts.sendBack}><Icon name="corner-down-left" width="16" height="16" aria-hidden="true" />Send back</button> : null}
          {status === 'Approved' && acts.publish ? <button type="button" className="ix-btn ix-btn--primary" onClick={run(acts.publish, (r) => (r.scheduled ? 'Scheduled. ' : 'Published. ') + liveNote)}><Icon name="globe" width="16" height="16" aria-hidden="true" />Publish</button> : null}
          {status === 'Draft' && acts.discard ? <button type="button" className="ix-btn ix-btn--plain" onClick={acts.discard}>Discard draft</button> : null}
        </div>
      </div>
    </section>
  );
}

/** English and Bangla side by side, read only. */
export function BiText({ en, bn, one }) {
  const pend = en === PENDING;
  if (one) return <div className="wb-bi wb-bi--one"><span className={pend ? 'wb-pending' : ''}>{pend ? 'To be confirmed' : en}</span><small>Same in both languages</small></div>;
  return (
    <div className="wb-bi">
      <p lang="en">{en}</p>
      <p lang="bn" className="wb-bn">{bn}</p>
    </div>
  );
}

/** One field: English and Bangla side by side; Edit opens the two boxes; Save keeps a draft. */
export function FieldEditor({ f, me, readOnly }) {
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { setEdit(null); setErr(''); }, [f.key]);
  const start = () => setEdit({ en: f.value.en === PENDING ? '' : f.value.en, bn: f.value.bn || '' });
  const save = () => {
    const r = saveField(f.key, edit, me);
    if (!r.ok) { setErr(r.error); return; }
    setEdit(null); setErr('');
    toast('Saved as a draft');
  };
  const discard = () => { const r = discardField(f.key, me); if (r.ok) toast('Change discarded'); };
  const big = f.kind === 'long';
  const id = 'fe-' + f.key.replace(/[^a-z0-9]/gi, '-');
  return (
    <div className={'wb-field' + (f.edit ? ' is-changed' : '') + (edit ? ' is-editing' : '')}>
      <div className="wb-field__head">
        <span className="wb-field__label" id={id + '-l'}>{f.label}</span>
        {f.pending ? <StatusBadge tone="warning">To be confirmed</StatusBadge> : null}
        {f.edit ? <span className="wb-changed" title={'Changed by ' + f.edit.by}>Draft · {f.edit.by.split(' ')[0]}</span> : null}
        {!edit && !readOnly ? (
          <span className="wb-field__acts">
            {f.edit ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={discard}>Discard</button> : null}
            <button type="button" className="ix-btn ix-btn--sm" aria-label={'Edit ' + f.label} onClick={start}><Icon name="pencil" width="14" height="14" aria-hidden="true" />Edit</button>
          </span>
        ) : null}
      </div>
      {edit ? (
        <div className="wb-field__form">
          <div className={'wb-pair' + (f.one ? ' wb-pair--one' : '')}>
            <label className="wb-pair__col">
              <span className="wb-lang">{f.one ? 'Value' : 'English'}</span>
              {big ? <textarea className="gc-input" rows={4} value={edit.en} data-autofocus autoFocus onChange={(e) => setEdit({ ...edit, en: e.target.value })} aria-labelledby={id + '-l'} />
                : <input className="gc-input" value={edit.en} autoFocus onChange={(e) => setEdit({ ...edit, en: e.target.value })} aria-labelledby={id + '-l'} />}
            </label>
            {f.one ? null : (
              <label className="wb-pair__col">
                <span className="wb-lang">বাংলা · Bangla</span>
                {big ? <textarea className="gc-input wb-bn" rows={4} lang="bn" value={edit.bn} onChange={(e) => setEdit({ ...edit, bn: e.target.value })} aria-label={f.label + ' in Bangla'} />
                  : <input className="gc-input wb-bn" lang="bn" value={edit.bn} onChange={(e) => setEdit({ ...edit, bn: e.target.value })} aria-label={f.label + ' in Bangla'} />}
              </label>
            )}
          </div>
          {err ? <p className="gc-help gc-help--error" role="alert">{err}</p> : null}
          <div className="wb-field__acts">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setEdit(null); setErr(''); }}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={save}>Save draft</button>
          </div>
        </div>
      ) : <BiText en={f.value.en} bn={f.value.bn} one={f.one} />}
      {f.edit && !edit ? <p className="wb-was">Live: {f.live.en === PENDING ? 'To be confirmed' : f.live.en}</p> : null}
    </div>
  );
}

/** How the page shows in Google. */
export function GooglePreview({ title, url, desc }) {
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
  const crumbs = url.replace(/^https?:\/\//, '').split('/').filter(Boolean);
  return (
    <div className="wb-serp" aria-label="Google result preview">
      <div className="wb-serp__site"><span className="wb-serp__fav" aria-hidden="true">G</span><span><b>GridCommerce</b><small>{crumbs[0]}{crumbs.length > 1 ? ' › ' + crumbs.slice(1).join(' › ') : ''}</small></span></div>
      <p className="wb-serp__title">{cut(title || 'Untitled', 62)}</p>
      <p className="wb-serp__desc">{desc ? cut(desc, 160) : <span className="wb-muted">Google picks some text from the page when there is no description.</span>}</p>
    </div>
  );
}

/** How a shared link looks on Facebook / WhatsApp / LinkedIn. */
export function SocialPreview({ title, desc, image, host }) {
  const named = String(image || '').split('/').pop();
  return (
    <div className="wb-og" aria-label="Social share preview">
      <div className="wb-og__img" aria-hidden="true">
        <span className="wb-og__brand"><Icon name="layout-grid" width="20" height="20" />GridCommerce</span>
        <span className="wb-og__tag">{title}</span>
        <small>{named} · 1200 × 630</small>
      </div>
      <div className="wb-og__text">
        <small>{host.replace(/^https?:\/\//, '').toUpperCase()}</small>
        <b>{title}</b>
        <p>{desc}</p>
      </div>
    </div>
  );
}

export const WEB_CSS = `
.wb-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:wb-sk 1.4s ease infinite}
.wb-skel--head{height:56px}
@keyframes wb-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.wb-skel{animation:none}}
.wb-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.wb-muted{color:var(--text-muted)}
.wb-small{margin:0;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.wb-small b{font-weight:var(--weight-medium);color:var(--text-body)}
.wb-path{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.wb-bn{font-family:var(--font-bn)}
.wb-av{display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-semibold);line-height:1}
.wb-person{display:inline-flex;align-items:center;gap:var(--space-2);white-space:nowrap}
.wb-title{display:flex;flex-direction:column;min-width:0;max-width:360px}
.wb-title a,.wb-title b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wb-note{display:flex;gap:var(--space-2);align-items:flex-start;margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);color:var(--text-body);font-size:var(--text-xs)}
.wb-note svg{flex:none;margin-top:1px;color:var(--text-warning)}
.wb-flow{display:flex;flex-direction:column;gap:var(--space-3)}
.wb-flow__acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.wb-steps{display:flex;gap:var(--space-1);margin:0;padding:0;list-style:none}
.wb-steps li{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;font-size:var(--text-xs);color:var(--text-muted);text-align:center;position:relative}
.wb-steps li+li::before{content:"";position:absolute;top:11px;right:calc(50% + 14px);width:calc(100% - 28px);border-top:2px solid var(--border-subtle)}
.wb-steps li.is-done::before,.wb-steps li.is-on::before{border-color:var(--primary)}
.wb-steps__dot{display:grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);border:2px solid var(--border-subtle);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.wb-steps li.is-done .wb-steps__dot{border-color:var(--primary);background:var(--primary);color:var(--text-inverse)}
.wb-steps li.is-on .wb-steps__dot{border-color:var(--primary);color:var(--primary)}
.wb-steps li.is-on{color:var(--text-heading);font-weight:var(--weight-medium)}
.wb-bi{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.wb-bi p{margin:0;font-size:var(--text-sm);color:var(--text-body);line-height:1.5;overflow-wrap:anywhere}
.wb-bi p.wb-bn{color:var(--text-body)}
.wb-bi--one{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2);font-size:var(--text-sm);overflow-wrap:anywhere}
.wb-bi--one small{font-size:var(--text-xs);color:var(--text-muted)}
.wb-pending{color:var(--text-warning);font-weight:var(--weight-medium)}
.wb-field{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.wb-field:first-child{border-top:0}
.wb-field.is-changed{background:var(--fill-primary-soft)}
.wb-field__head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);min-height:28px}
.wb-field__label{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.wb-field__acts{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-left:auto}
.wb-field__form{display:flex;flex-direction:column;gap:var(--space-2)}
.wb-field__form .wb-field__acts{justify-content:flex-end}
.wb-changed{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.wb-was{margin:0;font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.wb-pair{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.wb-pair--one{grid-template-columns:1fr}
.wb-pair__col{display:flex;flex-direction:column;gap:4px;min-width:0}
.wb-lang{font-size:var(--text-xs);color:var(--text-muted)}
.wb-meter{display:flex;flex-direction:column;gap:4px;margin-top:4px}
.wb-meter__bar{display:block;height:4px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.wb-meter__bar span{display:block;height:100%;border-radius:var(--radius-full);background:var(--text-muted)}
.wb-meter.is-good .wb-meter__bar span{background:var(--fill-success)}
.wb-meter.is-short .wb-meter__bar span,.wb-meter.is-long .wb-meter__bar span{background:var(--fill-warning)}
.wb-meter__text{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.wb-meter.is-good .wb-meter__text span:first-child{color:var(--text-success)}
.wb-meter.is-long .wb-meter__text span:first-child,.wb-meter.is-short .wb-meter__text span:first-child,.wb-meter.is-missing .wb-meter__text span:first-child{color:var(--text-warning)}
.wb-serp{padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-family:var(--font-sans)}
.wb-serp__site{display:flex;align-items:center;gap:var(--space-2);min-width:0;font-size:var(--text-xs);color:var(--text-body)}
.wb-serp__site b{display:block;font-weight:var(--weight-medium)}
.wb-serp__site small{display:block;color:var(--text-muted);font-size:var(--text-xs);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wb-serp__fav{display:grid;place-items:center;width:24px;height:24px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-semibold)}
.wb-serp__title{margin:var(--space-2) 0 0;font-size:var(--text-lg);line-height:1.3;color:var(--text-link);overflow-wrap:anywhere}
.wb-serp__desc{margin:var(--space-1) 0 0;font-size:var(--text-sm);line-height:1.5;color:var(--text-body);overflow-wrap:anywhere}
.wb-og{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-card);max-width:520px}
.wb-og__img{position:relative;display:flex;flex-direction:column;justify-content:center;gap:var(--space-2);aspect-ratio:1200/630;padding:var(--space-5);background:linear-gradient(135deg,var(--primary),var(--text-link));color:var(--text-inverse)}
.wb-og__brand{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.wb-og__tag{font-size:var(--text-lg);font-weight:var(--weight-semibold);line-height:1.3;overflow-wrap:anywhere}
.wb-og__img small{position:absolute;right:var(--space-3);bottom:var(--space-2);font-size:var(--text-xs);opacity:.8;font-family:var(--font-data)}
.wb-og__text{padding:var(--space-3);background:var(--surface-subtle)}
.wb-og__text small{display:block;font-size:var(--text-xs);color:var(--text-muted);letter-spacing:.02em}
.wb-og__text b{display:block;margin-top:2px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.wb-og__text p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.wb-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle)}
.wb-seg{display:inline-flex;border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden}
.wb-seg button{height:32px;padding:0 var(--space-3);border:0;border-left:1px solid var(--border-field);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-body);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.wb-seg button:first-child{border-left:0}
.wb-seg button[aria-pressed="true"]{background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.wb-seg button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.wb-src{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.wb-hist{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.wb-hist li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.wb-hist li:first-child{border-top:0}
.wb-hist__text{flex:1;min-width:0}
.wb-hist__text b{font-weight:var(--weight-medium);color:var(--text-heading)}
.wb-hist__text small{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
@media (max-width:640px){
  .wb-bi,.wb-pair{grid-template-columns:1fr}
  .wb-steps li{font-size:var(--text-xs)}
  .wb-field{padding:var(--space-3)}
  .wb-seg button{height:36px}
}
`;
