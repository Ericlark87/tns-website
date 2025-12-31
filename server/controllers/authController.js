// /home/elcskater/TNS/company_site/server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isProd = process.env.NODE_ENV === "production";

// Use ONE secret name for access tokens (matches middleware)
function createAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("Missing JWT_ACCESS_SECRET");
  return jwt.sign({ id: String(userId) }, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

function createRefreshToken(userId) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("Missing JWT_REFRESH_SECRET");
  return jwt.sign({ id: String(userId) }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

function setRefreshCookie(res, token) {
  // For localhost dev: secure must be false or the cookie won't set on http
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,                 // true only on HTTPS in production
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",
  });
}

/** -------------------------
 * REGISTER USER
 * ------------------------*/
export async function register(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashed,
    });

    const refreshToken = createRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    const accessToken = createAccessToken(user._id);

    return res.json({
      message: "Registration successful",
      user: { id: String(user._id), email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/** -------------------------
 * LOGIN USER
 * ------------------------*/
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const refreshToken = createRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    const accessToken = createAccessToken(user._id);

    return res.json({
      message: "Login successful",
      user: { id: String(user._id), email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/** -------------------------
 * REFRESH TOKEN
 * ------------------------*/
export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      return res.status(500).json({ message: "Server missing JWT_REFRESH_SECRET" });
    }

    const decoded = jwt.verify(token, refreshSecret);

    // Optional: ensure user still exists
    const user = await User.findById(decoded.id).select("_id email");
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccessToken = createAccessToken(user._id);

    // Return BOTH accessToken and user to match your AuthContext expectations
    return res.json({
      accessToken: newAccessToken,
      user: { id: String(user._id), email: user.email },
    });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    const msg =
      err?.name === "TokenExpiredError" ? "Refresh token expired" : "Invalid refresh token";
    return res.status(403).json({ message: msg });
  }
}

/** -------------------------
 * LOGOUT USER
 * ------------------------*/
export async function logout(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth/refresh",
  });
  return res.json({ message: "Logged out" });
}

/** -------------------------
 * GET CURRENT USER
 * ------------------------*/
export async function me(req, res) {
  try {
    const userId = req.userId || req.user?.id || req.user?._id || req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
