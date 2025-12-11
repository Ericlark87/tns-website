import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5200";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setSuccessMsg("Logged in.");
    } catch (err) {
      setErrorMsg(err.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Sign in</h1>
        <p className="text-slate-300 text-sm md:text-base">
          Log into your QuitChampion account. For now this is early wiring —
          once the app launches, this becomes your main sign-in.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mint-500 hover:bg-mint-400 disabled:bg-mint-700 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-mint-500/40"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {errorMsg && (
        <p className="text-sm text-red-400">
          {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-mint-400">
          {successMsg}
        </p>
      )}

      <p className="text-sm text-slate-400">
        Don&apos;t have an account yet?{" "}
        <Link
          to="/register"
          className="text-mint-400 hover:text-mint-300 font-semibold"
        >
          Create one
        </Link>
        .
      </p>
    </div>
  );
}
