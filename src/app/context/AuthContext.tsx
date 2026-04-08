"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, loginUser, signUpUser } from "@/app/lib/api";
import { SignUpData } from "../lib/types";

// --- TYPES ---
export type UserRole = "club" | "admin" | "guest";

export interface User {
  id: string;
  club_name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; // Real Login
  logout: () => void;
  signUp: (signUp: SignUpData) => Promise<void>
  // Keep these for DevToolbar if you want, or remove them
  /*loginAsClub: () => void;
  loginAsAdmin: () => void;
  loginAsUnverified: () => void;
  logout_mock: () => void;*/
}

/*
// --- MOCK DATA ---
// These match your seed_db.py IDs so the app works seamlessly
const MOCK_CLUB_USER: User = {
  id: "club-1",
  clubName: "Tech & Coding Society",
  email: "tech@university.edu",
  role: "club",
  isVerified: true,
  avatarUrl: "https://ui-avatars.com/api/?name=Tech+Club&background=0D8ABC&color=fff"
};

const MOCK_UNVERIFIED_CLUB: User = { // ✅ NEW TEST USER
  id: "club-3",
  clubName: "Chess Club (Pending)",
  email: "chess@university.edu",
  role: "club",
  isVerified: false, // ❌ Unverified
  avatarUrl: "https://ui-avatars.com/api/?name=Chess&background=777&color=fff"
};

const MOCK_ADMIN_USER: User = {
  id: "admin-1",
  clubName: "System Administrator",
  email: "admin@university.edu",
  role: "admin",
  isVerified: true,
  avatarUrl: "https://ui-avatars.com/api/?name=Admin&background=333&color=fff"
};*/

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Load from localStorage on mount (Persistence)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userData = await getCurrentUser();
          
          if (userData) {

            setUser(userData);
          } else {

            localStorage.removeItem("access_token")
            setUser(null)
          }
        } catch (error) {

          console.error("Token invalid or expired", error);
          localStorage.removeItem("access_token");
          setUser(null);
        } finally {

          setIsLoading(false);
        }
      } 
      
    };

    initAuth();
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Step A: Get Token
      const data = await loginUser(email, password);
      localStorage.setItem("access_token", data.access_token);

      // Step B: Get User Details using that token
      const userData = await getCurrentUser();
      setUser(userData);
      
      router.push("/main"); // Redirect after success
    } catch (error: any) {
      throw error; // Throw to UI to show error message
    } finally {
      setIsLoading(false);
    }
  };
  // 3. LOGOUT
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/main");
  };

  // 2. Helper to save state
  /*const setAndPersistUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("mock_auth_user");
    }
  };*/

  const signUp = async (signUpData: SignUpData) => {
    const {email, password, ...rest} = signUpData

    const res = await signUpUser(signUpData)
    console.log(res)
    if (!res.success){
      throw new Error("Failed to sign up user")
    } else {
      console.log("done, logging in")
      await login(email, password)
      console.log("done, logged in")
    }
  }

  /*// 3. Mock Actions
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

  const logout_mock = () => {
    console.log("🔒 Logout");
    setAndPersistUser(null);
  };*/

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signUp}}>
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