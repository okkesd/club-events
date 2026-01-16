// app/contact/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Mock API to simulate sending a message to the backend.
 */
const mockContactApi = (email: string, message: string): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    console.log(`[Mock API] Contact Form Submitted:\nEmail: ${email}\nMessage: ${message}`);
    setTimeout(() => {
      resolve({ success: true });
    }, 1500); // 1.5s delay
  });
};

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Validation Logic
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    if (message.trim().length < 10) {
      setError("Please provide a bit more detail (at least 10 characters).");
      return;
    }
    

    // 2. API Call with Try/Catch/Finally
    try {
      setIsLoading(true);
      
      await mockContactApi(email, message);
      
      // Only runs if API succeeds
      setIsSent(true); 
      
    } catch (err) {
      // Runs if API fails (rejects)
      console.error("API Error:", err);
      // Extract error message if available, or fall back to generic
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMessage);
      
    } finally {
      // Runs ALWAYS (success or failure) to unlock the UI
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
             <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Contact Support
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Have a question or feature request? Let us know!
          </p>
        </div>

        {/* Success State */}
        {isSent ? (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Message Sent!</h3>
            <p className="text-gray-600 mt-2">
              Thank you for reaching out. We'll get back to you at <span className="font-medium text-gray-800">{email}</span> shortly.
            </p>
            <button
              onClick={() => { setIsSent(false); setMessage(''); setEmail(''); setError(null); }}
              className="mt-6 text-blue-600 hover:text-blue-500 font-medium text-sm cursor-pointer underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          /* Form State */
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors resize-none"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
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