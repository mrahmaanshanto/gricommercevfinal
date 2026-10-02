'use client';
// MemberDetail — one loyalty member: points (and their ৳ value), level progress, wallet money,
// buying and invites, with the full points and wallet history.
//   Points   give or take points with a reason (the POS counter sees the new balance).
//   Wallet   add money (asks which account received it), pay money back (asks which account pays,
//            up to the balance), or give credit free (a reward cost, no money moves).
// ?phone=<mobile> picks the member (Rakibul Hasan when none is given).
// Front end only: src/lib/loyalty.js.

import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui';
import { MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { findMember, memberHistory, getLoyaltySettings, getReferrers, WALLET_KIND } from '@/lib/loyalty';
import { accName } from '@/screens/accounts/accShared';
import { LoyPage, TierBadge, WalletDialog, PointsDialog, useLoyalty, money, pts, plural } from './loyShared';

const DEFAULT_PHONE = '01819072332';
const KIND_WORD = { earn: 'Earned', redeem: 'Used', adjust: 'By hand', expire: 'Expired', welcome: 'Welcome', birthday: 'Birthday', referral: 'Invite', return: 'Return' };
const CSS = `
.md-prog{display:flex;flex-direction:column;gap:6px}
.md-prog p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.md-amt{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);white-space:nowrap}
`;

export default function MemberDetail() {
  const tick = useLoyalty();
  const [phone, setPhone] = useState('');
  const [tab, setTab] = useState('points');
  const [dialog, setDialog] = useState(null);   // { kind: 'points'|'wallet', mode }

  useEffect(() => {
    const read = () => setPhone(new URLSearchParams(window.location.search).get('phone') || DEFAULT_PHONE);
    read();
    window.addEventListener('gc:route', read);
    return () => window.removeEventListener('gc:route', read);
  }, []);

  const data = useMemo(() => {
    if (!tick || !phone) return null;
    const m = findMember(phone);
    if (!m) return { m: null };
    const s = getLoyaltySettings();
    const next = s.tiers.filter((t) => t.min > m.tierObj.min).sort((a, b) => a.min - b.min)[0] || null;
    const ref = getReferrers().find((r) => r.phone === m.phone) || null;
    return { m, s, next, ref, history: memberHistory(m.phone) };
  }, [tick, phone]);

  const m = data && data.m;
  if (data && !m) {
    return (
      <LoyPage screen="MemberDetail" active="loy-members" crumb="Loyalty & rewards / Members" page="Member" title="Member" back="/members" backLabel="All members">
        <section className="ix-card"><div className="ix-empty"><EmptyState icon="user-x" title="No member with this number" body={`${phone} is not a loyalty member yet.`} /></div></section>
      </LoyPage>
    );
  }

  const open = (kind, mode) => setDialog({ kind, mode });
  const list = data ? (tab === 'points' ? data.history.points : data.history.wallet) : [];
  const pct = m && data.next ? Math.min(100, Math.round((m.bought / data.next.min) * 100)) : 100;

  const histTabs = [['points', 'Points history', data ? data.history.points.length : 0], ['wallet', 'Wallet money', data ? data.history.wallet.length : 0]]
    .map(([k, label, n]) => ({ key: k, id: 'md-tab-' + k, label, count: n, on: tab === k, onClick: () => setTab(k) }));

  return (
    <LoyPage screen="MemberDetail" active="loy-members" crumb="Loyalty & rewards / Members" page={m ? m.name : 'Member'} title={m ? m.name : 'Member'} css={CSS}
      back="/members" backLabel="All members"
      badges={m ? <TierBadge m={m} /> : null}
      meta={m ? [m.phone, `Member since ${formatDate(m.joined)}`, m.birthday ? 'birthday ' + m.birthday : ''].filter(Boolean).join(' · ') : ''}
      secondary={m ? [{ label: 'Give or take points', onClick: () => open('points', 'give') }] : []}
      more={m ? [{ label: 'Pay back wallet', onClick: () => open('wallet', 'refund'), disabled: !m.wallet }, { label: 'Give credit', onClick: () => open('wallet', 'reward') }] : []}
      primary={m ? { label: 'Add money', onClick: () => open('wallet', 'topup') } : null}>
      {!m ? <section className="ix-card"><div className="ix-empty"><EmptyState icon="loader" title="Reading the member" /></div></section> : (
        <>
          <MetricStrip items={[
            { label: 'Points now', value: pts(m.points), sub: `= ${money(m.value)} off` },
            { label: 'Wallet money', value: money(m.wallet) },
            { label: 'Total bought', value: money(m.bought), sub: m.last ? 'last ' + formatDate(m.last) : '' },
            { label: 'Friends invited', value: data.ref ? pts(data.ref.joined) : '0', sub: data.ref ? (data.ref.due ? money(data.ref.due) + ' due' : money(data.ref.earned) + ' earned') : '' },
          ]} />

          <div className="ix-record">
            <div className="ix-main">
              <section className="ix-card" aria-label="History">
                <div className="ix-bar"><IndexTabs tabs={histTabs} label="History" /></div>
                {list.length === 0 ? <div className="ix-empty"><EmptyState icon="history" title={tab === 'points' ? 'No points yet' : 'No wallet money yet'} body={tab === 'points' ? 'Points show here from the first order.' : 'Top-ups, return credit and rewards show here.'} actionLabel={tab === 'wallet' ? 'Add money' : 'Give points'} onAction={() => (tab === 'wallet' ? open('wallet', 'topup') : open('points', 'give'))} /></div> : (
                  <div className="ix-table-wrap ix-table-wrap--show">
                    <table className="ix-table ix-table--static gc-table--keep">
                      <thead><tr><th scope="col">Date</th><th scope="col">What happened</th><th scope="col">{tab === 'points' ? 'Channel' : 'Account'}</th><th scope="col" className="ix-num">{tab === 'points' ? 'Points' : 'Amount'}</th><th scope="col" className="ix-num">Balance after</th></tr></thead>
                      <tbody>
                        {list.map((e) => {
                          const v = tab === 'points' ? e.points : e.amount;
                          const up = v > 0;
                          return (
                            <tr key={e.id}>
                              <td className="ix-nowrap">{formatDate(e.at)}<span className="ly-sub">{formatTime(e.at)}</span></td>
                              <td><span className="ix-strong">{e.what}</span><span className="ly-sub">{[tab === 'points' ? KIND_WORD[e.kind] : WALLET_KIND[e.kind], e.sub].filter(Boolean).join(' · ')}{tab === 'points' && e.kind === 'redeem' && e.value ? ` · ${money(e.value)} off` : ''}</span></td>
                              <td className="ix-muted">{tab === 'points' ? (e.channel || '—') : e.account ? accName(e.account) : 'No money moved'}</td>
                              <td className={'ix-num md-amt ' + (up ? 'ly-in' : 'ly-out')}>{up ? '+' : '−'}{tab === 'points' ? pts(Math.abs(v)) : money(v)}</td>
                              <td className="ix-num">{tab === 'points' ? pts(e.after) : money(e.after)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
            <aside className="ix-side">
              <section className="ix-card" aria-labelledby="md-level">
                <header className="ix-card__head"><h2 id="md-level">{m.tierObj.name} level</h2></header>
                <div className="ix-card__body md-prog">
                  <p>{data.next ? `To ${data.next.name}: ${money(m.bought)} / ${money(data.next.min)}` : `${m.tierObj.name} is the top level`}</p>
                  <div className="gc-progress" role="progressbar" aria-label="Progress to the next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="gc-progress__fill" style={{ width: pct + '%' }} /></div>
                  <p>{data.next ? `Buy ${money(data.next.min - m.bought)} more to get ${data.next.mult}x points` : `${m.tierObj.mult}x points on every buy`}</p>
                </div>
              </section>
              <section className="ix-card" aria-labelledby="md-who">
                <header className="ix-card__head"><h2 id="md-who">Member</h2></header>
                <div className="ix-card__body">
                  <KV rows={[
                    ['Phone', <span className="ly-fig">{m.phone}</span>],
                    ['Invite code', m.code ? <span className="ly-fig">{m.code}</span> : 'no invite code'],
                    ['Member since', formatDate(m.joined)],
                    m.birthday ? ['Birthday', m.birthday] : null,
                    ['Last buy', m.last ? formatDate(m.last) : '—'],
                  ]} />
                </div>
              </section>
              <p className="ly-note">{plural(m.points, 'point')} are worth {money(m.value)} at {money(data.s.pointValue)} a point. Points and wallet money are money you hold for {m.name}; they show under Accounts › Liabilities.</p>
            </aside>
          </div>
        </>
      )}
      {dialog && m && dialog.kind === 'points' ? <PointsDialog phone={m.phone} mode={dialog.mode} onClose={() => setDialog(null)} /> : null}
      {dialog && m && dialog.kind === 'wallet' ? <WalletDialog mode={dialog.mode} phone={m.phone} onClose={() => setDialog(null)} /> : null}
    </LoyPage>
  );
}
