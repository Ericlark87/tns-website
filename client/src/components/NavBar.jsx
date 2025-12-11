// src/components/NavBar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-neutral-900 text-white shadow-md border-b border-neutral-800">
      <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center">

        {/* Left side — Brand */}
        <Link to="/" className="text-2xl font-bold tracking-wide hover:text-purple-300 transition">
          QuitChampion
        </Link>

        {/* Right side — Navigation */}
        <div className="flex items-center gap-6 text-lg">
          {/* Gift Shop */}
          <Link to="/giftshop" className="hover:text-purple-300 transition">
            Gift Shop
          </Link>

          {/* Novel (placeholder) */}
          <Link to="/novel" className="hover:text-purple-300 transition">
            Novel
          </Link>

          {/* AUTH LOGIC */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="hover:text-purple-300 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-purple-300 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/account"
                className="hover:text-purple-300 transition"
              >
                Account
              </Link>
              <button
                onClick={logout}
                className="hover:text-red-300 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
