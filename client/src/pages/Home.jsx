import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5200";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [raffleCount, setRaffleCount] = useState(null);
  const [raffleThreshold, setRaffleThreshold] = useState(null);

  // load stats once on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/raffle/stats`);
        const data = await res.json();
        if (res.ok && data.ok) {
          setRaffleCount(data.count);
          setRaffleThreshold(data.threshold);
        }
      } catch (_err) {
        // silent fail – stats are optional
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/raffle/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setSubmitted(true);
      setSuccessMsg(
        data.message ||
          "You're in. Watch your inbox — you'll hear from us soon."
      );

      if (typeof data.count === "number") {
        setRaffleCount(data.count);
      }
      if (typeof data.threshold === "number") {
        setRaffleThreshold(data.threshold);
      }
    } catch (err) {
      setErrorMsg(err.message || "Could not enter raffle. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO SECTION */}
      <section className="w-full py-24 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-mint-400">
          Rise Into What’s Next.
        </h1>
        <p className="max-w-2xl mx-auto text-slate-300 text-lg md:text-xl mb-10">
          QuitChampion helps you take back control — tracking cravings, wins,
          streaks, and real progress without the bullshit.
        </p>

        <a
          href="#raffle"
          className="inline-block bg-mint-500 hover:bg-mint-400 text-slate-950 font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-mint-500/40"
        >
          Join the Early Access Raffle
        </a>
      </section>

      {/* APP PREVIEW SECTION */}
      <section className="py-16 px-6 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          {/* "Phone" mockup */}
          <div className="flex justify-center">
            <div className="relative h-[420px] w-[220px] rounded-[32px] border border-slate-700 bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              <div className="h-6 flex items-center justify-center text-[10px] text-slate-500">
                QuitChampion
              </div>
              <div className="flex-1 px-4 py-3 flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Today&apos;s snapshot
                  </span>
                  <span className="text-mint-400 text-xs font-semibold">
                    18 days
                  </span>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-mint-500/20 via-slate-900 to-slate-900 border border-mint-500/40 px-4 py-3">
                  <div className="text-[11px] text-slate-300 mb-1">
                    Smoke-free streak
                  </div>
                  <div className="text-3xl font-bold text-mint-400">18</div>
                  <div className="text-[11px] text-slate-400">
                    days in a row
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MiniStat label="Cravings logged" value="37" />
                  <MiniStat label="Relapses" value="2" />
                  <MiniStat label="Money saved" value="$86.40" />
                  <MiniStat label="QuitCoins earned" value="540" />
                </div>

                <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
                  <div className="text-[11px] text-slate-300 mb-1">
                    Today&apos;s focus
                  </div>
                  <div className="text-[11px] text-slate-400">
                    When a craving hits, log it. Take 10 slow breaths. Walk
                    away for 2 minutes. You don&apos;t have to be perfect — just
                    honest.
                  </div>
                </div>
              </div>
              <div className="h-8 flex items-center justify-center text-[10px] text-slate-600 border-t border-slate-800">
                This is a preview mockup — real app UI coming next.
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="space-y-5 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold">
              See your progress in one glance.
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              QuitChampion is built to be simple: a daily snapshot, a few key
              stats, and a clear picture of whether you&apos;re moving forward
              or drifting. No dashboards. No clutter. Just the truth.
            </p>
            <ul className="space-y-2 text-sm md:text-base text-slate-300">
              <li>• Track streaks, cravings, relapses, and money saved.</li>
              <li>• Watch QuitCoins stack up as you keep showing up.</li>
              <li>
                • Use the snapshot to stay honest without getting overwhelmed.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 bg-slate-900/40 backdrop-blur-sm border-t border-slate-800">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Built for People Done With Excuses.
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <FeatureCard
            title="Track Every Win"
            text="See streaks, cravings, relapses, money saved — the truth, not excuses."
          />
          <FeatureCard
            title="Earn QuitCoins"
            text="Small wins add up. Get rewarded for showing up, even on the hard days."
          />
          <FeatureCard
            title="See Real Progress"
            text="Visual snapshots that keep you grounded, motivated, and moving."
          />
        </div>
      </section>

      {/* “HOW IT WORKS” SECTION */}
      <section className="py-24 px-6 text-center border-t border-slate-800">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          How The Raffle Works
        </h2>

        <div className="max-w-3xl mx-auto grid gap-10 md:grid-cols-3">
          <HowCard step="1" text="Drop your email. No spam. No nonsense." />
          <HowCard
            step="2"
            text="Once 25 people sign up, the first drawing begins."
          />
          <HowCard
            step="3"
            text="If you're selected, you get a full 7-day trial of QuitChampion."
          />
        </div>
      </section>

      {/* RAFFLE SIGNUP SECTION */}
      <section
        id="raffle"
        className="py-24 px-6 bg-slate-900/60 border-t border-slate-800"
      >
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-3">
          Join the Early Access Raffle
        </h2>
        <p className="text-center text-slate-300 max-w-xl mx-auto mb-4">
          You’ll be notified the moment the drawings begin. One email. Zero
          noise.
        </p>

        {raffleCount !== null && raffleThreshold !== null && (
          <p className="text-center text-xs text-slate-400 mb-6">
            {raffleCount} of {raffleThreshold} spots entered so far.
          </p>
        )}

        <div className="max-w-md mx-auto flex flex-col gap-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-mint-500 hover:bg-mint-400 disabled:bg-mint-700 text-slate-950 font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-mint-500/40 text-sm"
              >
                {loading ? "Entering..." : "Enter the Raffle"}
              </button>
            </form>
          ) : (
            <div className="text-center text-mint-400 font-semibold text-lg">
              {successMsg ||
                "You're in. Watch your inbox — you'll hear from us soon."}
            </div>
          )}

          {errorMsg && (
            <div className="text-center text-red-400 text-sm">{errorMsg}</div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Components ---------------- */

function FeatureCard({ title, text }) {
  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-md hover:shadow-xl hover:shadow-mint-500/10 transition-all">
      <h3 className="text-xl font-semibold mb-3 text-mint-400">{title}</h3>
      <p className="text-slate-300 text-sm">{text}</p>
    </div>
  );
}

function HowCard({ step, text }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-md hover:shadow-xl hover:shadow-mint-500/10 transition-all">
      <div className="text-mint-400 text-5xl font-bold mb-4">{step}</div>
      <p className="text-slate-300 font-medium text-sm">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-mint-400">{value}</div>
    </div>
  );
}
