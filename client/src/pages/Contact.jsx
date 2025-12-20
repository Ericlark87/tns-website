// client/src/pages/Contact.jsx
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { supportApi } from "../api";

export default function Contact() {
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setBusy(true);
      setStatus("");
      await supportApi("/contact", {
        method: "POST",
        body: JSON.stringify({ email, message }),
      });
      setStatus("Message sent. I’ll get back to you as soon as I can.");
      setMessage("");
    } catch (err) {
      console.error("Support request failed", err);
      setStatus(err.message || "Could not send message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-support">
      <div className="qc-page-inner support-grid">
        <section className="support-card">
          <h1 className="support-title">
            {user ? "Need backup?" : "Locked out or confused?"}
          </h1>
          <p className="support-subtitle">
            {user
              ? "Send a message if something’s broken, confusing, or just feels off."
              : "If you can’t log in or something looks wrong, start here."}
          </p>

          <form className="support-form" onSubmit={handleSubmit}>
            <label className="support-label">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="support-input"
                placeholder="you@email.com"
              />
            </label>

            <label className="support-label">
              What’s going on?
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="support-textarea"
                rows={5}
                placeholder="Describe what you were doing and what broke."
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="qc-btn qc-btn-primary support-submit"
            >
              {busy ? "Sending..." : "Send message"}
            </button>

            {status && <p className="support-status">{status}</p>}
          </form>

          <p className="support-footnote">
            Or email directly:{" "}
            <a href="mailto:support@thingsnstuff.fun">
              support@thingsnstuff.fun
            </a>
            .
          </p>
        </section>

        <section className="support-card support-faq">
          <h2 className="support-faq-title">Quick FAQ</h2>
          <ul className="support-faq-list">
            <li>
              <strong>I never got the verification or raffle email.</strong>
              <span>
                &nbsp;Check spam/junk and search for “QuitChampion” or
                “thingsnstuff”. If nothing shows, contact support with the email
                you used.
              </span>
            </li>
            <li>
              <strong>I forgot my password.</strong>
              <span>
                &nbsp;Password reset is coming with the app launch. For now,
                reach out via the form above and I’ll help untangle it.
              </span>
            </li>
            <li>
              <strong>Is the app live yet?</strong>
              <span>
                &nbsp;Not yet. Mobile app is in active development. First public
                beta is planned for 2026, and raffle winners get first shot at
                Premium trials.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
