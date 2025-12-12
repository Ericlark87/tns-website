import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";

dotenv.config();

const app = express();

// ---- REQUIRED ENV ----
const PORT = process.env.PORT || 5200;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL: MONGO_URI is missing. Set it in Render Environment.");
  process.exit(1);
}

// ---- CORS ----
// IMPORTANT: must be exact origins (no trailing slash)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5200",
  "https://thingsnstuff.fun",
  "https://www.thingsnstuff.fun",
  "https://tns-website.onrender.com",
];

// Put CORS FIRST (before routes)
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / curl / health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin); // echo exact origin
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Make OPTIONS preflight always succeed
app.options("*", cors());

// ---- MIDDLEWARE ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- ROUTES ----
app.get("/health", (req, res) => res.status(200).send("ok"));

app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);

// ---- STARTUP ----
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });
