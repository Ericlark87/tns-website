// server/models/User.js
import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    lastResetAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Hashed password
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    plan: {
      type: String,
      enum: ["free", "trial", "premium"],
      default: "free",
    },
    fromRaffle: { type: Boolean, default: false },
    raffleWinner: { type: Boolean, default: false },
    streak: {
      type: streakSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Ensure email is indexed
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
