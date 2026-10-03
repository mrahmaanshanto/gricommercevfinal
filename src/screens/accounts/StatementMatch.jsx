'use client';
// StatementMatch — "Match statements": a bank or wallet statement brought in as a CSV and matched line by line
// to the money in the books (brief #6, "bank / MFS statement reconciliation"). A Shopify list page:
//   figures   lines to match (and their money), matched, the books' entries the statement doesn't have, last matched
//   card      the account (a pill select), views To match · Matched · Ignored · All, search; a row opens its panel
//   panel     an open line: the entries it could be (same amount, close date) to match, or make the entry the
//             books lack (bank charge, interest, a transfer in …), or ignore it with a reason; a matched line can
//             be unmatched. Nothing is forced to balance: unmatched lines stay until someone resolves them.
//   Import    a CSV file or pasted rows (a sample BRAC Bank statement is offered); the same statement imported
//             again adds nothing twice; then every line it can is matched by amount and date.
// Matching needs the Reconciler duty (Accounts setup › Approvals). ?account=<id> · ?view=open|matched|ignored|all
// Front end only: lib/statementImport.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { formatDate, formatDateTime } from '@/lib/format';
import { OWN_ACCOUNTS, accountProps, getEntries, KIND_LABEL, isArchived } from '@/lib/ledger';
import { getCategories } from '@/lib/categories';
import { canReconcile } from '@/lib/financeDuties';
import {
  getLines, lineBy, parseStatement, importStatement, autoMatch, suggestionsFor, entriesWithoutLine, matchLine, unmatchLine,
  createEntryFor, ignoreLine, reopenLine, LINE_STATUS, SAMPLE_STATEMENT,
} from '@/lib/statementImport';
import { AccPage, useBooks, useMe, money, signed, shortDate, accName } from './accShared';

const VIEWS = [['open', 'To match'], ['matched', 'Matched'], ['ignored', 'Ignored'], ['all', 'All']];
const ABOUT = 'Bring in a bank or wallet statement and match each line to the money in the books. Lines that don’t match stay here until you match them, make the missing entry, or ignore them with a reason.';
const MAKE = [['expense', 'Expense or bank charge', -1], ['income', 'Other income', 1], ['cash in', 'Money in from another account or person', 1], ['paid out', 'Other money out', -1]];
const CSS = `
.sm-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.sm-in{color:var(--text-success)}
.sm-out{color:var(--text-danger)}
.sm{display:flex;flex-direction:column;gap:var(--space-4)}
.sm-sum{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.sm-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sm-sum span{font-size:var(--text-xs);color:var(--text-muted)}
.sm h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.sm-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end;width:100%}
.sm-foot .sm-left{margin-right:auto}
.sm-area{height:auto;min-height:96px;padding:10px 12px;font-family:var(--font-data)}
.sm-log{list-style:none;margin:0;padding:0}
.sm-log li{display:flex;justify-content:space-between;gap:var(--space-3);padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-xs)}
.sm-log li:first-child{border-top:0}
.sm-log small{color:var(--text-muted);white-space:nowrap}
`;
const dayOf = (k) => new Date(k + 'T12:00:00').getTime();

export default function StatementMatch() {
  const tick = useBooks();
  const me = useMe();
  const [account, setAccount] = useState('brac');
  const [view, setView] = useState('open');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [openKey, setOpenKey] = useState('');
  const [importing, setImporting] = useState(false);
  const booted = useRef(false);

  useEffect(() => {
    if (!tick || booted.current) return;
    booted.current = true;
    const u = new URLSearchParams(window.location.search);
    const a = u.get('account');
    if (a && OWN_ACCOUNTS().some((x) => x.id === a)) setAccount(a);
    const v = u.get('view');
    if (VIEWS.some((x) => x[0] === v)) setView(v);
  }, [tick]);
  const setUrl = (k, v) => { const u = new URL(window.location.href); u.searchParams.set(k, v); window.history.replaceState(window.history.state, '', u.pathname + u.search); };
  const pickAccount = (a) => { setAccount(a); setUrl('account', a); };
  const pickView = (v) => { setView(v); setUrl('view', v); };

  const d = useMemo(() => {
    if (!tick) return null;
    const lines = getLines(account);
    return { lines, missing: entriesWithoutLine(account), props: accountProps(account), entries: Object.fromEntries(getEntries().filter((e) => e.account === account).map((e) => [e.id, e])) };
  }, [tick, account]);
  const accounts = useMemo(() => (tick ? OWN_ACCOUNTS().filter((a) => (a.type === 'Bank' || a.type === 'Mobile') && !a.credits && (!isArchived(a.id) || a.id === account)) : []), [tick, account]);
  const may = me ? canReconcile(me) : { ok: true };

  const words = q.trim().toLowerCase();
  const isView = (l, v) => (v === 'all' ? true : v === 'matched' ? l.status === 'matched' || l.status === 'created' : l.status === v);
  const rows = d ? d.lines.filter((l) => isView(l, view) && (!words || [l.desc, l.ref, l.date, String(l.amount)].join(' ').toLowerCase().includes(words))) : [];
  const count = (v) => (d ? d.lines.filter((l) => isView(l, v)).length : null);
  const open = d ? d.lines.filter((l) => l.status === 'open') : [];
  const tabs = VIEWS.map(([v, label]) => ({ key: v, id: 'sm-tab-' + v, label, count: count(v), on: view === v, onClick: () => pickView(v) }));
  const runAuto = () => {
    if (!may.ok) { toast(may.why, { tone: 'error' }); return; }
    const n = autoMatch(account, me);
    toast(n ? `${n} line${n === 1 ? '' : 's'} matched` : d.props.match === 'manual' ? `${accName(account)} is matched by hand only` : 'No more lines match by amount and date');
  };
  const openLine = openKey ? lineBy(openKey) : null;

  return (
    <AccPage screen="StatementMatch" active="acc-match" page="Match statements" title="Match statements" css={CSS} icon="file-check-2" about={ABOUT}
      secondary={[{ label: 'Match all', onClick: runAuto }]}
      more={[{ label: 'Money', href: '/money?account=' + encodeURIComponent(account) }, { label: 'Payouts', href: '/settlements' }, { label: 'Banks & wallets', href: '/account-setup?tab=accounts' }]}
      primary={{ label: 'Import statement', onClick: () => setImporting(true) }}>
      {!may.ok ? <div className="ac-note ac-note--warn" role="status"><Icon name="user-check" width="16" height="16" aria-hidden="true" /><span>{may.why} You can look, but not match.</span></div> : null}
      <MetricStrip label={accName(account)} items={[
        { label: 'To match', value: d ? String(open.length) : '—', sub: d ? money(open.reduce((a, l) => a + Math.abs(l.amount), 0)) : '', onClick: () => pickView('open'), on: view === 'open' },
        { label: 'Matched', value: d ? String(count('matched')) : '—', sub: d && d.lines.length ? `of ${d.lines.length} lines` : 'No statement yet', onClick: () => pickView('matched'), on: view === 'matched' },
        { label: 'In the books, not on the statement', value: d ? String(d.missing.length) : '—', sub: d ? money(d.missing.reduce((a, e) => a + Math.abs(e.amount), 0)) : '' },
        { label: 'Last matched', value: d && d.props.lastMatched ? shortDate(d.props.lastMatched) : '—', sub: d ? (d.props.match === 'manual' ? 'By hand only' : d.props.match === 'ref' ? 'Amount and reference' : 'Amount and date') : '' },
      ]} />

      <section className="ix-card" aria-label="Statement lines">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Description, reference, amount…" onDone={() => { setQ(''); setFind(false); }} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setFind(false); }}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Statement lines" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
        <div className="ix-filters" role="group" aria-label="Account">
          <select aria-label="Account" className="ix-filter is-set" value={account} onChange={(e) => pickAccount(e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{accName(a.id)}</option>)}
          </select>
        </div>
        <div role="tabpanel" aria-labelledby={'sm-tab-' + view}>
          {!d ? <p className="ac-wait">Reading the books…</p> : !d.lines.length ? (
            <div className="ix-empty"><EmptyState icon="file-up" title={`No statement for ${accName(account)} yet`} actionLabel="Import statement" onAction={() => setImporting(true)} /></div>
          ) : rows.length ? (<>
            <ul className="ix-plist" aria-label="Statement lines">{rows.map((l) => (
              <li key={l.key}><button type="button" className="ix-pitem" onClick={() => setOpenKey(l.key)}>
                <span className="ix-pitem__top"><b>{l.desc || l.ref || 'Line'}</b><span className={'sm-fig ' + (l.amount > 0 ? 'sm-in' : 'sm-out')}>{signed(l.amount)}</span></span>
                <span className="ix-pitem__mid">{shortDate(dayOf(l.date))}{l.ref ? ' · ' + l.ref : ''}</span>
                <span className="ix-pitem__tags"><StatusBadge tone={LINE_STATUS[l.status][1]}>{LINE_STATUS[l.status][0]}</StatusBadge></span>
              </button></li>))}</ul>
            <div className="ix-table-wrap"><table className="ix-table gc-table--keep">
              <caption className="sr-only">Statement lines of {accName(account)}</caption>
              <thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Reference</th><th scope="col">Status</th><th scope="col" className="ix-num">In</th><th scope="col" className="ix-num">Out</th></tr></thead>
              <tbody>{rows.map((l) => (
                <tr key={l.key} onClick={() => setOpenKey(l.key)}>
                  <td className="ix-nowrap">{shortDate(dayOf(l.date))}</td>
                  <td><span className="ac-trunc ix-strong">{l.desc || '—'}</span></td>
                  <td className="ix-muted sm-fig">{l.ref || '—'}</td>
                  <td><StatusBadge tone={LINE_STATUS[l.status][1]}>{LINE_STATUS[l.status][0]}</StatusBadge></td>
                  <td className="ix-num sm-fig sm-in">{l.amount > 0 ? money(l.amount) : ''}</td>
                  <td className="ix-num sm-fig sm-out">{l.amount < 0 ? money(l.amount) : ''}</td>
                </tr>))}</tbody>
            </table></div>
          </>) : <div className="ix-empty"><EmptyState icon={words ? 'search-x' : 'circle-check'} title={words ? 'Nothing matches that search' : view === 'open' ? 'Every line is matched' : 'Nothing here'} /></div>}
        </div>
        <div className="ix-foot"><span>{d && d.lines.length ? `${rows.length} of ${d.lines.length} lines` : ''}</span></div>
      </section>
      <LearnMore topic="statement matching" />

      {openLine ? <LinePanel key={openLine.key + openLine.status} line={openLine} entries={d ? d.entries : {}} me={me} may={may} onClose={() => setOpenKey('')} /> : null}
      {importing ? <ImportDialog account={account} accounts={accounts} me={me} onClose={(acc) => { setImporting(false); if (acc) { pickAccount(acc); pickView('open'); } }} /> : null}
    </AccPage>
  );
}

function LinePanel({ line, entries, me, may, onClose }) {
  const sugg = useMemo(() => (line.status === 'open' ? suggestionsFor(line, 10) : []), [line]);
  const [pick, setPick] = useState(sugg[0] ? sugg[0].id : '');
  const [mode, setMode] = useState('');     // '' | 'make' | 'ignore'
  const sign = line.amount > 0 ? 1 : -1;
  const makeKinds = MAKE.filter((m) => m[2] === sign);
  const [kind, setKind] = useState(makeKinds[0][0]);
  const cats = useMemo(() => (kind === 'expense' ? getCategories('expense') : kind === 'income' ? getCategories('income') : []), [kind]);
  const [cat, setCat] = useState(kind === 'expense' ? 'Bank charges' : '');
  const [party, setParty] = useState(line.desc || '');
  const [why, setWhy] = useState('');
  const entry = line.entry ? entries[line.entry] || getEntries().find((e) => e.id === line.entry) : null;
  const done = (r, msg) => { if (!r.ok) { toast(r.message, { tone: 'error' }); return; } toast(msg); onClose(); };
  const save = (e) => {
    e.preventDefault();
    if (!may.ok) { toast(may.why, { tone: 'error' }); return; }
    if (mode === 'ignore') return done(ignoreLine(line.key, why, me), 'Line ignored');
    if (mode === 'make') return done(createEntryFor(line.key, { kind, cat: kind === 'expense' || kind === 'income' ? cat : '', party }, me), `${KIND_LABEL[kind] || kind} recorded and matched`);
    if (!pick) { toast('Pick the entry it matches', { tone: 'error' }); return; }
    return done(matchLine(line.key, pick, me), 'Line matched');
  };
  const openFoot = (
    <div className="sm-foot">
      {mode ? <button type="button" className="gc-btn gc-btn--neutral sm-left" onClick={() => setMode('')}>Back</button> : <>
        <button type="button" className="gc-btn gc-btn--neutral sm-left" onClick={() => setMode('ignore')} disabled={!may.ok}>Ignore</button>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('make')} disabled={!may.ok}>Make entry</button>
      </>}
      <button type="submit" form="sm-line" className="gc-btn gc-btn--solid" disabled={!may.ok || (!mode && !sugg.length)}>{mode === 'ignore' ? 'Ignore line' : mode === 'make' ? 'Record and match' : 'Match'}</button>
    </div>
  );
  const footer = line.status === 'open' ? openFoot : (
    <div className="sm-foot">
      <span className="sm-left" />
      {line.status === 'ignored' ? <button type="button" className="gc-btn gc-btn--neutral" disabled={!may.ok} onClick={() => done(reopenLine(line.key, me), 'Line opened again')}>Open again</button>
        : line.status === 'matched' ? <button type="button" className="gc-btn gc-btn--neutral" disabled={!may.ok} onClick={() => done(unmatchLine(line.key, me), 'Line unmatched')}>Unmatch</button> : null}
      <button type="button" className="gc-btn gc-btn--solid" onClick={onClose}>Done</button>
    </div>
  );
  return (
    <Sheet open title={`${signed(line.amount)} · ${shortDate(dayOf(line.date))}`} onClose={onClose} footer={footer}>
      <form id="sm-line" className="sm" onSubmit={save}>
        <div className="sm-sum"><b>{line.desc || 'Statement line'}</b><span>{accName(line.account)} · {line.ref || 'No reference'} · <StatusBadge tone={LINE_STATUS[line.status][1]}>{LINE_STATUS[line.status][0]}</StatusBadge></span></div>
        <KV rows={[
          ['Date', formatDate(dayOf(line.date))],
          ['Amount', <span key="a" className="sm-fig">{signed(line.amount)}</span>],
          line.balance != null ? ['Balance after', <span key="b" className="sm-fig">{money(line.balance)}</span>] : null,
          ['From file', `${line.file} · ${formatDateTime(line.importedAt)}`],
          entry ? ['Matched to', `${entry.cat || KIND_LABEL[entry.kind] || entry.kind} · ${entry.party || ''} · ${shortDate(entry.at)}`] : null,
          line.reason ? ['Reason', line.reason] : null,
        ]} />
        {line.status === 'open' && !mode ? (
          <div>
            <h3>Entries it could be</h3>
            {sugg.length ? (
              <div className="ac-opts" role="radiogroup" aria-label="Entries it could be">
                {sugg.map((e) => (
                  <label key={e.id} className={'ac-opt' + (pick === e.id ? ' is-on' : '')}>
                    <input type="radio" name="sm-pick" checked={pick === e.id} onChange={() => setPick(e.id)} />
                    <span><b>{e.cat || KIND_LABEL[e.kind] || e.kind} · <span className="sm-fig">{signed(e.amount)}</span></b><small>{shortDate(e.at)} · {[e.party, e.note].filter(Boolean).join(' · ')}</small></span>
                  </label>
                ))}
              </div>
            ) : <p className="gc-help" style={{ margin: 0 }}>The books have no {money(line.amount)} {line.amount > 0 ? 'coming into' : 'going out of'} {accName(line.account)} near this date. Make the entry if it is real.</p>}
          </div>
        ) : null}
        {mode === 'make' ? (<>
          <div><label className="gc-label" htmlFor="sm-kind">What is it?</label><select id="sm-kind" className="gc-input gc-select" value={kind} onChange={(e) => { setKind(e.target.value); setCat(e.target.value === 'expense' ? 'Bank charges' : ''); }}>{makeKinds.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          {cats.length ? <div><label className="gc-label" htmlFor="sm-cat">Category</label><select id="sm-cat" className="gc-input gc-select" value={cat} onChange={(e) => setCat(e.target.value)}>{kind === 'expense' && !cats.some((c) => c.name === 'Bank charges') ? <option value="Bank charges">Bank charges</option> : null}<option value="">Choose…</option>{cats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div> : null}
          <div><label className="gc-label" htmlFor="sm-party">{sign > 0 ? 'From' : 'Paid to'}</label><input id="sm-party" className="gc-input" value={party} onChange={(e) => setParty(e.target.value)} /></div>
          <p className="gc-help" style={{ margin: 0 }}>It is recorded in {accName(line.account)} on {formatDate(dayOf(line.date))} and matched to this line.</p>
        </>) : null}
        {mode === 'ignore' ? <div><label className="gc-label" htmlFor="sm-why">Why ignore it?</label><input id="sm-why" className="gc-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. Reversed by the bank the same day" data-autofocus /></div> : null}
        {(line.log || []).length ? <div><h3>History</h3><ul className="sm-log">{line.log.slice().reverse().map((h, i) => <li key={i}><span>{h.what} · {h.by}</span><small>{formatDateTime(h.at)}</small></li>)}</ul></div> : null}
      </form>
    </Sheet>
  );
}

function ImportDialog({ account, accounts, me, onClose }) {
  const [acc, setAcc] = useState(account);
  const [text, setText] = useState('');
  const [file, setFile] = useState('');
  const parsed = useMemo(() => (text.trim() ? parseStatement(text) : null), [text]);
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; setFile(f.name); const rd = new FileReader(); rd.onload = () => setText(String(rd.result || '')); rd.readAsText(f); };
  const sample = () => { setAcc('brac'); setFile('BRAC-September-2026.csv'); setText(SAMPLE_STATEMENT); };
  const save = (e) => {
    e.preventDefault();
    if (!parsed || !parsed.rows.length) { toast('No line could be read. The file needs a date and an amount on each line.', { tone: 'error' }); return; }
    const r = importStatement(acc, parsed.rows, file || 'Pasted lines', me);
    const n = r.added ? autoMatch(acc, me) : 0;
    toast(r.added ? `${r.added} line${r.added === 1 ? '' : 's'} added${r.skipped ? `, ${r.skipped} already in` : ''} · ${n} matched` : `All ${r.skipped} lines were already in. Nothing added.`);
    onClose(acc);
  };
  return (
    <Dialog open title="Import statement" onClose={() => onClose('')} width={600}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose('')}>Cancel</button><button type="submit" form="sm-imp" className="gc-btn gc-btn--solid">Import{parsed && parsed.rows.length ? ` ${parsed.rows.length} lines` : ''}</button></>}>
      <form id="sm-imp" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="sm-acc">Account</label><select id="sm-acc" className="gc-input gc-select" value={acc} onChange={(e) => setAcc(e.target.value)}>{accounts.map((a) => <option key={a.id} value={a.id}>{accName(a.id)}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="sm-file">Statement file (CSV)</label><input id="sm-file" type="file" accept=".csv,.txt,text/csv,text/plain" className="gc-input" onChange={onFile} /></div>
        </div>
        <div>
          <label className="gc-label" htmlFor="sm-text">Or paste the rows</label>
          <textarea id="sm-text" className="gc-input sm-area" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Date,Description,Reference,Debit,Credit\n15/09/2026,SMS charge,SC-0915,575,'} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button type="button" className="ix-btn ix-btn--sm" onClick={sample}><Icon name="file-text" width="16" height="16" aria-hidden="true" />Use a sample BRAC Bank statement</button>
          {parsed ? <span className="gc-help" style={{ margin: 0 }}>{parsed.rows.length} line{parsed.rows.length === 1 ? '' : 's'} read{parsed.bad ? ` · ${parsed.bad} skipped` : ''}</span> : null}
        </div>
        <p className="gc-help" style={{ margin: 0 }}>Importing the same statement again adds nothing twice.</p>
      </form>
    </Dialog>
  );
}
