'use client';
// Grid Career › Careers page (/admin/career/page; Batch F) — GridCommerce's public careers page at /jobs: headline, about,
// benefits, logo, cover and on / off, and the messages candidates get at each stage (English and Bangla).

import React from 'react';
import { ShopHeader } from '@/components/ui/IndexKit';
import { GC, careersLink } from '@/lib/platform/career';
import { CareersPageForm, TemplatesForm } from '@/screens/career/CareerSettings';
import { useCareer, CAREER_CSS } from '@/screens/career/careerShared';
import { AdminShell } from '../AdminShell';
import { staffName } from './careerAdmin';

export default function CareerPage() {
  const { ready } = useCareer();
  return (
    <AdminShell active="career-page" title="Careers page">
      <style dangerouslySetInnerHTML={{ __html: CAREER_CSS }} />
      <div className="ix-page ix-page--narrow">
        <ShopHeader icon="layout-template" title="Careers page" about="What candidates see at gridcommerce’s /jobs page above the open jobs, and the SMS and email they get as they move through hiring."
          primary={{ label: 'Open /jobs', icon: 'external-link', onClick: () => window.open(careersLink(GC), '_blank', 'noopener') }} />
        <section className="ix-card" aria-labelledby="cp-page">
          <header className="ix-card__head"><h2 id="cp-page">GridCommerce careers page</h2></header>
          <div className="ix-card__body">{ready ? <CareersPageForm owner={GC} by={staffName()} /> : <div style={{ minHeight: 300 }} aria-busy="true" />}</div>
        </section>
        <section className="ix-card" aria-labelledby="cp-msg">
          <header className="ix-card__head"><h2 id="cp-msg">Messages to candidates</h2></header>
          <div className="ix-card__body">{ready ? <TemplatesForm owner={GC} /> : null}</div>
        </section>
      </div>
    </AdminShell>
  );
}
