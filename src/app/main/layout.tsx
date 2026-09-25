import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Etkinlik Takvimi",
    "Galatasaray Üniversitesi kulüplerinin etkinlik takvimini keşfedin. Kampüsteki seminerleri, atölyeleri ve sosyal etkinlikleri takip edin."
  ],
  "en": [
    "Event calendar",
    "Discover Galatasaray University club events, workshops, seminars and campus activities."
  ],
  "fr": [
    "Calendrier des événements",
    "Découvrez les événements, ateliers, conférences et activités des clubs de l’Université Galatasaray."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/main');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
