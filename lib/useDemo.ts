'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { S, getVersion, subscribe } from './demo';

/** Subscribe the component to demo state changes; returns the state object. */
export function useDemo() {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return S;
}

/** Re-render every `ms` (live countdowns and the demo clock). */
export function useTick(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => { const t = setInterval(() => set(x => x + 1), ms); return () => clearInterval(t); }, [ms]);
}
