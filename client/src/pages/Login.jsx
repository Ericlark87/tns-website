// client/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localMessage, setLocalMessage] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    clearError?.();
    setLocalMessage(null);

    const result = await login(email, password);

    if (result.success) {
      setLocalMessage("Login successful. Redirecting to home…");
      navigate("/");
    } else {
      setLocalMessage(result.message || "Login failed.");
    }
  }

  return (
    <main className="page page--top">
      <div className="auth-card">
        <div className="auth-eyebrow">Welcome back</div>
        <h1 className="auth-title">Sign in to QuitChampion</h1>
        <p className="auth-subtitle">
          Continue your streak, keep your progress, and stay accountable.
        </p>

        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}
        {localMessage && !error && (
          <div className="alert alert--success">
            {localMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account yet?{" "}
          <Link to="/register">Create one</Link>.
        </div>
      </div>
    </main>
  );
}
