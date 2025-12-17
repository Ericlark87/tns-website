// client/src/api.js

const DEFAULT_LOCAL_BASE = "http://localhost:5000";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")) ||
  DEFAULT_LOCAL_BASE;

async function apiRequest(path, options = {}) {
  const isAbsolute =
    path.startsWith("http://") || path.startsWith("https://");

  const url = isAbsolute
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Server error. Try again later.";
    try {
      const data = await response.json();
      if (data && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiCall = apiRequest;

// AUTH
export function authApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/auth${safePath}`, options);
}

export function refreshToken() {
  return authApi("/refresh", { method: "POST" });
}

// RAFFLE
export function raffleApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/raffle${safePath}`, options);
}

// SUPPORT (future)
export function supportApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/support${safePath}`, options);
}

// Default export
export default apiRequest;
