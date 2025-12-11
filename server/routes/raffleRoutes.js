import express from "express";
import RaffleEntry from "../models/RaffleEntry.js";

const router = express.Router();

const RAFFLE_THRESHOLD = 25;

// POST /api/raffle/enter
router.post("/enter", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ ok: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ ok: false, message: "Enter a valid email address." });
    }

    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      undefined;
    const userAgent = req.headers["user-agent"];

    let entry = await RaffleEntry.findOne({ email: normalizedEmail });

    if (!entry) {
      entry = await RaffleEntry.create({
        email: normalizedEmail,
        ip,
        userAgent,
      });
    }

    const count = await RaffleEntry.countDocuments();
    const thresholdReached = count >= RAFFLE_THRESHOLD;

    if (thresholdReached) {
      console.log(
        `🎟️ Raffle threshold reached: ${count} entries. Time to run a drawing.`
      );
      // TODO: drawing + notification hook
    }

    return res.json({
      ok: true,
      message: "You're in. Watch your inbox — you'll hear from us soon.",
      count,
      thresholdReached,
    });
  } catch (err) {
    console.error("❌ Error in /api/raffle/enter:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error. Try again later." });
  }
});

// GET /api/raffle/stats
router.get("/stats", async (_req, res) => {
  try {
    const count = await RaffleEntry.countDocuments();
    const thresholdReached = count >= RAFFLE_THRESHOLD;

    return res.json({
      ok: true,
      count,
      thresholdReached,
      threshold: RAFFLE_THRESHOLD,
    });
  } catch (err) {
    console.error("❌ Error in /api/raffle/stats:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Could not fetch stats." });
  }
});

export default router;
