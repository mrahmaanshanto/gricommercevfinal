'use client';
// Money — every account the shop keeps money in (cash, counter drawers, safe, banks, mobile wallets)
// and every taka that moved in or out of it, in one place. It replaces the old Cash book, Money book
// and Transactions pages.
//   left   the accounts with their balances, grouped; "With partners" links to Settlements
//   right  the chosen account (or all): money in / out, and the movements with a running balance
//   Add money · Take money out · Move money between accounts
// ?account=<id> · ?type=Cash|Bank|Mobile · ?do=in|out|transfer (&from=<id>) opens that form
// Front end only: balances are opening + every entry in lib/ledger.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { OWN_ACCOUNTS, HOLDING_ACCOUNTS, accountBy, getEntries, balanceOf, postEntry, transferBetween, KIND_LABEL } from '@/lib/ledger';
import { clockNow, dayKey, startOfDay } from '@/lib/settlements';
import { AccPage, AccountSelect, useBooks, money, signed, shortDate, accName } from './accShared';

const TYPES = [['Cash', 'Cash'], ['Bank', 'Banks'], ['Mobile', 'Mobile wallets']];
const PAGE = 60;
const KIND_TONE = { sale: 'success', 'invoice payment': 'info', 'order payment': 'info', settlement: 'primary', refund: 'error', 'supplier payment': 'warning', expense: 'warning', salary: 'warning', 'owner withdraw': 'slate', investment: 'success', 'paid out': 'warning', 'cash pickup': 'slate', 'cash in': 'slate', transfer: 'slate' };
const IN_REASONS = [['investment', 'Owner put money in'], ['cash in', 'Other money in (loan, refund from a supplier …)']];
const OUT_REASONS = [['owner withdraw', 'Owner took money'], ['expense', 'Bank or wallet charge'], ['paid out', 'Other money out']];

const CSS = `
.mo-grid{display:grid;grid-template-columns:320px minmax(0,1fr);gap:var(--space-5);align-items:start}
.mo-list{position:sticky;top:var(--space-4)}
.mo-total{padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.mo-total span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mo-total b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mo-gh{display:flex;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-5) var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.mo-gh span:last-child{font-family:var(--font-data)}
.mo-acc{display:flex;align-items:center;gap:var(--space-3);width:100%;padding:var(--space-2) var(--space-5);border:0;border-left:3px solid transparent;background:none;font:inherit;text-align:left;cursor:pointer;color:inherit;text-decoration:none}
.mo-acc:hover{background:var(--surface-subtle)}
.mo-acc.is-on{background:var(--fill-primary-soft);border-left-color:var(--primary)}
.mo-acc:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.mo-acc__name{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-acc__bal{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.mo-sep{height:1px;margin:var(--space-2) 0;background:var(--border-subtle)}
.mo-hero{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4);padding:var(--space-5)}
.mo-hero__fig{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.2}
.mo-hero__meta{flex:1;min-width:200px}
.mo-hero__meta p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.mo-hero__meta h2{margin:0 0 2px;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mo-flows{display:flex;gap:var(--space-5)}
.mo-flows span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mo-flows b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.mo-filters{display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:flex-end;padding:0 var(--space-5) var(--space-2)}
.mo-filters > div{flex:1 1 150px;min-width:0}
.mo-filters > div:first-child{flex-basis:200px}
.mo-moves{display:flex;align-items:center;gap:var(--space-2);padding:0 var(--space-5) var(--space-4);font-size:var(--text-xs);color:var(--text-body);cursor:pointer;width:fit-content;max-width:100%;box-sizing:border-box}
.mo-moves input{accent-color:var(--primary)}
.mo-table td{white-space:normal;vertical-align:top}
.mo-table td.ac-num,.mo-table td:first-child{white-space:nowrap}
.mo-table .ac-who span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px}
.mo-table .gc-badge{white-space:nowrap}
.mo-more{display:flex;justify-content:center;padding:var(--space-3)}
@media (max-width:1100px){.mo-grid{grid-template-columns:minmax(0,1fr)}.mo-list{position:static}}
@media (max-width:640px){
  /* the accounts list above already shows "All your accounts" and its total: don't repeat it */
  .mo-hero--all > span:first-child,.mo-hero--all .mo-hero__meta{display:none!important}
  .mo-hero--all{padding-bottom:var(--space-3)}
  /* table-cards: the account (logo + name) sits on the right like the other values */
  .mo-table.gc-cards-on .ac-who{justify-content:flex-end}
}
`;

export default function Money() {
  const tick = useBooks();
  const [account, setAccount] = useState('');
  const [type, setType] = useState('');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [moves, setMoves] = useState(false);   // show moves between the shop's own accounts in the all-accounts view
  const [form, setForm] = useState(null);   // { mode: 'in'|'out'|'transfer', ... }
  const booted = useRef(false);

  useEffect(() => {
    if (!tick || booted.current) return;
    booted.current = true;
    const u = new URL(window.location.href);
    const acc = accountBy(u.searchParams.get('account') || '');
    if (acc && acc.type !== 'Holding') setAccount(acc.id);
    const t = u.searchParams.get('type');
    if (!acc && TYPES.some((x) => x[0] === t)) setType(t);
    const act = u.searchParams.get('do');
    if (['in', 'out', 'transfer'].includes(act)) {
      openForm(act, u.searchParams.get('from') || (acc && acc.id));
      u.searchParams.delete('do'); u.searchParams.delete('from');
      window.history.replaceState(window.history.state, '', u.pathname + u.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const pick = (id, t = '') => {
    setAccount(id); setType(t); setLimit(PAGE);
    const u = new URL(window.location.href);
    u.searchParams.delete('account'); u.searchParams.delete('type');
    if (id) u.searchParams.set('account', id); else if (t) u.searchParams.set('type', t);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const d = useMemo(() => {
    const entries = getEntries();
    const own = OWN_ACCOUNTS();
    const bal = Object.fromEntries(own.map((a) => [a.id, balanceOf(a.id, entries)]));
    const held = HOLDING_ACCOUNTS().reduce((s, a) => s + balanceOf(a.id, entries), 0);
    return { entries: entries.filter((e) => own.some((a) => a.id === e.account)), own, bal, held };
  }, [tick]);

  const ids = account ? [account] : type ? d.own.filter((a) => a.type === type).map((a) => a.id) : d.own.map((a) => a.id);
  const scope = d.entries.filter((e) => ids.includes(e.account));
  const fromAt = from ? startOfDay(new Date(from + 'T00:00:00').getTime()) : null;
  const toAt = to ? startOfDay(new Date(to + 'T00:00:00').getTime()) + 864e5 : null;
  const words = q.trim().toLowerCase();
  const INTERNAL = ['transfer', 'cash pickup', 'cash in'];
  const hideMoves = !account && !moves && !kind;
  const shown = scope.filter((e) => (!hideMoves || !INTERNAL.includes(e.kind)) && (!kind || e.kind === kind) && (fromAt == null || e.at >= fromAt) && (toAt == null || e.at < toAt)
    && (!words || [e.party, e.note, e.ref, e.cat, KIND_LABEL[e.kind], e.by].join(' ').toLowerCase().includes(words)));
  // running balance after each movement, for one account (newest first)
  const running = {};
  if (account) { let b = d.bal[account] || 0; scope.forEach((e) => { running[e.id] = b; b -= e.amount; }); }
  const monthStart = new Date(clockNow()); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const inScope = shown.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const outScope = shown.filter((e) => e.amount < 0).reduce((s, e) => s - e.amount, 0);
  const kinds = [...new Set(scope.map((e) => e.kind))].sort();
  const acc = account ? accountBy(account) : null;
  const scopeBalance = ids.reduce((s, id) => s + (d.bal[id] || 0), 0);
  const filtered = !!(kind || q || from || to);

  function openForm(mode, fromId) {
    const first = fromId || account || (mode === 'in' ? 'cash-shop' : 'cash-shop');
    const other = first === 'safe' ? 'brac' : 'safe';
    setForm({ mode, account: first, to: other, reason: mode === 'in' ? 'investment' : 'owner withdraw', amount: '', note: '', date: dayKey(clockNow()), tried: false });
  }
  const save = (e) => {
    e.preventDefault();
    const amt = Math.round((Number(form.amount) || 0) * 100) / 100;
    if (!(amt > 0)) { setForm({ ...form, tried: true }); return; }
    const at = form.date === dayKey(clockNow()) ? undefined : new Date(form.date + 'T12:00:00').getTime();
    const meta = { note: form.note.trim(), by: 'Staff', ...(at ? { at } : {}) };
    if (form.mode === 'transfer') {
      if (form.account === form.to) { toast('Pick two different accounts', { tone: 'error' }); return; }
      transferBetween(form.account, form.to, amt, { ...meta, party: accName(form.to), note: meta.note || `${accName(form.account)} → ${accName(form.to)}` });
      toast(`${money(amt)} moved from ${accName(form.account)} to ${accName(form.to)}`);
    } else {
      const sign = form.mode === 'in' ? 1 : -1;
      const label = (form.mode === 'in' ? IN_REASONS : OUT_REASONS).find((r) => r[0] === form.reason)[1];
      postEntry({ ...meta, account: form.account, amount: sign * amt, kind: form.reason, party: form.reason === 'investment' || form.reason === 'owner withdraw' ? 'Owner' : label, ...(form.reason === 'expense' ? { cat: 'Bank charges' } : {}) });
      toast(`${money(amt)} ${form.mode === 'in' ? 'added to' : 'taken out of'} ${accName(form.account)}`);
    }
    setForm(null);
  };
  const outOver = form && form.mode !== 'in' && Number(form.amount) > (d.bal[form.account] || 0);

  const actions = (<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => openForm('in')}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add money</button>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => openForm('out')}><Icon name="minus" width="18" height="18" aria-hidden="true" /> Take out</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => openForm('transfer')}><Icon name="arrow-left-right" width="18" height="18" aria-hidden="true" /> Move money</button>
        </>
  );
  if (!tick) return <AccPage screen="Money" active="acc-money" page="Money" title="Money" css={CSS} description="Every account the shop keeps money in, and every taka in or out: sales, payments, payouts, expenses and transfers." actions={actions} />;

  const accRow = (a) => (
    <button key={a.id} type="button" className={'mo-acc' + (account === a.id ? ' is-on' : '')} aria-pressed={account === a.id} onClick={() => pick(a.id)}>
      <BrandLogo brand={a.brand} size={32} decorative />
      <span className="mo-acc__name">{accName(a.id)}</span>
      <span className="mo-acc__bal">{money(d.bal[a.id] || 0)}</span>
    </button>
  );

  return (
    <AccPage screen="Money" active="acc-money" page="Money" title="Money" css={CSS}
      description="Every account the shop keeps money in, and every taka in or out: sales, payments, payouts, expenses and transfers."
      actions={actions}>
      <div className="mo-grid gc-split">
        <nav className="gc-card ac-card mo-list" aria-label="Accounts">
          <button type="button" className={'mo-acc mo-total' + (!account && !type ? ' is-on' : '')} style={{ display: 'block' }} aria-pressed={!account && !type} onClick={() => pick('')}>
            <span>All your accounts</span><b>{money(Object.values(d.bal).reduce((s, x) => s + x, 0))}</b>
          </button>
          {TYPES.map(([t, label]) => {
            const list = d.own.filter((a) => a.type === t);
            return (
              <div key={t}>
                <button type="button" className="mo-gh" style={{ width: '100%', border: 0, background: type === t && !account ? 'var(--fill-primary-soft)' : 'none', font: 'inherit', cursor: 'pointer' }} aria-pressed={type === t && !account} onClick={() => pick('', t)}><span>{label}</span><span>{money(list.reduce((s, a) => s + (d.bal[a.id] || 0), 0))}</span></button>
                {list.map(accRow)}
              </div>
            );
          })}
          <div className="mo-sep" />
          <Link href="/settlements" className="mo-acc" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="ov-ico" style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 'var(--radius-lg)', background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="hourglass" width="16" height="16" aria-hidden="true" /></span>
            <span className="mo-acc__name">With partners<span className="ac-sub">Gateways and couriers</span></span>
            <span className="mo-acc__bal">{money(d.held)}</span>
          </Link>
        </nav>

        <section className="gc-card ac-card" aria-label={acc ? accName(acc.id) : 'All accounts'}>
          <div className={'mo-hero' + (!acc && !type ? ' mo-hero--all' : '')}>
            {acc ? <BrandLogo brand={acc.brand} size={52} /> : <span style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="wallet" width="24" height="24" aria-hidden="true" /></span>}
            <div className="mo-hero__meta">
              <h2>{acc ? acc.name : type ? TYPES.find((x) => x[0] === type)[1] : 'All your accounts'}</h2>
              <div className="mo-hero__fig">{money(scopeBalance)}</div>
              <p>{acc ? `${acc.type === 'Mobile' ? 'Mobile wallet' : acc.type} · opened with ${money(acc.opening)} on 1 Sep` : `${ids.length} accounts`}</p>
            </div>
            <div className="mo-flows">
              <div><span>{filtered ? 'In (filtered)' : 'Money in'}</span><b className="ac-in">{money(inScope)}</b></div>
              <div><span>{filtered ? 'Out (filtered)' : 'Money out'}</span><b className="ac-out">{money(outScope)}</b></div>
            </div>
            {acc ? <div className="ac-row-actions" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => openForm('in', acc.id)}>Add money</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => openForm('out', acc.id)}>Take out</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => openForm('transfer', acc.id)}>Move to another account</button>
            </div> : null}
          </div>
          <div className="mo-filters">
            <div><label className="gc-label" htmlFor="mo-q">Search</label><input id="mo-q" type="search" className="gc-input" placeholder="Name, order, note…" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} /></div>
            <div><label className="gc-label" htmlFor="mo-kind">Kind</label><select id="mo-kind" className="gc-input gc-select" value={kind} onChange={(e) => { setKind(e.target.value); setLimit(PAGE); }}><option value="">All kinds</option>{kinds.map((k) => <option key={k} value={k}>{KIND_LABEL[k] || k}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="mo-from">From</label><input id="mo-from" type="date" className="gc-input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><label className="gc-label" htmlFor="mo-to">To</label><input id="mo-to" type="date" className="gc-input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <button type="button" className="gc-btn gc-btn--flat" disabled={!filtered} onClick={() => { setKind(''); setQ(''); setFrom(''); setTo(''); }}>Clear</button>
          </div>
          {!account ? <label className="mo-moves"><input type="checkbox" checked={moves} onChange={(e) => { setMoves(e.target.checked); setLimit(PAGE); }} /> Show moves between my own accounts (cash pickups, deposits, transfers)</label> : <div style={{ height: 'var(--space-2)' }} />}
          {shown.length ? (
            <>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact gc-table--hoverable mo-table">
                  <thead><tr><th scope="col">When</th><th scope="col">What</th>{account ? null : <th scope="col">Account</th>}<th scope="col" className="ac-num">In</th><th scope="col" className="ac-num">Out</th>{account ? <th scope="col" className="ac-num">Balance</th> : null}</tr></thead>
                  <tbody>{shown.slice(0, limit).map((e) => (
                    <tr key={e.id}>
                      <td>{shortDate(e.at)}<span className="ac-sub">{new Date(e.at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}{e.by ? ' · ' + e.by : ''}</span></td>
                      <td><span className={'gc-badge gc-badge--' + (KIND_TONE[e.kind] || 'slate')}>{e.cat || KIND_LABEL[e.kind] || e.kind}</span><span className="ac-sub">{[e.party, e.ref && !String(e.ref).includes(':') ? e.ref : '', e.note].filter(Boolean).join(' · ')}</span></td>
                      {account ? null : <td><div className="ac-who"><BrandLogo brand={(accountBy(e.account) || {}).brand} size={24} decorative /><span>{accName(e.account)}</span></div></td>}
                      <td className="ac-num ac-fig ac-in">{e.amount > 0 ? money(e.amount) : ''}</td>
                      <td className="ac-num ac-fig ac-out">{e.amount < 0 ? money(e.amount) : ''}</td>
                      {account ? <td className="ac-num ac-fig ac-strong">{money(running[e.id])}</td> : null}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {shown.length > limit ? <div className="mo-more"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, shown.length - limit)} more</button></div> : null}
            </>
          ) : <EmptyState icon="search-x" title="No money moved here" body={filtered ? 'Nothing matches these filters.' : 'Sales, payments and transfers into this account show here.'} actionLabel={filtered ? 'Clear filters' : undefined} onAction={filtered ? () => { setKind(''); setQ(''); setFrom(''); setTo(''); } : undefined} />}
        </section>
      </div>

      {form ? (
        <Dialog open title={form.mode === 'transfer' ? 'Move money' : form.mode === 'in' ? 'Add money' : 'Take money out'} onClose={() => setForm(null)} width={540}
          footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" form="mo-form" className="gc-btn gc-btn--solid">{form.mode === 'transfer' ? 'Move' : 'Save'}{Number(form.amount) > 0 ? ' ' + money(Number(form.amount)) : ''}</button></>}>
          <form id="mo-form" className="ac-form" onSubmit={save} noValidate>
            {form.mode === 'transfer' ? (
              <div className="ac-two">
                <AccountSelect id="mo-from-acc" label="From" value={form.account} onChange={(v) => setForm({ ...form, account: v })} />
                <AccountSelect id="mo-to-acc" label="To" value={form.to} exclude={form.account} onChange={(v) => setForm({ ...form, to: v })} />
              </div>
            ) : (
              <>
                <AccountSelect id="mo-acc" label={form.mode === 'in' ? 'Into' : 'From'} value={form.account} onChange={(v) => setForm({ ...form, account: v })} />
                <div className="ac-opts" role="radiogroup" aria-label="What is it">
                  {(form.mode === 'in' ? IN_REASONS : OUT_REASONS).map(([id, label]) => <label key={id} className={'ac-opt' + (form.reason === id ? ' is-on' : '')}><input type="radio" name="mo-reason" checked={form.reason === id} onChange={() => setForm({ ...form, reason: id })} /><span><b>{label}</b></span></label>)}
                </div>
              </>
            )}
            <div className="ac-two">
              <div>
                <label className="gc-label" htmlFor="mo-amt">Amount (৳)</label>
                <input id="mo-amt" className={'gc-input ac-fig' + (form.tried && !(Number(form.amount) > 0) ? ' gc-input--error' : '')} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, '') })} data-autofocus aria-describedby="mo-amt-help" />
                <p id="mo-amt-help" className={'gc-help' + ((form.tried && !(Number(form.amount) > 0)) || outOver ? ' gc-help--error' : '')} style={{ margin: '4px 0 0' }}>{form.tried && !(Number(form.amount) > 0) ? 'Enter an amount.' : outOver ? `${accName(form.account)} holds only ${money(d.bal[form.account] || 0)}.` : form.mode === 'in' ? '' : `${money(Math.max(0, (d.bal[form.account] || 0) - (Number(form.amount) || 0)))} will be left.`}</p>
              </div>
              <div><label className="gc-label" htmlFor="mo-date">Date</label><input id="mo-date" type="date" className="gc-input" max={dayKey(clockNow())} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div><label className="gc-label" htmlFor="mo-note">Note</label><input id="mo-note" className="gc-input" placeholder={form.mode === 'transfer' ? 'e.g. Cash deposit, slip 4471' : 'Optional'} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          </form>
        </Dialog>
      ) : null}
    </AccPage>
  );
}
