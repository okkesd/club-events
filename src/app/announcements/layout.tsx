import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Duyurular",
    "Galatasaray Üniversitesi kulüplerinden duyurular, stajlar, burslar ve katılım fırsatları."
  ],
  "en": [
    "Announcements",
    "Find Galatasaray University club announcements, internships, scholarships and opportunities."
  ],
  "fr": [
    "Annonces",
    "Retrouvez les annonces des clubs de l’Université Galatasaray, les stages, bourses et opportunités."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/announcements');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
