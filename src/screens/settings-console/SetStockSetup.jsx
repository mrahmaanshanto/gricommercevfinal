'use client';
// SetStockSetup — Settings › Stock setup (/stock-setup): the shop's inventory shape (src/lib/stockSetup.js).
//   Where online orders ship from (and come back to) — in a one-place shop, the name of its one place
//   How the shop buys: direct purchase, purchase orders, or both (editions with purchase orders)
//   Whether suppliers take back faulty items after a purchase, and wholesale prices (editions with wholesale)
//   Moving to online only: stock at every other place is moved into the one place first (src/lib/stockMerge.js)
// It opens by itself (a banner on Home and Stock) when the shop moves to another edition. Text stays short.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { SettingsSwitcher } from '@/shell/Shell';
import { InfoTip } from '@/components/ui';
import SetChrome from '@/screens/settings-console/SetChrome';
import SetRail from '@/screens/settings-console/SetRail';
import SetTopbar from '@/screens/settings-console/SetTopbar';
import { getStockSetup, saveStockSetup, BUYING } from '@/lib/stockSetup';
import { logChanges } from '@/lib/settingsHistory';
import { currentEdition, hasModule } from '@/lib/edition';
import { getPlaces, onlinePlace, placeById, savePlace } from '@/lib/locations';
import { mergePlan, mergeInto } from '@/lib/stockMerge';
import { EDITIONS } from '@/lib/edition';

const CSS = `
.ss-card>header{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:var(--space-3) var(--space-4) 0}
.ss-card>header h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ss-body{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-3) var(--space-4) var(--space-4)}
.ss-pick{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-3)}
.ss-opt{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.ss-opt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ss-opt span{font-size:var(--text-xs);color:var(--text-muted)}
.ss-opt[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);box-shadow:inset 0 0 0 1px var(--primary)}
.ss-opt[aria-pressed="true"] b{color:var(--primary)}
.ss-yn{display:flex;gap:var(--space-2)}
.ss-yn button{height:32px;padding:0 var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-sm);cursor:pointer}
.ss-yn button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.ss-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3)}
.ss-row>span:not(.ss-yn){display:flex;flex-direction:column;min-width:0}
.ss-row b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ss-row small{font-size:var(--text-xs);color:var(--text-muted)}
.ss-table{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ss-table th{height:36px;padding:0 var(--space-3);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);text-align:left}
.ss-table td{height:40px;padding:6px var(--space-3);border-top:1px solid var(--border-subtle);color:var(--text-body)}
.ss-table td.n,.ss-table th.n{text-align:right;font-family:var(--font-data);white-space:nowrap}
.ss-bar{position:sticky;bottom:0;z-index:5;display:flex;justify-content:flex-end;align-items:center;gap:var(--space-2);min-height:52px;padding:8px 24px;border-top:1px solid var(--border-subtle);background:var(--surface-card)}
@media (max-width:767px){.ss-bar{padding:8px 16px}.ss-bar .ix-btn,.ss-yn button{height:44px}}
`;

export default function SetStockSetup() {
  const [s, setS] = useState(null);
  const [ed, setEd] = useState(null);
  const [places, setPlaces] = useState([]);
  const [homeName, setHomeName] = useState('');
  const [plan, setPlan] = useState(null);

  const load = () => {
    const st = getStockSetup();
    setS(st); setEd(currentEdition());
    setPlaces(getPlaces({ active: true }).filter((p) => !p.noSale && !p.opening));
    const home = placeById(st.homeId) || null;
    setHomeName(home ? home.name : onlinePlace());
    setPlan(st.mode === 'one' ? mergePlan(onlinePlace()) : null);
  };
  useEffect(load, []);
  if (!s || !ed) return <div className="dc-screen ds" data-screen="SetStockSetup" />;

  const one = s.mode === 'one';
  const set = (patch) => setS({ ...s, ...patch });
  const home = placeById(s.homeId);

  const save = () => {
    if (one && home && homeName.trim() && homeName.trim() !== home.name) {
      const r = savePlace({ ...home, name: homeName.trim() });
      if (!r.ok) { toast(Object.values(r.errors)[0], { tone: 'error' }); return; }
    }
    const before = getStockSetup();
    saveStockSetup({ homeId: s.homeId, buying: s.buying, supplierChanges: s.supplierChanges, wholesale: s.wholesale });
    // settings history (lib/settingsHistory.js): what changed, old → new
    const LBL = { homeId: 'Online orders ship from', buying: 'Buying', supplierChanges: 'Supplier changes', wholesale: 'Wholesale' };
    const val = (k, x) => (k === 'homeId' ? ((placeById(x) || {}).name || x) : x);
    logChanges({ formId: 'stocksetup', changes: Object.keys(LBL).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(s[k])).map((k) => ({ field: k, label: LBL[k], from: val(k, before[k]), to: val(k, s[k]) })) });
    load();
    toast('Stock setup saved');
  };
  const merge = async () => {
    const to = onlinePlace();
    const ok = await confirmDialog({ title: `Move all stock into ${to}?`, body: `${plan.pcs.toLocaleString('en-IN')} pcs from ${plan.places.length} ${plan.places.length === 1 ? 'place' : 'places'}. Totals stay the same.`, confirmLabel: 'Move stock' });
    if (!ok) return;
    mergeInto(to);
    load();
    toast(`Stock moved into ${to}`);
  };

  return (
    <div className="dc-screen ds" data-screen="SetStockSetup">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SettingsSwitcher />
      <div className="set-shell">
        <div className="set-shell__rail"><SetChrome embedded /></div>
        <div className="set-shell__main">
          <div className="set-shell__top"><SetTopbar embedded crumb="Stock setup" /></div>
          <div className="set-shell__body">
            <div className="set-shell__nav"><SetRail embedded active="stocksetup" /></div>
            <div className="set-shell__col">
              <div className="set-content">
                <main className="set-main">
                  <header className="set-pagehead">
                    <span className="set-pagehead__text">
                      <h1 className="ix-head__title">Stock setup</h1>
                      <span className="ix-head__meta">{ed.name} · {one ? 'one stock place' : 'warehouses and branches'}</span>
                    </span>
                    <span className="gc-pagehead__about" hidden>The shape of your inventory: where online orders ship from and come back to, how the shop buys, whether suppliers take back faulty items, and wholesale prices. You can change this later.</span>
                  </header>

                  {s.needsSetup ? (
                    <div className="gc-alert gc-alert--soft gc-alert--warning" role="status">
                      <Icon name="refresh-cw" width="18" height="18" aria-hidden="true" />
                      <span>Your shop moved from {EDITIONS[s.savedFor] ? EDITIONS[s.savedFor].short : s.savedFor} to {ed.short}. Check these, then save.</span>
                    </div>
                  ) : null}

                  <section className="ix-card ss-card" aria-labelledby="ss-place">
                    <header><h2 id="ss-place">{one ? 'Your stock place' : 'Online orders'}</h2><InfoTip text={one ? 'Where your stock is. Online orders ship from here.' : 'Online orders ship from here and come back here.'} /></header>
                    <div className="ss-body">
                      {one ? (
                        <div><label className="gc-label" htmlFor="ss-name">Name</label><input id="ss-name" className="gc-input" value={homeName} onChange={(e) => setHomeName(e.target.value)} placeholder="e.g. Mirpur warehouse" /></div>
                      ) : (
                        <div><label className="gc-label" htmlFor="ss-home">Ships from</label>
                          <select id="ss-home" className="gc-input gc-select" value={s.homeId} onChange={(e) => set({ homeId: e.target.value })}>
                            {places.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.type}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </section>

                  {one && plan && plan.rows.length ? (
                    <section className="ix-card ss-card" aria-labelledby="ss-merge">
                      <header><h2 id="ss-merge">Stock at other places</h2></header>
                      <div className="ss-body">
                        <p className="gc-help" style={{ margin: 0 }}>Online only keeps one stock place. Move this stock into {onlinePlace()}.</p>
                        <div className="gc-table-wrap">
                          <table className="ss-table gc-table--keep">
                            <thead><tr><th scope="col">Product</th><th scope="col">At</th><th scope="col" className="n">Moves</th><th scope="col" className="n">After</th></tr></thead>
                            <tbody>{plan.rows.map((r) => <tr key={r.sku}><td>{r.name}</td><td>{Object.entries(r.at).map(([p, q]) => `${p} ${q}`).join(' · ')}</td><td className="n">{r.total}</td><td className="n">{r.home + r.total}</td></tr>)}</tbody>
                          </table>
                        </div>
                        {plan.holds.length || plan.transfers.length ? <p className="gc-help" style={{ margin: 0 }}>{[plan.holds.length ? `${plan.holds.length} order holds move too` : '', plan.transfers.length ? `${plan.transfers.length} transfers on the way are closed` : ''].filter(Boolean).join(' · ')}.</p> : null}
                        <button type="button" className="ix-btn" style={{ alignSelf: 'flex-start' }} onClick={merge}><Icon name="merge" width="16" height="16" aria-hidden="true" /> Move all into {onlinePlace()}</button>
                      </div>
                    </section>
                  ) : null}

                  {hasModule('purchasing') ? (
                    <section className="ix-card ss-card" aria-labelledby="ss-buy">
                      <header><h2 id="ss-buy">How do you buy?</h2></header>
                      <div className="ss-body">
                        <div className="ss-pick" role="group" aria-label="How you buy">
                          {BUYING.map(([k, l, d]) => <button key={k} type="button" className="ss-opt" aria-pressed={s.buying === k} onClick={() => set({ buying: k })}><b>{l}</b><span>{d}</span></button>)}
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {s.buying !== 'orders' ? (
                    <section className="ix-card ss-card" aria-labelledby="ss-ret">
                      <header><h2 id="ss-ret">After a purchase</h2></header>
                      <div className="ss-body">
                        <div className="ss-row">
                          <span><b>Suppliers take back faulty items</b><small>No: no supplier returns on direct purchases.</small></span>
                          <span className="ss-yn" role="group" aria-label="Suppliers take back faulty items">
                            <button type="button" aria-pressed={s.supplierChanges !== false} onClick={() => set({ supplierChanges: true })}>Yes</button>
                            <button type="button" aria-pressed={s.supplierChanges === false} onClick={() => set({ supplierChanges: false })}>No</button>
                          </span>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {hasModule('wholesale') ? (
                    <section className="ix-card ss-card" aria-labelledby="ss-ws">
                      <header><h2 id="ss-ws">Prices</h2></header>
                      <div className="ss-body">
                        <div className="ss-row">
                          <span><b>Wholesale price and MOQ on products</b><small>Off: purchase and sale price only.</small></span>
                          <span className="ss-yn" role="group" aria-label="Wholesale prices">
                            <button type="button" aria-pressed={s.wholesale} onClick={() => set({ wholesale: true })}>On</button>
                            <button type="button" aria-pressed={!s.wholesale} onClick={() => set({ wholesale: false })}>Off</button>
                          </span>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </main>
              </div>
              <div className="ss-bar"><span className="gc-help" style={{ margin: '0 auto 0 0', alignSelf: 'center' }}>You can change this later.</span><button type="button" className="ix-btn ix-btn--primary" onClick={save}>Save</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
