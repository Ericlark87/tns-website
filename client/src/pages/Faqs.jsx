// client/src/pages/Faqs.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const pageStyle = {
  minHeight: "calc(100vh - 64px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3.5rem 1.5rem",
  background:
    "radial-gradient(circle at top, #111827 0, #020617 45%, #000000 100%)",
  color: "#e5e7eb",
};

const cardStyle = {
  width: "100%",
  maxWidth: "720px",
  borderRadius: "24px",
  padding: "2.5rem 2.5rem 2.25rem",
  background: "rgba(15, 23, 42, 0.96)",
  boxShadow: "0 22px 40px rgba(15, 23, 42, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const titleStyle = {
  fontSize: "1.8rem",
  fontWeight: 600,
  margin: "0 0 0.4rem",
};

const subtitleStyle = {
  fontSize: "0.95rem",
  color: "#9ca3af",
  margin: "0 0 1.7rem",
  lineHeight: 1.6,
};

const qaListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const qStyle = {
  fontWeight: 600,
  fontSize: "0.95rem",
  marginBottom: "0.25rem",
};

const aStyle = {
  fontSize: "0.9rem",
  color: "#cbd5f5",
  marginBottom: "1.1rem",
  lineHeight: 1.6,
};

const linkStyle = {
  color: "#fb923c",
  fontWeight: 500,
  textDecoration: "none",
};

const metaStyle = {
  marginTop: "1.5rem",
  fontSize: "0.75rem",
  color: "#6b7280",
};

export default function Faqs() {
  const { user } = useAuth();

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Questions, answered bluntly.</h1>
        <p style={subtitleStyle}>
          This is the stuff people usually ask before they commit. No marketing
          spin, just straight answers.
        </p>

        <ul style={qaListStyle}>
          <li>
            <p style={qStyle}>When will the QuitChampion app be available?</p>
            <p style={aStyle}>
              The mobile app is in active development. First public beta is
              planned for 2026. Accounts you create now will carry over
              seamlessly into the app.
            </p>
          </li>

          <li>
            <p style={qStyle}>Is QuitChampion free?</p>
            <p style={aStyle}>
              The core web account and dashboard are free. Premium will be a
              simple subscription later. Founding members from the early raffle
              get a permanent discount.
            </p>
          </li>

          <li>
            <p style={qStyle}>How does the early access raffle work?</p>
            <p style={aStyle}>
              Once we hit 25 registered accounts, the raffle pool unlocks. From
              there, one random user wins every 8 hours until launch. Winners
              get a 7-day trial of QuitChampion Premium after the app goes
              live.
            </p>
          </li>

          <li>
            <p style={qStyle}>Do I have to link my bank account?</p>
            <p style={aStyle}>
              Not now. Future versions may let you connect finances so
              QuitCoins can represent real money. If and when that happens, it
              will be opt-in only.
            </p>
          </li>

          <li>
            <p style={qStyle}>What habits can I track?</p>
            <p style={aStyle}>
              The first target is alcohol, nicotine, and related self-destruct
              habits. The engine under the hood will be flexible enough to track
              anything you want: sugar, gambling, doom-scrolling, whatever.
            </p>
          </li>

          <li>
            <p style={qStyle}>Who is behind QuitChampion?</p>
            <p style={aStyle}>
              QuitChampion is built by TNS Enterprises (Stuff N&apos; Things LLC)
              out of Tennessee. It&apos;s designed by someone who&apos;s been on both
              sides of the addiction fight, not a faceless health startup.
            </p>
          </li>
        </ul>

        <p style={metaStyle}>
          {user ? (
            <>
              Need actual help with your account or app? Head over to{" "}
              <Link to="/support" style={linkStyle}>
                Support
              </Link>{" "}
              and send a message.
            </>
          ) : (
            <>
              Ready to stop just reading about it?{" "}
              <Link to="/register" style={linkStyle}>
                Create a free account
              </Link>{" "}
              or{" "}
              <Link to="/login" style={linkStyle}>
                sign in
              </Link>{" "}
              if you already have one.
            </>
          )}
        </p>
      </section>
    </main>
  );
}
