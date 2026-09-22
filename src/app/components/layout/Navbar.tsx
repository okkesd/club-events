"use client";
import {useUI} from "@/i18n/useUI";


import React, { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, CalendarDays, User, Users, Plus, Moon, Sun, LogOut, Palette, Megaphone, Menu, X, LayoutGrid, Heart } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import { resolveImageUrl } from "@/app/lib/api";
import { useTheme } from "next-themes";
import LanguageSelector from "./LanguageSelector";

const THEME_ORDER = ["light", "dark", "vibrant"] as const;

const THEME_ICON: Record<string, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  vibrant: <Palette className="w-5 h-5" />,
};

export default function Navbar() {
  const {t} = useUI();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const currentTheme = resolvedTheme || "light";

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasOpenedMobileMenu, setHasOpenedMobileMenu] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const cycleTheme = () => {
    const current = currentTheme;
    const idx = THEME_ORDER.indexOf(current as typeof THEME_ORDER[number]);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setTheme(next);
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  const navLinkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === href
        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white vibrant:bg-purple-100 vibrant:text-purple-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white vibrant:text-purple-700 vibrant:hover:bg-purple-50 vibrant:hover:text-purple-900'
    }`;

  return (
    <nav ref={menuRef} className="w-full bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 vibrant:border-purple-200 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand/Logo */}
          <Link
            href="/main"
            className="flex shrink-0 items-center gap-1.5 text-base sm:gap-2 sm:text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 transition-colors"
          >
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-500 vibrant:text-purple-600" />
            <span className="vibrant-gradient-text">evenements</span>
            <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 vibrant:bg-purple-100 vibrant:text-purple-700 border border-blue-200 dark:border-blue-800 vibrant:border-purple-300">
              {t("Beta")}</span>
          </Link>

          {/* Desktop nav links (hidden on mobile) */}
          {!isLoginPage && !isSignupPage && (
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/events" className={navLinkClass("/events")}>
                <LayoutGrid className="w-4 h-4" />
                {t("Events")}</Link>
              <Link href="/clubs" className={navLinkClass("/clubs")}>
                <Users className="w-4 h-4" aria-hidden="true" />
                {t("Clubs")}</Link>
              <Link href="/announcements" className={navLinkClass("/announcements")}>
                <Megaphone className="w-4 h-4" />
                <span className="hidden md:inline">{t("Announcements")}</span>
              </Link>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link href="/my-likes" title={t("My Likes")} aria-label={t("My Likes")} aria-current={pathname === "/my-likes" ? "page" : undefined}
              className={`hidden lg:inline-flex items-center justify-center rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${pathname === "/my-likes" ? "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 vibrant:bg-pink-100 vibrant:text-pink-700" : "text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-rose-400 vibrant:text-purple-600 vibrant:hover:bg-pink-50"}`}>
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            <div className="hidden lg:block">
              <LanguageSelector />
            </div>

            <Link href="/suggest" className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 vibrant:bg-purple-600">
              <Plus className="h-4 w-4" aria-hidden="true" />{t('Suggest an event')}
            </Link>

            {/* Theme Cycle Button */}
            {mounted ? (
              <button
                onClick={cycleTheme}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 vibrant:text-purple-500 vibrant:hover:bg-purple-100 transition-all"
                aria-label={t("Current theme: {theme}. Click to switch.", {theme: t(currentTheme)})}
                title={t("Theme: {theme}", {theme: t(currentTheme)})}
              >
                {THEME_ICON[currentTheme]}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {/* Auth Logic - Desktop */}
            {isLoginPage ? (
              <Link href="/signup" className="hidden lg:inline text-sm font-semibold text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600">
                {t("Create new club")}</Link>
            ) : isSignupPage ? (
              <Link href="/login" className="hidden lg:inline text-sm font-semibold text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600">
                {t("Already have a club?")}</Link>
            ) : (
              <>
                {/* Desktop-only auth actions */}
                <div className="hidden lg:flex items-center gap-3">
                  {user ? (
                    <>
                      <Link
                        href="/event/create"
                        className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t("Create Event")}</span>
                      </Link>

                      <Link
                        href="/announcements/create"
                        className="hidden md:flex items-center gap-2 border border-gray-200 dark:border-gray-700 vibrant:border-purple-300 text-gray-700 dark:text-gray-200 vibrant:text-purple-700 hover:bg-gray-50 dark:hover:bg-gray-800 vibrant:hover:bg-purple-50 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                      >
                        <Megaphone className="w-4 h-4" />
                        <span>{t("Post")}</span>
                      </Link>

                      <Link
                        href={user.role === 'admin' ? '/admin' : `/club/${user.id}`}
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 border border-gray-200 dark:border-gray-700 vibrant:border-purple-300 flex items-center justify-center text-gray-600 dark:text-gray-300 vibrant:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-200 transition-colors"
                        title={t("Logged in as {name}", {name: user.club_name || t("My Club")})}
                      >
                        {user.avatarUrl ? (
                          <img src={resolveImageUrl(user.avatarUrl)} alt={t("Avatar")} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </Link>

                      <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 vibrant:hover:text-pink-600 vibrant:hover:bg-pink-50 rounded-lg transition-colors"
                        title={t("Sign Out")}
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-gray-100 vibrant:bg-purple-600 px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 vibrant:text-white shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 vibrant:hover:bg-purple-700 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      {t("Club Login")}</Link>
                  )}
                </div>

              </>
            )}
            {/* Mobile hamburger button */}
            <button
              onClick={() => {
                setHasOpenedMobileMenu(true);
                setMobileMenuOpen((prev) => !prev);
              }}
              type="button"
              className={`relative isolate overflow-hidden lg:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${!hasOpenedMobileMenu ? "mobile-menu-intro" : ""} ${mobileMenuOpen
                ? "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white vibrant:border-purple-200 vibrant:bg-purple-100 vibrant:text-purple-900"
                : "border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 dark:border-blue-400/60 dark:shadow-blue-500/30 vibrant:border-purple-400 vibrant:from-purple-600 vibrant:to-pink-600 vibrant:shadow-purple-500/25 vibrant:hover:from-purple-500 vibrant:hover:to-pink-500"
              }`}
              aria-label={t(mobileMenuOpen ? "Close" : "Toggle menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="relative z-10 h-6 w-6 shrink-0" aria-hidden="true" /> : <Menu className="relative z-10 h-6 w-6 shrink-0" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden absolute left-0 right-0 top-16 border-t border-gray-200 dark:border-gray-800 vibrant:border-purple-200 bg-white dark:bg-gray-900 vibrant:bg-white/95 vibrant:backdrop-blur-sm shadow-lg z-50"
        >
          <div className="px-4 py-3 space-y-1">
            <Link href="/suggest" className="mb-3 flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-700 vibrant:bg-purple-600">
              <Plus className="h-4 w-4" aria-hidden="true" />{t('Suggest an event')}
            </Link>
            <Link href="/events" className={navLinkClass("/events")}>
              <LayoutGrid className="w-4 h-4" />
              {t("Events")}</Link>
            <Link href="/clubs" className={navLinkClass("/clubs")}>
              <Users className="w-4 h-4" aria-hidden="true" />
              {t("Clubs")}</Link>
            <Link href="/my-likes" className={navLinkClass("/my-likes")} aria-current={pathname === "/my-likes" ? "page" : undefined}>
              <Heart className="w-4 h-4" aria-hidden="true" />
              {t("My Likes")}</Link>
            <Link href="/announcements" className={navLinkClass("/announcements")}>
              <Megaphone className="w-4 h-4" />
              {t("Announcements")}</Link>

            <div className="border-t border-gray-100 dark:border-gray-800 vibrant:border-purple-100 my-2" />

            <LanguageSelector expanded />
            <div className="border-t border-gray-100 dark:border-gray-800 vibrant:border-purple-100 my-2" />

            {isLoginPage || isSignupPage ? (
              <Link href={isLoginPage ? "/signup" : "/login"} className={navLinkClass(isLoginPage ? "/signup" : "/login")}>
                <LogIn className="w-4 h-4" />
                {t(isLoginPage ? "Create new club" : "Already have a club?")}
              </Link>
            ) : user ? (
              <>
                <Link href="/event/create" className={navLinkClass("/event/create")}>
                  <Plus className="w-4 h-4" />
                  {t("Create Event")}</Link>
                <Link href="/announcements/create" className={navLinkClass("/announcements/create")}>
                  <Megaphone className="w-4 h-4" />
                  {t("Post Announcement")}</Link>
                <Link
                  href={user.role === 'admin' ? '/admin' : `/club/${user.id}`}
                  className={navLinkClass(user.role === 'admin' ? '/admin' : `/club/${user.id}`)}
                >
                  {user.avatarUrl ? (
                    <img src={resolveImageUrl(user.avatarUrl)} alt={t("Avatar")} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {user.club_name || t("My Club")}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 vibrant:text-pink-600 vibrant:hover:bg-pink-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("Sign Out")}</button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 vibrant:bg-purple-600 vibrant:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {t("Club Login")}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
