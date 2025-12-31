// client/src/pages/About.jsx
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
  maxWidth: "880px",
  borderRadius: "28px",
  padding: "2.3rem 2.2rem 2.2rem",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.96))",
  boxShadow: "0 28px 50px rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const h1Style = {
  fontSize: "1.6rem",
  fontWeight: 600,
  marginBottom: "0.7rem",
};

const bodyStyle = {
  fontSize: "0.9rem",
  color: "#e5e7eb",
  lineHeight: 1.6,
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

export default function About() {
  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <h1 style={h1Style}>About QuitChampion</h1>
        <p style={bodyStyle}>
          QuitChampion is a project of Stuff N&apos; Things LLC (doing business
          as T&amp;S Enterprises). It&apos;s not a social feed, not a
          gamified streak app, and not a replacement for medical help. It&apos;s
          a straight-up dashboard for your habits and the damage they do.
        </p>
        <p style={{ ...bodyStyle, marginTop: "0.9rem" }}>
          The site you&apos;re using now is the early access web layer. The
          mobile app is in active development. Accounts created here will become
          your login when the app ships.
        </p>

        <p style={linkStyle}>
          Want to try it?{" "}
          <Link to="/register" style={anchorStyle}>
            Create a free account.
          </Link>
        </p>
      </section>
    </main>
  );
}
