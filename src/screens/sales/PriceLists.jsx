'use client';
// PriceLists — wholesale price lists (WH-F1), Orders › Price lists (module `wholesale`).
//   List      every list: who it applies to, how many products, on/off; Add price list; Export / Import CSV;
//             "Check a price": pick a buyer, a product and a quantity ("2 ctn + 4") and see the price the POS,
//             quotes, Create order and returns will charge, and where it comes from (lib/wholesalePrice › priceFor)
//   ?id=      one list: name, note, on/off; its prices (fixed ৳ or % off retail per product, optional quantity slabs);
//             who it applies to (buyers, companies, tags, customer groups); Save, Delete (asks first), Export
// Front end only: lists are kept in this browser (lib/wholesalePrice.js); a real shop keeps them on the server.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { ShopHeader, RecordHeader, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import { useWholesale } from '@/lib/useWholesale';
import { getCatalog } from '@/lib/stock';
import { getCustomers, getDirectory } from '@/lib/customers';
import { downloadCsv } from '@/lib/reports/period';
import { parseCsv } from '@/lib/productImport';
import {
  getPriceLists, listBy, saveList, deleteList, PRICE_LISTS_EVENT, GROUPS, priceFor, parseQty, SOURCE_WORDS,
  listsToCsv, importCsv, linePrice, termsOf,
} from '@/lib/wholesalePrice';

const CSS = `
.pl-who{display:flex;flex-direction:column;gap:2px;min-width:0}
.pl-who small{font-size:var(--text-xs);color:var(--text-muted);white-space:normal}
.pl-applies{white-space:normal!important;max-width:360px;color:var(--text-body)}
.pl-check{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1.6fr) 140px;gap:var(--space-3);padding:var(--space-4)}
.pl-check .gc-field{margin:0}
.pl-result{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2) var(--space-3);margin:0 var(--space-4) var(--space-4);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.pl-result b{font-family:var(--font-data);font-size:var(--text-md, 14px);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pl-result s{color:var(--text-muted);font-family:var(--font-data)}
.pl-result span{font-size:var(--text-xs);color:var(--text-body)}
.pl-form{display:grid;gap:var(--space-3);padding:var(--space-4)}
.pl-form .gc-field{margin:0}
.pl-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:var(--space-3)}
.pl-on{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.pl-lines{list-style:none;margin:0;padding:0}
.pl-line{display:grid;grid-template-columns:minmax(0,1.3fr) 110px 200px minmax(0,1.7fr) 36px;gap:var(--space-3);align-items:start;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.pl-line:first-child{border-top:0}
.pl-line--head{padding-top:var(--space-2);padding-bottom:var(--space-2);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.pl-line__name{display:flex;flex-direction:column;gap:2px;min-width:0;padding-top:6px}
.pl-line__name b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.pl-line__name small,.pl-retail small{font-size:var(--text-xs);color:var(--text-muted)}
.pl-retail{display:flex;flex-direction:column;gap:2px;padding-top:6px;font-family:var(--font-data)}
.pl-price{display:flex;gap:var(--space-2)}
.pl-price select{flex:0 0 100px}
.pl-price input{min-width:0}
.pl-slabs{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.pl-slab{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 4px 0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);font-family:var(--font-data);color:var(--text-heading)}
.pl-slab button{display:grid;place-items:center;width:20px;height:20px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.pl-slab button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.pl-slabadd{display:flex;gap:6px;width:100%}
.pl-slabadd input{flex:1 1 0;width:auto;min-width:64px;max-width:110px}
.pl-x{margin-top:2px}
.pl-add{padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.pl-hits{max-height:260px;overflow:auto;margin:6px 0 0;padding:4px;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-card)}
.pl-hits button{display:flex;justify-content:space-between;gap:var(--space-3);width:100%;padding:8px 10px;border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);text-align:left;color:var(--text-body);cursor:pointer}
.pl-hits button:hover,.pl-hits button:focus-visible{background:var(--surface-subtle)}
.pl-hits small{font-family:var(--font-data);color:var(--text-muted)}
.pl-side{display:grid;gap:var(--space-4);padding:var(--space-4)}
.pl-group{display:grid;gap:6px}
.pl-group>span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.pl-chk{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.pl-chips{display:flex;flex-wrap:wrap;gap:6px}
.pl-pickrow{display:flex;gap:var(--space-2)}
.pl-pickrow select,.pl-pickrow input{flex:1;min-width:0}
.pl-order{margin:0;padding:0 0 0 18px;font-size:var(--text-xs);color:var(--text-body);line-height:1.6}
.pl-foot{display:flex;justify-content:flex-end;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
@media (max-width:1023px){.pl-line{grid-template-columns:minmax(0,1fr) 96px;}.pl-line--head{display:none}.pl-line .pl-price,.pl-line .pl-slabs{grid-column:1 / -1}.pl-x{grid-column:2;grid-row:1;justify-self:end}.pl-retail{grid-column:1}}
@media (max-width:640px){.pl-check{grid-template-columns:minmax(0,1fr)}.pl-row2{grid-template-columns:minmax(0,1fr)}.pl-line{grid-template-columns:minmax(0,1fr) 44px}.pl-retail{grid-column:1 / -1;flex-direction:row;gap:var(--space-2)}}
`;

const money = (n) => formatBDT(n);
const groupLabel = (k) => (GROUPS.find((g) => g.k === k) || { label: 'Group ' + k }).label;
const plural = (n, one, many = one + 's') => n + ' ' + (n === 1 ? one : many);

/** Buyers and companies a list can be given to (wholesale book + company accounts). */
function useParties(ready) {
  return useMemo(() => {
    if (!ready) return { buyers: [], companies: [], tags: [] };
    const book = getCustomers().filter((c) => (c.types || []).includes('Wholesale'));
    let dir = [];
    try { dir = getDirectory(); } catch { dir = []; }
    const companies = dir.filter((c) => c.kind === 'company');
    const tags = [...new Set(dir.flatMap((c) => c.tags || []))].sort();
    return { buyers: book.map((c) => ({ id: c.id, name: c.name, phone: c.phone })), companies: companies.map((c) => ({ id: c.id, name: c.name, phone: c.phone })), tags };
  }, [ready]);
}
const nameOf = (parties, kind, id) => ((kind === 'buyers' ? parties.buyers : parties.companies).find((x) => x.id === id) || { name: id }).name;
/** "Group: Wholesale B · distributors · ABC Electronics Ltd." */
function appliesText(list, parties) {
  const a = list.assign;
  const parts = [
    ...a.buyers.map((id) => nameOf(parties, 'buyers', id)),
    ...a.companies.map((id) => nameOf(parties, 'companies', id)),
    ...a.tags.map((t) => 'Tag ' + t),
    ...a.groups.map((g) => groupLabel(g)),
  ];
  return parts.length ? parts.join(' · ') : 'Nobody yet';
}

// ---- check a price ----------------------------------------------------------------------------------------------
function PriceCheck({ parties, catalog }) {
  const buyers = [...parties.buyers, ...parties.companies];
  const items = catalog.filter((r) => r.sell !== 'retail' && r.st !== 'archived');
  const [who, setWho] = useState('');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('1');
  const buyer = buyers.find((b) => b.id === who) || buyers[0] || null;
  const item = items.find((r) => r.sku === sku) || items.find((r) => r.sku === 'AC-CHG-20') || items[0] || null;
  const pq = item ? parseQty(item.sku, qty) : { error: '' };
  const res = buyer && item && !pq.error ? priceFor({ customer: buyer.id, sku: item.sku, qty: pq.pieces, channel: 'wholesale' }) : null;
  const terms = buyer ? termsOf(buyer.id) : null;
  return (
    <section className="ix-card" aria-labelledby="pl-check-h">
      <header className="ix-card__head"><h2 id="pl-check-h">Check a price</h2><InfoTip text="The same rule prices the POS, quotes, Create order and returns: the buyer’s price list (with its quantity slabs), then the product’s wholesale price, then the buyer’s group %, then retail." /></header>
      <div className="pl-check">
        <div className="gc-field"><label className="gc-label" htmlFor="pl-ck-who">Buyer</label>
          <select id="pl-ck-who" className="gc-input gc-select" value={buyer ? buyer.id : ''} onChange={(e) => setWho(e.target.value)}>
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select></div>
        <div className="gc-field"><label className="gc-label" htmlFor="pl-ck-item">Product</label>
          <select id="pl-ck-item" className="gc-input gc-select" value={item ? item.sku : ''} onChange={(e) => setSku(e.target.value)}>
            {items.map((r) => <option key={r.sku} value={r.sku}>{r.name}</option>)}
          </select></div>
        <div className="gc-field"><label className="gc-label" htmlFor="pl-ck-qty">Quantity</label>
          <input id="pl-ck-qty" className="gc-input" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 2 ctn + 4" autoComplete="off" /></div>
      </div>
      <div className="pl-result" role="status" aria-live="polite">
        {pq.error ? <span>{pq.error}</span> : res ? (<>
          <b>{money(res.price)}</b>{res.price !== res.listPrice ? <s>{money(res.listPrice)}</s> : null}
          <span>each · {SOURCE_WORDS[res.source]}{res.note && res.source !== 'retail' ? ' · ' + res.note : res.note ? ' · ' + res.note : ''} · {plural(pq.pieces, 'pc', 'pcs')} = {money(res.price * pq.pieces)}{terms ? ' · ' + terms.terms : ''}</span>
        </>) : <span>Pick a buyer and a product.</span>}
      </div>
    </section>
  );
}

// ---- one list ---------------------------------------------------------------------------------------------------
function ListEditor({ id, parties, catalog, onBack }) {
  const fresh = () => (id === 'new' ? { id: '', name: '', note: '', active: true, assign: { buyers: [], companies: [], tags: [], groups: [] }, lines: [] } : listBy(id));
  const [d, setD] = useState(fresh);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [slabAt, setSlabAt] = useState({});   // sku -> { min, value } being typed
  const [tag, setTag] = useState('');
  const nameRef = useRef(null);
  if (!d) return <section className="ix-card"><div className="ix-empty"><EmptyState icon="tags" title="This price list was deleted" actionLabel="All price lists" onAction={onBack} /></div></section>;

  const put = (patch) => { setD((x) => ({ ...x, ...patch })); setDirty(true); if (patch.name != null) setErr(''); };
  const putLine = (sku, patch) => put({ lines: d.lines.map((l) => (l.sku === sku ? { ...l, ...patch } : l)) });
  const rowOf = (sku) => catalog.find((r) => r.sku.toLowerCase() === sku.toLowerCase()) || { sku, name: sku, price: 0 };
  const term = q.trim().toLowerCase();
  const hits = term ? catalog.filter((r) => r.sell !== 'retail' && !d.lines.some((l) => l.sku === r.sku) && (r.name + ' ' + r.sku).toLowerCase().includes(term)).slice(0, 8) : [];
  const addLine = (r) => { put({ lines: [...d.lines, { sku: r.sku, mode: 'fixed', value: Number(r.wholesale) || r.price, slabs: [] }] }); setQ(''); };
  const addSlab = (l) => {
    const s = slabAt[l.sku] || {};
    const min = Math.round(Number(s.min)), value = Number(s.value);
    if (!(min > 1) || !(value > 0)) { toast('Type the quantity (2 or more) and the price for it', { tone: 'error' }); return; }
    putLine(l.sku, { slabs: [...l.slabs.filter((x) => x.min !== min), { min, value }].sort((a, b) => a.min - b.min) });
    setSlabAt({ ...slabAt, [l.sku]: { min: '', value: '' } });
  };
  const toggle = (kind, value, on) => put({ assign: { ...d.assign, [kind]: on ? [...d.assign[kind].filter((x) => x !== value), value] : d.assign[kind].filter((x) => x !== value) } });

  const save = () => {
    if (!d.name.trim()) { setErr('Give the list a name'); if (nameRef.current) nameRef.current.focus(); return; }
    if (getPriceLists().some((l) => l.id !== d.id && l.name.toLowerCase() === d.name.trim().toLowerCase())) { setErr('There is already a list called ' + d.name.trim()); return; }
    const bad = d.lines.find((l) => !(Number(l.value) > 0));
    if (bad) { toast(rowOf(bad.sku).name + ': type a price', { tone: 'error' }); return; }
    const row = saveList({ ...d, name: d.name.trim() });
    setD(row); setDirty(false);
    toast(row.name + ' saved');
    if (!d.id) { try { window.history.replaceState(null, '', '/price-lists?id=' + row.id); } catch { /* ignore */ } }
  };
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete ' + d.name + '?', body: 'Buyers on this list go back to the product’s wholesale price. Invoices already made keep their prices.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteList(d.id); toast(d.name + ' deleted'); onBack();
  };
  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this list will be lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    onBack();
  };

  return (
    <>
      <RecordHeader onBack={back} backLabel="Price lists" title={d.id ? d.name || 'Price list' : 'New price list'}
        badges={d.id ? <StatusBadge tone={d.active ? 'success' : 'neutral'}>{d.active ? 'Active' : 'Off'}</StatusBadge> : null}
        meta={plural(d.lines.length, 'product') + ' · ' + appliesText(d, parties)}
        about="A price list sets what a group of buyers pays: a fixed price or a % off retail per product, with lower prices for bigger quantities. Give it to buyers, companies, tags or a customer group."
        more={[
          ...(d.id ? [{ label: 'Export CSV', icon: 'download', onClick: () => downloadCsv('price-list-' + d.name.toLowerCase().replace(/\W+/g, '-') + '.csv', listsToCsv([d])) }] : []),
          ...(d.id ? [{ label: 'Delete', icon: 'trash-2', onClick: remove }] : []),
        ]}
        primary={{ label: 'Save', onClick: save }} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-labelledby="pl-d-h">
            <header className="ix-card__head"><h2 id="pl-d-h">Details</h2></header>
            <div className="pl-form">
              <div className="pl-row2">
                <div className="gc-field"><label className="gc-label" htmlFor="pl-name">Name</label>
                  <input id="pl-name" ref={nameRef} className={'gc-input' + (err ? ' gc-input--error' : '')} value={d.name} maxLength={40} onChange={(e) => put({ name: e.target.value })} placeholder="e.g. Dealer" aria-invalid={!!err} aria-describedby={err ? 'pl-name-err' : undefined} />
                  {err ? <p id="pl-name-err" className="gc-help gc-help--error" role="alert">{err}</p> : null}</div>
                <div className="gc-field"><label className="gc-label" htmlFor="pl-note">Note <span className="ix-muted">(optional)</span></label>
                  <input id="pl-note" className="gc-input" value={d.note} maxLength={120} onChange={(e) => put({ note: e.target.value })} placeholder="Who it is for" /></div>
              </div>
              <label className="pl-on"><input type="checkbox" checked={d.active} onChange={(e) => put({ active: e.target.checked })} />Active · buyers on this list get its prices</label>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="pl-p-h">
            <header className="ix-card__head"><h2 id="pl-p-h">Prices</h2><InfoTip text="Fixed: the price in ৳. % off: that much below the retail price. Quantity prices apply from that many pieces in one sale (a carton of 48 = 48 pieces)." /></header>
            {d.lines.length ? (
              <ul className="pl-lines" aria-label="Prices">
                <li className="pl-line pl-line--head" aria-hidden="true"><span>Product</span><span>Retail</span><span>Price</span><span>Quantity prices</span><span /></li>
                {d.lines.map((l) => {
                  const r = rowOf(l.sku);
                  const now = linePrice(l, r.price, 1).price;
                  const s = slabAt[l.sku] || { min: '', value: '' };
                  return (
                    <li key={l.sku} className="pl-line">
                      <span className="pl-line__name"><b>{r.name}</b><small>{l.sku}{l.mode === 'off' ? ' · ' + money(now) : ''}</small></span>
                      <span className="pl-retail">{money(r.price)}{Number(r.wholesale) > 0 ? <small>Wholesale {money(r.wholesale)}</small> : null}</span>
                      <span className="pl-price">
                        <select className="gc-input gc-select" aria-label={'Price type for ' + r.name} value={l.mode} onChange={(e) => putLine(l.sku, { mode: e.target.value })}>
                          <option value="fixed">Fixed ৳</option><option value="off">% off</option>
                        </select>
                        <input className="gc-input" inputMode="decimal" aria-label={(l.mode === 'off' ? '% off retail' : 'Price') + ' for ' + r.name} value={l.value} onChange={(e) => putLine(l.sku, { value: e.target.value.replace(/[^0-9.]/g, '') })} />
                      </span>
                      <span className="pl-slabs">
                        {l.slabs.map((x) => (
                          <span key={x.min} className="pl-slab">{x.min}+ · {l.mode === 'off' ? x.value + '% off' : money(x.value)}
                            <button type="button" aria-label={`Remove the ${x.min}+ price`} onClick={() => putLine(l.sku, { slabs: l.slabs.filter((y) => y.min !== x.min) })}><Icon name="x" width="12" height="12" /></button></span>
                        ))}
                        <span className="pl-slabadd">
                          <input className="gc-input" inputMode="numeric" placeholder="Qty" aria-label={'From quantity, ' + r.name} value={s.min} onChange={(e) => setSlabAt({ ...slabAt, [l.sku]: { ...s, min: e.target.value.replace(/\D/g, '') } })} />
                          <input className="gc-input" inputMode="decimal" placeholder={l.mode === 'off' ? '% off' : 'Price'} aria-label={'Price from that quantity, ' + r.name} value={s.value} onChange={(e) => setSlabAt({ ...slabAt, [l.sku]: { ...s, value: e.target.value.replace(/[^0-9.]/g, '') } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSlab(l); } }} />
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => addSlab(l)}>Add</button>
                        </span>
                      </span>
                      <button type="button" className="gc-iconbtn pl-x" aria-label={'Remove ' + r.name} onClick={() => put({ lines: d.lines.filter((x) => x.sku !== l.sku) })}><Icon name="trash-2" width="16" height="16" /></button>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="ix-muted" style={{ margin: 0, padding: 'var(--space-3) var(--space-4)' }}>No products yet. Products not on the list sell at their wholesale price.</p>}
            <div className="pl-add">
              <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a product: name or SKU" onDone={() => setQ('')} />
              {hits.length ? <ul className="pl-hits">{hits.map((r) => <li key={r.sku}><button type="button" onClick={() => addLine(r)}><span>{r.name}</span><small>{money(r.price)}</small></button></li>)}</ul> : null}
            </div>
          </section>
        </div>

        <div className="ix-side">
          <section className="ix-card" aria-labelledby="pl-a-h">
            <header className="ix-card__head"><h2 id="pl-a-h">Applies to</h2></header>
            <div className="pl-side">
              <div className="pl-group" role="group" aria-label="Customer groups"><span>Customer groups</span>
                {GROUPS.map((g) => <label key={g.k} className="pl-chk"><input type="checkbox" checked={d.assign.groups.includes(g.k)} onChange={(e) => toggle('groups', g.k, e.target.checked)} />{g.label}</label>)}
              </div>
              {[['buyers', 'Buyers', parties.buyers], ['companies', 'Companies', parties.companies]].map(([kind, label, opts]) => (
                <div key={kind} className="pl-group"><span>{label}</span>
                  {d.assign[kind].length ? <span className="pl-chips">{d.assign[kind].map((id) => (
                    <span key={id} className="pl-slab">{nameOf(parties, kind, id)}<button type="button" aria-label={'Remove ' + nameOf(parties, kind, id)} onClick={() => toggle(kind, id, false)}><Icon name="x" width="12" height="12" /></button></span>
                  ))}</span> : null}
                  <select className="gc-input gc-select" aria-label={'Add ' + label.toLowerCase()} value="" onChange={(e) => { if (e.target.value) toggle(kind, e.target.value, true); }}>
                    <option value="">Add {kind === 'buyers' ? 'a buyer' : 'a company'}…</option>
                    {opts.filter((o) => !d.assign[kind].includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              ))}
              <div className="pl-group"><span>Customer tags</span>
                {d.assign.tags.length ? <span className="pl-chips">{d.assign.tags.map((t) => <span key={t} className="pl-slab">{t}<button type="button" aria-label={'Remove tag ' + t} onClick={() => toggle('tags', t, false)}><Icon name="x" width="12" height="12" /></button></span>)}</span> : null}
                <span className="pl-pickrow">
                  <input className="gc-input" list="pl-tags" aria-label="Tag" placeholder="e.g. VIP" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && tag.trim()) { e.preventDefault(); toggle('tags', tag.trim(), true); setTag(''); } }} />
                  <datalist id="pl-tags">{parties.tags.map((t) => <option key={t} value={t} />)}</datalist>
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!tag.trim()} onClick={() => { toggle('tags', tag.trim(), true); setTag(''); }}>Add</button>
                </span>
              </div>
            </div>
          </section>
          <section className="ix-card" aria-labelledby="pl-o-h">
            <header className="ix-card__head"><h2 id="pl-o-h">Which list wins</h2></header>
            <div className="pl-side">
              <ol className="pl-order">
                <li>A list given to the buyer</li><li>Their company’s list</li><li>A list for one of their tags</li><li>Their customer group’s list</li><li>No line on any list: the product’s wholesale price</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ---- the page ---------------------------------------------------------------------------------------------------
export default function PriceLists() {
  const ws = useWholesale();
  const [ready, setReady] = useState(false);
  const [lists, setLists] = useState([]);
  const [open, setOpen] = useState('');          // a list id, 'new', or '' for the list of lists
  const [q, setQ] = useState('');
  const fileRef = useRef(null);
  const parties = useParties(ready);
  const catalog = useMemo(() => (ready ? getCatalog() : []), [ready]);

  useEffect(() => {
    const load = () => setLists(getPriceLists());
    const fromUrl = () => setOpen(new URLSearchParams(window.location.search).get('id') || '');
    load(); fromUrl(); setReady(true);
    window.addEventListener(PRICE_LISTS_EVENT, load); window.addEventListener('popstate', fromUrl);
    return () => { window.removeEventListener(PRICE_LISTS_EVENT, load); window.removeEventListener('popstate', fromUrl); };
  }, []);
  const go = (id) => { setOpen(id); try { window.history.pushState(null, '', id ? '/price-lists?id=' + id : '/price-lists'); } catch { /* ignore */ } window.scrollTo(0, 0); };

  const term = q.trim().toLowerCase();
  const shown = term ? lists.filter((l) => (l.name + ' ' + l.note + ' ' + appliesText(l, parties)).toLowerCase().includes(term)) : lists;

  const pickFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const res = importCsv(parseCsv(await file.text()));
    if (!res.lines) { toast(res.skipped[0] || 'Nothing to import in that file', { tone: 'error' }); return; }
    toast(`Imported ${plural(res.lines, 'price')} into ${plural(res.lists, 'list')}${res.skipped.length ? ` · ${res.skipped.length} rows skipped (${res.skipped[0]})` : ''}`, res.skipped.length ? { tone: 'info' } : undefined);
  };

  return (
    <div className="dc-screen ds" data-screen="PriceLists">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-price-lists" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Price lists" />
          <div className="gc-shell__content">
            <div className="ix-page">
              {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : !ws ? (
                <section className="ix-card"><div className="ix-empty"><EmptyState icon="tags" title="Price lists are part of wholesale, which is off on this site" /></div></section>
              ) : open ? (
                <ListEditor key={open} id={open} parties={parties} catalog={catalog} onBack={() => go('')} />
              ) : (<>
                <ShopHeader icon="tags" title="Price lists"
                  about="Named price lists for business buyers (Dealer, Retailer, Corporate …): a fixed price or a % off retail per product, with quantity prices. The POS, quotes, Create order and returns all use them."
                  more={[
                    { label: 'Export CSV', icon: 'download', onClick: () => downloadCsv('price-lists.csv', listsToCsv(lists)) },
                    { label: 'Import CSV', icon: 'upload', onClick: () => fileRef.current && fileRef.current.click() },
                    { label: 'Wholesale orders', icon: 'truck', href: '/wholesale-orders' },
                  ]}
                  primary={{ label: 'Add price list', onClick: () => go('new') }} />
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={pickFile} />
                <section className="ix-card" aria-label="Price lists">
                  {lists.length > 3 ? <div className="ix-bar"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search price lists" onDone={() => setQ('')} /></div> : null}
                  {!shown.length ? (
                    <div className="ix-empty">{lists.length ? <EmptyState icon="search" title={'No list matches “' + q.trim() + '”'} actionLabel="Clear search" onAction={() => setQ('')} /> : <EmptyState icon="tags" title="No price lists yet" actionLabel="Add price list" onAction={() => go('new')} />}</div>
                  ) : (
                    <div className="ix-table-wrap">
                      <table className="ix-table">
                        <caption className="sr-only">Price lists</caption>
                        <thead><tr><th scope="col">List</th><th scope="col">Applies to</th><th scope="col" className="ix-num">Products</th><th scope="col">Status</th></tr></thead>
                        <tbody>
                          {shown.map((l) => (
                            <tr key={l.id} onClick={(e) => { if (!e.target.closest('a,button')) go(l.id); }}>
                              <td><span className="pl-who"><button type="button" className="ix-strong" onClick={() => go(l.id)}>{l.name}</button>{l.note ? <small>{l.note}</small> : null}</span></td>
                              <td className="pl-applies">{appliesText(l, parties)}</td>
                              <td className="ix-num">{l.lines.length}</td>
                              <td><StatusBadge tone={l.active ? 'success' : 'neutral'}>{l.active ? 'Active' : 'Off'}</StatusBadge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="ix-foot"><span>{plural(shown.length, 'price list')}</span></div>
                </section>
                <PriceCheck parties={parties} catalog={catalog} />
                <LearnMore topic="price lists" />
              </>)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
