import { AuthContext } from "@/context/auth-context";
import { useContext } from "react";

// useAuth is the single import every screen/component needs.
// Calling it gives back: { user, setUser, isLoggedIn }
//
// The error below fires if you accidentally use this hook in a component
// that is NOT wrapped inside <AuthProvider> — it's a safety net.

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }

  return context;
}
