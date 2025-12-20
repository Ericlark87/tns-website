// client/src/components/Nav.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Nav() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const linkClass = ({ isActive }) =>
    "qc-nav-link" + (isActive ? " qc-nav-link-active" : "");

  return (
    <header className="qc-header">
      <nav className="qc-nav">
        <div className="qc-nav-left">
          <Link to="/" className="qc-logo">
            <span className="qc-logo-mark">QC</span>
            <span className="qc-logo-text">QuitChampion</span>
          </Link>
        </div>

        <div className="qc-nav-right">
          {!user && (
            <>
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/support" className={linkClass}>
                FAQ / Support
              </NavLink>
              <NavLink to="/login" className={linkClass}>
                Sign in
              </NavLink>
              <NavLink to="/register" className="qc-nav-cta">
                Get started
              </NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/armory" className={linkClass}>
                Armory
              </NavLink>
              <NavLink to="/support" className={linkClass}>
                Support
              </NavLink>
              <span className="qc-nav-email">{user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="qc-nav-logout"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Nav;
