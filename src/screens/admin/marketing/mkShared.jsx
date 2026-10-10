'use client';
// Marketing (super admin) — the parts the Overview, Campaigns, Campaign, Ads and UTM links pages share: the data hook
// (marketing store + platform data, both after mount), CSS, number and money text, the skeleton and error card, a card,
// status and channel marks, a platform logo, the results funnel, a budget bar, the New / Edit campaign side panel and
// the UTM builder side panel. The look follows the merchant panel's Campaigns & creatives and Ad accounts screens and the
// UTM builder in Attribution; the data is lib/admin/marketing.js only (never lib/adSpend, lib/attribution, lib/channels).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { useAdminStore } from '@/lib/admin/store';
import { formatBDT } from '@/lib/format';
import { DAY, TZ, dhaka } from '@/lib/platform/util';
import {
  marketing, STATUS_TONE, CH_COLOR, CHANNELS, GOALS, TEAM, BIZ_TYPES, DISTRICTS, SIZES, PLATFORMS, PAGES, SOURCES, MEDIUMS,
  CH_UTM, saveCampaign, saveUtm, buildUrl, utmSlug, campaignById, budgetOf,
} from '@/lib/admin/marketing';
import { usePlatform } from '../AdminShell';

// ---- data ----------------------------------------------------------------------------------------------------------------
/** { data, t, live }: the marketing store and the platform clock, both loaded after mount. */
export function useMarketing() {
  const { data, t, live } = useAdminStore(marketing);
  const p = usePlatform();
  return { data, t, live: live && p.live };
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
    if (key === 'tab') p.delete('open');
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  };
  return [v, set];
}

// ---- text ----------------------------------------------------------------------------------------------------------------
export const money = (n) => formatBDT(Math.round(Number(n) || 0));
export const num = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');
export const pct = (x, d = 1) => (x == null || !isFinite(x) ? '—' : x.toFixed(d).replace(/\.0$/, '') + '%');
export const plural = (n, one, many) => num(n) + ' ' + (Math.round(n) === 1 ? one : many || one + 's');
export const short = (n) => (n >= 1e5 ? (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(Math.round(n)));
export const moneyShort = (n) => '৳' + short(n || 0);
export const orDash = (v, f = money) => (v == null || !isFinite(v) ? '—' : f(v));
export const times = (x) => (x == null || !isFinite(x) ? '—' : x.toFixed(1) + '×');
export const delta = (a, b) => (b ? ((a - b) / b) * 100 : null);
/** "▲ 12%" with good / bad colour. lowerIsBetter for costs. */
export function Delta({ now: a, prev: b, lowerIsBetter }) {
  const x = delta(a, b);
  if (x == null || !isFinite(x)) return null;
  const good = lowerIsBetter ? x <= 0 : x >= 0;
  return <span className={'mk-delta ' + (Math.abs(x) < 1 ? '' : good ? 'is-good' : 'is-bad')}>{x >= 0 ? '▲' : '▼'} {Math.abs(x).toFixed(0)}%</span>;
}

/** Dhaka date <-> <input type=date>. */
export function toDateInput(ms) {
  if (!ms) return '';
  const d = new Date(ms + TZ);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
export function fromDateInput(s, endOfDay) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  return dhaka(Number(m[1]), Number(m[2]) - 1, Number(m[3]), endOfDay ? 23 : 0, endOfDay ? 59 : 0);
}

export async function copyText(text, what = 'Link') {
  try { await navigator.clipboard.writeText(text); toast(what + ' copied'); } catch { toast('Copy did not work here. Select the text and copy it.'); }
}

// ---- CSS -----------------------------------------------------------------------------------------------------------------
export const MK_CSS = `
.mk-skel{height:300px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:mk-sk 1.4s ease infinite}
.mk-skel--strip{height:72px}
@keyframes mk-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.mk-skel{animation:none}}
.mk-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.mk-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.mk-grid{display:grid;gap:var(--space-4);align-items:start}
.mk-grid--2{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.mk-grid--even{grid-template-columns:repeat(2,minmax(0,1fr))}
.mk-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading)}
.mk-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.mk-sub{display:block;overflow:hidden;max-width:320px;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.mk-name{display:flex;flex-direction:column;min-width:0;max-width:300px}
.mk-name>b,.mk-name>a{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap;text-decoration:none}
.mk-name>a:hover{color:var(--primary)}
.mk-delta{margin-left:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.mk-delta.is-good{color:var(--text-success)}
.mk-delta.is-bad{color:var(--text-danger)}
.mk-chs{display:inline-flex;flex-wrap:wrap;gap:4px 8px;font-size:var(--text-xs);color:var(--text-body)}
.mk-ch{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.mk-ch i{width:8px;height:8px;border-radius:var(--radius-full);flex:none}
.mk-plat{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.mk-plat img{width:16px;height:16px;object-fit:contain;flex:none}
.mk-bar{position:relative;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden;min-width:60px}
.mk-bar>span{position:absolute;inset:0 auto 0 0;border-radius:var(--radius-full);background:var(--primary)}
.mk-bar.is-warn>span{background:var(--warning)}
.mk-bar.is-bad>span{background:var(--error)}
.mk-bar>em{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--text-heading);opacity:.5}
.mk-budget{display:flex;flex-direction:column;gap:4px;min-width:120px}
.mk-budget small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.mk-funnel{display:flex;flex-direction:column;gap:var(--space-2)}
.mk-step{display:grid;grid-template-columns:110px minmax(0,1fr) 90px;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.mk-step>span:first-child{color:var(--text-body)}
.mk-step__bar{height:22px;border-radius:var(--radius-md);background:var(--surface-subtle);overflow:hidden}
.mk-step__bar>i{display:block;height:100%;border-radius:var(--radius-md);background:var(--viz-1);opacity:.85}
.mk-step>b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);text-align:right}
.mk-step__rate{grid-column:2/4;margin-top:-4px;font-size:var(--text-xs);color:var(--text-muted)}
.mk-form{display:flex;flex-direction:column;gap:var(--space-4)}
.mk-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.mk-field .gc-label{margin:0;display:flex;align-items:center;gap:4px}
.mk-field .gc-help{margin:0}
.mk-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.mk-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.mk-url{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.mk-url code{font-family:var(--font-data);font-size:var(--text-xs);line-height:1.6;color:var(--text-heading);overflow-wrap:anywhere;word-break:break-all}
.mk-url code b{font-weight:var(--weight-semibold);color:var(--primary)}
.mk-url__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.mk-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.mk-alerts{display:flex;flex-direction:column;padding:var(--space-1) var(--space-2) var(--space-2)}
.mk-alert{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.mk-alert:hover{background:var(--surface-subtle)}
.mk-alert__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning)}
.mk-alert__ic--err{background:var(--fill-error-soft);color:var(--text-danger)}
.mk-alert__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.mk-alert__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.mk-alert__txt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.mk-alert>svg{flex:none;color:var(--text-muted)}
.mk-ok{display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-3) var(--space-4) var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.mk-ok svg{color:var(--text-success)}
.mk-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.mk-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.mk-acts{width:1%;white-space:nowrap;text-align:right}
.mk-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-4)}
.mk-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
@media (max-width:1100px){.mk-grid--2,.mk-grid--even{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.mk-two,.mk-three{grid-template-columns:minmax(0,1fr)}.mk-step{grid-template-columns:84px minmax(0,1fr) 64px;gap:var(--space-2)}}
`;

// ---- small parts -------------------------------------------------------------------------------------------------------
export function Skel({ label, strip = true }) {
  return <div className="ix-page" aria-busy="true" aria-label={label}>{strip ? <div className="mk-skel mk-skel--strip" /> : null}<div className="mk-skel" /></div>;
}
export function LoadError({ text = 'This page could not be worked out.', onRetry }) {
  return (
    <section className="ix-card"><div className="mk-err" role="alert">
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
      <div className={flush ? '' : 'mk-body'}>{children}</div>
    </section>
  );
}
export function Status({ s }) { return <StatusBadge tone={STATUS_TONE[s] || 'neutral'}>{s}</StatusBadge>; }
export function Channels({ list }) {
  return <span className="mk-chs">{list.map((ch) => <span key={ch} className="mk-ch"><i style={{ background: CH_COLOR[ch] }} aria-hidden="true" />{ch}</span>)}</span>;
}
export function Plat({ p, label }) {
  const x = PLATFORMS[p];
  if (!x) return <span>{label || p}</span>;
  return <span className="mk-plat"><img src={x.logo} alt="" width="16" height="16" />{label || x.name}</span>;
}
/** A bar for used / planned; mark = where it should be by now (0–1). */
export function Bar({ value, mark, label }) {
  const v = Math.max(0, value || 0);
  const tone = v > 1 ? ' is-bad' : mark != null && v > mark + 0.12 ? ' is-warn' : '';
  return (
    <span className={'mk-bar' + tone} role="img" aria-label={label || `${Math.round(v * 100)}% used`}>
      <span style={{ width: Math.min(100, v * 100) + '%' }} />
      {mark != null ? <em style={{ left: `calc(${Math.min(100, mark * 100)}% - 1px)` }} /> : null}
    </span>
  );
}
export function BudgetCell({ spent, budget, mark }) {
  return (
    <span className="mk-budget">
      <Bar value={budget ? spent / budget : 0} mark={mark} label={`${money(spent)} of ${money(budget)}`} />
      <small><span className="mk-fig">{money(spent)}</span> of {money(budget)}</small>
    </span>
  );
}

/** Impressions → clicks → leads → trials → paid, with the step rates. */
export function Funnel({ m }) {
  const steps = [['Impressions', m.impressions], ['Clicks', m.clicks], ['Leads', m.leads], ['Trials', m.trials], ['Paid stores', m.paid]];
  const top = Math.max(1, steps[0][1]);
  return (
    <div className="mk-funnel" role="list" aria-label="Results funnel">
      {steps.map(([label, v], i) => {
        // a log scale, so paid stores still show next to impressions
        const w = v > 0 ? Math.max(3, (Math.log10(v + 1) / Math.log10(top + 1)) * 100) : 0;
        const prev = i ? steps[i - 1][1] : null;
        return (
          <div key={label} role="listitem">
            <div className="mk-step">
              <span>{label}</span>
              <span className="mk-step__bar" aria-hidden="true"><i style={{ width: w + '%', background: `var(--viz-${i + 1})` }} /></span>
              <b>{num(v)}</b>
            </div>
            {i ? <div className="mk-step"><span /><span className="mk-step__rate">{pct(prev ? (v / prev) * 100 : null, i === 1 ? 2 : 1)} of {steps[i - 1][0].toLowerCase()}</span></div> : null}
          </div>
        );
      })}
    </div>
  );
}

/** Up to five things to fix. */
export function FixList({ rows, okText }) {
  if (!rows.length) return <p className="mk-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />{okText}</p>;
  return (
    <div className="mk-alerts">
      {rows.map((r) => (
        <Link key={r.key} href={r.href} className="mk-alert">
          <span className={'mk-alert__ic' + (r.tone === 'err' ? ' mk-alert__ic--err' : '')} aria-hidden="true"><Icon name={r.tone === 'err' ? 'circle-alert' : 'triangle-alert'} width="16" height="16" /></span>
          <span className="mk-alert__txt"><b>{r.title}</b><small>{r.sub}</small></span>
          <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

function Field({ id, label, error, hint, optional, tip, children }) {
  return (
    <div className="mk-field">
      <label className="gc-label" htmlFor={id}>{label}{optional ? <span className="mk-opt"> (optional)</span> : null}{tip ? <InfoTip text={tip} /> : null}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
const ctl = (err, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (err ? ' gc-input--error' : ''), 'aria-invalid': err ? true : undefined });

// ---- New / Edit campaign ---------------------------------------------------------------------------------------------------
/** id: 'new', a campaign id, or null (closed). onSaved(id, created). */
export function CampaignSheet(props) {
  return props.id ? <CampaignForm key={props.id} {...props} /> : null;
}
function CampaignForm({ id, data, t, onClose, onSaved }) {
  const c = id !== 'new' ? campaignById(data, id) : null;
  const [f, setF] = useState(() => (c ? {
    name: c.name, goal: c.goal, channels: [...c.channels], budget: String(budgetOf(c)), start: toDateInput(c.start), end: toDateInput(c.end),
    type: c.audience.type, district: c.audience.district, size: c.audience.size, owner: c.owner, notes: c.notes || '',
  } : {
    name: '', goal: 'trials', channels: ['Meta', 'Email'], budget: '', start: toDateInput(t + DAY), end: toDateInput(t + 31 * DAY),
    type: BIZ_TYPES[0], district: DISTRICTS[0], size: SIZES[0], owner: TEAM[0].name, notes: '',
  }));
  const [err, setErr] = useState(null);   // { field, error }
  if (id !== 'new' && !c) return null;
  const set = (p) => { setF((x) => ({ ...x, ...p })); setErr(null); };
  const toggleCh = (ch) => set({ channels: f.channels.includes(ch) ? f.channels.filter((x) => x !== ch) : [...f.channels, ch] });
  const e = (k) => (err && err.field === k ? err.error : null);
  const draft = !c || c.state === 'draft';
  const slugPreview = c ? c.slug : utmSlug(f.name) || 'campaign-name';
  const started = !!c && c.state !== 'draft' && c.start <= t;

  const save = (launch) => {
    const res = saveCampaign({
      id: c ? c.id : null, name: f.name, goal: f.goal, channels: f.channels, budget: Number(String(f.budget).replace(/[^0-9.]/g, '')),
      start: fromDateInput(f.start), end: fromDateInput(f.end, true), audience: { type: f.type, district: f.district, size: f.size },
      owner: f.owner, notes: f.notes, launch,
    });
    if (!res.ok) { setErr({ field: res.field || 'form', error: res.error }); return; }
    toast(!c ? (launch ? 'Campaign launched · UTM links made' : 'Draft saved · UTM links made') : launch ? 'Campaign launched' : 'Changes saved');
    onClose();
    if (onSaved) onSaved(res.id, res.created);
  };

  return (
    <Sheet open title={c ? 'Edit campaign' : 'New campaign'} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        {draft ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => save(false)}>Save draft</button> : null}
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => save(draft)}>{draft ? 'Launch' : 'Save changes'}</button>
      </>}>
      <div className="mk-form">
        <Field id="mk-c-name" label="Name" error={e('name')}>
          <input id="mk-c-name" data-autofocus {...ctl(e('name'))} value={f.name} placeholder="e.g. Eid offer for Facebook sellers" onChange={(x) => set({ name: x.target.value })} />
        </Field>
        <div className="mk-field">
          <span className="gc-label" id="mk-c-goal">Goal</span>
          <div className="ix-chips" role="group" aria-labelledby="mk-c-goal">
            {GOALS.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={f.goal === k} onClick={() => set({ goal: k })}>{l}</button>)}
          </div>
        </div>
        <div className="mk-field">
          <span className="gc-label" id="mk-c-ch">Channels</span>
          <div className="ix-chips" role="group" aria-labelledby="mk-c-ch">
            {CHANNELS.map((ch) => (
              <button key={ch} type="button" className="ix-chip" aria-pressed={f.channels.includes(ch)} onClick={() => toggleCh(ch)}>
                <i style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: CH_COLOR[ch] }} aria-hidden="true" />{ch}
              </button>
            ))}
          </div>
          {e('channels') ? <p className="gc-help gc-help--error" role="alert">{e('channels')}</p> : null}
        </div>
        <div className="mk-three">
          <Field id="mk-c-budget" label="Budget (৳)" error={e('budget')} tip="The whole campaign’s budget, split evenly between the channels. Meta, Google and YouTube spend comes from the linked ads.">
            <input id="mk-c-budget" inputMode="numeric" {...ctl(e('budget'))} value={f.budget} placeholder="60,000" onChange={(x) => set({ budget: x.target.value })} />
          </Field>
          <Field id="mk-c-start" label="Starts" error={e('start')} hint={started ? 'Already started' : null}>
            <input id="mk-c-start" type="date" {...ctl(e('start'))} value={f.start} disabled={started} onChange={(x) => set({ start: x.target.value })} />
          </Field>
          <Field id="mk-c-end" label="Ends" error={e('end')}>
            <input id="mk-c-end" type="date" {...ctl(e('end'))} value={f.end} min={f.start || undefined} onChange={(x) => set({ end: x.target.value })} />
          </Field>
        </div>
        <div className="mk-three">
          <Field id="mk-c-type" label="Business type">
            <select id="mk-c-type" {...ctl(null, true)} value={f.type} onChange={(x) => set({ type: x.target.value })}>{BIZ_TYPES.map((v) => <option key={v}>{v}</option>)}</select>
          </Field>
          <Field id="mk-c-district" label="District">
            <select id="mk-c-district" {...ctl(null, true)} value={f.district} onChange={(x) => set({ district: x.target.value })}>{DISTRICTS.map((v) => <option key={v}>{v}</option>)}</select>
          </Field>
          <Field id="mk-c-size" label="Size">
            <select id="mk-c-size" {...ctl(null, true)} value={f.size} onChange={(x) => set({ size: x.target.value })}>{SIZES.map((v) => <option key={v}>{v}</option>)}</select>
          </Field>
        </div>
        <Field id="mk-c-owner" label="Owner" error={e('owner')}>
          <select id="mk-c-owner" {...ctl(e('owner'), true)} value={f.owner} onChange={(x) => set({ owner: x.target.value })}>
            {TEAM.map((p) => <option key={p.id} value={p.name}>{p.name} · {p.role}</option>)}
          </select>
        </Field>
        <Field id="mk-c-notes" label="Notes" optional>
          <textarea id="mk-c-notes" className="gc-input" rows={3} value={f.notes} onChange={(x) => set({ notes: x.target.value })} />
        </Field>
        <div className="mk-url" aria-label="UTM links">
          <span className="mk-url__row"><Icon name="link" width="14" height="14" aria-hidden="true" />{c ? 'A UTM link is made for each channel that has none.' : 'A UTM link is made for each channel:'}</span>
          {f.channels.slice(0, 3).map((ch) => <code key={ch}>{buildUrl({ page: '/signup', source: CH_UTM[ch][0], medium: CH_UTM[ch][1], campaign: slugPreview }).replace('https://', '')}</code>)}
          {f.channels.length > 3 ? <span className="mk-url__row">and {f.channels.length - 3} more</span> : null}
        </div>
        {err && err.field === 'form' ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err.error}</p> : null}
      </div>
    </Sheet>
  );
}

// ---- UTM builder ----------------------------------------------------------------------------------------------------------
/** open: false | { mcId? }. onSaved(id). */
export function UtmSheet({ open, data, onClose, onSaved }) {
  return open ? <UtmForm key={open.n || 1} preset={open} data={data} onClose={onClose} onSaved={onSaved} /> : null;
}
function UtmForm({ preset, data, onClose, onSaved }) {
  const pre = preset.mcId ? campaignById(data, preset.mcId) : null;
  const firstCh = pre ? pre.channels[0] : null;
  const [f, setF] = useState(() => ({
    name: pre ? `${pre.name} · ` : '', page: pre ? '/signup' : '/pricing', mcId: pre ? pre.id : '',
    source: firstCh ? CH_UTM[firstCh][0] : '', medium: firstCh ? CH_UTM[firstCh][1] : '', campaign: pre ? pre.slug : '', term: '', content: '',
  }));
  const [err, setErr] = useState(null);
  const [made, setMade] = useState(null);   // { short, url }
  const set = (p) => { setF((x) => ({ ...x, ...p })); setErr(null); };
  const clean = (v) => v.toLowerCase().replace(/\s+/g, '-');
  const pickCampaign = (id) => {
    const c = campaignById(data, id);
    if (!c) { set({ mcId: '' }); return; }
    const ch = c.channels[0];
    set({ mcId: id, campaign: c.slug, source: f.source || CH_UTM[ch][0], medium: f.medium || CH_UTM[ch][1], name: f.name || c.name + ' · ' });
  };
  const url = buildUrl(f);
  const e = (k) => (err && err.field === k ? err.error : null);
  const live = useMemo(() => [...data.campaigns].sort((a, b) => b.createdAt - a.createdAt), [data.campaigns]);
  const save = () => {
    const res = saveUtm(f);
    if (!res.ok) { setErr({ field: res.field || 'form', error: res.error }); return; }
    setMade(res);
    toast('Link made · ' + res.short);
    if (onSaved) onSaved(res.id);
  };
  const parts = [['utm_source', f.source], ['utm_medium', f.medium], ['utm_campaign', f.campaign], ['utm_term', f.term], ['utm_content', f.content]].filter((p) => p[1]);

  if (made) {
    return (
      <Sheet open title="Link made" onClose={onClose} footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Done</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => copyText('https://' + made.short, 'Short link')}><Icon name="copy" width="16" height="16" aria-hidden="true" /> Copy short link</button>
      </>}>
        <div className="mk-form">
          <div className="mk-url">
            <span className="mk-url__row">Short link</span>
            <code><b>{made.short}</b></code>
            <span className="mk-url__row">Opens</span>
            <code>{made.url}</code>
            <span className="mk-url__row"><button type="button" className="ix-btn ix-btn--sm" onClick={() => copyText(made.url, 'Full link')}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy full link</button></span>
          </div>
          <p className="mk-note">Clicks, leads, trials and paid stores from this link show in the UTM links list.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open title="New UTM link" onClose={onClose} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Make link</button>
    </>}>
      <div className="mk-form">
        <Field id="mk-u-name" label="Name" error={e('name')} hint="For the team: where the link is used.">
          <input id="mk-u-name" data-autofocus {...ctl(e('name'))} value={f.name} placeholder="e.g. Puja offer · Instagram story" onChange={(x) => set({ name: x.target.value })} />
        </Field>
        <div className="mk-two">
          <Field id="mk-u-page" label="Page it opens" error={e('page')}>
            <select id="mk-u-page" {...ctl(e('page'), true)} value={f.page} onChange={(x) => set({ page: x.target.value })}>
              {PAGES.map(([p, l]) => <option key={p} value={p}>{l} ({p})</option>)}
            </select>
          </Field>
          <Field id="mk-u-mc" label="Campaign" optional tip="Linking a campaign fills utm_campaign and counts this link’s results in that campaign’s channel.">
            <select id="mk-u-mc" {...ctl(null, true)} value={f.mcId} onChange={(x) => pickCampaign(x.target.value)}>
              <option value="">Not linked</option>
              {live.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mk-three">
          <Field id="mk-u-source" label="Source" error={e('source')}>
            <input id="mk-u-source" list="mk-u-sources" {...ctl(e('source'))} value={f.source} placeholder="facebook" onChange={(x) => set({ source: clean(x.target.value) })} />
          </Field>
          <Field id="mk-u-medium" label="Medium" error={e('medium')}>
            <input id="mk-u-medium" list="mk-u-mediums" {...ctl(e('medium'))} value={f.medium} placeholder="paid_social" onChange={(x) => set({ medium: clean(x.target.value) })} />
          </Field>
          <Field id="mk-u-campaign" label="Campaign name" error={e('campaign')}>
            <input id="mk-u-campaign" {...ctl(e('campaign'))} value={f.campaign} placeholder="puja-offer" onChange={(x) => set({ campaign: clean(x.target.value) })} />
          </Field>
        </div>
        <datalist id="mk-u-sources">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
        <datalist id="mk-u-mediums">{MEDIUMS.map((s) => <option key={s} value={s} />)}</datalist>
        <div className="mk-two">
          <Field id="mk-u-term" label="Term" optional error={e('term')} hint="Search keyword">
            <input id="mk-u-term" {...ctl(e('term'))} value={f.term} onChange={(x) => set({ term: clean(x.target.value) })} />
          </Field>
          <Field id="mk-u-content" label="Content" optional error={e('content')} hint="Which ad or button">
            <input id="mk-u-content" {...ctl(e('content'))} value={f.content} onChange={(x) => set({ content: clean(x.target.value) })} />
          </Field>
        </div>
        <div className="mk-url" aria-live="polite">
          <span className="mk-url__row">Full link</span>
          <code>{`${url.split('?')[0]}`}{parts.length ? '?' : ''}{parts.map(([k, v], i) => <React.Fragment key={k}>{i ? '&' : ''}{k}=<b>{encodeURIComponent(v)}</b></React.Fragment>)}</code>
          <span className="mk-url__row">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => copyText(url, 'Full link')}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy</button>
            <span>A gc.link short link is made when you save.</span>
          </span>
        </div>
        {err && err.field === 'form' ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err.error}</p> : null}
      </div>
    </Sheet>
  );
}
