// client/src/api.js

// Base URL for your backend (set in Vercel as VITE_API_BASE_URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Core request helper
export async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = "Server error. Try again later.";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // Some endpoints may return empty body
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------- Raffle ---------- */

export function getStats() {
  return apiRequest("/api/raffle/stats");
}

export function enterRaffle(email) {
  return apiRequest("/api/raffle/enter", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/* ---------- Auth ---------- */

export function register(email, password) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function refreshAccessToken() {
  return apiRequest("/api/auth/refresh", {
    method: "POST",
  });
}

export function logout() {
  return apiRequest("/api/auth/logout", {
    method: "POST",
  });
}

/* ---------- Backwards-compat aliases ---------- */
// AuthContext expects these names:
export const apiCall = apiRequest;
export function refreshToken() {
  return refreshAccessToken();
}

// Optional default export
const api = {
  API_BASE_URL,
  apiRequest,
  apiCall,
  getStats,
  enterRaffle,
  register,
  login,
  refreshAccessToken,
  refreshToken,
  logout,
};

export default api;
