import { notFound } from 'next/navigation';
import { announcementForSeo } from '@/app/lib/seoData';
import { pageMetadata } from '@/app/lib/seo';
import { resolveImageUrl } from '@/app/lib/api';
import AnnouncementDetailClient from './AnnouncementDetailClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await announcementForSeo(id);
  if (!item) return { robots: { index: false, follow: false } };
  return pageMetadata(item.title, item.body, `/announcements/${encodeURIComponent(id)}`,
    item.coverImage ? resolveImageUrl(item.coverImage) : undefined);
}

export default async function AnnouncementPage({ params }: Props) {
  const { id } = await params;
  const item = await announcementForSeo(id);
  if (!item) notFound();
  return <AnnouncementDetailClient initialAnnouncement={item} />;
}
