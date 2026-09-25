import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "Gizlilik Politikası",
    "Evenements kişisel verileri ve ziyaretçi bilgilerini nasıl işler? Gizlilik politikasını okuyun."
  ],
  "en": [
    "Privacy policy",
    "Learn how Evenements handles personal data and visitor information."
  ],
  "fr": [
    "Politique de confidentialité",
    "Découvrez comment Evenements traite les données personnelles et les informations des visiteurs."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/legal/privacy');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
