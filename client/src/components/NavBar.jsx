// client/src/components/NavBar.jsx
import { NavLink } from "react-router-dom";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "text-sm font-medium transition-colors",
          "text-slate-200 hover:text-orange-300",
          isActive && "text-orange-400 underline underline-offset-4",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function NavBar() {
  return (
    <header className="bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-orange-500 text-slate-950 text-sm font-extrabold shadow-lg shadow-orange-900/50">
            QC
            <span className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-orange-400/60 ring-offset-2 ring-offset-slate-950" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-50 tracking-wide">
              QuitChampion
            </span>
            <span className="text-[11px] text-slate-400">
              Turn quitting into a game.
            </span>
          </div>
        </a>

        {/* Links */}
        <div className="flex items-center gap-6">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/contact">Contact</NavItem>
          <NavItem to="/login">Login</NavItem>
          <NavItem to="/register">Register</NavItem>
        </div>
      </nav>
    </header>
  );
}
