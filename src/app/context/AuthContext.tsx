"use client"; // Context providers are client components

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '@/app/lib/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// --- Mock API Functions (to be replaced later) ---

/** Mocks a login API call */
const mockLoginApi = (email: string, password: string): Promise<{ user: IUser }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "club@unievents.com" && password === "password123") {
        resolve({ 
          user: { id: 'user-1', username: "okkes donbaloglu", email: 'club@unievents.com', clubName: 'Coding Club', clubSlug: 'coding-club', role: 'club_member' } 
        });
      } else if (email === "admin@unievents.com" && password === "admin123") {
        resolve({
          user: { id: 'admin-1', username: "admin okkes", email: 'admin@unievents.com', clubName: 'University Admin', clubSlug: null, role: 'admin' }
        });
      } else {
        reject(new Error("Invalid email or password."));
      }
    }, 1000);
  });
};

/** Mocks checking for an existing session (e.g., via a cookie) */
const mockCheckSessionApi = (): Promise<{ user: IUser }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Set to reject() to simulate "not logged in"
      // Set to resolve(...) to simulate "session found"
      reject(new Error("No active session."));
    }, 1500);
  });
};

/** Mocks a logout API call */
const mockLogoutApi = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

// --- End Mock API ---


// 1. Define the shape of your context
interface IAuthContext {
  user: IUser | null;
  isLoggedIn: boolean;
  isLoading: boolean; // For session checking
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Create the context
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// 3. Create the Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true for session check
  const router = useRouter();

  // --- Session Re-hydration Effect ---
  // This runs ONCE when the app loads
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Try to get user from session cookie
        const { user } = await mockCheckSessionApi();
        setUser(user);
      } catch (error) {
        // No session found, user is not logged in
        setUser(null);
      } finally {
        // We're done checking
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []); // Empty array means run once on mount

  // --- Login Function ---
  const login = async (email: string, password: string) => {
    try {

        // This will throw an error on failure, which the login page will catch
        const { user } = await mockLoginApi(email, password);
        setUser(user);
        // Redirect to main page on successful login
        router.push('/main');
    } catch (error) {
        console.log("an error occured in authcontexrt")
        throw error;
    }
    
  };

  // --- Logout Function ---
  const logout = async () => {
    await mockLogoutApi();
    setUser(null);
    // Redirect to login page on logout
    router.push('/login');
  };

  // Show a full-page loader while we check the session
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Provide the context value to children
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, // True if user is not null
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Create a custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}