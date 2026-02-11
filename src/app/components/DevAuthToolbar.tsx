"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Shield, Users, LogOut, UniversityIcon } from "lucide-react";

export default function DevAuthToolbar() {
  const { user, loginAsClub, loginAsUnverified, loginAsAdmin, logout_mock } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-2 bg-white/90 backdrop-blur border border-gray-200 shadow-xl rounded-xl text-xs">
      <div className="px-2 py-1 border-b border-gray-100 mb-1">
        <span className="text-gray-400 font-bold uppercase tracking-wider">Dev Mode</span>
        <div className="font-semibold text-gray-800">
          {user ? `Logged in as: ${user.role}` : "Guest Mode"}
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={loginAsClub}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
            user?.role === 'club' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-3 h-3" /> Club
        </button>

        <button 
          onClick={loginAsAdmin}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
            user?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-3 h-3" /> Admin
        </button>
        <button 
          onClick={loginAsAdmin}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
            user?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <UniversityIcon className="w-3 h-3" /> Unverified
        </button>

        {user && (
          <button 
            onClick={logout_mock}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-all"
            title="Logout"
          >
            <LogOut className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}