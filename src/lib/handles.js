// handles — web addresses made from titles (a page, post, product, category or landing page's "handle").
// Bangla titles used to give an empty address (only a–z and 0–9 were kept). Now Online Store › SEO › Settings picks:
//   'latin' (default)  Bangla is written in Latin letters: "মোবাইল কভার" → "mobail-kabhar"
//   'keep'             Bangla stays as it is: "মোবাইল-কভার" (browsers show it; links copy as %E0%A6…)
//
//   toHandle(text, mode?)      the address for a title (lower case, words joined by "-", at most 70 characters)
//   cleanHandleInput(text)     what an address field keeps while someone types (no trimming of a trailing "-")
//   transliterate(text)        Bangla letters written in Latin ones (other text unchanged)
//   handleMode() · setHandleMode(mode)    the setting (gc.seo.handles)
// No imports, so every lib can use it.

const KEY = 'gc.seo.handles';

export function handleMode() {
  if (typeof window === 'undefined') return 'latin';
  try { return window.localStorage.getItem(KEY) === 'keep' ? 'keep' : 'latin'; } catch { return 'latin'; }
}
export function setHandleMode(mode) {
  try { window.localStorage.setItem(KEY, mode === 'keep' ? 'keep' : 'latin'); } catch { /* ignore */ }
}

const VOWEL = { 'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou' };
const SIGN = { 'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou' };
const NUKTA = { '\u0001': 'r', '\u0002': 'rh', '\u0003': 'y' };
const CONS = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh',
  'স': 's', 'হ': 'h', '\u09CE': 't',
};
const MARK = { 'ং': 'ng', 'ঃ': 'h', 'ঁ': '' };
const DIGIT = '০১২৩৪৫৬৭৮৯';
const HASANTA = '্';

const isLetter = (c) => !!c && /[\u0980-\u09FF\u0001-\u0003]/.test(c);
/** Bangla letters in Latin ones. */
export function transliterate(text) {
  // ড়, ঢ় and য় may come as one letter or as the letter + a dot below (nukta): both read r, rh and y
  const s = String(text || '').normalize('NFC').replace(/\u09A1\u09BC|\u09DC/g, '\u0001').replace(/\u09A2\u09BC|\u09DD/g, '\u0002').replace(/\u09AF\u09BC|\u09DF/g, '\u0003');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];
    if (CONS[c] != null || NUKTA[c] != null) {
      out += CONS[c] != null ? CONS[c] : NUKTA[c];
      if (next === HASANTA) { i++; continue; }
      if (SIGN[next] != null) continue;
      // the inherent vowel is sounded after a word's first letter only ("কভার" kabhar, "স্মার্টফোন" smartfon)
      if (next && (CONS[next] != null || NUKTA[next] != null) && !isLetter(s[i - 1])) out += 'a';
    } else if (SIGN[c] != null) out += SIGN[c];
    else if (VOWEL[c] != null) out += VOWEL[c];
    else if (MARK[c] != null) out += MARK[c];
    else if (DIGIT.indexOf(c) >= 0) out += String(DIGIT.indexOf(c));
    else if (c === HASANTA) continue;
    else out += c;
  }
  return out;
}

const BANGLA = 'ঀ-৿';
/** The address for a title. */
export function toHandle(text, mode = handleMode()) {
  let s = String(text || '').trim();
  if (mode !== 'keep') s = transliterate(s);
  // accents off Latin letters ("café" → "cafe"); Bangla is put back together after
  s = s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  const bad = mode === 'keep' ? new RegExp('[^a-z0-9' + BANGLA + ']+', 'g') : /[^a-z0-9]+/g;
  return s.replace(/&/g, ' and ').replace(bad, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');
}
/** An address field while someone types: lower case, spaces and odd characters become "-". */
export function cleanHandleInput(text, mode = handleMode()) {
  const bad = mode === 'keep' ? new RegExp('[^a-z0-9' + BANGLA + '-]+', 'g') : /[^a-z0-9-]+/g;
  return String(text || '').toLowerCase().replace(bad, '-').replace(/^-+/, '').replace(/-{2,}/g, '-').slice(0, 70);
}
