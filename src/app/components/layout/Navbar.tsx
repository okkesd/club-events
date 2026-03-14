"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, CalendarDays, User, Plus, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "next-themes";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    console.log("Current theme:", theme);
    console.log("System theme:", systemTheme);
    console.log("Resolved theme:", resolvedTheme);
    console.log("HTML class:", document.documentElement.className);
  }, [theme, systemTheme, resolvedTheme]);
  
  // Hydration fix: Wait until mounted to render theme icons
  const [mounted, setMounted] = useState(false);

  // 2. HYDRATION FIX: Set mounted to true only after client load
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand/Logo */}
          <Link 
            href="/main" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            Evenements
          </Link>
          
          {/* Actions Area */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            {mounted ? (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
                aria-label="Toggle Dark Mode"
              >
                {theme === "light" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            ) : (
              // Optional: Render a blank placeholder of the same size to prevent layout shift
              <div className="w-9 h-9" />
            )}

            {/* Auth Logic */}
            {isLoginPage ? (
              <Link href="/signup" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Create new club
              </Link>
            ) : isSignupPage ? (
              <Link href="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Already have a club?
              </Link>
            ) : (
              // --- MAIN APP LOGIC ---
              <div className="flex items-center gap-4">
                
                <Link href="/clubs" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Clubs
                </Link>

                {user ? (
                  /* 1. LOGGED IN VIEW */
                  <>
                    <Link 
                        href="/event/create"
                        className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                    </Link>

                    {/* Profile Link */}
                    <Link 
                        href={user.role === 'admin' ? '/admin' : `/club/${user.id}`} 
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Logged in as ${user.club_name}`}
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </Link>

                    {/*  LOGOUT BUTTON */}
                    <button 
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  /* 2. GUEST VIEW */
                  <Link 
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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