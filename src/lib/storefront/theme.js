// storefront/theme — the theme settings (Online Store › Theme › Customize, A1): about 60 options in 9 groups, each
// with its key, group, label, type, choices, default and search words; draft → publish, discard (undo to last
// published), reset to the preset; the contrast check; and the CSS variables the customer pages draw with.
//
//   GROUPS · OPTIONS · optionBy(key) · FONT_PAIRS · fontPair(id) · searchOptions(q)
//   themeDoc() · themeDraft() · themeLive() · themeValues()   values (live; draft / editor copy with ?preview=1)
//   saveThemeDraft(values) · publishTheme(values) · discardTheme() (Reset to preset: presets.js › resetThemeToPreset)
//   brandDefaults() — primary / accent from Settings › General (the brand colour)
//   contrast(a, b) · contrastIssues(values) → [{ key, text }] (text on primary, text on background, sale badge)
//   themeVars(values) → CSS for .sf-theme (colours, fonts with a Bangla pair, width, corners, buttons, spacing)
//   themeClasses(values) → the root classes for the Global styles (buttons, fields, badges, shadows, icons) · TOKENS_CSS
//   fontHref(values) → the Google Fonts address for the pair, or '' (Poppins and Hind Siliguri are already loaded)
//   visibleOptions(values) — options whose `when` holds (e.g. custom width only for "custom")
// Options carry `lock` (the super admin's merchant-editing switch that must be on: colours, header, footer, css) and
// `plan` (the smallest plan that has it); access.js turns these into "locked, because …" for the editor.

import { read, update, newDoc, publishDoc, discardDoc, isDirty, pickDoc, makeRestorePoint } from './store';
import { businessProfile } from '../businessProfile';

// The option list lives in schema.js (shared with the store kit and its checker).
import { GROUPS, FONT_PAIRS, fontPair, OPTIONS, optionBy, DEFAULTS } from './schema.js';
import { checkCss } from './customCode';
export { GROUPS, FONT_PAIRS, fontPair, OPTIONS, optionBy, DEFAULTS };
const BN = '"Hind Siliguri","Noto Sans Bengali"';

/** Options matching the words typed in the search box (label, group, choices, search words). */
export function searchOptions(q) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return OPTIONS;
  const parts = s.split(/\s+/);
  return OPTIONS.filter((o) => {
    const hay = [o.label, o.words, (GROUPS.find((g) => g.id === o.group) || {}).label, ...(o.choices || []).map((c) => c.label)].join(' ').toLowerCase();
    return parts.every((p) => hay.includes(p));
  });
}
export const visibleOptions = (values, list = OPTIONS) => list.filter((o) => !o.moved && (!o.when || o.when({ ...DEFAULTS, ...values })));

/** The brand colours saved in Settings › General. */
export function brandDefaults() {
  let p = null;
  try { p = businessProfile(); } catch { p = null; }
  const b = (p && p.brand) || {};
  const hex = (x, d) => (/^#[0-9a-f]{6}$/i.test(String(x || '')) ? x : d);
  return { primary: hex(b.color, '#003087'), accent: hex(b.accent, '#009cde') };
}

// ---- reading and saving -------------------------------------------------------------------------------------------
const full = (v) => ({ ...DEFAULTS, ...(v || {}) });
export const themeDoc = () => read().theme;
export const themeDraft = () => full(read().theme.draft);
export const themeLive = () => full(read().theme.live || read().theme.draft);
/** What a customer page draws: live; with ?preview=1 the draft (or the editor's unsaved copy). */
export const themeValues = () => full(pickDoc(read().theme, 'theme') || read().theme.draft);
export const themeDirty = () => isDirty(read().theme);

export function saveThemeDraft(values) {
  update((d, now) => { d.theme = { ...d.theme, draft: full(values), draftAt: now }; });
}
/** Publish the draft (a restore point of the look before is kept). */
export function publishTheme(values) {
  makeRestorePoint('Before publishing theme settings', { kind: 'publish' });
  update((d, now) => { d.theme = publishDoc({ ...d.theme, draft: full(values || d.theme.draft) }, now); });
}
/** Undo to last published: the draft goes back to what customers see. */
export function discardTheme() { update((d, now) => { d.theme = discardDoc(d.theme, now); }); }
export function setThemeDoc(values, live = true) { update((d, now) => { d.theme = newDoc(full(values), live, now); }); }

// ---- contrast ---------------------------------------------------------------------------------------------------------
function lum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; })
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/** White or near-black, whichever reads better on the colour. */
export const onColour = (hex) => (contrast('#ffffff', hex) >= contrast('#0f172a', hex) ? '#ffffff' : '#0f172a');
/** Colour pairs that are hard to read (WCAG AA 4.5:1 for text). */
export function contrastIssues(values) {
  const v = full(values);
  const out = [];
  const r = (n) => n.toFixed(1);
  const bt = contrast(onColour(v.primary), v.primary);
  if (bt < 4.5) out.push({ key: 'primary', text: `Button text on the primary colour is hard to read (${r(bt)}:1, needs 4.5:1). Pick a darker or lighter colour.` });
  const tb = contrast(v.text, v.bg);
  if (tb < 4.5) out.push({ key: 'text', text: `Text on the background is hard to read (${r(tb)}:1, needs 4.5:1).` });
  const ts = contrast(v.text, v.surface);
  if (ts < 4.5) out.push({ key: 'surface', text: `Text on cards is hard to read (${r(ts)}:1, needs 4.5:1).` });
  const sb = contrast(onColour(v.sale), v.sale);
  if (sb < 4.5) out.push({ key: 'sale', text: `The sale badge text is hard to read (${r(sb)}:1).` });
  const lk = contrast(v.primary, v.surface);
  if (lk < 3) out.push({ key: 'primary', text: `Links in the primary colour barely show on cards (${r(lk)}:1, needs 3:1).` });
  return out;
}

// ---- CSS variables ----------------------------------------------------------------------------------------------------
// [body, small, large, hero, section title, card / sub-heading] in px; hero and section titles shrink on narrow screens
const SIZES = { S: [14, 12.5, 16, 36, 25, 17], M: [15, 13, 17, 46, 30, 18], L: [16, 13.5, 18, 54, 34, 20] };
const RADII = { sharp: [0, 0, 0], soft: [8, 6, 12], round: [16, 999, 20] };
const mix = (hex, pct, base = '#ffffff') => `color-mix(in srgb, ${hex} ${pct}%, ${base})`;
const TONES = {
  light: (v) => ['#ffffff', v.text, mix(v.text, 12)],
  dark: () => ['#0f172a', '#e2e8f0', 'rgba(255,255,255,.12)'],
  brand: (v) => [v.primary, onColour(v.primary), 'rgba(255,255,255,.18)'],
};
/** The CSS custom properties for .sf-theme (scoped: the admin's own tokens are not touched outside the store). */
export function themeVars(values) {
  const v = full(values);
  const fp = fontPair(v.fontPair);
  const [fs, small, lg, h1, h2, h3] = SIZES[v.baseSize] || SIZES.M;
  const [rad, radBtn, radCard] = RADII[v.corners] || RADII.soft;
  const width = v.width === 'full' ? '100%' : v.width === 'custom' ? Math.max(960, Math.min(1680, Number(v.widthPx) || 1320)) + 'px' : '1200px';
  const gap = v.spacing === 'compact' ? 12 : v.spacing === 'airy' ? 24 : 20;
  const sec = v.spacing === 'compact' ? 28 : v.spacing === 'airy' ? 80 : 48;
  const [hBg, hFg, hLine] = (TONES[v.headerTone] || TONES.light)(v);
  const [fBg, fFg] = (TONES[v.footerTone] || TONES.dark)(v);
  const ann = v.announceTone === 'primary' ? v.primary : v.announceTone === 'dark' ? '#0f172a' : v.accent;
  return `.sf-theme{
--sf-primary:${v.primary};--sf-on-primary:${onColour(v.primary)};--sf-accent:${v.accent};--sf-on-accent:${onColour(v.accent)};
--sf-text:${v.text};--sf-muted:${mix(v.text, 62, v.surface)};--sf-bg:${v.bg};--sf-surface:${v.surface};--sf-line:${mix(v.text, 12, v.surface)};
--sf-soft:${mix(v.primary, 8, v.surface)};--sf-sale:${v.sale};--sf-on-sale:${onColour(v.sale)};
--sf-head-bg:${hBg};--sf-head-fg:${hFg};--sf-head-line:${hLine};--sf-foot-bg:${fBg};--sf-foot-fg:${fFg};--sf-ann-bg:${ann};--sf-ann-fg:${onColour(ann)};
--sf-font-head:${fp.head},${BN},system-ui,sans-serif;--sf-font-body:${fp.body},${BN},system-ui,sans-serif;
--sf-head-w:${fp.hw || 600};--sf-head-track:${v.headCase === 'upper' ? '0.04em' : fp.tr || '0em'};
--sf-fs:${fs}px;--sf-fs-sm:${small}px;--sf-fs-lg:${lg}px;--sf-fs-h1:clamp(${Math.round(h1 * 0.62)}px,4.6vw,${h1}px);--sf-fs-h2:clamp(${Math.round(h2 * 0.78)}px,2.8vw,${h2}px);--sf-fs-h3:${h3}px;--sf-case:${v.headCase === 'upper' ? 'uppercase' : 'none'};
--sf-width:${width};--sf-radius:${rad}px;--sf-radius-btn:${radBtn}px;--sf-radius-card:${radCard}px;--sf-gap:${gap}px;--sf-section:${sec}px;
--sf-cols:${v.colsDesktop};--sf-cols-phone:${v.colsPhone};--sf-ratio:${v.cardRatio === 'portrait' ? '4/5' : v.cardRatio === 'tall' ? '3/4' : '1/1'};
--primary:var(--sf-primary);--text-on-dark:var(--sf-on-primary);
${detailVars(v)}
}`;
}
/** Fields, buttons, icons, prices and stars as CSS variables: every component reads them, so one setting reaches every
 *  form, button and icon on the website (and an error or focus style a component sets still wins). */
function detailVars(v) {
  const out = [];
  const fh = { S: 40, M: 46, L: 52 }[v.fieldSize] || 46;
  const fr = v.fieldStyle === 'pill' ? '999px' : v.fieldCorners === 'square' ? '0px' : v.fieldCorners === 'round' ? '14px' : 'var(--sf-radius)';
  const fs = {
    outlined: ['var(--sf-surface)', mix(v.text, 22, v.surface), '1px', '1px', 'none'],
    filled: [mix(v.primary, 7, v.surface), 'transparent', '1px', '1px', 'none'],
    underline: ['transparent', mix(v.text, 30, v.surface), '0px', '1.5px', 'none'],
    raised: ['var(--sf-surface)', 'transparent', '1px', '1px', '0 1px 2px rgba(15,23,42,.06),0 4px 14px rgba(15,23,42,.07)'],
    pill: ['var(--sf-surface)', mix(v.text, 22, v.surface), '1px', '1px', 'none'],
  }[v.fieldStyle] || [];
  const [fbg, fline, fbx, fbb, fsh] = fs.length ? fs : ['var(--sf-surface)', mix(v.text, 22, v.surface), '1px', '1px', 'none'];
  out.push(`--sf-field-h:${fh}px;--sf-field-r:${v.fieldStyle === 'underline' ? '0px' : fr};--sf-field-bg:${fbg};--sf-field-line:${fline};--sf-fbt:${fbx};--sf-fbx:${fbx};--sf-fbb:${fbb};--sf-field-shadow:${fsh};`);
  const ring = { ring: '0 0 0 3px color-mix(in srgb,var(--sf-primary) 18%,transparent)', line: '0 0 0 1px var(--sf-primary)', glow: '0 0 0 4px color-mix(in srgb,var(--sf-primary) 14%,transparent),0 8px 22px -10px color-mix(in srgb,var(--sf-primary) 60%,transparent)' }[v.fieldFocus] || '';
  out.push(`--sf-focus-ring:${ring};`);
  const bh = { S: 38, M: 44, L: 52 }[v.btnSize] || 44;
  out.push(`--sf-btn-h:${bh}px;--sf-btn-px:${{ S: 16, M: 20, L: 28 }[v.btnSize] || 20}px;--sf-btn-case:${v.btnCase === 'upper' ? 'uppercase' : 'none'};--sf-btn-track:${v.btnCase === 'upper' ? '.05em' : '0'};`);
  out.push(`--sf-icon-stroke:${{ thin: 1.5, regular: 2, bold: 2.5 }[v.iconStroke] || 2};--sf-icon-tile:${{ S: 36, M: 44, L: 56 }[v.iconSize] || 44}px;--sf-icon-svg:${{ S: 16, M: 20, L: 26 }[v.iconSize] || 20}px;`);
  out.push(`--sf-star:${v.starColour === 'primary' ? v.primary : v.starColour === 'text' ? v.text : '#f59e0b'};`);
  out.push(`--sf-price:${v.priceColour === 'primary' ? v.primary : v.priceColour === 'sale' ? v.sale : v.text};--sf-price-scale:${{ S: 0.92, M: 1, L: 1.14 }[v.priceSize] || 1};`);
  if (v.headWeight) out.push(`--sf-head-w:${v.headWeight};`);
  if (v.headSpacing) out.push(`--sf-head-track:${{ tight: '-0.03em', normal: '0em', wide: '0.04em' }[v.headSpacing]};`);
  if (v.headColour === 'primary') out.push('--sf-title:var(--sf-primary);');
  return out.join('');
}
/** The fonts the pair needs from Google Fonts ('' when the app already has them). */
export function fontHref(values) {
  const fp = fontPair(full(values).fontPair);
  return fp.q ? 'https://fonts.googleapis.com/css2?' + fp.q + '&display=swap' : '';
}
/** The merchant's Custom CSS, when it is on and allowed (access.js decides `allowed`). Closing tags are stripped. */
export function customCss(values, allowed) {
  const v = full(values);
  if (!allowed || !v.customCss) return '';
  const r = checkCss(v.css, { max: 20000 });   // Batch C: the strict check (customCode.js); CSS that fails is not used
  return r.ok ? r.css : '';
}
/** What is wrong with the Custom CSS ([] when it passes or is off): the editor refuses to save until it is fixed. */
export function customCssProblems(values) {
  const v = full(values);
  if (!v.customCss || !String(v.css || '').trim()) return [];
  return checkCss(v.css, { max: 20000 }).problems;
}

/** Root classes for the Global styles group (read by TOKENS_CSS). */
export function themeClasses(values) {
  const v = full(values);
  return ['sf-btns-' + v.buttons, 'sf-fields-' + v.fieldStyle, 'sf-badges-' + v.badgeStyle, 'sf-shadow-' + v.shadow, 'sf-icons-' + v.iconStyle, 'sf-titles-' + v.titleStyle, 'sf-on-' + v.sectionCard, 'sf-cards-' + v.cardStyle, v.buttons === 'outline' ? 'sf-outline' : '',
    'sf-bh-' + v.btnHover, 'sf-links-' + v.linkStyle, 'sf-motion-' + v.motion, 'sf-check-' + v.checkStyle, 'sf-qty-' + v.qtyStyle, 'sf-chips-' + v.chipStyle, 'sf-ic-' + v.iconColour,
    'sf-social-' + v.socialStyle, 'sf-badge-' + v.badgePos, v.oldPrice === 'hide' ? 'sf-no-mrp' : '', v.imgZoom === false ? 'sf-no-zoom' : '', v.catalogMode ? 'sf-catalog' : ''].filter(Boolean).join(' ');
}
export const TOKENS_CSS = `
.sf-btns-soft .sf-btn{background:color-mix(in srgb,var(--sf-primary) 14%,transparent);color:var(--sf-primary);border-color:transparent}
.sf-btns-soft .sf-btn--line{background:transparent;color:inherit;border-color:currentColor}
.sf-btns-pill .sf-btn{border-radius:var(--radius-full)}
.sf-fields-filled .sf-input{background:var(--sf-soft);border-color:transparent}
.sf-fields-underline .sf-input{border-width:0 0 1.5px;border-radius:0;background:transparent;padding-left:2px}
.sf-badges-square .sf-badge{border-radius:2px}
.sf-badges-outline .sf-badge{background:var(--sf-surface);color:var(--sf-sale);box-shadow:inset 0 0 0 1.5px var(--sf-sale)}
.sf-shadow-soft :is(.sf-card,.sfs-reviews figure,.sfs-cat,.sfs-trust>div,.sfs-faq details,.sfs-ti){box-shadow:0 1px 2px rgba(15,23,42,.05),0 6px 16px rgba(15,23,42,.06)}
.sf-shadow-strong :is(.sf-card,.sfs-reviews figure,.sfs-cat,.sfs-trust>div,.sfs-faq details,.sfs-ti){box-shadow:0 2px 4px rgba(15,23,42,.06),0 14px 32px rgba(15,23,42,.12);border-color:transparent}
.sf-icons-circle .sfs-trust svg{box-sizing:content-box;padding:10px;border-radius:50%;background:var(--sf-soft)}
.sf-badges-pill .sf-badge{border-radius:var(--radius-full);padding:2px 10px}

/* fields: one skin for every field on the website (variables from themeVars; components read the same ones) */
.sf-theme .gc-input,.sf-theme .gc-select{min-height:var(--sf-field-h);border-style:solid;border-color:var(--sf-field-line);border-width:var(--sf-fbt) var(--sf-fbx) var(--sf-fbb);border-radius:var(--sf-field-r);background-color:var(--sf-field-bg);box-shadow:var(--sf-field-shadow);color:var(--sf-text)}
.sf-theme .gc-input:focus,.sf-theme .gc-select:focus{outline:none;border-color:var(--sf-primary);box-shadow:var(--sf-focus-ring)}
.sf-theme textarea{min-height:calc(var(--sf-field-h) * 2.4)}
.sf-fields-pill textarea{border-radius:18px!important}
.sf-theme input:is([type=checkbox],[type=radio]){accent-color:var(--sf-primary)}
.sf-check-large input:is([type=checkbox],[type=radio]){width:22px;height:22px}
@media (max-width:640px){.sf-theme{--sf-field-h:max(44px,var(--sf-field-h-phone,0px))}.sf-theme .sf-btn{min-height:max(44px,var(--sf-btn-h))}}

/* buttons */
.sf-theme .sf-btn:not(.sf-btn--sm){min-height:var(--sf-btn-h);padding-inline:var(--sf-btn-px)}
.sf-theme .sf-btn{text-transform:var(--sf-btn-case);letter-spacing:var(--sf-btn-track)}
.sf-bh-lift .sf-btn:hover{filter:none;transform:translateY(-2px);box-shadow:0 10px 20px -10px color-mix(in srgb,var(--sf-primary) 70%,transparent)}
.sf-bh-glow .sf-btn:hover{filter:none;box-shadow:0 0 0 4px color-mix(in srgb,var(--sf-primary) 20%,transparent)}
.sf-bh-none .sf-btn:hover{filter:none;box-shadow:none}

/* text, titles, links */
.sf-theme .sfs-head h2,.sf-theme .shi-head h2{color:var(--sf-title,inherit)}
.sf-links-always .sf-main :where(p,li,td,dd) a:not(.sf-btn){text-decoration:underline}
.sf-links-hover .sf-main :where(p,li,td,dd) a:not(.sf-btn){text-decoration:none}
.sf-links-hover .sf-main :where(p,li,td,dd) a:not(.sf-btn):hover{text-decoration:underline}
.sf-links-none .sf-main :where(p,li,td,dd) a{text-decoration:none}
.sf-titles-lines .sfs-head{flex-direction:column;align-items:stretch;gap:8px;text-align:center}
.sf-titles-lines .sfs-head__t{align-items:center}
.sf-titles-lines .sfs-more{align-self:center}
.sf-titles-lines .sfs-head h2{display:flex;align-items:center;gap:18px;width:100%;justify-content:center}
.sf-titles-lines .sfs-head h2::before,.sf-titles-lines .sfs-head h2::after{content:"";flex:1;height:1px;background:var(--sf-line)}
.sf-titles-bar .sfs-head h2{padding-left:14px;box-shadow:inset 4px 0 0 var(--sf-primary)}
.sf-titles-band .sfs-head{padding:12px 16px;border-radius:var(--sf-radius);background:var(--sf-soft)}

/* icons: the line weight everywhere; feature icon tiles (trust, quick links, steps, contact) take the frame, size and colour */
.sf-theme svg.lucide{stroke-width:var(--sf-icon-stroke)}
.sf-theme :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){width:var(--sf-icon-tile);height:var(--sf-icon-tile)}
.sf-theme :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic) svg,.sf-theme .sfs-trust svg{width:var(--sf-icon-svg);height:var(--sf-icon-svg)}
.sf-icons-circle :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){border-radius:50%;background:var(--sf-soft);border:0}
.sf-icons-square :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){border-radius:var(--sf-radius);background:var(--sf-soft);border:0}
.sf-icons-outline :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){border-radius:50%;background:transparent;box-shadow:inset 0 0 0 1.5px currentColor}
.sf-icons-bare :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic){background:transparent;box-shadow:none;width:auto;height:auto}
.sf-icons-square .sfs-trust svg,.sf-icons-outline .sfs-trust svg{box-sizing:content-box;padding:10px;border-radius:var(--sf-radius);background:var(--sf-soft)}
.sf-icons-outline .sfs-trust svg{border-radius:50%;background:none;box-shadow:inset 0 0 0 1.5px currentColor}
.sf-ic-primary :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic,.sfs-trust svg){color:var(--sf-primary)}
.sf-ic-accent :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic,.sfs-trust svg){color:var(--sf-accent)}
.sf-ic-text :is(.sfz-qlink__ic,.sfz-step__ic,.shi-ch__ic,.shi-qa__ic,.spa-vals li>span,.sfz-branch__ic,.sfz-ilist__ic,.sfz-cnt__ic,.sfs-trust svg){color:var(--sf-text)}

/* social icons, stars, prices, badges, quantity, option buttons */
.sf-social-round .sfso a,.sf-social-square .sfso a,.sf-social-brand .sfso a{border-radius:50%;background:color-mix(in srgb,currentColor 12%,transparent)}
.sf-social-square .sfso a{border-radius:var(--sf-radius)}
.sf-social-brand .sfso a{color:#fff;background:#334155}
.sf-social-brand .sfso a[href*="facebook"]{background:#1877f2}.sf-social-brand .sfso a[href*="instagram"]{background:#d62976}.sf-social-brand .sfso a[href*="youtube"]{background:#e62117}.sf-social-brand .sfso a[href*="tiktok"]{background:#111}
.sf-theme .sf-stars{color:var(--sf-star)}
.sf-theme .sf-card .sf-price b{color:var(--sf-price);font-size:calc(1em * var(--sf-price-scale))}
.sf-no-mrp .sf-price s,.sf-no-mrp .sf-save{display:none}
.sf-badge-right .sf-card .sf-badge{left:auto;right:10px}
.sf-qty-round .sf-qty{border-radius:var(--radius-full)}
.sf-qty-soft .sf-qty{border-color:transparent;background:var(--sf-soft)}
.sf-qty-minimal .sf-qty{border-color:transparent}
.sf-qty-minimal .sf-qty button{border-radius:50%;background:var(--sf-soft)}
.sf-chips-pill .spd-chips button{border-radius:var(--radius-full)}
.sf-chips-square .spd-chips button{border-radius:0}
.sf-chips-soft .spd-chips button{border-color:transparent;background:var(--sf-soft)}
.sf-chips-soft .spd-chips button[aria-pressed="true"]{background:var(--sf-primary);color:var(--sf-on-primary);box-shadow:none}
.sf-no-zoom .sf-card:hover .sf-card__img img{transform:none!important}

/* catalogue mode: no prices or cart anywhere */
.sf-catalog :is(.sf-price,.sf-card__btns,.sf-save,.sf-fcart,.spd-buy,.spd-sticky,.sfh-cart,.sf-card .sf-btn){display:none!important}

/* motion */
.sf-motion-none *,.sf-motion-none *::before,.sf-motion-none *::after{transition:none!important;animation:none!important}
.sf-motion-none .sf-card:hover{transform:none}
@supports (animation-timeline:view()){
  @media (prefers-reduced-motion:no-preference){
    .sf-motion-lively .sfsx:not(.sfx-anim){animation:sf-rise linear both;animation-timeline:view();animation-range:entry 0% entry 36%}
  }
}
@keyframes sf-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
`;
