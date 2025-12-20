// client/src/pages/Home.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { raffleApi } from "../api";

// Change this when you want a real date.
// Right now it's just "mid-2026" – adjust as needed.
const LAUNCH_TARGET = new Date("2026-06-01T12:00:00-05:00");

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(() => calcDiff(target));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calcDiff(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function calcDiff(target) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  return { days, hours, minutes };
}

function RaffleSummary({ stats, error }) {
  const boxStyle = {
    flex: 1,
    minWidth: "0",
    padding: "0.55rem 0.75rem",
    borderRadius: "0.5rem",
    background: "rgba(15,23,42,0.7)",
    color: "rgba(248, 250, 252, 0.96)",
    fontSize: "0.8rem",
  };

  const labelStyle = {
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    opacity: 0.8,
  };

  const valueStyle = {
    marginTop: "0.15rem",
    fontWeight: 600,
    fontSize: "0.95rem",
  };

  if (error) {
    return (
      <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#fecaca" }}>
        Raffle stats temporarily unavailable. Your account is still counted.
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>
        Loading raffle stats…
      </div>
    );
  }

  const poolSize = stats.poolSize ?? 25;
  const entries = stats.entries ?? 0;
  const spotsLeft = stats.slotsRemaining ?? Math.max(poolSize - entries, 0);

  return (
    <div
      style={{
        marginTop: "1rem",
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <div style={boxStyle}>
        <div style={labelStyle}>Pool size</div>
        <div style={valueStyle}>{poolSize}</div>
      </div>
      <div style={boxStyle}>
        <div style={labelStyle}>Entries so far</div>
        <div style={valueStyle}>{entries}</div>
      </div>
      <div style={boxStyle}>
        <div style={labelStyle}>Spots left</div>
        <div style={valueStyle}>{spotsLeft}</div>
      </div>
    </div>
  );
}

function AppCountdown() {
  const countdown = useCountdown(LAUNCH_TARGET);

  const wrapperStyle = {
    marginTop: "1.25rem",
    padding: "0.8rem 1rem",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.9)",
    display: "inline-flex",
    alignItems: "center",
    gap: "1.25rem",
    color: "rgba(226, 232, 240, 0.96)",
    fontSize: "0.8rem",
  };

  const pillStyle = {
    display: "flex",
    alignItems: "baseline",
    gap: "0.25rem",
  };

  const numberStyle = {
    fontWeight: 700,
    fontSize: "1.05rem",
  };

  const labelStyle = {
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "0.65rem",
    opacity: 0.85,
  };

  if (!countdown) {
    return (
      <div style={wrapperStyle}>
        <span style={{ fontWeight: 600 }}>App beta window</span>
        <span>Mobile app is in active build. Countdown will go live closer to launch.</span>
      </div>
    );
  }

  const { days, hours, minutes } = countdown;

  return (
    <div style={wrapperStyle}>
      <span style={{ fontWeight: 600 }}>App beta countdown</span>
      <div style={pillStyle}>
        <span style={numberStyle}>{days}</span>
        <span style={labelStyle}>days</span>
      </div>
      <div style={pillStyle}>
        <span style={numberStyle}>{hours}</span>
        <span style={labelStyle}>hours</span>
      </div>
      <div style={pillStyle}>
        <span style={numberStyle}>{minutes}</span>
        <span style={labelStyle}>mins</span>
      </div>
    </div>
  );
}

function PublicHome({ stats, statsError }) {
  const textStyle = {
    color: "#020617", // darker text for light-ish card background
  };

  return (
    <div className="page page-home">
      <div className="page-inner">
        <section className="home-hero">
          <div className="home-hero-card">
            <h1
              className="home-title"
              style={{
                fontSize: "2.2rem",
                marginBottom: "0.75rem",
                color: "#020617",
              }}
            >
              Quit like a champion, not by accident.
            </h1>

            <p className="home-lead" style={{ ...textStyle, opacity: 0.9 }}>
              Built for people who are actually done lying to themselves.
              No toxic positivity. No fake streak screenshots. Just a blunt
              dashboard of your progress, your slips, and what they really cost you.
            </p>

            <p style={{ ...textStyle, marginTop: "0.75rem", opacity: 0.9 }}>
              QuitChampion app status: mobile app is in active development. First
              public beta is planned for 2026. Your early account today carries
              over when the app ships.
            </p>

            <div style={{ marginTop: "1.5rem" }}>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  display: "inline-block",
                  padding: "0.8rem 1.4rem",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, #f97316, #fb923c, #f97316)",
                  color: "#020617",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create free account
              </Link>

              <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem" }}>
                Already have one?{" "}
                <Link to="/login" style={{ textDecoration: "underline" }}>
                  Sign in.
                </Link>
              </span>
            </div>

            <AppCountdown />

            <div style={{ marginTop: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  opacity: 0.8,
                  color: "#020617",
                }}
              >
                Early access raffle
              </div>
              <p style={{ ...textStyle, fontSize: "0.85rem", marginTop: "0.35rem" }}>
                Once we hit 25 registered accounts, the raffle goes live. From
                there, one random user wins every 8 hours until launch.
              </p>

              <RaffleSummary stats={stats} error={statsError} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MemberHome({ stats, statsError, email }) {
  return (
    <div className="page page-home">
      <div className="page-inner">
        <section className="home-hero">
          <div className="home-hero-card">
            <h1
              className="home-title"
              style={{
                fontSize: "2.1rem",
                marginBottom: "0.75rem",
                color: "#020617",
              }}
            >
              Welcome back, fighter.
            </h1>

            <p style={{ color: "#020617", opacity: 0.9 }}>
              Your account is live. When the app ships, your stats and raffle
              status come with you. Until then, this dashboard is your HQ.
            </p>

            <div style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
              Signed in as <strong>{email}</strong>.
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
              <Link
                to="/dashboard"
                style={{
                  padding: "0.75rem 1.3rem",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, #22c55e, #4ade80, #22c55e)",
                  color: "#022c22",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Enter your dashboard
              </Link>

              <Link
                to="/armory"
                style={{
                  padding: "0.75rem 1.1rem",
                  borderRadius: "999px",
                  background: "rgba(15,23,42,0.9)",
                  color: "rgba(226,232,240,0.96)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.55)",
                }}
              >
                Visit the Armory
              </Link>
            </div>

            <AppCountdown />

            <div style={{ marginTop: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  opacity: 0.8,
                  color: "#020617",
                }}
              >
                Early access raffle
              </div>
              <p
                style={{
                  color: "#020617",
                  fontSize: "0.85rem",
                  marginTop: "0.35rem",
                  opacity: 0.9,
                }}
              >
                Once we hit 25 accounts, the 8-hour raffle cycle starts. Every
                winner gets a 7-day trial of QuitChampion Premium when the app
                launches.
              </p>

              <RaffleSummary stats={stats} error={statsError} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await raffleApi("/stats");
        if (!cancelled) {
          setStats(data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setStatsError(err.message || "Failed to load raffle stats.");
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (user) {
    return (
      <MemberHome stats={stats} statsError={statsError} email={user.email} />
    );
  }

  return <PublicHome stats={stats} statsError={statsError} />;
}

export default Home;
