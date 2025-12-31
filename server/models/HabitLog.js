// server/models/HabitLog.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// One document per user per day, storing how many units they used that day.
const habitLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Normalized to UTC midnight for that day
    day: {
      type: Date,
      required: true,
    },
    units: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Ensure only one log per user per day
habitLogSchema.index({ user: 1, day: 1 }, { unique: true });

const HabitLog =
  mongoose.models.HabitLog || mongoose.model("HabitLog", habitLogSchema);

export default HabitLog;
