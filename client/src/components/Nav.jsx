import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const { pathname } = useLocation();

  const linkBase =
    "text-sm md:text-base px-3 py-1 rounded-lg transition-all";
  const activeClasses =
    "bg-mint-500 text-slate-950 font-semibold shadow-md shadow-mint-500/40";
  const idleClasses =
    "text-slate-200 hover:text-mint-300 hover:bg-slate-800/60";

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-mint-500/10 border border-mint-500/50 flex items-center justify-center text-mint-400 font-bold text-lg">
            QC
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm md:text-base text-slate-50">
              QuitChampion
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Turn quitting into a game
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`${linkBase} ${
              pathname === "/" ? activeClasses : idleClasses
            }`}
          >
            Home
          </Link>
          <Link
            to="/contact"
            className={`${linkBase} ${
              pathname === "/contact" ? activeClasses : idleClasses
            }`}
          >
            Contact
          </Link>
          <Link
            to="/login"
            className={`${linkBase} ${
              pathname === "/login" ? activeClasses : idleClasses
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`${linkBase} ${
              pathname === "/register" ? activeClasses : idleClasses
            }`}
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
