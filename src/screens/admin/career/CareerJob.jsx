'use client';
// Grid Career › a job (/admin/career/job?id=, ?id=new; Batch F) — GridCommerce's job post and its application form
// (screens/career/JobEditor.jsx, shared with the merchant's Hiring).

import React, { useEffect, useState } from 'react';
import { GC } from '@/lib/platform/career';
import { JobEditor } from '@/screens/career/JobEditor';
import { CAREER_CSS, qp } from '@/screens/career/careerShared';
import { AdminShell } from '../AdminShell';
import { staffName } from './careerAdmin';

const PLACES = ['Dhaka office (Banani)', 'Dhaka (field)', 'Chattogram', 'Remote'];

export default function CareerJob() {
  const [id, setId] = useState(null);
  useEffect(() => { setId(qp('id') || 'new'); }, []);
  return (
    <AdminShell active="career-job" title="Job">
      <style dangerouslySetInnerHTML={{ __html: CAREER_CSS }} />
      <div className="ix-page">
        {id ? <JobEditor owner={GC} id={id} by={staffName()} listHref="/admin/career" editHref={(x) => '/admin/career/job?id=' + x} boardHref={(x) => '/admin/career/applicants?job=' + x} places={PLACES} /> : <div style={{ minHeight: 400 }} aria-busy="true" />}
      </div>
    </AdminShell>
  );
}
