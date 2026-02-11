import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/layout/Navbar"; // 1. Import the Navbar
import Footer from "@/app/components/layout/Footer";
import { AuthProvider } from "@/app/context/AuthContext";
import DevAuthToolbar from "@/app/components/DevAuthToolbar";
import { ThemeProvider } from "@/app/providers/ThemeProvider"; 
import CookieBanner from "@/app/components/layout/CookieBanner";

// --- Your existing font setup ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// --- End of your font setup ---

// 2. I updated the metadata to be more descriptive
export const metadata: Metadata = {
  title: "University Events",
  description: "Find and manage all your club events in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 3. Keep your font variables on the body tag */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            
          >
        {/* 4. This div wrapper creates the full-height layout */}
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300">
          
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
      </body>
    </html>
  );
}

// <DevAuthToolbar />
