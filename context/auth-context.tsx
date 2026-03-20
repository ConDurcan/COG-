import { UserAccount } from "@/types/user";
import React, { createContext, useState } from "react";

// --- Shape of the context ---------------------------------------------------
// This describes everything any component in the app can read or call
// relating to the logged-in user.

interface AuthContextValue {
  user: UserAccount | null; // null = no one is logged in
  setUser: (user: UserAccount | null) => void;
  isLoggedIn: boolean; // convenience flag derived from user
}

// --- Create the context ------------------------------------------------------
// We start with `undefined` so TypeScript forces every consumer to be inside
// the provider (see the safety check in useAuthContext below).

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Provider ----------------------------------------------------------------
// Wrap your app (or a section of it) in this component to give all child
// components access to the auth state.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);

  const value: AuthContextValue = {
    user,
    setUser,
    isLoggedIn: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Raw context export -------------------------------------------------------
// Exported so the custom hook in hooks/use-auth.ts can consume it.

export { AuthContext };

