import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "@/features/auth/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await authApi.me();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = {
    user,
    loading,
    async login(creds) {
      const data = await authApi.login(creds);
      const u = data.user || (await authApi.me());
      setUser(u);
      return u;
    },
    async signup(payload) {
      const data = await authApi.signup(payload);
      const u = data.user || (await authApi.me());
      setUser(u);
      return u;
    },
    async logout() {
      await authApi.logout();
      setUser(null);
    },
    async updateProfile(patch) {
      if (!user) throw new Error("Not signed in");
      const updated = await authApi.updateProfile(user.id, patch);
      setUser(updated);
      return updated;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
