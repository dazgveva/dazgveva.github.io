'use client';
import { InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { AdminShell } from '@/components/Shells';
import { AUTH, INSURERS, S, emit, go, newForm, openModal, restoreInsurer } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { badge, btn, card, cn } from '@/lib/ui';

export default function AdminInsurersPage() {
  return <AdminShell active="adm-insurers"><Insurers /></AdminShell>;
}

function Insurers() {
  const S_ = useDemo();
  const ids = Object.keys(S_.meta).filter(id => S_.meta[id].status === S_.insTab);
  const count = (st: string) => Object.keys(S_.meta).filter(id => S_.meta[id].status === st).length;
  const edit = (id: string | null) => { S.editIns = id; S.form = newForm(id); go('adm-ins-form', id ? { id } : undefined); };
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight">სადაზღვევოები</h1><p className="mt-1 text-sm text-zinc-500">აქტიური სადაზღვევოების AI აგენტები ყველა აუქციონზე მიიწვევიან.</p></div>
        <button onClick={() => edit(null)} className={btn('primary')}><Icon name="plus" className="h-4 w-4" />სადაზღვევოს დამატება</button>
      </div>
      <div className="mt-5 inline-flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm">
        {([['active', 'აქტიური'], ['archived', 'არქივი']] as const).map(([id, label]) => (
          <button key={id} onClick={() => { S.insTab = id; emit(); }} className={cn('rounded-md px-3 py-1.5', S_.insTab === id ? 'bg-white font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900')}>{label} <span className="text-zinc-400">{count(id)}</span></button>
        ))}
      </div>
      {!ids.length ? <div className={card('mt-4 p-10 text-center text-sm text-zinc-500')}>{S_.insTab === 'archived' ? 'არქივი ცარიელია.' : 'აქტიური სადაზღვევო არ არის.'}</div> : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {ids.map(id => {
            const m = S_.meta[id], users = S_.users.filter(u => u.insurer === id).length, leads = S_.leads.filter(l => l.insurer === id).length;
            return (
              <div key={id} className={card(cn('flex flex-col p-5', m.status === 'archived' && 'bg-zinc-50/60'))}>
                <div className="flex items-start gap-3"><InsAvatar id={id} size="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="font-semibold">{INSURERS[id].name}</span>
                      {m.status === 'archived' ? <span className={badge('bg-zinc-200 font-medium text-zinc-700')}>არქივი</span> : <span className={badge('bg-emerald-50 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200')}>აქტიური</span>}</div>
                    <p className="mt-0.5 text-sm text-zinc-500">{m.desc || '—'}</p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2"><dt className="text-xs text-zinc-500">AI აგენტის API მისამართი</dt><dd className="mt-0.5 truncate font-mono text-[12px]">{m.endpoint}</dd></div>
                  <div><dt className="text-xs text-zinc-500">ავთენტიფიკაცია</dt><dd className="mt-0.5">{AUTH[m.auth]}</dd></div>
                  <div><dt className="text-xs text-zinc-500">მომხმარებლები · მოთხოვნები</dt><dd className="mt-0.5">{users} · {leads}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
                  <button onClick={() => edit(id)} className={btn('outline', 'sm')}><Icon name="pencil" className="h-3.5 w-3.5" />რედაქტირება</button>
                  {m.status === 'active'
                    ? <button onClick={() => openModal({ type: 'archive', id })} className={btn('ghost', 'sm', 'text-zinc-600')}><Icon name="archive" className="h-3.5 w-3.5" />დაარქივება</button>
                    : <>
                      <button onClick={() => restoreInsurer(id)} className={btn('outline', 'sm')}><Icon name="archive-restore" className="h-3.5 w-3.5" />აღდგენა</button>
                      <button onClick={() => openModal({ type: 'delete', id })} className={btn('ghost', 'sm', 'ml-auto text-rose-600 hover:bg-rose-50')}><Icon name="trash-2" className="h-3.5 w-3.5" />სამუდამოდ წაშლა</button>
                    </>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
