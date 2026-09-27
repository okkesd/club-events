"use client";
import { useUI } from '@/i18n/useUI';
import { eventCategories } from '@/app/lib/eventCategories';
export default function EventCategoryField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { language } = useUI();
  const label = {tr: 'Kategori', en: 'Category', fr: 'Catégorie'}[language];
  const automatic = {tr: 'Düzenleyenin kategorisini kullan', en: 'Use organizer category', fr: 'Utiliser la catégorie de l’organisateur'}[language];
  return <label className="block text-sm font-medium">{label}
    <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-xl border p-3 bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
      <option value="">{automatic}</option>
      {eventCategories.map(c => <option key={c.value} value={c.value}>{c[language]}</option>)}
    </select>
  </label>;
}
