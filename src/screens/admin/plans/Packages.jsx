'use client';
// Packages (/admin/packages?tab=online) — what GridCommerce sells. Title row (Export, New custom package), four key
// figures, the changes waiting for a second person, then one card per tab:
//   Online · Retail · Wholesale   the live version's three plans side by side (price, stores and their plan revenue,
//                                 limits, what each module set does), then the versions and drafts of the ladder
//   Communication only            the Connect edition's own family (lib/admin/packages.js), same layout
//   Add-ons                       ADDONS with today's price, a change waiting to start, stores billed; edit the price
//   Custom packages               a named set of modules for one merchant at an agreed price; assign puts it on the
//                                 store's bill (billing.addItem), end takes it off (billing.endItem)
//   Trial packages                per family: length, plan used, credits, extras, after the trial; module trials
// "Edit plan" opens /admin/packages/edit?ladder=&plan= (draft → second approver → live on a date).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { confirmDialog, toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, ago } from '@/lib/platform/util';
import { SETS, MODULES, LIMIT_KEYS, ADDONS, TRIALABLE, moduleBy } from '@/lib/platform/catalogue';
import { diff } from '@/lib/platform/plans';
import { subState, isLiveStore } from '@/lib/platform/billing';
import {
  COMMS, COMMS_LIMITS, COMMS_MODULES, FAMILIES, AFTER, familyLabel, planIdsOf, planNameOf, afterLabel,
  liveOf, versionsOf, draftsOf, pendingDrafts, planStats, setRuleOf, commsDiff, addonPrice, addonStats, trialRule,
  customList, customStatus, listPriceOf, saveCustom, assignCustom, endCustom, setTrialPackage, packageFacts,
} from '@/lib/admin/packages';
import { AdminShell, usePlatform } from '../AdminShell';
import { PK_CSS, usePackages, money, limitText, plural, Rule, Field, ctl, Row, PriceForm, TrialRuleForm, toNum } from './pkgShared';

const TABS = [
  ['online', 'Online'], ['retail', 'Retail'], ['wholesale', 'Wholesale'], ['comms', 'Communication only'],
  ['addons', 'Add-ons'], ['custom', 'Custom packages'], ['trials', 'Trial packages'],
];
const TAB_KEYS = TABS.map((x) => x[0]);
const DRAFT_STATE = { draft: ['Draft', 'neutral'], pending: ['Waiting for approval', 'warning'], rejected: ['Rejected', 'error'], approved: ['Approved', 'success'] };
const SIGN = { '+': 'is-add', '−': 'is-del', '~': 'is-chg' };
const editHref = (family, plan, draft) => `/admin/packages/edit?ladder=${family}&plan=${plan}${draft ? '&draft=' + draft : ''}`;
/** Sets shown on a ladder: the cores, its own segment set, and the sets every plan decides about. */
const setsFor = (family) => SETS.filter((s) => !s.ladder || s.ladder === family);

const CSS = `
.pkp-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3)}
.pkp-head h2{margin:0}
.pkp-sub{font-size:var(--text-xs);color:var(--text-muted)}
.pkp-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.pkp-ver details{width:100%}
.pkp-ver summary{cursor:pointer;font-size:var(--text-xs);color:var(--primary)}
.pkp-ver .pk-diff{margin-top:var(--space-2)}
.pkp-mods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.pkp-mod{display:flex;align-items:flex-start;gap:var(--space-2);padding:6px var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.pkp-mod:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft);color:var(--text-heading)}
.pkp-mod input{flex:none;margin-top:1px}
.pkp-mod>span{display:flex;flex-direction:column;min-width:0}
.pkp-mod small{font-size:var(--text-xs);color:var(--text-muted)}
.pkp-price{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.pkp-price dd{margin:0;text-align:right;font-family:var(--font-data);color:var(--text-heading)}
.pkp-price .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold)}
@media (max-width:640px){.pkp-mods{grid-template-columns:minmax(0,1fr)}}
`;

function Diff({ rows }) {
  if (!rows.length) return <p className="pk-small pk-muted">No changes.</p>;
  return (
    <ul className="pk-diff">
      {rows.map(([s, text], i) => <li key={i}><span className={'pk-diff__s ' + SIGN[s]} aria-hidden="true">{s}</span><span>{text}</span></li>)}
    </ul>
  );
}
/** What changed per plan between two versions of a family. */
function versionDiff(family, prev, ver) {
  const out = [];
  for (const p of planIdsOf(family)) {
    const a = prev.plans[p], b = ver.plans[p];
    if (!a || !b) continue;
    for (const [s, text] of (family === COMMS ? commsDiff(a, b) : diff(a, b))) out.push([s, `${b.name}: ${text}`]);
  }
  return out;
}

// ---- a family's plans side by side ------------------------------------------------------------------------------
function FamilyPanel({ db, data, t, family }) {
  const live = liveOf(db, data, family, t);
  const plans = planIdsOf(family);
  const stats = Object.fromEntries(plans.map((p) => [p, planStats(db, t, family, p)]));
  const comms = family === COMMS;
  const limits = comms ? COMMS_LIMITS : LIMIT_KEYS;
  const versions = versionsOf(db, data, family, t);
  const drafts = draftsOf(db, data, family).filter((d) => d.status !== 'approved');
  const cell = (fn) => plans.map((p) => <td key={p}>{fn(live.plans[p], p)}</td>);
  const sec = (label) => <tr className="pk-cmp__sec"><th scope="colgroup" colSpan={plans.length + 1}>{label}</th></tr>;

  return (
    <>
      <section className="ix-card" aria-labelledby={'pkp-live-' + family}>
        <div className="ix-card__head">
          <div className="pkp-head">
            <h2 id={'pkp-live-' + family}>Live · version {live.v}</h2>
            <span className="pkp-sub">since {dmy(live.liveFrom)} · approved by {live.approvedBy}</span>
          </div>
          {comms ? <InfoTip text="The Connect edition (inbox, SMS, WhatsApp, AI, CRM and a counter till) sold on its own. No store is on it yet: it opens with the Connect edition site." /> : null}
        </div>
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static gc-table--keep gc-table--scroll pk-cmp">
            <caption className="sr-only">{familyLabel(family)} plans, version {live.v}</caption>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Plan</span></th>
                {plans.map((p) => (
                  <th scope="col" key={p}>
                    <span className="pk-plan">
                      <b>{live.plans[p].name}</b>
                      <small>{live.plans[p].tagline}</small>
                      <Link href={editHref(family, p)} className="ix-btn ix-btn--sm"><Icon name="pencil" width="14" height="14" aria-hidden="true" />Edit plan</Link>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sec('Price')}
              <tr><th scope="row">Monthly</th>{cell((x) => <span className="pk-fig">{money(x.price)}</span>)}</tr>
              <tr><th scope="row">Yearly</th>{cell((x) => <span className="pk-data">{x.yearly ? money(x.yearly) : '—'}</span>)}</tr>
              <tr><th scope="row">Setup fee</th>{cell((x) => <span className="pk-data">{x.setup ? money(x.setup) : 'None'}</span>)}</tr>
              <tr><th scope="row">Trial</th>{cell((x) => `${x.trialDays} days`)}</tr>
              {sec('Stores')}
              <tr><th scope="row">Stores</th>{cell((x, p) => <span className="pk-data">{stats[p].stores}{stats[p].older ? <span className="pk-muted"> · {stats[p].older} on older versions</span> : null}</span>)}</tr>
              <tr><th scope="row">Paying · on trial</th>{cell((x, p) => <span className="pk-data">{stats[p].paying} · {stats[p].trial}</span>)}</tr>
              <tr><th scope="row">Plan revenue a month</th>{cell((x, p) => <span className="pk-fig">{stats[p].mrr ? money(stats[p].mrr) : '—'}</span>)}</tr>
              {sec('Limits')}
              {limits.map(([k, label]) => <tr key={k}><th scope="row">{label}</th>{cell((x) => <span className="pk-data">{limitText(k, x.limits[k])}</span>)}</tr>)}
              {sec('Modules')}
              {comms
                ? COMMS_MODULES.map((c) => (
                  <tr key={c}><th scope="row">{(moduleBy(c) || {}).name} <span className="pk-muted pk-data">{c}</span></th>
                    {cell((x) => (x.modules.includes(c) ? <span className="pk-yes"><Icon name="check" width="14" height="14" aria-hidden="true" />Included</span> : <span className="pk-no">—</span>))}</tr>
                ))
                : setsFor(family).map((s) => (
                  <tr key={s.id}><th scope="row">{s.label}</th>{cell((x) => <Rule rule={setRuleOf(x, s.id, family)} />)}</tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ix-card" aria-labelledby={'pkp-ver-' + family}>
        <div className="ix-card__head"><h2 id={'pkp-ver-' + family}>Versions and changes</h2></div>
        <div className="pkp-body pk-list">
          {drafts.map((d) => {
            const [label, tone] = DRAFT_STATE[d.status] || DRAFT_STATE.draft;
            return (
              <Row key={d.id} href={editHref(family, d.plan, d.id)}
                title={<>{planNameOf(family, d.plan)} · version {d.v} <span className="pk-muted pk-data">{d.id}</span></>}
                sub={`${d.status === 'pending' ? 'Sent ' + ago(d.sentAt, t) + ' to ' + d.approver : 'Saved ' + ago(d.at, t)} · by ${d.by}${d.status === 'rejected' ? ' · ' + (d.decisionNote || '') : ''}`}
                end={<StatusBadge tone={tone}>{label}</StatusBadge>} />
            );
          })}
          {versions.map((v, i) => {
            const prev = versions[i + 1];
            const changes = prev ? versionDiff(family, prev, v) : [];
            return (
              <div key={v.v} className="pk-row pkp-ver">
                <span className="pk-row__main">
                  <b>Version {v.v}</b>
                  <small>{v.state === 'Scheduled' ? 'Goes live' : 'Live from'} {dmy(v.liveFrom)} · drafted by {v.by}, approved by {v.approvedBy}{v.note ? ' · ' + v.note : ''}</small>
                  {changes.length ? <details><summary>{plural(changes.length, 'change')}</summary><Diff rows={changes} /></details> : null}
                </span>
                <span className="pk-row__end"><StatusBadge tone={v.state === 'Live' ? 'success' : v.state === 'Scheduled' ? 'primary' : 'neutral'}>{v.state}</StatusBadge></span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ---- add-ons --------------------------------------------------------------------------------------------------
function AddonsPanel({ db, data, t, onPrice }) {
  const rows = ADDONS.map((a) => ({ ...a, cur: addonPrice(data, a.code, t), stats: addonStats(db, t, a.code), mod: moduleBy(a.code), trial: trialRule(data, a.code) }));
  const per = (a) => (a.period === 'Once' ? 'once' : 'a month');
  return (
    <section className="ix-card" aria-label="Add-ons">
      <ul className="ix-plist">
        {rows.map((a) => (
          <li key={a.code}>
            <button type="button" className="ix-pitem" onClick={() => onPrice(a.code)}>
              <span className="ix-pitem__top"><b>{a.name}</b><span className="pk-fig">{money(a.cur.price)}</span></span>
              <span className="ix-pitem__mid">{per(a)} · {plural(a.stats.stores, 'store')} billed{a.cur.next ? ` · ${money(a.cur.next.to)} from ${dmy(a.cur.next.effective)}` : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Add-ons</caption>
          <thead><tr><th scope="col">Add-on</th><th scope="col">Billed</th><th scope="col" className="ix-num">Price</th><th scope="col" className="ix-num">Stores</th><th scope="col" className="ix-num">A month</th><th scope="col">Trial</th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.code} tabIndex={0} onClick={() => onPrice(a.code)} onKeyDown={(e) => { if (e.key === 'Enter') onPrice(a.code); }}>
                <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); onPrice(a.code); }}>{a.name}</button></td>
                <td className="ix-muted">{a.kind === 'credits' ? 'Credits, monthly' : a.period === 'Once' ? 'Once' : 'Monthly'}</td>
                <td className="ix-num"><span className="pk-fig">{money(a.cur.price)}</span>{a.cur.next ? <div className="pk-small pk-muted">{money(a.cur.next.to)} from {dmy(a.cur.next.effective)}</div> : null}</td>
                <td className="ix-num pk-data">{a.stats.stores}</td>
                <td className="ix-num pk-data">{a.stats.mrr ? money(a.stats.mrr) : '—'}</td>
                <td className="ix-muted">{a.mod && a.trial.offered ? `${a.trial.days} days` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>{plural(rows.length, 'add-on')}</span><Link href="/admin/modules" className="ix-btn ix-btn--sm ix-btn--plain">Every module<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link></div>
    </section>
  );
}

// ---- custom packages ------------------------------------------------------------------------------------------
function CustomPanel({ db, data, t, onOpen }) {
  const rows = customList(db, data, t);
  if (!rows.length) {
    return <section className="ix-card"><div className="ix-empty"><EmptyState icon="package-plus" title="No custom packages yet." actionLabel="New custom package" onAction={() => onOpen(null)} /></div></section>;
  }
  return (
    <section className="ix-card" aria-label="Custom packages">
      <ul className="ix-plist">
        {rows.map((c) => {
          const [label, tone] = customStatus(c.status);
          return (
            <li key={c.id}>
              <button type="button" className="ix-pitem" onClick={() => onOpen(c.id)}>
                <span className="ix-pitem__top"><b>{c.name}</b><span className="pk-fig">{money(c.price)}</span></span>
                <span className="ix-pitem__mid">{c.shopName || 'No store yet'} · {plural(c.modules.length, 'module')} · {c.cycle === 'Yearly' ? 'a year' : 'a month'}</span>
                <span className="ix-pitem__tags"><StatusBadge tone={tone}>{label}</StatusBadge></span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Custom packages</caption>
          <thead><tr><th scope="col">Package</th><th scope="col">Store</th><th scope="col">Starts from</th><th scope="col" className="ix-num">Modules</th><th scope="col" className="ix-num">Price</th><th scope="col" className="ix-num">Under list</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {rows.map((c) => {
              const [label, tone] = customStatus(c.status);
              return (
                <tr key={c.id} tabIndex={0} onClick={() => onOpen(c.id)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(c.id); }}>
                  <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); onOpen(c.id); }}>{c.name}</button><div className="pk-small pk-muted pk-data">{c.id}</div></td>
                  <td>{c.shopId ? <Link href={`/admin/merchant?id=${c.shopId}`} onClick={(e) => e.stopPropagation()}>{c.shopName}</Link> : <span className="ix-muted">Not chosen</span>}</td>
                  <td className="ix-muted">{familyLabel(c.ladder)} · {planNameOf(c.ladder, c.plan)}</td>
                  <td className="ix-num"><span className="pk-data" title={c.modules.map((m) => (moduleBy(m) || {}).name).join(', ')}>{c.modules.length}</span></td>
                  <td className="ix-num"><span className="pk-fig">{money(c.price)}</span><div className="pk-small pk-muted">{c.cycle === 'Yearly' ? 'a year' : 'a month'}</div></td>
                  <td className="ix-num pk-data">{c.off > 0 ? c.off + '%' : '—'}</td>
                  <td><StatusBadge tone={tone}>{label}</StatusBadge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>{plural(rows.length, 'custom package')}</span></div>
    </section>
  );
}

/** Create, edit, assign or end a custom package. */
function CustomSheet({ open, id, db, data, t, onClose }) {
  const existing = id ? data.custom.find((c) => c.id === id) : null;
  const blank = { name: '', shopId: '', ladder: 'online', plan: 'business', modules: [], price: '', cycle: 'Monthly', note: '' };
  // the parent remounts this sheet (key) for each package, so the form starts from it
  const [f, setF] = useState(() => (existing ? { ...existing, shopId: existing.shopId || '', price: String(existing.price) } : blank));
  const [err, setErr] = useState({});
  const [reason, setReason] = useState('');
  if (!open) return null;
  const locked = existing && existing.status !== 'draft';
  const shops = db.shops.filter((s) => isLiveStore(subState(db, s.id, t))).slice().sort((a, b) => a.name.localeCompare(b.name));
  const live = liveOf(db, data, f.ladder, t);
  const base = live.plans[f.plan] || live.plans[planIdsOf(f.ladder)[0]];
  const inPlan = (m) => (f.ladder === COMMS ? base.modules.includes(m.code) : setRuleOf(base, m.set, f.ladder) === 'Included');
  const choices = (f.ladder === COMMS ? COMMS_MODULES.map(moduleBy) : MODULES_PICK).filter(Boolean);
  const list = listPriceOf(db, data, { ...f, price: toNum(f.price) }, t);
  const price = toNum(f.price);
  const off = list && price ? Math.round(((list - price) / list) * 100) : 0;
  const set = (k) => (e) => setF({ ...f, [k]: e && e.target ? e.target.value : e });
  const toggle = (code) => setF({ ...f, modules: f.modules.includes(code) ? f.modules.filter((c) => c !== code) : [...f.modules, code] });
  const setFamily = (fam) => setF({ ...f, ladder: fam, plan: planIdsOf(fam)[1] || planIdsOf(fam)[0], modules: [] });

  const save = (andAssign) => {
    const r = saveCustom({ ...f, id: existing ? existing.id : null, price });
    if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : { form: r.error }); return; }
    if (!andAssign) { toast(existing ? 'Package saved' : 'Custom package saved'); onClose(); return; }
    const a = assignCustom(r.custom.id, f.shopId);
    if (!a.ok) { setErr(a.field ? { [a.field]: a.error } : { form: a.error }); return; }
    const shop = shops.find((s) => s.id === f.shopId);
    toast(`${r.custom.name} is on ${shop ? shop.name : 'the store'}’s bill`);
    onClose();
  };
  const end = async () => {
    if (!reason.trim()) { setErr({ reason: 'Say why the package ends.' }); return; }
    if (!(await confirmDialog({ title: `End ${existing.name}?`, body: 'It comes off the store’s bill from the next bill. The store keeps its plan.', confirmLabel: 'End package', tone: 'danger' }))) return;
    const r = endCustom(existing.id, reason);
    if (!r.ok) { setErr({ form: r.error }); return; }
    toast('Package ended');
    onClose();
  };

  if (locked) {
    const shop = db.shops.find((s) => s.id === existing.shopId);
    return (
      <Sheet open title={existing.name} onClose={onClose}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
          {existing.status === 'assigned' ? <button type="button" className="gc-btn gc-btn--solid gc-btn--error" onClick={end}>End package</button> : null}
        </>}>
        <KV rows={[
          ['Store', shop ? <Link href={`/admin/merchant?id=${shop.id}&tab=billing`}>{shop.name}</Link> : '—'],
          ['Starts from', `${familyLabel(existing.ladder)} · ${planNameOf(existing.ladder, existing.plan)}`],
          ['Price', `${money(existing.price)} ${existing.cycle === 'Yearly' ? 'a year' : 'a month'}`],
          ['Status', customStatus(existing.status)[0]],
          existing.assignedAt ? ['Assigned', `${dmy(existing.assignedAt)}${existing.assignedBy ? ' by ' + existing.assignedBy : ''}`] : null,
          existing.endedAt ? ['Ended', `${dmy(existing.endedAt)} · ${existing.endReason}`] : null,
        ]} />
        <p className="pk-sec">Modules</p>
        <div className="pk-list">{existing.modules.map((c) => <Row key={c} title={(moduleBy(c) || {}).name || c} sub={c} />)}</div>
        {existing.note ? <p className="pk-rule">{existing.note}</p> : null}
        {existing.status === 'assigned' ? (
          <Field id="pk-end-reason" label="Why it ends" error={err.reason}>
            <input {...ctl('pk-end-reason', err.reason)} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Moved to Enterprise" />
          </Field>
        ) : null}
        {err.form ? <p className="pk-err" role="alert">{err.form}</p> : null}
      </Sheet>
    );
  }

  return (
    <Sheet open title={existing ? 'Edit custom package' : 'New custom package'} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--soft" onClick={() => save(false)}>Save</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => save(true)} disabled={!f.shopId}>Save and assign</button>
      </>}>
      <div className="pk-form">
        <Field id="pk-c-name" label="Name" error={err.name}>
          <input {...ctl('pk-c-name', err.name)} data-autofocus value={f.name} onChange={set('name')} placeholder="e.g. Mohona trade bundle" />
        </Field>
        <Field id="pk-c-shop" label="Store" error={err.shopId} hint="Needed to assign it; it can wait.">
          <select {...ctl('pk-c-shop', err.shopId, true)} value={f.shopId} onChange={set('shopId')}>
            <option value="">Not chosen yet</option>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
          </select>
        </Field>
        <div className="pk-two">
          <Field id="pk-c-fam" label="Package">
            <select {...ctl('pk-c-fam', null, true)} value={f.ladder} onChange={(e) => setFamily(e.target.value)}>
              {FAMILIES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </Field>
          <Field id="pk-c-plan" label="Starts from plan" error={err.plan}>
            <select {...ctl('pk-c-plan', err.plan, true)} value={f.plan} onChange={set('plan')}>
              {planIdsOf(f.ladder).map((p) => <option key={p} value={p}>{planNameOf(f.ladder, p)} · {money(live.plans[p].price)}</option>)}
            </select>
          </Field>
        </div>
        <fieldset className="pk-field" style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }} aria-describedby={err.modules ? 'pk-c-mods-err' : undefined}>
          <legend className="gc-label">Modules</legend>
          <div className="pkp-mods">
            {choices.map((m) => (
              <label key={m.code} className="pkp-mod">
                <input type="checkbox" className="gc-check" checked={f.modules.includes(m.code)} onChange={() => toggle(m.code)} />
                <span>{m.name}<small>{m.code}{inPlan(m) ? ' · in the plan' : addonPrice(data, m.code, t) ? ' · ' + money(addonPrice(data, m.code, t).price) : ''}</small></span>
              </label>
            ))}
          </div>
          {err.modules ? <p className="pk-err" id="pk-c-mods-err" role="alert">{err.modules}</p> : null}
        </fieldset>
        <div className="pk-two">
          <Field id="pk-c-price" label="Agreed price (৳)" error={err.price}>
            <input {...ctl('pk-c-price', err.price)} inputMode="numeric" value={f.price} onChange={set('price')} />
          </Field>
          <Field id="pk-c-cycle" label="Billed">
            <select {...ctl('pk-c-cycle', null, true)} value={f.cycle} onChange={set('cycle')}>
              <option value="Monthly">Monthly</option><option value="Yearly">Yearly</option>
            </select>
          </Field>
        </div>
        <dl className="pkp-price">
          <dt>List price</dt><dd>{money(list)}</dd>
          <dt className="is-total">Agreed</dt><dd className="is-total">{price ? money(price) : '—'}{off > 0 ? <span className="pk-muted"> · {off}% under list</span> : null}</dd>
        </dl>
        <Field id="pk-c-note" label="Note" optional>
          <textarea {...ctl('pk-c-note')} rows={3} value={f.note} onChange={set('note')} placeholder="What was agreed, and with whom" />
        </Field>
        {err.form ? <p className="pk-err" role="alert">{err.form}</p> : null}
      </div>
    </Sheet>
  );
}
/** Modules a custom package can add on a ladder plan: everything outside the two cores. */
const MODULES_PICK = MODULES.filter((m) => m.set !== 'platform' && m.set !== 'everyday');

// ---- trial packages ------------------------------------------------------------------------------------------
function TrialsPanel({ db, data, t, onEdit, onModule }) {
  const fams = FAMILIES;
  const modTrials = TRIALABLE.map((x) => ({ ...x, rule: trialRule(data, x.code) }));
  const running = Object.values(db.subs).reduce((n, sub) => n + sub.moduleTrials.filter((m) => !m.result && m.start <= t && m.start + m.days * 864e5 > t).length, 0);
  return (
    <>
      <section className="ix-card" aria-labelledby="pkp-trials">
        <div className="ix-card__head"><h2 id="pkp-trials">What a new store gets on trial</h2></div>
        <ul className="ix-plist">
          {fams.map((x) => {
            const tp = data.trialPackages[x.id];
            return (
              <li key={x.id}>
                <button type="button" className="ix-pitem" onClick={() => onEdit(x.id)}>
                  <span className="ix-pitem__top"><b>{x.label}</b><span className="pk-data">{tp.days} days</span></span>
                  <span className="ix-pitem__mid">{planNameOf(x.id, tp.plan)} · {afterLabel(tp.after)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Trial packages</caption>
            <thead><tr><th scope="col">Package</th><th scope="col" className="ix-num">Length</th><th scope="col">Runs as</th><th scope="col" className="ix-num">Credits</th><th scope="col">Free extras</th><th scope="col">Card needed</th><th scope="col">After the trial</th></tr></thead>
            <tbody>
              {fams.map((x) => {
                const tp = data.trialPackages[x.id];
                return (
                  <tr key={x.id} tabIndex={0} onClick={() => onEdit(x.id)} onKeyDown={(e) => { if (e.key === 'Enter') onEdit(x.id); }}>
                    <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); onEdit(x.id); }}>{x.label}</button></td>
                    <td className="ix-num pk-data">{tp.days} days</td>
                    <td>{planNameOf(x.id, tp.plan)}</td>
                    <td className="ix-num pk-data">{money(tp.credits)}</td>
                    <td className="ix-muted">{tp.extras.length ? tp.extras.map((c) => (moduleBy(c) || {}).name || c).join(', ') : '—'}</td>
                    <td className="ix-muted">{tp.card ? 'Yes' : 'No'}</td>
                    <td className="ix-muted">{afterLabel(tp.after)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ix-card" aria-labelledby="pkp-modtrials">
        <div className="ix-card__head">
          <div className="pkp-head"><h2 id="pkp-modtrials">Module trials</h2><span className="pkp-sub">{plural(running, 'trial')} running now</span></div>
        </div>
        <div className="pkp-body pk-list">
          {modTrials.map((x) => (
            <Row key={x.code} onClick={() => onModule(x.code)} title={x.label}
              sub={x.rule.offered ? `${x.rule.days} days · ${x.rule.autoAdd ? `then added at ${money(x.rule.price)} a month` : 'ends by itself'}` : 'Not offered'}
              end={<StatusBadge tone={x.rule.offered ? 'success' : 'neutral'}>{x.rule.offered ? 'Offered' : 'Off'}</StatusBadge>} />
          ))}
        </div>
      </section>

      {data.trialLog.length ? (
        <section className="ix-card" aria-labelledby="pkp-tlog">
          <div className="ix-card__head"><h2 id="pkp-tlog">Recent trial changes</h2></div>
          <div className="pkp-body pk-list">
            {data.trialLog.slice(0, 6).map((l) => <Row key={l.id} title={l.text} sub={`${ago(l.at, t)} · ${l.by}`} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}

function TrialPackageSheet({ family, data, onClose }) {
  const tp = family ? data.trialPackages[family] : null;
  const [f, setF] = useState(() => (tp ? { ...tp, days: String(tp.days), credits: String(tp.credits), extras: [...tp.extras], reason: '' } : null));   // remounted per family (key)
  const [err, setErr] = useState({});
  if (!family || !f) return null;
  const addons = ADDONS.filter((a) => a.kind === 'module');
  const save = () => {
    const r = setTrialPackage(family, { ...f, days: toNum(f.days), credits: toNum(f.credits) }, f.reason);
    if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : { form: r.error }); return; }
    toast(`${familyLabel(family)} trial saved`);
    onClose();
  };
  return (
    <Sheet open title={`${familyLabel(family)} trial`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button></>}>
      <div className="pk-form">
        <div className="pk-two">
          <Field id="pk-t-days" label="Length (days)" error={err.days}>
            <input {...ctl('pk-t-days', err.days)} data-autofocus inputMode="numeric" value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} />
          </Field>
          <Field id="pk-t-plan" label="Runs as" error={err.plan}>
            <select {...ctl('pk-t-plan', err.plan, true)} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })}>
              {planIdsOf(family).map((p) => <option key={p} value={p}>{planNameOf(family, p)}</option>)}
            </select>
          </Field>
          <Field id="pk-t-credits" label="Free credits (৳)" hint="SMS, WhatsApp, email and AI">
            <input {...ctl('pk-t-credits')} inputMode="numeric" value={f.credits} onChange={(e) => setF({ ...f, credits: e.target.value })} />
          </Field>
          <Field id="pk-t-after" label="After the trial">
            <select {...ctl('pk-t-after', null, true)} value={f.after} onChange={(e) => setF({ ...f, after: e.target.value })}>
              {AFTER.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
        </div>
        <fieldset className="pk-field" style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend className="gc-label">Free extras during the trial</legend>
          <div className="pkp-mods">
            {addons.map((a) => (
              <label key={a.code} className="pkp-mod">
                <input type="checkbox" className="gc-check" checked={f.extras.includes(a.code)} onChange={() => setF({ ...f, extras: f.extras.includes(a.code) ? f.extras.filter((c) => c !== a.code) : [...f.extras, a.code] })} />
                <span>{a.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="pk-check">
          <input type="checkbox" className="gc-check" checked={!!f.card} onChange={(e) => setF({ ...f, card: e.target.checked })} />
          <span>Ask for a card or bKash number at sign-up<small>Fewer sign-ups, more of them pay.</small></span>
        </label>
        <Field id="pk-t-reason" label="Why" error={err.reason}>
          <input {...ctl('pk-t-reason', err.reason)} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="e.g. Eid campaign: longer trials" />
        </Field>
        {err.form ? <p className="pk-err" role="alert">{err.form}</p> : null}
      </div>
    </Sheet>
  );
}

// ---- the page --------------------------------------------------------------------------------------------------
export default function Packages() {
  const { db, t, live } = usePlatform();
  const { data, live: pkLive } = usePackages();
  const [tab, setTab] = useState('online');
  const [custom, setCustom] = useState(null);    // { id } while the custom package sheet is open (id null: new)
  const [price, setPrice] = useState(null);      // add-on code while its price sheet is open
  const [trialFam, setTrialFam] = useState(null);
  const [modTrial, setModTrial] = useState(null);
  const ready = live && pkLive;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('tab');
    if (TAB_KEYS.includes(p)) setTab(p);
  }, []);
  const go = (k) => {
    setTab(k);
    try { window.history.replaceState(window.history.state, '', window.location.pathname + (k === 'online' ? '' : '?tab=' + k)); } catch { /* ignore */ }
  };

  const exportCsv = () => {
    const rows = [['Package', 'Version', 'Plan', 'Monthly (BDT)', 'Yearly (BDT)', 'Trial days', 'Stores', 'Paying', 'Plan revenue a month (BDT)']];
    for (const fam of FAMILIES) {
      const lv = liveOf(db, data, fam.id, t);
      for (const p of planIdsOf(fam.id)) {
        const s = planStats(db, t, fam.id, p);
        rows.push([fam.label, lv.v, lv.plans[p].name, lv.plans[p].price, lv.plans[p].yearly, lv.plans[p].trialDays, s.stores, s.paying, s.mrr]);
      }
    }
    for (const a of ADDONS) rows.push(['Add-on', '', a.name, addonPrice(data, a.code, t).price, '', '', addonStats(db, t, a.code).stores, '', addonStats(db, t, a.code).mrr]);
    downloadCsv('gridcommerce-packages.csv', rows);
    toast('Packages exported');
  };

  const header = (
    <ShopHeader icon="package" title="Packages"
      about="What GridCommerce sells: the Online, Retail and Wholesale plan ladders, the Connect (communication only) family, add-ons, custom packages for one merchant and the trial each package starts with. A plan change is a draft of the next version; a second person (Finance or an Admin, never the one who drafted it) approves it, and it goes live on its date. Stores keep the version they bought."
      secondary={ready ? [{ label: 'Export', icon: 'download', onClick: exportCsv }] : []}
      primary={{ label: 'New custom package', icon: 'plus', onClick: () => { go('custom'); setCustom({ id: null }); } }} />
  );

  if (!ready) {
    return (
      <AdminShell active="packages" title="Packages">
        <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
        <div className="ix-page">{header}<div className="pk-skel pk-skel--sm" /><div className="pk-skel" aria-busy="true" aria-label="Loading packages" /></div>
      </AdminShell>
    );
  }

  const facts = packageFacts(db, data, t);
  const pending = pendingDrafts(db, data);
  const storesOn = (fam) => Object.values(db.subs).filter((s) => s.ladder === fam && isLiveStore(subState(db, s.shopId, t))).length;
  const counts = { online: storesOn('online'), retail: storesOn('retail'), wholesale: storesOn('wholesale'), comms: 0, addons: ADDONS.length, custom: data.custom.filter((c) => c.status !== 'ended').length, trials: null };
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'pkp-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => go(k) }));

  return (
    <AdminShell active="packages" title="Packages">
      <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
      <div className="ix-page">
        {header}
        <MetricStrip items={[
          { label: 'Paying stores', value: facts.paying, icon: 'store' },
          { label: 'Plan revenue a month', value: money(facts.mrr) },
          { label: 'Stores on trial', value: facts.trial, icon: 'hourglass' },
          { label: 'Add-on revenue a month', value: money(ADDONS.reduce((n, a) => n + addonStats(db, t, a.code).mrr, 0)), onClick: () => go('addons') },
        ]} />

        {pending.length ? (
          <section className="ix-card" aria-labelledby="pkp-pending">
            <div className="ix-card__head">
              <h2 id="pkp-pending">Waiting for approval · {pending.length}</h2>
              <InfoTip text="The person who drafted a change can’t approve it. Finance or an Admin approves; the new version goes live on its date." />
            </div>
            <div className="pkp-body pk-list">
              {pending.slice(0, 5).map((d) => (
                <Row key={d.id} href={editHref(d.ladder, d.plan, d.id)}
                  title={<>{familyLabel(d.ladder)} · {planNameOf(d.ladder, d.plan)} version {d.v}</>}
                  sub={`By ${d.by}, sent ${ago(d.sentAt, t)} · for ${d.approver}${d.liveFrom ? ' · live from ' + dmy(d.liveFrom) : ''}`}
                  end={<span className="ix-btn ix-btn--sm">Review</span>} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="ix-card" aria-label="Package views" style={{ padding: 'var(--space-2)' }}>
          <IndexTabs label="Package views" tabs={tabs} />
        </section>

        <div role="tabpanel" aria-labelledby={'pkp-tab-' + tab} className="ix-page">
          {['online', 'retail', 'wholesale', COMMS].includes(tab) ? <FamilyPanel db={db} data={data} t={t} family={tab} /> : null}
          {tab === 'addons' ? <AddonsPanel db={db} data={data} t={t} onPrice={setPrice} /> : null}
          {tab === 'custom' ? (
            <>
              <div className="pk-actions"><button type="button" className="ix-btn" onClick={() => setCustom({ id: null })}><Icon name="plus" width="16" height="16" aria-hidden="true" />New custom package</button></div>
              <CustomPanel db={db} data={data} t={t} onOpen={(id) => setCustom({ id })} />
            </>
          ) : null}
          {tab === 'trials' ? <TrialsPanel db={db} data={data} t={t} onEdit={setTrialFam} onModule={setModTrial} /> : null}
        </div>
      </div>

      <CustomSheet key={'custom-' + (custom ? custom.id || 'new' : 'closed')} open={!!custom} id={custom ? custom.id : null} db={db} data={data} t={t} onClose={() => setCustom(null)} />
      <Sheet open={!!price} title={price ? (ADDONS.find((a) => a.code === price) || {}).name || price : ''} onClose={() => setPrice(null)}
        footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPrice(null)}>Close</button>}>
        {price ? (
          <>
            <KV rows={[
              ['Stores billed', String(addonStats(db, t, price).stores)],
              ['A month', money(addonStats(db, t, price).mrr)],
              moduleBy(price) ? ['Module', <Link key="m" href={`/admin/modules?code=${price}`}>{moduleBy(price).name} · {price}</Link>] : null,
            ]} />
            <p className="pk-sec">Price</p>
            <PriceForm key={price} code={price} data={data} t={t} />
          </>
        ) : null}
      </Sheet>
      <TrialPackageSheet key={'trial-' + (trialFam || 'closed')} family={trialFam} data={data} onClose={() => setTrialFam(null)} />
      <Sheet open={!!modTrial} title={modTrial ? (TRIALABLE.find((x) => x.code === modTrial) || {}).label || modTrial : ''} onClose={() => setModTrial(null)}
        footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setModTrial(null)}>Close</button>}>
        {modTrial ? <TrialRuleForm key={modTrial} code={modTrial} data={data} label={(TRIALABLE.find((x) => x.code === modTrial) || {}).label || modTrial} /> : null}
      </Sheet>
    </AdminShell>
  );
}

