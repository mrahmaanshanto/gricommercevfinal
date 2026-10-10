'use client';
// Blog post (/admin/website/blog/edit?slug=…; no slug = a new post) — write or edit one post on gridcommerce.net/blog
// (menu: Blog). Adapted from the merchant panel's blog editor (screens/integrations/BlogEditor.jsx: the record layout,
// the address field, the side panels, the Google and social previews) with GridCommerce's own data.
//   Main   Title (English + Bangla), address (follows the title until edited), excerpt (both languages), the body in
//          English or Bangla with a small formatting bar (bold, italic, heading, list, quote, link → **, *, ## …).
//   Side   Publishing (Draft → In review → Approved → Published / Scheduled; the editor can't approve), Schedule,
//          Category and author, Cover image, SEO (title and description with meters, Google preview, social card),
//          Version history (restore).
// Saving keeps a draft (a live post goes back to Draft until it is approved again). Leaving with unsaved changes asks.
// Data: lib/admin/website.js (postOf, savePost, submitPost, approvePost, sendBackPost, publishPost, unschedulePost,
// unpublishPost, restorePostVersion, deletePost, categories, authors). The live site is never changed.

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, PhoneActionBar } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { dmy, hm, TZ } from '@/lib/platform/util';
import {
  postOf, postStatus, categories, authors, slugify, LIMITS, LIVE_HOST, SITE,
  savePost, submitPost, approvePost, sendBackPost, publishPost, unschedulePost, unpublishPost, restorePostVersion, deletePost,
} from '@/lib/admin/website';
import { AdminShell } from '../AdminShell';
import { WEB_CSS, useWeb, when, StatusTag, Who, Field, ctl, LenMeter, WorkflowCard, GooglePreview, SocialPreview } from './webShared';

const CSS = `
.be-card{display:flex;flex-direction:column;gap:var(--space-3)}
.be-slug{display:flex;align-items:stretch;min-width:0}
.be-slug span{display:flex;align-items:center;padding:0 var(--space-3);border:1px solid var(--border-field);border-right:0;border-radius:var(--radius-lg) 0 0 var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;font-family:var(--font-data)}
.be-slug input{border-radius:0 var(--radius-lg) var(--radius-lg) 0;font-family:var(--font-data);min-width:0}
.be-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.be-editor{border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-card)}
.be-editor:focus-within{border-color:var(--border-field-focus)}
.be-tools{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:4px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle)}
.be-tools .be-sep{width:1px;height:20px;margin:0 4px;background:var(--border-subtle)}
.be-tools .be-tabs{margin-left:auto}
.be-editor textarea{display:block;width:100%;min-height:320px;padding:var(--space-4);border:0;outline:0;resize:vertical;font:inherit;font-size:var(--text-sm);line-height:1.7;color:var(--text-body);background:transparent}
.be-editor textarea[lang="bn"]{font-family:var(--font-bn)}
.be-foot{display:flex;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.be-panel>summary{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:0 var(--space-4);cursor:pointer;list-style:none;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.be-panel>summary::-webkit-details-marker{display:none}
.be-panel>summary>svg:first-child{color:var(--text-muted)}
.be-panel>summary .be-chev{margin-left:auto;color:var(--text-muted);transition:transform var(--duration-base) var(--ease-out)}
.be-panel[open]>summary .be-chev{transform:rotate(180deg)}
.be-panel>summary:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.be-pbody{display:flex;flex-direction:column;gap:var(--space-3);padding:0 var(--space-4) var(--space-4)}
.be-cover{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg)}
.be-cover__img{display:grid;place-items:center;flex:none;width:72px;height:40px;border-radius:var(--radius-md);background:var(--fill-primary-soft);color:var(--primary)}
.be-cover span{flex:1;min-width:0;font-family:var(--font-data);font-size:var(--text-xs);overflow-wrap:anywhere}
.be-dirty{font-size:var(--text-xs);color:var(--text-warning);font-weight:var(--weight-medium)}
@media (max-width:640px){.be-two{grid-template-columns:1fr}.be-slug{flex-direction:column}.be-slug span{border-right:1px solid var(--border-field);border-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0;height:36px}.be-slug input{border-radius:0 0 var(--radius-lg) var(--radius-lg)}}
`;

const BLANK = { title: { en: '', bn: '' }, slug: '', excerpt: { en: '', bn: '' }, body: { en: '', bn: '' }, cat: '', author: '', cover: '', seoTitle: '', metaDesc: '', publishAt: null };
const pick = (p) => ({ title: { ...p.title }, slug: p.slug, excerpt: { ...p.excerpt }, body: { ...p.body }, cat: p.cat, author: p.author, cover: p.cover || '', seoTitle: p.seoTitle || '', metaDesc: p.metaDesc || '', publishAt: p.publishAt || null });
const toInput = (ms) => (ms ? new Date(ms + TZ).toISOString().slice(0, 16) : '');
const fromInput = (s) => { if (!s) return null; const [d, tm] = s.split('T'); const [y, m, dd] = d.split('-').map(Number); const [h, mi] = (tm || '0:0').split(':').map(Number); return Date.UTC(y, m - 1, dd, h, mi) - TZ; };
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const TOOLS = [['bold', 'Bold', '**', '**', 'bold text'], ['italic', 'Italic', '*', '*', 'italic text'], ['heading-2', 'Heading', '\n## ', '', 'Heading'], ['list', 'List', '\n- ', '', 'List item'], ['quote', 'Quote', '\n> ', '', 'Quote'], ['link', 'Link', '[', '](https://)', 'link text']];

function Panel({ title, icon, open = true, children }) {
  return (
    <details className="ix-card be-panel" open={open}>
      <summary><Icon name={icon} width="16" height="16" aria-hidden="true" /><span>{title}</span><Icon name="chevron-down" width="16" height="16" className="be-chev" aria-hidden="true" /></summary>
      <div className="be-pbody">{children}</div>
    </details>
  );
}

export default function BlogEdit() {
  const router = useRouter();
  const { t, live, me } = useWeb();
  const [slug, setSlug] = useState(undefined);   // undefined = not read yet, null = new post
  const [form, setForm] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [lang, setLang] = useState('en');
  const [err, setErr] = useState({});
  const [back, setBack] = useState(null);
  const area = useRef(null);
  const saved = useRef('');

  useEffect(() => { setSlug(new URLSearchParams(window.location.search).get('slug') || null); }, []);
  const post = live && slug ? postOf(slug) : null;
  useEffect(() => {
    if (!live || slug === undefined || form) return;
    const f = post ? pick(post) : { ...BLANK, cat: (categories()[0] || {}).slug || '', author: me };
    setForm(f); saved.current = JSON.stringify(f); setSlugTouched(!!post);
  }, [live, slug, post, form, me]);

  const dirty = form && JSON.stringify(form) !== saved.current;
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!live || slug === undefined || (!form && (post || slug === null))) {
    return (
      <AdminShell active="web-blog" title="Blog post">
        <style dangerouslySetInnerHTML={{ __html: WEB_CSS }} />
        <div className="ix-page"><div className="wb-skel wb-skel--head" /><div className="wb-skel" aria-busy="true" aria-label="Loading the post" /></div>
      </AdminShell>
    );
  }
  if (slug && !post) {
    return (
      <AdminShell active="web-blog" title="Blog post">
        <div className="ix-page"><section className="ix-card"><EmptyState icon="file-x" title="This post was deleted or never saved." actionLabel="All posts" onAction={() => router.push('/admin/website/blog')} /></section></div>
      </AdminShell>
    );
  }

  const st = post ? postStatus(post, t) : 'Draft';
  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setErr({}); };
  const setLoc = (k, l) => (e) => set({ [k]: { ...form[k], [l]: e.target.value }, ...(k === 'title' && l === 'en' && !slugTouched ? { slug: slugify(e.target.value) } : {}) });

  const save = (quiet) => {
    if (!form.title.en.trim()) { setErr({ title: 'Add an English title.' }); return null; }
    const r = savePost(slug, form, me);
    if (!r.ok) { setErr({ [/address|blog\//.test(r.error) ? 'slug' : 'title']: r.error }); return null; }
    const next = { ...form, slug: r.slug };
    saved.current = JSON.stringify(next); setForm(next);
    if (r.slug !== slug) { setSlug(r.slug); window.history.replaceState(window.history.state, '', '/admin/website/blog/edit?slug=' + r.slug); }
    if (!quiet) toast(st === 'Published' ? 'Saved as a draft. The live post stays as it was until this is published.' : 'Draft saved');
    return r.slug;
  };
  const withSave = (fn) => () => { const s = dirty || !post ? save(true) : slug; if (!s) return { ok: false, error: err.title || 'Save the post first.' }; return fn(s); };

  const wrap = ([, , before, after, fill]) => {
    const el = area.current;
    const text = form.body[lang] || '';
    const s = el ? el.selectionStart : text.length, e = el ? el.selectionEnd : text.length;
    const sel = text.slice(s, e) || fill;
    set({ body: { ...form.body, [lang]: text.slice(0, s) + before + sel + after + text.slice(e) } });
    window.requestAnimationFrame(() => { const x = area.current; if (x) { x.focus(); x.setSelectionRange(s + before.length, s + before.length + sel.length); } });
  };
  const keys = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    const tool = k === 'b' ? TOOLS[0] : k === 'i' ? TOOLS[1] : k === 'k' ? TOOLS[5] : null;
    if (tool) { e.preventDefault(); wrap(tool); }
    if (k === 's') { e.preventDefault(); save(); }
  };

  const goBack = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this post will be lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    saved.current = JSON.stringify(form);
    router.push('/admin/website/blog');
  };
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete this post?', body: `“${form.title.en}” and its versions are deleted.`, confirmLabel: 'Delete', tone: 'danger' }))) return;
    const r = deletePost(slug, me);
    if (!r.ok) { toast(r.error); return; }
    saved.current = JSON.stringify(form);
    toast('Post deleted'); router.push('/admin/website/blog');
  };
  const run = (r, msg) => { toast(r.ok ? msg : r.error); };
  const restore = async (v) => {
    if (!(await confirmDialog({ title: `Restore ${v.id}?`, body: `The title, excerpt and body of “${v.title}” become a new draft.`, confirmLabel: 'Restore as draft' }))) return;
    const r = restorePostVersion(slug, v.id, me);
    if (!r.ok) { toast(r.error); return; }
    const f = pick(postOf(slug)); setForm(f); saved.current = JSON.stringify(f);
    toast(v.id + ' restored as a draft');
  };
  const doSendBack = () => {
    const r = sendBackPost(slug, me, back.reason);
    if (!r.ok) { setBack({ ...back, error: r.error }); return; }
    setBack(null); toast('Sent back');
  };

  const seoTitle = form.seoTitle || `${form.title.en || 'Untitled'} | ${SITE.name}`;
  const metaDesc = form.metaDesc || form.excerpt.en;
  const url = LIVE_HOST + '/blog/' + (form.slug || 'new-post');
  const cats = categories();
  const people = authors();
  const title = form.title.en || 'New post';

  return (
    <AdminShell active="web-blog" title={title}>
      <style dangerouslySetInnerHTML={{ __html: WEB_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader onBack={goBack} backLabel="All posts" title={title}
          badges={<>{post ? <StatusTag s={st} /> : null}{dirty ? <span className="be-dirty">Unsaved changes</span> : null}</>}
          meta={post ? <><span className="wb-path">/blog/{post.slug}</span> · edited {when(post.updatedAt, t)} by {post.editor}</> : 'Not saved yet'}
          about="Write a post for gridcommerce.net/blog in English and Bangla. Save keeps a draft; send it for review; someone other than the editor approves; Publish puts it live, or schedules it when its publish date is ahead. The live site is not changed in this demo."
          secondary={post && st === 'Published' ? [{ label: 'Open live', icon: 'external-link', onClick: () => window.open(url, '_blank', 'noopener') }] : []}
          more={[
            st === 'Scheduled' ? { label: 'Take off the schedule', onClick: () => run(unschedulePost(slug, me), 'No longer scheduled') } : null,
            st === 'Published' ? { label: 'Unpublish', onClick: async () => { if (await confirmDialog({ title: 'Unpublish this post?', body: 'It goes back to Draft and leaves the blog.', confirmLabel: 'Unpublish', tone: 'danger' })) run(unpublishPost(slug, me), 'Unpublished'); } } : null,
            post && st !== 'Published' ? { label: 'Delete post', onClick: remove, tone: 'danger' } : null,
          ].filter(Boolean)}
          primary={{ label: 'Save draft', icon: 'save', onClick: () => save(), disabled: post && !dirty }} />

        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card ix-card__body be-card" aria-label="Post">
              <div className="be-two">
                <Field id="be-title" label="Title" error={err.title}>
                  <input id="be-title" {...ctl(err.title)} value={form.title.en} onChange={setLoc('title', 'en')} placeholder="e.g. Matching bKash payments to orders" maxLength={140} />
                </Field>
                <Field id="be-title-bn" label="Title in Bangla">
                  <input id="be-title-bn" lang="bn" className="gc-input wb-bn" value={form.title.bn} onChange={setLoc('title', 'bn')} maxLength={140} />
                </Field>
              </div>
              <Field id="be-slug" label="Address" error={err.slug}>
                <span className="be-slug"><span>gridcommerce.net/blog/</span>
                  <input id="be-slug" {...ctl(err.slug)} value={form.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} placeholder="post-address" />
                </span>
              </Field>
              <div className="be-two">
                <Field id="be-ex" label="Excerpt" hint="Shown on the blog list and as the description when SEO has none.">
                  <textarea id="be-ex" {...ctl(false)} rows={3} value={form.excerpt.en} onChange={setLoc('excerpt', 'en')} maxLength={300} />
                </Field>
                <Field id="be-ex-bn" label="Excerpt in Bangla">
                  <textarea id="be-ex-bn" lang="bn" className="gc-input wb-bn" rows={3} value={form.excerpt.bn} onChange={setLoc('excerpt', 'bn')} maxLength={300} />
                </Field>
              </div>
              <div className="gc-field">
                <span className="gc-label" id="be-body-l">Body</span>
                <div className="be-editor">
                  <div className="be-tools" role="toolbar" aria-label="Formatting">
                    {TOOLS.map((x, i) => (
                      <React.Fragment key={x[0]}>
                        {i === 2 || i === 5 ? <span className="be-sep" aria-hidden="true" /> : null}
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={x[1]} title={x[1]} onClick={() => wrap(x)}><Icon name={x[0]} width="16" height="16" aria-hidden="true" /></button>
                      </React.Fragment>
                    ))}
                    <span className="wb-seg be-tabs" role="group" aria-label="Language">
                      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
                      <button type="button" aria-pressed={lang === 'bn'} onClick={() => setLang('bn')}>বাংলা</button>
                    </span>
                  </div>
                  <textarea ref={area} lang={lang} aria-labelledby="be-body-l" value={form.body[lang] || ''} onKeyDown={keys}
                    onChange={(e) => set({ body: { ...form.body, [lang]: e.target.value } })}
                    placeholder={lang === 'en' ? 'Write the post. A blank line starts a new paragraph.' : 'বাংলায় লিখুন।'} />
                  <div className="be-foot"><span>{words(form.body.en)} words in English · {words(form.body.bn)} in Bangla</span><span>About {Math.max(1, Math.round(words(form.body.en) / 200))} min read</span></div>
                </div>
              </div>
            </section>

            {post ? (
              <section className="ix-card" aria-label="Version history">
                <div className="ix-card__head"><h2>Version history</h2><span className="ix-muted">{post.versions.length}</span></div>
                <div className="ix-card__body">
                  <ul className="wb-hist">
                    {post.versions.map((v, i) => (
                      <li key={v.id}>
                        <Who name={v.by} />
                        <span className="wb-hist__text"><b>{v.id} · {v.kind}</b>{i === 0 ? <span className="ix-muted"> · current</span> : null}<small>{v.title} · {dmy(v.at)} {hm(v.at)} · {v.by}</small></span>
                        {i > 0 && v.snap ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => restore(v)}><Icon name="history" width="14" height="14" aria-hidden="true" />Restore</button> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="ix-side">
            <WorkflowCard status={st} editor={post ? post.editor : me} submittedBy={post && post.submittedBy} approvedBy={post && post.approvedBy} note={post && post.note} me={me}
              acts={{
                submit: withSave((s) => submitPost(s, me)),
                approve: () => approvePost(slug, me),
                sendBack: () => setBack({ reason: '', error: '' }),
                publish: () => publishPost(slug, me),
              }} />
            <Panel title="Schedule" icon="calendar-clock">
              <Field id="be-when" label="Publish date" hint={form.publishAt && form.publishAt > t ? 'Publishing after approval schedules it for ' + dmy(form.publishAt) + ' ' + hm(form.publishAt) + '.' : 'Leave empty to publish as soon as it is approved.'}>
                <input id="be-when" type="datetime-local" className="gc-input" value={toInput(form.publishAt)} onChange={(e) => set({ publishAt: fromInput(e.target.value) })} />
              </Field>
              {form.publishAt ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ publishAt: null })}>Clear the date</button> : null}
            </Panel>
            <Panel title="Organization" icon="folder">
              <Field id="be-cat" label="Category">
                <select id="be-cat" {...ctl(false, true)} value={form.cat} onChange={(e) => set({ cat: e.target.value })}>
                  {cats.map((c) => <option key={c.slug} value={c.slug}>{c.en}</option>)}
                </select>
              </Field>
              <Field id="be-author" label="Author">
                <select id="be-author" {...ctl(false, true)} value={form.author} onChange={(e) => set({ author: e.target.value })}>
                  {[...new Set([...people.map((a) => a.name), form.author].filter(Boolean))].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
            </Panel>
            <Panel title="Cover image" icon="image">
              <div className="be-cover">
                <span className="be-cover__img" aria-hidden="true"><Icon name="image" width="20" height="20" /></span>
                <span>{form.cover || 'No cover yet'}</span>
                <label className="ix-btn ix-btn--sm">{form.cover ? 'Replace' : 'Choose'}
                  <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) set({ cover: f.name }); }} />
                </label>
              </div>
              <p className="wb-small">1200 × 630 works for the blog and for shared links. Only the file name is kept in this demo.</p>
            </Panel>
            <Panel title="Search & social" icon="search" open={false}>
              <Field id="be-seot" label="SEO title" hint="Empty = the title with “| GridCommerce”.">
                <input id="be-seot" {...ctl(false)} value={form.seoTitle} placeholder={seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} maxLength={90} />
                <LenMeter len={seoTitle.length} range={LIMITS.title} />
              </Field>
              <Field id="be-meta" label="Meta description" hint="Empty = the excerpt.">
                <textarea id="be-meta" {...ctl(false)} rows={3} value={form.metaDesc} placeholder={form.excerpt.en} onChange={(e) => set({ metaDesc: e.target.value })} maxLength={240} />
                <LenMeter len={metaDesc.length} range={LIMITS.desc} />
              </Field>
              <GooglePreview title={seoTitle} url={url} desc={metaDesc} />
              <SocialPreview title={seoTitle} desc={metaDesc} image={form.cover || '/og/default.png'} host={LIVE_HOST} />
            </Panel>
          </aside>
        </div>
      </div>

      <PhoneActionBar note={dirty ? 'Unsaved changes' : null}>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => save()} disabled={post && !dirty}>Save draft</button>
      </PhoneActionBar>

      <Sheet open={!!back} title="Send back to the writer" onClose={() => setBack(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBack(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doSendBack}>Send back</button>
        </>}>
        {back ? (
          <Field id="be-reason" label="What needs to change" error={back.error}>
            <textarea id="be-reason" {...ctl(back.error)} rows={4} data-autofocus value={back.reason} onChange={(e) => setBack({ reason: e.target.value, error: '' })} placeholder="e.g. The Bangla body is missing the second paragraph" />
          </Field>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
