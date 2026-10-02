'use client';
// useLiveChannels(use) — the Inbox channels that are connected in Connections and bring `use`
// ('Messages' | 'Comments' | 'Reviews'). null until mounted (render everything on the server's first pass).
import { useEffect, useState } from 'react';
import { connectedInbox, CONNECTIONS_EVENT } from '@/lib/connections';
import { CHANNELS_EVENT } from '@/lib/channels';

export function useLiveChannels(use) {
  const [live, setLive] = useState(null);
  useEffect(() => {
    const on = () => setLive(connectedInbox(use));
    on();
    window.addEventListener(CONNECTIONS_EVENT, on);
    window.addEventListener(CHANNELS_EVENT, on);
    return () => { window.removeEventListener(CONNECTIONS_EVENT, on); window.removeEventListener(CHANNELS_EVENT, on); };
  }, [use]);
  return live;
}
