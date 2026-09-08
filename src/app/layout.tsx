import type { Metadata } from "next";
import {NextIntlClientProvider} from "next-intl";
import {getLocale} from "next-intl/server";
import {getUI} from "@/i18n/server";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { AuthProvider } from "@/app/context/AuthContext";
import DevAuthToolbar from "@/app/components/DevAuthToolbar";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
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
  const {t} = await getUI();
  return {title: "Evenements", description: t("Find and manage all your club events in one place.")};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      {/* 3. Keep your font variables on the body tag */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable}`}>
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
