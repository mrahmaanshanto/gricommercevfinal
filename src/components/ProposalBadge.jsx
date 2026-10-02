'use client';
// ProposalBadge — "Proposal: N on" in the bottom-left corner of pages without the shared top bar (POS, Settings, the
// storefront, the phone app) while a proposal switch is on (src/lib/proposal.js), so a screenshot is never taken for
// today's build. Pages with <gc-topbar> show the same chip in the bar instead.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { useProposals } from '@/lib/useProposal';

// while developing, the Next.js indicator sits in the same corner: stand above it
const BOTTOM = process.env.NODE_ENV === 'development' ? '68px' : '12px';
const CSS = `.gc-pbadge{position:fixed;left:12px;bottom:var(--pbadge-bottom,12px);z-index:900;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid var(--warning);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-warning);font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-medium);text-decoration:none;box-shadow:var(--shadow-soft)}
.gc-pbadge:hover{background:var(--fill-warning-soft)}
@media print{.gc-pbadge{display:none}}`;

export function ProposalBadge() {
  const on = useProposals();
  const [hasBar, setHasBar] = useState(true);
  useEffect(() => {
    const check = () => setHasBar(!!document.querySelector('gc-topbar'));
    check();
    window.addEventListener('gc:route', check);
    return () => window.removeEventListener('gc:route', check);
  }, []);
  if (!on.length || hasBar) return null;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Link href="/dev/proposal" className="gc-pbadge" title="Proposal switches" style={{ '--pbadge-bottom': BOTTOM }}>
        <Icon name="flask-conical" width="15" height="15" aria-hidden="true" />
        {`Proposal: ${on.length} on`}
      </Link>
    </>
  );
}
