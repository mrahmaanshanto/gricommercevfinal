'use client';
// Money — every account the shop keeps money in (cash, counter drawers, safe, banks, mobile wallets)
// and every taka that moved in or out of it, in one place. It replaces the old Cash book, Money book
// and Transactions pages. Laid out like a Shopify list (docs/shopify-style.md):
//   figures   the balance of what is shown, money in, money out, and what partners hold (→ Payouts)
//   card      views by account type (with their balance), search, filters (account, kind, dates, moves
//             between own accounts), the movements with a running balance for one account, the pager
//   Add money · Take money out · Move money between accounts (for the chosen account, if any)
// ?account=<id> · ?type=Cash|Bank|Mobile · ?do=in|out|transfer (&from=<id>) opens that form
// Front end only: balances are opening + every entry in lib/ledger.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, Pager, LearnMore } from '@/components/ui/IndexKit';
import { OWN_ACCOUNTS, HOLDING_ACCOUNTS, accountBy, getEntries, balanceOf, postEntry, transferBetween, KIND_LABEL } from '@/lib/ledger';
import { clockNow, dayKey, startOfDay } from '@/lib/settlements';
import { AccPage, AccountSelect, useBooks, money, signed, shortDate, accName } from './accShared';

const TYPES = [['Cash', 'Cash'], ['Bank', 'Banks'], ['Mobile', 'Mobile wallets']];
const PAGE = 50;
const INTERNAL = ['transfer', 'cash pickup', 'cash in'];   // moves between the shop's own accounts
const IN_REASONS = [['investment', 'Owner put money in'], ['cash in', 'Other money in (loan, refund from a supplier …)']];
const OUT_REASONS = [['owner withdraw', 'Owner took money'], ['expense', 'Bank or wallet charge'], ['paid out', 'Other money out']];
const ABOUT = 'Every account the shop keeps money in, and every taka in or out: sales, payments, payouts, expenses and transfers.';

const CSS = `
.mn-when{font-variant-numeric:tabular-nums}
.mn-in{color:var(--text-success)}
.mn-out{color:var(--text-danger)}
.mn-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.mn-what .ac-trunc{max-width:460px}
@media (max-width:1279px){.mn-what .ac-trunc{max-width:300px}}
`;

const timeOf = (t) => new Date(t).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
const whatOf = (e) => e.cat || KIND_LABEL[e.kind] || e.kind;
const subOf = (e) => [e.party, e.ref && !String(e.ref).includes(':') ? e.ref : '', e.note].filter(Boolean).join(' · ');

export default function Money() {
  const tick = useBooks();
  const [account, setAccount] = useState('');
  const [type, setType] = useState('');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [moves, setMoves] = useState(false);   // show moves between the shop's own accounts in the all-accounts view
  const [find, setFind] = useState(false);
  const [form, setForm] = useState(null);      // { mode: 'in'|'out'|'transfer', ... }
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
  useEffect(() => { setPage(1); }, [account, type, kind, q, from, to, moves]);

  const pick = (id, t = '') => {
    setAccount(id); setType(t);
    const u = new URL(window.location.href);
    u.searchParams.delete('account'); u.searchParams.delete('type');
    if (id) u.searchParams.set('account', id); else if (t) u.searchParams.set('type', t);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const d = useMemo(() => {
    if (!tick) return null;
    const entries = getEntries();
    const own = OWN_ACCOUNTS();
    const bal = Object.fromEntries(own.map((a) => [a.id, balanceOf(a.id, entries)]));
    const held = HOLDING_ACCOUNTS().reduce((s, a) => s + balanceOf(a.id, entries), 0);
    return { entries: entries.filter((e) => own.some((a) => a.id === e.account)), own, bal, held };
  }, [tick]);

  function openForm(mode, fromId) {
    const first = fromId || account || 'cash-shop';
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

  const head = {
    icon: 'wallet', about: ABOUT,
    secondary: [{ label: 'Add money', onClick: () => openForm('in') }, { label: 'Take out', onClick: () => openForm('out') }],
    more: [{ label: 'Payouts', href: '/settlements' }, { label: 'Banks & wallets', href: '/account-setup?tab=accounts' }],
    primary: { label: 'Move money', onClick: () => openForm('transfer') },
  };
  if (!d) return <AccPage screen="Money" active="acc-money" page="Money" title="Money" css={CSS} {...head} />;

  const acc = account ? accountBy(account) : null;
  const viewType = acc ? acc.type : type;
  const ids = account ? [account] : type ? d.own.filter((a) => a.type === type).map((a) => a.id) : d.own.map((a) => a.id);
  const scope = d.entries.filter((e) => ids.includes(e.account));
  const fromAt = from ? startOfDay(new Date(from + 'T00:00:00').getTime()) : null;
  const toAt = to ? startOfDay(new Date(to + 'T00:00:00').getTime()) + 864e5 : null;
  const words = q.trim().toLowerCase();
  const hideMoves = !account && !moves && !kind;
  const shown = scope.filter((e) => (!hideMoves || !INTERNAL.includes(e.kind)) && (!kind || e.kind === kind) && (fromAt == null || e.at >= fromAt) && (toAt == null || e.at < toAt)
    && (!words || [e.party, e.note, e.ref, e.cat, KIND_LABEL[e.kind], e.by].join(' ').toLowerCase().includes(words)));
  // running balance after each movement, for one account (newest first)
  const running = {};
  if (account) { let b = d.bal[account] || 0; scope.forEach((e) => { running[e.id] = b; b -= e.amount; }); }
  const inScope = shown.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const outScope = shown.filter((e) => e.amount < 0).reduce((s, e) => s - e.amount, 0);
  const kinds = [...new Set(scope.map((e) => e.kind))].sort();
  const scopeBalance = ids.reduce((s, id) => s + (d.bal[id] || 0), 0);
  const filtered = !!(kind || q || from || to);
  const findOn = find || filtered || !!account || moves;
  const clearFilters = () => { setKind(''); setQ(''); setFrom(''); setTo(''); setMoves(false); if (account) pick('', viewType); };
  const closeFind = () => { clearFilters(); setFind(false); };
  const outOver = form && form.mode !== 'in' && Number(form.amount) > (d.bal[form.account] || 0);

  const typeTotal = (t) => d.own.filter((a) => !t || a.type === t).reduce((s, a) => s + (d.bal[a.id] || 0), 0);
  const tabs = [['', 'All accounts'], ...TYPES].map(([t, label]) => ({ key: t || 'all', id: 'mn-tab-' + (t || 'all'), label, count: money(typeTotal(t)), on: viewType === t, onClick: () => pick('', t) }));
  const pickable = d.own.filter((a) => !viewType || a.type === viewType);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const pg = Math.min(page, pages);
  const first = (pg - 1) * PAGE;
  const rows = shown.slice(first, first + PAGE);
  const scopeName = acc ? accName(acc.id) : type ? TYPES.find((x) => x[0] === type)[1] : 'All accounts';

  return (
    <AccPage screen="Money" active="acc-money" page="Money" title="Money" css={CSS} {...head}>
      <MetricStrip label={scopeName} items={[
        { label: 'Balance', value: money(scopeBalance), sub: scopeName },
        { label: filtered ? 'In (filtered)' : 'Money in', value: money(inScope) },
        { label: filtered ? 'Out (filtered)' : 'Money out', value: money(outScope) },
        { label: 'With partners', value: money(d.held), sub: 'Gateways and couriers', href: '/settlements' },
      ]} />

      <section className="ix-card" aria-label={scopeName}>
        <div className="ix-bar">
          {findOn ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, order, note…" onDone={closeFind} autoFocus={find} />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Accounts" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
        {findOn ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select aria-label="Account" className={'ix-filter' + (account ? ' is-set' : '')} value={account} onChange={(e) => pick(e.target.value, viewType)}>
              <option value="">Account</option>
              {pickable.map((a) => <option key={a.id} value={a.id}>{accName(a.id)} · {money(d.bal[a.id] || 0)}</option>)}
            </select>
            <select aria-label="Kind" className={'ix-filter' + (kind ? ' is-set' : '')} value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">Kind</option>
              {kinds.map((k) => <option key={k} value={k}>{KIND_LABEL[k] || k}</option>)}
            </select>
            <input type="date" aria-label="From" title="From" className="ix-date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" aria-label="To" title="To" className="ix-date" value={to} onChange={(e) => setTo(e.target.value)} />
            {!account ? <button type="button" className="ix-chip" aria-pressed={moves} onClick={() => setMoves(!moves)} title="Cash pickups, deposits and transfers">Moves between my accounts</button> : null}
            {filtered || account || moves ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearFilters}>Clear all</button> : null}
          </div>
        ) : null}

        {shown.length ? (<>
          <ul className="ix-plist" aria-label={scopeName}>
            {rows.map((e) => (
              <li key={e.id}>
                <div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{whatOf(e)}</b><span className={'mn-fig ' + (e.amount > 0 ? 'mn-in' : 'mn-out')}>{signed(e.amount)}</span></span>
                  <span className="ix-pitem__mid">{shortDate(e.at)} {timeOf(e.at)} · {accName(e.account)}{subOf(e) ? ' · ' + subOf(e) : ''}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">Money in and out, {scopeName}</caption>
              <thead><tr><th scope="col">When</th><th scope="col">What</th>{account ? null : <th scope="col">Account</th>}<th scope="col" className="ix-num">In</th><th scope="col" className="ix-num">Out</th>{account ? <th scope="col" className="ix-num">Balance</th> : null}</tr></thead>
              <tbody>{rows.map((e) => (
                <tr key={e.id} title={[e.by ? 'By ' + e.by : '', e.ref, e.note].filter(Boolean).join(' · ') || undefined}>
                  <td className="mn-when ix-nowrap">{shortDate(e.at)} <span className="ix-muted">{timeOf(e.at)}</span></td>
                  <td className="mn-what"><span className="ac-trunc"><span className="ix-strong">{whatOf(e)}</span>{subOf(e) ? <span className="ix-muted"> · {subOf(e)}</span> : null}</span></td>
                  {account ? null : <td className="ix-muted ix-nowrap">{accName(e.account)}</td>}
                  <td className="ix-num mn-fig mn-in">{e.amount > 0 ? money(e.amount) : ''}</td>
                  <td className="ix-num mn-fig mn-out">{e.amount < 0 ? money(e.amount) : ''}</td>
                  {account ? <td className="ix-num mn-fig ix-strong">{money(running[e.id])}</td> : null}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>) : (
          <div className="ix-empty"><EmptyState icon="search-x" title="No money moved here" body={filtered ? 'Nothing matches these filters.' : 'Sales, payments and transfers into this account show here.'} actionLabel={filtered ? 'Clear filters' : undefined} onAction={filtered ? clearFilters : undefined} /></div>
        )}
        <Pager label={shown.length ? `Showing ${first + 1}–${first + rows.length} of ${shown.length}` : 'No money moved here'} atStart={pg <= 1} atEnd={pg >= pages} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
      <LearnMore topic="money" />

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
