'use client';
// Staff & HR › Hiring (/hiring; Batch F · Grid Career) — the shop's job posts with their applicants per stage, New job,
// the shop's careers page (on its website at /careers: headline, about, benefits, logo, cover, on / off) and the messages
// candidates get. Open only when GridCommerce has opened Grid Career for the store (lib/platform/marketAccess.js
// 'career'); otherwise the page says why. Data: lib/platform/career.js (shared with the super admin).

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MetricStrip } from '@/components/ui/IndexKit';
import { currentUser } from '@/lib/team';
import { SELF_SHOP, report, getApplications, publicJobs, careersLink, sourceLabel, now } from '@/lib/platform/career';
import { HrPage } from '@/screens/staff-hr/hrShared';
import { useMarket, MarketClosed } from '@/screens/services/svcShared';
import { useCareer, CAREER_CSS } from './careerShared';
import { JobsList } from './JobsList';
import { CareersPageForm, TemplatesForm } from './CareerSettings';

const CSS = CAREER_CSS + `
.hi-src{display:flex;flex-direction:column;gap:8px}
.hi-src div{display:grid;grid-template-columns:110px minmax(0,1fr) 32px;align-items:center;gap:10px;font-size:var(--text-xs)}
.hi-src i{display:block;height:8px;border-radius:var(--radius-full);background:var(--fill-primary-soft);overflow:hidden}
.hi-src i b{display:block;height:100%;background:var(--primary);border-radius:inherit}
.hi-src span:last-child{text-align:right;font-family:var(--font-data);color:var(--text-muted)}
.hi-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--space-4);align-items:start}
@media (max-width:1100px){.hi-split{grid-template-columns:minmax(0,1fr)}}
`;

/** The shell for a Hiring page, with the closed message when Grid Career isn't open for this store. */
export function HiringFrame({ screen, active, page, title, icon, about, primary, secondary, more, children }) {
  const m = useMarket('career');
  const closed = m.ready && !m.ok;
  return (
    <HrPage screen={screen} active={active} page={page} title={closed ? 'Hiring' : title} icon={icon} about={about} css={CSS}
      primary={closed ? undefined : primary} secondary={closed ? [] : secondary} more={closed ? [] : more}>
      {closed ? <MarketClosed title="Grid Career isn’t open for your store" why={m.why} /> : !m.ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : children}
    </HrPage>
  );
}
export const byName = () => { try { return currentUser().name; } catch { return 'Staff'; } };

export default function Hiring() {
  const { ready, tick } = useCareer();
  const router = useRouter();
  const r = useMemo(() => (ready ? report(SELF_SHOP) : null), [ready, tick]);
  const apps = useMemo(() => (ready ? getApplications({ owner: SELF_SHOP }) : []), [ready, tick]);
  const t = ready ? now() : 0;
  const coming = apps.filter((a) => a.stage === 'interview' && a.interviews.some((iv) => iv.at > t)).length;
  const live = ready ? publicJobs(SELF_SHOP).length : 0;
  const srcMax = r ? Math.max(1, ...Object.values(r.perSource)) : 1;
  return (
    <HiringFrame screen="Hiring" active="hr-hiring" page="Hiring" title="Hiring" icon="user-search"
      about="Post jobs on your careers page, share them on Facebook, WhatsApp and LinkedIn, and follow every applicant on one board. Knockout answers reject people who don’t fit by themselves. Hire opens Add staff with their details filled in."
      primary={{ label: 'New job', onClick: () => router.push('/hiring-job?id=new') }}
      secondary={[{ label: 'Applicants', href: '/hiring-applicants' }]}
      more={[{ label: 'See your careers page', onClick: () => window.open(careersLink(SELF_SHOP), '_blank', 'noopener') }]}>
      {r ? <MetricStrip label="Hiring" items={[
        { label: 'Open jobs', value: String(live), sub: 'on your careers page', icon: 'briefcase' },
        { label: 'New applicants', value: String(r.perStage.new), sub: 'to review', href: '/hiring-applicants', icon: 'user-plus' },
        { label: 'Interviews coming', value: String(coming), icon: 'calendar-clock' },
        { label: 'Hired', value: String(r.hired), sub: r.timeToHire != null ? `${r.timeToHire} days to hire on average` : 'nobody yet', icon: 'user-check' },
      ]} /> : null}
      <JobsList owner={SELF_SHOP} ready={ready} tick={tick} editHref={(id) => '/hiring-job?id=' + id} boardHref={(id) => '/hiring-applicants?job=' + id} onNew={() => router.push('/hiring-job?id=new')} />
      <div className="hi-split">
        <section className="ix-card" aria-labelledby="hi-page" id="careers-page">
          <header className="ix-card__head"><h2 id="hi-page">Careers page</h2></header>
          <div className="ix-card__body">{ready ? <CareersPageForm owner={SELF_SHOP} by={byName()} /> : null}</div>
        </section>
        <section className="ix-card" aria-labelledby="hi-src">
          <header className="ix-card__head"><h2 id="hi-src">Where applicants come from</h2></header>
          <div className="ix-card__body hi-src">
            {r ? Object.entries(r.perSource).sort((a, b) => b[1] - a[1]).map(([k, n]) => <div key={k}><span>{sourceLabel(k)}</span><i><b style={{ width: (n / srcMax) * 100 + '%' }} /></i><span>{n}</span></div>) : null}
            {r && r.knockedOut ? <span className="gc-help" style={{ margin: '4px 0 0' }}>{r.knockedOut} rejected by a knockout answer</span> : null}
          </div>
        </section>
      </div>
      <details className="ix-card gc-disclose">
        <summary>Messages to candidates</summary>
        <div>{ready ? <TemplatesForm owner={SELF_SHOP} /> : null}</div>
      </details>
    </HiringFrame>
  );
}
