// server/models/HabitEvent.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const habitEventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    habit: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },

    // "slip" = you gave in, "win" = you did the right thing
    kind: {
      type: String,
      enum: ["slip", "win"],
      required: true,
    },

    // How many units in this event (e.g. 3 cigarettes at once)
    amount: {
      type: Number,
      min: 0,
      default: 1,
    },

    // Positive or negative HP change
    hpDelta: {
      type: Number,
      required: true,
    },

    // Optional money + time cost for this event
    moneyDelta: {
      type: Number,
      default: 0,
    },

    timeDeltaMinutes: {
      type: Number,
      default: 0,
    },

    // Short note, if user wants context
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

habitEventSchema.index({ user: 1, occurredAt: 1 });
habitEventSchema.index({ habit: 1, occurredAt: 1 });

const HabitEvent =
  mongoose.models.HabitEvent || mongoose.model("HabitEvent", habitEventSchema);

export default HabitEvent;
