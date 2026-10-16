'use client';
// Careers — the store's careers page on its website (/careers; Batch F · Grid Career), in the store's theme: the headline,
// about and benefits from Staff & HR › Hiring › Careers page, then the open jobs. /careers?job=JOB-xxx is one job with the
// Apply form (career/PublicJob.jsx); ?src= says where the link was shared (Facebook, WhatsApp, LinkedIn …) and is kept on
// the application. Shows "Not hiring right now" when the page is off, Grid Career is closed for the store or no job is
// open. ?preview=1 (from the job editor) shows a job that is not open yet, without the form.

import React, { useEffect, useState } from 'react';
import { canUse, MARKET_EVENT } from '@/lib/platform/marketAccess';
import { SELF_SHOP, CAREER_EVENT, employerOf, jobById, publicJobs, isLive, SOURCES } from '@/lib/platform/career';
import { PUBLIC_JOB_CSS, JobCards, CareersHero, NotHiring, JobPost } from '@/screens/career/PublicJob';
import { StoreChrome, Crumbs, query } from './storeChrome';

const CSS = PUBLIC_JOB_CSS + `
.scr{padding-top:4px;padding-bottom:var(--sf-section)}
`;

export default function StoreCareers() {
  const [st, setSt] = useState(null);
  useEffect(() => {
    const load = () => {
      const allowed = canUse('career', SELF_SHOP).ok;
      const employer = employerOf(SELF_SHOP);
      const id = query('job');
      const preview = query('preview') === '1';
      const s = query('src');
      const source = SOURCES.some(([k]) => k === s) ? s : 'careers page';
      const job = id ? jobById(id) : null;
      const mine = job && job.owner === SELF_SHOP && !job.hidden ? job : null;
      const open = !!mine && allowed && employer.published && isLive(mine);
      setSt({ allowed, employer, jobs: allowed ? publicJobs(SELF_SHOP) : [], id, job: mine && (open || preview) ? mine : null, open, preview: preview && !!mine && !open, source });
    };
    load();
    window.addEventListener(CAREER_EVENT, load); window.addEventListener(MARKET_EVENT, load); window.addEventListener('storage', load);
    return () => { window.removeEventListener(CAREER_EVENT, load); window.removeEventListener(MARKET_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  return (
    <StoreChrome screen="StoreCareers" kind="page" pageTitle={st && st.job ? st.job.title + ' · Careers' : 'Careers'} css={CSS}>
      {() => {
        if (!st) return <div className="sf-wrap" style={{ minHeight: 480 }} aria-busy="true" />;
        const e = st.employer;
        const keep = st.source !== 'careers page' ? '&src=' + encodeURIComponent(st.source) : '';
        if (st.id) {
          return (
            <div className="sf-wrap scr pj pj--store">
              <Crumbs items={[{ name: 'Careers', href: '/careers' }, { name: st.job ? st.job.title : 'Job' }]} />
              {st.job ? <JobPost job={st.job} employer={e} ui="store" source={st.source} preview={st.preview} open={st.open} backHref="/careers" />
                : <section className="pj-closed"><h2>This job is closed</h2><p className="sf-muted">It is not taking applications any more.</p>{st.jobs.length ? <a className="sf-btn sf-btn--fill" href="/careers">See our open jobs</a> : null}</section>}
            </div>
          );
        }
        return (
          <div className="sf-wrap scr pj pj--store">
            <Crumbs items={[{ name: 'Careers' }]} />
            {st.allowed && e.published ? <CareersHero employer={e} /> : null}
            {st.jobs.length ? (<>
              <h2>Open jobs · {st.jobs.length}</h2>
              <JobCards jobs={st.jobs} hrefOf={(j) => '/careers?job=' + j.id + keep} />
            </>) : <NotHiring employer={e} ui="store" />}
          </div>
        );
      }}
    </StoreChrome>
  );
}
