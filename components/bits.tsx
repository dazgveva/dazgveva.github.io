'use client';
import { useState, type ReactNode } from 'react';
import { DAY, HOUR, INSURERS, catById, chById, fmtLeft, now } from '@/lib/demo';
import type { CatId, ChannelId, Lead, LeadStatus } from '@/lib/types';
import { CAT_BADGE, CAT_STYLE, STATUS, STATUS_DOT, badge, cn } from '@/lib/ui';
import { Icon } from './Icon';

/** Package label: badge + icon + short (or full) name. */
export function CatBadge({ id, full = false, className }: { id: CatId; full?: boolean; className?: string }) {
  const c = catById(id);
  return <span className={badge(cn(CAT_BADGE[id], className))}><Icon name={c.icon} className="h-3 w-3" />{full ? c.label : c.short}</span>;
}
export const PkgBadges = ({ l }: { l: Lead }) => <>{l.packages.map(p => <CatBadge key={p.cat} id={p.cat} />)}</>;

/** Package icon in a circle (home list, offer cards). */
export function CatIcon({ id, box = 'h-12 w-12', icon = 'h-5 w-5' }: { id: CatId; box?: string; icon?: string }) {
  return <span className={cn('grid shrink-0 place-items-center rounded-full', box, CAT_STYLE[id])}><Icon name={catById(id).icon} className={icon} /></span>;
}

const AVATAR_ICON: Record<number, string> = { 4: 'h-2.5 w-2.5', 5: 'h-3 w-3', 6: 'h-3.5 w-3.5', 7: 'h-4 w-4', 8: 'h-4 w-4', 10: 'h-5 w-5', 12: 'h-6 w-6' };
/** Insurer avatar: its color + its icon. `size` is a literal Tailwind size, e.g. 'h-10 w-10'. */
export function InsAvatar({ id, size = 'h-7 w-7' }: { id: string; size?: string }) {
  const ins = INSURERS[id], n = +(size.match(/h-(\d+)/) || [0, 7])[1];
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full text-white', size)} style={{ background: ins.color }} title={ins.name}>
      <Icon name={ins.icon || 'building-2'} className={AVATAR_ICON[n] || 'h-4 w-4'} />
    </span>
  );
}

export const StatusBadge = ({ s }: { s: LeadStatus }) =>
  <span className={badge(cn('whitespace-nowrap font-medium ring-1 ring-inset', STATUS[s][1]))}>{STATUS[s][0]}</span>;
export const StatusDot = ({ s }: { s: LeadStatus }) =>
  <span className="inline-flex items-center gap-1.5 text-[13px]"><span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_DOT[s])} />{STATUS[s][0]}</span>;

export function ChIcon({ id }: { id: ChannelId }) {
  const c = chById(id);
  return <span title={c.label} className="grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: `${c.color}14`, color: c.color }}><Icon name={c.icon} className="h-3.5 w-3.5" /></span>;
}

export const DemoTag = ({ className }: { className?: string }) =>
  <span className={cn('rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800', className)}>დემო კლიენტი</span>;

/** Time left until a request expires (updates with the page's tick). */
export function Countdown({ l }: { l: Lead }) {
  if (l.status !== 'new') return <span className="text-zinc-400">—</span>;
  const left = l.sentAt + DAY - now();
  return <span className={cn('whitespace-nowrap', left < 3 * HOUR && 'font-semibold text-amber-600')}>{fmtLeft(left)}</span>;
}

export const Json = ({ value, className }: { value: unknown; className?: string }) =>
  <pre className={cn('overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100', className)}>{JSON.stringify(value, null, 2)}</pre>;

/** A label/value pair in a <dl>. */
export const Row = ({ k, children, mono }: { k: string; children: ReactNode; mono?: boolean }) =>
  <div><dt className="text-xs text-zinc-500">{k}</dt><dd className={cn('mt-0.5 font-medium', mono && 'font-mono text-[13px]')}>{children}</dd></div>;

/** Image preview that falls back to the file name for formats the browser can't show (HEIC). */
export function Preview({ url, name, alt }: { url: string; name: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-xs text-zinc-500"><Icon name="file-image" className="h-6 w-6" /><span className="max-w-full truncate">{name}</span></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className="h-full w-full object-contain" onError={() => setBroken(true)} />;
}
