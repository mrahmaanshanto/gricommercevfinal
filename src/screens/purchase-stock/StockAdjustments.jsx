'use client';
// StockAdjustments — add or remove stock by hand with a reason (damaged, lost, found, count correction…).
// Any decrease, or any change over 20 pieces, needs a manager: approve on the spot with the manager's
// PIN, or save it as "Waiting for approval" for a manager to approve or reject later. Only an approved
// adjustment changes the stock (a stock move of kind 'adjust').
// Opened with ?sku=<sku>&place=<place> from the stock list to start with that product.
// Front end only: rows come from src/lib/stockAdjustments.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { ManagerPin } from '@/components/ManagerPin';
import { ProductPicker, PICKER_CSS } from '@/components/ProductPicker';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { STOCK_PLACES, getStockPlaces, placeName } from '@/lib/locations';
import { usePlaceList } from '@/lib/usePlaces';
import { CATALOG, productBy, stockAt, getMoves } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { MANAGERS, EMPLOYEES } from '@/lib/posStore';
import { getAdjustments, addAdjustment, approveAdjustment, rejectAdjustment, needsApproval, APPROVAL_LIMIT, ADJUST_REASONS } from '@/lib/stockAdjustments';

const TABS = [['waiting', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']];
const STATUS = { waiting: ['Waiting for approval', 'warning'], approved: ['Approved', 'success'], rejected: ['Rejected', 'error'] };
const STAFF = ['Karim', ...EMPLOYEES.map((e) => e.name)];
const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);

const CSS = PICKER_CSS + `
.sa-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:var(--space-5);align-items:start}
.sa-card{overflow:hidden}
.sa-card .gc-table th,.sa-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3);white-space:normal}
.sa-card .gc-table th:first-child,.sa-card .gc-table td:first-child{padding-left:var(--space-5)}
.sa-card .gc-table th:last-child,.sa-card .gc-table td:last-child{padding-right:var(--space-5)}
.sa-card .gc-badge,.sa-card .gc-btn,.sa-num{white-space:nowrap}
.sa-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.sa-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sa-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sa-form{display:flex;flex-direction:column;gap:var(--space-4);padding:0 var(--space-5) var(--space-5)}
.sa-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sa-dir{display:inline-flex;gap:var(--space-1);padding:var(--space-1);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-subtle)}
.sa-dir button{height:36px;padding:0 var(--space-4);border:0;border-radius:var(--radius-full);background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.sa-dir button[aria-pressed="true"].is-add{background:var(--fill-success-soft);color:var(--text-success)}
.sa-dir button[aria-pressed="true"].is-remove{background:var(--fill-error-soft);color:var(--text-danger)}
.sa-qty{display:flex;align-items:flex-end;gap:var(--space-3);flex-wrap:wrap}
.sa-qty .gc-input{width:140px}
.sa-reasons{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.sa-chip{height:36px;padding:0 var(--space-3);border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.sa-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.sa-sum{display:flex;flex-direction:column;gap:var(--space-3);padding:0 var(--space-5) var(--space-5)}
.sa-facts{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-4);margin:0;font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.sa-facts dt{color:var(--text-muted)}
.sa-facts dd{margin:0;text-align:right;color:var(--text-heading);font-family:var(--font-data)}
.sa-facts .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold)}
.sa-up{color:var(--text-success)!important}.sa-down{color:var(--text-danger)!important}
.sa-note{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-xs);line-height:1.5}
.sa-note.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.sa-note.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.sa-note.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.sa-note svg{flex:none;margin-top:1px}
.sa-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4);border-bottom:1px solid var(--border-subtle)}
.sa-stats{flex:1 1 420px}
/* phones: the three status cards share one row, so their sub-line wraps inside the card instead of running past it */
@media (max-width:640px){.sa-stats .gc-stattab{overflow:hidden}.sa-stats .gc-stattab__nums{width:100%}.sa-stats .gc-stattab__nums small{max-width:100%;white-space:normal;overflow-wrap:anywhere;line-height:16px}}
@media (max-width:640px){.sa-bar{padding:var(--space-3)}.sa-place{flex:1 1 100%;min-width:0!important}}
.sa-place{width:auto;min-width:200px}
.sa-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sa-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.sa-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.sa-num{text-align:right;font-family:var(--font-data);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.sa-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
.sa-dlg{display:flex;flex-direction:column;gap:var(--space-4)}
@media (max-width:1100px){.sa-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:599px){.sa-two{grid-template-columns:1fr}}
`;

const blank = (sku = CATALOG[0].sku, place = STOCK_PLACES[0]) => ({ sku, place, dir: 'remove', qty: '1', reason: 'Damaged', note: '', by: STAFF[0] });

export default function StockAdjustments() {
  const [list, setList] = useState([]);
  const [holds, setHolds] = useState([]);
  const [moves, setMoves] = useState([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(blank());
  const [errs, setErrs] = useState({});
  const [tab, setTab] = useState('waiting');
  const [place, setPlace] = useState('');
  const places = usePlaceList('stock');          // new adjustments: live places after mount (built-in list first)
  const filterPlaces = usePlaceList('filter');   // past adjustments: deactivated places stay findable
  const [pin, setPin] = useState(null);      // { mode: 'new' } | { mode: 'row', row }
  const [reject, setReject] = useState(null); // { row, by, note }

  const reload = () => { setList(getAdjustments()); setHolds(getHolds()); setMoves(getMoves()); };
  useEffect(() => {
    reload();
    const q = new URLSearchParams(window.location.search);
    const p = productBy(q.get('sku') || '');
    const live = getStockPlaces(), asked = placeName(q.get('place') || '');
    const at = live.includes(asked) ? asked : live[0] || STOCK_PLACES[0];
    if (p) setForm(blank(p.sku, at));
    const want = q.get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
    setReady(true);
  }, []);

  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setErrs({}); };
  const product = productBy(form.sku);
  const qty = num(form.qty);
  const change = form.dir === 'add' ? qty : -qty;
  const now = ready && product ? stockAt(product.sku, form.place, holds, moves) : { onHand: 0, held: 0, damaged: 0, available: 0 };
  const after = now.onHand + change;
  const approval = needsApproval(change);
  const why = change < 0 ? 'It lowers the stock.' : `It adds more than ${APPROVAL_LIMIT} pieces.`;
  const value = product ? Math.abs(change) * product.wholesale : 0;

  const check = () => {
    const e = {};
    if (!product) e.sku = 'Choose a product.';
    if (!qty) e.qty = 'Enter how many pieces.';
    else if (after < 0) e.qty = `Only ${now.onHand} on hand at ${form.place}. You cannot remove more.`;
    if (form.reason === 'Other' && !form.note.trim()) e.note = 'Say what happened.';
    setErrs(e);
    const first = ['sku', 'qty', 'note'].find((k) => e[k]);
    if (first) document.getElementById('sa-' + first)?.focus();
    return !first;
  };
  const payload = () => ({ sku: product.sku, place: form.place, qty: change, reason: form.reason, note: form.note.trim(), by: form.by });
  const done = (row) => {
    reload();
    setForm(blank(form.sku, form.place));
    if (row.status === 'approved') { setTab('approved'); toast(`${row.id} saved · ${product.name} ${signed(row.qty)} at ${row.place}. On hand is now ${after}.`); }
    else { setTab('waiting'); toast(`${row.id} saved · waiting for a manager to approve`); }
  };
  const save = (e) => { e.preventDefault(); if (!check()) return; if (approval) { setPin({ mode: 'new' }); return; } done(addAdjustment(payload(), 'Auto').row); };
  const saveWaiting = () => { if (!check()) return; done(addAdjustment(payload()).row); };
  const onApprove = (manager) => {
    if (pin.mode === 'new') { const { row } = addAdjustment(payload(), manager); setPin(null); done(row); return; }
    const row = pin.row;
    const p = productBy(row.sku);
    const have = stockAt(row.sku, row.place, getHolds(), getMoves()).onHand;
    setPin(null);
    if (have + row.qty < 0) { toast(`Only ${have} of ${p ? p.name : row.sku} on hand at ${row.place}. Reject it or count the shelf first.`, { tone: 'error' }); return; }
    approveAdjustment(row.id, manager);
    reload();
    toast(`${row.id} approved by ${manager} · stock changed by ${signed(row.qty)}`);
  };
  const doReject = (e) => {
    e.preventDefault();
    rejectAdjustment(reject.row.id, reject.by, reject.note.trim());
    reload();
    toast(`${reject.row.id} rejected · the stock did not change`);
    setReject(null);
  };

  const here = list.filter((a) => !place || placeName(a.place) === place);
  const groups = { waiting: here.filter((a) => a.status === 'waiting'), approved: here.filter((a) => a.status === 'approved'), rejected: here.filter((a) => a.status === 'rejected') };
  const shown = groups[tab];
  const pcs = (rows) => rows.reduce((a, r) => a + r.qty, 0);

  return (
    <div className="dc-screen ds" data-screen="StockAdjustments">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-adjust" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Products & stock" page="Stock adjustments" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Stock adjustments"
              description={`Add or remove stock by hand with a reason. A manager approves every decrease and any change over ${APPROVAL_LIMIT} pieces.`}
              actions={<>
                <Link href="/stock" className="gc-btn gc-btn--neutral"><Icon name="boxes" width="18" height="18" aria-hidden="true" /> Stock list</Link>
                <Link href="/stock-count" className="gc-btn gc-btn--neutral"><Icon name="clipboard-check" width="18" height="18" aria-hidden="true" /> Stock count</Link>
              </>}
            />

            <form className="sa-grid" onSubmit={save} noValidate aria-label="New stock adjustment">
              <section className="gc-card sa-card">
                <div className="sa-head"><div><h2>Adjust stock</h2><p>Pick the product and place, then say how many pieces and why.</p></div></div>
                <div className="sa-form">
                  <div>
                    <label className="gc-label" htmlFor="sa-sku">Product *</label>
                    <ProductPicker id="sa-sku" value={form.sku} onChange={(sku) => set({ sku })} invalid={!!errs.sku} describedBy={errs.sku ? 'sa-sku-err' : undefined}
                      hint={(p) => { const n = ready ? stockAt(p.sku, form.place, holds, moves).onHand : 0; return { text: `${n} on hand here`, none: n <= 0 }; }} />
                    {errs.sku ? <p id="sa-sku-err" className="gc-help gc-help--error" role="alert">{errs.sku}</p> : null}
                  </div>
                  <div className="sa-two">
                    <div><label className="gc-label" htmlFor="sa-place">Place *</label><select id="sa-place" className="gc-input gc-select" value={form.place} onChange={(e) => set({ place: e.target.value })}>{places.map((x) => <option key={x}>{x}</option>)}</select></div>
                    <div><label className="gc-label" htmlFor="sa-by">Done by</label><select id="sa-by" className="gc-input gc-select" value={form.by} onChange={(e) => set({ by: e.target.value })}>{STAFF.map((x) => <option key={x}>{x}</option>)}</select></div>
                  </div>
                  <div className="sa-qty">
                    <div>
                      <span className="gc-label" id="sa-dir-label">Change</span>
                      <div className="sa-dir" role="group" aria-labelledby="sa-dir-label">
                        <button type="button" className="is-add" aria-pressed={form.dir === 'add'} onClick={() => set({ dir: 'add' })}><Icon name="plus" width="16" height="16" aria-hidden="true" /> Add</button>
                        <button type="button" className="is-remove" aria-pressed={form.dir === 'remove'} onClick={() => set({ dir: 'remove' })}><Icon name="minus" width="16" height="16" aria-hidden="true" /> Remove</button>
                      </div>
                    </div>
                    <div>
                      <label className="gc-label" htmlFor="sa-qty">Pieces *</label>
                      <input id="sa-qty" className={'gc-input' + (errs.qty ? ' gc-input--error' : '')} type="number" min="1" inputMode="numeric" value={form.qty} onChange={(e) => set({ qty: e.target.value })} aria-invalid={errs.qty ? 'true' : undefined} aria-describedby={errs.qty ? 'sa-qty-err' : undefined} />
                    </div>
                  </div>
                  {errs.qty ? <p id="sa-qty-err" className="gc-help gc-help--error" role="alert" style={{ marginTop: 'calc(var(--space-3) * -1)' }}>{errs.qty}</p> : null}
                  <div>
                    <span className="gc-label" id="sa-reason-label">Reason *</span>
                    <div className="sa-reasons" role="group" aria-labelledby="sa-reason-label">
                      {ADJUST_REASONS.map((r) => <button key={r} type="button" className="sa-chip" aria-pressed={form.reason === r} onClick={() => set({ reason: r, dir: r === 'Found' ? 'add' : ['Damaged', 'Lost', 'Expired', 'Gift/sample'].includes(r) ? 'remove' : form.dir })}>{r}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="gc-label" htmlFor="sa-note">Note{form.reason === 'Other' ? ' *' : ''}</label>
                    <input id="sa-note" className={'gc-input' + (errs.note ? ' gc-input--error' : '')} placeholder="For example: box crushed in the store room" value={form.note} onChange={(e) => set({ note: e.target.value })} aria-invalid={errs.note ? 'true' : undefined} aria-describedby={errs.note ? 'sa-note-err' : undefined} />
                    {errs.note ? <p id="sa-note-err" className="gc-help gc-help--error" role="alert">{errs.note}</p> : null}
                  </div>
                </div>
              </section>

              <section className="gc-card sa-card" aria-label="Before you save">
                <div className="sa-head"><div><h2>Before you save</h2><p>{product ? `${product.name} · ${form.place}` : 'Choose a product'}</p></div></div>
                <div className="sa-sum">
                  <dl className="sa-facts">
                    <dt>On hand now</dt><dd>{now.onHand}</dd>
                    <dt>Held for orders</dt><dd>{now.held}</dd>
                    <dt>Change</dt><dd className={change > 0 ? 'sa-up' : change < 0 ? 'sa-down' : ''}>{signed(change)}</dd>
                    <dt className="is-total">On hand after</dt><dd className={'is-total' + (after < 0 ? ' sa-down' : '')}>{after}</dd>
                    <dt>Value</dt><dd>{formatBDT(value)}</dd>
                  </dl>
                  {after < now.held && after >= 0 ? <div className="sa-note is-bad"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>After this, fewer pieces are on hand than are held for orders ({now.held}).</span></div> : null}
                  {approval
                    ? <div className="sa-note is-warn"><Icon name="shield-alert" width="16" height="16" aria-hidden="true" /><span>A manager must approve this. {why} Approve it now with the manager's PIN, or save it to wait for approval.</span></div>
                    : <div className="sa-note is-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>No approval needed. The stock changes when you save.</span></div>}
                  <button type="submit" className="gc-btn gc-btn--solid gc-btn--block">{approval ? <><Icon name="key-round" width="18" height="18" aria-hidden="true" /> Approve now with PIN</> : <><Icon name="check" width="18" height="18" aria-hidden="true" /> Save adjustment</>}</button>
                  {approval ? <button type="button" className="gc-btn gc-btn--neutral gc-btn--block" onClick={saveWaiting}>Save as waiting for approval</button> : null}
                </div>
              </section>
            </form>

            <section className="gc-card sa-card">
              <div className="sa-bar">
                <div className="gc-stattabs gc-stattabs--row sa-stats" role="tablist" aria-label="Adjustments">
                  {TABS.map(([id, label]) => (
                    <button key={id} type="button" role="tab" aria-selected={tab === id} className="gc-stattab" onClick={() => setTab(id)}>
                      <span className="gc-stattab__label"><i className="gc-stattab__dot" style={{ background: id === 'waiting' ? 'var(--fill-warning)' : id === 'approved' ? 'var(--fill-success)' : 'var(--fill-danger)' }} />{label}</span>
                      <span className="gc-stattab__nums"><b>{groups[id].length}</b><small>{id === 'rejected' ? 'stock not changed' : `${id === 'approved' ? 'net ' : ''}${signed(pcs(groups[id]))} pcs`}</small></span>
                    </button>
                  ))}
                </div>
                <select className="gc-input gc-select sa-place" aria-label="Warehouse or branch" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All warehouses and branches</option>{filterPlaces.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
              {shown.length === 0 ? <EmptyState icon="clipboard-check" title={tab === 'waiting' ? 'Nothing waiting' : 'Nothing here'} body={tab === 'waiting' ? 'Every adjustment has been approved or rejected.' : 'No adjustments in this group at this place.'} /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Adjustment</th><th scope="col">Product</th><th scope="col">Place</th><th scope="col" className="sa-num">Change</th><th scope="col">Reason</th><th scope="col">Asked by</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {shown.map((a) => {
                        const p = productBy(a.sku);
                        return (
                          <tr key={a.id}>
                            <td className="sa-id">{a.id}</td>
                            <td><span className="sa-strong">{p ? p.name : a.sku}</span><span className="sa-sub"><span className="sa-id">{a.sku}</span>{p ? ` · ${p.variant}` : ''}</span></td>
                            <td>{a.place}</td>
                            <td className={'sa-num ' + (a.qty > 0 ? 'sa-up' : 'sa-down')}>{signed(a.qty)}</td>
                            <td>{a.reason}{a.note ? <span className="sa-sub">{a.note}</span> : null}</td>
                            <td>{a.by}<span className="sa-sub">{formatDate(a.at)} · {formatTime(a.at)}</span></td>
                            <td><span className={'gc-badge gc-badge--' + STATUS[a.status][1]}>{STATUS[a.status][0]}</span>{a.status !== 'waiting' ? <span className="sa-sub">{a.decidedBy === 'Auto' ? 'No approval needed' : `by ${a.decidedBy}`}{a.decisionNote ? ` · ${a.decisionNote}` : ''}</span> : null}</td>
                            <td>
                              <div className="sa-actions">
                                {a.status === 'waiting' ? <>
                                  <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setPin({ mode: 'row', row: a })} aria-label={`Approve ${a.id}`}>Approve</button>
                                  <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReject({ row: a, by: MANAGERS[0], note: '' })} aria-label={`Reject ${a.id}`}>Reject</button>
                                </> : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <ManagerPin
        open={!!pin}
        reason={pin ? (pin.mode === 'new'
          ? `${product ? product.name : ''} at ${form.place}: ${signed(change)} pieces (${form.reason}). On hand goes from ${now.onHand} to ${after}.`
          : `${pin.row.id} · ${productBy(pin.row.sku)?.name || pin.row.sku} at ${pin.row.place}: ${signed(pin.row.qty)} pieces (${pin.row.reason}). The stock changes when you approve.`) : ''}
        onApprove={onApprove}
        onClose={() => setPin(null)}
      />

      <Dialog open={!!reject} title={reject ? `Reject ${reject.row.id}` : 'Reject'} onClose={() => setReject(null)} width={440}>
        {reject ? (
          <form className="sa-dlg" onSubmit={doReject}>
            <p className="gc-help" style={{ margin: 0 }}>{productBy(reject.row.sku)?.name || reject.row.sku} · {signed(reject.row.qty)} at {reject.row.place}. The stock does not change.</p>
            <div><label className="gc-label" htmlFor="sa-rj-by">Manager</label><select id="sa-rj-by" className="gc-input gc-select" value={reject.by} onChange={(e) => setReject({ ...reject, by: e.target.value })}>{MANAGERS.map((m) => <option key={m}>{m}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="sa-rj-note">Why</label><input id="sa-rj-note" className="gc-input" data-autofocus placeholder="For example: count the shelf first" value={reject.note} onChange={(e) => setReject({ ...reject, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setReject(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Reject</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
