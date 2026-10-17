'use client';
import { InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { AdminShell } from '@/components/Shells';
import { INSURERS, emit, isActive, openModal, resetPassword, toast } from '@/lib/demo';
import type { User } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { badge, btn, card } from '@/lib/ui';

export default function AdminUsersPage() {
  return <AdminShell active="adm-users"><Users /></AdminShell>;
}

function userStatus(u: User): [string, string] {
  if (!u.active || (u.insurer && !isActive(u.insurer))) return ['დეაქტივირებული', 'bg-zinc-100 text-zinc-600'];
  if (u.mustChange) return ['ელოდება პაროლის შეცვლას', 'bg-amber-50 text-amber-800'];
  return ['აქტიური', 'bg-emerald-50 text-emerald-700'];
}

function UserActions({ u }: { u: User }) {
  if (u.username === 'admin') return null;
  return <>
    <button onClick={() => resetPassword(u.username)} className={btn('ghost', 'sm')}><Icon name="key-round" className="h-3.5 w-3.5" />პაროლის აღდგენა</button>
    <button onClick={() => { u.active = !u.active; emit(); toast(`${u.username}: ${u.active ? 'აქტივირებულია' : 'დეაქტივირებულია'}.`, 'user'); }} className={btn('ghost', 'sm', 'text-zinc-600')}>{u.active ? 'დეაქტივაცია' : 'აქტივაცია'}</button>
  </>;
}
const company = (u: User) => u.insurer
  ? <span className="inline-flex items-center gap-2"><InsAvatar id={u.insurer} size="h-5 w-5" />{INSURERS[u.insurer].name}</span>
  : <span className="text-zinc-400">dazgveva.ge</span>;

function Users() {
  const S_ = useDemo();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight">მომხმარებლები</h1><p className="mt-1 text-sm text-zinc-500">ანგარიშებს მხოლოდ ადმინისტრატორი ქმნის. თვითრეგისტრაცია არ არსებობს.</p></div>
        <button onClick={() => openModal({ type: 'add-user' })} className={btn('primary', 'md', 'w-full sm:w-auto')}><Icon name="user-plus" className="h-4 w-4" />მომხმარებლის დამატება</button>
      </div>
      {/* Phones: one card per user. */}
      <ul className="mt-6 space-y-3 md:hidden">
        {S_.users.map(u => {
          const [st, cls] = userStatus(u);
          return (
            <li key={u.username} className={card('p-4')}>
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[13px] font-medium">{u.username}</span>{u.demo && <span className={badge('bg-zinc-100 font-medium text-zinc-900')}>სადემო</span>}<span className={badge(`ml-auto font-medium ${cls}`)}>{st}</span></div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600">{company(u)}<span className="text-zinc-300">·</span>{u.role === 'admin' ? 'ადმინისტრატორი' : 'სადაზღვევოს თანამშრომელი'}</div>
              {u.username !== 'admin' && <div className="-mx-2 -mb-2 mt-2 flex flex-wrap border-t border-zinc-100 pt-1"><UserActions u={u} /></div>}
            </li>
          );
        })}
      </ul>
      <div className={card('mt-6 hidden overflow-x-auto md:block')}>
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500"><tr><th className="px-4 py-3 font-medium">მომხმარებელი</th><th className="px-4 py-3 font-medium">როლი</th><th className="px-4 py-3 font-medium">კომპანია</th><th className="px-4 py-3 font-medium">სტატუსი</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {S_.users.map(u => {
              const [st, cls] = userStatus(u);
              return (
                <tr key={u.username}>
                  <td className="whitespace-nowrap px-4 py-3"><span className="font-mono text-[13px]">{u.username}</span>{u.demo && <> <span className={badge('bg-zinc-100 font-medium text-zinc-900')}>სადემო</span></>}</td>
                  <td className="whitespace-nowrap px-4 py-3">{u.role === 'admin' ? 'ადმინისტრატორი' : 'სადაზღვევოს თანამშრომელი'}</td>
                  <td className="whitespace-nowrap px-4 py-3">{company(u)}</td>
                  <td className="whitespace-nowrap px-4 py-3"><span className={badge(`font-medium ${cls}`)}>{st}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right"><UserActions u={u} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
