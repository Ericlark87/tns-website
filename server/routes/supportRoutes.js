// server/routes/supportRoutes.js
import express from "express";

const router = express.Router();

/**
 * Simple support ticket endpoint.
 * For now it just validates input and logs it on the server.
 * Later we can plug this into a real mail / ticket service.
 */

router.post("/ticket", async (req, res) => {
  try {
    const { email, subject, message } = req.body || {};

    if (!email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Email, subject, and message are required." });
    }

    // Basic sanity trimming
    const normalizedEmail = String(email).trim();
    const cleanedSubject = String(subject).trim();
    const cleanedMessage = String(message).trim();

    // For now: just log to server. No external services yet.
    console.log("📩 New support ticket:", {
      email: normalizedEmail,
      subject: cleanedSubject,
      message: cleanedMessage,
      at: new Date().toISOString(),
    });

    // Later we can send this via SMTP / SendGrid, etc.
    return res.json({ success: true, message: "Support ticket received." });
  } catch (err) {
    console.error("❌ /api/support/ticket error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

export default router;
