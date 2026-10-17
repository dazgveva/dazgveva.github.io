import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CatId, LeadStatus } from './types';

/** Merge Tailwind classes; later classes win over earlier conflicting ones. */
export const cn = (...a: ClassValue[]) => twMerge(clsx(a));

type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';
const BTN_SIZE: Record<BtnSize, string> = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-sm', lg: 'h-11 px-6 text-[15px]' };
const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
  outline: 'border border-zinc-200 bg-white hover:bg-zinc-100',
  ghost: 'hover:bg-zinc-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};
/** Button classes (shadcn-like), Tailwind only. */
export const btn = (variant: BtnVariant = 'primary', size: BtnSize = 'md', extra?: ClassValue) =>
  cn('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-50',
    BTN_SIZE[size], BTN_VARIANT[variant], extra);

export const card = (extra?: ClassValue) => cn('rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]', extra);
export const badge = (extra?: ClassValue) => cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5', extra);

export const CAT_BADGE: Record<CatId, string> = {
  max: 'bg-zinc-900 text-zinc-50',
  limited: 'bg-zinc-100 text-zinc-900',
  cheap: 'border border-zinc-300 text-zinc-900',
};
export const CAT_STYLE: Record<CatId, string> = {
  max: 'bg-zinc-900 text-white',
  limited: 'bg-zinc-100 text-zinc-900',
  cheap: 'border border-zinc-300 text-zinc-900',
};
export const STATUS: Record<LeadStatus, [string, string]> = {
  new: ['ახალი', 'bg-sky-50 text-sky-700 ring-sky-200'],
  contact_requested: ['საკონტაქტო მოთხოვნილია', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
  expired: ['ვადაგასული', 'bg-zinc-100 text-zinc-600 ring-zinc-200'],
};
export const STATUS_DOT: Record<LeadStatus, string> = { new: 'bg-sky-500', contact_requested: 'bg-emerald-500', expired: 'bg-zinc-400' };

export const HOME_BTN = 'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50';
export const HOME_BTN_DARK = `${HOME_BTN} bg-[#263A5C] text-white hover:bg-[#1c2b45]`;
export const HOME_BTN_SOFT = `${HOME_BTN} bg-zinc-100 text-zinc-800 hover:bg-zinc-200`;
