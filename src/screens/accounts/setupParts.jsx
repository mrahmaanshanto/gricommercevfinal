'use client';
// setupParts — two parts of Accounts setup (brief #6):
//   AccountSheet    one money account's properties: currency, branch, who may use it (roles), how its statement
//                   is matched, the payment partners and card machines that pay into it, when it was last
//                   matched, and Archive / Restore (archiving only at ৳0, with the reason when it is refused)
//   ApprovalsPanel  the approval limits (by amount, category, account or branch, per kind) and the finance duties
//                   of each person (cashier, custodian, approver, reconciler)
// Front end only: lib/ledger.js (accountProps, archiveAccount), approvals.js, financeDuties.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { formatDate, formatDateTime } from '@/lib/format';
import { accountBy, balanceOf, accountProps, setAccountProps, archiveAccount, restoreAccount, CURRENCIES, MATCH_RULES, OWN_ACCOUNTS } from '@/lib/ledger';
import { getAllPartners } from '@/lib/settlements';
import { getTerminals } from '@/lib/terminalBatches';
import { getBranchNames, getWarehouseNames } from '@/lib/locations';
import { ROLES, USERS } from '@/lib/team';
import { getCategories } from '@/lib/categories';
import { getLimits, addLimit, removeLimit, resetLimits, limitText, KINDS, SCOPES } from '@/lib/approvals';
import { DUTIES, dutiesOf, setDuty, resetDuties, changedFor, roleTitle } from '@/lib/financeDuties';
import { money, accName, useMe } from './accShared';

export const SETUP_PARTS_CSS = `
.sp{display:flex;flex-direction:column;gap:var(--space-4)}
.sp-sum{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.sp-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-sum span{font-size:var(--text-xs);color:var(--text-muted)}
.sp-roles{display:flex;flex-wrap:wrap;gap:6px}
.sp-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end;width:100%}
.sp-foot .sp-left{margin-right:auto}
.sp-add{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:var(--space-3);align-items:end;padding:var(--space-3) var(--space-4)}
.sp-duty{text-align:center}
.sp-duty input{width:18px;height:18px;accent-color:var(--primary);cursor:pointer}
@media (max-width:640px){.sp-add{grid-template-columns:1fr 1fr}}
`;

/** The places an account can belong to. */
const branchChoices = () => ['Head office', ...getBranchNames(), ...getWarehouseNames()];

export function AccountSheet({ id, onClose }) {
  const me = useMe();
  const acc = accountBy(id);
  const [p, setP] = useState(() => accountProps(id));
  const linked = useMemo(() => getAllPartners().filter((x) => x.to === id || (x.mode === 'direct' && x.account === id)), [id]);
  const terms = useMemo(() => getTerminals().filter((t) => linked.some((x) => x.id === 'card')), [linked]);
  if (!acc) return null;
  const bal = balanceOf(id);
  const archived = p.status === 'archived';
  const set = (patch) => setP({ ...p, ...patch });
  const toggleRole = (r) => set({ roles: p.roles.includes(r) ? p.roles.filter((x) => x !== r) : [...p.roles, r] });
  const save = (e) => {
    e.preventDefault();
    setAccountProps(id, { currency: p.currency, branch: p.branch, roles: p.roles, match: p.match });
    toast(`${accName(id)} saved`);
    onClose(true);
  };
  const archive = async () => {
    if (Math.abs(bal) >= 0.005) { toast(archiveAccount(id).message, { tone: 'error' }); return; }   // refused: it holds money
    const ok = await confirmDialog({ title: `Archive ${accName(id)}?`, body: 'It is hidden when you record money. Its history stays and you can restore it.', confirmLabel: 'Archive', tone: 'danger' });
    if (!ok) return;
    const r = archiveAccount(id, (me || {}).name);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    toast(r.message); onClose(true);
  };
  const restore = () => { const r = restoreAccount(id); toast(r.message); onClose(true); };
  const footer = (
    <div className="sp-foot">
      {archived ? <button type="button" className="gc-btn gc-btn--neutral sp-left" onClick={restore}>Restore</button>
        : <button type="button" className="gc-btn gc-btn--neutral sp-left" onClick={archive} title={Math.abs(bal) >= 0.005 ? 'Only an account at ৳0 can be archived' : undefined}>Archive</button>}
      <Link href={'/money?account=' + encodeURIComponent(id)} className="gc-btn gc-btn--neutral">Activity</Link>
      <button type="submit" form="sp-acc" className="gc-btn gc-btn--solid">Save</button>
    </div>
  );
  return (
    <Sheet open title={accName(id)} onClose={() => onClose(false)} footer={footer}>
      <form id="sp-acc" className="sp" onSubmit={save}>
        <div className="sp-sum"><b>{bal < 0 ? '−' : ''}{money(bal)}</b><span>{acc.type === 'Mobile' ? 'Mobile wallet' : acc.type} · opening {money(acc.opening)} · {archived ? <StatusBadge tone="neutral" icon="archive">Archived</StatusBadge> : <StatusBadge tone="success">Active</StatusBadge>}</span></div>
        {archived ? <div className="ac-note ac-note--info" role="status"><Icon name="archive" width="16" height="16" aria-hidden="true" /><span>Archived {p.archivedAt ? formatDate(p.archivedAt) : ''}{p.archivedBy ? ' by ' + p.archivedBy : ''}. It is hidden when money is recorded.{Math.abs(bal) >= 0.005 ? ` It holds ${money(bal)} again: restore it and move the money out.` : ''}</span></div> : null}
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="sp-cur">Currency</label><select id="sp-cur" className="gc-input gc-select" value={p.currency} onChange={(e) => set({ currency: e.target.value })}>{CURRENCIES.map(([c, l]) => <option key={c} value={c}>{l}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="sp-br">Branch</label><select id="sp-br" className="gc-input gc-select" value={p.branch} onChange={(e) => set({ branch: e.target.value })}><option value="">Whole shop</option>{branchChoices().map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
        </div>
        <div>
          <span className="gc-label">Who may use it <InfoTip text="The roles that can pay from or into this account. The owner can always." /></span>
          <div className="sp-roles ix-chips" role="group" aria-label="Who may use it">
            {Object.entries(ROLES).map(([r, x]) => <button key={r} type="button" className="ix-chip" aria-pressed={p.roles.includes(r)} onClick={() => toggleRole(r)}>{x.title}</button>)}
          </div>
        </div>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="sp-match">Statement matching</label><select id="sp-match" className="gc-input gc-select" value={p.match} onChange={(e) => set({ match: e.target.value })}>{MATCH_RULES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        </div>
        <KV rows={[
          ['Paid into it by', linked.length ? linked.map((x) => x.short).join(', ') : 'No payment partner'],
          terms.length ? ['Card machines', terms.map((t) => t.id).join(', ')] : null,
          ['Last matched', p.lastMatched ? formatDateTime(p.lastMatched) : 'Never'],
        ]} />
        {acc.type === 'Bank' || acc.type === 'Mobile' ? <Link href={'/statement-match?account=' + encodeURIComponent(id)} className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }}><Icon name="file-check-2" width="16" height="16" aria-hidden="true" />Match statement</Link> : null}
      </form>
    </Sheet>
  );
}

// ---- limits and duties ---------------------------------------------------------------------------------
export function ApprovalsPanel({ tick }) {
  const limits = useMemo(() => getLimits(), [tick]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [f, setF] = useState({ kind: 'expense', scope: 'amount', value: '', limit: '' });
  const cats = useMemo(() => getCategories('expense').map((c) => c.name), []);
  const accounts = useMemo(() => (tick ? OWN_ACCOUNTS() : []), [tick]);
  const values = f.scope === 'category' ? cats : f.scope === 'account' ? accounts.map((a) => a.id) : f.scope === 'branch' ? branchChoices() : [];
  const add = (e) => {
    e.preventDefault();
    const amt = Number(f.limit);
    if (f.limit === '' || !(amt >= 0)) { toast('Enter the amount over which it waits', { tone: 'error' }); return; }
    if (f.scope !== 'amount' && !f.value) { toast('Pick what the limit applies to', { tone: 'error' }); return; }
    const row = addLimit({ ...f, limit: amt });
    toast(`Limit added · ${limitText(row)}`);
    setF({ ...f, value: '', limit: '' });
  };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Restore the default limits and duties?', body: 'Limits you added are removed and every person gets their role’s duties again.', confirmLabel: 'Restore', tone: 'danger' }))) return;
    resetLimits(); resetDuties(); toast('Default limits and duties restored');
  };
  return (<>
    <header className="ix-card__head">
      <h2>Approval limits <InfoTip text="Above a limit, an expense, money move, refund or write-off waits in Approvals until someone else with the Approver duty approves it. Nothing is posted until then." /></h2>
      <span style={{ display: 'flex', gap: 'var(--space-2)' }}><Link href="/money-approvals" className="ix-btn ix-btn--sm">Approvals</Link><button type="button" className="ix-btn ix-btn--sm" onClick={reset}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Restore defaults</button></span>
    </header>
    <form className="sp-add" onSubmit={add}>
      <div><label className="gc-label" htmlFor="sp-l-kind">For</label><select id="sp-l-kind" className="gc-input gc-select" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div><label className="gc-label" htmlFor="sp-l-scope">Applies to</label><select id="sp-l-scope" className="gc-input gc-select" value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value, value: '' })}>{SCOPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div><label className="gc-label" htmlFor="sp-l-val">Which</label><select id="sp-l-val" className="gc-input gc-select" value={f.value} disabled={f.scope === 'amount'} onChange={(e) => setF({ ...f, value: e.target.value })}><option value="">{f.scope === 'amount' ? 'Every one' : 'Choose…'}</option>{values.map((v) => <option key={v} value={v}>{f.scope === 'account' ? accName(v) : v}</option>)}</select></div>
      <div><label className="gc-label" htmlFor="sp-l-amt">Over (৳)</label><input id="sp-l-amt" className="gc-input ac-fig" inputMode="numeric" value={f.limit} onChange={(e) => setF({ ...f, limit: e.target.value.replace(/[^\d]/g, '') })} placeholder="0 = every one" /></div>
      <button type="submit" className="gc-btn gc-btn--neutral"><Icon name="plus" width="16" height="16" aria-hidden="true" /> Add limit</button>
    </form>
    <div className="ix-table-wrap ix-table-wrap--show">
      <table className="ix-table ix-table--static gc-table--keep">
        <caption className="sr-only">Approval limits</caption>
        <thead><tr><th scope="col">Waits for approval</th><th scope="col">For</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{limits.map((r) => (
          <tr key={r.id}>
            <td className="ix-strong">{limitText(r)}</td>
            <td className="ix-muted">{KINDS.find((k) => k[0] === r.kind)[1]}</td>
            <td className="ac-act"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${limitText(r)}`} title="Remove" onClick={() => { removeLimit(r.id); toast('Limit removed'); }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
          </tr>))}</tbody>
      </table>
    </div>

    <section className="ac-sec" aria-labelledby="sp-duties">
      <header className="ix-card__head"><h2 id="sp-duties">Finance duties <InfoTip text="Who takes money at a counter, holds the cash, approves and matches statements. Each role has defaults; change them per person. The person who made a movement can never approve it." /></h2></header>
      <div className="ix-table-wrap ix-table-wrap--show" style={{ marginTop: 'var(--space-3)' }}>
        <table className="ix-table ix-table--static gc-table--keep">
          <caption className="sr-only">Finance duties per person</caption>
          <thead><tr><th scope="col">Person</th>{DUTIES.map(([d, label, help]) => <th key={d} scope="col" className="sp-duty" title={help}>{label}</th>)}</tr></thead>
          <tbody>{USERS.map((u) => { const has = dutiesOf(u); return (
            <tr key={u.id}>
              <td><span className="ix-strong">{u.name}</span> <span className="ix-muted">· {roleTitle(u)}</span>{changedFor(u.id) ? <> <StatusBadge tone="neutral" icon="pencil">Changed</StatusBadge></> : null}</td>
              {DUTIES.map(([d, label]) => <td key={d} className="sp-duty"><input type="checkbox" checked={has.includes(d)} aria-label={`${u.name}: ${label}`} onChange={(e) => { setDuty(u.id, d, e.target.checked); toast(`${u.name.split(' ')[0]} ${e.target.checked ? 'is now' : 'is no longer'} ${label.toLowerCase()}`); }} /></td>)}
            </tr>); })}</tbody>
        </table>
      </div>
    </section>
  </>);
}
