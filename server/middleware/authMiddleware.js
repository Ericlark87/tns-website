// /home/elcskater/TNS/company_site/server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Auth middleware (ESM)
 * - Reads access token from:
 *   - Authorization: Bearer <token>
 *   - Cookies: accessToken, access_token, token
 */

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_REFRESH_SECRET ||
    null
  );
}

function extractToken(req) {
  // 1) Bearer token (preferred)
  const auth = req.headers?.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

  // 2) Cookie tokens (fallback)
  return (
    req.cookies?.accessToken ||
    req.cookies?.access_token ||
    req.cookies?.token ||
    null
  );
}

function verifyToken(token) {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT secret not configured");
  return jwt.verify(token, secret);
}

export function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.sub || decoded.id || decoded._id,
      email: decoded.email,
      raw: decoded,
    };

    return next();
  } catch {
    req.user = null;
    return next();
  }
}

export function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.sub || decoded.id || decoded._id,
      email: decoded.email,
      raw: decoded,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Not authenticated" });
  }
}
