"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, Megaphone, Upload, Info, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { ApiError, extractSuggestionWithAI } from '@/app/lib/api';
import PosterPreview from './PosterPreview';
import { useUI } from '@/i18n/useUI';
import { emptySuggestion, suggestionMissingInfo, type SuggestionDraft } from '@/app/lib/suggestions';

const inputClass = 'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950/50 dark:text-white vibrant:border-purple-200 vibrant:focus:ring-purple-500';
const categories = ['general', 'internship', 'job', 'scholarship', 'competition', 'recruitment', 'academic', 'workshop'] as const;

export default function SuggestionForm({ initialData = emptySuggestion, onSubmit, reviewing = false, readOnly = false }: {
  initialData?: SuggestionDraft;
  onSubmit: (draft: SuggestionDraft, status?: 'approved' | 'rejected') => Promise<void>;
  reviewing?: boolean;
  readOnly?: boolean;
}) {
  const { t } = useUI();
  const id = useId();
  const [draft, setDraft] = useState<SuggestionDraft>({ ...initialData });
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const extraction = useRef<AbortController | null>(null);
  useEffect(() => () => extraction.current?.abort(), []);

  async function fillWithAI() {
    if (readOnly || !reviewing || !draft.image || extracting || reading || busy || extraction.current) return;
    const controller = new AbortController();
    extraction.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 90000);
    setExtracting(true);
    setError('');
    setAiMessage('');
    try {
      const fields = await extractSuggestionWithAI(draft.image, draft.kind, controller.signal);
      setDraft(previous => ({ ...previous, ...fields }));
      setAiMessage(t('AI filled the details. Please review them before saving.'));
    } catch {
      setError(t('AI could not fill the details. Your entries are unchanged. Please try again.'));
    } finally {
      window.clearTimeout(timeout);
      extraction.current = null;
      setExtracting(false);
    }
  }
  const update = (key: keyof SuggestionDraft, value: string) => setDraft(prev => ({ ...prev, [key]: value }));
  const missingInfo = suggestionMissingInfo(draft);
  const choiceClass = (selected: boolean) => `flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${selected ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400 vibrant:text-purple-700' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`;
  const field = (key: keyof SuggestionDraft, label: string, type = 'text', required = false) => (
    <label className="block text-sm font-medium" key={key}>
      {t(label)}{required && <span className="text-red-500"> *</span>}
      <input className={inputClass} type={type} value={draft[key]} required={required} readOnly={readOnly || (reviewing && key === 'email')}
        maxLength={key === 'organizer' || key === 'location' ? 500 : type === 'text' ? 200 : undefined} onChange={e => update(key, e.target.value)} />
    </label>
  );

  async function readImage(file?: File) {
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError(t('Choose a JPG, PNG or WebP image up to 5 MB.')); return;
    }
    setReading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = data;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 25000000) throw new Error('Image too large');
      update('image', data);
    } catch { setError(t('Could not read the image. Please try another file.')); }
    finally { setReading(false); }
  }

  const additionalFields = <>
{draft.kind === 'announcement' && (<div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">{t('Category')}<select disabled={readOnly} className={inputClass} value={draft.category} onChange={e => update('category', e.target.value)}>{categories.map(category => <option key={category} value={category}>{t(category)}</option>)}</select></label>
          {field('expiresAt', 'Suggestion deadline', 'date')}
        </div>)}
        {field('organizer', 'Organizer (optional)')}
        {field('link', 'Source or registration link (optional)', 'url')}
      <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
        {field('email', 'Contact email (optional)', 'email')}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('Only for questions about your suggestion. It will not be published.')}</p>
      </div>
  </>;

  return <form onInvalidCapture={event => {
    const details = (event.target as HTMLElement).closest('details');
    if (details) details.open = true;
  }} onSubmit={async e => {
    e.preventDefault();
    if (readOnly || busy || reading || extracting) return;
    setError('');
    const action = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value;
    if (!reviewing && missingInfo) return;
    setBusy(true);
    try { await onSubmit({ ...draft, method: draft.image ? 'poster' : 'details', title: draft.title.trim(), description: draft.description.trim(), email: draft.email.trim() }, action === 'approved' || action === 'rejected' ? action : undefined); }
    catch (error) { setError(error instanceof ApiError && error.status === 422 ? error.message : t(error instanceof ApiError && error.status === 409 ? 'This suggestion has already been reviewed. Refresh the list.' : error instanceof ApiError && error.status === 429 ? 'Too many requests. Please wait and try again.' : 'Could not save the suggestion. Your entries are preserved.')); }
    finally { setBusy(false); }
  }}>
    <fieldset disabled={busy || extracting} className="space-y-6 disabled:opacity-70">
      {reviewing && <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-800 dark:bg-blue-950/40 dark:text-blue-200 vibrant:bg-purple-50 vibrant:text-purple-800">
        <Info size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>{t('Not in the mood to fill in the details? Let the poster do the talking. Upload it and you are done! Without a poster, events need a title, description, date, location, start and end time; announcements just need a title and description.')}</p>
      </div>}
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="min-w-0 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-950/30 vibrant:border-purple-200">
        {draft.image ? <div className="space-y-3">
          {reviewing ? <PosterPreview src={draft.image} /> : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.image} alt={t('Poster preview')} className="mx-auto max-h-80 rounded-lg object-contain" />
          )}
          <button hidden={reviewing} disabled={reviewing} type="button" className="mx-auto flex items-center gap-1 text-sm text-red-500" onClick={() => update('image', '')}><X size={16} />{t('Remove poster')}</button>
        </div> : <div className="text-center"><Upload className="mx-auto mb-3 text-gray-400" size={24} /><p className="text-sm font-semibold">{t('A poster is enough. Everything else is optional.')}</p></div>}
        <label hidden={reviewing} htmlFor={`${id}-image`} className="mt-3 block text-center text-xs text-gray-500 dark:text-gray-400">{t('Choose a JPG, PNG or WebP image up to 5 MB.')}</label>
        <input hidden={reviewing} id={`${id}-image`} type="file" accept="image/jpeg,image/png,image/webp" disabled={reading} className="mt-3 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:transition-colors hover:file:bg-blue-700 vibrant:file:bg-purple-600 vibrant:hover:file:bg-purple-700 vibrant:text-purple-700" onChange={e => { void readImage(e.target.files?.[0]); e.target.value = ''; }} />
        {reading && <p role="status" className="mt-2 text-sm">{t('Loading...')}</p>}
        {reviewing && !readOnly && draft.image && <div className="mt-5 border-t border-blue-200 pt-4 dark:border-gray-700">
          <button type="button" onClick={fillWithAI} disabled={reading || extracting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-purple-500 disabled:opacity-60" aria-busy={extracting}>
            {extracting ? <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
            {t(extracting ? 'Reading poster...' : 'Fill with AI')}
          </button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('AI reads the poster and replaces the details it finds. Check the result before saving.')}</p>
          <p role="status" className="mt-2 text-sm text-blue-600 dark:text-blue-300">{extracting ? t('Reading poster...') : aiMessage}</p>
        </div>}
      </div>

      <div className="min-w-0 space-y-4">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('Content type')}</legend>
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 vibrant:bg-purple-100">
          {(['event', 'announcement'] as const).map(kind => <button key={kind} type="button" disabled={readOnly} aria-pressed={draft.kind === kind} onClick={() => update('kind', kind)} className={choiceClass(draft.kind === kind)}>
            {kind === 'event' ? <CalendarDays size={16} /> : <Megaphone size={16} />}{t(kind === 'event' ? 'Event suggestion' : 'Announcement suggestion')}
          </button>)}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t(draft.kind === 'event' ? 'A gathering with a date and place, such as a talk or concert.' : 'An opportunity or update, such as an internship, scholarship or application.')}</p>
      </fieldset>

        {field('title', 'Title')}
        <label className="block text-sm font-medium">{t('Description')}
          <textarea className={inputClass} rows={reviewing ? 4 : 3} readOnly={readOnly} maxLength={reviewing && draft.kind === 'event' ? 5000 : 10000} value={draft.description} onChange={e => update('description', e.target.value)} />
        </label>
        {draft.kind === 'event' ? <div className="grid gap-4 sm:grid-cols-2">
          {field('date', 'Date', 'date')}{field('location', 'Location')}
          {field('startTime', 'Start Time', 'time')}{field('endTime', 'Suggestion end time', 'time')}
        </div> : null}
        {reviewing ? <div className="space-y-4">{additionalFields}</div> : <details className="group border-t border-gray-100 pt-4 dark:border-gray-800">
          <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">{t('Extra details (optional)')}</summary>
          <div className="mt-4 space-y-4">{additionalFields}</div>
        </details>}
      </div>
      </div>
      {!reviewing && missingInfo && <p id={`${id}-missing`} aria-live="polite" className="text-sm font-medium text-red-600 dark:text-red-400">{t(missingInfo)}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <button hidden={readOnly} disabled={busy || reading || (!reviewing && Boolean(missingInfo))} aria-describedby={missingInfo ? `${id}-missing` : undefined} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 vibrant:bg-purple-600"><Send size={17} />{t(busy ? 'Saving...' : reviewing ? 'Save review changes' : 'Send suggestion')}</button>
      {reviewing && !readOnly && <div className="flex gap-3">{(['approved', 'rejected'] as const).map(status => <button key={status} type="submit" value={status} formNoValidate={status === 'rejected'} disabled={busy || reading} className="min-h-11 flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-700">{t(status === 'approved' ? 'Approve and publish' : 'Reject')}</button>)}</div>}
    </fieldset>
  </form>;
}
