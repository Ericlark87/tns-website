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

if (!JWT_SECRET) {
  console.warn("⚠ authRoutes: Missing JWT secret (JWT_SECRET or JWT_ACCESS_SECRET).");
}
if (!REFRESH_SECRET) {
  console.warn("⚠ authRoutes: Missing refresh secret (JWT_REFRESH_SECRET). Using access secret as fallback.");
}

function signAccessToken(user) {
  // keep short-lived
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function signRefreshToken(user) {
  // long-lived
  return jwt.sign(
    { sub: String(user._id), typ: "refresh" },
    REFRESH_SECRET,
    { expiresIn: "30d" }
  );
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * IMPORTANT:
 * - This expects your User model to have a method `comparePassword(password)`
 *   OR a `password` field hashed with bcrypt that you validate here.
 * - If you don't have comparePassword, this route will 500 until you implement it.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ---- password check ----
    if (typeof user.comparePassword === "function") {
      const ok = await user.comparePassword(password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials." });
    } else {
      // If your model doesn't support comparePassword yet, fail hard so you fix it properly.
      return res.status(500).json({
        message: "User model missing comparePassword(). Implement password validation.",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Return tokens in JSON.
    // If you later move cookie-setting into the Worker, it will grab refreshToken from here.
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

/**
 * POST /api/auth/refresh
 * Uses refresh token from:
 * - Cookie qtc_refresh (preferred)
 * - OR body { refreshToken }
 */
router.post("/refresh", async (req, res) => {
  try {
    const cookieToken = req.cookies?.qtc_refresh;
    const bodyToken = req.body?.refreshToken;
    const token = cookieToken || bodyToken;

    if (!token) {
      return res.status(401).json({ message: "Missing refresh token." });
    }

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

    // Optional: rotate refresh token
    const rotate = true;
    const refreshToken = rotate ? signRefreshToken(user) : token;

    return res.json({
      ok: true,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ POST /api/auth/refresh error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/auth/logout
 * If using cookies, frontend should delete cookie client-side or Worker should clear it.
 */
router.post("/logout", async (req, res) => {
  return res.json({ ok: true });
});

export default router;
