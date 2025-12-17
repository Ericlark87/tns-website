// client/src/pages/Armory.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Armory() {
  const { user } = useAuth();
  const plan = user?.plan || "free";

  return (
    <section className="page page--top">
      <div className="max-w-4xl w-full mx-auto">
        <div className="raffle-card text-left">
          <p className="auth-eyebrow">Armory & gift shop</p>
          <h1 className="raffle-title" style={{ fontSize: "22px" }}>
            Gear up like a gladiator.
          </h1>
          <p className="raffle-subtitle">
            This is where Pro unlocks live. No loot boxes. No casino tricks.
            Just a straight trade: a few dollars for tools that actually help.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <h2 className="font-semibold mb-2 text-slate-100">
                Free plan (what you already get)
              </h2>
              <ul className="space-y-1 list-disc list-inside text-slate-200">
                <li>Track one habit (alcohol, nicotine, etc.)</li>
                <li>Streak counter: days clean vs slipped</li>
                <li>Money saved estimate</li>
                <li>Cold-Truth mode (raw stats, no fluff)</li>
                <li>Private Oath surfaced at risky moments</li>
                <li>Failure Autopsy after each relapse</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-2 text-amber-300">
                QuitChampion Pro (paid)
              </h2>
              <ul className="space-y-1 list-disc list-inside text-slate-200">
                <li>Track multiple habits at once</li>
                <li>Streak Insurance credits that absorb slips</li>
                <li>Buddy System with mutual unlock real chat</li>
                <li>Deep stats: triggers, times, patterns</li>
                <li>Custom reminders around danger hours</li>
                <li>Full history + export of your records</li>
              </ul>
            </div>
          </div>

          <div className="mt-5 text-sm text-slate-300 space-y-2">
            <p>
              Pricing will be simple: one monthly or yearly subscription,
              no addons, no upsell ladder. Founding Members from the early
              raffle get a permanent discount.
            </p>
            <p>
              Right now, this page is just the armory blueprint. When
              payments go live, this is where you&apos;ll upgrade and see
              your active status.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
              Current plan:{" "}
              <strong>
                {plan === "pro" || plan === "paid" ? "QuitChampion Pro" : "Free"}
              </strong>
            </span>

            <Link to="/dashboard" className="btn btn--ghost text-xs">
              Back to Dashboard
            </Link>

            <Link to="/" className="btn btn--ghost text-xs">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
