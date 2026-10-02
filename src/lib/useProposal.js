'use client';
// useProposal — React side of the proposal switches (src/lib/proposal.js).
// The first render has every switch off (the same on the server, so hydration matches); after mount the switches
// for this page take over, and the hook follows /dev/proposal, ?p= on a new address and other tabs.
//   const nav = useProposal('nav');      one switch
//   const on = useProposals();           every switch on, in backlog order
import { useEffect, useState } from 'react';
import { onKeys, PROPOSAL_EVENT } from './proposal';

export function useProposals() {
  const [keys, setKeys] = useState([]);
  useEffect(() => {
    const sync = () => setKeys((was) => { const next = onKeys(); return next.join() === was.join() ? was : next; });
    sync();
    window.addEventListener(PROPOSAL_EVENT, sync);
    window.addEventListener('gc:route', sync);
    return () => { window.removeEventListener(PROPOSAL_EVENT, sync); window.removeEventListener('gc:route', sync); };
  }, []);
  return keys;
}

export const useProposal = (key) => useProposals().includes(key);
