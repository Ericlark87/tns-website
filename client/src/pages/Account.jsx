import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50 mb-1">
          Your account
        </h1>
        <p className="text-sm text-slate-400">
          One login for both the website and the QuitChampion app. This account
          will eventually hold your QuitCoins, your runs, and your unlocks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3 text-sm">
          <div>
            <div className="text-xs text-slate-400">Email</div>
            <div className="text-sm text-slate-100">{user.email}</div>
          </div>

          <div className="text-[11px] text-slate-500">
            Coming soon:
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Password change and reset</li>
              <li>2FA and extra security options</li>
              <li>Themes / color schemes for the app</li>
              <li>Device history and active sessions</li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 inline-flex items-center justify-center rounded border border-slate-600 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-200"
          >
            Log out
          </button>
        </div>

        <div className="rounded-xl border border-emerald-700/60 bg-emerald-500/5 p-4 text-xs text-slate-200 space-y-2">
          <div className="font-semibold text-emerald-300 text-sm">
            You&apos;re early
          </div>
          <p>
            The backend, token logic, and core routes are being wired up now.
            When desktop / mobile builds of QuitChampion go live, this account
            will be your key — no extra signup needed.
          </p>
          <p>
            For now, hang on to this login and keep an eye on the
            QuitChampion page as pieces light up.
          </p>
        </div>
      </div>
    </div>
  );
}
