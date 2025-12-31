// client/src/pages/Register.jsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// --- layout styles (same look as login/home) ---
const pageStyle = {
  minHeight: "calc(100vh - 64px)",
  display: "flex",
  justifyContent: "center",
  padding: "3rem 1.5rem 4rem",
  background:
    "radial-gradient(circle at top, #020617 0, #020617 40%, #000000 100%)",
  color: "#e5e7eb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const shellStyle = {
  width: "100%",
  maxWidth: "760px",
  borderRadius: "28px",
  padding: "2.3rem 2.2rem 2.4rem",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.96))",
  boxShadow: "0 28px 50px rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const h1Style = {
  fontSize: "1.6rem",
  fontWeight: 600,
  marginBottom: "0.35rem",
};

const subStyle = {
  fontSize: "0.88rem",
  color: "#cbd5f5",
  marginBottom: "1.2rem",
};

const alertStyle = {
  marginBottom: "1.0rem",
  padding: "0.65rem 0.9rem",
  borderRadius: "999px",
  fontSize: "0.82rem",
  background:
    "linear-gradient(135deg, rgba(248,113,113,0.18), rgba(248,113,113,0.35))",
  border: "1px solid rgba(248,113,113,0.9)",
  color: "#fee2e2",
};

const sectionTitleStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#9ca3af",
  marginTop: "0.9rem",
  marginBottom: "0.35rem",
};

const gridRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
};

const labelStyle = {
  fontSize: "0.8rem",
  marginBottom: "0.15rem",
  color: "#e5e7eb",
};

const inputStyle = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.7)",
  backgroundColor: "rgba(15,23,42,0.95)",
  color: "#f9fafb",
  fontSize: "0.9rem",
};

const checkboxRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.55rem",
  marginTop: "0.5rem",
};

const checkboxStyle = {
  width: "16px",
  height: "16px",
  marginTop: "0.05rem",
};

const checkboxLabelStyle = {
  fontSize: "0.8rem",
  lineHeight: 1.4,
  color: "#e5e7eb",
};

const submitButtonStyle = {
  marginTop: "1.4rem",
  padding: "0.7rem 1.6rem",
  borderRadius: "999px",
  border: "none",
  width: "100%",
  backgroundImage: "linear-gradient(135deg, #f97316, #fb923c)",
  color: "#0b1120",
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
};

// --- helpers ---
function calcAgeFromBirthday(birthday) {
  if (!birthday) return null;
  const [yearStr, monthStr, dayStr] = birthday.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;

  const today = new Date();
  let age = today.getFullYear() - year;

  const m = today.getMonth() + 1;
  const d = today.getDate();
  if (m < month || (m === month && d < day)) {
    age -= 1;
  }
  return age;
}

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [dashboardName, setDashboardName] = useState("");
  const [country, setCountry] = useState("United States");
  const [region, setRegion] = useState("");
  const [birthday, setBirthday] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [understands, setUnderstands] = useState(false);
  const [savageOptIn, setSavageOptIn] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, just bounce them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password || !password2) {
      setError("Email and password are required.");
      return;
    }

    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    if (!understands) {
      setError(
        "You must confirm you understand what QuitChampion is for before creating an account."
      );
      return;
    }

    const ageNum = calcAgeFromBirthday(birthday);
    if (!ageNum || Number.isNaN(ageNum)) {
      setError("Please enter a valid birthday.");
      return;
    }
    if (ageNum < 18) {
      setError("You must be at least 18 years old to create an account.");
      return;
    }

    const payload = {
      email: email.trim(),
      password,
      displayName: dashboardName.trim() || undefined,
      country: country.trim() || undefined,
      region: region.trim() || undefined,
      age: ageNum,
      savageModeOptIn: savageOptIn,
      understandsPurpose: true, // you already forced the checkbox
      // extra info (backend currently ignores these, but we send anyway)
      birthday,
      postalCode: postalCode.trim() || undefined,
    };

    try {
      await register(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Register failed:", err);
      setError(
        err?.message ||
          "Could not create account. Please double-check your details and try again."
      );
    }
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <h1 style={h1Style}>Create your free account</h1>
        <p style={subStyle}>
          Free account. No card required. You’ll unlock the dashboard and the
          raffle. Your account will carry over when the mobile app ships.
        </p>

        {error && <div style={alertStyle}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={sectionTitleStyle}>Account basics</div>

          <div style={{ marginBottom: "0.6rem" }}>
            <label style={labelStyle} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={gridRowStyle}>
            <div>
              <label style={labelStyle} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="password2">
                Confirm password
              </label>
              <input
                id="password2"
                type="password"
                autoComplete="new-password"
                style={inputStyle}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={sectionTitleStyle}>Who / where / birthday</div>

          <div style={{ marginBottom: "0.6rem" }}>
            <label style={labelStyle} htmlFor="dashboardName">
              What should we call your dashboard?
            </label>
            <input
              id="dashboardName"
              type="text"
              style={inputStyle}
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Example: Elcskater"
            />
          </div>

          <div style={gridRowStyle}>
            <div>
              <label style={labelStyle} htmlFor="country">
                Country
              </label>
              <input
                id="country"
                type="text"
                style={inputStyle}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="region">
                Region / state (optional)
              </label>
              <input
                id="region"
                type="text"
                style={inputStyle}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </div>

          <div style={{ ...gridRowStyle, marginTop: "0.6rem" }}>
            <div>
              <label style={labelStyle} htmlFor="birthday">
                Birthday
              </label>
              <input
                id="birthday"
                type="date"
                style={inputStyle}
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="postalCode">
                ZIP / postal code
              </label>
              <input
                id="postalCode"
                type="text"
                style={inputStyle}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div style={sectionTitleStyle}>Consent &amp; mode</div>

          <div style={checkboxRowStyle}>
            <input
              id="understands"
              type="checkbox"
              style={checkboxStyle}
              checked={understands}
              onChange={(e) => setUnderstands(e.target.checked)}
            />
            <label style={checkboxLabelStyle} htmlFor="understands">
              I understand QuitChampion is for tracking addictions, habits, and
              hard-honest behavior change. There may be profanity and blunt
              language if I opt into Savage Mode later. This is not medical
              advice or therapy.
            </label>
          </div>

          <div style={checkboxRowStyle}>
            <input
              id="savage"
              type="checkbox"
              style={checkboxStyle}
              checked={savageOptIn}
              onChange={(e) => setSavageOptIn(e.target.checked)}
            />
            <label style={checkboxLabelStyle} htmlFor="savage">
              I’m curious about Savage Mode (no mercy encouragement). I know
              it’s optional and can be turned off at any time.
            </label>
          </div>

          <button type="submit" style={submitButtonStyle}>
            Create free account
          </button>
        </form>
      </section>
    </main>
  );
}
