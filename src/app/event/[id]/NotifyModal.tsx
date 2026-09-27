"use client";
import {useUI} from "@/i18n/useUI";
// app/event/[id]/NotifyModal.tsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Loader2, CheckCircle, Mail, Square, CheckSquare } from 'lucide-react';
import { createEventReminder } from '@/app/lib/api';

export function NotifyModal({ eventId, isEventInPast }: { eventId: string , isEventInPast: boolean}) {
  const {t} = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Load saved email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('notify_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch { /* Storage is optional. */ }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading' || isEventInPast) return;

    setStatus('loading');
    
    try {
      await createEventReminder(eventId, email);
      try {
        if (rememberMe) localStorage.setItem('notify_email', email.trim());
        else localStorage.removeItem('notify_email');
      } catch { /* A storage failure must not invalidate a saved reminder. */ }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status === 'loading') return;
    setIsOpen(false);
    setStatus('idle');
    if (!rememberMe) setEmail('');
  };

  return (
    <>
      {/* Trigger Button */}
      {!isEventInPast && <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-sm font-semibold transition-colors w-full border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 vibrant:text-campus-ink vibrant:border-campus-border vibrant:hover:bg-campus-soft"
      >
        <Bell className="w-4 h-4 text-gray-500 dark:text-gray-300 vibrant:text-campus-muted" />
        {t("Notify Me")}</button>}

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          
          {/* Main Container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200 transition-colors border border-transparent dark:border-gray-700 vibrant:bg-white vibrant:border-campus-border">
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              disabled={status === 'loading'}
              aria-label={t("Close")}
              className="absolute top-5 right-5 p-2 rounded-full transition-colors text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 vibrant:text-campus-muted vibrant:hover:bg-campus-soft"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success State */}
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 vibrant:bg-campus-soft vibrant:text-campus-accent">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors vibrant:text-campus-ink">{t("Reminder Set!")}</h3>
                <p className="text-gray-600 dark:text-gray-200 mt-2 text-lg transition-colors vibrant:text-campus-ink">
                  {t("We'll email {email} the day before the event.", {email})}</p>
                <button 
                  onClick={handleClose}
                  className="mt-8 w-full py-3 font-bold rounded-xl transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 vibrant:text-campus-ink vibrant:hover:bg-campus-soft vibrant:bg-campus-surface"
                >
                  {t("Close")}</button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="py-2">
                <div className="text-center mb-8">
                  <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-colors bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-campus-soft vibrant:text-campus-accent">
                    <Bell className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors vibrant:text-campus-ink">{t("Get Notified")}</h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 mt-2 transition-colors vibrant:text-campus-ink">
                    {t("Don't miss out! We'll send you a reminder 24 hours before the event starts.")}</p>
                </div>

                <div className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="notify-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 transition-colors vibrant:text-campus-ink">
                      {t("Email Address")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-400 vibrant:text-campus-muted" />
                      </div>
                      <input
                        type="email"
                        id="notify-email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        className="block w-full pl-10 pr-4 py-3 border rounded-xl text-base transition-colors border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-400 bg-white text-gray-900 vibrant:bg-campus-surface vibrant:text-campus-ink vibrant:border-campus-border vibrant:placeholder-campus-muted vibrant:focus:ring-campus-accent vibrant:focus:border-campus-accent"
                      />
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={status === 'loading'}
                      onClick={() => setRememberMe(!rememberMe)}
                      className="flex items-center gap-2 text-sm transition-colors focus:outline-none text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 vibrant:text-campus-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 vibrant:focus-visible:outline-campus-accent"
                    >
                      {rememberMe ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-300 vibrant:text-campus-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 dark:text-gray-400 vibrant:text-campus-muted" />
                      )}
                      <span>{t("Remember my email for next time")}</span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  {status === 'error' && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400 vibrant:text-campus-accent-dark">{t("Something went wrong. Please try again.")}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center items-center py-3.5 font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 vibrant:bg-campus-accent vibrant:hover:bg-campus-accent-dark"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t("Set Reminder")
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
