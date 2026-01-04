// /home/elcskater/TNS/company_site/client/src/api.js

// Dev override (optional):
// - If you set VITE_API_BASE_URL="http://localhost:5000" -> direct to local backend
// - If you leave it empty -> use relative "/api" (recommended with Vite proxy)
const ENV_BASE =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, "")) ||
  "";

// IMPORTANT:
// - In production we ALWAYS want same-origin relative calls ("/api/...").
// - In dev we default to relative (so Vite proxy handles it), unless ENV overrides it.
export const API_BASE_URL = import.meta.env.PROD ? "" : ENV_BASE;

// ---- token helpers (access token only; refresh is httpOnly cookie) ----
export function setAccessToken(token) {
  try {
    if (typeof localStorage !== "undefined") {
      if (token) localStorage.setItem("qc_access_token", token);
      else localStorage.removeItem("qc_access_token");
    }
  } catch {}
}

export function getAccessToken() {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("qc_access_token") || null;
    }
  } catch {}
  return null;
}

export function clearAccessToken() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("qc_access_token");
      localStorage.removeItem("qc_refresh_token"); // legacy
    }
  } catch {}
}

// ---- Core request helper ----
async function apiRequest(path, options = {}) {
  const isAbsolute = /^https?:\/\//i.test(path);

  const token = getAccessToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // IMPORTANT:
  // Avoid 304 Not Modified for API calls.
  // In fetch(), 304 -> response.ok === false, which breaks our handler.
  const baseOptions = {
    credentials: "include",
    cache: options.cache || "no-store",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...authHeader,
      ...(options.headers || {}),
    },
    ...options,
  };

  // If caller passed an absolute URL, use it as-is.
  if (isAbsolute) {
    const response = await fetch(path, baseOptions);
    return handleResponse(response);
  }

  // Normalize path
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If we are using a base URL that already ends with /api, avoid double /api/api
  const normalizedBase = (API_BASE_URL || "").replace(/\/+$/, "");
  if (normalizedBase.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.slice(4);
  }

  // FINAL URL RULES:
  // - If base is empty => relative request (e.g. "/api/auth/me") => same-origin in prod, Vite proxy in dev
  // - If base is set => absolute-ish request (e.g. "http://localhost:5000/api/auth/me")
  const url = normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;

  const response = await fetch(url, baseOptions);
  return handleResponse(response);
}

async function handleResponse(response) {
  // Treat 204 as empty success
  if (response.status === 204) return null;

  if (!response.ok) {
    let message = response.statusText || "Server error.";
    let data = null;

    try {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
      if (data && typeof data === "object" && typeof data.message === "string") {
        message = data.message;
      }
    } catch {}

    const err = new Error(message);
    if (data && typeof data === "object") err.data = data;
    throw err;
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

// ---- AUTH ----
export function authApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/auth${safePath}`, options);
}

export function refreshToken() {
  return authApi("/refresh", { method: "POST" });
}

export const authClient = {
  async me() {
    return authApi("/me");
  },

  async register(body) {
    const res = await authApi("/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res?.accessToken) setAccessToken(res.accessToken);
    return res;
  },

  async login(body) {
    const res = await authApi("/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res?.accessToken) setAccessToken(res.accessToken);
    return res;
  },

  async logout() {
    clearAccessToken();
    return authApi("/logout", { method: "POST" });
  },
};

// ---- RAFFLE ----
export function raffleApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/raffle${safePath}`, options);
}

export function getRaffleStats() {
  return raffleApi("/stats");
}

export function enterRaffle(payload) {
  return raffleApi("/enter", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

// ---- SUPPORT ----
export function supportApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/support${safePath}`, options);
}

// ---- HABITS ----
export function habitsApi(path, options) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return apiRequest(`/api/habits${safePath}`, options);
}

export function getSettings() {
  return habitsApi("/settings");
}

export function saveSettings(settings) {
  return habitsApi("/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export function getHabitStats() {
  return habitsApi("/stats");
}

export function postHabitCheckIn(payload) {
  return habitsApi("/checkin", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

export function postHabitEvent(payload) {
  // payload: { type: "use"|"resist", quantity, note, ts }
  return habitsApi("/events", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

export default apiRequest;
