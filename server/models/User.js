// /home/elcskater/TNS/company_site/server/models/User.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const habitSchema = new Schema(
  {
    substance: {
      type: String,
      enum: ["cigarettes", "vape", "alcohol", "weed", "other"],
      default: "cigarettes",
    },
    customName: { type: String, trim: true },
    intent: {
      type: String,
      enum: ["quit", "cut-back", "break", "taper"],
      default: "quit",
    },
    unitsPerDay: { type: Number, default: 0, min: 0 },
    packCost: { type: Number, default: 0, min: 0 },
    unitsPerPack: { type: Number, default: 20, min: 1 },
    currency: { type: String, default: "USD", trim: true },
  },
  { _id: false }
);

const statsSchema = new Schema(
  {
    streakStartedAt: { type: Date },
    bestStreakDays: { type: Number, default: 0, min: 0 },
    lastResetAt: { type: Date },

    // NEW: used for Option A idle rule (24h inactivity kills streak)
    lastActivityAt: { type: Date },

    // NEW: used for "days since last use" style streak math
    lastUseAt: { type: Date },
  },
  { _id: false }
);

const habitEventSchema = new Schema(
  {
    type: { type: String, enum: ["use", "resist"], required: true },
    quantity: { type: Number, default: 1, min: 1 },
    at: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
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

    savageMode: { type: Boolean, default: false },

    // optional profile stuff
    profile: { type: Schema.Types.Mixed, default: {} },
    savageModeOptIn: { type: Boolean, default: false },

    habit: habitSchema,
    stats: statsSchema,

    // NEW: event log
    habitEvents: { type: [habitEventSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
