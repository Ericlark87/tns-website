// server/index.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import raffleRoutes from "./routes/raffleRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://thingsnstuff.fun",
  "https://www.thingsnstuff.fun",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "QuitChampion API is running." });
});

// TEMP DEBUG: show which DB prod is using (sanitized)
app.get("/api/_mongo_hint", (req, res) => {
  const uri = process.env.MONGO_URI || "";
  const masked = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  res.json({
    ok: true,
    hint: masked,
    dbNameGuess: (() => {
      try {
        const u = new URL(uri);
        const p = (u.pathname || "").replace(/^\//, "");
        return p || "(none in uri)";
      } catch {
        return "(unparseable)";
      }
    })(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "QuitChampion API",
    time: new Date().toISOString(),
  });
});

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
