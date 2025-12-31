// server/models/UsageEvent.js
import mongoose from "mongoose";

const usageEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    habitProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HabitProfile",
      required: true,
      index: true,
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 0.01,
    },

    hpCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    moneyCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    timeCostMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

usageEventSchema.index({ user: 1, occurredAt: 1 });

export default mongoose.model("UsageEvent", usageEventSchema);
