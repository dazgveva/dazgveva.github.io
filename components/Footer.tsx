'use client';
import { Icon } from './Icon';

const SOCIAL: [string, string][] = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube']];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="flex items-center gap-2"><img src="/logo.svg" alt="" className="h-6 w-auto" />© 2026 dazgveva.ge</span>
        <div className="flex items-center gap-2">
          {/* Placeholders: the social links don't go anywhere yet. */}
          {SOCIAL.map(([icon, label]) => (
            <a key={icon} href="#" onClick={e => e.preventDefault()} aria-label={label} title={label}
              className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900">
              <Icon name={icon} className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-2 text-center text-xs leading-relaxed text-zinc-500 sm:text-left">dazgveva.ge არასამთავრობო ორგანიზაციის დამოუკიდებელი ინიციატივაა. ყველა ტექნოლოგიური და საინფორმაციო სერვისი ლიცენზირებულია.</p>
      <p className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-zinc-400 sm:text-left">დემო ვერსია: ყველა კომპანია, შეთავაზება და მონაცემი გამოგონილია.</p>
    </footer>
  );
}
