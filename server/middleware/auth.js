// /home/elcskater/TNS/company_site/server/middleware/auth.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const parts = String(authHeader).split(" ");

    // Expect: "Bearer <token>"
    const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      // This is a server misconfig, not an auth failure
      return res.status(500).json({ message: "Server missing JWT_ACCESS_SECRET" });
    }

    const decoded = jwt.verify(token, secret);

    // Keep decoded payload accessible
    req.user = decoded;

    // Normalize user id for controllers
    // Common patterns: { userId }, { id }, { _id }, { sub }
    req.userId =
      decoded.userId ||
      decoded.id ||
      decoded._id ||
      decoded.sub ||
      null;

    if (!req.userId) {
      // Token verified, but payload doesn't identify a user => broken token issuing
      return res.status(401).json({ message: "Token missing user id" });
    }

    return next();
  } catch (err) {
    // Don’t leak token details, but do provide useful reason
    const msg =
      err?.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token";
    return res.status(401).json({ message: msg });
  }
}
