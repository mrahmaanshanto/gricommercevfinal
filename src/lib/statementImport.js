// statementImport — a bank or wallet statement brought in as a CSV and matched line by line to the money the
// books already show for that account (brief #6, "bank / MFS statement reconciliation").
//
//   parseStatement(text)        CSV or a copied table → [{ date, desc, ref, amount (+ in, − out), balance }]
//                               (columns are found by their header: date, description / details / narration,
//                               reference, debit / withdrawal, credit / deposit, or one signed amount)
//   importStatement(acc, rows)  adds the lines. Each line gets a key from the account, date, amount, reference,
//                               description and how many identical lines came before it in the same file, so
//                               importing the same statement again adds nothing twice. → { added, skipped }
//   autoMatch(acc)              each open line is matched to an entry of that account with the same amount
//                               within 3 days (the account's matching rule: 'ref' also needs the reference;
//                               'manual' never auto-matches). Each entry matches one line at most.
//   matchLine · unmatchLine · createEntryFor (posts an expense / income / transfer for a line the books don't
//   have yet) · ignoreLine (with a reason; it stays listed under Ignored)
// Unmatched lines stay visible until someone resolves them; nothing is forced to balance. Matching needs the
// Reconciler duty (financeDuties.js). Front end only: lines are kept in this browser (gc.fin.stmt).

import { getEntries, postEntry, accountProps, setAccountProps, accountBy } from './ledger';
import { currentUser } from './team';

const KEY = 'gc.fin.stmt';
const DAY = 864e5;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ssr = () => typeof window === 'undefined';
const read = () => { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ } };

export const LINE_STATUS = { open: ['To match', 'warning'], matched: ['Matched', 'success'], created: ['Entry made', 'success'], ignored: ['Ignored', 'neutral'] };

// ---- reading a file --------------------------------------------------------------------------------
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
/** '2026-09-06' · '06/09/2026' · '06-Sep-2026' · '6 Sep 2026' → 'YYYY-MM-DD' (or ''). */
export function parseDate(s) {
  const t = String(s || '').trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(t);
  if (m) return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = /^(\d{1,2})[\s-]([A-Za-z]{3})[a-z]*[\s-,]+(\d{4})$/.exec(t);
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${String(MONTHS[m[2].toLowerCase()]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}
/** One CSV line into cells (quotes kept together; tabs from a copied table work too). */
function cells(line) {
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  const out = []; let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}
const num = (s) => { const t = String(s || '').replace(/[৳,\s]|BDT|Tk\.?/gi, ''); if (!t) return 0; const neg = /^\(.*\)$/.test(t) || /Dr$/i.test(t); const n = Number(t.replace(/[()]|Dr$|Cr$/gi, '')); return Number.isNaN(n) ? NaN : neg ? -Math.abs(n) : n; };
/** Statement text → lines. Returns { rows, bad } (bad = lines that could not be read). */
export function parseStatement(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], bad: 0 };
  let head = cells(lines[0]).map((h) => h.toLowerCase());
  const hasHead = head.some((h) => /date/.test(h));
  const col = (re) => head.findIndex((h) => re.test(h));
  if (!hasHead) head = ['date', 'description', 'reference', 'amount'];
  const iDate = col(/date/), iDesc = col(/desc|detail|narration|particular|remark/), iRef = col(/ref|cheque|trx|txn/);
  const iDebit = col(/debit|withdraw|out/), iCredit = col(/credit|deposit|in$/), iAmt = col(/^amount|amount/), iBal = col(/balance/);
  const rows = []; let bad = 0;
  (hasHead ? lines.slice(1) : lines).forEach((l) => {
    const c = cells(l);
    const date = parseDate(c[iDate]);
    let amount = NaN;
    if (iDebit >= 0 || iCredit >= 0) amount = r2((iCredit >= 0 ? Math.abs(num(c[iCredit])) || 0 : 0) - (iDebit >= 0 ? Math.abs(num(c[iDebit])) || 0 : 0));
    else if (iAmt >= 0) amount = r2(num(c[iAmt]));
    if (!date || Number.isNaN(amount) || !amount) { bad += 1; return; }
    rows.push({ date, desc: iDesc >= 0 ? c[iDesc] || '' : '', ref: iRef >= 0 ? c[iRef] || '' : '', amount, balance: iBal >= 0 ? num(c[iBal]) : null });
  });
  return { rows, bad };
}

// ---- lines ------------------------------------------------------------------------------------------
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
/** The fingerprint of a statement line (the n-th identical line of a file gets its own). */
const keyOf = (account, r, n) => [account, r.date, r.amount.toFixed(2), norm(r.ref), norm(r.desc), n].join('|');
export const getLines = (account) => read().filter((l) => !account || l.account === account).sort((a, b) => b.date.localeCompare(a.date) || a.n - b.n);
export const lineBy = (key) => read().find((l) => l.key === key) || null;

/** Add the lines of a statement. Lines already imported (same key) are skipped. → { added, skipped, batch } */
export function importStatement(account, rows, fileName = 'Statement', user = currentUser()) {
  const acc = accountBy(account);
  if (!acc) return { added: 0, skipped: 0 };
  const have = new Set(read().map((l) => l.key));
  const seen = {};
  const batch = 'ST-' + Date.now().toString(36).toUpperCase();
  const fresh = [];
  rows.forEach((r, i) => {
    const base = keyOf(acc.id, r, 0);
    const n = (seen[base] = (seen[base] || 0) + 1) - 1;
    const key = keyOf(acc.id, r, n);
    if (have.has(key)) return;
    have.add(key);
    fresh.push({ key, account: acc.id, date: r.date, desc: r.desc, ref: r.ref, amount: r.amount, balance: r.balance, n: i, batch, file: fileName, importedAt: Date.now(), importedBy: user.name, status: 'open', log: [] });
  });
  write([...read(), ...fresh]);
  return { added: fresh.length, skipped: rows.length - fresh.length, batch };
}

const dayMs = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12).getTime(); };
const taken = (lines) => new Set(lines.filter((l) => l.entry).map((l) => l.entry));
/** Ledger entries of the line's account that could be this line (same amount, close date), best first. */
export function suggestionsFor(line, days = 7) {
  const used = taken(read().filter((l) => l.key !== line.key));
  const t = dayMs(line.date);
  const ref = norm(line.ref);
  return getEntries().filter((e) => e.account === line.account && Math.abs(r2(e.amount) - line.amount) < 0.005 && Math.abs(e.at - t) <= days * DAY && !used.has(e.id))
    .map((e) => ({ e, score: (ref && [e.ref, e.note, e.party, e.txn].some((x) => norm(x).includes(ref)) ? 0 : 1) * 1e12 + Math.abs(e.at - t) }))
    .sort((a, b) => a.score - b.score).map((x) => x.e);
}
/** Entries of the account with no statement line, in the statement's dates (to explain what the bank lacks). */
export function entriesWithoutLine(account) {
  const lines = getLines(account);
  if (!lines.length) return [];
  const from = dayMs(lines[lines.length - 1].date) - DAY, to = dayMs(lines[0].date) + DAY;
  const used = taken(lines);
  return getEntries().filter((e) => e.account === account && e.at >= from && e.at <= to && !used.has(e.id));
}

function setLine(key, patch, what, user) {
  const list = read();
  write(list.map((l) => (l.key === key ? { ...l, ...patch, log: [...(l.log || []), { at: Date.now(), by: user.name, what }] } : l)));
}
const touched = (account) => setAccountProps(account, { lastMatched: Date.now() });

/** Match every open line it can. Returns the number matched. */
export function autoMatch(account, user = currentUser()) {
  const rule = accountProps(account).match;
  if (rule === 'manual') return 0;
  let count = 0;
  read().filter((l) => l.account === account && l.status === 'open').sort((a, b) => a.date.localeCompare(b.date)).forEach((l) => {
    const hit = suggestionsFor(l, 3).find((e) => rule !== 'ref' || (l.ref && [e.ref, e.note, e.txn].some((x) => norm(x).includes(norm(l.ref)))));
    if (!hit) return;
    setLine(l.key, { status: 'matched', entry: hit.id, how: 'auto' }, 'Matched by amount and date', user);
    count += 1;
  });
  if (count) touched(account);
  return count;
}
/** Match a line to one entry by hand (a reason when the amount or date differs). */
export function matchLine(key, entryId, user = currentUser(), reason = '') {
  const l = lineBy(key);
  if (!l) return { ok: false, message: 'That line could not be found.' };
  if (taken(read().filter((x) => x.key !== key)).has(entryId)) return { ok: false, message: 'That entry is already matched to another line.' };
  setLine(key, { status: 'matched', entry: entryId, how: 'hand', reason }, 'Matched by hand' + (reason ? ' · ' + reason : ''), user);
  touched(l.account);
  return { ok: true };
}
export function unmatchLine(key, user = currentUser()) {
  setLine(key, { status: 'open', entry: null, how: '', reason: '' }, 'Unmatched', user);
  return { ok: true };
}
/** The books don't have this movement yet (a bank charge, interest, a transfer in): post it and match it. */
export function createEntryFor(key, { kind, cat, party }, user = currentUser()) {
  const l = lineBy(key);
  if (!l) return { ok: false, message: 'That line could not be found.' };
  const e = postEntry({ account: l.account, amount: l.amount, kind, cat: cat || undefined, party: party || l.desc, note: l.desc + (l.ref ? ' · ' + l.ref : ''), ref: l.ref || undefined, by: user.name, at: dayMs(l.date), stmt: l.key });
  if (!e) return { ok: false, message: 'That account could not be found.' };
  setLine(key, { status: 'created', entry: e.id, how: 'created' }, 'Entry made', user);
  touched(l.account);
  return { ok: true, entry: e };
}
export function ignoreLine(key, reason, user = currentUser()) {
  if (!String(reason || '').trim()) return { ok: false, message: 'Give a reason.' };
  setLine(key, { status: 'ignored', reason: reason.trim() }, 'Ignored · ' + reason.trim(), user);
  return { ok: true };
}
export function reopenLine(key, user = currentUser()) {
  setLine(key, { status: 'open', reason: '' }, 'Opened again', user);
  return { ok: true };
}

/** A demo BRAC Bank statement for September (most lines are in the books; three are not). */
export const SAMPLE_STATEMENT = [
  'Date,Description,Reference,Debit,Credit,Balance',
  '01/09/2026,Rent - Rahman Properties,CHQ 104411,45000,,597300',
  '01/09/2026,Salary transfer August,NEFT 0901,294180,,303120',
  '02/09/2026,Cash deposit,DEP 2201,,60000,363120',
  '06/09/2026,Cash deposit,DEP 2206,,95000,458120',
  '08/09/2026,Karim Traders,PAY-0141,85000,,373120',
  '09/09/2026,Cash deposit,DEP 2209,,95000,468120',
  '11/09/2026,Sunrise Distributors bonus,NPSB 7781,,12500,480620',
  '13/09/2026,Cash deposit,DEP 2213,,95000,575620',
  '15/09/2026,SMS and service charge,SC-0915,575,,575045',
  '16/09/2026,Cash deposit,DEP 2216,,95000,670045',
  '20/09/2026,Cash deposit,DEP 2220,,95000,765045',
  '20/09/2026,Mehedi Rahman,ATM 3320,30000,,735045',
  '21/09/2026,NPSB transfer Jamal Telecom,NPSB 8812,,28900,763945',
  '23/09/2026,Cash deposit,DEP 2223,,95000,858945',
  '26/09/2026,Bengal Packaging,PAY-0149,28000,,830945',
  '27/09/2026,Cash deposit,DEP 2227,,95000,925945',
  '30/09/2026,Cash deposit,DEP 2230,,95000,1020945',
  '30/09/2026,bKash PGW settlement,bkash-pgw:2026-09-30,,4442.35,1025387.35',
  '30/09/2026,Excise duty,ED-Q3,500,,1024887.35',
].join('\n');
