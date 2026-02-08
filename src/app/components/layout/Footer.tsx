"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  /*const [mounted, setMounted] = useState(false);
  
    // 2. HYDRATION FIX: Set mounted to true only after client load
    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted){
      return <div>loading</div>
    }*/

  return (
    <footer className="w-full border-t transition-colors duration-300 bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          
          {/* Left Side: Brand and Links */}
          <div className="flex flex-col items-center md:items-start">
            {/* Brand */}
            <Link suppressHydrationWarning
              href="/main" 
              className="flex items-center gap-2 text-xl font-bold transition-colors mb-2 text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
            >
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              UniEvents
            </Link>
            
            {/* Links - Now includes the contracts you asked for */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Link href="/about-us" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Contact
              </Link>
              <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Cookies
              </Link>
            </nav>
          </div>
          
          {/* Right Side: Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
              © {currentYear} UniEvents
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Made for students, by students.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}