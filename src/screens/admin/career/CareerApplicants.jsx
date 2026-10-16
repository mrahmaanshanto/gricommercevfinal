'use client';
// Grid Career › Applicants (/admin/career/applicants?job=; Batch F) — GridCommerce's hiring board: every applicant by stage,
// a table with filters and CSV (what the Google Sheet held), and the applicant sheet. Hire marks the person hired; adding
// them to People › Staff stays a separate step.

import React, { useEffect, useState } from 'react';
import { toast } from '@/runtime/ui';
import { GC } from '@/lib/platform/career';
import { ApplicantsView } from '@/screens/career/Applicants';
import { useCareer, CAREER_CSS, qp } from '@/screens/career/careerShared';
import { AdminShell } from '../AdminShell';
import { staffName } from './careerAdmin';

export default function CareerApplicants() {
  const { ready, tick } = useCareer();
  const [job, setJob] = useState(null);
  useEffect(() => { setJob(qp('job')); }, []);
  return (
    <AdminShell active="career-applicants" title="Applicants">
      <style dangerouslySetInnerHTML={{ __html: CAREER_CSS }} />
      <div className="ix-page">
        {job != null ? <ApplicantsView owner={GC} jobId={job} by={staffName()} ready={ready} tick={tick} listHref="/admin/career"
          editHref={(x) => '/admin/career/job?id=' + x} boardHref={(x) => '/admin/career/applicants' + (x ? '?job=' + x : '')}
          onHire={(r) => toast(`${r.app.name} hired. Add them in People › Staff when they join.`)} /> : <div style={{ minHeight: 400 }} aria-busy="true" />}
      </div>
    </AdminShell>
  );
}
