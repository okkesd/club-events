'use client'

import Link from 'next/link';
import { LogIn, CalendarDays, User, LogOut , CalendarPlus } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';


/**
 * A global navigation bar for the entire application.
 * It's displayed by the root layout.
 */
export default function Navbar() {

  const { user, isLoggedIn, logout } = useAuth();
  

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Container to center content and add padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        {/* Left side of Navbar */}
  <div className="flex items-center gap-6">
    {/* Brand/Logo */}
    <Link 
      href="/main" 
      className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
    >
      <CalendarDays className="w-6 h-6 text-blue-600" />
      UniEvents
    </Link>
    
    <nav className="flex items-center">
      <Link 
        href="/main"
        className="text-sm font-semibold text-gray-600 hover:text-blue-600"
      >
        Calendar
      </Link>
    </nav>

    {/* --- ADD THIS NEW CLUBS LINK --- */}
    <nav className="flex items-center">
      <Link 
        href="/club"
        className="text-sm font-semibold text-gray-600 hover:text-blue-600"
      >
        All Clubs
      </Link>
    </nav>
    {/* --- END OF CHANGE --- */}
  </div>
          
          {<div className="flex items-center gap-4">
            {isLoggedIn && user ? (
              <>

                {(user.role === 'club_member') && ( //  || user.role === 'admin'
                  
                  // Change this from a <button> to a <Link>
                  <Link
                    href="/events/create" // <-- Set the new page route
                    className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Create Event
                  </Link>
                )}
                {/* Profile Link (as you designed) */}
                <Link 
                  href="/profile" // You can create this page next
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {/* Show club name or email */}
                  {user?.clubName || user?.email}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => logout()} // Call the logout function from context
                  className="flex items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link 
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Club Login
                </Link>
              </>
            )}
          </div>}

        </div>
      </div>
    </nav>
  );
}