import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Öğrenci Kulüpleri",
    "Galatasaray Üniversitesi öğrenci kulüplerini tanıyın, etkinliklerini ve duyurularını takip edin."
  ],
  "en": [
    "Student clubs",
    "Meet Galatasaray University student clubs and follow their events and announcements."
  ],
  "fr": [
    "Clubs étudiants",
    "Découvrez les clubs étudiants de l’Université Galatasaray, leurs événements et leurs annonces."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/clubs');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
