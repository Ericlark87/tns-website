import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
  const linkClass =
    'text-sm hover:text-blue-400 transition-colors';
  const activeClass = 'text-blue-400 font-semibold';

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight">
            <Link to="/">Stuff N Things LLC</Link>
          </h1>
          <nav>
            <ul className="flex flex-wrap gap-4">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ''}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ''}`
                  }
                >
                  Gift Shop
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/quitchampion"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ''}`
                  }
                >
                  QuitChampion
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ''}`
                  }
                >
                  Account
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ''}`
                  }
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeClass : ''}`
                  }
                >
                  Register
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-400">
          Stuff N Things LLC • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
