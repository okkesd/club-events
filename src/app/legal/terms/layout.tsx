import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Kullanım Koşulları",
    "Evenements kullanım koşullarını ve platform kurallarını inceleyin."
  ],
  "en": [
    "Terms of use",
    "Read the Evenements terms of use and platform rules."
  ],
  "fr": [
    "Conditions d’utilisation",
    "Consultez les conditions d’utilisation et les règles de la plateforme Evenements."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/legal/terms');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
