import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://https://tns-website.onrender.com";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });
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

    if (form.password !== form.confirm) {
      setErrorMsg("Passwords don’t match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccessMsg("Account created.");
    } catch (err) {
      setErrorMsg(err.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Create your account
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          When QuitChampion launches, this login will carry across the app and
          the website.
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

        <div>
          <label
            htmlFor="confirm"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            value={form.confirm}
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
          {loading ? "Creating..." : "Create account"}
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
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-mint-400 hover:text-mint-300 font-semibold"
        >
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
