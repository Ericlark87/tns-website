// server/index.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

// ----- Load env from server/.env explicitly -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// ----- Core config -----
const app = express();

// IMPORTANT for Render / proxies (secure cookies, IPs, etc.)
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  console.warn("⚠ No JWT secret found. Set JWT_SECRET in server/.env");
}

// ----- Middleware -----
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // PRODUCTION (your real frontend)
  "https://thingsnstuff.fun",
  "https://www.thingsnstuff.fun",

  // Optional: if you ever host the frontend elsewhere
  process.env.CORS_ORIGIN, // can be https://www.thingsnstuff.fun
  "https://companysite-henna.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin / curl / Postman with no Origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn(`CORS blocked origin: ${origin}`);
    // Return a CORS rejection WITHOUT crashing the request into a 500
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Make preflight always succeed cleanly
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// ----- Routes -----
app.get("/", (req, res) => {
  res.json({ ok: true, message: "QuitChampion API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);
app.use("/api/support", supportRoutes);

// ----- Mongo + server start -----
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });

export default app;
