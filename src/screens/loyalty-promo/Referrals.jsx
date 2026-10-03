'use client';
// Referrals — "Invite a friend": customers share a code; when a friend's first order is delivered,
// the customer earns a reward.
//   Top      customers sharing, friends who joined, their sales, rewards given and still to pay,
//            and what invites cost this month.
//   Rule     the reward (a share of the friend's first order, or points each), saved to the settings.
//   Sharers  who brought the most new buyers; "Pay reward" gives what is due into the wallet (reward
//            credit, no money moves) or in cash / bKash / bank from an account (ledger 'referral
//            reward', −). Either way it is an Online cost ("Rewards and referral credit").
//   Invites  every friend who joined with a code this month and what their invite earned.
// Hardened (Nayeem's brief #9): a reward waits until the friend's order is past the return period (pending), a
// returned order cancels it (or takes it back when already given), monthly and total caps, and a self-referral check
// (same phone is blocked; same address or device waits for a person to check it). Rewards go out as store credit or
// points; a cash payout is the affiliate exception. src/lib/loyalty.js › getReferralRecords, checkReferral.
// Front end only: src/lib/loyalty.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { balanceOf } from '@/lib/ledger';
import { getReferrers, getReferralRecords, payReferral, getLoyaltySettings, saveLoyaltySettings, getMembers, monthRange, DEFAULT_SETTINGS, approveReferral, rejectReferral, reverseReferral, checkReferralReturns } from '@/lib/loyalty';
import { Menu } from '@/components/ui/IndexKit';
import { clockNow } from '@/lib/settlements';
import { AccountSelect, accName } from '@/screens/accounts/accShared';
import { LoyPage, Stepper, useLoyalty, money, pts, plural } from './loyShared';

const STATUS = {
  due: ['Unpaid', 'warning'], given: ['Given', 'success'], waiting: ['No order yet', 'neutral'], pending: ['Return period', 'info'], review: ['Check', 'warning'],
  blocked: ['Blocked', 'error'], cancelled: ['Order returned', 'neutral'], capped: ['Over the cap', 'neutral'], reversed: ['Taken back', 'error'],
};
const HOW = { wallet: 'As store credit', cash: 'Paid', points: 'As points' };
const CSS = `
.rf-side{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.rf-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
@media (max-width:900px){.rf-side{grid-template-columns:minmax(0,1fr)}}
.rf-gets{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.rf-gets b{font-weight:var(--weight-medium);color:var(--text-heading)}
.rf-steps{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0 var(--space-4) var(--space-4);list-style:none}
.rf-steps li{display:flex;flex-direction:column;gap:2px;font-size:var(--text-xs);color:var(--text-muted)}
.rf-steps b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.rf-code{font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary)}
`;

export default function Referrals() {
  const tick = useLoyalty();
  const [rule, setRule] = useState(DEFAULT_SETTINGS.referral);
  const [dirty, setDirty] = useState(false);
  const [pay, setPay] = useState(null);   // referrer row
  const [view, setView] = useState('top');
  const router = useRouter();

  useEffect(() => { if (tick === 1) { setRule(getLoyaltySettings().referral); checkReferralReturns(); } }, [tick]);
  const setR = (patch) => { setRule((r) => ({ ...r, ...patch })); setDirty(true); };

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const records = getReferralRecords();
    const referrers = getReferrers(records, getMembers({ now }));
    const [m0, m1] = monthRange(now);
    const [l0, l1] = monthRange(now, -1);
    const cost = (a, b) => records.filter((r) => r.status === 'given' && r.how !== 'points' && r.givenAt >= a && r.givenAt < b).reduce((s, r) => s + r.reward, 0);
    const total = (k) => referrers.reduce((s, r) => s + (r[k] || 0), 0);
    return {
      pv: getLoyaltySettings().pointValue, records, referrers, joined: total('joined'), bought: total('bought'), sales: total('sales'), earned: total('earned'), due: total('due'), pending: total('pending'), review: records.filter((r) => r.status === 'review').length,
      month: cost(m0, m1), last: cost(l0, l1), lastLabel: new Date(l0).toLocaleString('en', { month: 'long' }),
      names: Object.fromEntries(referrers.map((r) => [r.phone, r.name])),
    };
  }, [tick]);

  const saveRule = () => {
    const s = getLoyaltySettings();
    saveLoyaltySettings({ ...s, referral: rule });
    setDirty(false);
    toast('Invite reward saved · it counts from the next friend’s first order');
  };

  // what a status needs said, and the one or two things that can be done with an invite (no record page: a ⋯ menu)
  const statusNote = (r) => (r.status === 'review' ? (r.flags || []).join(' · ') : r.status === 'pending' && r.availableAt ? 'Ready ' + formatDate(r.availableAt) : r.status === 'reversed' && r.reverseReason ? r.reverseReason : r.status === 'blocked' && (r.rejectReason || (r.flags || [])[0]) ? (r.rejectReason || r.flags[0]) : '');
  const rowMenu = (r) => {
    const items = r.status === 'review' ? [
      { label: 'Allow the reward', onClick: () => { approveReferral(r.id); toast(`Reward for ${r.friend} allowed`); } },
      { label: 'Refuse: self-referral', tone: 'danger', onClick: () => { rejectReferral(r.id, 'Self-referral'); toast(`Invite of ${r.friend} refused`); } },
    ] : r.status === 'given' && r.how !== 'cash' ? [
      { label: 'Take the reward back', tone: 'danger', onClick: () => { const x = reverseReferral(r.id, 'Taken back by hand', 'Shanto'); toast(x.error ? x.error : 'Reward taken back', x.error ? { tone: 'error' } : undefined); } },
    ] : [];
    return items.length ? <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={items} /> : null;
  };
  const open = (phone) => (e) => { if (e.target.closest('a,button,input,label,select')) return; router.push(`/member-detail?phone=${phone}`); };
  const tabs = [['top', 'Top sharers', data ? data.referrers.length : null], ['list', 'Recent invites', data ? data.records.length : null]]
    .map(([k, label, n]) => ({ key: k, id: 'rf-tab-' + k, label, count: n, on: view === k, onClick: () => setView(k) }));

  return (
    <LoyPage screen="Referrals" active="loy-referrals" title="Invite a friend" icon="share-2" css={CSS}
      about="Customers share their code. When a friend’s first order is delivered, the customer gets a reward. Rewards are a cost of your online sales."
      more={[{ label: 'Loyalty rules', href: '/loyalty' }, { label: 'Members', href: '/members' }]}>
      <MetricStrip items={[
        { label: 'Customers sharing', value: data ? pts(data.referrers.length) : '—', sub: 'have an invite code' },
        { label: 'Friends who joined', value: data ? pts(data.joined) : '—', sub: data ? `${pts(data.bought)} bought` : '' },
        { label: 'Rewards given', value: data ? money(data.earned) : '—', sub: data ? `${money(data.due)} due · ${money(data.pending)} waiting` : '' },
        data && data.review ? { label: 'To check', value: pts(data.review), sub: 'same address or device', onClick: () => setView('list') } : null,
        { label: 'Invite cost this month', value: data ? money(data.month) : '—', sub: data ? `${data.lastLabel}: ${money(data.last)}` : '' },
      ]} />

      <section className="ix-card" aria-label="Invites">
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Invites" /></div>
            {!data ? <div className="ix-empty"><EmptyState icon="loader" title="Reading invites" /></div> : view === 'top' ? (<>
              <ul className="ix-plist" aria-label="Top sharers">
                {data.referrers.map((r) => (
                  <li key={r.phone}><Link href={`/member-detail?phone=${r.phone}`} className="ix-pitem"><span className="ix-pitem__top"><b>{r.name}</b><span>{r.due ? money(r.due) + ' due' : money(r.earned)}</span></span><span className="ix-pitem__mid">{r.code} · {pts(r.joined)} joined · {money(r.sales)} sales</span></Link></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <thead><tr><th scope="col">Customer</th><th scope="col">Invite code</th><th scope="col" className="ix-num">Friends joined</th><th scope="col" className="ix-num">Friends’ sales</th><th scope="col" className="ix-num">Earned</th><th scope="col" className="ix-num">Due</th><th scope="col"><span className="sr-only">Pay</span></th></tr></thead>
                  <tbody>
                    {data.referrers.map((r) => (
                      <tr key={r.phone} onClick={open(r.phone)}>
                        <td><Link href={`/member-detail?phone=${r.phone}`} className="ix-strong">{r.name}</Link></td>
                        <td><span className="rf-code">{r.code}</span></td>
                        <td className="ix-num">{pts(r.joined)}<span className="ix-muted"> · {pts(r.bought)} bought</span></td>
                        <td className="ix-num">{money(r.sales)}</td>
                        <td className="ix-num">{money(r.earned)}</td>
                        <td className="ix-num ix-strong">{r.due ? money(r.due) : '—'}</td>
                        <td className="ix-num">{r.due ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPay(r)} aria-label={`Pay ${r.name} ${money(r.due)}`}>Pay reward</button> : <StatusBadge tone="success">Paid</StatusBadge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>) : data.records.length === 0 ? <div className="ix-empty"><EmptyState icon="share-2" title="No invites yet" body="Friends who join with a code show here." /></div> : (<>
              <ul className="ix-plist" aria-label="Recent invites">
                {data.records.map((r) => (
                  <li key={r.id} className="ix-pitem"><span className="ix-pitem__top"><b>{r.friend}</b><span>{r.reward ? money(r.reward) : '—'}</span></span><span className="ix-pitem__mid">{data.names[r.referrer] || r.referrer} · {formatDate(r.joinedAt)}</span><span className="ix-pitem__tags"><StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge>{rowMenu(r)}</span>{statusNote(r) ? <span className="ix-pitem__mid">{statusNote(r)}</span> : null}</li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table ix-table--static gc-table--keep">
                  <thead><tr><th scope="col">Friend</th><th scope="col">Invited by</th><th scope="col">Joined</th><th scope="col">First order</th><th scope="col" className="ix-num">Reward</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {data.records.map((r) => (
                      <tr key={r.id}>
                        <td><span className="ix-strong">{r.friend}</span></td>
                        <td>{data.names[r.referrer] || r.referrer}</td>
                        <td className="ix-muted">{formatDate(r.joinedAt)}</td>
                        <td>{r.order ? <><span className="ly-fig">{r.order.ref}</span><span className="ix-muted"> · {money(r.order.amount)}</span></> : '—'}</td>
                        <td className="ix-num">{r.reward ? money(r.reward) : '—'}{r.how === 'points' && r.points ? <span className="ly-sub">{pts(r.points)} points</span> : null}</td>
                        <td><span title={r.status === 'given' ? `${HOW[r.how] || 'Given'}${r.account ? ' · ' + accName(r.account) : ''} · ${formatDate(r.givenAt)}` : undefined}><StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge></span>{statusNote(r) ? <span className="ly-sub">{statusNote(r)}</span> : null}</td>
                        <td className="ix-num">{rowMenu(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
            <div className="ix-foot"><span>{data ? (view === 'top' ? plural(data.referrers.length, 'customer') : `${plural(data.records.length, 'friend')} joined with a code`) : ''}</span></div>
      </section>

      <div className="rf-side">
          <section className="ix-card" aria-labelledby="rf-rule">
            <header className="ix-card__head"><h2 id="rf-rule">Reward</h2>{dirty ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setRule(getLoyaltySettings().referral); setDirty(false); }}>Undo</button> : null}</header>
            <div className="ix-card__body">
              <div className="ac-seg" role="group" aria-label="Reward type" style={{ alignSelf: 'flex-start' }}>
                <button type="button" aria-pressed={rule.kind === 'comm'} onClick={() => setR({ kind: 'comm' })}>Share of the first order</button>
                <button type="button" aria-pressed={rule.kind === 'points'} onClick={() => setR({ kind: 'points' })}>Points each</button>
              </div>
              <div className="ly-row">
                <span className="ly-grow">{rule.kind === 'comm' ? 'The customer gets this share of the friend’s first order' : 'Both the customer and the friend get'}</span>
                {rule.kind === 'comm' ? <Stepper label="percent" value={rule.pct} min={1} max={30} onChange={(v) => setR({ pct: v })} /> : <Stepper label="points each" value={rule.points} step={10} min={10} max={1000} onChange={(v) => setR({ points: v })} />}
                <span className="ly-sub">{rule.kind === 'comm' ? '%' : 'points each'}</span>
              </div>
              <div className="ly-row"><span className="ly-grow">The reward waits after delivery for</span><Stepper label="days the reward waits" value={rule.pendingDays} min={0} max={30} onChange={(v) => setR({ pendingDays: v })} /><span className="ly-sub">days</span></div>
              <div className="ly-row"><span className="ly-grow">Most rewards for one customer a month</span><Stepper label="rewards a month" value={rule.capMonth} min={0} max={50} onChange={(v) => setR({ capMonth: v })} /><span className="ly-sub">{rule.capMonth ? '' : 'no cap'}</span></div>
              <div className="ly-row"><span className="ly-grow">Most rewards for one customer ever</span><Stepper label="rewards in total" value={rule.capTotal} step={5} min={0} max={500} onChange={(v) => setR({ capTotal: v })} /><span className="ly-sub">{rule.capTotal ? '' : 'no cap'}</span></div>
              <p className="rf-gets">The friend gets <b>{rule.kind === 'comm' ? rule.friendPoints : rule.points} welcome points</b>. The customer gets <b>{rule.kind === 'comm' ? `${rule.pct}% of the order (e.g. ${money(5000 * rule.pct / 100)} on ${money(5000)})` : `${rule.points} points`}</b>.</p>
              <button type="button" className="ix-btn ix-btn--primary" onClick={saveRule} disabled={!dirty}>Save reward</button>
            </div>
          </section>
          <details className="ix-card gc-disclose">
            <summary>How “Invite a friend” works</summary>
            <ol className="rf-steps">
              <li><b>Customer shares the code</b>From the app, website or SMS, for example RAKIB250</li>
              <li><b>Friend buys for the first time</b>{rule.kind === 'comm' ? `and gets ${rule.friendPoints} welcome points` : `and gets ${rule.points} welcome points`}</li>
              <li><b>Customer gets a reward</b>{rule.kind === 'comm' ? `${rule.pct}% of the friend’s first order, as store credit` : `${rule.points} points (${money(rule.points * (data ? data.pv : DEFAULT_SETTINGS.pointValue))})`}, {rule.pendingDays} days after the friend’s order is delivered. A returned order cancels it.</li>
            </ol>
          </details>
      </div>
      <LearnMore topic="invites" />

      {pay ? <PayDialog r={pay} onClose={() => setPay(null)} /> : null}
    </LoyPage>
  );
}

function PayDialog({ r, onClose }) {
  const due = r.records.filter((x) => x.status === 'due');
  const [how, setHow] = useState('wallet');
  const [account, setAccount] = useState('bkash');
  const total = due.reduce((a, x) => a + x.reward, 0);
  const short = how === 'cash' && total > balanceOf(account);
  const save = (e) => {
    e.preventDefault();
    const done = payReferral(due.map((x) => x.id), { how, account });
    if (done.error) { toast(done.error, { tone: 'error' }); return; }
    toast(how === 'wallet' ? `${money(done.total)} added to ${done.name}’s store credit` : `${money(done.total)} paid to ${done.name} from ${accName(account)}`);
    onClose();
  };
  return (
    <Dialog open title={`Pay invite reward · ${r.name}`} onClose={onClose} width={600}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="rf-pay" className="gc-btn gc-btn--solid">{how === 'wallet' ? 'Give store credit' : 'Record payment'} · {money(total)}</button></>}>
      <form id="rf-pay" className="ac-form" onSubmit={save} noValidate>
        <div className="gc-table-wrap">
          <table className="ac-mini">
            <thead><tr><th scope="col">Friend</th><th scope="col">First order</th><th scope="col" className="ac-num">Order</th><th scope="col" className="ac-num">Reward</th></tr></thead>
            <tbody>{due.map((x) => <tr key={x.id}><td>{x.friend}</td><td className="ac-fig">{x.order ? x.order.ref : '—'}</td><td className="ac-num">{x.order ? money(x.order.amount) : '—'}</td><td className="ac-num ac-strong">{money(x.reward)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="ac-opts" role="radiogroup" aria-label="How to pay">
          <label className={'ac-opt' + (how === 'wallet' ? ' is-on' : '')}><input type="radio" name="rf-how" checked={how === 'wallet'} onChange={() => setHow('wallet')} /><span><b>As store credit</b><small>No money moves. They spend it on a later order.</small></span></label>
          <label className={'ac-opt' + (how === 'cash' ? ' is-on' : '')}><input type="radio" name="rf-how" checked={how === 'cash'} onChange={() => setHow('cash')} /><span><b>Pay in cash, bKash or bank</b><small>For affiliate partners. The money leaves the account you choose and can’t be taken back here.</small></span></label>
        </div>
        {how === 'cash' ? <AccountSelect id="rf-account" label="Paid from" value={account} onChange={setAccount} /> : null}
        {short ? <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Not enough money.</b> {accName(account)} has {money(balanceOf(account))}.</span></div> : null}
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{money(total)} counts as an Online cost under “Rewards and referral credit” in Sales &amp; profit.{how === 'wallet' ? ' It is also store credit you owe the customer until it is spent.' : ''}</span></div>
      </form>
    </Dialog>
  );
}
