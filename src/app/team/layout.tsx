import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
    tr: ['Ekip', 'Evenements’in arkasındaki ekibi tanıyın.'],
    en: ['Team', 'Meet the team behind Evenements.'],
    fr: ['Équipe', 'Découvrez l’équipe derrière Evenements.'],
  };
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/team');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
