// storefront/styles — the Style and Advanced tabs every section has (Online Store › Layouts › a section): spacing in
// steps with its own value on a computer, a tablet and a phone; width; alignment; background colour or picture with a
// shade; text colour; heading font and size; button look; visibility per device; entrance animation; anchor and class.
// Steps, not free pixels, so a store stays tidy on phones. Values are kept on the section as `box`; customer pages turn
// them into CSS variables and classes (boxProps) read by BOX_CSS.
//
//   box { pt, pb, mt, mb: { d, t, m } (step keys; '' = the theme's spacing), width, align, bg, bgImage, overlay, color,
//         font, hsize, btn, hide: { d, t, m }, anim, anchor, cls }
//   STEPS · DEVICES · WIDTHS · ALIGNS · HSIZES · BTNS · ANIMS · stepAt(box, key, dev) · setStep(box, key, dev, v)
//   boxProps(box, { bgUrl, editing }) → { id, className, style } · boxSummary(box) · boxIsSet(box) · cleanBox(box)
//   sectionFonts(sections) → font pair ids the sections use (the page loads them)
// Devices: computer ≥ 1024 px, tablet 641–1023 px, phone ≤ 640 px (the preview frames are 1280, 820 and 390 px wide).

import { FONT_PAIRS, fontPair } from './theme';

export const DEVICES = [
  { id: 'd', label: 'Computer', icon: 'monitor', width: 1280 },
  { id: 't', label: 'Tablet', icon: 'tablet', width: 820 },
  { id: 'm', label: 'Phone', icon: 'smartphone', width: 390 },
];
export const deviceBy = (id) => DEVICES.find((x) => x.id === id) || DEVICES[0];
export const STEPS = [['', 'Theme'], ['none', 'None'], ['XS', 'XS'], ['S', 'S'], ['M', 'M'], ['L', 'L'], ['XL', 'XL']];
const PX = { none: 0, XS: 8, S: 16, M: 32, L: 56, XL: 88 };
export const SPACING = [['pt', 'Space above (inside)'], ['pb', 'Space below (inside)'], ['mt', 'Gap above'], ['mb', 'Gap below']];
export const WIDTHS = [['', 'Contained'], ['wide', 'Wide'], ['full', 'Full width']];
export const ALIGNS = [['', 'Left'], ['center', 'Centre'], ['right', 'Right']];
export const HSIZES = [['', 'Theme'], ['S', 'Small'], ['M', 'Medium'], ['L', 'Large'], ['XL', 'Extra large']];
const HSCALE = { S: 0.82, M: 1, L: 1.22, XL: 1.5 };
export const BTNS = [['', 'Theme'], ['solid', 'Solid'], ['outline', 'Outline'], ['soft', 'Soft'], ['pill', 'Pill']];
/** Shaped edges at the top or bottom of a section (WoodMart's section dividers), in the page's background colour. */
export const DIVIDERS = [['', 'None'], ['wave', 'Wave'], ['curve', 'Curve'], ['slant', 'Slant'], ['point', 'Point'], ['zigzag', 'Zigzag']];
export const ANIMS = [['', 'None'], ['fade', 'Fade in'], ['rise', 'Rise up'], ['zoom', 'Zoom in']];
export const FONTS = [['', 'Theme'], ...FONT_PAIRS.map((f) => [f.id, f.label])];

const hex = (x) => (/^#[0-9a-f]{6}$/i.test(String(x || '')) ? x : '');
/** The step for a device, falling back phone → tablet → computer. */
export function stepAt(box, key, dev) {
  const v = (box && box[key]) || {};
  if (dev === 'm') return v.m != null && v.m !== '' ? v.m : v.t != null && v.t !== '' ? v.t : v.d || '';
  if (dev === 't') return v.t != null && v.t !== '' ? v.t : v.d || '';
  return v.d || '';
}
/** Does the device have its own value (not taken from a bigger screen)? */
export const ownStep = (box, key, dev) => !!(box && box[key] && box[key][dev] != null && box[key][dev] !== '');
export function setStep(box, key, dev, val) {
  const b = { ...(box || {}) };
  b[key] = { ...(b[key] || {}), [dev]: val };
  return b;
}

/** Wrapper props for a section: CSS variables for the steps and colours, classes for the rest. */
export function boxProps(box, { bgUrl = '', editing = false } = {}) {
  const b = box || {};
  const style = {};
  const cls = ['sfsx'];
  SPACING.forEach(([k]) => {
    ['d', 't', 'm'].forEach((dev) => {
      const v = b[k] && b[k][dev];
      if (v != null && v !== '' && PX[v] != null) style[`--sfx-${k}-${dev}`] = PX[v] + 'px';
    });
  });
  if (b.width) cls.push('sfx-w-' + b.width);
  if (b.align) cls.push('sfx-al-' + b.align);
  if (hex(b.bg)) { style['--sfx-bg'] = b.bg; cls.push('sfx-has-bg'); }
  if (bgUrl) {
    const o = Math.max(0, Math.min(85, Number(b.overlay) || 0)) / 100;
    style['--sfx-bgimg'] = `linear-gradient(rgba(0,0,0,${o}),rgba(0,0,0,${o})),url("${String(bgUrl).replace(/"/g, '%22')}")`;
    cls.push('sfx-has-img');
  }
  if (hex(b.color)) { style['--sfx-fg'] = b.color; cls.push('sfx-has-fg'); }
  if (b.font) { const fp = fontPair(b.font); style['--sfx-font'] = `${fp.head},"Hind Siliguri","Noto Sans Bengali",system-ui,sans-serif`; cls.push('sfx-has-font'); }
  if (HSCALE[b.hsize]) { style['--sfx-hs'] = HSCALE[b.hsize]; cls.push('sfx-has-hs'); }
  if (b.btn) cls.push('sfx-btn-' + b.btn);
  const hide = b.hide || {};
  ['d', 't', 'm'].forEach((dev) => { if (hide[dev]) cls.push('sfx-hide-' + dev); });
  if (b.anim && !editing) cls.push('sfx-anim', 'sfx-anim-' + b.anim);
  if (b.divTop || b.divBottom) cls.push('sfx-has-div');
  if (b.cls) cls.push(...String(b.cls).split(/\s+/).filter((c) => /^[a-z][\w-]{0,40}$/i.test(c)).slice(0, 4));
  const id = b.anchor && /^[a-z][\w-]{0,40}$/i.test(b.anchor) ? b.anchor : undefined;
  return { id, className: cls.join(' '), style };
}

/** True when anything on the Style / Advanced tabs differs from the theme. */
export function boxIsSet(box) {
  const b = cleanBox(box);
  return Object.keys(b).length > 0;
}
/** Drop empty values (smaller saves, simpler compares). */
export function cleanBox(box) {
  const b = box || {};
  const out = {};
  SPACING.forEach(([k]) => { const v = b[k] || {}; const o = {}; ['d', 't', 'm'].forEach((dev) => { if (v[dev] != null && v[dev] !== '') o[dev] = v[dev]; }); if (Object.keys(o).length) out[k] = o; });
  ['width', 'align', 'bg', 'bgImage', 'color', 'font', 'hsize', 'btn', 'anim', 'anchor', 'cls', 'divTop', 'divBottom'].forEach((k) => { if (b[k]) out[k] = b[k]; });
  if (b.bgImage && Number(b.overlay)) out.overlay = Number(b.overlay);
  const h = b.hide || {};
  if (h.d || h.t || h.m) out.hide = { d: !!h.d, t: !!h.t, m: !!h.m };
  return out;
}

/** A few words for the section list: "Space L · centred · hidden on phones". */
export function boxSummary(box) {
  const b = box || {};
  const out = [];
  const pt = stepAt(b, 'pt', 'd');
  const pb = stepAt(b, 'pb', 'd');
  if (pt || pb) out.push('Space ' + (pt === pb ? pt : (pt || 'theme') + '/' + (pb || 'theme')).replace('none', '0'));
  if (b.width === 'full') out.push('full width');
  if (b.align === 'center') out.push('centred');
  if (b.align === 'right') out.push('right-aligned');
  if (b.bgImage) out.push('background picture'); else if (b.bg) out.push('own background');
  if (b.font) out.push(fontPair(b.font).label.split(' · ')[0]);
  const h = b.hide || {};
  const hid = DEVICES.filter((x) => h[x.id]).map((x) => x.label.toLowerCase() + 's');
  if (hid.length) out.push('hidden on ' + hid.join(' and '));
  return out.join(' · ');
}

/** Font pairs chosen on sections (so the page can load them). */
export function sectionFonts(sections) {
  const s = new Set();
  (sections || []).forEach((x) => { if (x && x.box && x.box.font) s.add(x.box.font); });
  return [...s];
}

/** CSS for every section wrapper (.sfs.sfx). */
export const BOX_CSS = `
/* section dividers (Style › Top / Bottom edge): a shape in the page colour over the section's edge */
.sfx-has-div{position:relative}
.sfx-div{position:absolute;left:0;right:0;z-index:1;height:clamp(22px,4vw,56px);background:var(--sf-bg);pointer-events:none;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.sfx-div.is-b{bottom:-1px}
.sfx-div.is-t{top:-1px;transform:scaleY(-1)}
.sfx-div.is-wave{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10V5Q12.5 0 25 5T50 5T75 5T100 5V10Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10V5Q12.5 0 25 5T50 5T75 5T100 5V10Z'/%3E%3C/svg%3E")}
.sfx-div.is-curve{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10V0Q50 19 100 0V10Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10V0Q50 19 100 0V10Z'/%3E%3C/svg%3E")}
.sfx-div.is-slant{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10L100 0V10Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10L100 0V10Z'/%3E%3C/svg%3E")}
.sfx-div.is-point{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 0L50 10L100 0V10H0Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 0L50 10L100 0V10H0Z'/%3E%3C/svg%3E")}
.sfx-div.is-zigzag{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10V5L5 0L10 5L15 0L20 5L25 0L30 5L35 0L40 5L45 0L50 5L55 0L60 5L65 0L70 5L75 0L80 5L85 0L90 5L95 0L100 5V10Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10V5L5 0L10 5L15 0L20 5L25 0L30 5L35 0L40 5L45 0L50 5L55 0L60 5L65 0L70 5L75 0L80 5L85 0L90 5L95 0L100 5V10Z'/%3E%3C/svg%3E")}

.sfs.sfsx{padding-top:var(--sfx-pt-d,calc(var(--sf-section) / 2));padding-bottom:var(--sfx-pb-d,calc(var(--sf-section) / 2));margin-top:var(--sfx-mt-d,0);margin-bottom:var(--sfx-mb-d,0)}
@media (max-width:1023px){.sfs.sfsx{padding-top:var(--sfx-pt-t,var(--sfx-pt-d,calc(var(--sf-section) / 2)));padding-bottom:var(--sfx-pb-t,var(--sfx-pb-d,calc(var(--sf-section) / 2)));margin-top:var(--sfx-mt-t,var(--sfx-mt-d,0));margin-bottom:var(--sfx-mb-t,var(--sfx-mb-d,0))}}
@media (max-width:640px){.sfs.sfsx{padding-top:var(--sfx-pt-m,var(--sfx-pt-t,var(--sfx-pt-d,calc(var(--sf-section) / 2))));padding-bottom:var(--sfx-pb-m,var(--sfx-pb-t,var(--sfx-pb-d,calc(var(--sf-section) / 2))));margin-top:var(--sfx-mt-m,var(--sfx-mt-t,var(--sfx-mt-d,0)));margin-bottom:var(--sfx-mb-m,var(--sfx-mb-t,var(--sfx-mb-d,0)))}}
.sfx-w-wide>.sf-wrap{max-width:calc(var(--sf-width) + 240px)}
.sfx-w-full>.sf-wrap{max-width:none;padding-left:0;padding-right:0}
.sfx-w-full>.sf-wrap>.sfs-title{padding:0 24px}
.sfx-al-center{text-align:center}
.sfx-al-right{text-align:right}
.sfx-al-center :is(.sfs-slide__text,.sfs-offer>div,.sfs-ti>div,.sfs-news>div,.sfx-flexcol){align-items:center;margin-left:auto;margin-right:auto}
.sfx-al-right :is(.sfs-slide__text,.sfs-offer>div,.sfs-ti>div,.sfx-flexcol){align-items:flex-end;margin-left:auto}
.sfx-al-center .sfs-faq,.sfx-al-center .sfx-narrow{margin-left:auto;margin-right:auto}
.sfx-has-bg{background:var(--sfx-bg)!important}
.sfx-has-img{background-image:var(--sfx-bgimg)!important;background-size:cover!important;background-position:center!important;color:#fff}
.sfx-has-fg,.sfx-has-fg :is(h1,h2,h3,p,small,b){color:var(--sfx-fg)!important}
.sfx-has-font :is(h1,h2,h3,.sfs-title){font-family:var(--sfx-font)!important}
.sfx-has-hs :is(.sfs-title,h2){font-size:calc(var(--sf-fs-h2) * var(--sfx-hs))!important}
.sfx-has-hs .sfs-slide__text h2{font-size:calc(var(--sf-fs-h1) * var(--sfx-hs))!important}
.sfx-btn-solid .sf-btn{background:var(--sf-primary);color:var(--sf-on-primary);border-color:var(--sf-primary)}
.sfx-btn-outline .sf-btn{background:transparent;color:inherit;border-color:currentColor}
.sfx-btn-soft .sf-btn{background:color-mix(in srgb,var(--sf-primary) 14%,transparent);color:var(--sf-primary);border-color:transparent}
.sfx-btn-pill .sf-btn{border-radius:999px}
@media (min-width:1024px){.sfx-hide-d{display:none!important}}
@media (min-width:641px) and (max-width:1023px){.sfx-hide-t{display:none!important}}
@media (max-width:640px){.sfx-hide-m{display:none!important}}
@media (prefers-reduced-motion:no-preference){
  .sfx-anim{transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
  .sfx-anim:not(.is-in){opacity:0}
  .sfx-anim-rise:not(.is-in){transform:translateY(28px)}
  .sfx-anim-zoom:not(.is-in){transform:scale(.96)}
}
`;
