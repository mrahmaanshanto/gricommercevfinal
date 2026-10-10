'use client';
// SEO (/admin/website/seo) — what gridcommerce.net tells search engines and social apps. Adapted from the merchant
// panel's SEO settings (/set-seo) and the blog editor's previews, fed by the website's own code: each page.tsx's
// buildMetadata (title → "<title> | GridCommerce", description, canonical on SITE.url, Open Graph /og/default.png),
// robots.ts (Disallow /login, /signup) and sitemap.ts (walks src/app, skips [slug] folders and three paths).
//   Figures   pages indexed, issues, sitemap URLs, the canonical host.
//   Issues    missing / too long / too short descriptions, long titles, duplicates — each with Fix (opens the page's
//             SEO with a suggestion filled in).
//   Pages     every page's title and description length, indexing and sitemap; a row opens its SEO panel.
//   Site      robots.txt and the sitemap as the code builds them, with what is wrong in them.
// The panel: SEO title and meta description with meters, address, canonical, index / noindex, Open Graph title,
// description and image, a Google result and a social card that follow the typing. ?path=/pricing opens it.
// Data: lib/admin/website.js (seoOf, saveSeo, resetSeo, seoIssues, siteChecks, pageSections). Saving never changes
// the live site.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, Pager } from '@/components/ui/IndexKit';
import { FilterBar } from '@/components/ui/FilterBar';
import { downloadCsv } from '@/lib/reports/period';
import { websitePages, sortPages, seoOf, saveSeo, resetSeo, seoIssues, siteChecks, pageSections, lengthState, LIMITS, LIVE_HOST, SITE, DEFAULT_OG, TYPES } from '@/lib/admin/website';
import { AdminShell } from '../AdminShell';
import { WEB_CSS, useWeb, when, Field, ctl, LenMeter, GooglePreview, SocialPreview, plural } from './webShared';

const PAGE = 25;
const SEV_TONE = { High: 'error', Medium: 'warning', Low: 'neutral' };
const LEN_TONE = { good: 'success', short: 'warning', long: 'warning', missing: 'error' };
const LEN_TEXT = { good: 'Good', short: 'Short', long: 'Too long', missing: 'Missing' };
const CSS = `
.so-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.so-filters .gc-filterbar__search{max-width:300px}
.ix-table tbody tr.is-link{cursor:pointer}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.so-issue{display:flex;flex-direction:column;min-width:0;max-width:420px}
.so-issue small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.so-site{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-4);padding:var(--space-4)}
.so-site h3{display:flex;align-items:center;gap:var(--space-2);margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-code{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-code);font-size:var(--text-xs);line-height:1.7;color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
.so-checks{display:flex;flex-direction:column;gap:var(--space-2);margin:var(--space-3) 0 0;padding:0;list-style:none}
.so-checks li{display:flex;gap:var(--space-2);align-items:flex-start;font-size:var(--text-sm)}
.so-checks li svg{flex:none;margin-top:2px}
.so-checks .is-ok svg{color:var(--text-success)}.so-checks .is-warn svg{color:var(--text-warning)}.so-checks .is-bad svg{color:var(--text-danger)}
.so-checks small{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.so-paths{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.so-paths span{padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.so-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}
.so-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.so-sug{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font-size:var(--text-sm)}
.so-sug b{font-weight:var(--weight-medium)}
.so-sug .ix-btn{align-self:flex-start}
.so-prev{display:flex;flex-direction:column;gap:var(--space-3)}
.so-prev h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
`;

const cutTo = (s, n) => { if (s.length <= n) return s; const c = s.slice(0, n - 1); return c.slice(0, Math.max(c.lastIndexOf(' '), n - 20)).replace(/[,.;:\s]+$/, '') + '.'; };

/** A suggested value for an issue's field. */
function suggest(issue) {
  const s = seoOf(issue.path);
  if (issue.field === 'seoTitle') {
    if (issue.kind === 'Duplicate title') return `${s.title} · ${s.type === 'Help' ? 'Help centre' : s.type} | ${SITE.name}`;
    const short = s.title.split(/\s[—–-]\s/)[0];
    return short.length + SITE.name.length + 3 <= LIMITS.title[1] ? `${short} | ${SITE.name}` : cutTo(short, LIMITS.title[1]);
  }
  if (issue.kind === 'Description too long') return cutTo(s.metaDesc, LIMITS.desc[1]);
  // too short, missing or duplicate: build one from the page's own text
  const texts = pageSections(issue.path).flatMap((b) => b.fields).filter((f) => !f.one && f.value.en.length > 40).map((f) => f.value.en);
  const extra = texts.find((x) => !s.metaDesc.includes(x.slice(0, 30))) || '';
  return cutTo([s.metaDesc, extra].filter(Boolean).join(' ').trim() || `${s.title} on GridCommerce, the commerce system for businesses in Bangladesh.`, LIMITS.desc[1]);
}

export default function Seo() {
  const { t, live, me } = useWeb();
  const [tab, setTab] = useState('issues');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [sev, setSev] = useState('');
  const [page, setPage] = useState(0);
  const [edit, setEdit] = useState(null);   // { path, …fields, issue, error }
  const [ready, setReady] = useState(false);
  const pending = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (['issues', 'pages', 'site'].includes(p.get('tab'))) setTab(p.get('tab'));
    pending.current = p.get('path');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (tab !== 'issues') p.set('tab', tab);
    if (edit) p.set('path', edit.path);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  }, [ready, tab, edit]);
  useEffect(() => { if (first.current) { first.current = false; return; } setPage(0); }, [tab, q, type, sev]);

  const openEditor = (path, issue) => {
    const s = seoOf(path);
    if (!s) return;
    const f = { path, seoTitle: s.seoTitle, metaDesc: s.metaDesc, slug: s.slug, index: s.index, ogTitle: s.ogTitle, ogDesc: s.ogDesc, ogImage: s.ogImage, ogSame: s.ogTitle === s.seoTitle && s.ogDesc === s.metaDesc, issue: issue || null, error: '' };
    setEdit(f);
  };
  useEffect(() => { if (live && pending.current) { const p = pending.current; pending.current = null; openEditor(p); } }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  const issues = live ? seoIssues() : [];
  const checks = live ? siteChecks() : null;
  const all = live ? sortPages(websitePages()).map((p) => seoOf(p.path)) : [];
  const indexed = all.filter((s) => s.index).length;
  const high = issues.filter((i) => i.severity === 'High').length;
  const ss = q.trim().toLowerCase();
  const match = (path) => { const s = seoOf(path); return (!type || s.type === type) && (!ss || [s.path, s.title, s.seoTitle, s.metaDesc].join(' ').toLowerCase().includes(ss)); };
  const issueRows = issues.filter((i) => (!sev || i.severity === sev) && match(i.path)).sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a.severity) - ['High', 'Medium', 'Low'].indexOf(b.severity));
  const pageRows = all.filter((s) => match(s.path));
  const list = tab === 'issues' ? issueRows : pageRows;
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = list.slice(pg * PAGE, pg * PAGE + PAGE);
  const issuesOf = (path) => issues.filter((i) => i.path === path).length;

  const save = () => {
    const patch = { seoTitle: edit.seoTitle, metaDesc: edit.metaDesc, index: edit.index, ogImage: edit.ogImage,
      ogTitle: edit.ogSame ? edit.seoTitle : edit.ogTitle, ogDesc: edit.ogSame ? edit.metaDesc : edit.ogDesc };
    if (edit.path !== '/') patch.slug = edit.slug;
    const r = saveSeo(edit.path, patch, me);
    if (!r.ok) { setEdit({ ...edit, error: r.error }); return; }
    setEdit(null);
    toast('SEO saved. The live site is not changed in this demo.');
  };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Use the page’s own metadata?', body: 'The saved SEO for this page is cleared; it goes back to what its page.tsx sends.', confirmLabel: 'Reset', tone: 'danger' }))) return;
    resetSeo(edit.path, me); setEdit(null); toast('Reset to the page’s metadata');
  };
  const exportCsv = () => {
    downloadCsv('gridcommerce-website-seo.csv', [['Path', 'SEO title', 'Title length', 'Meta description', 'Description length', 'Indexed', 'In sitemap', 'Canonical', 'OG image', 'Issues'],
      ...all.map((s) => [s.path, s.seoTitle, s.seoTitle.length, s.metaDesc, s.metaDesc.length, s.index ? 'Yes' : 'No', s.inSitemap ? 'Yes' : 'No', s.canonical, s.ogImage, issuesOf(s.path)])]);
    toast(plural(all.length, 'page') + ' exported');
  };

  const tabs = [
    { key: 'issues', id: 'so-tab-issues', label: 'Issues', count: live ? issues.length : null, on: tab === 'issues', onClick: () => setTab('issues') },
    { key: 'pages', id: 'so-tab-pages', label: 'Pages', count: live ? all.length : null, on: tab === 'pages', onClick: () => setTab('pages') },
    { key: 'site', id: 'so-tab-site', label: 'Robots & sitemap', count: live ? checks.sitemap.broken.length + (checks.hostMismatch ? 1 : 0) : null, on: tab === 'site', onClick: () => setTab('site') },
  ];
  const filters = [
    { key: 'type', label: 'Type', all: 'All types', value: type, options: TYPES.map((x) => [x, x]), onChange: setType },
    ...(tab === 'issues' ? [{ key: 'sev', label: 'Severity', all: 'Any severity', value: sev, options: [['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']], onChange: setSev }] : []),
  ];

  let body;
  if (!live) body = <><div className="wb-skel wb-skel--head" /><div className="wb-skel" aria-busy="true" aria-label="Loading SEO" /></>;
  else {
    let inner;
    if (tab === 'site') {
      const sm = checks.sitemap;
      inner = (
        <div className="so-site">
          <div>
            <h3><Icon name="bot" width="16" height="16" aria-hidden="true" />robots.txt <span className="wb-src">src/app/robots.ts</span></h3>
            <pre className="so-code">{`User-agent: *\nAllow: ${checks.robots.allow}\n${checks.robots.disallow.map((d) => 'Disallow: ' + d).join('\n')}\n\nHost: ${checks.robots.host}\nSitemap: ${checks.robots.sitemap}`}</pre>
            <ul className="so-checks">
              <li className="is-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>Sign-in pages are blocked<small>/login and /signup are also noindex in their page.tsx.</small></span></li>
              <li className={checks.hostMismatch ? 'is-bad' : 'is-ok'}><Icon name={checks.hostMismatch ? 'circle-alert' : 'circle-check'} width="16" height="16" aria-hidden="true" />
                <span>{checks.hostMismatch ? 'Host and sitemap point to another domain' : 'Host matches the live domain'}
                  <small>{checks.hostMismatch ? `The site is served at ${LIVE_HOST.replace('https://', '')}, but SITE.url in src/data/site.ts is ${checks.canonicalHost.replace('https://', '')}, so robots, the sitemap and every canonical link name that domain.` : ''}</small></span></li>
            </ul>
          </div>
          <div>
            <h3><Icon name="network" width="16" height="16" aria-hidden="true" />sitemap.xml <span className="wb-src">src/app/sitemap.ts</span></h3>
            <p className="wb-small"><b>{sm.count} addresses</b>, home priority 1.0, top pages 0.8, pages under them 0.6. Rebuilt on every deploy.</p>
            <ul className="so-checks">
              {sm.broken.length ? <li className="is-bad"><Icon name="circle-alert" width="16" height="16" aria-hidden="true" /><span>{plural(sm.broken.length, 'address', 'addresses')} with no page<small>The sitemap lists every folder in src/app, also ones without a page.tsx; these return 404.</small><span className="so-paths">{sm.broken.map((p) => <span key={p}>{p}</span>)}</span></span></li> : null}
              {sm.missing.length ? <li className="is-warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{plural(sm.missing.length, 'indexable page')} not in the sitemap<small>sitemap.ts skips [slug] folders, so blog posts and help categories are left out.</small><span className="so-paths">{sm.missing.slice(0, 14).map((p) => <span key={p}>{p}</span>)}</span></span></li> : null}
              <li className="is-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>Excluded on purpose<span className="so-paths">{sm.excluded.map((p) => <span key={p}>{p}</span>)}</span></span></li>
            </ul>
            <p className="wb-small" style={{ marginTop: 'var(--space-3)' }}>Fixes here are code changes in the website repository; send them to the web developer.</p>
          </div>
        </div>
      );
    } else if (!list.length) {
      inner = <div className="ix-empty">{ss || type || sev ? <EmptyState title="Nothing matches." actionLabel="Clear filters" onAction={() => { setQ(''); setType(''); setSev(''); }} /> : <EmptyState icon="badge-check" title="No SEO issues." actionLabel="Show pages" onAction={() => setTab('pages')} />}</div>;
    } else if (tab === 'issues') {
      inner = (
        <>
          <ul className="ix-plist" aria-label="Issues">
            {rows.map((i) => (
              <li key={i.id}>
                <button type="button" className="ix-pitem" onClick={() => openEditor(i.path, i)} style={{ width: '100%', textAlign: 'left', border: 0, background: 'none', font: 'inherit' }}>
                  <span className="ix-pitem__top"><b>{i.kind}</b><StatusBadge tone={SEV_TONE[i.severity]}>{i.severity}</StatusBadge></span>
                  <span className="ix-pitem__mid"><span className="wb-path">{i.path}</span> · {i.text}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">SEO issues</caption>
              <thead><tr><th scope="col">Issue</th><th scope="col">Page</th><th scope="col">Severity</th><th scope="col"><span className="sr-only">Fix</span></th></tr></thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td><span className="so-issue"><b className="ix-strong">{i.kind}</b><small>{i.text}</small></span></td>
                    <td><span className="wb-title"><b className="ix-strong">{seoOf(i.path).title}</b><span className="wb-path">{i.path}</span></span></td>
                    <td><StatusBadge tone={SEV_TONE[i.severity]}>{i.severity}</StatusBadge></td>
                    <td><button type="button" className="ix-btn ix-btn--sm" onClick={() => openEditor(i.path, i)}><Icon name="wand-sparkles" width="14" height="14" aria-hidden="true" />Fix</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    } else {
      inner = (
        <>
          <ul className="ix-plist" aria-label="Pages">
            {rows.map((s) => (
              <li key={s.path}>
                <button type="button" className="ix-pitem" onClick={() => openEditor(s.path)} style={{ width: '100%', textAlign: 'left', border: 0, background: 'none', font: 'inherit' }}>
                  <span className="ix-pitem__top"><b>{s.seoTitle}</b>{s.index ? null : <StatusBadge tone="neutral">noindex</StatusBadge>}</span>
                  <span className="ix-pitem__mid"><span className="wb-path">{s.path}</span> · description {LEN_TEXT[lengthState(s.metaDesc.length, LIMITS.desc)].toLowerCase()}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">SEO by page</caption>
              <thead><tr><th scope="col">Page</th><th scope="col">Title</th><th scope="col">Description</th><th scope="col">Search</th><th scope="col">Sitemap</th><th scope="col" className="ix-num">Issues</th></tr></thead>
              <tbody>
                {rows.map((s) => {
                  const tl = lengthState(s.seoTitle.length, LIMITS.title), dl = lengthState(s.metaDesc.length, LIMITS.desc);
                  const n = issuesOf(s.path);
                  return (
                    <tr key={s.path} className="is-link" tabIndex={0} onClick={() => openEditor(s.path)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) openEditor(s.path); }}>
                      <td><span className="wb-title"><b className="ix-strong" title={s.seoTitle}>{s.seoTitle}</b><span className="wb-path">{s.path}</span></span></td>
                      <td><StatusBadge tone={LEN_TONE[tl]}>{LEN_TEXT[tl]} · {s.seoTitle.length}</StatusBadge></td>
                      <td><StatusBadge tone={LEN_TONE[dl]}>{LEN_TEXT[dl]} · {s.metaDesc.length}</StatusBadge></td>
                      <td className="ix-muted">{s.index ? 'Indexed' : 'noindex'}</td>
                      <td className="ix-muted">{s.inSitemap ? 'Listed' : '—'}</td>
                      <td className="ix-num">{n || <span className="ix-muted">0</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    body = (
      <>
        <MetricStrip items={[
          { label: 'Pages indexed', value: <span className="wb-data">{indexed}<small className="ix-metric__sub"> of {all.length}</small></span>, icon: 'search-check', onClick: () => setTab('pages'), on: tab === 'pages' },
          { label: 'Issues', value: <span className="wb-data">{issues.length}</span>, sub: high ? `${high} high` : null, icon: 'triangle-alert', onClick: () => setTab('issues'), on: tab === 'issues' },
          { label: 'Sitemap', value: <span className="wb-data">{checks.sitemap.count}</span>, sub: checks.sitemap.broken.length ? `${checks.sitemap.broken.length} broken` : 'addresses', icon: 'network', onClick: () => setTab('site'), on: tab === 'site' },
          { label: 'Canonical domain', value: <span className="wb-data">{checks.canonicalHost.replace('https://', '')}</span>, sub: checks.hostMismatch ? 'not the live domain' : null, icon: 'link' },
        ]} />
        <section className="ix-card" aria-label="SEO">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="SEO views" /></div>
          {tab !== 'site' ? <div className="so-filters"><FilterBar label="Filter" filters={filters} onClear={() => setQ('')} search={{ value: q, onChange: setQ, placeholder: 'Search page, title or description' }} /></div> : null}
          {inner}
          {tab !== 'site' && list.length ? <Pager label={`${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${list.length}`} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} /> : null}
        </section>
      </>
    );
  }

  const cur = edit ? seoOf(edit.path) : null;
  const sug = edit && edit.issue ? suggest(edit.issue) : null;
  const ogT = edit ? (edit.ogSame ? edit.seoTitle : edit.ogTitle) : '';
  const ogD = edit ? (edit.ogSame ? edit.metaDesc : edit.ogDesc) : '';
  const ogChoices = edit ? [...new Set([DEFAULT_OG, '/og/' + (edit.slug || 'home') + '.png', cur.ogImage, edit.ogImage])] : [];

  return (
    <AdminShell active="web-seo" title="SEO">
      <style dangerouslySetInnerHTML={{ __html: WEB_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="search" title="SEO"
          about="How gridcommerce.net shows in Google and in shared links. Every page sends the title and description from its page.tsx (buildMetadata adds “| GridCommerce”, a canonical link on SITE.url and the default Open Graph image). Issues lists what search engines would flag, each with a suggested fix; Robots & sitemap shows robots.ts and sitemap.ts as the code builds them. Saving here does not change the live site in this demo."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Open sitemap.xml', onClick: () => window.open(LIVE_HOST + '/sitemap.xml', '_blank', 'noopener') }, { label: 'Open robots.txt', onClick: () => window.open(LIVE_HOST + '/robots.txt', '_blank', 'noopener') }, { label: 'Pages', href: '/admin/website/pages' }]} />
        {body}
      </div>

      <Sheet open={!!edit} title={cur ? 'SEO · ' + cur.title : 'SEO'} onClose={() => setEdit(null)}
        footer={<>
          {cur && cur.overridden ? <button type="button" className="gc-btn gc-btn--neutral" onClick={reset}>Reset</button> : null}
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button>
        </>}>
        {edit ? (
          <div className="wb-flow">
            <p className="wb-small"><span className="wb-path">{edit.path}</span> · <span className="wb-src">{cur.file}</span>{cur.at ? <> · saved {when(cur.at, t)} by {cur.by}</> : null}</p>
            {sug ? (
              <div className="so-sug" role="status">
                <span><b>{edit.issue.kind}</b> · {edit.issue.text}</span>
                <span>Suggested: “{sug}”</span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ ...edit, [edit.issue.field]: sug, issue: null })}><Icon name="wand-sparkles" width="14" height="14" aria-hidden="true" />Use suggestion</button>
              </div>
            ) : null}
            <Field id="so-title" label="SEO title" error={edit.error}>
              <input id="so-title" {...ctl(edit.error)} value={edit.seoTitle} autoFocus={edit.issue && edit.issue.field === 'seoTitle'} onChange={(e) => setEdit({ ...edit, seoTitle: e.target.value, error: '' })} maxLength={120} />
              <LenMeter len={edit.seoTitle.trim().length} range={LIMITS.title} />
            </Field>
            <Field id="so-desc" label="Meta description">
              <textarea id="so-desc" {...ctl(false)} rows={4} value={edit.metaDesc} autoFocus={edit.issue && edit.issue.field === 'metaDesc'} onChange={(e) => setEdit({ ...edit, metaDesc: e.target.value })} maxLength={320} />
              <LenMeter len={edit.metaDesc.trim().length} range={LIMITS.desc} />
            </Field>
            {edit.path !== '/' ? (
              <Field id="so-slug" label="Address" tip="The last part of the page's address. Changing it moves the page's folder in the website's src/app and needs a redirect from the old address." hint={'gridcommerce.net' + edit.path.replace(/[^/]+$/, '') + (edit.slug || '…')}>
                <input id="so-slug" className="gc-input wb-data" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), error: '' })} />
              </Field>
            ) : null}
            <Field id="so-canon" label="Canonical address" tip="Built from SITE.url in the website's src/data/site.ts.">
              <input id="so-canon" className="gc-input wb-data" value={cur.canonical} readOnly />
            </Field>
            <div className="so-sw">
              <span>Show in search results<small>{edit.index ? 'index, follow' : 'noindex, nofollow'}</small></span>
              <button type="button" className="gc-switch" role="switch" aria-checked={edit.index} aria-label="Show in search results" onClick={() => setEdit({ ...edit, index: !edit.index })}><span className="gc-switch__knob" /></button>
            </div>
            <div className="so-sw">
              <span>Social share uses the SEO title and description<small>Facebook, WhatsApp, LinkedIn and X</small></span>
              <button type="button" className="gc-switch" role="switch" aria-checked={edit.ogSame} aria-label="Social share uses the SEO title and description" onClick={() => setEdit({ ...edit, ogSame: !edit.ogSame, ogTitle: ogT, ogDesc: ogD })}><span className="gc-switch__knob" /></button>
            </div>
            {!edit.ogSame ? (
              <>
                <Field id="so-ogt" label="Social title"><input id="so-ogt" {...ctl(false)} value={edit.ogTitle} onChange={(e) => setEdit({ ...edit, ogTitle: e.target.value })} maxLength={120} /></Field>
                <Field id="so-ogd" label="Social description"><textarea id="so-ogd" {...ctl(false)} rows={3} value={edit.ogDesc} onChange={(e) => setEdit({ ...edit, ogDesc: e.target.value })} maxLength={300} /></Field>
              </>
            ) : null}
            <Field id="so-ogi" label="Social image" hint="1200 × 630, from the website's public/og folder.">
              <span style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <select id="so-ogi" {...ctl(false, true)} value={edit.ogImage} onChange={(e) => setEdit({ ...edit, ogImage: e.target.value })}>
                  {ogChoices.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <label className="ix-btn">Upload<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) setEdit({ ...edit, ogImage: '/og/' + f.name }); }} /></label>
              </span>
            </Field>
            <div className="so-prev">
              <h3>Google <InfoTip text="Google may rewrite the title or pick other text from the page." /></h3>
              <GooglePreview title={edit.seoTitle} url={LIVE_HOST + (edit.path === '/' ? '' : edit.path)} desc={edit.metaDesc} />
              <h3>Shared link</h3>
              <SocialPreview title={ogT} desc={ogD} image={edit.ogImage} host={LIVE_HOST} />
            </div>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
