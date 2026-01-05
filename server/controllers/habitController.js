// server/controllers/habitController.js
import User from "../models/User.js";
import HabitLog from "../models/HabitLog.js";

const DAY_MS = 86400000;

const MAX_EVENTS_STORED = 500; // hard cap in DB
const DASHBOARD_EVENTS_DEFAULT = 25; // what the UI shows by default

const FUTURE_SKEW_MS = 5 * 60 * 1000; // allow 5 minutes clock skew max

function getUserId(req) {
  return req.userId || req.user?._id || req.user?.id || null;
}

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function safeDateFromTs(ts) {
  // If ts missing -> now
  if (ts === undefined || ts === null || ts === "") return new Date();

  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return new Date();

  return new Date(n);
}

function validateWhenNotFuture(when) {
  const now = Date.now();
  const t = when.getTime();
  if (!Number.isFinite(t)) return { ok: false, message: "Invalid timestamp." };
  if (t > now + FUTURE_SKEW_MS) return { ok: false, message: "Timestamp is in the future." };
  return { ok: true };
}

function pushHabitEvent(user, ev) {
  if (!user.habitEvents) user.habitEvents = [];
  user.habitEvents.push(ev);

  // cap stored history
  if (user.habitEvents.length > MAX_EVENTS_STORED) {
    user.habitEvents = user.habitEvents.slice(-MAX_EVENTS_STORED);
  }
}

async function incrementHabitLog(userId, when, unitsNum) {
  const day = startOfUtcDay(when);

  const log = await HabitLog.findOneAndUpdate(
    { user: userId, day },
    { $inc: { units: unitsNum } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return log;
}

function buildRecentEvents(user) {
  const events = Array.isArray(user.habitEvents) ? user.habitEvents : [];
  // newest-first, cap to MAX_EVENTS_STORED
  return events.slice(-MAX_EVENTS_STORED).reverse().slice(0, MAX_EVENTS_STORED);
}

async function buildHabitStatsPayload(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  const habit = user.habit || {};
  const stats = user.stats || {};

  const baselineUnitsPerDay = toNumber(habit.unitsPerDay, 0);
  const unitsPerPack = toNumber(habit.unitsPerPack, 20) || 20;
  const packCost = toNumber(habit.packCost, 0);

  const baselineSpendPerDay =
    baselineUnitsPerDay && unitsPerPack && packCost
      ? (baselineUnitsPerDay / unitsPerPack) * packCost
      : 0;

  const todayStart = startOfUtcDay();
  const todayLog = await HabitLog.findOne({ user: userId, day: todayStart }).lean();
  const todayUnits = todayLog?.units || 0;

  const todaySpend =
    baselineUnitsPerDay && baselineSpendPerDay
      ? (todayUnits / baselineUnitsPerDay) * baselineSpendPerDay
      : 0;

  // Clean streak = full UTC days since last use day (or since streakStartedAt if lastUseAt missing)
  let streakDays = 0;
  const lastUseAt = stats.lastUseAt ? new Date(stats.lastUseAt) : null;

  if (lastUseAt && !Number.isNaN(lastUseAt.getTime())) {
    const lastUseDay = startOfUtcDay(lastUseAt);
    const diffMs = todayStart - lastUseDay;
    if (diffMs >= 0) streakDays = Math.floor(diffMs / DAY_MS);
  } else if (stats.streakStartedAt) {
    const startDay = startOfUtcDay(new Date(stats.streakStartedAt));
    const diffMs = todayStart - startDay;
    if (diffMs >= 0) streakDays = Math.floor(diffMs / DAY_MS);
  }

  const bestStreakDays = toNumber(stats.bestStreakDays, 0);
  const daysClean = streakDays;
  const moneySaved = daysClean * baselineSpendPerDay;

  const recentEvents = buildRecentEvents(user);

  return {
    hasHabit: !!habit.substance,
    substance: habit.substance || null,
    customName: habit.customName || "",
    intent: habit.intent || "quit",
    currency: habit.currency || "USD",

    baselineUnitsPerDay,
    baselineSpendPerDay,
    unitsPerPack,
    packCost,

    // dashboard-compatible keys
    currentStreak: streakDays,
    longestStreak: bestStreakDays,
    lastCheckInAt: stats.lastCheckInAt || null,

    // keep old keys too
    streakDays,
    bestStreakDays,
    daysClean,
    moneySaved,

    todayUnits,
    todaySpend,
    todayVsBaseline: baselineUnitsPerDay ? baselineUnitsPerDay - todayUnits : null,

    recentEvents,
    dashboardDefaultLimit: DASHBOARD_EVENTS_DEFAULT,
  };
}

// ----- SETTINGS -----

export async function getHabitSettings(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    const habit = user.habit || {};

    return res.json({
      substance: habit.substance || "cigarettes",
      customName: habit.customName || "",
      intent: habit.intent || "quit",
      unitsPerDay: typeof habit.unitsPerDay === "number" ? habit.unitsPerDay : 0,
      packCost: typeof habit.packCost === "number" ? habit.packCost : 0,
      unitsPerPack: habit.unitsPerPack || 20,
      currency: habit.currency || "USD",
    });
  } catch (err) {
    console.error("getHabitSettings error:", err);
    return res.status(500).json({ message: "Could not load habit settings. Try again." });
  }
}

export async function saveHabitSettings(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { substance, customName, intent, unitsPerDay, packCost, unitsPerPack, currency } = req.body || {};

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const habit = user.habit || {};

    habit.substance = substance || habit.substance || "cigarettes";
    habit.customName = (customName || "").trim();
    habit.intent = intent || habit.intent || "quit";
    habit.unitsPerDay = toNumber(unitsPerDay, 0);
    habit.packCost = toNumber(packCost, 0);
    habit.unitsPerPack = toNumber(unitsPerPack, 20) || 20;
    habit.currency = (currency || habit.currency || "USD").trim();

    user.habit = habit;

    if (!user.stats) user.stats = {};
    if (!user.stats.streakStartedAt) user.stats.streakStartedAt = startOfUtcDay();
    if (typeof user.stats.bestStreakDays !== "number") user.stats.bestStreakDays = 0;

    await user.save();
    return res.json({ success: true });
  } catch (err) {
    console.error("saveHabitSettings error:", err);
    return res.status(500).json({ message: "Could not save habit settings. Try again." });
  }
}

// ----- STATS -----

export async function getHabitStats(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const payload = await buildHabitStatsPayload(userId);
    if (!payload) return res.status(404).json({ message: "User not found." });

    return res.json(payload);
  } catch (err) {
    console.error("getHabitStats error:", err);
    return res.status(500).json({ message: "Could not load habit stats. Try again." });
  }
}

// ----- LOGGING USE (legacy /log) -----
// Supports optional ts to log to correct UTC day and keep timestamp consistent.
export async function logHabitUse(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { units, ts } = req.body || {};
    const unitsRaw = units === undefined || units === null || units === "" ? 1 : units;
    const unitsNum = Number(unitsRaw);

    if (!Number.isFinite(unitsNum) || unitsNum < 0) {
      return res.status(400).json({ message: "units must be a non-negative number." });
    }

    const when = safeDateFromTs(ts);
    const timeOk = validateWhenNotFuture(when);
    if (!timeOk.ok) return res.status(400).json({ message: timeOk.message });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const log = await incrementHabitLog(user._id, when, unitsNum);

    if (!user.stats) user.stats = {};
    user.stats.lastActivityAt = when;

    if (unitsNum > 0) {
      // "use" happened -> streak reset anchor, DO NOT overwrite timestamp with "now"
      user.stats.lastUseAt = when;
      user.stats.streakStartedAt = startOfUtcDay(when);
      user.stats.lastResetAt = when;

      pushHabitEvent(user, {
        type: "use",
        quantity: clamp(unitsNum, 1, 999),
        at: when,
        note: "",
      });
    }

    await user.save();

    const statsPayload = await buildHabitStatsPayload(userId);

    return res.json({
      success: true,
      log: { day: log.day, units: log.units },
      stats: statsPayload,
    });
  } catch (err) {
    console.error("logHabitUse error:", err);
    return res.status(500).json({ message: "Could not record habit use. Try again." });
  }
}

// ----- CHECK-IN (does NOT increment units) -----
// Enforced: 1 check-in per UTC day.
export async function postHabitCheckIn(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { mood, note, ts } = req.body || {};

    const when = safeDateFromTs(ts);
    const timeOk = validateWhenNotFuture(when);
    if (!timeOk.ok) return res.status(400).json({ message: timeOk.message });

    const moodClean = typeof mood === "string" ? mood.trim().slice(0, 20) : "";
    const noteClean = typeof note === "string" ? note.trim().slice(0, 500) : "";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.stats) user.stats = {};

    // enforce 1 check-in per UTC day
    if (user.stats.lastCheckInAt) {
      const last = new Date(user.stats.lastCheckInAt);
      if (!Number.isNaN(last.getTime())) {
        const lastDay = startOfUtcDay(last).getTime();
        const nowDay = startOfUtcDay(when).getTime();
        if (lastDay === nowDay) {
          return res.status(409).json({ message: "Already checked in today." });
        }
      }
    }

    user.stats.lastCheckInAt = when;
    user.stats.lastCheckInMood = moodClean;
    user.stats.lastCheckInNote = noteClean;
    user.stats.lastActivityAt = when;

    // If streak has never started, start it on first check-in (UTC day of check-in)
    if (!user.stats.streakStartedAt) {
      user.stats.streakStartedAt = startOfUtcDay(when);
    }

    // Update best streak based on current streak math (days since last use)
    const todayStart = startOfUtcDay(); // streak is evaluated "as of today"
    let streakDays = 0;

    if (user.stats.lastUseAt) {
      const lastUseDay = startOfUtcDay(new Date(user.stats.lastUseAt));
      const diffMs = todayStart - lastUseDay;
      if (diffMs >= 0) streakDays = Math.floor(diffMs / DAY_MS);
    } else if (user.stats.streakStartedAt) {
      const startDay = startOfUtcDay(new Date(user.stats.streakStartedAt));
      const diffMs = todayStart - startDay;
      if (diffMs >= 0) streakDays = Math.floor(diffMs / DAY_MS);
    }

    if (streakDays > toNumber(user.stats.bestStreakDays, 0)) {
      user.stats.bestStreakDays = streakDays;
    }

    // Add event to history
    pushHabitEvent(user, {
      type: "checkin",
      quantity: 1,
      at: when,
      mood: moodClean,
      note: noteClean,
    });

    await user.save();

    const statsPayload = await buildHabitStatsPayload(userId);

    return res.json({ success: true, stats: statsPayload });
  } catch (err) {
    console.error("postHabitCheckIn error:", err);
    return res.status(500).json({ message: "Could not save check-in. Try again." });
  }
}

// ----- EVENT (use/resist) -----
// Enforced:
// - ts cannot be far future
// - logs "use" to the event day, does not overwrite with server "now"
export async function postHabitEvent(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { type, quantity, note, ts } = req.body || {};
    if (type !== "use" && type !== "resist") {
      return res.status(400).json({ message: "type must be 'use' or 'resist'." });
    }

    const when = safeDateFromTs(ts);
    const timeOk = validateWhenNotFuture(when);
    if (!timeOk.ok) return res.status(400).json({ message: timeOk.message });

    const qty = clamp(Number(quantity || 1), 1, 999);
    const noteClean = typeof note === "string" ? note.trim().slice(0, 500) : "";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.stats) user.stats = {};

    user.stats.lastActivityAt = when;

    if (type === "resist") {
      user.stats.resistsTotal = toNumber(user.stats.resistsTotal, 0) + qty;
      user.stats.lastResistAt = when;

      pushHabitEvent(user, {
        type: "resist",
        quantity: qty,
        at: when,
        note: noteClean,
      });

      await user.save();

      const statsPayload = await buildHabitStatsPayload(userId);
      return res.json({ success: true, stats: statsPayload });
    }

    // type === "use"
    pushHabitEvent(user, {
      type: "use",
      quantity: qty,
      at: when,
      note: noteClean,
    });

    // Save stats using EVENT timestamp (not server now)
    user.stats.lastUseAt = when;
    user.stats.streakStartedAt = startOfUtcDay(when);
    user.stats.lastResetAt = when;

    // Ensure daily log increments for EVENT day
    await incrementHabitLog(user._id, when, qty);

    await user.save();

    const statsPayload = await buildHabitStatsPayload(userId);
    return res.json({ success: true, stats: statsPayload });
  } catch (err) {
    console.error("postHabitEvent error:", err);
    return res.status(500).json({ message: "Could not save event. Try again." });
  }
}
