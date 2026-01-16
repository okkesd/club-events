// app/event/[id]/NotifyModal.tsx
"use client";

import React, { useState } from 'react';
import { Bell, X, Loader2, CheckCircle, Mail } from 'lucide-react';

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    await mockSubscribeApi(email, eventId);
    setStatus('success');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after transition finishes
    setTimeout(() => {
      setStatus('idle');
      setEmail('');
    }, 300);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full cursor-pointer"
      >
        <Bell className="w-4 h-4 text-gray-500" />
        Notify Me
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {status === 'success' ? (
              <div className="text-center py-4">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Reminder Set!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  We'll email <strong>{email}</strong> the day before the event.
                </p>
                <button 
                  onClick={handleClose}
                  className="mt-6 w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit}>
                <div className="text-center mb-6">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Get Notified</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive a reminder email 24 hours before the event starts.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="notify-email" className="sr-only">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="notify-email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        className="block w-full pl-10 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center items-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-70 cursor-pointer"
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