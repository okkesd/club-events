"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/i18n/useUI';
import { getAdminClubs } from '@/app/lib/api';
import type { ClubData } from '@/app/lib/types';
import { listSuggestions, getSuggestion, updateSuggestion, reviewSuggestion, type Suggestion, type SuggestionDraft } from '@/app/lib/suggestions';
import SuggestionForm from './SuggestionForm';
import PaginationBar from './PaginationBar';

export default function UserSuggestionsPanel({ onPendingCountChange }: { onPendingCountChange?: (count: number) => void }) {
  const { t, locale } = useUI();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [filter, setFilter] = useState('pending');
  const [kind, setKind] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [meta, setMeta] = useState({ total: 0, pendingCount: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [publisher, setPublisher] = useState('admin');
  const [locationType, setLocationType] = useState('on-campus');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    listSuggestions(filter, page, kind).then(result => { if (active) { setItems(result.data); setMeta(result.meta); onPendingCountChange?.(result.meta.pendingCount); } })
      .catch(() => { if (active) setError(t('Could not load suggestions. Please retry.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, page, kind, revision, t, onPendingCountChange]);
  useEffect(() => { getAdminClubs('verified').then(setClubs).catch(() => setError(t('Could not load clubs. Please retry.'))); }, [t]);
  async function persist(draft: SuggestionDraft, status?: 'approved' | 'rejected') {
    if (!selected) return;
    setSaving(true);
    try {
      if (status !== 'rejected') await updateSuggestion(selected.id, draft);
      if (status) await reviewSuggestion(selected.id, status, publisher === 'admin' ? { publishAsAdmin: true, locationType } : { clubId: publisher, locationType }, reason);
      setSelected(null); setLoading(true); setRevision(prev => prev + 1);
    } finally { setSaving(false); }
  }
  return <section className="space-y-5 p-5 text-gray-900 dark:text-white sm:p-8">
    <h2 className="text-xl font-bold">{t('User suggestions')} <span className="text-sm text-blue-500">({meta.pendingCount})</span></h2>
    {error && <p role="alert" className="text-red-500">{error}</p>}
    {selected ? <div className="mx-auto max-w-5xl space-y-5">
      <button onClick={() => setSelected(null)} disabled={saving} className="text-sm font-semibold text-blue-500">{t('Back to suggestions')}</button>
      {selected.status === 'pending' && <fieldset disabled={saving} className="grid gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:grid-cols-2">
        <label className="text-sm">{t('Publish under')}<select value={publisher} onChange={e => setPublisher(e.target.value)} className="mt-2 block w-full rounded-lg bg-gray-100 p-3 dark:bg-gray-800"><option value="admin">{t('Publish as administrator')}</option>{clubs.map(club => <option key={club.id} value={club.id}>{club.clubName}</option>)}</select></label>
        <label className="text-sm">{t('Location')}<select value={locationType} onChange={e => setLocationType(e.target.value)} className="mt-2 block w-full rounded-lg bg-gray-100 p-3 dark:bg-gray-800"><option value="on-campus">{t('On Campus')}</option><option value="off-campus">{t('Off Campus')}</option></select></label>
        <label className="text-sm sm:col-span-2">{t('Rejection reason (optional)')}<textarea maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} className="mt-2 block w-full rounded-lg bg-gray-100 p-3 dark:bg-gray-800" /></label>
      </fieldset>}
      {selected.createdEventId && <Link className="block text-blue-500 underline" href={`/event/${selected.createdEventId}`}>{t('View published content')}</Link>}
      {selected.createdAnnouncementId && <Link className="block text-blue-500 underline" href={`/announcements/${selected.createdAnnouncementId}`}>{t('View published content')}</Link>}
      {selected.rejectionReason && <p>{selected.rejectionReason}</p>}
      <SuggestionForm key={selected.id} initialData={selected} reviewing readOnly={selected.status !== 'pending'} onSubmit={persist} />
    </div> : <>
      <div className="flex flex-wrap gap-2">{['pending', 'approved', 'rejected', 'all'].map(status => <button key={status} aria-pressed={filter === status} onClick={() => { setFilter(status); setPage(1); setLoading(true); }} className={`rounded-lg px-3 py-2 text-sm ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>{t(status === 'pending' ? 'Pending Review' : status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'All')}</button>)}
        <select aria-label={t('Content type')} value={kind} onChange={e => { setKind(e.target.value); setPage(1); setLoading(true); }} className="rounded-lg bg-gray-100 p-2 text-sm dark:bg-gray-800"><option value="">{t('All')}</option><option value="event">{t('Event suggestion')}</option><option value="announcement">{t('Announcement suggestion')}</option></select>
        <button onClick={() => { setError(''); setLoading(true); setRevision(prev => prev + 1); }}>{t('Refresh suggestions')}</button>
      </div>
      {loading ? <p>{t('Loading...')}</p> : items.length === 0 ? <p className="py-10 text-center text-gray-500">{t('No suggestions here yet.')}</p> : <div className="space-y-3">{items.map(item => <button key={item.id} onClick={async () => {
        setError('');
        try { setSelected(await getSuggestion(item.id)); setPublisher('admin'); setReason(''); }
        catch { setError(t('Could not load suggestions. Please retry.')); }
      }} className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {item.image && <img src={item.image} alt="" className="h-16 w-12 rounded object-cover" />}
        <span className="min-w-0"><span className="block truncate font-semibold">{item.title || t('Poster suggestion')}</span><span className="mt-1 block text-xs text-gray-500">{t(item.kind === 'event' ? 'Event suggestion' : 'Announcement suggestion')} · {new Date(item.createdAt).toLocaleDateString(locale)}</span></span>
      </button>)}</div>}
      <PaginationBar pagination={{page, pageSize: meta.limit, total: meta.total, totalPages: Math.ceil(meta.total / meta.limit)}} onPageChange={p => { setPage(p); setLoading(true); }} />
    </>}
  </section>;
}
