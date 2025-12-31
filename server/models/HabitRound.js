// server/models/HabitRound.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const habitRoundSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Date representing the start of the round (midnight UTC for now)
    roundDate: {
      type: Date,
      required: true,
      index: true,
    },
    // Snapshot of baseline daily units when this round started
    baselineUnitsPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    // How many units have been logged this round
    unitsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Last time the user logged a unit for this round
    lastLoggedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// One round per user per day
habitRoundSchema.index({ user: 1, roundDate: 1 }, { unique: true });

const HabitRound =
  mongoose.models.HabitRound ||
  mongoose.model("HabitRound", habitRoundSchema);

export default HabitRound;
