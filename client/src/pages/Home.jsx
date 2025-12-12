// client/src/pages/Home.jsx  (raffle)
import React, { useState } from "react";
import { API_BASE_URL } from "../utils/api.js";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleEnter(e) {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!email) {
      setStatus({ type: "error", message: "Drop your email to enter the raffle." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/raffle/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.message || "Could not enter raffle." });
      } else {
        setStatus({
          type: "success",
          message: "You’re in. Watch your inbox — you’ll hear from us soon.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "Server error while entering raffle. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page--top">
      <div className="raffle-card">
        <h1 className="raffle-title">Join the Early Access Raffle</h1>
        <p className="raffle-subtitle">
          You’ll be notified the moment the drawings begin. One email. Zero noise.
        </p>
        <p className="raffle-counter">2 of 25 spots entered so far.</p>

        {status.message && (
          <div
            className={`alert ${
              status.type === "success" ? "alert--success" : "alert--error"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleEnter}>
          <div className="raffle-input-row">
            <input
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? "Entering…" : "Enter the raffle"}
          </button>
        </form>
      </div>
    </div>
  );
}
