import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getHabitStats,
  getRaffleStats,
  enterRaffle,
  postHabitCheckIn,
  postHabitEvent,
} from "../api.js";
import { useAuth } from "../AuthContext.jsx";

function formatDateTime(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function labelEvent(ev) {
  const t = ev?.type;
  if (t === "checkin") return "Check-in";
  if (t === "use") return "Use";
  if (t === "resist") return "Resist";
  return "Event";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ---- auth truth (don’t pretend) ----
  const isAuthed = !!(user && (user.email || user.id));
  const email = user?.email || "";

  // ---- data ----
  const [habitStats, setHabitStats] = useState(null);
  const [raffleStats, setRaffleStats] = useState(null);

  const [habitError, setHabitError] = useState("");
  const [raffleError, setRaffleError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent infinite re-fetch loops
  const lastLoadedKeyRef = useRef("");

  // ---- check-in modal ----
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinMood, setCheckinMood] = useState("good"); // good | meh | bad
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinToast, setCheckinToast] = useState("");

  // ---- event log modal (use/resist) ----
  const [eventOpen, setEventOpen] = useState(false);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [eventType, setEventType] = useState(null); // "use" | "resist"
  const [eventQty, setEventQty] = useState(1);
  const [eventNote, setEventNote] = useState("");

  // ---- history UI ----
  const [showFullHistory, setShowFullHistory] = useState(false);
  const historyRef = useRef(null);

  // ---- raffle UI ----
  const [raffleSubmitting, setRaffleSubmitting] = useState(false);

  // Hard lock against multi-fire (double click, key repeat, etc.)
  const raffleEnterLockRef = useRef(false);

  // Persisted "entered" flag (belt + suspenders). Server truth still wins on loadAll.
  const [raffleEnteredPersisted, setRaffleEnteredPersisted] = useState(() => {
    try {
      return localStorage.getItem("qc_raffle_entered_beta_round_1") === "1";
    } catch {
      return false;
    }
  });

  const styles = useMemo(() => {
    const blue = "#1f6feb"; // innocent blue
    const orange = "#ff8a00"; // gladiator orange
    const ink = "#0b1220";

    return {
      page: {
        minHeight: "calc(100vh - 0px)",
        padding: "28px 16px 60px",
        background:
          "radial-gradient(1100px 700px at 18% 16%, rgba(31,111,235,0.18), rgba(255,255,255,0) 60%)," +
          "radial-gradient(1000px 680px at 82% 20%, rgba(255,138,0,0.18), rgba(255,255,255,0) 58%)," +
          "linear-gradient(180deg, #f7fbff, #ffffff 60%, #f6f9ff)",
        color: ink,
      },

      container: { maxWidth: 980, margin: "0 auto" },

      headerRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 18,
      },

      titleBlock: { display: "flex", flexDirection: "column", gap: 6 },

      h1: {
        fontSize: 28,
        lineHeight: 1.15,
        margin: 0,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },

      sub: { margin: 0, fontSize: 14, color: "rgba(11,18,32,0.72)" },

      pillRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 6,
      },

      pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: "rgba(31,111,235,0.10)",
        color: blue,
        border: "1px solid rgba(31,111,235,0.18)",
      },

      pillOrange: {
        background: "rgba(255,138,0,0.12)",
        color: "#b15500",
        border: "1px solid rgba(255,138,0,0.22)",
      },

      actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        flexWrap: "wrap",
      },

      btn: {
        appearance: "none",
        border: "1px solid rgba(11,18,32,0.14)",
        background: "#ffffff",
        color: ink,
        padding: "8px 12px",
        borderRadius: 10,
        fontWeight: 800,
        fontSize: 13,
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(11,18,32,0.06)",
      },

      btnBlue: {
        border: "1px solid rgba(31,111,235,0.25)",
        background: blue,
        color: "#fff",
      },

      btnOrange: {
        border: "1px solid rgba(255,138,0,0.35)",
        background: orange,
        color: "#111",
      },

      btnSoft: {
        border: "1px solid rgba(11,18,32,0.12)",
        background: "rgba(255,255,255,0.9)",
        color: ink,
      },

      btnDanger: {
        border: "1px solid rgba(210, 40, 40, 0.25)",
        background: "rgba(210, 40, 40, 0.10)",
        color: "rgba(140,0,0,0.95)",
      },

      grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        alignItems: "stretch",
        marginTop: 10,
      },

      card: {
        background: "rgba(255,255,255,0.86)",
        border: "1px solid rgba(11,18,32,0.10)",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 18px 50px rgba(11,18,32,0.08)",
        backdropFilter: "blur(8px)",
      },

      cardTitle: {
        margin: 0,
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: "0.02em",
        color: "rgba(11,18,32,0.72)",
        textTransform: "uppercase",
      },

      heroNumber: {
        fontSize: 44,
        fontWeight: 900,
        margin: "8px 0 2px",
        letterSpacing: "-0.03em",
      },

      heroLabel: {
        margin: 0,
        fontSize: 13,
        color: "rgba(11,18,32,0.68)",
        fontWeight: 700,
      },

      statRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginTop: 12,
      },

      statBox: {
        borderRadius: 12,
        padding: 12,
        border: "1px solid rgba(11,18,32,0.10)",
        background: "rgba(31,111,235,0.06)",
      },

      statBoxOrange: { background: "rgba(255,138,0,0.08)" },

      statNum: { margin: 0, fontSize: 22, fontWeight: 900 },

      statSmall: {
        margin: 0,
        marginTop: 2,
        fontSize: 12,
        color: "rgba(11,18,32,0.70)",
        fontWeight: 700,
      },

      ctaRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 12,
      },

      note: {
        marginTop: 10,
        fontSize: 12,
        color: "rgba(11,18,32,0.66)",
        lineHeight: 1.45,
      },

      error: {
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255, 72, 72, 0.10)",
        border: "1px solid rgba(255, 72, 72, 0.20)",
        color: "rgba(140, 0, 0, 0.92)",
        fontWeight: 800,
        fontSize: 13,
      },

      toast: {
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(31,111,235,0.10)",
        border: "1px solid rgba(31,111,235,0.18)",
        color: "rgba(11,18,32,0.88)",
        fontWeight: 900,
        fontSize: 13,
      },

      // history list
      historyWrap: {
        marginTop: 12,
        borderTop: "1px solid rgba(11,18,32,0.10)",
        paddingTop: 12,
      },

      historyHeaderRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      },

      historyTitle: {
        margin: 0,
        fontSize: 12,
        fontWeight: 900,
        color: "rgba(11,18,32,0.72)",
        textTransform: "uppercase",
        letterSpacing: "0.02em",
      },

      historyList: {
        marginTop: 10,
        display: "grid",
        gap: 8,
      },

      historyItem: {
        border: "1px solid rgba(11,18,32,0.10)",
        background: "rgba(11,18,32,0.02)",
        borderRadius: 12,
        padding: "10px 10px",
      },

      historyTop: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 10,
      },

      historyLabel: { margin: 0, fontWeight: 900, fontSize: 13 },
      historyTime: { margin: 0, fontSize: 12, color: "rgba(11,18,32,0.65)", fontWeight: 800 },
      historyNote: { margin: "6px 0 0", fontSize: 12, color: "rgba(11,18,32,0.72)", fontWeight: 700 },

      // modal
      overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      },

      modal: {
        width: "100%",
        maxWidth: 540,
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(11,18,32,0.12)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 30px 90px rgba(0,0,0,0.22)",
        backdropFilter: "blur(10px)",
      },

      modalTitle: { margin: 0, fontSize: 18, fontWeight: 900 },

      modalSub: {
        margin: "6px 0 0",
        fontSize: 13,
        color: "rgba(11,18,32,0.70)",
        lineHeight: 1.45,
      },

      moodRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        marginTop: 14,
      },

      moodBtn: {
        padding: "10px 10px",
        borderRadius: 12,
        border: "1px solid rgba(11,18,32,0.12)",
        background: "#fff",
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 10px 24px rgba(11,18,32,0.06)",
      },

      moodActive: {
        border: "1px solid rgba(31,111,235,0.30)",
        background: "rgba(31,111,235,0.08)",
      },

      textarea: {
        marginTop: 12,
        width: "100%",
        minHeight: 90,
        resize: "vertical",
        borderRadius: 12,
        border: "1px solid rgba(11,18,32,0.14)",
        padding: 10,
        fontSize: 13,
        outline: "none",
      },

      input: {
        marginTop: 8,
        width: "100%",
        borderRadius: 12,
        border: "1px solid rgba(11,18,32,0.14)",
        padding: "10px 10px",
        fontSize: 13,
        outline: "none",
      },

      label: {
        marginTop: 12,
        fontSize: 12,
        fontWeight: 900,
        color: "rgba(11,18,32,0.75)",
      },

      modalActions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 12,
      },
    };
  }, []);

  async function loadAll(force = false) {
    if (!isAuthed) return;

    const key = `${email || "user"}:${force ? "force" : "normal"}`;
    if (!force && lastLoadedKeyRef.current === key) return;
    lastLoadedKeyRef.current = key;

    setLoading(true);
    setHabitError("");
    setRaffleError("");

    try {
      const [h, r] = await Promise.all([getHabitStats(), getRaffleStats()]);
      setHabitStats(h || null);
      setRaffleStats(r || null);

      // Persist raffle entered flag based on SERVER truth
      const serverHasEntry = !!r?.userHasEntry;
      setRaffleEnteredPersisted(serverHasEntry);
      try {
        localStorage.setItem("qc_raffle_entered_beta_round_1", serverHasEntry ? "1" : "0");
      } catch {
        // ignore
      }
    } catch (err) {
      const msg = err?.message || "Failed loading dashboard.";
      setHabitError(msg);
      setRaffleError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthed) loadAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, email]);

  function openCheckin() {
    if (!isAuthed) return navigate("/login");
    setCheckinMood("good");
    setCheckinNote("");
    setCheckinToast("");
    setCheckinOpen(true);
  }

  function openEvent(which) {
    if (!isAuthed) return navigate("/login");
    setEventType(which);
    setEventQty(1);
    setEventNote("");
    setEventOpen(true);
  }

  async function submitCheckin() {
    if (!isAuthed) return navigate("/login");

    setCheckinSubmitting(true);
    setHabitError("");
    setCheckinToast("");

    try {
      await postHabitCheckIn({
        mood: checkinMood,
        note: (checkinNote || "").trim().slice(0, 500),
        ts: Date.now(),
      });

      setCheckinOpen(false);
      setCheckinToast("✅ Check-in saved.");
      await loadAll(true);
    } catch (err) {
      setHabitError(err?.message || "Check-in failed.");
    } finally {
      setCheckinSubmitting(false);
    }
  }

  async function submitEvent() {
    if (!isAuthed) return navigate("/login");
    if (eventType !== "use" && eventType !== "resist") return;

    setEventSubmitting(true);
    setHabitError("");
    setCheckinToast("");

    try {
      await postHabitEvent({
        type: eventType,
        quantity: clamp(Number(eventQty || 1), 1, 999),
        note: (eventNote || "").trim().slice(0, 500),
        ts: Date.now(),
      });

      setEventOpen(false);
      await loadAll(true);
    } catch (err) {
      setHabitError(err?.message || "Event log failed.");
    } finally {
      setEventSubmitting(false);
    }
  }

  // ---- raffle values (match server response keys) ----
  const rafflePool = Number(raffleStats?.targetCount ?? 25) || 25;
  const raffleInRound = Number(raffleStats?.entryCount ?? 0) || 0;
  const raffleSpotsLeft =
    Number(raffleStats?.spotsLeft ?? Math.max(rafflePool - raffleInRound, 0)) || 0;

  const raffleUserHasEntry = !!raffleStats?.userHasEntry || raffleEnteredPersisted;
  const yourEntries = raffleUserHasEntry ? 1 : 0; // current system: 1 max per round

  async function handleEnterRaffle() {
    if (!isAuthed) return navigate("/login");
    if (raffleUserHasEntry) return;

    if (raffleEnterLockRef.current) return;
    raffleEnterLockRef.current = true;

    setRaffleSubmitting(true);
    setRaffleError("");

    try {
      await enterRaffle({});

      setRaffleEnteredPersisted(true);
      try {
        localStorage.setItem("qc_raffle_entered_beta_round_1", "1");
      } catch {}

      await loadAll(true);
    } catch (err) {
      const raw = err?.message || "Raffle entry failed.";
      const msg = raw.toLowerCase();

      if (
        msg.includes("already have an entry") ||
        msg.includes("duplicate") ||
        msg.includes("already exists") ||
        msg.includes("duplicate entry")
      ) {
        setRaffleEnteredPersisted(true);
        try {
          localStorage.setItem("qc_raffle_entered_beta_round_1", "1");
        } catch {}
        await loadAll(true);
        return;
      }

      setRaffleError(raw);
    } finally {
      setRaffleSubmitting(false);
      setTimeout(() => {
        raffleEnterLockRef.current = false;
      }, 800);
    }
  }

  // --- stats mapping ---
  const streakNow = Number(habitStats?.currentStreak ?? habitStats?.streak ?? 0) || 0;
  const streakBest = Number(habitStats?.longestStreak ?? habitStats?.bestStreak ?? 0) || 0;

  const lastCheckin =
    habitStats?.lastCheckInAt ||
    habitStats?.lastCheckinAt ||
    habitStats?.lastCheckIn ||
    habitStats?.lastCheckin ||
    null;

  const streakCopy =
    streakNow <= 0 ? "Your first check-in starts your streak." : `Day ${streakNow}. Keep it alive.`;

  // --- history ---
  const allEvents = Array.isArray(habitStats?.recentEvents) ? habitStats.recentEvents : [];
  const visibleEvents = showFullHistory ? allEvents : allEvents.slice(0, 25);

  function toggleHistory() {
    setShowFullHistory((v) => !v);
    setTimeout(() => {
      if (historyRef.current) historyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div style={styles.titleBlock}>
            <h1 style={styles.h1}>
              {isAuthed ? `Welcome back, ${email || "friend"}.` : "Welcome."}
            </h1>
            <p style={styles.sub}>
              {isAuthed ? "Check-in, log events, and enter the beta raffle." : "Sign in to start tracking."}
            </p>

            <div style={styles.pillRow}>
              <span style={styles.pill}>{isAuthed ? "ACCOUNT: ACTIVE" : "ACCOUNT: GUEST"}</span>
              <span style={{ ...styles.pill, ...styles.pillOrange }}>PLAN: FREE BETA</span>
              <span style={styles.pill}>MOBILE APP: COMING SOON</span>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              style={styles.btn}
              onClick={() => loadAll(true)}
              disabled={!isAuthed || loading}
              title={!isAuthed ? "Sign in first" : "Refresh"}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>

            <Link
              to="/settings"
              style={{
                ...styles.btn,
                ...styles.btnBlue,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Settings
            </Link>

            <button type="button" style={{ ...styles.btn, ...styles.btnOrange }} onClick={openCheckin}>
              Check in
            </button>
          </div>
        </div>

        {!isAuthed ? (
          <div style={styles.card}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 16 }}>You’re not signed in.</p>
            <p style={{ margin: "8px 0 0", color: "rgba(11,18,32,0.72)" }}>
              Sign in to use check-ins, event logging, streaks, and the beta raffle.
            </p>
            <div style={styles.ctaRow}>
              <Link to="/login" style={{ ...styles.btn, ...styles.btnBlue, textDecoration: "none" }}>
                Sign in
              </Link>
              <Link to="/register" style={{ ...styles.btn, textDecoration: "none" }}>
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {/* HABIT CARD */}
              <div style={styles.card}>
                <p style={styles.cardTitle}>Your habit profile & streaks</p>

                <div style={styles.statRow}>
                  <div style={styles.statBox}>
                    <p style={styles.heroNumber}>{streakNow}</p>
                    <p style={styles.heroLabel}>Current streak (days)</p>
                  </div>

                  <div style={{ ...styles.statBox, ...styles.statBoxOrange }}>
                    <p style={styles.statNum}>{streakBest}</p>
                    <p style={styles.statSmall}>Longest streak (days)</p>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "rgba(11,18,32,0.78)" }}>
                    {streakCopy}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(11,18,32,0.66)" }}>
                    Last check-in: <strong>{formatDateTime(lastCheckin)}</strong>
                  </p>
                </div>

                <div style={styles.ctaRow}>
                  <button type="button" style={{ ...styles.btn, ...styles.btnOrange }} onClick={openCheckin}>
                    Check in
                  </button>

                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnSoft }}
                    onClick={() => openEvent("resist")}
                  >
                    Log resist
                  </button>

                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnDanger }}
                    onClick={() => openEvent("use")}
                  >
                    Log use
                  </button>
                </div>

                {habitError ? <div style={styles.error}>Habit: {habitError}</div> : null}
                {checkinToast ? <div style={styles.toast}>{checkinToast}</div> : null}

                <div style={styles.note}>
                  Check-in = “how you’re doing.” Log use/resist = “what happened.”
                </div>

                {/* HISTORY */}
                <div style={styles.historyWrap} ref={historyRef}>
                  <div style={styles.historyHeaderRow}>
                    <p style={styles.historyTitle}>
                      Recent activity ({showFullHistory ? "full log" : "last 25"})
                    </p>
                    <button type="button" style={{ ...styles.btn, ...styles.btnSoft }} onClick={toggleHistory}>
                      {showFullHistory ? "Collapse" : "Full History Log"}
                    </button>
                  </div>

                  {visibleEvents.length === 0 ? (
                    <div style={styles.note}>No activity yet. Your first check-in or event will show here.</div>
                  ) : (
                    <div style={styles.historyList}>
                      {visibleEvents.map((ev, idx) => {
                        const t = labelEvent(ev);
                        const qty = Number(ev?.quantity || 1);
                        const when = ev?.at ? ev.at : ev?.timestamp;
                        const mood = ev?.mood ? ` (${ev.mood})` : "";
                        const note = (ev?.note || "").trim();

                        return (
                          <div key={`${ev?.at || idx}-${idx}`} style={styles.historyItem}>
                            <div style={styles.historyTop}>
                              <p style={styles.historyLabel}>
                                {t}
                                {t !== "Check-in" ? ` ×${qty}` : mood}
                              </p>
                              <p style={styles.historyTime}>{formatDateTime(when)}</p>
                            </div>
                            {note ? <p style={styles.historyNote}>{note}</p> : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RAFFLE CARD */}
              <div style={styles.card}>
                <p style={styles.cardTitle}>Beta access raffle</p>

                <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(11,18,32,0.72)", lineHeight: 1.45 }}>
                  When the first {rafflePool} accounts are confirmed, one account gets a free extended trial.
                  Entries are tied to your account email so we can contact you if you win.
                </p>

                <div style={styles.statRow}>
                  <div style={{ ...styles.statBox, background: "rgba(11,18,32,0.03)" }}>
                    <p style={styles.statNum}>{raffleInRound}</p>
                    <p style={styles.statSmall}>In this round</p>
                  </div>

                  <div style={{ ...styles.statBox, ...styles.statBoxOrange }}>
                    <p style={styles.statNum}>{rafflePool}</p>
                    <p style={styles.statSmall}>Pool size</p>
                  </div>

                  <div style={{ ...styles.statBox, background: "rgba(31,111,235,0.06)" }}>
                    <p style={styles.statNum}>{raffleSpotsLeft}</p>
                    <p style={styles.statSmall}>Spots left</p>
                  </div>

                  <div style={{ ...styles.statBox, background: "rgba(11,18,32,0.03)" }}>
                    <p style={styles.statNum}>{yourEntries}</p>
                    <p style={styles.statSmall}>Your entries</p>
                  </div>
                </div>

                <div style={styles.ctaRow}>
                  {raffleUserHasEntry ? (
                    <button
                      type="button"
                      style={{ ...styles.btn, ...styles.btnSoft }}
                      disabled
                      title="You already entered this round"
                    >
                      You’re entered ✅
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={{ ...styles.btn, ...styles.btnOrange }}
                      onClick={handleEnterRaffle}
                      disabled={raffleSubmitting}
                      title="Enter the raffle"
                    >
                      {raffleSubmitting ? "Entering…" : "Enter raffle"}
                    </button>
                  )}
                </div>

                {raffleError ? <div style={styles.error}>Raffle: {raffleError}</div> : null}

                <div style={styles.note}>If you get “Not authenticated”, your cookie token isn’t being sent.</div>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: "rgba(11,18,32,0.55)" }}>
              Next: charts + rewards once auth + logging are stable.
            </div>
          </>
        )}
      </div>

      {/* CHECK-IN MODAL */}
      {checkinOpen ? (
        <div style={styles.overlay} onMouseDown={() => !checkinSubmitting && setCheckinOpen(false)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>Quick check-in</p>
            <p style={styles.modalSub}>This is NOT “I used.” This is “how are you doing today?”</p>

            <div style={styles.moodRow}>
              <button
                type="button"
                style={{ ...styles.moodBtn, ...(checkinMood === "good" ? styles.moodActive : {}) }}
                onClick={() => setCheckinMood("good")}
                disabled={checkinSubmitting}
              >
                🙂 Good
              </button>
              <button
                type="button"
                style={{ ...styles.moodBtn, ...(checkinMood === "meh" ? styles.moodActive : {}) }}
                onClick={() => setCheckinMood("meh")}
                disabled={checkinSubmitting}
              >
                😐 Meh
              </button>
              <button
                type="button"
                style={{ ...styles.moodBtn, ...(checkinMood === "bad" ? styles.moodActive : {}) }}
                onClick={() => setCheckinMood("bad")}
                disabled={checkinSubmitting}
              >
                🙁 Rough
              </button>
            </div>

            <textarea
              style={styles.textarea}
              placeholder="Optional note. What triggered you? What helped?"
              value={checkinNote}
              onChange={(e) => setCheckinNote(e.target.value)}
              maxLength={500}
              disabled={checkinSubmitting}
            />

            <div style={styles.modalActions}>
              <button type="button" style={styles.btn} onClick={() => setCheckinOpen(false)} disabled={checkinSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnOrange }}
                onClick={submitCheckin}
                disabled={checkinSubmitting}
              >
                {checkinSubmitting ? "Saving…" : "Save check-in"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* EVENT MODAL */}
      {eventOpen ? (
        <div style={styles.overlay} onMouseDown={() => !eventSubmitting && setEventOpen(false)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>{eventType === "use" ? "Log use (slip)" : "Log resist (craving beat)"}</p>
            <p style={styles.modalSub}>This is the “I slipped” / “I resisted” tracker. Separate from check-ins.</p>

            <div style={styles.label}>Quantity</div>
            <input
              style={styles.input}
              type="number"
              min="1"
              max="999"
              value={eventQty}
              onChange={(e) => setEventQty(e.target.value)}
              disabled={eventSubmitting}
            />

            <div style={styles.label}>Note (optional)</div>
            <textarea
              style={styles.textarea}
              placeholder="What was it? What triggered it? (optional)"
              value={eventNote}
              onChange={(e) => setEventNote(e.target.value)}
              maxLength={500}
              disabled={eventSubmitting}
            />

            <div style={styles.modalActions}>
              <button type="button" style={styles.btn} onClick={() => setEventOpen(false)} disabled={eventSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...(eventType === "use" ? styles.btnDanger : styles.btnBlue) }}
                onClick={submitEvent}
                disabled={eventSubmitting}
              >
                {eventSubmitting ? "Saving…" : "Save event"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
