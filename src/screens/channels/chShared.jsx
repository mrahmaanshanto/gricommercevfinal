'use client';
// Shared pieces of the Channels pages (Overview, the product channel pages, Google Business, Sync issues, Settings,
// Connections and the connect flow) and the product page's Sales channels card. The frame is the shell plus one
// Shopify-style page (docs/shopify-style.md; components/ui/IndexKit.jsx): ChannelFrame wraps its children in
// ix-page. ConnCard is the connection at the top of a channel page; the sheets are a product's record on a channel.
// Data and wording: src/lib/channels.js.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, Sheet } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT } from '@/lib/format';
import {
  channelBy, STATUS, ISSUES, FIX_FIELDS, getChannels, syncJob, lastResult, dismissResult, startSync,
  retryItem, fixItem, setPublished, ago, agoLow, nowMs, photoOf, CHANNELS_EVENT,
} from '@/lib/channels';

export const money = (n) => (n == null || n === '' ? '—' : formatBDT(Math.round(Number(n) || 0)));

export const CH_CSS = `
.ch-logo{position:relative;display:inline-grid;place-items:center;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.ch-logo img{display:block;object-fit:contain}
.ch-logo__mark{position:absolute;right:-4px;bottom:-4px;display:grid;place-items:center;width:18px;height:18px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:0 0 0 1px var(--border-subtle);color:var(--text-muted)}
/* the connection at the top of a channel page: who it is, then its facts in one row */
.ch-conn{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3) var(--space-6);padding:var(--space-3) var(--space-4)}
.ch-conn__id{display:flex;align-items:center;gap:var(--space-3);flex:1 1 240px;min-width:0}
.ch-conn__id>span:not(.ch-logo):not(.gc-badge){display:flex;flex-direction:column;min-width:0}
.ch-conn__id b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-conn__id small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-conn__facts{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-6);margin:0}
.ch-conn__facts div{display:flex;flex-direction:column;gap:2px;min-width:0}
.ch-conn__facts dt{font-size:var(--text-xs);color:var(--text-muted)}
.ch-conn__facts dd{max-width:220px;margin:0;overflow:hidden;font-size:var(--text-sm);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
/* kit gap: a list right under a card head */
.ix-card__head+.ix-plist,.ix-card__head+.ix-table-wrap,.ix-card__head+.ix-plist+.ix-table-wrap{margin-top:var(--space-2)}
.ch-bar{display:flex;gap:2px;height:8px;border-radius:var(--radius-full);overflow:hidden;background:var(--slate-150)}
.ch-bar i{display:block;height:100%;min-width:4px}
.ch-bar .ok{background:var(--success)}.ch-bar .warn{background:var(--warning)}.ch-bar .bad{background:var(--error)}.ch-bar .info{background:var(--info)}.ch-bar .off{background:var(--slate-300)}
.ch-sync{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.ch-sync__top{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.ch-sync__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ch-sync__top .n{margin-left:auto;font-family:var(--font-data);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.ch-sync small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-spin{flex:none;width:16px;height:16px;border-radius:var(--radius-full);border:2px solid var(--slate-200);border-top-color:var(--primary);animation:chSpin 800ms linear infinite}
@keyframes chSpin{to{transform:rotate(360deg)}}
.ch-result{align-items:flex-start}
.ch-result>svg{flex:none;margin-top:1px}
.ch-result__text{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.ch-result__text b{font-weight:var(--weight-medium)}
.ch-result__text span{opacity:.9}
.ch-result__act{display:flex;align-items:center;gap:var(--space-2);flex:none}
.ch-thumb{display:grid;place-items:center;flex:none;width:32px;height:32px;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-md);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-thumb img{width:100%;height:100%;object-fit:cover}
.ch-prod{display:flex;align-items:center;gap:10px;min-width:0;max-width:360px}
.ch-prod__name{display:flex;flex-direction:column;min-width:0}
.ch-prod__name b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.ch-prod__name small{font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.ch-issue{display:flex;flex-direction:column;gap:2px;min-width:0;white-space:normal}
.ch-issue b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ch-issue small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-muted{color:var(--text-muted)}
.ch-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ch-box{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.ch-box--warn{background:var(--fill-warning-soft)}
.ch-box--bad{background:var(--fill-error-soft)}
.ch-box b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ch-box p{margin:0;color:var(--text-body)}
.ch-tech{font-size:var(--text-xs);color:var(--text-muted)}
.ch-tech summary{display:flex;align-items:center;min-height:32px;cursor:pointer;font-weight:var(--weight-medium);color:var(--text-body)}
.ch-tech dl{display:grid;grid-template-columns:auto 1fr;gap:4px var(--space-3);margin:var(--space-2) 0 0}
.ch-tech dd{margin:0;font-family:var(--font-data);color:var(--text-body);word-break:break-word}
.ch-sheet{display:flex;flex-direction:column;gap:var(--space-4)}
.ch-preview{display:grid;place-items:center;width:120px;height:120px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-subtle);color:var(--text-muted)}
.ch-preview img{width:100%;height:100%;object-fit:cover}
.ch-section-title{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
/* a labelled switch: the button is the switch, the gc-switch inside is its look */
.ch-auto{display:inline-flex;align-items:center;gap:var(--space-2);min-height:24px;border:0;background:none;padding:0;font:inherit;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.ch-auto[aria-checked="true"] .gc-switch,.gb-toggle[aria-checked="true"] .gc-switch{background:var(--primary)}
.ch-auto[aria-checked="true"] .gc-switch__knob,.gb-toggle[aria-checked="true"] .gc-switch__knob{transform:translateX(20px)}
@media (prefers-reduced-motion:reduce){.ch-spin{animation-duration:2.4s}}
@media (max-width:640px){
  .ch-conn__facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3);width:100%}
  .ch-conn__facts dd{max-width:none}
  .ch-result{flex-wrap:wrap}
  .ch-result__act{width:100%;justify-content:flex-end}
}
`;

/** Re-render on every change to the channels, and keep ticking while a sync or a retry is running. */
export function useChannels() {
  const [v, setV] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    const on = () => setV((x) => x + 1);
    window.addEventListener(CHANNELS_EVENT, on);
    window.addEventListener('storage', on);
    let t = null;
    const loop = () => {
      const c = getChannels();
      const busy = Object.keys(c.jobs || {}).length > 0;
      setV((x) => x + 1);
      t = setTimeout(loop, busy ? 250 : 1500);
    };
    t = setTimeout(loop, 250);
    return () => { window.removeEventListener(CHANNELS_EVENT, on); window.removeEventListener('storage', on); clearTimeout(t); };
  }, []);
  return { ready, v, c: ready ? getChannels() : null };
}

/** The page frame: side menu, top bar, and one Shopify-style page (narrow: forms and settings). */
export function ChannelFrame({ screen, active, page, children, css = '', crumb = 'Sales channels', narrow }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: CH_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb={crumb} page={page} />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

/** The connection at the top of a channel page: the logo, what it is, since when, then its facts in one row.
 *  facts: [[label, value], …]; a falsy entry is skipped. tip: an InfoTip after the title. */
export function ConnCard({ ch, title, since, tip, facts }) {
  const meta = channelBy(ch);
  return (
    <section className="ix-card ix-card--open ch-conn" aria-label="Connection">
      <div className="ch-conn__id">
        <ChannelLogo ch={ch} size={32} />
        <span><b>{title || meta.sub}{tip}</b>{since ? <small>{since}</small> : null}</span>
        <ConnBadge on />
      </div>
      <dl className="ch-conn__facts">
        {facts.filter(Boolean).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  );
}

/** The channel's mark: the company logo, with a small badge telling Merchant Center and Business apart. */
export function ChannelLogo({ ch, size = 40 }) {
  const c = channelBy(ch);
  if (!c) return null;
  // channels without a supplied logo (WooCommerce, Shopify) use the shared brand tiles
  if (!c.logo) return <BrandLogo brand={c.brand} size={size} decorative />;
  const img = Math.round(size * 0.6);
  return (
    <span className="ch-logo" style={{ width: size, height: size }} aria-hidden="true">
      <img src={c.logo} alt="" width={img} height={img} />
      {ch === 'gmc' && size >= 32 ? <span className="ch-logo__mark"><Icon name={c.mark} width="11" height="11" /></span> : null}
    </span>
  );
}

export const ConnBadge = ({ on }) => (on ? <StatusBadge tone="success" icon="plug">Connected</StatusBadge> : <StatusBadge tone="neutral" icon="unplug">Not connected</StatusBadge>);
export function StatusTag({ st }) {
  const s = STATUS[st];
  if (!s) return null;
  return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>;
}

/** Product tile + name + SKU, the same look as Products › All products. compact: the name only (a table row). */
export function ProductCell({ r, sub, compact }) {
  const photo = photoOf(r.key);
  return (
    <span className="ch-prod">
      <span className="ch-thumb" style={{ background: r.tbg || 'var(--surface-subtle)' }}>{photo ? <img src={photo} alt="" /> : r.name.charAt(0)}</span>
      <span className="ch-prod__name"><b>{r.name}</b>{compact ? null : <small>{sub != null ? sub : (r.sku || 'No SKU') + (r.variants ? ` · ${r.variants} variants` : '')}</small>}</span>
    </span>
  );
}

export function IssueText({ issue, short }) {
  const i = ISSUES[issue];
  if (!i) return <span className="ch-muted">—</span>;
  return <span className="ch-issue" style={short ? { minWidth: 140 } : undefined}><b>{i.title}</b>{short ? null : <small>{i.hint}</small>}</span>;
}

/** The raw detail from the channel, folded away: plain words come first. */
export function TechDetails({ issue }) {
  const i = ISSUES[issue];
  if (!i || !i.tech) return null;
  // Settings › Advanced › Show technical details opens them; otherwise they stay folded
  const open = !!getChannels().settings.tech;
  return (
    <details className="ch-tech" open={open}>
      <summary>Technical details</summary>
      <dl><dt>Code</dt><dd>{i.tech.code}</dd><dt>Field</dt><dd>{i.tech.field}</dd><dt>Message</dt><dd>{i.tech.msg}</dd></dl>
    </details>
  );
}

/**
 * The sync state of one channel: connecting, syncing (with numbers), then the result — success, partly synced,
 * processing (Google checks new products), or failed with Retry. Nothing when there is nothing to say.
 */
export function SyncState({ ch, c, compact }) {
  const job = c ? syncJob(ch, c) : null;
  const res = c ? lastResult(ch, c) : null;
  const meta = channelBy(ch);
  const unit = ch === 'gbp' ? 'updates' : 'products';
  if (job) {
    return (
      <div className="ch-sync" role="status" aria-live="polite">
        <div className="ch-sync__top">
          <span className="ch-spin" aria-hidden="true" />
          <b>{job.phase === 'connecting' ? `Connecting to ${meta.company}…` : `${job.first ? 'First sync' : 'Syncing'} ${job.total.toLocaleString('en-IN')} ${unit}…`}</b>
          <span className="n">{job.done.toLocaleString('en-IN')} / {job.total.toLocaleString('en-IN')}</span>
        </div>
        <div className="gc-progress" role="progressbar" aria-label={`Sync progress, ${meta.short}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={job.pct}><div className="gc-progress__fill" style={{ width: job.pct + '%' }} /></div>
        {compact ? null : <small>You can leave this page. The sync keeps going.</small>}
      </div>
    );
  }
  if (!res || (c.now - res.at > 15 * 60 * 1000)) return null;
  const close = <button type="button" className="gc-iconbtn" aria-label="Dismiss" onClick={() => dismissResult(ch)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>;
  if (res.failed) {
    return (
      <div className="gc-alert gc-alert--soft gc-alert--error ch-result" role="alert">
        <Icon name="circle-x" width="18" height="18" aria-hidden="true" />
        <span className="ch-result__text"><b>Sync failed</b><span>{meta.company} did not answer. Check your internet, then try again.</span></span>
        <span className="ch-result__act"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => startSync(ch)}>Retry</button>{compact ? null : close}</span>
      </div>
    );
  }
  if (res.bad) {
    return (
      <div className="gc-alert gc-alert--soft gc-alert--warning ch-result" role="status">
        <Icon name="triangle-alert" width="18" height="18" aria-hidden="true" />
        <span className="ch-result__text"><b>Partly synced</b><span>{(res.total - res.bad).toLocaleString('en-IN')} of {res.total.toLocaleString('en-IN')} {unit} synced · {res.bad} {res.bad === 1 ? 'needs' : 'need'} attention</span></span>
        <span className="ch-result__act"><Link href={'/sync-issues?ch=' + ch} className="gc-btn gc-btn--sm gc-btn--neutral">View issues</Link>{compact ? null : close}</span>
      </div>
    );
  }
  if (res.processing && ch === 'gmc') {
    return (
      <div className="gc-alert gc-alert--soft gc-alert--info ch-result" role="status">
        <Icon name="loader" width="18" height="18" aria-hidden="true" />
        <span className="ch-result__text"><b>Sent. Google is checking {res.processing} {res.processing === 1 ? 'product' : 'products'}</b><span>New and changed products can take up to 3 days to be approved.</span></span>
        <span className="ch-result__act">{compact ? null : close}</span>
      </div>
    );
  }
  return (
    <div className="gc-alert gc-alert--soft gc-alert--success ch-result" role="status">
      <Icon name="circle-check" width="18" height="18" aria-hidden="true" />
      <span className="ch-result__text"><b>{res.first ? 'Connected and synced' : 'Sync complete'}</b><span>All {res.total.toLocaleString('en-IN')} {unit} are up to date · {ago(res.at, c.now)}</span></span>
      <span className="ch-result__act">{compact ? null : close}</span>
    </div>
  );
}

/** Small summary words for a channel's sync state (cards, lists). */
export function syncWord(ch, c) {
  const job = syncJob(ch, c);
  if (job) return { st: 'processing', label: job.phase === 'connecting' ? 'Connecting' : `Syncing ${job.pct}%` };
  const res = lastResult(ch, c);
  if (res && res.failed && c.now - res.at < 60 * 60 * 1000) return { st: 'failed', label: 'Failed' };
  return null;
}

/** Resize a picked photo (kept small for this browser). Resolves to a JPEG data URL. */
export function readImage(file, max = 640) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose an image')); return; }
    if (file.size > 15 * 1024 * 1024) { reject(new Error('Image is too large (15 MB max)')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image')); };
    img.src = url;
  });
}

/** Fix a product problem in place: the missing barcode, SKU or photo, or a link to the setting that fixes it. */
export function FixSheet({ item, onClose }) {
  const issue = item ? ISSUES[item.issue] : null;
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const [photo, setPhoto] = useState(null);
  const file = useRef(null);
  useEffect(() => { setVal(''); setErr(''); setPhoto(null); }, [item && item.key, item && item.issue]);
  if (!item || !issue) return null;
  const f = FIX_FIELDS[issue.field];
  const pick = async (e) => {
    const fl = e.target.files && e.target.files[0];
    if (!fl) return;
    try { setPhoto(await readImage(fl, 800)); setErr(''); } catch (x) { setErr(x.message); }
  };
  const submit = (e) => {
    e.preventDefault();
    if (issue.field === 'photo') { if (!photo) { setErr('Choose a photo.'); return; } fixItem(item.key, 'photo', photo); }
    else if (issue.field === 'shipping') fixItem(item.key, 'shipping', 'set');
    else { if (!f.test(val)) { setErr(f.err); return; } fixItem(item.key, issue.field, val); }
    toast('Saved. Sending again…');
    onClose();
  };
  return (
    <Sheet open title="Fix product" onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="ch-fix" className="gc-btn gc-btn--solid">{issue.field === 'shipping' ? 'Done, send again' : 'Save and send again'}</button></>}>
      <form id="ch-fix" className="ch-sheet" onSubmit={submit} noValidate>
        <ProductCell r={item} />
        <div className={'ch-box ' + (issue.st === 'disapproved' || issue.st === 'failed' ? 'ch-box--bad' : 'ch-box--warn')}>
          <b>{issue.title} · {channelBy(issue.ch).short}</b>
          <p>{issue.hint} {issue.fix}</p>
        </div>
        {issue.field === 'photo' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span className="gc-label">{f.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span className="ch-preview">{photo ? <img src={photo} alt="New product photo" /> : <Icon name="image-plus" width="28" height="28" aria-hidden="true" />}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => file.current && file.current.click()}><Icon name="upload" width="16" height="16" aria-hidden="true" /> {photo ? 'Choose another' : 'Choose photo'}</button>
                <small className="gc-help" style={{ margin: 0 }}>{f.help}</small>
              </span>
            </span>
            <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
          </div>
        ) : issue.field === 'shipping' ? (
          <div className="ch-box">
            <b>Delivery charges</b>
            <p>Add a charge for parcels over 2 kg in Settings › Delivery, then come back and press Done.</p>
            <Link href="/set-delivery" className="gc-btn gc-btn--sm gc-btn--neutral" style={{ alignSelf: 'flex-start' }} target="_blank">Open delivery settings <Icon name="external-link" width="14" height="14" aria-hidden="true" /></Link>
          </div>
        ) : (
          <div>
            <label className="gc-label" htmlFor="ch-fix-val">{f.label}</label>
            <input id="ch-fix-val" className={'gc-input' + (err ? ' gc-input--error' : '')} inputMode={issue.field === 'barcode' ? 'numeric' : issue.field === 'weight' ? 'decimal' : 'text'} placeholder={f.placeholder} value={val} onChange={(e) => { setVal(e.target.value); setErr(''); }} aria-invalid={!!err} aria-describedby="ch-fix-help" autoFocus />
            <p id="ch-fix-help" className={'gc-help' + (err ? ' gc-help--error' : '')}>{err || f.help}</p>
          </div>
        )}
        {err && issue.field === 'photo' ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
        <TechDetails issue={item.issue} />
      </form>
    </Sheet>
  );
}

/** A product on one channel: status, the problem and its fix, what the channel shows, and the actions. */
export function ItemSheet({ item, c, onClose, onFix }) {
  if (!item) return null;
  const ch = item.ch;
  const meta = channelBy(ch);
  const issue = item.issue ? ISSUES[item.issue] : null;
  const off = item.st === 'unpublished';
  const act = (fn, msg) => { fn(); toast(msg); onClose(); };
  return (
    <Sheet open title={meta.short + ' · product'} onClose={onClose}
      footer={<>
        {off ? (item.draft ? null : <button type="button" className="gc-btn gc-btn--solid" onClick={() => act(() => setPublished(ch, [item.key], true), `Publishing to ${meta.short}…`)}>Publish to {meta.short}</button>) : (
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => act(() => setPublished(ch, [item.key], false), `Removed from ${meta.short}`)}>Remove from {meta.short}</button>
        )}
        {issue && issue.kind === 'fix' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => { onClose(); onFix(item); }}>Fix product</button> : null}
        {!off && (!issue || issue.kind === 'retry') && item.st !== 'processing' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => act(() => retryItem(ch, item.key), issue ? 'Trying again…' : 'Sending again…')}>{issue ? 'Retry' : 'Sync this product'}</button> : null}
      </>}>
      <div className="ch-sheet">
        <ProductCell r={item} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
          <StatusTag st={item.st} />
          <span className="gc-help" style={{ margin: 0 }}>{off ? item.why : item.st === 'processing' ? 'Sending now' : 'Last sync ' + agoLow(item.at, c ? c.now : nowMs())}</span>
        </div>
        {issue ? (
          <div className={'ch-box ' + (issue.kind === 'retry' || issue.st === 'disapproved' ? 'ch-box--bad' : 'ch-box--warn')}>
            <b>{issue.title}</b>
            <p>{issue.hint}</p>
            <p><span className="ch-muted">How to fix: </span>{issue.fix}</p>
          </div>
        ) : null}
        <div>
          <h3 className="ch-section-title" style={{ marginBottom: 'var(--space-2)' }}>On {meta.short}</h3>
          <KV rows={[['Title', item.name], ['Price', <span className="ch-data">{money(item.price)}</span>], ['Availability', item.stock > 0 ? 'In stock' : 'Out of stock'], ['Shown on', meta.sub]]} />
        </div>
        {issue ? <TechDetails issue={item.issue} /> : null}
      </div>
    </Sheet>
  );
}
