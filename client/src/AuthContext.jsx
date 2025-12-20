// client/src/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, refreshToken } from "./api.js";

const AuthContext = createContext({
  user: null,
  accessToken: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: try refresh
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const data = await refreshToken();
        if (!cancelled && data?.user) {
          setUser(data.user);
          setAccessToken(data.accessToken || null);
        }
      } catch {
        // not logged in – ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const payload = { email, password };
    const data = await authApi("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    setAccessToken(data.accessToken || null);
    return data;
  };

  const register = async (email, password) => {
    const payload = { email, password };
    const data = await authApi("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    setAccessToken(data.accessToken || null);
    return data;
  };

  const logout = async () => {
    try {
      await authApi("/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      register,
      logout,
    }),
    [user, accessToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
