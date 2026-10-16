'use client';
// PublicJob — what candidates see (Batch F), shared by a store's careers page (/careers, in the store's theme) and
// GridCommerce's own (/jobs, in the GridCommerce look): the open jobs as cards, one job's post with the Apply form (the
// fixed fields, the CV, an optional photo and the job's questions), and the thank-you with the status link. `ui` picks the
// look: 'store' uses the theme's sf-* classes and --sf-* variables, 'gc' the panel's tokens. Data: lib/platform/career.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { readPicture } from '@/lib/readPicture';
import { applyToJob, countView, typeLabel, salaryText, statusLink, FILE_MAX, FILE_TYPES } from '@/lib/platform/career';
import { dLong, sizeText } from './careerShared';

const UI = {
  store: { input: 'sf-input', btn: 'sf-btn sf-btn--fill', ghost: 'sf-btn sf-btn--line', link: 'sf-link', muted: 'sf-muted' },
  gc: { input: 'gc-input', btn: 'gc-btn gc-btn--solid', ghost: 'gc-btn gc-btn--neutral', link: 'pj-a', muted: 'pj-muted' },
};

export const PUBLIC_JOB_CSS = `
.pj--store{--pj-primary:var(--sf-primary);--pj-on:var(--sf-on-primary);--pj-text:var(--sf-text);--pj-muted:var(--sf-muted);--pj-line:var(--sf-line);--pj-soft:var(--sf-soft);--pj-surface:var(--sf-surface);--pj-fs:var(--sf-fs);--pj-fs-sm:var(--sf-fs-sm);--pj-fs-lg:var(--sf-fs-lg);--pj-fs-h1:var(--sf-fs-h1);--pj-fs-h2:var(--sf-fs-h2);--pj-fs-h3:var(--sf-fs-h3);--pj-r:var(--sf-radius);--pj-rc:var(--sf-radius-card);--pj-head:var(--sf-font-head)}
.pj--gc{--pj-primary:var(--primary);--pj-on:var(--text-on-dark);--pj-text:var(--text-heading);--pj-muted:var(--text-muted);--pj-line:var(--border-subtle);--pj-soft:var(--fill-primary-soft);--pj-surface:var(--surface-card);--pj-fs:var(--text-sm);--pj-fs-sm:var(--text-xs);--pj-fs-lg:var(--text-md);--pj-fs-h1:var(--text-2xl, var(--text-xl));--pj-fs-h2:var(--text-lg);--pj-fs-h3:var(--text-md);--pj-r:var(--radius-lg);--pj-rc:var(--radius-xl);--pj-head:var(--font-sans)}
.pj{display:flex;flex-direction:column;gap:20px;color:var(--pj-text);font-size:var(--pj-fs)}
.pj h1,.pj h2,.pj h3{margin:0;font-family:var(--pj-head);color:var(--pj-text);font-weight:var(--weight-semibold);line-height:1.25}
.pj h1{font-size:var(--pj-fs-h1)}
.pj h2{font-size:var(--pj-fs-h2)}
.pj h3{font-size:var(--pj-fs-h3)}
.pj p{margin:0;line-height:1.6}
.pj-muted{color:var(--pj-muted)}
.pj-a{color:var(--pj-primary);font-weight:var(--weight-medium)}
.pj-hero{display:flex;flex-direction:column;gap:12px;padding:32px;border-radius:var(--pj-rc);background:var(--pj-soft) center/cover no-repeat;position:relative;overflow:hidden}
.pj-hero.has-cover{min-height:220px;justify-content:flex-end;color:#fff}
.pj-hero.has-cover::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.62))}
.pj-hero.has-cover>*{position:relative}
.pj-hero.has-cover h1,.pj-hero.has-cover p{color:#fff}
.pj-hero p{max-width:720px}
.pj-ben{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 0;padding:0;list-style:none}
.pj-ben li{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border-radius:var(--radius-full);background:var(--pj-surface);color:var(--pj-text);font-size:var(--pj-fs-sm)}
.pj-ben svg{color:var(--pj-primary)}
.pj-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.pj-card{display:flex;flex-direction:column;gap:8px;padding:18px;border:1px solid var(--pj-line);border-radius:var(--pj-rc);background:var(--pj-surface);color:inherit;text-decoration:none;transition:border-color .15s}
.pj-card:hover{border-color:var(--pj-primary)}
.pj-card h3{font-size:var(--pj-fs-lg)}
.pj-meta{display:flex;flex-wrap:wrap;gap:6px 14px;color:var(--pj-muted);font-size:var(--pj-fs-sm)}
.pj-meta span{display:inline-flex;align-items:center;gap:5px}
.pj-card .pj-go{margin-top:auto;padding-top:6px;color:var(--pj-primary);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px}
.pj-post{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(320px,1fr);gap:24px;align-items:start}
.pj-body{display:flex;flex-direction:column;gap:16px;min-width:0}
.pj-body ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;line-height:1.5}
.pj-box{display:flex;flex-direction:column;gap:14px;padding:20px;border:1px solid var(--pj-line);border-radius:var(--pj-rc);background:var(--pj-surface)}
.pj-side{position:sticky;top:96px}
.pj-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.pj-fld label,.pj-fld legend{font-size:var(--pj-fs-sm);font-weight:var(--weight-medium);color:var(--pj-text);padding:0}
.pj-fld fieldset{border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.pj-fld textarea{min-height:96px;height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
.pj-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.pj-yn{display:flex;gap:8px}
.pj-yn label{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border:1px solid var(--pj-line);border-radius:var(--pj-r);cursor:pointer;font-weight:var(--weight-medium)}
.pj-yn label.is-on{border-color:var(--pj-primary);background:var(--pj-soft);color:var(--pj-primary)}
.pj-yn input{position:absolute;opacity:0;pointer-events:none}
.pj-file{position:relative;display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 12px;border:1px dashed var(--pj-line);border-radius:var(--pj-r);cursor:pointer}
.pj-file:hover{border-color:var(--pj-primary)}
.pj-file input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.pj-file span{min-width:0;overflow-wrap:anywhere}
.pj-file svg{flex:none;color:var(--pj-primary)}
.pj-photo{width:56px;height:56px;border-radius:var(--radius-full);object-fit:cover}
.pj-err{margin:0;color:#b91c1c;font-size:var(--pj-fs-sm)}
.pj-bad .sf-input,.pj-bad .gc-input,.pj-bad .pj-file{border-color:#b91c1c}
.pj-done{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.pj-done svg.pj-tick{color:#15803d}
.pj-code{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border:1px dashed var(--pj-primary);border-radius:var(--pj-r);font-family:var(--font-data);font-weight:var(--weight-semibold);letter-spacing:.12em;color:var(--pj-primary)}
.pj-closed{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 20px;text-align:center;border:1px solid var(--pj-line);border-radius:var(--pj-rc);background:var(--pj-surface)}
.pj-closed svg{color:var(--pj-muted)}
.pj-back{display:inline-flex;align-items:center;gap:6px;color:var(--pj-muted);text-decoration:none;font-size:var(--pj-fs-sm)}
.pj-pv{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--pj-r);background:#fff4e0;color:#a14f06;font-size:var(--pj-fs-sm)}
a.pj-phone-apply{display:none}
@media (max-width:899px){.pj-post{grid-template-columns:minmax(0,1fr)}.pj-side{position:static}a.pj-phone-apply{display:inline-flex}}
@media (max-width:640px){.pj-hero{padding:20px}.pj-two{grid-template-columns:minmax(0,1fr)}.pj-box{padding:16px}}
`;

/** Open jobs as cards. hrefOf(job) = the job page's address. */
export function JobCards({ jobs, hrefOf }) {
  return (
    <div className="pj-cards">
      {jobs.map((j) => (
        <a key={j.id} className="pj-card" href={hrefOf(j)}>
          <h3>{j.title}</h3>
          <span className="pj-meta"><span><Icon name="map-pin" width="14" height="14" aria-hidden="true" />{j.place}</span><span><Icon name="clock" width="14" height="14" aria-hidden="true" />{typeLabel(j.type)}</span>{j.showSalary && salaryText(j) ? <span><Icon name="banknote" width="14" height="14" aria-hidden="true" />{salaryText(j)}</span> : null}</span>
          {j.closesAt ? <span className="pj-meta"><span>Apply by {dLong(j.closesAt)}</span></span> : null}
          <span className="pj-go">See the job <Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></span>
        </a>
      ))}
    </div>
  );
}

/** The careers page's top: headline, about and benefits on the cover (or a soft band). */
export function CareersHero({ employer, count }) {
  return (
    <section className={'pj-hero' + (employer.cover ? ' has-cover' : '')} style={employer.cover ? { backgroundImage: `url(${employer.cover})` } : undefined}>
      <h1>{employer.headline || 'Work with ' + employer.name}</h1>
      {employer.about ? <p>{employer.about}</p> : null}
      {(employer.benefits || []).length ? <ul className="pj-ben" aria-label="Benefits">{employer.benefits.map((b) => <li key={b}><Icon name="check" width="14" height="14" aria-hidden="true" />{b}</li>)}</ul> : null}
      {count != null ? <p style={{ fontWeight: 'var(--weight-medium)' }}>{count ? `${count} open job${count === 1 ? '' : 's'}` : ''}</p> : null}
    </section>
  );
}

export function NotHiring({ employer, ui = 'store' }) {
  return (
    <section className="pj-closed">
      <Icon name="briefcase" width="32" height="32" aria-hidden="true" />
      <h2>Not hiring right now</h2>
      <p className={UI[ui].muted}>{employer && employer.name ? employer.name + ' has no open jobs at the moment.' : 'There are no open jobs at the moment.'} Please check again later.</p>
    </section>
  );
}

/** One job: the post and the Apply form. preview = staff looking at a job that is not open. */
export function JobPost({ job, employer, ui = 'store', source, preview, backHref, open }) {
  const [done, setDone] = useState(null);
  useEffect(() => { if (open && !preview) countView(job.id); }, [job.id, open, preview]);
  const k = UI[ui];
  const paras = String(job.description || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  return (
    <div className="pj-body" style={{ gap: 20 }}>
      {backHref ? <a className="pj-back" href={backHref}><Icon name="arrow-left" width="14" height="14" aria-hidden="true" />All jobs at {employer.name}</a> : null}
      {preview ? <p className="pj-pv"><Icon name="eye" width="16" height="16" aria-hidden="true" />Preview: this job is not open, so candidates can’t see or apply to it yet.</p> : null}
      <div className="pj-post">
        <article className="pj-body">
          <h1>{job.title}</h1>
          <span className="pj-meta"><span><Icon name="building-2" width="14" height="14" aria-hidden="true" />{employer.name}</span><span><Icon name="map-pin" width="14" height="14" aria-hidden="true" />{job.place}</span><span><Icon name="clock" width="14" height="14" aria-hidden="true" />{typeLabel(job.type)}</span>{job.showSalary && salaryText(job) ? <span><Icon name="banknote" width="14" height="14" aria-hidden="true" />{salaryText(job)}</span> : null}{job.closesAt ? <span><Icon name="calendar" width="14" height="14" aria-hidden="true" />Apply by {dLong(job.closesAt)}</span> : null}</span>
          <a className={k.btn + ' pj-phone-apply'} href="#apply" style={{ alignSelf: 'flex-start' }}>Apply now</a>
          {paras.map((p, i) => <p key={i}>{p}</p>)}
          {(job.duties || []).length ? <><h3>What you will do</h3><ul>{job.duties.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
          {(job.needs || []).length ? <><h3>What you need</h3><ul>{job.needs.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
          {(employer.benefits || []).length ? <><h3>What you get</h3><ul>{employer.benefits.map((x) => <li key={x}>{x}</li>)}</ul></> : null}
        </article>
        <aside className="pj-side" id="apply">
          {done ? <Applied app={done.app} employer={employer} ui={ui} /> : open ? <ApplyForm job={job} ui={ui} source={source} onDone={setDone} />
            : <div className="pj-box"><h2>Applications are closed</h2><p className={k.muted}>{preview ? 'Publish the job to take applications.' : 'This job is not taking applications any more.'}</p></div>}
        </aside>
      </div>
    </div>
  );
}

function FileField({ id, label, value, onChange, accept, bad, help }) {
  return (
    <div className={'pj-fld' + (bad ? ' pj-bad' : '')}>
      <label htmlFor={id}>{label}</label>
      <span className="pj-file">
        <Icon name={value ? 'file-check' : 'upload'} width="18" height="18" aria-hidden="true" />
        <span>{value ? <>{value.name} <span className="pj-muted">· {sizeText(value.size)}</span></> : help}</span>
        <input id={id} type="file" accept={accept} aria-invalid={bad ? 'true' : undefined} onChange={(e) => { const f = e.target.files && e.target.files[0]; onChange(f ? { name: f.name, size: f.size } : null, f); }} />
      </span>
    </div>
  );
}

/** The Apply form: name, mobile, email, city, CV, photo (optional), then the job's own questions. */
export function ApplyForm({ job, ui = 'store', source, onDone }) {
  const k = UI[ui];
  const [f, setF] = useState({ name: '', phone: '', email: '', city: '', cv: null, photo: '', answers: {} });
  const [err, setErr] = useState({ field: '', text: '', code: '' });
  const [busy, setBusy] = useState(false);
  const set = (p) => { setF((x) => ({ ...x, ...p })); setErr({ field: '', text: '', code: '' }); };
  const ans = (id, v) => set({ answers: { ...f.answers, [id]: v } });
  const bad = (x) => err.field === x;
  const fileCheck = (v, file) => {
    if (!v) return null;
    if (v.size > FILE_MAX) { setErr({ field: 'cv', text: 'That file is larger than 5 MB.', code: '' }); return null; }
    if (file && !FILE_TYPES.test(file.name)) { setErr({ field: 'cv', text: 'Send a PDF, a Word file or a photo.', code: '' }); return null; }
    return v;
  };
  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    const r = applyToJob(job.id, { ...f, source });
    setBusy(false);
    if (r.ok === false) {
      setErr({ field: r.field || '', text: r.error, code: r.code || '' });
      setTimeout(() => { const el = document.querySelector('.pj [aria-invalid="true"]'); if (el) el.focus(); }, 0);
      return;
    }
    onDone(r);
    try { document.getElementById('apply').scrollIntoView({ block: 'start' }); } catch { /* ignore */ }
  };
  const inp = (x) => ({ className: k.input, 'aria-invalid': bad(x) ? 'true' : undefined });
  return (
    <form className="pj-box" onSubmit={submit} noValidate aria-labelledby="pj-apply">
      <h2 id="pj-apply">Apply for this job</h2>
      <div className="pj-two">
        <div className={'pj-fld' + (bad('name') ? ' pj-bad' : '')}><label htmlFor="pj-name">Full name</label><input id="pj-name" autoComplete="name" {...inp('name')} value={f.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div className={'pj-fld' + (bad('phone') ? ' pj-bad' : '')}><label htmlFor="pj-phone">Mobile number</label><input id="pj-phone" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...inp('phone')} value={f.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
        <div className={'pj-fld' + (bad('email') ? ' pj-bad' : '')}><label htmlFor="pj-email">Email (optional)</label><input id="pj-email" type="email" autoComplete="email" {...inp('email')} value={f.email} onChange={(e) => set({ email: e.target.value })} /></div>
        <div className="pj-fld"><label htmlFor="pj-city">City</label><input id="pj-city" autoComplete="address-level2" {...inp('city')} value={f.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Dhaka" /></div>
      </div>
      <FileField id="pj-cv" label="CV" value={f.cv} bad={bad('cv')} accept=".pdf,.doc,.docx,image/*" help="Choose your CV: PDF, Word or a photo, up to 5 MB" onChange={(v, file) => set({ cv: fileCheck(v, file) })} />
      <div className="pj-fld">
        <label htmlFor="pj-photo">Your photo (optional)</label>
        <span className="pj-file">
          {f.photo ? <img className="pj-photo" src={f.photo} alt="" /> : <Icon name="image-plus" width="18" height="18" aria-hidden="true" />}
          <span>{f.photo ? 'Photo added · tap to change' : 'Add a photo'}</span>
          <input id="pj-photo" type="file" accept="image/*" onChange={async (e) => { const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return; try { const r = await readPicture(file, { max: 320 }); set({ photo: r.src }); } catch (x) { setErr({ field: 'photo', text: x.message, code: '' }); } }} />
        </span>
      </div>
      {(job.questions || []).map((q) => {
        const v = f.answers[q.id];
        const label = q.label + (q.req ? '' : ' (optional)');
        const id = 'pj-q-' + q.id;
        if (q.type === 'file') return <FileField key={q.id} id={id} label={label} value={v} bad={bad(q.id)} accept=".pdf,.doc,.docx,image/*" help="Choose a file, up to 5 MB" onChange={(x) => ans(q.id, x && x.size > FILE_MAX ? null : x)} />;
        if (q.type === 'yesno') {
          return (
            <div key={q.id} className={'pj-fld' + (bad(q.id) ? ' pj-bad' : '')}>
              <fieldset><legend>{label}</legend>
                <span className="pj-yn">{['Yes', 'No'].map((o) => <label key={o} className={v === o ? 'is-on' : ''}><input type="radio" name={id} value={o} checked={v === o} onChange={() => ans(q.id, o)} aria-invalid={bad(q.id) ? 'true' : undefined} />{o}</label>)}</span>
              </fieldset>
            </div>
          );
        }
        return (
          <div key={q.id} className={'pj-fld' + (bad(q.id) ? ' pj-bad' : '')}>
            <label htmlFor={id}>{label}</label>
            {q.type === 'textarea' ? <textarea id={id} {...inp(q.id)} value={v || ''} onChange={(e) => ans(q.id, e.target.value)} />
              : q.type === 'select' ? <select id={id} {...inp(q.id)} value={v || ''} onChange={(e) => ans(q.id, e.target.value)}><option value="">Choose…</option>{q.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                : <input id={id} {...inp(q.id)} inputMode={q.type === 'number' ? 'numeric' : undefined} value={v || ''} onChange={(e) => ans(q.id, q.type === 'number' ? e.target.value.replace(/[^\d.]/g, '') : e.target.value)} />}
          </div>
        );
      })}
      {err.text ? <p className="pj-err" role="alert">{err.text}{err.code ? <> <a className={k.link} href={'/application?code=' + err.code}>See your application</a></> : null}</p> : null}
      <button type="submit" className={k.btn} disabled={busy}><Icon name="send" width="16" height="16" aria-hidden="true" />Send application</button>
      <p className={k.muted} style={{ fontSize: 'var(--pj-fs-sm)' }}>We use your details only for this job. You get an SMS with a link to follow your application.</p>
    </form>
  );
}

/** After applying: the status link (also sent by SMS). */
export function Applied({ app, employer, ui = 'store' }) {
  const k = UI[ui];
  const link = statusLink(app.code);
  const [copied, setCopied] = useState(false);
  return (
    <div className="pj-box pj-done" role="status">
      <Icon className="pj-tick" name="circle-check" width="36" height="36" aria-hidden="true" />
      <h2>Application sent</h2>
      <p>Thank you, {app.name.split(' ')[0]}. {employer.name} has your application. We sent an SMS to {app.phone} with a link to follow it.</p>
      <span className={k.muted} style={{ fontSize: 'var(--pj-fs-sm)' }}>Your application code</span>
      <span className="pj-code">{app.code}</span>
      <a className={k.btn} href={'/application?code=' + app.code}>Follow your application</a>
      <button type="button" className={k.ghost} onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { /* ignore */ } }}>{copied ? 'Link copied' : 'Copy the link'}</button>
    </div>
  );
}
