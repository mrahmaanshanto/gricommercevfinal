'use client';
// StockAdjustments — add or remove stock by hand with a reason (damaged, lost, found, count correction…).
// Any decrease, or any change over 20 pieces, needs a manager: approve on the spot with the manager's
// PIN, or save it as "Waiting for approval" for a manager to approve or reject later. Only an approved
// adjustment changes the stock (a stock move of kind 'adjust').
// Laid out like a Shopify list (components/ui/IndexKit.jsx): the list of adjustments (Pending, Approved, Rejected,
// filtered by place) is the page; "Adjust stock" opens the form in a side panel, and a click on a row opens the
// adjustment, where a manager approves or rejects it (never decided in the list).
// Opened with ?sku=<sku>&place=<place> from the stock list to start with that product (the form opens).
// Front end only: rows come from src/lib/stockAdjustments.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore, KV } from '@/components/ui/IndexKit';
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
.sa-id{font-family:var(--font-data)}
.ix-strong.sa-id{font-family:var(--font-data)}
.sa-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sa-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sa-dir{display:inline-flex;gap:var(--space-1);padding:3px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-subtle)}
.sa-dir button{height:28px;padding:0 var(--space-3);border:0;border-radius:var(--radius-full);background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.sa-dir button[aria-pressed="true"].is-add{background:var(--fill-success-soft);color:var(--text-success)}
.sa-dir button[aria-pressed="true"].is-remove{background:var(--fill-error-soft);color:var(--text-danger)}
.sa-qty{display:flex;align-items:flex-end;gap:var(--space-3);flex-wrap:wrap}
.sa-qty .gc-input{width:120px}
.sa-up{color:var(--text-success)!important}.sa-down{color:var(--text-danger)!important}
.sa-note{display:flex;gap:var(--space-2);align-items:flex-start;margin:0;font-size:var(--text-xs);line-height:1.5}
.sa-note.is-warn{color:var(--text-warning)}
.sa-note.is-ok{color:var(--text-success)}
.sa-note.is-bad{color:var(--text-danger)}
.sa-note svg{flex:none;margin-top:1px}
.sa-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sa-dlg{display:flex;flex-direction:column;gap:var(--space-4)}
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
  const [adding, setAdding] = useState(false); // the "Adjust stock" panel
  const [view, setView] = useState(null);      // id of the adjustment open in the review panel
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
    if (p) { setForm(blank(p.sku, at)); setAdding(true); }
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
    setAdding(false);
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
    setView(null);
    toast(`${row.id} approved by ${manager} · stock changed by ${signed(row.qty)}`);
  };
  const doReject = (e) => {
    e.preventDefault();
    rejectAdjustment(reject.row.id, reject.by, reject.note.trim());
    reload();
    toast(`${reject.row.id} rejected · the stock did not change`);
    setReject(null);
    setView(null);
  };

  const here = list.filter((a) => !place || placeName(a.place) === place);
  const groups = { waiting: here.filter((a) => a.status === 'waiting'), approved: here.filter((a) => a.status === 'approved'), rejected: here.filter((a) => a.status === 'rejected') };
  const shown = groups[tab];
  const pcs = (rows) => rows.reduce((a, r) => a + r.qty, 0);
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'sa-tab-' + id, label, count: groups[id].length, on: tab === id, onClick: () => setTab(id) }));
  const foot = (shown.length === 1 ? '1 adjustment' : `${shown.length} adjustments`) + (tab === 'rejected' ? ' · stock not changed' : ` · ${tab === 'approved' ? 'net ' : ''}${signed(pcs(shown))} pcs`);
  const nameOf = (a) => { const p = productBy(a.sku); return p ? p.name : a.sku; };
  const openRow = (a) => (e) => { if (e && e.target.closest && e.target.closest('a,button,input,select,label')) return; setView(a.id); };
  const viewing = view ? list.find((a) => a.id === view) : null;
  const viewNow = viewing && ready ? stockAt(viewing.sku, viewing.place, holds, moves).onHand : 0;
  const openNew = () => { setErrs({}); setAdding(true); };

  return (
    <div className="dc-screen ds" data-screen="StockAdjustments">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-adjust" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Stock adjustments" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="sliders-horizontal" title="Stock adjustments"
                about={`Add or remove stock by hand with a reason. A manager approves every decrease and any change over ${APPROVAL_LIMIT} pieces.`}
                secondary={[{ label: 'Stock count', href: '/stock-count' }]}
                more={[{ label: 'Stock list', href: '/stock' }]}
                primary={{ label: 'Adjust stock', onClick: openNew }} />

              <section className="ix-card" aria-label="Adjustments">
                <div className="ix-bar">
                  <IndexTabs tabs={tabs} label="Adjustments" />
                  <span className="ix-tools">
                    <select className="ix-pick" aria-label="Warehouse or branch" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All warehouses and branches</option>{filterPlaces.map((x) => <option key={x}>{x}</option>)}</select>
                  </span>
                </div>
                {shown.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="clipboard-check" title={tab === 'waiting' ? 'Nothing waiting' : 'Nothing here'} body={tab === 'waiting' ? 'Every adjustment has been approved or rejected.' : 'No adjustments in this group at this place.'} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Adjustments">
                    {shown.map((a) => (
                      <li key={a.id}>
                        <button type="button" className="ix-pitem" onClick={() => setView(a.id)}>
                          <span className="ix-pitem__top"><b>{nameOf(a)}</b><span className={a.qty > 0 ? 'sa-up' : 'sa-down'}>{signed(a.qty)}</span></span>
                          <span className="ix-pitem__mid">{a.id} · {a.place} · {formatDate(a.at)}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={STATUS[a.status][1]}>{STATUS[a.status][0]}</StatusBadge></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">{TABS.find((x) => x[0] === tab)[1]} adjustments</caption>
                      <thead><tr><th scope="col">Adjustment</th><th scope="col">Date</th><th scope="col">Product</th><th scope="col">Place</th><th scope="col" className="ix-num">Change</th><th scope="col">Reason</th><th scope="col">Status</th></tr></thead>
                      <tbody>
                        {shown.map((a) => (
                          <tr key={a.id} onClick={openRow(a)}>
                            <td><button type="button" className="ix-strong sa-id" onClick={() => setView(a.id)}>{a.id}</button></td>
                            <td className="ix-muted">{formatDate(a.at)}</td>
                            <td>{nameOf(a)}</td>
                            <td className="ix-muted">{a.place}</td>
                            <td className={'ix-num ix-strong ' + (a.qty > 0 ? 'sa-up' : 'sa-down')}>{signed(a.qty)}</td>
                            <td className="ix-muted">{a.reason}</td>
                            <td><StatusBadge tone={STATUS[a.status][1]}>{STATUS[a.status][0]}</StatusBadge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{foot}</span></div>
              </section>
              <LearnMore topic="stock adjustments" />
            </div>
          </div>
        </main>
      </div>

      {/* new adjustment */}
      <Sheet open={adding && !pin} title="Adjust stock" onClose={() => setAdding(false)}
        footer={approval ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={saveWaiting}>Save as waiting for approval</button>
          <button type="submit" form="sa-form" className="gc-btn gc-btn--sm gc-btn--solid"><Icon name="key-round" width="16" height="16" aria-hidden="true" /> Approve now with PIN</button>
        </> : <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setAdding(false)}>Cancel</button>
          <button type="submit" form="sa-form" className="gc-btn gc-btn--sm gc-btn--solid"><Icon name="check" width="16" height="16" aria-hidden="true" /> Save adjustment</button>
        </>}>
        <form id="sa-form" className="sa-form" onSubmit={save} noValidate aria-label="New stock adjustment">
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
            <div className="ix-chips" role="group" aria-labelledby="sa-reason-label">
              {ADJUST_REASONS.map((r) => <button key={r} type="button" className="ix-chip" aria-pressed={form.reason === r} onClick={() => set({ reason: r, dir: r === 'Found' ? 'add' : ['Damaged', 'Lost', 'Expired', 'Gift/sample'].includes(r) ? 'remove' : form.dir })}>{r}</button>)}
            </div>
          </div>
          <div>
            <label className="gc-label" htmlFor="sa-note">Note{form.reason === 'Other' ? ' *' : ''}</label>
            <input id="sa-note" className={'gc-input' + (errs.note ? ' gc-input--error' : '')} placeholder="For example: box crushed in the store room" value={form.note} onChange={(e) => set({ note: e.target.value })} aria-invalid={errs.note ? 'true' : undefined} aria-describedby={errs.note ? 'sa-note-err' : undefined} />
            {errs.note ? <p id="sa-note-err" className="gc-help gc-help--error" role="alert">{errs.note}</p> : null}
          </div>

          <h3 className="ix-section-title">Before you save</h3>
          <p className="sa-sub">{product ? `${product.name} · ${form.place}` : 'Choose a product'}</p>
          <dl className="ix-sum">
            <dt>On hand now</dt><dd>{now.onHand}</dd>
            <dt>Held for orders</dt><dd>{now.held}</dd>
            <dt>Change</dt><dd className={change > 0 ? 'sa-up' : change < 0 ? 'sa-down' : ''}>{signed(change)}</dd>
            <dt className="is-total">On hand after</dt><dd className={'is-total' + (after < 0 ? ' sa-down' : '')}>{after}</dd>
            <dt>Value</dt><dd>{formatBDT(value)}</dd>
          </dl>
          {after < now.held && after >= 0 ? <p className="sa-note is-bad"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>After this, fewer pieces are on hand than are held for orders ({now.held}).</span></p> : null}
          {approval
            ? <p className="sa-note is-warn"><Icon name="shield-alert" width="16" height="16" aria-hidden="true" /><span>A manager must approve this. {why} Approve it now with the manager's PIN, or save it to wait for approval.</span></p>
            : <p className="sa-note is-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>No approval needed. The stock changes when you save.</span></p>}
        </form>
      </Sheet>

      {/* one adjustment: what was asked, approve or reject it */}
      <Sheet open={!!viewing && !pin && !reject} title={viewing ? viewing.id : ''} onClose={() => setView(null)}
        footer={viewing && viewing.status === 'waiting' ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReject({ row: viewing, by: MANAGERS[0], note: '' })}>Reject</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setPin({ mode: 'row', row: viewing })}>Approve</button>
        </> : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setView(null)}>Done</button>}>
        {viewing ? (<>
          <div><StatusBadge tone={STATUS[viewing.status][1]}>{STATUS[viewing.status][0]}</StatusBadge></div>
          <KV rows={[
            ['Product', nameOf(viewing)],
            ['SKU', <span key="s" className="sa-id">{viewing.sku}</span>],
            ['Place', viewing.place],
            ['Change', <b key="c" className={viewing.qty > 0 ? 'sa-up' : 'sa-down'}>{signed(viewing.qty)}</b>],
            viewing.status === 'waiting' ? ['On hand now', viewNow] : null,
            viewing.status === 'waiting' ? ['On hand after', viewNow + viewing.qty] : null,
            ['Reason', viewing.reason],
            viewing.note ? ['Note', viewing.note] : null,
            ['Asked by', viewing.by],
            ['Date', `${formatDate(viewing.at)} · ${formatTime(viewing.at)}`],
            viewing.status !== 'waiting' ? ['Decided by', viewing.decidedBy === 'Auto' ? 'No approval needed' : viewing.decidedBy] : null,
            viewing.decisionNote ? ['Why', viewing.decisionNote] : null,
          ]} />
          {viewing.status === 'waiting' ? <p className="sa-sub">The stock changes when a manager approves it with their PIN.</p> : null}
        </>) : null}
      </Sheet>

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
