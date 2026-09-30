'use client';
// loyShared — pieces the Loyalty screens (Loyalty, Members, Member detail, Wallet, Invite a friend,
// Product points) share: the page frame, a hook that re-reads the loyalty books when anything
// changes, the level badge, and the dialogs that move wallet money or points.
// Money that moves is posted to the ledger by src/lib/loyalty.js (top-up +, pay back −); reward
// credit moves no money and is counted as a cost of the channel.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader } from '@/components/ui';
import { balanceOf } from '@/lib/ledger';
import { ACC_CSS, AccountSelect, money, accName } from '@/screens/accounts/accShared';
import {
  TIER_TONE, CHANNELS, getMembers, findMember, topUpWallet, refundWallet, rewardWallet, adjustPoints, approveRequest, accountForRequest, getLoyaltySettings,
} from '@/lib/loyalty';

export { money };
export const pts = (n) => Math.round(n || 0).toLocaleString('en-IN');
export const plural = (n, one, many = one + 's') => `${pts(n)} ${n === 1 ? one : many}`;
const num = (v) => Math.round((Number(String(v).replace(/[^\d.]/g, '')) || 0) * 100) / 100;

/** Re-reads the loyalty books whenever points, wallets or money change. Returns a number that changes (0 before mount). */
export function useLoyalty() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((n) => n + 1);
    const on = () => setTick((n) => n + 1);
    ['gc:loyalty', 'gc:ledger', 'storage'].forEach((e) => window.addEventListener(e, on));
    return () => ['gc:loyalty', 'gc:ledger', 'storage'].forEach((e) => window.removeEventListener(e, on));
  }, []);
  return tick;
}

export const LOY_CSS = `
.ly-card{overflow:hidden}
.ly-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ly-bar .gc-tabs{border-bottom:0;overflow:visible;flex-wrap:wrap}
.ly-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ly-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.ly-tools .gc-input{width:auto;flex:1 1 220px;min-width:0}
.ly-chips{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ly-chip{height:32px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ly-chip:hover{border-color:var(--primary)}
.ly-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.ly-who{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.ly-ava{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.ly-who b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ly-who small{display:block;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ly-books{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3) var(--space-5);padding:var(--space-4) var(--space-5)}
.ly-books > div{flex:1 1 200px;min-width:0}
.ly-books b{display:block;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ly-books span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ly-steps{display:inline-flex;align-items:center;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);overflow:hidden;flex:none}
.ly-steps button{width:40px;height:42px;border:0;background:none;color:var(--text-body);cursor:pointer;display:grid;place-items:center}
.ly-steps button:hover{background:var(--surface-subtle)}
.ly-steps button:disabled{opacity:.4;cursor:default}
.ly-steps output{min-width:52px;text-align:center;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ly-reasons{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ly-in{color:var(--text-success)}
.ly-out{color:var(--text-danger)}
@media (max-width:640px){.ly-tools .gc-input{flex-basis:100%}}
`;

/** The shell around a loyalty page: menu, top bar and page header. */
export function LoyPage({ screen, active, crumb = 'Loyalty & rewards', page, title, description, actions, children, css = '' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + LOY_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb={crumb} page={page || title} placeholder="Search customer by name or phone" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader title={title} description={description} actions={actions} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function TierBadge({ m }) {
  const t = m.tierObj || {};
  return <span className={'gc-badge gc-badge--' + (TIER_TONE[t.k] || 'slate')}>{t.name || 'Member'}</span>;
}

export function Kpi({ icon, tone = 'primary', label, value, sub }) {
  const bg = { primary: 'var(--fill-primary-soft)', success: 'var(--fill-success-soft)', warning: 'var(--fill-warning-soft)', error: 'var(--fill-error-soft)', info: 'var(--fill-info-soft)' }[tone];
  const fg = { primary: 'var(--primary)', success: 'var(--text-success)', warning: 'var(--text-warning)', error: 'var(--text-danger)', info: 'var(--text-info)' }[tone];
  return <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">{label}</p><p className="gc-kpi__value">{value}<small>{sub}</small></p></div></div>;
}

/** − value + control for whole numbers or steps. */
export function Stepper({ value, onChange, step = 1, min = 0, max = 1e9, label, unit }) {
  const fix = (v) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <span className="ly-steps" role="group" aria-label={label}>
      <button type="button" aria-label={`Less ${label}`} disabled={value <= min} onClick={() => onChange(fix(value - step))}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
      <output aria-live="polite">{value}{unit ? <span className="sr-only"> {unit}</span> : null}</output>
      <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(fix(value + step))}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
    </span>
  );
}

// ---- customer picker (for dialogs opened without a customer) -------------------------------------
function MemberPick({ value, onChange, members, id }) {
  const [q, setQ] = useState('');
  const list = members.filter((m) => !q.trim() || (m.name + ' ' + m.phone).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 50);
  return (
    <div>
      <label className="gc-label" htmlFor={id}>Customer</label>
      <input className="gc-input" placeholder="Search name or phone" aria-label="Search customer" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 'var(--space-2)' }} />
      <select id={id} className="gc-input gc-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose a customer</option>
        {list.map((m) => <option key={m.phone} value={m.phone}>{m.name} · {m.phone} · wallet {money(m.wallet)}</option>)}
      </select>
    </div>
  );
}

const REWARD_REASONS = ['Sorry gift', 'Loyal customer', 'Event / offer', 'Fix a mistake'];
const TITLES = { topup: 'Add money to a wallet', refund: 'Pay back wallet money', reward: 'Give wallet credit' };

/**
 * Move wallet money. mode: 'topup' (money comes into an account), 'refund' (money leaves an account,
 * up to the balance), 'reward' (credit given free: no money moves, counted as a cost).
 * `request` (an add-money or cash-out request) fixes the customer and amount and approves it.
 */
export function WalletDialog({ mode, phone: startPhone = '', request = null, onClose }) {
  const members = useMemo(() => getMembers(), []);
  const [phone, setPhone] = useState(request ? request.phone : startPhone);
  const [amount, setAmount] = useState(request ? String(request.amount) : '');
  const [account, setAccount] = useState(request ? accountForRequest(request.method) : mode === 'refund' ? 'bkash' : 'bkash');
  const [ref, setRef] = useState('');
  const [reason, setReason] = useState(REWARD_REASONS[0]);
  const [channel, setChannel] = useState('Online');
  const [note, setNote] = useState('');
  const m = phone ? findMember(phone, members) : null;
  const a = num(amount);
  const over = mode === 'refund' && m && a > m.wallet + 0.001;
  const short = mode === 'refund' && a > 0 && a > balanceOf(account);
  const title = request ? (request.type === 'in' ? 'Approve add-money request' : 'Send cash-out') : TITLES[mode];

  const save = (e) => {
    e.preventDefault();
    if (!m) { toast('Choose the customer', { tone: 'error' }); return; }
    if (!(a > 0)) { toast('Enter the amount', { tone: 'error' }); return; }
    if (over) { toast(`${m.name} has only ${money(m.wallet)} in the wallet`, { tone: 'error' }); return; }
    let done;
    if (request) done = approveRequest(request.id, { account });
    else if (mode === 'topup') done = topUpWallet({ phone: m.phone, amount: a, account, method: accName(account), ref: ref.trim(), note: note.trim() });
    else if (mode === 'refund') done = refundWallet({ phone: m.phone, amount: a, account, method: accName(account), note: note.trim() });
    else done = rewardWallet({ phone: m.phone, amount: a, reason, note: note.trim(), channel });
    if (!done || done.error) { toast((done && done.error) || 'Nothing was saved', { tone: 'error' }); return; }
    if (mode === 'topup') toast(`${money(a)} added to ${m.name}’s wallet · recorded in ${accName(account)}`);
    else if (mode === 'refund') toast(`${money(a)} paid back to ${m.name} from ${accName(account)}`);
    else toast(`${money(a)} credit given to ${m.name} · counted as a ${channel} cost`);
    onClose(true);
  };

  const footer = (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button>
      <button type="submit" form="ly-wallet-form" className="gc-btn gc-btn--solid" disabled={!!over}>{request ? (request.type === 'in' ? 'Approve' : 'Mark as sent') : mode === 'topup' ? 'Add money' : mode === 'refund' ? 'Pay back' : 'Give credit'}{a > 0 ? ' · ' + money(a) : ''}</button>
    </>
  );
  return (
    <Dialog open title={title} onClose={() => onClose(false)} footer={footer} width={560}>
      <form id="ly-wallet-form" className="ac-form" onSubmit={save} noValidate>
        {request || startPhone ? (
          m ? <div className="ly-who"><span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span><span><b>{m.name}</b><small>{m.phone} · wallet {money(m.wallet)}</small></span></div> : null
        ) : <MemberPick id="ly-w-member" value={phone} onChange={setPhone} members={members} />}
        {request ? (
          <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>{request.type === 'in'
            ? <>Check <b>{request.ref}</b> ({request.method}) for {money(request.amount)} in your {request.method} app or bank statement before you approve.</>
            : <>Send {money(request.amount)} to <b>{request.ref}</b> ({request.method}) first, then record it here.</>}</span></div>
        ) : null}
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="ly-w-amount">Amount (৳)</label>
            <input id="ly-w-amount" className="gc-input ac-fig" inputMode="decimal" value={amount} readOnly={!!request} aria-invalid={over ? 'true' : undefined} aria-describedby="ly-w-help" onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} data-autofocus={!request ? true : undefined} />
            <p id="ly-w-help" className={'gc-help' + (over ? ' gc-help--error' : '')} style={{ margin: 'var(--space-1) 0 0' }}>{m ? (mode === 'refund' ? `Up to ${money(m.wallet)} (the wallet balance)` : `Wallet now ${money(m.wallet)}`) : ' '}</p>
          </div>
          {mode === 'reward' ? (
            <div><label className="gc-label" htmlFor="ly-w-channel">Cost of</label><select id="ly-w-channel" className="gc-input gc-select" value={channel} onChange={(e) => setChannel(e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></div>
          ) : (
            <AccountSelect id="ly-w-account" label={mode === 'topup' || (request && request.type === 'in') ? 'Money came into' : 'Paid from'} value={account} onChange={setAccount} />
          )}
        </div>
        {mode === 'reward' ? (
          <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            <legend className="gc-label">Why?</legend>
            <div className="ly-reasons">{REWARD_REASONS.map((r) => <button key={r} type="button" className="ly-chip" aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>)}</div>
          </fieldset>
        ) : null}
        {mode === 'topup' && !request ? <div><label className="gc-label" htmlFor="ly-w-ref">Transaction ID or slip</label><input id="ly-w-ref" className="gc-input ac-fig" placeholder="Optional" value={ref} onChange={(e) => setRef(e.target.value)} /></div> : null}
        {!request ? <div><label className="gc-label" htmlFor="ly-w-note">Note</label><input id="ly-w-note" className="gc-input" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></div> : null}
        {short ? <div className="ac-note ac-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Not enough money.</b> {accName(account)} has {money(balanceOf(account))}. You can still record it if the money was added outside the books.</span></div> : null}
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{
          mode === 'reward' ? <>No money moves. The credit is money you now hold for the customer, and it counts as a <b>{channel}</b> cost under “Rewards and referral credit” in Sales &amp; profit.</>
            : mode === 'refund' ? <>{accName(account)} goes down by {money(a)} and so does what you hold for the customer. It is not a cost: the money was theirs.</>
              : <>{accName(account)} goes up by {money(a)}. It is not a sale: you hold it for the customer until they spend it or take it back.</>
        }</span></div>
      </form>
    </Dialog>
  );
}

const GIVE_REASONS = ['Sorry gift', 'Event / offer', 'Fix a mistake', 'Other'];
const TAKE_REASONS = ['Fix a mistake', 'Item returned', 'Other'];

/** Give or take points by hand, with a reason. */
export function PointsDialog({ phone, mode: startMode = 'give', onClose }) {
  const m = useMemo(() => findMember(phone), [phone]);
  const s = useMemo(() => getLoyaltySettings(), []);
  const [mode, setMode] = useState(startMode);
  const [n, setN] = useState('50');
  const [reason, setReason] = useState((startMode === 'take' ? TAKE_REASONS : GIVE_REASONS)[0]);
  const [note, setNote] = useState('');
  const reasons = mode === 'take' ? TAKE_REASONS : GIVE_REASONS;
  const count = Math.round(num(n));
  const over = mode === 'take' && m && count > m.points;
  if (!m) return null;
  const save = (e) => {
    e.preventDefault();
    const done = adjustPoints({ phone: m.phone, points: mode === 'take' ? -count : count, reason, note: note.trim() });
    if (done.error) { toast(done.error, { tone: 'error' }); return; }
    toast(`${mode === 'take' ? 'Removed' : 'Added'} ${pts(count)} points ${mode === 'take' ? 'from' : 'to'} ${m.name} · worth ${money(count * s.pointValue)}`);
    onClose(true);
  };
  return (
    <Dialog open title={mode === 'take' ? 'Take points away' : 'Give points as a gift'} onClose={() => onClose(false)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="ly-pts-form" className="gc-btn gc-btn--solid" disabled={!count || !!over}>{mode === 'take' ? 'Take' : 'Give'} {pts(count)} points</button></>}>
      <form id="ly-pts-form" className="ac-form" onSubmit={save} noValidate>
        <div className="ly-who"><span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span><span><b>{m.name}</b><small>{m.phone} · {pts(m.points)} points = {money(m.value)}</small></span></div>
        <div className="ac-seg" role="group" aria-label="Give or take">
          <button type="button" aria-pressed={mode === 'give'} onClick={() => { setMode('give'); setReason(GIVE_REASONS[0]); }}>Give points</button>
          <button type="button" aria-pressed={mode === 'take'} onClick={() => { setMode('take'); setReason(TAKE_REASONS[0]); }}>Take points</button>
        </div>
        <div className="ac-two">
          <div>
            <label className="gc-label" htmlFor="ly-p-n">Points</label>
            <input id="ly-p-n" className="gc-input ac-fig" inputMode="numeric" value={n} aria-invalid={over ? 'true' : undefined} aria-describedby="ly-p-help" onChange={(e) => setN(e.target.value.replace(/[^\d]/g, ''))} data-autofocus />
            <p id="ly-p-help" className={'gc-help' + (over ? ' gc-help--error' : '')} style={{ margin: 'var(--space-1) 0 0' }}>{over ? `Only ${pts(m.points)} points to take` : `Worth ${money(count * s.pointValue)} as discount`}</p>
          </div>
          <div><label className="gc-label" htmlFor="ly-p-note">Note</label><input id="ly-p-note" className="gc-input" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend className="gc-label">Why?</legend>
          <div className="ly-reasons">{reasons.map((r) => <button key={r} type="button" className="ly-chip" aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>)}</div>
        </fieldset>
        <div className="ac-note ac-note--info"><Icon name="book-open" width="16" height="16" aria-hidden="true" /><span>{mode === 'take' ? 'What you hold for customers as points goes down.' : 'Points are a promise of a discount: what you hold for customers goes up now, and it becomes a cost when the points are used.'} The POS counter sees the new balance.</span></div>
      </form>
    </Dialog>
  );
}
