// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Armory from "./pages/Armory";
import Contact from "./pages/Contact";
import { useAuth } from "./AuthContext";

function App() {
  const { user } = useAuth();

  // Simple flex shell so footer stays at bottom even if content is short
  const shellStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  const mainStyle = {
    flex: "1 0 auto",
  };

  return (
    <div className="app-shell" style={shellStyle}>
      <Nav />
      <main className="page-main" style={mainStyle}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          <Route
            path="/register"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Register />
            }
          />

          <Route
            path="/dashboard"
            element={
              user ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/armory"
            element={
              user ? <Armory /> : <Navigate to="/login" replace />
            }
          />

          <Route path="/contact" element={<Contact />} />

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
