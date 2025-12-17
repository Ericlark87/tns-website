// client/src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localMessage, setLocalMessage] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    clearError?.();
    setLocalMessage(null);

    const result = await register(email, password);

    if (result.success) {
      setLocalMessage("Account created. Redirecting to home…");
      navigate("/");
    } else {
      setLocalMessage(result.message || "Registration failed.");
    }
  }

  return (
    <main className="page page--top">
      <div className="auth-card">
        <div className="auth-eyebrow">Start where you are</div>
        <h1 className="auth-title">Create your QuitChampion account</h1>
        <p className="auth-subtitle">
          Keep your streaks, track your slips, and turn quitting into a game.
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
              autoComplete="new-password"
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
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>.
        </div>
      </div>
    </main>
  );
}
