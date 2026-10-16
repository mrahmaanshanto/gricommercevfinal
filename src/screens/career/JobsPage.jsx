'use client';
// Jobs at GridCommerce (/jobs; Batch F · Grid Career) — GridCommerce's own careers page, in the GridCommerce look (not a
// store theme), with no menu and no sign-in: the headline, about and benefits from Grid Career › Careers page, the open
// jobs, and /jobs?job=JOB-xxx with the Apply form (PublicJob.jsx). ?src= is kept on the application; ?preview=1 shows a
// job that is not open yet (staff, from the job editor).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Pic } from '@/components/ui/Pic';
import { GC, CAREER_EVENT, employerOf, jobById, publicJobs, isLive, SOURCES } from '@/lib/platform/career';
import { PUBLIC_JOB_CSS, JobCards, CareersHero, NotHiring, JobPost } from './PublicJob';
import { qp } from './careerShared';

export const PUBLIC_SHELL_CSS = `
.pjs{min-height:100vh;display:flex;flex-direction:column;background:var(--surface-page)}
.pjs-top{position:sticky;top:0;z-index:20;background:var(--surface-card);border-bottom:1px solid var(--border-subtle)}
.pjs-top>div{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1120px;margin:0 auto;padding:12px 16px}
.pjs-brand{display:flex;align-items:center;gap:10px;color:var(--text-heading);text-decoration:none}
.pjs-brand img{height:28px;width:auto}
.pjs-brand b{font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.pjs-brand span{font-size:var(--text-xs);color:var(--text-muted)}
.pjs-main{flex:1;width:100%;max-width:1120px;margin:0 auto;padding:24px 16px 64px;box-sizing:border-box}
.pjs-foot{border-top:1px solid var(--border-subtle);background:var(--surface-card)}
.pjs-foot>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;max-width:1120px;margin:0 auto;padding:16px;font-size:var(--text-xs);color:var(--text-muted)}
.pjs-foot a{color:var(--text-muted)}
.pjs-brand{min-width:0}
@media (max-width:640px){.pjs-check{width:44px;padding:0;justify-content:center}.pjs-check span{display:none}.pjs-brand img{height:22px}.pjs-main{padding:16px 16px 48px}}
`;
const LOGO = '/assets/62dadbbb3f365aebdd41bb9975f5931f.png';

/** The page frame of /jobs and /application. brand = { name, logo, href } of the employer (GridCommerce by default). */
export function PublicShell({ screen, children, sub = 'Careers', brand }) {
  return (
    <div className="dc-screen ds pjs" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: PUBLIC_SHELL_CSS + PUBLIC_JOB_CSS }} />
      <header className="pjs-top"><div>
        {brand ? <a className="pjs-brand" href={brand.href}><Pic src={brand.logo} name={brand.name} kind="logo" size={32} /><span><b>{brand.name}</b><span style={{ display: 'block' }}>{sub}</span></span></a>
          : <a className="pjs-brand" href="/jobs"><img src={LOGO} alt="GridCommerce" /><span>{sub}</span></a>}
        {screen === 'ApplicationStatus' ? null : <a className="gc-btn gc-btn--neutral pjs-check" href="/application" style={{ textDecoration: 'none' }} aria-label="Check an application"><Icon name="search" width="16" height="16" aria-hidden="true" /><span>Check an application</span></a>}
      </div></header>
      <main className="pjs-main">{children}</main>
      <footer className="pjs-foot"><div>{brand ? <span>{brand.name} · hiring with Grid Career by GridCommerce</span> : <><span>© GridCommerce · Dhaka, Bangladesh</span><span>Questions about a job? Write to jobs@gridcommerce.net</span></>}</div></footer>
    </div>
  );
}

export default function JobsPage() {
  const [st, setSt] = useState(null);
  useEffect(() => {
    const load = () => {
      const employer = employerOf(GC);
      const id = qp('job');
      const preview = qp('preview') === '1';
      const s = qp('src');
      const source = SOURCES.some(([k]) => k === s) ? s : 'careers page';
      const job = id ? jobById(id) : null;
      const mine = job && job.owner === GC && !job.hidden ? job : null;
      const open = !!mine && employer.published && isLive(mine);
      setSt({ employer, jobs: publicJobs(GC), id, job: mine && (open || preview) ? mine : null, open, preview: preview && !!mine && !open, source });
    };
    load();
    window.addEventListener(CAREER_EVENT, load); window.addEventListener('storage', load);
    return () => { window.removeEventListener(CAREER_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  useEffect(() => { if (st) document.title = (st.job ? st.job.title + ' · ' : '') + 'Jobs at GridCommerce'; }, [st]);
  const keep = st && st.source !== 'careers page' ? '&src=' + encodeURIComponent(st.source) : '';
  return (
    <PublicShell screen="JobsPage">
      {!st ? <div style={{ minHeight: 480 }} aria-busy="true" /> : (
        <div className="pj pj--gc">
          {st.id ? (st.job ? <JobPost job={st.job} employer={st.employer} ui="gc" source={st.source} preview={st.preview} open={st.open} backHref="/jobs" />
            : <section className="pj-closed"><Icon name="briefcase" width="32" height="32" aria-hidden="true" /><h2>This job is closed</h2><p className="pj-muted">It is not taking applications any more.</p><a className="gc-btn gc-btn--solid" href="/jobs" style={{ textDecoration: 'none' }}>See our open jobs</a></section>)
            : (<>
              {st.employer.published ? <CareersHero employer={st.employer} /> : null}
              {st.jobs.length ? <><h2>Open jobs · {st.jobs.length}</h2><JobCards jobs={st.jobs} hrefOf={(j) => '/jobs?job=' + j.id + keep} /></> : <NotHiring employer={st.employer} ui="gc" />}
            </>)}
        </div>
      )}
    </PublicShell>
  );
}
