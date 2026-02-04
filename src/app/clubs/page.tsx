"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronRight } from 'lucide-react';
import { getAllClubs, getAllClubsUser } from '@/app/lib/api';
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-gray-200 py-16 px-4 mb-10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Meet the Community
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Browse all student organizations, find your tribe, and get involved on campus.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mt-8">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text"
              placeholder="Search for a club..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-gray-100 border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
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
              <div key={i} className="bg-white h-48 rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Link 
                key={club.id} 
                href={`/club/${club.id}`} // Assuming you have this page
                className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-xl bg-gray-100 p-1 border border-gray-100 overflow-hidden shrink-0">
                        <img 
                            src={club.logoUrl || `https://ui-avatars.com/api/?name=${club.clubName}`} 
                            alt={club.clubName}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                    {/* Arrow Icon */}
                    <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {club.clubName}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {club.description || "No description available yet."}
                    </p>
                </div>

                {/* Footer / Stats (Optional) */}
                <div className="mt-auto pt-6 flex items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Club
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>View Profile</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
           <div className="text-center py-20">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No clubs found</h3>
                <p className="text-gray-500 mt-2">Try searching for something else.</p>
            </div>
        )}
      </div>
    </div>
  );
}