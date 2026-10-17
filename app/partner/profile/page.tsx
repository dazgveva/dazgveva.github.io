'use client';
import { InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { PartnerShell } from '@/components/Shells';
import { INSURERS, sessionUser } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { btn, card } from '@/lib/ui';

export default function PartnerProfilePage() {
  return <PartnerShell active="ins-profile"><Profile /></PartnerShell>;
}

function Profile() {
  const S_ = useDemo();
  const user = sessionUser();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">პროფილი</h1>
      <div className={card('mt-6 max-w-xl p-5')}>
        <div className="flex items-center gap-3"><InsAvatar id={S_.insurer} size="h-10 w-10" /><div><div className="font-semibold">{INSURERS[S_.insurer].name}</div><div className="text-sm text-zinc-500">პარტნიორი სადაზღვევო კომპანია</div></div></div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-zinc-500">მომხმარებელი</dt><dd className="mt-0.5 font-mono text-[13px]">{user?.role === 'partner' ? user.username : `${S_.insurer}.demo`}</dd></div>
          <div><dt className="text-xs text-zinc-500">როლი</dt><dd className="mt-0.5 font-medium">სადაზღვევოს თანამშრომელი</dd></div>
        </dl>
        <button disabled className={btn('outline', 'md', 'mt-5')}><Icon name="key-round" className="h-4 w-4" />პაროლის შეცვლა <span className="text-xs text-zinc-400">(ადმინისტრატორი აღადგენს)</span></button>
      </div>
    </>
  );
}
