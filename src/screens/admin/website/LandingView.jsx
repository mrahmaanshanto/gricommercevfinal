'use client';
// Website › Landing page (/admin/website/landing-pages/view?id=LP-101) — one campaign page: a preview in Desktop /
// Tablet / Phone frames (a mock drawn from the page's sections, in the look of the merchant panel's landing page
// builder, screens/landing-page-builder; these pages are not live), its results (visits, submissions, conversion, visits
// by day), and on the side the publishing steps Draft → Review → Approved → Published (the editor cannot approve),
// the campaign, the UTM link and the attached form, then the page's history.
// Data: lib/admin/website2.js (submitForReview, approve, sendBack, publish, archive, restore, setCampaign, setUtm,
// setLpForm, lpResults, lpDaily, lpUrl). Publishing changes this demo only: the live site is not touched.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { ColumnChart, CHART_CSS } from '@/components/charts/DashCharts';
import { useAdminStore } from '@/lib/admin/store';
import {
  webStore, SITE_HOST, UTM_SOURCES, UTM_MEDIUMS, assetUrl, lpUrl, lpResults, lpDaily, pct,
  submitForReview, approve, sendBack, publish, archive, restore, setCampaign, setUtm, setLpForm,
} from '@/lib/admin/website2';
import { AdminShell } from '../AdminShell';
import { W2_CSS, LpBadge, Field, ctl, Skeleton, me, num, stamp, when } from './web2Shared';

const DEVICES = [['desktop', 'Desktop', 'monitor'], ['tablet', 'Tablet', 'tablet'], ['phone', 'Phone', 'smartphone']];

const CSS = `
.lv-seg{display:inline-flex;gap:2px;padding:2px;border-radius:var(--radius-full);background:var(--surface-subtle)}
.lv-seg button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 var(--space-3);border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.lv-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);box-shadow:var(--shadow-xs)}
.lv-canvas{display:flex;justify-content:center;margin:var(--space-3) var(--space-4) var(--space-4);padding:var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);overflow:hidden}
.lv-frame{width:100%;max-width:1100px;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-sm);transition:max-width var(--duration-base) var(--ease-out)}
.lv-frame--tablet{max-width:768px;border-radius:var(--radius-xl)}
.lv-frame--phone{max-width:375px;border-radius:var(--radius-2xl);border-width:6px;border-color:var(--slate-800)}
.lv-bar{display:flex;align-items:center;gap:var(--space-2);height:30px;padding:0 var(--space-3);border-bottom:1px solid var(--border-subtle);background:var(--surface-page)}
.lv-bar i{width:8px;height:8px;border-radius:var(--radius-full);background:var(--border-strong)}
.lv-bar code{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:2px var(--space-2);border-radius:var(--radius-full);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.lv-frame--phone .lv-bar i{display:none}
.lv-scroll{max-height:640px;overflow-y:auto}
.lv-page{font-size:var(--text-sm);color:var(--text-body)}
.lv-nav{display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) var(--space-5)}
.lv-nav img{height:20px;width:auto}
.lv-nav span{display:inline-flex;align-items:center;height:28px;padding:0 var(--space-3);border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.lv-sec{padding:var(--space-6) var(--space-5);border-top:1px solid var(--border-subtle)}
.lv-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:var(--space-5);align-items:center;padding:var(--space-6) var(--space-5);background:linear-gradient(180deg,var(--fill-primary-soft),var(--surface-card))}
.lv-hero__t{margin:0 0 var(--space-2);font-size:var(--text-2xl);font-weight:var(--weight-semibold);line-height:1.2;color:var(--text-heading)}
.lv-hero__b{margin:0 0 var(--space-4);line-height:1.6}
.lv-cta{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 var(--space-4);border-radius:var(--radius-lg);background:var(--primary);color:var(--text-inverse);font-size:var(--text-sm);font-weight:var(--weight-medium)}
.lv-hero__img{width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.lv-hero__img img{width:100%;height:100%;object-fit:cover;display:block}
.lv-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-4)}
.lv-ben{display:flex;flex-direction:column;gap:4px}
.lv-ben__ic{display:grid;place-items:center;width:32px;height:32px;margin-bottom:4px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.lv-ben b,.lv-step b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.lv-ben small,.lv-step small{font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.lv-step{display:flex;gap:var(--space-2)}
.lv-step__n{flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);font-family:var(--font-data);font-size:var(--text-xs)}
.lv-logos{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:var(--space-5)}
.lv-logos img{height:24px;width:auto;max-width:96px;object-fit:contain}
.lv-proof{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:center}
.lv-proof q{display:block;font-size:var(--text-base);line-height:1.6;color:var(--text-heading)}
.lv-proof small{display:block;margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.lv-stat{display:flex;flex-direction:column;align-items:center;padding:var(--space-3);border-radius:var(--radius-xl);background:var(--surface-page)}
.lv-stat b{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--primary)}
.lv-offer{display:flex;flex-direction:column;align-items:center;gap:4px;padding:var(--space-4);border:1px dashed var(--primary);border-radius:var(--radius-xl);text-align:center}
.lv-offer b{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lv-form{max-width:440px;margin:0 auto;padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm)}
.lv-form__t{margin:0 0 var(--space-3);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lv-form__f{display:flex;flex-direction:column;gap:4px;margin-bottom:var(--space-2);font-size:var(--text-xs);color:var(--text-heading)}
.lv-form__f span{height:32px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.lv-form__f span.is-long{height:56px}
.lv-form .lv-cta{width:100%;justify-content:center;margin-top:var(--space-2)}
.lv-noform{max-width:440px;margin:0 auto;padding:var(--space-4);border:1px dashed var(--warning);border-radius:var(--radius-xl);text-align:center;color:var(--text-warning)}
.lv-faq{display:flex;flex-direction:column;gap:var(--space-2)}
.lv-faq div{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.lv-faq b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.lv-faq small{font-size:var(--text-xs);color:var(--text-muted)}
.lv-foot{padding:var(--space-3) var(--space-5);background:var(--primary);color:var(--text-inverse);font-size:var(--text-xs)}
.lv-label{margin:0 0 var(--space-3);font-size:var(--text-xs);font-weight:var(--weight-semibold);letter-spacing:.04em;color:var(--text-muted);text-transform:uppercase}
.lv-frame--phone .lv-hero,.lv-frame--phone .lv-proof{grid-template-columns:minmax(0,1fr)}
.lv-frame--phone .lv-cols{grid-template-columns:minmax(0,1fr)}
.lv-frame--phone .lv-hero__t{font-size:var(--text-xl)}
.lv-frame--phone .lv-sec,.lv-frame--phone .lv-hero{padding:var(--space-5) var(--space-4)}
.lv-frame--tablet .lv-cols{grid-template-columns:repeat(2,minmax(0,1fr))}
.lv-note{margin:var(--space-2) var(--space-4) 0;font-size:var(--text-xs);color:var(--text-muted)}
.lv-res{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);margin-bottom:var(--space-3)}
.lv-res div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.lv-res span{font-size:var(--text-xs);color:var(--text-muted)}
.lv-res b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lv-steps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.lv-steps li{position:relative;display:grid;grid-template-columns:24px minmax(0,1fr);gap:var(--space-2);padding-bottom:var(--space-3)}
.lv-steps li:not(:last-child)::after{content:'';position:absolute;left:11px;top:24px;bottom:0;width:2px;background:var(--border-subtle)}
.lv-steps li.is-done:not(:last-child)::after{background:var(--success)}
.lv-dot{position:relative;z-index:1;display:grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);border:2px solid var(--border-strong);background:var(--surface-card);color:var(--text-inverse)}
.is-done .lv-dot{border-color:var(--success);background:var(--success)}
.is-now .lv-dot{border-color:var(--primary);background:var(--fill-primary-soft)}
.lv-steps b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.lv-steps small{font-size:var(--text-xs);color:var(--text-muted)}
.lv-rule{display:flex;gap:6px;margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page);font-size:var(--text-xs);color:var(--text-body)}
.lv-rule svg{flex:none;margin-top:1px;color:var(--text-muted)}
.lv-side-form{display:flex;flex-direction:column;gap:var(--space-3)}
.lv-row{display:flex;justify-content:flex-end;gap:var(--space-2)}
@media (max-width:640px){
  .lv-canvas{margin:var(--space-3) 0 0;padding:var(--space-2);border-radius:0}
  .lv-seg button span{display:none}
  .lv-res{grid-template-columns:repeat(3,minmax(0,1fr))}
}
`;

const LOGO = assetUrl('brand/v2/gridcommerce-logo.png');
const LOGO_FILE = { shopify: 'shopify.webp', wordpress: 'wordpress.webp' };

/** The page drawn from its sections (a mock: the landing pages are not live). */
function PagePreview({ lp, form, device }) {
  const bn = lp.lang === 'bn';
  return (
    <div className={'lv-frame lv-frame--' + device} role="img" aria-label={`${lp.title}: ${device} preview`}>
      <div className="lv-bar" aria-hidden="true"><i /><i /><i /><code>{SITE_HOST}/lp/{lp.slug}</code></div>
      <div className="lv-scroll">
        <div className={'lv-page' + (bn ? ' w2-bn' : '')} aria-hidden="true">
          <div className="lv-nav"><img src={LOGO} alt="" /><span>{bn ? 'ফ্রি শুরু করুন' : 'Start free'}</span></div>
          {lp.sections.map((s, i) => {
            if (s.kind === 'hero') {
              return (
                <div key={i} className="lv-hero">
                  <div><p className="lv-hero__t">{s.title}</p><p className="lv-hero__b">{s.body}</p><span className="lv-cta">{s.cta}<Icon name="arrow-right" width="14" height="14" /></span></div>
                  <div className="lv-hero__img">{s.image ? <img src={assetUrl(s.image)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}</div>
                </div>
              );
            }
            if (s.kind === 'benefits') {
              return (
                <div key={i} className="lv-sec"><div className="lv-cols">
                  {s.items.map(([icon, t, b]) => <div key={t} className="lv-ben"><span className="lv-ben__ic"><Icon name={icon} width="16" height="16" /></span><b>{t}</b><small>{b}</small></div>)}
                </div></div>
              );
            }
            if (s.kind === 'steps') {
              return (
                <div key={i} className="lv-sec"><p className="lv-label">{bn ? 'কীভাবে' : 'How it works'}</p><div className="lv-cols">
                  {s.items.map(([t, b], k) => <div key={t} className="lv-step"><span className="lv-step__n">{k + 1}</span><span><b>{t}</b><br /><small>{b}</small></span></div>)}
                </div></div>
              );
            }
            if (s.kind === 'logos') {
              return (
                <div key={i} className="lv-sec"><div className="lv-logos">
                  {s.items.map((x) => <img key={x} src={assetUrl('integrations/' + (LOGO_FILE[x] || x + '.png'))} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />)}
                </div></div>
              );
            }
            if (s.kind === 'proof') {
              return (
                <div key={i} className="lv-sec"><div className="lv-proof">
                  <div><q>{s.quote}</q><small>{s.by}</small></div>
                  {s.stat ? <div className="lv-stat"><b>{s.stat}</b><small>{s.statLabel}</small></div> : null}
                </div></div>
              );
            }
            if (s.kind === 'offer') {
              return <div key={i} className="lv-sec"><div className="lv-offer"><small>{s.title}</small><b>{s.price}</b><small>{s.note}</small></div></div>;
            }
            if (s.kind === 'form') {
              return (
                <div key={i} className="lv-sec">
                  {form ? (
                    <div className="lv-form">
                      <p className="lv-form__t">{s.title}</p>
                      {form.fields.slice(0, 6).map((f) => <label key={f.key} className="lv-form__f">{f.label}{f.required ? ' *' : ''}<span className={f.type === 'textarea' ? 'is-long' : ''} /></label>)}
                      <span className="lv-cta">{form.submitLabel}</span>
                    </div>
                  ) : <div className="lv-noform">No form attached: this section collects nothing yet.</div>}
                </div>
              );
            }
            if (s.kind === 'faq') {
              return (
                <div key={i} className="lv-sec"><p className="lv-label">{bn ? 'প্রশ্ন ও উত্তর' : 'Questions'}</p><div className="lv-faq">
                  {s.items.map(([qq, a]) => <div key={qq}><b>{qq}</b><small>{a}</small></div>)}
                </div></div>
              );
            }
            return null;
          })}
          <div className="lv-foot">GridCommerce · All together. More commerce.</div>
        </div>
      </div>
    </div>
  );
}

function Steps({ lp }) {
  const order = ['Draft', 'In review', 'Approved', 'Published'];
  const at = lp.status === 'Archived' ? (lp.publishedAt ? 4 : 0) : order.indexOf(lp.status);
  const rows = [
    ['Draft', lp.editor ? 'Edited by ' + lp.editor : '', lp.createdAt],
    ['Review', lp.submittedAt ? 'Sent by ' + lp.editor : 'Not sent yet', lp.submittedAt],
    ['Approved', lp.approver ? 'By ' + lp.approver : 'Someone other than the editor', lp.approvedAt],
    ['Published', lp.publishedAt ? 'Live at /lp/' + lp.slug : 'After approval', lp.publishedAt],
  ];
  return (
    <ol className="lv-steps" aria-label="Publishing steps">
      {rows.map(([label, sub, ms], i) => {
        const done = i < at || (i === at && lp.status === 'Published') || (lp.status === 'Archived' && lp.publishedAt);
        const now = i === at && !done;
        return (
          <li key={label} className={done ? 'is-done' : now ? 'is-now' : ''} aria-current={now ? 'step' : undefined}>
            <span className="lv-dot">{done ? <Icon name="check" width="12" height="12" aria-hidden="true" /> : null}</span>
            <span><b>{label}</b><small>{sub}{ms && (done || now) ? ' · ' + stamp(ms) : ''}</small></span>
          </li>
        );
      })}
    </ol>
  );
}

export default function LandingView() {
  const { data, t, live } = useAdminStore(webStore);
  const [id, setId] = useState(null);
  const [device, setDevice] = useState('desktop');
  const [campD, setCampD] = useState(null);
  const [utmD, setUtmD] = useState(null);
  const [formD, setFormD] = useState(null);
  const [back, setBack] = useState(null);   // the Send back panel: { reason, error }

  useEffect(() => { setId(new URLSearchParams(window.location.search).get('id') || ''); }, []);
  const lp = live && id ? data.landings.find((l) => l.id === id) : null;
  // drafts of the side cards start from what is saved (keyed by page, so another page starts fresh)
  const camp = lp && campD && campD.id === lp.id ? campD.v : lp ? lp.campaign : '';
  const setCamp = (v) => setCampD({ id: lp.id, v });
  const utm = lp ? (utmD && utmD.id === lp.id ? utmD : { id: lp.id, ...lp.utm, errors: {} }) : null;
  const setUtmDraft = (v) => setUtmD({ ...v, id: lp.id });
  const formPick = lp && formD && formD.id === lp.id ? formD.v : lp ? lp.formId : '';
  const setFormPick = (v) => setFormD({ id: lp.id, v });

  const forms = data.forms || [];
  const form = lp ? forms.find((f) => f.id === lp.formId) : null;
  const campaigns = [...new Set((data.landings || []).map((l) => l.campaign).filter(Boolean))].sort();
  const who = me();

  const done = (res, msg) => { if (!res.ok) { toast(res.error, { tone: 'error' }); return false; } if (msg) toast(msg); return true; };
  const copy = (text) => { try { navigator.clipboard.writeText(text); toast('Link copied'); } catch { toast('Copy failed: select the link and copy it'); } };

  if (!live || id === null) {
    return <AdminShell active="web-landing" title="Landing page"><style dangerouslySetInnerHTML={{ __html: W2_CSS }} /><div className="ix-page"><Skeleton label="Loading the landing page" tall /></div></AdminShell>;
  }
  if (!lp) {
    return (
      <AdminShell active="web-landing" title="Landing page">
        <style dangerouslySetInnerHTML={{ __html: W2_CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/website/landing-pages" backLabel="Back to landing pages" title="Landing page not found" />
          <section className="ix-card"><div className="ix-empty"><EmptyState icon="file-x" title={id ? `There is no landing page ${id}.` : 'No landing page was picked.'} actionLabel="All landing pages" onAction={() => { window.location.href = '/admin/website/landing-pages'; }} /></div></section>
        </div>
      </AdminShell>
    );
  }

  const r = lpResults(data, lp);
  const daily = lpDaily(lp, t, 30);
  const url = lpUrl(lp);
  const draftUrl = utm ? lpUrl(lp, utm) : url;

  const doArchive = async () => {
    const yes = await confirmDialog({
      title: lp.status === 'Published' ? `Take ${lp.title} off the site?` : `Archive ${lp.title}?`,
      body: lp.status === 'Published' ? 'Visitors to the address get the homepage instead, and ads pointing here stop converting. Its results are kept. (Demo: the live site is not changed.)' : 'It leaves the work list; you can restore it as a draft.',
      confirmLabel: lp.status === 'Published' ? 'Take off and archive' : 'Archive', tone: 'danger',
    });
    if (yes) done(archive(lp.id, '', who), 'Archived');
  };

  let primary = null;
  const secondary = [];
  if (lp.status === 'Draft') primary = { label: 'Send for review', icon: 'send', onClick: () => done(submitForReview(lp.id, who), 'Sent for review') };
  if (lp.status === 'In review') {
    primary = { label: 'Approve', icon: 'check', onClick: () => done(approve(lp.id, who), 'Approved. It can be published now.') };
    secondary.push({ label: 'Send back', icon: 'undo-2', onClick: () => setBack({ reason: '', error: '' }) });
  }
  if (lp.status === 'Approved') {
    primary = { label: 'Publish', icon: 'globe', onClick: () => done(publish(lp.id, who), 'Published. The live site is not changed in this demo.') };
    secondary.push({ label: 'Send back', icon: 'undo-2', onClick: () => setBack({ reason: '', error: '' }) });
  }
  if (lp.status === 'Published') primary = { label: 'Copy link', icon: 'link', onClick: () => copy(url) };
  if (lp.status === 'Archived') primary = { label: 'Restore as draft', icon: 'archive-restore', onClick: () => done(restore(lp.id, who), 'Restored as a draft') };
  const more = [
    lp.status !== 'Published' ? { label: 'Copy link with UTM', onClick: () => copy(url) } : null,
    { label: 'Submissions from this page', href: '/admin/website/forms?tab=submissions&page=' + encodeURIComponent('/lp/' + lp.slug) },
    lp.status !== 'Archived' ? { label: lp.status === 'Published' ? 'Take off the site' : 'Archive', tone: 'danger', onClick: doArchive } : null,
  ].filter(Boolean);

  const saveUtm = () => {
    const res = setUtm(lp.id, utm, who);
    if (!res.ok) { setUtmDraft({ ...utm, errors: { [res.field || 'form']: res.error } }); return; }
    setUtmD(null);
    toast('UTM saved');
  };
  const utmDirty = utm && ['source', 'medium', 'campaign', 'content'].some((k) => (utm[k] || '') !== (lp.utm[k] || ''));
  const ue = (utm && utm.errors) || {};
  const setU = (k) => (e) => setUtmDraft({ ...utm, [k]: e.target.value, errors: {} });

  return (
    <AdminShell active="web-landing" title={lp.title}>
      <style dangerouslySetInnerHTML={{ __html: W2_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/website/landing-pages" backLabel="Back to landing pages" title={lp.title} badges={<LpBadge s={lp.status} />}
          meta={<><span className="w2-data">{SITE_HOST}/lp/{lp.slug}</span> · {lp.template} · edited by {lp.editor} · {when(lp.updatedAt, t)}</>}
          about="A campaign landing page. Preview it at three sizes, set its campaign, UTM link and form, and move it through review. The editor cannot approve their own page. Publishing here does not change the live site in this demo."
          secondary={secondary} more={more} primary={primary} />

        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card" aria-label="Preview">
              <div className="ix-card__head">
                <h2>Preview <InfoTip text="Drawn from the page's sections and its form. Landing pages are not live in this demo, so this is a mock, not a screenshot." /></h2>
                <span className="lv-seg" role="group" aria-label="Preview size">
                  {DEVICES.map(([k, label, icon]) => <button key={k} type="button" aria-pressed={device === k} aria-label={label} onClick={() => setDevice(k)}><Icon name={icon} width="14" height="14" aria-hidden="true" /><span>{label}</span></button>)}
                </span>
              </div>
              <div className="lv-canvas"><PagePreview lp={lp} form={form} device={device} /></div>
            </section>

            <section className="ix-card" aria-label="Results">
              <div className="ix-card__head"><h2>Results{r.lifetime ? ' · all time' : ' · last 60 days'}</h2>{r.subs ? <Link href={'/admin/website/forms?tab=submissions&page=' + encodeURIComponent('/lp/' + lp.slug)}>Submissions</Link> : null}</div>
              <div className="w2-body">
                {lp.status === 'Published' || r.lifetime ? (
                  <>
                    <div className="lv-res">
                      <div><span>Visits</span><b>{num(r.visits)}</b></div>
                      <div><span>Submissions</span><b>{num(r.subs)}</b></div>
                      <div><span>Conversion</span><b>{pct(r.rate)}</b></div>
                    </div>
                    {daily.length ? <ColumnChart label={'Visits per day to ' + lp.title + ', last 30 days'} data={daily.map((d) => ({ label: d.label, values: [d.visits] }))} series={[{ name: 'Visits', color: 'var(--viz-1)' }]} fmt={num} height={180} now={daily.length - 1} /> : null}
                  </>
                ) : <p className="w2-muted" style={{ margin: 0 }}>Results show once the page is published.</p>}
              </div>
            </section>
          </div>

          <div className="ix-side">
            <section className="ix-card" aria-label="Publishing">
              <div className="ix-card__head"><h2>Publishing</h2></div>
              <div className="w2-body lv-side-form">
                <Steps lp={lp} />
                {lp.status === 'In review' && lp.editor === who ? (
                  <p className="lv-rule"><Icon name="user-round-x" width="14" height="14" aria-hidden="true" />You edited this page, so someone else approves it. Switch staff in the menu to try it.</p>
                ) : <p className="lv-rule"><Icon name="shield-check" width="14" height="14" aria-hidden="true" />The approver is never the editor.</p>}
              </div>
            </section>

            <section className="ix-card" aria-label="Campaign">
              <div className="ix-card__head"><h2>Campaign</h2></div>
              <div className="w2-body lv-side-form">
                <Field id="lv-camp" label="Marketing campaign">
                  <input id="lv-camp" {...ctl(false)} list="lv-camps" value={camp || ''} onChange={(e) => setCamp(e.target.value)} placeholder="e.g. Eid sale season 2027" />
                  <datalist id="lv-camps">{campaigns.map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
                <div className="lv-row"><button type="button" className="ix-btn" disabled={(camp || '') === (lp.campaign || '')} onClick={() => { if (done(setCampaign(lp.id, camp, who), 'Campaign saved')) setCampD(null); }}>Save campaign</button></div>
              </div>
            </section>

            <section className="ix-card" aria-label="UTM link">
              <div className="ix-card__head"><h2>UTM link <InfoTip text="The tags added to the link in ads and posts, so visits and sign-ups are counted by source and campaign in Analytics." /></h2></div>
              {utm ? (
                <div className="w2-body lv-side-form">
                  <div className="w2-form__two">
                    <Field id="lv-src" label="Source" error={ue.source}>
                      <input id="lv-src" {...ctl(ue.source)} list="lv-srcs" value={utm.source} onChange={setU('source')} />
                      <datalist id="lv-srcs">{UTM_SOURCES.map((x) => <option key={x} value={x} />)}</datalist>
                    </Field>
                    <Field id="lv-med" label="Medium" error={ue.medium}>
                      <input id="lv-med" {...ctl(ue.medium)} list="lv-meds" value={utm.medium} onChange={setU('medium')} />
                      <datalist id="lv-meds">{UTM_MEDIUMS.map((x) => <option key={x} value={x} />)}</datalist>
                    </Field>
                  </div>
                  <Field id="lv-uc" label="Campaign" error={ue.campaign}>
                    <input id="lv-uc" {...ctl(ue.campaign)} value={utm.campaign} onChange={setU('campaign')} placeholder="eid-toolkit-2027" />
                  </Field>
                  <Field id="lv-ucon" label="Content" hint="Optional: which ad or post.">
                    <input id="lv-ucon" {...ctl(false)} value={utm.content} onChange={setU('content')} placeholder="carousel-a" />
                  </Field>
                  <span className="w2-copy"><code>{draftUrl}</code><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Copy link" onClick={() => copy(draftUrl)}><Icon name="copy" width="14" height="14" aria-hidden="true" /></button></span>
                  <div className="lv-row"><button type="button" className="ix-btn" disabled={!utmDirty} onClick={saveUtm}>Save UTM</button></div>
                </div>
              ) : null}
            </section>

            <section className="ix-card" aria-label="Form">
              <div className="ix-card__head"><h2>Form</h2>{form ? <Link href={'/admin/website/forms?form=' + form.id}>Open form</Link> : null}</div>
              <div className="w2-body lv-side-form">
                <Field id="lv-form" label="Attached form">
                  <select id="lv-form" {...ctl(!lp.formId, true)} value={formPick || ''} onChange={(e) => setFormPick(e.target.value)}>
                    <option value="">No form</option>
                    {forms.map((f) => <option key={f.id} value={f.id}>{f.name}{f.status !== 'Live' ? ' (' + f.status + ')' : ''}</option>)}
                  </select>
                </Field>
                {form ? <KV rows={[['Fields', form.fields.length], ['Goes to', form.destination], ['Status', form.status + (form.health && !form.health.ok ? ' · failing' : '')]]} /> : null}
                <div className="lv-row"><button type="button" className="ix-btn" disabled={(formPick || '') === (lp.formId || '')} onClick={() => { if (done(setLpForm(lp.id, formPick, who), 'Form saved')) setFormD(null); }}>Save form</button></div>
              </div>
            </section>

            <section className="ix-card" aria-label="History">
              <div className="ix-card__head"><h2>History</h2></div>
              <div className="w2-body">
                <ul className="w2-hist">
                  {lp.history.slice().reverse().slice(0, 8).map((h, i) => <li key={i}><span>{h.text}<small>{h.by} · {stamp(h.at)}</small></span></li>)}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Sheet open={!!back} title="Send back to draft" onClose={() => setBack(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBack(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => {
            const res = sendBack(lp.id, back.reason, who);
            if (!res.ok) { setBack({ ...back, error: res.error }); return; }
            setBack(null); toast('Sent back to ' + lp.editor);
          }}>Send back</button>
        </>}>
        {back ? (
          <div className="w2-form">
            <p>{lp.editor} gets the page back as a draft with your note.</p>
            <Field id="lv-why" label="What has to change" error={back.error}>
              <textarea id="lv-why" {...ctl(back.error)} data-autofocus rows={4} value={back.reason} onChange={(e) => setBack({ reason: e.target.value, error: '' })} placeholder="e.g. The offer price is wrong; use ৳1,990." />
            </Field>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
