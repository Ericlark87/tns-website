// client/src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient, refreshToken, setAccessToken, clearAccessToken } from "./api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "qtc_auth_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        let stored = null;

        try {
          const raw =
            typeof window !== "undefined"
              ? window.localStorage.getItem(STORAGE_KEY)
              : null;
          if (raw) stored = JSON.parse(raw);
        } catch {
          stored = null;
        }

        // Only restore USER from this storage key.
        // Token lives in qc_access_token via setAccessToken/getAccessToken.
        if (stored?.user) setUser(stored.user);

        // Try refresh using httpOnly cookie to get a fresh access token
        try {
          const res = await refreshToken();
          if (!cancelled && res?.user && res?.accessToken) {
            setAccessToken(res.accessToken);
            setUser(res.user);

            if (typeof window !== "undefined") {
              window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ user: res.user })
              );
            }

            console.log("Auth init: restored session for", res.user.email);
            return;
          }
        } catch {
          // If refresh fails, we may still have a valid access token already stored
          // in qc_access_token (from a previous login). That's fine.
          if (stored?.user) {
            console.log("Auth init: using stored user only for", stored.user.email);
          } else {
            console.log("Auth init: not logged in");
          }
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function register(form) {
    const res = await authClient.register(form);
    if (res?.user && res?.accessToken) {
      setAccessToken(res.accessToken);
      setUser(res.user);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.user }));
      }
    }
    return res;
  }

  async function login(email, password) {
    const res = await authClient.login({ email, password });
    if (res?.user && res?.accessToken) {
      setAccessToken(res.accessToken);
      setUser(res.user);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.user }));
      }
    }
    return res;
  }

  async function logout() {
    try {
      await authClient.logout();
    } catch (err) {
      console.warn("Logout error (ignored):", err);
    }
    clearAccessToken();
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const value = {
    user,
    initializing,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };

  // Prevent app from mounting until auth init completes (stops early 401 spam)
  if (initializing) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
