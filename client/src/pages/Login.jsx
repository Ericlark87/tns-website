// client/src/pages/Login.jsx
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const pageStyle = {
  minHeight: "calc(100vh - 64px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3.5rem 1.5rem",
  background:
    "radial-gradient(circle at top, #111827 0, #020617 45%, #000000 100%)",
  color: "#e5e7eb",
};

const cardStyle = {
  width: "100%",
  maxWidth: "480px",
  borderRadius: "24px",
  padding: "2.5rem 2.25rem 2rem",
  background: "rgba(15, 23, 42, 0.96)",
  boxShadow: "0 22px 40px rgba(15, 23, 42, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const stepStyle = {
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: "0.7rem",
  color: "#9ca3af",
  marginBottom: "0.5rem",
};

const titleStyle = {
  fontSize: "1.7rem",
  fontWeight: 600,
  margin: "0 0 0.4rem",
};

const subtitleStyle = {
  fontSize: "0.9rem",
  color: "#9ca3af",
  margin: "0 0 1.7rem",
  lineHeight: 1.5,
};

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 500,
  marginBottom: "0.35rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  borderRadius: "999px",
  border: "1px solid rgba(75, 85, 99, 0.9)",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  fontSize: "0.9rem",
  marginBottom: "0.9rem",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  marginTop: "0.25rem",
  padding: "0.7rem 1rem",
  borderRadius: "999px",
  border: "none",
  backgroundImage: "linear-gradient(135deg, #f97316, #fb923c)",
  color: "#0b1120",
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
};

const buttonDisabledStyle = {
  opacity: 0.7,
  cursor: "default",
};

const errorStyle = {
  marginBottom: "1rem",
  padding: "0.6rem 0.75rem",
  borderRadius: "0.75rem",
  backgroundColor: "rgba(127, 29, 29, 0.85)",
  border: "1px solid rgba(248, 113, 113, 0.9)",
  color: "#fee2e2",
  fontSize: "0.85rem",
};

const footerRowStyle = {
  marginTop: "1rem",
  fontSize: "0.85rem",
  color: "#9ca3af",
};

const linkStyle = {
  color: "#fb923c",
  fontWeight: 500,
  textDecoration: "none",
};

const metaStyle = {
  marginTop: "1.25rem",
  fontSize: "0.75rem",
  color: "#6b7280",
  lineHeight: 1.4,
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      setError(err?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <p style={stepStyle}>Welcome back</p>
        <h1 style={titleStyle}>Sign in</h1>
        <p style={subtitleStyle}>
          Use the same email you used for the raffle or registration to see your
          dashboard.
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Email
            <input
              type="email"
              autoComplete="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            style={{
              ...buttonStyle,
              ...(submitting ? buttonDisabledStyle : null),
            }}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={footerRowStyle}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={linkStyle}>
            Get started.
          </Link>
        </p>

        <p style={metaStyle}>
          © {new Date().getFullYear()} QuitChampion · A project of TNS
          Enterprises (Stuff N&apos; Things LLC). Mobile app in active
          development. First public beta planned for 2026.
        </p>
      </section>
    </main>
  );
}
