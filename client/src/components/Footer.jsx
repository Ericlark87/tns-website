// client/src/components/Footer.jsx

import { Link } from "react-router-dom";

function Footer() {
  const footerStyle = {
    borderTop: "1px solid rgba(148, 163, 184, 0.3)",
    padding: "1.25rem 1.5rem",
    fontSize: "0.75rem",
    lineHeight: 1.5,
    color: "rgba(148, 163, 184, 0.9)",
    background:
      "radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(2,6,23,1))",
  };

  const innerStyle = {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "1rem",
  };

  const columnStyle = {
    minWidth: "220px",
    maxWidth: "360px",
  };

  const strongStyle = {
    fontWeight: 600,
    color: "rgba(226, 232, 240, 0.95)",
  };

  return (
    <footer className="site-footer" style={footerStyle}>
      <div style={innerStyle}>
        <div style={columnStyle}>
          <div style={strongStyle}>QuitChampion status</div>
          <div>
            Mobile app is in active development. First public beta is
            planned for 2026. Raffle winners will get early access when
            the app drops.
          </div>
        </div>

        <div style={columnStyle}>
          <div style={strongStyle}>Stuff N Things LLC · T&S Enterprises</div>
          <div>
            QuitChampion is a project of Stuff N Things LLC, doing
            business as T&amp;S Enterprises. All rights reserved.
          </div>
          <div style={{ marginTop: "0.25rem" }}>
            Not medical advice. Talk to a doctor if you need clinical
            help; this thing is for stats, pressure, and accountability.
          </div>
        </div>

        <div style={columnStyle}>
          <div style={strongStyle}>Links</div>
          <div>
            <Link to="/" style={{ color: "inherit" }}>
              Home
            </Link>{" "}
            ·{" "}
            <Link to="/contact" style={{ color: "inherit" }}>
              Contact / FAQ
            </Link>{" "}
            ·{" "}
            <a
              href="mailto:support@thingsnstuff.fun"
              style={{ color: "inherit" }}
            >
              Email support
            </a>
          </div>
          <div style={{ marginTop: "0.25rem" }}>
            © {new Date().getFullYear()} QuitChampion.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
