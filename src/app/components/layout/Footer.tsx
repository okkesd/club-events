"use client";
import {useUI} from "@/i18n/useUI";


import React from 'react';
import Link from 'next/link';
import { CalendarDays, Instagram } from 'lucide-react';

export default function Footer() {
  const {t} = useUI();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t transition-colors duration-300 bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800 vibrant:bg-white/60 vibrant:backdrop-blur-sm vibrant:border-campus-border">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">

          {/* Left Side: Brand and Links */}
          <div className="flex flex-col items-center md:items-start">
            {/* Brand */}
            <div className="mb-2 flex items-center gap-3">
            <Link suppressHydrationWarning
              href="/main"
              className="flex items-center gap-2 text-xl font-bold transition-colors text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-300 vibrant:text-campus-ink vibrant:hover:text-campus-accent"
            >
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-500 vibrant:text-campus-ink" />
              Evenements
            </Link>
            <a
              href="https://www.instagram.com/evenementsadmin/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram: @evenementsadmin"
              title="@evenementsadmin"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded p-1 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300 vibrant:text-campus-accent vibrant:hover:text-campus-accent-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              <span>@evenementsadmin</span>
            </a>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-gray-600 dark:text-gray-300 vibrant:text-campus-ink">
              <Link href="/about-us" className="hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">
                {t("About")}</Link>
              <Link href="/team" className="hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">
                {t("Team")}</Link>
              <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">
                {t("Contact")}</Link>
              <span className="hidden md:inline text-gray-300 dark:text-gray-700 vibrant:text-campus-muted">|</span>
              <Link href="/legal/terms" className="hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">
                {t("Terms")}</Link>
              <Link href="/legal/privacy" className="hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">
                {t("Privacy")}</Link>
              <Link href="/legal/cookies" className="hover:text-blue-600 dark:hover:text-blue-300 vibrant:hover:text-campus-accent transition-colors">
                {t("Cookies")}</Link>
            </nav>
          </div>

          {/* Right Side: Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 vibrant:text-gray-900">
              © {currentYear} Evenements
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-campus-muted mt-1">
              {t("Made for students, by students.")}</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
