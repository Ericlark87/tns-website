// client/src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const email = user?.email || "";
  const plan = user?.plan || "free";
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Recently";

  // Placeholder stats – wired to user later when we track habits
  const currentStreak = user?.streakDays ?? 0;
  const bestStreak = user?.bestStreak ?? 0;
  const totalSlips = user?.slips ?? 0;
  const coins = user?.coins ?? 0;

  const rank =
    plan === "pro" || plan === "paid" ? "Arena Champion" : "Training Grounds";

  return (
    <section className="page page--top">
      <div className="max-w-5xl w-full mx-auto flex flex-col gap-6">
        {/* Header */}
        <header>
          <p className="auth-eyebrow">Gladiator dashboard</p>
          <h1 className="auth-title" style={{ fontSize: "24px" }}>
            Welcome back, fighter.
          </h1>
          <p className="auth-subtitle">
            This is your arena overview. One account. One path. No fluff.
          </p>
        </header>

        {/* Top grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="raffle-card text-left">
            <h2 className="raffle-title" style={{ fontSize: "18px" }}>
              Current run
            </h2>
            <p className="raffle-subtitle">
              Once habit tracking is wired up, these will move with you.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Active streak</span>
                <span className="font-semibold">{currentStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Best streak</span>
                <span className="font-semibold">{bestStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total slips</span>
                <span className="font-semibold">{totalSlips}</span>
              </div>
            </div>
          </div>

          <div className="raffle-card text-left">
            <h2 className="raffle-title" style={{ fontSize: "18px" }}>
              Gladiator profile
            </h2>
            <p className="raffle-subtitle">
              Basic account details. More armor gets added as we build.
            </p>
            <div className="mt-3 text-sm space-y-2">
              <div>
                <div className="text-slate-400 text-xs uppercase">
                  Rank
                </div>
                <div className="font-semibold">{rank}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase">
                  Email
                </div>
                <div>{email}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase">
                  Plan
                </div>
                <div className="font-semibold">
                  {plan === "pro" || plan === "paid"
                    ? "QuitChampion Pro"
                    : "Free"}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase">
                  Joined
                </div>
                <div>{joined}</div>
              </div>
            </div>
          </div>

          <div className="raffle-card text-left">
            <h2 className="raffle-title" style={{ fontSize: "18px" }}>
              Arena currency
            </h2>
            <p className="raffle-subtitle">
              Coins unlock cosmetics and extras later. For now, it&apos;s
              wired and waiting.
            </p>
            <div className="mt-3 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Gladiator coins</span>
                <span className="font-semibold">{coins}</span>
              </div>
              <Link
                to="/armory"
                className="btn btn--primary mt-1 text-center"
              >
                Visit the Armory
              </Link>
              <Link
                to="/"
                className="btn btn--ghost text-xs justify-center"
              >
                Back to Home / Raffle
              </Link>
            </div>
          </div>
        </div>

        {/* Lower section */}
        <div className="raffle-card text-left">
          <h2 className="raffle-title" style={{ fontSize: "18px" }}>
            What this page will do for you
          </h2>
          <p className="raffle-subtitle">
            Short version: this becomes your command center. No feed. No
            dopamine casino. Just the numbers that matter.
          </p>

          <ul className="mt-3 text-sm space-y-2 list-disc list-inside text-slate-200">
            <li>Live streaks by habit (alcohol, nicotine, etc.)</li>
            <li>Streak Insurance credits and when they burn</li>
            <li>Cold-Truth stats: money saved, time recovered, sleep</li>
            <li>Failure Autopsy log you can review without judgment</li>
            <li>Quick jumps into your Buddy System and reminders</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
