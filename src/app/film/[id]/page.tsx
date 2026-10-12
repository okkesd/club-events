import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CinemaFilm } from '@/app/lib/cinema';
import { pageMetadata } from '@/app/lib/seo';
import FilmDetailClient from './FilmDetailClient';

const fetchFilm = cache(async (id: string): Promise<CinemaFilm | null> => {
  const origin = (process.env.INTERNAL_APP_URL?.trim() || `http://127.0.0.1:${process.env.PORT || '3000'}`).replace(/\/+$/, '');
  const response = await fetch(`${origin}/api/proxy/sinefil/films/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Film details unavailable');
  const result = await response.json();
  if (result.success !== true || !result.data) throw new Error('Invalid film details');
  return result.data;
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const film = await fetchFilm(id);
  if (!film) return { title: 'Sinefil’s Eye', robots: { index: false, follow: false } };
  return pageMetadata(film.title, film.description, `/film/${id}`, film.imageUrl ?? undefined);
}

export default async function FilmPage({ params }: Props) {
  const { id } = await params;
  const film = await fetchFilm(id);
  if (!film) notFound();
  return <FilmDetailClient film={film} />;
}
