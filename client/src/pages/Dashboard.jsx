// client/src/pages/Dashboard.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [tone, setTone] = useState("standard"); // "standard" | "savage" (local only for now)

  const cardStyle = {
    borderRadius: "1.25rem",
    padding: "1.4rem 1.6rem",
    background:
      "radial-gradient(circle at top left, rgba(30,64,175,0.6), rgba(15,23,42,0.97))",
    border: "1px solid rgba(148,163,184,0.4)",
    color: "rgba(226,232,240,0.96)",
  };

  const labelStyle = {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    opacity: 0.75,
  };

  const valueStyle = {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginTop: "0.25rem",
  };

  const sectionTitleStyle = {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(148,163,184,0.9)",
    marginBottom: "0.4rem",
  };

  return (
    <div className="page page-dashboard">
      <div className="page-inner" style={{ maxWidth: "980px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
            color: "rgba(226,232,240,0.98)",
          }}
        >
          Gladiator dashboard
        </h1>

        <p style={{ fontSize: "0.95rem", color: "rgba(148,163,184,0.95)" }}>
          This is your arena overview. When the mobile app ships, these stats
          will move with you automatically.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "1.25rem",
            alignItems: "stretch",
          }}
        >
          {/* Current run / streaks */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Current run</div>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Once habit tracking is wired up, these numbers will start moving.
              For now, they&apos;re placeholders.
            </p>
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "0.75rem",
              }}
            >
              <div>
                <div style={labelStyle}>Active streak</div>
                <div style={valueStyle}>0 days</div>
              </div>
              <div>
                <div style={labelStyle}>Best streak</div>
                <div style={valueStyle}>0 days</div>
              </div>
              <div>
                <div style={labelStyle}>Total slips</div>
                <div style={valueStyle}>0</div>
              </div>
            </div>
          </section>

          {/* Profile summary */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Gladiator profile</div>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Base account details. More armor and cosmetic nonsense gets added
              later.
            </p>
            <div style={{ marginTop: "0.8rem", fontSize: "0.9rem" }}>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{user?.email}</div>

              <div style={{ ...labelStyle, marginTop: "0.7rem" }}>Plan</div>
              <div style={valueStyle}>{user?.plan || "Free"}</div>

              <div style={{ ...labelStyle, marginTop: "0.7rem" }}>Rank</div>
              <div style={valueStyle}>Training Grounds</div>
            </div>
          </section>
        </div>

        {/* Arena currency & Savage mode settings */}
        <div
          style={{
            marginTop: "1.25rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
            gap: "1.25rem",
          }}
        >
          {/* Coins */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Arena currency</div>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Coins unlock cosmetics and extras later. For now, it&apos;s wired
              and waiting.
            </p>
            <div style={{ marginTop: "0.8rem" }}>
              <div style={labelStyle}>Gladiator coins</div>
              <div style={valueStyle}>0</div>
            </div>
            <div style={{ marginTop: "0.9rem" }}>
              <Link
                to="/armory"
                style={{
                  display: "inline-block",
                  padding: "0.65rem 1.1rem",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, #f97316, #fb923c, #f97316)",
                  color: "#052e16",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Visit the Armory
              </Link>
            </div>
          </section>

          {/* Savage mode selector (local, UI only for now) */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Coaching tone</div>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Decide how hard you want the app to talk to you. This is about
              motivation, not shame. Everything here is optional and can be
              changed anytime.
            </p>

            <div
              style={{
                marginTop: "0.9rem",
                display: "flex",
                gap: "0.6rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setTone("standard")}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "999px",
                  border:
                    tone === "standard"
                      ? "1px solid #4ade80"
                      : "1px solid rgba(148,163,184,0.7)",
                  background:
                    tone === "standard"
                      ? "rgba(22,163,74,0.2)"
                      : "transparent",
                  color:
                    tone === "standard"
                      ? "rgba(190,242,100,0.96)"
                      : "rgba(226,232,240,0.9)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Standard coach
              </button>

              <button
                type="button"
                onClick={() => setTone("savage")}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "999px",
                  border:
                    tone === "savage"
                      ? "1px solid #f97316"
                      : "1px solid rgba(148,163,184,0.7)",
                  background:
                    tone === "savage"
                      ? "rgba(248,113,113,0.16)"
                      : "transparent",
                  color:
                    tone === "savage"
                      ? "rgba(254,202,202,0.96)"
                      : "rgba(226,232,240,0.9)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Savage mode (coming soon)
              </button>
            </div>

            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.8rem",
                color: "rgba(148,163,184,0.96)",
              }}
            >
              Savage mode = explicit consent only. Think locker-room / drill
              sergeant energy: profanity allowed, no sugar-coating, but never
              attacking who you are—only the habit you&apos;re trying to kill.
              We&apos;ll store this preference server-side when the app is live.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
