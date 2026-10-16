'use client';
// Grid Shop › Pricing rules (/admin/grid-shop/pricing?side=; Batch E): GridCommerce's charges and discounts on both sides.
// Vendors pay: commission, markup (replaces a vendor's own rate while the rule runs), fee per parcel, monthly fee. Stores
// pay: markup on the store price, discount (paid by GridCommerce or the vendor), platform fee (from an order size). Each
// rule has a scope (vendors, stores, plans, products; empty = everyone), optional dates and an on / off switch; per side and
// kind the most specific rule applies (lib/platform/gridShop.js header). Add or edit in a side panel. "Try a price" picks a
// product, a store and a quantity and shows the whole breakdown: store pays, vendor gets, GridCommerce keeps, who pays the
// discount, and which rules applied.

import React, { useEffect, useMemo, useState } from 'react';
import { toast, confirmDialog } from '@/runtime/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { getRules, getVendors, getProducts, saveRule, toggleRule, deleteRule, priceLines, ruleText, scopeText, RULE_KINDS, SIDES, isListed, now, planOf } from '@/lib/platform/gridShop';
import { SELF_SHOP } from '@/lib/platform/services';
import { AdminShell, usePlatform } from '../AdminShell';
import { tk, dShort, qp, SVA_CSS } from '../services/svcAdmin';
import { useGs, GSA_CSS, Breakdown, gsPic } from './gsAdmin';

const VIEWS = [['all', 'All'], ['vendor', 'Vendors pay'], ['store', 'Stores pay'], ['off', 'Off']];
const inView = (r, v) => (v === 'all' ? true : v === 'off' ? !r.on : r.side === v);
const PLANS = [['starter', 'Starter'], ['growth', 'Growth'], ['business', 'Business']];
const toDate = (ms) => (ms ? new Date(ms - new Date(ms).getTimezoneOffset() * 6e4).toISOString().slice(0, 10) : '');
const fromDate = (s, end) => (s ? new Date(s + (end ? 'T23:59:59' : 'T00:00:00')).getTime() : null);
const blank = () => ({ id: '', name: '', side: 'store', kind: 'discount', value: '', unit: '%', minOrder: '', fundedBy: 'gridcommerce', scope: { vendorIds: [], shopIds: [], plans: [], productIds: [] }, from: null, to: null, on: true, note: '' });
const datesText = (r, t) => (!r.from && !r.to ? 'Always' : `${r.from ? dShort(r.from) : 'Now'} – ${r.to ? dShort(r.to) : 'no end'}${r.to && r.to < t ? ' · ended' : r.from && r.from > t ? ' · not started' : ''}`);

function RuleSheet({ ed, setEd, shopsText }) {
  if (!ed) return null;
  const k = RULE_KINDS[ed.kind];
  const set = (p) => setEd({ ...ed, ...p });
  const sc = ed.scope;
  const setSc = (p) => set({ scope: { ...sc, ...p } });
  const flip = (key, id) => setSc({ [key]: sc[key].includes(id) ? sc[key].filter((x) => x !== id) : [...sc[key], id] });
  const kinds = Object.entries(RULE_KINDS).filter(([, x]) => x.sides.includes(ed.side));
  const save = () => { const r = saveRule(ed); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast(ed.id ? 'Rule saved' : 'Rule added'); setEd(null); };
  return (
    <Sheet open title={ed.id ? ed.name || 'Rule' : 'Add pricing rule'} onClose={() => setEd(null)}
      footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save</button></>}>
      <form className="sva-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <div><label className="gc-label" htmlFor="pr-n">Name</label><input id="pr-n" className="gc-input" value={ed.name} onChange={(e) => set({ name: e.target.value })} placeholder="Eid week: 5% off printers" /></div>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <legend className="gc-label">Who pays</legend>
          {Object.entries(SIDES).map(([s, l]) => <label key={s} className="sva-chk"><input type="radio" name="pr-side" className="gc-check gc-check--radio" checked={ed.side === s} onChange={() => { const first = Object.entries(RULE_KINDS).find(([, x]) => x.sides.includes(s))[0]; set({ side: s, kind: RULE_KINDS[ed.kind].sides.includes(s) ? ed.kind : first }); }} />{l}</label>)}
        </fieldset>
        <div className="sva-grid2">
          <div><label className="gc-label" htmlFor="pr-k">What it is</label><select id="pr-k" className="gc-input gc-select" value={ed.kind} onChange={(e) => set({ kind: e.target.value, unit: RULE_KINDS[e.target.value].units.includes(ed.unit) ? ed.unit : RULE_KINDS[e.target.value].units[0] })}>{kinds.map(([id, x]) => <option key={id} value={id}>{x.label}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="pr-v">Amount</label><div className="sva-row" style={{ flexWrap: 'nowrap' }}><input id="pr-v" className="gc-input" inputMode="decimal" value={ed.value} onChange={(e) => set({ value: e.target.value })} />{k.units.length > 1 ? <select className="gc-input gc-select" style={{ width: 80 }} aria-label="Unit" value={ed.unit} onChange={(e) => set({ unit: e.target.value })}>{k.units.map((u) => <option key={u} value={u}>{u}</option>)}</select> : <span className="ix-muted">{k.units[0]}</span>}</div></div>
          {ed.kind === 'platform-fee' ? <div><label className="gc-label" htmlFor="pr-min">From an order of (৳ items)</label><input id="pr-min" className="gc-input" inputMode="numeric" value={ed.minOrder} onChange={(e) => set({ minOrder: e.target.value })} placeholder="0 = every order" /></div> : null}
        </div>
        <p className="gc-help" style={{ margin: 0 }}>{k.help}</p>
        {ed.kind === 'discount' ? (
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <legend className="gc-label">Who pays the discount</legend>
            <label className="sva-chk" style={{ whiteSpace: 'normal' }}><input type="radio" name="pr-f" className="gc-check gc-check--radio" checked={ed.fundedBy !== 'vendor'} onChange={() => set({ fundedBy: 'gridcommerce' })} />GridCommerce</label>
            <label className="sva-chk" style={{ whiteSpace: 'normal' }}><input type="radio" name="pr-f" className="gc-check gc-check--radio" checked={ed.fundedBy === 'vendor'} onChange={() => set({ fundedBy: 'vendor' })} />The vendor (comes off what they get)</label>
          </fieldset>
        ) : null}
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <legend className="gc-label">Vendors (none ticked = every item{ed.side === 'store' ? ', ours too' : ''})</legend>
          <div className="sva-row">{getVendors().map((v) => <label key={v.id} className="sva-chk"><input type="checkbox" className="gc-check" checked={sc.vendorIds.includes(v.id)} onChange={() => flip('vendorIds', v.id)} />{v.name}</label>)}</div>
        </fieldset>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <legend className="gc-label">Only these products (optional)</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 4, maxHeight: 180, overflowY: 'auto', padding: 4, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            {getProducts().filter((p) => isListed(p) || sc.productIds.includes(p.id)).map((p) => <label key={p.id} className="sva-chk" style={{ fontSize: 'var(--text-xs)' }}><input type="checkbox" className="gc-check" checked={sc.productIds.includes(p.id)} onChange={() => flip('productIds', p.id)} />{p.name}</label>)}
          </div>
        </fieldset>
        <div><label className="gc-label" htmlFor="pr-s">Only these stores (store numbers, optional)</label><input id="pr-s" className="gc-input" value={sc.shopIds.join(', ')} onChange={(e) => setSc({ shopIds: e.target.value.split(/[ ,]+/).map((x) => x.trim()).filter(Boolean) })} placeholder="e.g. 0090, 0012" />{sc.shopIds.length ? <span className="sva-sub">{shopsText(sc.shopIds)}</span> : null}</div>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <legend className="gc-label">Only stores on these plans (optional)</legend>
          <div className="sva-row">{PLANS.map(([id, l]) => <label key={id} className="sva-chk"><input type="checkbox" className="gc-check" checked={sc.plans.includes(id)} onChange={() => flip('plans', id)} />{l}</label>)}</div>
        </fieldset>
        <div className="sva-grid2">
          <div><label className="gc-label" htmlFor="pr-from">Starts (optional)</label><input id="pr-from" type="date" className="gc-input" value={toDate(ed.from)} onChange={(e) => set({ from: fromDate(e.target.value) })} /></div>
          <div><label className="gc-label" htmlFor="pr-to">Ends (optional)</label><input id="pr-to" type="date" className="gc-input" value={toDate(ed.to)} onChange={(e) => set({ to: fromDate(e.target.value, true) })} /></div>
        </div>
        <div><label className="gc-label" htmlFor="pr-note">Note (optional)</label><input id="pr-note" className="gc-input" value={ed.note || ''} onChange={(e) => set({ note: e.target.value })} /></div>
        <label className="sva-chk"><input type="checkbox" className="gc-check" checked={ed.on} onChange={(e) => set({ on: e.target.checked })} />On</label>
      </form>
    </Sheet>
  );
}

function TryPrice({ stores }) {
  const { tick } = useGs();
  const list = useMemo(() => getProducts().filter(isListed), [tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const [pid, setPid] = useState('st-scanner');
  const [shop, setShop] = useState(SELF_SHOP);
  const [qty, setQty] = useState('1');
  const p = list.find((x) => x.id === pid) || list[0];
  const q = Math.max(1, Number(qty) || 1);
  const st = stores.find((s) => s.id === shop);
  const b = p ? priceLines([{ p, qty: q }], shop, { plan: st ? st.plan : planOf(shop) })[0] : null;
  const vendor = p && p.vendorId ? (getVendors().find((v) => v.id === p.vendorId) || {}).name : '';
  const rules = b ? getRules().filter((r) => b.rules.includes(r.id)) : [];
  return (
    <section className="ix-card sva-pad" aria-labelledby="pr-try">
      <h2 id="pr-try">Try a price</h2>
      <div className="gsa-try">
      <div className="sva-pad" style={{ padding: 0 }}>
      <div><label className="gc-label" htmlFor="pr-tp">Product</label><select id="pr-tp" className="gc-input gc-select" value={p ? p.id : ''} onChange={(e) => setPid(e.target.value)}>{list.map((x) => <option key={x.id} value={x.id}>{x.name}{x.vendorId ? ' · ' + (getVendors().find((v) => v.id === x.vendorId) || {}).name : ' · ours'}</option>)}</select></div>
      <div className="sva-grid2">
        <div><label className="gc-label" htmlFor="pr-ts">Store</label><select id="pr-ts" className="gc-input gc-select" value={shop} onChange={(e) => setShop(e.target.value)}>{stores.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.id}{s.plan ? ' · ' + s.plan : ''}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="pr-tq">Quantity</label><input id="pr-tq" className="gc-input" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))} /></div>
      </div>
      </div>
      <div className="sva-pad" style={{ padding: 0 }}>
      {b ? (<>
        <div className="gc-picrow"><Pic src={gsPic(p)} name={p.name} kind="item" size={32} /><span><b style={{ fontSize: 'var(--text-sm)' }}>{p.name}</b><span className="sva-sub">{b.model === 'own' ? 'Our stock' : `${vendor} · ${b.model === 'markup' ? 'markup' : 'commission'} pricing`}</span></span></div>
        <Breakdown b={b} qty={q} vendor={vendor} />
        <span className="sva-sub">{rules.length ? 'Rules used: ' + rules.map((r) => r.name).join(', ') : 'No rule applies: the vendor’s own rates.'}</span>
      </>) : <EmptyState icon="package" title="No product on sale" />}
      </div>
      </div>
    </section>
  );
}

export default function GsPricing() {
  const { ready, tick } = useGs();
  const { db, live } = usePlatform();
  const [view, setView] = useState('all');
  const [ed, setEd] = useState(null);
  useEffect(() => { const v = qp('side'); if (VIEWS.some((x) => x[0] === v)) setView(v); }, []);
  const rows = useMemo(() => (ready ? getRules() : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const t = ready ? now() : 0;
  const stores = useMemo(() => {
    const own = [{ id: SELF_SHOP, name: 'Dazzle Shop', plan: 'business' }];
    if (!live || !db || !db.shops) return own;
    return [...own, ...db.shops.filter((s) => s.id !== SELF_SHOP).slice(0, 60).map((s) => ({ id: s.id, name: s.name, plan: (db.subs[s.id] || {}).plan || '' }))];
  }, [live, db]);
  const names = Object.fromEntries(stores.map((s) => [s.id, s.name]));
  const shopsText = (ids) => ids.map((id) => names[id] || '#' + id).join(', ');
  const shown = rows.filter((r) => inView(r, view));
  const tabs = VIEWS.map(([k, l]) => ({ key: k, id: 'prv-' + k, label: l, count: ready ? rows.filter((r) => inView(r, k)).length : null, on: view === k, onClick: () => setView(k) }));
  const del = async (r) => { if (await confirmDialog({ title: `Delete “${r.name}”?`, body: 'Orders already placed keep the prices they were sold at.', confirmLabel: 'Delete', tone: 'danger' })) { deleteRule(r.id); toast('Deleted'); } };
  return (
    <AdminShell active="gshop-pricing" title="Pricing rules">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + GSA_CSS + '.gsa-try{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-5);align-items:start}' }} />
      <div className="ix-page">
        <ShopHeader icon="badge-percent" title="Pricing rules" about="Charges and discounts on both sides of Grid Shop. Vendors pay a commission or a markup is added to their price (the vendor's own rate unless a rule replaces it), a fee per parcel and a monthly fee. Stores can get a discount (paid by GridCommerce or by the vendor), a markup or a platform fee from an order size. Per side and kind one rule applies: the most specific (a product beats a vendor, a vendor beats a store, a store beats a plan; a tie goes to the later rule). Orders keep the prices they were sold at."
          secondary={[{ label: 'Vendors', href: '/admin/grid-shop/vendors' }]} primary={{ label: 'Add rule', onClick: () => setEd(blank()) }} />
            <section className="ix-card" aria-label="Rules">
              <div className="ix-bar"><IndexTabs tabs={tabs} label="Rules" /></div>
              {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : shown.length ? (<>
                <ul className="ix-plist">{shown.map((r) => <li key={r.id}><button type="button" className="ix-pitem" onClick={() => setEd(JSON.parse(JSON.stringify(r)))}><span className="ix-pitem__top"><b>{r.name}</b><StatusBadge tone={r.on ? 'success' : 'neutral'}>{r.on ? 'On' : 'Off'}</StatusBadge></span><span className="ix-pitem__mid">{RULE_KINDS[r.kind].label} {ruleText(r)} · {scopeText(r, names)} · {datesText(r, t)}</span></button></li>)}</ul>
                <div className="ix-table-wrap">
                  <table className="ix-table">
                    <caption className="sr-only">Pricing rules</caption>
                    <thead><tr><th scope="col">Rule</th><th scope="col">Charge</th><th scope="col">Applies to</th><th scope="col">Dates</th><th scope="col">On</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>{shown.map((r) => (
                      <tr key={r.id}>
                        <td><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit', textAlign: 'left' }} onClick={() => setEd(JSON.parse(JSON.stringify(r)))}>{r.name}</button><span className="sva-sub">{SIDES[r.side]}{r.note ? ' · ' + r.note : ''}</span></td>
                        <td>{RULE_KINDS[r.kind].label}<span className="sva-sub">{ruleText(r)}</span></td>
                        <td style={{ maxWidth: 240 }}>{scopeText(r, names)}</td>
                        <td>{datesText(r, t)}</td>
                        <td><span className="gsa-switch"><button type="button" role="switch" aria-checked={!!r.on} aria-label={r.name} className="gc-switch" onClick={() => { const x = toggleRule(r.id); toast(x.on ? 'On: prices follow it now' : 'Off'); }}><span className="gc-switch__knob" /></button>{r.on ? 'On' : 'Off'}</span></td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => setEd(JSON.parse(JSON.stringify(r)))}>Edit</button>{' '}<button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => del(r)}>Delete</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </>) : <div className="ix-empty"><EmptyState icon="badge-percent" title="No rules here" body="Vendors pay their own rates; stores pay the store price." actionLabel="Add rule" onAction={() => setEd(blank())} /></div>}
              <div className="ix-foot"><span>{shown.length === 1 ? '1 rule' : shown.length + ' rules'}</span></div>
            </section>
            {ready ? <TryPrice stores={stores} /> : null}
      </div>
      <RuleSheet ed={ed} setEd={setEd} shopsText={shopsText} />
    </AdminShell>
  );
}
