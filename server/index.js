import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js"; // 👈 NEW

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend dev URL
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// existing auth routes
app.use("/api/auth", authRoutes);

// NEW: raffle routes
app.use("/api/raffle", raffleRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
