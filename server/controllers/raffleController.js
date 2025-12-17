// server/controllers/raffleController.js
import RaffleEntry from "../models/RaffleEntry.js";

const RAFFLE_LIMIT = Number(process.env.RAFFLE_LIMIT || 25);

/**
 * GET /api/raffle/stats
 * Returns: { totalEntries, limit }
 */
export async function getRaffleStats(req, res) {
  try {
    const totalEntries = await RaffleEntry.estimatedDocumentCount();
    return res.json({
      totalEntries,
      limit: RAFFLE_LIMIT,
    });
  } catch (err) {
    console.error("RAFFLE STATS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Unable to load raffle stats right now." });
  }
}

/**
 * POST /api/raffle/enter
 * Body: { email }
 */
export async function enterRaffle(req, res) {
  try {
    let { email } = req.body || {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required." });
    }

    email = email.trim().toLowerCase();

    // Basic sanity check; not perfect, just to catch garbage
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ message: "Enter a real email address." });
    }

    // Are we already at the hard cap? (soft enforcement, just in case)
    const currentCount = await RaffleEntry.estimatedDocumentCount();
    if (currentCount >= RAFFLE_LIMIT) {
      return res.status(403).json({
        message:
          "Early access spots are full. You can still use the app when it goes public.",
        totalEntries: currentCount,
      });
    }

    // Check if this email is already in
    const existing = await RaffleEntry.findOne({ email });
    if (existing) {
      return res.status(200).json({
        message: "You’re already in. We’ll email you when the drawings start.",
        totalEntries: currentCount,
      });
    }

    // Create new entry
    await RaffleEntry.create({ email });

    const totalEntries = currentCount + 1;

    return res.status(201).json({
      message: "You’re in. We’ll email you when the drawings start.",
      totalEntries,
    });
  } catch (err) {
    // Handle duplicate key just in case it slipped through
    if (err?.code === 11000) {
      try {
        const totalEntries = await RaffleEntry.estimatedDocumentCount();
        return res.status(200).json({
          message: "You’re already in. We’ll email you when the drawings start.",
          totalEntries,
        });
      } catch (innerErr) {
        console.error("RAFFLE DUPLICATE + COUNT ERROR:", innerErr);
        return res
          .status(200)
          .json({ message: "You’re already in the raffle." });
      }
    }

    console.error("RAFFLE ENTER ERROR:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
}
