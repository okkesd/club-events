"use client"; // Good practice for small, interactive components

import React from 'react';
import Link from 'next/link';
import { IClub } from '../../lib/types'; // Using relative path for safety

export default function ClubCard({ club }: { club: IClub }) {
  return (
    <Link 
      href={`/club/${club.slug}`}
      className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex items-center p-4">
        <img 
          src={club.logoUrl} 
          alt={`${club.name} logo`}
          className="w-16 h-16 rounded-full flex-shrink-0"
          onError={(e) => { 
            // Fallback in case image fails to load
            (e.target as HTMLImageElement).src = `https://placehold.co/100x100/EEE/333?text=${club.name.substring(0,2)}`; 
          }}
        />
        <div className="ml-4">
          <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{club.purpose}</p>
        </div>
      </div>
    </Link>
  );
}