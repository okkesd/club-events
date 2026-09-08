"use client";
import {useUI} from "@/i18n/useUI";


import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronRight, Loader2 } from 'lucide-react';
import { fetchClubsPaginated, resolveImageUrl } from '@/app/lib/api';
import { ClubData, Pagination } from '@/app/lib/types';
import PaginationBar from '@/app/components/PaginationBar';

export default function ClubsDirectory() {
  const {t} = useUI();
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchClubsPaginated(search || undefined, page, 12);
      setClubs(res.data.filter(c => c.isVerified));
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // trigger merge again and again one more, last, after last, for backend, another
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent pb-20 transition-colors duration-300">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white dark:bg-gray-900 vibrant:bg-white/60 vibrant:backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 vibrant:border-purple-200 py-16 px-4 mb-10 transition-colors">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white vibrant:text-purple-800 tracking-tight transition-colors">
            {t("Meet the Community")}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 vibrant:text-purple-600 max-w-2xl mx-auto transition-colors">
            {t("Browse all student organizations, find your tribe, and get involved on campus.")}</p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mt-8">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 vibrant:text-purple-400" />
            </div>
            <input
              type="text"
              placeholder={t("Search for a club...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 rounded-2xl transition-colors outline-none
                         bg-gray-100 border-transparent text-gray-900 placeholder-gray-500
                         focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                         dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
                         dark:focus:bg-gray-800 dark:focus:ring-blue-900/50 dark:focus:border-blue-500
                         vibrant:bg-white/80 vibrant:text-purple-900 vibrant:placeholder-purple-400
                         vibrant:border vibrant:border-purple-200 vibrant:focus:bg-white vibrant:focus:ring-2 vibrant:focus:ring-purple-300 vibrant:focus:border-purple-400"
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
              <div key={i} className="bg-white dark:bg-gray-900 vibrant:bg-white/60 h-64 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-purple-200 animate-pulse transition-colors" />
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => {
                const logoSrc = resolveImageUrl(club.logoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(club.clubName)}&background=random`;

                return (
                  <Link
                    key={club.id}
                    href={`/club/${club.id}`}
                    className="group bg-white dark:bg-gray-900 vibrant:bg-white/70 vibrant:backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-800 vibrant:border-purple-200
                               shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col
                               dark:shadow-none dark:hover:bg-gray-800/50 dark:hover:border-gray-700
                               vibrant:hover:bg-white/90 vibrant:hover:border-purple-300 vibrant:hover:shadow-purple-200/40"
                  >
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-50 p-1 border border-gray-100 dark:border-gray-700 vibrant:border-purple-200 overflow-hidden shrink-0 transition-colors">
                            <img
                                src={logoSrc}
                                alt={club.clubName}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                        bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white
                                        dark:bg-gray-800 dark:text-gray-500 dark:group-hover:bg-blue-600 dark:group-hover:text-white
                                        vibrant:bg-purple-100 vibrant:text-purple-400 vibrant:group-hover:bg-purple-600 vibrant:group-hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 vibrant:text-purple-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 vibrant:group-hover:text-purple-600 transition-colors mb-2">
                            {club.clubName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 vibrant:text-purple-600/70 line-clamp-2 leading-relaxed h-10 transition-colors">
                            {club.description || t("No description available yet.")}
                        </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 vibrant:border-purple-100 flex items-center gap-4 text-xs font-semibold text-gray-400 dark:text-gray-500 vibrant:text-purple-400 uppercase tracking-wider transition-colors">
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {t("Club")}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 vibrant:bg-purple-300"></span>
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 vibrant:group-hover:text-purple-600 transition-colors">{t("View Profile")}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {pagination && (
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            )}
          </>
        ) : (
           <div className="text-center py-20">
                <div className="bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 vibrant:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-800 transition-colors">{t("No clubs found")}</h3>
                <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mt-2 transition-colors">{t("Try searching for something else.")}</p>
            </div>
        )}
      </div>
    </div>
  );
}
