'use client';
// SEO — Online Store › SEO (/seo?tab=). The store-wide tools; each page's own SEO is in its editor (the SEO panel).
//   Health      a score for every page Google can see (live products, categories, pages, posts, landing pages) and the
//               issues across the store grouped (no description, too long, same title, missing alt, hidden by mistake,
//               broken links inside, schema errors); Fix opens the item's SEO in a side panel, or its editor
//   Redirects   301 / 302 list (search, add, edit, delete, CSV import / export); made by themselves when a live item's
//               address changes; loops and chains are marked, a chain can be shortened in one click (review ON-F19)
//   Not found   addresses customers tried that don't exist, with hits; Redirect (a matching page is suggested) or Ignore
//   Sitemap     which types go in, what is left out and why (noindex, own canonical), last updated, the XML itself
//   robots.txt  a safe default, editable; asks first before a change that blocks the whole website
//   Settings    Bangla in web addresses (Latin letters or kept); the home page's title and description stay in
//               Settings › SEO (/set-seo)
// Front end only: lib/seoItems.js, lib/redirects.js, lib/seo.js. On the live website the server answers redirects,
// writes the sitemap and serves robots.txt; the Not found log would come from its access log (demo rows here).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, Sheet, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { KINDS, readSeo, liveUrl, demoHref, parsePath } from '@/lib/seo';
import { allItems, healthOf, saveSeo, contextOf, sitemap, sitemapXml, sitemapTypes, setSitemapType, getRobots, setRobots, DEFAULT_ROBOTS, blocksWholeSite, KIND_ORDER, ISSUE_WORD } from '@/lib/seoItems';
import { getRedirects, addRedirect, updateRedirect, deleteRedirects, importRedirects, redirectsCsv, problemsOf, PROBLEM_WORD, shortenChain, getMisses, dismissMiss, fixMiss, SEO_EVENT } from '@/lib/redirects';
import { handleMode, setHandleMode, toHandle } from '@/lib/handles';
import SeoPanel, { SEO_PANEL_CSS } from '@/components/seo/SeoPanel';
import { StoreFrame, queryParam } from './storeShared';

const CSS = `
.so-sum{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-4);align-items:center;padding:var(--space-4)}
.so-score{display:grid;place-items:center;width:72px;height:72px;border-radius:var(--radius-full);border:6px solid var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-score.is-success{border-color:var(--success)}.so-score.is-warning{border-color:var(--warning)}.so-score.is-error{border-color:var(--error)}
.so-sum h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-sum p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.so-groups{display:flex;flex-wrap:wrap;gap:6px;margin-top:var(--space-2)}
.so-group{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.so-group[aria-pressed="true"]{background:var(--fill-primary-soft);border-color:var(--primary);color:var(--primary)}
.so-group b{font-family:var(--font-data);font-weight:var(--weight-semibold)}
.so-group.is-error b{color:var(--text-danger)}
.so-item{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.so-item>span:last-child{min-width:0}
.so-ico{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-body)}
.so-path{display:block;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:360px}
.so-issues{display:flex;flex-wrap:wrap;gap:4px}
.so-arrow{display:flex;flex-direction:column;gap:2px;min-width:0}
.so-arrow span{font-family:var(--font-data);font-size:var(--text-xs);overflow-wrap:anywhere}
.so-arrow span:last-child{color:var(--text-muted)}
.so-acts{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.so-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.so-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-pad .gc-help{margin:0}
.so-switches{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-2)}
.so-switch{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-heading)}
.so-switch small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.so-code{margin:0;max-height:360px;overflow:auto;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-code);font-size:var(--text-xs);line-height:1.6;white-space:pre;color:var(--text-heading)}
.so-robots{font-family:var(--font-code);font-size:var(--text-xs);min-height:220px}
.so-radio{display:flex;gap:var(--space-2);align-items:flex-start;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.so-radio small{display:block;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.so-form{display:flex;flex-direction:column;gap:var(--space-3)}
.so-form .gc-label{margin-bottom:4px}
@media (max-width:640px){.so-sum{grid-template-columns:1fr}.so-path{max-width:220px}}
`;

const TABS = [['health', 'Health'], ['redirects', 'Redirects'], ['missing', 'Not found'], ['sitemap', 'Sitemap'], ['robots', 'robots.txt'], ['settings', 'Settings']];
const tone = (score) => (score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error');

/** Re-read everything when SEO, pages, posts, products, categories or landing pages change. */
function useSeoData() {
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    const bump = () => setTick((n) => n + 1);
    const evs = [SEO_EVENT, 'gc:store-pages', 'gc:blog', 'gc:categories', 'gc:landing-pages', 'gc:products', 'storage'];
    evs.forEach((e) => window.addEventListener(e, bump));
    return () => evs.forEach((e) => window.removeEventListener(e, bump));
  }, []);
  return useMemo(() => {
    if (!ready) return { ready: false, items: [], health: [], redirects: [], misses: [], map: { included: [], excluded: [] } };
    const items = allItems();
    return { ready: true, items, health: healthOf(items), redirects: getRedirects(), misses: getMisses(), map: sitemap(items), tick };
  }, [ready, tick]);
}

/** A page that best matches a missing address (shared words in the handle), for Not found › Redirect. */
function suggestFor(path, items) {
  const p = parsePath(path);
  const words = String(p ? p.handle : path).split(/[-/]+/).filter((w) => w.length > 1);
  let best = null, bestN = 0;
  items.filter((x) => x.live && (!p || x.kind === p.kind)).forEach((x) => {
    const n = words.filter((w) => x.handle.includes(w)).length;
    if (n > bestN) { best = x; bestN = n; }
  });
  return best ? best.path : '';
}

export default function SeoTools() {
  const d = useSeoData();
  const [tab, setTab] = useState('health');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [issue, setIssue] = useState('');
  const [fix, setFix] = useState(null);           // { kind, id, title, seo }
  const [form, setForm] = useState(null);         // redirect form { id?, from, to, type, note, error }
  const [robots, setRobotsText] = useState(null);
  const [showXml, setShowXml] = useState(false);
  const [mode, setMode] = useState('latin');
  const fileRef = useRef(null);

  useEffect(() => {
    const t = queryParam('tab');
    if (TABS.some((x) => x[0] === t)) setTab(t);
    setMode(handleMode());
  }, []);
  const go = (t) => { setTab(t); setQ(''); setFind(false); try { window.history.replaceState(window.history.state, '', '/seo' + (t === 'health' ? '' : '?tab=' + t)); } catch { /* ignore */ } };

  const problems = useMemo(() => problemsOf(d.redirects), [d.redirects]);
  const avg = d.health.length ? Math.round(d.health.reduce((a, r) => a + r.score, 0) / d.health.length) : 0;
  const issueCount = d.health.reduce((a, r) => a + r.issues.length, 0);
  const groups = useMemo(() => {
    const m = new Map();
    d.health.forEach((r) => r.issues.forEach((i) => { const g = m.get(i.id) || { id: i.id, label: ISSUE_WORD[i.id] || i.label, level: i.level, n: 0 }; g.n++; m.set(i.id, g); }));
    return [...m.values()].sort((a, b) => (a.level === b.level ? b.n - a.n : a.level === 'error' ? -1 : 1));
  }, [d.health]);
  const ql = q.trim().toLowerCase();
  const healthRows = d.health.filter((r) => (!issue ? r.issues.length : r.issues.some((i) => i.id === issue)) && (!ql || (r.title + ' ' + r.path).toLowerCase().includes(ql))).sort((a, b) => a.score - b.score);
  const redirectRows = d.redirects.filter((x) => !ql || (x.from + ' ' + x.to + ' ' + x.note).toLowerCase().includes(ql));
  const missRows = d.misses.filter((x) => !ql || x.path.includes(ql));
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'so-tab-' + k, label: l, on: tab === k, onClick: () => go(k),
    count: !d.ready ? null : k === 'health' ? issueCount : k === 'redirects' ? d.redirects.length : k === 'missing' ? d.misses.length : k === 'sitemap' ? d.map.included.length : null }));

  // ---- health: fix in a side panel ----
  const openFix = (r) => setFix({ kind: r.kind, id: r.id, title: r.title, item: r.item, seo: readSeo(r.kind, r.item), editHref: r.editHref });
  const saveFix = () => {
    const res = saveSeo(fix.kind, fix.id, fix.seo);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast('SEO saved for ' + fix.title);
    setFix(null);
  };

  // ---- redirects ----
  const submitRedirect = () => {
    const res = form.id ? updateRedirect(form.id, { from: form.from, to: form.to, type: form.type, note: form.note }) : addRedirect({ from: form.from, to: form.to, type: form.type, note: form.note });
    if (!res.ok) { setForm({ ...form, error: res.error }); return; }
    if (form.miss) dismissMiss(form.miss);
    toast(form.id ? 'Redirect saved' : 'Redirect added: ' + res.redirect.from + ' → ' + res.redirect.to);
    setForm(null);
  };
  const removeRedirects = async (ids) => {
    const ok = await confirmDialog({ title: ids.length === 1 ? 'Delete this redirect?' : 'Delete ' + ids.length + ' redirects?', body: 'People and search engines using the old address will land on “Page not found”.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    deleteRedirects(ids);
    toast('Redirect deleted');
  };
  const download = (name, text, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const onImport = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const res = importRedirects(String(r.result || ''));
      toast(`${res.added} redirect${res.added === 1 ? '' : 's'} added` + (res.skipped ? `, ${res.skipped} already there` : '') + (res.errors.length ? `. ${res.errors.length} rows not added: ${res.errors[0]}` : '.'), res.errors.length ? { tone: 'error' } : undefined);
    };
    r.readAsText(f);
  };

  // ---- robots ----
  const robotsText = robots != null ? robots : (d.ready ? getRobots() : '');
  const saveRobots = async () => {
    if (blocksWholeSite(robotsText)) {
      const ok = await confirmDialog({ title: 'Block the whole website from Google?', body: '“Disallow: /” for every search engine takes all your pages out of Google over the next days, and sales from search stop. Save it only if the website is not ready to be found.', confirmLabel: 'Block the website', tone: 'danger' });
      if (!ok) return;
    }
    setRobots(robotsText);
    setRobotsText(null);
    toast('robots.txt saved');
  };

  const kindIcon = (k) => <span className="so-ico" aria-hidden="true"><Icon name={KINDS[k].icon} width="16" height="16" /></span>;

  return (
    <StoreFrame screen="SeoTools" active="store-seo" page="SEO" css={CSS + SEO_PANEL_CSS}
      after={<>
        <Sheet open={!!fix} title={fix ? fix.title : ''} label={fix ? 'SEO for ' + fix.title : ''} onClose={() => setFix(null)} footer={fix ? <>
          <Link href={fix.editHref} className="gc-btn gc-btn--sm gc-btn--neutral" style={{ textDecoration: 'none' }}>Open the editor</Link>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveFix}>Save</button>
        </> : null}>
          {fix ? <SeoPanel kind={fix.kind} idPrefix="so-fix" defaultOpen seo={fix.seo} onChange={(patch) => setFix((x) => ({ ...x, seo: { ...x.seo, ...patch } }))} ctx={contextOf(fix.kind, fix.item)} /> : null}
        </Sheet>
        <Sheet open={!!form} title={form && form.id ? 'Edit redirect' : 'Add redirect'} onClose={() => setForm(null)} footer={form ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={submitRedirect}>Save redirect</button>
        </> : null}>
          {form ? (
            <form className="so-form" onSubmit={(e) => { e.preventDefault(); submitRedirect(); }}>
              {form.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{form.error}</p> : null}
              <div><label className="gc-label" htmlFor="so-from">Old address</label><input id="so-from" className="gc-input" value={form.from} placeholder="/products/old-name" style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => setForm({ ...form, from: e.target.value, error: '' })} data-autofocus /></div>
              <div><label className="gc-label" htmlFor="so-to">Send people to</label><input id="so-to" className="gc-input" value={form.to} placeholder="/products/new-name or https://…" style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => setForm({ ...form, to: e.target.value, error: '' })} />
                {form.suggest && form.suggest !== form.to ? <p className="gc-help" style={{ margin: '4px 0 0' }}>Looks like: <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'var(--primary)' }} onClick={() => setForm({ ...form, to: form.suggest })}>{form.suggest}</button></p> : null}</div>
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <legend className="gc-label">Kind</legend>
                <label className="so-radio"><input type="radio" name="so-type" className="gc-check gc-check--radio" checked={Number(form.type) !== 302} onChange={() => setForm({ ...form, type: 301 })} /><span>Moved for good (301)<small>Search engines move the ranking to the new address.</small></span></label>
                <label className="so-radio"><input type="radio" name="so-type" className="gc-check gc-check--radio" checked={Number(form.type) === 302} onChange={() => setForm({ ...form, type: 302 })} /><span>For now (302)<small>The old address comes back later (an offer that returns).</small></span></label>
              </fieldset>
              <div><label className="gc-label" htmlFor="so-note">Note (for the team)</label><input id="so-note" className="gc-input" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            </form>
          ) : null}
        </Sheet>
      </>}>
      <ShopHeader icon="search-check" title="SEO"
        about="How the website does in search engines: a health score with the issues to fix, redirects for addresses that moved, addresses customers tried that don't exist, the sitemap and robots.txt. Each page's own title, description and settings are in its editor, under Search engine listing."
        secondary={[{ label: 'Store defaults', href: '/set-seo' }]}
        primary={{ label: 'Bulk editor', href: '/seo-bulk' }} />

      <section className="ix-card" aria-label="SEO tools">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === 'redirects' || tab === 'missing' ? 'Search addresses' : 'Search pages'} onDone={() => { setFind(false); setQ(''); }} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="SEO tools" />
            <span className="ix-tools">
              {['health', 'redirects', 'missing'].includes(tab) ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button> : null}
              {tab === 'redirects' ? <>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onImport} />
                <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Import CSV', onClick: () => fileRef.current && fileRef.current.click() }, { label: 'Export CSV', onClick: () => download('redirects.csv', redirectsCsv(), 'text/csv') }]} />
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ from: '', to: '', type: 301, note: '' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add redirect</button>
              </> : null}
            </span>
          </>)}
        </div>

        {!d.ready ? <div style={{ minHeight: 280 }} aria-busy="true" /> : null}

        {/* ---- health ---- */}
        {d.ready && tab === 'health' ? (<>
          <div className="so-sum">
            <span className={'so-score is-' + tone(avg)} aria-label={'Store score ' + avg + ' of 100'}>{avg}</span>
            <div>
              <h2>Store SEO score</h2>
              <p>{d.health.length} pages on the website checked · {issueCount} issue{issueCount === 1 ? '' : 's'}. Drafts and hidden pages are left out: Google can’t see them.</p>
              <div className="so-groups" role="group" aria-label="Issues by kind">
                <button type="button" className="so-group" aria-pressed={!issue} onClick={() => setIssue('')}>All issues <b>{issueCount}</b></button>
                {groups.map((g) => <button key={g.id} type="button" className={'so-group' + (g.level === 'error' ? ' is-error' : '')} aria-pressed={issue === g.id} onClick={() => setIssue(issue === g.id ? '' : g.id)}>{g.label} <b>{g.n}</b></button>)}
              </div>
            </div>
          </div>
          {healthRows.length ? (<>
            <ul className="ix-plist" aria-label="Pages with issues">
              {healthRows.map((r) => (
                <li key={r.kind + r.id}><button type="button" className="ix-pitem" onClick={() => openFix(r)}>
                  <span className="ix-pitem__top"><b>{r.title}</b><span className={'gc-badge gc-badge--' + r.tone}>{r.score}</span></span>
                  <span className="ix-pitem__mid">{KINDS[r.kind].label} · {r.issues.map((i) => i.label).join(' · ')}</span>
                </button></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Pages with SEO issues</caption>
                <thead><tr><th scope="col">Page</th><th scope="col">Score</th><th scope="col">Issues</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{healthRows.map((r) => (
                  <tr key={r.kind + r.id} onClick={(e) => { if (!e.target.closest('a,button')) openFix(r); }}>
                    <td><span className="so-item">{kindIcon(r.kind)}<span><b className="ix-strong">{r.title}</b><span className="so-path" title={liveUrl(r.kind, r.handle)}>{r.path}</span></span></span></td>
                    <td><span className={'gc-badge gc-badge--' + r.tone}>{r.score}</span></td>
                    <td><span className="so-issues">{r.issues.map((i) => <span key={i.id} className={'gc-badge gc-badge--' + (i.level === 'error' ? 'error' : 'warning')} title={i.tip}>{i.label}</span>)}</span></td>
                    <td style={{ textAlign: 'right' }}><span className="so-acts">
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => openFix(r)}>Fix</button>
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Open the editor', href: r.editHref }, { label: 'View on the website', onClick: () => window.open(demoHref(r.kind, r.handle), '_blank', 'noopener') }]} />
                    </span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="circle-check" title={issue || ql ? 'Nothing matches' : 'No issues'} body={issue || ql ? 'Try another issue or search.' : 'Every page Google can see passes the checks.'} actionLabel={issue || ql ? 'Show all issues' : undefined} onAction={issue || ql ? () => { setIssue(''); setQ(''); setFind(false); } : undefined} /></div>}
          <div className="ix-foot"><span>{healthRows.length === 1 ? '1 page' : healthRows.length + ' pages'}</span></div>
        </>) : null}

        {/* ---- redirects ---- */}
        {d.ready && tab === 'redirects' ? (<>
          {redirectRows.length ? (<>
            <ul className="ix-plist" aria-label="Redirects">
              {redirectRows.map((x) => (
                <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setForm({ ...x })}>
                  <span className="ix-pitem__top"><b style={{ fontFamily: 'var(--font-data)' }}>{x.from}</b>{problems[x.id] ? <span className="gc-badge gc-badge--warning">{PROBLEM_WORD[problems[x.id]]}</span> : <span className="gc-badge gc-badge--slate">{x.type}</span>}</span>
                  <span className="ix-pitem__mid">→ {x.to} · {x.hits || 0} visits</span>
                </button></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Redirects</caption>
                <thead><tr><th scope="col">From → to</th><th scope="col">Kind</th><th scope="col">Made</th><th scope="col" className="ix-num">Visits</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{redirectRows.map((x) => (
                  <tr key={x.id} onClick={(e) => { if (!e.target.closest('a,button')) setForm({ ...x }); }}>
                    <td><span className="so-arrow"><span>{x.from}</span><span>→ {x.to}</span></span>{problems[x.id] ? <span className="gc-badge gc-badge--warning" style={{ marginTop: 4 }}>{PROBLEM_WORD[problems[x.id]]}</span> : null}</td>
                    <td>{x.type === 302 ? 'For now (302)' : 'For good (301)'}</td>
                    <td className="ix-muted">{x.auto ? 'Automatic' : 'By hand'}{x.note ? ' · ' + x.note : ''}<br />{formatDate(x.at)}</td>
                    <td className="ix-num">{x.hits || 0}</td>
                    <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
                      { label: 'Edit', onClick: () => setForm({ ...x }) },
                      problems[x.id] === 'chain' ? { label: 'Go straight to the end', onClick: () => { const r = shortenChain(x.id); toast(r.ok ? 'Now goes straight to the end of the chain' : r.error, r.ok ? undefined : { tone: 'error' }); } } : null,
                      { label: 'Test it', onClick: () => { const p = parsePath(x.from); if (p) window.open(demoHref(p.kind, p.handle), '_blank', 'noopener'); else toast('This address opens on the live website.', { tone: 'info' }); } },
                      { label: 'Delete', onClick: () => removeRedirects([x.id]), tone: 'danger' },
                    ].filter(Boolean)} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="corner-down-right" title={ql ? 'No redirects match' : 'No redirects yet'} body={ql ? 'Try another search.' : 'They are made by themselves when a live page’s address changes.'} actionLabel="Add redirect" onAction={() => setForm({ from: '', to: '', type: 301, note: '' })} /></div>}
          <div className="ix-foot"><span>{redirectRows.length === 1 ? '1 redirect' : redirectRows.length + ' redirects'}</span><InfoTip text="CSV columns: old address, new address, 301 or 302. A first row with “from” is skipped." /></div>
        </>) : null}

        {/* ---- not found ---- */}
        {d.ready && tab === 'missing' ? (<>
          {missRows.length ? (<>
            <ul className="ix-plist" aria-label="Addresses not found">
              {missRows.map((m) => (
                <li key={m.path}><button type="button" className="ix-pitem" onClick={() => setForm({ from: m.path, to: suggestFor(m.path, d.items), suggest: suggestFor(m.path, d.items), type: 301, note: 'From the not-found log', miss: m.path })}>
                  <span className="ix-pitem__top"><b style={{ fontFamily: 'var(--font-data)' }}>{m.path}</b><span className="gc-badge gc-badge--slate">{m.hits}</span></span>
                  <span className="ix-pitem__mid">Last {formatDate(m.last)} · from {m.from}</span>
                </button></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Addresses customers tried that don't exist</caption>
                <thead><tr><th scope="col">Address</th><th scope="col" className="ix-num">Visits</th><th scope="col">Last</th><th scope="col">Came from</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{missRows.map((m) => {
                  const sug = suggestFor(m.path, d.items);
                  return (
                    <tr key={m.path}>
                      <td><span className="so-arrow"><span>{m.path}</span>{sug ? <span>Looks like {sug}</span> : null}</span></td>
                      <td className="ix-num">{m.hits}</td>
                      <td className="ix-muted">{formatDate(m.last)}</td>
                      <td className="ix-muted">{m.from}</td>
                      <td style={{ textAlign: 'right' }}><span className="so-acts">
                        {sug ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { const r = fixMiss(m.path, sug); toast(r.ok ? 'Redirect added: ' + m.path + ' → ' + sug : r.error, r.ok ? undefined : { tone: 'error' }); }}>Redirect</button>
                          : <button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ from: m.path, to: '', type: 301, note: 'From the not-found log', miss: m.path })}>Redirect…</button>}
                        <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Redirect somewhere else…', onClick: () => setForm({ from: m.path, to: '', suggest: sug, type: 301, note: 'From the not-found log', miss: m.path }) }, { label: 'Ignore', onClick: () => { dismissMiss(m.path); toast('Taken off the list'); } }]} />
                      </span></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="circle-check" title="Nothing missing" body="No one has hit an address that doesn’t exist." /></div>}
          <div className="ix-foot"><span>Demo rows: the live website fills this from its visits.</span></div>
        </>) : null}

        {/* ---- sitemap ---- */}
        {d.ready && tab === 'sitemap' ? (() => {
          const types = sitemapTypes();
          const last = d.map.included.map((r) => r.lastmod).filter(Boolean).sort().pop();
          return (
            <div className="so-pad">
              <p className="gc-help">https://dazzleshop.com.bd/sitemap.xml · {d.map.included.length} addresses{last ? ' · last change ' + formatDate(last) : ''}. Search engines read it to find new pages; it updates by itself.</p>
              <h2>What goes in</h2>
              <div className="so-switches">
                {KIND_ORDER.map((k) => {
                  const n = d.map.included.filter((r) => r.kind === k).length;
                  return (
                    <div key={k} className="so-switch">
                      <span>{KINDS[k].plural}<small>{types[k] ? n + ' in the sitemap' : 'Left out'}</small></span>
                      <button type="button" className="gc-switch" role="switch" aria-checked={!!types[k]} aria-label={'Include ' + KINDS[k].plural.toLowerCase()} onClick={() => setSitemapType(k, !types[k])}><span className="gc-switch__knob" /></button>
                    </div>
                  );
                })}
              </div>
              {d.map.excluded.length ? (<>
                <h2>Left out ({d.map.excluded.length})</h2>
                <ul className="seo-list">
                  {d.map.excluded.slice(0, 40).map((r) => <li key={r.kind + r.id}><span><b>{r.title}</b><small>{r.path} · {r.why}</small></span></li>)}
                </ul>
              </>) : null}
              <div className="seo-row">
                <button type="button" className="ix-btn ix-btn--sm" aria-expanded={showXml} onClick={() => setShowXml(!showXml)}><Icon name="code" width="16" height="16" aria-hidden="true" />{showXml ? 'Hide the XML' : 'View the XML'}</button>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => download('sitemap.xml', sitemapXml(d.items), 'application/xml')}><Icon name="download" width="16" height="16" aria-hidden="true" />Download</button>
              </div>
              {showXml ? <pre className="so-code" aria-label="sitemap.xml">{sitemapXml(d.items)}</pre> : null}
            </div>
          );
        })() : null}

        {/* ---- robots.txt ---- */}
        {d.ready && tab === 'robots' ? (
          <div className="so-pad">
            <p className="gc-help">Tells search engines which parts of the website to skip. The default keeps checkout, cart, account and search pages out and points to the sitemap.</p>
            <label className="gc-label" htmlFor="so-robots" style={{ marginBottom: 0 }}>robots.txt</label>
            <textarea id="so-robots" className={'gc-input so-robots' + (blocksWholeSite(robotsText) ? ' gc-input--error' : '')} value={robotsText} onChange={(e) => setRobotsText(e.target.value)} spellCheck={false} />
            {blocksWholeSite(robotsText) ? <p className="gc-help gc-help--error" role="alert">This blocks the whole website from every search engine.</p> : null}
            <div className="seo-row">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={robots == null} onClick={saveRobots}>Save</button>
              <button type="button" className="ix-btn ix-btn--sm" disabled={robotsText === DEFAULT_ROBOTS} onClick={() => setRobotsText(DEFAULT_ROBOTS)}>Use the default</button>
            </div>
          </div>
        ) : null}

        {/* ---- settings ---- */}
        {d.ready && tab === 'settings' ? (
          <div className="so-pad">
            <h2>Bangla in web addresses</h2>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <legend className="sr-only">Bangla in web addresses</legend>
              {[['latin', 'Write it in Latin letters (recommended)', 'মোবাইল কভার → /products/' + toHandle('মোবাইল কভার', 'latin')], ['keep', 'Keep Bangla', 'মোবাইল কভার → /products/' + toHandle('মোবাইল কভার', 'keep')]].map(([k, l, ex]) => (
                <label key={k} className="so-radio"><input type="radio" name="so-hm" className="gc-check gc-check--radio" checked={mode === k} onChange={() => { setHandleMode(k); setMode(k); toast('New addresses ' + (k === 'keep' ? 'keep Bangla' : 'use Latin letters') + '. Existing ones stay as they are.'); }} /><span>{l}<small>{ex}</small></span></label>
              ))}
            </fieldset>
            <p className="gc-help">Latin addresses are easier to share and type. Changing this does not change addresses that already exist.</p>
            <h2>The home page</h2>
            <p className="gc-help">The shop’s own title, description, share image and tracking IDs are in <Link href="/set-seo" className="bl-link">Settings › SEO</Link>.</p>
          </div>
        ) : null}
      </section>
    </StoreFrame>
  );
}
