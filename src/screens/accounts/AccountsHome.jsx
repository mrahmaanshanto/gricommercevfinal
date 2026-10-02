'use client';
// AccountsHome — the Accounts overview. Three answers at a glance:
//   where the money is (cash, banks, mobile wallets, and what partners are holding),
//   what needs the owner today (late or short payouts, wallets to withdraw, bills due, a full drawer),
//   and what is coming in over the next days.
// Every task has its one-click action. Front end only: figures come from lib/ledger and lib/settlements.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { OWN_ACCOUNTS, getEntries, balanceOf, KIND_LABEL } from '@/lib/ledger';
import { getPayouts, getWallets, getPartners, heldBy, clockNow, startOfDay, getConfig } from '@/lib/settlements';
import { getBills, billLeft, findSupplier } from '@/lib/supplierBills';
import { getLiabilities, leftOf } from '@/lib/liabilities';
import { getInvoices } from '@/lib/invoices';
import { profitByChannel } from '@/lib/profit';
import { CHANNELS } from '@/lib/categories';
import { AccPage, PayoutDialog, WithdrawDialog, useBooks, money, signed, dayLabel, dayWords, shortDate, daysText, accName } from './accShared';

const CSS = `
.ov-bals{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.ov-bal{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-decoration:none;color:inherit;transition:border-color var(--duration-fast,150ms) ease,box-shadow var(--duration-fast,150ms) ease}
.ov-bal:hover{border-color:var(--primary);box-shadow:0 2px 8px rgba(15,23,42,.06)}
.ov-bal:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.ov-bal__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ov-bal__fig{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;line-height:1.2}
.ov-bal__logos{display:flex;align-items:center;gap:6px;min-height:24px;font-size:var(--text-xs);color:var(--text-muted)}
.ov-bal.is-way{background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-card) 70%)}
.ov-ch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--border-subtle);border-top:1px solid var(--border-subtle)}
.ov-ch > div{background:var(--surface-card);padding:var(--space-3) var(--space-5)}
.ov-ch span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ov-ch b{display:block;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-ch em{font-style:normal;font-size:var(--text-xs);font-family:var(--font-data)}
.ov-dues{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border-subtle);border-top:1px solid var(--border-subtle)}
.ov-dues > div{background:var(--surface-card);padding:var(--space-3) var(--space-5)}
.ov-dues span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ov-dues b{display:block;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold)}
@media (max-width:640px){.ov-ch,.ov-dues{grid-template-columns:1fr}}
.ov-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:var(--space-5);align-items:start}
.ov-task{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.ov-task b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ov-task small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ov-ico{display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-lg)}
.ov-ico--red{background:var(--fill-error-soft);color:var(--text-danger)}
.ov-ico--amber{background:var(--fill-warning-soft);color:var(--text-warning)}
.ov-ico--blue{background:var(--fill-info-soft);color:var(--text-info)}
.ov-day{padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.ov-day__head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2)}
.ov-day__head b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-day__head span{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-day__items{display:flex;flex-direction:column;gap:6px;margin-top:var(--space-2)}
.ov-day__item{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-body)}
.ov-day__item em{margin-left:auto;font-style:normal;font-family:var(--font-data);color:var(--text-heading)}
.ov-foot{display:flex;justify-content:flex-end;padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.ov-flow{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);padding:0 var(--space-5) var(--space-4)}
.ov-flow > div{padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ov-flow dt{font-size:var(--text-xs);color:var(--text-muted)}
.ov-flow dd{margin:2px 0 0;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ov-kinds{list-style:none;margin:0;padding:0 var(--space-5) var(--space-4);display:flex;flex-direction:column;gap:6px}
.ov-kinds li{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-body)}
.ov-kinds li span:last-child{font-family:var(--font-data)}
@media (max-width:1100px){.ov-bals{grid-template-columns:repeat(2,minmax(0,1fr))}.ov-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  /* a card's link sits in its header row as a text link, not a lone grey button on its own row */
  .ov-grid .ac-head:has(> .gc-btn){flex-wrap:nowrap;align-items:flex-start}
  .ov-grid .ac-head:has(> .gc-btn) > div{flex:1 1 auto;min-width:0}
  .ov-grid .ac-head > .gc-btn{flex:none;height:auto;min-height:36px;margin:calc(var(--space-2) * -1) 0;padding:0;border:0;background:none;box-shadow:none;color:var(--text-link)}
  .ov-grid .ac-head > .gc-btn:hover{text-decoration:underline}
}
@media (max-width:480px){
  /* "Needs you": the button goes under the text so the explanation keeps the width */
  .ov-task{grid-template-columns:36px minmax(0,1fr);align-items:start}
  .ov-task > .gc-btn{grid-column:2;justify-self:start}
}
@media (max-width:520px){.ov-bals{gap:var(--space-2)}.ov-bal{padding:var(--space-3);gap:var(--space-1)}.ov-bal__fig{font-size:var(--text-lg)}.ov-bal__logos{flex-wrap:wrap;row-gap:4px}.ov-flow{grid-template-columns:1fr}}
`;
const RANGES = [['today', 'Today'], ['7', '7 days'], ['30', '30 days']];

export default function AccountsHome() {
  const tick = useBooks();
  const [range, setRange] = useState('30');
  const [open, setOpen] = useState(null);
  const [wallet, setWallet] = useState(null);

  const d = useMemo(() => {
    const now = clockNow();
    const today = startOfDay(now);
    const entries = getEntries();
    const own = OWN_ACCOUNTS();
    const group = (type) => { const list = own.filter((a) => a.type === type); return { list, total: list.reduce((s, a) => s + balanceOf(a.id, entries), 0) }; };
    const partners = tick ? getPartners() : [];
    const pays = tick ? getPayouts(now) : [];
    const wallets = tick ? getWallets() : [];
    const open = pays.filter((p) => p.status === 'expected' || p.status === 'delayed');
    const late = open.filter((p) => p.late);
    const review = pays.filter((p) => p.status === 'review');
    const dueToday = open.filter((p) => !p.late && p.due === today);
    const afterCheck = new Date(now).getHours() >= (getConfig().promptHour ?? 20);
    const bills = tick ? getBills().map((b) => ({ ...b, left: billLeft(b) })).filter((b) => b.left > 0 && b.due && startOfDay(b.due) <= today + 3 * 864e5).sort((a, b) => a.due - b.due) : [];
    const drawer = balanceOf('drawer', entries);

    const tasks = [];
    late.forEach((p) => tasks.push({ key: p.id, tone: 'red', icon: 'clock-alert', logo: p.p.brand, title: `${p.p.short} payout is late`, sub: `${money(p.net)} expected ${dayWords(p.due, now)} · payments from ${daysText(p.days)}`, act: ['Check', () => setOpen({ pay: p, mode: 'arrived' })] }));
    review.forEach((p) => tasks.push({ key: p.id, tone: 'amber', icon: 'triangle-alert', logo: p.p.brand, title: `${p.p.short} payout came ${money(Math.abs(p.net - p.received))} ${p.net > p.received ? 'short' : 'extra'}`, sub: `Arrived ${money(p.received)} on ${shortDate(p.due)}, expected ${money(p.net)}`, act: ['Explain', () => setOpen({ pay: p, mode: 'arrived' })] }));
    wallets.filter((w) => w.net > 0).forEach((w) => tasks.push({ key: w.partner, tone: 'blue', icon: 'wallet', logo: w.p.brand, title: `${money(w.net)} waiting in ${w.p.short}`, sub: `It stays there until you withdraw it · ${w.items.length} payments since ${shortDate(w.since)}`, act: ['Withdraw', () => setWallet(w)] }));
    // today's payouts are one task: answered together in the evening check
    if (dueToday.length === 1) { const p = dueToday[0]; tasks.push({ key: p.id, tone: 'blue', icon: 'arrow-down-to-line', logo: p.p.brand, title: `${p.p.short} should pay ${money(p.net)} today`, sub: `Into ${accName(p.account)}${afterCheck ? ' · did it arrive?' : ' · we ask at the evening check'}`, act: ['Arrived?', () => setOpen({ pay: p, mode: 'arrived' })] }); }
    if (dueToday.length > 1) tasks.push({ key: 'today', tone: 'blue', icon: 'arrow-down-to-line', title: `${dueToday.length} payouts should arrive today · ${money(dueToday.reduce((a, p) => a + p.net, 0))}`, sub: dueToday.map((p) => p.p.short).join(', ') + (afterCheck ? ' · did they arrive?' : ` · we ask at ${new Date(2000, 0, 1, getConfig().promptHour ?? 20).toLocaleTimeString('en', { hour: 'numeric' })}`), act: [afterCheck ? 'Check now' : 'Check early', () => window.dispatchEvent(new CustomEvent('gc:check'))] });
    // bills: overdue or due today first, the rest of the week as one line
    const urgent = bills.filter((b) => startOfDay(b.due) <= today);
    const soon = bills.filter((b) => startOfDay(b.due) > today);
    urgent.slice(0, 4).forEach((b) => { const s = findSupplier(b.supplier); const days = Math.round((startOfDay(b.due) - today) / 864e5); tasks.push({ key: b.id || b.no, tone: days < 0 ? 'red' : 'amber', icon: 'receipt', title: `${s ? s.name : b.supplier} bill ${money(b.left)} ${days < 0 ? `overdue ${-days} day${days === -1 ? '' : 's'}` : days === 0 ? 'due today' : `due in ${days} day${days === 1 ? '' : 's'}`}`, sub: `${b.no || b.id} · ${shortDate(b.due)}`, href: '/suppliers' + (s ? '?pay=' + encodeURIComponent(s.id) : ''), act: ['Pay'] }); });
    const moreBills = urgent.slice(4).concat(soon);
    if (moreBills.length) tasks.push({ key: 'bills', tone: 'amber', icon: 'receipt', title: `${moreBills.length} more supplier bill${moreBills.length === 1 ? '' : 's'} · ${money(moreBills.reduce((a, b) => a + b.left, 0))}`, sub: urgent.length > 4 ? 'Overdue or due this week' : 'Due in the next 3 days', href: '/expenses-bills', act: ['See bills'] });
    if (drawer > 50000) tasks.push({ key: 'drawer', tone: 'amber', icon: 'inbox', title: `Counter drawers hold ${money(drawer)}`, sub: 'Move it to the safe or the bank at closing', href: '/money?do=transfer&from=drawer', act: ['Move'] });

    // salaries, commission, affiliates and promotions owed now or within 3 days
    const liabs = tick ? getLiabilities().filter((l) => leftOf(l) > 0 && startOfDay(l.due) <= today + 3 * 864e5).sort((a, b) => a.due - b.due) : [];
    liabs.slice(0, 3).forEach((l) => { const days = Math.round((startOfDay(l.due) - today) / 864e5); tasks.push({ key: l.id, tone: days < 0 ? 'red' : 'amber', icon: 'file-clock', title: `${l.title} · ${money(leftOf(l))} ${days < 0 ? `overdue ${-days} day${days === -1 ? '' : 's'}` : days === 0 ? 'due today' : `due in ${days} day${days === 1 ? '' : 's'}`}`, sub: `${l.party} · ${l.lines.length} ${l.lines.length === 1 ? 'payment' : 'people'}`, href: '/liabilities?id=' + l.id, act: ['Pay'] }); });
    if (liabs.length > 3) tasks.push({ key: 'liabs', tone: 'amber', icon: 'file-clock', title: `${liabs.length - 3} more to pay · ${money(liabs.slice(3).reduce((a, l) => a + leftOf(l), 0))}`, sub: 'Salaries, commission, affiliates and promotions', href: '/liabilities', act: ['See all'] });

    // sales and profit by channel: this month, or last month early in a month
    const m0 = new Date(now); m0.setDate(1); m0.setHours(0, 0, 0, 0);
    const lm0 = new Date(m0); lm0.setMonth(lm0.getMonth() - 1);
    let pr = tick ? profitByChannel(m0.getTime(), now + 1) : null;
    let prLabel = m0.toLocaleString('en', { month: 'long' }) + ' so far';
    if (pr && pr.all.net < 1000) { pr = profitByChannel(lm0.getTime(), m0.getTime()); prLabel = lm0.toLocaleString('en', { month: 'long', year: 'numeric' }); }
    // dues: what the shop will get and what it owes
    const get = tick ? getInvoices().reduce((a, i) => a + Math.max(0, i.due), 0) + partners.reduce((a, p) => a + heldBy(p.id), 0) : 0;
    const owe = tick ? getBills().reduce((a, b) => a + billLeft(b), 0) + getLiabilities().reduce((a, l) => a + leftOf(l), 0) : 0;

    // coming in: the next payout days
    const days = [];
    open.filter((p) => !p.late && p.due >= today).forEach((p) => { let g = days.find((x) => x.due === p.due); if (!g) { g = { due: p.due, list: [] }; days.push(g); } g.list.push(p); });

    const from = range === 'today' ? today : today - (Number(range) - 1) * 864e5;
    const moves = entries.filter((e) => e.at >= from && (own.some((a) => a.id === e.account)) && !['transfer', 'cash pickup', 'cash in'].includes(e.kind));
    const byKind = {};
    moves.forEach((e) => { byKind[e.kind] = (byKind[e.kind] || 0) + e.amount; });
    return {
      pr, prLabel, get, owe,
      now, cash: group('Cash'), bank: group('Bank'), mobile: group('Mobile'), partners, held: partners.reduce((s, p) => s + heldBy(p.id), 0),
      todayIn: dueToday.reduce((s, p) => s + p.net, 0), tasks, days: days.slice(0, 5), late,
      moneyIn: moves.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0), moneyOut: moves.filter((e) => e.amount < 0).reduce((s, e) => s - e.amount, 0),
      kinds: Object.entries(byKind).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6), recent: entries.filter((e) => own.some((a) => a.id === e.account)).slice(0, 8),
    };
  }, [tick, range]);

  // the books live in this browser: draw the figures once they are read, so the first render matches the server
  const actions = (<>
          <Link href="/expenses-bills?add=expense" className="gc-btn gc-btn--neutral"><Icon name="receipt" width="18" height="18" aria-hidden="true" /> Record expense</Link>
          <Link href="/money?do=transfer" className="gc-btn gc-btn--neutral"><Icon name="arrow-left-right" width="18" height="18" aria-hidden="true" /> Move money</Link>
          <Link href="/settlements" className="gc-btn gc-btn--solid"><Icon name="hourglass" width="18" height="18" aria-hidden="true" /> Payouts</Link>
        </>
  );
  if (!tick) return <AccPage screen="AccountsHome" active="acc-home" page="Money overview" title="Money overview" css={CSS} about="Where your money is, what needs you today, and what is on the way." actions={actions} />;

  const bal = (href, label, g, extra) => (
    <Link href={href} className="ov-bal">
      <span className="ov-bal__top">{label}<Icon name="arrow-up-right" width="14" height="14" aria-hidden="true" /></span>
      <span className="ov-bal__fig">{money(g.total)}</span>
      <span className="ov-bal__logos">{g.list.slice(0, 4).map((a) => <BrandLogo key={a.id} brand={a.brand} size={22} decorative />)}<span>{extra || `${g.list.length} account${g.list.length === 1 ? '' : 's'}`}</span></span>
    </Link>
  );

  return (
    <AccPage screen="AccountsHome" active="acc-home" page="Money overview" title="Money overview" css={CSS}
      about="Where your money is, what needs you today, and what is on the way."
      actions={actions}>
      <div className="ov-bals">
        {bal('/money?type=Cash', 'Cash', d.cash)}
        {bal('/money?type=Bank', 'In banks', d.bank)}
        {bal('/money?type=Mobile', 'Mobile wallets', d.mobile)}
        <Link href="/settlements" className="ov-bal is-way">
          <span className="ov-bal__top">On the way from partners<Icon name="arrow-up-right" width="14" height="14" aria-hidden="true" /></span>
          <span className="ov-bal__fig">{money(d.held)}</span>
          <span className="ov-bal__logos">{d.partners.slice(0, 5).map((p) => <BrandLogo key={p.id} brand={p.brand} size={22} decorative />)}<span>{d.todayIn ? `${money(d.todayIn)} due today` : `${d.partners.length} partners`}</span></span>
        </Link>
      </div>

      <div className="ov-grid gc-split">
        <section className="gc-card ac-card" aria-labelledby="ov-profit">
          <div className="ac-head"><div><h2 id="ov-profit">Sales and profit by channel</h2><p>{d.prLabel} · net profit {money(d.pr.net)} ({(d.pr.netMargin * 100).toFixed(1)}% of sales)</p></div><Link href="/sales-profit" className="gc-btn gc-btn--sm gc-btn--neutral">Sales & profit</Link></div>
          <div className="ov-ch">
            {CHANNELS.map((ch) => { const c = d.pr.channels[ch]; return <div key={ch}><span>{ch}</span><b>{money(c.net)}</b><em className={c.profit < 0 ? 'ac-out' : 'ac-in'}>{c.profit < 0 ? '−' : ''}{money(c.profit)} profit · {(c.profitMargin * 100).toFixed(0)}%</em></div>; })}
          </div>
        </section>
        <section className="gc-card ac-card" aria-labelledby="ov-dues">
          <div className="ac-head"><div><h2 id="ov-dues">Dues</h2></div><Link href="/dues" className="gc-btn gc-btn--sm gc-btn--neutral">Dues</Link></div>
          <div className="ov-dues">
            <div><span>You will get</span><b className="ac-in">{money(d.get)}</b></div>
            <div><span>You owe</span><b className="ac-out">{money(d.owe)}</b></div>
            <div><span>Net</span><b className={d.get - d.owe < 0 ? 'ac-out' : 'ac-in'}>{d.get - d.owe < 0 ? '−' : ''}{money(d.get - d.owe)}</b></div>
          </div>
        </section>
      </div>

      <div className="ov-grid gc-split">
        <section className="gc-card ac-card" aria-labelledby="ov-tasks">
          <div className="ac-head"><div><h2 id="ov-tasks">Needs you{d.tasks.length ? ` (${d.tasks.length})` : ''}</h2></div></div>
          {d.tasks.length ? d.tasks.map((t) => (
            <div key={t.key} className="ov-task">
              {t.logo ? <BrandLogo brand={t.logo} size={36} decorative /> : <span className={'ov-ico ov-ico--' + t.tone}><Icon name={t.icon} width="18" height="18" aria-hidden="true" /></span>}
              <span><b>{t.title}</b><small>{t.sub}</small></span>
              {t.href ? <Link href={t.href} className="gc-btn gc-btn--sm gc-btn--neutral">{t.act[0]}</Link> : <button type="button" className={'gc-btn gc-btn--sm ' + (t.tone === 'red' ? 'gc-btn--solid' : 'gc-btn--neutral')} onClick={t.act[1]}>{t.act[0]}</button>}
            </div>
          )) : <EmptyState icon="circle-check" title="All clear" body="Nothing is late, short or waiting for you." />}
        </section>

        <section className="gc-card ac-card" aria-labelledby="ov-coming">
          <div className="ac-head"><div><h2 id="ov-coming">Coming in</h2></div></div>
          {d.days.length ? d.days.map((g) => (
            <div key={g.due} className="ov-day">
              <div className="ov-day__head"><b>{dayLabel(g.due, d.now)} <span className="ac-sub" style={{ display: 'inline', fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-regular)' }}>· {shortDate(g.due)}</span></b><span>{money(g.list.reduce((s, p) => s + p.net, 0))}</span></div>
              <div className="ov-day__items">{g.list.map((p) => <div key={p.id} className="ov-day__item"><BrandLogo brand={p.p.brand} size={20} decorative />{p.p.short}{p.status === 'delayed' ? <span className="gc-badge gc-badge--warning">Delayed</span> : null}<em>{money(p.net)}</em></div>)}</div>
            </div>
          )) : <EmptyState icon="calendar-check" title="Nothing expected" body="New online payments and delivered COD parcels show here." />}
          {d.late.length ? <div className="ov-day"><div className="ov-day__head"><b className="ac-out">Late</b><span className="ac-out">{money(d.late.reduce((s, p) => s + p.net, 0))}</span></div></div> : null}
          <div className="ov-foot"><Link href="/settlements" className="gc-btn gc-btn--sm gc-btn--flat">All settlements <Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></Link></div>
        </section>
      </div>

      <div className="ov-grid gc-split">
        <section className="gc-card ac-card" aria-labelledby="ov-recent">
          <div className="ac-head"><div><h2 id="ov-recent">Latest money movements</h2></div><Link href="/money" className="gc-btn gc-btn--sm gc-btn--neutral">Open money</Link></div>
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Account</th><th scope="col" className="ac-num">Amount</th></tr></thead>
              <tbody>{d.recent.map((e) => (
                <tr key={e.id}>
                  <td>{shortDate(e.at)}<span className="ac-sub">{new Date(e.at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span></td>
                  <td><span className="ac-strong">{e.cat || KIND_LABEL[e.kind] || e.kind}</span><span className="ac-sub">{e.party}{e.note ? ' · ' + e.note : ''}</span></td>
                  <td><div className="ac-who"><BrandLogo brand={(OWN_ACCOUNTS().find((a) => a.id === e.account) || {}).brand} size={24} decorative /><span>{accName(e.account)}</span></div></td>
                  <td className={'ac-num ac-fig ' + (e.amount > 0 ? 'ac-in' : 'ac-out')}>{signed(e.amount)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <section className="gc-card ac-card" aria-labelledby="ov-flow">
          <div className="ac-head"><div><h2 id="ov-flow">In and out</h2></div>
            <div className="ac-seg" role="group" aria-label="Period">{RANGES.map(([id, label]) => <button key={id} type="button" aria-pressed={range === id} onClick={() => setRange(id)}>{label}</button>)}</div>
          </div>
          <dl className="ov-flow" style={{ margin: 0 }}>
            <div><dt>Money in</dt><dd className="ac-in">{money(d.moneyIn)}</dd></div>
            <div><dt>Money out</dt><dd className="ac-out">{money(d.moneyOut)}</dd></div>
          </dl>
          {d.kinds.length ? <ul className="ov-kinds">{d.kinds.map(([k, v]) => <li key={k}><span>{KIND_LABEL[k] || k}</span><span className={v > 0 ? 'ac-in' : 'ac-out'}>{signed(v)}</span></li>)}</ul> : <p className="ac-sub" style={{ padding: '0 var(--space-5) var(--space-4)' }}>No money moved in this period.</p>}
        </section>
      </div>

      {open ? <PayoutDialog key={open.pay.id} pay={open.pay} startWith={open.mode} onClose={() => setOpen(null)} /> : null}
      {wallet ? <WithdrawDialog wallet={wallet} onClose={() => setWallet(null)} /> : null}
    </AccPage>
  );
}
