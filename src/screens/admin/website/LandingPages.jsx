'use client';
// Website › Landing pages (/admin/website/landing-pages) — campaign pages under gridcommerce.net/lp/…: the views by
// status as tabs (counts on the tabs), search and filters (campaign, template), a compact table (a two-line list on
// phones) with each page's visits, submissions and conversion, and New landing page (a side panel: title, address,
// template, campaign, form). A row opens the page (/admin/website/landing-pages/view?id=).
// Data: lib/admin/website2.js (landings, lpResults, addLanding). Address: ?view=Published&q=…&campaign=…; ?new=1 opens
// the New landing page panel.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { useAdminStore } from '@/lib/admin/store';
import { webStore, LP_STATUSES, TEMPLATES, SITE_HOST, lpResults, lpCounts, lpUrl, addLanding, slugify, pct } from '@/lib/admin/website2';
import { AdminShell } from '../AdminShell';
import { W2_CSS, LpBadge, Field, ctl, Skeleton, me, num, plural, when } from './web2Shared';

const PAGE = 20;
const CSS = `
.lp-slug{display:flex;align-items:center;min-width:0}
.lp-slug span{flex:none;padding:0 var(--space-2);height:var(--control-height);display:inline-flex;align-items:center;border:1px solid var(--border-subtle);border-right:0;border-radius:var(--radius-lg) 0 0 var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.lp-slug input{min-width:0;flex:1;border-radius:0 var(--radius-lg) var(--radius-lg) 0}
.lp-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.lp-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  return { view: LP_STATUSES.includes(p.get('view')) ? p.get('view') : '', q: p.get('q') || '', campaign: p.get('campaign') || '', template: TEMPLATES.includes(p.get('template')) ? p.get('template') : '', newOne: p.get('new') === '1' };
}
function toUrl({ view, q, campaign, template }) {
  const p = new URLSearchParams();
  if (view) p.set('view', view);
  if (q.trim()) p.set('q', q.trim());
  if (campaign) p.set('campaign', campaign);
  if (template) p.set('template', template);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const BLANK = { title: '', slug: '', slugEdited: false, template: 'Lead magnet', campaign: '', formId: '', lang: 'en', errors: {} };

export default function LandingPages() {
  const router = useRouter();
  const { data, t, live } = useAdminStore(webStore);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('');
  const [q, setQ] = useState('');
  const [campaign, setCampaign] = useState('');
  const [template, setTemplate] = useState('');
  const [page, setPage] = useState(0);
  const [create, setCreate] = useState(null);
  const first = useRef(true);

  useEffect(() => {
    const s = fromUrl();
    setView(s.view); setQ(s.q); setCampaign(s.campaign); setTemplate(s.template); setReady(true);
    if (s.newOne) setCreate({ ...BLANK });
  }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ view, q, campaign, template });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, q, campaign, template]);

  const all = live ? data.landings : [];
  const forms = data.forms || [];
  const formName = (id) => (forms.find((f) => f.id === id) || {}).name || '';
  const campaigns = [...new Set(all.map((l) => l.campaign).filter(Boolean))].sort();
  const s = q.trim().toLowerCase();
  const scoped = all.filter((l) => {
    if (campaign && l.campaign !== campaign) return false;
    if (template && l.template !== template) return false;
    if (s && ![l.title, l.slug, l.campaign, l.template, l.editor, formName(l.formId)].join(' ').toLowerCase().includes(s)) return false;
    return true;
  });
  const counts = lpCounts(scoped);
  const filtered = scoped.filter((l) => !view || l.status === view).sort((a, b) => b.updatedAt - a.updatedAt);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const res = Object.fromEntries(rows.map((l) => [l.id, lpResults(data, l)]));
  const filtersOn = !!(s || campaign || template);
  const totals = filtered.reduce((a, l) => { const r = lpResults(data, l); if (!r.lifetime) { a.v += r.visits; a.s += r.subs; } return a; }, { v: 0, s: 0 });

  const tabs = [['', 'All'], ...LP_STATUSES.map((x) => [x, x])].map(([k, label]) => ({ key: k || 'all', id: 'lp-tab-' + (k || 'all').replace(/\s/g, '-'), label, count: live ? (k ? counts[k] : counts.all) : null, on: view === k, onClick: () => setView(k) }));
  const filters = [
    { key: 'campaign', label: 'Campaign', all: 'All campaigns', value: campaign, options: campaigns.map((c) => [c, c]), onChange: setCampaign },
    { key: 'template', label: 'Template', all: 'All templates', value: template, options: TEMPLATES.map((x) => [x, x]), onChange: setTemplate },
  ];
  const open = (id) => router.push('/admin/website/landing-pages/view?id=' + id);

  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv('gridcommerce-landing-pages.csv', [
      ['ID', 'Title', 'Address', 'Template', 'Campaign', 'Form', 'Status', 'Editor', 'Approver', 'Visits', 'Submissions', 'Conversion', 'Full link with UTM'],
      ...filtered.map((l) => { const r = lpResults(data, l); return [l.id, l.title, SITE_HOST + '/lp/' + l.slug, l.template, l.campaign, formName(l.formId), l.status, l.editor, l.approver, r.visits, r.subs, pct(r.rate), lpUrl(l)]; }),
    ]);
    toast(plural(filtered.length, 'landing page') + ' exported');
  };

  // ---- the New landing page panel ----
  const setC = (k) => (e) => setCreate((c) => {
    const v = e.target.value;
    const next = { ...c, [k]: v, errors: {} };
    if (k === 'title' && !c.slugEdited) next.slug = slugify(v);
    if (k === 'slug') next.slugEdited = true;
    return next;
  });
  const doCreate = () => {
    const r = addLanding(create, me());
    if (!r.ok) { setCreate({ ...create, errors: { [r.field || 'form']: r.error } }); return; }
    setCreate(null);
    toast('Draft created. Add the page copy, then send it for review.');
    router.push('/admin/website/landing-pages/view?id=' + r.id);
  };
  const e = create ? create.errors : {};

  return (
    <AdminShell active="web-landing" title="Landing pages">
      <style dangerouslySetInnerHTML={{ __html: W2_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="layout-template" title="Landing pages"
          about={`Campaign pages at ${SITE_HOST}/lp/…, each tied to a marketing campaign, with UTM links and one form. A page goes Draft → In review → Approved → Published; the person who edited a page cannot approve it. Publishing here does not change the live site in this demo.`}
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Forms and submissions', href: '/admin/website/forms' }, { label: 'UTM links', href: '/admin/utm' }]}
          primary={{ label: 'New landing page', icon: 'plus', onClick: () => setCreate({ ...BLANK }) }} />

        {!live ? <Skeleton label="Loading landing pages" /> : (
          <section className="ix-card" aria-label="Landing pages">
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Landing page status" /></div>
            <div className="w2-filters">
              <FilterBar label="Filter landing pages" filters={filters} onClear={() => setQ('')}
                search={{ value: q, onChange: setQ, placeholder: 'Search title, address, campaign or editor' }} />
            </div>
            {!filtered.length ? (
              <div className="ix-empty">
                {filtersOn
                  ? <EmptyState title="No landing pages match these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setCampaign(''); setTemplate(''); }} />
                  : <EmptyState icon="layout-template" title={view ? `No landing pages in ${view}.` : 'No landing pages yet.'} actionLabel="New landing page" onAction={() => setCreate({ ...BLANK })} />}
              </div>
            ) : (
              <>
                <ul className="ix-plist" aria-label="Landing pages">
                  {rows.map((l) => (
                    <li key={l.id}>
                      <Link href={'/admin/website/landing-pages/view?id=' + l.id} className="ix-pitem">
                        <span className="ix-pitem__top"><b>{l.title}</b><LpBadge s={l.status} /></span>
                        <span className="ix-pitem__mid">/lp/{l.slug} · {l.campaign || 'No campaign'}</span>
                        <span className="ix-pitem__mid">{num(res[l.id].visits)} visits · {num(res[l.id].subs)} submissions · {pct(res[l.id].rate)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="ix-table-wrap">
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">Landing pages</caption>
                    <thead>
                      <tr>
                        <th scope="col">Page</th><th scope="col">Campaign</th><th scope="col">Form</th><th scope="col">Status</th>
                        <th scope="col" className="ix-num">Visits</th><th scope="col" className="ix-num">Submissions</th><th scope="col" className="ix-num">Conversion</th><th scope="col">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((l) => {
                        const r = res[l.id];
                        return (
                          <tr key={l.id} tabIndex={0} onClick={() => open(l.id)} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.target === ev.currentTarget) open(l.id); }}>
                            <td>
                              <span className="w2-two w2-cell">
                                <Link href={'/admin/website/landing-pages/view?id=' + l.id} className="ix-strong" onClick={(ev) => ev.stopPropagation()} title={l.title}>{l.title}</Link>
                                <small className="w2-data">/lp/{l.slug}</small>
                              </span>
                            </td>
                            <td><span className="w2-two w2-cell"><span>{l.campaign || <span className="ix-muted">None</span>}</span><small>{l.template}</small></span></td>
                            <td className="ix-muted ix-nowrap">{formName(l.formId) || 'None'}</td>
                            <td><LpBadge s={l.status} /></td>
                            <td className="ix-num w2-data">{r.visits ? num(r.visits) : '—'}{r.lifetime ? <small className="w2-muted"> all time</small> : null}</td>
                            <td className="ix-num w2-data">{r.visits ? num(r.subs) : '—'}</td>
                            <td className="ix-num w2-data">{pct(r.rate)}</td>
                            <td className="ix-muted ix-nowrap"><span className="w2-two"><span>{when(l.updatedAt, t)}</span><small>{l.editor}</small></span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <Pager label={<span className="lp-foot"><span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 pages'}</span>{totals.v ? <span>Visits <b>{num(totals.v)}</b></span> : null}{totals.v ? <span>Submissions <b>{num(totals.s)}</b></span> : null}</span>}
              atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
          </section>
        )}
      </div>

      <Sheet open={!!create} title="New landing page" onClose={() => setCreate(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCreate(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doCreate}>Create draft</button>
        </>}>
        {create ? (
          <div className="w2-form">
            <Field id="nl-title" label="Title" error={e.title}>
              <input id="nl-title" {...ctl(e.title)} data-autofocus value={create.title} onChange={setC('title')} placeholder="e.g. POS for mobile shops" maxLength={90} />
            </Field>
            <Field id="nl-slug" label="Address" error={e.slug} hint="Letters, numbers and dashes.">
              <span className="lp-slug"><span>{SITE_HOST}/lp/</span><input id="nl-slug" {...ctl(e.slug)} value={create.slug} onChange={setC('slug')} placeholder="pos-for-mobile-shops" /></span>
            </Field>
            <div className="w2-form__two">
              <Field id="nl-tpl" label="Template" error={e.template}>
                <select id="nl-tpl" {...ctl(e.template, true)} value={create.template} onChange={setC('template')}>
                  {TEMPLATES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </Field>
              <Field id="nl-lang" label="Language">
                <select id="nl-lang" {...ctl(false, true)} value={create.lang} onChange={setC('lang')}>
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </select>
              </Field>
            </div>
            <Field id="nl-camp" label="Campaign" hint="The marketing campaign it belongs to. You can set it later.">
              <input id="nl-camp" {...ctl(false)} list="nl-camps" value={create.campaign} onChange={setC('campaign')} placeholder="e.g. Retail POS · Dhaka mobile markets" />
              <datalist id="nl-camps">{campaigns.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field id="nl-form" label="Form">
              <select id="nl-form" {...ctl(false, true)} value={create.formId} onChange={setC('formId')}>
                <option value="">Choose later</option>
                {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
            {e.form ? <p className="w2-formerr" role="alert">{e.form}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
