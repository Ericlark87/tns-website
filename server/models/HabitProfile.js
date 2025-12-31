// server/models/HabitProfile.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const habitProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    habitType: {
      type: String,
      trim: true,
    },
    customHabitLabel: {
      type: String,
      trim: true,
    },
    intent: {
      type: String,
      enum: ["quit", "cut-back", "take-break", "track-only"],
      default: "quit",
    },
    currency: {
      type: String,
      default: "USD",
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    unitsPerDayBaseline: {
      type: Number,
      default: 0,
    },
    unitsPerDayTarget: {
      type: Number,
      default: 0,
    },
    savageMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const HabitProfile = mongoose.model("HabitProfile", habitProfileSchema);

export default HabitProfile;
