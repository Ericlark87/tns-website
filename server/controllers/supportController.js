// server/controllers/supportController.js
import nodemailer from "nodemailer";

const SUPPORT_TO_EMAIL =
  process.env.SUPPORT_TO_EMAIL || "support@thingsnstuff.fun";

let transporter = null;

// If SMTP is configured, create real transporter, otherwise just log
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

export async function sendSupportMessage(req, res) {
  try {
    const { email, subject, message } = req.body || {};

    if (!email || !message) {
      return res
        .status(400)
        .json({ message: "Email and message are required." });
    }

    const mailOptions = {
      from: email,
      to: SUPPORT_TO_EMAIL,
      subject: subject || "QuitChampion support request",
      text: message,
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log("Support email (no SMTP configured):", mailOptions);
    }

    return res.json({
      message: "Support request sent. We’ll get back to you.",
    });
  } catch (err) {
    console.error("❌ /api/support error:", err);
    return res
      .status(500)
      .json({ message: "Could not send support request." });
  }
}
