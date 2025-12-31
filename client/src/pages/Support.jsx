// client/src/pages/Support.jsx
import { useAuth } from "../AuthContext.jsx";

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
  maxWidth: "960px",
  borderRadius: "28px",
  padding: "2.3rem 2.2rem 2.1rem",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.96))",
  boxShadow: "0 28px 50px rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const eyebrowStyle = {
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontSize: "0.7rem",
  color: "#9ca3af",
  marginBottom: "0.4rem",
};

const h1Style = {
  fontSize: "1.7rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
};

const bodyStyle = {
  fontSize: "0.9rem",
  color: "#e5e7eb",
  lineHeight: 1.6,
};

const sectionTitleStyle = {
  marginTop: "1.6rem",
  fontSize: "1rem",
  fontWeight: 600,
};

const listStyle = {
  marginTop: "0.5rem",
  paddingLeft: "1.1rem",
  fontSize: "0.88rem",
  color: "#e5e7eb",
};

const emailLinkStyle = {
  color: "#fbbf24",
  textDecoration: "none",
  fontWeight: 600,
};

const smallTextStyle = {
  marginTop: "1.6rem",
  fontSize: "0.78rem",
  color: "#cbd5f5",
};

export default function Support() {
  const { user } = useAuth();

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <p style={eyebrowStyle}>Support & feedback</p>
        <h1 style={h1Style}>Need help with QuitChampion?</h1>

        <p style={bodyStyle}>
          This is the live support channel for the website and early-access
          accounts. No bots pretending to be people. If something breaks, you
          email and a real human at T&amp;S Enterprises looks at it.
        </p>

        {user && (
          <p style={{ ...bodyStyle, marginTop: "0.6rem", opacity: 0.9 }}>
            Logged in as <strong>{user.displayName || user.email}</strong>. If
            your issue is account-related, mention this email in your message.
          </p>
        )}

        <h2 style={sectionTitleStyle}>How to contact support</h2>
        <p style={bodyStyle}>
          Send an email to{" "}
          <a href="mailto:support@thingsnstuff.fun" style={emailLinkStyle}>
            support@thingsnstuff.fun
          </a>{" "}
          with a clear subject line.
        </p>

        <ul style={listStyle}>
          <li>What you were trying to do.</li>
          <li>What you expected to happen.</li>
          <li>What actually happened (error message, weird behavior, etc.).</li>
          <li>
            Screenshots are gold. Attach one if you can (desktop or phone).
          </li>
        </ul>

        <h2 style={sectionTitleStyle}>What this support covers</h2>
        <ul style={listStyle}>
          <li>Login, registration, or password problems.</li>
          <li>Dashboard, armory, or settings not loading or saving.</li>
          <li>
            Questions about how the habit tracking, costs, or Savage Mode
            encouragement works.
          </li>
          <li>Bug reports, typos, layout issues on desktop or mobile.</li>
        </ul>

        <p style={smallTextStyle}>
          Behind the scenes this is a TNS Enterprises project (Stuff N&apos;
          Things LLC). We keep your account details private and only use your
          emails to fix problems and improve the app.
        </p>
      </section>
    </main>
  );
}
