import React from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* Left Side: Brand and Links */}
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            {/* Brand */}
            <Link 
              href="/main" 
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              <CalendarDays className="w-6 h-6 text-blue-500" />
              UniEvents
            </Link>
            {/* Links */}
            <nav className="flex space-x-4 mt-2">
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>
          
          {/* Right Side: Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              © {currentYear} UniEvents. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Made for students, by students.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}