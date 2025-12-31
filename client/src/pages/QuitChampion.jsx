// client/src/pages/QuitChampion.jsx
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
  maxWidth: "960px",
  borderRadius: "28px",
  padding: "2.3rem 2.2rem 2.2rem",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.96))",
  boxShadow: "0 28px 50px rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const h1Style = {
  fontSize: "1.7rem",
  fontWeight: 600,
  marginBottom: "0.8rem",
};

const bodyStyle = {
  fontSize: "0.9rem",
  color: "#e5e7eb",
  lineHeight: 1.6,
};

const listStyle = {
  marginTop: "0.9rem",
  paddingLeft: "1.1rem",
  fontSize: "0.9rem",
  lineHeight: 1.6,
};

const ctaRowStyle = {
  marginTop: "1.5rem",
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const buttonStyle = {
  padding: "0.6rem 1.2rem",
  borderRadius: "999px",
  border: "none",
  backgroundImage: "linear-gradient(135deg, #f97316, #fb923c)",
  color: "#0b1120",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "0.55rem 1.1rem",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.7)",
  backgroundColor: "transparent",
  color: "#e5e7eb",
  fontWeight: 500,
  fontSize: "0.88rem",
  cursor: "pointer",
};

export default function QuitChampion() {
  const { user } = useAuth();

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <h1 style={h1Style}>What QuitChampion actually does.</h1>
        <p style={bodyStyle}>
          QuitChampion is built for people who want to stop bullshitting
          themselves about their habits. You define what you&apos;re fighting:
          cigarettes, alcohol, weed, sugar, late-night doom-scrolling,
          whatever. The app tracks events, cost, and intent over time.
        </p>

        <ul style={listStyle}>
          <li>Track slips and streaks without fake streak screenshots.</li>
          <li>Attach real cost to every event: money, time, health points.</li>
          <li>Set intent: quit, cut back, take a break, or just understand it.</li>
          <li>
            Opt into Savage Mode if you want blunt language and hard feedback.
          </li>
        </ul>

        <div style={ctaRowStyle}>
          <Link to={user ? "/dashboard" : "/register"}>
            <button type="button" style={buttonStyle}>
              {user ? "Open your dashboard" : "Create free account"}
            </button>
          </Link>

          {!user && (
            <Link to="/login">
              <button type="button" style={secondaryButtonStyle}>
                Already have an account? Sign in.
              </button>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
