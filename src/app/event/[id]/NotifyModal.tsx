// app/event/[id]/NotifyModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X, Loader2, CheckCircle, Mail, Square, CheckSquare } from 'lucide-react';

const mockSubscribeApi = (email: string, eventId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Subscribed ${email} to event ${eventId}`);
      resolve(true);
    }, 1200);
  });
};

export function NotifyModal({ eventId }: { eventId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('notify_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Handle Local Storage
    if (rememberMe) {
      localStorage.setItem('notify_email', email);
    } else {
      localStorage.removeItem('notify_email');
    }

    await mockSubscribeApi(email, eventId);
    setStatus('success');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after transition finishes (UI polish)
    setTimeout(() => {
      setStatus('idle');
      // If we didn't remember the email, clear the input for next time
      if (!rememberMe) {
        setEmail('');
      }
    }, 300);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-semibold transition-colors w-full border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        Notify Me
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          
          {/* Main Container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200 transition-colors border border-transparent dark:border-gray-700">
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full transition-colors text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Reminder Set!</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg transition-colors">
                  We'll email <span className="font-semibold text-gray-900 dark:text-white">{email}</span> the day before the event.
                </p>
                <button 
                  onClick={handleClose}
                  className="mt-8 w-full py-3 font-bold rounded-xl transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="py-2">
                <div className="text-center mb-8">
                  <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-colors bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Bell className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Get Notified</h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-2 transition-colors">
                    Don't miss out! We'll send you a reminder 24 hours before the event starts.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="notify-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="email"
                        id="notify-email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        className="block w-full pl-10 pr-4 py-3 border rounded-xl text-base transition-colors border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-sm transition-colors focus:outline-none text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {rememberMe ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      )}
                      <span>Remember my email for next time</span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center items-center py-3.5 font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Set Reminder'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}