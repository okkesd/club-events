import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Hakkımızda",
    "Evenements ile Galatasaray Üniversitesi kampüs yaşamını keşfedin. Projeyi ve ekibini tanıyın."
  ],
  "en": [
    "About us",
    "Discover Evenements, the project and team connecting Galatasaray University campus life."
  ],
  "fr": [
    "À propos",
    "Découvrez Evenements, le projet et son équipe au service de la vie du campus de l’Université Galatasaray."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/about-us');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
