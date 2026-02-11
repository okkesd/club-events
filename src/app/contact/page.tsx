// app/contact/page.tsx
"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contactApi } from '../lib/api';

/**
 * Mock API to simulate sending a message to the backend.
 */

export default function ContactPage() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth()

  useEffect( () => {
    if (user){
      setEmail(user.email)
    }
  })

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    // 1. Validation Logic
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!message.trim()) {
      setError("Message cannot be empty.");
      setIsLoading(false);
      return;
    }

    if (message.trim().length < 10) {
      setError("Please provide a bit more detail (at least 10 characters).");
      setIsLoading(false);
      return;
    }

    // 2. API Call with Try/Catch/Finally
    try {
      await contactApi(email, message);
      setIsSent(true); 
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
        
        {/* Header */}
        {!isSent && (
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 transition-colors">
               <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
              Contact Support
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
              Have a question or feature request? Let us know!
            </p>
          </div>
        )}

        {/* Success State */}
        {isSent ? (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 transition-colors">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Message Sent!</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors">
              Thank you for reaching out. We'll get back to you at <span className="font-medium text-gray-900 dark:text-gray-200">{email}</span> shortly.
            </p>
            <button
              onClick={() => { setIsSent(false); setMessage(''); setEmail(''); setError(null); }}
              className="mt-6 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm cursor-pointer underline transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          /* Form State */
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Your Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  required 
                  className="block w-full pl-10 pr-3 py-3 border rounded-lg sm:text-sm transition-colors
                             border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Message
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 border rounded-lg sm:text-sm transition-colors resize-none
                             border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-400"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg p-3 text-sm border animate-in fade-in slide-in-from-top-1
                              bg-red-50 text-red-700 border-red-100
                              dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50 transition-colors">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white 
                         bg-blue-600 hover:bg-blue-700 
                         dark:bg-blue-600 dark:hover:bg-blue-500
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
                         disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}