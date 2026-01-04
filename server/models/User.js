// server/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const habitSchema = new Schema(
  {
    substance: { type: String, enum: ["cigarettes", "vape", "alcohol", "weed", "other"], default: "cigarettes" },
    customName: { type: String, trim: true },
    intent: { type: String, enum: ["quit", "cut-back", "break", "taper"], default: "quit" },
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
    lastActivityAt: { type: Date },
    lastUseAt: { type: Date },
    lastCheckInAt: { type: Date },
    lastCheckInMood: { type: String, trim: true },
    lastCheckInNote: { type: String, trim: true },
    resistsTotal: { type: Number, default: 0, min: 0 },
    lastResistAt: { type: Date },
  },
  { _id: false }
);

const habitEventSchema = new Schema(
  {
    type: { type: String, enum: ["checkin", "use", "resist"], required: true },
    quantity: { type: Number, default: 1, min: 1 },
    at: { type: Date, required: true },
    mood: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },

    plan: { type: String, enum: ["free", "trial", "premium"], default: "free" },
    fromRaffle: { type: Boolean, default: false },

    savageMode: { type: Boolean, default: false },
    profile: { type: Schema.Types.Mixed, default: {} },
    savageModeOptIn: { type: Boolean, default: false },

    habit: habitSchema,
    stats: statsSchema,
    habitEvents: { type: [habitEventSchema], default: [] },
  },
  { timestamps: true }
);

// instance method
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(String(plain || ""), this.passwordHash);
};

// static helper (optional)
userSchema.statics.hashPassword = async function (plain) {
  const saltRounds = Number(process.env.BCRYPT_ROUNDS || 12);
  return bcrypt.hash(String(plain || ""), saltRounds);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
