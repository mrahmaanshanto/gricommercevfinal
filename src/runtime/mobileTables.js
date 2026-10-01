// mobileTables — on phones, list tables become cards (docs/ux-audit.md, J4). Every table in a page gets
// `gc-cards-on` and each cell a `data-label` from its column header; CSS in design-system.css lays a row out
// as a card: the first column as its title, the other cells as "Label  value" lines, actions at the bottom.
// Tables that really are grids keep scrolling sideways: add class `gc-table--keep` (or data-keep) to one.
// Runs only below 641 px and re-checks when the page changes.

const KEEP = 'table.gc-table--keep, table[data-keep], table.rt-table, table.at-reg, table.sf-grid, table.iv-paper__items, table.sr-only, table.md-mini';
const SKIP_INSIDE = '.gc-modal, .rc-sr, .ltr, .idc, .gc-sheet, [data-keep], .sp-cal, .pl-doc';
const MQ = '(max-width: 640px)';

/** A column's label: data-label on the header cell, else its first piece of text (a header such as
 *  "Delivery charge <small>customer pays</small>" gives "Delivery charge", not the two run together). */
function headLabel(th) {
  if (th.dataset && th.dataset.label) return th.dataset.label;
  const tw = document.createTreeWalker(th, NodeFilter.SHOW_TEXT);
  let n = tw.nextNode();
  while (n) { const v = n.nodeValue.replace(/\s+/g, ' ').trim(); if (v && !(n.parentElement && n.parentElement.closest('.sr-only') && th.innerText.trim())) return v; n = tw.nextNode(); }
  return '';
}

function labelTable(t) {
  const head = t.tHead ? [...t.tHead.rows].pop() : null;
  const labels = [];
  if (head) [...head.cells].forEach((th) => { const span = th.colSpan || 1; const text = headLabel(th); for (let i = 0; i < span; i++) labels.push(text); });
  [...t.tBodies, ...(t.tFoot ? [t.tFoot] : [])].forEach((body) => {
    [...body.rows].forEach((tr) => {
      let col = 0;
      let leadSet = false;
      const cells = [...tr.cells];
      cells.forEach((td, i) => {
        const span = td.colSpan || 1;
        const label = span > 1 && cells.length === 1 ? '' : labels[col] || '';
        if (td.getAttribute('data-label') !== label) td.setAttribute('data-label', label);
        const onlyCheck = td.querySelector('input[type=checkbox]') && !(td.innerText || '').trim();
        // a switch is a value (on / off), so its cell keeps its column label; other buttons are row actions
        const controls = td.querySelectorAll('button:not(.sw):not(.set-sw):not(.gc-switch):not([role=switch]), a.gc-btn, a[role=button]').length;
        const text = (td.innerText || '').trim();
        const actions = controls > 0 && i === cells.length - 1 && i > 0 && !td.querySelector('input:not([type=checkbox]), select');
        const empty = !text && !td.querySelector('input, select, button, img, svg, a');
        td.classList.toggle('is-check', !!onlyCheck);
        td.classList.toggle('is-actions', !!actions);
        td.classList.toggle('is-empty', !!empty && !onlyCheck);
        const lead = !leadSet && !onlyCheck && !empty && !actions;
        td.classList.toggle('is-lead', lead);
        if (lead) leadSet = true;
        col += span;
      });
    });
  });
}

function scan() {
  const content = document.querySelectorAll('.gc-shell__content table, .dc-screen table');
  content.forEach((t) => {
    if (t.matches(KEEP) || t.closest(SKIP_INSIDE)) return;
    if (!t.classList.contains('gc-cards-on')) t.classList.add('gc-cards-on');
    labelTable(t);
  });
}

let started = false;
export function startMobileTables() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const mq = window.matchMedia(MQ);
  let timer = 0;
  const run = () => { timer = 0; if (mq.matches) scan(); };
  const soon = () => { if (!timer) timer = window.setTimeout(run, 120); };
  const obs = new MutationObserver(soon);
  const on = () => { if (mq.matches) { obs.observe(document.body, { childList: true, subtree: true }); soon(); } else obs.disconnect(); };
  if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on);
  on();
}
