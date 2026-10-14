// barcodeSvg — the bars of a printed barcode, as module widths (bar, space, bar …), for labels (PR-F6).
//   barcodeOf(code)   { kind: 'EAN-13' | 'EAN-8' | 'Code 128', bars: [w, …] (first is a bar), modules, text }
//   ean13Check(d12)   the check digit of 12 digits
//   inStoreEan13(taken) a new in-store EAN-13 (starts with 2, the range kept for use inside a shop), not in `taken`
// EAN-13 / EAN-8 are drawn when the code is that many digits with a correct check digit; anything else is drawn as
// Code 128 (B), which every scanner reads. Pure functions, no browser needed.

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const Rr = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

export function ean13Check(d12) {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(d12[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}
const ean8Check = (d7) => { let sum = 0; for (let i = 0; i < 7; i += 1) sum += Number(d7[i]) * (i % 2 === 0 ? 3 : 1); return String((10 - (sum % 10)) % 10); };

// a string of 0/1 modules → run lengths, starting with a bar
const runs = (bits) => { const out = []; let cur = bits[0], n = 0; for (const b of bits) { if (b === cur) n += 1; else { out.push(n); cur = b; n = 1; } } out.push(n); return out; };

function ean13(code) {
  const first = Number(code[0]), par = PARITY[first];
  let bits = '101';
  for (let i = 1; i <= 6; i += 1) bits += (par[i - 1] === 'L' ? L : G)[Number(code[i])];
  bits += '01010';
  for (let i = 7; i <= 12; i += 1) bits += Rr[Number(code[i])];
  bits += '101';
  return { kind: 'EAN-13', bars: runs(bits), modules: bits.length, text: code[0] + ' ' + code.slice(1, 7) + ' ' + code.slice(7) };
}
function ean8(code) {
  let bits = '101';
  for (let i = 0; i < 4; i += 1) bits += L[Number(code[i])];
  bits += '01010';
  for (let i = 4; i < 8; i += 1) bits += Rr[Number(code[i])];
  bits += '101';
  return { kind: 'EAN-8', bars: runs(bits), modules: bits.length, text: code.slice(0, 4) + ' ' + code.slice(4) };
}

// Code 128: the 107 patterns as bar/space widths (11 modules each; stop is 13)
const C128 = ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', '211214', '211232', '2331112'];
function code128(text) {
  const s = String(text).replace(/[^\x20-\x7e]/g, '');
  const vals = [104, ...s.split('').map((ch) => ch.charCodeAt(0) - 32)];
  const check = vals.reduce((a, v, i) => a + v * (i || 1), 0) % 103;
  const seq = [...vals, check, 106];
  const bars = seq.flatMap((v) => C128[v].split('').map(Number));
  return { kind: 'Code 128', bars, modules: bars.reduce((a, b) => a + b, 0), text: s };
}

export function barcodeOf(code) {
  const c = String(code || '').trim();
  if (/^\d{13}$/.test(c) && ean13Check(c.slice(0, 12)) === c[12]) return ean13(c);
  if (/^\d{8}$/.test(c) && ean8Check(c.slice(0, 7)) === c[7]) return ean8(c);
  return code128(c);
}

/** A new in-store EAN-13 (starts with 2) that is not in `taken` (a Set or array of codes). */
export function inStoreEan13(taken = []) {
  const have = taken instanceof Set ? taken : new Set(taken);
  for (let k = 0; k < 200; k += 1) {
    let b = '2';
    for (let i = 0; i < 11; i += 1) b += Math.floor(Math.random() * 10);
    const code = b + ean13Check(b);
    if (!have.has(code)) return code;
  }
  return '';
}
