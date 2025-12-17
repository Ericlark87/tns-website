// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();

// ---------- JWT SECRETS ----------
// Preferred: JWT_ACCESS_SECRET + JWT_REFRESH_SECRET
// Legacy / simple: single JWT_SECRET used for both.
const FALLBACK_JWT = process.env.JWT_SECRET;

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.ACCESS_TOKEN_SECRET || // older name
  FALLBACK_JWT;

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  process.env.REFRESH_TOKEN_SECRET || // older name
  FALLBACK_JWT;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.warn(
    "⚠ JWT secrets are missing. Set JWT_SECRET or both JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in server/.env"
  );
}

const ACCESS_TTL = "15m";
const REFRESH_TTL = "30d";

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL }
  );
}

function setRefreshCookie(res, token) {
  res.cookie("qc_refresh", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
}

// ---------- REGISTER ----------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(409)
        .json({
          message:
            "An account already exists for this email. Try logging in instead.",
        });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      fromRaffle: false,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
      },
      accessToken,
    });
  } catch (err) {
    console.error("❌ /api/auth/register error:", err);

    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res
        .status(409)
        .json({
          message:
            "An account already exists for this email. Try logging in instead.",
        });
    }

    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
      },
      accessToken,
    });
  } catch (err) {
    console.error("❌ /api/auth/login error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ---------- REFRESH ----------
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.qc_refresh;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const accessToken = signAccessToken(user);
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
      },
      accessToken,
    });
  } catch (err) {
    console.error("❌ /api/auth/refresh error:", err);
    return res.status(401).json({ message: "Not authenticated." });
  }
});

// ---------- LOGOUT ----------
router.post("/logout", (req, res) => {
  res.clearCookie("qc_refresh", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ success: true });
});

export default router;
