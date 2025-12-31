// client/src/pages/Faq.jsx
import { useAuth } from "../AuthContext.jsx";

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

const cardStyle = {
  width: "100%",
  maxWidth: "720px",
  borderRadius: "24px",
  padding: "2.2rem 2rem",
  background: "rgba(15, 23, 42, 0.96)",
  boxShadow: "0 24px 36px rgba(15, 23, 42, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
};

const h1Style = {
  fontSize: "1.6rem",
  fontWeight: 600,
  marginBottom: "0.8rem",
};

const sectionTitleStyle = {
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "#9ca3af",
  marginTop: "1.4rem",
  marginBottom: "0.35rem",
};

const bodyStyle = {
  fontSize: "0.9rem",
  color: "#9ca3af",
  lineHeight: 1.6,
};

export default function Faq() {
  const { user } = useAuth();

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={h1Style}>FAQ & Support</h1>
        <p style={bodyStyle}>
          QuitChampion is for people who are done lying to themselves
          about their habits. This site is the early access hub for
          the mobile app. Your account and stats will carry over when
          the app ships.
        </p>

        <p style={sectionTitleStyle}>Who is this for?</p>
        <p style={bodyStyle}>
          Smokers, drinkers, vapers, late-night doom scrollers—anyone
          who wants to see their habit honestly and push it in the
          right direction. This is not medical advice and it&apos;s
          not group therapy. It&apos;s stats, pressure, and
          accountability.
        </p>

        <p style={sectionTitleStyle}>Why can&apos;t I log in?</p>
        <p style={bodyStyle}>
          Make sure you registered with the same email you&apos;re
          trying to sign in with. If you reset your browser or
          switched devices, your account is still there—cookies just
          expired. Signing in again will restore your dashboard.
        </p>

        <p style={sectionTitleStyle}>
          What if I still can&apos;t get in?
        </p>
        <p style={bodyStyle}>
          You can email support directly at{" "}
          <strong>support@thingsnstuff.fun</strong>. Include:
          <br />
          • The email you registered with
          <br />
          • What page you were on
          <br />
          • What you clicked and what happened (screenshots help)
        </p>

        <p style={sectionTitleStyle}>Is the language always harsh?</p>
        <p style={bodyStyle}>
          No. By default, the site is direct but neutral. Savage Mode
          is optional and opt-in. You&apos;ll have to explicitly turn
          it on in your settings later. Until then, everything stays
          PG-13 blunt, not abusive.
        </p>

        <p style={sectionTitleStyle}>
          I&apos;m already logged in. Where do I go?
        </p>
        <p style={bodyStyle}>
          Go to your{" "}
          <strong>{user ? "Dashboard" : "Sign in"}</strong> to see
          your current run, HP bar, and daily limits. From there,
          you&apos;ll be able to log hits and track how much your
          habit is really costing you in money, time, and health
          points.
        </p>
      </section>
    </main>
  );
}
