'use client';
// PartialPaymentSettings — Settings › Checkout › Partial payment (/set-checkout#partial; Batch C step 7). Rules that ask
// a cash-on-delivery order to pay a part online first: by delivery zone, by order total above an amount, or by
// product; each a fixed amount (for products: a unit) or a %. When several match, the largest part is asked. The online
// methods it can be paid with. Kept in lib/partialPayment.js (its own save; the checkout and the order page read it).

import React, { useEffect, useState } from 'react';
import { toast } from '@/runtime/ui';
import { Icon } from '@/runtime/dc';
import { partSettings, savePartSettings, newRule, ruleText, RULE_KINDS, PART_METHODS, PART_DEFAULTS } from '@/lib/partialPayment';
import { deliveryRates, advancePercent } from '@/lib/deliveryRates';
import { allProducts } from '@/lib/products';

export const PART_CSS = `
.pp-body{display:flex;flex-direction:column;gap:14px;padding:12px 16px 16px}
.pp-rule{display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.pp-rule__top{display:grid;grid-template-columns:minmax(0,1fr) 120px 110px auto;gap:8px;align-items:end}
.pp-fld{display:flex;flex-direction:column;gap:4px;min-width:0}
.pp-fld>span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.pp-chk{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:var(--text-sm)}
.pp-chk label{display:inline-flex;align-items:center;gap:6px;min-height:36px;cursor:pointer}
.pp-chk input{width:18px;height:18px;accent-color:var(--primary)}
.pp-tags{display:flex;flex-wrap:wrap;gap:6px}
.pp-tag{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 4px 0 10px;border-radius:var(--radius-full);background:var(--surface-card);border:1px solid var(--border-subtle);font-size:var(--text-xs)}
.pp-tag button{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.pp-sum{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.pp-acts{display:flex;flex-wrap:wrap;gap:8px}
.pp-sw{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:var(--text-sm);color:var(--text-heading)}
.pp-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.pp-rule__top{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
`;

export function PartialPaymentSettings() {
  const [d, setD] = useState(null);
  const [saved, setSaved] = useState('');
  const [zones, setZones] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const s = partSettings(); setD(s); setSaved(JSON.stringify(s));
    try { setZones(deliveryRates({ pickup: false }).map((z) => z.label)); } catch { setZones(['Inside Dhaka', 'Sub-Dhaka', 'Outside Dhaka']); }
    try { setProducts(allProducts().filter((p) => p.st === 'active').map((p) => ({ id: p.id, name: p.name }))); } catch { setProducts([]); }
  }, []);
  if (!d) return <div style={{ minHeight: 200 }} aria-busy="true" />;
  const dirty = JSON.stringify(d) !== saved;
  const setRule = (i, patch) => setD({ ...d, rules: d.rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const save = () => { const s = savePartSettings(d); setD(s); setSaved(JSON.stringify(s)); toast('Partial payment saved'); };
  const pname = (id) => (products.find((p) => p.id === id) || { name: id }).name;
  return (
    <div className="pp-body">
      <label className="pp-sw"><span>Ask for part of a cash-on-delivery order first<small>Checkout shows “Pay part now, rest on delivery”. Orders a rule doesn’t match stay plain cash on delivery.</small></span><input type="checkbox" className="gc-switch" checked={d.on} onChange={(e) => setD({ ...d, on: e.target.checked })} /></label>
      {d.on ? (<>
        {d.rules.map((r, i) => (
          <div key={r.id || i} className="pp-rule">
            <div className="pp-rule__top">
              <label className="pp-fld"><span>Rule</span><select className="gc-input gc-select" value={r.kind} onChange={(e) => setRule(i, { kind: e.target.value })}>{RULE_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
              <label className="pp-fld"><span>Amount</span><input className="gc-input" inputMode="decimal" value={r.value} onChange={(e) => setRule(i, { value: e.target.value })} /></label>
              <label className="pp-fld"><span>As</span><select className="gc-input gc-select" value={r.type} onChange={(e) => setRule(i, { type: e.target.value })}><option value="fixed">{r.kind === 'product' ? '৳ a unit' : '৳'}</option><option value="percent">%</option></select></label>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setD({ ...d, rules: d.rules.filter((x, j) => j !== i) })}>Remove</button>
            </div>
            {r.kind === 'zone' ? <div className="pp-chk" role="group" aria-label="Delivery zones">{zones.map((z) => <label key={z}><input type="checkbox" checked={(r.zones || []).includes(z)} onChange={(e) => setRule(i, { zones: e.target.checked ? [...(r.zones || []), z] : (r.zones || []).filter((x) => x !== z) })} />{z}</label>)}</div> : null}
            {r.kind === 'total' ? <label className="pp-fld" style={{ maxWidth: 220 }}><span>Orders above (৳)</span><input className="gc-input" inputMode="decimal" value={r.min} onChange={(e) => setRule(i, { min: e.target.value })} /></label> : null}
            {r.kind === 'product' ? (<>
              <label className="pp-fld" style={{ maxWidth: 360 }}><span>Products</span><select className="gc-input gc-select" value="" onChange={(e) => e.target.value && setRule(i, { products: [...new Set([...(r.products || []), e.target.value])] })}><option value="">Add a product…</option>{products.filter((p) => !(r.products || []).includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              {(r.products || []).length ? <span className="pp-tags">{r.products.map((id) => <span key={id} className="pp-tag">{pname(id)}<button type="button" aria-label={'Remove ' + pname(id)} onClick={() => setRule(i, { products: r.products.filter((x) => x !== id) })}><Icon name="x" width="12" height="12" /></button></span>)}</span> : null}
            </>) : null}
            <p className="pp-sum">{ruleText({ ...r, value: Number(r.value) || 0, min: Number(r.min) || 0 })}</p>
          </div>
        ))}
        <div className="pp-acts">
          {RULE_KINDS.map(([k, l]) => <button key={k} type="button" className="ix-btn ix-btn--sm" onClick={() => setD({ ...d, rules: [...d.rules, newRule(k)] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />{l}</button>)}
        </div>
        <p className="pp-sum">When more than one rule matches, the customer is asked for the largest part. New % rules start at Payment setup’s advance ({advancePercent()}%).</p>
        <div className="pp-fld"><span>Paid with</span><span className="pp-chk">{PART_METHODS.map(([k, l]) => <label key={k}><input type="checkbox" checked={d.methods.includes(k)} onChange={(e) => setD({ ...d, methods: e.target.checked ? [...d.methods, k] : d.methods.filter((x) => x !== k) })} />{l}</label>)}</span></div>
      </>) : null}
      <div className="pp-acts">
        <button type="button" className="ix-btn ix-btn--primary" disabled={!dirty} onClick={save}>Save partial payment</button>
        <button type="button" className="ix-btn" disabled={!dirty} onClick={() => setD(JSON.parse(saved))}>Discard</button>
        <button type="button" className="ix-btn ix-btn--plain" onClick={() => setD({ ...PART_DEFAULTS })}>Use the examples</button>
      </div>
    </div>
  );
}
