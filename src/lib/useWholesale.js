'use client';
// useWholesale — is wholesale on in the edition in use? Read after mount (and again when the edition preview changes),
// never at import time: the server always renders the full product, while the browser may preview another edition
// (?edition=…), so a value read at import time would differ between the two and break hydration.
//   const ws = useWholesale();   // false on the server and the first render, then the real answer
// Plain functions that run after mount (event handlers, effects) may call edition.js › wholesaleOn() directly.

import { useEffect, useState } from 'react';
import { wholesaleOn, EDITION_EVENT } from './edition';

export function useWholesale() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const read = () => setOn(wholesaleOn());
    read();
    window.addEventListener(EDITION_EVENT, read);
    return () => window.removeEventListener(EDITION_EVENT, read);
  }, []);
  return on;
}

export default useWholesale;
