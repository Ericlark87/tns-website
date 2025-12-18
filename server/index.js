// server/index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Prefer Atlas via MONGO_URI / MONGODB_URI
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "";

if (!MONGO_URI) {
  console.error(
    "❌ No MONGO_URI/MONGODB_URI set in server/.env – cannot connect to MongoDB."
  );
}

// ----- CORS -----
const allowedOriginPattern = /^(https?:\/\/localhost(:\d+)?|https:\/\/.*\.thingsnstuff\.fun|https:\/\/.*onrender\.com|https:\/\/.*vercel\.app)$/;

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (same-origin / curl / Postman) → allow
      if (!origin) return callback(null, true);

      if (allowedOriginPattern.test(origin)) {
        return callback(null, true);
      }

      console.warn("🔒 CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Make sure preflight gets the same treatment
app.options(
  "*",
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOriginPattern.test(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ----- ROUTES -----
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);
app.use("/api/support", supportRoutes);

// ----- DB + SERVER START -----
async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error("Missing MONGO_URI");
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB error:", err);
    process.exit(1);
  }
}

start();
