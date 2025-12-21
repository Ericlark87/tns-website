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
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

// Look at all possible JWT secrets you’ve got defined
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  console.warn("⚠ No JWT secret found. Set JWT_SECRET in server/.env");
}

// ----- CORS -----
const allowedOrigins = [
  "http://localhost:5173",

  // Your domains
  "https://thingsnstuff.fun",
  "https://www.thingsnstuff.fun",

  // The Render backend can be called directly from tools / Postman etc.
  "https://tns-website.onrender.com",

  // Optional extra from env (preview URL etc.)
  process.env.CORS_ORIGIN,
].filter(Boolean);

console.log("CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,      // <<< let cors handle the matching
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
