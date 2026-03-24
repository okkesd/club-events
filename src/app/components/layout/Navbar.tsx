"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, CalendarDays, User, Plus, Moon, Sun, LogOut, Palette, Megaphone, Menu, X, LayoutGrid } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import { resolveImageUrl } from "@/app/lib/api";
import { useTheme } from "next-themes";

const THEME_ORDER = ["light", "dark", "vibrant"] as const;

const THEME_ICON: Record<string, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  vibrant: <Palette className="w-5 h-5" />,
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    const current = theme || "light";
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
    <nav className="w-full bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 vibrant:border-purple-200 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand/Logo */}
          <Link
            href="/main"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 transition-colors"
          >
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-500 vibrant:text-purple-600" />
            <span className="vibrant-gradient-text">Evenements</span>
          </Link>

          {/* Desktop nav links (hidden on mobile) */}
          {!isLoginPage && !isSignupPage && (
            <div className="hidden sm:flex items-center gap-1">
              <Link href="/events" className={navLinkClass("/events")}>
                <LayoutGrid className="w-4 h-4" />
                Events
              </Link>
              <Link href="/clubs" className={navLinkClass("/clubs")}>
                Clubs
              </Link>
              <Link href="/announcements" className={navLinkClass("/announcements")}>
                <Megaphone className="w-4 h-4" />
                <span className="hidden md:inline">Board</span>
              </Link>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Cycle Button */}
            {mounted ? (
              <button
                onClick={cycleTheme}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 vibrant:text-purple-500 vibrant:hover:bg-purple-100 transition-all"
                aria-label={`Current theme: ${theme}. Click to switch.`}
                title={`Theme: ${theme}`}
              >
                {THEME_ICON[theme || "light"]}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {/* Auth Logic - Desktop */}
            {isLoginPage ? (
              <Link href="/signup" className="text-sm font-semibold text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600">
                Create new club
              </Link>
            ) : isSignupPage ? (
              <Link href="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600">
                Already have a club?
              </Link>
            ) : (
              <>
                {/* Desktop-only auth actions */}
                <div className="hidden sm:flex items-center gap-3">
                  {user ? (
                    <>
                      <Link
                        href="/event/create"
                        className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                      </Link>

                      <Link
                        href={user.role === 'admin' ? '/admin' : `/club/${user.id}`}
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 border border-gray-200 dark:border-gray-700 vibrant:border-purple-300 flex items-center justify-center text-gray-600 dark:text-gray-300 vibrant:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-200 transition-colors"
                        title={`Logged in as ${user.club_name}`}
                      >
                        {user.avatarUrl ? (
                          <img src={resolveImageUrl(user.avatarUrl)} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </Link>

                      <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 vibrant:hover:text-pink-600 vibrant:hover:bg-pink-50 rounded-lg transition-colors"
                        title="Sign Out"
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
                      Club Login
                    </Link>
                  )}
                </div>

                {/* Mobile hamburger button */}
                <button
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 vibrant:text-purple-500 vibrant:hover:bg-purple-100 transition-all"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && !isLoginPage && !isSignupPage && (
        <div
          ref={menuRef}
          className="sm:hidden absolute left-0 right-0 top-16 border-t border-gray-200 dark:border-gray-800 vibrant:border-purple-200 bg-white dark:bg-gray-900 vibrant:bg-white/95 vibrant:backdrop-blur-sm shadow-lg z-50"
        >
          <div className="px-4 py-3 space-y-1">
            <Link href="/events" className={navLinkClass("/events")}>
              <LayoutGrid className="w-4 h-4" />
              Events
            </Link>
            <Link href="/clubs" className={navLinkClass("/clubs")}>
              Clubs
            </Link>
            <Link href="/announcements" className={navLinkClass("/announcements")}>
              <Megaphone className="w-4 h-4" />
              Board
            </Link>

            <div className="border-t border-gray-100 dark:border-gray-800 vibrant:border-purple-100 my-2" />

            {user ? (
              <>
                <Link href="/event/create" className={navLinkClass("/event/create")}>
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
                <Link
                  href={user.role === 'admin' ? '/admin' : `/club/${user.id}`}
                  className={navLinkClass(user.role === 'admin' ? '/admin' : `/club/${user.id}`)}
                >
                  {user.avatarUrl ? (
                    <img src={resolveImageUrl(user.avatarUrl)} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {user.club_name || 'My Club'}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 vibrant:text-pink-600 vibrant:hover:bg-pink-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 vibrant:bg-purple-600 vibrant:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Club Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
