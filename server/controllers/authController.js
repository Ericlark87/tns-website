import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isProd = process.env.NODE_ENV === "production";

function createAccessToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("Missing JWT_ACCESS_SECRET");

  // Include both id + sub for compatibility with any middleware/version
  return jwt.sign(
    {
      id: String(user._id),
      sub: String(user._id),
      email: user.email,
    },
    secret,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
}

function createRefreshToken(user) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("Missing JWT_REFRESH_SECRET");

  return jwt.sign(
    {
      id: String(user._id),
      sub: String(user._id),
    },
    secret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
  );
}

function setRefreshCookie(res, token) {
  // Match what your live server already uses: qtc_refresh + Path=/ + SameSite=None in prod
  res.cookie("qtc_refresh", token, {
    httpOnly: true,
    secure: isProd,                 // true on HTTPS in production
    sameSite: isProd ? "none" : "lax",
    path: "/",                      // ✅ broad + reliable
    domain: isProd ? ".thingsnstuff.fun" : undefined, // ✅ share across api/www subdomains
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
}

function clearRefreshCookie(res) {
  res.clearCookie("qtc_refresh", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    domain: isProd ? ".thingsnstuff.fun" : undefined,
  });
}

/** -------------------------
 * REGISTER USER
 * ------------------------*/
export async function register(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      // 409 is the correct status for "already exists"
      return res.status(409).json({ message: "An account already exists for this email. Try logging in instead." });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
    });

    const refreshToken = createRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    const accessToken = createAccessToken(user);

    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
        plan: user.plan || "free",
        profile: user.profile || {},
        savageModeOptIn: !!user.savageModeOptIn,
      },
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
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const normalizedEmail = String(email).trim().toLowerCase();

    // passwordHash is select:false, so explicitly select it
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid email or password." });

    const match = await bcrypt.compare(String(password), user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid email or password." });

    const refreshToken = createRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    const accessToken = createAccessToken(user);

    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
        plan: user.plan || "free",
        profile: user.profile || {},
        savageModeOptIn: !!user.savageModeOptIn,
      },
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
    const token = req.cookies?.qtc_refresh;
    if (!token) return res.status(401).json({ message: "Not authenticated." });

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) return res.status(500).json({ message: "Server missing JWT_REFRESH_SECRET" });

    const decoded = jwt.verify(token, refreshSecret);
    const userId = decoded?.sub || decoded?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const user = await User.findById(userId).select("_id email plan profile savageModeOptIn").lean();
    if (!user) return res.status(401).json({ message: "Not authenticated." });

    const newAccessToken = jwt.sign(
      { id: String(user._id), sub: String(user._id), email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
    );

    // Optional: refresh cookie rotation (keep it simple for now)
    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
        plan: user.plan || "free",
        profile: user.profile || {},
        savageModeOptIn: !!user.savageModeOptIn,
      },
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    const msg = err?.name === "TokenExpiredError" ? "Refresh token expired" : "Not authenticated.";
    return res.status(401).json({ message: msg });
  }
}

/** -------------------------
 * LOGOUT USER
 * ------------------------*/
export async function logout(req, res) {
  clearRefreshCookie(res);
  return res.json({ message: "Logged out" });
}

/** -------------------------
 * GET CURRENT USER
 * ------------------------*/
export async function me(req, res) {
  try {
    const userId = req.userId || req.user?.id || req.user?._id || req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("_id email plan profile savageModeOptIn").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
        plan: user.plan || "free",
        profile: user.profile || {},
        savageModeOptIn: !!user.savageModeOptIn,
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
