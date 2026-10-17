'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { S, emit, enterPortal, logout, sessionUser } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { Icon } from './Icon';

const SECTIONS: [string, string][] = [['how', 'როგორ მუშაობს'], ['packages', 'პაკეტები'], ['partners', 'სადაზღვევოებისთვის'], ['faq', 'კითხვები']];
const pill = 'inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13px] font-medium';

/** No login button for visitors (staff open /login directly); signed-in staff get „პორტალი“ + „გასვლა“. */
export function Header() {
  useDemo();
  const pathname = usePathname(), router = useRouter();
  const user = sessionUser();
  const toSection = (id: string) => {
    if (pathname !== '/') router.push('/#' + id);
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-[#263A5C]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="h-8 w-auto" />
          dazgveva.ge
          <span className="ml-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">დემო</span>
        </Link>
        <nav className="hidden items-center gap-6 whitespace-nowrap text-sm text-zinc-600 lg:flex">
          {SECTIONS.map(([id, label]) => <button key={id} onClick={() => toSection(id)} className="hover:text-zinc-900">{label}</button>)}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={() => { S.navOpen = true; emit(); }} aria-label="სცენარები" className={`${pill} border border-zinc-200 hover:bg-zinc-50 sm:hidden`}>
            <Icon name="compass" className="h-4 w-4" /><span className="hidden min-[400px]:inline">სცენარები</span>
          </button>
          {user && !user.mustChange && (
            <button onClick={() => enterPortal(user)} aria-label="პორტალი" className={`${pill} text-zinc-700 hover:bg-zinc-100`}>
              <Icon name="layout-dashboard" className="h-4 w-4" /><span className="hidden sm:inline">პორტალი</span>
            </button>
          )}
          {user && (
            <button onClick={logout} aria-label="გასვლა" className={`${pill} text-zinc-600 hover:bg-zinc-100`}>
              <Icon name="log-out" className="h-4 w-4" /><span className="hidden sm:inline">გასვლა</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
