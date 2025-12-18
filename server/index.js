// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- CORS (critical part) ----------
const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (like curl / server-to-server) and
    // reflect any browser origin. This keeps things simple while
    // you're still wiring everything together.
    callback(null, origin || true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Ensure preflight OPTIONS also gets CORS headers
app.options("*", cors(corsOptions));

// ---------- BODY & COOKIES ----------
app.use(express.json());
app.use(cookieParser());

// ---------- MONGO ----------
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quitchampion-dev";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.json({ ok: true, message: "QuitChampion API is alive." });
});

app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);
app.use("/api/support", supportRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
