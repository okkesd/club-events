"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Ghost, Map, Coffee, ArrowLeft, 
  HelpCircle, BookOpen 
} from 'lucide-react';

// A collection of humorous "university-themed" excuses
const EXCUSES = [
  "This page is emptier than an 8 AM lecture on a Monday.",
  "The link you clicked has graduated and moved on.",
  "We searched the entire library, but this page is overdue.",
  "This club is so exclusive, even the server can't find it.",
  "It looks like this page is currently on a gap year.",
  "404: GPA not found... just kidding (we hope).",
  "The dog ate your digital homework.",
  "This page is currently stuck in the cafeteria line."
];

export default function NotFound() {
  // Use state to prevent hydration mismatches with random numbers
  const [excuse, setExcuse] = useState("");

  useEffect(() => {
    const randomExcuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];
    setExcuse(randomExcuse);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor (Abstract shapes) */}
      <div className="absolute top-10 left-10 text-gray-200 animate-bounce delay-700">
        <BookOpen className="w-24 h-24" />
      </div>
      <div className="absolute bottom-20 right-20 text-gray-200 animate-pulse">
        <Coffee className="w-32 h-32" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        
        {/* Animated Icon Container */}
        <div className="mb-8 relative inline-block group">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-dashed border-gray-300 relative transform transition-transform group-hover:scale-110 group-hover:-rotate-6">
                <Ghost className="w-20 h-20 text-blue-600 mx-auto" />
                
                {/* A tiny floating question mark */}
                <div className="absolute -top-2 -right-2 bg-orange-100 text-orange-600 p-2 rounded-full border border-orange-200 animate-bounce">
                    <HelpCircle className="w-6 h-6" />
                </div>
            </div>
        </div>

        {/* The Big 404 */}
        <h1 className="text-8xl font-black text-gray-900 tracking-tighter mb-2">
          4<span className="text-blue-600 inline-block animate-pulse">0</span>4
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Lost on Campus?
        </h2>

        {/* The Random Excuse */}
        <div className="min-h-[3rem] flex items-center justify-center">
            {excuse ? (
                <p className="text-lg text-gray-600 font-medium italic animate-in fade-in slide-in-from-bottom-2">
                    "{excuse}"
                </p>
            ) : (
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            )}
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
                href="/main"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Safety
            </Link>
        </div>

      </div>

      {/* Footer text */}
      <p className="absolute bottom-8 text-xs text-gray-400 font-medium uppercase tracking-widest">
        UniEvents System Error
      </p>
    </div>
  );
}