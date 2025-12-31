// /home/elcskater/TNS/company_site/server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Token lifetimes
const ACCESS_TTL = "15m";
const REFRESH_TTL = "30d";

// --- JWT secret helper (single secret, multiple uses) ---
let cachedJwtSecret = null;

function getJwtSecret() {
  if (cachedJwtSecret) return cachedJwtSecret;

  const secret =
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_REFRESH_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    console.warn("⚠ No JWT secret configured. Set JWT_SECRET in server/.env");
    return null;
  }

  cachedJwtSecret = secret;
  return cachedJwtSecret;
}

function signAccessToken(user) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT secret not configured");

  return jwt.sign({ sub: user._id.toString(), email: user.email }, secret, {
    expiresIn: ACCESS_TTL,
  });
}

function signRefreshToken(user) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT secret not configured");

  return jwt.sign({ sub: user._id.toString() }, secret, {
    expiresIn: REFRESH_TTL,
  });
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";

  // IMPORTANT: cookie path "/" so refresh works everywhere (dev + prod)
  res.cookie("qtc_refresh", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/", // ✅ WAS /api/auth/refresh (too restrictive / fragile)
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("qtc_refresh", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/", // ✅ must match
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    plan: user.plan,
    profile: user.profile || {},
    savageModeOptIn: !!user.savageModeOptIn,
    joinedAt: user.joinedAt,
  };
}

// Helper to read access token for /me
function readAccessToken(req) {
  const auth = req.headers?.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

  return (
    req.cookies?.accessToken ||
    req.cookies?.access_token ||
    req.cookies?.token ||
    null
  );
}

// ----- ME -----
router.get("/me", async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) return res.status(500).json({ message: "JWT secret not configured." });

    const token = readAccessToken(req);
    if (!token) return res.status(401).json({ message: "Not authenticated." });

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Not authenticated." });

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("ME error:", err);
    return res.status(500).json({ message: "Could not load session." });
  }
});

// ----- REGISTER -----
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      displayName,
      country,
      region,
      age,
      savageModeOptIn,
      understandsPurpose,
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (!understandsPurpose) {
      return res.status(400).json({
        message: "You must confirm you understand what QuitChampion is for before creating an account.",
      });
    }

    const ageNum = age ? Number(age) : null;
    if (!ageNum || Number.isNaN(ageNum) || ageNum < 18) {
      return res.status(400).json({ message: "You must be at least 18 years old." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: "An account already exists for this email. Try logging in instead.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const profile = {};
    if (displayName) profile.displayName = displayName.trim();
    if (country) profile.country = country.trim();
    if (region) profile.region = region.trim();
    profile.age = ageNum;

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      profile,
      savageModeOptIn: !!savageModeOptIn,
      disclaimersAcceptedAt: new Date(),
      fromRaffle: false,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({ user: sanitizeUser(user), accessToken });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Could not create account. Please try again." });
  }
});

// ----- LOGIN -----
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password." });

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.json({ user: sanitizeUser(user), accessToken });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Could not log in. Please try again." });
  }
});

// ----- REFRESH -----
router.post("/refresh", async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) return res.status(500).json({ message: "JWT secret not configured." });

    const token = req.cookies?.qtc_refresh;
    if (!token) return res.status(401).json({ message: "Not authenticated." });

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      console.warn("Invalid refresh token:", err.message);
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Not authenticated." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Not authenticated." });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    return res.json({ user: sanitizeUser(user), accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Could not refresh session. Try again." });
  }
});

// ----- LOGOUT -----
router.post("/logout", (req, res) => {
  clearRefreshCookie(res);
  return res.json({ success: true });
});

export default router;
