// ~/TNS/company_site/client/src/pages/QuitChampion.jsx

import { useEffect, useState } from "react";
import { apiCall } from "../api";
import { Link } from "react-router-dom";

export default function QuitChampion() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Example snapshot numbers (static for now)
  const exampleStats = {
    streakDays: 27,
    quitCoins: 4320,
    relapses: 3,
    moneySaved: 387.45,
    cigsAvoided: 216,
    lifeHoursRegained: 19.5,
  };

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await apiCall("/api/health");
        setHealth(data);
      } catch (e) {
        setHealth(null);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            QuitChampion
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Turn quitting into a game you can actually win.
          </p>
        </header>

        {/* Intro section */}
        <section className="mb-10 space-y-4">
          <p>
            QuitChampion helps you step away from cigarettes, vapes, booze, or
            whatever else has been running the show. Track streaks, earn
            QuitCoins, unlock rewards, and see your progress in hard numbers
            instead of guilt and guesswork.
          </p>
          <p>
            This is not magic. If you don&apos;t show up, log honestly, and try
            to be persistent, this will not work. If you&apos;re not willing to
            try, don&apos;t spend money on it.
          </p>
          <p>
            If you&apos;re actually tired of smoking or drinking and you want
            more money sitting in your debit card instead of going up in smoke,
            this system will help you see exactly where your health and your
            cash are going — and how to take them back.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              to="/register"
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-md text-sm font-semibold"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="border border-gray-500 hover:border-gray-300 px-6 py-2 rounded-md text-sm font-semibold"
            >
              Log in
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-3">
            This page is the hub for the QuitChampion app. When the desktop and
            mobile builds go live, downloads and account management will all
            live here.
          </p>
        </section>

        {/* Example snapshot */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Example progress snapshot
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Streak */}
            <div className="bg-[#0b1020] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Current streak</p>
                <p className="text-3xl font-bold mb-1">
                  {exampleStats.streakDays} days
                </p>
                <p className="text-xs text-gray-400">
                  No cigarettes logged this run
                </p>
              </div>
            </div>

            {/* QuitCoins */}
            <div className="bg-[#0b1020] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">QuitCoins earned</p>
                <p className="text-3xl font-bold mb-1">
                  {exampleStats.quitCoins.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  From streaks + milestones
                </p>
              </div>
            </div>

            {/* Relapses */}
            <div className="bg-[#0b1020] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Relapses tracked</p>
                <p className="text-3xl font-bold mb-1">
                  {exampleStats.relapses}
                </p>
                <p className="text-xs text-gray-400">Data, not shame</p>
              </div>
            </div>

            {/* Money saved */}
            <div className="bg-[#0b1020] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Money saved</p>
                <p className="text-3xl font-bold mb-1">
                  ${exampleStats.moneySaved.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  From packs / bottles not bought
                </p>
              </div>
            </div>

            {/* Cigs avoided */}
            <div className="bg-[#0b1020] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  Cigarettes avoided
                </p>
                <p className="text-3xl font-bold mb-1">
                  {exampleStats.cigsAvoided.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  Based on your logged baseline
                </p>
              </div>
            </div>

            {/* Life hours */}
            <div className="bg-[#0b1020] border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  Life expectancy regained
                </p>
                <p className="text-3xl font-bold mb-1">
                  {exampleStats.lifeHoursRegained.toFixed(1)} hours
                </p>
                <p className="text-xs text-gray-400">
                  Rough estimate, not medical advice
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Numbers above are example data. In the live app, this panel will
            show your real streaks, triggers, spending, and progress.
          </p>
        </section>

        {/* How it works */}
        <section className="mb-12 space-y-4">
          <h2 className="text-2xl font-semibold mb-2">
            How QuitChampion will work
          </h2>

          <p>
            No lectures. No fake motivation posters. Just a straight-up system
            that turns quitting into a series of winnable moves.
          </p>

          <ol className="list-decimal list-inside space-y-3">
            <li>
              <span className="font-semibold">Track every choice.</span>{" "}
              Log smokes, drinks, cravings, and wins. The app doesn&apos;t judge
              you; it just tracks reality so you can see patterns instead of
              guessing.
            </li>
            <li>
              <span className="font-semibold">Earn QuitCoins (no cheating).</span>{" "}
              QuitCoins are earned from streaks, milestones, and honest logging.
              They have real value in your account, so the system is built to
              detect manipulation. If someone tampers with their data — streak
              spoofing, fake logs, automation, or any other kind of cheating —
              their account will be terminated. No appeals. No excuses. All
              coins gone.
            </li>
            <li>
              <span className="font-semibold">Level up instead of spiral.</span>{" "}
              Breaking a streak doesn&apos;t erase your progress — it updates
              your stats and starts the next run. You&apos;ll see real numbers:
              money saved, cigarettes or drinks avoided, estimated lung
              recovery, reduced liver strain, and life expectancy regained.
            </li>
            <li>
              <span className="font-semibold">No effort = no results.</span>{" "}
              If you half-ass this, it won&apos;t work. Don&apos;t buy it unless
              you&apos;re actually ready to try — not to be perfect, just to be
              honest and reasonably consistent.
            </li>
          </ol>
        </section>

        {/* Status block */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            Where things are right now
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>
              ✅ Stuff N Things website online and connected to a live backend.
            </li>
            <li>✅ Core app design, token logic, and routes planned.</li>
            <li>🚧 Building full account system and secure API integration.</li>
            <li>🚧 Desktop / mobile builds and CigLock hardware integration.</li>
          </ul>
          <p className="text-sm text-gray-400 mt-3">
            If you&apos;re seeing this, you&apos;re early. Check back as
            features light up, or create an account now so you&apos;re ready
            when the app launches.
          </p>
        </section>

        {/* Backend health (tiny dev-only note) */}
        <section className="mt-4 text-xs text-gray-500">
          {loading && <p>Checking backend...</p>}
          {!loading && health && <p>Backend status: {health.status}</p>}
          {!loading && !health && (
            <p>Backend status: unreachable from this page.</p>
          )}
        </section>
      </div>
    </div>
  );
}
