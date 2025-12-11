// client/src/components/Header.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ? "text-teal-300" : "text-slate-200";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold text-slate-900">
            SN
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-100">
              Stuff N Things LLC
            </span>
            <span className="text-[10px] text-slate-400">
              Tools for real-life problems
            </span>
          </div>
        </Link>

        {/* Center: Nav */}
        <nav className="flex gap-4 text-xs sm:text-sm">
          <Link
            to="/"
            className={`${isActive(
              "/"
            )} hover:text-teal-300 transition-colors`}
          >
            Home
          </Link>
          <Link
            to="/quitchampion"
            className={`${isActive(
              "/quitchampion"
            )} hover:text-teal-300 transition-colors`}
          >
            QuitChampion
          </Link>
          <Link
            to="/about"
            className={`${isActive(
              "/about"
            )} hover:text-teal-300 transition-colors`}
          >
            About
          </Link>
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {!user && (
            <>
              <Link
                to="/login"
                className="px-3 py-1 rounded-md border border-slate-700 text-slate-100 hover:border-teal-400 hover:text-teal-300 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 rounded-md bg-teal-500 text-slate-900 font-semibold hover:bg-teal-400 transition-colors"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                to="/account"
                className="px-3 py-1 rounded-md border border-slate-700 text-slate-100 hover:border-teal-400 hover:text-teal-300 transition-colors"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
