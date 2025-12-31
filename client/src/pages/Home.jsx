// client/src/pages/Home.jsx
import { Link } from "react-router-dom";
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
  maxWidth: "1080px",
  borderRadius: "28px",
  padding: "2.3rem 2.2rem 2.1rem",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.96))",
  boxShadow: "0 28px 50px rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const h1Style = {
  fontSize: "1.8rem",
  fontWeight: 600,
  marginBottom: "0.6rem",
};

const bodyStyle = {
  fontSize: "0.9rem",
  color: "#e5e7eb",
  lineHeight: 1.6,
};

const raffleBandStyle = {
  marginTop: "1.8rem",
  padding: "0.8rem 1rem",
  borderRadius: "999px",
  background:
    "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,23,42,0.96))",
  border: "1px solid rgba(75,85,99,0.9)",
  fontSize: "0.82rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  flexWrap: "wrap", // lets it wrap on narrow screens
};

const ctaButtonStyle = {
  marginTop: "1.4rem",
  padding: "0.7rem 1.4rem",
  borderRadius: "999px",
  border: "none",
  backgroundImage: "linear-gradient(135deg, #f97316, #fb923c)",
  color: "#0b1120",
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
};

export default function Home() {
  const { user } = useAuth();

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <h1 style={h1Style}>
          QuitChampion turns quitting into a fight you can actually win.
        </h1>

        <p style={bodyStyle}>
          Built for people who are done lying to themselves. No toxic positivity.
          No fake streak screenshots. Just a blunt dashboard of your progress,
          your slips, and what they really cost you.
        </p>

        <p style={{ ...bodyStyle, marginTop: "0.8rem" }}>
          <strong>QuitChampion app status</strong>
          <br />
          Mobile app is in active development.
          <br />
          First public beta is planned for 2026.
          <br />
          Your account and stats from this site will carry straight over when
          the app ships.
        </p>

        <div style={raffleBandStyle}>
          <span>
            <strong>App beta countdown</strong> · 2026 target · Early access
            raffle once 25 registered accounts go live.
          </span>
          <span>Pool size: 25 · Entries so far: 0 · Spots left: 25</span>
        </div>

        <Link to={user ? "/dashboard" : "/register"}>
          <button type="button" style={ctaButtonStyle}>
            {user ? "Enter your dashboard" : "Create free account"}
          </button>
        </Link>
      </section>
    </main>
  );
}
