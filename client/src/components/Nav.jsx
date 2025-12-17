import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Nav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const linkClass = (path) =>
    `nav-link ${pathname === path ? "nav-link--active" : ""}`;

  return (
    <header className="navbar">
      {/* Left: logo + tagline */}
      <div className="navbar-left">
        <Link to="/" className="nav-logo-mark">
          QC
        </Link>
        <div className="nav-logo-text">
          <span className="nav-logo-title">QuitChampion</span>
          <span className="nav-logo-subtitle">Turn quitting into a game</span>
        </div>
      </div>

      {/* Right: links + auth */}
      <nav className="nav-links">
        <Link to="/" className={linkClass("/")}>
          Home
        </Link>

        <Link to="/contact" className={linkClass("/contact")}>
          Contact
        </Link>

        {user && (
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
        )}

        {user ? (
          <>
            {/* show email as a pill, same style as active link */}
            <span className="nav-link nav-link--active">
              {user.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="nav-link"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={linkClass("/login")}>
              Login
            </Link>
            <Link to="/register" className={linkClass("/register")}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
