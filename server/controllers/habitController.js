// server/controllers/habitController.js
import User from "../models/User.js";
import HabitLog from "../models/HabitLog.js";

function getUserId(req) {
  return req.userId || req.user?._id || req.user?.id || null;
}

function startOfUtcDay(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// ----- SETTINGS -----

export async function getHabitSettings(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

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
    return res
      .status(500)
      .json({ message: "Could not load habit settings. Try again." });
  }
}

export async function saveHabitSettings(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const {
      substance,
      customName,
      intent,
      unitsPerDay,
      packCost,
      unitsPerPack,
      currency,
    } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const habit = user.habit || {};

    habit.substance = substance || habit.substance || "cigarettes";
    habit.customName = (customName || "").trim();
    habit.intent = intent || habit.intent || "quit";
    habit.unitsPerDay = toNumber(unitsPerDay, 0);
    habit.packCost = toNumber(packCost, 0);
    habit.unitsPerPack = toNumber(unitsPerPack, 20) || 20;
    habit.currency = (currency || habit.currency || "USD").trim();

    user.habit = habit;

    if (!user.stats) {
      user.stats = {};
    }
    if (!user.stats.streakStartedAt) {
      user.stats.streakStartedAt = startOfUtcDay();
    }
    if (typeof user.stats.bestStreakDays !== "number") {
      user.stats.bestStreakDays = 0;
    }

    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("saveHabitSettings error:", err);
    return res
      .status(500)
      .json({ message: "Could not save habit settings. Try again." });
  }
}

// ----- STATS -----

export async function getHabitStats(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

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
    const todayLog = await HabitLog.findOne({
      user: user._id,
      day: todayStart,
    }).lean();

    const todayUnits = todayLog?.units || 0;

    const todaySpend =
      baselineUnitsPerDay && baselineSpendPerDay
        ? (todayUnits / baselineUnitsPerDay) * baselineSpendPerDay
        : 0;

    let streakDays = 0;
    if (stats.streakStartedAt) {
      const startDay = startOfUtcDay(new Date(stats.streakStartedAt));
      const diffMs = todayStart - startDay;
      if (diffMs >= 0) {
        streakDays = Math.floor(diffMs / 86400000);
      }
    }

    const bestStreakDays = toNumber(stats.bestStreakDays, 0);
    const daysClean = streakDays;
    const moneySaved = daysClean * baselineSpendPerDay;

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

      streakDays,
      bestStreakDays,
      daysClean,
      moneySaved,

      todayUnits,
      todaySpend,
      todayVsBaseline: baselineUnitsPerDay
        ? baselineUnitsPerDay - todayUnits
        : null,
    });
  } catch (err) {
    console.error("getHabitStats error:", err);
    return res
      .status(500)
      .json({ message: "Could not load habit stats. Try again." });
  }
}

// ----- LOGGING USE -----

export async function logHabitUse(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

  const { units } = req.body || {};

// If units is missing/null/empty string, default to 1 (a "check-in" implies 1 use)
const unitsRaw =
  units === undefined || units === null || units === "" ? 1 : units;

const unitsNum = Number(unitsRaw);

if (!Number.isFinite(unitsNum) || unitsNum < 0) {
  return res
    .status(400)
    .json({ message: "units must be a non-negative number." });
}


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const todayStart = startOfUtcDay();

    const log = await HabitLog.findOneAndUpdate(
      { user: user._id, day: todayStart },
      { $inc: { units: unitsNum } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (unitsNum > 0) {
      const now = new Date();
      if (!user.stats) user.stats = {};

      if (user.stats.streakStartedAt) {
        const startDay = startOfUtcDay(new Date(user.stats.streakStartedAt));
        const diffMs = todayStart - startDay;
        const currentStreakDays =
          diffMs >= 0 ? Math.floor(diffMs / 86400000) : 0;

        const best = toNumber(user.stats.bestStreakDays, 0);
        if (currentStreakDays > best) {
          user.stats.bestStreakDays = currentStreakDays;
        }
      }

      user.stats.streakStartedAt = todayStart;
      user.stats.lastResetAt = now;
    }

    await user.save();

    return res.json({
      success: true,
      log: {
        day: log.day,
        units: log.units,
      },
    });
  } catch (err) {
    console.error("logHabitUse error:", err);
    return res
      .status(500)
      .json({ message: "Could not record habit use. Try again." });
  }
}

/**
 * COMPAT EXPORT:
 * Your routes expect `postHabitCheckIn`.
 * Keep your code + API stable by aliasing it to `logHabitUse`.
 */
export const postHabitCheckIn = logHabitUse;
