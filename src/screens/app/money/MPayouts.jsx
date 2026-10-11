'use client';
// Merchant app · Payouts (/m-payouts). The web's Payouts (/settlements) on a phone, from lib/settlements.js:
//   hero        what the partners hold now, due today, late, wallets to withdraw
//   switch      Courier COD · Gateways when the shop has both (COD is where money goes missing); Retail has no couriers
//   Evening check  what the 8 PM check will ask (duePrompts): payouts to tick off, short payouts, wallets
//   Coming in   expected payouts, overdue first, then by the working day they should arrive. A payout opens a sheet:
//               what was collected, the fee and delivery charges, what should arrive; "It arrived" records it
//               (confirmPayout: amount, the bank or wallet it landed in, a reason when it differs) or "Not yet" asks
//               again on a new date (delayPayout)
//   Needs a look payouts that arrived with a different amount: give the reason (resolveReview)
//   Withdraw    partner wallets you withdraw from yourself (EPS): withdraw()
//   Paid out    the latest payouts that arrived
// Everything is read after mount and again when the books change.

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, AppBar, TabBar, Section, Card, ListRow, Segmented, Pill, Button, Sheet, Field, Note, EmptyState,
  Skeleton, Icon, useAppData, refresh, toast, money, dateText,
} from '../kit/AppKit';
import { BrandLogo } from '@/components/BrandLogo';
import { confirmPayout, delayPayout, resolveReview, withdraw, costsOf, addWorkingDays, dayKey, fromKey, startOfDay, clockNow, closedReason } from '@/lib/settlements';
import { payoutsData, accountOptions, allowed, accName, dayLabel, shortDate, hourText, safe } from './moneyData';
import { AccountField, AmountField, ChoiceChips, Lines, HeroCard, NotHere } from './moneyParts';

const KINDS = [{ key: 'Courier', label: 'Courier COD' }, { key: 'Gateway', label: 'Gateways' }];
const REASONS = [['fee', 'Higher fee'], ['charge', 'Return or extra charge'], ['later', 'Rest comes later'], ['other', 'Something else']];
const REASON_HELP = { fee: 'Added to gateway and COD fees.', charge: 'Added to delivery charges.', later: 'It stays with the partner and is expected next time.', other: 'Recorded as a payout difference to follow up.' };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const logo = (p) => <BrandLogo brand={p.brand} size={44} decorative style={{ borderRadius: 'var(--radius-xl)' }} />;

/** Overdue 2d · Delayed · Not yet · (nothing when expected) */
function statusPill(p, now) {
  const today = startOfDay(now);
  if (p.late) return <Pill tone="err" shape>{`Overdue ${Math.max(1, Math.round((today - p.due) / 864e5))}d`}</Pill>;
  if (p.status === 'delayed') return <Pill tone="warn" shape>Delayed</Pill>;
  if (p.due < today) return <Pill tone="warn">Not yet</Pill>;
  return null;
}

export default function MPayoutsScreen() {
  const { ready, tick, ctx } = useAppData(['gc:settle'], { every: 60000 });
  const [kind, setKind] = useState('Courier');
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);        // a payout
  const [wallet, setWallet] = useState(null);    // a wallet
  useEffect(() => {
    if (!ready || !ctx) return undefined;
    const id = window.setTimeout(() => setData(safe(() => payoutsData(kind), null)), 0);
    return () => window.clearTimeout(id);
  }, [ready, tick, ctx, kind]);
  // ?payout=<id> opens it (from Home's "Check payouts")
  useEffect(() => {
    if (!data || open) return;
    const id = new URLSearchParams(window.location.search).get('payout');
    if (!id) return;
    const all = data.groups.flatMap((g) => g.list).concat(data.review);
    const p = all.find((x) => x.id === id);
    if (p) setOpen(p);
    const u = new URL(window.location.href); u.searchParams.delete('payout');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ctx && !allowed('/m-payouts', ctx)) return <NotHere name="MPayouts" title="Payouts" />;
  const me = ctx ? ctx.user : null;
  const back = ctx && allowed('/m-finance', ctx) ? '/m-finance' : '/m-more';
  const nothing = data && !data.groups.length && !data.wallets.length && !data.review.length;

  return (
    <AppScreen name="MPayouts" title="Payouts">
      <AppBar title="Payouts" back={back} />
      <Content top={103}>
        {data && data.kinds.length > 1 ? <Segmented items={KINDS} value={data.shown} onChange={setKind} style={{ marginTop: '4px' }} /> : null}
        <HeroCard
          label={data && data.kinds.length > 1 ? (data.shown === 'Courier' ? 'Couriers hold' : 'Gateways hold') : 'Partners hold'}
          value={data ? money(data.held) : '—'}
          pill={data && data.lateCount ? `${data.lateCount} late` : null}
          figures={data ? [[money(data.dueToday), 'Due today'], [money(data.lateTotal), 'Late'], ...(data.walletTotal ? [[money(data.walletTotal), 'To withdraw']] : [])] : [['—', 'Due today'], ['—', 'Late']]}
        />

        {data ? (
          <Section title="Evening check" action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{hourText(data.check.hour)}</span>}>
            <Card pad="14px 16px">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="ico" style={{ background: data.check.count ? 'var(--warnbg)' : 'var(--okbg)', color: data.check.count ? 'var(--warn)' : 'var(--ok)' }}><Icon name={data.check.count ? 'clock' : 'check'} /></span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }}>
                  <b style={{ display: 'block', fontWeight: 'var(--weight-semibold)' }}>{data.check.count ? `${data.check.count} thing${data.check.count === 1 ? '' : 's'} to answer` : 'Nothing to answer'}</b>
                  <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs-plus)' }}>
                    {data.check.count
                      ? [data.check.pays ? `${data.check.pays} payout${data.check.pays === 1 ? '' : 's'} (${money(data.check.amount)}) to tick off` : '', data.check.reviews ? `${data.check.reviews} short` : '', data.check.wallets ? `${data.check.wallets} wallet${data.check.wallets === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ')
                      : 'Every payout that was due has been ticked off.'}
                  </span>
                </span>
              </div>
            </Card>
          </Section>
        ) : null}

        {!data ? <><Section title="Coming in" /><Skeleton rows={4} /></> : nothing ? (
          <Section title="Coming in"><Card><EmptyState icon="check" title="Nothing on the way. Every payout has arrived." /></Card></Section>
        ) : (
          <>
            {data.review.length ? (
              <Section title="Needs a look">
                <Card>
                  {data.review.map((p) => (
                    <ListRow key={p.id} onClick={() => setOpen(p)} avatar={logo(p.p)} title={p.p.short}
                      sub={`${money(p.received)} arrived · ${money(Math.abs(p.net - p.received))} ${p.net > p.received ? 'short' : 'extra'}`}
                      end={<Pill tone="warn" shape>Short</Pill>} />
                  ))}
                </Card>
              </Section>
            ) : null}
            {data.groups.map((g) => (
              <Section key={g.key} title={g.key === 'late' ? 'Overdue' : g.label} action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: g.key === 'late' ? 'var(--err)' : 'var(--muted)' }}>{g.key === 'late' ? '' : shortDate(g.key) + ' · '}{money(g.total)}</span>}>
                <Card>
                  {g.list.map((p) => (
                    <ListRow key={p.id} onClick={() => setOpen(p)} avatar={logo(p.p)} title={p.p.short}
                      sub={<>into {accName(p.account)} · {p.items.length} payment{p.items.length === 1 ? '' : 's'}{g.key === 'late' ? ' · ' + dayLabel(p.due, data.now) : ''}</>}
                      end={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(p.net)}</span>{statusPill(p, data.now)}</span>} />
                  ))}
                </Card>
              </Section>
            ))}
            {data.wallets.length ? (
              <Section title="Withdraw yourself">
                <Card>
                  {data.wallets.map((w) => (
                    <ListRow key={w.partner} onClick={() => setWallet(w)} avatar={logo(w.p)} title={`${w.p.short} wallet`}
                      sub={`${w.items.length} payments since ${shortDate(w.since)}`} end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(w.net)}</span>} />
                  ))}
                </Card>
              </Section>
            ) : null}
          </>
        )}

        {data && data.paid.length ? (
          <Section title="Paid out">
            <Card>
              {data.paid.map((p) => {
                const diff = r2(p.net - (p.received || 0));
                return (
                  <ListRow key={p.id} avatar={logo(p.p)} title={p.p.short} chevron={false}
                    sub={`${p.at ? dateText(p.at) : shortDate(p.due)} · into ${accName(p.account)}${diff ? ` · ${money(Math.abs(diff))} ${diff > 0 ? 'short' : 'extra'}` : ''}`}
                    end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--ok)' }}>{money(p.received != null ? p.received : p.net)}</span>} />
                );
              })}
            </Card>
          </Section>
        ) : null}
        <div style={{ height: '8px' }} />
      </Content>
      <TabBar />

      {open ? <PayoutSheet key={open.id} pay={open} me={me} onClose={() => { setOpen(null); refresh(); }} /> : null}
      {wallet ? <WithdrawSheet key={wallet.partner} wallet={wallet} me={me} onClose={() => { setWallet(null); refresh(); }} /> : null}
    </AppScreen>
  );
}

/** Tick off a payout (it arrived, maybe with a different amount) or give the new date; a short one gets its reason. */
function PayoutSheet({ pay, me, onClose }) {
  const now = clockNow();
  const review = pay.status === 'review';
  const accounts = useMemo(() => accountOptions(['Bank', 'Mobile'], pay.account), [pay.account]);
  const [mode, setMode] = useState('arrived');
  const [amount, setAmount] = useState(String(review ? pay.received : pay.net));
  const [account, setAccount] = useState(pay.account);
  const [reason, setReason] = useState('fee');
  const [date, setDate] = useState(dayKey(addWorkingDays(Math.max(now, pay.due), 1, pay.p.weekend)));
  const received = r2(amount);
  const diff = r2(pay.net - received);
  const by = (me && me.name) || 'Staff';
  const closed = date ? safe(() => closedReason(fromKey(date), pay.p.weekend), '') : '';

  const save = () => {
    if (review) {
      resolveReview(pay, { reason, by });
      toast(`${pay.p.short} payout closed`);
      onClose(); return;
    }
    if (mode === 'later') {
      if (!date || fromKey(date) < startOfDay(now)) { toast('Pick today or a later date', { tone: 'error' }); return; }
      delayPayout(pay, date);
      toast(`We’ll ask about the ${pay.p.short} payout again on ${shortDate(fromKey(date))}`);
      onClose(); return;
    }
    if (!(received > 0)) { toast('Enter the amount that arrived', { tone: 'error' }); return; }
    confirmPayout(pay, { received, account, reason: diff ? reason : '', by });
    toast(diff ? `${money(received)} from ${pay.p.short} recorded · ${money(Math.abs(diff))} ${diff > 0 ? 'short' : 'extra'} noted` : `${money(received)} from ${pay.p.short} recorded in ${accName(account)}`);
    onClose();
  };
  const fees = pay.p.kind === 'Courier' ? 'COD fee' : 'Gateway fee';
  return (
    <Sheet open title={`${pay.p.short} payout`} onClose={onClose}
      footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button kind="primary" style={{ flex: 2 }} onClick={save}>{review ? 'Close this payout' : mode === 'later' ? 'Save new date' : `Record ${received > 0 ? money(received) : 'payout'}`}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {logo(pay.p)}
          <span style={{ minWidth: 0, fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>
            <b style={{ display: 'block', fontSize: 'var(--text-sm-plus)', color: 'var(--ink)', fontWeight: 'var(--weight-semibold)' }}>{pay.p.name}</b>
            {pay.items.length} payment{pay.items.length === 1 ? '' : 's'} · {review ? 'arrived' : 'due'} {dayLabel(pay.due, now).toLowerCase()} · into {accName(pay.account)}
          </span>
        </div>
        <div className="card" style={{ margin: 0, padding: '14px 16px', boxShadow: 'none', border: '1px solid var(--line)' }}>
          <Lines rows={[
            ['Collected', money(pay.gross)],
            [fees, '−' + money(pay.fee)],
            ['Delivery charges', pay.charge ? '−' + money(pay.charge) : '—'],
            ['Should arrive', money(pay.net), { strong: true }],
          ]} />
        </div>
        {review ? (
          <>
            <Note tone="warn" icon="alert"><b>{money(pay.received)} arrived</b>, {money(Math.abs(pay.net - pay.received))} {pay.net > pay.received ? 'less' : 'more'} than expected. Why?</Note>
            <ChoiceChips label="Reason" items={REASONS} value={reason} onChange={setReason} />
            <div className="help">{REASON_HELP[reason]}</div>
          </>
        ) : (
          <>
            <Segmented items={[{ key: 'arrived', label: 'It arrived' }, { key: 'later', label: 'Not yet' }]} value={mode} onChange={setMode} style={{ margin: 0 }} />
            {mode === 'arrived' ? (
              <>
                <AmountField label="Amount that arrived" value={amount} onChange={setAmount} />
                <AccountField label="Arrived in" value={account} onChange={setAccount} accounts={accounts} />
                {received > 0 && diff === 0 ? <Note tone="ok" icon="check"><b>Matches.</b> {accName(account)} goes up by {money(received)}.</Note> : null}
                {received > 0 && diff !== 0 ? (
                  <>
                    <Note tone="warn" icon="alert"><b>{money(Math.abs(diff))} {diff > 0 ? 'less' : 'more'} than expected.</b> What happened?</Note>
                    <ChoiceChips label="Reason" items={REASONS} value={reason} onChange={setReason} />
                    <div className="help">{REASON_HELP[reason]}</div>
                  </>
                ) : null}
              </>
            ) : (
              <Field label="When did they say it will come?" help={`${closed ? `${shortDate(fromKey(date))} is ${/day$/.test(closed) ? 'a ' + closed : closed}. ` : ''}We ask again that evening; until then it shows as delayed.`}>
                <span className="inp"><input type="date" value={date} min={dayKey(now)} onChange={(e) => setDate(e.target.value)} /></span>
              </Field>
            )}
          </>
        )}
        <details>
          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>See the {pay.items.length} payment{pay.items.length === 1 ? '' : 's'}</summary>
          <div className="card" style={{ margin: '8px 0 0', boxShadow: 'none', border: '1px solid var(--line)' }}>
            {pay.items.map((i) => {
              const c = safe(() => costsOf(i, pay.p), { net: i.gross, fee: 0, charge: 0 });
              return <ListRow key={i.id} compact title={<span className="mono">{i.ref || i.id}</span>} sub={`${i.party || ''} · ${shortDate(i.at)} · −${money(c.fee + c.charge)}`} end={<span className="num" style={{ fontWeight: 'var(--weight-medium)' }}>{money(c.net)}</span>} chevron={false} />;
            })}
          </div>
        </details>
      </div>
    </Sheet>
  );
}

/** Withdraw money waiting in a partner wallet (EPS) to one of the shop's accounts. */
function WithdrawSheet({ wallet, me, onClose }) {
  const accounts = useMemo(() => accountOptions(['Bank', 'Mobile'], wallet.p.to), [wallet.p.to]);
  const [amount, setAmount] = useState(String(wallet.net));
  const [account, setAccount] = useState(wallet.p.to);
  const save = () => {
    const amt = r2(amount);
    if (!(amt > 0) || amt > wallet.net + 0.001) { toast(`Enter up to ${money(wallet.net)}`, { tone: 'error' }); return; }
    const done = withdraw(wallet.partner, { amount: amt, account, by: (me && me.name) || 'Staff' });
    if (!done) { toast('That is less than the smallest payment waiting. Withdraw a bit more.', { tone: 'error' }); return; }
    toast(`${money(done.net)} withdrawn from ${wallet.p.short} to ${accName(account)}`);
    onClose();
  };
  return (
    <Sheet open title={`Withdraw from ${wallet.p.short}`} onClose={onClose}
      footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button kind="primary" style={{ flex: 2 }} onClick={save}>Record withdrawal</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div className="v num">{money(wallet.net)}</div>
          <div className="k">ready · {wallet.items.length} payments · {money(wallet.gross)} collected, {money(wallet.fee)} fee</div>
        </div>
        <Note tone="info" icon="alert">Withdraw in the {wallet.p.short} merchant panel first, then record the amount it shows.</Note>
        <AmountField label="Amount withdrawn" value={amount} onChange={setAmount} />
        <AccountField label="Into" value={account} onChange={setAccount} accounts={accounts} />
      </div>
    </Sheet>
  );
}
