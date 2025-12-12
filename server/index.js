import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";

dotenv.config();

const app = express();

// IMPORTANT for Render / proxies (needed for secure cookies + correct IP/https behavior)
app.set("trust proxy", 1);

// ---- REQUIRED ENV ----
const PORT = process.env.PORT || 5200;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL: MONGO_URI is missing. Set it in Render Environment.");
  process.exit(1);
}

// ---- CORS ----
// EXACT origins + allow Vercel preview subdomains via regex
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "https://thingsnstuff.fun",
  "https://www.thingsnstuff.fun",

  // optional: only if you ever call API from Render-hosted pages (usually you won't)
  // "https://tns-website.onrender.com",
]);

const vercelPreviewRegex = /^https:\/\/companysite-[a-z0-9-]+-erics-projects-500e00e9\.vercel\.app$/i;
// If your preview URLs vary, loosen it to: /^https:\/\/companysite-.*\.vercel\.app$/i

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server / curl / health checks
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) return callback(null, true);

    if (vercelPreviewRegex.test(origin)) return callback(null, true);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Put CORS FIRST
app.use(cors(corsOptions));

// Make OPTIONS preflight succeed using SAME options
app.options("*", cors(corsOptions));

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
