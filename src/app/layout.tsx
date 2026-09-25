import type { Metadata } from "next";
import {NextIntlClientProvider} from "next-intl";
import {getLocale} from "next-intl/server";
import { absoluteUrl, siteName, siteUrl } from "@/app/lib/seo";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import ThemeFavicon from "@/app/components/ThemeFavicon";
import SiteVisitTracker from "@/app/components/SiteVisitTracker";
import CookieBanner from "@/app/components/layout/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-vibrant-heading",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

// 2. I updated the metadata to be more descriptive
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const descriptions: Record<string, string> = {
    tr: "Galatasaray Üniversitesi kulüplerini, kampüs etkinliklerini ve duyurularını keşfedin. Evenements ile etkinlik takvimini takip edin.",
    en: "Discover Galatasaray University clubs, campus events and announcements. Follow the event calendar with Evenements.",
    fr: "Découvrez les clubs, événements et annonces de l’Université Galatasaray. Retrouvez le calendrier des événements sur Evenements.",
  };
  const description = descriptions[locale] || descriptions.tr;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: 'Evenements | Galatasaray Üniversitesi Etkinlikleri', template: '%s | Evenements' },
    description,
    openGraph: { type: 'website', siteName, title: siteName, description, images: [{ url: absoluteUrl('/opengraph-image'), width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: siteName, description, images: [absoluteUrl('/opengraph-image')] },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Extensions may inject body attributes before hydration (e.g. cz-shortcut-listen).
          Suppression is shallow; descendant hydration checks remain enabled. */}
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable}`}>
        <NextIntlClientProvider>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "vibrant"]}
          >
        {/* 4. This div wrapper creates the full-height layout */}
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 vibrant:bg-[#faf5ff] text-gray-900 dark:text-gray-100 vibrant:text-indigo-950 antialiased transition-colors duration-300">
          
          {/* 5. The Navbar is added here, at the top */}
          
          <ThemeFavicon />
          <SiteVisitTracker />
          <Navbar /> 
          {/* 6. The <main> tag holds the page content and fills the remaining space */}
          <main className="flex-grow flex flex-col h-full">
            
            {children}
            
          </main>
            <Footer />
            <CookieBanner />
        </div>
        </ThemeProvider>
        </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// <DevAuthToolbar />
