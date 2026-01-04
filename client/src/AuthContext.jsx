// /home/elcskater/TNS/company_site/client/src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authClient, refreshToken, clearAccessToken, setAccessToken } from "./api.js";

/**
 * Production-safe auth boot:
 * - Never leaves the app in a blank/undefined state.
 * - Treats 401/403 refresh as "logged out" (normal).
 * - Handles Render cold-start + aborts + flaky first request.
 * - Avoids infinite loops.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // authReady means: we attempted boot and decided logged-in or logged-out.
  const [authReady, setAuthReady] = useState(false);

  // optional: surface a message if you want (you can ignore this in UI)
  const [authError, setAuthError] = useState("");

  const bootRanRef = useRef(false);

  // ---- helpers ----
  function normalizeUser(payload) {
    // Accept several shapes safely
    if (!payload) return null;
    if (payload.user && (payload.user.email || payload.user.id || payload.user._id)) return payload.user;
    if (payload.email || payload.id || payload._id) return payload;
    return null;
  }

  function isExpectedLoggedOut(err) {
    const msg = String(err?.message || "").toLowerCase();
    const status = err?.status || err?.data?.statusCode || err?.data?.status || null;

    // Our api.js throws Error(message) only, so message checks matter.
    // Treat common auth failures as normal logged-out.
    if (status === 401 || status === 403) return true;
    if (msg.includes("not authenticated")) return true;
    if (msg.includes("missing refresh")) return true;
    if (msg.includes("invalid refresh")) return true;
    if (msg.includes("refresh token expired")) return true;
    if (msg.includes("missing refresh token")) return true;
    return false;
  }

  async function bootAuth() {
    // hard lock: only run once per mount
    if (bootRanRef.current) return;
    bootRanRef.current = true;

    setAuthError("");

    // If refresh works: we get a new access token + user
    // If refresh fails with 401/403: that's just logged out
    // If refresh fails due to cold start/network: retry once after a short delay
    try {
      const res = await refreshToken(); // POST /api/auth/refresh (cookie-based)
      if (res?.accessToken) setAccessToken(res.accessToken);

      const u = normalizeUser(res);
      setUser(u);
      setAuthReady(true);
      return;
    } catch (err1) {
      // If it's a "normal logged out", stop here cleanly.
      if (isExpectedLoggedOut(err1)) {
        clearAccessToken();
        setUser(null);
        setAuthReady(true);
        return;
      }

      // Render cold start / transient error: one retry
      try {
        await new Promise((r) => setTimeout(r, 900));
        const res2 = await refreshToken();
        if (res2?.accessToken) setAccessToken(res2.accessToken);

        const u2 = normalizeUser(res2);
        setUser(u2);
        setAuthReady(true);
        return;
      } catch (err2) {
        // Still failing: fail OPEN (logged out), never blank screen
        clearAccessToken();
        setUser(null);
        setAuthError(err2?.message || err1?.message || "Auth init failed.");
        setAuthReady(true);
        return;
      }
    }
  }

  useEffect(() => {
    bootAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- actions ----
  async function login(email, password) {
    setAuthError("");
    const res = await authClient.login({ email, password });
    if (res?.accessToken) setAccessToken(res.accessToken);
    setUser(normalizeUser(res));
    return res;
  }

  async function register(email, password) {
    setAuthError("");
    const res = await authClient.register({ email, password });
    if (res?.accessToken) setAccessToken(res.accessToken);
    setUser(normalizeUser(res));
    return res;
  }

  async function logout() {
    setAuthError("");
    try {
      await authClient.logout();
    } catch {
      // ignore
    }
    clearAccessToken();
    setUser(null);
  }

  async function refresh() {
    // manual refresh (optional)
    setAuthError("");
    try {
      const res = await refreshToken();
      if (res?.accessToken) setAccessToken(res.accessToken);
      setUser(normalizeUser(res));
      return res;
    } catch (err) {
      if (isExpectedLoggedOut(err)) {
        clearAccessToken();
        setUser(null);
      } else {
        setAuthError(err?.message || "Refresh failed.");
      }
      throw err;
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthed: !!(user && (user.email || user.id || user._id)),
      authReady,
      authError,
      login,
      register,
      logout,
      refresh,
      setUser, // sometimes handy
    }),
    [user, authReady, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
