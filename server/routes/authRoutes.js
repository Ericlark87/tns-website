// server/routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.ACCESS_TOKEN_SECRET;

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  process.env.REFRESH_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.ACCESS_TOKEN_SECRET;

if (!JWT_SECRET) console.warn("⚠ authRoutes: Missing JWT secret (JWT_SECRET or JWT_ACCESS_SECRET).");
if (!REFRESH_SECRET) console.warn("⚠ authRoutes: Missing refresh secret (JWT_REFRESH_SECRET). Using access secret as fallback.");

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: String(user._id), typ: "refresh" },
    REFRESH_SECRET,
    { expiresIn: "30d" }
  );
}

// POST /api/auth/register
// Body: { email, password }
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanPass = String(password || "");

    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ message: "Email and password required." });
    }
    if (cleanPass.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const exists = await User.findOne({ email: cleanEmail }).lean();
    if (exists) {
      return res.status(409).json({ message: "Email already registered." });
    }

    if (typeof User.hashPassword !== "function") {
      return res.status(500).json({ message: "Server misconfigured: missing User.hashPassword()." });
    }

    const passwordHash = await User.hashPassword(cleanPass);

    const user = await User.create({
      email: cleanEmail,
      passwordHash,
      plan: "free",
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.status(201).json({
      ok: true,
      accessToken,
      refreshToken,
      user: { id: String(user._id), email: user.email },
    });
  } catch (err) {
    console.error("❌ POST /api/auth/register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/auth/login
// Body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanPass = String(password || "");

    if (!cleanEmail || !cleanPass) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await User.findOne({ email: cleanEmail }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    if (typeof user.comparePassword !== "function") {
      return res.status(500).json({ message: "Server misconfigured: missing comparePassword()." });
    }

    const ok = await user.comparePassword(cleanPass);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.json({
      ok: true,
      accessToken,
      refreshToken,
      user: { id: String(user._id), email: user.email },
    });
  } catch (err) {
    console.error("❌ POST /api/auth/login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/auth/refresh
// Cookie qtc_refresh OR body { refreshToken }
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.qtc_refresh || req.body?.refreshToken;
    if (!token) return res.status(401).json({ message: "Missing refresh token." });

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const userId = payload.sub;
    if (!userId) return res.status(401).json({ message: "Invalid refresh token." });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found." });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user); // rotate

    return res.json({ ok: true, accessToken, refreshToken });
  } catch (err) {
    console.error("❌ POST /api/auth/refresh error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  return res.json({ ok: true });
});

export default router;
