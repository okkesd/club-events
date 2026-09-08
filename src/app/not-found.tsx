"use client";
import {useUI} from "@/i18n/useUI";


import React, { useState, useEffect, useRef, MouseEvent } from "react";
import Link from 'next/link';
import { Ghost, HelpCircle, ArrowLeft, BookOpen, Coffee, Compass, MapPin, Moon, Star, Rocket } from 'lucide-react';

// A collection of humorous "university-themed" excuses
const EXCUSES = [
  "This page is emptier than an 8 AM lecture on a Monday.",
  "The link you clicked has graduated and moved on.",
  "We searched the entire library, but this page is overdue.",
  "This club is so exclusive, even the server can't find it.",
  "It looks like this page is currently on a gap year.",
  "404: GPA not found... just kidding (we hope).",
  "The dog ate your digital homework.",
  "This page is currently stuck in the cafeteria line.",
  "The dog ate the server cables.",
  "A quantum fluctuation shifted this page into another dimension.",
  "Our hamster wheel generator needs a coffee break.",
  "Looks like you took a wrong turn at the physics lab.",
  "This page is currently attending a lecture.",
]

// --- 1. SHARED CONTENT COMPONENT ---
function NotFoundContent() {
  const {t} = useUI();
  const [excuse, setExcuse] = useState("");

  useEffect(() => {
      setExcuse(EXCUSES[Math.floor(Math.random() * EXCUSES.length)]);
  }, []);

  return (
    <div className="max-w-md w-full text-center relative z-20 pointer-events-auto px-4">
        {/* Animated Icon Container */}
        <div className="mb-8 relative inline-block group">
            <div className="absolute inset-0 bg-blue-200 dark:bg-blue-900/50 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700 relative transform transition-all group-hover:scale-110 group-hover:-rotate-6">
                <Ghost className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto transition-colors" />
                <div className="absolute -top-2 -right-2 p-2 rounded-full border animate-bounce transition-colors bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800">
                    <HelpCircle className="w-6 h-6" />
                </div>
            </div>
        </div>

        {/* The Big 404 */}
        <h1 className="text-8xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 transition-colors select-none">
          4<span className="text-blue-600 dark:text-blue-500 inline-block animate-pulse">0</span>4
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors select-none">
          {t("Lost on Campus?")}</h2>

        {/* The Random Excuse */}
        <div className="min-h-[3rem] flex items-center justify-center select-none">
            {excuse ? (
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium italic animate-in fade-in slide-in-from-bottom-2 transition-colors">
                    "{t(excuse)}"
                </p>
            ) : (
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            )}
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
                href="/main"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
                <ArrowLeft className="w-5 h-5" />
                {t("Back to Safety")}</Link>
        </div>
      </div>
  );
}

// --- 2. VARIANT: FLASHLIGHT EFFECT ---
function FlashlightVariant() {
  const {t} = useUI();
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
          x: `${e.clientX - rect.left}px`,
          y: `${e.clientY - rect.top}px`
      });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors cursor-none"
    >
      {/* Background hidden items */}
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-30 pointer-events-none">
         <BookOpen className="absolute top-[10%] left-[10%] w-32 h-32 text-gray-400 dark:text-gray-600 rotate-12" />
         <Coffee className="absolute bottom-[15%] right-[15%] w-40 h-40 text-gray-400 dark:text-gray-600 -rotate-12" />
         <MapPin className="absolute top-[20%] right-[25%] w-24 h-24 text-gray-400 dark:text-gray-600 animate-spin-slow" style={{animationDuration: '20s'}} />
      </div>

      <NotFoundContent />

      {/* Flashlight Overlay */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none transition-colors duration-300"
        style={{
            background: `radial-gradient(circle 250px at ${mousePos.x} ${mousePos.y}, transparent 10%, rgba(249, 250, 251, 0.95) 100%)`, 
        }}
      >
         <div 
            className="absolute inset-0 hidden dark:block transition-colors duration-300"
             style={{
                background: `radial-gradient(circle 250px at ${mousePos.x} ${mousePos.y}, transparent 5%, rgba(3, 7, 18, 0.98) 100%)`, 
            }}
         ></div>
      </div>
      
      {/* Cursor Follower */}
      <div 
         className="absolute z-40 w-4 h-4 bg-blue-500/50 rounded-full border-2 border-white dark:border-gray-800 pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
         style={{ left: mousePos.x, top: mousePos.y }}
      ></div>

       <p className="absolute bottom-8 text-xs text-gray-500 dark:text-gray-500 font-medium uppercase tracking-widest z-40">
        {t("Flashlight Mode: Moving mouse reveals path")}</p>
    </div>
  );
}


// --- 3. VARIANT: FLOATING ZERO-G (UPDATED) ---
function ZeroGVariant() {
  const {t} = useUI();

  const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            // Calculate distance from center of screen normalized between -1 and 1
            const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
            const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
            setOffset({ x: normalizedX, y: normalizedY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Helper for parallax styles
    const parallax = (multiplier: number) => ({
        transform: `translate(${offset.x * multiplier}px, ${offset.y * multiplier}px) rotate(${offset.x * multiplier * 0.5}deg)`,
        transition: 'transform 0.1s ease-out'
    });

    // 2. Define random floating objects
    // We render these on the client only to avoid hydration mismatch with random values
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors perspective-1000">
            
            {/* Custom Keyframes for independent floating */}
            <style jsx>{`
                @keyframes float-slow {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(60px, -100px) rotate(10deg); }
                    66% { transform: translate(-40px, 30px) rotate(-5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes float-medium {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-80px, -40px) rotate(-15deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
            `}</style>

            {/* --- INDEPENDENT FLOATING DEBRIS (Automatic) --- */}
            {mounted && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Rocket */}
                    <div 
                        className="absolute top-1/4 left-10 text-gray-300 dark:text-gray-800"
                        style={{ animation: 'float-slow 25s infinite ease-in-out' }}
                    >
                        <Rocket className="w-16 h-16 opacity-50" />
                    </div>

                    {/* Star Cluster 1 */}
                    <div 
                        className="absolute top-10 right-20 text-yellow-400/30 dark:text-yellow-600/20"
                        style={{ animation: 'float-medium 18s infinite ease-in-out', animationDelay: '2s' }}
                    >
                        <Star className="w-8 h-8 fill-current" />
                    </div>

                    {/* Coffee Cup */}
                    <div 
                        className="absolute bottom-1/4 right-10 text-gray-300 dark:text-gray-800"
                        style={{ animation: 'float-slow 30s infinite ease-in-out', animationDelay: '5s' }}
                    >
                        <Coffee className="w-20 h-20 opacity-40 -rotate-12" />
                    </div>

                    {/* Moon */}
                    <div 
                        className="absolute top-1/3 left-1/4 text-blue-200 dark:text-blue-900/40"
                        style={{ animation: 'float-medium 40s infinite ease-in-out', animationDelay: '1s' }}
                    >
                        <Moon className="w-12 h-12" />
                    </div>

                    {/* Book */}
                    <div 
                         className="absolute bottom-10 left-1/3 text-gray-300 dark:text-gray-800"
                         style={{ animation: 'float-medium 22s infinite ease-in-out', animationDelay: '8s' }}
                    >
                        <BookOpen className="w-24 h-24 opacity-30" />
                    </div>
                </div>
            )}

            {/* --- MOUSE PARALLAX LAYER (Interactive) --- */}
            <div className="absolute inset-0 pointer-events-none">
                 <div style={parallax(-40)} className="absolute top-[15%] left-[60%] opacity-20 dark:opacity-10 transition-colors">
                    <div className="w-4 h-4 bg-blue-400 rounded-full blur-[2px]"></div>
                </div>
                <div style={parallax(-80)} className="absolute bottom-[10%] left-[10%] opacity-10 dark:opacity-5 transition-colors">
                   <span className="text-9xl font-black text-gray-200 dark:text-gray-900 select-none">?</span>
                </div>
            </div>
            
            {/* Main Content (Middle layer) - Moves slightly with mouse */}
            <div style={parallax(20)} className="relative z-10">
                 <NotFoundContent />
            </div>

            <p className="absolute bottom-8 text-xs text-gray-400 dark:text-gray-600 font-medium uppercase tracking-widest transition-colors z-20">
                {t("Zero-G Mode: Gravity loss detected")}</p>
        </div>
    );
}

// --- 4. MAIN CONTROLLER ---
export default function NotFound() {
  const [variant, setVariant] = useState<'flashlight' | 'zerog' | null>(null);

  useEffect(() => {
    // Randomly select variant on mount
    const randomChoice = Math.random() > 0.5 ? 'flashlight' : 'zerog';
    setVariant(randomChoice);
  }, []);

  if (!variant) {
      return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors"></div>;
  }

  return (
    <>
      {variant === 'flashlight' ? <FlashlightVariant /> : <ZeroGVariant />}
    </>
  );
}
