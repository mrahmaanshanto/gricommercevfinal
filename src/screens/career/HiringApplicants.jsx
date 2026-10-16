'use client';
// Staff & HR › Hiring › Applicants (/hiring-applicants?job=; Batch F) — the hiring board for Dazzle Shop's jobs
// (career/Applicants.jsx: board by stage, table with filters and CSV, the applicant sheet). Hire moves the applicant to
// Hired and opens Add staff (/staff-create) with their name, mobile, email, position and branch filled in.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { SELF_SHOP } from '@/lib/platform/career';
import { ApplicantsView } from './Applicants';
import { HiringFrame, byName } from './Hiring';
import { useCareer, qp } from './careerShared';

export default function HiringApplicants() {
  const { ready, tick } = useCareer();
  const router = useRouter();
  const [job, setJob] = useState(null);
  useEffect(() => { setJob(qp('job')); }, []);
  return (
    <HiringFrame screen="HiringApplicants" active="hr-applicants" page="Applicants">
      {job != null ? <ApplicantsView owner={SELF_SHOP} jobId={job} by={byName()} ready={ready} tick={tick} listHref="/hiring"
        editHref={(x) => '/hiring-job?id=' + x} boardHref={(x) => '/hiring-applicants' + (x ? '?job=' + x : '')}
        hireNote="They move to Hired, and Add staff opens with their name, mobile, email and position filled in."
        onHire={(r) => { toast(r.app.name + ' hired. Finish adding them to your staff.'); router.push(r.href); }} /> : <div style={{ minHeight: 400 }} aria-busy="true" />}
    </HiringFrame>
  );
}
