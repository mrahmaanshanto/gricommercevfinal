'use client';
// Barcode labels (/barcode-labels) — print shelf and product labels from the real catalogue (PR-F6), a Shopify-style
// tool page: pick the products and how many labels on the left, the layout, and the live preview on the right.
// - Products: any product or variant in the one catalogue (lib/stock.js › getCatalog: the demo products, the stock
//   catalogue and products added in this browser), found by name, SKU or barcode. Downloads, licences and services
//   have no label. `?skus=SKU:qty,SKU2` opens it with products picked (All products › Print labels, Receive goods).
// - A product without a barcode gets "Make one": an in-store EAN-13 (starts with 2, barcodeType 'internal', so Google
//   never treats it as a GTIN), saved on the product or variant (lib/products.js › saveProduct).
// - Layout: A4 sheet 3 × 8 or 4 × 10, or a label roll 38 × 25 mm / 50 × 30 mm; show shop name, product name, price,
//   MRP, barcode and SKU. Bars come from lib/barcodeSvg.js (EAN-13 / EAN-8, else Code 128).
// - Print: only the labels are printed (lib/printNode.js), at their real size; "Save as PDF" works the same way.
// Front end only; the browser's print dialog picks the printer.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { ShopHeader } from '@/components/ui/IndexKit';
import { useIsPhone } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { getCatalog, stockAt, isVirtualRow, STOCK_EVENT } from '@/lib/stock';
import { findProduct, saveProduct, codeOwner } from '@/lib/products';
import { invoiceIdentity } from '@/lib/businessProfile';
import { barcodeOf, inStoreEan13 } from '@/lib/barcodeSvg';
import { formatBDT } from '@/lib/format';
import { printNode } from '@/lib/printNode';

// label sizes in mm; a sheet has `cols` × `rows` labels on an A4 page
const SIZES = [
  { k: 'a4-24', l: 'A4 · 3 × 8', w: 70, h: 37.125, cols: 3, rows: 8, sheet: true, fs: 1 },
  { k: 'a4-40', l: 'A4 · 4 × 10', w: 52.5, h: 29.7, cols: 4, rows: 10, sheet: true, fs: 0.85 },
  { k: 'r38', l: 'Roll · 38 × 25 mm', w: 38, h: 25, sheet: false, fs: 0.72 },
  { k: 'r50', l: 'Roll · 50 × 30 mm', w: 50, h: 30, sheet: false, fs: 0.88 },
];
const SHOWS = [['shop', 'Shop name', true], ['name', 'Product name', true], ['price', 'Price', true], ['mrp', 'MRP', false], ['barcode', 'Barcode', true], ['sku', 'SKU', false]];
const MAX = 1000;          // labels in one print
const lc = (x) => String(x || '').toLowerCase();
const nameOf = (r) => (r.variant && !String(r.name).includes(r.variant) ? r.name + ' · ' + r.variant : r.name);
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

/** The catalogue rows that can carry a label. */
function labelRows() {
  return getCatalog().filter((r) => r.st !== 'deleted' && !isVirtualRow(r));
}

/** Make an in-store barcode for a row and save it on its product (or variant). Returns the code or ''. */
function makeBarcode(row, taken) {
  const p = findProduct({ id: row.productId, sku: row.sku });
  if (!p) return '';
  let code = '';
  for (let i = 0; i < 20 && !code; i += 1) { const c = inStoreEan13(taken); if (c && !codeOwner('barcode', c, p.id)) code = c; }
  if (!code) return '';
  const vars = Array.isArray(p.variants) ? p.variants : [];
  const at = vars.findIndex((v, n) => (v.sku || (p.sku || p.id) + '-' + (n + 1)) === row.sku);
  if (at >= 0 && row.sku !== p.sku) saveProduct({ ...p, variants: vars.map((v, n) => (n === at ? { ...v, barcode: code, barcodeType: 'internal' } : v)) }, { note: 'In-store barcode made on Barcode labels' });
  else saveProduct({ ...p, barcode: code, barcodeType: 'internal' }, { note: 'In-store barcode made on Barcode labels' });
  taken.add(code);
  return code;
}

/** One printed label, sized in mm. */
function Label({ row, size, show, shop }) {
  const bc = row.barcode ? barcodeOf(row.barcode) : null;
  const f = size.fs;
  const mrp = Number(row.mrp) > 0 && Number(row.mrp) !== Number(row.price) ? row.mrp : null;
  let x = 0;
  return (
    <div className="bl-lab" style={{ width: size.w + 'mm', height: size.h + 'mm', padding: (1.6 * f).toFixed(2) + 'mm ' + (2.4 * f).toFixed(2) + 'mm' }}>
      {show.shop && shop ? <span className="bl-lab__shop" style={{ fontSize: (6.5 * f).toFixed(2) + 'pt' }}>{shop}</span> : null}
      {show.name ? <span className="bl-lab__name" style={{ fontSize: (8 * f).toFixed(2) + 'pt' }}>{nameOf(row)}</span> : null}
      {show.barcode && bc ? (
        <svg className="bl-lab__bars" viewBox={`0 0 ${bc.modules} 40`} preserveAspectRatio="none" aria-hidden="true" style={{ height: (size.h * 0.32).toFixed(2) + 'mm' }}>
          {bc.bars.map((w, i) => { const r = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="40" /> : null; x += w; return r; })}
        </svg>
      ) : null}
      {show.barcode && bc ? <span className="bl-lab__code" style={{ fontSize: (6.5 * f).toFixed(2) + 'pt' }}>{bc.text}</span> : null}
      {show.barcode && !bc ? <span className="bl-lab__none" style={{ fontSize: (6.5 * f).toFixed(2) + 'pt' }}>No barcode</span> : null}
      {show.sku ? <span className="bl-lab__sku" style={{ fontSize: (6 * f).toFixed(2) + 'pt' }}>SKU {row.sku}</span> : null}
      {(show.price && row.price) || (show.mrp && mrp) ? (
        <span className="bl-lab__price">
          {show.price && row.price ? <b style={{ fontSize: (10 * f).toFixed(2) + 'pt' }}>{formatBDT(row.price)}</b> : null}
          {show.mrp && mrp ? <span style={{ fontSize: (6.5 * f).toFixed(2) + 'pt' }}>MRP {formatBDT(mrp)}</span> : null}
        </span>
      ) : null}
    </div>
  );
}

/** The labels laid out for printing: A4 pages with a grid, or one label per page on a roll. */
function Pages({ labels, size, show, shop, limit }) {
  const list = limit ? labels.slice(0, limit) : labels;
  if (!size.sheet) return <div className="bl-roll">{list.map((r, i) => <div key={i} className="bl-rollcell"><Label row={r} size={size} show={show} shop={shop} /></div>)}</div>;
  const per = size.cols * size.rows;
  const pages = [];
  for (let i = 0; i < list.length; i += per) pages.push(list.slice(i, i + per));
  return pages.map((pg, n) => (
    <div key={n} className="bl-a4" style={{ gridTemplateColumns: `repeat(${size.cols}, ${size.w}mm)`, gridAutoRows: size.h + 'mm' }}>
      {pg.map((r, i) => <Label key={i} row={r} size={size} show={show} shop={shop} />)}
    </div>
  ));
}

const CSS = `
.bl-tool{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:var(--space-4);align-items:start}
.bl-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.bl-body{display:flex;flex-direction:column;gap:var(--space-3)}
.bl-body>.ix-search{flex:none}
.bl-hits{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);max-height:280px;overflow:auto}
.bl-hits li+li{border-top:1px solid var(--border-subtle)}
.bl-hit{display:flex;align-items:center;gap:var(--space-3);width:100%;padding:8px 10px;border:0;background:none;font:inherit;text-align:left;cursor:pointer}
.bl-hit:hover,.bl-hit:focus-visible{background:var(--fill-primary-soft)}
.bl-hit>span{display:flex;flex:1;flex-direction:column;min-width:0}
.bl-hit b,.bl-name>b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.bl-hit small,.bl-name>span{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.bl-hit>svg{flex:none;color:var(--primary)}
.bl-items{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.bl-item{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:6px 6px 6px 10px;border-top:1px solid var(--border-subtle)}
.bl-item:first-child{border-top:0}
.bl-name{display:flex;flex:1 1 160px;flex-direction:column;min-width:0}
.bl-mono{font-family:var(--font-data)}
.bl-warn{color:var(--text-warning)}
.bl-step{display:flex;flex:none;align-items:center;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.bl-step input{width:48px;height:28px;border:0;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-semibold);text-align:center;color:var(--text-heading);font-variant-numeric:tabular-nums}
.bl-note{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.bl-note>span{flex:1;min-width:0}
.bl-note>svg{flex:none;color:var(--text-warning)}
.bl-total{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.bl-total>b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bl-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.bl-field .gc-label{margin:0}
.bl-field .gc-seg{flex-wrap:wrap}
.bl-shows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2) var(--space-4)}
.bl-show{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:32px;font-size:var(--text-sm);color:var(--text-heading)}
.bl-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
/* the preview: the real-size page, scaled to fit the card (paper stays white in both themes) */
.bl-view{overflow:auto;max-height:640px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.bl-scale{transform-origin:top left}
.bl-a4{display:grid;width:210mm;height:297mm;align-content:start;justify-content:center;padding-top:0;background:#fff;box-shadow:var(--shadow-sm)}
.bl-a4+.bl-a4{margin-top:6mm}
.bl-roll{display:flex;flex-direction:column;align-items:flex-start;gap:3mm}
.bl-rollcell{background:#fff;box-shadow:var(--shadow-sm)}
.bl-lab{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.4mm;overflow:hidden;background:#fff;color:#000;text-align:center;outline:1px dashed var(--slate-300);outline-offset:-1px;font-family:var(--font-sans)}
.bl-lab>*{flex-shrink:0;max-width:100%}
.bl-lab__shop{font-weight:var(--weight-medium);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-lab__name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.15;font-weight:var(--weight-semibold)}
.bl-lab__bars{display:block;width:88%;fill:#000}
.bl-lab__code,.bl-lab__sku{font-family:var(--font-data);line-height:1.1;letter-spacing:.04em}
.bl-lab__none{color:#555}
.bl-lab__price{display:flex;align-items:baseline;gap:1.5mm;line-height:1.1;white-space:nowrap;font-variant-numeric:tabular-nums}
.bl-lab__price span{color:#333;text-decoration:line-through}
.bl-print{position:absolute;left:-10000px;top:0}
@media print{.bl-lab{outline:0}.bl-a4{box-shadow:none;break-after:page;margin:0!important}.bl-roll{gap:0}.bl-rollcell{break-after:page;box-shadow:none}}
@media (max-width:1023px){.bl-tool{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.bl-shows{grid-template-columns:minmax(0,1fr)}.bl-view{max-height:420px}.bl-step input{height:36px}.bl-item .bl-name{flex-basis:100%}.bl-item .bl-x{margin-left:auto}}
`;

export default function BarcodeLabels() {
  const phone = useIsPhone();
  const [rows, setRows] = useState([]);
  const [shop, setShop] = useState('');
  const [picks, setPicks] = useState([]);      // [{ sku, qty }]
  const [q, setQ] = useState('');
  const [size, setSize] = useState('a4-24');
  const [show, setShow] = useState(Object.fromEntries(SHOWS.map(([k, , on]) => [k, on])));
  const [printing, setPrinting] = useState(false);   // the full set of labels is drawn only while printing

  const load = () => setRows(labelRows());
  useEffect(() => {
    const all = labelRows();
    setRows(all);
    try { const id = invoiceIdentity(); setShop(id.tradingName || id.name || ''); } catch { setShop(''); }
    const raw = new URLSearchParams(window.location.search).get('skus') || '';
    const bySku = new Map(all.map((r) => [lc(r.sku), r.sku]));
    const start = raw.split(',').map((x) => x.trim()).filter(Boolean).map((x) => { const [k, n] = x.split(':'); return { sku: bySku.get(lc(k)), qty: Math.max(1, Math.min(MAX, Math.round(Number(n) || 1))) }; }).filter((x) => x.sku);
    const seen = new Set();
    setPicks(start.filter((x) => (seen.has(x.sku) ? false : seen.add(x.sku))));
    if (raw && start.length) setSize('a4-24');
    window.addEventListener(STOCK_EVENT, load);
    return () => window.removeEventListener(STOCK_EVENT, load);
  }, []);

  const bySku = useMemo(() => new Map(rows.map((r) => [r.sku, r])), [rows]);
  const picked = picks.map((p) => ({ ...p, row: bySku.get(p.sku) })).filter((p) => p.row);
  const needle = lc(q.trim());
  const hits = needle ? rows.filter((r) => (lc(nameOf(r)) + ' ' + lc(r.sku) + ' ' + lc(r.barcode)).includes(needle)).slice(0, 8) : [];
  const total = picked.reduce((a, p) => a + p.qty, 0);
  const noCode = picked.filter((p) => !p.row.barcode);
  const z = SIZES.find((x) => x.k === size);
  const labels = useMemo(() => picked.flatMap((p) => Array.from({ length: p.qty }, () => p.row)).slice(0, MAX), [picks, rows]);   // eslint-disable-line react-hooks/exhaustive-deps
  const perPage = z.sheet ? z.cols * z.rows : 0;
  const pages = z.sheet ? Math.max(1, Math.ceil(total / perPage)) : total;

  const add = (r) => { setQ(''); setPicks(picks.some((p) => p.sku === r.sku) ? picks.map((p) => (p.sku === r.sku ? { ...p, qty: p.qty + 1 } : p)) : [...picks, { sku: r.sku, qty: 1 }]); };
  const setQty = (sku, n) => setPicks(picks.map((p) => (p.sku === sku ? { ...p, qty: Math.max(0, Math.min(MAX, Math.round(Number(n) || 0))) } : p)));
  const remove = (sku) => setPicks(picks.filter((p) => p.sku !== sku));
  const matchStock = () => {
    if (!picked.length) { toast('Pick products first.', { tone: 'error' }); return; }
    setPicks(picks.map((p) => ({ ...p, qty: Math.max(0, Math.min(MAX, stockAt(p.sku, '').onHand)) })));
    toast('Label counts now match the stock on hand');
  };
  const make = (list) => {
    const taken = new Set(getCatalog().map((r) => r.barcode).filter(Boolean));
    const made = list.map((p) => makeBarcode(p.row, taken)).filter(Boolean);
    load();
    if (made.length) toast(made.length === 1 ? 'Barcode made and saved on the product' : `${made.length} barcodes made and saved on the products`);
    else toast('The barcode could not be made. Open the product and add one there.', { tone: 'error' });
  };
  const print = () => {
    if (!total) { toast('Pick products and how many labels first.', { tone: 'error' }); return; }
    if (show.barcode && noCode.length) { toast(`${plural(noCode.length, 'product')} without a barcode. Make one first, or switch Barcode off.`, { tone: 'error' }); return; }
    setPrinting(true);
  };
  useEffect(() => {
    if (!printing) return;
    const node = document.getElementById('bl-print');
    if (node) printNode(node, { title: 'Barcode labels', css: z.sheet ? '@page{size:A4 portrait;margin:0}' : `@page{size:${z.w}mm ${z.h}mm;margin:0}` });
    setPrinting(false);
  }, [printing]);   // eslint-disable-line react-hooks/exhaustive-deps

  const scale = z.sheet ? (phone ? 0.38 : 0.62) : phone ? 1.2 : 1.6;
  const previewPages = z.sheet ? Math.min(pages, 2) : 0;
  const previewLabels = z.sheet ? labels.slice(0, previewPages * perPage) : labels.slice(0, 12);

  return (
    <div className="dc-screen ds" data-screen="BarcodeLabels">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-labels" />
        <main className="gc-shell__main">
          <Topbar crumb="Inventory" page="Barcode labels" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="scan-barcode" title="Barcode labels" about="Pick the products, set how many labels, choose the label size, then print. Only the labels are printed."
                secondary={[{ label: 'All products', href: '/all-products' }]}
                primary={{ label: total ? `Print ${plural(total, 'label')}` : 'Print', onClick: print, icon: 'printer' }} />

              <div className="bl-tool">
                <div className="bl-col">
                  <section className="ix-card" aria-labelledby="bl-h-items">
                    <div className="ix-card__head">
                      <h2 id="bl-h-items">Products</h2>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={matchStock}><Icon name="layers" width="16" height="16" aria-hidden="true" />Match stock</button>
                    </div>
                    <div className="ix-card__body bl-body">
                      <label className="ix-search">
                        <Icon name="search" width="16" height="16" aria-hidden="true" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a product by name, SKU or barcode" aria-label="Find a product" />
                      </label>
                      {needle ? (hits.length ? (
                        <ul className="bl-hits" aria-label="Products found">
                          {hits.map((r) => (
                            <li key={r.sku}><button type="button" className="bl-hit" onClick={() => add(r)}>
                              <span><b>{nameOf(r)}</b><small><span className="bl-mono">{r.sku}</span>{r.barcode ? ' · ' + r.barcode : ' · no barcode'}</small></span>
                              <Icon name="plus" width="16" height="16" aria-hidden="true" />
                            </button></li>
                          ))}
                        </ul>
                      ) : <p className="bl-empty">No product matches “{q.trim()}”.</p>) : null}
                      {noCode.length ? (
                        <div className="bl-note" role="status">
                          <Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />
                          <span>{noCode.length === 1 ? '1 product has' : noCode.length + ' products have'} no barcode.</span>
                          <button type="button" className="ix-btn ix-btn--sm" onClick={() => make(noCode)}><Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />{noCode.length === 1 ? 'Make one' : 'Make them'}</button>
                        </div>
                      ) : null}
                      {picked.length ? (
                        <ul className="bl-items" aria-label="Labels to print">
                          {picked.map((p) => (
                            <li key={p.sku} className="bl-item">
                              <span className="bl-name"><b>{nameOf(p.row)}</b><span><span className="bl-mono">{p.row.barcode || p.sku}</span>{p.row.barcode ? '' : <span className="bl-warn"> · no barcode</span>} · {p.row.price ? formatBDT(p.row.price) : 'no price'}</span></span>
                              {!p.row.barcode ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => make([p])}>Make one</button> : null}
                              <span className="bl-step">
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={() => setQty(p.sku, p.qty - 1)} aria-label={'Fewer labels for ' + nameOf(p.row)}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                                <input inputMode="numeric" aria-label={'Labels for ' + nameOf(p.row)} value={p.qty} onChange={(e) => setQty(p.sku, e.target.value.replace(/[^0-9]/g, ''))} />
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={() => setQty(p.sku, p.qty + 1)} aria-label={'More labels for ' + nameOf(p.row)}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                              </span>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain bl-x" onClick={() => remove(p.sku)} aria-label={'Remove ' + nameOf(p.row)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                            </li>
                          ))}
                        </ul>
                      ) : !needle ? <p className="bl-empty">Search above to add products, or pick them in All products and choose Print labels.</p> : null}
                      <div className="bl-total"><span>Labels</span><b>{total}{total > MAX ? ` (first ${MAX} printed)` : ''}</b></div>
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="bl-h-layout">
                    <div className="ix-card__head"><h2 id="bl-h-layout">Layout</h2></div>
                    <div className="ix-card__body bl-body">
                      <div className="bl-field">
                        <span className="gc-label" id="bl-size">Label size</span>
                        <div className="gc-seg" role="group" aria-labelledby="bl-size">
                          {SIZES.map((o) => <button key={o.k} type="button" className={'gc-seg__btn' + (o.k === size ? ' gc-seg__btn--active' : '')} aria-pressed={o.k === size} onClick={() => setSize(o.k)}>{o.l}</button>)}
                        </div>
                      </div>
                      <div className="bl-field">
                        <span className="gc-label">Show on the label</span>
                        <div className="bl-shows">
                          {SHOWS.map(([k, l]) => (
                            <div key={k} className="bl-show">
                              <span>{l}</span>
                              <button type="button" role="switch" aria-checked={!!show[k]} aria-label={l} className="gc-switch" onClick={() => setShow({ ...show, [k]: !show[k] })}><span className="gc-switch__knob" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="ix-card" aria-labelledby="bl-h-preview">
                  <div className="ix-card__head">
                    <h2 id="bl-h-preview">Preview</h2>
                    <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{total ? (z.sheet ? `${plural(pages, 'A4 sheet')}${pages > 2 ? ' · first 2 shown' : ''}` : `${plural(total, 'label')} on the roll${total > 12 ? ' · first 12 shown' : ''}`) : 'Nothing picked yet'}</span>
                  </div>
                  <div className="ix-card__body">
                    <div className="bl-view">
                      {previewLabels.length ? (
                        <div style={{ width: `calc(${z.sheet ? 210 : z.w}mm * ${scale})`, height: z.sheet ? `calc(${previewPages * 297 + (previewPages - 1) * 6}mm * ${scale})` : `calc(${previewLabels.length * (z.h + 3)}mm * ${scale})` }}>
                          <div className="bl-scale" style={{ transform: `scale(${scale})` }}><Pages labels={previewLabels} size={z} show={show} shop={shop} /></div>
                        </div>
                      ) : <p className="bl-empty">Pick products to see the labels.</p>}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
      {printing ? <div className="bl-print" aria-hidden="true"><div id="bl-print"><Pages labels={labels} size={z} show={show} shop={shop} /></div></div> : null}
    </div>
  );
}
