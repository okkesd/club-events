"use client";
import {useUI} from "@/i18n/useUI";
// app/login/page.tsx
import React, { useState, useRef, FormEvent } from 'react';
import { LogIn, Loader2, AlertCircle, AtSign, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';


export default function LoginPage() {
  const {t, errorText} = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading: isAuthLoading } = useAuth(); // Get login function
  
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const isLoading = isAuthLoading || isSubmitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current || isAuthLoading) return;
    submitting.current = true;
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      // No need to router.push here, the Context handles it
    } catch (err) {
      // Display the error message from the API
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 vibrant:bg-transparent py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 vibrant:bg-white/80 vibrant:backdrop-blur-sm p-8 rounded-2xl shadow-xl space-y-8 border border-gray-100 dark:border-gray-700 vibrant:border-purple-200 transition-colors">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 vibrant:bg-purple-100 rounded-full flex items-center justify-center mb-4 transition-colors">
             <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400 vibrant:text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">
            {t("Welcome Back")}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
            {t("Sign in to manage your club events")}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 mb-1 transition-colors">
                {t("Email Address")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border rounded-lg transition-colors sm:text-sm
                             border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400
                             vibrant:bg-white/80 vibrant:border-purple-200 vibrant:text-purple-900 vibrant:placeholder-purple-400 vibrant:focus:ring-purple-500 vibrant:focus:border-purple-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 transition-colors">
                  {t("Password")}</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border rounded-lg transition-colors sm:text-sm
                             border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400
                             vibrant:bg-white/80 vibrant:border-purple-200 vibrant:text-purple-900 vibrant:placeholder-purple-400 vibrant:focus:ring-purple-500 vibrant:focus:border-purple-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg p-4 text-sm border animate-in fade-in slide-in-from-top-1
                            bg-red-50 text-red-700 border-red-100
                            dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50
                            vibrant:bg-red-50 vibrant:text-red-700 vibrant:border-red-200 transition-colors">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorText(error)}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white
                       bg-blue-600 hover:bg-blue-700
                       dark:bg-blue-600 dark:hover:bg-blue-500
                       vibrant:bg-purple-600 vibrant:hover:bg-purple-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 vibrant:focus:ring-purple-500
                       disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("Signing in...")}</>
            ) : (
              <>
                {t("Sign in")}<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer with Sign Up Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
            {t("Need to register a club?")}{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 vibrant:text-pink-600 vibrant:hover:text-pink-500 transition-colors">
              {t("Create new club")}</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
