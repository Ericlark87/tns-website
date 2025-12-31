import User from "../models/User.js";
import RaffleEntry from "../models/RaffleEntry.js";

const ROUND_ID = "beta-round-1";
const TARGET_ENTRIES = 25;

function isProd() {
  return process.env.NODE_ENV === "production";
}

// GET /api/raffle/stats
export async function getRaffleStats(req, res) {
  try {
    const [accountsCount, entryCount] = await Promise.all([
      User.countDocuments({}),
      RaffleEntry.countDocuments({ roundId: ROUND_ID }),
    ]);

    const spotsLeft = Math.max(TARGET_ENTRIES - entryCount, 0);

    let userEntry = null;
    let userHasEntry = false;
    let eligible = false;
    let reason = "NOT_LOGGED_IN";

    if (req.userId) {
      userEntry = await RaffleEntry.findOne({
        roundId: ROUND_ID,
        userId: req.userId,
      }).lean();

      userHasEntry = !!userEntry;
      eligible = true;
      reason = null;
    }

    return res.json({
      accountsCount,
      totalAccounts: accountsCount,
      entryCount,
      totalEntries: entryCount,
      targetCount: TARGET_ENTRIES,
      target: TARGET_ENTRIES,
      spotsLeft,
      userHasEntry,
      entry: userEntry,
      eligible,
      reason,
    });
  } catch (err) {
    console.error("Raffle stats error:", err);
    return res
      .status(500)
      .json({ message: "Could not load raffle stats. Please try again." });
  }
}

// POST /api/raffle/enter
export async function enterRaffle(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const existing = await RaffleEntry.findOne({
      roundId: ROUND_ID,
      userId: req.userId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have an entry in this round." });
    }

    const currentCount = await RaffleEntry.countDocuments({ roundId: ROUND_ID });
    if (currentCount >= TARGET_ENTRIES) {
      return res
        .status(400)
        .json({ message: "This beta raffle is already full." });
    }

    // Fetch the user's email properly (JWT payload doesn't include email)
    const user = await User.findById(req.userId).select("email").lean();
    if (!user?.email) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create entry
    const entry = await RaffleEntry.create({
      roundId: ROUND_ID,
      userId: req.userId,
      email: user.email,
    });

    return res.status(201).json({ ok: true, entry });
  } catch (err) {
    console.error("Raffle entry error:", err);

    // Mongoose validation errors -> 400
    if (err?.name === "ValidationError") {
      const details = Object.values(err.errors || {})
        .map((e) => e.message)
        .filter(Boolean)
        .join(" | ");
      return res.status(400).json({
        message: details || "Invalid raffle entry data.",
      });
    }

    // Duplicate key (unique index) -> 400
    if (err?.code === 11000) {
      return res.status(400).json({
        message: "Duplicate entry (already exists).",
      });
    }

    // In dev, include actual error message so you can fix it fast
    return res.status(500).json({
      message: isProd()
        ? "Could not enter raffle. Please try again."
        : `Could not enter raffle: ${err?.message || "Unknown error"}`,
    });
  }
}
