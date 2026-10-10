'use client';
// Website › Overview (/admin/website) — gridcommerce.net at a glance: five figures (published pages, waiting review,
// landing pages live, visitors and trial sign-ups over 30 days), what needs attention (at most five rows: a failing
// form, pages in review, approved pages not published, submissions waiting, images without alt text), visitors by
// day, the latest submissions and the Website area's pages.
// Data: lib/admin/website2.js (landing pages, forms, submissions, media, traffic) and, read only, the Pages module's
// lib/admin/website.js › websitePages() for the page counts (SITE_ROUTES when it has none).

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { InfoTip, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, CHART_CSS } from '@/components/charts/DashCharts';
import { useAdminStore } from '@/lib/admin/store';
import { website as pagesStore, websitePages } from '@/lib/admin/website';
import { webStore, overview, mediaCounts, lpCounts, SITE, SITE_HOST } from '@/lib/admin/website2';
import { AdminShell } from '../AdminShell';
import { W2_CSS, SubBadge, Skeleton, Problem, when, num, plural } from './web2Shared';

const CSS = `
.wo-grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--space-4);align-items:start}
.wo-big{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--space-2);margin:0 0 var(--space-3);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wo-big small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.wo-up{color:var(--text-success)}
.wo-down{color:var(--text-danger)}
.wo-alerts{display:flex;flex-direction:column;padding:var(--space-1) var(--space-2) var(--space-2)}
.wo-alert{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:6px var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.wo-alert:hover{background:var(--surface-subtle)}
.wo-alert__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning)}
.wo-alert__ic--error{background:var(--fill-error-soft);color:var(--text-danger)}
.wo-alert__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.wo-alert__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.wo-alert__txt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.wo-alert>svg{flex:none;color:var(--text-muted)}
.wo-calm{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.wo-calm svg{color:var(--text-success)}
.wo-areas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4)}
.wo-area{display:flex;align-items:flex-start;gap:var(--space-3);min-height:64px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.wo-area:hover{border-color:var(--border-strong);background:var(--surface-page)}
.wo-area__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.wo-area__txt{display:flex;flex-direction:column;min-width:0}
.wo-area__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.wo-area__txt small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:1180px){.wo-areas{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:1023px){.wo-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.wo-areas{grid-template-columns:minmax(0,1fr);padding:var(--space-3)}}
`;

const tick = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(Math.round(n)));

/** The Pages module's list, or the site's routes when it is not there or fails. */
function sitePages() {
  try { const p = typeof websitePages === 'function' ? websitePages() : null; return Array.isArray(p) && p.length ? p : null; } catch { return null; }
}

export default function WebsiteOverview() {
  const router = useRouter();
  const { data, t, live } = useAdminStore(webStore);
  const pagesLive = useAdminStore(pagesStore).live;
  const [retry, setRetry] = useState(0);

  let x = null, problem = null;
  if (live && pagesLive) {
    try { x = overview(data, t, sitePages()); } catch (e) { problem = e; }
  }
  const forms = data.forms || [];
  const mc = live ? mediaCounts(data.media) : null;
  const lc = live ? lpCounts(data.landings) : null;

  const header = (
    <ShopHeader icon="globe" title="Website"
      about={`GridCommerce's public website, ${SITE_HOST}: its pages, content, blog, media, campaign landing pages, forms and SEO. Figures here are demo data; publishing in this panel does not change the live site.`}
      secondary={[{ label: 'View site', icon: 'external-link', href: SITE }]}
      more={[{ label: 'All submissions', href: '/admin/website/forms?tab=submissions' }, { label: 'Media library', href: '/admin/website/media' }]}
      primary={{ label: 'New landing page', icon: 'plus', href: '/admin/website/landing-pages?new=1' }} />
  );

  let body;
  if (problem) {
    body = <Problem text="The website figures could not be worked out." onRetry={() => setRetry(retry + 1)} />;
  } else if (!x) {
    body = <><Skeleton label="Loading figures" /><Skeleton label="Loading the website overview" /></>;
  } else {
    const f = x.figs;
    const change = f.visitsPrev ? (f.visits - f.visitsPrev) / f.visitsPrev : null;
    const areas = [
      ['web-pages', 'Pages', '/admin/website/pages', 'file-text', plural(x.pagesTotal, 'page') + ' · ' + f.published + ' live'],
      ['web-content', 'Content', '/admin/website/content', 'pen-line', 'Homepage, pricing, FAQs, footer'],
      ['web-blog', 'Blog', '/admin/website/blog', 'newspaper', 'Articles and categories'],
      ['web-media', 'Media', '/admin/website/media', 'images', plural(mc.all, 'file') + (mc.noAlt ? ' · ' + mc.noAlt + ' without alt text' : '')],
      ['web-landing', 'Landing pages', '/admin/website/landing-pages', 'layout-template', lc.Published + ' live · ' + (lc['In review'] + lc.Approved) + ' waiting'],
      ['web-forms', 'Forms', '/admin/website/forms', 'clipboard-list', forms.filter((y) => y.status === 'Live').length + ' live · ' + plural(f.fresh, 'new submission')],
      ['web-seo', 'SEO', '/admin/website/seo', 'search', 'Titles, descriptions, sitemap'],
      ['analytics-website', 'Website analytics', '/admin/analytics/website', 'chart-line', 'Traffic, sources, conversions'],
    ];
    body = (
      <>
        <MetricStrip items={[
          { label: 'Published pages', value: num(f.published), sub: 'of ' + x.pagesTotal, href: '/admin/website/pages', icon: 'file-check' },
          { label: 'Waiting review', value: num(f.inReview), sub: 'pages and landing pages', href: '/admin/website/landing-pages?view=In%20review', icon: 'file-clock' },
          { label: 'Landing pages live', value: num(f.lpLive), href: '/admin/website/landing-pages?view=Published', icon: 'layout-template' },
          { label: 'Visitors · 30 days', value: num(f.visits), sub: change == null ? null : (change >= 0 ? '▲ ' : '▼ ') + Math.abs(change * 100).toFixed(1) + '%', spark: f.visitsSpark, href: '/admin/analytics/website' },
          { label: 'Trial sign-ups · 30 days', value: num(f.trial30), sub: 'of ' + num(f.sub30) + ' submissions', href: '/admin/website/forms?tab=submissions&form=trial', icon: 'user-plus' },
        ]} />

        <div className="wo-grid">
          <section className="ix-card" aria-label="Visitors, last 30 days">
            <div className="ix-card__head"><h2>Visitors · last 30 days <InfoTip text="Visits to every page of the site, counted by its analytics. Demo figures." /></h2><Link href="/admin/analytics/website">Website analytics</Link></div>
            <div className="w2-body">
              <p className="wo-big">{num(f.visits)}{change != null ? <small className={change >= 0 ? 'wo-up' : 'wo-down'}>{(change >= 0 ? '▲ ' : '▼ ') + Math.abs(change * 100).toFixed(1)}% on the 30 days before</small> : null}</p>
              <ColumnChart label="Website visitors per day, last 30 days" data={x.series} series={[{ name: 'Visitors', color: 'var(--viz-1)' }]} fmt={num} tickFmt={tick} height={200} now={x.series.length - 1} />
            </div>
          </section>

          <section className="ix-card" aria-label="Needs attention">
            <div className="ix-card__head"><h2>Needs attention</h2></div>
            {x.attention.length ? (
              <div className="wo-alerts">
                {x.attention.map((a) => (
                  <Link key={a.key} href={a.href} className="wo-alert">
                    <span className={'wo-alert__ic' + (a.tone === 'error' ? ' wo-alert__ic--error' : '')}><Icon name={a.icon} width="16" height="16" aria-hidden="true" /></span>
                    <span className="wo-alert__txt"><b>{a.title}</b><small title={a.sub}>{a.sub}</small></span>
                    <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : <p className="wo-calm"><Icon name="circle-check" width="18" height="18" aria-hidden="true" />Nothing needs you on the website.</p>}
          </section>
        </div>

        <section className="ix-card" aria-label="Latest submissions">
          <div className="ix-card__head"><h2>Latest submissions</h2><Link href="/admin/website/forms?tab=submissions">All submissions</Link></div>
          {!x.latest.length ? (
            <div className="ix-empty"><EmptyState icon="inbox" title="No form submissions yet." actionLabel="Open forms" onAction={() => router.push('/admin/website/forms')} /></div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Latest submissions">
                {x.latest.map((s) => (
                  <li key={s.id}>
                    <Link href={'/admin/website/forms?tab=submissions&sub=' + s.id} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{s.name}</b><span className="w2-muted">{when(s.at, t)}</span></span>
                      <span className="ix-pitem__mid">{(forms.find((y) => y.id === s.formId) || {}).name} · {s.page}</span>
                      <span className="ix-pitem__tags"><SubBadge s={s.status} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Latest submissions</caption>
                  <thead><tr><th scope="col">Name</th><th scope="col">Form</th><th scope="col">Page</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Received</th></tr></thead>
                  <tbody>
                    {x.latest.map((s) => (
                      <tr key={s.id} tabIndex={0} onClick={() => router.push('/admin/website/forms?tab=submissions&sub=' + s.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') router.push('/admin/website/forms?tab=submissions&sub=' + s.id); }}>
                        <td><span className="w2-two w2-cell"><span className="ix-strong">{s.name}</span><small>{s.business || s.email}</small></span></td>
                        <td className="ix-muted">{(forms.find((y) => y.id === s.formId) || {}).name}</td>
                        <td><span className="w2-data">{s.page}</span></td>
                        <td className="ix-muted">{s.utm.source ? s.utm.source + (s.utm.campaign ? ' · ' + s.utm.campaign : '') : 'Direct'}</td>
                        <td><SubBadge s={s.status} /></td>
                        <td className="ix-muted ix-nowrap">{when(s.at, t)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="ix-card" aria-label="Website area">
          <div className="ix-card__head"><h2>Website area</h2></div>
          <nav className="wo-areas" aria-label="Website pages">
            {areas.map(([id, label, href, icon, sub]) => (
              <Link key={id} href={href} className="wo-area">
                <span className="wo-area__ic"><Icon name={icon} width="16" height="16" aria-hidden="true" /></span>
                <span className="wo-area__txt"><b>{label}</b><small>{sub}</small></span>
              </Link>
            ))}
          </nav>
        </section>
      </>
    );
  }

  return (
    <AdminShell active="website" title="Website">
      <style dangerouslySetInnerHTML={{ __html: W2_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
    </AdminShell>
  );
}
