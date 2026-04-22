import { AuthService } from "@/services/auth-service";
import { UserAccount } from "@/types/user";
import React, { createContext, useEffect, useState } from "react";

// Defined the full auth contract that consuming components can read and update.

interface AuthContextValue {
  user: UserAccount | null; // null = no one is logged in
  setUser: (user: UserAccount | null) => void;
  isLoggedIn: boolean; // convenience flag derived from user
  isHydrating: boolean; // true while restoring an existing session on startup
}

// Initialized with undefined so consuming hooks can enforce provider usage.

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Provider ----------------------------------------------------------------
// Wrap your app (or a section of it) in this component to give all child
// components access to the auth state.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const restored = await AuthService.restoreUser();
        if (isMounted && restored) {
          setUser(restored);
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    setUser,
    isLoggedIn: user !== null,
    isHydrating,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Raw context export -------------------------------------------------------
// Exported so the custom hook in hooks/use-auth.ts can consume it.

export { AuthContext };
