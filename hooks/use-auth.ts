import { AuthContext } from "@/context/auth-context";
import { useContext } from "react";

// --- Custom hook -------------------------------------------------------------
// Use this hook as the single entry point for auth context consumption.
// It returns values such as user, setUser, isLoggedIn, and isHydrating.
// throws if the hook is used outside AuthProvider so misuse fails fast.

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }

  return context;
}
