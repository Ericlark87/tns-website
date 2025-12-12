import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";

dotenv.config();

const app = express();

// CORS – allow local dev + live domains
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.thingsnstuff.fun",
  "https://thingsnstuff.fun",
  "https://tns-website.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / server-to-server / curl (no Origin header)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- DB + Server ---
const PORT = process.env.PORT || 5200;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });
