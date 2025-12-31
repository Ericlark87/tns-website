// server/routes/userRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Reuse the same secret used for access tokens
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.ACCESS_TOKEN_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "⚠ userRoutes: No JWT secret found. Set JWT_SECRET (or JWT_ACCESS_SECRET) in server/.env"
  );
}

// -------- Auth guard (access token in Authorization: Bearer ...) ----------
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    // We signed tokens like { sub: user._id, email: user.email }
    const userId = payload.sub || payload.id || payload._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    req.userId = userId;
    next();
  } catch (err) {
    console.error("❌ requireAuth error:", err);
    return res.status(401).json({ message: "Not authenticated." });
  }
}

// -------- Helper to compute streak + money saved ----------
function computeStats(user) {
  if (!user) return null;

  const habit = user.habit || {};
  const stats = user.stats || {};

  const now = new Date();

  let activeDays = 0;
  let bestDays = stats.bestStreakDays || 0;
  let startedAt = stats.streakStartedAt || null;

  if (startedAt) {
    const start = new Date(startedAt);
    const msPerDay = 1000 * 60 * 60 * 24;
    // +1 so "same day" counts as 1 day
    activeDays = Math.max(
      0,
      Math.floor((now.getTime() - start.getTime()) / msPerDay) + 1
    );
    if (activeDays > bestDays) {
      bestDays = activeDays;
    }
  }

  // Money saved estimate:
  // baseline spend per day = unitsPerDay * (packCost / unitsPerPack)
  const unitsPerDay = Number(habit.unitsPerDay || 0);
  const packCost = Number(habit.packCost || 0);
  const unitsPerPack = Number(habit.unitsPerPack || 1);

  let baselinePerDay = 0;
  if (unitsPerDay > 0 && packCost > 0 && unitsPerPack > 0) {
    const costPerUnit = packCost / unitsPerPack;
    baselinePerDay = unitsPerDay * costPerUnit;
  }

  const moneySaved = startedAt ? baselinePerDay * activeDays : 0;
  const roundedMoney = Math.round(moneySaved * 100) / 100;

  return {
    habit: {
      substance: habit.substance || "cigarettes",
      customName: habit.customName || "",
      intent: habit.intent || "quit",
      unitsPerDay: unitsPerDay,
      packCost: packCost,
      unitsPerPack: unitsPerPack,
      currency: habit.currency || "USD",
    },
    streak: {
      hasStreak: Boolean(startedAt),
      activeDays,
      bestDays,
      startedAt,
    },
    moneySaved: roundedMoney,
    currency: habit.currency || "USD",
    hasSettings: Boolean(habit.substance || habit.customName || unitsPerDay),
  };
}

// -------- GET /api/user/settings ----------
router.get("/settings", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const habit = user.habit || {};
    return res.json({
      habit: {
        substance: habit.substance || "cigarettes",
        customName: habit.customName || "",
        intent: habit.intent || "quit",
        unitsPerDay: habit.unitsPerDay || 0,
        packCost: habit.packCost || 0,
        unitsPerPack: habit.unitsPerPack || 20,
        currency: habit.currency || "USD",
      },
      savageMode: user.savageMode || false,
    });
  } catch (err) {
    console.error("❌ GET /api/user/settings error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

// -------- PUT /api/user/settings ----------
// Body: {
//   substance, customName, intent,
//   unitsPerDay, packCost, unitsPerPack, currency,
//   startStreakNow (boolean), savageMode (boolean)
// }
router.put("/settings", requireAuth, async (req, res) => {
  try {
    const {
      substance,
      customName,
      intent,
      unitsPerDay,
      packCost,
      unitsPerPack,
      currency,
      startStreakNow,
      savageMode,
    } = req.body || {};

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update habit
    user.habit = {
      substance: substance || user.habit?.substance || "cigarettes",
      customName: customName ?? user.habit?.customName ?? "",
      intent: intent || user.habit?.intent || "quit",
      unitsPerDay:
        typeof unitsPerDay === "number"
          ? unitsPerDay
          : Number(user.habit?.unitsPerDay || 0),
      packCost:
        typeof packCost === "number"
          ? packCost
          : Number(user.habit?.packCost || 0),
      unitsPerPack:
        typeof unitsPerPack === "number"
          ? unitsPerPack
          : Number(user.habit?.unitsPerPack || 20),
      currency: currency || user.habit?.currency || "USD",
    };

    // Update savage mode toggle if provided
    if (typeof savageMode === "boolean") {
      user.savageMode = savageMode;
    }

    // Streak start behaviour:
    // - If they explicitly set startStreakNow = true -> reset starting point
    // - If no streak exists yet, we auto-start now
    if (!user.stats) {
      user.stats = {};
    }

    if (startStreakNow || !user.stats.streakStartedAt) {
      user.stats.streakStartedAt = new Date();
      // keep bestStreakDays as-is (we only grow it as they go)
      user.stats.lastResetAt = new Date();
    }

    await user.save();

    const computed = computeStats(user);
    return res.json({
      message: "Settings saved.",
      stats: computed,
    });
  } catch (err) {
    console.error("❌ PUT /api/user/settings error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

// -------- GET /api/user/stats ----------
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const computed = computeStats(user);
    return res.json(computed);
  } catch (err) {
    console.error("❌ GET /api/user/stats error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

export default router;
