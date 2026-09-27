import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Hakkımızda",
    "Galatasaray Üniversitesi etkinlikleri, kulüpleri ve duyuruları tek yerde. Evenements ile kampüs yaşamını keşfedin."
  ],
  "en": [
    "About us",
    "Galatasaray University events, clubs and announcements in one place. Discover campus life with Evenements."
  ],
  "fr": [
    "À propos",
    "Événements, clubs et annonces de l’Université Galatasaray au même endroit. Découvrez la vie du campus avec Evenements."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/about-us');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
