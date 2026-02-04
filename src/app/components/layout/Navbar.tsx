// app/components/Navbar.tsx
"use client";

import React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, CalendarDays, User, Plus, Shield } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";

/**
 * A global navigation bar for the entire application.
 * It's displayed by the root layout.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand/Logo */}
          <Link 
            href="/main" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <CalendarDays className="w-6 h-6 text-blue-600" />
            UniEvents
          </Link>
          
          {/* Actions Area */}
          <div>
            {isLoginPage ? (
              <Link href="/signup" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
                Create new club
              </Link>
            ) : isSignupPage ? (
              <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
                Already have a club?
              </Link>
            ) : (
              // --- MAIN APP LOGIC ---
              <div className="flex items-center gap-4">
                
                <Link href="/clubs" className="text-gray-600 hover:text-blue-600 font-medium">
                  Clubs
                </Link>
                {user ? (
                  /* 1. LOGGED IN VIEW */
                  <>
                    {/* Create Event: Visible for BOTH Admin and Club */}
                    <Link 
                        href="/event/create"
                        className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                    </Link>

                    {/* Dynamic Profile Icon */}
                    {/* Admins go to Dashboard (/admin), Clubs go to Profile (/clubs/id) */}
                    <Link 
                        href={user.role === 'admin' ? '/admin' : `/club/${user.id}`} 
                        className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        title={`Logged in as ${user.name}`}
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </Link>
                  </>
                ) : (
                  /* 2. GUEST VIEW */
                  <Link 
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
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