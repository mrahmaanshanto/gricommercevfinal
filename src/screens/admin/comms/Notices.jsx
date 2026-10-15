'use client';
// Merchant notices (/admin/notices, SA-F4) — announcements shown inside the merchant panel: a banner under the top bar and
// the "What's new" list (components/MerchantNotices.jsx). Write one for every store, a plan, an edition or chosen stores;
// schedule when it starts and ends; a maintenance notice carries the window when the platform is down. Stop a live one at
// any time. Views: Live · Scheduled · Ended · All. A row opens the editor (side panel) with a preview of the banner.
// Data: lib/platform/notices.js (its own store, gc.platform.notices, shared with the merchant panel); the stores and their
// plans and editions come from lib/platform (to show how many stores a notice reaches).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { dmy, hm } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import { LADDERS, PLAN_IDS, PLAN_NAME } from '@/lib/platform/catalogue';
import { subOf, subState, isLiveStore } from '@/lib/platform/billing';
import { notices, stateOf, saveNotice, stopNotice, removeNotice, reachCount, AUDIENCE, STATE_LABEL, EVENT, now as noticeNow } from '@/lib/platform/notices';
import { AdminShell, usePlatform } from '../AdminShell';

const VIEWS = [['live', 'Live'], ['scheduled', 'Scheduled'], ['ended', 'Ended'], ['all', 'All']];
const CSS = `
.nt-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.nt-bar .ix-search{flex:1 1 240px;max-width:360px}
.nt-title{display:flex;flex-direction:column;min-width:0;max-width:340px}
.nt-title small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.nt-when{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.nt-form{display:flex;flex-direction:column;gap:var(--space-3)}
.nt-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.nt-checks{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4)}
.nt-checks label{display:inline-flex;align-items:center;gap:6px;min-height:32px;font-size:var(--text-sm)}
.nt-stores{max-height:220px;overflow:auto;margin-top:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.nt-stores label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;padding:0 var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.nt-stores label:first-child{border-top:0}
.nt-stores small{margin-left:auto;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.nt-prev{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-sm);background:var(--fill-primary-soft);color:var(--text-heading)}
.nt-prev.is-warn{background:var(--fill-warning-soft)}
.nt-prev svg{flex:none;margin-top:2px}
.nt-prev span{color:var(--text-body)}
.nt-prev a{margin-left:auto;font-weight:var(--weight-medium);color:var(--primary);white-space:nowrap}
.nt-skel{height:360px;border-radius:var(--radius-xl);background:var(--surface-card)}
@media (max-width:640px){.nt-two{grid-template-columns:1fr}.nt-checks label,.nt-stores label{min-height:44px}}
`;

const p2 = (n) => String(n).padStart(2, '0');
/** ms → the value of an <input type="datetime-local"> (this computer's time zone). */
const toInput = (ms) => { if (!ms) return ''; const d = new Date(ms); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const fromInput = (v) => (v ? new Date(v).getTime() : null);
const when = (ms) => (ms ? `${dmy(ms)} ${hm(ms)}` : '—');
const ladderName = (id) => (LADDERS.find((l) => l.id === id) || { label: id }).label;

function audienceText(n, stores) {
  const a = n.audience || {};
  if (a.kind === 'plan') return (a.plans || []).map((p) => PLAN_NAME[p] + ' plan').join(', ');
  if (a.kind === 'edition') return (a.editions || []).map(ladderName).join(', ');
  if (a.kind === 'stores') return (a.stores || []).map((id) => (stores.find((s) => s.id === id) || { name: '#' + id }).name).join(', ');
  return 'Every store';
}

function useNotices() {
  const [list, setList] = useState(null);
  useEffect(() => {
    const read = () => setList(notices());
    read();
    const onStorage = (e) => { if (!e.key || /notices/.test(e.key)) read(); };
    window.addEventListener(EVENT, read);
    window.addEventListener('storage', onStorage);
    const iv = window.setInterval(read, 30000);
    return () => { window.removeEventListener(EVENT, read); window.removeEventListener('storage', onStorage); window.clearInterval(iv); };
  }, []);
  return list;
}

function Editor({ notice, stores, close }) {
  const t0 = noticeNow();
  const [f, setF] = useState(() => (notice ? {
    ...notice, linkLabel: notice.link ? notice.link.label : '', linkHref: notice.link ? notice.link.href : '',
    start: toInput(notice.startAt), end: toInput(notice.endAt), wFrom: toInput(notice.window && notice.window.from), wTo: toInput(notice.window && notice.window.to),
  } : {
    title: '', text: '', kind: 'news', severity: 'info', audience: { kind: 'all', plans: [], editions: [], stores: [] }, dismissible: true,
    linkLabel: '', linkHref: '', start: toInput(t0), end: toInput(t0 + 14 * 864e5), wFrom: '', wTo: '',
  }));
  const [err, setErr] = useState({});
  const [sq, setSq] = useState('');
  const set = (k, v) => { setF({ ...f, [k]: v }); setErr({}); };
  const aud = f.audience;
  const setAud = (patch) => set('audience', { ...aud, ...patch });
  const toggle = (key, id) => setAud({ [key]: (aud[key] || []).includes(id) ? aud[key].filter((x) => x !== id) : [...(aud[key] || []), id] });
  const draft = {
    title: f.title, text: f.text, kind: f.kind, severity: f.severity, audience: aud, dismissible: f.dismissible,
    link: f.linkLabel || f.linkHref ? { label: f.linkLabel, href: f.linkHref } : null,
    startAt: fromInput(f.start), endAt: fromInput(f.end), window: f.kind === 'maintenance' ? { from: fromInput(f.wFrom), to: fromInput(f.wTo) } : null,
  };
  const reach = reachCount({ audience: aud }, stores);
  const save = () => {
    const r = saveNotice({ ...draft, id: notice ? notice.id : undefined }, staff().name);
    if (!r.ok) { setErr({ [r.field || 'form']: r.error }); return; }
    toast(notice ? 'Notice saved' : (draft.startAt > noticeNow() ? 'Notice scheduled' : 'Notice is live'));
    close();
  };
  const e = (k) => (err[k] ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err[k]}</p> : null);
  const sl = sq.trim().toLowerCase();
  const shown = stores.filter((s) => !sl || (s.name + ' ' + s.id).toLowerCase().includes(sl) || (aud.stores || []).includes(s.id)).slice(0, 40);
  return (
    <Sheet open title={notice ? 'Edit notice' : 'New notice'} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={save}>{notice ? 'Save' : draft.startAt > t0 ? 'Schedule' : 'Publish'}</button>
      </>
    )}>
      <div className="nt-form">
        <div className="nt-two">
          <div>
            <label className="gc-label" htmlFor="nt-kind">Type</label>
            <select id="nt-kind" className="gc-input gc-select" value={f.kind} onChange={(ev) => setF({ ...f, kind: ev.target.value, severity: ev.target.value === 'maintenance' ? 'warning' : f.severity, end: ev.target.value === 'maintenance' && !notice ? '' : f.end })}>
              <option value="news">News</option><option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="gc-label" htmlFor="nt-sev">Look</label>
            <select id="nt-sev" className="gc-input gc-select" value={f.severity} disabled={f.kind === 'maintenance'} onChange={(ev) => set('severity', ev.target.value)}>
              <option value="info">Info (blue)</option><option value="warning">Warning (amber)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="gc-label" htmlFor="nt-title">Title</label>
          <input id="nt-title" className={'gc-input' + (err.title ? ' gc-input--error' : '')} value={f.title} data-autofocus onChange={(ev) => set('title', ev.target.value)} />
          {e('title')}
        </div>
        <div>
          <label className="gc-label" htmlFor="nt-text">Text</label>
          <textarea id="nt-text" rows={3} className={'gc-input' + (err.text ? ' gc-input--error' : '')} value={f.text} onChange={(ev) => set('text', ev.target.value)} />
          {e('text')}
        </div>
        {f.kind === 'maintenance' ? (
          <div>
            <div className="nt-two">
              <div><label className="gc-label" htmlFor="nt-wf">Down from</label><input id="nt-wf" type="datetime-local" className={'gc-input' + (err.window ? ' gc-input--error' : '')} value={f.wFrom} onChange={(ev) => set('wFrom', ev.target.value)} /></div>
              <div><label className="gc-label" htmlFor="nt-wt">Back by</label><input id="nt-wt" type="datetime-local" className={'gc-input' + (err.window ? ' gc-input--error' : '')} value={f.wTo} onChange={(ev) => set('wTo', ev.target.value)} /></div>
            </div>
            {e('window')}
          </div>
        ) : null}
        <div>
          <label className="gc-label" htmlFor="nt-aud">Who sees it</label>
          <select id="nt-aud" className={'gc-input gc-select' + (err.audience ? ' gc-input--error' : '')} value={aud.kind} onChange={(ev) => setAud({ kind: ev.target.value })}>
            {AUDIENCE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          {aud.kind === 'plan' ? <div className="nt-checks" style={{ marginTop: 'var(--space-2)' }}>{PLAN_IDS.map((p) => <label key={p}><input type="checkbox" className="gc-check" checked={(aud.plans || []).includes(p)} onChange={() => toggle('plans', p)} />{PLAN_NAME[p]}</label>)}</div> : null}
          {aud.kind === 'edition' ? <div className="nt-checks" style={{ marginTop: 'var(--space-2)' }}>{LADDERS.map((l) => <label key={l.id}><input type="checkbox" className="gc-check" checked={(aud.editions || []).includes(l.id)} onChange={() => toggle('editions', l.id)} />{l.label}</label>)}</div> : null}
          {aud.kind === 'stores' ? (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SearchField value={sq} onChange={(ev) => setSq(ev.target.value)} placeholder="Find a store" />
              <div className="nt-stores">
                {shown.map((s) => <label key={s.id}><input type="checkbox" className="gc-check" checked={(aud.stores || []).includes(s.id)} onChange={() => toggle('stores', s.id)} />{s.name}<small>#{s.id}</small></label>)}
              </div>
            </div>
          ) : null}
          {e('audience')}
          <p className="gc-help" style={{ margin: 'var(--space-1) 0 0' }}>{reach} {reach === 1 ? 'store' : 'stores'} will see it</p>
        </div>
        <div className="nt-two">
          <div><label className="gc-label" htmlFor="nt-s">Starts</label><input id="nt-s" type="datetime-local" className={'gc-input' + (err.startAt ? ' gc-input--error' : '')} value={f.start} onChange={(ev) => set('start', ev.target.value)} />{e('startAt')}</div>
          <div><label className="gc-label" htmlFor="nt-e">Ends</label><input id="nt-e" type="datetime-local" className={'gc-input' + (err.endAt ? ' gc-input--error' : '')} value={f.end} onChange={(ev) => set('end', ev.target.value)} />{e('endAt')}</div>
        </div>
        <div className="nt-two">
          <div><label className="gc-label" htmlFor="nt-ll">Button (optional)</label><input id="nt-ll" className="gc-input" placeholder="Set up email" value={f.linkLabel} onChange={(ev) => set('linkLabel', ev.target.value)} /></div>
          <div><label className="gc-label" htmlFor="nt-lh">Opens</label><input id="nt-lh" className={'gc-input' + (err.link ? ' gc-input--error' : '')} placeholder="/email" value={f.linkHref} onChange={(ev) => set('linkHref', ev.target.value)} /></div>
        </div>
        {e('link')}
        <label className="nt-checks"><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)' }}><input type="checkbox" className="gc-check" checked={f.dismissible} onChange={(ev) => set('dismissible', ev.target.checked)} />Merchants can dismiss it</span></label>
        {e('form')}
        <div>
          <p className="gc-label" style={{ margin: '0 0 var(--space-2)' }}>Preview</p>
          <div className={'nt-prev' + (f.severity === 'warning' || f.kind === 'maintenance' ? ' is-warn' : '')}>
            <Icon name={f.kind === 'maintenance' ? 'wrench' : f.severity === 'warning' ? 'triangle-alert' : 'megaphone'} width="16" height="16" aria-hidden="true" />
            <div><b>{f.title || 'Title'}</b> <span>{f.text || 'What merchants need to know.'}</span></div>
            {f.linkLabel ? <a href={f.linkHref || '#'} onClick={(ev) => ev.preventDefault()}>{f.linkLabel}</a> : null}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

export default function Notices() {
  const { db, t, live } = usePlatform();
  const list = useNotices();
  const [view, setView] = useState('live');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);   // { notice | null, n }
  const ready = live && list;
  const stores = live ? db.shops.filter((s) => isLiveStore(subState(db, s.id, t))).map((s) => ({ id: s.id, name: s.name, ladder: (subOf(db, s.id) || {}).ladder, plan: (subOf(db, s.id) || {}).plan })) : [];
  const tn = noticeNow();
  const groupOf = (n) => { const st = stateOf(n, tn); return st === 'stopped' ? 'ended' : st; };
  const counts = ready ? Object.fromEntries(VIEWS.map(([k]) => [k, k === 'all' ? list.length : list.filter((n) => groupOf(n) === k).length])) : {};
  const s = q.trim().toLowerCase();
  const rows = ready ? list.filter((n) => (view === 'all' || groupOf(n) === view) && (!s || (n.title + ' ' + n.text).toLowerCase().includes(s))) : [];
  const stop = async (n) => {
    if (!(await confirmDialog({ title: `Stop “${n.title}”?`, body: 'It disappears from every merchant panel now.', confirmLabel: 'Stop notice', tone: 'danger' }))) return;
    const r = stopNotice(n.id, staff().name);
    toast(r.ok ? 'Notice stopped' : r.error, r.ok ? undefined : { tone: 'error' });
  };
  const del = async (n) => {
    if (!(await confirmDialog({ title: `Delete “${n.title}”?`, body: 'It is removed for good.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const r = removeNotice(n.id);
    toast(r.ok ? 'Notice deleted' : r.error, r.ok ? undefined : { tone: 'error' });
  };
  const label = (VIEWS.find(([k]) => k === view) || [])[1];

  return (
    <AdminShell active="notices" title="Merchant notices">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page">
        <ShopHeader icon="megaphone" title="Merchant notices"
          about="Announcements inside the merchant panel: a banner under the top bar and the What's new list. Send one to every store, a plan, an edition or chosen stores; schedule it, and give maintenance its window. Stop a live notice any time."
          primary={{ label: 'New notice', icon: 'plus', onClick: () => setEdit({ notice: null, n: Date.now() }) }} />
        {!ready ? <div className="nt-skel" aria-busy="true" aria-label="Loading notices" /> : (
          <section className="ix-card" aria-label={label + ' notices'}>
            <div className="ix-bar"><IndexTabs label="Notice views" tabs={VIEWS.map(([k, l]) => ({ key: k, id: 'nt-tab-' + k, label: l, count: counts[k], on: view === k, onClick: () => setView(k) }))} /></div>
            <div className="nt-bar"><SearchField value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Search notices" onDone={() => setQ('')} /></div>
            {!rows.length ? (
              <div className="ix-empty">{s ? <EmptyState title="No notice matches." actionLabel="Clear search" onAction={() => setQ('')} />
                : <EmptyState icon="megaphone" title={`No ${label.toLowerCase()} notices.`} actionLabel="New notice" onAction={() => setEdit({ notice: null, n: Date.now() })} />}</div>
            ) : (
              <>
                <ul className="ix-plist" aria-label={label + ' notices'}>
                  {rows.map((n) => {
                    const st = STATE_LABEL[stateOf(n, tn)];
                    return (
                      <li key={n.id}>
                        <div className="ix-pitem ix-pitem--box">
                          <span className="ix-pitem__top"><b>{n.title}</b><StatusBadge tone={st[1]}>{st[0]}</StatusBadge></span>
                          <span className="ix-pitem__mid">{audienceText(n, stores)} · {reachCount(n, stores)} stores</span>
                          <span className="ix-pitem__mid">{when(n.startAt)} – {n.endAt ? when(n.endAt) : 'until stopped'}</span>
                          <span className="bl-pact" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ notice: n, n: Date.now() })}>Edit</button>
                            {['live', 'scheduled'].includes(stateOf(n, tn)) ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => stop(n)}>Stop</button> : null}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="ix-table-wrap">
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">{label} notices</caption>
                    <thead><tr><th scope="col">Notice</th><th scope="col">Who sees it</th><th scope="col" className="ix-num">Stores</th><th scope="col">Runs</th><th scope="col">State</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {rows.map((n) => {
                        const stKey = stateOf(n, tn);
                        const st = STATE_LABEL[stKey];
                        return (
                          <tr key={n.id} tabIndex={0} onClick={() => setEdit({ notice: n, n: Date.now() })} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.target === ev.currentTarget) setEdit({ notice: n, n: Date.now() }); }}>
                            <td><span className="nt-title"><span className="ix-strong">{n.title}</span><small>{n.kind === 'maintenance' ? 'Maintenance · ' : ''}{n.text}</small></span></td>
                            <td>{audienceText(n, stores)}</td>
                            <td className="ix-num">{reachCount(n, stores)}</td>
                            <td><span className="nt-when">{when(n.startAt)} – {n.endAt ? when(n.endAt) : 'until stopped'}</span></td>
                            <td><StatusBadge tone={st[1]}>{st[0]}</StatusBadge></td>
                            <td onClick={(ev) => ev.stopPropagation()}>
                              <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[
                                { label: 'Edit', onClick: () => setEdit({ notice: n, n: Date.now() }) },
                                ['live', 'scheduled'].includes(stKey) ? { label: 'Stop now', onClick: () => stop(n), tone: 'danger' } : null,
                                { label: 'Delete', onClick: () => del(n), tone: 'danger' },
                              ].filter(Boolean)} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </div>
      {edit ? <Editor key={edit.n} notice={edit.notice} stores={stores} close={() => setEdit(null)} /> : null}
    </AdminShell>
  );
}
