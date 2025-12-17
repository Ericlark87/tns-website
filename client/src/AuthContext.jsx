// client/src/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, refreshToken as refreshApi } from "./api";

// Shape of the context
const AuthContext = createContext({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Try to restore session from refresh cookie on mount
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const data = await refreshApi();
        if (!cancelled && data && data.user) {
          setUser(data.user);
          setAccessToken(data.accessToken || null);
        }
      } catch {
        // Not logged in / refresh failed – ignore
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = () => setError(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setUser(data.user);
      setAccessToken(data.accessToken || null);

      return { success: true };
    } catch (err) {
      const message = err?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi("/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setUser(data.user);
      setAccessToken(data.accessToken || null);

      return { success: true };
    } catch (err) {
      const message =
        err?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi("/logout", { method: "POST" });
    } catch {
      // ignore errors, just clear local state
    }
    setUser(null);
    setAccessToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
      bootstrapped,
    }),
    [user, accessToken, isLoading, error, bootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
