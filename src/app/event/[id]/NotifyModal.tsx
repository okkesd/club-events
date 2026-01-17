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
        className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full"
      >
        <Bell className="w-4 h-4 text-gray-500" />
        Notify Me
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          
          {/* Main Container - Made Wider (max-w-md) and added more padding (p-8) */}
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Reminder Set!</h3>
                <p className="text-gray-600 mt-2 text-lg">
                  We'll email <span className="font-semibold text-gray-900">{email}</span> the day before the event.
                </p>
                <button 
                  onClick={handleClose}
                  className="mt-8 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="py-2">
                <div className="text-center mb-8">
                  <div className="mx-auto h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Get Notified</h3>
                  <p className="text-base text-gray-600 mt-2">
                    Don't miss out! We'll send you a reminder 24 hours before the event starts.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="notify-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="notify-email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                      />
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                    >
                      {rememberMe ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <span>Remember my email for next time</span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center items-center py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none"
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