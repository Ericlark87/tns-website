// server/controllers/supportController.js
import nodemailer from "nodemailer";

/**
 * POST /api/support/contact
 * Body: { email, subject, message }
 */
export async function contactSupport(req, res) {
  try {
    const { email, subject, message } = req.body || {};

    if (!email || !subject || !message) {
      return res.status(400).json({ message: "Email, subject, and message are required" });
    }

    const to = process.env.SUPPORT_EMAIL_TO;
    if (!to) {
      console.error("SUPPORT_EMAIL_TO is not set");
      return res.status(500).json({ message: "Support email not configured" });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP env vars missing");
      return res.status(500).json({ message: "Email server not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // STARTTLS will upgrade
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"QuitChampion Support" <${process.env.SMTP_USER}>`,
      to,
      replyTo: email,
      subject: subject.slice(0, 120),
      text: `From: ${email}\n\n${message}`,
    });

    return res.json({ message: "Support message sent" });
  } catch (err) {
    console.error("SUPPORT EMAIL ERROR:", err);
    return res.status(500).json({ message: "Server error sending message" });
  }
}
