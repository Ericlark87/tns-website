// server/routes/raffleRoutes.js
import express from "express";
import RaffleEntry from "../models/RaffleEntry.js";

const router = express.Router();

const TOTAL_SPOTS = 25;

// GET /api/raffle/stats
router.get("/stats", async (req, res) => {
  try {
    const entered = await RaffleEntry.countDocuments();
    res.json({
      totalSpots: TOTAL_SPOTS,
      entered,
    });
  } catch (err) {
    console.error("❌ /api/raffle/stats error:", err);
    res.status(500).json({ message: "Failed to load raffle stats." });
  }
});

// POST /api/raffle/enter  { email }
router.post("/enter", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await RaffleEntry.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: "You're already entered with this email.",
      });
    }

    await RaffleEntry.create({ email: normalizedEmail });

    return res.json({
      message:
        "You're in. If you're picked, you'll get an email with instructions.",
    });
  } catch (err) {
    console.error("❌ /api/raffle/enter error:", err);
    res.status(500).json({ message: "Failed to enter the raffle." });
  }
});

export default router;
