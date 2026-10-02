'use client';
// Shared pieces of the Channels pages (Overview, Meta Commerce, Google Merchant Center, Google Business, Sync issues,
// Settings, Connect a channel) and the product page's Sales channels card. Built on the app's own parts: the shell,
// PageHeader, StatusBadge, Sheet, EmptyState, gc-card / gc-table / gc-stattabs / gc-switch / gc-progress / gc-alert.
// Data and wording: src/lib/channels.js.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, Sheet } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT } from '@/lib/format';
import {
  CHANNELS_EVENT, channelBy, STATUS, ISSUES, FIX_FIELDS, getChannels, syncJob, lastResult, dismissResult, startSync,
  retryItem, fixItem, setPublished, ago, agoLow, isOk, photoOf, nowMs,
} from '@/lib/channels';

export const money = (n) => (n == null || n === '' ? '—' : formatBDT(Math.round(Number(n) || 0)));

export const CH_CSS = `
.ch-logo{position:relative;display:inline-grid;place-items:center;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.ch-logo img{display:block;object-fit:contain}
.ch-logo__mark{position:absolute;right:-4px;bottom:-4px;display:grid;place-items:center;width:18px;height:18px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:0 0 0 1px var(--border-subtle);color:var(--text-muted)}
.ch-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.ch-card__head{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-4) var(--space-4) var(--space-4) var(--space-5)}
.ch-card__name{display:flex;flex-direction:column;min-width:0;flex:1}
.ch-card__name b{font-size:var(--text-sm);font-weight:var(--weight-semibold);line-height:var(--text-sm-lh);color:var(--text-heading)}
.ch-card__name small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-card__body{padding:0 var(--space-5) var(--space-4);display:flex;flex-direction:column;gap:var(--space-3);flex:1}
/* two equal buttons, then the third action as a quiet full-width link */
.ch-card__foot{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.ch-card__foot>:nth-child(3){grid-column:1 / -1}
.ch-card__head .gc-badge{flex:none;margin-top:2px}
.ch-facts{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.ch-facts dt{color:var(--text-muted);white-space:nowrap}
.ch-facts dd{margin:0;min-width:0;text-align:right;color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-facts .n{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ch-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.ch-num{display:flex;flex-direction:column;gap:2px;min-width:0;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ch-num b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.ch-num small{display:flex;align-items:center;gap:4px;min-width:0;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-dot{display:inline-block;width:8px;height:8px;flex:none;border-radius:var(--radius-full)}
.ch-dot--ok{background:var(--success)}.ch-dot--warn{background:var(--warning)}.ch-dot--bad{background:var(--error)}.ch-dot--info{background:var(--info)}.ch-dot--off{background:var(--slate-300)}
.ch-bar{display:flex;gap:2px;height:10px;border-radius:var(--radius-full);overflow:hidden;background:var(--slate-150)}
.ch-bar i{display:block;height:100%;min-width:4px}
.ch-bar .ok{background:var(--success)}.ch-bar .warn{background:var(--warning)}.ch-bar .bad{background:var(--error)}.ch-bar .info{background:var(--info)}.ch-bar .off{background:var(--slate-300)}
.ch-legend{display:flex;flex-wrap:wrap;gap:4px var(--space-4);margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-muted)}
.ch-legend li{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.ch-legend b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-sync{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4) var(--space-5);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.ch-sync__top{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.ch-sync__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ch-sync__top .n{margin-left:auto;font-family:var(--font-data);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.ch-sync small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-spin{flex:none;width:18px;height:18px;border-radius:var(--radius-full);border:2px solid var(--slate-200);border-top-color:var(--primary);animation:chSpin 800ms linear infinite}
@keyframes chSpin{to{transform:rotate(360deg)}}
.ch-result{align-items:flex-start}
.ch-result>svg{flex:none;margin-top:1px}
.ch-result__text{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.ch-result__text b{font-weight:var(--weight-medium)}
.ch-result__text span{opacity:.9}
.ch-result__act{display:flex;align-items:center;gap:var(--space-2);flex:none}
.ch-thumb{display:grid;place-items:center;flex:none;width:40px;height:40px;overflow:hidden;border-radius:var(--radius-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-size:var(--text-sm)}
.ch-thumb img{width:100%;height:100%;object-fit:cover}
.ch-prod{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.ch-prod__name{display:flex;flex-direction:column;min-width:150px}
.ch-prod__name b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:normal;max-width:260px}
.ch-prod__name small{font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.ch-issue{display:flex;flex-direction:column;gap:2px;min-width:200px;white-space:normal;max-width:300px}
.ch-issue b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ch-issue small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-muted{color:var(--text-muted)}
/* channel tables: tighter cells so every column, actions included, fits a laptop screen */
.ch-table th,.ch-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.ch-table th:first-child,.ch-table td:first-child{padding-left:var(--space-5)}
.ch-table th:last-child,.ch-table td:last-child{padding-right:var(--space-5)}
.ch-stattabs{grid-template-columns:repeat(auto-fit,minmax(136px,1fr))}
/* on laptop widths the time column folds into the status cell (ch-narrow-only) */
.ch-narrow-only{display:none}
@media (max-width:1599px){.ch-wide-only{display:none!important}.ch-narrow-only{display:block}}
@media (max-width:640px){.ch-narrow-only{display:none}}
.ch-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ch-acts{display:flex;align-items:center;justify-content:flex-end;gap:var(--space-1);white-space:nowrap}
.ch-menu{position:relative;display:inline-flex}
.ch-menu .gc-dropdown{right:0;top:100%;margin-top:4px}
.ch-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-5)}
.ch-tools .gc-input{max-width:340px}
.ch-tools__search{position:relative;flex:1 1 240px;max-width:340px}
.ch-tools__search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none}
.ch-tools__search .gc-input{padding-left:40px;max-width:none}
.ch-bulk{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-5);background:var(--fill-primary-soft);font-size:var(--text-sm);color:var(--primary)}
.ch-bulk b{font-weight:var(--weight-medium);margin-right:auto}
.ch-box{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.ch-box--warn{background:var(--fill-warning-soft)}
.ch-box--bad{background:var(--fill-error-soft)}
.ch-box b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ch-box p{margin:0;color:var(--text-body)}
.ch-tech{font-size:var(--text-xs);color:var(--text-muted)}
.ch-tech summary{cursor:pointer;font-weight:var(--weight-medium);color:var(--text-body);min-height:36px;display:flex;align-items:center}
.ch-tech dl{display:grid;grid-template-columns:auto 1fr;gap:4px var(--space-3);margin:var(--space-2) 0 0}
.ch-tech dd{margin:0;font-family:var(--font-data);color:var(--text-body);word-break:break-word}
.ch-sheet{display:flex;flex-direction:column;gap:var(--space-4)}
.ch-sheet__title{display:flex;align-items:center;gap:var(--space-3)}
.ch-preview{display:grid;place-items:center;width:120px;height:120px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-subtle);color:var(--text-muted)}
.ch-preview img{width:100%;height:100%;object-fit:cover}
.ch-section-title{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-head{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:var(--space-4);padding:var(--space-5)}
.ch-head__id{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);min-width:0;flex:1 1 260px}
.ch-head__id>span:not(.ch-logo):not(.gc-badge){min-width:0}
.ch-head__id b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-head__id small{font-size:var(--text-xs);color:var(--text-muted)}
.ch-head__facts{display:grid;grid-template-columns:repeat(4,minmax(0,auto));gap:var(--space-2) var(--space-6);margin:0;font-size:var(--text-sm)}
.ch-head__facts div{display:flex;flex-direction:column;gap:2px;min-width:0}
.ch-head__facts dt{font-size:var(--text-xs);color:var(--text-muted)}
.ch-head__facts dd{margin:0;color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-auto{display:inline-flex;align-items:center;gap:var(--space-2);min-height:36px;border:0;background:none;padding:0;font:inherit;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
/* a labelled switch: the button is the switch, the gc-switch inside is its look */
.ch-auto[aria-checked="true"] .gc-switch,.gb-toggle[aria-checked="true"] .gc-switch{background:var(--primary)}
.ch-auto[aria-checked="true"] .gc-switch__knob,.gb-toggle[aria-checked="true"] .gc-switch__knob{transform:translateX(20px)}
@media (prefers-reduced-motion:reduce){.ch-spin{animation-duration:2.4s}}
@media (max-width:1100px){.ch-head__facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){
  .ch-sm-hide{display:none!important}
  .ch-card__head,.ch-card__body,.ch-card__foot{padding-left:var(--space-4);padding-right:var(--space-4)}
  .ch-tools{padding:var(--space-3) var(--space-4)}
  .ch-tools__search{max-width:none}
  .ch-bulk{padding:var(--space-2) var(--space-4)}
  .ch-head{padding:var(--space-4)}
  .ch-head__facts{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3);width:100%}
  .ch-prod__name{min-width:0}
  .ch-prod__name b{max-width:none}
  .ch-issue{max-width:none;min-width:0}
  .ch-sync{padding:var(--space-3) var(--space-4)}
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

/** The page frame: side menu, top bar, content. */
export function ChannelFrame({ screen, active, page, children, css = '', crumb = 'Sales channels' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: CH_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb={crumb} page={page} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
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

/** Product tile + name + SKU, the same look as Products › All products. */
export function ProductCell({ r, sub }) {
  const photo = photoOf(r.key);
  return (
    <span className="ch-prod">
      <span className="ch-thumb" style={{ background: r.tbg || 'var(--surface-subtle)' }}>{photo ? <img src={photo} alt="" /> : r.name.charAt(0)}</span>
      <span className="ch-prod__name"><b>{r.name}</b><small>{sub != null ? sub : (r.sku || 'No SKU') + (r.variants ? ` · ${r.variants} variants` : '')}</small></span>
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

/** A small "more actions" menu for a table row. items: [{ label, icon, onClick, danger }] */
export function RowMenu({ label = 'More actions', items }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const list = items.filter(Boolean);
  // keep the row's main button in line with the rows that have a menu
  if (!list.length) return <span aria-hidden="true" style={{ display: 'inline-block', width: 36, flex: 'none' }} />;
  return (
    <span className="ch-menu" ref={box}>
      <button type="button" className="gc-iconbtn" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}><Icon name="ellipsis" width="18" height="18" aria-hidden="true" /></button>
      {open ? (
        <div className="gc-dropdown" role="menu">
          {list.map((it) => (
            <button key={it.label} type="button" role="menuitem" className={'gc-dropdown__item' + (it.danger ? ' gc-dropdown__item--danger' : '')} onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick(); }}>
              {it.icon ? <Icon name={it.icon} width="16" height="16" aria-hidden="true" /> : null}{it.label}
            </button>
          ))}
        </div>
      ) : null}
    </span>
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
          <dl className="ch-facts">
            <dt>Title</dt><dd style={{ whiteSpace: 'normal' }}>{item.name}</dd>
            <dt>Price</dt><dd className="n">{money(item.price)}</dd>
            <dt>Availability</dt><dd>{item.stock > 0 ? 'In stock' : 'Out of stock'}</dd>
            <dt>Shown on</dt><dd>{meta.sub}</dd>
          </dl>
        </div>
        {issue ? <TechDetails issue={item.issue} /> : null}
      </div>
    </Sheet>
  );
}

/** The main action of a product row (one button) and the rest in a menu. */
export function rowActions(r, { onView, onFix }) {
  const meta = channelBy(r.ch);
  const issue = r.issue ? ISSUES[r.issue] : null;
  let main = null;
  if (issue && issue.kind === 'fix') main = { label: 'Fix', onClick: () => onFix(r) };
  else if (issue) main = { label: 'Retry', onClick: () => { retryItem(r.ch, r.key); toast('Trying again…'); } };
  else if (r.st === 'unpublished' && !r.draft) main = { label: 'Publish', onClick: () => { setPublished(r.ch, [r.key], true); toast(`Publishing to ${meta.short}…`); } };
  else main = { label: 'View', onClick: () => onView(r) };
  const menu = [
    main.label !== 'View' ? { label: 'View details', icon: 'eye', onClick: () => onView(r) } : null,
    !issue && isOk(r.st) ? { label: 'Sync this product', icon: 'refresh-cw', onClick: () => { retryItem(r.ch, r.key); toast('Sending again…'); } } : null,
    r.st !== 'unpublished' ? { label: `Remove from ${meta.short}`, icon: 'eye-off', danger: true, onClick: () => { setPublished(r.ch, [r.key], false); toast(`Removed from ${meta.short}`); } } : null,
  ];
  return { main, menu };
}
