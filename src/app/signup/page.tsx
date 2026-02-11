// app/signup/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, AlertCircle, Mail, Lock, Building2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { SignUpData } from '../lib/types';


export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth()
  
  // Form State
  const [clubName, setClubName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    // 2. API Call
    setIsLoading(true);
    const data: SignUpData = {clubName, email, password}
    const response = await signUp(data);
    console.log(response)
    setIsLoading(false);

    // 3. Handle Response -> handled in login
    /*if (response.success) {
      // Redirect to profile (passing name as query param for demo purposes)
      router.push(`/profile?club=${encodeURIComponent(clubName)}`);
    } else {
      setError(response.message);
    }*/
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300">
      
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100 dark:border-gray-700 transition-colors">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 transition-colors">
             <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
            Register Club
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
            Create an account for your university club
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            
            {/* Club Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Club Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 rounded-lg transition-colors sm:text-sm
                             border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  placeholder="e.g. Chess Society"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Official Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 rounded-lg transition-colors sm:text-sm
                             border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500
                             dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  placeholder="club@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 rounded-lg transition-colors sm:text-sm
                               border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500
                               dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Confirm</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                    type="password"
                    required
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg transition-colors sm:text-sm
                        dark:bg-gray-900 dark:text-white dark:placeholder-gray-400
                        ${confirmPassword && password !== confirmPassword 
                            ? 'border-red-300 focus:ring-red-500 dark:border-red-900/50 dark:focus:ring-red-400' 
                            : 'border-gray-300 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-400'
                        }`}
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start mt-4">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  I agree to the{' '}
                  <button 
                    type="button" 
                    onClick={() => setIsTermsOpen(true)}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer transition-colors"
                  >
                    Terms of Service
                  </button>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg p-3 text-sm border animate-in fade-in
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white 
                           bg-blue-600 hover:bg-blue-700 
                           dark:bg-blue-600 dark:hover:bg-blue-500
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800
                           disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                </>
                ) : (
                'Register Club'
                )}
            </button>
        </form>
      </div>

      {/* --- TERMS OF SERVICE MODAL --- */}
{isTermsOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    {/* Modal Container */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col border border-gray-100 dark:border-gray-700 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h3>
        <button 
          onClick={() => setIsTermsOpen(false)} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-600 dark:text-gray-300 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        
        <p className="italic text-gray-500 dark:text-gray-400">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">1. Student Project Disclaimer</h4>
          <p>
            UniEvents is a student-run project provided "as is". We are not officially affiliated with the university administration. 
            We are not responsible for data loss, service interruptions, or the accuracy of event information.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">2. User Conduct</h4>
          <p>By using this platform, you agree not to:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Post unlawful, harmful, or abusive content.</li>
            <li>Impersonate any person or club.</li>
            <li>Spam the calendar with fake events.</li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">3. Content Ownership</h4>
          <p>
            Clubs retain rights to their images and text. However, by uploading, you grant UniEvents a license to display this content on the platform.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">4. Termination</h4>
          <p>
            Admins reserve the right to suspend or ban accounts that violate these terms without prior notice.
          </p>
        </section>
      </div>
      
      {/* Footer / Actions */}
      <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end gap-3 transition-colors">
        <button 
          onClick={() => setIsTermsOpen(false)}
          className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            setAgreedToTerms(true);
            setIsTermsOpen(false);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
        >
          I Agree
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}