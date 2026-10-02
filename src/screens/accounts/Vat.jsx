'use client';
// Vat — Accounts › Setup › VAT: what the shop collected on sales, what it paid on purchases and what it owes
// the government this month, the VAT rate per category, and the monthly return (Mushak-9.1). A setup page in the
// Shopify style (docs/shopify-style.md): a back arrow to Accounts setup, the month, four figures, the rates
// card and the return card; the sample VAT invoice (Mushak-6.3) opens from the header. A shop that is not
// VAT-registered sees the turnover-tax rules instead.
// The rates and the "not registered" switch are kept (lib/vat.js), and the POS register charges VAT from them.
// Front end only: the sales, purchases and return are demo figures for July–September 2026.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, InfoTip, StatusBadge } from '@/components/ui';
import { MetricStrip, Menu } from '@/components/ui/IndexKit';
import { loadVat, saveVat } from '@/lib/vat';
import { AccPage } from './accShared';

// ---- demo figures ---------------------------------------------------------------------------------
function money(n) { let s = String(Math.round(Math.abs(n))); const last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return (n < 0 ? '−' : '') + '৳' + s; }
function m2(n) { const x = Math.round(n * 100); const ip = Math.floor(x / 100), dp = x % 100; return money(ip) + '.' + (dp < 10 ? '0' : '') + dp; }
const pct = (r) => String(r) + '%';
// month: key, name, share of September's sales, VAT paid on purchases, paid note, last date to pay
const MON = [['jul', 'July', 1162800 / 1286400, 28900, 'Paid · 14 Aug', '15 Aug'], ['aug', 'August', 1244100 / 1286400, 30100, 'Paid · 13 Sep', '15 Sep'], ['sep', 'September', 1, 31240, '', '15 Oct']];
// category: key, name, default rate, VAT included in the price, September sales
const CATS = [['rice', 'Cables & chargers', 0, true, 482000], ['oil', 'Cases & covers', 5, true, 246500], ['soap', 'Screen care', 7.5, true, 158400], ['snack', 'Audio', 5, true, 112300], ['drink', 'Power banks', 5, true, 64900], ['cloth', 'Clothing', 7.5, false, 134300], ['elec', 'Electronics', 15, false, 88000]];
const RATES = [0, 5, 7.5, 15];
// the sample memo on the VAT invoice: item, qty, price, VAT rate
const ITEMS = [['20W USB-C fast charger', 1, 890, 5], ['Lightning cable 1 m', 2, 135, 0], ['Micro-USB cable 1 m', 2, 145, 0], ['Screen cleaning wipes', 4, 65, 7.5], ['Shockproof case A15', 2, 180, 7.5], ['Cleaning spray 100 ml', 1, 240, 7.5], ['Cable protector pack', 4, 35, 5]];
const TIERS = [['Under ৳50 lakh a year', 'Usually no VAT or turnover tax', false], ['৳50 lakh to ৳3 crore', 'Turnover tax — 4% of sales, return every 3 months (Mushak-9.2)', true], ['Over ৳3 crore', 'VAT registration is required', false]];
const Q3 = 1162800 + 1244100 + 1286400;
const ABOUT = 'What you collected, what you paid suppliers, and what you owe the government';

const CSS = `
.vt-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.vt-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3)}
.vt-switch{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.vt-inc{display:inline-flex;align-items:center;gap:var(--space-2);color:var(--text-body)}
.vt-rate{width:96px}
.vt-checks{list-style:none;margin:0;padding:0}
.vt-check{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);min-height:44px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.vt-check>span:first-child{flex:1 1 220px;min-width:0}
.vt-check b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.vt-check small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.vt-warn{display:flex;gap:var(--space-2);align-items:flex-start;margin:0;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-warning)}
.vt-warn svg{flex:none;margin-top:1px}
.vt-tiers{list-style:none;margin:0;padding:0}
.vt-tier{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.vt-tier:first-child{border-top:0}
.vt-tier b{flex:0 0 200px;font-weight:var(--weight-semibold);color:var(--text-heading)}
.vt-tier span{flex:1 1 240px;min-width:0;color:var(--text-body)}
.vt-tier.is-you b{color:var(--primary)}
.vt-calc{display:flex;flex-direction:column;gap:4px;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.vt-calc span{font-size:var(--text-xs);color:var(--text-muted)}
.vt-calc b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-warning)}
.vt-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}
.vt-row b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.vt-row small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.vt-body{display:flex;flex-direction:column;gap:var(--space-3)}
.vt-rcpt{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);font-size:var(--text-sm);color:var(--text-heading)}
.vt-rcpt__c{text-align:center;line-height:1.5}
.vt-rcpt__c small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.vt-rcpt__shop{padding-bottom:var(--space-2);border-bottom:1px dashed var(--border-strong)}
.vt-rcpt__facts{display:grid;grid-template-columns:auto 1fr;gap:2px var(--space-3);margin:0}
.vt-rcpt__facts dt{color:var(--text-muted)}
.vt-rcpt__facts dd{margin:0}
.vt-rcpt table{width:100%;border-collapse:collapse}
.vt-rcpt th{padding:4px 0;border-top:1px solid var(--text-heading);border-bottom:1px solid var(--text-heading);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-align:left}
.vt-rcpt td{padding:3px 0}
.vt-rcpt .r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.vt-rcpt__tot{gap:2px var(--space-3);padding-top:var(--space-2);border-top:1px solid var(--text-heading)}
.vt-rcpt__foot{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.vt-rcpt__foot span:last-child{min-width:120px;padding-top:2px;border-top:1px solid var(--border-strong);text-align:center}
@media (max-width:640px){.vt-tier b{flex-basis:100%}.vt-rate{width:84px}}
`;

export default function Vat() {
  const [rates, setRates] = useState({});
  const [nr, setNr] = useState(false);
  const [inc, setInc] = useState({});
  const [mon, setMon] = useState('sep');
  const [paidCh, setPaidCh] = useState(false);
  const [totSw, setTotSw] = useState(true);
  const [receipt, setReceipt] = useState(false);
  const loaded = useRef(false);

  // the rates and the "not registered" switch are kept, and the POS register charges VAT from them
  useEffect(() => { const saved = loadVat(); setRates(saved.rates || {}); setNr(!!saved.notReg); loaded.current = true; }, []);
  useEffect(() => { if (loaded.current) saveVat({ rates: rates || {}, notReg: !!nr }); }, [rates, nr]);

  const M = MON.find((m) => m[0] === mon) || MON[2];
  const isCur = mon === 'sep';
  const paid = paidCh || !isCur;
  let totSales = 0, out = 0;
  const rows = CATS.map((c) => {
    const r = rates[c[0]] == null ? c[2] : rates[c[0]];
    const ic = inc[c[0]] == null ? c[3] : inc[c[0]];
    const sales = Math.round(c[4] * M[2]);
    const v = Math.round(ic ? sales * r / (100 + r) : sales * r / 100);
    totSales += sales; out += v;
    return { key: c[0], label: c[1], rate: r, inc: ic, sales, vat: v };
  });
  const inp = M[3], pay = Math.max(0, out - inp);
  let rcVat = 0, rcTot = 0;
  const items = ITEMS.map((x) => { const amt = x[1] * x[2], v = amt * x[3] / (100 + x[3]); rcVat += v; rcTot += amt; return { label: x[0], rate: pct(x[3]), qty: x[1], amt: money(amt), vat: x[3] ? m2(v) : '—' }; });
  const checks = [
    ['Sales records', 'Built from 1,688 memos', true, false],
    ['Purchase records', 'From 42 supplier invoices', true, false],
    ['Treasury challan', paid ? (isCur ? 'Challan no. 2610-004873 · ' + money(pay) : 'Paid · ' + money(pay)) : 'Pay at the bank or online, then enter the challan number', paid, !paid],
  ];

  const printInv = () => toast('Printing Mushak-6.3 invoice for memo #1042', { tone: 'info' });
  const dlXls = () => toast('Downloading the Mushak-9.1 report as Excel…', { tone: 'info' });
  const dlPdf = () => toast('Downloading the Mushak-9.1 report as PDF…', { tone: 'info' });
  const markPaid = () => { setPaidCh(true); toast('Treasury challan marked as paid. The return is ready.'); };

  return (
    <AccPage screen="Vat" active="acc-setup" page="VAT" title="VAT" css={CSS} back="/account-setup?tab=advanced" backLabel="Accounts setup" narrow about={ABOUT}
      placeholder="Search products, customers or memo no."
      secondary={nr ? [] : [{ label: 'VAT invoice (Mushak-6.3)', onClick: () => setReceipt(true) }]}
      more={nr ? [] : [{ label: 'Download report · Excel', onClick: dlXls }, { label: 'Download report · PDF', onClick: dlPdf }]}>

      <div className="vt-bar">
        {nr ? <span /> : (
          <select className="ix-pick" aria-label="Month" value={mon} onChange={(e) => setMon(e.target.value)}>
            {MON.map((m) => <option key={m[0]} value={m[0]}>{m[1]}</option>)}
          </select>
        )}
        <label className="vt-switch" htmlFor="vt-notreg">
          <button id="vt-notreg" type="button" role="switch" aria-checked={nr} className="gc-switch" onClick={() => setNr(!nr)}><span className="gc-switch__knob" /></button>
          <span>My shop is not VAT-registered</span>
        </label>
      </div>

      {!nr ? (<>
        <MetricStrip label={'VAT · ' + M[1]} items={[
          { label: 'VAT collected on sales', value: money(out), sub: 'Taken from customers' },
          { label: 'VAT paid on purchases', value: money(inp), sub: 'Deducted' },
          { label: 'To pay this month', value: money(pay), sub: 'Collected − paid' },
          { label: 'Last date to pay', value: M[5], sub: isCur ? '16 days left' : M[4] },
        ]} />

        <section className="ix-card" aria-labelledby="vt-rates">
          <header className="ix-card__head"><h2 id="vt-rates">VAT rate by category <InfoTip text={'Change a rate or the "included" switch and the totals above update. VAT paid on supplier invoices is deducted from what you collected.'} /></h2></header>
          <div className="ix-table-wrap ix-table-wrap--show" style={{ marginTop: 'var(--space-3)' }}>
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">VAT rate by category, {M[1]}</caption>
              <thead><tr><th scope="col">Category</th><th scope="col">Rate</th><th scope="col">VAT in price?</th><th scope="col" className="ix-num">Sales</th><th scope="col" className="ix-num">VAT</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="ix-strong">{r.label}</td>
                    <td>
                      <select className="ix-pick vt-rate" value={String(r.rate)} aria-label={`Rate ${r.label}`} onChange={(e) => setRates({ ...rates, [r.key]: parseFloat(e.target.value) || 0 })}>
                        {RATES.map((x) => <option key={x} value={String(x)}>{pct(x)}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className="vt-inc"><button type="button" role="switch" aria-checked={r.inc} aria-label={`VAT in price? ${r.label}`} className="gc-switch" onClick={() => setInc({ ...inc, [r.key]: !r.inc })}><span className="gc-switch__knob" /></button>{r.inc ? 'Yes' : 'No, added on top'}</span>
                    </td>
                    <td className="ix-num vt-fig">{money(r.sales)}</td>
                    <td className={'ix-num vt-fig' + (r.vat ? ' ix-strong' : ' ix-muted')}>{r.vat ? money(r.vat) : '—'}</td>
                  </tr>
                ))}
                <tr className="ac-grp"><th scope="row" colSpan={3}>Total</th><td className="ix-num vt-fig">{money(totSales)}</td><td className="ix-num vt-fig">{money(out)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="ix-card" aria-labelledby="vt-return">
          <header className="ix-card__head">
            <div><h2 id="vt-return">Monthly return (Mushak-9.1)</h2><p className="ix-card__sub">Return for {M[1]} · file by {M[5]}</p></div>
            <Menu label="Download report" cls="ix-btn ix-btn--sm" items={[{ label: 'Excel', onClick: dlXls }, { label: 'PDF', onClick: dlPdf }]} />
          </header>
          <div style={{ height: 'var(--space-3)' }} />
          <ul className="vt-checks">
            {checks.map(([label, sub, ok, canMark]) => (
              <li key={label} className="vt-check">
                <span><b>{label}</b><small className="vt-fig">{sub}</small></span>
                <StatusBadge tone={ok ? 'success' : 'warning'}>{ok ? 'Ready' : 'Pending'}</StatusBadge>
                {canMark ? <button type="button" className="ix-btn ix-btn--sm" onClick={markPaid}><Icon name="check" width="16" height="16" aria-hidden="true" />Mark as paid</button> : null}
              </li>
            ))}
          </ul>
          <p className="vt-warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>These figures come from your own records. Check them with a VAT consultant before you file the return.</span></p>
        </section>
      </>) : (
        <section className="ix-card" aria-labelledby="vt-nr">
          <header className="ix-card__head"><h2 id="vt-nr">If your shop is not VAT-registered <InfoTip text="Then do not charge customers VAT — memos will not show VAT either. What applies depends on your yearly sales." /></h2></header>
          <div className="ix-card__body vt-body">
            <ul className="vt-tiers">
              {TIERS.map(([range, rule, you]) => (
                <li key={range} className={'vt-tier' + (you ? ' is-you' : '')}>
                  <b className="vt-fig">{range}</b><span>{rule}</span>{you ? <StatusBadge tone="info" icon="store">Your shop</StatusBadge> : null}
                </li>
              ))}
            </ul>
            <div className="vt-calc">
              <span>What turnover tax could be</span>
              <span className="vt-fig">Sales in the last 3 months {money(Q3)} × 4%</span>
              <b>About {money(Q3 * 0.04)}</b>
            </div>
            <div className="vt-row">
              <span><b>Keep turnover tax records</b><small>Shows what is due every 3 months</small></span>
              <button type="button" role="switch" aria-checked={totSw} aria-label="Keep turnover tax records" className="gc-switch" onClick={() => setTotSw(!totSw)}><span className="gc-switch__knob" /></button>
            </div>
          </div>
          <p className="vt-warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>Rules can change. Ask a VAT consultant which one applies to your shop.</span></p>
        </section>
      )}

      <Dialog open={receipt} title="VAT invoice (Mushak-6.3)" onClose={() => setReceipt(false)} width={460}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setReceipt(false)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={printInv}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print</button></>}>
        <p className="gc-help" style={{ margin: '0 0 var(--space-3)' }}>Memo #1042 · Rafiq Mia · today 10:42 AM</p>
        <div className="vt-rcpt">
          <div className="vt-rcpt__c"><small>Mushak-6.3</small><b>Tax invoice</b></div>
          <div className="vt-rcpt__c vt-rcpt__shop"><b>GridShop</b><small>House 12, Road 3, Mirpur-10, Dhaka</small><small className="vt-fig">BIN: 000123456-0101</small></div>
          <dl className="vt-rcpt__facts">
            <dt>Invoice no.</dt><dd className="vt-fig">#1042</dd>
            <dt>Date & time</dt><dd className="vt-fig">29/09/2026, 10:42 AM</dd>
            <dt>Buyer</dt><dd className="vt-fig">Rafiq Mia · 01812-345678</dd>
          </dl>
          <table>
            <thead><tr><th scope="col">Item</th><th scope="col" className="r">Qty</th><th scope="col" className="r">Price</th><th scope="col" className="r">VAT</th></tr></thead>
            <tbody>{items.map((it) => <tr key={it.label}><td>{it.label} <span className="ix-muted">{it.rate}</span></td><td className="r">{it.qty}</td><td className="r">{it.amt}</td><td className="r ix-muted">{it.vat}</td></tr>)}</tbody>
          </table>
          <dl className="ix-sum vt-rcpt__tot">
            <dt>Price without VAT</dt><dd className="vt-fig">{m2(rcTot - rcVat)}</dd>
            <dt>Total VAT</dt><dd className="vt-fig">{m2(rcVat)}</dd>
            <dt className="is-total">Grand total</dt><dd className="is-total vt-fig">{m2(rcTot)}</dd>
          </dl>
          <div className="vt-rcpt__foot"><span>Prices include VAT</span><span>Seller’s signature</span></div>
        </div>
      </Dialog>
    </AccPage>
  );
}
