'use client';
import { useDemo } from '@/lib/useDemo';
import { Icon } from './Icon';

export function Toaster() {
  const S = useDemo();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-20" aria-live="polite">
      {S.toasts.map(t => (
        <div key={t.id} className="pointer-events-auto flex max-w-md animate-fade-in items-start gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-lg">
          <Icon name={t.icon} className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t.text}</span>
          {t.action && <button onClick={t.action.run} className="ml-2 shrink-0 font-semibold underline underline-offset-2">{t.action.label}</button>}
        </div>
      ))}
    </div>
  );
}
