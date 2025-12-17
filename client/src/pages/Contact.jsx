// client/src/pages/Contact.jsx
import React, { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const [infoShown, setInfoShown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const to = "support@thingsnstuff.fun";
    const subject =
      form.subject.trim() || "QuitChampion support / feedback";
    const bodyLines = [
      `From: ${form.email || "(no email entered)"}`,
      "",
      form.message || "(no message entered)",
    ];

    const mailto = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      bodyLines.join("\n")
    )}`;

    // This opens THEIR email app with everything pre-filled.
    window.location.href = mailto;

    setInfoShown(true);
  };

  return (
    <main className="page page--top">
      <section className="auth-card" aria-labelledby="contact-title">
        <p className="auth-eyebrow">Support</p>
        <h1 id="contact-title" className="auth-title">
          Contact QuitChampion
        </h1>
        <p className="auth-subtitle">
          This doesn&apos;t send anything from our servers. When you hit
          &quot;Send message&quot;, your own email app opens with everything
          filled out, addressed to{" "}
          <strong>support@thingsnstuff.fun</strong>. You can edit it and
          then send.
        </p>

        {infoShown && (
          <div className="alert alert--success">
            Your mail client should have opened. If it didn&apos;t, just copy
            the text below and email{" "}
            <strong>support@thingsnstuff.fun</strong> manually.
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Your email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              className="input"
              placeholder="What do you need help with?"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className="input"
              rows={4}
              placeholder="Give as much detail as you want: screenshots, device, what you were doing, etc."
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary">
            Send message
          </button>

          <p className="auth-footer" style={{ marginTop: 10 }}>
            Messages go to{" "}
            <a href="mailto:support@thingsnstuff.fun">
              support@thingsnstuff.fun
            </a>{" "}
            and forward to the main QuitChampion inbox. No newsletter, no
            spam — just support.
          </p>
        </form>
      </section>
    </main>
  );
}
