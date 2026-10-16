'use client';
// Your application (/application?code=; Batch F · Grid Career) — the candidate's status page, sent by SMS after applying:
// the job, the stage in plain words, the steps, and the interview's time and place when one is booked. It never shows
// internal notes, ratings or the reason for a rejection. Without a code (or a wrong one) it asks for the 6-letter code.
// No sign-in and no menu; the header carries the employer's name (a store, or GridCommerce).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { applicationByCode, CAREER_EVENT, CANDIDATE_WORDS, GC, modeLabel } from '@/lib/platform/career';
import { PublicShell } from './JobsPage';
import { qp, dLong, dTime } from './careerShared';

const CSS = `
.as{display:flex;flex-direction:column;gap:16px;max-width:620px;margin:0 auto}
.as-card{display:flex;flex-direction:column;gap:14px;padding:24px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-xs)}
.as-card h1{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.as-card h2{margin:0;font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading)}
.as-card p{margin:0;font-size:var(--text-sm);line-height:1.6;color:var(--text-body)}
.as-steps{display:flex;gap:4px;margin:4px 0 0;padding:0;list-style:none}
.as-steps li{flex:1;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-muted);min-width:0}
.as-steps li i{display:block;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle)}
.as-steps li.is-done i{background:var(--primary)}
.as-steps li.is-now{color:var(--text-heading);font-weight:var(--weight-medium)}
.as-steps li.is-now i{background:var(--primary)}
.as-state{display:flex;align-items:center;gap:12px}
.as-state>span:first-child{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary)}
.as-state.is-no>span:first-child{background:var(--surface-subtle);color:var(--text-muted)}
.as-state.is-yes>span:first-child{background:var(--fill-success-soft);color:var(--text-success)}
.as-iv{display:flex;gap:12px;align-items:flex-start;padding:14px;border-radius:var(--radius-lg);background:var(--fill-warning-soft)}
.as-iv svg{flex:none;color:var(--text-warning);margin-top:2px}
.as-iv b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.as-meta{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:var(--text-xs);color:var(--text-muted)}
.as-form{display:flex;gap:8px}
.as-form input{text-transform:uppercase;letter-spacing:.12em;font-family:var(--font-data)}
@media (max-width:640px){.as-card{padding:18px}.as-steps li span{display:none}.as-steps li.is-now span{display:block;white-space:nowrap}}
`;
const PATH = [['new', 'Received'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview'], ['offer', 'Offer'], ['hired', 'Hired']];

export default function ApplicationStatus() {
  const [st, setSt] = useState(null);
  const [code, setCode] = useState('');
  useEffect(() => {
    const load = () => { const c = qp('code'); setCode(c); setSt({ code: c, app: c ? applicationByCode(c) : null }); };
    load();
    window.addEventListener(CAREER_EVENT, load); window.addEventListener('storage', load);
    return () => { window.removeEventListener(CAREER_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  useEffect(() => { document.title = 'Your application'; }, []);
  const a = st && st.app;
  const gc = !a || a.job.owner === GC;
  const brand = a && !gc ? { name: a.employer.name, logo: a.employer.logo, href: '/careers' } : null;
  const words = a ? CANDIDATE_WORDS[a.stage] || CANDIDATE_WORDS.new : null;
  const at = a ? PATH.findIndex(([k]) => k === a.stage) : -1;
  const look = (e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (!c) return; window.history.replaceState(null, '', '/application?code=' + encodeURIComponent(c)); setSt({ code: c, app: applicationByCode(c) }); };
  return (
    <PublicShell screen="ApplicationStatus" sub="Your application" brand={brand}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="as">
        {!st ? <div style={{ minHeight: 320 }} aria-busy="true" /> : a ? (<>
          <section className="as-card" aria-labelledby="as-title">
            <span className="as-meta"><span>{a.employer.name}</span><span>Code {a.code}</span><span>Applied {dLong(a.appliedAt)}</span></span>
            <h1 id="as-title">{a.job.title}</h1>
            <p>Hi {a.name.split(' ')[0]}, here is where your application for {a.job.title}{a.job.place ? ' (' + a.job.place + ')' : ''} is.</p>
            <div className={'as-state' + (a.stage === 'rejected' ? ' is-no' : a.stage === 'hired' ? ' is-yes' : '')} role="status">
              <span aria-hidden="true"><Icon name={a.stage === 'rejected' ? 'circle-minus' : a.stage === 'hired' ? 'party-popper' : a.stage === 'interview' ? 'calendar-clock' : a.stage === 'offer' ? 'mail-open' : 'hourglass'} width="22" height="22" /></span>
              <span><h2>{words[0]}</h2><p>{words[1]}</p></span>
            </div>
            {a.stage !== 'rejected' ? (
              <ol className="as-steps" aria-label="Steps">
                {PATH.map(([k, l], i) => <li key={k} className={(i < at ? 'is-done' : '') + (i === at ? ' is-now' : '')} aria-current={i === at ? 'step' : undefined}><i aria-hidden="true" /><span>{l}</span></li>)}
              </ol>
            ) : null}
            {a.interview ? (
              <div className="as-iv">
                <Icon name="calendar-clock" width="20" height="20" aria-hidden="true" />
                <span><b>{dTime(a.interview.at)}</b><p>{modeLabel(a.interview.mode)}{a.interview.place ? ' · ' + a.interview.place : ''}{a.interview.mode === 'phone' ? ': we will call you on the number you gave' : ''}</p>
                  {a.interview.link ? <p><a href={a.interview.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'var(--weight-medium)' }}>Join the video call</a></p> : null}</span>
              </div>
            ) : null}
          </section>
          <p className="gc-help" style={{ margin: 0, textAlign: 'center' }}>We also send news by SMS. <a href={gc ? '/jobs' : '/careers'} style={{ color: 'var(--primary)' }}>See other open jobs</a></p>
        </>) : (
          <section className="as-card" aria-labelledby="as-find">
            <h1 id="as-find">{st.code ? 'We could not find that application' : 'Check your application'}</h1>
            <p>{st.code ? 'Check the code in the SMS we sent you. It has 6 letters and numbers.' : 'Enter the 6-letter code from the SMS we sent when you applied.'}</p>
            <form className="as-form" onSubmit={look}>
              <input className="gc-input" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} aria-label="Application code" placeholder="e.g. K7Q2MX" autoComplete="off" />
              <button type="submit" className="gc-btn gc-btn--solid">Check</button>
            </form>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
