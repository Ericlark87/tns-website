// /home/elcskater/TNS/company_site/server/controllers/habitsController.js
import User from "../models/User.js";

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;

function startOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / MS_DAY);
}

function computeCurrentStreakDays(user, now) {
  const lastActivityAt = user.stats?.lastActivityAt ? new Date(user.stats.lastActivityAt) : null;

  // Option A: idle > 24h = streak dead
  if (lastActivityAt && now.getTime() - lastActivityAt.getTime() > MS_DAY) {
    return { days: 0, stale: true };
  }

  // streak = days since last use (or since streakStartedAt if no use recorded)
  const streakStart =
    (user.stats?.streakStartedAt && new Date(user.stats.streakStartedAt)) ||
    user.createdAt ||
    now;

  const days = Math.max(0, daysBetween(new Date(streakStart), now));
  return { days, stale: false };
}

export async function getSettings(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  return res.json({
    habit: user.habit || {},
    stats: user.stats || {},
  });
}

export async function saveSettings(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  const incoming = req.body || {};
  user.habit = {
    ...(user.habit?.toObject?.() || user.habit || {}),
    ...incoming,
  };

  await user.save();
  return res.json({ success: true, habit: user.habit });
}

export async function postEvent(req, res) {
  const { type, quantity = 1, note = "" } = req.body;

  if (!["use", "resist"].includes(type)) {
    return res.status(400).json({ message: "Invalid event type" });
  }

  const event = {
    userId: req.user.id,
    type,
    quantity,
    note,
    createdAt: new Date(),
  };

  await HabitEvent.create(event);

  // Reset streak immediately on USE
  if (type === "use") {
    await UserHabit.updateOne(
      { userId: req.user.id },
      { $set: { streak: 0, lastUseAt: new Date() } }
    );
  }

  res.json({ success: true });
}

  // Option A idle rule: if idle > 24h, streak resets when they return
  const lastActivityAt = user.stats?.lastActivityAt ? new Date(user.stats.lastActivityAt) : null;
  const wasIdleTooLong = lastActivityAt && now.getTime() - lastActivityAt.getTime() > MS_DAY;

  if (!user.stats) user.stats = {};
  if (wasIdleTooLong) {
    user.stats.lastResetAt = now;
    // restart streak baseline (will be overridden below for "use")
    user.stats.streakStartedAt = now;
  }

  // Update lastActivityAt always
  user.stats.lastActivityAt = now;

  // If it's a "use" event, streak restarts NOW (days since last use becomes 0)
  if (type === "use") {
    user.stats.lastUseAt = when;
    user.stats.streakStartedAt = when;
  }

  // If no streak baseline exists yet, set it to account creation or now
  if (!user.stats.streakStartedAt) {
    user.stats.streakStartedAt = user.createdAt || now;
  }

  // Log the event
  user.habitEvents.push({
    type,
    quantity: qty,
    at: when,
    note: note ? String(note).trim().slice(0, 500) : undefined,
  });

  // Cap log size to prevent Mongo bloat
  if (user.habitEvents.length > 2000) {
    user.habitEvents = user.habitEvents.slice(user.habitEvents.length - 2000);
  }

  // Recompute streak + best streak
  const { days: currentStreakDays, stale } = computeCurrentStreakDays(user, now);
  if (!stale && currentStreakDays > (user.stats.bestStreakDays || 0)) {
    user.stats.bestStreakDays = currentStreakDays;
  }

  await user.save();

  return res.json({
    success: true,
    currentStreakDays,
    bestStreakDays: user.stats.bestStreakDays || 0,
    lastActivityAt: user.stats.lastActivityAt,
    lastUseAt: user.stats.lastUseAt || null,
  });


export async function getStats(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  const now = new Date();
  const { days: currentStreakDays, stale } = computeCurrentStreakDays(user, now);

  const todayStart = startOfDayUTC(now);
  const tomorrowStart = new Date(todayStart.getTime() + MS_DAY);

  const events = user.habitEvents || [];
  let usedToday = 0;
  let resistedToday = 0;

  for (const e of events) {
    const t = new Date(e.at);
    if (t >= todayStart && t < tomorrowStart) {
      if (e.type === "use") usedToday += Number(e.quantity || 1);
      if (e.type === "resist") resistedToday += Number(e.quantity || 1);
    }
  }

  return res.json({
    habit: user.habit || {},
    stale,
    currentStreakDays,
    bestStreakDays: user.stats?.bestStreakDays || 0,
    lastActivityAt: user.stats?.lastActivityAt || null,
    lastUseAt: user.stats?.lastUseAt || null,
    today: {
      used: usedToday,
      resisted: resistedToday,
    },
  });
}
