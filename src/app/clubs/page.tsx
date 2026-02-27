"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronRight, Loader2 } from 'lucide-react';
import { getAllClubsUser } from '@/app/lib/api';
import { ClubData } from '@/app/lib/types';

export default function ClubsDirectory() {
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClubs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllClubsUser(search);
      setClubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // trigger merge again and again one more, last, after last
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-16 px-4 mb-10 transition-colors">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
            Meet the Community
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
            Browse all student organizations, find your tribe, and get involved on campus.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mt-8">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input 
              type="text"
              placeholder="Search for a club..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 rounded-2xl transition-colors outline-none
                         bg-gray-100 border-transparent text-gray-900 placeholder-gray-500 
                         focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                         dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
                         dark:focus:bg-gray-800 dark:focus:ring-blue-900/50 dark:focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* --- CLUBS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {isLoading ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 h-64 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse transition-colors" />
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              // Safe fallback for image if none provided
              const logoSrc = club.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(club.clubName)}&background=random`;

              return (
                <Link 
                  key={club.id} 
                  href={`/club/${club.id}`} 
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 
                             shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col
                             dark:shadow-none dark:hover:bg-gray-800/50 dark:hover:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                      {/* Logo */}
                      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0 transition-colors">
                          <img 
                              src={logoSrc} 
                              alt={club.clubName}
                              className="w-full h-full object-cover rounded-lg"
                          />
                      </div>
                      
                      {/* Arrow Icon */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                      bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white
                                      dark:bg-gray-800 dark:text-gray-500 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                          <ChevronRight className="w-5 h-5" />
                      </div>
                  </div>

                  <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {club.clubName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed h-10 transition-colors">
                          {club.description || "No description available yet."}
                      </p>
                  </div>

                  {/* Footer / Stats */}
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">
                      <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Club
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">View Profile</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
           <div className="text-center py-20">
                <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">No clubs found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">Try searching for something else.</p>
            </div>
        )}
      </div>
    </div>
  );
}