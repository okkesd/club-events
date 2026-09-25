import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Çerez Politikası",
    "Evenements üzerinde kullanılan çerezler ve tarayıcı tercihleri hakkında bilgi alın."
  ],
  "en": [
    "Cookie policy",
    "Learn about cookies and browser preferences used by Evenements."
  ],
  "fr": [
    "Politique relative aux cookies",
    "Découvrez les cookies et les préférences de navigateur utilisés par Evenements."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/legal/cookies');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
