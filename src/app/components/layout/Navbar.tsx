"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, CalendarDays, User, Plus, Moon, Sun, LogOut, Palette, Megaphone } from 'lucide-react';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const current = theme || "light";
    const idx = THEME_ORDER.indexOf(current as typeof THEME_ORDER[number]);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setTheme(next);
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

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

          {/* Actions Area */}
          <div className="flex items-center gap-4">

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

            {/* Auth Logic */}
            {isLoginPage ? (
              <Link href="/signup" className="text-sm font-semibold text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600">
                Create new club
              </Link>
            ) : isSignupPage ? (
              <Link href="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600">
                Already have a club?
              </Link>
            ) : (
              <div className="flex items-center gap-4">

                <Link href="/events" className="text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 font-medium hidden sm:inline">
                  Events
                </Link>
                <Link href="/clubs" className="text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 font-medium">
                  Clubs
                </Link>
                <Link href="/announcements" className="text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:text-blue-600 dark:hover:text-blue-400 vibrant:hover:text-pink-600 font-medium hidden sm:flex items-center gap-1">
                  <Megaphone className="w-4 h-4" />
                  <span className="hidden md:inline">Board</span>
                </Link>

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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
