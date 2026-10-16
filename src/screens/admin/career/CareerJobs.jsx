'use client';
// Grid Career › Jobs (/admin/career; Batch F) — GridCommerce's own job posts: Open · Draft · Closed, the applicants per
// stage, New job. Hiring for GridCommerce here replaces Google Forms, Sheets and posting by hand; the same engine serves
// the stores (Grid Career › Stores). Data: lib/platform/career.js.

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MetricStrip, ShopHeader } from '@/components/ui/IndexKit';
import { GC, report, getApplications, publicJobs, careersLink, now } from '@/lib/platform/career';
import { JobsList } from '@/screens/career/JobsList';
import { useCareer, CAREER_CSS } from '@/screens/career/careerShared';
import { AdminShell } from '../AdminShell';

export default function CareerJobs() {
  const { ready, tick } = useCareer();
  const router = useRouter();
  const r = useMemo(() => (ready ? report(GC) : null), [ready, tick]);
  const apps = useMemo(() => (ready ? getApplications({ owner: GC }) : []), [ready, tick]);
  const t = ready ? now() : 0;
  const month = apps.filter((a) => a.appliedAt >= t - 30 * 864e5).length;
  const coming = apps.filter((a) => a.stage === 'interview' && a.interviews.some((iv) => iv.at > t)).length;
  return (
    <AdminShell active="career-jobs" title="Grid Career">
      <style dangerouslySetInnerHTML={{ __html: CAREER_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="briefcase" title="Jobs"
          about="GridCommerce’s own job posts. Write the job and its questions, publish it on gridcommerce’s careers page (/jobs), share it, and follow applicants on the board. Stores that use Grid Career are in Grid Career › Stores."
          primary={{ label: 'New job', href: '/admin/career/job?id=new' }}
          secondary={[{ label: 'Applicants', href: '/admin/career/applicants' }, { label: 'Careers page', href: '/admin/career/page' }]}
          more={[{ label: 'Open /jobs', onClick: () => window.open(careersLink(GC), '_blank', 'noopener') }, { label: 'Stores using Grid Career', href: '/admin/career/stores' }]} />
        {r ? <MetricStrip label="Hiring" items={[
          { label: 'Open jobs', value: String(publicJobs(GC).length), sub: 'on /jobs', icon: 'briefcase' },
          { label: 'Applicants', value: String(month), sub: 'last 30 days', href: '/admin/career/applicants', icon: 'users' },
          { label: 'To review', value: String(r.perStage.new), sub: 'new', icon: 'user-plus' },
          { label: 'Interviews coming', value: String(coming), icon: 'calendar-clock' },
          { label: 'Hired', value: String(r.hired), sub: r.timeToHire != null ? `${r.timeToHire} days to hire` : '', icon: 'user-check' },
        ]} /> : null}
        <JobsList owner={GC} ready={ready} tick={tick} editHref={(id) => '/admin/career/job?id=' + id} boardHref={(id) => '/admin/career/applicants?job=' + id} onNew={() => router.push('/admin/career/job?id=new')} />
      </div>
    </AdminShell>
  );
}
