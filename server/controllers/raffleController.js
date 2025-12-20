// server/controllers/raffleController.js
import RaffleEntry from "../models/RaffleEntry.js";
import User from "../models/User.js";

const TARGET_COUNT = 25;

export async function getRaffleStats(req, res) {
  try {
    const total = await RaffleEntry.countDocuments();
    return res.json({
      total,
      target: TARGET_COUNT,
    });
  } catch (err) {
    console.error("❌ /api/raffle/stats error:", err);
    return res
      .status(500)
      .json({ message: "Could not load raffle stats. Try again later." });
  }
}

export async function enterRaffle(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required to enter the raffle." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await RaffleEntry.findOne({ email: normalizedEmail });
    if (existing) {
      return res.json({
        alreadyEntered: true,
        message: "You’re already in this raffle pool. Good luck.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    await RaffleEntry.create({
      email: normalizedEmail,
      userId: user?._id,
    });

    const total = await RaffleEntry.countDocuments();

    return res.status(201).json({
      message: "You’re in. We’ll email you if you win a trial.",
      total,
      target: TARGET_COUNT,
    });
  } catch (err) {
    console.error("❌ /api/raffle/enter error:", err);
    return res
      .status(500)
      .json({ message: "Could not enter raffle. Try again later." });
  }
}
