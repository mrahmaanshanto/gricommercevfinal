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
// Front end only: src/lib/loyalty.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { balanceOf } from '@/lib/ledger';
import { getReferrers, getReferralRecords, payReferral, getLoyaltySettings, saveLoyaltySettings, getMembers, monthRange, DEFAULT_SETTINGS } from '@/lib/loyalty';
import { clockNow } from '@/lib/settlements';
import { AccountSelect, accName } from '@/screens/accounts/accShared';
import { LoyPage, Kpi, Stepper, useLoyalty, money, pts, plural } from './loyShared';

const STATUS = { due: ['Unpaid', 'warning'], given: ['Given', 'success'], waiting: ['No order yet', 'slate'] };
const HOW = { wallet: 'Into wallet', cash: 'Paid', points: 'As points' };
const CSS = `
.rf-rule{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5)}
.rf-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.rf-row > span:first-child{flex:1 1 220px;min-width:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.rf-gets{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.rf-gets > div{padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.rf-gets span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rf-gets b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rf-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-5)}
.rf-step{display:flex;flex-direction:column;gap:4px;padding:var(--space-4);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.rf-step span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.rf-step b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rf-step small{font-size:var(--text-xs);color:var(--text-muted)}
.rf-rank{display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.rf-rank.is-top{background:var(--fill-warning-soft);color:var(--text-warning)}
.rf-code{font-family:var(--font-data);font-size:var(--text-xs);padding:2px 8px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary)}
@media (max-width:760px){.rf-steps{grid-template-columns:minmax(0,1fr)}.rf-gets{grid-template-columns:minmax(0,1fr)}}
/* phones (table as cards): the customer sits on the right like every other value */
@media (max-width:640px){.rf-table .ly-who{justify-content:flex-end;text-align:right}}
`;

export default function Referrals() {
  const tick = useLoyalty();
  const [rule, setRule] = useState(DEFAULT_SETTINGS.referral);
  const [dirty, setDirty] = useState(false);
  const [pay, setPay] = useState(null);   // referrer row

  useEffect(() => { if (tick === 1) setRule(getLoyaltySettings().referral); }, [tick]);
  const setR = (patch) => { setRule((r) => ({ ...r, ...patch })); setDirty(true); };

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const records = getReferralRecords();
    const referrers = getReferrers(records, getMembers({ now }));
    const [m0, m1] = monthRange(now);
    const [l0, l1] = monthRange(now, -1);
    const cost = (a, b) => records.filter((r) => r.status === 'given' && r.how !== 'points' && r.givenAt >= a && r.givenAt < b).reduce((s, r) => s + r.reward, 0);
    const total = (k) => referrers.reduce((s, r) => s + r[k], 0);
    return {
      pv: getLoyaltySettings().pointValue, records, referrers, joined: total('joined'), bought: total('bought'), sales: total('sales'), earned: total('earned'), due: total('due'),
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

  return (
    <LoyPage screen="Referrals" active="loy-referrals" title="Invite a friend" css={CSS}
      description="Customers share their code. When a friend’s first order is delivered, the customer gets a reward. Rewards are a cost of your online sales.">
      <div className="gc-kpis gc-kpis--tight">
        <Kpi icon="share-2" label="Customers sharing" value={data ? pts(data.referrers.length) : '—'} sub="have an invite code" />
        <Kpi icon="user-plus" tone="success" label="Friends who joined" value={data ? pts(data.joined) : '—'} sub={data ? `${pts(data.bought)} bought · ${money(data.sales)} sales` : ''} />
        <Kpi icon="gift" tone="info" label="Rewards given" value={data ? money(data.earned) : '—'} sub={data ? `${money(data.due)} not paid yet` : ''} />
        <Kpi icon="receipt" tone="warning" label="Invite cost this month" value={data ? money(data.month) : '—'} sub={data ? `${data.lastLabel}: ${money(data.last)}` : ''} />
      </div>

      <section className="gc-card ac-card" aria-labelledby="rf-how">
        <div className="ac-head"><div><h2 id="rf-how">How “Invite a friend” works</h2><p>The reward is given when the friend’s first order is delivered.</p></div></div>
        <div className="rf-steps">
          <div className="rf-step"><span>Step 1</span><b>Customer shares the code</b><small>From the app, website or SMS, for example RAKIB250</small></div>
          <div className="rf-step"><span>Step 2</span><b>Friend buys for the first time</b><small>{rule.kind === 'comm' ? `and gets ${rule.friendPoints} welcome points` : `and gets ${rule.points} welcome points`}</small></div>
          <div className="rf-step"><span>Step 3</span><b>Customer gets a reward</b><small>{rule.kind === 'comm' ? `${rule.pct}% of the friend’s first order, in the wallet or paid out` : `${rule.points} points (${money(rule.points * (data ? data.pv : DEFAULT_SETTINGS.pointValue))})`}</small></div>
        </div>
      </section>

      <section className="gc-card rf-rule" aria-labelledby="rf-rule">
        <div className="ac-head" style={{ padding: 0 }}><div><h2 id="rf-rule">Reward</h2><p>What the customer who invited gets for each friend’s first order.</p></div></div>
        <div className="ac-seg" role="group" aria-label="Reward type" style={{ alignSelf: 'flex-start' }}>
          <button type="button" aria-pressed={rule.kind === 'comm'} onClick={() => setR({ kind: 'comm' })}>Share of the first order</button>
          <button type="button" aria-pressed={rule.kind === 'points'} onClick={() => setR({ kind: 'points' })}>Points each</button>
        </div>
        <div className="rf-row">
          <span>{rule.kind === 'comm' ? 'The customer gets this share of the friend’s first order' : 'Both the customer and the friend get'}</span>
          {rule.kind === 'comm' ? <Stepper label="percent" value={rule.pct} min={1} max={30} onChange={(v) => setR({ pct: v })} /> : <Stepper label="points each" value={rule.points} step={10} min={10} max={1000} onChange={(v) => setR({ points: v })} />}
          <span className="ac-sub" style={{ display: 'inline', minWidth: 64 }}>{rule.kind === 'comm' ? '%' : 'points each'}</span>
        </div>
        <div className="rf-gets">
          <div><span>The friend gets</span><b>{rule.kind === 'comm' ? rule.friendPoints : rule.points} welcome points</b></div>
          <div><span>The customer gets</span><b>{rule.kind === 'comm' ? `${rule.pct}% of the order (e.g. ${money(5000 * rule.pct / 100)} on ${money(5000)})` : `${rule.points} points`}</b></div>
        </div>
        <div className="ac-row-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="gc-btn gc-btn--solid" onClick={saveRule} disabled={!dirty}><Icon name="check" width="18" height="18" aria-hidden="true" /> Save reward</button>
          {dirty ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setRule(getLoyaltySettings().referral); setDirty(false); }}>Undo</button> : null}
        </div>
      </section>

      <section className="gc-card ac-card" aria-labelledby="rf-top">
        <div className="ac-head"><div><h2 id="rf-top">Top sharers</h2><p>Customers who brought the most new buyers</p></div></div>
        {!data ? <EmptyState icon="loader" title="Reading invites" /> : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable rf-table">
              <thead><tr><th scope="col">#</th><th scope="col">Customer</th><th scope="col">Invite code</th><th scope="col" className="ac-num">Friends joined</th><th scope="col" className="ac-num">Bought</th><th scope="col" className="ac-num">Friends’ sales</th><th scope="col" className="ac-num">Earned</th><th scope="col" className="ac-num">Due</th><th scope="col"><span className="sr-only">Pay</span></th></tr></thead>
              <tbody>
                {data.referrers.map((r, i) => (
                  <tr key={r.phone}>
                    <td><span className={'rf-rank' + (i === 0 ? ' is-top' : '')}>{i + 1}</span></td>
                    <td><div className="ly-who"><span className="ly-ava" aria-hidden="true">{r.name.charAt(0)}</span><span><b>{r.name}</b><small>{r.phone}</small></span></div></td>
                    <td><span className="rf-code">{r.code}</span></td>
                    <td className="ac-num ac-fig">{pts(r.joined)}</td>
                    <td className="ac-num ac-fig">{pts(r.bought)}</td>
                    <td className="ac-num ac-fig">{money(r.sales)}</td>
                    <td className="ac-num ac-fig">{money(r.earned)}</td>
                    <td className="ac-num ac-fig ac-strong">{r.due ? money(r.due) : '—'}</td>
                    <td><div className="ac-row-actions">{r.due ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setPay(r)} aria-label={`Pay ${r.name} ${money(r.due)}`}>Pay reward</button> : <span className="gc-badge gc-badge--success">Paid</span>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="gc-card ac-card" aria-labelledby="rf-list">
        <div className="ac-head"><div><h2 id="rf-list">Recent invites</h2><p>{data ? `${plural(data.records.length, 'friend')} joined with a code` : ''}</p></div></div>
        {!data ? null : data.records.length === 0 ? <EmptyState icon="share-2" title="No invites yet" body="Friends who join with a code show here." /> : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Friend</th><th scope="col">Invited by</th><th scope="col">Joined</th><th scope="col">First order</th><th scope="col" className="ac-num">Reward</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id}>
                    <td><span className="ac-strong">{r.friend}</span><span className="ac-sub ac-fig">{r.id}</span></td>
                    <td>{data.names[r.referrer] || r.referrer}</td>
                    <td>{formatDate(r.joinedAt)}</td>
                    <td>{r.order ? <><span className="ac-fig">{r.order.ref}</span><span className="ac-sub">{money(r.order.amount)}</span></> : '—'}</td>
                    <td className="ac-num ac-fig">{r.reward ? money(r.reward) : '—'}{r.how === 'points' && r.points ? <span className="ac-sub">{pts(r.points)} points</span> : null}</td>
                    <td><span className={'gc-badge gc-badge--' + STATUS[r.status][1]}>{STATUS[r.status][0]}</span>{r.status === 'given' ? <span className="ac-sub">{HOW[r.how] || 'Given'}{r.account ? ' · ' + accName(r.account) : ''} · {formatDate(r.givenAt)}</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
    toast(how === 'wallet' ? `${money(done.total)} moved to ${done.name}’s wallet · they can spend it or cash out` : `${money(done.total)} paid to ${done.name} from ${accName(account)}`);
    onClose();
  };
  return (
    <Dialog open title={`Pay invite reward · ${r.name}`} onClose={onClose} width={600}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="rf-pay" className="gc-btn gc-btn--solid">{how === 'wallet' ? 'Move to wallet' : 'Record payment'} · {money(total)}</button></>}>
      <form id="rf-pay" className="ac-form" onSubmit={save} noValidate>
        <div className="gc-table-wrap">
          <table className="ac-mini">
            <thead><tr><th scope="col">Friend</th><th scope="col">First order</th><th scope="col" className="ac-num">Order</th><th scope="col" className="ac-num">Reward</th></tr></thead>
            <tbody>{due.map((x) => <tr key={x.id}><td>{x.friend}</td><td className="ac-fig">{x.order ? x.order.ref : '—'}</td><td className="ac-num">{x.order ? money(x.order.amount) : '—'}</td><td className="ac-num ac-strong">{money(x.reward)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="ac-opts" role="radiogroup" aria-label="How to pay">
          <label className={'ac-opt' + (how === 'wallet' ? ' is-on' : '')}><input type="radio" name="rf-how" checked={how === 'wallet'} onChange={() => setHow('wallet')} /><span><b>Into their wallet</b><small>No money moves now. They spend it on an order or ask for a cash-out.</small></span></label>
          <label className={'ac-opt' + (how === 'cash' ? ' is-on' : '')}><input type="radio" name="rf-how" checked={how === 'cash'} onChange={() => setHow('cash')} /><span><b>Pay in cash, bKash or bank</b><small>The money leaves the account you choose.</small></span></label>
        </div>
        {how === 'cash' ? <AccountSelect id="rf-account" label="Paid from" value={account} onChange={setAccount} /> : null}
        {short ? <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Not enough money.</b> {accName(account)} has {money(balanceOf(account))}.</span></div> : null}
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{money(total)} counts as an Online cost under “Rewards and referral credit” in Sales &amp; profit.{how === 'wallet' ? ' It is also money you hold for the customer until it is spent.' : ''}</span></div>
      </form>
    </Dialog>
  );
}
