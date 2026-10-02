'use client';
// PosManage — the back office of the POS register, in four tabs:
//   Counters        register a counter at a branch or warehouse and choose who may work it
//   Shifts          who is on a counter now, what each employee sold, and every closed shift
//   Cash pickups    cash taken out of (or put into) any counter's drawer
//   Settings        the rules the register follows
// Front end only: it reads and writes the same browser storage as the register (src/lib/posStore.js).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { POS_KEYS, load, getCounters, saveCounters, getShifts, getCash, saveCash, getSettings, saveSettings, shiftReport, nextId, LOCATIONS, EMPLOYEES, MANAGERS, CASH_PLACES, CASH_LABEL, DEFAULT_SETTINGS, postCashMove, getPosLocations } from '@/lib/posStore';

const TABS = [['counters', 'Counters', 'store'], ['shifts', 'Employees and shifts', 'users'], ['cash', 'Cash pickups', 'hand-coins'], ['settings', 'Settings', 'settings']];
const PRINTERS = ['Epson TM-T82 · USB', 'Epson TM-T82 · LAN', 'Xprinter XP-80 · USB', 'No printer'];
const BLANK = { id: '', name: '', location: LOCATIONS[0].name, stock: LOCATIONS[0].name, printer: PRINTERS[0], float: '2000', staff: [], active: true };
const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const num = (v) => Math.max(0, Number(v) || 0);
const diffBadge = (d) => (d === 0 ? ['success', 'Matches'] : d > 0 ? ['info', 'Over ' + money(d)] : ['error', 'Short ' + money(-d)]);

const CSS = `
.pm-tabs{margin-top:calc(-1 * var(--space-2))}
.pm-tab{display:inline-flex;align-items:center;gap:8px}
.pm-card{overflow:hidden}
.pm-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.pm-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pm-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.pm-head__actions{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pm-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pm-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.pm-num{text-align:right;font-variant-numeric:tabular-nums}
.pm-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.pm-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
.pm-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-4)}
.pm-kpi{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.pm-kpi__ico{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.pm-kpi div span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pm-kpi b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pm-live{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4) var(--space-6);padding:var(--space-4) var(--space-5);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.pm-live__who{display:flex;align-items:center;gap:var(--space-3);margin-right:auto}
.pm-avatar{display:grid;place-items:center;width:40px;height:40px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pm-live dl{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-6);margin:0}
.pm-live dt{font-size:var(--text-xs);color:var(--text-muted)}
.pm-live dd{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.pm-form{display:flex;flex-direction:column;gap:var(--space-4)}
.pm-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.pm-checks{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}
.pm-check{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.pm-check small{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted)}
.pm-rows{margin:0;padding:0;list-style:none}
.pm-rows li{display:flex;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.pm-rows li span:last-child{font-weight:var(--weight-medium);color:var(--text-heading)}
.pm-total{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.pm-total b{font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.pm-cap{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.pm-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-5);padding:0 var(--space-5) var(--space-5)}
.pm-switch{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);min-height:44px;font-size:var(--text-sm);color:var(--text-body)}
.pm-switch small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pm-foot{display:flex;justify-content:flex-end;gap:var(--space-2);padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-subtle)}
.pm-rowbtn{border:0;background:none;padding:0;font:inherit;text-align:left;color:inherit;cursor:pointer}
.pm-rowbtn:hover .pm-strong{color:var(--primary)}
@media (max-width:1023px){.pm-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-settings{grid-template-columns:minmax(0,1fr)}}
@media (max-width:599px){.pm-two,.pm-checks{grid-template-columns:1fr}}
@media (max-width:640px){
  /* page title + "More" + main button share one row: the title keeps whole words (never split mid-word),
     the main button is a little narrower; if they still do not fit, the row wraps */
  [data-screen="PosManage"] .gc-shell__content .gc-pagehead>.gc-pagehead__text{flex-basis:0!important;min-width:min-content!important}
  [data-screen="PosManage"] .gc-pagehead__actions .gc-btn--solid{padding:0 var(--space-3)}
}
`;

const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);

export default function PosManage() {
  const [tab, setTabState] = useState('counters');
  const [counters, setCounters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [cash, setCash] = useState([]);
  const [cfg, setCfg] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_SETTINGS);
  const [open, setOpen] = useState(null);       // the shift open on this device, if any
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(null);       // counter being registered or edited
  const [err, setErr] = useState('');
  const [pickup, setPickup] = useState(null);   // { counter, amount, by, to, note }
  const [report, setReport] = useState(null);   // closed shift shown in the report dialog
  const [who, setWho] = useState('');           // employee filter on the shift history

  useEffect(() => {
    setCounters(getCounters()); setShifts(getShifts()); setCash(getCash());
    const set = getSettings(); setCfg(set); setSaved(set);
    setOpen(load(POS_KEYS.shift, null)); setSales(load(POS_KEYS.sales, []));
    const read = () => { const want = new URLSearchParams(window.location.search).get('tab'); setTabState(TABS.some((x) => x[0] === want) ? want : 'counters'); };
    read();
    window.addEventListener('gc:route', read); window.addEventListener('popstate', read);
    return () => { window.removeEventListener('gc:route', read); window.removeEventListener('popstate', read); };
  }, []);

  const setTab = (next) => {
    setTabState(next);
    window.history.replaceState(null, '', window.location.pathname + (next === 'counters' ? '' : '?tab=' + next));
    window.dispatchEvent(new CustomEvent('gc:route'));
  };
  const live = open ? shiftReport(open, sales, cash) : null;
  const dirty = JSON.stringify(cfg) !== JSON.stringify(saved);

  // ---- counters -----------------------------------------------------------------------------------
  const saveCounter = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { setErr('Enter a name for the counter.'); return; }
    if (counters.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== form.id)) { setErr('Another counter already has this name.'); return; }
    if (!form.staff.length) { setErr('Choose at least one employee who can work this counter.'); return; }
    const row = { ...form, name, float: num(form.float), id: form.id || nextId('REG', counters) };
    const next = form.id ? counters.map((c) => (c.id === form.id ? row : c)) : [...counters, row];
    setCounters(next); saveCounters(next); setForm(null); setErr('');
    toast(form.id ? `${row.name} updated` : `${row.id} · ${row.name} registered at ${row.location}`);
  };
  const toggleActive = async (c) => {
    if (open && open.counter === c.name) { toast(`${c.name} has an open shift. End the shift first.`, { tone: 'error' }); return; }
    if (c.active && !(await confirmDialog({ title: `Turn off ${c.name}?`, body: 'It will not be offered when a register is opened. Its past shifts stay in the history.', confirmLabel: 'Turn off' }))) return;
    const next = counters.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x));
    setCounters(next); saveCounters(next);
    toast(`${c.name} is ${c.active ? 'off' : 'on'}`);
  };

  // ---- cash pickup from any counter ---------------------------------------------------------------
  const startPickup = (counter) => setPickup({ counter: counter || (open ? open.counter : (counters.find((c) => c.active) || {}).name || ''), amount: '', by: MANAGERS[0], to: CASH_PLACES[0], note: '' });
  const savePickup = (e) => {
    e.preventDefault();
    const amount = num(pickup.amount);
    if (!amount || !pickup.counter) return;
    const here = open && open.counter === pickup.counter;
    if (here && amount > live.expected) { toast(`Only ${money(live.expected)} is in that drawer`, { tone: 'error' }); return; }
    const entry = { id: nextId('CM', cash), type: 'pickup', counter: pickup.counter, amount, by: pickup.by, to: pickup.to, note: pickup.note.trim(), cashier: here ? open.cashier : '—', at: Date.now(), shiftAt: here ? open.openedAt : null };
    const next = [entry, ...cash];
    setCash(next); saveCash(next); setPickup(null);
    postCashMove(entry);   // drawer → safe, bank or head office in Accounts
    toast(`${money(amount)} picked up from ${entry.counter} by ${entry.by} · ${entry.to}`);
  };

  const employeeRows = EMPLOYEES.map((e) => {
    const own = shifts.filter((s) => s.cashier === e.name);
    const on = open && open.cashier === e.name;
    return {
      ...e, on,
      counters: counters.filter((c) => c.staff.includes(e.name)).map((c) => c.id),
      shifts: own.length + (on ? 1 : 0),
      count: own.reduce((a, s) => a + s.count, 0) + (on ? live.count : 0),
      sold: own.reduce((a, s) => a + s.sold, 0) + (on ? live.sold : 0),
      diff: own.reduce((a, s) => a + s.diff, 0),
    };
  });
  const history = shifts.filter((s) => !who || s.cashier === who);
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const picked = cash.filter((m) => m.type === 'pickup');

  return (
    <div className="dc-screen ds" data-screen="PosManage">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="pos-counters" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="POS" page="POS management" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="POS management"
              about="Counters, the employees who work them, their shifts and the cash taken out of each drawer."
              actions={<>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={() => startPickup()}><Icon name="hand-coins" width="18" height="18" aria-hidden="true" /> Cash pickup</button>
                <Link href="/pos" className="gc-btn gc-btn--solid"><Icon name="scan-line" width="18" height="18" aria-hidden="true" /> {open ? 'Go to register' : 'Open register'}</Link>
              </>}
            />

            <div className="gc-tabs pm-tabs" role="tablist" aria-label="POS management">
              {TABS.map(([id, label, icon]) => (
                <button key={id} type="button" role="tab" id={'pm-tab-' + id} aria-selected={tab === id} aria-controls="pm-panel" className={'gc-tab pm-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}><Icon name={icon} width="16" height="16" aria-hidden="true" />{label}</button>
              ))}
            </div>

            <div id="pm-panel" role="tabpanel" aria-labelledby={'pm-tab-' + tab} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* ---- counters ---- */}
              {tab === 'counters' ? (
                <section className="gc-card pm-card">
                  <div className="pm-head">
                    <div><h2>Counters</h2><p>{counters.filter((c) => c.active).length} in use</p></div>
                    <button type="button" className="gc-btn gc-btn--solid" onClick={() => { setErr(''); setForm({ ...BLANK, float: String(cfg.float) }); }}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Register a counter</button>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="gc-table gc-table--compact gc-table--hoverable">
                      <thead><tr><th scope="col">Counter</th><th scope="col">Branch or warehouse</th><th scope="col">Employees</th><th scope="col">Now</th><th scope="col" className="pm-num">Cash in drawer</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {counters.map((c) => {
                          const isOpen = open && open.counter === c.name;
                          return (
                            <tr key={c.id}>
                              <td><span className="pm-strong">{c.name}</span><span className="pm-sub"><span className="pm-id">{c.id}</span> · {c.printer}</span></td>
                              <td>{c.location}<span className="pm-sub">Sells from {c.stock}</span></td>
                              <td>{c.staff.slice(0, 2).join(', ')}{c.staff.length > 2 ? ` +${c.staff.length - 2}` : ''}<span className="pm-sub">{c.staff.length} can open it</span></td>
                              <td>{!c.active ? <span className="gc-badge gc-badge--slate">Off</span> : isOpen ? <><span className="gc-badge gc-badge--success">Open</span><span className="pm-sub">{open.cashier} since {formatTime(open.openedAt)}</span></> : <span className="gc-badge gc-badge--warning">Closed</span>}</td>
                              <td className="pm-num">{isOpen ? money(live.expected) : '—'}</td>
                              <td><div className="pm-actions">
                                {isOpen ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => startPickup(c.name)}>Pick up cash</button> : null}
                                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { setErr(''); setForm({ ...c, float: String(c.float) }); }} aria-label={`Edit ${c.name}`}>Edit</button>
                                <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => toggleActive(c)} aria-label={`Turn ${c.active ? 'off' : 'on'} ${c.name}`}>{c.active ? 'Turn off' : 'Turn on'}</button>
                              </div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              {/* ---- employees and shifts ---- */}
              {tab === 'shifts' ? (
                <>
                  {open ? (
                    <div className="pm-live">
                      <div className="pm-live__who"><span className="pm-avatar" aria-hidden="true">{initials(open.cashier)}</span><div><span className="pm-strong">{open.cashier}</span><span className="pm-sub">On {open.counter} since {formatTime(open.openedAt)}</span></div><span className="gc-badge gc-badge--success">On shift</span></div>
                      <dl>
                        <div><dt>Sales</dt><dd>{live.count}</dd></div>
                        <div><dt>Sold</dt><dd>{money(live.sold)}</dd></div>
                        <div><dt>Cash in drawer</dt><dd>{money(live.expected)}</dd></div>
                      </dl>
                      <div className="pm-head__actions">
                        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => startPickup(open.counter)}>Pick up cash</button>
                        <button type="button" className="gc-btn gc-btn--solid" onClick={() => navigate('/pos?panel=close')}>End shift</button>
                      </div>
                    </div>
                  ) : null}

                  <section className="gc-card pm-card">
                    <div className="pm-head"><div><h2>Counter employees</h2></div>{who ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setWho('')}>Show everyone</button> : null}</div>
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact gc-table--hoverable">
                        <thead><tr><th scope="col">Employee</th><th scope="col">Branch</th><th scope="col">Counters</th><th scope="col" className="pm-num">Shifts</th><th scope="col" className="pm-num">Sales</th><th scope="col" className="pm-num">Sold</th><th scope="col">Cash difference</th><th scope="col">Now</th></tr></thead>
                        <tbody>
                          {employeeRows.map((e) => (
                            <tr key={e.name} aria-selected={who === e.name}>
                              <td><button type="button" className="pm-rowbtn" aria-pressed={who === e.name} onClick={() => setWho(who === e.name ? '' : e.name)}><span className="pm-strong">{e.name}</span><span className="pm-sub">{e.role}</span></button></td>
                              <td>{e.branch}</td>
                              <td>{e.counters.length ? e.counters.join(', ') : <span className="pm-sub">None</span>}</td>
                              <td className="pm-num">{e.shifts}</td>
                              <td className="pm-num">{e.count}</td>
                              <td className="pm-num pm-strong">{money(e.sold)}</td>
                              <td>{e.shifts ? <span className={'gc-badge gc-badge--' + diffBadge(e.diff)[0]}>{diffBadge(e.diff)[1]}</span> : <span className="pm-sub">No shift yet</span>}</td>
                              <td>{e.on ? <span className="gc-badge gc-badge--success">On shift</span> : <span className="gc-badge gc-badge--slate">Off</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="gc-card pm-card">
                    <div className="pm-head"><div><h2>Closed shifts{who ? ' · ' + who : ''}</h2></div></div>
                    {history.length === 0 ? <EmptyState icon="clock" title="No closed shift yet" body={who ? `${who} has not closed a shift.` : 'Shifts appear here when a register is closed.'} /> : (
                      <div className="gc-table-wrap">
                        <table className="gc-table gc-table--compact gc-table--hoverable">
                          <thead><tr><th scope="col">Shift</th><th scope="col">Employee</th><th scope="col">Counter</th><th scope="col">Opened – closed</th><th scope="col" className="pm-num">Sales</th><th scope="col" className="pm-num">Sold</th><th scope="col" className="pm-num">Expected</th><th scope="col" className="pm-num">Counted</th><th scope="col">Difference</th><th scope="col"><span className="sr-only">Report</span></th></tr></thead>
                          <tbody>
                            {history.map((s) => (
                              <tr key={s.id}>
                                <td className="pm-id">{s.id}</td>
                                <td className="pm-strong">{s.cashier}</td>
                                <td>{s.counter}</td>
                                <td>{formatDate(s.openedAt)}<span className="pm-sub">{formatTime(s.openedAt)} – {formatTime(s.closedAt)}</span></td>
                                <td className="pm-num">{s.count}</td>
                                <td className="pm-num pm-strong">{money(s.sold)}</td>
                                <td className="pm-num">{money(s.expected)}</td>
                                <td className="pm-num">{money(s.counted)}</td>
                                <td><span className={'gc-badge gc-badge--' + diffBadge(s.diff)[0]}>{diffBadge(s.diff)[1]}</span></td>
                                <td><div className="pm-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReport(s)} aria-label={`Open the report of shift ${s.id}`}>Report</button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </>
              ) : null}

              {/* ---- cash pickups ---- */}
              {tab === 'cash' ? (
                <>
                  <div className="pm-kpis">
                    <div className="pm-kpi"><span className="pm-kpi__ico" aria-hidden="true"><Icon name="hand-coins" width="22" height="22" /></span><div><span>Picked up today</span><b>{money(picked.filter((m) => m.at >= startOfToday).reduce((a, m) => a + m.amount, 0))}</b></div></div>
                    <div className="pm-kpi"><span className="pm-kpi__ico" aria-hidden="true"><Icon name="landmark" width="22" height="22" /></span><div><span>Sent to the bank, all time</span><b>{money(picked.filter((m) => m.to === 'Bank deposit').reduce((a, m) => a + m.amount, 0))}</b></div></div>
                    <div className="pm-kpi"><span className="pm-kpi__ico" aria-hidden="true"><Icon name="banknote" width="22" height="22" /></span><div><span>{open ? 'In the open drawer now' : 'No drawer open'}</span><b>{open ? money(live.expected) : '—'}</b></div></div>
                    <div className="pm-kpi"><span className="pm-kpi__ico" aria-hidden="true"><Icon name="shield-alert" width="22" height="22" /></span><div><span>Pickup limit per drawer</span><b>{money(cfg.pickupLimit)}</b></div></div>
                  </div>
                  <section className="gc-card pm-card">
                    <div className="pm-head">
                      <div><h2>Cash movements</h2></div>
                      <button type="button" className="gc-btn gc-btn--solid" onClick={() => startPickup()}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Record a cash pickup</button>
                    </div>
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact gc-table--hoverable">
                        <thead><tr><th scope="col">No.</th><th scope="col">When</th><th scope="col">Counter</th><th scope="col">Type</th><th scope="col" className="pm-num">Amount</th><th scope="col">Taken or given by</th><th scope="col">Goes to</th><th scope="col">Cashier on shift</th><th scope="col">Note</th></tr></thead>
                        <tbody>
                          {cash.map((m) => (
                            <tr key={m.id}>
                              <td className="pm-id">{m.id}</td>
                              <td>{formatDate(m.at)}<span className="pm-sub">{formatTime(m.at)}</span></td>
                              <td>{m.counter}</td>
                              <td><span className={'gc-badge gc-badge--' + (m.type === 'pickup' ? 'primary' : m.type === 'in' ? 'success' : 'warning')}>{CASH_LABEL[m.type]}</span></td>
                              <td className="pm-num pm-strong">{m.type === 'in' ? '+' : '−'}{money(m.amount)}</td>
                              <td>{m.by}</td>
                              <td>{m.to || '—'}</td>
                              <td>{m.cashier}</td>
                              <td>{m.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              ) : null}

              {/* ---- settings ---- */}
              {tab === 'settings' ? (
                <form className="gc-card pm-card" onSubmit={(e) => { e.preventDefault(); saveSettings(cfg); setSaved(cfg); toast('POS settings saved. They apply the next time the register loads.'); }}>
                  <div className="pm-head"><div><h2>Register rules</h2><p>Every counter follows these.</p></div></div>
                  <div className="pm-settings">
                    <div className="pm-form">
                      <span className="pm-cap">Cash</span>
                      <div><label className="gc-label" htmlFor="pm-float">Opening cash suggested for a new counter (৳)</label><input id="pm-float" className="gc-input" type="number" min="0" inputMode="numeric" value={cfg.float} onChange={(e) => setCfg({ ...cfg, float: num(e.target.value) })} /></div>
                      <div><label className="gc-label" htmlFor="pm-limit">Ask for a cash pickup when the drawer holds more than (৳)</label><input id="pm-limit" className="gc-input" type="number" min="0" inputMode="numeric" value={cfg.pickupLimit} onChange={(e) => setCfg({ ...cfg, pickupLimit: num(e.target.value) })} /><p className="gc-help">The register shows a reminder above this amount.</p></div>
                      <span className="pm-cap">Selling</span>
                      <div><label className="gc-label" htmlFor="pm-disc">Largest cashier discount (%)</label><input id="pm-disc" className="gc-input" type="number" min="0" max="100" inputMode="numeric" value={cfg.maxDiscount} onChange={(e) => setCfg({ ...cfg, maxDiscount: Math.min(100, num(e.target.value)) })} /></div>
                      <p className="gc-help" style={{ margin: 0 }}>VAT is not set here. The register charges each product the rate of its category from <Link href="/vat" className="gc-card__link">Accounts › VAT</Link>.</p>
                    </div>
                    <div className="pm-form">
                      <span className="pm-cap">Checkout</span>
                      <div className="pm-switch"><span>Require full payment<small>A sale cannot be completed with money still due.</small></span><button type="button" role="switch" aria-checked={cfg.requireFull} aria-label="Require full payment" className="gc-switch" onClick={() => setCfg({ ...cfg, requireFull: !cfg.requireFull })}><span className="gc-switch__knob" /></button></div>
                      <div className="pm-switch"><span>Print the receipt automatically<small>The cashier can still turn it off for one sale.</small></span><button type="button" role="switch" aria-checked={cfg.printReceipt} aria-label="Print the receipt automatically" className="gc-switch" onClick={() => setCfg({ ...cfg, printReceipt: !cfg.printReceipt })}><span className="gc-switch__knob" /></button></div>
                      <span className="pm-cap">Receipt</span>
                      <div><label className="gc-label" htmlFor="pm-days">Exchange or return within (days)</label><input id="pm-days" className="gc-input" type="number" min="0" inputMode="numeric" value={cfg.returnDays} onChange={(e) => setCfg({ ...cfg, returnDays: num(e.target.value) })} /></div>
                      <div><label className="gc-label" htmlFor="pm-footer">Line at the bottom of the receipt</label><input id="pm-footer" className="gc-input" maxLength={80} value={cfg.footer} onChange={(e) => setCfg({ ...cfg, footer: e.target.value })} /></div>
                    </div>
                  </div>
                  <div className="pm-foot">
                    <button type="button" className="gc-btn gc-btn--neutral" disabled={!dirty} onClick={() => setCfg(saved)}>Discard</button>
                    <button type="submit" className="gc-btn gc-btn--solid" disabled={!dirty}>Save settings</button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      {/* register or edit a counter */}
      <Dialog open={!!form} title={form && form.id ? `Edit ${form.id}` : 'Register a counter'} onClose={() => setForm(null)} width={560}>
        {form ? (
          <form className="pm-form" onSubmit={saveCounter} noValidate>
            <div><label className="gc-label" htmlFor="pm-name">Counter name *</label><input id="pm-name" className={'gc-input' + (err && !form.name.trim() ? ' gc-input--error' : '')} placeholder="For example: Dhanmondi · Counter 3" aria-required="true" data-autofocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="pm-two">
              <div><label className="gc-label" htmlFor="pm-loc">Branch or warehouse *</label><select id="pm-loc" className="gc-input gc-select" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value, stock: e.target.value })}>{getPosLocations().map((l) => <option key={l.name} value={l.name}>{l.name} · {l.type}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="pm-stock">Sells stock from</label><select id="pm-stock" className="gc-input gc-select" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}>{getPosLocations().map((l) => <option key={l.name}>{l.name}</option>)}</select></div>
            </div>
            <div className="pm-two">
              <div><label className="gc-label" htmlFor="pm-printer">Receipt printer</label><select id="pm-printer" className="gc-input gc-select" value={form.printer} onChange={(e) => setForm({ ...form, printer: e.target.value })}>{PRINTERS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="pm-cfloat">Opening cash (৳)</label><input id="pm-cfloat" className="gc-input" type="number" min="0" inputMode="numeric" value={form.float} onChange={(e) => setForm({ ...form, float: e.target.value })} /></div>
            </div>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="gc-label">Employees who can open this counter *</legend>
              <div className="pm-checks">
                {EMPLOYEES.map((e) => (
                  <label key={e.name} className="pm-check"><input type="checkbox" className="gc-check" checked={form.staff.includes(e.name)} onChange={(ev) => setForm({ ...form, staff: ev.target.checked ? [...form.staff, e.name] : form.staff.filter((x) => x !== e.name) })} />{e.name}<small>{e.role}</small></label>
                ))}
              </div>
            </fieldset>
            {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">{form.id ? 'Save counter' : 'Register counter'}</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* cash pickup from any counter */}
      <Dialog open={!!pickup} title="Cash pickup" onClose={() => setPickup(null)} width={480}>
        {pickup ? (
          <form className="pm-form" onSubmit={savePickup}>
            <div><label className="gc-label" htmlFor="pm-pcounter">Counter *</label><select id="pm-pcounter" className="gc-input gc-select" value={pickup.counter} onChange={(e) => setPickup({ ...pickup, counter: e.target.value })}>{counters.filter((c) => c.active).map((c) => <option key={c.id} value={c.name}>{c.id} · {c.name}{open && open.counter === c.name ? ' · open' : ''}</option>)}</select>
              <p className="gc-help">{open && open.counter === pickup.counter ? `${money(live.expected)} is in this drawer. The pickup lowers what the shift must count.` : 'This counter is not open on this device. The pickup is recorded in the list.'}</p></div>
            <div className="pm-two">
              <div><label className="gc-label" htmlFor="pm-pamt">Amount (৳) *</label><input id="pm-pamt" className="gc-input" type="number" min="0" inputMode="numeric" aria-required="true" data-autofocus value={pickup.amount} onChange={(e) => setPickup({ ...pickup, amount: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="pm-pby">Picked up by</label><select id="pm-pby" className="gc-input gc-select" value={pickup.by} onChange={(e) => setPickup({ ...pickup, by: e.target.value })}>{MANAGERS.map((m) => <option key={m}>{m}</option>)}</select></div>
            </div>
            <div><label className="gc-label" htmlFor="pm-pto">Cash goes to</label><select id="pm-pto" className="gc-input gc-select" value={pickup.to} onChange={(e) => setPickup({ ...pickup, to: e.target.value })}>{CASH_PLACES.map((m) => <option key={m}>{m}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="pm-pnote">Note</label><input id="pm-pnote" className="gc-input" placeholder="For example: deposit slip number" value={pickup.note} onChange={(e) => setPickup({ ...pickup, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPickup(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!num(pickup.amount)}>Record pickup</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* closed shift report */}
      <Dialog open={!!report} title={report ? `Shift ${report.id} · ${report.cashier}` : 'Shift'} onClose={() => setReport(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => toast('Shift report sent to the printer')}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => setReport(null)}>Done</button></>}>
        {report ? (
          <div className="pm-form">
            <span className="pm-sub">{report.counter} · {formatDate(report.openedAt)}, {formatTime(report.openedAt)} – {formatTime(report.closedAt)}</span>
            <span className="pm-cap">Sold</span>
            <ul className="pm-rows">
              <li><span>Sales</span><span>{report.count} · {report.units} units</span></li>
              <li><span>Sold, VAT included</span><span>{money(report.sold)}</span></li>
              <li><span>Discounts given</span><span>−{money(report.discounts || 0)}</span></li>
              <li><span>Refunds and exchanges</span><span>−{money(report.refunds)}</span></li>
              {Object.entries(report.byMethod).map(([m, v]) => <li key={m}><span>Taken by {m}</span><span>{money(v)}</span></li>)}
            </ul>
            <span className="pm-cap">Cash drawer</span>
            <ul className="pm-rows">
              <li><span>Opening cash</span><span>{money(report.float)}</span></li>
              <li><span>Cash refunded</span><span>−{money(report.cashRefunds)}</span></li>
              <li><span>Cash pickups</span><span>−{money(report.pickups)}</span></li>
              {report.paidOut ? <li><span>Paid out</span><span>−{money(report.paidOut)}</span></li> : null}
              {report.added ? <li><span>Cash added</span><span>{money(report.added)}</span></li> : null}
              <li><span>Expected in drawer</span><span>{money(report.expected)}</span></li>
              <li><span>Counted</span><span>{money(report.counted)}</span></li>
            </ul>
            <div className="pm-total"><span>Difference</span><b>{report.diff === 0 ? 'Matches' : (report.diff > 0 ? '+' : '−') + money(Math.abs(report.diff))}</b></div>
            {report.note ? <p className="gc-help" style={{ margin: 0 }}>Note: {report.note}</p> : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
