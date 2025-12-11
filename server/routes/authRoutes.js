// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const TOKEN_COOKIE = "qc_token";
const TOKEN_EXPIRES_DAYS = 30;

// helper
function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set in environment");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRES_DAYS}d`,
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Email and password (min 6 chars) are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ ok: false, message: "An account with that email exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
    });

    const token = createToken(user._id.toString());

    res
      .cookie(TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true behind HTTPS in prod
        maxAge: TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      })
      .json({
        ok: true,
        message: "Account created.",
        user: {
          id: user._id,
          email: user.email,
        },
      });
  } catch (err) {
    console.error("❌ /api/auth/register error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error. Try again later." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email or password." });
    }

    const token = createToken(user._id.toString());

    res
      .cookie(TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      })
      .json({
        ok: true,
        message: "Logged in.",
        user: {
          id: user._id,
          email: user.email,
        },
      });
  } catch (err) {
    console.error("❌ /api/auth/login error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error. Try again later." });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res
    .clearCookie(TOKEN_COOKIE)
    .json({ ok: true, message: "Logged out." });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];

    if (!token) {
      return res.status(401).json({ ok: false, message: "Not authenticated." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("_id email");
    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found." });
    }

    return res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ /api/auth/me error:", err);
    return res.status(401).json({ ok: false, message: "Invalid token." });
  }
});

export default router;
