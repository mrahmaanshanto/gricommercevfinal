'use client';
// Customer catalogue — Products › Customer catalogue (Wholesale review WH-U5): the shop's item list to send on WhatsApp
// or Facebook. Built from the real catalogue (stock.js › getCatalog via lib/catalogueShare.js) with real prices and stock;
// with wholesale on, "Prices for" picks a business buyer and the list shows their prices (wholesalePrice.js › priceFor:
// price list, quantity prices, wholesale price or group discount). Laid out as a Shopify-style tool page
// (docs/shopify-style.md): the catalogue's settings on the left; sharing and the live phone preview on the right; Save in
// the header. Share: Copy link (clipboard), Send on WhatsApp (wa.me with the link, logged in the delivery log) and PDF
// (the shop's letterhead, printed on A4) — lib/shareDoc.js.
// Front end only: settings are kept in this browser (catalogueShare.js); the public catalogue page at the link needs a
// server, so the link is the address it will have.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { QrCode } from '@/components/QrCode';
import { toast } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { useWholesale } from '@/lib/useWholesale';
import { catalogueItems, catalogueCats, getCatalogueSettings, saveCatalogueSettings } from '@/lib/catalogueShare';
import { businessBuyers } from '@/lib/salesOrder';
import { pricingLabel } from '@/lib/wholesalePrice';
import { docIdentity, DocHead, OffScreen, S } from '@/components/docs/DocPaper';
import { sendDocOnWhatsApp } from '@/components/docs/ShareActions';
import { printDoc, waNumber } from '@/lib/shareDoc';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2 });
// stock words on the preview cards, with one badge tone each
const ST = { ok: ['success', 'In stock'], low: ['warning', 'Few left'], out: ['neutral', 'Out of stock'], preorder: ['info', 'Pre-order'] };
const slug = (s) => String(s || 'catalogue').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'catalogue';
const host = () => String(MERCHANT.web || 'dazzleshop.com.bd').replace(/^https?:\/\//, '').replace(/^www\./, '');

const CSS = `
.cc-body{display:flex;flex-direction:column;gap:var(--space-4)}
.cc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.cc-field .gc-label{margin:0}
.cc-lbl{display:flex;align-items:center;gap:6px}
.cc-cats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px var(--space-4)}
.cc-cat{display:flex;align-items:center;gap:var(--space-2);min-height:32px;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.cc-cat>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cc-cat>small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cc-radios{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.cc-radio{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);cursor:pointer}
.cc-radio:first-child{border-top:0}
.cc-radio>input{margin-top:2px}
.cc-radio>span{display:flex;flex-direction:column}
.cc-radio b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-radio small{font-size:var(--text-xs);color:var(--text-muted)}
.cc-switch{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-switch>span{display:flex;flex:1;align-items:center;gap:6px;min-width:0}
.cc-tool{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.cc-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.cc-share{display:flex;gap:var(--space-4);align-items:flex-start}
.cc-share>div:first-child{display:flex;flex:1;flex-direction:column;gap:var(--space-2);min-width:0}
.cc-qr{display:flex;flex:none;flex-direction:column;align-items:center;gap:6px;max-width:120px;text-align:center;font-size:var(--text-xs);color:var(--text-muted)}
.cc-qr>svg{border:1px solid var(--border-subtle);border-radius:var(--radius-md)}
.cc-link{display:flex;align-items:center;height:var(--control-height);min-width:0;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-body);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cc-row{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cc-row>.ix-btn{flex:1 1 auto}
.cc-copy{flex-wrap:nowrap}
.cc-copy>.ix-btn{flex:none}
.cc-to{flex:1 1 160px;min-width:0}
/* the phone preview */
.cc-phone{max-width:360px;margin:0 auto;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-subtle);overflow:hidden}
.cc-bar{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--brand-navy-deep);color:#fff}
.cc-bar>i{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-lg);background:#fff;color:var(--primary);font-size:var(--text-sm);font-style:normal;font-weight:var(--weight-semibold)}
.cc-bar>div{display:flex;flex:1;flex-direction:column;min-width:0}
.cc-bar b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-semibold);text-overflow:ellipsis;white-space:nowrap}
.cc-bar small{display:flex;align-items:center;gap:4px;font-size:var(--text-xs);opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cc-bar>span{display:inline-flex;flex:none;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:var(--success);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.cc-shop{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3)}
.cc-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.cc-card{display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.cc-card>i{display:grid;height:44px;place-items:center;border-radius:var(--radius-md);font-size:var(--text-lg);font-style:normal;font-weight:var(--weight-semibold)}
.cc-t0{background:var(--fill-primary-soft);color:var(--primary)}.cc-t1{background:var(--fill-success-soft);color:var(--text-success)}.cc-t2{background:var(--fill-warning-soft);color:var(--text-warning)}.cc-t3{background:var(--fill-secondary-soft);color:var(--secondary)}
.cc-card>b{display:-webkit-box;overflow:hidden;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);line-height:16px;color:var(--text-heading);-webkit-line-clamp:2;-webkit-box-orient:vertical}
.cc-price{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--primary)}
.cc-was{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);text-decoration:line-through}
.cc-ask{display:flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cc-order{display:flex;align-items:center;justify-content:center;gap:4px;height:24px;border-radius:var(--radius-md);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.cc-warn{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.cc-warn>svg{color:var(--text-warning)}
.cc-more{margin:0;text-align:center;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:1023px){.cc-tool{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.cc-cats{grid-template-columns:minmax(0,1fr)}.cc-share{flex-direction:column-reverse;align-items:stretch}.cc-qr{flex-direction:row;max-width:none;text-align:left}}
`;

export default function CustomerCatalogueScreen() {
  const ws = useWholesale();
  const [ready, setReady] = useState(false);
  const [s, setS] = useState(() => ({ name: 'New arrivals', cats: null, priceMode: 'show', showStock: true, wa: '', buyer: '' }));
  const [retail, setRetail] = useState([]);       // every product at retail prices (decides the categories)
  const [buyers, setBuyers] = useState([]);
  const [me, setMe] = useState({ name: MERCHANT.name, address: MERCHANT.address, phone: MERCHANT.phone });   // Settings › General after mount
  const [sendTo, setSendTo] = useState('');
  const [pcat, setPcat] = useState('all');
  const paper = useRef(null);

  useEffect(() => {
    const saved = getCatalogueSettings();
    setS({ ...saved, wa: saved.wa || (docIdentity().phone || '') });
    setRetail(catalogueItems());
    setMe(docIdentity());
    setReady(true);
  }, []);
  useEffect(() => { setBuyers(ws ? businessBuyers().filter((b) => b.kind !== 'lead' && b.phone) : []); }, [ws]);

  const set = (patch) => setS((x) => ({ ...x, ...patch }));
  const buyer = ws && s.buyer ? buyers.find((b) => b.phone === s.buyer) || null : null;
  const priceMode = !ws && s.priceMode === 'whole' ? 'show' : s.priceMode;
  // the products for the chosen buyer (their prices) or at retail
  const pool = useMemo(() => (!ready ? [] : buyer ? catalogueItems({ customer: buyer }) : retail), [ready, buyer, retail]);
  const cats = useMemo(() => catalogueCats(pool), [pool]);
  const on = s.cats ? s.cats : cats.map((c) => c.k);
  const chosen = pool.filter((x) => on.includes(x.cat));
  const preview = chosen.filter((x) => pcat === 'all' || x.cat === pcat);
  const inStock = chosen.filter((x) => x.state === 'ok' || x.state === 'low').length;
  const link = `${host()}/catalog/${slug(s.name)}${buyer ? '?for=' + String(buyer.phone).slice(-4) : ''}`;
  const forWho = buyer ? `${buyer.name} · ${pricingLabel(buyer) || 'Wholesale prices'}` : 'Retail prices';

  const toggleCat = (k) => { const cur = new Set(on); if (cur.has(k)) cur.delete(k); else cur.add(k); set({ cats: cats.map((c) => c.k).filter((x) => cur.has(x)) }); };
  const save = () => { if (saveCatalogueSettings(s)) toast('Catalogue saved'); else toast('This browser blocked saving. Allow site data and try again.', { tone: 'error' }); };
  const copy = async () => {
    try { await navigator.clipboard.writeText('https://' + link); toast('Link copied'); }
    catch { toast('Could not copy here. Select the link and copy it.', { tone: 'error' }); }
  };
  const sendWa = () => {
    if (sendTo.trim() && !waNumber(sendTo)) { toast('Type an 11-digit mobile number, or leave it empty to choose the chat in WhatsApp', { tone: 'error' }); return; }
    const to = buyer && !sendTo.trim() ? { name: buyer.name, phone: buyer.phone } : { name: '', phone: sendTo.trim() };
    sendDocOnWhatsApp({ kind: 'catalogue', id: s.name, to, link: 'https://' + link,
      lines: [`${chosen.length} products${priceMode === 'show' ? '' : priceMode === 'hide' ? ' · call for price' : ' · wholesale prices for registered buyers'}`, s.wa ? `Order on WhatsApp: ${s.wa}` : ''] });
  };
  const pdf = () => printDoc(paper.current, `${s.name} · ${me.name}`);

  const priceCell = (x) => (priceMode === 'hide' || (priceMode === 'whole' && !buyer) ? null : x.price);
  const priceModes = [['show', 'Show prices', 'Everyone sees prices'], ['hide', 'Hide prices', 'Shows “Call for price”'], ['whole', 'Only wholesale customers', 'Wholesale customers see prices after entering their number']].filter((o) => o[0] !== 'whole' || ws);

  return (
    <div className="dc-screen ds" data-screen="CustomerCatalogue">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="products-catalogue" />
        <main className="gc-shell__main">
          <Topbar crumb="Products" page="Customer catalogue" placeholder="Search products, customers or memo no." />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="book-open" title="Customer catalogue" about="Send your item list on WhatsApp or Facebook — customers browse on their phone and order. Prices and stock come from your products."
                primary={{ label: 'Save', onClick: save }} />

              <MetricStrip label="Customer catalogue" items={[
                { label: 'Products', value: String(chosen.length) },
                { label: 'In stock', value: String(inStock) },
                { label: 'Prices', value: buyer ? buyer.name : 'Retail' },
              ]} />

              <div className="cc-tool">
                {/* the catalogue: name, categories, prices, stock, the WhatsApp number for orders */}
                <section className="ix-card" aria-labelledby="cc-h-set">
                  <div className="ix-card__head"><h2 id="cc-h-set">Set up the catalogue</h2></div>
                  <div className="ix-card__body cc-body">
                    <label className="cc-field">
                      <span className="gc-label">Catalogue name</span>
                      <input className="gc-input" value={s.name} onChange={(e) => set({ name: e.target.value })} />
                    </label>
                    {ws ? (
                      <div className="cc-field">
                        <div className="cc-lbl"><label className="gc-label" htmlFor="cc-for">Prices for</label><InfoTip text="Pick a wholesale buyer to share the catalogue at their price list." /></div>
                        <select id="cc-for" className="gc-input gc-select" value={s.buyer} onChange={(e) => set({ buyer: e.target.value })}>
                          <option value="">Everyone · retail prices</option>
                          {buyers.map((b) => <option key={b.key} value={b.phone}>{b.label || b.name}</option>)}
                        </select>
                      </div>
                    ) : null}
                    <fieldset className="cc-field" style={{ margin: 0, padding: 0, border: 0 }}>
                      <legend className="gc-label" style={{ marginBottom: '6px' }}>Which categories to show</legend>
                      <div className="cc-cats">
                        {cats.map((c) => (
                          <label key={c.k} className="cc-cat"><input type="checkbox" className="gc-check" checked={on.includes(c.k)} onChange={() => toggleCat(c.k)} /><span>{c.label}</span><small>{c.n}</small></label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="cc-field" style={{ margin: 0, padding: 0, border: 0 }}>
                      <legend className="gc-label" style={{ marginBottom: '6px' }}>Show prices?</legend>
                      <div className="cc-radios">
                        {priceModes.map((o) => (
                          <label key={o[0]} className="cc-radio"><input type="radio" name="cc-price" className="gc-check gc-check--radio" checked={priceMode === o[0]} onChange={() => set({ priceMode: o[0] })} /><span><b>{o[1]}</b><small>{o[2]}</small></span></label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="cc-switch">
                      <span>Show whether in stock<InfoTip text="Shows “In stock / Few left / Out of stock”" /></span>
                      <button type="button" role="switch" aria-checked={!!s.showStock} aria-label="Show whether in stock" className="gc-switch" onClick={() => set({ showStock: !s.showStock })}><span className="gc-switch__knob" /></button>
                    </div>
                    <div className="cc-field">
                      <div className="cc-lbl"><label className="gc-label" htmlFor="cc-wa">WhatsApp number for orders</label><InfoTip text="Every item gets an “Order on WhatsApp” button" /></div>
                      <input id="cc-wa" className="gc-input" value={s.wa} onChange={(e) => set({ wa: e.target.value })} inputMode="tel" style={{ fontVariantNumeric: 'tabular-nums' }} />
                    </div>
                  </div>
                </section>

                <div className="cc-col">
                  {/* sharing: the link, WhatsApp, a PDF and the QR for the shop */}
                  <section className="ix-card" aria-labelledby="cc-h-share">
                    <div className="ix-card__head"><h2 id="cc-h-share">Share</h2></div>
                    <div className="ix-card__body cc-share">
                      <div>
                        <div className="cc-row cc-copy">
                          <span className="cc-link" style={{ flex: 1 }}>{link}</span>
                          <button type="button" className="ix-btn" onClick={copy}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy link</button>
                        </div>
                        <div className="cc-row">
                          <input className="gc-input cc-to" value={sendTo} onChange={(e) => setSendTo(e.target.value)} inputMode="tel" placeholder={buyer ? buyer.phone : 'Send to (mobile, optional)'} aria-label="Send to (mobile number)" />
                          <button type="button" className="ix-btn" onClick={sendWa} disabled={!chosen.length}><Icon name="send" width="16" height="16" aria-hidden="true" />Send on WhatsApp</button>
                          <button type="button" className="ix-btn" onClick={pdf} disabled={!chosen.length}><Icon name="download" width="16" height="16" aria-hidden="true" />PDF</button>
                        </div>
                      </div>
                      <div className="cc-qr">
                        <QrCode text={'https://' + link} size={88} label="QR" />
                        <span>Print the QR and put it up in the shop</span>
                      </div>
                    </div>
                  </section>

                  {/* what customers see on their phone, live */}
                  <section className="ix-card" aria-labelledby="cc-h-prev">
                    <div className="ix-card__head"><h2 id="cc-h-prev">What customers will see <InfoTip text="Your changes show here right away" /></h2></div>
                    <div className="ix-card__body">
                      <div className="cc-phone">
                        <div className="cc-bar gc-on-dark">
                          <i>{String(me.name || 'S').slice(0, 1)}</i>
                          <div>
                            <b>{me.name} · {s.name}</b>
                            <small>{me.address}</small>
                          </div>
                          <span><Icon name="phone" width="12" height="12" aria-hidden="true" />WhatsApp</span>
                        </div>
                        <div className="cc-shop">
                          <div className="ix-chips" style={{ gap: '6px' }}>
                            {[['all', 'All'], ...cats.filter((c) => on.includes(c.k)).map((c) => [c.k, c.label])].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={pcat === k} onClick={() => setPcat(k)}>{l}</button>)}
                          </div>
                          {ready && !chosen.length ? <div className="cc-warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>Pick at least one category</span></div> : null}
                          <div className="cc-cards">
                            {preview.slice(0, 8).map((x, j) => {
                              const st = ST[x.state];
                              const price = priceCell(x);
                              return (
                                <div key={x.sku} className="cc-card">
                                  <i className={'cc-t' + (j % 4)} aria-hidden="true">{x.name.slice(0, 1)}</i>
                                  <b>{x.name}</b>
                                  {price != null ? <span><span className="cc-price">{money(price)}</span>{buyer && x.listPrice > price ? <> <span className="cc-was">{money(x.listPrice)}</span></> : null}</span> : null}
                                  {priceMode === 'hide' ? <span className="cc-ask"><Icon name="phone" width="12" height="12" aria-hidden="true" />Call for price</span> : null}
                                  {priceMode === 'whole' && !buyer ? <span className="cc-ask"><Icon name="lock" width="12" height="12" aria-hidden="true" />Wholesale price — enter no.</span> : null}
                                  {s.showStock ? <span><StatusBadge tone={st[0]}>{st[1]}</StatusBadge></span> : null}
                                  <span className="cc-order"><Icon name="send" width="12" height="12" aria-hidden="true" />Order</span>
                                </div>
                              );
                            })}
                          </div>
                          {preview.length > 8 ? <p className="cc-more">+ {preview.length - 8} more</p> : null}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* the catalogue as a PDF, with the letterhead */}
      <OffScreen innerRef={paper}>
        <DocHead title={s.name || 'Catalogue'} sub={forWho} />
        {cats.filter((c) => on.includes(c.k)).map((c) => (
          <div key={c.k}>
            <div style={{ ...S.cap, margin: '2mm 0 1mm' }}>{c.label}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>{chosen.filter((x) => x.cat === c.k).map((x) => {
                const price = priceCell(x);
                return (
                  <tr key={x.sku}>
                    <td style={S.td}>{x.name}{x.variant ? <div style={S.muted}>{x.variant}</div> : null}{x.moq ? <div style={S.muted}>Min. order {x.moq} pcs</div> : null}</td>
                    {s.showStock ? <td style={{ ...S.td, ...S.muted, width: '30mm' }}>{ST[x.state][1]}</td> : null}
                    <td style={{ ...S.td, ...S.num, width: '35mm', fontWeight: 'var(--weight-semibold)' }}>{price != null ? money(price) : priceMode === 'hide' ? 'Call for price' : 'Ask for price'}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ))}
        <div style={{ ...S.muted, borderTop: '1px solid var(--border-subtle)', paddingTop: '2mm' }}>{s.wa ? `Order on WhatsApp: ${s.wa} · ` : ''}See it online: {link}. Prices can change; the invoice price is final.</div>
      </OffScreen>
    </div>
  );
}
