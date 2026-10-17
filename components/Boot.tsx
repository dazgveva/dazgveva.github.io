'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { S, emit, initDemo, setNavigator } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';

/** Creates the demo data in the browser and gives the demo logic access to the router. */
export function Boot() {
  const router = useRouter();
  useEffect(() => {
    setNavigator(path => router.push(path));
    initDemo();
    emit();
  }, [router]);
  const pathname = usePathname();
  useEffect(() => { S.loggingOut = false; }, [pathname]);
  return null;
}

/** Page content needs the demo data (random/time-based), so it renders only in the browser. */
export function Gate({ children }: { children: ReactNode }) {
  const S = useDemo();
  return S.ready ? <>{children}</> : <div className="min-h-[70vh]" aria-busy="true" />;
}
