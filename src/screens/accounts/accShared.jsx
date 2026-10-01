'use client';
// accShared — pieces the Accounts pages share: the page frame, a hook that re-reads the books when
// money moves, money and date words, and the payout dialogs (reconcile a payout, withdraw from a
// partner wallet). The evening payout check (components/EveningCheck.jsx) uses the same dialogs.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT, formatDate } from '@/lib/format';
import { OWN_ACCOUNTS, accountBy, balanceOf, getEntries } from '@/lib/ledger';
import { clockNow, startOfDay, addWorkingDays, dayKey, fromKey, costsOf, confirmPayout, delayPayout, resolveReview, withdraw, closedReason } from '@/lib/settlements';

// ---- words --------------------------------------------------------------------------------------
/** ৳1,250 or ৳4,442.35 (decimals only when there are paisa). */
export const money = (n) => formatBDT(Math.abs(n), { decimals: Math.round(Math.abs(n) * 100) % 100 ? 2 : 0 });
export const signed = (n) => (n < 0 ? '−' : '+') + money(n);
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const shortDate = (t) => `${SHORT_DAYS[new Date(t).getDay()]} ${new Date(t).getDate()} ${new Date(t).toLocaleString('en', { month: 'short' })}`;
/** 'Today' · 'Tomorrow' · 'Sunday' (within the week) · 'Tue 13 Oct' */
export function dayLabel(t, now = clockNow()) {
  const diff = Math.round((startOfDay(t) - startOfDay(now)) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return new Date(t).toLocaleString('en', { weekday: 'long' });
  return shortDate(t);
}
/** For the middle of a sentence: 'today' · 'tomorrow' · 'on Sunday' · 'on Tue 13 Oct'. */
export function dayWords(t, now = clockNow()) {
  const l = dayLabel(t, now);
  return /^(Today|Tomorrow|Yesterday)$/.test(l) ? l.toLowerCase() : 'on ' + l;
}
/** '29 Sep' or '29–30 Sep' or '30 Sep – 1 Oct' for the days a payout's payments were taken. */
export function daysText(keys) {
  if (!keys.length) return '';
  const a = fromKey(keys[0]), b = fromKey(keys[keys.length - 1]);
  const d = (t) => new Date(t).getDate(), m = (t) => new Date(t).toLocaleString('en', { month: 'short' });
  if (a === b) return `${d(a)} ${m(a)}`;
  return m(a) === m(b) ? `${d(a)}–${d(b)} ${m(a)}` : `${d(a)} ${m(a)} – ${d(b)} ${m(b)}`;
}
export const accName = (id) => (accountBy(id) || { name: id }).name.replace(/ · 01\d{3}-\d{6}$/, '');
export const accBrand = (id) => (accountBy(id) || {}).brand;

/** Re-reads the books whenever money moves (ledger, settlements, setup). Returns a number that changes. */
export function useBooks() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((n) => n + 1);
    const on = () => setTick((n) => n + 1);
    window.addEventListener('gc:ledger', on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener('gc:ledger', on); window.removeEventListener('storage', on); };
  }, []);
  return tick;
}

// ---- page frame ---------------------------------------------------------------------------------
export const ACC_CSS = `
.ac-card{overflow:hidden}
.ac-card .gc-table th,.ac-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.ac-card .gc-table th:first-child,.ac-card .gc-table td:first-child{padding-left:var(--space-5)}
.ac-card .gc-table th:last-child,.ac-card .gc-table td:last-child{padding-right:var(--space-5)}
.ac-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.ac-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ac-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.ac-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.ac-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.ac-in{color:var(--text-success)}
.ac-out{color:var(--text-danger)}
.ac-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.ac-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ac-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ac-who{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.ac-who > span:last-child{min-width:0}
.ac-row-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:var(--space-2)}
.ac-form{display:flex;flex-direction:column;gap:var(--space-4)}
.ac-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.ac-sum{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.ac-sum > div{background:var(--surface-card);padding:var(--space-3) var(--space-4)}
.ac-sum dt{font-size:var(--text-xs);color:var(--text-muted)}
.ac-sum dd{margin:2px 0 0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ac-sum .is-key{background:var(--fill-primary-soft)}
.ac-sum .is-key dd{color:var(--primary)}
.ac-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.ac-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer;background:var(--surface-card)}
.ac-opt input{margin-top:3px;accent-color:var(--primary)}
.ac-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.ac-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ac-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ac-note{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);font-size:var(--text-xs);line-height:1.5}
.ac-note svg{flex:none;margin-top:1px}
.ac-note--ok{background:var(--fill-success-soft);color:var(--text-success)}
.ac-note--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.ac-note--info{background:var(--fill-info-soft);color:var(--text-info)}
.ac-note b{font-weight:var(--weight-semibold)}
.ac-details summary{cursor:pointer;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);list-style:none;display:inline-flex;align-items:center;gap:6px}
.ac-details summary::-webkit-details-marker{display:none}
.ac-details[open] summary svg{transform:rotate(90deg)}
.ac-mini{width:100%;border-collapse:collapse;margin-top:var(--space-2);font-size:var(--text-xs)}
.ac-mini th{font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;padding:6px 8px;border-bottom:1px solid var(--border-subtle)}
.ac-mini td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);color:var(--text-body)}
.ac-mini .ac-num{text-align:right}
.ac-scroll{max-height:220px;overflow:auto}
.ac-seg{display:inline-flex;padding:3px;gap:2px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
@media (max-width:640px){.ac-seg{max-width:100%;flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none}.ac-seg::-webkit-scrollbar{display:none}.ac-seg>*{flex:none}}
.ac-seg button{height:34px;padding:0 var(--space-4);border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ac-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.ac-logo-line{display:flex;align-items:center;gap:var(--space-3)}
.ac-logo-line b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ac-logo-line small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.ac-two{grid-template-columns:1fr}.ac-sum{grid-template-columns:1fr 1fr}}
`;

/** The shell around an Accounts page: menu, top bar and page header. */
export function AccPage({ screen, active, page, title, description, actions, children, css = '' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Accounts" page={page} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader title={title} description={description} actions={actions} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** A select of the shop's own accounts (not partner holding accounts), each with its balance. */
export function AccountSelect({ id, value, onChange, types, label = 'Account', exclude, describedBy }) {
  const list = OWN_ACCOUNTS().filter((a) => (!types || types.includes(a.type)) && a.id !== exclude);
  return (
    <div>
      <label className="gc-label" htmlFor={id}>{label}</label>
      <select id={id} className="gc-input gc-select" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy}>
        {['Bank', 'Mobile', 'Cash'].map((t) => {
          const group = list.filter((a) => a.type === t);
          return group.length ? <optgroup key={t} label={t === 'Mobile' ? 'Mobile wallets' : t}>{group.map((a) => <option key={a.id} value={a.id}>{accName(a.id)} · {money(balanceOf(a.id))}</option>)}</optgroup> : null;
        })}
      </select>
    </div>
  );
}

// ---- payout dialog ------------------------------------------------------------------------------
const REASONS = [
  ['fee', 'They took a higher fee', 'The difference is added to gateway and COD fees.'],
  ['charge', 'Return or extra delivery charge', 'The difference is added to delivery charges.'],
  ['later', 'The rest comes in a later payout', 'The difference stays with the partner and is expected next time.'],
  ['other', 'Something else', 'Recorded as a payout difference, so you can follow it up with them.'],
];
/** Pull "ref, amount" pairs out of pasted statement text (CSV or copied table). */
function parseStatement(text, items) {
  const found = [];
  let total = 0;
  text.split(/\r?\n/).forEach((line) => {
    const nums = (line.match(/-?\d[\d,]*\.?\d*/g) || []).map((x) => Number(x.replace(/,/g, ''))).filter((x) => !Number.isNaN(x));
    if (!nums.length) return;
    const amount = nums[nums.length - 1];
    const item = items.find((i) => i.ref && line.includes(i.ref));
    if (item) found.push(item.id);
    total += amount;
  });
  return { total: Math.round(total * 100) / 100, found };
}

/**
 * Reconcile one payout: it arrived (maybe with a different amount, explained with a reason), or it
 * has not arrived yet (ask again on a new date). A payout already in review only needs its reason.
 */
export function PayoutDialog({ pay, onClose, startWith = 'arrived' }) {
  const now = clockNow();
  const review = pay.status === 'review';
  const [mode, setMode] = useState(startWith);
  const [amount, setAmount] = useState(String(review ? pay.received : pay.net));
  const [account, setAccount] = useState(pay.account);
  const [reason, setReason] = useState('fee');
  const [statement, setStatement] = useState('');
  const nextDay = addWorkingDays(Math.max(now, pay.due), 1, pay.p.weekend);
  const [date, setDate] = useState(dayKey(nextDay));
  const received = Math.round((Number(amount) || 0) * 100) / 100;
  const diff = Math.round((pay.net - received) * 100) / 100;
  const parsed = useMemo(() => (statement.trim() ? parseStatement(statement, pay.items) : null), [statement, pay.items]);
  const missing = parsed ? pay.items.filter((i) => !parsed.found.includes(i.id)) : [];
  const dateClosed = date ? closedReason(fromKey(date), pay.p.weekend) : '';

  const useStatement = () => { if (parsed) setAmount(String(parsed.total)); };
  const save = (e) => {
    e.preventDefault();
    if (review) {
      resolveReview(pay, { reason });
      toast(`${pay.p.short} payout closed · ${money(Math.abs(pay.net - pay.received))} ${REASONS.find((r) => r[0] === reason)[1].toLowerCase()}`);
      onClose(true); return;
    }
    if (mode === 'later') {
      if (!date || fromKey(date) < startOfDay(now)) { toast('Pick today or a later date', { tone: 'error' }); return; }
      delayPayout(pay, date);
      toast(`We will ask about the ${pay.p.short} payout again on ${shortDate(fromKey(date))} evening`);
      onClose(true); return;
    }
    if (!(received > 0)) { toast('Enter the amount that arrived', { tone: 'error' }); return; }
    confirmPayout(pay, { received, account, reason: diff ? reason : '' });
    toast(diff ? `${money(received)} from ${pay.p.short} recorded in ${accName(account)} · ${money(Math.abs(diff))} ${diff > 0 ? 'short' : 'extra'} noted` : `${money(received)} from ${pay.p.short} recorded in ${accName(account)} · matches`);
    onClose(true);
  };

  const footer = (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button>
      <button type="submit" form="payout-form" className="gc-btn gc-btn--solid">{review ? 'Close this payout' : mode === 'later' ? 'Save new date' : 'Record payout'}</button>
    </>
  );
  return (
    <Dialog open title={`${pay.p.short} payout`} onClose={() => onClose(false)} footer={footer} width={680}>
      <form id="payout-form" className="ac-form" onSubmit={save}>
        <div className="ac-logo-line">
          <BrandLogo brand={pay.p.brand} size={44} />
          <span><b>{pay.p.name}</b><small>{pay.items.length} payment{pay.items.length === 1 ? '' : 's'} from {daysText(pay.days)} · {review ? 'arrived' : 'due'} {dayWords(pay.due, now)} · into {accName(pay.account)}</small></span>
        </div>
        <dl className="ac-sum" style={{ margin: 0 }}>
          <div><dt>Collected</dt><dd>{money(pay.gross)}</dd></div>
          <div><dt>{pay.p.kind === 'Courier' ? 'COD fee' : 'Gateway fee'}</dt><dd>−{money(pay.fee)}</dd></div>
          <div><dt>Delivery charges</dt><dd>{pay.charge ? '−' + money(pay.charge) : '—'}</dd></div>
          <div className="is-key"><dt>Should arrive</dt><dd>{money(pay.net)}</dd></div>
        </dl>
        <details className="ac-details">
          <summary><Icon name="chevron-right" width="14" height="14" aria-hidden="true" /> See the {pay.items.length} payment{pay.items.length === 1 ? '' : 's'}</summary>
          <div className="ac-scroll">
            <table className="ac-mini">
              <thead><tr><th scope="col">Order / payment</th><th scope="col">Customer</th><th scope="col">Taken</th><th scope="col" className="ac-num">Amount</th><th scope="col" className="ac-num">Fee + charge</th><th scope="col" className="ac-num">Net</th></tr></thead>
              <tbody>{pay.items.map((i) => { const c = costsOf(i, pay.p); return <tr key={i.id}><td className="ac-id">{i.ref || i.id}</td><td>{i.party}</td><td>{shortDate(i.at)}</td><td className="ac-num">{money(i.gross)}</td><td className="ac-num">−{money(c.fee + c.charge)}</td><td className="ac-num ac-strong">{money(c.net)}</td></tr>; })}</tbody>
            </table>
          </div>
        </details>

        {review ? (
          <>
            <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>{money(pay.received)} arrived</b> in {accName(pay.account)}, {money(Math.abs(pay.net - pay.received))} {pay.net > pay.received ? 'less' : 'more'} than expected. Tell us why and the payout is closed.</span></div>
            <ReasonPicker value={reason} onChange={setReason} />
          </>
        ) : (
          <>
            <div className="ac-seg" role="group" aria-label="Did it arrive?">
              <button type="button" aria-pressed={mode === 'arrived'} onClick={() => setMode('arrived')}>It arrived</button>
              <button type="button" aria-pressed={mode === 'later'} onClick={() => setMode('later')}>Not yet</button>
            </div>
            {mode === 'arrived' ? (
              <>
                <div className="ac-two">
                  <div><label className="gc-label" htmlFor="po-amount">Amount that arrived (৳)</label><input id="po-amount" className="gc-input ac-fig" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus /></div>
                  <AccountSelect id="po-account" label="Arrived in" value={account} onChange={setAccount} types={['Bank', 'Mobile']} />
                </div>
                {diff === 0 ? <div className="ac-note ac-note--ok" role="status"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span><b>Matches.</b> The payout is closed and {accName(account)} goes up by {money(received)}.</span></div>
                  : received > 0 ? <><div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>{money(Math.abs(diff))} {diff > 0 ? 'less' : 'more'} than expected.</b> What happened?</span></div><ReasonPicker value={reason} onChange={setReason} /></> : null}
                <details className="ac-details">
                  <summary><Icon name="chevron-right" width="14" height="14" aria-hidden="true" /> Match with the partner’s statement</summary>
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <label className="gc-label" htmlFor="po-statement">Paste the statement rows (order number and amount on each line)</label>
                    <textarea id="po-statement" className="gc-input" rows={4} style={{ height: 'auto', padding: '10px 12px', fontFamily: 'var(--font-data)' }} placeholder={'#136815, 1,970.45\n#136816, 3,180.00'} value={statement} onChange={(e) => setStatement(e.target.value)} />
                    {parsed ? (
                      <div className={'ac-note ' + (missing.length ? 'ac-note--warn' : 'ac-note--ok')} style={{ marginTop: 'var(--space-2)' }}>
                        <Icon name={missing.length ? 'triangle-alert' : 'circle-check'} width="16" height="16" aria-hidden="true" />
                        <span><b>{parsed.found.length} of {pay.items.length} payments found</b>, statement total {money(parsed.total)}.{missing.length ? ` Missing: ${missing.map((i) => `${i.ref || i.id} (${money(i.gross)})`).join(', ')}.` : ''} <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" style={{ marginLeft: 6 }} onClick={useStatement}>Use this total</button></span>
                      </div>
                    ) : null}
                  </div>
                </details>
              </>
            ) : (
              <>
                <div className="ac-two">
                  <div><label className="gc-label" htmlFor="po-date">When did they say it will come?</label><input id="po-date" type="date" className="gc-input" value={date} min={dayKey(now)} onChange={(e) => setDate(e.target.value)} aria-describedby="po-date-help" /></div>
                </div>
                <p id="po-date-help" className="gc-help" style={{ margin: 0 }}>{dateClosed ? `${shortDate(fromKey(date))} is ${/day$/.test(dateClosed) ? 'a ' + dateClosed : dateClosed}; ${pay.p.short} usually pays on working days. ` : ''}We will ask again on that day at the evening check. Until then it shows as delayed.</p>
              </>
            )}
          </>
        )}
      </form>
    </Dialog>
  );
}

function ReasonPicker({ value, onChange }) {
  return (
    <div className="ac-opts" role="radiogroup" aria-label="Reason for the difference">
      {REASONS.map(([id, label, help]) => (
        <label key={id} className={'ac-opt' + (value === id ? ' is-on' : '')}>
          <input type="radio" name="po-reason" checked={value === id} onChange={() => onChange(id)} />
          <span><b>{label}</b><small>{help}</small></span>
        </label>
      ))}
    </div>
  );
}

/** Withdraw money waiting in a partner wallet (EPS) to one of the shop's accounts. */
export function WithdrawDialog({ wallet, onClose }) {
  const [amount, setAmount] = useState(String(wallet.net));
  const [account, setAccount] = useState(wallet.p.to);
  const save = (e) => {
    e.preventDefault();
    const amt = Number(amount) || 0;
    if (!(amt > 0) || amt > wallet.net + 0.001) { toast(`Enter up to ${money(wallet.net)}`, { tone: 'error' }); return; }
    const done = withdraw(wallet.partner, { amount: amt, account });
    if (!done) { toast('That is less than the smallest payment waiting. Withdraw a bit more.', { tone: 'error' }); return; }
    toast(`${money(done.net)} withdrawn from ${wallet.p.short} to ${accName(account)}`);
    onClose(true);
  };
  return (
    <Dialog open title={`Withdraw from ${wallet.p.short}`} onClose={() => onClose(false)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="wd-form" className="gc-btn gc-btn--solid">Record withdrawal</button></>}>
      <form id="wd-form" className="ac-form" onSubmit={save}>
        <div className="ac-logo-line"><BrandLogo brand={wallet.p.brand} size={44} /><span><b>{money(wallet.net)} ready to withdraw</b><small>{wallet.items.length} payments since {formatDate(wallet.since)} · {money(wallet.gross)} collected, {money(wallet.fee)} fee</small></span></div>
        <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Withdraw in the {wallet.p.short} merchant panel first, then record it here with the amount the panel shows.</span></div>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="wd-amount">Amount withdrawn (৳)</label><input id="wd-amount" className="gc-input ac-fig" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus /></div>
          <AccountSelect id="wd-account" label="Into" value={account} onChange={setAccount} types={['Bank', 'Mobile']} />
        </div>
      </form>
    </Dialog>
  );
}

/** Balance of a list of account ids. */
export const sumOf = (ids, entries = getEntries()) => ids.reduce((a, id) => a + balanceOf(id, entries), 0);
