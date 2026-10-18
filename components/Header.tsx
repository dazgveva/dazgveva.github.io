'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { S, emit, enterPortal, logout, sessionUser } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { cn } from '@/lib/ui';
import { Icon } from './Icon';

const SECTIONS: [string, string, string][] = [
  ['how', 'როგორ მუშაობს', 'list-checks'], ['packages', 'პაკეტები', 'package-check'],
  ['partners', 'სადაზღვევოებისთვის', 'building-2'], ['faq', 'კითხვები', 'info'],
];
// 40px on phones (comfortable thumb target), 32px pills from sm up.
const pill = 'inline-flex h-10 min-w-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium transition sm:h-8 sm:min-w-8 sm:px-3';
const menuRow = 'flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] font-medium text-zinc-800 hover:bg-zinc-100';

/** No login button for visitors (staff open /login directly); signed-in staff get „პორტალი“ + „გასვლა“.
   Below lg the section links move into a menu that drops down under the header. */
export function Header() {
  useDemo();
  const pathname = usePathname(), router = useRouter();
  const user = sessionUser();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const toSection = (id: string) => {
    setMenu(false);
    if (pathname !== '/') router.push('/#' + id);
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const openScenarios = () => { setMenu(false); S.navOpen = true; emit(); };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold text-navy-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="h-8 w-auto shrink-0" />
              <span className="truncate">dazgveva.ge</span>
              <span className="ml-0.5 shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">დემო</span>
            </Link>
            {/* Trust badge: who runs the platform. Hidden on phones, where the hero says it. */}
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 ring-1 ring-inset ring-brand-200 sm:inline-flex">
              <Icon name="landmark" className="h-3.5 w-3.5" />საზოგადოებრივი კავშირი (NGO)
            </span>
          </div>
          <nav className="hidden items-center gap-6 whitespace-nowrap text-sm text-zinc-600 lg:flex">
            {SECTIONS.map(([id, label]) => <button key={id} onClick={() => toSection(id)} className="hover:text-zinc-900">{label}</button>)}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
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
            <button onClick={() => setMenu(m => !m)} aria-label={menu ? 'მენიუს დახურვა' : 'მენიუ'} aria-expanded={menu} aria-controls="mobile-menu"
              className={cn(pill, 'text-zinc-700 hover:bg-zinc-100 lg:hidden', menu && 'bg-zinc-100')}>
              <Icon name={menu ? 'x' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {menu && (
          <>
            <nav id="mobile-menu" aria-label="მენიუ" className="absolute inset-x-0 top-full animate-fade-in border-b border-zinc-200 bg-white px-4 pb-4 pt-2 shadow-lg lg:hidden">
              <ul className="mx-auto max-w-6xl space-y-0.5">
                {SECTIONS.map(([id, label, ic]) => (
                  <li key={id}><button onClick={() => toSection(id)} className={menuRow}><Icon name={ic} className="h-5 w-5 text-zinc-400" />{label}</button></li>
                ))}
                <li className="mt-2 border-t border-zinc-100 pt-2">
                  <button onClick={openScenarios} className={menuRow}><Icon name="compass" className="h-5 w-5 text-zinc-400" />სცენარები<span className="ml-auto text-xs font-normal text-zinc-400">დემო ნავიგატორი</span></button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </header>
      {/* Outside the header: its backdrop-blur would trap a fixed overlay inside it. */}
      {menu && <div onClick={() => setMenu(false)} className="fixed inset-0 z-20 animate-fade-in bg-black/25 lg:hidden" />}
    </>
  );
}
