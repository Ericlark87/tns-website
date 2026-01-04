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
import habitRoutes from "./routes/habitRoutes.js";

// ----- Load env from server/.env -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// ----- Core config -----
const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

// ----- CORS -----
// IMPORTANT: must match the browser Origin EXACTLY (scheme + host + optional port)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "https://thingsnstuff.fun",
  "https://www.thingsnstuff.fun",

  process.env.CORS_ORIGIN, // optional single origin, if you use it
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server and tools without Origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
  "Content-Type",
  "Authorization",
  "Cache-Control",
  "Pragma",
  "Expires"
], 
};

// CORS must be before routes
app.use(cors(corsOptions));

// Explicitly answer preflight for every route
app.options("*", cors(corsOptions));

// Body + cookies
app.use(express.json());
app.use(cookieParser());

// ----- Routes -----
app.get("/", (req, res) => {
  res.json({ ok: true, message: "QuitChampion API is running." });
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
