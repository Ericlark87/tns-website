// server/controllers/habitController.js
import User from "../models/User.js";
import HabitLog from "../models/HabitLog.js";

const DAY_MS = 86400000;
const MAX_EVENTS_STORED = 500; // hard cap in DB
const DASHBOARD_EVENTS_DEFAULT = 25; // what the UI shows by default

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
  const n = Number(ts);
  if (Number.isFinite(n) && n > 0) return new Date(n);
  return new Date();
}

function pushHabitEvent(user, ev) {
  if (!user.habitEvents) user.habitEvents = [];
  user.habitEvents.push(ev);

  // cap stored history
  if (user.habitEvents.length > MAX_EVENTS_STORED) {
    user.habitEvents = user.habitEvents.slice(-MAX_EVENTS_STORED);
  }
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

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found." });

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
    const todayLog = await HabitLog.findOne({ user: user._id, day: todayStart }).lean();
    const todayUnits = todayLog?.units || 0;

    const todaySpend =
      baselineUnitsPerDay && baselineSpendPerDay
        ? (todayUnits / baselineUnitsPerDay) * baselineSpendPerDay
        : 0;

    // Clean streak = days since last use (or since streakStartedAt if lastUseAt missing)
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

    // Recent events: newest-first. UI shows 25 by default.
    const events = Array.isArray(user.habitEvents) ? user.habitEvents : [];
    const recentEvents = events.slice(-MAX_EVENTS_STORED).reverse().slice(0, MAX_EVENTS_STORED);

    return res.json({
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

      // NEW: activity feed (client will slice to 25)
      recentEvents,
      dashboardDefaultLimit: DASHBOARD_EVENTS_DEFAULT,
    });
  } catch (err) {
    console.error("getHabitStats error:", err);
    return res.status(500).json({ message: "Could not load habit stats. Try again." });
  }
}

// ----- LOGGING USE (increment today units) -----

export async function logHabitUse(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { units } = req.body || {};
    const unitsRaw = units === undefined || units === null || units === "" ? 1 : units;
    const unitsNum = Number(unitsRaw);

    if (!Number.isFinite(unitsNum) || unitsNum < 0) {
      return res.status(400).json({ message: "units must be a non-negative number." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const todayStart = startOfUtcDay();

    const log = await HabitLog.findOneAndUpdate(
      { user: user._id, day: todayStart },
      { $inc: { units: unitsNum } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const now = new Date();

    if (!user.stats) user.stats = {};
    user.stats.lastActivityAt = now;

    if (unitsNum > 0) {
      // "use" happened -> streak reset anchor
      user.stats.lastUseAt = now;
      user.stats.streakStartedAt = todayStart;
      user.stats.lastResetAt = now;
    }

    await user.save();

    return res.json({
      success: true,
      log: { day: log.day, units: log.units },
    });
  } catch (err) {
    console.error("logHabitUse error:", err);
    return res.status(500).json({ message: "Could not record habit use. Try again." });
  }
}

// ----- CHECK-IN (does NOT increment units) -----

export async function postHabitCheckIn(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { mood, note, ts } = req.body || {};

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const when = safeDateFromTs(ts);
    const moodClean = typeof mood === "string" ? mood.trim().slice(0, 20) : "";
    const noteClean = typeof note === "string" ? note.trim().slice(0, 500) : "";

    if (!user.stats) user.stats = {};
    user.stats.lastCheckInAt = when;
    user.stats.lastCheckInMood = moodClean;
    user.stats.lastCheckInNote = noteClean;
    user.stats.lastActivityAt = when;

    // If streak has never started, start it on first check-in
    if (!user.stats.streakStartedAt) {
      user.stats.streakStartedAt = startOfUtcDay(when);
    }

    // Update best streak based on current streak math (days since last use)
    const todayStart = startOfUtcDay();
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

    return res.json({ success: true });
  } catch (err) {
    console.error("postHabitCheckIn error:", err);
    return res.status(500).json({ message: "Could not save check-in. Try again." });
  }
}

// ----- EVENT (use/resist) -----

export async function postHabitEvent(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const { type, quantity, note, ts } = req.body || {};
    if (type !== "use" && type !== "resist") {
      return res.status(400).json({ message: "type must be 'use' or 'resist'." });
    }

    const qty = clamp(Number(quantity || 1), 1, 999);
    const when = safeDateFromTs(ts);
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
      return res.json({ success: true });
    }

    // type === "use"
    pushHabitEvent(user, {
      type: "use",
      quantity: qty,
      at: when,
      note: noteClean,
    });

    // Save event + stats first
    user.stats.lastUseAt = when;
    user.stats.streakStartedAt = startOfUtcDay(when);
    user.stats.lastResetAt = when;

    await user.save();

    // Then increment daily units via HabitLog
    req.body = { units: qty };
    return logHabitUse(req, res);
  } catch (err) {
    console.error("postHabitEvent error:", err);
    return res.status(500).json({ message: "Could not save event. Try again." });
  }
}
