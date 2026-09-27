"use client";
import { useEffect, useState } from 'react';
import { getCategoryClubs, getOrganizerCategories, setOrganizerCategory, updateClub } from '@/app/lib/api';
import { eventCategories, type EventCategory } from '@/app/lib/eventCategories';
import { useUI } from '@/i18n/useUI';

type Row = {id: string; label: string; category: string | null; kind: 'organizer' | 'club'};
const labels = {
  tr: {title: 'Düzenleyen kategorileri', save: 'Kaydet', add: 'Instagram düzenleyeni ekle', neutral: 'Kategori yok', error: 'İşlem başarısız. Tekrar deneyin.', loading: 'Yükleniyor…', note: 'Etkinlikte seçilen kategori önceliklidir. Kategori yoksa nötr renk kullanılır.', saved: 'Kaydedildi'},
  en: {title: 'Organizer categories', save: 'Save', add: 'Add Instagram organizer', neutral: 'No category', error: 'Failed. Please retry.', loading: 'Loading…', note: 'Event categories take priority. Uncategorized events use a neutral color.', saved: 'Saved'},
  fr: {title: 'Catégories des organisateurs', save: 'Enregistrer', add: 'Ajouter un organisateur Instagram', neutral: 'Sans catégorie', error: 'Échec. Réessayez.', loading: 'Chargement…', note: 'La catégorie de l’événement est prioritaire. Sans catégorie, la couleur est neutre.', saved: 'Enregistré'},
};
function CategoryRow({row}: {row: Row}) {
  const {language} = useUI(); const text = labels[language];
  const [value, setValue] = useState(row.category || '');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function save() {
    setBusy(true); setMessage('');
    try {
      if (row.kind === 'organizer') await setOrganizerCategory(row.id, value || null);
      else await updateClub(row.id, {category: (value || null) as EventCategory | null});
      setMessage(text.saved);
    } catch { setMessage(text.error); } finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-3 border-b py-3">
    <span className="min-w-40 flex-1">{row.label}</span>
    <select aria-label={row.label} value={value} disabled={busy} onChange={e => {setValue(e.target.value); setMessage('');}} className="rounded border p-2 bg-white dark:bg-gray-800">
      <option value="">{text.neutral}</option>{eventCategories.map(c => <option key={c.value} value={c.value}>{c[language]}</option>)}
    </select>
    <button disabled={busy} onClick={save} className="rounded border px-3 py-2 disabled:opacity-50">{text.save}</button>
    <span role="status" className="text-xs">{message}</span>
  </div>;
}
export default function AdminCategoriesPanel() {
  const {language} = useUI(); const text = labels[language];
  const [rows, setRows] = useState<Row[]>([]); const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([getOrganizerCategories(), getCategoryClubs()]).then(([organizers, clubs]) => {
      if (active) setRows([...organizers.map(o => ({id: o.username, label: '@' + o.username, category: o.category, kind: 'organizer' as const})),
        ...(clubs || []).map(c => ({id: c.id, label: c.clubName, category: c.category || null, kind: 'club' as const}))]);
    }).catch(() => {if (active) setError(true);}).finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [revision]);
  return <section className="p-6 dark:text-white">
    <h2 className="text-xl font-bold">{text.title}</h2><p className="my-3 text-sm">{text.note}</p>
    {loading ? <p>{text.loading}</p> : error ? <button onClick={() => {setError(false); setLoading(true); setRevision(v => v + 1);}}>{text.error}</button> : <>
      <form className="flex gap-2 my-4" onSubmit={e => {e.preventDefault(); const id = handle.trim().replace(/^@+/, '').toLowerCase(); if (!/^[a-z0-9_.]{1,30}$/.test(id)) return;
        setRows(old => old.some(r => r.kind === 'organizer' && r.id === id) ? old : [{id, label: '@' + id, kind: 'organizer', category: null}, ...old]); setHandle('');}}>
        <input aria-label="Instagram" placeholder="@instagram" pattern="@?[A-Za-z0-9_.]{1,30}" value={handle} onChange={e => setHandle(e.target.value)} className="rounded border p-2 bg-white dark:bg-gray-800" required />
        <button className="rounded border px-3">{text.add}</button>
      </form>
      {rows.map(row => <CategoryRow key={row.kind + row.id} row={row} />)}
    </>}
  </section>;
}
