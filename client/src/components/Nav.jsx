// client/src/components/Nav.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const navStyle = {
  height: "64px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 1.5rem",
  backgroundColor: "#020617",
  borderBottom: "1px solid rgba(15,23,42,0.9)",
  position: "sticky",
  top: 0,
  zIndex: 40,
};

const brandRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const brandIconStyle = {
  width: "26px",
  height: "26px",
  borderRadius: "999px",
  background:
    "radial-gradient(circle at 30% 20%, #f97316 0, #ea580c 45%, #c2410c 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#0b1120",
};

const brandTextStyle = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#e5e7eb",
  textDecoration: "none",
};

const rightRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const linkStyle = {
  fontSize: "0.85rem",
  color: "#e5e7eb",
  textDecoration: "none",
};

const primaryButtonStyle = {
  padding: "0.4rem 0.9rem",
  borderRadius: "999px",
  border: "none",
  backgroundImage: "linear-gradient(135deg, #f97316, #fb923c)",
  color: "#0b1120",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
};

const menuButtonStyle = {
  padding: "0.35rem 0.7rem",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.7)",
  backgroundColor: "transparent",
  color: "#e5e7eb",
  fontSize: "0.82rem",
  cursor: "pointer",
};

const menuPanelStyle = {
  position: "absolute",
  right: "1.5rem",
  top: "56px",
  minWidth: "170px",
  borderRadius: "14px",
  padding: "0.5rem 0.4rem",
  backgroundColor: "#020617",
  border: "1px solid rgba(31,41,55,0.9)",
  boxShadow: "0 18px 30px rgba(0,0,0,0.7)",
};

const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "0.4rem 0.6rem",
  borderRadius: "999px",
  fontSize: "0.85rem",
  color: "#e5e7eb",
  textDecoration: "none",
  textAlign: "left",
};

export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <header style={navStyle}>
      <div style={brandRowStyle}>
        <Link to="/" style={brandTextStyle}>
          <span style={brandIconStyle}>QC</span>
        </Link>
        <Link to="/" style={brandTextStyle}>
          QuitChampion
        </Link>
      </div>

      <div style={rightRowStyle}>
        {/* LOGGED OUT, normal pages */}
        {!user && !isAuthRoute && (
          <>
            <Link to="/" style={linkStyle}>
              Home
            </Link>
            <Link to="/faq" style={linkStyle}>
              FAQ / Support
            </Link>
            <Link to="/login" style={linkStyle}>
              Sign in
            </Link>
            <Link to="/register">
              <button type="button" style={primaryButtonStyle}>
                Get started
              </button>
            </Link>
          </>
        )}

        {/* LOGGED OUT, on login/register – keep it simple */}
        {!user && isAuthRoute && (
          <Link to="/" style={linkStyle}>
            Home
          </Link>
        )}

        {/* LOGGED IN */}
        {user && (
          <>
            <button
              type="button"
              style={menuButtonStyle}
              onClick={() => setMenuOpen((open) => !open)}
            >
              Menu ▾
            </button>

            {menuOpen && (
              <div style={menuPanelStyle}>
                <Link
                  to="/dashboard"
                  style={menuItemStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/armory"
                  style={menuItemStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  Armory
                </Link>
                <Link
                  to="/settings"
                  style={menuItemStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/support"
                  style={menuItemStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  Support
                </Link>
                <Link
                  to="/account"
                  style={menuItemStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  type="button"
                  style={menuItemStyle}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
