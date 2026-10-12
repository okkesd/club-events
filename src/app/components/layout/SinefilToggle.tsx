"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Film } from 'lucide-react';

export default function SinefilToggle({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = pathname.startsWith('/film/') || (pathname === '/main' && searchParams.get('mode') === 'sinefil');
  return <button type="button" aria-pressed={active} aria-label="Sinefil’s Eye" title="Sinefil’s Eye" onClick={() => {
    const query = new URLSearchParams(pathname === '/main' ? searchParams.toString() : '');
    if (active) query.delete('mode');
    else query.set('mode', 'sinefil');
    onNavigate();
    router.push(`/main${query.size ? `?${query}` : ''}`);
  }} className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:px-3 sm:text-sm ${active ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 vibrant:text-campus-ink'}`}>
    <Film className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="hidden min-[375px]:inline">Sinefil’s Eye</span>
  </button>;
}
