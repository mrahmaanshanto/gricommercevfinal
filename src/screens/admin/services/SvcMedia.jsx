'use client';
// SvcMedia — the pictures of a service in super admin › edit a service (Batch D): the cover (or a coloured tile with the
// service's icon), the gallery (up to 8, each with a caption, in order) and proof of work (up to 6: picture, client, title,
// result). Pictures are uploaded (made 960 px JPEG, lib/readPicture.js) or picked from the library (PICTURE_LIBRARY).
// PicturePicker is shared with the custom-offer sheet and Grid Shop.

import React, { useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { readPicture } from '@/lib/readPicture';
import { PICTURE_LIBRARY } from '@/lib/platform/services';

export const MEDIA_CSS = `
.smd-cover{display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:flex-start}
.smd-cover__img{width:240px;max-width:100%;aspect-ratio:16/9;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);background:var(--surface-subtle) center/cover no-repeat;display:grid;place-items:center;color:var(--text-muted)}
.smd-cover__img.is-tile{background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-subtle));color:var(--primary)}
.smd-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.smd-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-3);margin:0;padding:0;list-style:none}
.smd-gal li{display:flex;flex-direction:column;gap:6px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.smd-thumb{aspect-ratio:16/10;border-radius:var(--radius-lg);background:var(--surface-subtle) center/cover no-repeat}
.smd-tools{display:flex;justify-content:flex-end;gap:2px}
.smd-proof{display:flex;flex-direction:column;gap:var(--space-3);margin:0;padding:0;list-style:none}
.smd-proof li{display:grid;grid-template-columns:160px minmax(0,1fr);gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.smd-proof__pic{display:flex;flex-direction:column;gap:6px}
.smd-lib{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-2)}
.smd-lib button{display:flex;flex-direction:column;gap:4px;padding:4px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);text-align:left;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.smd-lib button:hover,.smd-lib button:focus-visible{border-color:var(--primary)}
.smd-lib span.smd-thumb{display:block}
@media (max-width:640px){.smd-proof li{grid-template-columns:1fr}.smd-cover__img{width:100%}}
`;

/** Upload or pick a picture. onPick({ src }) */
export function PicturePicker({ open, title = 'Add a picture', onPick, onClose }) {
  const file = useRef(null);
  const [busy, setBusy] = useState(false);
  const upload = async (f) => {
    if (!f) return;
    setBusy(true);
    try { const r = await readPicture(f); onPick({ src: r.src }); } catch (e) { toast(e.message, { tone: 'error' }); }
    setBusy(false);
  };
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <button type="button" className="gc-btn gc-btn--solid" disabled={busy} onClick={() => file.current && file.current.click()}><Icon name="upload" width="16" height="16" aria-hidden="true" />{busy ? 'Reading…' : 'Upload a picture'}</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files && e.target.files[0]); e.target.value = ''; }} />
          <p className="gc-help" style={{ margin: '6px 0 0' }}>JPG, PNG or WebP. Made 960 px wide; a 16:9 picture fills the cover best.</p>
        </div>
        <div>
          <span className="gc-label">Or pick one we have</span>
          <div className="smd-lib">
            {PICTURE_LIBRARY.map((p) => (
              <button key={p.src} type="button" onClick={() => onPick({ src: p.src })}>
                <span className="smd-thumb" style={{ backgroundImage: `url(${p.src})` }} aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

const move = (list, i, d) => { const b = list.slice(); const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };

/** The pictures card of the service editor (and Grid Shop's product editor, proofs={false}). s = the item; set(patch). */
export function ServicePictures({ s, set, proofs = true }) {
  const [pick, setPick] = useState(null);   // 'cover' | 'gallery' | { proof: i }
  const gallery = s.gallery || [];
  const proof = s.proof || [];
  const onPick = ({ src }) => {
    if (pick === 'cover') set({ cover: src });
    else if (pick === 'gallery') set({ gallery: [...gallery, { src, caption: '' }] });
    else if (pick && pick.proof != null) set({ proof: proof.map((p, j) => (j === pick.proof ? { ...p, src } : p)) });
    setPick(null);
  };
  const setG = (i, patch) => set({ gallery: gallery.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  const setP = (i, patch) => set({ proof: proof.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  return (
    <section className="ix-card sva-pad" aria-labelledby="se-pics">
      <h2 id="se-pics">Pictures</h2>
      <div>
        <span className="gc-label">Cover (top of the service page and its card)</span>
        <div className="smd-cover">
          <span className={'smd-cover__img' + (s.cover ? '' : ' is-tile')} style={s.cover ? { backgroundImage: `url(${s.cover})` } : undefined} role="img" aria-label={s.cover ? 'Cover picture' : 'No cover: a coloured tile with the icon'}>
            {s.cover ? null : <Icon name={s.icon || 'briefcase'} width="32" height="32" aria-hidden="true" />}
          </span>
          <span className="smd-acts">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick('cover')}><Icon name="image" width="14" height="14" aria-hidden="true" />{s.cover ? 'Change' : 'Add cover'}</button>
            {s.cover ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ cover: '' })}>Use the coloured tile</button> : null}
          </span>
        </div>
      </div>
      <div>
        <span className="gc-label">Gallery · {gallery.length} of 8</span>
        {gallery.length ? (
          <ul className="smd-gal">
            {gallery.map((g, i) => (
              <li key={i}>
                <span className="smd-thumb" style={{ backgroundImage: `url(${g.src})` }} role="img" aria-label={g.caption || 'Gallery picture ' + (i + 1)} />
                <input className="gc-input" aria-label={'Caption ' + (i + 1)} placeholder="Caption" value={g.caption || ''} onChange={(e) => setG(i, { caption: e.target.value })} />
                <span className="smd-tools">
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move left" disabled={!i} onClick={() => set({ gallery: move(gallery, i, -1) })}><Icon name="arrow-left" width="14" height="14" /></button>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move right" disabled={i === gallery.length - 1} onClick={() => set({ gallery: move(gallery, i, 1) })}><Icon name="arrow-right" width="14" height="14" /></button>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove picture" onClick={() => set({ gallery: gallery.filter((_, j) => j !== i) })}><Icon name="trash-2" width="14" height="14" /></button>
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="gc-help" style={{ margin: 0 }}>No gallery yet. The page shows the cover only.</p>}
        {gallery.length < 8 ? <div style={{ marginTop: 'var(--space-2)' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick('gallery')}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add to gallery</button></div> : null}
      </div>
      {proofs ? <div>
        <span className="gc-label">Proof of work · {proof.length} of 6</span>
        {proof.length ? (
          <ul className="smd-proof">
            {proof.map((p, i) => (
              <li key={i}>
                <span className="smd-proof__pic">
                  <span className="smd-thumb" style={p.src ? { backgroundImage: `url(${p.src})` } : undefined} role="img" aria-label={p.src ? 'Proof picture' : 'No picture'} />
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick({ proof: i })}>{p.src ? 'Change picture' : 'Add picture'}</button>
                </span>
                <span className="sva-form">
                  <span className="sva-grid2">
                    <span><label className="gc-label" htmlFor={'pf-t' + i}>Client or project</label><input id={'pf-t' + i} className="gc-input" value={p.title || ''} onChange={(e) => setP(i, { title: e.target.value })} placeholder="Dhaka Gadget Hub" /></span>
                    <span><label className="gc-label" htmlFor={'pf-c' + i}>What kind of shop</label><input id={'pf-c' + i} className="gc-input" value={p.client || ''} onChange={(e) => setP(i, { client: e.target.value })} placeholder="Phone shop" /></span>
                  </span>
                  <span><label className="gc-label" htmlFor={'pf-r' + i}>Result</label><input id={'pf-r' + i} className="gc-input" value={p.result || ''} onChange={(e) => setP(i, { result: e.target.value })} placeholder="Cost per order down from ৳310 to ৳140" /></span>
                  <span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ proof: proof.filter((_, j) => j !== i) })}><Icon name="trash-2" width="14" height="14" aria-hidden="true" />Remove</button></span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {proof.length < 6 ? <div style={{ marginTop: 'var(--space-2)' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ proof: [...proof, { src: '', title: '', result: '', client: '' }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add proof of work</button></div> : null}
        <p className="gc-help" style={{ margin: 'var(--space-2) 0 0' }}>Show real work only, with the client’s OK. A result in numbers convinces most.</p>
      </div> : null}
      <PicturePicker open={!!pick} title={pick === 'cover' ? 'Cover picture' : pick === 'gallery' ? 'Add to gallery' : 'Proof picture'} onPick={onPick} onClose={() => setPick(null)} />
    </section>
  );
}
