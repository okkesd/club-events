"use client"; // This page must be a Client Component to use hooks

import React, { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, AtSign, Shield, Building, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const router = useRouter();
  console.log(user)
  // This effect handles redirection
  useEffect(() => {
    // Wait until the auth state is no longer loading
    if (!isLoading) {
      // If auth is checked and user is not logged in, redirect
      if (!isLoggedIn) {
        router.push('/login');
      }
    }
  }, [isLoggedIn, isLoading, router]);

  // Show a full-page loader while auth is initializing
  // This prevents a "flash" of the profile page before redirection
  if (isLoading || !isLoggedIn || !user) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // At this point, we know the user is logged in
  return (
    <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 rounded-full">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.username}
              </h1>
              <p className="text-blue-100 text-lg">
                Profile & Settings
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Account Details
          </h2>
          
          {/* Info Row: Email */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <AtSign className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email</span>
              <p className="text-base font-semibold text-gray-900">
                {user.email}
              </p>
            </div>
          </div>

          {/* Info Row: Club */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <Building className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Club</span> <br />
              
              {/* --- START OF CHANGE --- */}
              {/* We conditionally render a link IF the user has a clubSlug */}
              {user.clubSlug ? (
                <Link 
                  href={`/club/${user.clubSlug}`}
                  className="text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {user.clubName}
                </Link>
              ) : (
                <p className="text-base font-semibold text-gray-900">
                  {user.clubName}
                </p>
              )}
            </div>
          </div>

          {/* Info Row: Role */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-full">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Role</span>
              <p className="text-base font-semibold text-gray-900 capitalize">
                {/* Replace underscore with space */}
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6" />

          {/* Actions */}
          <div>
            <button
              onClick={() => logout()}
              className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}