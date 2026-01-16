// app/signup/page.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, AlertCircle, Mail, Lock, Building2, Check, X } from 'lucide-react';
import Link from 'next/link';

// --- Mock API for Signup ---
const mockSignupApi = (clubName: string, email: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate "Club name taken" check
      if (clubName.toLowerCase() === "robotics club") {
        resolve({ success: false, message: "This club name is already registered." });
      } else {
        resolve({ success: true, message: "Account created! Redirecting..." });
      }
    }, 1500);
  });
};

export default function SignupPage() {
  const router = useRouter();
  
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
    const response = await mockSignupApi(clubName, email);
    setIsLoading(false);

    // 3. Handle Response
    if (response.success) {
      // Redirect to profile (passing name as query param for demo purposes)
      router.push(`/profile?club=${encodeURIComponent(clubName)}`);
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
             <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Register Club
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create an account for your university club
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            
            {/* Club Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Chess Society"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="club@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="password"
                    required
                    className="block w-full text-gray-700 pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="password"
                    required
                    className={`block w-full text-gray-700 pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:border-blue-500 sm:text-sm ${
                        confirmPassword && password !== confirmPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
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
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the{' '}
                  <button 
                    type="button" 
                    onClick={() => setIsTermsOpen(true)}
                    className="text-blue-600 hover:text-blue-500 underline cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 animate-in fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Terms of Service</h3>
              <button onClick={() => setIsTermsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600">
              <p><strong>1. Responsibility:</strong> As a club representative, you are responsible for the accuracy of all event details posted.</p>
              <p><strong>2. Conduct:</strong> Events must adhere to university guidelines regarding safety, inclusivity, and conduct.</p>
              <p><strong>3. Verification:</strong> All new club accounts are subject to administrative approval before posting privileges are granted.</p>
              <p><strong>4. Spam:</strong> Creating fake events or spamming the calendar will result in immediate account suspension.</p>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => {
                  setAgreedToTerms(true);
                  setIsTermsOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}