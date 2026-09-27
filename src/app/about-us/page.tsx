"use client";

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useUI } from '@/i18n/useUI';

export default function AboutPage() {
  const { t } = useUI();
  const features = [
    { title: 'Find your next event.', text: 'See what is happening on campus, day by day.' },
    { title: 'Stay connected.', text: 'Discover clubs and keep up with their announcements.' },
    { title: 'Make it your week.', text: 'Save your favourites and share plans with friends.' },
  ];

  return (
    <div className="flex-1 bg-white px-6 py-16 text-gray-900 dark:bg-gray-950 dark:text-gray-100 vibrant:bg-campus-surface vibrant:text-campus-ink sm:py-24">
      <article className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-300 vibrant:text-campus-muted">
          <span aria-hidden="true" className="h-px w-10 bg-blue-500 dark:bg-blue-400 vibrant:bg-campus-gold" />
          {t('Galatasaray University · Campus life')}
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl">
          {t('Campus life. One place.')}
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 vibrant:text-campus-ink">
          {t('Evenements brings Galatasaray University events, clubs and announcements together. Less searching, more being there.')}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href="/main" className="inline-flex items-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 vibrant:bg-campus-accent vibrant:hover:bg-campus-accent-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
            {t('Explore the calendar')}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/team" className="rounded text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white vibrant:text-campus-ink vibrant:hover:text-campus-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
            {t('Meet the team')}
          </Link>
        </div>

        <div className="mt-16 grid gap-8 border-t border-gray-200 pt-8 dark:border-gray-800 vibrant:border-campus-border sm:mt-20 sm:grid-cols-3">
          {features.map(({ title, text }, index) => (
            <section key={title}>
              <span aria-hidden="true" className="text-xs font-medium tabular-nums text-blue-600 dark:text-blue-300 vibrant:text-campus-accent">0{index + 1}</span>
              <h2 className="mt-3 text-base font-semibold tracking-tight">{t(title)}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 vibrant:text-campus-muted">{t(text)}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-gray-500 dark:text-gray-400 vibrant:text-campus-muted">{t('Made for students, by students.')}</p>
      </article>
    </div>
  );
}
