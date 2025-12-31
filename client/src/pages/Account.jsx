// client/src/pages/Account.jsx
import { useAuth } from "../AuthContext.jsx";
import { Link } from "react-router-dom";

const pageStyle = {
  minHeight: "calc(100vh - 64px)",
  display: "flex",
  justifyContent: "center",
  padding: "3rem 1.5rem 4rem",
  background:
    "radial-gradient(circle at top, #020617 0, #020617 40%, #000000 100%)",
  color: "#e5e7eb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const shellStyle = {
  width: "100%",
  maxWidth: "720px",
  borderRadius: "28px",
  padding: "2.3rem 2.2rem 2.2rem",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.96))",
  boxShadow: "0 28px 50px rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const h1Style = {
  fontSize: "1.5rem",
  fontWeight: 600,
  marginBottom: "0.9rem",
};

const bodyStyle = {
  fontSize: "0.9rem",
  color: "#e5e7eb",
  lineHeight: 1.6,
};

const infoRowStyle = {
  marginTop: "0.5rem",
  fontSize: "0.88rem",
};

const labelStyle = {
  opacity: 0.75,
};

const valueStyle = {
  fontWeight: 500,
};

const linkStyle = {
  marginTop: "1.3rem",
  fontSize: "0.86rem",
};

const anchorStyle = {
  color: "#fb923c",
  textDecoration: "none",
  fontWeight: 500,
};

export default function Account() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main style={pageStyle}>
        <section style={shellStyle}>
          <h1 style={h1Style}>Account</h1>
          <p style={bodyStyle}>
            You&apos;re not signed in. To manage your account, log in first.
          </p>
          <p style={linkStyle}>
            <Link to="/login" style={anchorStyle}>
              Go to sign-in.
            </Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <h1 style={h1Style}>Account</h1>
        <p style={bodyStyle}>
          Basic account details. More controls (danger zone, exports, etc.)
          will hang off this page later.
        </p>

        <div style={infoRowStyle}>
          <span style={labelStyle}>Email:&nbsp;</span>
          <span style={valueStyle}>{user.email}</span>
        </div>
      </section>
    </main>
  );
}
