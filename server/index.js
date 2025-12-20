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

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

// Look at all possible JWT secrets you’ve got defined
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "⚠ No JWT secret found. Set JWT_SECRET in server/.env"
  );
}

// ----- Middleware -----
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CORS_ORIGIN,          // https://thingsnstuff.fun (from .env)
  "https://thingsnstuff.fun",
  "https://tns-website.onrender.com", // Render site
  // keep or swap to your current Vercel URL if needed
  "https://companysite-henna.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / curl / Postman with no Origin header
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ----- Routes -----
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "QuitChampion API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/raffle", raffleRoutes);
app.use("/api/support", supportRoutes);

// ----- Mongo + server start -----
mongoose
  .connect(MONGO_URI, {
    // dbName is optional if it's encoded in your MONGO_URI already
    // dbName: "test",
  })
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
