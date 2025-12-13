// client/src/components/Nav.jsx
import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function Nav() {
  const navLinkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " nav-link--active" : "");

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-logo-mark">
          QC
        </Link>
        <div className="nav-logo-text">
          <span className="nav-logo-title">QuitChampion</span>
          <span className="nav-logo-subtitle">Turn quitting into a game</span>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/contact" className={navLinkClass}>
          Contact
        </NavLink>
        <NavLink to="/login" className={navLinkClass}>
          Login
        </NavLink>
        <NavLink to="/register" className={navLinkClass}>
          Register
        </NavLink>
      </nav>
    </header>
  );
}
