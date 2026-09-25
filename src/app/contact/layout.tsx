import { getLocale } from 'next-intl/server';
import { pageMetadata } from '@/app/lib/seo';

export async function generateMetadata() {
  const texts: Record<string, [string, string]> = {
  "tr": [
    "İletişim",
    "Evenements ekibiyle iletişime geçin. Sorularınızı ve önerilerinizi paylaşın."
  ],
  "en": [
    "Contact",
    "Contact the Evenements team with your questions and suggestions."
  ],
  "fr": [
    "Contact",
    "Contactez l’équipe Evenements pour vos questions et suggestions."
  ]
};
  const [title, description] = texts[await getLocale()] || texts.tr;
  return pageMetadata(title, description, '/contact');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
