"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useUI } from '@/i18n/useUI';
import SuggestionForm from '@/app/components/SuggestionForm';
import { submitSuggestion } from '@/app/lib/suggestions';

export default function SuggestPage() {
  const { t } = useUI();
  const [sent, setSent] = useState(false);
  return <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-white vibrant:bg-transparent">
    <div className="mx-auto max-w-4xl">
      <div className="mb-6"><h1 className="text-2xl font-semibold">{t('Suggest an event or announcement')}</h1><p className="mt-3 text-gray-500 dark:text-gray-400">{t('Feeling lazy? Just drop the poster. Or enter the details.')}</p></div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 vibrant:border-purple-200 sm:p-8">
        {sent ? <div className="py-10 text-center" role="status"><CheckCircle2 size={44} className="mx-auto mb-4 text-green-500" /><h2 className="text-xl font-bold">{t('Suggestion sent')}</h2><p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('Your suggestion will be reviewed before publication.')}</p><button className="mt-6 font-semibold text-blue-500" onClick={() => setSent(false)}>{t('Suggest another')}</button></div> : <SuggestionForm onSubmit={async draft => {
          await submitSuggestion(draft);
          setSent(true);
        }} />}
      </div>
    </div>
  </main>;
}
