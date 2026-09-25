import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Etkinlikler",
    "Galatasaray Üniversitesi etkinliklerini tarihe, kulübe ve ilgi alanınıza göre keşfedin."
  ],
  "en": [
    "Events",
    "Explore Galatasaray University events by date, club and interest."
  ],
  "fr": [
    "Événements",
    "Explorez les événements de l’Université Galatasaray par date, club et centre d’intérêt."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/events');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
