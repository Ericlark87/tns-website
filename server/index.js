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

// ----- MIDDLEWARE -----
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CORS_ORIGIN,
      "https://thingsnstuff.fun",
      // keep this or swap in your current Vercel project URL if you want:
      "https://companysite-hwrz4xmy-erics-projects-5o0e0oe9.vercel.app",
    ].filter(Boolean),
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
