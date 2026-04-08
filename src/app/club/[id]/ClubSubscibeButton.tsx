"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, X, Mail, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { subscribeToClub } from "@/app/lib/api";

interface ClubSubscribeButtonProps {
  clubId: string;
  clubName: string;
}

export default function ClubSubscribeButton({ clubId, clubName }: ClubSubscribeButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Pre-fill email when modal opens if user is logged in, but allow editing
  useEffect(() => {
    if (isOpen) {
      if (user?.email && !email) {
        setEmail(user.email);
      }
      setStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await subscribeToClub(clubId, email);
      setStatus("success");
      // Optional: Auto-close after 2 seconds
      // setTimeout(() => setIsOpen(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to subscribe. Please try again.");
      setStatus("error");
    }
  };

  return (
    <>
      {/* 1. The Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95
                   bg-blue-100 text-blue-700 hover:bg-blue-200 
                   dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50
                   vibrant:bg-purple-100 vibrant:text-purple-700 vibrant:hover:bg-purple-200"
      >
        <Bell className="w-4 h-4" />
        Follow Updates
      </button>

      {/* 2. The Modal — portalled to body to escape vibrant theme's backdrop-blur stacking context */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 vibrant:bg-white/95 vibrant:backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 vibrant:border-purple-200 animate-in zoom-in-95 duration-200 relative transition-colors">

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:text-purple-600 vibrant:hover:bg-purple-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-2 transition-colors">
              Follow {clubName}
            </h3>

            {status === "success" ? (
              <div className="py-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 vibrant:bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 vibrant:text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white vibrant:text-purple-900 mb-2">You're Subscribed!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 vibrant:text-purple-600">
                  We'll email <span className="font-semibold text-gray-900 dark:text-gray-200 vibrant:text-purple-900">{email}</span> the moment they post new events or announcements.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 vibrant:bg-purple-100 vibrant:hover:bg-purple-200 text-gray-800 dark:text-gray-200 vibrant:text-purple-800 font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 vibrant:text-purple-700 leading-relaxed transition-colors">
                  Enter your email to receive instant notifications whenever this club shares something new.
                </p>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 vibrant:text-purple-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all outline-none
                               bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                               dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/20
                               vibrant:bg-white/80 vibrant:border-purple-200 vibrant:text-purple-900 vibrant:focus:border-purple-500 vibrant:focus:ring-purple-500/20"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="club-subscribe-privacy"
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 vibrant:text-purple-600 vibrant:focus:ring-purple-500"
                  />
                  <label htmlFor="club-subscribe-privacy" className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500">
                    I have read and accept the{" "}
                    <Link href="/legal/privacy" className="text-blue-600 dark:text-blue-400 vibrant:text-pink-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600 dark:text-red-400 vibrant:text-pink-600 font-medium animate-in slide-in-from-top-1">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !email || !agreedToPrivacy}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-white transition-all
                             bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:hover:bg-blue-600
                             dark:bg-blue-600 dark:hover:bg-blue-500
                             vibrant:bg-gradient-to-r vibrant:from-purple-600 vibrant:to-pink-600 vibrant:hover:from-purple-700 vibrant:hover:to-pink-700 vibrant:shadow-md vibrant:shadow-purple-500/25"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </form>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  );
}