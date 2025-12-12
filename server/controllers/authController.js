// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function createAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
}

function createRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

/** -------------------------
 * REGISTER USER
 * ------------------------*/
export async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashed,
    });

    // Create cookies/tokens
    const refreshToken = createRefreshToken(user._id);
    res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",          // REQUIRED for cross-site cookie
  path: "/api/auth/refresh",
});

    const accessToken = createAccessToken(user._id);

    return res.json({
      message: "Registration successful",
      user: { id: user._id, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** -------------------------
 * LOGIN USER
 * ------------------------*/
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create tokens
    const refreshToken = createRefreshToken(user._id);
    const accessToken = createAccessToken(user._id);

    // Send cookie
res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",          // REQUIRED for cross-site cookie
  path: "/api/auth/refresh",
});

    return res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** -------------------------
 * REFRESH TOKEN
 * ------------------------*/
export async function refresh(req, res) {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({ message: "Missing refresh token" });

    jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Invalid refresh token" });

        const newAccessToken = createAccessToken(decoded.id);

        res.json({ accessToken: newAccessToken });
      }
    );
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/** -------------------------
 * LOGOUT USER
 * ------------------------*/
export async function logout(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/api/auth/refresh",
  });

  res.json({ message: "Logged out" });
}

/** -------------------------
 * GET CURRENT USER
 * ------------------------*/
export async function me(req, res) {
  try {
    const user = await User.findById(req.user).select("-password");
    return res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
