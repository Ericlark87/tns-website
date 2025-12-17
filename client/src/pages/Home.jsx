// client/src/pages/Home.jsx
import { useEffect, useState } from "react";
import { raffleApi } from "../api";

const TOTAL_SPOTS_FALLBACK = 25;

export default function Home() {
  const [email, setEmail] = useState("");
  const [spotsClaimed, setSpotsClaimed] = useState(0);
  const [totalSpots, setTotalSpots] = useState(TOTAL_SPOTS_FALLBACK);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "error" | "success", message: string }

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await raffleApi("/stats");
        if (!cancelled && data) {
          setTotalSpots(data.totalSpots ?? TOTAL_SPOTS_FALLBACK);
          setSpotsClaimed(data.entered ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load raffle stats", err);
          setStatus({
            type: "error",
            message: "Server error. Raffle will still work once we're live.",
          });
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (!email.trim()) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }

    setLoading(true);
    try {
      const res = await raffleApi("/enter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setStatus({
        type: "success",
        message:
          res?.message ||
          "You're in. Watch your inbox when the first wave goes out.",
      });
      setSpotsClaimed((prev) => prev + 1);
      setEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Server error. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page page--top">
      <div className="home-layout">
        {/* Left: pitch */}
        <section className="home-copy">
          <p className="home-eyebrow">
            QUITCHAMPION · NO FLUFF, JUST FACTS
          </p>
          <h1 className="home-title">
            Quit like a champion,
            <br />
            not by accident.
          </h1>
          <p className="home-tagline">
            QuitChampion is a blunt companion for people actually trying to quit
            alcohol, nicotine, or any habit. No social feed. No fake badges.
            Just numbers, decisions, and the truth.
          </p>

          <div className="home-columns">
            <div className="home-column">
              <h2 className="home-column-title">Free forever</h2>
              <ul className="home-list">
                <li>Track one habit (alcohol, nicotine, etc.)</li>
                <li>Streak counter: days clean vs slipped</li>
                <li>Money saved estimate</li>
                <li>Cold-Truth mode (raw stats, no fluff)</li>
                <li>Private Oath you only see at risky moments</li>
                <li>Failure Autopsy after each relapse</li>
              </ul>
            </div>

            <div className="home-column">
              <h2 className="home-column-title">QuitChampion Pro (paid)</h2>
              <ul className="home-list">
                <li>Track multiple habits at once</li>
                <li>Streak Insurance (credits that absorb slips)</li>
                <li>Buddy System with mutual unlock real chat</li>
                <li>Deep stats: triggers, times, patterns</li>
                <li>Custom reminders around danger hours</li>
                <li>Full history + export of your records</li>
              </ul>
            </div>
          </div>

          <p className="home-footnote">
            Founding Members get a full Pro trial and a permanent discount when
            paid plans go live.
          </p>
        </section>

        {/* Right: raffle card */}
        <section className="raffle-card">
          <p className="raffle-label">EARLY ACCESS RAFFLE</p>
          <h2 className="raffle-main-title">Get in as a Founding Member</h2>
          <p className="raffle-copy">
            Drop your email once. If you&apos;re picked, you&apos;ll be invited
            into the first live version of QuitChampion with a 7-day full Pro
            trial.
          </p>

          <p className="raffle-counter">
            {spotsClaimed} of {totalSpots} early-access spots claimed so far.
          </p>

          {status && (
            <div
              className={
                status.type === "error"
                  ? "alert alert--error"
                  : "alert alert--success"
              }
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="raffle-form">
            <div className="raffle-input-row">
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Entering..." : "Enter the raffle"}
            </button>
          </form>

          <p className="raffle-smallprint">
            One entry per email. Up to {totalSpots} winners. If you&apos;re
            chosen, your 7-day Pro trial starts the first time you log in. After
            that, you can stay on the free plan or upgrade to a monthly / yearly
            subscription.
          </p>
        </section>
      </div>
    </main>
  );
}
