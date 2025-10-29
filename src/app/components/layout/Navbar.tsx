import Link from 'next/link';
import { LogIn, CalendarDays } from 'lucide-react'; // You'll need: npm install lucide-react

/**
 * A global navigation bar for the entire application.
 * It's displayed by the root layout.
 */
export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Container to center content and add padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand/Logo - Links to the main calendar page */}
          <Link 
            href="/main" 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <CalendarDays className="w-6 h-6 text-blue-600" />
            UniEvents
          </Link>
          
          {/* Login Button */}
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Club Login
          </Link>

        </div>
      </div>
    </nav>
  );
}