"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- TYPES ---
export type UserRole = "club" | "admin" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string; // Optional helper for UI
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // Helper functions to instantly switch roles for testing
  loginAsClub: () => void;
  loginAsAdmin: () => void;
  loginAsUnverified: () => void
  logout: () => void;
}

// --- MOCK DATA ---
// These match your seed_db.py IDs so the app works seamlessly
const MOCK_CLUB_USER: User = {
  id: "club-1",
  name: "Tech & Coding Society",
  email: "tech@university.edu",
  role: "club",
  isVerified: true,
  avatarUrl: "https://ui-avatars.com/api/?name=Tech+Club&background=0D8ABC&color=fff"
};

const MOCK_UNVERIFIED_CLUB: User = { // ✅ NEW TEST USER
  id: "club-3",
  name: "Chess Club (Pending)",
  email: "chess@university.edu",
  role: "club",
  isVerified: false, // ❌ Unverified
  avatarUrl: "https://ui-avatars.com/api/?name=Chess&background=777&color=fff"
};

const MOCK_ADMIN_USER: User = {
  id: "admin-1",
  name: "System Administrator",
  email: "admin@university.edu",
  role: "admin",
  isVerified: true,
  avatarUrl: "https://ui-avatars.com/api/?name=Admin&background=333&color=fff"
};

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load from localStorage on mount (Persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem("mock_auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // 2. Helper to save state
  const setAndPersistUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("mock_auth_user");
    }
  };

  // 3. Mock Actions
  const loginAsClub = () => {
    console.log("🔓 Mock Login: Club Mode");
    setAndPersistUser(MOCK_CLUB_USER);
  };

  const loginAsAdmin = () => {
    console.log("🛡️ Mock Login: Admin Mode");
    setAndPersistUser(MOCK_ADMIN_USER);
  };

  const loginAsUnverified = () => {
    console.log("🔓 Mock Login: Unverified Club");
    setAndPersistUser(MOCK_UNVERIFIED_CLUB);
  };

  const logout = () => {
    console.log("🔒 Logout");
    setAndPersistUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAsClub, loginAsAdmin, loginAsUnverified, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- CUSTOM HOOK ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}