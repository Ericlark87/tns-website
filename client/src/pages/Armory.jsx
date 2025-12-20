// client/src/pages/Armory.jsx

import { Link } from "react-router-dom";

function Armory() {
  const cardStyle = {
    borderRadius: "1.25rem",
    padding: "1.4rem 1.6rem",
    background:
      "radial-gradient(circle at top left, rgba(30,64,175,0.6), rgba(15,23,42,0.97))",
    border: "1px solid rgba(148,163,184,0.4)",
    color: "rgba(226,232,240,0.96)",
    fontSize: "0.9rem",
  };

  const titleStyle = {
    fontSize: "1.6rem",
    marginBottom: "0.6rem",
    color: "rgba(226,232,240,0.98)",
  };

  const sectionTitleStyle = {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(148,163,184,0.9)",
    marginBottom: "0.4rem",
  };

  const listStyle = {
    marginTop: "0.4rem",
    paddingLeft: "1.2rem",
  };

  return (
    <div className="page page-armory">
      <div className="page-inner" style={{ maxWidth: "820px", margin: "0 auto" }}>
        <h1 style={titleStyle}>Armory &amp; gift shop</h1>
        <p style={{ color: "rgba(148,163,184,0.96)", fontSize: "0.95rem" }}>
          Gear up like a gladiator. This is where extra armor, cosmetics, and
          premium features unlock. No loot boxes, no upsell ladder—just clear
          options and a straight trade: a few dollars for tools that actually
          help.
        </p>

        <div style={{ marginTop: "1.25rem", display: "grid", gap: "1rem" }}>
          {/* Free plan */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Free plan (what you already get)</div>
            <ul style={listStyle}>
              <li>Track one habit (alcohol, nicotine, etc.).</li>
              <li>Streak counter: days clean vs slipped.</li>
              <li>
                Money saved estimate so you can see what you&apos;re buying back.
              </li>
              <li>
                A cold-truth mode that shows your real numbers with no fluff.
              </li>
              <li>Private oath surfaced at risky moments.</li>
              <li>Failure autopsy after each relapse.</li>
            </ul>
          </section>

          {/* Pro plan */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>QuitChampion Pro (planned)</div>
            <ul style={listStyle}>
              <li>Track multiple habits at once.</li>
              <li>Streak insurance credits that absorb the occasional slip.</li>
              <li>
                Buddy system with mutual unlock—real chat once both people opt in.
              </li>
              <li>Deep stats: triggers, times, patterns, and danger zones.</li>
              <li>Custom reminders around your worst hours.</li>
              <li>Full history + export of your records.</li>
            </ul>
            <p style={{ marginTop: "0.6rem" }}>
              Pricing will be simple: one monthly or yearly subscription, no
              nickel-and-diming, no &quot;surprise&quot; tiers. Founding members
              from the early raffle get a permanent discount.
            </p>
          </section>

          {/* Savage mode talk */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Savage mode (tone pack)</div>
            <p>
              Some people want gentle encouragement. Others want a coach who
              talks like your angriest friend after you screw up for the tenth
              time. Savage mode will be an optional tone pack layered on top of
              the app:
            </p>
            <ul style={listStyle}>
              <li>
                Explicit, no-mercy reminders when you hover near danger hours.
              </li>
              <li>
                Rated-R language possible, but only if you opt in and confirm
                you&apos;re cool with it.
              </li>
              <li>
                Never attacks your worth as a person—only the habit you&apos;re
                trying to kill.
              </li>
              <li>
                Can be turned off instantly if it ever crosses from motivating
                to unhelpful.
              </li>
            </ul>
            <p style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>
              We&apos;ll tie this into your dashboard coaching tone setting so
              your account remembers exactly how hard you want to be pushed.
            </p>
          </section>

          {/* Back link */}
          <section style={cardStyle}>
            <p style={{ marginBottom: "0.5rem" }}>
              For now, there&apos;s nothing to buy yet. We&apos;re wiring the
              rails first: accounts, raffle, dashboard, and app countdown.
            </p>
            <Link
              to="/dashboard"
              style={{
                display: "inline-block",
                padding: "0.6rem 1.1rem",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, #22c55e, #4ade80, #22c55e)",
                color: "#052e16",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Back to dashboard
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Armory;
