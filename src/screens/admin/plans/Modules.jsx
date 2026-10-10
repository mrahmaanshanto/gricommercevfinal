'use client';
// Modules (/admin/modules?code=G3) — the module catalogue: every module grouped by its set, with the plans that
// include it, its add-on price (or "in plan"), the trial offered, how many live stores have it on and the stores a
// staff member switched by hand. Views: All · Add-ons · Trials offered · Set by staff (counts on the tabs).
// A row opens a side panel: the module's facts, what each plan does with it, the add-on price (a change is recorded
// with its date and reason), the trial settings, and the stores with an override (reset, or open the store's Modules
// tab). "Simulate access" says whether a module is on for a store and why (package, add-on, trial, override).
// Data: lib/admin/packages.js (moduleRows, moduleAccess, simulate, setPrice, setTrialRule) over lib/platform and
// lib/admin/merchants.js (modulesOf, setModule).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { confirmDialog, toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { SETS, MODULES, TRIALABLE } from '@/lib/platform/catalogue';
import { subState, isLiveStore } from '@/lib/platform/billing';
import { setModule } from '@/lib/admin/merchants';
import { moduleRows, moduleAccess, simulate, addonStats } from '@/lib/admin/packages';
import { AdminShell, usePlatform } from '../AdminShell';
import { PK_CSS, usePackages, money, plural, Rule, Row, PriceForm, TrialRuleForm } from './pkgShared';

const VIEWS = [['all', 'All'], ['addon', 'Add-ons'], ['trial', 'Trials offered'], ['staff', 'Set by staff']];
const SIM_TONE = { in: 'success', addon: 'success', trial: 'primary', on: 'warning', blocked: 'error', locked: 'neutral', off: 'neutral' };
const SOURCE = { package: 'Package', 'add-on': 'Add-on', trial: 'Trial', override: 'Staff override' };

const CSS = `
.pkm-sim{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-3)}
.pkm-res{display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.pkm-res__top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pkm-res__top b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.pkm-res ul{display:flex;flex-direction:column;gap:4px;margin:0;padding-left:18px}
.pkm-acc{display:grid;grid-template-columns:minmax(80px,auto) repeat(3,minmax(0,1fr));gap:6px var(--space-2);align-items:center;font-size:var(--text-xs)}
.pkm-acc>.pkm-h{color:var(--text-muted);font-weight:var(--weight-medium)}
.pkm-acc>.pkm-f{color:var(--text-heading);font-weight:var(--weight-medium);font-size:var(--text-sm)}
.pkm-acc .gc-badge{justify-self:start;max-width:100%}
.pkm-name{display:flex;flex-direction:column;min-width:0}
.pkm-name small{font-size:var(--text-xs);color:var(--text-muted)}
.pkm-plans{max-width:280px;white-space:normal}
@media (max-width:640px){.pkm-sim{grid-template-columns:minmax(0,1fr)}.pkm-acc{grid-template-columns:minmax(64px,auto) repeat(3,minmax(0,1fr))}}
`;

/** What each plan does with the module: a row per family, a column per plan. */
function AccessGrid({ access }) {
  const fams = [...new Set(access.map((a) => a.family))];
  return (
    <div className="pkm-acc" role="table" aria-label="Access per plan">
      {fams.map((fam) => {
        const rows = access.filter((a) => a.family === fam);
        return (
          <React.Fragment key={fam}>
            <span className="pkm-f" role="rowheader">{rows[0].familyLabel}</span>
            {rows.map((a) => (
              <span key={a.plan} role="cell" title={`${a.planName}: ${a.rule}`}>
                <span className="pk-muted" style={{ display: 'block', marginBottom: 2 }}>{a.planName.replace('Connect ', '')}</span>
                <Rule rule={a.rule} />
              </span>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ModuleSheet({ code, db, data, t, rows, onClose }) {
  const m = code ? rows.find((r) => r.code === code) : null;
  if (!m) return null;
  const set = SETS.find((s) => s.id === m.set) || {};
  const access = moduleAccess(db, data, m.code, t);
  const stats = m.price ? addonStats(db, t, m.code) : null;
  const ownTrial = TRIALABLE.some((x) => x.code === m.code) || !!data.trialRules[m.code];
  const reset = async (o) => {
    if (!(await confirmDialog({ title: `${m.name} back to the package for ${o.name}?`, body: 'The store gets what its package gives for this module.', confirmLabel: 'Reset' }))) return;
    const r = setModule(o.shopId, m.code, null);
    toast(r.ok ? `${o.name} follows its package again` : r.error);
  };
  return (
    <Sheet open title={`${m.name} · ${m.code}`} onClose={onClose}
      footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>}>
      <KV rows={[
        ['Set', set.label],
        ['Comes with', m.plans],
        ['Price', m.always ? 'Runs in every store' : m.price ? `${money(m.price.price)} ${m.price.period === 'Once' ? 'once' : 'a month'}` : 'In the plan'],
        stats ? ['Stores billed', `${stats.stores} · ${money(stats.mrr)} a month`] : null,
        ['Stores with it on', String(m.storesOn)],
        ['Trial', m.trial ? `${m.trial.days} days${m.trial.viaSet ? ' (Online set trial)' : ''}` : 'Not offered'],
      ]} />

      <p className="pk-sec">Per plan</p>
      <AccessGrid access={access} />
      {!m.always ? <p className="pk-small pk-muted">Change what a plan does on <Link href="/admin/packages">Packages</Link> (Edit plan).</p> : null}

      {m.price ? (<><p className="pk-sec">Add-on price</p><PriceForm key={'p' + m.code} code={m.code} data={data} t={t} /></>) : null}

      {!m.always && m.set !== 'everyday' ? (
        <>
          <p className="pk-sec">Trial</p>
          {m.set === 'online' && !ownTrial
            ? <p className="pk-small pk-muted">Comes with the Online set trial: set it on <Link href="/admin/packages?tab=trials">Packages › Trial packages</Link>.</p>
            : <TrialRuleForm key={'t' + m.code} code={m.code} data={data} label={m.name} />}
        </>
      ) : null}

      <p className="pk-sec">Stores set by staff · {m.overrides.length}</p>
      {m.overrides.length ? (
        <div className="pk-list">
          {m.overrides.map((o) => (
            <Row key={o.shopId} title={<Link href={`/admin/merchant?id=${o.shopId}&tab=modules`}>{o.name}</Link>} sub={'#' + o.shopId}
              end={<>
                <StatusBadge tone={o.on ? 'warning' : 'error'}>{o.on ? 'On' : 'Off'}</StatusBadge>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => reset(o)}>Reset</button>
              </>} />
          ))}
        </div>
      ) : <p className="pk-small pk-muted">Every store follows its package.</p>}
    </Sheet>
  );
}

function Simulator({ db, data, t, simRef }) {
  const shops = db.shops.filter((s) => isLiveStore(subState(db, s.id, t))).slice().sort((a, b) => a.name.localeCompare(b.name));
  const [shopId, setShopId] = useState('0031');
  const [code, setCode] = useState('M19');
  const res = shopId && code ? simulate(db, data, t, shopId, code) : null;
  return (
    <section className="ix-card" aria-labelledby="pkm-sim" ref={simRef}>
      <div className="ix-card__head"><h2 id="pkm-sim">Simulate access</h2></div>
      <div className="ix-card__body">
        <div className="pkm-sim">
          <div>
            <label className="gc-label" htmlFor="pkm-sim-shop">Store</label>
            <select id="pkm-sim-shop" className="gc-input gc-select" value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">Choose a store</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
            </select>
          </div>
          <div>
            <label className="gc-label" htmlFor="pkm-sim-mod">Module</label>
            <select id="pkm-sim-mod" className="gc-input gc-select" value={code} onChange={(e) => setCode(e.target.value)}>
              <option value="">Choose a module</option>
              {SETS.map((s) => (
                <optgroup key={s.id} label={s.label}>
                  {MODULES.filter((x) => x.set === s.id).map((x) => <option key={x.code} value={x.code}>{x.name} · {x.code}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        {res ? (
          <div className="pkm-res" aria-live="polite">
            <span className="pkm-res__top">
              <StatusBadge tone={res.on ? 'success' : 'neutral'} icon={res.on ? 'circle-check' : 'circle-minus'}>{res.on ? 'On' : 'Off'}</StatusBadge>
              <b>{res.module.name} at {res.shop.name}</b>
              <StatusBadge tone={SIM_TONE[res.state] || 'neutral'}>{SOURCE[res.source]}</StatusBadge>
            </span>
            <span className="pk-muted pk-small">{res.pkg}</span>
            <ul>{res.why.map((w, i) => <li key={i}>{w}</li>)}</ul>
            <Link href={`/admin/merchant?id=${res.shop.id}&tab=modules`} className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }}>Open the store’s modules<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link>
          </div>
        ) : <p className="pk-small pk-muted" style={{ marginTop: 'var(--space-3)' }}>Pick a store and a module.</p>}
      </div>
    </section>
  );
}

export default function Modules() {
  const { db, t, live } = usePlatform();
  const { data, live: pkLive } = usePackages();
  const ready = live && pkLive;
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [setF, setSetF] = useState('');
  const [open, setOpen] = useState(null);
  const simRef = useRef(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code');
    if (c && MODULES.some((m) => m.code === c)) setOpen(c);
  }, []);
  const openCode = (c) => {
    setOpen(c);
    try {
      const p = new URLSearchParams(window.location.search);
      if (c) p.set('code', c); else p.delete('code');
      const s = p.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    } catch { /* ignore */ }
  };

  const rows = ready ? moduleRows(db, data, t) : [];
  const pick = (r) => (view === 'addon' ? !!r.price : view === 'trial' ? !!r.trial : view === 'staff' ? r.overrides.length > 0 : true);
  const counts = { all: rows.length, addon: rows.filter((r) => r.price).length, trial: rows.filter((r) => r.trial).length, staff: rows.filter((r) => r.overrides.length).length };
  const s = q.trim().toLowerCase();
  const shown = rows.filter((r) => pick(r) && (!setF || r.set === setF) && (!s || (r.name + ' ' + r.code + ' ' + r.setLabel).toLowerCase().includes(s)));
  const groups = SETS.map((x) => ({ ...x, rows: shown.filter((r) => r.set === x.id) })).filter((g) => g.rows.length);

  const exportCsv = () => {
    downloadCsv('gridcommerce-modules.csv', [
      ['Code', 'Module', 'Set', 'Comes with', 'Add-on price (BDT)', 'Billed', 'Trial days', 'Stores on', 'Set by staff'],
      ...rows.map((r) => [r.code, r.name, r.setLabel, r.plans, r.price ? r.price.price : '', r.price ? r.price.period : 'In plan', r.trial ? r.trial.days : '', r.storesOn, r.overrides.length]),
    ]);
    toast('Modules exported');
  };
  const toSim = () => { if (simRef.current) { simRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); const el = document.getElementById('pkm-sim-shop'); if (el) el.focus({ preventScroll: true }); } };

  const header = (
    <ShopHeader icon="blocks" title="Modules"
      about="Every module GridCommerce runs, grouped by set: which plans include it, what it costs as an add-on, whether staff can offer a trial, and how many stores have it on. Open a module to change its add-on price or trial, or to reset a store a staff member switched by hand. Simulate access explains why a module is on or off for one store."
      secondary={ready ? [{ label: 'Export', icon: 'download', onClick: exportCsv }] : []}
      primary={ready ? { label: 'Simulate access', icon: 'scan-search', onClick: toSim } : null} />
  );

  if (!ready) {
    return (
      <AdminShell active="modules" title="Modules">
        <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
        <div className="ix-page">{header}<div className="pk-skel pk-skel--sm" /><div className="pk-skel" aria-busy="true" aria-label="Loading modules" /></div>
      </AdminShell>
    );
  }

  const addonMrr = rows.filter((r) => r.price && r.price.period !== 'Once').reduce((n, r) => n + addonStats(db, t, r.code).mrr, 0);
  const trialsNow = Object.values(db.subs).reduce((n, sub) => n + sub.moduleTrials.filter((m) => !m.result && m.start <= t && m.start + m.days * 864e5 > t).length, 0);
  const overrideStores = new Set(rows.flatMap((r) => r.overrides.map((o) => o.shopId))).size;
  const tabs = VIEWS.map(([k, l]) => ({ key: k, id: 'pkm-tab-' + k, label: l, count: counts[k], on: view === k, onClick: () => setView(k) }));
  const filtersOn = !!s || !!setF;

  return (
    <AdminShell active="modules" title="Modules">
      <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
      <div className="ix-page">
        {header}
        <MetricStrip items={[
          { label: 'Add-on revenue a month', value: money(addonMrr) },
          { label: 'Module trials running', value: trialsNow, icon: 'hourglass' },
          { label: 'Stores with a staff override', value: overrideStores, icon: 'user-cog', onClick: () => setView('staff') },
        ]} />

        <section className="ix-card" aria-label="Modules">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Module views" /></div>
          <div className="pk-tools">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search module or code" onDone={() => setQ('')} />
            <select className="gc-input gc-select" aria-label="Set" value={setF} onChange={(e) => setSetF(e.target.value)}>
              <option value="">All sets</option>
              {SETS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </div>
          {!shown.length ? (
            <div className="ix-empty">
              {filtersOn
                ? <EmptyState title="No modules match." actionLabel="Clear search" onAction={() => { setQ(''); setSetF(''); }} />
                : <EmptyState icon="blocks" title={view === 'staff' ? 'No store has a module set by staff.' : 'No modules in this view.'} actionLabel="Show all modules" onAction={() => setView('all')} />}
            </div>
          ) : (
            <>
              <ul className="ix-plist">
                {shown.map((r) => (
                  <li key={r.code}>
                    <button type="button" className="ix-pitem" onClick={() => openCode(r.code)}>
                      <span className="ix-pitem__top"><b>{r.name}</b><span className="pk-data">{r.price ? money(r.price.price) : 'In plan'}</span></span>
                      <span className="ix-pitem__mid"><span className="ix-id">{r.code}</span> · {r.setLabel} · {r.plans}</span>
                      <span className="ix-pitem__mid">{plural(r.storesOn, 'store')} on{r.trial ? ` · ${r.trial.days}-day trial` : ''}{r.overrides.length ? ` · ${r.overrides.length} set by staff` : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Modules</caption>
                  <thead>
                    <tr>
                      <th scope="col">Code</th><th scope="col">Module</th><th scope="col">Comes with</th><th scope="col" className="ix-num">Add-on price</th>
                      <th scope="col">Trial</th><th scope="col" className="ix-num">Stores on</th><th scope="col" className="ix-num">Set by staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => (
                      <React.Fragment key={g.id}>
                        <tr className="pk-cmp__sec"><th scope="colgroup" colSpan={7}>{g.label} <span className="pk-muted">· {g.sub}</span></th></tr>
                        {g.rows.map((r) => (
                          <tr key={r.code} tabIndex={0} onClick={() => openCode(r.code)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) openCode(r.code); }}>
                            <td><span className="ix-id ix-muted">{r.code}</span></td>
                            <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); openCode(r.code); }}>{r.name}</button></td>
                            <td className="ix-muted"><span className="pkm-plans">{r.plans}</span></td>
                            <td className="ix-num">{r.price ? <><span className="pk-fig">{money(r.price.price)}</span><span className="pk-muted">{r.price.period === 'Once' ? ' once' : ''}</span></> : <span className="ix-muted">{r.always ? 'Always on' : 'In plan'}</span>}</td>
                            <td className="ix-muted">{r.trial ? `${r.trial.days} days${r.trial.viaSet ? ' · set' : ''}` : '—'}</td>
                            <td className="ix-num pk-data">{r.storesOn}</td>
                            <td className="ix-num">{r.overrides.length ? <StatusBadge tone="warning">{r.overrides.length}</StatusBadge> : <span className="ix-muted">—</span>}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span>{plural(shown.length, 'module')}{shown.length !== rows.length ? ` of ${rows.length}` : ''}</span></div>
        </section>

        <Simulator db={db} data={data} t={t} simRef={simRef} />
      </div>

      <ModuleSheet code={open} db={db} data={data} t={t} rows={rows} onClose={() => openCode(null)} />
    </AdminShell>
  );
}

