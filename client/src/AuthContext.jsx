// ~/TNS/company_site/client/src/AuthContext.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiCall, refreshToken } from "./api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on first load
  useEffect(() => {
    let cancelled = false;

    async function tryRefresh() {
      try {
        const data = await refreshToken();
        // If backend sends back a user, store it
        if (!cancelled && data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // 401 / network error = just not logged in; don't kill the app
        console.warn("Silent auth refresh failed:", err?.message || err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    tryRefresh();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await apiCall("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (email, password) => {
    const data = await apiCall("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await apiCall("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout error:", err?.message || err);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  // IMPORTANT: do **not** block rendering with a "Loading..." screen.
  // The app will render immediately; `loading` just tells components
  // whether the silent refresh finished.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
