// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// token lifetimes
const ACCESS_TTL = "15m";
const REFRESH_TTL = "30d";

// --- JWT secret helper (lazy so dotenv has already run) ---
let cachedJwtSecret = null;

function getJwtSecret() {
  if (cachedJwtSecret) return cachedJwtSecret;

  const secret =
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    console.warn(
      "⚠ JWT secret missing. Set JWT_SECRET in server/.env (or JWT_ACCESS_SECRET / JWT_REFRESH_SECRET)."
    );
    return null;
  }

  cachedJwtSecret = secret;
  return cachedJwtSecret;
}

function signAccessToken(user) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT secret not configured");

  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    secret,
    { expiresIn: ACCESS_TTL }
  );
}

function signRefreshToken(user) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT secret not configured");

  return jwt.sign({ sub: user._id.toString() }, secret, {
    expiresIn: REFRESH_TTL,
  });
}

// Cross-site cookie rules:
// - If frontend and API are on different domains, you MUST use SameSite=None + Secure
function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("qc_refresh", token, {
    httpOnly: true,
    secure: isProd,               // true on Render/prod (HTTPS)
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",    // only sent to refresh endpoint
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("qc_refresh", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",
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
      return res.status(409).json({
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
      return res.status(409).json({
        message:
          "An account already exists for this email. Try logging in instead.",
      });
    }

    if (err.message === "JWT secret not configured") {
      return res
        .status(500)
        .json({ message: "Auth configuration error. Try again later." });
    }

    return res
      .status(500)
      .json({ message: "Server error. Try again later." });
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
      return res
        .status(401)
        .json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ message: "Invalid email or password." });
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

    if (err.message === "JWT secret not configured") {
      return res
        .status(500)
        .json({ message: "Auth configuration error. Try again later." });
    }

    return res
      .status(500)
      .json({ message: "Server error. Try again later." });
  }
});

// ---------- REFRESH ----------
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.qc_refresh;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const secret = getJwtSecret();
    if (!secret) throw new Error("JWT secret not configured");

    const payload = jwt.verify(token, secret);
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

    if (err.message === "JWT secret not configured") {
      return res
        .status(500)
        .json({ message: "Auth configuration error. Try again later." });
    }

    return res.status(401).json({ message: "Not authenticated." });
  }
});

// ---------- LOGOUT ----------
router.post("/logout", (req, res) => {
  clearRefreshCookie(res);
  return res.json({ success: true });
});

export default router;
