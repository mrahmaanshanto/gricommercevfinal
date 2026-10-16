'use client';
// Staff & HR › Hiring › a job (/hiring-job?id=, ?id=new for a new one; Batch F) — the job post and its application form
// (career/JobEditor.jsx), for Dazzle Shop. A job can be linked to an HR position, so Hire fills Add staff with it.

import React, { useEffect, useState } from 'react';
import { SELF_SHOP } from '@/lib/platform/career';
import { useHr } from '@/screens/staff-hr/hrShared';
import { JobEditor } from './JobEditor';
import { HiringFrame, byName } from './Hiring';
import { qp } from './careerShared';

const PLACES = ['Dhanmondi branch', 'Mirpur branch', 'Central Warehouse (Tejgaon)', 'Dhaka', 'Remote'];

export default function HiringJob() {
  const { S } = useHr();
  const [id, setId] = useState(null);
  useEffect(() => { setId(qp('id') || 'new'); }, []);
  return (
    <HiringFrame screen="HiringJob" active="hr-job" page="Job">
      {id ? <JobEditor owner={SELF_SHOP} id={id} by={byName()} listHref="/hiring" editHref={(x) => '/hiring-job?id=' + x} boardHref={(x) => '/hiring-applicants?job=' + x}
        places={PLACES} positions={(S.settings.positions || []).map((p) => ({ title: p.title, department: p.department }))} /> : <div style={{ minHeight: 400 }} aria-busy="true" />}
    </HiringFrame>
  );
}
