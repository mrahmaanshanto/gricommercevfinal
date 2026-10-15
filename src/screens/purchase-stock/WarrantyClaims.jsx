'use client';
// Warranty claims & serials — Products › Warranty claims (/warranty-claims), laid out like a Shopify list page
// (docs/shopify-style.md): a few figures, then one card with the claims (or the serial & IMEI register). The claims are
// the real records of lib/customerWarranty.js (a claim logged with "Log service" on a customer or an order shows here):
// received → with service centre → ready for pickup → returned to customer, or rejected with a reason; each step sends
// the customer a message (notifications.js › notifyCustomer). New claim looks the item up by IMEI / serial, phone or order number and checks the warranty
// against the policy it was sold under (lib/warranty.js › coverOf). The register is lib/serials.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, LearnMore, Menu, SearchField } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatDate } from '@/lib/format';
import { downloadCsv } from '@/lib/reports/period';
import { currentUser } from '@/lib/team';
import { getSerials, SERIAL_STATES } from '@/lib/serials';
import { getClaims, claimBy, stepOf, isOpenClaim, openClaim, moveClaim, rejectClaim, lookupWarranty, CLAIM_STEPS, CLAIM_LABEL, DECISIONS, CLAIMS_EVENT } from '@/lib/customerWarranty';
import { allProducts } from '@/lib/products';
import { productBy } from '@/lib/stock';
import { coverOf } from '@/lib/warranty';
import { notifyWords } from '@/lib/notifications';

const DAY = 864e5;
const STEP_TONE = { received: 'info', centre: 'warning', ready: 'success', returned: 'neutral', rejected: 'error' };
const SN_TONE = { 'Under claim': 'warning', 'In stock': 'success', Sold: 'info', Returned: 'neutral' };
const FILTERS = [['open', 'Open'], ['received', 'Received'], ['centre', 'With service centre'], ['ready', 'Ready for pickup'], ['returned', 'Returned'], ['rejected', 'Rejected'], ['all', 'All']];

// ---- styles ----

const CSS = `
.wc-id{font-family:var(--font-data)}
.wc-late{color:var(--text-danger);font-weight:var(--weight-medium)}
.wc-foot{display:flex;align-items:center;gap:var(--space-2)}
.wc-foot>span{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs-plus);color:var(--text-body)}
.wc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.wc-field .gc-label{margin:0}
.wc-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.wc-row>.gc-input{flex:1 1 200px;min-width:0}
.wc-hit{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--fill-success-soft)}
.wc-hit__top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3)}
.wc-hit__top b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wc-hit__top small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.wc-left{flex:none;text-align:right}
.wc-left>span{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success)}
.wc-left>b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-success)}
.wc-left>small{font-size:var(--text-xs);color:var(--text-muted)}
.wc-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.wc-head small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.wc-steps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.wc-steps li{display:flex;gap:var(--space-3)}
.wc-steps li>span:first-child{display:flex;flex-direction:column;align-items:center}
.wc-dot{display:grid;flex:none;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);background:var(--surface-quiet);color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.wc-dot.is-done{background:var(--success);color:#fff}
.wc-dot.is-cur{background:var(--primary);color:#fff}
.wc-line{flex:1;width:2px;min-height:10px;background:var(--border-subtle)}
.wc-line.is-done{background:var(--success)}
.wc-steps li>span:last-child{display:flex;flex-direction:column;padding-bottom:var(--space-2);font-size:var(--text-sm);color:var(--text-muted)}
.wc-steps li.is-on>span:last-child{color:var(--text-heading);font-weight:var(--weight-medium)}
.wc-steps small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.wc-box{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-xs-plus);color:var(--text-body)}
.wc-ok{display:flex;align-items:center;gap:var(--space-2);color:var(--text-success);font-weight:var(--weight-medium)}
.wc-photos{display:flex;gap:var(--space-2)}
.wc-photos>span{width:56px;height:42px;border-radius:var(--radius-md);background:linear-gradient(160deg,var(--slate-500),var(--slate-800))}
.wc-msg{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);font-size:var(--text-xs-plus);color:var(--text-heading)}
.wc-msg>svg{flex:none;margin-top:1px;color:var(--text-success)}
.wc-bars{display:flex;flex-direction:column;gap:var(--space-2);margin:0 var(--space-4) var(--space-4)}
.wc-bar{display:grid;grid-template-columns:80px minmax(0,1fr) 24px;align-items:center;gap:var(--space-2);font-size:var(--text-xs-plus)}
.wc-bar>b{text-align:right;font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.wc-recent{display:flex;align-items:center;gap:var(--space-2);padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-family:var(--font-data);font-size:var(--text-xs-plus)}
.wc-recent>svg{color:var(--text-success)}
.wc-count{display:flex;justify-content:space-between;margin-bottom:6px;font-size:var(--text-xs-plus)}
.wc-progress .gc-progress__fill{background:var(--success)}
.wc-empty{margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.wc-hit--out{background:var(--fill-warning-soft)}
@media (max-width:640px){
  .wc-foot>span{display:none}
  /* phones: a figure's note goes under the figure instead of running into the next one */
  .wc-page .ix-metric__value{flex-wrap:wrap;row-gap:0}
  .wc-page .ix-metric__sub{white-space:normal}
}
`;
// ---- markup ----

export default function WarrantyClaimsScreen() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState('claims');
  const [filt, setFilt] = useState('open');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [sel, setSel] = useState('');           // the claim open in the side panel
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState('repair');
  const [rejecting, setRejecting] = useState(null);   // the reason being typed
  const [look, setLook] = useState(null);       // New claim: { q, hits, pick, problem }
  useEffect(() => {
    setReady(true); setNow(Date.now());
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('tab') === 'serials') setTab('serials');
    if (qs.get('q')) { setQ(qs.get('q')); setFind(true); }
    const bump = () => { setTick((n) => n + 1); setNow(Date.now()); };
    window.addEventListener(CLAIMS_EVENT, bump); window.addEventListener('gc:serials', bump);
    return () => { window.removeEventListener(CLAIMS_EVENT, bump); window.removeEventListener('gc:serials', bump); };
  }, []);

  const claims = useMemo(() => { void tick; return ready ? getClaims() : []; }, [ready, tick]);
  const units = useMemo(() => { void tick; return ready ? getSerials() : []; }, [ready, tick]);
  const qq = q.trim().toUpperCase().replace(/\s+/g, '');
  const hitClaim = (c) => !qq || [c.id, c.item, c.name, c.phone, c.order, ...(c.serials || [])].some((x) => String(x || '').toUpperCase().replace(/\s+/g, '').includes(qq));
  const open = claims.filter(isOpenClaim);
  const counts = Object.fromEntries(FILTERS.map(([k]) => [k, claims.filter((c) => (k === 'all' ? true : k === 'open' ? isOpenClaim(c) : stepOf(c) === k)).length]));
  const shownClaims = claims.filter((c) => (filt === 'all' ? true : filt === 'open' ? isOpenClaim(c) : stepOf(c) === filt) && hitClaim(c));
  const closed = claims.filter((c) => stepOf(c) === 'returned' && c.closedAt);
  const avgDays = closed.length ? closed.reduce((a, c) => a + (c.closedAt - c.at) / DAY, 0) / closed.length : null;
  const monthStart = now ? new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime() : 0;
  const rejectedMonth = claims.filter((c) => stepOf(c) === 'rejected' && (c.closedAt || c.at) >= monthStart).length;
  const daysOpen = (c) => (now ? Math.max(0, Math.floor(((c.closedAt || now) - c.at) / DAY)) : 0);

  // the register: every unit, with who has it and when its warranty ends
  const products = useMemo(() => (ready ? allProducts() : []), [ready]);
  const underClaim = new Set(open.flatMap((c) => c.serials || []));
  const endOf = (u) => {
    if (u.state !== 'sold' || !u.soldAt) return u.state === 'stock' ? 'Starts on sale' : '—';
    const row = productBy(u.sku || u.product);
    const p = (row && row.productId && products.find((x) => x.id === row.productId)) || products.find((x) => x.sku === u.sku) || products.find((x) => x.name === u.product);
    const w = coverOf(p, u.soldAt);
    return w ? formatDate(w.until) : 'No warranty';
  };
  const snRows = units.filter((u) => !qq || [u.serial, u.product, u.customer, u.saleId].some((x) => String(x || '').toUpperCase().includes(qq))).map((u) => {
    const st = underClaim.has(u.serial) ? 'Under claim' : SERIAL_STATES[u.state] || u.state;
    return { no: u.serial, p: u.product, b: [u.added, u.supplier].filter(Boolean).join(' · ') || u.place, st, c: u.state === 'sold' ? u.customer || 'Walk-in customer' : u.place, e: endOf(u) };
  });

  const D = sel ? claimBy(sel) : null;
  const ds = D ? stepOf(D) : '';
  const di = CLAIM_STEPS.findIndex((x) => x.key === ds);
  const nextStep = di >= 0 && di < CLAIM_STEPS.length - 1 ? CLAIM_STEPS[di + 1] : null;
  const who = () => (currentUser() || {}).name || 'Staff';
  const pick = (c) => { setSel(c.id); setNote(''); setDecision(c.decision || 'repair'); setRejecting(null); };
  const advance = () => {
    if (!D || !nextStep) return;
    const r = moveClaim(D.id, nextStep.key, { by: who(), note, decision });
    setNote('');
    toast(`${D.id} moved to ${nextStep.label}. ${r.sms ? notifyWords(r.sms) : 'No phone number, so no message.'}`);
  };
  const reject = () => {
    if (!rejecting || !rejecting.trim()) { toast('Write why the claim is rejected', { tone: 'error' }); return; }
    const r = rejectClaim(D.id, rejecting, who());
    setRejecting(null);
    toast(`${D.id} rejected. ${r.sms ? notifyWords(r.sms) : 'No phone number, so no message.'}`, { tone: 'info' });
  };

  const startLook = () => setLook({ q: '', hits: null, pick: null, problem: '' });
  const runLook = (e) => { if (e) e.preventDefault(); const hits = lookupWarranty(look.q, Date.now()); setLook({ ...look, hits, pick: hits.length === 1 ? hits[0] : null }); };
  const saveLook = () => {
    const it = look.pick;
    if (!it) { toast('Look up the item first', { tone: 'error' }); return; }
    if (!look.problem.trim()) { toast('Write what is wrong with it', { tone: 'error' }); return; }
    const c = openClaim({ item: it, problem: look.problem, phone: it.phone && it.phone !== '—' ? it.phone : '', name: it.name2 || '', by: who() });
    setLook(null); setTab('claims'); setFilt('open'); pick(c);
    toast(`Claim ${c.id} opened for ${it.name}`);
  };
  const csv = () => downloadCsv('serial-imei-register', [['Serial / IMEI', 'Product', 'Received', 'Status', 'Customer or place', 'Warranty ends'], ...snRows.map((r) => [r.no, r.p, r.b, r.st, r.c, r.e])]);

  const tabs = [
    { key: 'claims', id: 'wc-tab-claims', label: 'Warranty claims', count: ready ? open.length : null, on: tab === 'claims', onClick: () => setTab('claims') },
    { key: 'serials', id: 'wc-tab-serials', label: 'Serial & IMEI register', count: ready ? units.length : null, on: tab === 'serials', onClick: () => setTab('serials') },
  ];
  const centreN = open.filter((c) => stepOf(c) === 'centre').length;
  return (
    <div className="dc-screen ds" data-screen="WarrantyClaims">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-wclaims" />
        <main className="gc-shell__main">
          <Topbar crumb="Products" page="Warranty claims & serial numbers" placeholder="Search invoice, phone, serial or IMEI" />
          <div className="gc-shell__content">
            <div className="ix-page wc-page">
              <ShopHeader icon="shield-check" title="Warranty claims & serial numbers"
                about="Every piece with its own number, from the day it arrives to the day its warranty ends, and every warranty claim from received to handed back."
                secondary={[{ label: 'Warranty policies', href: '/warranty-policies' }]}
                primary={{ label: 'New claim', onClick: startLook }} />

              <MetricStrip label="Warranty claims" items={[
                { label: 'Open claims', value: ready ? String(open.length) : '—', sub: centreN ? centreN + ' with the service centre' : 'None with the service centre' },
                { label: 'Average turnaround', value: avgDays == null ? '—' : avgDays.toFixed(1) + ' days', sub: closed.length ? closed.length + ' handed back' : 'None handed back yet' },
                { label: 'Rejected this month', value: ready ? String(rejectedMonth) : '—' },
              ]} />

              <section className="ix-card" aria-label="Warranty claims & serial numbers">
                <div className="ix-bar">
                  {find ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="IMEI, serial, phone, claim or order" onDone={() => { setFind(false); setQ(''); }} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Warranty claims & serial numbers" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search by IMEI, serial or phone" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                      {tab === 'claims' ? (
                        <select aria-label="Status" className={'ix-filter' + (filt !== 'open' ? ' is-set' : '')} value={filt} onChange={(e) => setFilt(e.target.value)}>
                          {FILTERS.map(([k, l]) => <option key={k} value={k}>{l + ' · ' + (counts[k] || 0)}</option>)}
                        </select>
                      ) : (
                        <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Download CSV', icon: 'download', onClick: csv }, { label: 'Receive goods', icon: 'package-open', href: '/receive-goods' }]} />
                      )}
                    </span>
                  </>)}
                </div>

                {tab === 'claims' ? (<>
                  {shownClaims.length === 0 ? <p className="wc-empty">{qq ? 'No claim matches “' + q.trim() + '”.' : filt === 'open' ? 'No open claims. Use New claim when a customer brings an item back.' : 'No claims here.'}</p> : null}
                  <ul className="ix-plist" aria-label="Warranty claims">
                    {shownClaims.map((c) => (
                      <li key={c.id}>
                        <button type="button" className="ix-pitem" onClick={() => pick(c)}>
                          <span className="ix-pitem__top"><b className="wc-id">{c.id}</b><StatusBadge tone={STEP_TONE[stepOf(c)]}>{CLAIM_LABEL[stepOf(c)]}</StatusBadge></span>
                          <span className="ix-pitem__mid">{c.item} · {c.name || 'Walk-in customer'} · <span className={isOpenClaim(c) && daysOpen(c) > 7 ? 'wc-late' : ''}>{daysOpen(c)}d</span></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {shownClaims.length ? (
                    <div className="ix-table-wrap">
                      <table className="ix-table">
                        <caption className="sr-only">Warranty claims</caption>
                        <thead><tr><th scope="col">Claim</th><th scope="col">Product</th><th scope="col">IMEI / serial</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col" className="ix-num">Days</th></tr></thead>
                        <tbody>
                          {shownClaims.map((c) => (
                            <tr key={c.id} className={c.id === sel ? 'is-sel' : ''} onClick={() => pick(c)}>
                              <td><button type="button" className="ix-strong wc-id" onClick={(e) => { e.stopPropagation(); pick(c); }}>{c.id}</button></td>
                              <td>{c.item}</td>
                              <td className="wc-id ix-muted">{(c.serials || []).join(', ') || '—'}</td>
                              <td className="ix-muted">{c.name || 'Walk-in customer'}</td>
                              <td><StatusBadge tone={STEP_TONE[stepOf(c)]}>{CLAIM_LABEL[stepOf(c)]}</StatusBadge></td>
                              <td className={'ix-num' + (isOpenClaim(c) && daysOpen(c) > 7 ? ' wc-late' : '')}>{daysOpen(c)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  <div className="ix-foot"><span>{shownClaims.length === 1 ? '1 claim' : shownClaims.length + ' claims'}</span></div>
                </>) : (<>
                  <ul className="ix-plist" aria-label="Serial & IMEI register">
                    {snRows.map((sr) => (
                      <li key={sr.no}>
                        <div className="ix-pitem">
                          <span className="ix-pitem__top"><b className="wc-id">{sr.no}</b><StatusBadge tone={SN_TONE[sr.st] || 'neutral'}>{sr.st}</StatusBadge></span>
                          <span className="ix-pitem__mid">{sr.p} · {sr.c} · {sr.e}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table ix-table--static">
                      <caption className="sr-only">Serial & IMEI register</caption>
                      <thead><tr><th scope="col">Serial / IMEI</th><th scope="col">Product</th><th scope="col">Received</th><th scope="col">Status</th><th scope="col">Customer or place</th><th scope="col">Warranty ends</th></tr></thead>
                      <tbody>
                        {snRows.map((sr) => (
                          <tr key={sr.no}>
                            <td className="ix-strong wc-id">{sr.no}</td>
                            <td>{sr.p}</td>
                            <td className="ix-muted">{sr.b}</td>
                            <td><StatusBadge tone={SN_TONE[sr.st] || 'neutral'}>{sr.st}</StatusBadge></td>
                            <td className="ix-muted">{sr.c}</td>
                            <td>{sr.e}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="ix-foot"><span>{snRows.length === 1 ? '1 number' : snRows.length + ' numbers'}</span><span className="ix-muted">Numbers are added when goods are received</span></div>
                </>)}
              </section>
              <LearnMore topic="warranty claims" />
            </div>
          </div>
        </main>
      </div>

      {/* New claim: find the item and check its warranty, then open the claim */}
      <Dialog open={!!look} title="New claim" onClose={() => setLook(null)} width={560} footer={look ? <>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLook(null)}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveLook} disabled={!look.pick}>Open a claim</button>
      </> : null}>
        {look ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <form className="wc-row" onSubmit={runLook}>
              <input className="gc-input" value={look.q} onChange={(e) => setLook({ ...look, q: e.target.value })} aria-label="IMEI, serial, phone or order number" placeholder="IMEI, serial, phone or order number" data-autofocus="" style={{ fontFamily: 'var(--font-data)' }} />
              <button type="submit" className="ix-btn"><Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />Check warranty</button>
            </form>
            {look.hits && !look.hits.length ? <p className="gc-help" style={{ margin: 0 }} role="status">Nothing found for “{look.q.trim()}”. Check the number, or search by the customer’s phone.</p> : null}
            {look.hits && look.hits.length > 1 ? (
              <div className="wc-field" role="group" aria-label="Items">
                <span className="gc-label">Which item?</span>
                {look.hits.map((h) => <button key={h.key} type="button" className={'ix-btn' + (look.pick && look.pick.key === h.key ? ' ix-btn--primary' : '')} aria-pressed={!!look.pick && look.pick.key === h.key} onClick={() => setLook({ ...look, pick: h })} style={{ justifyContent: 'flex-start' }}>{h.name}{h.serials && h.serials.length ? ' · ' + h.serials.join(', ') : ''}</button>)}
              </div>
            ) : null}
            {look.pick ? (
              <div className={'wc-hit' + (look.pick.state === 'expired' || look.pick.state === 'none' ? ' wc-hit--out' : '')}>
                <div className="wc-hit__top">
                  <span><b>{look.pick.name}</b><small>{(look.pick.serials || []).join(', ')}</small></span>
                  <span className="wc-left"><span>{look.pick.state === 'active' || look.pick.state === 'ending' ? 'WITHIN WARRANTY' : look.pick.state === 'expired' ? 'WARRANTY ENDED' : 'NO WARRANTY'}</span>{look.pick.until ? <><b>{look.pick.days} days left</b><small>Ends {formatDate(look.pick.until)}</small></> : null}</span>
                </div>
                <dl className="ix-kv">
                  <dt>Customer</dt><dd>{look.pick.name2 || 'Walk-in customer'}{look.pick.phone && look.pick.phone !== '—' ? ' · ' + look.pick.phone : ''}</dd>
                  <dt>Sold</dt><dd>{look.pick.order || '—'}{look.pick.start ? ' · ' + formatDate(look.pick.start) : ''}</dd>
                  <dt>Policy (as sold)</dt><dd>{look.pick.label}{look.pick.claim ? ' · claim at ' + look.pick.claim : ''}</dd>
                </dl>
              </div>
            ) : null}
            {look.pick ? <label className="wc-field"><span className="gc-label">What is wrong with it</span><input className="gc-input" value={look.problem} onChange={(e) => setLook({ ...look, problem: e.target.value })} placeholder="For example: screen flickers" /></label> : null}
          </div>
        ) : null}
      </Dialog>

      {/* the claim: its steps, the decision, the next step */}
      <Sheet open={!!D} title={D ? D.id : ''} onClose={() => setSel('')} footer={D ? (
        rejecting != null ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRejecting(null)}>Back</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={reject}>Reject claim</button>
        </> : <>
          {isOpenClaim(D) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRejecting('')}>Reject</button> : null}
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={advance} disabled={!nextStep}>{nextStep ? 'Move to: ' + nextStep.label : 'Closed'}</button>
        </>) : null}>
        {D ? (<>
          <div className="wc-head">
            <StatusBadge tone={STEP_TONE[ds]}>{CLAIM_LABEL[ds]}</StatusBadge>
            <span>{D.item} · {D.name || 'Walk-in customer'}</span>
            <small>{(D.serials || []).join(', ')}</small>
          </div>
          {ds === 'rejected' ? <p className="wc-msg"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><span>Rejected: {D.reason}</span></p> : (
            <ol className="wc-steps">
              {CLAIM_STEPS.map((sp, i, all) => {
                const done = i < di, cur = i === di;
                const h = [...(D.history || [])].reverse().find((x) => (x.status === 'requested' ? 'received' : x.status) === sp.key);
                return (
                  <li key={sp.key} className={done || cur ? 'is-on' : ''}>
                    <span><span className={'wc-dot' + (done ? ' is-done' : cur ? ' is-cur' : '')}>{done ? <Icon name="check" width="12" height="12" strokeWidth="3" aria-hidden="true" /> : i + 1}</span>{i < all.length - 1 ? <span className={'wc-line' + (done ? ' is-done' : '')} /> : null}</span>
                    <span>{sp.label}{h ? <small>{formatDate(h.at)}{h.by ? ' · ' + h.by : ''}{h.note ? ' · ' + h.note : ''}</small> : null}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <div className="wc-box">
            <span><b>Issue:</b> {D.problem || '—'}</span>
            <span><b>Sold on:</b> {D.order || '—'}{D.phone ? ' · ' + D.phone : ''}</span>
          </div>
          {rejecting != null ? (
            <label className="wc-field"><span className="gc-label">Why is it rejected?</span><input className="gc-input" value={rejecting} onChange={(e) => setRejecting(e.target.value)} placeholder="For example: liquid damage is not covered" data-autofocus="" /></label>
          ) : isOpenClaim(D) ? (<>
            <label className="wc-field">
              <span className="gc-label">Decision</span>
              <select className="gc-input gc-select" value={decision} onChange={(e) => setDecision(e.target.value)}>{Object.entries(DECISIONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </label>
            {decision === 'replace' || decision === 'refund' ? <p className="gc-help" style={{ margin: 0 }}>A replacement or refund is done on <Link href={'/return-exchange' + (D.order ? '?ref=' + encodeURIComponent(D.order) : '')}>Return & exchange</Link>.</p> : null}
            <label className="wc-field"><span className="gc-label">Note for this step (optional)</span><input className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: sent to the Xiaomi service centre" /></label>
            {D.phone ? <div className="wc-msg"><Icon name="message-circle" width="16" height="16" aria-hidden="true" /><span>The customer is told at each step (Settings › Notifications).</span></div> : null}
          </>) : null}
        </>) : null}
      </Sheet>
    </div>
  );
}
