"use client";
import {useUI} from "@/i18n/useUI";


import React from 'react';
import { Terminal, Code2, Database, ServerCrash, Lightbulb } from 'lucide-react';
import Image from 'next/image';

// --- CONFIGURATION FOR THE "TEAM" ---
// Replace 'Your Name' with your actual name.
const THE_HUMAN_NAME = "Ökkeş Donbaloğlu";
const YOUR_IMAGE_PATH = "/linkedin_pp.jpeg"; // ✅ REPLACE with your image path (e.g., /me.jpg) in public folder

// Paths to your AI logo assets in the /public folder
// Tip: Use white/light versions of logos for better blending in dark mode
const AI_LOGOS = {
    chatgpt: "/chatgpt-seeklogo.png", // ✅ REPLACE with path to ChatGPT logo
    claude: "/claude-color.png",   // ✅ REPLACE with path to Claude logo
    gemini: "/gemini.png",   // ✅ REPLACE with path to Gemini logo
};

const teamRoles = [
  {
    title: "Chief Product Officer",
    icon: Lightbulb,
    // The joke: The "synergy" comes from asking an AI.
    bio: "Responsible for high-level strategy, defining user synergy, and writing Jira tickets that sound surprisingly robotic.",
    aiPartner: AI_LOGOS.chatgpt,
    humanImage: YOUR_IMAGE_PATH,
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 vibrant:bg-yellow-200/80 vibrant:text-yellow-700"
  },
  {
    title: "Lead Frontend Engineer",
    icon: Code2,
    // The joke: Frontend is just copy-pasting until it works.
    bio: "Crafting pixel-perfect, responsive UIs. Specializes in centering divs by asking Claude to try 15 different Flexbox combinations until one sticks.",
    aiPartner: AI_LOGOS.claude,
    humanImage: YOUR_IMAGE_PATH,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 vibrant:bg-blue-200/80 vibrant:text-blue-700"
  },
  {
    title: "Senior Backend Architect",
    icon: Database,
    // The joke: Complex DB stuff is outsourced to the fastest model.
    bio: "Ensuring database integrity and API latency. Once wrote an entire GraphQL schema by typing 'Hey Gemini, make this fast' into a prompt.",
    aiPartner: AI_LOGOS.gemini,
 humanImage: YOUR_IMAGE_PATH,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 vibrant:bg-purple-200/80 vibrant:text-purple-700"
  },
  {
    title: "DevOps & Reliability Lead",
    icon: ServerCrash, // Using the crash icon ironically
    // The joke: DevOps is terrifying, so all AIs help.
    bio: "Maintains 99.99% uptime via a complex CI/CD pipeline that is mostly just ChatGPT scripts held together with digital duct tape and prayer.",
    // For DevOps, we overlay multiple because it's chaos
    aiPartnerMulti: [AI_LOGOS.chatgpt, AI_LOGOS.gemini],
    humanImage: YOUR_IMAGE_PATH,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 vibrant:bg-red-200/80 vibrant:text-red-700"
  },
];

export default function AboutPage() {
  const {t} = useUI();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent transition-colors duration-300 overflow-hidden">

      {/* --- HERO SECTION --- */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract background decor */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 vibrant:opacity-15 pointer-events-none">
            <Terminal className="absolute top-10 left-10 w-32 h-32 text-gray-400 dark:text-gray-600 vibrant:text-purple-400 animate-pulse" style={{animationDuration: '4s'}} />
            <Code2 className="absolute bottom-10 right-10 w-40 h-40 text-gray-300 dark:text-gray-700 vibrant:text-pink-400 animate-bounce" style={{animationDuration: '8s'}}/>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white vibrant:text-purple-900 tracking-tight mb-6 leading-tight">
            {t("Meet the")} <span className="text-blue-600 dark:text-blue-500 vibrant:text-pink-600 relative inline-block">
                {t("\"Team\"")}{/* Snarky underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-600/30 dark:text-blue-500/30 vibrant:text-pink-500/40" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 vibrant:text-purple-700 max-w-3xl mx-auto font-medium leading-relaxed">
            {t("Evenements is brought to you by a massive*, globally distributed** team of highly intelligent*** experts.")}</p>


        </div>
      </div>

      {/* --- THE GRID OF "ROLES" --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {teamRoles.map((role, index) => (
                <div
                    key={index}
                    className="group bg-white dark:bg-gray-900 vibrant:bg-white/70 vibrant:backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 vibrant:border-purple-200 hover:-translate-y-2 relative overflow-hidden vibrant:hover:shadow-purple-200/40 vibrant:hover:border-purple-300"
                >
                    {/* The "Ghost in the Machine" Image Effect */}
                    <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden mb-6 shadow-inner border-2 border-gray-100 dark:border-gray-800 vibrant:border-purple-200 bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-50">

                        {/* 1. The Human Base Image */}
                        {/* Using standard img tag for easier local file handling, next/image works too if configured */}
                        <img
                            src={role.humanImage}
                            alt={THE_HUMAN_NAME}
                            className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                        />

                        {/* 2. The AI Overlay(s) */}
                        <div className="absolute inset-0 mix-blend-hard-light opacity-40 group-hover:opacity-60 transition-opacity duration-500 bg-gradient-to-t from-black/50 to-transparent">
                             {role.aiPartnerMulti ? (
                                 // Multiple AI logos floating around for DevOps chaos
                                 <>
                                    <img src={role.aiPartnerMulti[0]} className="absolute top-2 left-2 w-20 h-20 object-contain animate-pulse opacity-70" style={{animationDuration: '3s'}} />
                                    <img src={role.aiPartnerMulti[1]} className="absolute bottom-2 right-2 w-20 h-20 object-contain animate-pulse opacity-70" style={{animationDuration: '4s'}} />
                                 </>
                             ) : (
                                 // Single AI partner centered
                                <img
                                    src={role.aiPartner}
                                    className="w-full h-full p-4 object-contain opacity-80 animate-pulse" style={{animationDuration: '5s'}}
                                />
                             )}
                        </div>

                        {/* Scanline effect overlay for tech vibe */}
                        <div className="absolute inset-0 bg-[url('/images/scanlines.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                    </div>

                    {/* Role Details */}
                    <div className="text-center relative">
                        <div className={`inline-flex p-3 rounded-2xl mb-4 ${role.color} shadow-sm`}>
                            <role.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white vibrant:text-purple-900 mb-1 tracking-tight">
                            {t(role.title)}
                        </h3>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 vibrant:text-pink-600 mb-4 uppercase tracking-widest">
                            {THE_HUMAN_NAME}
                        </p>

                        <div className="relative">
                            <span className="absolute -top-4 -left-2 text-4xl text-gray-200 dark:text-gray-700 vibrant:text-purple-200 opacity-50">"</span>
                            <p className="text-gray-600 dark:text-gray-300 vibrant:text-purple-700 italic leading-relaxed relative z-10 px-4">
                                {t(role.bio)}
                            </p>
                            <span className="absolute -bottom-4 -right-2 text-4xl text-gray-200 dark:text-gray-700 vibrant:text-purple-200 opacity-50">"</span>
                        </div>
                    </div>
                </div>
            ))}

        </div>

{/* The asterisk explanation */}
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400 vibrant:text-purple-600 space-y-1 font-mono">
            <p>{t("*Massive = One person with too many browser tabs open.")}</p>
            <p>{t("**Distributed = My desk and the cloud servers.")}</p>
            <p>{t("***Intelligent = Artificial intelligence. Mostly.")}</p>
          </div>
        {/* Bottom CTA */}
        <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom-4 delay-300">
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-600 font-medium mb-4">
                {t("In conclusion: We have no idea what we're doing, but we do.")}</p>
            <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 font-bold rounded-2xl bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 vibrant:bg-purple-600 vibrant:text-white vibrant:hover:bg-purple-700 vibrant:shadow-purple-300/40 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                {t("Hire the \"Team\"")}</a>
        </div>
      </div>
    </div>
  );
}
